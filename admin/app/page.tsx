"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Code2, FolderKanban, ArrowUpRight } from "lucide-react";
import { getUsers, getBlogs, getLanguages, getProjects } from "@/lib/api";
import Link from "next/link";

interface Stats {
  users: number;
  blogs: number;
  languages: number;
  projects: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, blogs: 0, languages: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [users, blogs, languages, projects] = await Promise.all([
          getUsers(),
          getBlogs(),
          getLanguages(),
          getProjects(),
        ]);
        setStats({
          users: users?.length || 0,
          blogs: blogs?.length || 0,
          languages: languages?.length || 0,
          projects: projects?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { name: "Users", value: stats.users, icon: Users, href: "/users", desc: "Registrierte Benutzer" },
    { name: "Blogs", value: stats.blogs, icon: FileText, href: "/blogs", desc: "Veröffentlichte Artikel" },
    { name: "Languages", value: stats.languages, icon: Code2, href: "/languages", desc: "Programmiersprachen" },
    { name: "Projects", value: stats.projects, icon: FolderKanban, href: "/projects", desc: "Portfolio Projekte" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-black">Dashboard</h1>
        <p className="text-[15px] text-black/40 mt-1">Willkommen im Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block group">
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="w-11 h-11 rounded-xl bg-black/[0.04] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <stat.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-black/20 group-hover:text-black transition-colors" />
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-9 w-16 bg-black/[0.04] rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-black/[0.04] rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-[36px] font-semibold tracking-tight text-black leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[13px] text-black/40 mt-1 font-medium">{stat.desc}</p>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-8">
        <h2 className="text-[15px] font-semibold text-black mb-6">Schnellzugriff</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link 
              key={stat.name}
              href={stat.href} 
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-black/[0.02] hover:bg-black hover:text-white transition-all group active:scale-[0.98]"
            >
              <stat.icon className="w-6 h-6 text-black/40 group-hover:text-white transition-colors" strokeWidth={1.5} />
              <span className="text-[12px] font-medium text-black/60 group-hover:text-white/80">Neu erstellen</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
