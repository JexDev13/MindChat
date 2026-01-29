# MindChat - Clinical Service

## Descripción
Servicio de gestión de perfiles clínicos para la plataforma MindChat. Maneja los perfiles de pacientes, psicólogos, tags especializaciones y contactos entre profesionales.

## Base de Datos
- **Database**: `BDD_MindChat_Clinical`
- **Server**: SQL Server
- **Tablas principales**:
  - `Patients`: Perfiles de pacientes
  - `Psychologists`: Perfiles de psicólogos
  - `Tags`: Especialidades y áreas de práctica
  - `PsychologistTags`: Relación psicólogos-tags (many-to-many)
  - `PsychologistContacts`: Red de contactos entre psicólogos

## Tecnologías
- **.NET 8.0** - Framework principal
- **ASP.NET Core Minimal API** - Arquitectura de endpoints
- **Entity Framework Core** - ORM
- **SQL Server** - Base de datos
- **JWT Bearer Authentication** - Autenticación

## Arquitectura

```
clinical-service/
├── Data/
│   └── ClinicalDbContext.cs         # Contexto de base de datos
├── Models/
│   ├── Patient.cs                   # Modelo de paciente
│   ├── Psychologist.cs              # Modelo de psicólogo
│   ├── Tag.cs                       # Modelo de tag
│   ├── PsychologistTag.cs           # Relación many-to-many
│   └── PsychologistContact.cs       # Contactos entre psicólogos
├── Contracts/
│   ├── CreatePatientProfileRequest.cs
│   ├── CreatePsychologistProfileRequest.cs
│   ├── PatientProfileResponse.cs
│   ├── PsychologistProfileResponse.cs
│   └── ...
├── Services/
│   ├── IPatientService.cs           # Interface de pacientes
│   ├── PatientService.cs            # Implementación de pacientes
│   ├── IPsychologistService.cs      # Interface de psicólogos
│   └── PsychologistService.cs       # Implementación de psicólogos
├── Program.cs                        # Punto de entrada y configuración
├── Dockerfile                        # Configuración Docker
└── appsettings.json                 # Configuración de la aplicación
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
  "service": "clinical-service",
  "timestamp": "2026-01-27T10:30:00Z"
}
```

---

### Pacientes

#### Crear Perfil de Paciente
```
POST /api/patients
```

