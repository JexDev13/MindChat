# MindChat - Auth Service

## Descripción
Servicio de autenticación y gestión de identidades para la plataforma MindChat. Maneja el registro, inicio de sesión y autenticación de pacientes y psicólogos.

## Base de Datos
- **Database**: `BDD_MindChat_Identity`
- **Server**: SQL Server
- **Tablas principales**:
  - `Users`: Información de usuarios
  - `Roles`: Roles del sistema (Patient, Psychologist)
  - `UserRoles`: Relación usuarios-roles

## Tecnologías
- **.NET 8.0** - Framework principal
- **ASP.NET Core Minimal API** - Arquitectura de endpoints
- **Entity Framework Core** - ORM
- **SQL Server** - Base de datos
- **JWT Bearer Authentication** - Autenticación
- **Identity Framework** - Gestión de usuarios

## Arquitectura

```
auth-service/
├── Data/
│   └── AuthDbContext.cs          # Contexto de base de datos
├── Models/
│   ├── User.cs                   # Modelo de usuario
│   └── Role.cs                   # Modelo de rol
├── Services/
│   ├── IAuthService.cs           # Interface de autenticación
│   ├── AuthServiceImpl.cs        # Implementación de autenticación
│   ├── ITokenService.cs          # Interface de tokens
│   ├── TokenService.cs           # Generación de JWT
│   └── ClinicalServiceClient.cs  # Cliente HTTP para Clinical Service
├── Helpers/
│   └── UsernameGenerator.cs      # Generador de nombres de usuario
├── Program.cs                     # Punto de entrada y configuración
├── Dockerfile                     # Configuración Docker
└── appsettings.json              # Configuración de la aplicación
```

## Endpoints API

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

---

### Pacientes

#### Registro de Paciente
```
POST /api/auth/patient/register
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["firstName", "lastName", "email", "password", "confirmPassword"],
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 1,
      "description": "Nombre del paciente"
    },
    "lastName": {
      "type": "string",
      "minLength": 1,
      "description": "Apellido del paciente"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email del paciente"
    },
    "password": {
      "type": "string",
      "minLength": 6,
      "description": "Contraseña (mínimo 6 caracteres)"
    },
    "confirmPassword": {
      "type": "string",
      "description": "Confirmación de contraseña (debe coincidir con password)"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "juan.perez@example.com",
  "fullName": "Juan Pérez",
  "role": "Patient",
  "profileId": "7fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    "El email ya está registrado."
  ]
}
```

---

#### Login de Paciente
```
POST /api/auth/patient/login
```

**Request Body:**
```json
{
  "email": "juan.perez@example.com",
  "password": "Password123!"
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email del usuario"
    },
    "password": {
      "type": "string",
      "description": "Contraseña del usuario"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "juan.perez@example.com",
  "fullName": "Juan Pérez",
  "role": "Patient"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    "Email o contraseña inválidos."
  ]
}
```

---

### Psicólogos

#### Registro de Psicólogo
```
POST /api/auth/psychologist/register
```

**Request Body:**
```json
{
  "firstName": "María",
  "lastName": "García",
  "email": "maria.garcia@example.com",
  "professionalLicense": "PSY-12345",
  "university": "Universidad Nacional",
  "graduationDate": "2020-06-15",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["firstName", "lastName", "email", "professionalLicense", "university", "graduationDate", "password", "confirmPassword"],
  "properties": {
    "firstName": {
      "type": "string",
      "minLength": 1,
      "description": "Nombre del psicólogo"
    },
    "lastName": {
      "type": "string",
      "minLength": 1,
      "description": "Apellido del psicólogo"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email del psicólogo"
    },
    "professionalLicense": {
      "type": "string",
      "minLength": 1,
      "description": "Número de licencia profesional"
    },
    "university": {
      "type": "string",
      "minLength": 1,
      "description": "Universidad de procedencia"
    },
    "graduationDate": {
      "type": "string",
      "format": "date",
      "description": "Fecha de graduación (ISO 8601)"
    },
    "password": {
      "type": "string",
      "minLength": 6,
      "description": "Contraseña (mínimo 6 caracteres)"
    },
    "confirmPassword": {
      "type": "string",
      "description": "Confirmación de contraseña (debe coincidir con password)"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "maria.garcia@example.com",
  "fullName": "María García",
  "role": "Psychologist",
  "profileId": "8fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

#### Login de Psicólogo
```
POST /api/auth/psychologist/login
```

**Request Body:**
```json
{
  "email": "maria.garcia@example.com",
  "password": "Password123!"
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["email", "password"],
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email del usuario"
    },
    "password": {
      "type": "string",
      "description": "Contraseña del usuario"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "maria.garcia@example.com",
  "fullName": "María García",
  "role": "Psychologist"
}
```

---

## Estructura del Token JWT

```json
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "usuario@example.com",
  "name": "Usuario Ejemplo",
  "role": "Patient",
  "profileId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "jti": "unique-token-id",
  "iat": 1706356200,
  "exp": 1706442600,
  "iss": "MindChat",
  "aud": "MindChat"
}
```

## Configuración

### Variables de Entorno

```bash
# Database
ConnectionStrings__DefaultConnection="Server=localhost;Database=BDD_MindChat_Identity;User Id=MindChatDev;Password=mindchat;TrustServerCertificate=True"

