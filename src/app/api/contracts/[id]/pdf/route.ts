import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Remove auth check for now
    // const session = await getServerSession(authOptions)
    // 
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = await params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        loan: {
          include: {
            interestRate: true,
            payments: {
              orderBy: { paymentDate: 'asc' },
            },
          },
        },
        guarantee: true,
        template: true,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
    }

    // Generate HTML content with template variables replaced
    const htmlContent = generateContractHTML(contract)

    // Return HTML response that can be used by frontend to generate PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="contrato-${contract.client.firstName}-${contract.client.lastName}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating contract PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el contrato' },
      { status: 500 }
    )
  }
}

function generateContractHTML(contract: any): string {
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(numValue || 0)
  }

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd \'de\' MMMM \'del\' yyyy', { locale: es })
  }

  // Get template content or use default
  let templateContent = contract.template?.richContent || contract.template?.content || contract.content
  
  // If no template content, use default template
  if (!templateContent) {
    templateContent = getDefaultContractTemplate()
  }

  // Replace template variables with actual contract data
  const replacedContent = replaceTemplateVariables(templateContent, contract, formatCurrency, formatDate)

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrato de Préstamo Personal</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 15px;
        }
        .parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .party {
            width: 45%;
        }
        .terms-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .terms-table th,
        .terms-table td {
            border: 1px solid #333;
            padding: 10px;
            text-align: left;
        }
        .terms-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 40%;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
        }
        .guarantee-section {
            background-color: #f9f9f9;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        /* Additional styles for rich content */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 10px;
        }
        ul, ol {
            margin-bottom: 15px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
        strong {
            font-weight: bold;
        }
        em {
            font-style: italic;
        }
        u {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Contrato de Préstamo Personal</div>
        <div>FARMASI - Sistema de Préstamos Personales</div>
        <div>Contrato N° ${contract.id}</div>
    </div>

    <div class="contract-content">
        ${replacedContent}
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>Documento generado el ${formatDate(new Date())}</p>
        <p>Sistema FARMASI - Préstamos Personales</p>
    </div>
</body>
</html>
  `
}

function replaceTemplateVariables(content: string, contract: any, formatCurrency: Function, formatDate: Function): string {
  // Define all available variables
  const variables: { [key: string]: string } = {
    // Contract info
    'contract.id': contract.id,
    'contract.numero': contract.id,
    'contract.status': contract.status === 'ACTIVE' ? 'Activo' : contract.status === 'COMPLETED' ? 'Completado' : 'Cancelado',
    'contract.estado': contract.status === 'ACTIVE' ? 'Activo' : contract.status === 'COMPLETED' ? 'Completado' : 'Cancelado',
    
    // Client info
    'cliente.nombre': contract.client.firstName,
    'cliente.apellido': contract.client.lastName,
    'cliente.nombreCompleto': `${contract.client.firstName} ${contract.client.lastName}`,
    'cliente.tipoDocumento': contract.client.documentType || 'DNI',
    'cliente.numeroDocumento': contract.client.documentNumber || 'No especificado',
    'cliente.email': contract.client.email || 'No especificado',
    'cliente.telefono': contract.client.phone || 'No especificado',
    
    // Loan info
    'prestamo.monto': formatCurrency(contract.amount),
    'prestamo.intereses': formatCurrency(contract.interest),
    'prestamo.total': formatCurrency(Number(contract.amount) + Number(contract.interest)),
    'prestamo.cuotas': contract.installments.toString(),
    'prestamo.cuotaSemanal': formatCurrency(contract.loan.weeklyPayment),
    'prestamo.fechaInicio': formatDate(contract.startDate),
    'prestamo.fechaVencimiento': formatDate(contract.endDate),
    
    // Guarantee info
    'garantia.nombre': contract.guarantee.name,
    'garantia.valor': formatCurrency(contract.guarantee.value),
    'garantia.estado': contract.guarantee.status,
    'garantia.descripcion': contract.guarantee.description || 'Sin descripción',
    
    // System info
    'sistema.fecha': formatDate(new Date()),
    'empresa.nombre': 'FARMASI',
    'empresa.representante': 'Administrador',
  }

  // Replace all variables in the format {{variable}}
  let replacedContent = content
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    replacedContent = replacedContent.replace(regex, value)
  })

  return replacedContent
}

function getDefaultContractTemplate(): string {
  return `
    <div class="section">
        <div class="section-title">PARTES CONTRATANTES</div>
        <div class="parties">
            <div class="party">
                <strong>EL PRESTAMISTA:</strong><br>
                {{empresa.nombre}}<br>
                Representado por: {{empresa.representante}}<br>
                En adelante "LA EMPRESA"
            </div>
            <div class="party">
                <strong>EL PRESTATARIO:</strong><br>
                {{cliente.nombreCompleto}}<br>
                {{cliente.tipoDocumento}}: {{cliente.numeroDocumento}}<br>
                Email: {{cliente.email}}<br>
                Teléfono: {{cliente.telefono}}<br>
                En adelante "EL CLIENTE"
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">TÉRMINOS DEL PRÉSTAMO</div>
        <table class="terms-table">
            <tr>
                <th>Concepto</th>
                <th>Valor</th>
            </tr>
            <tr>
                <td>Monto del Préstamo</td>
                <td>{{prestamo.monto}}</td>
            </tr>
            <tr>
                <td>Intereses</td>
                <td>{{prestamo.intereses}}</td>
            </tr>
            <tr>
                <td>Total a Pagar</td>
                <td>{{prestamo.total}}</td>
            </tr>
            <tr>
                <td>Número de Cuotas</td>
                <td>{{prestamo.cuotas}} cuotas semanales</td>
            </tr>
            <tr>
                <td>Cuota Semanal</td>
                <td>{{prestamo.cuotaSemanal}}</td>
            </tr>
            <tr>
                <td>Fecha de Inicio</td>
                <td>{{prestamo.fechaInicio}}</td>
            </tr>
            <tr>
                <td>Fecha de Vencimiento</td>
                <td>{{prestamo.fechaVencimiento}}</td>
            </tr>
        </table>
    </div>

    <div class="guarantee-section">
        <div class="section-title">GARANTÍA</div>
        <p><strong>Descripción:</strong> {{garantia.nombre}}</p>
        <p><strong>Valor Aproximado:</strong> {{garantia.valor}}</p>
        <p><strong>Estado:</strong> {{garantia.estado}}</p>
    </div>

    <div class="section">
        <div class="section-title">CLÁUSULAS</div>
        <p><strong>PRIMERA:</strong> EL CLIENTE reconoce haber recibido de LA EMPRESA la suma de {{prestamo.monto}} en calidad de préstamo personal.</p>
        
        <p><strong>SEGUNDA:</strong> EL CLIENTE se compromete a pagar el préstamo en {{prestamo.cuotas}} cuotas semanales de {{prestamo.cuotaSemanal}} cada una, iniciando el {{prestamo.fechaInicio}}.</p>
        
        <p><strong>TERCERA:</strong> Como garantía del presente préstamo, EL CLIENTE constituye en prenda la garantía descrita anteriormente.</p>
        
        <p><strong>CUARTA:</strong> En caso de incumplimiento en el pago, LA EMPRESA podrá ejecutar la garantía para recuperar el monto adeudado.</p>
        
        <p><strong>QUINTA:</strong> EL CLIENTE puede realizar pagos anticipados sin penalidad, reduciendo proporcionalmente el saldo pendiente.</p>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">
                <div>LA EMPRESA</div>
                <div>{{empresa.representante}}</div>
                <div>Representante Legal</div>
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                <div>EL CLIENTE</div>
                <div>{{cliente.nombreCompleto}}</div>
                <div>{{cliente.tipoDocumento}}: {{cliente.numeroDocumento}}</div>
            </div>
        </div>
    </div>
  `
}