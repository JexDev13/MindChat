# Frontend del Proyecto MindChat

Documentación completa del frontend de MindChat, construido con Next.js 16.1.6 y React 19.2.3.

## 📋 Tabla de Contenidos

- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías y Librerías](#tecnologías-y-librerías)
- [Rutas de la Aplicación](#rutas-de-la-aplicación)
- [Conexión con el Backend](#conexión-con-el-backend)
- [Gestión de Estado](#gestión-de-estado)
- [Componentes Principales](#componentes-principales)
- [Configuración](#configuración)

## 🏗️ Estructura del Proyecto

```
nextjs-app/
├── src/
│   ├── app/                          # App Router (Next.js 13+)
│   │   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   │   ├── login/               # Página de inicio de sesión
│   │   │   └── register/            # Página de registro
│   │   ├── (dashboard)/              # Grupo de rutas protegidas
│   │   │   ├── dashboard/           # Página principal del dashboard
│   │   │   ├── chat/                # Sistema de mensajería
│   │   │   ├── appointments/        # Gestión de citas
│   │   │   ├── profile/             # Perfil de usuario
│   │   │   └── layout.tsx           # Layout del dashboard
│   │   ├── layout.tsx               # Layout raíz
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Estilos globales
│   ├── components/                   # Componentes React
│   │   ├── auth/                    # Componentes de autenticación
│   │   ├── dashboard/               # Componentes del dashboard
│   │   ├── chat/                    # Componentes de chat
│   │   ├── appointments/            # Componentes de citas
│   │   ├── profile/                 # Componentes de perfil
│   │   ├── landing/                 # Componentes de landing
│   │   ├── shared/                  # Componentes compartidos
│   │   └── ui/                      # Componentes UI (shadcn/ui)
│   ├── lib/                         # Utilidades y configuración
│   │   ├── api/                     # Servicios de API
│   │   │   ├── client.ts           # Cliente Axios configurado
│   │   │   └── chat.service.ts     # Servicio de SignalR
│   │   ├── store/                   # Estado global (Zustand)
│   │   │   └── auth.store.ts       # Store de autenticación
│   │   ├── query-client.ts         # Configuración de React Query
│   │   └── utils.ts                 # Utilidades generales
│   └── middleware.ts                 # Middleware de Next.js
├── public/                          # Archivos estáticos
├── next.config.ts                   # Configuración de Next.js
├── tailwind.config.ts               # Configuración de Tailwind
├── tsconfig.json                    # Configuración de TypeScript
└── package.json                     # Dependencias del proyecto
```

## 🛠️ Tecnologías y Librerías

### Framework Principal
- **Next.js 16.1.6** - Framework React con SSR y App Router
- **React 19.2.3** - Librería de interfaz de usuario
- **TypeScript 5** - Superset tipado de JavaScript

### Estilos y UI
- **Tailwind CSS 4** - Framework CSS utility-first
- **tailwindcss-animate** - Animaciones para Tailwind
- **Framer Motion 12.29.2** - Librería de animaciones
- **Radix UI** - Componentes accesibles y sin estilos:
  - `@radix-ui/react-dialog` - Modales
  - `@radix-ui/react-dropdown-menu` - Menús desplegables
  - `@radix-ui/react-tabs` - Pestañas
  - `@radix-ui/react-avatar` - Avatares
  - `@radix-ui/react-accordion` - Acordeones
  - `@radix-ui/react-select` - Selectores
  - `@radix-ui/react-label` - Etiquetas
  - `@radix-ui/react-slot` - Composición de componentes
- **Lucide React 0.563.0** - Iconos
- **@tabler/icons-react 3.36.1** - Más iconos
- **class-variance-authority 0.7.1** - Gestión de variantes de clases
- **clsx 2.1.1** - Utilidad para clases condicionales
- **tailwind-merge 3.4.0** - Merge inteligente de clases Tailwind

### Gestión de Estado
- **Zustand 5.0.10** - Estado global ligero
- **@tanstack/react-query 5.90.20** - Gestión de estado del servidor y caché

### Comunicación con Backend
- **Axios 1.13.4** - Cliente HTTP
- **@microsoft/signalr 10.0.0** - WebSockets en tiempo real para chat

### Formularios y Validación
- **react-hook-form 7.71.1** - Gestión de formularios
- **@hookform/resolvers 5.2.2** - Resolvers para validación
- **zod 4.3.6** - Validación de esquemas TypeScript-first

### Utilidades
- **date-fns 4.1.0** - Manipulación de fechas
- **react-day-picker 9.13.0** - Selector de fechas
- **next-themes 0.4.6** - Gestión de temas (dark/light mode)
- **sonner 2.0.7** - Notificaciones toast
- **@tsparticles** - Efectos de partículas para landing

## 🗺️ Rutas de la Aplicación

### Rutas Públicas
| Ruta | Descripción | Archivo |
|------|-------------|---------|
| `/` | Landing page | `src/app/page.tsx` |
| `/login` | Inicio de sesión | `src/app/(auth)/login/page.tsx` |
| `/register` | Registro de usuario | `src/app/(auth)/register/page.tsx` |

### Rutas Protegidas (requieren autenticación)
| Ruta | Descripción | Archivo |
|------|-------------|---------|
| `/dashboard` | Dashboard principal | `src/app/(dashboard)/dashboard/page.tsx` |
| `/chat` | Sistema de mensajería en tiempo real | `src/app/(dashboard)/chat/page.tsx` |
| `/appointments` | Gestión de citas | `src/app/(dashboard)/appointments/page.tsx` |
| `/profile` | Perfil de usuario | `src/app/(dashboard)/profile/page.tsx` |

### Definición de Rutas

Las rutas están definidas usando el **App Router de Next.js 13+**, donde cada carpeta en `src/app` representa un segmento de ruta:

- **Grupos de rutas**: `(auth)` y `(dashboard)` son grupos que no afectan la URL pero permiten compartir layouts
- **Navegación programática**: Se utiliza `useRouter` de `next/navigation`
- **Enlaces**: Componente `Link` de `next/link`
- **Ruta activa**: `usePathname` hook para determinar la ruta actual

### Middleware y Protección de Rutas

El archivo **`src/middleware.ts`** maneja la protección de rutas:

```typescript
// Protege estas rutas
matcher: ['/dashboard/:path*', '/chat/:path*', '/appointments/:path*', '/profile/:path*']

// Redirige a /login si no hay token de autenticación
```

### Navegación en el Sidebar

Las rutas del dashboard están definidas en **`src/components/dashboard/Sidebar.tsx`**:

```typescript
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat", href: "/chat" },
  { icon: Calendar, label: "Appointments", href: "/appointments" },
  { icon: User, label: "Profile", href: "/profile" },
];
```

## 🔌 Conexión con el Backend

### Cliente API Principal

**Archivo**: `src/lib/api/client.ts`

Este archivo es el **punto central de conexión** con el backend:

```typescript
// Cliente Axios configurado
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_GATEWAY_URL,  // ← Aquí se define la URL base
  timeout: 10000,
});
```

#### ¿Dónde se define localhost:8080?

**🔧 Variable de Entorno**: `NEXT_PUBLIC_API_GATEWAY_URL`

Debe configurarse en un archivo `.env.local` en la raíz del proyecto Next.js:

**Ubicación**: `frontend/nextjs-app/.env.local`

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_CHAT_HUB_URL=http://localhost:5003/chatHub
```

> **Nota**: El archivo `.env.local` NO está en el repositorio por seguridad. Debes crearlo manualmente.

#### ¿Dónde se usa en el código?

El `apiClient` se importa y usa en todos los componentes que necesitan comunicarse con el backend:

**Ejemplo de uso** - `src/components/auth/LoginForm.tsx`:
```typescript
import apiClient from "@/lib/api/client";

// Luego en el código:
const response = await apiClient.post('/api/auth/patient/login', {
  email: values.email,
  password: values.password
});
```

Todas las peticiones HTTP pasan por este cliente, que automáticamente:
- Añade la URL base (`http://localhost:8080`)
- Incluye el token JWT en los headers
- Maneja errores de autenticación

**Interceptores**:
- **Request**: Añade el token de autenticación desde `localStorage`
- **Response**: Maneja errores 401 (no autorizado)

### Servicio de Chat en Tiempo Real

**Archivo**: `src/lib/api/chat.service.ts`

Utiliza **SignalR** para comunicación en tiempo real:

```typescript
// Conexión al Hub de SignalR
withUrl(process.env.NEXT_PUBLIC_CHAT_HUB_URL || "http://localhost:5003/chatHub")
```

**Variables de entorno requeridas**:
- `NEXT_PUBLIC_CHAT_HUB_URL` - URL del Chat Hub (por defecto: `http://localhost:5003/chatHub`)

**Eventos disponibles**:
- `ReceiveMessage` - Recibir mensajes
- `UserTyping` - Notificación de escritura
- `SendMessage` - Enviar mensaje
- `Typing` - Notificar que se está escribiendo

### Servicios Backend

La aplicación se conecta a los siguientes microservicios (a través del API Gateway):

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| API Gateway | 8080 | Punto de entrada único para todos los servicios |
| Auth Service | 5000 | Autenticación y autorización |
| Chat Service | 5003 | Mensajería en tiempo real (SignalR) |
| Clinical Service | 5001 | Datos clínicos y terapias |
| Appointment Service | 5002 | Gestión de citas |

### Configuración de Variables de Entorno

**⚠️ IMPORTANTE**: Debes crear manualmente un archivo `.env.local` en `frontend/nextjs-app/`

**Ubicación**: `frontend/nextjs-app/.env.local`

```env
# API Gateway - TODAS las peticiones HTTP pasan por aquí
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# Chat Hub - Conexión WebSocket de SignalR para chat en tiempo real
NEXT_PUBLIC_CHAT_HUB_URL=http://localhost:5003/chatHub
```

#### ¿Por qué `NEXT_PUBLIC_`?

En Next.js, las variables que comienzan con `NEXT_PUBLIC_` están disponibles en el navegador (cliente). Sin este prefijo, solo están disponibles en el servidor.

#### Referencia en el proyecto raíz

El archivo `env.example` en la raíz del proyecto (`d:\Projects\MindChat\env.example`) contiene la configuración para los microservicios backend, incluyendo:

```env
# API Gateway
API_GATEWAY_URL=http://localhost:8080
```

Esta es la URL donde apunta el API Gateway que Ocelot expone en el puerto 8080.

## 🗄️ Gestión de Estado

### Zustand - Estado Global

**Archivo**: `src/lib/store/auth.store.ts`

Store de autenticación persistente (localStorage):

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}
```

**Modelo de Usuario**:
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'patient' | 'psychologist';
  profilePictureUrl?: string;
}
```

### React Query - Estado del Servidor

**Archivo**: `src/lib/query-client.ts`

Configuración de TanStack Query para:
- Caché de datos del servidor
- Revalidación automática
- Manejo de estados de carga y error
- Mutaciones optimistas

## 🧩 Componentes Principales

### Estructura de Componentes

```
components/
├── auth/                    # Formularios de login/register
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── dashboard/               # Componentes del dashboard
│   ├── Sidebar.tsx         # Navegación lateral
│   ├── PatientWidgets.tsx  # Widgets para pacientes
│   └── PsychologistWidgets.tsx # Widgets para psicólogos
├── chat/                    # Sistema de chat
├── appointments/            # Gestión de citas
├── profile/                 # Perfil de usuario
│   └── ProfileSettings.tsx
├── landing/                 # Landing page
│   ├── HeroSection.tsx
│   └── FeaturesSection.tsx
├── shared/                  # Componentes reutilizables
│   ├── GlassCard.tsx
│   └── PageTransition.tsx
└── ui/                      # Componentes base (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── avatar.tsx
    └── ... (30+ componentes)
```

### Sistema de Diseño

Todos los componentes UI están basados en **shadcn/ui**, un sistema de componentes:
- Totalmente personalizables
- Basados en Radix UI (accesibilidad)
- Estilizados con Tailwind CSS
- TypeScript completo

## ⚙️ Configuración

### TypeScript

**Archivo**: `tsconfig.json`

- Target: ES2017
- JSX: react-jsx (React 19)
- Path alias: `@/*` → `./src/*`
- Strict mode activado

### Next.js

**Archivo**: `next.config.ts`

Configuración de imágenes remotas permitidas:
- `i.pravatar.cc` - Avatares de ejemplo
- `github.com` - GitHub
- `avatars.githubusercontent.com` - Avatares de GitHub

### Tailwind CSS

**Archivo**: `tailwind.config.ts`

- Modo oscuro por defecto
- Animaciones personalizadas
- Variables CSS para theming
- Responsive design

## 🚀 Scripts de Desarrollo

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (http://localhost:3000)

# Producción
npm run build        # Compilar para producción
npm run start        # Servidor de producción

# Linting
npm run lint         # ESLint
```

## 📝 Convenciones de Código

- **Componentes**: PascalCase (`LoginForm.tsx`)
- **Utilidades**: camelCase (`utils.ts`)
- **Hooks personalizados**: prefijo `use` (`useAuth`)
- **Componentes de servidor**: por defecto
- **Componentes de cliente**: directiva `"use client"`
- **Path alias**: usar `@/` para imports absolutos

## 🔐 Autenticación

El flujo de autenticación:

1. Usuario ingresa credenciales en `/login` o `/register`
2. Se envía petición al Auth Service vía API Gateway
3. Se recibe token JWT y datos del usuario
4. Se almacena en Zustand store (persistido en localStorage)
5. El token se incluye automáticamente en todas las peticiones (interceptor Axios)
6. El middleware valida el token en rutas protegidas
7. Logout limpia el store y redirige a `/login`

---

**Última actualización**: Enero 2026