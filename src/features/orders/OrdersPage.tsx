import { useQuery } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type PaginationState, type SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { getOrders } from '../../lib/api'
import type { Order } from '../../types/models'

export function OrdersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders })
  const [sorting, setSorting] = useState<SortingState>([]); const [globalFilter, setGlobalFilter] = useState(''); const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const columns = useMemo<ColumnDef<Order>[]>(() => [
    { accessorKey: 'id', header: 'Order ID' }, { accessorKey: 'customer', header: 'Customer' }, { accessorKey: 'product', header: 'Product' },
    { accessorKey: 'price', header: 'Price', cell: (info) => `$${info.getValue<number>().toFixed(2)}` }, { accessorKey: 'status', header: 'Status' }, { accessorKey: 'createdAt', header: 'Created date', cell: (info) => new Date(info.getValue<string>()).toLocaleDateString() },
  ], [])
  const table = useReactTable({ data, columns, state: { sorting, globalFilter, pagination }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel() })
  if (isLoading) return <p>Loading 2,000 orders…</p>
  return <><header className="page-header"><div><p className="eyebrow">TanStack Table</p><h2>Orders</h2><p>Sorting, filtering, and pagination without virtualization.</p></div></header><div className="toolbar"><input value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Filter all order fields…" /></div><div className="table-wrap"><table><thead>{table.getHeaderGroups().map((headerGroup) => <tr key={headerGroup.id}>{headerGroup.headers.map((header) => <th key={header.id} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())} {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div><div className="pagination"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button><span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button></div></>
}
