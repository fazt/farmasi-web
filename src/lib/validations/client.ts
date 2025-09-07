import { z } from 'zod'

export const clientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string()
    .regex(/^\d{9}$/, 'El teléfono debe tener exactamente 9 dígitos')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  documentType: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  birthDate: z.date().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
  occupation: z.string().optional(),
}).refine((data) => {
  // Validar formato según el tipo de documento seleccionado
  if (data.documentType === 'DNI') {
    return /^\d{8}$/.test(data.documentNumber)
  }
  if (data.documentType === 'CE') {
    return /^\d{9}$/.test(data.documentNumber)
  }
  if (data.documentType === 'PASAPORTE') {
    return data.documentNumber.length >= 6 && data.documentNumber.length <= 12
  }
  return true
}, {
  message: 'Número de documento inválido para el tipo seleccionado',
  path: ['documentNumber']
})

export type ClientFormData = z.infer<typeof clientSchema>