# JWT
Jwt__Key="SuperSecretKeyForDevelopmentPurposesOnly123456789"
Jwt__Issuer="MindChat"
Jwt__Audience="MindChat"
Jwt__ExpiryMinutes="1440"

# Services
Services__ClinicalServiceUrl="http://localhost:5001"
```

### Desarrollo Local

1. **Instalar dependencias:**
```bash
cd services/auth-service
dotnet restore
```

2. **Configurar base de datos:**
   - Asegúrate de que SQL Server esté corriendo
   - Ejecuta el script SQL de creación de base de datos (ver arquitectura)

3. **Ejecutar migraciones:**
```bash
dotnet ef database update
```

4. **Ejecutar el servicio:**
```bash
dotnet run
```

El servicio estará disponible en `http://localhost:5000`

### Docker

#### Build
```bash
docker build -t mindchat-auth-service -f services/auth-service/Dockerfile .
```

#### Run
```bash
docker run -p 5000:8080 \
  -e ConnectionStrings__DefaultConnection="Server=host.docker.internal;..." \
  -e Jwt__Key="your-secret-key" \
  mindchat-auth-service
```

### Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f auth-service

# Detener servicios
docker-compose down
```

## Integración con API Gateway

El servicio está configurado para trabajar con Ocelot API Gateway. Las rutas accesibles a través del gateway:

- `http://api-gateway:8080/api/auth/patient/register`
- `http://api-gateway:8080/api/auth/patient/login`
- `http://api-gateway:8080/api/auth/psychologist/register`
- `http://api-gateway:8080/api/auth/psychologist/login`
- `http://api-gateway:8080/auth/health`

## Swagger / OpenAPI

Accede a la documentación interactiva de la API en:
- **Local**: `http://localhost:5000/swagger`
- **Docker**: `http://localhost:5000/swagger`

## Logs

El servicio utiliza el sistema de logging de ASP.NET Core. Los niveles de log configurados:
- `Default`: Information
- `Microsoft.AspNetCore`: Warning
- `Microsoft.EntityFrameworkCore`: Warning (Information en Development)

## Seguridad

### Autenticación
- JWT Bearer tokens con firma HMAC-SHA256
- Tokens con expiración configurable
- Validación de issuer y audience

### Contraseñas
- Mínimo 6 caracteres (configurable)
- Hash almacenado usando ASP.NET Core Identity
- Validación de contraseña en registro

### CORS
Configurado para desarrollo. **En producción, especifica los orígenes permitidos.**

## Testing

### Endpoints de ejemplo con cURL

**Registro de paciente:**
```bash
curl -X POST http://localhost:5000/api/auth/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

**Login de paciente:**
```bash
curl -X POST http://localhost:5000/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "Password123!"
  }'
```

## Dependencias de Servicios

- **Clinical Service**: Para crear perfiles de paciente/psicólogo
  - Endpoint: `/api/patients` (POST)
  - Endpoint: `/api/psychologists` (POST)


---

**Última actualización:** 2026-01-27
**Versión:** 1.0.0
