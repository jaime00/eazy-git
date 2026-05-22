import { getConfig } from "../config/index.js";
import es from "./es.js";
import en from "./en.js";

const locales = { es, en };

export function t(key, ...args) {
  const config = getConfig();
  const lang = config.language || "es";
  const locale = locales[lang] || locales.es;
  const value = locale[key];
  if (typeof value === "function") return value(...args);
  return value || key;
}

export function getCommitTypes() {
  const config = getConfig();
  const lang = config.language || "es";
  const locale = locales[lang] || locales.es;
  return locale.commitTypes;
}

export function getAvailableLanguages() {
  return [
    { value: "es", label: "Espanol" },
    { value: "en", label: "English" },
  ];
}
