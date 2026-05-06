import os

from openai import OpenAI


SYSTEM_PROMPT = (
    "You are a kind debugging tutor for beginner programmers. "
    "Give short, layered hints. Do not reveal the full corrected solution. "
    "Focus on the underlying debugging concept."
)


def _fallback_hint(challenge, hint_level):
    concept = challenge["conceptExplanation"]
    prompts = {
        1: f"Look closely at the {challenge['bugType'].lower()} issue. {concept}",
        2: f"Think about the line where the bug first appears. {challenge['objective']}",
        3: f"Use this fix pattern: {concept} Apply it to the current code without rewriting everything.",
    }
    return prompts.get(hint_level, prompts[3])


def generate_hint(challenge, learner_code, hint_level):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-5.2")

    if not api_key:
        return _fallback_hint(challenge, hint_level)

    client = OpenAI(api_key=api_key)
    user_prompt = f"""
Challenge title: {challenge["title"]}
Language: {challenge["language"]}
Bug type: {challenge["bugType"]}
Objective: {challenge["objective"]}
Concept: {challenge["conceptExplanation"]}
Hint level requested: {hint_level}

Learner code:
{learner_code}

Return one short hint only. Keep it beginner-friendly. Never provide the full corrected code.
""".strip()

    try:
        response = client.responses.create(
            model=model,
            instructions=SYSTEM_PROMPT,
            input=user_prompt,
            max_output_tokens=120,
        )
        return response.output_text.strip() or _fallback_hint(challenge, hint_level)
    except Exception:
        return _fallback_hint(challenge, hint_level)
