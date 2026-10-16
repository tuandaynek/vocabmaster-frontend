import {
  CEFR_LEVELS,
  COLLOCATION_TYPES,
} from "../constants";
import type {
  CEFRLevel,
  CollocationImportItem,
  CollocationType,
  DrillVariations,
} from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCollocationType(value: unknown): value is CollocationType {
  return (
    typeof value === "string" &&
    (COLLOCATION_TYPES as readonly string[]).includes(value)
  );
}

function isCefrLevel(value: unknown): value is CEFRLevel {
  return (
    typeof value === "string" &&
    (CEFR_LEVELS as readonly string[]).includes(value)
  );
}

function parseDrillVariations(value: unknown): DrillVariations | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw new Error("drill_variations phải là một object.");

  const result: DrillVariations = {};
  for (const key of [
    "change_verb",
    "change_tense_person",
    "change_adj_adv",
    "clause_expansion",
  ] as const) {
    const sentences = value[key];
    if (sentences === undefined) continue;
    if (
      !Array.isArray(sentences) ||
      !sentences.every((sentence) => typeof sentence === "string")
    ) {
      throw new Error(`drill_variations.${key} phải là một mảng chuỗi.`);
    }
    result[key] = sentences;
  }

  return result;
}

export function parseCollocationImport(value: unknown): CollocationImportItem[] {
  if (!Array.isArray(value)) {
    throw new Error("Dữ liệu JSON phải là một mảng các collocation.");
  }

  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Phần tử thứ ${index + 1} phải là một object.`);
    }

    if (
      typeof entry.phrase !== "string" ||
      !entry.phrase.trim() ||
      typeof entry.meaning !== "string" ||
      !entry.meaning.trim()
    ) {
      throw new Error(
        `Phần tử thứ ${index + 1} cần có phrase và meaning dạng chuỗi.`,
      );
    }

    if (entry.type !== undefined && !isCollocationType(entry.type)) {
      throw new Error(`type tại phần tử thứ ${index + 1} không hợp lệ.`);
    }
    if (entry.cefr_level !== undefined && !isCefrLevel(entry.cefr_level)) {
      throw new Error(`cefr_level tại phần tử thứ ${index + 1} không hợp lệ.`);
    }

    for (const field of ["id", "pattern", "topic", "base_sentence", "created_at"]) {
      if (entry[field] !== undefined && typeof entry[field] !== "string") {
        throw new Error(`${field} tại phần tử thứ ${index + 1} phải là chuỗi.`);
      }
    }
    if (
      entry.audio_url !== undefined &&
      entry.audio_url !== null &&
      typeof entry.audio_url !== "string"
    ) {
      throw new Error(`audio_url tại phần tử thứ ${index + 1} không hợp lệ.`);
    }

    return {
      ...(typeof entry.id === "string" ? { id: entry.id } : {}),
      phrase: entry.phrase.trim(),
      meaning: entry.meaning.trim(),
      ...(entry.type ? { type: entry.type } : {}),
      ...(typeof entry.pattern === "string" ? { pattern: entry.pattern } : {}),
      ...(entry.cefr_level ? { cefr_level: entry.cefr_level } : {}),
      ...(typeof entry.topic === "string" ? { topic: entry.topic } : {}),
      ...(typeof entry.base_sentence === "string"
        ? { base_sentence: entry.base_sentence }
        : {}),
      ...(entry.drill_variations !== undefined
        ? { drill_variations: parseDrillVariations(entry.drill_variations) }
        : {}),
      ...(typeof entry.audio_url === "string" || entry.audio_url === null
        ? { audio_url: entry.audio_url }
        : {}),
      ...(typeof entry.created_at === "string"
        ? { created_at: entry.created_at }
        : {}),
    };
  });
}
