# 🗺️ DockTask — Roadmap

> Historial de lo construido y hacia dónde vamos.
> Actualizado: **Marzo 2026**

---

## ✅ Completado

### 🌐 Web App (Frontend)

| Feature | PR | Fecha |
|---|---|---|
| Vista de mensajes / tareas | — | Feb 2026 |
| CRUD mensajes con estados | — | Feb 2026 |
| Autenticación JWT (login / register) | — | Feb 2026 |
| Vista de proyectos | — | Feb 2026 |
| **GanttBoard conectado a API real** por proyecto | [#6](../../pull/6) | 01 Mar 2026 |
| Ruta `/mis-proyectos/:id/gantt` + botón en ProjectCard | [#6](../../pull/6) | 01 Mar 2026 |
| **Workspaces** — CRUD completo (vista, crear, editar, eliminar) | [#7](../../pull/7) | 01 Mar 2026 |
| Navbar con bottom nav en Android / hamburger en web | [#8](../../pull/8) | 04 Mar 2026 |
| **Splash screen** animada (cara ansiosa, cabeza abierta con íconos flotantes) | — | 04 Mar 2026 |
| Fix safe-area / margin-top en Android | — | 04 Mar 2026 |
| Fix redireccionamiento en error 401 (no redirigir en 404) | — | 04 Mar 2026 |
| `.env.production` con URL de API correcta | — | 04 Mar 2026 |

---

### 🔧 Backend (API REST — Flask)

| Feature | PR | Fecha |
|---|---|---|
| Modelo Mensaje con `start_date` para soporte Gantt | [#3](https://github.com/sti-chile/docktask_backend/pull/3) | 24 Feb 2026 |
| **Modelo Workspace** + rutas REST `/api/workspaces` | [#6](https://github.com/sti-chile/docktask_backend/pull/6) | 01 Mar 2026 |
| Soporte Gantt completo en API | [#7](https://github.com/sti-chile/docktask_backend/pull/7) | 02 Mar 2026 |
| Tabla `workspace` creada en Neon DB (producción) | — | 02 Mar 2026 |
| Pipeline CI/CD corregido (EC2 deploy automático) | — | 03 Mar 2026 |
| Alembic migration revision consolidada | — | 03 Mar 2026 |

---

### 📱 App Móvil Android (Tauri v2)

| Feature | PR | Release | Fecha |
|---|---|---|---|
| Arquitectura Tauri v2 — Sprint 1 | [#8](../../pull/8) | — | 04 Mar 2026 |
| Sync worker offline (SQLite + Rust) | [#8](../../pull/8) | — | 04 Mar 2026 |
| Notificaciones persistentes con `fire_at` | [#8](../../pull/8) | — | 04 Mar 2026 |
| Deep links (`docktask://` + `app.docktask.com`) | [#8](../../pull/8) | — | 04 Mar 2026 |
| Bottom navigation bar (Android nativa) | [#8](../../pull/8) | — | 04 Mar 2026 |
| CI/CD Android — build + firma con `apksigner` | — | — | 04 Mar 2026 |
| **APK v1.0.1** — Fix API URL en producción | — | [v1.0.1-android](../../releases/tag/v1.0.1-android) | 04 Mar 2026 |
| **APK v1.0.2** — Splash screen + safe-area fix | — | [v1.0.2-android](../../releases/tag/v1.0.2-android) | 04 Mar 2026 |

---

## 🔄 En Progreso / QA

- [ ] **QA manual de APK v1.0.2** — login, registro, navegación básica
- [ ] Validar sync offline en Android
- [ ] Probar deep links en dispositivo físico

---

## 📋 Backlog

### 🎨 UX / Diseño
- [ ] Iconos definitivos de la app (splash icon, adaptive icon Android)
- [ ] Modo oscuro
- [ ] Animaciones de transición entre vistas
- [ ] Skeleton loaders en todas las vistas

### 📱 Mobile
- [ ] Soporte iOS (requiere Apple Developer Account)
- [ ] Push notifications reales (FCM/APNs)
- [ ] Publicar en Google Play Store (requiere cuenta developer)
- [ ] Widget Android para tareas pendientes

### 🌐 Web / Backend
- [ ] Filtros avanzados en vista de mensajes
- [ ] Adjuntos / archivos en mensajes
- [ ] Comentarios en tareas
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Exportar Gantt a PDF / imagen
- [ ] Panel de métricas y estadísticas por proyecto
- [ ] Integración con calendarios (Google Calendar)

### 🔧 Infraestructura
- [ ] Dominio `api.docktask.com` con HTTPS estable (verificar DNS)
- [ ] CI/CD para backend con deploy automático a EC2
- [ ] Monitoreo y alertas del servidor (Uptime, errores 5xx)
- [ ] Staging environment separado de producción

---

## 📦 Releases Android

| Versión | Cambios | Link |
|---|---|---|
| v1.0.2 | Splash screen + safe-area fix | [Descargar](../../releases/download/v1.0.2-android/docktask-v1.0.2-android.apk) |
| v1.0.1 | Fix API URL producción (`localhost` → `api.docktask.com`) | [Descargar](../../releases/download/v1.0.1-android/docktask-v1.0.1-android.apk) |

---

*Este roadmap se actualiza con cada feature entregada.*
