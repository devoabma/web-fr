'use client'

import { UsersIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { formatCount, type RankedLawyer } from '../_data/metrics-view'
import { LawyerRankingRow } from './lawyer-ranking-row'

type LawyersRankingDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lawyers: RankedLawyer[]
  oabUf: string | null
  year: number
}

export function LawyersRankingDrawer({ open, onOpenChange, lawyers, oabUf, year }: LawyersRankingDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[90vh] flex-col">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-primary">
            <UsersIcon className="size-4.5" />
            Liberações por advogado
          </DrawerTitle>

          <DrawerDescription>
            {formatCount(lawyers.length)} {lawyers.length === 1 ? 'advogado atendido' : 'advogados atendidos'} em {year}, do maior
            para o menor uso
          </DrawerDescription>

          <DrawerClose render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}>
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DrawerClose>
        </DrawerHeader>

        {/* A rota devolve o ranking inteiro numa tacada; a rolagem fica aqui para a lista não
            empurrar o cabeçalho do painel para fora da vista. */}
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto px-4 pb-4">
          {lawyers.map(lawyer => (
            <LawyerRankingRow key={lawyer.lawyerId} lawyer={lawyer} oabUf={oabUf} />
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  )
}
