'use client'

import { useQuery } from '@tanstack/react-query'
import {  TriangleAlertIcon, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@/constants/query-keys'
import { getAllEmployees } from '@/server/employees/get-all'
import { columnsEmployees } from './employees-columns'

export function EmployeesTable() {
  const [searchEmployee, setSearchEmployee] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getEmployees(),
    queryFn: getAllEmployees,
  })

  const filteredEmployees = useMemo(() => {
    const lowerSearch = searchEmployee.trim().toLowerCase()

    if (!lowerSearch) return data?.employees ?? []

    // O CPF chega da api-fr só com dígitos, mas na tela ele aparece pontuado — e é pontuado que o
    // usuário digita, copiando o que está vendo. Tirar a pontuação da busca faz "123.456" achar o
    // mesmo que "123456"; sem isso, buscar CPF pela tabela nunca acha ninguém.
    const digitsSearch = lowerSearch.replace(/\D/g, '')

    return (
      data?.employees.filter(
        employee =>
          employee.name.toLowerCase().includes(lowerSearch) || (!!digitsSearch && employee.cpf.includes(digitsSearch))
      ) ?? []
    )
  }, [data, searchEmployee])

  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3.5 text-destructive"
      >
        <TriangleAlertIcon className="mt-px size-4 shrink-0" />

        <span className="text-sm leading-snug">
          Não foi possível carregar os colaboradores agora. Recarregue a página e, se continuar assim, verifique sua conexão.
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex w-full max-w-xl items-center">
        <Users className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Busque por nome ou CPF"
          className="h-10 pl-9 placeholder:text-sm"
          value={searchEmployee}
          onChange={({ target }) => setSearchEmployee(target.value)}
        />
      </div>

      <DataTable
        data={filteredEmployees}
        columns={columnsEmployees}
        isLoading={isPending}
        emptyMessage="Nenhum colaborador encontrado."
      />
    </>
  )
}
