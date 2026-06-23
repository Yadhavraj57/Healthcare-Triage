"""
Four-agent triage pipeline implemented as sequential Groq LLM calls.
Each "agent" is a specialized system prompt + task, run in order, with each
agent receiving the previous agents' outputs as context.

Agents:
  1. Symptom Extractor      -> structured symptoms
  2. Condition Analyzer     -> conditions, red flags, urgency
  3. Specialist Matcher     -> specialist routing
  4. Triage Report Writer   -> patient-friendly report (markdown + json)

Observability: each agent + each LLM call is traced to LangSmith when a
LANGCHAIN_API_KEY is configured. If langsmith isn't installed or no key is
set, @traceable degrades to a no-op and the pipeline runs unchanged.
"""
import json
import os
import re

import httpx
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


def _build_http_client() -> httpx.Client:
    """
    Build an httpx client for Groq. On some Windows / VPN / corporate-proxy
    setups the system CA store can't verify Groq's certificate. Set
    GROQ_VERIFY_SSL=false in .env to disable verification for LOCAL DEV ONLY.
    Otherwise we use certifi's trusted CA bundle.
    """
    verify_env = os.getenv("GROQ_VERIFY_SSL", "true").lower()
    if verify_env in ("false", "0", "no"):
        return httpx.Client(verify=False, timeout=60.0)
    try:
        import certifi
        return httpx.Client(verify=certifi.where(), timeout=60.0)
    except ImportError:
        return httpx.Client(timeout=60.0)

# --- LangSmith tracing (graceful fallback if unavailable) ---
_real_key = bool(os.getenv("LANGCHAIN_API_KEY")) and \
    os.getenv("LANGCHAIN_API_KEY") != "your_langsmith_api_key_here"

# If there's no real key, make sure langsmith never tries to phone home
# (otherwise it spams SSL/connection warnings on every call).
if not _real_key:
    os.environ["LANGCHAIN_TRACING_V2"] = "false"
    os.environ["LANGSMITH_TRACING"] = "false"

try:
    from langsmith import traceable
    _LANGSMITH = _real_key
except ImportError:
    _LANGSMITH = False

    def traceable(*dargs, **dkwargs):
        """No-op decorator when langsmith isn't installed."""
        def wrap(func):
            return func
        # support both @traceable and @traceable(...)
        if len(dargs) == 1 and callable(dargs[0]) and not dkwargs:
            return dargs[0]
        return wrap


MODEL = "llama-3.3-70b-versatile"


def _client() -> Groq:
    return Groq(api_key=os.getenv("GROQ_API_KEY"), http_client=_build_http_client())


@traceable(run_type="llm", name="groq_call")
def _call(system: str, user: str, force_json: bool = True) -> str:
    """Single LLM call to Groq."""
    kwargs = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.2,
    }
    if force_json:
        kwargs["response_format"] = {"type": "json_object"}

    resp = _client().chat.completions.create(**kwargs)
    return resp.choices[0].message.content


def _parse_json(text: str) -> dict:
    """Best-effort JSON parse — strips code fences and finds the JSON body."""
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return {}
    return {}


@traceable(name="symptom_extractor")
def _extract_symptoms(patient_context: str) -> dict:
    return _parse_json(_call(
        system=(
            "You are a Medical Symptom Extraction Specialist. You convert patient "
            "descriptions into structured medical symptom lists, including duration, "
            "severity, and affected body areas. Always respond with valid JSON only."
        ),
        user=f"""{patient_context}

Extract the symptoms into a JSON object with these fields:
- primary_symptoms: list of symptom strings
- duration: object mapping each symptom to a duration string
- severity: object mapping each symptom to "mild"/"moderate"/"severe"
- affected_areas: list of body areas
- mentioned_medications: list of medications
- mentioned_allergies: list of allergies
- additional_context: any other relevant details""",
    ))


@traceable(name="condition_analyzer")
def _analyze_conditions(patient_context: str, extracted: dict) -> dict:
    return _parse_json(_call(
        system=(
            "You are a Clinical Condition Assessment Specialist trained in differential "
            "diagnosis. You assess symptom combinations and rank likely conditions by "
            "probability. You prioritize patient safety and flag red-flag symptoms "
            "immediately. Always respond with valid JSON only."
        ),
        user=f"""{patient_context}

Extracted symptoms (JSON):
{json.dumps(extracted, indent=2)}

Analyze and return a JSON object with these fields:
- top_conditions: list of objects with "name" and "probability" ("High"/"Medium"/"Low")
- red_flags: list of red flag symptom strings (empty list if none)
- urgency_level: one of "Emergency", "Urgent", "Semi-urgent", "Non-urgent"
- urgency_reasoning: brief explanation string
- recommended_next_steps: list of action strings""",
    ))


