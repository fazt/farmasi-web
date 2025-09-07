import { z } from 'zod'

export const loanSchema = z.object({
  clientId: z.string().min(1, 'Debe seleccionar un cliente'),
  interestRateId: z.string().min(1, 'Debe seleccionar una tasa de interés'),
  guaranteeId: z.string().min(1, 'Debe seleccionar una garantía'),
  guarantorId: z.string().optional(),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  weeklyPayment: z.number().min(1, 'El pago semanal debe ser mayor a 0'),
  totalAmount: z.number().min(1, 'El monto total debe ser mayor a 0'),
  balance: z.number().min(0, 'El saldo no puede ser negativo'),
  status: z.enum(['ACTIVE', 'PAID', 'OVERDUE', 'CANCELLED']).default('ACTIVE'),
  loanDate: z.date().default(() => new Date()),
  dueDate: z.date(),
})

export type LoanFormData = z.infer<typeof loanSchema>