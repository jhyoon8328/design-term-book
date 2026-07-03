"use client";

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Tabs } from "@/components/ui/Tabs"
import { ExcelUploader } from "./ExcelUploader"
import { Search, Plus, Edit2, Trash2, Check, X } from "lucide-react"

type DataGuide = Database['public']['Tables']['data_guides']['Row']

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "스티치", label: "스티치" },
  { id: "솔·시접", label: "솔·시접" },
  { id: "선택 가이드", label: "선택 가이드" },
  { id: "현장 용어", label: "현장 용어" },
]

export function DataGrid() {
  const [data, setData] = React.useState<DataGuide[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<Partial<DataGuide>>({})
  
  const [isAdding, setIsAdding] = React.useState(false)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('data_guides').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error("Error fetching data:", error)
    } else {
      setData(data || [])
    }
    setLoading(false)
  }

  const handleExcelUpload = async (excelData: any[]) => {
    const formattedData = excelData.map((row) => ({
      category: row['category'] || row['카테고리'] || '기타',
      situation: row['situation'] || row['상황·부위'] || '',
      recommendation: row['recommendation'] || row['추천 스티치/솔'] || '',
      reason: row['reason'] || row['이유'] || '',
    }))

    const { error } = await (supabase.from('data_guides') as any).insert(formattedData)
    if (error) {
      alert("Failed to upload excel data.")
      console.error(error)
    } else {
      fetchData()
      alert("Successfully uploaded data.")
    }
  }

  const startEdit = (record: DataGuide) => {
    setEditingId(record.id)
    setEditForm(record)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editingId) return;
    // @ts-ignore
    const { error } = await (supabase.from('data_guides') as any)
      .update({
        category: editForm.category,
        situation: editForm.situation,
        recommendation: editForm.recommendation,
        reason: editForm.reason,
      })
      .eq('id', editingId)
      
    if (error) {
      console.error("Update error:", error)
    } else {
      setEditingId(null)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from('data_guides').delete().eq('id', id)
    if (error) {
      console.error("Delete error:", error)
    } else {
      fetchData()
    }
  }

  const saveNew = async () => {
    // @ts-ignore
    const { error } = await (supabase.from('data_guides') as any)
      .insert({
        category: editForm.category || '기타',
        situation: editForm.situation || '',
        recommendation: editForm.recommendation || '',
        reason: editForm.reason || '',
      })
    if (error) {
      console.error("Insert error:", error)
    } else {
      setIsAdding(false)
      setEditForm({})
      fetchData()
    }
  }

  const filteredData = data.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.situation.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.recommendation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  })

  // Stats
  const stats = {
    stitches: data.filter(d => d.category === '스티치').length,
    seams: data.filter(d => d.category === '솔·시접').length,
    total: data.length
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-500">Total Items</p>
          <p className="text-3xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-500">Stitches</p>
          <p className="text-3xl font-bold mt-2 text-blue-600">{stats.stitches}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <p className="text-sm font-medium text-gray-500">Seams</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.seams}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="상황, 부위, 스티치 검색..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ExcelUploader onUpload={handleExcelUpload} />
          <Button onClick={() => { setIsAdding(true); setEditForm({}) }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Tabs 
          tabs={CATEGORIES} 
          activeTab={activeCategory} 
          onChange={setActiveCategory} 
          className="px-4 pt-2"
        />
        
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">카테고리</TableHead>
                <TableHead>상황·부위</TableHead>
                <TableHead>추천 스티치/솔</TableHead>
                <TableHead>이유</TableHead>
                <TableHead className="w-[120px] text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow className="bg-blue-50/50">
                  <TableCell>
                    <select 
                      className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm bg-white"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    >
                      <option value="">선택</option>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      className="h-9" 
                      value={editForm.situation || ''} 
                      onChange={(e) => setEditForm({...editForm, situation: e.target.value})}
                      placeholder="상황 입력"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      className="h-9" 
                      value={editForm.recommendation || ''} 
                      onChange={(e) => setEditForm({...editForm, recommendation: e.target.value})}
                      placeholder="추천 항목 입력"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      className="h-9" 
                      value={editForm.reason || ''} 
                      onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                      placeholder="이유 입력"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={saveNew} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 && !isAdding ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <TableCell>
                          <select 
                            className="w-full h-9 rounded-md border border-gray-200 px-3 py-1 text-sm bg-white"
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          >
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="h-9" 
                            value={editForm.situation || ''} 
                            onChange={(e) => setEditForm({...editForm, situation: e.target.value})}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="h-9" 
                            value={editForm.recommendation || ''} 
                            onChange={(e) => setEditForm({...editForm, recommendation: e.target.value})}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            className="h-9" 
                            value={editForm.reason || ''} 
                            onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{item.situation}</TableCell>
                        <TableCell>{item.recommendation}</TableCell>
                        <TableCell className="text-gray-500">{item.reason}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity [&_button]:opacity-100">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(item)}>
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
