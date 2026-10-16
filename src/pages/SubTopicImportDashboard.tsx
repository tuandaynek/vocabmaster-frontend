import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  FileJson2,
  Gamepad2,
  Lightbulb,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  type GameStage,
  type GrammarTopic,
  type SubTopic,
} from "../features/grammar/types/grammarData";
import { grammarApi } from "../features/grammar/api/grammarApi";

const GAME_TYPES = [
  "puzzle",
  "error",
  "speed",
  "transformer",
  "context",
] as const;

const GAME_TYPE_STYLES: Record<GameType, { badge: string; card: string }> = {
  puzzle: {
    badge: "bg-violet-100 text-violet-700",
    card: "border-violet-200 bg-violet-50/60",
  },
  error: {
    badge: "bg-rose-100 text-rose-700",
    card: "border-rose-200 bg-rose-50/60",
  },
  speed: {
    badge: "bg-amber-100 text-amber-700",
    card: "border-amber-200 bg-amber-50/60",
  },
  transformer: {
    badge: "bg-sky-100 text-sky-700",
    card: "border-sky-200 bg-sky-50/60",
  },
  context: {
    badge: "bg-emerald-100 text-emerald-700",
    card: "border-emerald-200 bg-emerald-50/60",
  },
};

const THEORY_SECTIONS = [
  { key: "formulas", label: "Formulas", description: "Patterns and structures" },
  {
    key: "usageSignals",
    label: "Usage",
    description: "When and why to use them",
  },
  { key: "examples", label: "Examples", description: "Illustrative sentences" },
  { key: "traps", label: "Common traps", description: "Mistakes to watch for" },
] as const;

const THEORY_SECTION_STYLES = [
  "border-violet-200 bg-violet-50/60",
  "border-sky-200 bg-sky-50/60",
  "border-emerald-200 bg-emerald-50/60",
  "border-rose-200 bg-rose-50/60",
] as const;

type GameType = (typeof GAME_TYPES)[number];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

interface QuestionDraft {
  questionType: GameType;
  payload: JsonObject;
  orderIndex: number;
}

interface StageDraft {
  title: string;
  gameType: GameType;
  orderIndex: number;
  questions: QuestionDraft[];
}

interface ImportDraft {
  topicId: string;
  title: string;
  description: string;
  orderIndex: number;
  theoryContent: JsonObject;
  stages: StageDraft[];
}

type ActiveSection =
  | { type: "overview" }
  | { type: "theory" }
  | { type: "stage"; index: number };

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isJsonValue = (value: unknown): value is JsonValue =>
  value === null ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  (Array.isArray(value) && value.every(isJsonValue)) ||
  (isJsonObject(value) && Object.values(value).every(isJsonValue));

const createEmptyDraft = (topicId = ""): ImportDraft => ({
  topicId,
  title: "",
  description: "",
  orderIndex: 0,
  theoryContent: {
    formulas: [],
    usageSignals: [],
    examples: [],
    traps: [],
  },
  stages: [],
});

const createEmptyQuestionPayload = (gameType: GameType): JsonObject => {
  switch (gameType) {
    case "puzzle":
      return { vietnamesePrompt: "", correctSentence: [] };
    case "error":
      return {
        sentenceParts: {
          prefix: "",
          optionA: { key: "A", text: "", isError: false },
          mid1: "",
          optionB: { key: "B", text: "", isError: false },
          mid2: "",
          optionC: { key: "C", text: "", isError: false },
          mid3: "",
          optionD: { key: "D", text: "", isError: false },
          suffix: "",
        },
        explanation: "",
      };
    case "speed":
      return {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      };
    case "transformer":
      return {
        originalSentence: "",
        targetPrompt: "",
        correctBlocks: [],
        distractorBlocks: [],
        explanation: "",
      };
    case "context":
      return {
        speakerA: "",
        speakerBContext: "",
        options: [
          { id: "option-1", text: "", isCorrect: true, nuanceExplanation: "" },
          { id: "option-2", text: "", isCorrect: false, nuanceExplanation: "" },
          { id: "option-3", text: "", isCorrect: false, nuanceExplanation: "" },
        ],
        explanation: "",
      };
  }
};

const normalizeQuestionPayload = (
  gameType: GameType,
  payload: JsonObject,
): JsonObject => {
  if (gameType === "puzzle") {
    if (
      typeof payload.vietnamesePrompt !== "string" ||
      !Array.isArray(payload.correctSentence) ||
      !payload.correctSentence.every((word) => typeof word === "string")
    ) {
      throw new Error(
        'Puzzle payload requires a "vietnamesePrompt" string and a "correctSentence" array of strings.',
      );
    }
    return {
      vietnamesePrompt: payload.vietnamesePrompt,
      correctSentence: payload.correctSentence,
    };
  }

  const normalized = {
    ...createEmptyQuestionPayload(gameType),
    ...payload,
  };

  if (gameType === "error") {
    const defaults = readObject(
      createEmptyQuestionPayload("error").sentenceParts,
    );
    const parts = readObject(payload.sentenceParts);
    const options = (["A", "B", "C", "D"] as const).reduce<JsonObject>(
      (result, letter) => {
        const key = `option${letter}`;
        const option = readObject(parts[key]);
        result[key] = {
          ...readObject(defaults[key]),
          ...option,
          key: letter,
        };
        return result;
      },
      {},
    );
    normalized.sentenceParts = {
      ...defaults,
      ...parts,
      ...options,
    };
  }

  if (gameType === "context" && Array.isArray(payload.options)) {
    let correctAnswerAssigned = false;
    normalized.options = payload.options.map((rawOption, index) => {
      const option = readObject(rawOption);
      const isCorrect = option.isCorrect === true && !correctAnswerAssigned;
      correctAnswerAssigned ||= isCorrect;
      return {
        ...option,
        id:
          typeof option.id === "string" && option.id
            ? option.id
            : `option-${index + 1}`,
        isCorrect,
      };
    });
  }

  return normalized;
};

