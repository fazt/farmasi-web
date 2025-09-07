import { z } from 'zod'

export const guaranteeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  value: z.coerce.number().min(1, 'El valor debe ser mayor a 0'),
  photos: z.array(z.instanceof(File)).optional().default([]),
})

// Schema solo para la base de datos (sin photos que se manejan por separado)
export const guaranteeDbSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  value: z.coerce.number().min(1, 'El valor debe ser mayor a 0'),
})

export type GuaranteeFormData = z.infer<typeof guaranteeSchema>