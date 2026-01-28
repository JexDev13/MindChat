# Guía de Inicio Rápido - Servicio de Citas

## ✅ Configuración Completada

El microservicio de citas ha sido creado exitosamente con las siguientes características:

### Estructura del Servicio

```
servicio-citas/
├── Contracts/              # DTOs (Request/Response)
│   ├── CreateAppointmentRequest.cs
│   ├── UpdateAppointmentRequest.cs
│   ├── AppointmentResponse.cs
│   └── ErrorResponse.cs
├── Data/                   # DbContext
│   └── AppointmentDbContext.cs
├── Models/                 # Entidades
│   └── Appointment.cs
├── Services/               # Lógica de negocio
│   ├── IAppointmentService.cs
│   └── AppointmentService.cs
├── Program.cs              # Minimal API + Endpoints
├── Dockerfile              # Contenedor Docker
├── appsettings.json        # Configuración
├── README.md               # Documentación
└── servicio-citas.http     # Tests HTTP
```

## 🚀 Pasos Siguientes

### 1. Ejecutar el Script de Base de Datos

Primero, ejecuta el script SQL que proporcionaste para crear las bases de datos:

```sql
-- El script ya está listo, solo ejecútalo en tu SQL Server
-- Crea BDD_MindChat_Appointments y sus tablas
```

### 2. Opción A: Ejecutar Localmente (Desarrollo)

```bash
# Navegar al directorio del servicio
cd services/servicio-citas

# Ejecutar el servicio
dotnet run
```

El servicio estará disponible en: `http://localhost:5002`

### 3. Opción B: Ejecutar con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
cd c:\Users\USER-PC\Documents\GitHub\MindChat

# Levantar todos los servicios
docker-compose up -d

# Ver logs del servicio de citas
docker-compose logs -f appointment-service
```

Servicios disponibles:
- Auth Service: `http://localhost:5000`
- Clinical Service: `http://localhost:5001`
- **Appointment Service: `http://localhost:5002`** ⭐
- API Gateway: `http://localhost:8080`

### 4. Probar el Servicio

#### Opción 1: Usando Swagger (Recomendado para empezar)

1. Abrir el navegador en: `http://localhost:5002/swagger`
2. Explorar los endpoints disponibles
3. Probar directamente desde la interfaz

#### Opción 2: Usando el archivo .http

1. Abrir `servicio-citas.http` en VS Code
2. Instalar la extensión "REST Client" si no la tienes
3. Actualizar el token JWT (obtenerlo del auth-service)
4. Hacer clic en "Send Request" sobre cualquier endpoint

#### Opción 3: A través del API Gateway

```bash
# Primero obtener un token del auth-service
curl -X POST http://localhost:8080/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Luego usar el servicio de citas
curl -X GET http://localhost:8080/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔗 Integración con Frontend Next.js

El servicio está listo para integrarse con tu frontend Next.js:

### Endpoints Disponibles (a través del Gateway)

```typescript
// Base URL del API Gateway
const API_URL = 'http://localhost:8080';

// Ejemplos de llamadas desde Next.js
// GET - Obtener todas las citas
fetch(`${API_URL}/api/appointments`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// POST - Crear nueva cita
fetch(`${API_URL}/api/appointments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    psychologistId: 'guid-aqui',
    patientId: 'guid-aqui',
    scheduledAt: '2024-02-15T10:00:00Z',
    notes: 'Primera sesión'
  })
})

// PATCH - Cancelar cita
fetch(`${API_URL}/api/appointments/${id}/cancel`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 📋 Checklist Pre-Producción

- [x] Servicio creado con Minimal API .NET 8.0
- [x] Modelos y DbContext configurados
- [x] DTOs implementados
- [x] Endpoints CRUD completos
- [x] Autenticación JWT configurada
- [x] Dockerfile creado
- [x] Docker Compose actualizado
- [x] API Gateway configurado (Ocelot)
- [x] Documentación completa
- [ ] Base de datos creada (Ejecutar script SQL)
- [ ] Variables de entorno configuradas (crear archivo .env)
- [ ] Probar todos los endpoints
- [ ] Integrar con frontend Next.js

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database
DB_SERVER=localhost
DB_USER=MindChatDev
DB_PASSWORD=mindchat

# JWT
JWT_KEY=MindChat_SuperSecretKey_2024_ForDevelopment_AtLeast32CharactersLong
JWT_ISSUER=MindChatAuthService
JWT_AUDIENCE=MindChatClients
JWT_EXPIRY_MINUTES=60
```

## 🎯 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/appointments` | Listar todas las citas |
| GET | `/api/appointments/{id}` | Obtener cita por ID |
| GET | `/api/appointments/psychologist/{id}` | Citas de un psicólogo |
| GET | `/api/appointments/patient/{id}` | Citas de un paciente |
| POST | `/api/appointments` | Crear nueva cita |
| PUT | `/api/appointments/{id}` | Actualizar cita |
| PATCH | `/api/appointments/{id}/cancel` | Cancelar cita |
| DELETE | `/api/appointments/{id}` | Eliminar cita |
| GET | `/health` | Health check |

## 💡 Notas Importantes

1. **Base de Datos**: Asegúrate de ejecutar el script SQL primero
2. **JWT**: Necesitas un token válido del auth-service para la mayoría de endpoints
3. **CORS**: Ya está configurado para permitir todas las origins (cambiar en producción)
4. **API Gateway**: Los endpoints están enrutados a través de Ocelot
5. **Docker**: Usa `host.docker.internal` para conectar a SQL Server local desde Docker

## 🐛 Solución de Problemas

### Error de conexión a base de datos
- Verifica que SQL Server esté corriendo
- Verifica las credenciales en appsettings.json
- Si usas Docker, usa `host.docker.internal` en lugar de `localhost`

### Error 401 Unauthorized
- Asegúrate de incluir el token JWT en el header
- Verifica que el token no haya expirado
- Verifica que la configuración JWT sea la misma en todos los servicios

### El servicio no inicia
- Verifica que el puerto 5002 no esté en uso
- Compila el proyecto: `dotnet build`
- Revisa los logs: `docker-compose logs appointment-service`

## 📚 Documentación Adicional

- [README del Servicio](./README.md)
- [Documentación de Servicios](../Services.md)
- [API Gateway Configuration](../../infra/api-gateway/ocelot.json)

## ✨ ¡Listo!

El servicio de citas está completamente configurado y listo para usar. Ahora puedes:

1. Ejecutar el script de base de datos
2. Levantar los servicios con `docker-compose up`
3. Comenzar a integrar con tu frontend Next.js

¡Buena suerte con tu proyecto MindChat! 🚀