@traceable(name="specialist_matcher")
def _match_specialist(patient_context: str, analysis: dict) -> dict:
    return _parse_json(_call(
        system=(
            "You are a Healthcare Specialist Routing Agent with deep knowledge of "
            "medical specialties. You match conditions to the right specialist and know "
            "when a GP visit suffices first. You always prioritize patient safety. "
            "Always respond with valid JSON only."
        ),
        user=f"""{patient_context}

Condition analysis (JSON):
{json.dumps(analysis, indent=2)}

Return a JSON object with these fields:
- primary_specialist: specialist type string (e.g., "Neurologist")
- secondary_specialist: secondary specialist type or null
- gp_first: boolean (whether a GP visit is sufficient first)
- reasoning: explanation string
- specialist_description: brief description of what the primary specialist treats""",
    ))


@traceable(name="report_writer")
def _write_report(patient_context: str, extracted: dict, analysis: dict, routing: dict) -> dict:
    return _parse_json(_call(
        system=(
            "You are a Patient-Friendly Medical Report Generator. You translate complex "
            "medical assessments into plain, warm, non-alarmist language. You always "
            "include actionable self-care advice and clear emergency escalation guidance. "
            "Always respond with valid JSON only."
        ),
        user=f"""{patient_context}

Symptom extraction (JSON):
{json.dumps(extracted, indent=2)}

Condition analysis (JSON):
{json.dumps(analysis, indent=2)}

Specialist routing (JSON):
{json.dumps(routing, indent=2)}

Produce a JSON object with EXACTLY two keys:

1. "report_markdown": a markdown string with these sections:
   ## Summary of Your Symptoms
   ## What We Found
   ## Urgency Level
   ## Recommended Care
   ## Self-Care Tips
   ## When to Go to the Emergency Room

2. "report_json": an object with:
   - session_summary: one-sentence plain-English summary
   - urgency_level: one of "Emergency", "Urgent", "Semi-urgent", "Non-urgent"
   - urgency_color: one of "red", "orange", "yellow", "green"
   - conditions: list of objects with "name" and "probability" ("High"/"Medium"/"Low")
   - specialist: primary specialist type string
   - red_flags: list of strings (empty list if none)
   - self_care: list of self-care tip strings
   - emergency_advice: string with emergency escalation advice""",
    ))


@traceable(name="run_triage_crew")
def run_triage_crew(
    symptoms: str,
    age: int | None,
    gender: str | None,
    existing_conditions: list[str],
    medications: list[str],
) -> dict:
    patient_context = f"""Patient Input:
- Symptoms described: {symptoms}
- Age: {age or 'Not provided'}
- Gender: {gender or 'Not provided'}
- Existing conditions: {', '.join(existing_conditions) if existing_conditions else 'None reported'}
- Current medications: {', '.join(medications) if medications else 'None reported'}"""

    extracted = _extract_symptoms(patient_context)
    analysis = _analyze_conditions(patient_context, extracted)
    routing = _match_specialist(patient_context, analysis)
    report = _write_report(patient_context, extracted, analysis, routing)

    report_markdown = report.get("report_markdown", "")
    report_json = report.get("report_json", {})

    # Fallbacks pulled from earlier agents if the writer omitted anything
    urgency_level = report_json.get("urgency_level") or analysis.get("urgency_level", "Semi-urgent")
    urgency_color_map = {
        "Emergency": "red",
        "Urgent": "orange",
        "Semi-urgent": "yellow",
        "Non-urgent": "green",
    }

    conditions = report_json.get("conditions") or analysis.get("top_conditions", [])
    specialist = report_json.get("specialist") or routing.get("primary_specialist", "General Practitioner")
    red_flags = report_json.get("red_flags") if report_json.get("red_flags") is not None else analysis.get("red_flags", [])

    if not report_markdown:
        report_markdown = (
            f"## Summary of Your Symptoms\n\n{report_json.get('session_summary', symptoms)}\n\n"
            f"## Recommended Care\n\nWe recommend seeing a {specialist}."
        )

    return {
        "urgency_level": urgency_level,
        "urgency_color": report_json.get("urgency_color") or urgency_color_map.get(urgency_level, "yellow"),
        "conditions": conditions,
        "specialist": specialist,
        "red_flags": red_flags,
        "report_markdown": report_markdown,
        "self_care": report_json.get("self_care", []),
        "emergency_advice": report_json.get(
            "emergency_advice", "Call emergency services if symptoms worsen severely."
        ),
        "session_summary": report_json.get("session_summary", ""),
    }
