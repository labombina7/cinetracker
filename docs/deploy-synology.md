# mediaTracker - Despliegue en NAS Synology

Docker + Apache + Proxy Inverso. La imagen se publica automáticamente en ghcr.io
con cada push a `main`. En el NAS solo hay que hacer pull.

## Flujo de despliegue

```
git push → GitHub Actions → ghcr.io/labombina7/cinetracker:latest
                                        ↓
                       NAS: docker compose pull && docker compose up -d
```

**Un solo secret necesario en GitHub** (`VITE_TMDB_API_KEY`).
El `GITHUB_TOKEN` lo provee GitHub Actions automáticamente.

---

## Setup inicial del NAS (solo una vez)

### Requisitos

- DSM 7.2.2 con Container Manager (Docker) instalado
- Dominio DDNS configurado (ej: `xava73.synology.me`)
- Certificado SSL válido (Let's Encrypt)
- Proxy inverso configurado en DSM (puerto 5554 → 8080)

#### 1. Crear estructura en el NAS

Crea una carpeta para el compose file:

```bash
mkdir -p /volume1/docker/mediatracker
cd /volume1/docker/mediatracker
```

Descarga el `docker-compose.yml` del repo (o créalo con este contenido):

```yaml
services:
  cinetracker:
    image: ghcr.io/labombina7/cinetracker:latest
    container_name: cinetracker-apache
    ports:
      - "8080:80"
    restart: unless-stopped
```

### 2. Primer arranque

```bash
docker compose pull
docker compose up -d
```

Verifica acceso local:
```
http://192.168.1.146:8080/
```

> **Nota:** `trakt-redirect.html` ya está incluido en la imagen — no hace falta copiarlo a mano.

---

## 3. Configurar Proxy Inverso en Synology (puerto 5554)

1. Accede a `Panel de control > Acceso externo > Proxy inverso`
2. Crea una regla:

| Campo            | Valor                                  |
|------------------|------------------------------------------|
| Descripción       | `cineTracker`                          |
| Protocolo origen | `HTTPS`                                 |
| Nombre de host   | `xava73.synology.me`                    |
| Puerto           | `5554`                                  |
| Ruta origen      | `/`                                     |
| Protocolo destino| `HTTP`                                  |
| Host destino     | `localhost`                             |
| Puerto destino   | `8080`                                  |
| Ruta destino     | `/`                                     |

✅ Activa WebSocket si te lo permite.

---

## 4. Configuración Trakt

- `redirect_uri` registrado en Trakt:

```
https://xava73.synology.me:5554/trakt-redirect.html
```

- En tu frontend, asegúrate de que al iniciar login haces:

```ts
const state = crypto.randomUUID();
sessionStorage.setItem("trakt_state", state);

const traktUrl = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
window.location.href = traktUrl;
```

- En `AuthCallback.tsx`:

```ts
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const returnedState = params.get("state");
const expectedState = sessionStorage.getItem("trakt_state");

if (returnedState !== expectedState) {
  console.error("State verification failed");
  return;
}

// POST a Trakt para recuperar el token
```

---

## 5. Consideraciones de CORS

Si el NAS está haciendo la petición a Trakt desde el frontend:

- Verifica que **no haces peticiones desde origen `http`** (debe ser `https`)
- Si Trakt rechaza, puedes usar un **servidor intermedio** o un `proxy` si lo necesitas (no fue necesario aquí)

---

## 6. Resultado final

Acceso desde fuera de la red:

```
https://xava73.synology.me:5554/
```

---

## Actualizar la app (flujo habitual)

```bash
# En el NAS — después de que GitHub Actions publique la nueva imagen
cd /volume1/docker/mediatracker
docker compose pull
docker compose up -d
```

GitHub Actions publica una nueva imagen en cada push a `main`. El workflow tarda ~2 min.

