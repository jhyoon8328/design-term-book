import * as React from "react"

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 flex-none z-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 items-center">
        {/* 1번 스탬프 자리 (비워둠) */}
        <div className="flex justify-start"></div>
        
        {/* 7번 스탬프 자리 (가운데 텍스트) */}
        <div className="flex justify-center">
          <p className="text-sm text-gray-500 font-medium text-center">
            Hansoll Textile Design Data Guide
          </p>
        </div>
        
        {/* 8번 스탬프 자리 (우측 로고) */}
        <div className="flex justify-end">
          <img src="/HS_logo.jpg" alt="Hansoll Textile Logo" className="h-8 w-auto object-contain" />
        </div>
      </div>
    </footer>
  )
}
