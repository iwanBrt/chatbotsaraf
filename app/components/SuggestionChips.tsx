"use client";

import React from "react";

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const DEFAULT_SUGGESTIONS = [
  { label: "Mekanisme berpikir" },
  { label: "Fungsi sel saraf" },
  { label: "Proses memori dan tidur" },
  { label: "Kecepatan impuls saraf" },
  { label: "Reseptor sensorik" },
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  onSelect,
  disabled,
}) => {
  return (
    <div className="w-full mt-2">
      <div className="flex items-center gap-1.5 mb-2 px-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <span>Saran Topik</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {DEFAULT_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            suppressHydrationWarning
            disabled={disabled}
            onClick={() => onSelect(item.label)}
            className="flex-shrink-0 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
