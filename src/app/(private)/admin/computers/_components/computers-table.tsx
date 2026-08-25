'use client'

import { useQuery } from '@tanstack/react-query'
import { Computer, TriangleAlertIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@/constants/query-keys'
import { getAllComputers } from '@/server/computers/get-all'
import { columnsComputers } from './computers-columns'

export function ComputersTable() {
  const [searchComputer, setSearchComputer] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getComputers(),
    queryFn: getAllComputers,
  })

  const filteredComputers = useMemo(() => {
    const lowerSearch = searchComputer.trim().toLowerCase()

    if (!lowerSearch) return data?.computers ?? []

    // Sala *ou* descrição: o balconista tanto procura "todas as máquinas da Sala 2" quanto
    // "aquela COMPUTADOR 03". A api-fr só filtra por `roomId`/`description`, então é aqui.
    return (
      data?.computers.filter(
        computer =>
          computer.room.name.toLowerCase().includes(lowerSearch) || computer.description.toLowerCase().includes(lowerSearch)
      ) ?? []
    )
  }, [data, searchComputer])

  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3.5 text-destructive"
      >
        <TriangleAlertIcon className="mt-px size-4 shrink-0" />

        <span className="text-sm leading-snug">
          Não foi possível carregar os computadores agora. Recarregue a página e, se continuar assim, verifique sua conexão.
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex w-full max-w-xl items-center">
        <Computer className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Buscar pela sala ou pela descrição do computador"
          className="h-10 pl-9 placeholder:text-sm"
          value={searchComputer}
          onChange={({ target }) => setSearchComputer(target.value)}
        />
      </div>

      <DataTable
        data={filteredComputers}
        columns={columnsComputers}
        isLoading={isPending}
        emptyMessage="Nenhum computador encontrado."
      />
    </>
  )
}
