# DockTask — Tauri v2 Setup

## Requisitos previos

### 1. Instalar Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 2. Dependencias del sistema (Ubuntu/Debian)
```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl wget file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### 3. Para iOS (macOS solamente)
```bash
xcode-select --install
cargo install tauri-cli --version "^2"
```

### 4. Para Android
```bash
# Instalar Android Studio + NDK
# Configurar ANDROID_HOME y NDK_HOME en el PATH
```

---

## Desarrollo

### Desktop (Linux / macOS / Windows)
```bash
npm run tauri:dev
```

### iOS (requiere macOS + Xcode)
```bash
npm run tauri:dev:ios
```

### Android
```bash
npm run tauri:dev:android
```

---

## Build producción

```bash
# Desktop
npm run tauri:build

# iOS
npm run tauri:build:ios

# Android
npm run tauri:build:android
```

---

## Estructura Rust (src-tauri/)

```
src-tauri/
├── Cargo.toml              — Dependencias Rust
├── tauri.conf.json         — Config Tauri (ventanas, bundle, permisos)
├── capabilities/
│   └── default.json        — Permisos de plugins
└── src/
    ├── main.rs             — Entry point
    ├── lib.rs              — Setup de plugins y commands
    ├── commands/
    │   ├── offline.rs      — SQLite local (offline storage)
    │   ├── notifications.rs— Alarmas y recordatorios
    │   ├── calendar.rs     — Integración calendario OS
    │   └── system.rs       — Info de red/plataforma
    └── sync/
        └── worker.rs       — Sync worker (thread independiente)
```

---

## Llamar a Rust desde React

```javascript
import { scheduleTaskReminder, saveTaskOffline, getNetworkStatus } from '@/lib/tauri';

// Verificar si hay red
const online = await getNetworkStatus();

// Guardar tarea offline
await saveTaskOffline({ id: 'task-1', title: 'Mi tarea', synced: false, ... });

// Programar recordatorio 1 hora antes del deadline
await scheduleTaskReminder({
  id: `rem-${task.id}`,
  task_id: task.id,
  title: 'DockTask ⏰',
  body: `"${task.title}" vence en 1 hora`,
  fire_at: new Date(new Date(task.end_date) - 3600000).toISOString(),
  repeat: null,
});
```

---

## Diagramas de arquitectura

Abrir con [draw.io](https://app.diagrams.net/):

- `arquitectura-general.drawio` — Stack completo
- `flujo-offline-sync.drawio` — Flujo offline y sincronización
- `flujo-notificaciones-alarmas.drawio` — Sistema de notificaciones
