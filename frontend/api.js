const API_BASE = "http://127.0.0.1:5000/api"

async function parseResponse(response) {
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || "Something went wrong.")
  }
  return payload
}

export async function fetchChallenges() {
  const response = await fetch(`${API_BASE}/challenges`)
  return parseResponse(response)
}

export async function submitCode(challengeId, code) {
  const response = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ challengeId, code })
  })
  return parseResponse(response)
}

export async function requestHint(challengeId, code, hintLevel) {
  const response = await fetch(`${API_BASE}/hint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ challengeId, code, hintLevel })
  })
  return parseResponse(response)
}
