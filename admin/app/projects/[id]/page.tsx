"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, FolderKanban, ExternalLink } from "lucide-react";
import { getProject, getUsers, getLanguages, updateProject, deleteProject, Project, User, Language } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import AuthorSelect from "@/components/AuthorSelect";
import LanguageSelect from "@/components/LanguageSelect";
import Image from "next/image";
import Link from "next/link";

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    created_at: "",
    language_ids: [] as string[],
    author_ids: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectData, usersData, languagesData] = await Promise.all([
          getProject(projectId),
          getUsers(),
          getLanguages()
        ]);
        setProject(projectData);
        setUsers(usersData || []);
        setLanguages(languagesData || []);
        if (projectData) {
          setFormData({
            title: projectData.title,
            description: projectData.description,
            link: projectData.link || "",
            created_at: projectData.created_at ? projectData.created_at.split('T')[0] : "",
            language_ids: projectData.languages?.map((l) => l.id) || [],
            author_ids: projectData.authors?.map((a) => a.id) || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("link", formData.link);
    data.append("created_at", formData.created_at);
    data.append("language_ids", formData.language_ids.join(","));
    data.append("author_ids", formData.author_ids.join(","));
    if (imageFile) {
      data.append("image_file", imageFile);
    }

    try {
      await updateProject(projectId, data);
      router.push("/projects");
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Projekt "${project?.title}" wirklich löschen?`)) return;
    try {
      await deleteProject(projectId);
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const selectedAuthors = users.filter(u => formData.author_ids.includes(u.id));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-black/40 mb-4">Projekt nicht gefunden</p>
        <Link href="/projects" className="text-black underline">Zurück zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/projects"
            className="w-10 h-10 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black/60" />
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-black">Projekt bearbeiten</h1>
            <p className="text-[13px] text-black/40 font-mono mt-0.5">{projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 active:scale-[0.98] transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Löschen
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Mein Projekt"
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[16px] font-medium text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Projektbeschreibung..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Link</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Erstellungsdatum</label>
              <input
                type="date"
                value={formData.created_at}
                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black focus:outline-none focus:border-black/20 transition-colors"
              />
            </div>
          </div>

          {/* Languages */}
          <LanguageSelect
            languages={languages}
            selectedIds={formData.language_ids}
            onChange={(ids) => setFormData({ ...formData, language_ids: ids })}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Authors */}
          <AuthorSelect
            users={users}
            selectedIds={formData.author_ids}
            onChange={(ids) => setFormData({ ...formData, author_ids: ids })}
          />

          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6">
            <ImageUpload
              currentImage={project?.image}
              onFileSelect={setImageFile}
              label="Projekt Bild"
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-black/[0.06]">
              <span className="text-[13px] font-medium text-black/60">Vorschau</span>
            </div>
            <div className="relative h-44 bg-black/[0.04]">
              {(imageFile || project?.image) ? (
                <Image
                  src={imageFile ? URL.createObjectURL(imageFile) : project?.image || ""}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderKanban className="w-12 h-12 text-black/10" strokeWidth={1} />
                </div>
              )}
              {/* Authors on Preview */}
              {selectedAuthors.length > 0 && (
                <div className="absolute bottom-3 left-3 flex -space-x-2">
                  {selectedAuthors.slice(0, 3).map((author) => (
                    <div 
                      key={author.id}
                      className="w-8 h-8 rounded-full bg-white ring-2 ring-white overflow-hidden"
                    >
                      {author.avatar ? (
                        <Image src={author.avatar} alt={author.name} width={32} height={32} className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-black/10 flex items-center justify-center text-[10px] font-medium">
                          {author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {selectedAuthors.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-black/80 ring-2 ring-white flex items-center justify-center">
                      <span className="text-[10px] font-medium text-white">+{selectedAuthors.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-black">
                  {formData.title || "Titel eingeben..."}
                </p>
                {formData.link && (
                  <ExternalLink className="w-4 h-4 text-black/30" />
                )}
              </div>
              <p className="text-[13px] text-black/50 mt-2 line-clamp-3">
                {formData.description || "Beschreibung eingeben..."}
              </p>
              {formData.language_ids.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/[0.04]">
                  {languages.filter(l => formData.language_ids.includes(l.id)).map(lang => (
                    <span key={lang.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.04] text-[11px] font-medium text-black/50">
                      {lang.icon && (
                        <Image src={lang.icon} alt={lang.name} width={12} height={12} className="opacity-60" unoptimized />
                      )}
                      {lang.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
