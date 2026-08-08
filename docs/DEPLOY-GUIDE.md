# Guía de Despliegue - Railway & Vercel

## Arquitectura

```
Vercel (Frontend) ──▶ Railway (Backend Express) ──▶ Railway (Facial Service Python)
                                │                          │
                                └──────────────────────────┘
                                        │
                                Railway (PostgreSQL + pgvector)
```

## 1. PostgreSQL (Railway)

1. Crear servicio PostgreSQL en Railway
2. Habilitar extensión pgvector (en pestaña Data/Query):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Copiar la `DATABASE_URL` para los otros servicios

---

## 2. Backend Express (Railway)

### Crear servicio
- Nuevo servicio → GitHub Repo → seleccionar repo
- **Root Directory:** `backend`

### Configuración en Settings

| Campo | Valor |
|-------|-------|
| **Builder** | `Dockerfile` |
| **Custom Start Command** | **VACÍO** (crítico - si tiene algo, ignora el Dockerfile) |
| **Pre-deploy Command** | **VACÍO** |
| **Healthcheck Path** | `/health` |
| **Healthcheck Timeout** | `600` (10 min, necesario la primera vez) |

### Variables de entorno

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:PASS@host:5432/railway` | La del PostgreSQL |
| `FACIAL_SERVICE_URL` | URL pública del facial-service | Se configura después del deploy del facial |
| `JWT_SECRET` | Generar con `openssl rand -hex 32` | Obligatorio en producción |
| `CORS_ORIGINS` | URL de Vercel | Se configura después del deploy del frontend |
| `NODE_ENV` | `production` | Obligatorio para JWT_SECRET check |

### Dockerfile

```dockerfile
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### Orden de despliegue
1. PostgreSQL primero
2. Backend segundo (Prisma crea las tablas)
3. Facial service tercero (necesita las tablas)

---

## 3. Facial Service (Railway)

### Crear servicio
- Nuevo servicio → GitHub Repo → seleccionar repo
- **Root Directory:** `backend/facial-service`
- Railway detecta el `Dockerfile` automáticamente

### Configuración en Settings

| Campo | Valor |
|-------|-------|
| **Builder** | `Dockerfile` |
| **Custom Start Command** | **VACÍO** |
| **Healthcheck Path** | `/health` |

### Variables de entorno

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | La misma del PostgreSQL | Misma DB que el backend |
| `HOST` | `0.0.0.0` | Para aceptar conexiones externas |
| `PORT` | `3002` | Puerto del servicio |

---

## 4. Frontend (Vercel)

### Configurar en Vercel
- Importar repo de GitHub
- **Root Directory:** `frontend`
- Framework: `Vite` (auto-detectado)
- **Output Directory:** `dist`

### Variables de entorno

| Variable | Valor | Notas |
|----------|-------|-------|
| `VITE_API_URL` | URL del backend en Railway | Ej: `https://backend-xxx.up.railway.app` |

---

## 5. Cruzar URLs (después de todos los deploys)

| Variable | Enviar a | Valor |
|----------|----------|-------|
| URL de Vercel | Backend `CORS_ORIGINS` | `https://tu-app.vercel.app` |
| URL del Backend | Frontend `VITE_API_URL` | `https://backend-xxx.up.railway.app` |
| URL del Facial Service | Backend `FACIAL_SERVICE_URL` | URL pública del facial-service |

Después de actualizar estas variables, **redeployar** el backend.

---

## Errores comunes y soluciones

### Healthcheck falla sin errores visibles
**Causa:** Custom Start Command tiene un valor que sobreescribe el Dockerfile.
**Solución:** Dejar Custom Start Command VACÍO.

### `psycopg2.errors.UndefinedTable: relation "Entry" does not exist`
**Causa:** El facial-service se desplegó antes que el backend.
**Solución:** Desplegar backend primero (Prisma crea las tablas).

### `Prisma only supports Node.js versions 20.19+`
**Causa:** Nixpacks usa Node.js 18 por defecto.
**Solución:** Usar Dockerfile con `node:20-slim` en vez de Nixpacks.

### `FATAL ERROR: JWT_SECRET is not configured`
**Causa:** Falta la variable `JWT_SECRET` en producción.
**Solución:** Generar con `openssl rand -hex 32` y agregar en Variables.

### Backend no responde al healthcheck
**Causa:** El servidor tarda mucho en arrancar (migraciones + seed).
**Solución:** Aumentar Healthcheck Timeout a `600`.

---

## Comandos útiles

```bash
# Generar JWT_SECRET
openssl rand -hex 32

# Verificar conexión a DB (en Railway Query)
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

# Habilitar pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```
