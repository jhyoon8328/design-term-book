import * as React from "react"
import { Database } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
            <Database className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Design Data Guide</span>
        </div>
        <nav className="flex items-center gap-4">
          {/* Add nav items here if needed */}
        </nav>
      </div>
    </header>
  )
}
