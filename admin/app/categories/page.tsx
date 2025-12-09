"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag, X } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", formData.name);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Kategorie "${category.name}" wirklich löschen?`)) return;
    try {
      await deleteCategory(category.id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black">Categories</h1>
          <p className="text-[15px] text-black/40 mt-1">
            {categories.length} Kategorie{categories.length !== 1 ? "n" : ""} insgesamt
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neue Kategorie
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm divide-y divide-black/[0.06]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] animate-pulse" />
              <div className="flex-1 h-5 bg-black/[0.04] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-black/20" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-black/40 mb-6">Keine Kategorien vorhanden</p>
          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Kategorie erstellen
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm divide-y divide-black/[0.06]">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="px-5 py-4 flex items-center gap-4 hover:bg-black/[0.01] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center">
                <Tag className="w-5 h-5 text-black/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-black">{category.name}</p>
                <span className="text-[11px] font-mono text-black/30">{category.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="w-9 h-9 rounded-xl bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-4 h-4 text-black/50" />
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="w-9 h-9 rounded-xl bg-black/[0.04] hover:bg-red-500/10 flex items-center justify-center transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-black/50 group-hover:text-red-500" />
                </button>
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
                {editingCategory ? "Kategorie bearbeiten" : "Neue Kategorie"}
              </h2>

              {editingCategory && (
                <div className="mb-6 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <span className="text-[11px] text-black/40 font-medium uppercase tracking-wide">ID</span>
                  <p className="text-[13px] font-mono text-black/60 mt-1">{editingCategory.id}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-black/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Web Development"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:ring-0 transition-colors"
                  />
                </div>
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
                    {saving ? "Speichern..." : editingCategory ? "Aktualisieren" : "Erstellen"}
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
