'use client'

import { type ColumnDef, type RowData, useTable } from '@tanstack/react-table'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { type DataTableFeatures, features } from './data-table-features'
import { DataTablePagination } from './data-table-pagination'

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  isLoading?: boolean
  /** Quantidade inicial de linhas por página; o usuário troca pelo seletor do rodapé. */
  pageSize?: number
  /** Linhas de placeholder no carregamento. Poucas de propósito: o skeleton anuncia a espera, não simula a lista. */
  skeletonRows?: number
  emptyMessage?: string
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading,
  pageSize = 10,
  skeletonRows = 7,
  emptyMessage = 'Nenhum registro encontrado.',
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  const skeletonRowKeys = Array.from({ length: skeletonRows }, (_, index) => `skeleton-row-${index}`)

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRowKeys.map(rowKey => (
                <TableRow key={rowKey}>
                  {table.getVisibleLeafColumns().map(column => {
                    const meta = column.columnDef.meta

                    // O traço é fino de propósito — o placeholder marca onde o dado vai cair, não imita o
                    // seu peso. Quem segura a altura da linha é a caixa `h-5` (a altura de linha do
                    // `text-sm`) e o ladrilho da âncora: sem elas a tabela encolheria e o salto na chegada
                    // dos dados pareceria defeito de render.
                    return (
                      <TableCell key={column.id} className={meta?.className}>
                        {meta?.skeletonAnchorClassName ? (
                          <div className="inline-flex items-center gap-3">
                            <Skeleton className={cn('size-8 shrink-0 bg-muted-foreground/20', meta.skeletonAnchorClassName)} />

                            <div className="flex flex-col gap-1.5">
                              <Skeleton className={cn('h-3 w-36 bg-muted-foreground/20', meta.skeletonClassName)} />

                              <Skeleton className="h-2.5 w-24 bg-muted-foreground/15" />
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex h-5 items-center">
                            <Skeleton className={cn('h-3 w-24 bg-muted-foreground/20', meta?.skeletonClassName)} />
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} isLoading={isLoading} />
    </div>
  )
}
