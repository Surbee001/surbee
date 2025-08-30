"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Plus, 
  FileText, 
  Image, 
  FileSpreadsheet,
  File,
  Calendar,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Share2,
  Eye,
  X,
  Upload,
  FolderOpen
} from 'lucide-react';
import DocumentViewer from './DocumentViewer';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'other';
  date: Date;
  size: string;
  tags: Tag[];
  url?: string;
  content?: string;
}

const FILE_TYPE_ICONS = {
  pdf: <FileText className="w-4 h-4" />,
  doc: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  spreadsheet: <FileSpreadsheet className="w-4 h-4" />,
  other: <File className="w-4 h-4" />
};

const TAG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' }
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDFs' },
  { value: 'doc', label: 'Documents' },
  { value: 'image', label: 'Images' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'other', label: 'Other Files' }
];

export default function KnowledgeBaseTable() {
  
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Customer Satisfaction Survey Results Q4 2024',
      type: 'pdf',
      date: new Date('2024-12-15'),
      size: '2.4 MB',
      tags: [
        { id: 't1', name: 'Research', color: '#3B82F6' },
        { id: 't2', name: 'Q4 2024', color: '#10B981' }
      ]
    },
    {
      id: '2',
      title: 'Employee Feedback Analysis',
      type: 'doc',
      date: new Date('2024-12-10'),
      size: '1.2 MB',
      tags: [
        { id: 't3', name: 'HR', color: '#8B5CF6' }
      ]
    },
    {
      id: '3',
      title: 'Market Research Infographic',
      type: 'image',
      date: new Date('2024-12-08'),
      size: '4.5 MB',
      tags: [
        { id: 't4', name: 'Marketing', color: '#EC4899' },
        { id: 't5', name: 'Visual', color: '#F59E0B' }
      ]
    },
    {
      id: '4',
      title: 'Financial Report 2024',
      type: 'spreadsheet',
      date: new Date('2024-12-01'),
      size: '856 KB',
      tags: [
        { id: 't6', name: 'Finance', color: '#EF4444' }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  

  // Create table columns
  const columnHelper = createColumnHelper<Document>();
  
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <button
          onClick={() => setSelectedDocument(info.row.original)}
          className="flex items-center gap-3 hover:text-blue-400 transition-colors"
        >
          <div style={{ color: 'var(--surbee-fg-muted)' }}>
            {FILE_TYPE_ICONS[info.row.original.type]}
          </div>
          <span className="text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
            {info.getValue()}
          </span>
        </button>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <span className="text-sm capitalize" style={{ color: 'var(--surbee-fg-muted)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('date', {
      header: 'Date Modified',
      cell: (info) => (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
          <Calendar className="w-3 h-3" />
          {formatDate(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor('size', {
      header: 'Size',
      cell: (info) => (
        <span className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info) => (
        <div className="flex items-center gap-2 flex-wrap">
          {info.getValue().map((tag) => (
            <div
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${tag.color}20`, 
                border: `1px solid ${tag.color}40`,
                color: 'var(--surbee-fg-primary)'
              }}
            >
              <span>{tag.name}</span>
            </div>
          ))}
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
              <MoreVertical className="w-4 h-4" style={{ color: 'var(--surbee-fg-muted)' }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setSelectedDocument(info.row.original)}>
              <Eye className="w-4 h-4" />
              <span>View</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4" />
              <span>Download</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ], []);
  
  // Filter data
  const filteredData = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, filterType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Filter dropdown options
  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'pdf', label: 'PDFs' },
    { value: 'doc', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'spreadsheet', label: 'Spreadsheets' },
    { value: 'other', label: 'Other Files' }
  ];

  if (selectedDocument) {
    return (
      <DocumentViewer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="projects-header">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="projects-title">
              Knowledge Ba<span style={{ fontStyle: 'normal' }}>s</span>e
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                {Object.keys(rowSelection).length} selected
              </span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-2.5 bg-white text-black rounded-full flex items-center gap-2 text-sm font-medium transition-all hover:bg-gray-100"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surbee-input-placeholder)' }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-accent hover:text-accent-foreground min-w-[8rem]" 
                          style={{ 
                            color: 'var(--surbee-fg-primary)', 
                            borderColor: 'var(--surbee-border-primary)' 
                          }}>
                    <span>{filterOptions.find(opt => opt.value === filterType)?.label}</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setFilterType(option.value)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-gray-200/10"></div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="projects-cards-container">
        {/* Top Fade Effect */}
        <div className="projects-cards-fade"></div>
        
        <div className="projects-cards-content">
          <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
            {/* Table or Empty State */}
            {filteredData.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  No documents found
                </h3>
                <p className="text-[14px] mb-6" style={{ color: 'var(--surbee-fg-muted)' }}>
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first document to get started'}
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 rounded-lg text-[14px] font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--surbee-bg-secondary)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary)'}
                >
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="rounded-xl border" style={{ 
                borderColor: 'var(--surbee-border-primary)',
                backgroundColor: 'var(--surbee-bg-secondary)'
              }}>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center gap-1'
                                    : 'flex items-center gap-1',
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: <ChevronUp className="w-3 h-3" />,
                                  desc: <ChevronDown className="w-3 h-3" />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border p-6" style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-border-primary)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>Upload Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" style={{ color: 'var(--surbee-fg-muted)' }} />
              </button>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--surbee-border-primary)' }}>
              <FolderOpen className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--surbee-fg-muted)' }} />
              <p className="text-sm mb-4" style={{ color: 'var(--surbee-fg-muted)' }}>
                Drag and drop your files here, or click to browse
              </p>
              <button className="px-6 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Choose Files
              </button>
              <p className="text-xs mt-4" style={{ color: 'var(--surbee-fg-muted)' }}>
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}