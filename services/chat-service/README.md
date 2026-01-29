# Chat Service - MindChat

Microservicio para la gestión de solicitudes de sesión, chats y mensajería entre pacientes y psicólogos.

## 🎯 Funcionalidades

- **Solicitudes de Sesión**: Los pacientes pueden crear solicitudes de sesión con un mensaje inicial
- **Asignación de Psicólogos**: Los psicólogos pueden ser asignados a solicitudes
- **Gestión de Estados**: Pending, Accepted, Rejected
- **Chats**: Creación automática de chats cuando se acepta una solicitud
- **Mensajería en Tiempo Real**: SignalR para comunicación bidireccional instantánea
- **Indicadores de Escritura**: Notificaciones cuando alguien está escribiendo
- **Historial de Mensajes**: Carga automática al unirse a un chat

## 🗄️ Base de Datos

Conecta a `BDD_MindChat_Chat` con tres tablas principales:

### SessionRequests
- `Id` (GUID, PK)
- `PatientId` (GUID)
- `AssignedPsychologistId` (GUID, nullable)
- `Status` (VARCHAR: Pending, Accepted, Rejected)
- `InitialMessage` (TEXT)
- `CreatedAt` (DATETIME)

### Chats
- `Id` (GUID, PK)
- `SessionRequestId` (GUID, FK)
- `IsClosed` (BIT)
- `CreatedAt` (DATETIME)

### ChatMessages
- `Id` (GUID, PK)
- `ChatId` (GUID, FK)
- `SenderUserId` (GUID)
- `Message` (TEXT)
- `SentAt` (DATETIME)

## 📡 Endpoints API

### Session Requests (`/api/session-requests`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar todas las solicitudes |
| GET | `/pending` | Solicitudes pendientes |
| GET | `/{id}` | Solicitud por ID |
| GET | `/patient/{patientId}` | Solicitudes de un paciente |
| GET | `/psychologist/{psychologistId}` | Solicitudes de un psicólogo |
| POST | `/` | Crear solicitud |
| PUT | `/{id}/assign-psychologist` | Asignar psicólogo |
| PATCH | `/{id}/status` | Actualizar estado |
| DELETE | `/{id}` | Eliminar solicitud |

### Chats (`/api/chats`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/{id}` | Obtener chat por ID |
| GET | `/{id}/with-messages` | Chat con todos los mensajes |
| GET | `/session-request/{sessionRequestId}` | Chat por solicitud |
| POST | `/` | Crear nuevo chat |
| PATCH | `/{id}/close` | Cerrar chat |
| DELETE | `/{id}` | Eliminar chat |

### Messages (`/api/messages`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/chat/{chatId}` | Mensajes de un chat |
| POST | `/` | Enviar mensaje |
| DELETE | `/{id}` | Eliminar mensaje |

## 🚀 Ejecución

### Local
```bash
cd services/chat-service
dotnet run
```
Disponible en: `http://localhost:5003`

### Docker
```bash
docker-compose up chat-service
```

### Con Gateway
```bash
docker-compose up
# Acceder en: http://localhost:8080/api/session-requests
```

## 🔧 Configuración

### Variables de Entorno

```env
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080
DB_SERVER=localhost\MSSQLSERVER01
DB_USER=MindChatDev
DB_PASSWORD=mindchat
JWT_KEY=<tu-clave-secreta>
JWT_ISSUER=MindChatAuthService
JWT_AUDIENCE=MindChatClients
```

## 📝 Ejemplos de Uso

### Crear Solicitud de Sesión
```json
POST /api/session-requests
{
  "patientId": "guid-paciente",
  "initialMessage": "Necesito ayuda con ansiedad"
}
```

### Asignar Psicólogo
```json
PUT /api/session-requests/{id}/assign-psychologist
{
  "psychologistId": "guid-psicologo"
}
```

### Aceptar Solicitud
```json
PATCH /api/session-requests/{id}/status
{
  "status": "Accepted"
}
```

### Crear Chat (automático al aceptar)
```json
POST /api/chats
{
  "sessionRequestId": "guid-solicitud"
}
```

### Enviar Mensaje
```json
POST /api/messages
{
  "chatId": "guid-chat",
  "senderUserId": "guid-usuario",
  "message": "Hola, ¿cómo estás?"
}
```

