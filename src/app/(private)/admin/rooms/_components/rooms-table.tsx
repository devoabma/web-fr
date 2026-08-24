'use client'

import { useQuery } from '@tanstack/react-query'
import { DoorOpen, TriangleAlertIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@/constants/query-keys'
import { getAllRooms } from '@/server/rooms/get-all'
import { columns } from './rooms-columns'

export function RoomsTable() {
  const [searchRoom, setSearchRoom] = useState('')

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  const filteredRooms = useMemo(() => {
    const lowerRoomSearch = searchRoom.trim().toLowerCase()

    return data?.rooms.filter(room => room.name.toLowerCase().includes(lowerRoomSearch)) ?? []
  }, [data, searchRoom])

  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/6 px-4 py-3.5 text-destructive"
      >
        <TriangleAlertIcon className="mt-px size-4 shrink-0" />

        <span className="text-sm leading-snug">
          Não foi possível carregar as salas agora. Recarregue a página e, se continuar assim, verifique sua conexão.
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="relative flex w-full max-w-xl items-center">
        <DoorOpen className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Buscar por nome da sala"
          className="h-10 pl-9 placeholder:text-sm"
          value={searchRoom}
          onChange={({ target }) => setSearchRoom(target.value)}
        />
      </div>

      <DataTable data={filteredRooms} columns={columns} isLoading={isPending} emptyMessage="Nenhuma sala encontrada." />
    </>
  )
}
