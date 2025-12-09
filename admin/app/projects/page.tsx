"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FolderKanban, ExternalLink, User as UserIcon } from "lucide-react";
import { getProjects, deleteProject, Project } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const data = await getProjects();
      setProjects(data || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Projekt "${project.title}" wirklich löschen?`)) return;
    try {
      await deleteProject(project.id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black">Projects</h1>
          <p className="text-[15px] text-black/40 mt-1">
            {projects.length} Projekt{projects.length !== 1 ? "e" : ""} insgesamt
          </p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neues Projekt
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
              <div className="h-44 bg-black/[0.04] animate-pulse" />
              <div className="p-5 space-y-2">
                <div className="h-5 bg-black/[0.04] rounded-lg w-3/4 animate-pulse" />
                <div className="h-4 bg-black/[0.04] rounded-lg w-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-black/20" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-black/40 mb-6">Keine Projekte vorhanden</p>
          <Link 
            href="/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Projekt erstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="relative h-44 bg-black/[0.04]">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderKanban className="w-12 h-12 text-black/10" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDelete(e, project)}
                    className="w-9 h-9 rounded-full bg-white shadow-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-black/60 hover:text-red-500" />
                  </button>
                </div>
                {/* Authors Stack */}
                {project.authors && project.authors.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex -space-x-2">
                    {project.authors.slice(0, 3).map((author) => (
                      <div 
                        key={author.id}
                        className="w-8 h-8 rounded-full bg-white ring-2 ring-white overflow-hidden"
                      >
                        {author.avatar ? (
                          <Image src={author.avatar} alt={author.name} width={32} height={32} className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-black/10 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-black/40" />
                          </div>
                        )}
                      </div>
                    ))}
                    {project.authors.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-black/80 ring-2 ring-white flex items-center justify-center">
                        <span className="text-[10px] font-medium text-white">+{project.authors.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-[16px] font-semibold text-black">{project.title}</p>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4 text-black/30 hover:text-black transition-colors" />
                        </a>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-[9px] font-mono text-black/40">{project.id}</span>
                    <p className="text-[13px] text-black/50 line-clamp-2 mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>
                {/* Languages */}
                {project.languages && project.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/[0.04]">
                    {project.languages.map((lang) => (
                      <span 
                        key={lang.id} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/[0.04] text-[11px] font-medium text-black/50"
                      >
                        {lang.icon && (
                          <Image
                            src={lang.icon}
                            alt={lang.name}
                            width={12}
                            height={12}
                            className="opacity-60"
                            unoptimized
                          />
                        )}
                        {lang.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
