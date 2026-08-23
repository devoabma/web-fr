import type { ReactTable, RowData } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { DataTableFeatures } from './data-table-features'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

interface DataTablePaginationProps<TData extends RowData> {
  table: ReactTable<DataTableFeatures, TData>
  isLoading?: boolean
}

export function DataTablePagination<TData extends RowData>({ table, isLoading }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.state.pagination

  // O modelo *pré*-paginado é o total que o usuário está navegando; `getRowModel()` já veio fatiado.
  const totalRows = table.getPrePaginatedRowModel().rows.length

  // Sem linhas o TanStack devolve 0 páginas — mostrar "Página 1 de 0" fica estranho no vazio/loading.
  const pageCount = Math.max(table.getPageCount(), 1)

  const firstRowOnPage = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const lastRowOnPage = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Sem esse ramo o rodapé anuncia "Total: 0 registros" enquanto a request ainda corre. */}
      <p className="text-muted-foreground text-sm">
        {isLoading ? (
          'Carregando registros...'
        ) : (
          <>
            Total: {totalRows} {totalRows === 1 ? 'registro' : 'registros'} · Exibindo {firstRowOnPage} a {lastRowOnPage} de{' '}
            {totalRows}
          </>
        )}
      </p>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap font-medium text-sm">Linhas por página</p>

          <Select
            value={`${pageSize}`}
            onValueChange={value => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-18">
              <SelectValue />
            </SelectTrigger>

            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map(option => (
                <SelectItem key={option} value={`${option}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="whitespace-nowrap font-medium text-sm">
          Página {pageIndex + 1} de {pageCount}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para a primeira página</span>
            <ChevronsLeft />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para a página anterior</span>
            <ChevronLeft />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para a próxima página</span>
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para a última página</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
