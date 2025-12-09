"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, Edit3, User as UserIcon, ImageIcon, Hash, Bold, Italic, List, Code, Quote, Link2 } from "lucide-react";
import { getUsers, getCategories, createBlog, User, Category } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import AuthorSelect from "@/components/AuthorSelect";
import CategorySelect from "@/components/CategorySelect";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function NewBlogPage() {
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    pinned: false,
    author_ids: [] as string[],
    category_ids: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersData, categoriesData] = await Promise.all([
          getUsers(),
          getCategories()
        ]);
        setUsers(usersData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("slug", formData.slug);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("pinned", formData.pinned ? "true" : "false");
    data.append("author_ids", formData.author_ids.join(","));
    data.append("category_ids", formData.category_ids.join(","));
    if (imageFile) {
      data.append("image_file", imageFile);
    }

    try {
      await createBlog(data);
      router.push("/blogs");
    } catch (error) {
      console.error("Failed to create blog:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöü]/g, (char) => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[char] || char)
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) || prev.slug === "" ? generateSlug(title) : prev.slug
    }));
  };

  const insertMarkdown = (syntax: string, wrap: boolean = false) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;
    
    if (wrap && selectedText) {
      newText = text.substring(0, start) + syntax + selectedText + syntax + text.substring(end);
      newCursorPos = end + syntax.length * 2;
    } else {
      newText = text.substring(0, start) + syntax + text.substring(end);
      newCursorPos = start + syntax.length;
    }
    
    setFormData({ ...formData, content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const selectedAuthors = users.filter(u => formData.author_ids.includes(u.id));
  const selectedCategories = categories.filter(c => formData.category_ids.includes(c.id));

  const codeStyle: { [key: string]: React.CSSProperties } = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: 'rgba(0, 0, 0, 0.03)',
      borderRadius: '12px',
      padding: '1rem',
      margin: '1rem 0',
      fontSize: '13px',
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '13px',
    },
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/blogs"
            className="w-10 h-10 rounded-full bg-black/[0.04] hover:bg-black/[0.08] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-black/60" />
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-black">Neuer Blog</h1>
            <p className="text-[13px] text-black/40 mt-0.5">Erstelle einen neuen Blog-Artikel</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving || !formData.title || !formData.slug}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Erstellen..." : "Erstellen"}
        </button>
      </div>

      {/* Tab Switcher - Mobile */}
      <div className="flex gap-1 p-1 bg-black/[0.04] rounded-xl lg:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "edit" ? "bg-white shadow-sm text-black" : "text-black/50"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Bearbeiten
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
            activeTab === "preview" ? "bg-white shadow-sm text-black" : "text-black/50"
          }`}
        >
          <Eye className="w-4 h-4" />
          Vorschau
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className={`space-y-5 ${activeTab === "preview" ? "hidden lg:block" : ""}`}>
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Titel</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Mein Blog"
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[16px] font-medium text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="mein-blog"
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors font-mono text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/60 mb-2">Excerpt</label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Kurze Beschreibung des Artikels..."
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[13px] font-medium text-black/60">Content (Markdown)</label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => insertMarkdown("# ", false)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Überschrift">
                    <Hash className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("**", true)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Fett">
                    <Bold className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("*", true)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Kursiv">
                    <Italic className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("\n- ", false)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Liste">
                    <List className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("`", true)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Code">
                    <Code className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("\n> ", false)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Zitat">
                    <Quote className="w-4 h-4 text-black/40" />
                  </button>
                  <button type="button" onClick={() => insertMarkdown("[Link](url)", false)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] flex items-center justify-center transition-colors" title="Link">
                    <Link2 className="w-4 h-4 text-black/40" />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="# Überschrift&#10;&#10;Schreibe deinen Blog-Inhalt hier...&#10;&#10;**Fett** und *kursiv* funktionieren auch!"
                rows={14}
                className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[14px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 transition-colors resize-none leading-relaxed font-mono"
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/[0.02] border border-black/[0.04] cursor-pointer hover:bg-black/[0.04] transition-colors">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="w-5 h-5 rounded border-black/20 text-black focus:ring-0 focus:ring-offset-0"
              />
              <div>
                <span className="text-[14px] font-medium text-black">Angepinnt</span>
                <p className="text-[12px] text-black/40 mt-0.5">Blog wird oben in der Liste angezeigt</p>
              </div>
            </label>
          </div>

          {/* Categories */}
          <CategorySelect
            categories={categories}
            selectedIds={formData.category_ids}
            onChange={(ids) => setFormData({ ...formData, category_ids: ids })}
          />

          {/* Authors */}
          <AuthorSelect
            users={users}
            selectedIds={formData.author_ids}
            onChange={(ids) => setFormData({ ...formData, author_ids: ids })}
          />

          {/* Image Upload */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6">
            <ImageUpload onFileSelect={setImageFile} label="Titelbild" />
          </div>
        </div>

        {/* Preview */}
        <div className={`${activeTab === "edit" ? "hidden lg:block" : ""}`}>
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-black/[0.06] flex items-center gap-2">
              <Eye className="w-4 h-4 text-black/40" />
              <span className="text-[13px] font-medium text-black/60">Live Vorschau</span>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="relative h-48 bg-black/[0.04]">
                {imageFile ? (
                  <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-black/10" />
                  </div>
                )}
                {selectedCategories.length > 0 && (
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                    {selectedCategories.map(cat => (
                      <span key={cat.id} className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-medium text-black/70 shadow-sm">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <h1 className="text-[24px] font-semibold text-black leading-tight">
                  {formData.title || "Titel eingeben..."}
                </h1>

                {selectedAuthors.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {selectedAuthors.slice(0, 3).map((user) => (
                        <div key={user.id} className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
                          {user.avatar ? (
                            <Image src={user.avatar} alt={user.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-black/[0.08] flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-black/40" />
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedAuthors.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-black/[0.08] ring-2 ring-white flex items-center justify-center">
                          <span className="text-[10px] font-medium text-black/50">+{selectedAuthors.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[13px] font-medium text-black">{selectedAuthors.map(a => a.name).join(", ")}</p>
                  </div>
                )}

                {formData.excerpt && (
                  <p className="text-[15px] text-black/60 leading-relaxed border-l-2 border-black/10 pl-4 italic">
                    {formData.excerpt}
                  </p>
                )}

                <div className="pt-4 border-t border-black/[0.06]">
                  {formData.content ? (
                    <article className="prose max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match && !className;
                            return !isInline && match ? (
                              <SyntaxHighlighter style={codeStyle} language={match[1]} PreTag="div">
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>{children}</code>
                            );
                          }
                        }}
                      >
                        {formData.content}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <p className="text-[14px] text-black/30 italic">Content eingeben um Vorschau zu sehen...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