## 🔗 Integración con Frontend Next.js

### SignalR (Mensajería en Tiempo Real)

```bash
# Instalar cliente SignalR
npm install @microsoft/signalr
```

```typescript
import * as signalR from "@microsoft/signalr";

// Configurar conexión
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5003/chatHub", {
    accessTokenFactory: () => token // JWT token
  })
  .withAutomaticReconnect()
  .build();

// Eventos del servidor
connection.on("ReceiveMessage", (chatId, senderUserId, message, sentAt) => {
  console.log(`Mensaje en ${chatId}:`, message);
  // Actualizar UI con el nuevo mensaje
});

connection.on("UserJoined", (chatId, userId, userName) => {
  console.log(`${userName} se unió al chat`);
});

connection.on("UserLeft", (chatId, userId, userName) => {
  console.log(`${userName} dejó el chat`);
});

connection.on("UserTyping", (chatId, userId, userName) => {
  console.log(`${userName} está escribiendo...`);
});

connection.on("UserStoppedTyping", (chatId, userId, userName) => {
  console.log(`${userName} dejó de escribir`);
});

connection.on("ChatHistory", (messages) => {
  console.log("Historial recibido:", messages);
  // Cargar mensajes anteriores
});

// Conectar
await connection.start();
console.log("Conectado a SignalR");

// Unirse a un chat
await connection.invoke("JoinChat", chatId);

// Enviar mensaje
await connection.invoke("SendMessage", chatId, "Hola, ¿cómo estás?");

// Indicar que está escribiendo
await connection.invoke("Typing", chatId);
await connection.invoke("StopTyping", chatId);

// Salir del chat
await connection.invoke("LeaveChat", chatId);

// Cerrar conexión
await connection.stop();
```

### REST API (Alternativa)

```typescript
// Crear solicitud de sesión
const createSessionRequest = async (patientId: string, message: string) => {
  const response = await fetch('http://localhost:8080/api/session-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      patientId,
      initialMessage: message
    })
  });
  return await response.json();
};

// Enviar mensaje (usar SignalR para tiempo real)
const sendMessage = async (chatId: string, userId: string, message: string) => {
  const response = await fetch('http://localhost:8080/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      chatId,
      senderUserId: userId,
      message
    })
  });
  return await response.json();
};

// Obtener mensajes de un chat
const getChatMessages = async (chatId: string) => {
  const response = await fetch(`http://localhost:8080/api/messages/chat/${chatId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT excepto el health check.

```
Authorization: Bearer <token>
```

## 📊 Flujo de Trabajo

1. **Paciente** crea una solicitud de sesión con mensaje inicial
2. **Sistema** notifica a psicólogos disponibles
3. **Psicólogo** se asigna a la solicitud
4. **Psicólogo** acepta/rechaza la solicitud
5. Si acepta: **Sistema** crea automáticamente un chat
6. **Ambos** pueden enviar mensajes en el chat
7. Cualquiera puede cerrar el chat cuando finaliza la sesión

## 🛠️ Tecnologías

- .NET 8.0 Minimal API
- Entity Framework Core 8.0
- SQL Server
- JWT Bearer Authentication
- **SignalR** para comunicación en tiempo real
- Swagger/OpenAPI

## 📍 Puertos

- **Directo**: 5003
- **Via Gateway**: 8080
- **SignalR Hub**: ws://localhost:5003/chatHub
- **Swagger**: http://localhost:5003/swagger

## ✅ Funcionalidades Completadas

- ✅ SignalR para mensajería en tiempo real
- ✅ Indicadores de "escribiendo..."
- ✅ Historial de conversaciones automático al unirse
- ✅ Autenticación JWT para SignalR
- ✅ Grupos de chat para broadcasting
- ✅ Notificaciones de usuarios uniéndose/saliendo

## 🔄 Próximas Mejoras

- [ ] Notificaciones push cuando el usuario no está en el chat
- [ ] Mensajes sin leer (contador)
- [ ] Búsqueda en mensajes
- [ ] Archivos adjuntos
- [ ] Reacciones a mensajes
- [ ] Adjuntar archivos
