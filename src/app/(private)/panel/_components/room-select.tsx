'use client'

import { DoorOpenIcon } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { RoomProps } from '@/server/rooms/get-all'

interface RoomSelectProps {
  rooms: RoomProps[]
  value: string
  onValueChange: (roomId: string) => void
}

export function RoomSelect({ rooms, value, onValueChange }: RoomSelectProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:max-w-80">
      <Label htmlFor="room" className="text-muted-foreground text-xs uppercase tracking-wider">
        Selecione uma sala
      </Label>

      <Select value={value} onValueChange={roomId => roomId && onValueChange(roomId)}>
        <SelectTrigger id="room" className="h-10 w-full bg-background px-3 shadow-xs">
          <DoorOpenIcon className="text-muted-foreground" />

          {/* O item da lista mostra nome + descrição em duas linhas; no gatilho só cabe o nome. */}
          <SelectValue className="font-medium">{(roomId: string) => rooms.find(room => room.id === roomId)?.name}</SelectValue>
        </SelectTrigger>

        <SelectContent>
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
