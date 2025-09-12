import { z } from 'zod'

export const contractSchema = z.object({
  clientId: z.string().min(1, 'Debe seleccionar un cliente'),
  loanId: z.string().min(1, 'Debe seleccionar un préstamo'),
  guaranteeId: z.string().min(1, 'Debe seleccionar una garantía'),
  startDate: z.coerce.date().default(() => new Date()),
  endDate: z.coerce.date(),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  interest: z.number().min(0, 'El interés no puede ser negativo'),
  installments: z.number().min(1, 'Debe tener al menos una cuota').default(6),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  signature: z.string().optional(),
  content: z.string().optional(),
  templateId: z.string().optional(),
})

export type ContractFormData = z.infer<typeof contractSchema>