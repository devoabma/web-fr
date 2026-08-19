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
import type { Computer } from '../_data/rooms'

type CloseSessionDialogProps = {
  /** O computador alvo; `null` mantém o diálogo fechado. */
  computer: Computer | null
  onClose: () => void
  onConfirm: (computer: Computer) => void
}

/**
 * Encerrar derruba a tela de alguém que está trabalhando — é ação destrutiva e pede confirmação.
 * O tempo não usado volta para a cota do dia, e dizer isso evita a hesitação do balconista.
 */
export function CloseSessionDialog({ computer, onClose, onConfirm }: CloseSessionDialogProps) {
  function handleConfirm() {
    if (computer) onConfirm(computer)

    onClose()
  }

  return (
    <AlertDialog open={!!computer} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <PowerIcon />
          </AlertDialogMedia>

          <AlertDialogTitle>Encerrar a sessão do {computer?.name}?</AlertDialogTitle>

          <AlertDialogDescription>
            {computer?.lawyerName} perde o acesso à máquina agora. O tempo não utilizado continua disponível na cota do dia.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Encerrar sessão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
