import { useState, useMemo } from "react";
import { Sparkles, Dice5, Search, Clock3, ChevronRight, ArrowLeft } from "lucide-react";
import type { PracticeTab, Question, Topic } from "../features/speaking/types/speaking.types";
import { ModeModal } from "../features/speaking/components/ModeModal";
import { SpeakingWorkspace } from "../features/speaking/components/SpeakingWorkspace";
import { useNavigate } from "react-router-dom"; 

const TABS: PracticeTab[] = ["Part 1", "Part 2", "Part 3", "Custom Question"];
const BANDS = ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5"];

const TOPICS: Topic[] = [
  {
    name: "Work & Study",
    icon: "💼",
    description: "Common questions about daily routine, job, or university life.",
    questions: [
      { id: "ws-1", text: "Do you work or are you a student?", difficulty: "Easy", estimatedTime: "2 min" },
      { id: "ws-2", text: "What do you like most about your school or job?", difficulty: "Easy", estimatedTime: "2 min" },
      { id: "ws-3", text: "What technologies do you use daily for work or study?", difficulty: "Medium", estimatedTime: "3 min" },
    ],
  },
  {
    name: "Hometown",
    icon: "🏡",
    description: "Describe where you live, local amenities, and recent changes.",
    questions: [
      { id: "hn-1", text: "Where do you come from?", difficulty: "Easy", estimatedTime: "2 min" },
      { id: "hn-2", text: "What is interesting about your hometown?", difficulty: "Medium", estimatedTime: "3 min" },
      { id: "hn-3", text: "How has your hometown changed over recent years?", difficulty: "Hard", estimatedTime: "4 min" },
    ],
  },
];

export default function IeltsSpeakingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PracticeTab>("Part 1");
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0].name);
  const [targetBand, setTargetBand] = useState("7.0");
  const [search, setSearch] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [workspaceQuestion, setWorkspaceQuestion] = useState<Question | null>(null);

  const topicData = TOPICS.find((t) => t.name === selectedTopic) ?? TOPICS[0];

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topicData.questions.filter((item) => !q || item.text.toLowerCase().includes(q));
  }, [search, topicData]);

  const handleStartCustom = () => {
    if (!customPrompt.trim()) return;
    setSelectedQuestion({
      id: "custom",
      text: customPrompt.trim(),
      difficulty: "Medium",
      estimatedTime: "4 min",
    });
  };

  const handleRandomPractice = () => {
    const all = TOPICS.flatMap((t) => t.questions);
    setSelectedQuestion(all[Math.floor(Math.random() * all.length)]);
  };

  if (workspaceQuestion) {
    return (
      <SpeakingWorkspace
        question={workspaceQuestion}
        targetBand={targetBand}
        onBack={() => setWorkspaceQuestion(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
    <header className="border-b-2 border-slate-100 bg-white shadow-sm">
      <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        
        {/* Nút Back về Trang Chủ */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/ielts")}
            className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-100 active:translate-y-1 active:border-b-2"
          >
            <ArrowLeft className="h-4 w-4" /> Quay về
          </button>
        </div>

        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Speaking practice / Library</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
              IELTS Speaking Practice Hub
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choose a topic, refine your ideas with AI, and speak naturally.
            </p>
          </div>
          <button
            onClick={handleRandomPractice}
            className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-amber-400 px-5 py-3.5 text-sm font-bold text-amber-950 shadow-sm transition-all duration-150 hover:bg-amber-500 active:translate-y-1 active:border-b-0"
          >
            <Dice5 className="h-4 w-4" /> Quick Practice
          </button>
        </div>

        {/* Controls */}
        <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex overflow-x-auto rounded-2xl border-2 border-slate-100 bg-slate-50 p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === tab ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 lg:ml-auto">
            <label className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-100 bg-white px-4 text-xs font-bold text-slate-500 shadow-sm">
              <span>Target Band</span>
              <select
                value={targetBand}
                onChange={(e) => setTargetBand(e.target.value)}
                className="cursor-pointer bg-transparent py-2.5 font-bold text-slate-800 outline-none"
              >
                {BANDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border-2 border-slate-100 bg-white px-4 text-slate-400 shadow-sm sm:min-w-[250px]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="min-w-0 flex-1 bg-transparent py-3 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </div>
      </div>
    </header>

      {/* Main Body */}
      <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9">
        {activeTab === "Custom Question" ? (
          <div className="mx-auto max-w-3xl rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Practice your own question</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Paste a Part 1 question, Part 2 cue card, or custom prompt.
                </p>
              </div>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={6}
              placeholder="e.g. Describe a skill you would like to learn in the future..."
              className="w-full resize-y rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-slate-500">AI Examiner will guide you step-by-step.</p>
              <button
                type="button"
                onClick={handleStartCustom}
                className="flex items-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-5 py-3.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
              >
                Choose mode <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
            {/* Topic Navigation */}
            <aside>
              <span className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Explore topics
              </span>
              <div className="space-y-2.5">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.name}
                    onClick={() => setSelectedTopic(topic.name)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition shadow-sm ${
                      selectedTopic === topic.name
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:shadow-md"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold border ${
                      selectedTopic === topic.name ? "border-emerald-600 bg-emerald-500 text-white" : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}>
                      {topic.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-bold ${selectedTopic === topic.name ? "text-emerald-900" : "text-slate-800"}`}>
                        {topic.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {topic.questions.length} questions
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Questions Section */}
            <section>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {activeTab} questions
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{topicData.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{topicData.description}</p>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredQuestions.map((q, idx) => (
                  <article
                    key={q.id}
                    className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <span className="hidden text-sm font-bold text-slate-600 sm:block">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-center gap-2.5">
                          <span className={`rounded-xl px-3 py-1 text-[11px] font-bold border ${
                            q.difficulty === "Easy" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
                            q.difficulty === "Medium" ? "border-amber-200 bg-amber-50 text-amber-800" :
                            "border-rose-200 bg-rose-50 text-rose-700"
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock3 className="h-3.5 w-3.5 text-slate-500" /> {q.estimatedTime}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-800 sm:text-lg">
                          {q.text}
                        </h3>
                        <button
                          onClick={() => setSelectedQuestion(q)}
                          className="mt-4 flex items-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
                        >
                          Start Practice <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Mode Modal */}
      {selectedQuestion && (
        <ModeModal
          question={selectedQuestion}
          onClose={() => setSelectedQuestion(null)}
          onGuided={() => {
            setWorkspaceQuestion(selectedQuestion);
            setSelectedQuestion(null);
          }}
          onMock={() => {
            setWorkspaceQuestion(selectedQuestion);
            setSelectedQuestion(null);
          }}
        />
      )}
    </div>
  );
}