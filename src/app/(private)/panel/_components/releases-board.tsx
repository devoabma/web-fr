'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/query-keys'
import { getAllRooms } from '@/server/rooms/get-all'
import { RoomEmployees } from './room-employees'
import { RoomSelect } from './room-select'

export function ReleasesBoard() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.getRooms(),
    queryFn: getAllRooms,
  })

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  // Sala inativa fica de fora: ninguém deve liberar máquina de uma sala fora de operação.
  const rooms = data?.rooms.filter(room => !room.inactive) ?? []

  // A API só responde depois do primeiro render, então o estado começa nulo e a primeira sala assume.
  const selectedRoom = rooms.find(room => room.id === selectedRoomId) ?? rooms.at(0)

  if (isPending) {
    return (
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex w-full flex-col gap-2 sm:max-w-80">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-24" />

            <div className="flex -space-x-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-3 w-52" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as salas agora. Atualize a página em alguns instantes.
        </p>
      </section>
    )
  }

  if (!selectedRoom) {
    return (
      <section className="rounded-xl border bg-card p-4 shadow-xs">
        <p className="text-muted-foreground text-sm">Nenhuma sala ativa cadastrada para a sua Seccional.</p>
      </section>
    )
  }

  const totalComputers = selectedRoom.computers.length

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <RoomSelect rooms={rooms} value={selectedRoom.id} onValueChange={setSelectedRoomId} />

      <div className="flex flex-col gap-2 sm:items-end">
        <RoomEmployees employeesRooms={selectedRoom.employeesRooms} />

        <p className="text-muted-foreground text-xs">
          Cota de <span className="font-semibold text-foreground">{selectedRoom.standardTime} min</span> por dia nesta sala ·{' '}
          {String(totalComputers).padStart(2, '0')} {totalComputers === 1 ? 'computador ' : 'computadores'}
        </p>
      </div>
    </section>
  )
}
