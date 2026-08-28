'use client'

import { DoorOpenIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RoomProps } from '@/server/rooms/get-all'

/**
 * Valor do item "todas": tanto a rota de impressões quanto a de liberações tratam a ausência de sala
 * como "tudo o que este funcionário pode ver", então este id de mentira nunca viaja para a api-fr —
 * ele só existe para o `Select`, que precisa de um `value` em cada item, e para a URL.
 */
export const ALL_ROOMS = 'all'

interface RoomFilterProps {
  rooms: RoomProps[]
  value: string
  onValueChange: (roomId: string) => void
  /** O que "todas as salas" significa nesta tela — cada histórico mostra uma coisa diferente. */
  allRoomsDescription: string
}

export function RoomFilter({ rooms, value, onValueChange, allRoomsDescription }: RoomFilterProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Label htmlFor="room" className="text-muted-foreground text-xs uppercase tracking-wider">
        Filtre por sala
      </Label>

      <Select value={value} onValueChange={roomId => roomId && onValueChange(roomId)}>
        <SelectTrigger id="room" className="w-full bg-background px-2.5 shadow-xs">
          <DoorOpenIcon className="text-muted-foreground" />

          {/* O item da lista mostra nome + descrição em duas linhas; no gatilho só cabe o nome. */}
          <SelectValue className="font-medium">
            {(roomId: string) => (roomId === ALL_ROOMS ? 'Todas as salas' : rooms.find(room => room.id === roomId)?.name)}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_ROOMS} className="py-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">Todas as salas</span>
              <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">{allRoomsDescription}</span>
            </div>
          </SelectItem>

          {rooms.map(room => (
            <SelectItem key={room.id} value={room.id} className="py-2">
              {/* min-w-0 zera a largura mínima do item para o texto poder encolher dentro do popup. */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">{room.name}</span>
                {!!room.description && (
                  <span className="line-clamp-2 whitespace-normal text-muted-foreground text-xs">{room.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
