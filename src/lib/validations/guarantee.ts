import { z } from 'zod'

export const guaranteeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  value: z.number().min(1, 'El valor debe ser mayor a 0'),
  photo: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'USED']).default('ACTIVE'),
})

export type GuaranteeFormData = z.infer<typeof guaranteeSchema>