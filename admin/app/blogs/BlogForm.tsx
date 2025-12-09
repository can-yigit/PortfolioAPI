'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Blog, User, createBlog, updateBlog } from '@/lib/api'
import { ArrowLeft, Upload, X, Check } from 'lucide-react'
import Link from 'next/link'

interface BlogFormProps {
  blog?: Blog
  users: User[]
}

export default function BlogForm({ blog, users }: BlogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(blog?.title || '')
  const [slug, setSlug] = useState(blog?.slug || '')
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '')
  const [content, setContent] = useState(blog?.content || '')
  const [category, setCategory] = useState(blog?.categories?.[0]?.name || '')
  const [pinned, setPinned] = useState(blog?.pinned || false)
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    blog?.authors?.map((a) => a.id) || []
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(blog?.image || '')

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[c] || c)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!blog) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const toggleAuthor = (id: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('slug', slug)
      formData.append('excerpt', excerpt)
      formData.append('content', content)
      formData.append('category', category)
      formData.append('pinned', pinned ? 'true' : 'false')
      formData.append('author_ids', selectedAuthors.join(','))

      if (imageFile) {
        formData.append('image_file', imageFile)
      }

      if (blog) {
        await updateBlog(blog.id, formData)
      } else {
        await createBlog(formData)
      }

      router.push('/blogs')
      router.refresh()
    } catch (e: any) {
      setError(e.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/blogs"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-apple-gray-100 hover:bg-apple-gray-200 transition-apple"
        >
          <ArrowLeft className="w-5 h-5 text-apple-gray-600" />
        </Link>
        <div className="flex-1" />
        <button
          type="submit"
          disabled={loading || !title || !slug || selectedAuthors.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Speichern...' : blog ? 'Aktualisieren' : 'Erstellen'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-apple p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Blog Titel"
                  className="input-apple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="blog-slug"
                  className="input-apple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Kurze Beschreibung"
                  rows={3}
                  className="textarea-apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Inhalt (Markdown)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Blog Inhalt&#10;&#10;Schreibe hier deinen Blog..."
                  rows={15}
                  className="textarea-apple font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          <div className="card-apple p-6">
            <label className="block text-sm font-medium text-apple-gray-700 mb-3">
              Bild
            </label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-apple"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 bg-apple-gray-100 rounded-xl cursor-pointer hover:bg-apple-gray-200 transition-apple">
                  <Upload className="w-8 h-8 text-apple-gray-400 mb-2" />
                  <span className="text-sm text-apple-gray-500">Bild hochladen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Category & Pinned */}
          <div className="card-apple p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Kategorie
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="z.B. Tech, Design"
                  className="input-apple"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-12 h-7 rounded-full transition-apple relative ${
                    pinned ? 'bg-apple-gray-900' : 'bg-apple-gray-300'
                  }`}
                  onClick={() => setPinned(!pinned)}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-apple ${
                      pinned ? 'left-6' : 'left-1'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-apple-gray-700">Pinned</span>
              </label>
            </div>
          </div>

          {/* Authors */}
          <div className="card-apple p-6">
            <label className="block text-sm font-medium text-apple-gray-700 mb-3">
              Autoren *
            </label>
            {users.length === 0 ? (
              <p className="text-sm text-apple-gray-500">
                Keine User vorhanden.{' '}
                <Link href="/users/new" className="text-apple-gray-900 underline">
                  User erstellen
                </Link>
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-apple ${
                      selectedAuthors.includes(user.id)
                        ? 'bg-apple-gray-900 text-white'
                        : 'bg-apple-gray-100 hover:bg-apple-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAuthors.includes(user.id)}
                      onChange={() => toggleAuthor(user.id)}
                      className="hidden"
                    />
                    <div className="w-8 h-8 rounded-full bg-apple-gray-200 overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-apple-gray-500">
                          {user.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">
                      {user.name}
                    </span>
                    {selectedAuthors.includes(user.id) && (
                      <Check className="w-4 h-4" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
