"use client";

import { Check, Code } from "lucide-react";
import { Language } from "@/lib/api";
import Image from "next/image";

interface LanguageSelectProps {
  languages: Language[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export default function LanguageSelect({ languages, selectedIds, onChange, label = "Sprachen" }: LanguageSelectProps) {
  const toggleLanguage = (languageId: string) => {
    onChange(
      selectedIds.includes(languageId)
        ? selectedIds.filter((id) => id !== languageId)
        : [...selectedIds, languageId]
    );
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <label className="text-[13px] font-medium text-black/60">{label}</label>
        {selectedCount > 0 && (
          <span className="text-[12px] text-black/40">{selectedCount} ausgewählt</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {languages.map((language) => {
          const isSelected = selectedIds.includes(language.id);
          return (
            <button
              key={language.id}
              type="button"
              onClick={() => toggleLanguage(language.id)}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                isSelected 
                  ? "border-black bg-black/[0.02]" 
                  : "border-transparent bg-black/[0.02] hover:bg-black/[0.04]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className={`relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${
                isSelected ? "bg-black/[0.06]" : "bg-black/[0.04]"
              }`}>
                {language.icon ? (
                  <Image src={language.icon} alt={language.name} width={28} height={28} unoptimized />
                ) : (
                  <Code className="w-6 h-6 text-black/30" />
                )}
              </div>
              <p className="text-[13px] font-medium text-black">{language.name}</p>
            </button>
          );
        })}
      </div>

      {languages.length === 0 && (
        <p className="text-[13px] text-black/30 text-center py-4">
          Keine Sprachen vorhanden
        </p>
      )}
    </div>
  );
}

