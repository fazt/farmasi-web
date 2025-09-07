### Farmasi

Farmasi es una aplicacion que ayuda a una empresa que hace  
prestamos personales. 

Caracteristicas principales:

- Administracion de clientes (CRUD)
- Administracion de prestamos (CRUD)
- Administracion de pagos (CRUD)
- Administracion de intereses (CRUD)
- Administracion de Garantias (CRUD)
- Administracion de Contratos (CRUD)

### Caracteristica de la autenticacion:
- Login
- No se pueden registrar clientes Registro desde la interfaz, se tiene que usar un script que solo el desarrollador puede ejecutar.
- Recuperacion de contraseña
- Verificacion de email
- Verificacion de telefono
- Verificacion de documento


### Caracteristicas de la interfaz:
- Interfaz responsive
- Interfaz minimalista
- Interfaz intuitiva
- Interfaz con animaciones
- Interfaz con transiciones

### Caracteristicas de la base de datos:
- Base de datos relacional postgresql usando prisma

### Caracteristicas de Clientes:

- A cada cliente se le pide datos como:
  - Nombre (obligatorio)
  - Apellido (obligatorio)
  - Email (opcional)
  - Telefono (opcional)
  - Direccion (opcional)
  - Ciudad (opcional)
  - Estado (opcional)
  - Tipo de documento (opcional)
  - Numero de documento (opcional)
  - Fecha de nacimiento (opcional)
  - Genero (opcional)
  - Estado civil (opcional)
  - Ocupacion (opcional)
  - Fecha de registro (obligatorio por defecto la fecha actual)

### Caracteristicas de Tasas de Interes:

Explicacion de como funcionan los prestamos personales en Farmasi:
- El cliente puede solicitar un prestamo por montos establecidos y que en plazos de cada 6 semanas se pague un cuota, por ejemplo:
-  de 500 soles, se paga 105 soles cada 6 semanas.
- de 600 soles, se paga 110 soles cada 6 semanas.
- de 700 soles, se paga 145 soles cada 6 semanas.
- de 800 soles, se paga 165 soles cada 6 semanas.
- de 1000 soles, se paga 210 soles cada 6 semanas.
- de 1500 soles, se paga 320 soles cada 6 semanas.

Se debe crear una interfaz que permita crear mas intereses para los prestamos. siempre es de 6 semanas el plazo, un cliente puede abonar un monto mayor y acabar su prestamo antes de tiempo.

en la ui por ejemplo se podria crear un input que te pida el monto y el plazo en semanas y te devuelva el interes. Aunque si se escribe el interes, se debe calcular el monto. El plazo siempre es de 6 semanas.

### Caracteristicas de Prestamos:

- A cada prestamo se le pide datos como:
  - Cliente (obligatorio)
  - Monto (obligatorio) que venga de la tabla de tasas de interes.
  - Fecha de prestamo (obligatorio por defecto la fecha actual)
  - Fecha de pago (obligatorio por defecto la fecha actual)
  - Fecha de vencimiento (obligatorio por defecto la fecha actual)
- Todos los clientes dejan garantia, y se debe registrar la garantia. Esta puede ser un vehiculo, un inmueble, un terreno, un negocio, etc. El sistema solo pide el nombre de la garantia, y el valor de la garantia aproximada en soles, aunque no es obligatorio. y tambien permite tomar una foto para mostrar la garantia.

### Caracteristicas de Pagos:

Para buscar un prestamo, se debe buscar por el cliente, usando datos como: nombre, apellido, email, telefono, documento.

Cuando se registra un pago, se debe actualizar el saldo del prestamo. y se debe actualizar la fecha de pago.
y si el saldo del prestamo es 0, se debe actualizar el estado del prestamo a "pagado".

Se debe tener en cuenta que el cliente puede abonar un monto mayor y acabar su prestamo antes de tiempo.

### Caracteristicas de Garantias:

Debe haber una pagina para registrar las garantias o administrar las garantias.

- A cada garantia se le pide datos como:
  - Nombre (obligatorio)
  - Valor (obligatorio)
  - Foto (opcional)
  - Descripcion (opcional)
  - Fecha de registro (obligatorio por defecto la fecha actual)
  - Estado (obligatorio por defecto "activo")

### Caracteristicas de Contratos:

Debe haber una pagina para registrar los contratos o administrar los contratos.

- A cada contrato se le pide datos como:
  - Cliente (obligatorio)
  - Garantia (obligatorio)
  - Prestamo (obligatorio)
  - Fecha de inicio (obligatorio por defecto la fecha actual)
  - Fecha de fin (obligatorio por defecto la fecha actual)
  - Monto (obligatorio)
  - Interes (obligatorio)
  - Cuotas (obligatorio)
  - Fecha de registro (obligatorio por defecto la fecha actual)
  - Estado (obligatorio por defecto "activo")

- El administrador puede ver el contrato de un cliente, y puede descargar el contrato en pdf.
- Se puede enviar el contrato por email al cliente, y se puede imprimir el contrato.
- el administrador puede cargar su firma para el contrato.
- El cliente necesita tomar una foto a su documento de identidad, parte delantera y parte trasera.

### Caracteristicas  a futuro:

Caracteristicas a futuro, y que aun no estan implementadas ni se tiene en cuenta en la interfaz actual, ni se deben implementar en el proyecto:

- Integraciones con la sunat para emitir facturas o boletas de pago.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Consideraciones de Nextjs:

- No uses server actions, y usa API routes. Trata que la pagina haga uso de React server components y si hay posibilidad de consultar directamente a prisma, hazlo. y luego para casos que necesites interactividad del lado cliente o logica de frontend usa React client components.
- Usa Shadcn UI para los componentes de la interfaz.
- considera tener interfaz Oscura y clara usando next-themes
- considera usar authjs para la autenticacion, usando credentials

### Consideraciones de servicios de la nube:

- Usa brevo para el envio de emails.

### Consieraciones de UI:

- Se puede colapsar el menu lateral, y se puede expandir.
- Debe haber una pagina para editar el propio perfil del usuario.
- Cada pagina debe tener un breadcrumb para navegar entre las paginas.
- Debe poder haber paginacion en las tablas.
- Debe poder haber busqueda en las tablas.
- Debe poder haber ordenamiento en las tablas.
- Debe poder haber filtrado en las tablas.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
