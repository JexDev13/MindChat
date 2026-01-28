
# MindChat - Microservicios

Este directorio contiene todos los microservicios que componen la aplicación MindChat.

## Arquitectura de Microservicios

```
┌─────────────────┐
│   API Gateway   │ ← Puerto 8080 (Ocelot)
│   (Ocelot)      │
└────────┬────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
┌───▼────────┐            ┌──────▼──────┐
│ Auth       │            │  Clinical   │
│ Service    │───────────▶│  Service    │
│ (Port 5000)│            │ (Port 5001) │
└────────────┘            └─────────────┘
     │                          │
     │                          │
     ▼                          ▼
┌─────────────────────────────────┐
│      SQL Server                 │
│  - BDD_MindChat_Identity        │
│  - BDD_MindChat_Clinical        │
└─────────────────────────────────┘
```

## Servicios Disponibles

### 1. Auth Service ✅
- **Puerto**: 5000
- **Base de Datos**: BDD_MindChat_Identity
- **Responsabilidad**: Autenticación, autorización, gestión de usuarios
- **Endpoints**:
  - `/api/auth/patient/register`
  - `/api/auth/patient/login`
  - `/api/auth/psychologist/register`
  - `/api/auth/psychologist/login`
  - `/health`

[Ver documentación completa →](./auth-service/auth-service.md)

### 2. Clinical Service ✅
- **Puerto**: 5001
- **Base de Datos**: BDD_MindChat_Clinical
- **Responsabilidad**: Gestión de perfiles clínicos, tags, contactos
- **Endpoints**:
  - `/api/patients` (CRUD)
  - `/api/psychologists` (CRUD)
  - `/api/psychologists/search/tags`
  - `/health`

[Ver documentación completa →](./clinical-service/clinical-service.md)

### 3. Appointment Service (Próximamente)
- **Puerto**: 5001
- **Base de Datos**: BDD_MindChat_Clinical
- **Responsabilidad**: Gestión de perfiles clínicos, tags, contactos
- **Endpoints planeados**:
  - `/api/patients`
  - `/api/psychologists`
  - `/api/tags`

### 3. Appointment Service (Próximamente)
- **Puerto**: 5002
- **Base de Datos**: BDD_MindChat_Appointments
- **Responsabilidad**: Gestión de citas y calendario

### 4. Chat Service (Próximamente)
- **Puerto**: 5003
- **Base de Datos**: BDD_MindChat_Chat
- **Responsabilidad**: Mensajería, sesiones, solicitudes

## Tecnologías Comunes

- **.NET 8.0** - Framework principal
- **Entity Framework Core** - ORM
- **SQL Server** - Base de datos
- **JWT** - Autenticación
- **Docker** - Contenedorización
- **Minimal APIs** - Arquitectura de endpoints

## Desarrollo Local

### Prerequisitos
- .NET 8.0 SDK
- SQL Server (local o Docker)
- Docker Desktop (opcional)

### Ejecutar todos los servicios con Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Ejecutar un servicio individualmente

```bash
# Ejemplo: Auth Service
cd services/auth-service
dotnet restore
dotnet run
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Variables principales:
- `DB_SERVER` - Servidor SQL Server
- `DB_USER` - Usuario de base de datos
- `DB_PASSWORD` - Contraseña
- `JWT_KEY` - Clave secreta para JWT
- `JWT_ISSUER` - Emisor del token
- `JWT_AUDIENCE` - Audiencia del token

## API Gateway

Todas las solicitudes externas deben pasar por el API Gateway en el puerto 8080:

```
http://localhost:8080/api/auth/*         → Auth Service
http://localhost:8080/api/clinical/*     → Clinical Service
http://localhost:8080/api/appointments/* → Appointment Service
http://localhost:8080/api/chat/*         → Chat Service
```

## Comunicación entre Servicios

Los servicios se comunican entre sí mediante HTTP/REST:
- **Auth Service** → **Clinical Service**: Creación de perfiles
- **Clinical Service** → **Auth Service**: Validación de usuarios
- **Chat Service** → **Clinical Service**: Información de perfiles

## Testing

### Health Checks
```bash
# Auth Service
curl http://localhost:5000/health

# A través del API Gateway
curl http://localhost:8080/auth/health
```

### Swagger UI
Cada servicio expone documentación Swagger en modo desarrollo:
- Auth Service: http://localhost:5000/swagger
- Clinical Service: http://localhost:5001/swagger

## CI/CD

El proyecto usa GitHub Actions para:
1. **Build y Test**: En cada push/PR
2. **Docker Build**: Construye imágenes Docker
3. **Deploy**: Despliega a desarrollo/producción según rama

Ver [.github/workflows/ci-cd.yml](../.github/workflows/ci-cd.yml)

## Estructura de un Servicio

```
service-name/
├── Data/              # DbContext y configuración de BD
├── Models/            # Entidades y modelos
├── Services/          # Lógica de negocio
├── Helpers/           # Utilidades
├── Program.cs         # Configuración y endpoints
├── Dockerfile         # Configuración Docker
├── appsettings.json   # Configuración
├── service-name.csproj
└── service-name.md    # Documentación del servicio
```

## Logs y Monitoreo

Cada servicio registra logs usando el sistema de logging de ASP.NET Core:
```bash
# Ver logs en tiempo real
docker-compose logs -f [service-name]

# Ejemplo:
docker-compose logs -f auth-service
```

## Seguridad

- **Autenticación**: JWT Bearer tokens
- **CORS**: Configurado por servicio
- **Variables sensibles**: Usar variables de entorno
- **HTTPS**: Recomendado en producción
- **Rate Limiting**: Configurado en API Gateway

## Desarrollo de Nuevos Servicios

1. Crear directorio en `services/`
2. Inicializar proyecto .NET: `dotnet new webapi -minimal`
3. Agregar dependencias comunes
4. Configurar DbContext y modelos
5. Implementar servicios y endpoints
6. Crear Dockerfile
7. Actualizar docker-compose.yml
8. Documentar en service-name.md
9. Actualizar API Gateway (ocelot.json)

## Soporte

Para más información sobre cada servicio, consulta su documentación individual en su carpeta correspondiente.

---

**Última actualización:** 2026-01-27

- Ejemplos de integración y buenas prácticas.

Este espacio está pensado para centralizar la información relevante sobre los servicios, ayudando tanto a desarrolladores actuales como futuros colaboradores.
# MindChat