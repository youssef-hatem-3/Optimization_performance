import { useQuery } from '@tanstack/react-query'
import { 
  flexRender, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel, 
  useReactTable, 
  type ColumnDef, 
  type SortingState } 
  from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'
import { getOrders } from '../../lib/api'
import type { Order } from '../../types/models'

export function OrdersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders })
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const columns = useMemo<ColumnDef<Order>[]>(() => [
    { accessorKey: 'id', header: 'Order ID' }, 
    { accessorKey: 'customer', header: 'Customer' }, 
    { accessorKey: 'product', header: 'Product' },
    { accessorKey: 'price', header: 'Price', cell: (info) => `$${info.getValue<number>().toFixed(2)}` }, { accessorKey: 'status', header: 'Status' }, { accessorKey: 'createdAt', header: 'Created date', cell: (info) => new Date(info.getValue<string>()).toLocaleDateString() },
  ], [])

  const table = useReactTable({ data, columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel() })
  const rows = table.getRowModel().rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 51,
    overscan: 10,
  })

  if (isLoading) return <p>Loading orders…</p>

  return <>
    <header className="page-header"><div><p className="eyebrow">TanStack Table + Virtual</p><h2>Orders</h2><p>Sorting and filtering across all orders; only visible rows are rendered.</p></div></header>
    <div className="toolbar"><input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Filter all order fields…" /></div>
    <div ref={tableContainerRef} className="table-wrap virtual-table-wrap">
      <table className="virtual-table">
        <thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())} {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}</th>)}</tr>)}</thead>
        <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            return <tr key={row.id} style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>
          })}
        </tbody>
      </table>
    </div>
  </>
}
