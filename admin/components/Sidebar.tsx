"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Code2, 
  FolderKanban,
  Tag,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Blogs", href: "/blogs", icon: FileText },
  { name: "Languages", href: "/languages", icon: Code2 },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Projects", href: "/projects", icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-black/5 flex flex-col z-50">
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-semibold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-black">Portfolio</h1>
            <p className="text-[11px] text-black/40 font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      <div className="px-4 pb-2">
        <div className="h-px bg-black/5" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-black text-white shadow-md"
                  : "text-black/60 hover:text-black hover:bg-black/5"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-2">
        <div className="h-px bg-black/5" />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
          </span>
          <span className="text-[11px] font-medium text-black/40">API Verbunden</span>
        </div>
      </div>
    </aside>
  );
}
