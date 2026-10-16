import { useCallback, useState } from "react";
import { speakingApi } from "../api/speakingApi";
import type {
  CollocationItem,
  EvaluationResponse,
  IdeaHintsRequest,
  IdeaHintsResponse,
} from "../types/speaking.types";

export function useSpeakingWorkspace(question: string, targetBand: string) {
  const [transcript, setTranscript] = useState<Array<{ sender: "ai" | "user"; text: string }>>([]);
  const [hints, setHints] = useState<IdeaHintsResponse | null>(null);
  const [collocations, setCollocations] = useState<CollocationItem[]>([]);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [responseReadyForEvaluation, setResponseReadyForEvaluation] = useState(false);
  const [loading, setLoading] = useState({
    chat: false,
    hints: false,
    collocations: false,
    evaluation: false,
  });

  const submitResponse = useCallback(async (userResponse: string) => {
    const trimmedResponse = userResponse.trim();
    if (!trimmedResponse) return null;

    setLoading((current) => ({ ...current, chat: true }));
    setResponseReadyForEvaluation(false);
    const nextTranscript = [...transcript, { sender: "user" as const, text: trimmedResponse }];
    setTranscript(nextTranscript);

    try {
      const result = await speakingApi.chatStep({
        question,
        targetBand,
        history: transcript.map(({ sender, text }) => ({
          role: sender,
          content: text,
        })),
        userResponse: trimmedResponse,
      });

      const followUpQuestion = result.followUpQuestion;
      if (result.needsFollowUp && followUpQuestion) {
        setTranscript((current) => [
          ...current,
          { sender: "ai", text: followUpQuestion },
        ]);
      } else {
        setResponseReadyForEvaluation(true);
      }
      return result;
    } finally {
      setLoading((current) => ({ ...current, chat: false }));
    }
  }, [question, targetBand, transcript]);

  const fetchIdeaHintsContextual = useCallback(async (
    contextualQuestion: string,
    history: IdeaHintsRequest["history"],
  ) => {
    setLoading((current) => ({ ...current, hints: true }));
    try {
      const result = await speakingApi.getIdeaHints({
        question: contextualQuestion,
        history,
      });
      setHints(result);
      return result;
    } finally {
      setLoading((current) => ({ ...current, hints: false }));
    }
  }, []);

  const loadCollocations = useCallback(async (vietnamesePhrase: string) => {
    setLoading((current) => ({ ...current, collocations: true }));
    try {
      const result = await speakingApi.getCollocations({
        vietnamesePhrase,
        currentQuestion: question,
        targetBand,
      });
      setCollocations(result);
      return result;
    } finally {
      setLoading((current) => ({ ...current, collocations: false }));
    }
  }, [question, targetBand]);

  const evaluate = useCallback(async () => {
    setLoading((current) => ({ ...current, evaluation: true }));
    try {
      const result = await speakingApi.evaluate({
        question,
        targetBand,
        fullTranscript: transcript.map(({ text }) => text).join(" "),
      });
      setEvaluationResult(result);
      setIsEvaluationOpen(true);
      return result;
    } finally {
      setLoading((current) => ({ ...current, evaluation: false }));
    }
  }, [question, targetBand, transcript]);

  const evaluateAudio = useCallback(async (audioBlob: Blob) => {
    setLoading((current) => ({ ...current, evaluation: true }));
    try {
      const result = await speakingApi.evaluate({
        question,
        targetBand,
        fullTranscript: transcript.map(({ text }) => text).join(" "),
        audioBlob,
      });
      setEvaluationResult({ ...result, userAudioUrl: URL.createObjectURL(audioBlob) });
      setIsEvaluationOpen(true);
      return result;
    } finally {
      setLoading((current) => ({ ...current, evaluation: false }));
    }
  }, [question, targetBand, transcript]);

  return {
    transcript,
    hints,
    collocations,
    evaluationResult,
    responseReadyForEvaluation,
    isEvaluating: loading.evaluation,
    isEvaluationOpen,
    closeEvaluation: () => setIsEvaluationOpen(false),
    loading,
    submitResponse,
    fetchIdeaHintsContextual,
    loadCollocations,
    evaluate,
    evaluateAudio,
  };
}

export const useSpeakingPractice = useSpeakingWorkspace;