**Request Body:**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "emotionalState": "Tranquilo"
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["userId"],
  "properties": {
    "userId": {
      "type": "string",
      "format": "uuid",
      "description": "ID del usuario en Identity Service"
    },
    "emotionalState": {
      "type": "string",
      "description": "Estado emocional actual del paciente"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "profileId": "7fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

#### Obtener Perfil de Paciente por UserId
```
GET /api/patients/user/{userId}
```
🔒 **Requiere autenticación**

**Response (200 OK):**
```json
{
  "profileId": "7fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "emotionalState": "Tranquilo"
}
```

---

#### Obtener Perfil de Paciente por ProfileId
```
GET /api/patients/{profileId}
```
🔒 **Requiere autenticación**

---

#### Actualizar Perfil de Paciente
```
PUT /api/patients/user/{userId}
```
🔒 **Requiere autenticación**

**Request Body:**
```json
{
  "emotionalState": "Ansioso"
}
```

**Response (200 OK):** Empty

---

#### Eliminar Perfil de Paciente
```
DELETE /api/patients/user/{userId}
```
🔒 **Requiere autenticación**

**Response (204 No Content)**

---

### Psicólogos

#### Crear Perfil de Psicólogo
```
POST /api/psychologists
```

**Request Body:**
```json
{
  "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "professionalLicense": "PSY-12345",
  "university": "Universidad Nacional",
  "graduationDate": "2020-06-15",
  "bio": "Psicólogo especializado en terapia cognitivo-conductual",
  "tags": ["Ansiedad", "Depresión", "Estrés"]
}
```

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["userId", "professionalLicense", "university", "graduationDate"],
  "properties": {
    "userId": {
      "type": "string",
      "format": "uuid",
      "description": "ID del usuario en Identity Service"
    },
    "professionalLicense": {
      "type": "string",
      "description": "Número de licencia profesional"
    },
    "university": {
      "type": "string",
      "description": "Universidad de graduación"
    },
    "graduationDate": {
      "type": "string",
      "format": "date",
      "description": "Fecha de graduación"
    },
    "bio": {
      "type": "string",
      "description": "Biografía profesional"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Especialidades y áreas de práctica"
    }
  }
}
```

**Response (200 OK):**
```json
{
  "profileId": "8fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

---

#### Obtener Perfil de Psicólogo por UserId
```
GET /api/psychologists/user/{userId}
```
🔒 **Requiere autenticación**

**Response (200 OK):**
```json
{
  "profileId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
  "professionalLicense": "PSY-12345",
  "university": "Universidad Nacional",
  "graduationDate": "2020-06-15",
  "bio": "Psicólogo especializado en terapia cognitivo-conductual",
  "isVerified": false,
  "isProfileVisible": true,
  "tags": ["Ansiedad", "Depresión", "Estrés"]
}
```

---

#### Obtener Perfil de Psicólogo por ProfileId
```
GET /api/psychologists/{profileId}
```
🔒 **Requiere autenticación**

---

#### Listar Todos los Psicólogos Visibles
```
GET /api/psychologists
```
🔒 **Requiere autenticación**

**Response (200 OK):**
```json
[
  {
    "profileId": "8fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "4fa85f64-5717-4562-b3fc-2c963f66afa6",
    "professionalLicense": "PSY-12345",
    "university": "Universidad Nacional",
    "graduationDate": "2020-06-15",
    "bio": "Especialista en terapia cognitivo-conductual",
    "isVerified": true,
    "isProfileVisible": true,
    "tags": ["Ansiedad", "Depresión"]
  }
]
```

---

#### Buscar Psicólogos por Tags
```
GET /api/psychologists/search/tags?tags=Ansiedad,Depresión
```
🔒 **Requiere autenticación**

**Query Parameters:**
- `tags` (string): Lista de tags separados por comas

**Response (200 OK):** Array de perfiles de psicólogos

---

#### Actualizar Perfil de Psicólogo
```
PUT /api/psychologists/user/{userId}
```
🔒 **Requiere autenticación**

**Request Body:**
```json
{
  "bio": "Nueva biografía actualizada",
  "isProfileVisible": true,
  "tags": ["Ansiedad", "TCC", "Mindfulness"]
}
```

**Response (200 OK):** Empty

---

#### Eliminar Perfil de Psicólogo
```
DELETE /api/psychologists/user/{userId}
```
🔒 **Requiere autenticación**

**Response (204 No Content)**

---

## Integración con Auth Service

El Clinical Service recibe llamadas del Auth Service durante el proceso de registro para crear automáticamente los perfiles clínicos correspondientes.

**Flujo de Registro:**
1. Usuario se registra en Auth Service
2. Auth Service llama a `POST /api/patients` o `POST /api/psychologists`
3. Clinical Service crea el perfil y devuelve el ProfileId
4. Auth Service incluye el ProfileId en el token JWT

## Configuración

### Variables de Entorno

```bash
# Database
ConnectionStrings__DefaultConnection="Server=localhost;Database=BDD_MindChat_Clinical;User Id=MindChatDev;Password=mindchat;TrustServerCertificate=True"

# JWT
Jwt__Key="SuperSecretKeyForDevelopmentPurposesOnly123456789"
Jwt__Issuer="MindChat"
Jwt__Audience="MindChat"
```

### Desarrollo Local

1. **Instalar dependencias:**
```bash
cd services/clinical-service
dotnet restore
```

2. **Configurar base de datos:**
   - Asegúrate de que SQL Server esté corriendo
   - Ejecuta el script SQL de creación de base de datos

3. **Ejecutar migraciones:**
```bash
dotnet ef database update
```

4. **Ejecutar el servicio:**
```bash
dotnet run
```

El servicio estará disponible en `http://localhost:5001`

### Docker

#### Build
```bash
docker build -t mindchat-clinical-service -f services/clinical-service/Dockerfile .
```

#### Run
```bash
docker run -p 5001:8080 \
  -e ConnectionStrings__DefaultConnection="Server=host.docker.internal;..." \
  -e Jwt__Key="your-secret-key" \
  mindchat-clinical-service
```

### Docker Compose

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f clinical-service

# Detener servicios
docker-compose down
```

## Integración con API Gateway

El servicio está configurado para trabajar con Ocelot API Gateway. Las rutas accesibles a través del gateway:

- `http://api-gateway:8080/api/clinical/patients/*`
- `http://api-gateway:8080/api/clinical/psychologists/*`
- `http://api-gateway:8080/clinical/health`

## Swagger / OpenAPI

Accede a la documentación interactiva de la API en:
- **Local**: `http://localhost:5001/swagger`
- **Docker**: `http://localhost:5001/swagger`

## Seguridad

### Autenticación
- JWT Bearer tokens para endpoints protegidos
- Endpoints públicos: Creación de perfiles (llamados desde Auth Service)
- Endpoints protegidos: Consulta, actualización y eliminación

### Autorización
Los usuarios solo pueden:
- Ver su propio perfil completo
- Ver perfiles públicos de otros (psicólogos visibles)
- Actualizar solo su propio perfil

### Datos Sensibles
- Las licencias profesionales y datos personales están protegidos
- Solo los psicólogos pueden ver información de contacto de otros

## Testing

### Endpoints de ejemplo con cURL

**Crear perfil de paciente:**
```bash
curl -X POST http://localhost:5001/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "emotionalState": "Tranquilo"
  }'
```

**Buscar psicólogos por tags:**
```bash
curl -X GET "http://localhost:5001/api/psychologists/search/tags?tags=Ansiedad,Depresión" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Dependencias de Servicios

- **Auth Service**: Para validación de usuarios (JWT tokens)
- **Identity Database**: Referencias lógicas a UserId (no FK física)

## Roadmap

- [ ] Implementar sistema de reviews/calificaciones
- [ ] Agregar disponibilidad de horarios
- [ ] Implementar geolocalización de psicólogos
- [ ] Agregar fotos de perfil
- [ ] Sistema de verificación profesional
- [ ] Estadísticas de perfiles

## Soporte

Para problemas o preguntas, consulta:
- [Documentación del proyecto](../../README.md)
- [Services](../Services.md)

---

**Última actualización:** 2026-01-27
**Versión:** 1.0.0
