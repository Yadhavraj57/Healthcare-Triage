from crewai import Agent


def create_specialist_matcher(llm) -> Agent:
    return Agent(
        role="Healthcare Specialist Routing Agent",
        goal="Match the patient's condition to the right medical specialist and provide routing recommendations",
        backstory=(
            "You have deep knowledge of medical specialties and which conditions each specialist handles. "
            "You always prioritize patient safety and know exactly when a GP visit is sufficient vs when "
            "a specialist is needed urgently. You factor in urgency level when making recommendations."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )
