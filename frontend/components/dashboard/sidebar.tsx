"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  BarChart3,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Student records", href: "/students", icon: Users },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Attendance", href: "/attendance", icon: ClipboardList },
  { name: "Academic progress", href: "/grades", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-sidebar text-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e4b66c] text-[#17352d]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[15px] font-semibold tracking-wide text-white">Student Desk</span>
            <span className="block text-xs text-white/55">STUDENT MANAGEMENT</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
            Workspace
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#e4b66c]"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4b66c] text-sm font-semibold text-[#17352d]">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">Student Admin</p>
              <p className="truncate text-xs text-white/55">Records workspace</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
