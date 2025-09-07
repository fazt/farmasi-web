import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import PDFDocument from 'pdfkit'

// Get week number starting from Sunday (ISO week but starting Sunday)
const getWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const startOfWeek = new Date(startOfYear)
  
  // Find first Sunday of the year
  const dayOfWeek = startOfYear.getDay()
  if (dayOfWeek !== 0) {
    startOfWeek.setDate(startOfYear.getDate() - dayOfWeek)
  }
  
  const diffTime = date.getTime() - startOfWeek.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

// Get date range for a specific week group
const getWeekDateRange = (weekNumber: number, year: number) => {
  const startOfYear = new Date(year, 0, 1)
  const firstSunday = new Date(startOfYear)
  const dayOfWeek = startOfYear.getDay()
  if (dayOfWeek !== 0) {
    firstSunday.setDate(startOfYear.getDate() - dayOfWeek)
  }
  
  const weekStart = new Date(firstSunday)
  weekStart.setDate(firstSunday.getDate() + (weekNumber - 1) * 7)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  return { weekStart, weekEnd }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'excel'
    const search = searchParams.get('search') || ''
    const group = searchParams.get('group') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { loan: { client: { firstName: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { lastName: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { email: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { phone: { contains: search, mode: 'insensitive' as const } } } },
        { loan: { client: { documentNumber: { contains: search, mode: 'insensitive' as const } } } },
      ]
    }

    // Filter by group (week number) if specified
    if (group) {
      const weekNumber = parseInt(group)
      const currentYear = new Date().getFullYear()
      const { weekStart, weekEnd } = getWeekDateRange(weekNumber, currentYear)
      
      where.paymentDate = {
        gte: weekStart,
        lte: weekEnd,
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        loan: {
          include: {
            client: true,
            interestRate: true,
          },
        },
      },
    })

    if (format === 'excel') {
      return generateExcelExport(payments, group)
    } else if (format === 'pdf') {
      return generatePDFExport(payments, group)
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting payments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateExcelExport(payments: any[], group: string) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  if (payments.length === 0) {
    // Create empty sheet with headers
    const data = [{
      'Cliente': '',
      'Documento': '',
      'Teléfono': '',
      'Email': '',
      'Monto del Pago': '',
      'Fecha de Pago': '',
      'Cuota Semanal': '',
      'Monto del Préstamo': '',
      'Total a Pagar': '',
      'Monto Pagado': '',
      'Saldo Restante': '',
      'Estado del Préstamo': '',
      'Semana del Año': '',
      'Fecha de Registro': '',
    }]
    
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    
    const sheetName = group ? `Grupo ${group}` : 'Todos los Pagos'
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pagos-${group ? `grupo-${group}` : 'todos'}-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  }

  const data = payments.map((payment) => ({
    'Cliente': `${payment.loan.client.firstName} ${payment.loan.client.lastName}`,
    'Documento': payment.loan.client.documentNumber || '',
    'Teléfono': payment.loan.client.phone || '',
    'Email': payment.loan.client.email || '',
    'Monto del Pago': Number(payment.amount),
    'Fecha de Pago': new Date(payment.paymentDate).toLocaleDateString('es-PE'),
    'Cuota Semanal': Number(payment.loan.interestRate.weeklyPayment),
    'Monto del Préstamo': Number(payment.loan.amount),
    'Total a Pagar': Number(payment.loan.totalAmount),
    'Monto Pagado': Number(payment.loan.paidAmount),
    'Saldo Restante': Number(payment.loan.balance),
    'Estado del Préstamo': payment.loan.status === 'PAID' ? 'Pagado' :
                          payment.loan.status === 'ACTIVE' ? 'Activo' : 
                          payment.loan.status === 'OVERDUE' ? 'Vencido' : 'Cancelado',
    'Semana del Año': getWeekNumber(new Date(payment.paymentDate)),
    'Fecha de Registro': new Date(payment.createdAt).toLocaleDateString('es-PE'),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  
  const sheetName = group ? `Grupo ${group}` : 'Todos los Pagos'
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }))
  worksheet['!cols'] = colWidths

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="pagos-${group ? `grupo-${group}` : 'todos'}-${new Date().toISOString().split('T')[0]}.xlsx"`,
    },
  })
}

function generatePDFExport(payments: any[], group: string) {
  const doc = new PDFDocument({ margin: 50 })
  const chunks: Buffer[] = []

  doc.on('data', (chunk) => chunks.push(chunk))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  // Title
  doc.fontSize(18).text('Reporte de Pagos', { align: 'center' })
  doc.moveDown()

  if (group) {
    const weekNumber = parseInt(group)
    const currentYear = new Date().getFullYear()
    const { weekStart, weekEnd } = getWeekDateRange(weekNumber, currentYear)
    
    doc.fontSize(14).text(`Grupo ${group} (${weekStart.toLocaleDateString('es-PE')} - ${weekEnd.toLocaleDateString('es-PE')})`, { align: 'center' })
  } else {
    doc.fontSize(14).text('Todos los Pagos', { align: 'center' })
  }

  doc.moveDown()
  doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString('es-PE')}`)
  doc.text(`Total de registros: ${payments.length}`)
  doc.moveDown()

  // Summary
  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
  doc.text(`Monto total recaudado: ${formatCurrency(totalAmount)}`)
  doc.moveDown()

  // Table headers
  const startY = doc.y
  const rowHeight = 20
  let currentY = startY

  doc.fontSize(10)
  doc.text('Cliente', 50, currentY)
  doc.text('Monto', 150, currentY)
  doc.text('Fecha', 220, currentY)
  doc.text('Estado', 290, currentY)
  doc.text('Saldo', 350, currentY)
  doc.text('Semana', 420, currentY)

  currentY += rowHeight
  doc.moveTo(50, currentY).lineTo(500, currentY).stroke()
  currentY += 5

  // Table rows
  if (payments.length === 0) {
    doc.text('No hay pagos registrados para los criterios seleccionados.', 50, currentY)
  } else {
    payments.forEach((payment) => {
      if (currentY > 700) { // New page if needed
        doc.addPage()
        currentY = 50
      }

      const clientName = `${payment.loan.client.firstName} ${payment.loan.client.lastName}`
      const weekNumber = getWeekNumber(new Date(payment.paymentDate))
      
      doc.text(clientName.substring(0, 15), 50, currentY)
      doc.text(formatCurrency(Number(payment.amount)), 150, currentY)
      doc.text(new Date(payment.paymentDate).toLocaleDateString('es-PE'), 220, currentY)
      doc.text(payment.loan.status === 'PAID' ? 'Pagado' : 'Activo', 290, currentY)
      doc.text(formatCurrency(Number(payment.loan.balance)), 350, currentY)
      doc.text(weekNumber.toString(), 420, currentY)
      
      currentY += rowHeight
    })
  }

  doc.end()

  return new Promise<NextResponse>((resolve) => {
    doc.on('end', () => {
      const buffer = Buffer.concat(chunks)
      resolve(new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="pagos-${group ? `grupo-${group}` : 'todos'}-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      }))
    })
  })
}