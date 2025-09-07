import { z } from 'zod'

export const interestRateSchema = z.object({
  loanAmount: z.coerce.number().min(1, 'El monto del préstamo debe ser mayor a 0'),
  weeklyPayment: z.coerce.number().min(1, 'El pago semanal debe ser mayor a 0'),
  weeksCount: z.coerce.number().min(1).default(6),
  isActive: z.boolean().default(true),
})

export type InterestRateFormData = z.infer<typeof interestRateSchema>