"use client";

import { useTransition } from "react";
import { setLangAction } from "@/app/actions/i18n";
import { useLanguage } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, t } = useLanguage();
  const [pending, start] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.toggle.aria}
      className="inline-flex items-center gap-0.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5 text-xs font-medium"
    >
      {(["en", "es"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => start(() => setLangAction(l))}
            disabled={pending}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-0.5 uppercase tracking-wide transition-colors disabled:opacity-60 ${
              active
                ? "bg-indigo-600 text-white"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
