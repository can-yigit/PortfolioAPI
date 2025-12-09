"use client";

import { User as UserIcon, Check } from "lucide-react";
import { User } from "@/lib/api";
import Image from "next/image";

interface AuthorSelectProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export default function AuthorSelect({ users, selectedIds, onChange, label = "Autoren" }: AuthorSelectProps) {
  const toggleAuthor = (userId: string) => {
    onChange(
      selectedIds.includes(userId)
        ? selectedIds.filter((id) => id !== userId)
        : [...selectedIds, userId]
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
        {users.map((user) => {
          const isSelected = selectedIds.includes(user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleAuthor(user.id)}
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
              <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 transition-all ${
                isSelected ? "ring-black" : "ring-transparent"
              }`}>
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-black/[0.06] flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-black/30" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-black">{user.name}</p>
                <p className="text-[11px] text-black/40 truncate max-w-[120px]">{user.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
