# 🎉 Frontend Integrado con Microservicios

## ✅ Cambios Realizados

### 1. Variables de Entorno (`.env.local`)
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080
NEXT_PUBLIC_CHAT_HUB_URL=http://localhost:5003/chatHub
NEXT_PUBLIC_APP_NAME=MindChat
```

### 2. Servicios API Creados

#### `lib/api/auth.service.ts`
- `login(email, password)` → `/api/auth/login`
- `register(data)` → `/api/auth/register`
- `logout()`

#### `lib/api/appointments.service.ts`
- `getAll()` → GET `/api/appointments`
- `getById(id)` → GET `/api/appointments/{id}`
- `getByPatient(patientId)` → GET `/api/appointments/patient/{patientId}`
- `getByPsychologist(psychologistId)` → GET `/api/appointments/psychologist/{psychologistId}`
- `getUpcoming()` → GET `/api/appointments/upcoming`
- `create(data)` → POST `/api/appointments`
- `update(id, data)` → PUT `/api/appointments/{id}`
- `updateStatus(id, status)` → PATCH `/api/appointments/{id}/status`
- `cancel(id)` → PATCH `/api/appointments/{id}/cancel`
- `delete(id)` → DELETE `/api/appointments/{id}`

#### `lib/api/chat-rest.service.ts`

**Session Requests:**
- `sessionRequestsService.getAll()`
- `sessionRequestsService.getPending()`
- `sessionRequestsService.getById(id)`
- `sessionRequestsService.getByPatient(patientId)`
- `sessionRequestsService.getByPsychologist(psychologistId)`
- `sessionRequestsService.create(data)`
- `sessionRequestsService.assignPsychologist(id, psychologistId)`
- `sessionRequestsService.updateStatus(id, status)`
- `sessionRequestsService.delete(id)`

**Chats:**
- `chatsService.getById(id)`
- `chatsService.getWithMessages(id)`
- `chatsService.getBySessionRequest(sessionRequestId)`
- `chatsService.create(sessionRequestId)`
- `chatsService.close(id)`
- `chatsService.delete(id)`

**Messages:**
- `messagesService.getByChatId(chatId)` - Obtener historial
- `messagesService.send(data)` - **Usar SignalR en su lugar**
- `messagesService.delete(id)`

### 3. SignalR Actualizado (`lib/api/chat.service.ts`)

```typescript
// Conectar
await chatService.connect(token);

// Unirse a un chat
await chatService.joinChat(chatId);

// Enviar mensaje
await chatService.sendMessage(chatId, message);

// Indicar que está escribiendo
await chatService.typing(chatId);
await chatService.stopTyping(chatId);

// Salir del chat
await chatService.leaveChat(chatId);

// Cerrar chat
await chatService.closeChat(chatId);

// Escuchar eventos
chatService.on("ReceiveMessage", (data) => { /* ... */ });
chatService.on("UserJoined", (data) => { /* ... */ });
chatService.on("UserTyping", (data) => { /* ... */ });
chatService.on("ChatHistory", (messages) => { /* ... */ });
```

### 4. Componente ChatWindow Actualizado

✅ Conexión real a SignalR  
✅ Carga de historial de mensajes desde API REST  
✅ Envío de mensajes vía SignalR  
✅ Indicadores de "escribiendo..." en tiempo real  
✅ Estado de conexión (Online/Offline)  
✅ Auto-scroll a nuevos mensajes  
✅ Manejo de errores con toast notifications  

### 5. LoginForm Actualizado

✅ Endpoint corregido: `/api/auth/login` (no `/api/auth/patient/login`)  
✅ Manejo de respuesta del API Gateway  
✅ Token guardado en localStorage y cookies  
✅ Zustand store actualizado correctamente  

### 6. Middleware Simplificado

✅ Rutas públicas: `/`, `/login`, `/register`  
✅ Redirección automática a `/login` si no hay token  
✅ Guarda ruta de origen en query param `?from=`  

## 🚀 Cómo Usar

### 1. Iniciar Backend

```bash
# Terminal 1: API Gateway
cd infra/api-gateway
dotnet run

# Terminal 2: Auth Service
cd services/auth-service
dotnet run

# Terminal 3: Chat Service
cd services/chat-service
dotnet run

# Terminal 4: Appointment Service
cd services/servicio-citas
dotnet run
```

O con Docker:
```bash
docker-compose up
```

### 2. Iniciar Frontend

```bash
cd frontend/nextjs-app
npm install  # Primera vez
npm run dev
```

Abrir: `http://localhost:3000`

## 📝 Ejemplos de Uso en Componentes

### Login
```typescript
import { authService } from '@/lib/api/auth.service';

const handleLogin = async () => {
  const response = await authService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  // Token ya está guardado automáticamente
};
```

### Crear Cita
```typescript
import { appointmentsService } from '@/lib/api/appointments.service';

const createAppointment = async () => {
  const appointment = await appointmentsService.create({
    patientId: user.id,
    psychologistId: psychologist.id,
    scheduledDate: '2026-02-01T10:00:00',
    durationMinutes: 60,
    notes: 'Primera consulta'
  });
};
```

### Solicitud de Sesión
```typescript
import { sessionRequestsService } from '@/lib/api/chat-rest.service';

const requestSession = async () => {
  const request = await sessionRequestsService.create({
    patientId: user.id,
    initialMessage: 'Necesito ayuda con ansiedad'
  });
};
```

### Chat en Tiempo Real
```typescript
import { chatService } from '@/lib/api/chat.service';

// Ya está integrado en ChatWindow.tsx
// Solo necesitas pasar el conversationId
<ChatWindow conversationId={chatId} />
```

## 🔧 Próximos Pasos

1. **Crear componentes de Appointments** para listar y crear citas
2. **Página de Session Requests** para que psicólogos acepten/rechacen
3. **Dashboard** con estadísticas usando React Query
4. **Notificaciones** cuando llegan mensajes
5. **Búsqueda de psicólogos** (necesita clinical-service endpoint)

## ⚠️ Importante

- **REST API** → Todo pasa por API Gateway (puerto 8080)
- **SignalR** → Conexión directa al chat-service (puerto 5003)
- El token JWT se envía automáticamente en todas las peticiones
- SignalR usa el token para autenticación WebSocket

## 🐛 Verificación

Antes de probar, asegúrate de:

1. ✅ Bases de datos creadas en SQL Server
2. ✅ API Gateway corriendo en puerto 8080
3. ✅ Chat Service corriendo en puerto 5003
4. ✅ Archivo `.env.local` creado en `frontend/nextjs-app`
5. ✅ `npm install` ejecutado

Ahora el frontend está **100% integrado** con tus microservicios 🎉