const NEW_SUBTOPIC_OPTION = "__new_subtopic__";

const buildDraftFromSubTopic = (
  topicId: string,
  subTopic: SubTopic,
  gameStages: GameStage[],
): ImportDraft => {
  const stages = gameStages.map((stage, stageIndex) => ({
      title: stage.title,
      gameType: stage.type,
      orderIndex: stage.orderIndex ?? stageIndex,
      questions: stage.questions.map((question, questionIndex) => {
        const payload: unknown = JSON.parse(JSON.stringify(question));
        if (!isJsonObject(payload)) {
          throw new Error("Question payload must be a JSON object.");
        }
        delete payload.id;
        return {
          questionType: stage.type,
          payload: normalizeQuestionPayload(stage.type, payload),
          orderIndex: questionIndex,
        };
      }),
    }));
  const theoryContent: unknown = JSON.parse(
    JSON.stringify(subTopic.theory),
  );

  if (!isJsonObject(theoryContent)) {
    throw new Error("Theory content must be a JSON object.");
  }

  return {
    topicId,
    title: subTopic.title,
    description: subTopic.description,
    orderIndex: subTopic.orderIndex,
    theoryContent,
    stages,
  };
};

const getIndex = (
  source: JsonObject,
  camel: string,
  snake: string,
  fallback = 0,
) => {
  const value = source[camel] ?? source[snake];
  return Number.isInteger(value) && Number(value) >= 0
    ? Number(value)
    : fallback;
};

