import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addWeeks } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@farmasi.com' },
    update: {},
    create: {
      email: 'admin@farmasi.com',
      password: hashedPassword,
      name: 'Administrador Farmasi',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create predefined interest rates based on README.md
  const interestRates = [
    { loanAmount: 500, weeklyPayment: 105, weeksCount: 6 },
    { loanAmount: 600, weeklyPayment: 110, weeksCount: 6 },
    { loanAmount: 700, weeklyPayment: 145, weeksCount: 6 },
    { loanAmount: 800, weeklyPayment: 165, weeksCount: 6 },
    { loanAmount: 1000, weeklyPayment: 210, weeksCount: 6 },
    { loanAmount: 1500, weeklyPayment: 320, weeksCount: 6 },
  ]

  for (const rate of interestRates) {
    await prisma.interestRate.upsert({
      where: { loanAmount: rate.loanAmount },
      update: {},
      create: {
        loanAmount: rate.loanAmount,
        weeklyPayment: rate.weeklyPayment,
        weeksCount: rate.weeksCount,
        isActive: true,
      },
    })
  }

  console.log('✅ Interest rates created')

  // Create sample clients
  const sampleClients = [
    {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '987654321',
      address: 'Av. Principal 123',
      city: 'Lima',
      state: 'Lima',
      documentType: 'DNI',
      documentNumber: '12345678',
      gender: 'FEMALE' as const,
      maritalStatus: 'MARRIED' as const,
      occupation: 'Comerciante',
    },
    {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '987654322',
      address: 'Jr. Los Olivos 456',
      city: 'Lima',
      state: 'Lima',
      documentType: 'DNI',
      documentNumber: '87654321',
      gender: 'MALE' as const,
      maritalStatus: 'SINGLE' as const,
      occupation: 'Taxista',
    },
    {
      firstName: 'Ana',
      lastName: 'Rodriguez',
      email: 'ana.rodriguez@email.com',
      phone: '987654323',
      address: 'Calle Las Flores 789',
      city: 'Lima',
      state: 'Lima',
      documentType: 'DNI',
      documentNumber: '11223344',
      gender: 'FEMALE' as const,
      maritalStatus: 'SINGLE' as const,
      occupation: 'Enfermera',
    },
  ]

  const createdClients = []
  for (const clientData of sampleClients) {
    const client = await prisma.client.upsert({
      where: { documentNumber: clientData.documentNumber },
      update: {},
      create: clientData,
    })
    createdClients.push(client)
  }

  console.log('✅ Sample clients created')

  // Create sample guarantees
  const sampleGuarantees = [
    {
      name: 'Vehículo Toyota Yaris 2018',
      value: 25000,
      description: 'Automóvil sedán en buen estado, color blanco',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Motocicleta Honda CB125',
      value: 8000,
      description: 'Motocicleta de trabajo, año 2020',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Equipo de sonido profesional',
      value: 15000,
      description: 'Sistema de audio para eventos',
      status: 'ACTIVE' as const,
    },
    {
      name: 'Televisor Samsung 55"',
      value: 3000,
      description: 'Smart TV 4K, prácticamente nuevo',
      status: 'ACTIVE' as const,
    },
  ]

  const createdGuarantees = []
  for (const guaranteeData of sampleGuarantees) {
    const guarantee = await prisma.guarantee.create({
      data: guaranteeData,
    })
    createdGuarantees.push(guarantee)
  }

  console.log('✅ Sample guarantees created')

  // Create sample loans
  const rate500 = await prisma.interestRate.findFirst({ where: { loanAmount: 500 } })
  const rate1000 = await prisma.interestRate.findFirst({ where: { loanAmount: 1000 } })

  if (rate500 && rate1000 && createdClients.length >= 2 && createdGuarantees.length >= 2) {
    // First loan - active
    const loan1 = await prisma.loan.create({
      data: {
        clientId: createdClients[0].id,
        interestRateId: rate500.id,
        guaranteeId: createdGuarantees[0].id,
        amount: rate500.loanAmount,
        weeklyPayment: rate500.weeklyPayment,
        totalAmount: rate500.weeklyPayment * rate500.weeksCount,
        balance: rate500.weeklyPayment * rate500.weeksCount,
        paidAmount: 0,
        status: 'ACTIVE',
        loanDate: new Date(),
        dueDate: addWeeks(new Date(), rate500.weeksCount),
      },
    })

    // Second loan - with some payments
    const loan2 = await prisma.loan.create({
      data: {
        clientId: createdClients[1].id,
        interestRateId: rate1000.id,
        guaranteeId: createdGuarantees[1].id,
        amount: rate1000.loanAmount,
        weeklyPayment: rate1000.weeklyPayment,
        totalAmount: rate1000.weeklyPayment * rate1000.weeksCount,
        balance: rate1000.weeklyPayment * (rate1000.weeksCount - 2), // 2 payments made
        paidAmount: rate1000.weeklyPayment * 2,
        status: 'ACTIVE',
        loanDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        dueDate: addWeeks(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), rate1000.weeksCount),
      },
    })

    // Create payments for second loan
    await prisma.payment.createMany({
      data: [
        {
          loanId: loan2.id,
          amount: rate1000.weeklyPayment,
          paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        },
        {
          loanId: loan2.id,
          amount: rate1000.weeklyPayment,
          paymentDate: new Date(), // Today
        },
      ],
    })

    // Update guarantees status
    await prisma.guarantee.update({
      where: { id: createdGuarantees[0].id },
      data: { status: 'USED' },
    })

    await prisma.guarantee.update({
      where: { id: createdGuarantees[1].id },
      data: { status: 'USED' },
    })

    // Create contracts
    await prisma.contract.createMany({
      data: [
        {
          clientId: createdClients[0].id,
          loanId: loan1.id,
          guaranteeId: createdGuarantees[0].id,
          startDate: new Date(),
          endDate: addWeeks(new Date(), rate500.weeksCount),
          amount: rate500.loanAmount,
          interest: (rate500.weeklyPayment * rate500.weeksCount) - rate500.loanAmount,
          installments: rate500.weeksCount,
          status: 'ACTIVE',
        },
        {
          clientId: createdClients[1].id,
          loanId: loan2.id,
          guaranteeId: createdGuarantees[1].id,
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          endDate: addWeeks(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), rate1000.weeksCount),
          amount: rate1000.loanAmount,
          interest: (rate1000.weeklyPayment * rate1000.weeksCount) - rate1000.loanAmount,
          installments: rate1000.weeksCount,
          status: 'ACTIVE',
        },
      ],
    })

    console.log('✅ Sample loans, payments and contracts created')
  }

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log('- Admin user: admin@farmasi.com / admin123')
  console.log('- 6 predefined interest rates')
  console.log('- 3 sample clients')
  console.log('- 4 sample guarantees')
  console.log('- 2 sample loans with payments')
  console.log('- 2 sample contracts')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })