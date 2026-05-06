from flask import Blueprint, request

from services.challenge_service import get_challenge_by_id
from services.openai_service import generate_hint


hints_bp = Blueprint("hints", __name__)


@hints_bp.post("/hint")
def get_hint():
    payload = request.get_json(force=True)
    challenge_id = payload.get("challengeId")
    code = payload.get("code", "")
    hint_level = int(payload.get("hintLevel", 1))

    challenge = get_challenge_by_id(challenge_id)
    if not challenge:
        return {"error": "Challenge not found."}, 404

    hint = generate_hint(challenge, code, hint_level)
    return {"hint": hint}
