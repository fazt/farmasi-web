import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Script para crear usuarios de Farmasi')
  console.log('=====================================')

  // Get command line arguments
  const args = process.argv.slice(2)
  
  if (args.length < 3) {
    console.log('❌ Uso: npm run create-user <name> <email> <password> [role]')
    console.log('')
    console.log('Ejemplos:')
    console.log('  npm run create-user "Juan Pérez" juan@farmasi.com mipassword123')
    console.log('  npm run create-user "María García" maria@farmasi.com password456 USER')
    console.log('')
    console.log('Roles disponibles: ADMIN, USER (por defecto: ADMIN)')
    process.exit(1)
  }

  const [name, email, password, roleArg] = args
  const role = (roleArg?.toUpperCase() as Role) || 'ADMIN'

  // Validate role
  if (!['ADMIN', 'USER'].includes(role)) {
    console.log('❌ Rol inválido. Debe ser: ADMIN o USER')
    process.exit(1)
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log('❌ Email inválido')
    process.exit(1)
  }

  // Validate password length
  if (password.length < 6) {
    console.log('❌ La contraseña debe tener al menos 6 caracteres')
    process.exit(1)
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Ya existe un usuario con este email')
      process.exit(1)
    }

    // Hash password
    console.log('🔐 Encriptando contraseña...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('👤 Creando usuario...')
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    console.log('')
    console.log('✅ Usuario creado exitosamente!')
    console.log('==============================')
    console.log(`ID: ${user.id}`)
    console.log(`Nombre: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Rol: ${user.role}`)
    console.log(`Creado: ${user.createdAt.toLocaleDateString('es-ES')}`)
    console.log('')
    console.log('🔑 Credenciales de acceso:')
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${password}`)
    console.log('')
    console.log('🌐 Ahora puedes iniciar sesión en: http://localhost:3000/auth/signin')

  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })