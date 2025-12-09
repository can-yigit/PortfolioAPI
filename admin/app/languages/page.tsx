"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Code2, X } from "lucide-react";
import { getLanguages, createLanguage, updateLanguage, deleteLanguage, Language } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import Image from "next/image";

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchLanguages() {
    try {
      const data = await getLanguages();
      setLanguages(data || []);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLanguages();
  }, []);

  const openCreateModal = () => {
    setEditingLanguage(null);
    setFormData({ name: "" });
    setIconFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (language: Language) => {
    setEditingLanguage(language);
    setFormData({ name: language.name });
    setIconFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", formData.name);
    if (iconFile) {
      data.append("icon_file", iconFile);
    }

    try {
      if (editingLanguage) {
        await updateLanguage(editingLanguage.id, data);
      } else {
        await createLanguage(data);
      }
      setIsModalOpen(false);
      fetchLanguages();
    } catch (error) {
      console.error("Failed to save language:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (language: Language) => {
    if (!confirm(`Sprache "${language.name}" wirklich löschen?`)) return;
    try {
      await deleteLanguage(language.id);
      fetchLanguages();
    } catch (error) {
      console.error("Failed to delete language:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black">Languages</h1>
          <p className="text-[15px] text-black/40 mt-1">
            {languages.length} Sprache{languages.length !== 1 ? "n" : ""} insgesamt
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neue Sprache
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-black/[0.04] animate-pulse mb-3" />
                <div className="h-4 bg-black/[0.04] rounded-lg w-16 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : languages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4">
            <Code2 className="w-8 h-8 text-black/20" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-black/40 mb-6">Keine Sprachen vorhanden</p>
          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Sprache erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {languages.map((language) => (
            <div 
              key={language.id} 
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all relative"
            >
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(language)}
                  className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-3 h-3 text-black/50" />
                </button>
                <button
                  onClick={() => handleDelete(language)}
                  className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-black/50" />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/[0.04] mb-3">
                  {language.icon ? (
                    <Image
                      src={language.icon}
                      alt={language.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-black/20" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <p className="text-[14px] font-medium text-black text-center truncate w-full">
                  {language.name}
                </p>
                <span className="mt-2 px-2 py-0.5 rounded-md bg-black/[0.04] text-[9px] font-mono text-black/40">{language.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/25 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-black/50" />
              </button>
              
              <h2 className="text-[20px] font-semibold text-black mb-6">
                {editingLanguage ? "Sprache bearbeiten" : "Neue Sprache"}
              </h2>

              {editingLanguage && (
                <div className="mb-6 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <span className="text-[11px] text-black/40 font-medium uppercase tracking-wide">ID</span>
                  <p className="text-[13px] font-mono text-black/60 mt-1">{editingLanguage.id}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-black/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="JavaScript"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:ring-0 transition-colors"
                  />
                </div>
                <ImageUpload
                  currentImage={editingLanguage?.icon}
                  onFileSelect={setIconFile}
                  label="Icon"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-5 py-3 text-[14px] font-medium text-black/60 bg-black/[0.04] rounded-xl hover:bg-black/[0.08] transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-5 py-3 text-[14px] font-medium text-white bg-black rounded-xl hover:bg-black/80 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Speichern..." : editingLanguage ? "Aktualisieren" : "Erstellen"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
