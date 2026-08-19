'use client'

import { PowerIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ComputerView } from '../_data/computer-view'

type CloseSessionDialogProps = {
  /** O computador alvo; `null` mantém o diálogo fechado. */
  computer: ComputerView | null
  isPending: boolean
  onClose: () => void
  onConfirm: (computer: ComputerView) => void
}

/**
 * Encerrar derruba a tela de alguém que está trabalhando — é ação destrutiva e pede confirmação.
 * O tempo não usado volta para a cota do dia, e dizer isso evita a hesitação do balconista.
 *
 * Quem fecha o diálogo é o container, e só depois do sucesso: se a API recusar, a confirmação
 * continua aberta com o erro em vez de sumir dando a impressão de que deu certo.
 */
export function CloseSessionDialog({ computer, isPending, onClose, onConfirm }: CloseSessionDialogProps) {
  return (
    <AlertDialog open={!!computer} onOpenChange={open => !open && !isPending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <PowerIcon />
          </AlertDialogMedia>

          <AlertDialogTitle>Encerrar a sessão do {computer?.name}?</AlertDialogTitle>

          <AlertDialogDescription>
            {computer?.session?.lawyerName} perde o acesso à máquina agora. O tempo não utilizado continua disponível na cota
            do dia.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>

          <AlertDialogAction variant="destructive" disabled={isPending} onClick={() => computer && onConfirm(computer)}>
            {isPending ? 'Encerrando...' : 'Encerrar sessão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
