
# MindChat – Plataforma de Salud Mental

> Plataforma moderna de salud mental, evolucionando de monolito a microservicios, con frontend desacoplado, CI/CD y despliegue en contenedores.

---

## 📑 Tabla de Contenido
- [Descripción General](#descripción-general)
- [Requisitos Previos](#requisitos-previos)
- [Guía Rápida de Inicio](#guía-rápida-de-inicio)
- [Estructura del Repositorio](#estructura-del-repositorio)
  - [legacy/](#legacy)
  - [frontend/](#frontend)
  - [services/](#services)
  - [contracts/](#contracts)
  - [infra/](#infra)
- [CI/CD](#cicd)
- [Principios Clave](#principios-clave-del-proyecto)
- [Estado del Proyecto](#estado-del-proyecto)
- [Tecnologías](#tecnologías-principales)
- [Contribuciones](#contribuciones)

---

## 📝 Descripción General
MindChat es una plataforma de salud mental que facilita la conexión entre pacientes y profesionales, gestionando sesiones, chats y citas. El proyecto está en proceso de migración de una arquitectura monolítica a una basada en microservicios, con despliegue automatizado y frontend desacoplado.

---

## 🚦 Requisitos Previos
- Docker y Docker Compose
- .NET 8 SDK
- Node.js (recomendado v18+)
- Kubernetes (opcional, para despliegue avanzado)
- Git

---

## 🚀 Guía Rápida de Inicio
1. Clona el repositorio:
	```bash
	git clone https://github.com/tu-usuario/MindChat.git
	cd MindChat
	```
2. Levanta los servicios y frontend en local:
	```bash
	docker-compose -f infra/docker/docker-compose.yml up --build
	```
3. Accede a la app en [http://localhost:3000](http://localhost:3000) (o el puerto configurado).

---

mindchat/

## 📁 Estructura del Repositorio

```text
mindchat/
├─ legacy/
├─ frontend/
├─ services/
├─ contracts/
├─ infra/
├─ README.md
└─ LICENSE.txt
```

A continuación se describe el propósito y contenido esperado de cada carpeta:

---


### legacy/
Contiene el **monolito original** de MindChat.

**Propósito:**
- Preservar el historial del proyecto.
- Servir como referencia durante la migración.
- Evitar dependencias directas con el nuevo sistema.

**Contenido esperado:**
- Proyecto ASP.NET Core MVC/Razor original.
- Capas Application, Domain e Infrastructure del monolito.
- No se realizan desarrollos nuevos aquí.

> 📌 **Nota:** El código en esta carpeta se considera **deprecado** y no debe ser referenciado por los microservicios nuevos.

---


### frontend/
Contiene el **frontend desacoplado** de la aplicación.

**Propósito:**
- Implementar la interfaz de usuario.
- Consumir los microservicios vía HTTP/WebSocket.
- No contener lógica de negocio.

**Contenido esperado:**
Estructura típica:
```text
frontend/
└─ nextjs-app/
	├─ app/
	├─ components/
	├─ services/
	├─ Dockerfile
	└─ README.md
```

> 📌 El frontend se comunica únicamente con el **API Gateway** y nunca directamente con microservicios internos.

---


### services/
Contiene todos los **microservicios backend**, cada uno como un proyecto independiente.

**Propósito:**
- Implementar capacidades de negocio aisladas.
- Permitir despliegue, escalado y versionado independiente.
- Mantener bases de datos separadas por servicio.

**Contenido esperado:**
```text
services/
├─ auth-service/
├─ user-service/
├─ patient-service/
├─ psychologist-service/
├─ chat-service/
└─ appointment-service/
```
Cada microservicio contiene, como mínimo:
```text
<service-name>/
├─ <Service>.Api/           # Minimal APIs (endpoints)
├─ <Service>.Application/   # Casos de uso y lógica de negocio
├─ <Service>.Domain/        # Entidades y reglas del dominio
├─ <Service>.Infrastructure/# Persistencia y adaptadores
├─ Dockerfile
└─ README.md
```

> 📌 Cada servicio se ejecuta como un proceso independiente, tiene su propio ciclo de vida y no comparte base de datos con otros servicios.

---


### contracts/
Contiene los **contratos compartidos** entre microservicios.

**Propósito:**
- Definir cómo se comunican los servicios entre sí.
- Evitar acoplamientos a entidades o lógica interna.

**Contenido esperado:**
```text
contracts/
└─ MindChat.Contracts/
	├─ Auth/
	├─ Users/
	├─ Chat/
	├─ Appointments/
	└─ Common/
```
Incluye:
- DTOs
- Eventos
- Enums globales (mínimos y estables)

🚫 **No contiene:**
- Entidades de dominio
- DbContext
- Servicios
- Lógica de negocio

---


### infra/
Contiene toda la **infraestructura y configuración operativa** del sistema.

**Propósito:**
- Definir cómo se despliega el sistema.
- Separar infraestructura del código de negocio.
- Facilitar ejecución local o en la nube.

**Contenido esperado:**
```text
infra/
├─ kubernetes/
│   ├─ auth-service.yaml
│   ├─ chat-service.yaml
│   ├─ ingress.yaml
│   └─ monitoring/
├─ docker/
│   └─ docker-compose.yml
└─ helm/
```
Incluye:
- Manifests de Kubernetes (Deployments, Services, Ingress)
- Configuración de monitoreo y logs
- Archivos de soporte para despliegue local

---


## 🔄 CI/CD
El repositorio está preparado para **CI/CD con GitHub Actions**.

**Ubicación:**
```text
.github/
└─ workflows/
```
**Responsabilidades:**
- Build automático
- Validación del código
- Construcción de imágenes Docker
- Despliegue progresivo (local o nube)

---


## 🧠 Principios Clave del Proyecto
- Un microservicio = un proceso = un contenedor
- Base de datos por servicio
- Comunicación vía contratos
- Infraestructura como código
- Frontend desacoplado del backend
- Migración progresiva desde el monolito (**Strangler Pattern**)

---


## 📌 Estado del Proyecto
- Monolito preservado como legado
- Microservicios en construcción
- CI/CD en configuración inicial
- Despliegue local con Docker y Kubernetes

---


## 🛠 Tecnologías Principales

| Tecnología         | Uso principal                |
|--------------------|-----------------------------|
| .NET 8             | Backend (Minimal APIs)       |
| Next.js            | Frontend                     |
| Docker/Kubernetes  | Contenedores y orquestación  |
| GitHub Actions     | CI/CD                        |
| SQL Server/Postgres| Persistencia de datos        |
| API Gateway (Ingress)| Entrada unificada           |

---

## 🤝 Contribuciones
¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request siguiendo las buenas prácticas del repositorio.

1. Haz un fork del proyecto
2. Crea una rama para tu feature/fix
3. Realiza tus cambios y haz commit
4. Abre un Pull Request describiendo tu aporte

---

<p align="center">
	<b>MindChat</b> – Plataforma de salud mental moderna y escalable.
</p>