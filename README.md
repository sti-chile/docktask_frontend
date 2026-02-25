# 🚀 DockTask Frontend

**Frontend de DockTask** — Aplicación de gestión de proyectos y mensajes, construida con **React 18 + Vite**, usando componentes modernos, hooks y Tailwind CSS.  
El backend está implementado en Flask + PostgreSQL.

![DockTask Dashboard Screenshot](public/vite.svg) 

## ✨ Características

- Autenticación JWT
- Gestión de usuarios, proyectos y mensajes
- Vistas tipo Kanban, Gantt y Calendario
- UI moderna con **Tailwind CSS** + componentes reutilizables
- API RESTful (conexión a backend Flask)
- Experiencia optimizada para desktop

---

## 🛠️ Instalación local

**Requisitos:**  
- Node.js >= 18.x  
- npm >= 9.x (o yarn/pnpm)

```bash
# Clona el repositorio
git clone git@github.com:javaferso/docktask_frontend.git
cd docktask_frontend

# Instala dependencias
npm install

# Copia el ejemplo de variables de entorno
cp .env.example .env
# Edita .env según tu backend/API

# Corre la app en modo desarrollo
npm run dev

# Abre http://localhost:5173
⚡ Despliegue en Vercel
Vercel detecta automáticamente proyectos Vite/React y los despliega en minutos:

Haz Push de tu código a GitHub (rama main recomendada).

Ve a vercel.com/import/git y selecciona tu repo.

Configura las variables de entorno (.env) necesarias desde el dashboard de Vercel.

Vercel compilará y publicará automáticamente cada push a main o cualquier rama seleccionada.

Variables sugeridas en Vercel
VITE_API_URL=https://<TU_BACKEND_URL>

(Agrega aquí cualquier variable sensible requerida por tu app)

🌐 Estructura del Proyecto
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── views/
│   ├── ui/
│   ├── hooks/
│   ├── services/
│   ├── main.jsx
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
🧑‍💻 Scripts principales
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --fix"
}
🤝 Colaboradores
¡Pull Requests y sugerencias son bienvenidas!
Contacta a Javier Ferreira para soporte o preguntas.

📄 Licencia
MIT

Desarrollado con ❤️ por el equipo DockTask
Backend API | Frontend