const hydrateImport = (raw: unknown, topicId: string): ImportDraft => {
  if (!isJsonObject(raw)) {
    throw new Error("The JSON root must be an object.");
  }
  if (typeof raw.title !== "string" || !raw.title.trim()) {
    throw new Error('Add a non-empty "title" to the JSON.');
  }
  if (!Array.isArray(raw.stages)) {
    throw new Error('Add a "stages" array to the JSON.');
  }

  const theoryContent = raw.theoryContent ?? raw.theory_content ?? {};
  if (!isJsonObject(theoryContent) || !isJsonValue(theoryContent)) {
    throw new Error('"theoryContent" must be a JSON object.');
  }

  const stages = raw.stages.map((stage, stageIndex): StageDraft => {
    if (!isJsonObject(stage)) {
      throw new Error(`Stage ${stageIndex + 1} must be an object.`);
    }
    const gameType = stage.gameType ?? stage.game_type;
    if (typeof stage.title !== "string" || !stage.title.trim()) {
      throw new Error(`Stage ${stageIndex + 1} needs a title.`);
    }
    if (!GAME_TYPES.includes(gameType as GameType)) {
      throw new Error(`Stage ${stageIndex + 1} has an invalid game type.`);
    }
    if (!Array.isArray(stage.questions)) {
      throw new Error(`Questions in stage ${stageIndex + 1} must be an array.`);
    }

    const questions = stage.questions.map((question, questionIndex) => {
      if (!isJsonObject(question)) {
        throw new Error(
          `Question ${questionIndex + 1} in stage ${stageIndex + 1} must be an object.`,
        );
      }
      const questionType = question.questionType ?? question.question_type;
      const rawPayload = question.payload ?? {};
      if (!GAME_TYPES.includes(questionType as GameType)) {
        throw new Error(
          `Question ${questionIndex + 1} in stage ${stageIndex + 1} has an invalid type.`,
        );
      }
      if (!isJsonObject(rawPayload) || !isJsonValue(rawPayload)) {
        throw new Error(
          `Question ${questionIndex + 1} in stage ${stageIndex + 1} needs an object payload.`,
        );
      }
      return {
        questionType: gameType as GameType,
        payload: normalizeQuestionPayload(gameType as GameType, rawPayload),
        orderIndex: getIndex(
          question,
          "orderIndex",
          "order_index",
          questionIndex,
        ),
      };
    });

    return {
      title: stage.title,
      gameType: gameType as GameType,
      orderIndex: getIndex(stage, "orderIndex", "order_index", stageIndex),
      questions,
    };
  });

  return {
    topicId,
    title: raw.title,
    description: typeof raw.description === "string" ? raw.description : "",
    orderIndex: getIndex(raw, "orderIndex", "order_index"),
    theoryContent,
    stages,
  };
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

function FieldLabel({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-700">
        {label}
        {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function JsonValueFields({
  label,
  value,
  onChange,
  onRemove,
  depth = 0,
}: {
  label: string;
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  onRemove?: () => void;
  depth?: number;
}) {
  const addObjectEntry = () => {
    if (!isJsonObject(value)) return;
    let key = "newField";
    let suffix = 1;
    while (key in value) {
      key = `newField${suffix++}`;
    }
    onChange({ ...value, [key]: "" });
  };

  return (
    <div
      className={`min-w-0 rounded-xl border p-3 ${
        depth === 0
          ? "border-slate-200 bg-white"
          : "border-slate-200/80 bg-slate-50"
      }`}
    >
      <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-slate-700">{label}</span>
        <div className="flex shrink-0 items-center gap-1">
          {isJsonObject(value) && (
            <button
              type="button"
              onClick={addObjectEntry}
              aria-label={`Add field to ${label}`}
              className="rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50"
            >
              <Plus size={15} />
            </button>
          )}
          {Array.isArray(value) && (
            <button
              type="button"
              onClick={() => onChange([...value, ""])}
              aria-label={`Add item to ${label}`}
              className="rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50"
            >
              <Plus size={15} />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label}`}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {isJsonObject(value) ? (
        <div className="space-y-2.5">
          {Object.entries(value).length === 0 && (
            <p className="text-xs text-slate-400">No fields yet.</p>
          )}
          {Object.entries(value).map(([key, child]) => (
            <div key={key} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(100px,0.7fr)_minmax(0,1.3fr)]">
              <input
                aria-label={`${label} field name`}
                value={key}
                onChange={(event) => {
                  const nextKey = event.target.value;
                  if (!nextKey.trim() || (nextKey in value && nextKey !== key)) {
                    return;
                  }
                  const next = { ...value };
                  delete next[key];
                  next[nextKey] = child;
                  onChange(next);
                }}
                className={fieldClass}
              />
              <JsonValueFields
                label={key}
                value={child}
                depth={depth + 1}
                onChange={(nextValue) =>
                  onChange({ ...value, [key]: nextValue })
                }
                onRemove={() => {
                  const next = { ...value };
                  delete next[key];
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      ) : Array.isArray(value) ? (
        <div className="space-y-2.5">
          {value.length === 0 && (
            <p className="text-xs text-slate-400">No items yet.</p>
          )}
          {value.map((item, index) => (
            <JsonValueFields
              key={index}
              label={`Item ${index + 1}`}
              value={item}
              depth={depth + 1}
              onChange={(nextValue) =>
                onChange(value.map((current, itemIndex) =>
                  itemIndex === index ? nextValue : current,
                ))
              }
              onRemove={() =>
                onChange(value.filter((_, itemIndex) => itemIndex !== index))
              }
            />
          ))}
        </div>
      ) : typeof value === "boolean" ? (
        <select
          value={String(value)}
          onChange={(event) => onChange(event.target.value === "true")}
          className={fieldClass}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      ) : typeof value === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={fieldClass}
        />
      ) : value === null ? (
        <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
          <span>Empty value</span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="font-bold text-indigo-600 hover:text-indigo-800"
          >
            Set text
          </button>
        </div>
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
      )}
    </div>
  );
}

export default function SubTopicImportDashboard() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicId, setTopicId] = useState("");
  const [selectedSubTopicId, setSelectedSubTopicId] = useState("");
  const [subTopicLoading, setSubTopicLoading] = useState(false);
  const [draft, setDraft] = useState<ImportDraft>(() => createEmptyDraft());
  const [activeSection, setActiveSection] = useState<ActiveSection>({
    type: "overview",
  });
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setTopics(await grammarApi.getTopics());
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "Could not load grammar topics.",
        );
      } finally {
        setTopicsLoading(false);
      }
    };
    void fetchTopics();
  }, []);

  const compiledPayload = useMemo(
    () => ({
      topicId,
      title: draft.title.trim(),
      description: draft.description,
      orderIndex: draft.orderIndex,
      theoryContent: draft.theoryContent,
      stages: draft.stages.map((stage, stageIndex) => ({
        ...stage,
        title: stage.title.trim(),
        orderIndex: stage.orderIndex ?? stageIndex,
        questions: stage.questions.map((question, questionIndex) => ({
          ...question,
          orderIndex: question.orderIndex ?? questionIndex,
        })),
      })),
    }),
    [draft, topicId],
  );

  const updateDraft = (updater: (current: ImportDraft) => ImportDraft) => {
    setDraft(updater);
    setFormError("");
  };

  const handleParentTopicChange = (nextTopicId: string) => {
    setTopicId(nextTopicId);
    setSelectedSubTopicId("");
    setDraft(createEmptyDraft(nextTopicId));
    setFormError("");
    setActiveSection({ type: "overview" });
  };

  const handleSubTopicSelection = async (subTopicId: string) => {
    setSelectedSubTopicId(subTopicId);
    setFormError("");

    if (subTopicId === NEW_SUBTOPIC_OPTION) {
      setDraft(createEmptyDraft(topicId));
      return;
    }

    if (!subTopicId) {
      setDraft(createEmptyDraft(topicId));
      return;
    }

    const selectedTopic = topics.find((topic) => topic.id === topicId);
    const selectedSubTopic = selectedTopic?.subTopics.find(
      (subTopic) => subTopic.id === subTopicId,
    );

    if (!selectedSubTopic) {
      setFormError("Could not find that sub-topic in the mock catalog.");
      return;
    }

    setSubTopicLoading(true);
    try {
      const [details, stages] = await Promise.all([
        grammarApi.getSubTopicDetail(subTopicId),
        grammarApi.getStagesBySubTopic(
          subTopicId,
          selectedSubTopic.topicId,
          selectedSubTopic.title,
        ),
      ]);
      setDraft(buildDraftFromSubTopic(topicId, details, stages));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not load this sub-topic from mock data.",
      );
    } finally {
      setSubTopicLoading(false);
    }
  };

  const handleStartBlank = () => {
    setSelectedSubTopicId(NEW_SUBTOPIC_OPTION);
    setDraft(createEmptyDraft(topicId));
    setImportError("");
    setShowImportDialog(false);
    setActiveSection({ type: "overview" });
  };

  const handleHydrateJson = () => {
    try {
      const hydrated = hydrateImport(JSON.parse(importText) as unknown, topicId);
      setSelectedSubTopicId(NEW_SUBTOPIC_OPTION);
      setDraft(hydrated);
      setImportError("");
      setFormError("");
      setShowImportDialog(false);
      setActiveSection({ type: "overview" });
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Please provide valid JSON.",
      );
    }
  };

  const handleSaveImport = async () => {
    if (!topicId) {
      setFormError("Select a parent topic before importing.");
      return;
    }
    if (selectedSubTopicId !== NEW_SUBTOPIC_OPTION) {
      setFormError(
        "Bulk import only creates new sub-topics. Select “Thêm mới” before importing.",
      );
      setActiveSection({ type: "overview" });
      return;
    }
    if (!compiledPayload.title) {
      setActiveSection({ type: "overview" });
      setFormError("Add a sub-topic title before importing.");
      return;
    }
    if (compiledPayload.stages.length === 0) {
      setFormError("Add at least one game stage before importing.");
      return;
    }

    setSaving(true);
    try {
      await grammarApi.importFullSubTopic(compiledPayload);
      window.alert("Import sub-topic successfully!");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not import this sub-topic.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addStage = () => {
    const newIndex = draft.stages.length;
    updateDraft((current) => ({
      ...current,
      stages: [
        ...current.stages,
        {
          title: "",
          gameType: "puzzle",
          orderIndex: newIndex,
          questions: [],
        },
      ],
    }));
    setActiveSection({ type: "stage", index: newIndex });
  };

  const updateStage = (
    index: number,
    updater: (stage: StageDraft) => StageDraft,
  ) =>
    updateDraft((current) => ({
      ...current,
      stages: current.stages.map((stage, stageIndex) =>
        stageIndex === index ? updater(stage) : stage,
      ),
    }));

  const activeStage =
    activeSection.type === "stage"
      ? draft.stages[activeSection.index]
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-600">
                Grammar Quest · Admin
              </p>
              <h1 className="truncate font-black text-slate-900">
                Sub-topic editor
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 sm:inline-flex">
              Mock mode
            </span>
            <button
              type="button"
              onClick={() => {
                setImportText("");
                setImportError("");
                setShowImportDialog(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <FileJson2 size={16} />
              <span className="hidden sm:inline">Paste JSON</span>
            </button>
            <button
              type="button"
              onClick={handleSaveImport}
              disabled={saving || selectedSubTopicId !== NEW_SUBTOPIC_OPTION}
              title={
                selectedSubTopicId !== NEW_SUBTOPIC_OPTION
                  ? "Select Thêm mới to import a new sub-topic"
                  : undefined
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-extrabold text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:px-4"
            >
              <Save size={16} />
              <span className="hidden sm:inline">
                {saving
                  ? "Importing..."
                  : selectedSubTopicId === NEW_SUBTOPIC_OPTION
                    ? "Import lesson"
                    : "Select Thêm mới"}
              </span>
              <span className="sm:hidden">{saving ? "Saving" : "Import"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div
          className="grid items-start gap-5 lg:gap-8"
          style={{ gridTemplateColumns: "260px minmax(0, 1fr)" }}
        >
          <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-3 pb-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lesson setup
              </p>
              <label className="mt-3 block space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Parent topic</span>
                <select
                  value={topicId}
                  onChange={(event) =>
                    handleParentTopicChange(event.target.value)
                  }
                  disabled={topicsLoading}
                  className={`${fieldClass} px-2.5 py-2 text-xs`}
                >
                  <option value="">
                    {topicsLoading ? "Loading topics..." : "Select topic"}
                  </option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <nav aria-label="Editor sections" className="space-y-1">
              <SidebarItem
                active={activeSection.type === "overview"}
                icon={<BookOpen size={17} />}
                label="Overview"
                description="Lesson details"
                onClick={() => setActiveSection({ type: "overview" })}
              />
              <SidebarItem
                active={activeSection.type === "theory"}
                icon={<Lightbulb size={17} />}
                label="Theory content"
                description="Slides and examples"
                onClick={() => setActiveSection({ type: "theory" })}
              />
            </nav>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between px-3 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Game stages
                </span>
                <button
                  type="button"
                  onClick={addStage}
                  aria-label="Add stage"
                  className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              {draft.stages.length === 0 ? (
                <p className="px-3 py-2 text-xs leading-5 text-slate-400">
                  Stages you add will appear here.
                </p>
              ) : (
                <div className="space-y-1">
                  {draft.stages.map((stage, index) => (
                    <SidebarItem
                      key={index}
                      active={
                        activeSection.type === "stage" &&
                        activeSection.index === index
                      }
                      icon={<Gamepad2 size={16} />}
                      label={`Stage ${index + 1}: ${stage.gameType}`}
                      description={stage.title || "Untitled stage"}
                      onClick={() =>
                        setActiveSection({ type: "stage", index })
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700">Draft status</p>
              <p className="mt-1 text-xs text-slate-500">
                {draft.stages.length} stages ·{" "}
                {draft.stages.reduce(
                  (count, stage) => count + stage.questions.length,
                  0,
                )}{" "}
                questions
              </p>
            </div>
          </aside>

          <main className="min-w-0">
            {formError && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                <AlertCircle size={17} />
                {formError}
              </div>
            )}

            {activeSection.type === "overview" && (
              <OverviewSection
                draft={draft}
                selectedSubTopicId={selectedSubTopicId}
                subTopics={
                  topics.find((topic) => topic.id === topicId)?.subTopics ?? []
                }
                loading={subTopicLoading}
                onSelectSubTopic={handleSubTopicSelection}
                onChange={(patch) =>
                  updateDraft((current) => ({ ...current, ...patch }))
                }
              />
            )}

            {activeSection.type === "theory" && (
              <TheorySection
                theoryContent={draft.theoryContent}
                onChange={(theoryContent) =>
                  updateDraft((current) => ({ ...current, theoryContent }))
                }
              />
            )}

            {activeSection.type === "stage" && activeStage && (
              <StageSection
                key={activeSection.index}
                stage={activeStage}
                stageNumber={activeSection.index + 1}
                onChange={(updater) =>
                  updateStage(activeSection.index, updater)
                }
                onDelete={() => {
                  const deletedIndex = activeSection.index;
                  updateDraft((current) => ({
                    ...current,
                    stages: current.stages
                      .filter((_, index) => index !== deletedIndex)
                      .map((stage, index) => ({ ...stage, orderIndex: index })),
                  }));
                  setActiveSection({ type: "overview" });
                }}
              />
            )}
          </main>
        </div>
      </div>

      {showImportDialog && (
        <ImportDialog
          value={importText}
          error={importError}
          onChange={(value) => {
            setImportText(value);
            setImportError("");
          }}
          onImport={handleHydrateJson}
          onStartBlank={handleStartBlank}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
}

function SidebarItem({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full min-w-0 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-slate-400">
          {description}
        </span>
      </span>
      {active && <ChevronRight className="mt-1 shrink-0" size={15} />}
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function OverviewSection({
  draft,
  selectedSubTopicId,
  subTopics,
  loading,
  onSelectSubTopic,
  onChange,
}: {
  draft: ImportDraft;
  selectedSubTopicId: string;
  subTopics: SubTopic[];
  loading: boolean;
  onSelectSubTopic: (subTopicId: string) => void;
  onChange: (patch: Partial<ImportDraft>) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Lesson setup"
        title="Overview"
        description="Choose a sub-topic under the selected parent topic, or create a new one. Existing sub-topics load their full theory and game content into the editor."
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 rounded-xl bg-indigo-50/70 p-4">
          <FieldLabel label="Sub-topic" hint="Select an existing lesson or add a new one">
            <select
              value={selectedSubTopicId}
              onChange={(event) => onSelectSubTopic(event.target.value)}
              disabled={!draft.topicId || loading}
              className={fieldClass}
            >
              <option value="">Choose a sub-topic</option>
              {subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.title}
                </option>
              ))}
              <option value={NEW_SUBTOPIC_OPTION}>＋ Thêm mới</option>
            </select>
          </FieldLabel>
          <p className="mt-2 text-xs leading-5 text-indigo-800">
            {!draft.topicId
              ? "Choose a parent topic in the sidebar first."
              : loading
                ? "Loading all lesson sections..."
                : selectedSubTopicId === NEW_SUBTOPIC_OPTION
                  ? "New lesson selected. Fill in the details below, then add theory and game stages from the sidebar."
                  : "Selecting an existing lesson loads its details, theory, stages, and questions."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldLabel label="Sub-topic title" hint="Required">
            <input
              value={draft.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="e.g. Past Simple: Regular Verbs"
              className={fieldClass}
            />
          </FieldLabel>
          <FieldLabel label="Order">
            <input
              type="number"
              min={0}
              value={draft.orderIndex}
              onChange={(event) =>
                onChange({
                  orderIndex: Math.max(0, Number(event.target.value) || 0),
                })
              }
              className={fieldClass}
            />
          </FieldLabel>
          <div className="sm:col-span-2">
            <FieldLabel label="Description" hint="Shown to learners">
              <textarea
                value={draft.description}
                onChange={(event) =>
                  onChange({ description: event.target.value })
                }
                rows={5}
                placeholder="Describe what learners will understand or practice..."
                className={`${fieldClass} resize-y`}
              />
            </FieldLabel>
          </div>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-indigo-50 p-4">
          <Sparkles className="mt-0.5 shrink-0 text-indigo-600" size={18} />
          <p className="text-sm leading-6 text-indigo-900">
            Existing lessons load every editor section together. For a new
            sub-topic, use the left navigation to build its theory deck and
            game stages.
          </p>
        </div>
      </div>
    </section>
  );
}

function TheorySection({
  theoryContent,
  onChange,
}: {
  theoryContent: JsonObject;
  onChange: (theoryContent: JsonObject) => void;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Learning material"
        title="Theory content"
        description="Organize explanations into clear, reusable slide sections. Add fields or nested items where your lesson needs them."
      />
      <div className="space-y-4">
        {THEORY_SECTIONS.map(({ key, label, description }, index) => (
          <div
            key={key}
            className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${THEORY_SECTION_STYLES[index]}`}
          >
            <div className="mb-4">
              <h3 className="font-extrabold text-slate-900">{label}</h3>
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
            <JsonValueFields
              label={label}
              value={theoryContent[key] ?? []}
              onChange={(value) =>
                onChange({ ...theoryContent, [key]: value })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function readText(value: JsonValue | undefined) {
  return typeof value === "string" ? value : "";
}

function readStringList(value: JsonValue | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readObject(value: JsonValue | undefined): JsonObject {
  return isJsonObject(value) ? value : {};
}

function PayloadField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <FieldLabel label={label}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={`${fieldClass} resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
      )}
    </FieldLabel>
  );
}

function StringListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-700">{label}</p>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          <Plus size={14} />
          Add item
        </button>
      </div>
      {values.length ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {values.map((item, index) => (
            <div key={index} className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">
                {index + 1}
              </span>
              <input
                aria-label={`${label} item ${index + 1}`}
                value={item}
                onChange={(event) =>
                  onChange(
                    values.map((current, itemIndex) =>
                      itemIndex === index ? event.target.value : current,
                    ),
                  )
                }
                className={fieldClass}
              />
              <button
                type="button"
                aria-label={`Remove ${label} item ${index + 1}`}
                onClick={() =>
                  onChange(values.filter((_, itemIndex) => itemIndex !== index))
                }
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          No items yet. Add one to get started.
        </p>
      )}
    </div>
  );
}

function QuestionPayloadEditor({
  gameType,
  payload,
  onChange,
}: {
  gameType: GameType;
  payload: JsonObject;
  onChange: (payload: JsonObject) => void;
}) {
  const setField = (key: string, value: JsonValue) =>
    onChange({ ...payload, [key]: value });
  const renderExplanation = () => (
    <PayloadField
      label="Explanation"
      value={readText(payload.explanation)}
      onChange={(value) => setField("explanation", value)}
      multiline
    />
  );

  if (gameType === "puzzle") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <PayloadField
            label="Vietnamese prompt"
            value={readText(payload.vietnamesePrompt)}
            onChange={(value) => setField("vietnamesePrompt", value)}
            multiline
          />
          <StringListField
            label="Correct sentence words"
            values={readStringList(payload.correctSentence)}
            onChange={(value) => setField("correctSentence", value)}
          />
        </div>
      </div>
    );
  }

  if (gameType === "error") {
    const sentenceParts = readObject(payload.sentenceParts);
    const partText = (key: string) => readText(sentenceParts[key]);
    const setPart = (key: string, value: JsonValue) =>
      onChange({
        ...payload,
        sentenceParts: { ...sentenceParts, [key]: value },
      });

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-white p-4">
          <p className="mb-3 text-sm font-extrabold text-rose-800">
            Sentence structure
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { key: "prefix", label: "Before option A" },
              { key: "mid1", label: "Between A and B" },
              { key: "mid2", label: "Between B and C" },
              { key: "mid3", label: "Between C and D" },
              { key: "suffix", label: "After option D" },
            ].map(({ key, label }) => (
              <PayloadField
                key={key}
                label={label}
                value={partText(key)}
                onChange={(value) => setPart(key, value)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-extrabold text-rose-800">
            Answer choices
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((letter) => {
              const optionKey = `option${letter}`;
              const option = readObject(sentenceParts[optionKey]);
              const isError = option.isError === true;
              return (
                <div
                  key={letter}
                  className={`rounded-xl border p-4 ${
                    isError
                      ? "border-rose-300 bg-rose-100/70"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-sm font-black text-white">
                      {letter}
                    </span>
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={isError}
                        onChange={(event) =>
                          setPart(optionKey, {
                            ...option,
                            key: letter,
                            text: readText(option.text),
                            isError: event.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-rose-600"
                      />
                      This is the error
                    </label>
                  </div>
                  <div className="space-y-3">
                    <PayloadField
                      label="Text"
                      value={readText(option.text)}
                      onChange={(value) =>
                        setPart(optionKey, {
                          ...option,
                          key: letter,
                          text: value,
                          isError,
                        })
                      }
                    />
                    {isError && (
                      <PayloadField
                        label="Correct form"
                        value={readText(option.correctForm)}
                        onChange={(value) =>
                          setPart(optionKey, {
                            ...option,
                            key: letter,
                            text: readText(option.text),
                            isError: true,
                            correctForm: value,
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {renderExplanation()}
      </div>
    );
  }

  if (gameType === "speed") {
    const options = readStringList(payload.options);
    const setOption = (index: number, value: string) =>
      setField(
        "options",
        options.map((option, optionIndex) =>
          optionIndex === index ? value : option,
        ),
      );
    return (
      <div className="space-y-4">
        <PayloadField
          label="Question"
          value={readText(payload.question)}
          onChange={(value) => setField("question", value)}
          multiline
        />
        <div className="rounded-xl border border-amber-200 bg-white p-4">
          <p className="mb-3 text-sm font-extrabold text-amber-800">
            Answer options
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option, index) => (
              <div key={index} className="flex min-w-0 items-end gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-black text-amber-800">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="min-w-0 flex-1">
                  <PayloadField
                    label={`Option ${String.fromCharCode(65 + index)}`}
                    value={option}
                    onChange={(value) => setOption(index, value)}
                  />
                </div>
                <button
                  type="button"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() => {
                    const nextOptions = options.filter(
                      (_, optionIndex) => optionIndex !== index,
                    );
                    onChange({
                      ...payload,
                      options: nextOptions,
                      ...(readText(payload.correctAnswer) === option
                        ? { correctAnswer: "" }
                        : {}),
                    });
                  }}
                  className="mb-0.5 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setField("options", [...options, ""])}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            <Plus size={14} />
            Add option
          </button>
        </div>
        <FieldLabel label="Correct answer">
          <select
            value={readText(payload.correctAnswer)}
            onChange={(event) => setField("correctAnswer", event.target.value)}
            className={fieldClass}
          >
            <option value="">Select the correct option</option>
            {options.map((option, index) => (
              <option key={index} value={option} disabled={!option}>
                {String.fromCharCode(65 + index)}
                {option ? ` · ${option}` : " · Empty option"}
              </option>
            ))}
          </select>
        </FieldLabel>
        {renderExplanation()}
      </div>
    );
  }

  if (gameType === "transformer") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <PayloadField
            label="Original sentence"
            value={readText(payload.originalSentence)}
            onChange={(value) => setField("originalSentence", value)}
            multiline
          />
          <PayloadField
            label="Transformation prompt"
            value={readText(payload.targetPrompt)}
            onChange={(value) => setField("targetPrompt", value)}
            multiline
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <StringListField
            label="Correct sentence blocks"
            values={readStringList(payload.correctBlocks)}
            onChange={(value) => setField("correctBlocks", value)}
          />
          <StringListField
            label="Distractor blocks"
            values={readStringList(payload.distractorBlocks)}
            onChange={(value) => setField("distractorBlocks", value)}
          />
        </div>
        {renderExplanation()}
      </div>
    );
  }

  const options = Array.isArray(payload.options)
    ? payload.options.map(readObject)
    : [];
  const setContextOption = (index: number, patch: JsonObject) =>
    setField(
      "options",
      options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <PayloadField
          label="Speaker A"
          value={readText(payload.speakerA)}
          onChange={(value) => setField("speakerA", value)}
          multiline
        />
        <PayloadField
          label="Context / sentence with blank"
          value={readText(payload.speakerBContext)}
          onChange={(value) => setField("speakerBContext", value)}
          multiline
        />
      </div>
      <div className="rounded-xl border border-emerald-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold text-emerald-800">
            Response options
          </p>
          <button
            type="button"
            onClick={() =>
              setField("options", [
                ...options,
                {
                  id: `option-${options.length + 1}`,
                  text: "",
                  isCorrect: false,
                  nuanceExplanation: "",
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            <Plus size={14} />
            Add option
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {options.map((option, index) => (
            <div
              key={index}
              className={`rounded-xl border p-3 ${
                option.isCorrect === true
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-500">
                  Option {String.fromCharCode(65 + index)}
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-emerald-800">
                  <input
                    type="radio"
                    name="context-correct-answer"
                    checked={option.isCorrect === true}
                    onChange={() =>
                      setField(
                        "options",
                        options.map((item, itemIndex) => ({
                          ...item,
                          id:
                            typeof item.id === "string"
                              ? item.id
                              : `option-${itemIndex + 1}`,
                          isCorrect: itemIndex === index,
                        })),
                      )
                    }
                    className="h-4 w-4 accent-emerald-600"
                  />
                  Correct answer
                </label>
                <button
                  type="button"
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() =>
                    setField(
                      "options",
                      options.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="space-y-3">
                <PayloadField
                  label="Answer text"
                  value={readText(option.text)}
                  onChange={(value) =>
                    setContextOption(index, {
                      text: value,
                      id:
                        typeof option.id === "string"
                          ? option.id
                          : `option-${index + 1}`,
                      isCorrect: option.isCorrect === true,
                    })
                  }
                />
                <PayloadField
                  label="Why this answer fits"
                  value={readText(option.nuanceExplanation)}
                  onChange={(value) =>
                    setContextOption(index, {
                      nuanceExplanation: value,
                      id:
                        typeof option.id === "string"
                          ? option.id
                          : `option-${index + 1}`,
                      isCorrect: option.isCorrect === true,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {renderExplanation()}
    </div>
  );
}

function StageSection({
  stage,
  stageNumber,
  onChange,
  onDelete,
}: {
  stage: StageDraft;
  stageNumber: number;
  onChange: (updater: (stage: StageDraft) => StageDraft) => void;
  onDelete: () => void;
}) {
  const addQuestion = () =>
    onChange((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          questionType: current.gameType,
          payload: createEmptyQuestionPayload(current.gameType),
          orderIndex: current.questions.length,
        },
      ],
    }));

  return (
    <section>
      <SectionHeader
        eyebrow={`Campaign · Stage ${stageNumber}`}
        title={stage.title || "Untitled stage"}
        description="Configure the mini-game and build each question using structured fields."
      />

      <div
        className={`mb-5 rounded-2xl border p-5 shadow-sm sm:p-6 ${GAME_TYPE_STYLES[stage.gameType].card}`}
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px_120px]">
          <FieldLabel label="Stage title" hint="Required">
            <input
              value={stage.title}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Find the grammar pattern"
              className={fieldClass}
            />
          </FieldLabel>
          <FieldLabel label="Game type">
            <select
              value={stage.gameType}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  gameType: event.target.value as GameType,
                  questions: current.questions.map((question) => ({
                    ...question,
                    questionType: event.target.value as GameType,
                    payload: createEmptyQuestionPayload(
                      event.target.value as GameType,
                    ),
                  })),
                }))
              }
              className={fieldClass}
            >
              {GAME_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Order">
            <input
              type="number"
              min={0}
              value={stage.orderIndex}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  orderIndex: Math.max(0, Number(event.target.value) || 0),
                }))
              }
              className={fieldClass}
            />
          </FieldLabel>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900">Question bank</h3>
          <p className="mt-1 text-xs text-slate-500">
            {stage.questions.length}{" "}
            {stage.questions.length === 1 ? "question" : "questions"}
          </p>
        </div>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
        >
          <Plus size={16} />
          Add question
        </button>
      </div>

      {stage.questions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-5 py-12 text-center">
          <Gamepad2 className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="font-bold text-slate-700">This stage is ready for questions</p>
          <p className="mt-1 text-sm text-slate-400">
            Add a question, then build its prompt and answer data below.
          </p>
          <button
            type="button"
            onClick={addQuestion}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            <Plus size={16} />
            Add first question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {stage.questions.map((question, questionIndex) => (
            <article
              key={questionIndex}
              className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${GAME_TYPE_STYLES[stage.gameType].card}`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Question {questionIndex + 1}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${GAME_TYPE_STYLES[stage.gameType].badge}`}
                    >
                      {stage.gameType}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      questions: current.questions
                        .filter((_, index) => index !== questionIndex)
                        .map((item, index) => ({ ...item, orderIndex: index })),
                    }))
                  }
                  aria-label={`Delete question ${questionIndex + 1}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>

              <div className="mb-4 max-w-40">
                <FieldLabel label="Order">
                  <input
                    type="number"
                    min={0}
                    value={question.orderIndex}
                    onChange={(event) =>
                      onChange((current) => ({
                        ...current,
                        questions: current.questions.map((item, index) =>
                          index === questionIndex
                            ? {
                                ...item,
                                orderIndex: Math.max(
                                  0,
                                  Number(event.target.value) || 0,
                                ),
                              }
                            : item,
                        ),
                      }))
                    }
                    className={fieldClass}
                  />
                </FieldLabel>
              </div>

              <QuestionPayloadEditor
                gameType={stage.gameType}
                payload={question.payload}
                onChange={(payload) => {
                  onChange((current) => ({
                    ...current,
                    questions: current.questions.map((item, index) =>
                      index === questionIndex
                        ? {
                            ...item,
                            questionType: stage.gameType,
                            payload,
                          }
                        : item,
                    ),
                  }));
                }}
              />
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
        >
          <Trash2 size={16} />
          Delete stage
        </button>
      </div>
    </section>
  );
}

function ImportDialog({
  value,
  error,
  onChange,
  onImport,
  onStartBlank,
  onClose,
}: {
  value: string;
  error: string;
  onChange: (value: string) => void;
  onImport: () => void;
  onStartBlank: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FileJson2 size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                Optional · one-time setup
              </p>
              <h2
                id="import-dialog-title"
                className="mt-1 text-lg font-black text-slate-900"
              >
                Start with existing lesson JSON?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Paste once to fill the form, or skip and create a lesson from
                scratch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <FieldLabel label="Sub-topic JSON">
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={11}
              spellCheck={false}
              placeholder={`{\n  "title": "Past Simple: Regular Verbs",\n  "description": "Practice regular past-tense verbs.",\n  "theoryContent": {\n    "formulas": [],\n    "usageSignals": [],\n    "examples": [],\n    "traps": []\n  },\n  "stages": []\n}`}
              className={`${fieldClass} resize-y font-mono text-xs leading-5`}
            />
          </FieldLabel>
          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onStartBlank}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
            >
              Create from scratch / Skip
            </button>
            <button
              type="button"
              onClick={onImport}
              disabled={!value.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={16} />
              Parse and open editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
