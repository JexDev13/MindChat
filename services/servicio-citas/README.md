# Servicio de Citas - MindChat

Microservicio para la gestión de citas entre pacientes y psicólogos en el sistema MindChat.

## Tecnologías

- **.NET 8.0** - Framework principal
- **ASP.NET Core Minimal API** - Arquitectura de endpoints
- **Entity Framework Core 8.0** - ORM para acceso a datos
- **SQL Server** - Base de datos (BDD_MindChat_Appointments)
- **JWT Bearer Authentication** - Autenticación y autorización

## Estructura del Proyecto

```
servicio-citas/
├── Contracts/              # DTOs para requests y responses
│   ├── CreateAppointmentRequest.cs
│   ├── UpdateAppointmentRequest.cs
│   ├── AppointmentResponse.cs
│   └── ErrorResponse.cs
├── Data/                   # Contexto de base de datos
│   └── AppointmentDbContext.cs
├── Models/                 # Entidades de dominio
│   └── Appointment.cs
├── Services/               # Lógica de negocio
│   ├── IAppointmentService.cs
│   └── AppointmentService.cs
├── Program.cs              # Configuración y endpoints
├── Dockerfile
└── appsettings.json
```

## Base de Datos

El servicio se conecta a la base de datos `BDD_MindChat_Appointments` con la siguiente estructura:

```sql
Appointments
├── Id (UNIQUEIDENTIFIER, PK)
├── PsychologistId (UNIQUEIDENTIFIER)
├── PatientId (UNIQUEIDENTIFIER)
├── ScheduledAt (DATETIME)
├── Notes (NVARCHAR(MAX))
└── IsCancelled (BIT)
```

## Endpoints API

Todos los endpoints están bajo el prefijo `/api/appointments`:

### GET /api/appointments
Obtiene todas las citas activas (no canceladas).

**Response:** `200 OK`
```json
[
  {
    "id": "guid",
    "psychologistId": "guid",
    "patientId": "guid",
    "scheduledAt": "2024-01-27T10:00:00Z",
    "notes": "Primera consulta",
    "isCancelled": false
  }
]
```

### GET /api/appointments/{id}
Obtiene una cita específica por su ID.

**Response:** `200 OK` | `404 Not Found`

### GET /api/appointments/psychologist/{psychologistId}
Obtiene todas las citas de un psicólogo específico.

**Response:** `200 OK`

### GET /api/appointments/patient/{patientId}
Obtiene todas las citas de un paciente específico.

**Response:** `200 OK`

### POST /api/appointments
Crea una nueva cita.

**Request Body:**
```json
{
  "psychologistId": "guid",
  "patientId": "guid",
  "scheduledAt": "2024-01-27T10:00:00Z",
  "notes": "Primera consulta"
}
```

**Response:** `201 Created` | `400 Bad Request`

### PUT /api/appointments/{id}
Actualiza una cita existente.

**Request Body:**
```json
{
  "scheduledAt": "2024-01-27T15:00:00Z",
  "notes": "Notas actualizadas"
}
```

**Response:** `200 OK` | `404 Not Found`

### PATCH /api/appointments/{id}/cancel
Cancela una cita.

**Response:** `200 OK` | `404 Not Found`

### DELETE /api/appointments/{id}
Elimina permanentemente una cita.

**Response:** `204 No Content` | `404 Not Found`

### GET /health
Health check del servicio.

**Response:** `200 OK`
```json
{
  "status": "Healthy",
  "service": "Appointment Service",
  "timestamp": "2024-01-27T10:00:00Z"
}
```

## Configuración

### Variables de Entorno

```env
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080
DB_SERVER=localhost
DB_USER=MindChatDev
DB_PASSWORD=mindchat
JWT_KEY=<tu-clave-secreta>
JWT_ISSUER=MindChatAuthService
JWT_AUDIENCE=MindChatClients
```

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=${DB_SERVER};Database=BDD_MindChat_Appointments;User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "${JWT_KEY}",
    "Issuer": "${JWT_ISSUER}",
    "Audience": "${JWT_AUDIENCE}"
  }
}
```

## Ejecución

### Desarrollo Local

```bash
# Navegar al directorio del servicio
cd services/servicio-citas

# Restaurar dependencias
dotnet restore

# Ejecutar el servicio
dotnet run
```

El servicio estará disponible en `http://localhost:5000`

### Docker

```bash
# Desde la raíz del proyecto
docker-compose up appointment-service
```

El servicio estará disponible en `http://localhost:5002`

### Con API Gateway

```bash
# Levantar todos los servicios
docker-compose up

# Acceder a través del API Gateway
# http://localhost:8080/api/appointments
```

## Integración con API Gateway

El servicio está configurado en Ocelot para ser accesible a través del API Gateway:

- **URL Gateway:** `http://localhost:8080/api/appointments`
- **URL Directa:** `http://localhost:5002/api/appointments`
- **Health Check:** `http://localhost:8080/appointments/health`

## Autenticación

La mayoría de los endpoints requieren autenticación JWT. Incluir el token en el header:

```
Authorization: Bearer <token>
```

El token se obtiene del servicio de autenticación (`auth-service`).

## Comunicación con Otros Servicios

Este servicio es independiente pero se comunica lógicamente con:

- **Auth Service:** Para validación de tokens JWT
- **Clinical Service:** Referencias a PsychologistId y PatientId (FK lógicas)

## Swagger/OpenAPI

La documentación interactiva de la API está disponible en:

- **Desarrollo:** `http://localhost:5002/swagger`
- **Gateway:** A través del gateway en `http://localhost:8080/swagger` (si está configurado)

## Notas de Desarrollo

1. **Validaciones:** El servicio valida que las fechas de citas sean en el futuro
2. **Soft Delete:** Las citas se pueden cancelar (soft delete) o eliminar permanentemente
3. **Filtros:** Por defecto, solo se muestran citas no canceladas
4. **Logging:** Se registran todas las operaciones CRUD en los logs

## Próximas Mejoras

- [ ] Implementar notificaciones de citas próximas
- [ ] Validar conflictos de horarios
- [ ] Agregar endpoints de estadísticas
- [ ] Implementar paginación en listados
- [ ] Agregar filtros por rango de fechas
