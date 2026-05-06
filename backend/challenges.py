from flask import Blueprint

from services.challenge_service import get_all_challenges


challenges_bp = Blueprint("challenges", __name__)


@challenges_bp.get("/challenges")
def list_challenges():
    challenges = get_all_challenges()
    safe_payload = []
    for challenge in challenges:
        public_challenge = {key: value for key, value in challenge.items() if key != "validator"}
        safe_payload.append(public_challenge)
    return {"challenges": safe_payload}

