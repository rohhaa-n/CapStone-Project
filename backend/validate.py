from flask import Blueprint, request

from services.challenge_service import get_challenge_by_id
from services.validation_service import validate_submission


validate_bp = Blueprint("validate", __name__)


@validate_bp.post("/validate")
def validate_code():
    payload = request.get_json(force=True)
    challenge_id = payload.get("challengeId")
    code = payload.get("code", "")

    challenge = get_challenge_by_id(challenge_id)
    if not challenge:
        return {"error": "Challenge not found."}, 404

    if not code.strip():
        return {"error": "Please enter some code before submitting."}, 400

    return validate_submission(challenge, code)

