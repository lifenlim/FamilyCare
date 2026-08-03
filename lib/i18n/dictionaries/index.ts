import type { Locale } from "../config";
import type { Dictionary } from "../dictionary";
import en from "./en";
import zh from "./zh";
import ms from "./ms";

export const dictionaries: Record<Locale, Dictionary> = { en, zh, ms };
