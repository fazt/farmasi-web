import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
    }

    // Generate HTML contract template
    const htmlContent = generateContractHTML(contract)

    // For now, return HTML response
    // TODO: Implement PDF generation with libraries like puppeteer or jsPDF
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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd \'de\' MMMM \'del\' yyyy', { locale: es })
  }

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
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Contrato de Préstamo Personal</div>
        <div>FARMASI - Sistema de Préstamos Personales</div>
        <div>Contrato N° ${contract.id}</div>
    </div>

    <div class="section">
        <div class="section-title">PARTES CONTRATANTES</div>
        <div class="parties">
            <div class="party">
                <strong>EL PRESTAMISTA:</strong><br>
                FARMASI<br>
                Representado por: ${session.user?.name || 'Administrador'}<br>
                En adelante "LA EMPRESA"
            </div>
            <div class="party">
                <strong>EL PRESTATARIO:</strong><br>
                ${contract.client.firstName} ${contract.client.lastName}<br>
                ${contract.client.documentType || 'DNI'}: ${contract.client.documentNumber || 'No especificado'}<br>
                Email: ${contract.client.email || 'No especificado'}<br>
                Teléfono: ${contract.client.phone || 'No especificado'}<br>
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
                <td>${formatCurrency(contract.amount)}</td>
            </tr>
            <tr>
                <td>Intereses</td>
                <td>${formatCurrency(contract.interest)}</td>
            </tr>
            <tr>
                <td>Total a Pagar</td>
                <td>${formatCurrency(contract.amount + contract.interest)}</td>
            </tr>
            <tr>
                <td>Número de Cuotas</td>
                <td>${contract.installments} cuotas semanales</td>
            </tr>
            <tr>
                <td>Cuota Semanal</td>
                <td>${formatCurrency(contract.loan.weeklyPayment)}</td>
            </tr>
            <tr>
                <td>Fecha de Inicio</td>
                <td>${formatDate(contract.startDate)}</td>
            </tr>
            <tr>
                <td>Fecha de Vencimiento</td>
                <td>${formatDate(contract.endDate)}</td>
            </tr>
        </table>
    </div>

    <div class="guarantee-section">
        <div class="section-title">GARANTÍA</div>
        <p><strong>Descripción:</strong> ${contract.guarantee.name}</p>
        <p><strong>Valor Aproximado:</strong> ${formatCurrency(contract.guarantee.value)}</p>
        <p><strong>Estado:</strong> ${contract.guarantee.status}</p>
    </div>

    <div class="section">
        <div class="section-title">CLÁUSULAS</div>
        <p><strong>PRIMERA:</strong> EL CLIENTE reconoce haber recibido de LA EMPRESA la suma de ${formatCurrency(contract.amount)} en calidad de préstamo personal.</p>
        
        <p><strong>SEGUNDA:</strong> EL CLIENTE se compromete a pagar el préstamo en ${contract.installments} cuotas semanales de ${formatCurrency(contract.loan.weeklyPayment)} cada una, iniciando el ${formatDate(contract.startDate)}.</p>
        
        <p><strong>TERCERA:</strong> Como garantía del presente préstamo, EL CLIENTE constituye en prenda la garantía descrita anteriormente.</p>
        
        <p><strong>CUARTA:</strong> En caso de incumplimiento en el pago, LA EMPRESA podrá ejecutar la garantía para recuperar el monto adeudado.</p>
        
        <p><strong>QUINTA:</strong> EL CLIENTE puede realizar pagos anticipados sin penalidad, reduciendo proporcionalmente el saldo pendiente.</p>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">
                <div>LA EMPRESA</div>
                <div>${session.user?.name || 'Administrador'}</div>
                <div>Representante Legal</div>
            </div>
        </div>
        <div class="signature-box">
            <div class="signature-line">
                <div>EL CLIENTE</div>
                <div>${contract.client.firstName} ${contract.client.lastName}</div>
                <div>${contract.client.documentType || 'DNI'}: ${contract.client.documentNumber || ''}</div>
            </div>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>Documento generado el ${formatDate(new Date())}</p>
        <p>Sistema FARMASI - Préstamos Personales</p>
    </div>
</body>
</html>
  `
}