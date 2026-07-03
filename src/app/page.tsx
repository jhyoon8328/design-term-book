"use client";

import * as React from "react"
import { Tabs } from "@/components/ui/Tabs"
import { ViewTab } from "@/components/features/ViewTab"
import { AdminTab } from "@/components/features/AdminTab"

const TABS = [
  { id: "view", label: "조회 (View)" },
  { id: "admin", label: "관리 (Admin)" },
]

export default function Home() {
  const [activeTab, setActiveTab] = React.useState("view")

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-1 flex flex-col overflow-hidden">
      <div className="flex-none mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Fashion Term Book</h1>
        <p className="mt-2 text-sm text-gray-500">
          디자인 가이드라인 및 현장 용어의 표준을 조회하고 관리할 수 있습니다.
        </p>
      </div>

      <div className="flex-none mb-4">
        <Tabs 
          tabs={TABS} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          className="bg-transparent border-gray-200"
        />
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "view" && <ViewTab />}
        {activeTab === "admin" && <AdminTab />}
      </div>
    </div>
  )
}
