def _normalize(text):
    return "\n".join(line.rstrip() for line in text.replace("\r\n", "\n").split("\n")).strip()


def _rule_passes(rule, code):
    rule_type = rule["type"]

    if rule_type == "contains":
        return rule["value"] in code
    if rule_type == "contains_any":
        return any(value in code for value in rule["values"])
    if rule_type == "not_contains":
        return rule["value"] not in code
    return False


def validate_submission(challenge, code):
    normalized_code = _normalize(code)
    validator = challenge["validator"]
    rules = validator["rules"]
    mode = validator["mode"]

    results = [_rule_passes(rule, normalized_code) for rule in rules]
    passed = all(results) if mode == "all_of" else any(results)

    if passed:
        return {
            "passed": True,
            "feedback": challenge["successMessage"],
            "recap": challenge["recap"],
        }

    bug_type = challenge["bugType"].lower()
    concept = challenge["conceptExplanation"]
    feedback = f"This attempt is close, but the {bug_type} issue is still present. {concept}"

    return {
        "passed": False,
        "feedback": feedback,
        "recap": None,
    }

