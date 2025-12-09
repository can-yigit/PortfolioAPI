"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Pin, User as UserIcon, Tag } from "lucide-react";
import { getBlogs, deleteBlog, Blog } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const blogsData = await getBlogs();
      setBlogs(blogsData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Blog "${blog.title}" wirklich löschen?`)) return;
    try {
      await deleteBlog(blog.id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black">Blogs</h1>
          <p className="text-[15px] text-black/40 mt-1">
            {blogs.length} Blog{blogs.length !== 1 ? "s" : ""} insgesamt
          </p>
        </div>
        <Link 
          href="/blogs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neuer Blog
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 flex gap-4 border-b border-black/[0.04] last:border-0">
              <div className="w-32 h-24 rounded-xl bg-black/[0.04] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 bg-black/[0.04] rounded-lg w-48 animate-pulse" />
                <div className="h-3 bg-black/[0.04] rounded-lg w-64 animate-pulse" />
                <div className="h-3 bg-black/[0.04] rounded-lg w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-black/20" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-black/40 mb-6">Keine Blogs vorhanden</p>
          <Link 
            href="/blogs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Blog erstellen
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="p-5 flex gap-5 border-b border-black/[0.04] last:border-0 hover:bg-black/[0.01] transition-colors group"
            >
              {/* Thumbnail */}
              <Link href={`/blogs/${blog.id}`} className="flex-shrink-0">
                <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-black/[0.04]">
                  {blog.image ? (
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-black/15" strokeWidth={1.5} />
                    </div>
                  )}
                  {blog.pinned && (
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <Pin className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0 py-0.5">
                <Link href={`/blogs/${blog.id}`} className="block group/link">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-[16px] font-semibold text-black group-hover/link:underline">
                      {blog.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-[10px] font-mono text-black/40">
                      #{blog.id}
                    </span>
                  </div>
                </Link>
                
                <p className="text-[13px] text-black/50 truncate mt-1">
                  {blog.excerpt || blog.slug}
                </p>
                
                <div className="flex items-center gap-3 mt-3">
                  {blog.categories && blog.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {blog.categories.map((cat) => (
                        <span 
                          key={cat.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.05] text-black/60 text-[11px] font-medium"
                        >
                          <Tag className="w-3 h-3 opacity-50" />
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Authors */}
                  {blog.authors && blog.authors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {blog.authors.slice(0, 3).map((author) => (
                          <div 
                            key={author.id}
                            className="relative w-6 h-6 rounded-full overflow-hidden ring-2 ring-white"
                            title={author.name}
                          >
                            {author.avatar ? (
                              <Image src={author.avatar} alt={author.name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full bg-black/[0.08] flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-black/40" />
                              </div>
                            )}
                          </div>
                        ))}
                        {blog.authors.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-black/[0.08] ring-2 ring-white flex items-center justify-center">
                            <span className="text-[9px] font-medium text-black/50">+{blog.authors.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-black/40">
                        {blog.authors.length === 1 ? blog.authors[0].name : `${blog.authors.length} Autoren`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center flex-shrink-0">
                <Link
                  href={`/blogs/${blog.id}`}
                  className="w-9 h-9 rounded-full hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-4 h-4 text-black/40" />
                </Link>
                <button
                  onClick={() => handleDelete(blog)}
                  className="w-9 h-9 rounded-full hover:bg-black/[0.06] flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-black/40" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
