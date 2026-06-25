# CineTracker - Despliegue en NAS Synology usando Docker + Apache + Proxy Inverso

Este documento explica cómo desplegar la aplicación CineTracker en un NAS Synology utilizando:

- Docker con Apache (httpd:2.4)
- Carpeta compartida como volumen
- Proxy inverso configurado en DSM (puerto 5554)
- HTTPS con dominio Synology (Let's Encrypt)
- Flujo OAuth2 con Trakt.tv usando `trakt-redirect.html`

---

## Requisitos previos

- DSM 7.2.2 con Docker instalado
- Dominio DDNS configurado (ej: `xava73.synology.me`)
- Certificado SSL válido (Let's Encrypt)
- Acceso por SSH activado
- Proyecto CineTracker ya compilado (`npm run build`) con `HashRouter`

---

## 1. Crear estructura en el NAS

1. Crea la carpeta en el NAS:
   ```bash
   mkdir -p /volume1/web/cineTracker
   ```
2. Copia el contenido de la carpeta `dist/` (build de Vite) a `/volume1/web/cineTracker/`
   Puedes usar File Station o SCP.

---

## 2. Crear contenedor Docker con Apache

Usa esta imagen directamente con volumen:

```bash
docker run -d \
  -p 8080:80 \
  --name cinetracker-apache \
  -v /volume1/web/cineTracker:/usr/local/apache2/htdocs/ \
  httpd:2.4
```

Verifica que puedes acceder en red local:

```
http://192.168.1.146:8080/
```

---

## 3. Crear archivo `trakt-redirect.html`

Guarda este archivo en `/volume1/web/cineTracker/`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting...</title>
  </head>
  <body>
    <script>
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      if (code && state) {
        window.location.href = `/#/auth/callback?code=${code}&state=${state}`;
      } else {
        document.body.innerText = "Missing code or state.";
      }
    </script>
  </body>
</html>
```

---

## 4. Configurar Proxy Inverso en Synology (puerto 5554)

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

## 5. Configuración Trakt

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

## 6. Consideraciones de CORS

Si el NAS está haciendo la petición a Trakt desde el frontend:

- Verifica que **no haces peticiones desde origen `http`** (debe ser `https`)
- Si Trakt rechaza, puedes usar un **servidor intermedio** o un `proxy` si lo necesitas (no fue necesario aquí)

---

## 7. Resultado final

Puedes acceder a la app desde fuera de tu red:

```
https://xava73.synology.me:5554/
```

Con Trakt funcionando, rutas con HashRouter, HTTPS válido y sin errores 400 ni de permisos.

---

🎉 Despliegue limpio, aislado y seguro en NAS Synology. ¡Listo para producción!

