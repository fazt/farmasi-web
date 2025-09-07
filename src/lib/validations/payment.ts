import { z } from 'zod'

export const paymentSchema = z.object({
  loanId: z.string().min(1, 'Debe seleccionar un préstamo'),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  paymentDate: z.date().default(() => new Date()),
})

export type PaymentFormData = z.infer<typeof paymentSchema>