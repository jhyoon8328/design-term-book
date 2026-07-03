"use client";

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database.types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Input } from "@/components/ui/Input"
import { Search, Info, X } from "lucide-react"
import { ExcelDownloader } from "./ExcelUploader"

type TermRow = Database['public']['Tables']['FashionTermBook']['Row'] & { FashionFiles?: any[] }

export function ViewTab() {
  const [data, setData] = React.useState<TermRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchInput, setSearchInput] = React.useState("")
  const [activeSearch, setActiveSearch] = React.useState("")
  const [viewImageModal, setViewImageModal] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('FashionTermBook')
      .select('*, FashionFiles(*)')
      .eq('use_in', true)
      .eq('use_yn', true)
      .order('seq', { ascending: true })
    if (error) {
      console.error("Error fetching data:", error)
    } else {
      setData(data || [])
    }
    setLoading(false)
  }

  const filteredData = data.filter((item) => {
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
      <div className="flex-none flex items-center bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input 
              placeholder="Search by category, term, english or korean..." 
              className="pl-9 border-blue-200 focus-visible:ring-blue-500 bg-white"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveSearch(searchInput)}
            />
          </div>
          <button 
            onClick={() => setActiveSearch(searchInput)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
        <div className="ml-auto">
          <ExcelDownloader dataToDownload={filteredData} fileName="fashion_term_book.xlsx" />
        </div>
      </div>

      <Table wrapperClassName="flex-1 bg-white rounded-xl border border-blue-100 shadow-sm min-h-0">
        <TableHeader className="sticky top-0 bg-blue-50 z-10 shadow-sm">
              <TableRow className="hover:bg-transparent border-blue-100">
                <TableHead className="text-blue-900 font-semibold">Category</TableHead>
                <TableHead className="text-blue-900 font-semibold">Current Term</TableHead>
                <TableHead className="text-blue-900 font-semibold">Standard EN</TableHead>
                <TableHead className="text-blue-900 font-semibold">Korean Meaning</TableHead>
                <TableHead className="w-[100px] text-center text-blue-900 font-semibold">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-blue-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-blue-400">
                    No data found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 border-blue-50">
                    <TableCell className="font-medium text-blue-800">
                      {item.category || '-'}
                    </TableCell>
                    <TableCell className="text-gray-900">{item.current_term || '-'}</TableCell>
                    <TableCell className="text-gray-600">{item.standard_en || '-'}</TableCell>
                    <TableCell className="text-gray-600">{item.korean_meaning || '-'}</TableCell>
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
