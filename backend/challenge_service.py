import json
from functools import lru_cache
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
CHALLENGES_PATH = BASE_DIR / "data" / "challenges.json"


@lru_cache(maxsize=1)
def load_challenges():
    with CHALLENGES_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_all_challenges():
    return load_challenges()


def get_challenge_by_id(challenge_id):
    return next((challenge for challenge in load_challenges() if challenge["id"] == challenge_id), None)

