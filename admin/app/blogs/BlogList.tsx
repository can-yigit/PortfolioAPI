'use client'

import { useState } from 'react'
import { Blog, deleteBlog } from '@/lib/api'
import { FileText, Trash2, Edit, Pin, Search, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BlogListProps {
  initialBlogs: Blog[]
}

export default function BlogList({ initialBlogs }: BlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const router = useRouter()

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.categories?.map((category) => category.name).join(', ').toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Diesen Blog wirklich löschen?')) return

    setDeleting(id)
    try {
      await deleteBlog(id)
      setBlogs(blogs.filter((b) => b.id !== id))
    } catch (e) {
      alert('Löschen fehlgeschlagen')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
        <input
          type="text"
          placeholder="Blogs durchsuchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-apple pl-12"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-apple-gray-500">
            Keine Blogs gefunden
          </div>
        ) : (
          filteredBlogs.map((blog, index) => (
            <div
              key={blog.id}
              className="card-apple overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative h-40 bg-apple-gray-100">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-apple-gray-300" />
                  </div>
                )}
                {blog.pinned && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Pin className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-apple-gray-900 truncate">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-apple-gray-500 mt-1 line-clamp-2">
                      {blog.excerpt || 'Kein Excerpt'}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center flex-wrap gap-2 mt-3">
                  {blog.categories && blog.categories.length > 0 && blog.categories.map((category) => (
                    <span 
                      key={category.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.05] text-black/60 text-[11px] font-medium"
                    >
                      <Tag className="w-3 h-3 opacity-50" />
                      {category.name}
                    </span>
                  ))}
                  <span className="text-xs text-apple-gray-400">
                    {new Date(blog.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>

                {/* Authors */}
                {blog.authors && blog.authors.length > 0 && (
                  <div className="flex items-center gap-1 mt-3">
                    {blog.authors.slice(0, 3).map((author) => (
                      <div
                        key={author.id}
                        className="w-6 h-6 rounded-full bg-apple-gray-200 overflow-hidden"
                        title={author.name}
                      >
                        {author.avatar ? (
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-apple-gray-500">
                            {author.name[0]}
                          </div>
                        )}
                      </div>
                    ))}
                    {blog.authors.length > 3 && (
                      <span className="text-xs text-apple-gray-400 ml-1">
                        +{blog.authors.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-apple-gray-100">
                  <Link
                    href={`/blogs/${blog.id}`}
                    className="flex-1 btn-secondary text-center text-sm py-2"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Bearbeiten
                  </Link>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleting === blog.id}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-full transition-apple disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
