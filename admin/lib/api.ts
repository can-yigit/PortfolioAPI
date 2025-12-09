const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  pinned: boolean;
  authors: User[];
  categories: Category[];
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  languages: Language[];
  authors: User[];
  created_at: string;
  updated_at: string;
}

// Users
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, { cache: "no-store" });
  return res.json();
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createUser(data: FormData): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function updateUser(id: string, data: FormData): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    body: data,
  });
  return res.json();
}

// Blogs
export async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${API_URL}/blogs`, { cache: "no-store" });
  return res.json();
}

export async function getBlog(id: string | number): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createBlog(data: FormData): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function updateBlog(id: string | number, data: FormData): Promise<Blog> {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: "PUT",
    body: data,
  });
  return res.json();
}

export async function deleteBlog(id: string | number): Promise<void> {
  await fetch(`${API_URL}/blogs/${id}`, {
    method: "DELETE",
  });
}

// Languages
export async function getLanguages(): Promise<Language[]> {
  const res = await fetch(`${API_URL}/languages`, { cache: "no-store" });
  return res.json();
}

export async function getLanguage(id: string): Promise<Language> {
  const res = await fetch(`${API_URL}/languages/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createLanguage(data: FormData): Promise<Language> {
  const res = await fetch(`${API_URL}/languages`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function updateLanguage(id: string, data: FormData): Promise<Language> {
  const res = await fetch(`${API_URL}/languages/${id}`, {
    method: "PUT",
    body: data,
  });
  return res.json();
}

export async function deleteLanguage(id: string): Promise<void> {
  await fetch(`${API_URL}/languages/${id}`, {
    method: "DELETE",
  });
}

// Projects
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, { cache: "no-store" });
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createProject(data: FormData): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function updateProject(id: string, data: FormData): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    body: data,
  });
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
  });
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
  return res.json();
}

export async function getCategory(id: string): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, { cache: "no-store" });
  return res.json();
}

export async function createCategory(data: FormData): Promise<Category> {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function updateCategory(id: string, data: FormData): Promise<Category> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    body: data,
  });
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });
}

