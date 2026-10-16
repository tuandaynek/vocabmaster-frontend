import type { SpeechRecognitionConstructor } from "../types/speechRecognition";

function isSpeechRecognitionConstructor(
  value: unknown,
): value is SpeechRecognitionConstructor {
  return typeof value === "function";
}

export function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | undefined {
  const standard: unknown = Reflect.get(window, "SpeechRecognition");
  const prefixed: unknown = Reflect.get(window, "webkitSpeechRecognition");

  if (isSpeechRecognitionConstructor(standard)) return standard;
  if (isSpeechRecognitionConstructor(prefixed)) return prefixed;
  return undefined;
}
