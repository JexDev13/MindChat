# MindChat - Infraestructura

Este directorio contiene toda la configuración de infraestructura necesaria para desplegar y ejecutar la aplicación MindChat en diferentes entornos.

## Contenido

### 1. API Gateway (Ocelot)
- **Ubicación**: `api-gateway/`
- **Tecnología**: Ocelot (API Gateway para .NET)
- **Puerto**: 8080
- **Propósito**: 
  - Punto de entrada único para todos los microservicios
  - Enrutamiento de solicitudes
  - Autenticación centralizada
  - Rate limiting

[Ver configuración →](./api-gateway/)

#### Archivos principales:
- `Program.cs` - Configuración del gateway
- `ocelot.json` - Reglas de enrutamiento
- `Dockerfile` - Imagen Docker

#### Rutas configuradas:
```
/api/auth/*              → auth-service:8080
/api/clinical/*          → clinical-service:8080
/api/appointments/*      → appointment-service:8080
/api/chat/*              → chat-service:8080
```

### 2. Docker Compose
- **Archivo**: `../docker-compose.yml`
- **Servicios incluidos**:
  - SQL Server
  - Auth Service
  - API Gateway
  - (Próximamente: Clinical, Appointment, Chat services)

### 3. Kubernetes (Próximamente)
Configuración para despliegue en Kubernetes con:
- Deployments
- Services
- Ingress
- ConfigMaps
- Secrets

### 4. Scripts de Base de Datos
- **Ubicación**: Scripts SQL para inicialización
- **Bases de datos**:
  - BDD_MindChat_Identity
  - BDD_MindChat_Clinical
  - BDD_MindChat_Appointments
  - BDD_MindChat_Chat

## Configuración de Entornos

### Desarrollo Local
```bash
# Levantar toda la infraestructura
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Variables de Entorno
Ver `.env.example` en la raíz del proyecto para las variables necesarias:
- Conexiones de base de datos
- Configuración JWT
- URLs de servicios

## API Gateway - Ocelot

### Características Implementadas
- ✅ Enrutamiento dinámico
- ✅ Autenticación JWT
- ✅ CORS configurado
- ✅ Rate limiting básico
- ⏳ Circuit breaker (próximamente)
- ⏳ Logging y métricas (próximamente)

### Agregar una nueva ruta

1. Editar `api-gateway/ocelot.json`:
```json
{
  "DownstreamPathTemplate": "/api/new-service/{everything}",
  "DownstreamScheme": "http",
  "DownstreamHostAndPorts": [
    {
      "Host": "new-service",
      "Port": 8080
    }
  ],
  "UpstreamPathTemplate": "/api/new-service/{everything}",
  "UpstreamHttpMethod": [ "GET", "POST", "PUT", "DELETE" ],
  "AuthenticationOptions": {
    "AuthenticationProviderKey": "Bearer"
  }
}
```

2. Actualizar `docker-compose.yml` si es necesario

3. Reiniciar el gateway:
```bash
docker-compose restart api-gateway
```

## Monitoreo y Logs

### Logs centralizados
```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

### Health Checks
Cada servicio expone un endpoint `/health`:
```bash
# Directo al servicio
curl http://localhost:5000/health

# A través del gateway
curl http://localhost:8080/auth/health
```

## Seguridad

### SSL/TLS
- Desarrollo: HTTP sin cifrado
- Producción: Configurar certificados SSL en el API Gateway

### Autenticación
- JWT Bearer tokens
- Validación centralizada en API Gateway
- Cada servicio puede validar tokens adicionalemnte

### Secrets Management
- Desarrollo: Variables de entorno en `.env`
- Producción: Usar Azure Key Vault, AWS Secrets Manager, o Kubernetes Secrets

## Escalabilidad

### Horizontal Scaling
Los servicios están diseñados para ser stateless y pueden escalarse horizontalmente:

```yaml
# docker-compose.yml
auth-service:
  scale: 3  # 3 instancias del servicio
```

### Load Balancing
El API Gateway distribuye las peticiones entre las instancias disponibles.

## CI/CD

### GitHub Actions
Pipeline configurado en `.github/workflows/ci-cd.yml`:

1. **Build**: Compila todos los servicios
2. **Test**: Ejecuta tests unitarios
3. **Docker Build**: Construye imágenes Docker
4. **Deploy**: Despliega a entorno correspondiente

### Secretos de GitHub necesarios:
- `DOCKER_USERNAME` - Usuario de Docker Hub
- `DOCKER_PASSWORD` - Contraseña/Token de Docker Hub

## Backup y Recuperación

### Base de Datos
```bash
# Backup
docker exec mindchat-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'MindChat2024!' \
  -Q "BACKUP DATABASE BDD_MindChat_Identity TO DISK='/var/opt/mssql/backup/identity.bak'"

# Restaurar
docker exec mindchat-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P 'MindChat2024!' \
  -Q "RESTORE DATABASE BDD_MindChat_Identity FROM DISK='/var/opt/mssql/backup/identity.bak'"
```

## Troubleshooting

### El API Gateway no se conecta a los servicios
```bash
# Verificar la red Docker
docker network inspect mindchat_mindchat-network

# Verificar que los servicios estén en la misma red
docker-compose ps
```

### Los servicios no pueden acceder a SQL Server
```bash
# Verificar que SQL Server esté corriendo
docker ps | grep sqlserver

# Verificar los logs de SQL Server
docker logs mindchat-sqlserver

# Probar conexión desde un servicio
docker exec -it mindchat-auth-service ping sqlserver
```

### Regenerar las imágenes Docker
```bash
# Limpiar y reconstruir
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Próximos Pasos

- [ ] Implementar Circuit Breaker en API Gateway
- [ ] Agregar servicio de logging centralizado (ELK Stack)
- [ ] Configurar métricas con Prometheus/Grafana
- [ ] Implementar Service Mesh (Istio/Linkerd)
- [ ] Agregar caching distribuido (Redis)
- [ ] Configurar autoscaling en Kubernetes

---

**Última actualización:** 2026-01-27
estructura del Proyecto MindChat

En esta carpeta encontrarás todo lo relacionado con la infraestructura que soporta el funcionamiento del proyecto MindChat. Aquí se documentan los recursos, configuraciones y herramientas necesarias para el despliegue, operación y mantenimiento del sistema.

**¿Qué puedes esperar encontrar aquí?**

- Archivos de configuración para entornos de desarrollo, pruebas y producción.
- Scripts de automatización para despliegue y mantenimiento.
- Documentación sobre servicios en la nube, bases de datos, redes y otros recursos de infraestructura.
- Guías para la gestión y monitoreo de la plataforma.

Este espacio está pensado para facilitar la administración técnica y operativa del proyecto, asegurando que la infraestructura sea robusta, escalable y fácil de mantener.
# MindChat