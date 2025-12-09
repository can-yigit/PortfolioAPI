"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, User as UserIcon, X } from "lucide-react";
import { getUsers, createUser, updateUser, User } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
import Image from "next/image";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "" });
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email });
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
      } else {
        await createUser(data);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold tracking-tight text-black">Users</h1>
          <p className="text-[15px] text-black/40 mt-1">
            {users.length} User insgesamt
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Neuer User
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-5 flex items-center gap-4 border-b border-black/[0.04] last:border-0">
              <div className="w-12 h-12 rounded-full bg-black/[0.04] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-black/[0.04] rounded-lg w-32 animate-pulse" />
                <div className="h-3 bg-black/[0.04] rounded-lg w-48 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-16 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-black/[0.04] flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-black/20" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] text-black/40 mb-6">Keine User vorhanden</p>
          <button 
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium rounded-full hover:bg-black/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            User erstellen
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="p-5 flex items-center gap-4 border-b border-black/[0.04] last:border-0 hover:bg-black/[0.015] transition-colors group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/[0.04] flex-shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-black/30" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-[15px] font-medium text-black">{user.name}</p>
                  <span className="px-2 py-0.5 rounded-md bg-black/[0.04] text-[10px] font-mono text-black/40">{user.id}</span>
                </div>
                <p className="text-[13px] text-black/40 truncate mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={() => openEditModal(user)}
                className="w-9 h-9 rounded-full hover:bg-black/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <Pencil className="w-4 h-4 text-black/40" />
              </button>
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
                {editingUser ? "User bearbeiten" : "Neuer User"}
              </h2>
              
              {editingUser && (
                <div className="mb-6 p-3 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                  <span className="text-[11px] text-black/40 font-medium uppercase tracking-wide">ID</span>
                  <p className="text-[13px] font-mono text-black/60 mt-1">{editingUser.id}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-black/60 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Max Mustermann"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:ring-0 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[15px] text-black placeholder:text-black/30 focus:outline-none focus:border-black/20 focus:ring-0 transition-colors"
                  />
                </div>
                <ImageUpload
                  currentImage={editingUser?.avatar}
                  onFileSelect={setAvatarFile}
                  label="Avatar"
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
                    {saving ? "Speichern..." : editingUser ? "Aktualisieren" : "Erstellen"}
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
