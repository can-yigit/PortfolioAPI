"use client";

import { Tag, Check } from "lucide-react";
import { Category } from "@/lib/api";

interface CategorySelectProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export default function CategorySelect({ categories, selectedIds, onChange, label = "Kategorien" }: CategorySelectProps) {
  const toggleCategory = (categoryId: string) => {
    onChange(
      selectedIds.includes(categoryId)
        ? selectedIds.filter((id) => id !== categoryId)
        : [...selectedIds, categoryId]
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

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                isSelected 
                  ? "border-black bg-black text-white" 
                  : "border-transparent bg-black/[0.03] text-black/70 hover:bg-black/[0.06]"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span className="text-[13px] font-medium">{category.name}</span>
              {isSelected && <Check className="w-4 h-4 ml-1" />}
            </button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <p className="text-[13px] text-black/30 text-center py-4">
          Keine Kategorien vorhanden
        </p>
      )}
    </div>
  );
}
