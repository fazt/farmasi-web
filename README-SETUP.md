# Farmasi - Sistema de Préstamos Personales

Sistema completo de gestión de préstamos personales desarrollado con Next.js, TypeScript, Prisma y PostgreSQL.

## ✨ Funcionalidades Implementadas

### 🏗️ Infraestructura Base
- ✅ Next.js 15 con App Router y Turbo
- ✅ TypeScript con configuración estricta
- ✅ Tailwind CSS v4 con Shadcn UI
- ✅ Sistema de autenticación con NextAuth.js
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Tema claro/oscuro con next-themes
- ✅ Layout responsive con sidebar colapsible

### 👥 Gestión de Clientes
- ✅ CRUD completo con validaciones
- ✅ Búsqueda y filtrado avanzado
- ✅ Paginación de resultados
- ✅ Validaciones de negocio

### 💰 Tasas de Interés
- ✅ Calculadora automática de intereses
- ✅ Tasas predefinidas según README original
- ✅ Sistema de 6 semanas de plazo
- ✅ Estados activo/inactivo

### 🛡️ Gestión de Garantías
- ✅ CRUD con soporte para fotos
- ✅ Estados: Activa, Inactiva, En Uso
- ✅ Validaciones de integridad referencial
- ✅ Estadísticas de valor total

### 🏦 Gestión de Préstamos
- ✅ Creación con validaciones de negocio
- ✅ Cálculo automático de montos y fechas
- ✅ Estados: Activo, Pagado, Vencido, Cancelado
- ✅ Detección automática de préstamos vencidos
- ✅ Progreso visual de pagos
- ✅ Dashboard con estadísticas

### 💳 Gestión de Pagos
- ✅ Búsqueda inteligente de préstamos
- ✅ Registro de pagos con actualización automática
- ✅ Tipos: Cuota regular, pago adelantado, pago parcial, pago final
- ✅ Estadísticas de recaudación
- ✅ Historial completo de pagos

### 📄 Gestión de Contratos
- ✅ Generación automática desde préstamos
- ✅ Plantilla HTML profesional
- ✅ Descarga como HTML (base para PDF)
- ✅ Estados: Activo, Completado, Cancelado
- ✅ Información completa del préstamo y garantía

## 🚀 Configuración e Instalación

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar e instalar dependencias
```bash
git clone <repository-url>
cd farmasi-web
npm install
```

### 2. Configurar base de datos
```bash
# Crear archivo .env basado en .env.example
cp .env.example .env

# Editar .env con tu configuración de PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/farmasi_db?schema=public"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="tu-clave-secreta-aqui"
```

### 3. Configurar Prisma
```bash
# Generar cliente de Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push

# Poblar con datos de ejemplo
npm run db:seed
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:3000`

## 🔐 Usuario de Administración

Después de ejecutar el seed, puedes iniciar sesión con:
- **Email:** admin@farmasi.com
- **Password:** admin123

## 📊 Datos de Ejemplo

El script de seed crea:
- 1 usuario administrador
- 6 tasas de interés predefinidas (500-1500 soles)
- 3 clientes de ejemplo
- 4 garantías de ejemplo
- 2 préstamos con pagos
- 2 contratos

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbo

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Sincronizar esquema
npm run db:migrate   # Crear migración
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar datos de ejemplo

# Código
npm run lint         # Verificar código con Biome
npm run format       # Formatear código con Biome

# Producción
npm run build        # Construir aplicación
npm run start        # Servidor de producción
```

## 🏗️ Arquitectura del Sistema

### Estructura de Carpetas
```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   └── dashboard/         # Páginas del dashboard
├── components/            # Componentes React
│   ├── ui/               # Componentes base de Shadcn
│   ├── layout/           # Componentes de layout
│   ├── clients/          # Componentes de clientes
│   ├── loans/            # Componentes de préstamos
│   ├── payments/         # Componentes de pagos
│   ├── guarantees/       # Componentes de garantías
│   └── contracts/        # Componentes de contratos
├── lib/                  # Utilidades y configuraciones
│   ├── validations/      # Esquemas de validación Zod
│   ├── auth.ts          # Configuración NextAuth
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Utilidades generales
└── scripts/              # Scripts de utilidad
    └── seed.ts          # Script de población de datos
```

### Tecnologías Utilizadas

- **Framework:** Next.js 15 con App Router
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js con provider credentials
- **UI:** Tailwind CSS + Shadcn UI (estilo New York)
- **Validaciones:** Zod + React Hook Form
- **Iconos:** Lucide React
- **Calidad de código:** Biome (ESLint + Prettier)

## 🔐 Características de Seguridad

- Autenticación basada en sesiones JWT
- Middleware de protección de rutas
- Validación de datos del lado servidor y cliente
- Sanitización de inputs
- Protección CSRF integrada

## 📱 Características de UI

- **Responsive:** Funciona en desktop, tablet y móvil
- **Tema:** Soporte para modo claro y oscuro
- **Navegación:** Sidebar colapsible con navegación intuitiva
- **Tablas:** Búsqueda, filtrado, paginación y ordenamiento
- **Formularios:** Validaciones en tiempo real
- **Estadísticas:** Dashboards con métricas importantes
- **Breadcrumbs:** Navegación contextual en todas las páginas

## 🔧 Validaciones de Negocio

- Un cliente solo puede tener un préstamo activo
- No se pueden eliminar clientes con préstamos activos
- No se pueden eliminar garantías en uso
- Las garantías se marcan automáticamente como "En Uso" al crear préstamos
- Los pagos actualizan automáticamente el saldo del préstamo
- Los préstamos se marcan como "Pagado" cuando el saldo llega a cero
- Las garantías se liberan automáticamente cuando el préstamo se completa

## 📈 Próximas Mejoras

- [ ] Generación de PDF real para contratos (usando Puppeteer o jsPDF)
- [ ] Sistema de notificaciones por email con Brevo
- [ ] Dashboard con gráficos y métricas avanzadas
- [ ] Sistema de reportes exportables
- [ ] Módulo de configuración de empresa
- [ ] API REST documentada con OpenAPI
- [ ] Tests unitarios e integración
- [ ] Deploy automatizado

## 🆘 Solución de Problemas

### Error de conexión a base de datos
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `.env`
- Ejecutar `npm run db:push` para sincronizar

### Error al iniciar sesión
- Verificar que el usuario admin fue creado con `npm run db:seed`
- Verificar NEXTAUTH_SECRET en `.env`

### Errores de TypeScript
- Ejecutar `npm run db:generate` para actualizar tipos de Prisma
- Verificar versiones de dependencias

## 📞 Soporte

Para problemas o preguntas técnicas:
1. Verificar la configuración de base de datos
2. Revisar los logs del servidor
3. Consultar la documentación de las tecnologías utilizadas