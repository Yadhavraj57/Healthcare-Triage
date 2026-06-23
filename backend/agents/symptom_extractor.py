from crewai import Agent


def create_symptom_extractor(llm) -> Agent:
    return Agent(
        role="Medical Symptom Extraction Specialist",
        goal="Extract and normalize all symptoms from the patient's natural language input into structured JSON",
        backstory=(
            "You are an expert at understanding patient descriptions and converting them into "
            "structured medical symptom lists, including duration, severity, and affected body areas. "
            "You are thorough, precise, and always ask yourself if you've captured every detail."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )
