# Épica: Gestión de Favoritos

## Objetivo

Que el usuario tenga sus favoritos disponibles siempre, con o sin cuenta Trakt, y que la app los mantenga en sync tanto en local como en remoto sin inconsistencias.

---

## Historias de usuario incluidas

| US | Título | Dependencias |
|---|---|---|
| [US-009](US-009-correccion-colision-ids-favoritos.md) | Corrección de colisión de IDs | — |
| [US-024](US-024-favoritos-persistencia-local.md) | Persistencia local + aviso sin Trakt | US-009 |
| [US-025](US-025-favoritos-sin-trakt.md) | Gestión de favoritos sin cuenta Trakt | US-024 |
| [US-026](US-026-favoritos-sincronizacion-trakt.md) | Sincronización bidireccional con Trakt | US-025 |
| [US-027](US-027-favoritos-consistencia-global.md) | Consistencia global de favoritos | US-024, US-026 |
| [US-028](US-028-pagina-favoritos-carruseles.md) | Página Mis Favoritos con carruseles | US-025, US-027 |
| [US-029](US-029-lista-favoritos-drill-down.md) | Lista drill-down de favoritos | US-028 |

---

## Flujo general

```
Usuario abre la app
  ├── Sin Trakt → carga favoritos desde localStorage (US-024)
  │     └── Puede añadir/quitar favoritos → persisten en localStorage (US-025)
  │           └── Banner/tooltip avisa que se perderán sin cuenta Trakt (US-024)
  └── Con Trakt → fusiona favoritos locales + watchlist de Trakt (US-026)
        ├── Añadir favorito → guarda en local + añade a Trakt watchlist
        └── Quitar favorito → elimina de local + elimina de Trakt watchlist
              └── En ambos casos la UI refleja el estado real (US-027)

Usuario pulsa ♥ en navbar → /favorites (US-028)
  ├── Carrusel "Películas" (N) → "Ver todas" → /favorites/list?type=movie
  └── Carrusel "Series" (N)   → "Ver todas" → /favorites/list?type=tv
        └── Grid filtrable por tipo + búsqueda, desmarcar reactivo (US-029)
```

---

## Estado actual (bugs conocidos)

- Los favoritos se guardan como `number[]` sin distinguir `movie`/`tv` → colisión de IDs (US-009 los corrige)
- No hay sincronización con Trakt watchlist al quitar favoritos
- No hay recuperación de favoritos desde Trakt al arrancar
- No hay aviso al usuario de que los favoritos son volátiles sin cuenta

---

## Fuera de alcance de esta épica

- Página dedicada "Mis Favoritos" (puede ser una US posterior)
- Exportación/importación de favoritos en CSV o JSON
- Ordenación o filtrado dentro de favoritos
