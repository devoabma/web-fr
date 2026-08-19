'use client'

import { LockOpenIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { maskBirthDate } from '@/utils/masks/birth-date'
import { maskCpf } from '@/utils/masks/cpf'
import type { Computer } from '../_data/rooms'
import { type ReleaseComputerFormType, useReleaseComputerForm } from './release-computer-schema'

type ReleaseComputerDialogProps = {
  /** O computador alvo; `null` mantém o diálogo fechado. */
  computer: Computer | null
  roomName: string
  onClose: () => void
  onConfirm: (data: ReleaseComputerFormType) => void
}

export function ReleaseComputerDialog({ computer, roomName, onClose, onConfirm }: ReleaseComputerDialogProps) {
  const form = useReleaseComputerForm()

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = form

  // Sem isto o CPF do advogado anterior reaparece ao abrir o diálogo na máquina seguinte —
  // e o balconista libera a pessoa errada sem perceber.
  useEffect(() => {
    if (computer) reset()
  }, [computer, reset])

  function handleRelease(data: ReleaseComputerFormType) {
    onConfirm(data)
    onClose()
  }

  return (
    <Dialog open={!!computer} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liberar {computer?.name}</DialogTitle>

          <DialogDescription>
            {roomName} · confira os dados na carteira da OAB antes de liberar. A liberação vale para a cota do dia do
            advogado.
          </DialogDescription>
        </DialogHeader>

        <form noValidate id="release-computer-form" onSubmit={handleSubmit(handleRelease)}>
          <FieldGroup>
            <Field data-invalid={!!errors.cpf}>
              <FieldLabel htmlFor="cpf">CPF</FieldLabel>

              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    aria-invalid={!!errors.cpf}
                    className="h-10"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={event => field.onChange(maskCpf(event.target.value))}
                  />
                )}
              />

              <FieldError errors={[errors.cpf]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.oab}>
                <FieldLabel htmlFor="oab">Nº da OAB</FieldLabel>

                <Input
                  id="oab"
                  placeholder="MA123456"
                  autoCapitalize="characters"
                  aria-invalid={!!errors.oab}
                  className="h-10 uppercase"
                  {...register('oab')}
                />

                <FieldError errors={[errors.oab]} />
              </Field>

              <Field data-invalid={!!errors.birth}>
                <FieldLabel htmlFor="birth">Data de nascimento</FieldLabel>

                <Controller
                  control={control}
                  name="birth"
                  render={({ field }) => (
                    <Input
                      id="birth"
                      inputMode="numeric"
                      placeholder="00/00/0000"
                      aria-invalid={!!errors.birth}
                      className="h-10"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={event => field.onChange(maskBirthDate(event.target.value))}
                    />
                  )}
                />

                <FieldError errors={[errors.birth]} />
              </Field>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>

          <Button type="submit" form="release-computer-form">
            <LockOpenIcon data-icon="inline-start" />
            Confirmar liberação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
