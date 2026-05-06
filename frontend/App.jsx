import { useEffect, useMemo, useState } from "react"
import Editor from "@monaco-editor/react"
import { fetchChallenges, requestHint, submitCode } from "./lib/api"

const STORAGE_KEY = "quikfix-progress"

function loadProgress() {
  const fallback = { completed: [], hints: {}, score: 0 }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return fallback

  try {
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

function saveProgress(progress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

function difficultyTone(level) {
  if (level === "Easy") return "text-emerald-300"
  if (level === "Medium") return "text-amber-300"
  return "text-rose-300"
}

function App() {
  const [screen, setScreen] = useState("home")
  const [challenges, setChallenges] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [code, setCode] = useState("")
  const [progress, setProgress] = useState(() => loadProgress())
  const [feedback, setFeedback] = useState("")
  const [recap, setRecap] = useState("")
  const [hintText, setHintText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHinting, setIsHinting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchChallenges()
        setChallenges(payload.challenges)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const selectedChallenge = useMemo(
    () => challenges.find((challenge) => challenge.id === selectedId) || null,
    [challenges, selectedId],
  )

  useEffect(() => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode)
      setFeedback("")
      setRecap("")
      setHintText("")
      setScreen("challenge")
    }
  }, [selectedChallenge])

  const unlockedCount = Math.max(progress.completed.length + 1, 1)

  const openChallenge = (challenge) => {
    const challengeIndex = challenges.findIndex((item) => item.id === challenge.id)
    if (challengeIndex + 1 > unlockedCount) return
    setSelectedId(challenge.id)
  }

  const handleSubmit = async () => {
    if (!selectedChallenge) return
    setIsSubmitting(true)
    setError("")

    try {
      const result = await submitCode(selectedChallenge.id, code)
      setFeedback(result.feedback)
      setRecap(result.recap || "")

      if (result.passed && !progress.completed.includes(selectedChallenge.id)) {
        setProgress((current) => ({
          ...current,
          completed: [...current.completed, selectedChallenge.id],
          score: current.score + Math.max(50, 100 - ((current.hints[selectedChallenge.id] || 0) * 10)),
        }))
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHint = async () => {
    if (!selectedChallenge) return
    setIsHinting(true)
    setError("")

    const nextHintLevel = Math.min((progress.hints[selectedChallenge.id] || 0) + 1, 3)

    try {
      const result = await requestHint(selectedChallenge.id, code, nextHintLevel)
      setHintText(result.hint)
      setProgress((current) => ({
        ...current,
        hints: {
          ...current.hints,
          [selectedChallenge.id]: nextHintLevel
        }
      }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsHinting(false)
    }
  }

  const resetProgress = () => {
    const fresh = { completed: [], hints: {}, score: 0 }
    setProgress(fresh)
    saveProgress(fresh)
    setScreen("home")
    setSelectedId(null)
    setFeedback("")
    setRecap("")
    setHintText("")
  }

  const completionRate = challenges.length
    ? Math.round((progress.completed.length / challenges.length) * 100)
    : 0

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-night text-white">
        <div className="panel p-8 text-center shadow-glow">
          <p className="text-lg font-semibold">Loading the dungeon...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-hero-grid text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">QuikFix</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Turn beginner bugs into obstacles, learn the pattern behind each error, and unlock the next chamber.
            </p>
          </div>
          <div className="panel flex gap-6 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Score</p>
              <p className="text-2xl font-bold text-amber-300">{progress.score}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Progress</p>
              <p className="text-2xl font-bold text-sky-300">{completionRate}%</p>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-100">
            {error}
          </div>
        ) : null}

        {screen === "home" ? (
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="panel overflow-hidden shadow-glow">
              <div className="border-b border-white/10 px-8 py-8">
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-sky-200/70">Adventure Brief</p>
                <h2 className="max-w-xl text-3xl font-bold leading-tight">
                  Learn debugging by clearing handcrafted Python and Java obstacles.
                </h2>
              </div>
              <div className="grid gap-6 px-8 py-8 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Explore</p>
                  <p className="mt-3 text-slate-300">Choose from six themed bug encounters across Python and Java.</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-frost">Repair</p>
                  <p className="mt-3 text-slate-300">Edit broken code directly in the browser and submit your fix.</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Remember</p>
                  <p className="mt-3 text-slate-300">Unlock a recap after each victory so the debugging lesson sticks.</p>
                </div>
              </div>
            </div>

            <aside className="panel p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Mission Stats</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-sky-400/10 p-4">
                  <p className="text-sm text-slate-300">Levels ready</p>
                  <p className="text-3xl font-bold text-sky-200">{challenges.length}</p>
                </div>
                <div className="rounded-2xl bg-amber-400/10 p-4">
                  <p className="text-sm text-slate-300">Languages</p>
                  <p className="text-3xl font-bold text-amber-200">Python + Java</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 p-4">
                  <p className="text-sm text-slate-300">Hint system</p>
                  <p className="text-2xl font-bold text-emerald-200">OpenAI Oracle</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="button-primary" onClick={() => setScreen("map")}>
                  Enter the Dungeon
                </button>
                <button className="button-secondary" onClick={resetProgress}>
                  Reset Journey
                </button>
              </div>
            </aside>
          </section>
        ) : null}

        {screen === "map" ? (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Level Map</p>
                <h2 className="mt-2 text-3xl font-bold">Choose your next obstacle</h2>
              </div>
              <button className="button-secondary" onClick={() => setScreen("home")}>
                Back to Briefing
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {challenges.map((challenge, index) => {
                const unlocked = index + 1 <= unlockedCount
                const completed = progress.completed.includes(challenge.id)

                return (
                  <button
                    key={challenge.id}
                    onClick={() => openChallenge(challenge)}
                    disabled={!unlocked}
                    className={`panel min-h-[260px] p-6 text-left transition ${
                      unlocked ? "hover:-translate-y-1 hover:border-sky-300/40" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{challenge.language}</p>
                        <h3 className="mt-3 text-2xl font-bold">{challenge.title}</h3>
                      </div>
                      <span className={`text-sm font-semibold ${difficultyTone(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>

                    <p className="mt-4 text-sm uppercase tracking-[0.2em] text-amber-300">{challenge.obstacle}</p>
                    <p className="mt-4 text-slate-300">{challenge.summary}</p>

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="rounded-full bg-white/10 px-3 py-1">{challenge.bugType}</span>
                      <span>{completed ? "Cleared" : unlocked ? "Unlocked" : "Locked"}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        {screen === "challenge" && selectedChallenge ? (
          <section className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
            <div className="space-y-6">
              <div className="panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{selectedChallenge.language}</p>
                    <h2 className="mt-2 text-3xl font-bold">{selectedChallenge.title}</h2>
                  </div>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300">
                    {selectedChallenge.bugType}
                  </span>
                </div>
                <p className="mt-4 text-sky-200">{selectedChallenge.obstacle}</p>
                <p className="mt-4 text-slate-300">{selectedChallenge.themeStory}</p>
              </div>

              <div className="panel p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Objective</p>
                <p className="mt-3 text-slate-200">{selectedChallenge.objective}</p>
                <p className="mt-5 text-sm uppercase tracking-[0.3em] text-slate-400">Why this matters</p>
                <p className="mt-3 text-slate-300">{selectedChallenge.conceptExplanation}</p>
              </div>

              <div className="panel p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Oracle Hints</p>
                  <span className="text-sm text-slate-400">
                    Hint level {progress.hints[selectedChallenge.id] || 0}/3
                  </span>
                </div>
                <p className="mt-3 text-slate-300">
                  Ask for a layered clue. The score reward drops slightly when you use extra hints.
                </p>
                <button className="button-secondary mt-5 w-full" onClick={handleHint} disabled={isHinting}>
                  {isHinting ? "Consulting the Oracle..." : "Ask the Oracle"}
                </button>
                <div className="mt-5 rounded-2xl bg-sky-400/10 p-4 text-sky-50">
                  {hintText || "No hint used yet. Try solving it first, then ask for guidance if you get stuck."}
                </div>
              </div>

              {feedback ? (
                <div className="panel p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Result</p>
                  <p className="mt-3 text-slate-100">{feedback}</p>
                  {recap ? (
                    <>
                      <p className="mt-5 text-sm uppercase tracking-[0.3em] text-slate-400">Lesson learned</p>
                      <p className="mt-3 text-emerald-200">{recap}</p>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="panel overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bug Console</p>
                  <p className="text-slate-300">Repair the code, then submit the fix to clear the obstacle.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="button-secondary" onClick={() => setScreen("map")}>
                    Back to Map
                  </button>
                  <button className="button-primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Checking..." : "Submit Fix"}
                  </button>
                </div>
              </div>
              <Editor
                height="70vh"
                theme="vs-dark"
                language={selectedChallenge.language.toLowerCase()}
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 16,
                  minimap: { enabled: false },
                  wordWrap: "on"
                }}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default App
