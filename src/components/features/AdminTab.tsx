"use client";

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ExcelUploader } from "./ExcelUploader"
import { Plus, Edit2, Trash2, Check, X, Paperclip, Search, Info, Download } from "lucide-react"

type TermRow = Database['public']['Tables']['FashionTermBook']['Row'] & { FashionFiles?: any[] }

export function AdminTab() {
  const [data, setData] = React.useState<TermRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchInput, setSearchInput] = React.useState("")
  const [activeSearch, setActiveSearch] = React.useState("")
  
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editForm, setEditForm] = React.useState<Partial<TermRow>>({})
  const [isAdding, setIsAdding] = React.useState(false)

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadingRowId, setUploadingRowId] = React.useState<string | null>(null)
  const [viewImageModal, setViewImageModal] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('FashionTermBook').select('*, FashionFiles(*)').order('seq', { ascending: true })
    if (error) {
      console.error("Error fetching data:", error)
    } else {
      setData(data || [])
    }
    setLoading(false)
  }

  const handleExcelUpload = async (excelData: any[]) => {
    // KST Time generation (UTC + 9 hours with +09:00 offset string)
    const kstTime = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace('Z', '+09:00');

    const parseBoolean = (val: any) => {
      if (val === undefined || val === null || val === '') return true; // 값이 없으면 Y(true)
      const str = String(val).trim().toUpperCase();
      if (str === 'N' || str === 'FALSE' || str === 'X' || str === '0') return false;
      return true; // 그 외 (Y 등)은 true
    };

    // Map Excel columns to table columns based on user's structure
    const formattedData = excelData.map((row) => ({
      category: row['Category'] || row['category'] || null,
      current_term: row['Current Term'] || row['current_term'] || null,
      current_variants: row['Current Variants'] || row['current_variants'] || null,
      standard_en: row['Standard EN'] || row['standard_en'] || null,
      standard_en_short: row['Standard EN Short'] || row['standard_en_short'] || null,
      korean_meaning: row['Korean Meaning'] || row['korean_meaning'] || null,
      korean_short: row['korean_short'] || null, 
      notes: row['Note'] || row['notes'] || null,
      card_row: parseInt(row['Card Row'] || row['card_row'] || '0', 10),
      search_terms: row['Search Name'] || row['search_terms'] || null,
      use_in: parseBoolean(row['Use In']),
      use_out: parseBoolean(row['Use Out']),
      use_yn: true,
      created_by: 'admin',
      modified_by: 'admin',
      created_at: kstTime,
      modified_at: kstTime
    }))

    const { error } = await (supabase.from('FashionTermBook') as any).insert(formattedData)
    if (error) {
      alert("Excel upload failed: " + error.message)
    } else {
      fetchData()
      alert("Successfully uploaded data.")
    }
  }

  const startEdit = (record: TermRow) => {
    setEditingId(record.id)
    setEditForm(record)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editingId) return;
    const { id, seq, created_at, created_by, modified_at, modified_by, FashionFiles, ...updateData } = editForm as any;
    
    const { error } = await (supabase.from('FashionTermBook') as any)
      .update({ ...updateData, modified_at: new Date().toISOString() })
      .eq('id', editingId)
      
    if (error) {
      console.error("Update error:", error)
      alert("Failed to update.")
    } else {
      setEditingId(null)
      fetchData()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert("선택된 항목이 없습니다.");
      return;
    }
    if (!confirm(`선택된 ${selectedIds.size}개 항목을 정말 삭제하시겠습니까?`)) return;
    
    const idsToDelete = Array.from(selectedIds);
    const { error } = await supabase.from('FashionTermBook').delete().in('id', idsToDelete);
    
    if (error) {
      console.error("Delete error:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } else {
      setSelectedIds(new Set());
      fetchData();
    }
  }

  const saveNew = async () => {
    const { id, seq, created_at, created_by, modified_at, modified_by, FashionFiles, ...insertData } = editForm as any;
    const { error } = await (supabase.from('FashionTermBook') as any)
      .insert({ 
        ...insertData,
        use_in: insertData.use_in ?? true,
        use_out: insertData.use_out ?? true,
        use_yn: insertData.use_yn ?? true,
      })
      
    if (error) {
      console.error("Insert error:", error)
      alert("Failed to add row.")
    } else {
      setIsAdding(false)
      setEditForm({})
      fetchData()
    }
  }

  // File Upload Handlers
  const handleAttachmentClick = (rowId: string) => {
    setUploadingRowId(rowId)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !uploadingRowId) return

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadingRowId(null);
      return;
    }
    
    setLoading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${uploadingRowId}/${fileName}`;

    // 1. Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('fashion_files')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      alert(`업로드 실패 (${file.name}): ${uploadError.message}`);
    } else {
      // 2. DB FashionFiles 테이블에 기록
      const { error: dbError } = await (supabase.from('FashionFiles') as any).insert({
        fashion_term_book_id: uploadingRowId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        created_by: 'admin'
      });

      if (dbError) {
        console.error("DB insert error:", dbError);
        alert(`DB 기록 실패 (${file.name}): ${dbError.message}`);
      } else {
        alert(`이미지 파일이 성공적으로 업로드되었습니다!`);
        fetchData();
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadingRowId(null);
    setLoading(false);
  }

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map(d => d.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) newSelected.add(id)
    else newSelected.delete(id)
    setSelectedIds(newSelected)
  }

  const allSelected = data.length > 0 && selectedIds.size === data.length

  const filteredData = data.filter((item) => {
    if (!activeSearch) return true;
    const searchLower = activeSearch.toLowerCase();
    return (
      (item.category?.toLowerCase() || '').includes(searchLower) ||
      (item.current_term?.toLowerCase() || '').includes(searchLower) ||
      (item.standard_en?.toLowerCase() || '').includes(searchLower) ||
      (item.korean_meaning?.toLowerCase() || '').includes(searchLower)
    );
  })

  return (
    <div className="flex flex-col h-full space-y-4">
      <input 
        type="file" 
        accept="image/*"
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      <div className="flex-none flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by category, term, english or korean..." 
              className="pl-9 bg-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveSearch(searchInput)}
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setActiveSearch(searchInput)}>Search</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center whitespace-nowrap"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/template.xlsx';
              link.download = 'template.xlsx';
              link.click();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Template Down
          </Button>
          <ExcelUploader onUpload={handleExcelUpload} />
          <Button onClick={() => { setIsAdding(true); setEditForm({}) }} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
          <Button variant="danger" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Row
          </Button>
        </div>
      </div>

      <Table wrapperClassName="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm min-h-0" className="min-w-[1300px]">
        <TableHeader className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </TableHead>
              <TableHead className="w-[60px]">Seq</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Term</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Standard EN</TableHead>
              <TableHead>Short EN</TableHead>
              <TableHead>Korean</TableHead>
              <TableHead>Short KR</TableHead>
              <TableHead className="w-[70px] text-center">In</TableHead>
              <TableHead className="w-[70px] text-center">Out</TableHead>
              <TableHead className="w-[70px] text-center">Use</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[60px] text-center">Detail</TableHead>
              <TableHead className="w-[120px] text-center">Files</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-blue-50/50">
                <TableCell></TableCell>
                <TableCell>-</TableCell>
                <TableCell><Input className="h-8" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.current_term || ''} onChange={e => setEditForm({...editForm, current_term: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.current_variants || ''} onChange={e => setEditForm({...editForm, current_variants: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.standard_en || ''} onChange={e => setEditForm({...editForm, standard_en: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.standard_en_short || ''} onChange={e => setEditForm({...editForm, standard_en_short: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.korean_meaning || ''} onChange={e => setEditForm({...editForm, korean_meaning: e.target.value})} /></TableCell>
                <TableCell><Input className="h-8" value={editForm.korean_short || ''} onChange={e => setEditForm({...editForm, korean_short: e.target.value})} /></TableCell>
                <TableCell className="text-center">
                  <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_in ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_in: e.target.value === 'Y'})}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </TableCell>
                <TableCell className="text-center">
                  <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_out ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_out: e.target.value === 'Y'})}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </TableCell>
                <TableCell className="text-center">
                  <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_yn ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_yn: e.target.value === 'Y'})}>
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                  </select>
                </TableCell>
                <TableCell><Input className="h-8" value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} /></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-center text-gray-400 text-xs">Save first</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={saveNew} className="h-8 w-8 text-green-600 hover:bg-green-50"><Check className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)} className="h-8 w-8 text-red-600 hover:bg-red-50"><X className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {loading ? (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-10 text-gray-500">Loading data...</TableCell>
              </TableRow>
            ) : data.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={16} className="text-center py-10 text-gray-500">No data found. Upload Excel or Add Row.</TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  {editingId === item.id ? (
                    <>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => toggleSelectRow(item.id, e.target.checked)} className="w-4 h-4 cursor-pointer" />
                      </TableCell>
                      <TableCell className="text-gray-500">{item.seq}</TableCell>
                      <TableCell><Input className="h-8" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.current_term || ''} onChange={e => setEditForm({...editForm, current_term: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.current_variants || ''} onChange={e => setEditForm({...editForm, current_variants: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.standard_en || ''} onChange={e => setEditForm({...editForm, standard_en: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.standard_en_short || ''} onChange={e => setEditForm({...editForm, standard_en_short: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.korean_meaning || ''} onChange={e => setEditForm({...editForm, korean_meaning: e.target.value})} /></TableCell>
                      <TableCell><Input className="h-8" value={editForm.korean_short || ''} onChange={e => setEditForm({...editForm, korean_short: e.target.value})} /></TableCell>
                      <TableCell className="text-center">
                        <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_in ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_in: e.target.value === 'Y'})}>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_out ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_out: e.target.value === 'Y'})}>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="w-full h-8 rounded-md border border-gray-200 text-sm bg-white" value={(editForm.use_yn ?? true) ? 'Y' : 'N'} onChange={e => setEditForm({...editForm, use_yn: e.target.value === 'Y'})}>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </TableCell>
                      <TableCell><Input className="h-8" value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} /></TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-center text-gray-400 text-xs">Save first</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={saveEdit} className="h-8 w-8 text-green-600"><Check className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 text-gray-500"><X className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={(e) => toggleSelectRow(item.id, e.target.checked)} className="w-4 h-4 cursor-pointer" />
                      </TableCell>
                      <TableCell className="text-gray-500">{item.seq}</TableCell>
                      <TableCell><span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{item.category || '-'}</span></TableCell>
                      <TableCell className="font-medium text-gray-900">{item.current_term || '-'}</TableCell>
                      <TableCell className="text-gray-500 text-sm truncate max-w-[100px]" title={item.current_variants || ''}>{item.current_variants || '-'}</TableCell>
                      <TableCell className="text-gray-600">{item.standard_en || '-'}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{item.standard_en_short || '-'}</TableCell>
                      <TableCell className="text-gray-800">{item.korean_meaning || '-'}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{item.korean_short || '-'}</TableCell>
                      <TableCell className="text-center text-gray-500">{item.use_in ? 'Y' : 'N'}</TableCell>
                      <TableCell className="text-center text-gray-500">{item.use_out ? 'Y' : 'N'}</TableCell>
                      <TableCell className="text-center text-gray-500">{item.use_yn ? 'Y' : 'N'}</TableCell>
                      <TableCell className="text-gray-500 text-sm truncate max-w-[100px]" title={item.notes || ''}>{item.notes || '-'}</TableCell>
                      <TableCell className="text-center">
                        {item.FashionFiles && item.FashionFiles.length > 0 ? (
                          <button 
                            className="inline-flex items-center justify-center rounded-full w-8 h-8 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="View Details"
                            onClick={() => {
                              const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fashion_files/${item.FashionFiles![0].file_path}`;
                              setViewImageModal(fileUrl);
                            }}
                          >
                            <Info className="w-5 h-5" />
                          </button>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handleAttachmentClick(item.id)} className="h-7 text-xs border-dashed border-gray-300">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Attach
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-gray-600 border-gray-200 hover:bg-gray-100" onClick={() => startEdit(item)}>
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
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

      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-3xl max-h-[90vh] overflow-auto shadow-2xl">
            <button 
              onClick={() => setViewImageModal(null)}
              className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={viewImageModal} alt="Detail" className="max-w-full h-auto rounded" />
          </div>
        </div>
      )}
    </div>
  )
}
