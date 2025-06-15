# FinancePlan - Gestión de Finanzas Personales

Una aplicación web completa para gestionar tus finanzas personales, con seguimiento de ingresos y gastos, categorización, estadísticas y gráficos.

## Características

- Autenticación de usuarios (registro y login)
- Registro de ingresos y gastos
- Categorización de transacciones
- Dashboard con estadísticas y gráficos
- Diseño responsive para todos los dispositivos
- Seguimiento de totales por categoría
- Visualización de tendencias financieras

## Tecnologías Utilizadas

- Frontend: React.js
- Backend: Node.js con Express
- Base de datos: MongoDB
- Autenticación: JWT
- Gráficos: Chart.js
- Estilos: Tailwind CSS

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- npm o yarn

## Instalación

1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
```

2. Instalar dependencias del backend
```bash
cd backend
npm install
```

3. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

4. Configurar variables de entorno
- Crear archivo `.env` en la carpeta backend basado en `.env.example`
- Crear archivo `.env` en la carpeta frontend basado en `.env.example`

5. Iniciar el servidor de desarrollo
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm start
```

## Estructura del Proyecto

```
financeplan/
├── backend/           # Servidor Node.js
├── frontend/          # Aplicación React
└── README.md
``` 