# AGENTS.md — DockTask Frontend

Reglas obligatorias para cualquiera que escriba código acá: agentes de IA
(Claude, Codex, Copilot, Cursor) y personas por igual.

Este archivo existe porque el estándar del proyecto vivía sólo en la config del
editor de un desarrollador. Nadie más podía leerlo, así que nadie más podía
cumplirlo. Si cambiás una convención, **cambiala acá primero**.

---

## 1. Stack

React 18 · Vite 5 · Tailwind 3.4 + shadcn · react-router-dom 6 · TanStack Query ·
Tauri 2 (escritorio y Android) · Vitest + Testing Library.

Alias `@` → `src` (declarado en `vite.config.js`; el `jsconfig.json` es sólo para
el editor). Usá `@/...` para imports que cruzan carpetas.

## 2. Antes de dar por terminado un cambio

Los cuatro comandos tienen que pasar. No es opcional:

```bash
npm run format:check   # prettier con el .prettierrc del repo
npm run lint           # sin errores NUEVOS (hay deuda preexistente, ver §6)
npm test               # vitest
npm run build          # build de producción
```

Si `format:check` falla, corré `npm run format`. **No formatees a mano ni con la
config de tu editor**: la única fuente de verdad es `.prettierrc`.

## 3. Formato de código

Definido en `.prettierrc`, no lo dupliques en tu cabeza:

- **4 espacios** de indentación en JS/JSX/TS/TSX.
- **Sin punto y coma** al final de línea.
- **Comillas dobles**, ancho máximo 100, `trailingComma: es5`.
- 2 espacios en archivos de config, JSON, Markdown y YAML.

`.editorconfig` cubre editores que no pasan por prettier.

## 4. Identidad de marca

Fuente única: **Manual de Identidad Visual DockTI v1.0 (Junio 2026)**, en
`DockTI_Brand_Assets/03_Docs_Print/Manual_de_Marca_DockTI.pdf`.
Contacto de marca: javierferreira@agenciach.cl

### Filosofía visual — condiciona cualquier decoración que agregues

La identidad nace del Neoplasticismo y el Arte Cinético aplicados a una red
neuronal abstracta: **geometría plana, planos bidimensionales, líneas
estructurales, color plano**. Sin volumen, sin brillos, sin 3D.

La retícula gris perla es la infraestructura: ordenada, confiable, silenciosa.
Los nodos de color son las soluciones y las personas. El punto terracota es la
sinapsis: el momento en que la tecnología conecta con quien la usa.

> Orden estructural + pulso orgánico = tecnología cercana

Si agregás elementos decorativos, respetá eso: formas geométricas planas, sin
sombras ni degradados gratuitos.

### Paleta — usá los tokens de Tailwind, nunca hex sueltos

| Token           | Hex       | Nombre oficial             | Uso                                  |
| --------------- | --------- | -------------------------- | ------------------------------------ |
| `brand-blue`    | `#0D47A1` | Azul Cobalto Profundo      | Titulares, estabilidad, software     |
| `brand-lime`    | `#A3C614` | Verde Lima / Musgo Vivo    | Acentos. **Nunca** párrafos largos   |
| `brand-red`     | `#E57373` | Terracota / Calafate Seco  | Acentos cinéticos, sinapsis          |
| `brand-pearl`   | `#CFD8DC` | Gris Perla / Piedra Tundra | Líneas, bordes y fondos limpios      |
| `brand-slate`   | `#546E7A` | Gris Pizarra               | Submarca STI Chile, texto secundario |
| `brand-ink`     | `#1A1A1A` | Tinta                      | Cuerpo de texto y monocromático      |
| `brand-surface` | `#F5F7F1` | — **derivado, no oficial** | Superficies amplias (footer)         |

**Proporción de uso:** azul dominante, gris perla y blanco como base. Lima y
terracota **solamente** como acentos.

**Jerarquía de color en texto:** titulares en Azul Cobalto, cuerpo en Tinta,
apoyos en Gris Pizarra.

Los tokens de shadcn (`primary`, `muted`, `border`, …) siguen siendo válidos para
componentes de UI y modo oscuro. La paleta `brand-*` es para superficies de marca.

### Tipografía

**Poppins** (Google Fonts): Bold para titulares, Medium para subtítulos, Regular
para cuerpo y UI, Light para datos. Alternativas compatibles y aceptadas por el
manual: **Montserrat** e **Inter**.

⚠️ Hoy la app usa el stack de fuentes del sistema (`src/index.css`), que no es
ninguna de las tres. Es deuda conocida, ver §6.

### Logo — reglas duras

Archivos en `src/assets/`: `DockTI_Logo_Principal.svg`, `DockTI_Logo_Blanco.svg`,
`DockTI_Logo_Monocromatico.svg`, `DockTI_Isotipo.svg`.

1. **NUNCA recrear el logo.** Ni con vectores, ni con texto, ni con divs. Usá
   siempre los archivos originales. Es literal en el manual.
2. Versión según el fondo: **Principal** sobre blanco o gris perla claro;
   **Blanco/Negativo** sobre fondos oscuros o azul cobalto; **Monocromática** para
   documentos legales; **Isotipo** para avatar, favicon o espacios cuadrados.
3. **Área de respeto:** el margen mínimo equivale al diámetro del nodo terracota
   central. Ningún texto ni gráfico puede invadirla.
4. **Tamaño mínimo: 120 px** en digital (30 mm en impresión). `h-14` sobre el
   lockup queda en ~132 px de ancho: no bajes de ahí.
5. Prohibido: rotar o inclinar, alterar la paleta, aplicar sombras, 3D,
   degradados, volumen o brillos, deformar proporciones, cambiar la tipografía,
   recolorear los nodos y separar la submarca «STI CHILE» de su posición.

### Assets

- **SVG** es el formato preferente para web; PDF y SVG son los maestros.
- **PNG**: usar la resolución entregada, nunca escalar hacia arriba.
- Imágenes decorativas grandes: **webp**. El fondo del login pasó de 5.4 MB (PNG
  a 2x) a 37 KB en webp sin pérdida perceptible. No metas PNG de megabytes.

## 5. Convenciones de código ya decididas

- **Commits:** conventional commits en español (`feat:`, `fix:`, `chore:`,
  `style:`), uno por unidad de trabajo. Los tests van en el **mismo** commit que
  el comportamiento que verifican. **Sin atribución de IA ni `Co-Authored-By`.**
- **Reformateo masivo va siempre en su propio commit `style:`**, nunca mezclado
  con lógica: destruye la legibilidad del diff y arruina `git blame`.
- **Rutas internas:** `<Link to="...">` de react-router, y verificá que la ruta
  exista en `App.jsx` antes de linkearla.
- **Tauri:** usá `useTauri()` para ocultar UI de marketing o pitch. El mismo
  `/login` corre dentro de la app instalada, donde explicar el producto es ruido.
- **Hooks:** nunca condicionales ni después de un early return.
- **Tests:** en `src/**/__tests__/*.test.jsx`. Importá `describe/it/expect/vi`
  explícitamente desde `vitest` aunque `globals: true` esté activo — ESLint sólo
  tiene globals de browser y si depended de los globales tirás `no-undef`.
- Mockeá `@/lib/httpClient` en los tests: ninguno debe tocar la red.

## 6. Deuda conocida — no la empeores

- **14 errores de lint preexistentes** en archivos no relacionados (variables
  muertas, `catch {}` vacíos). No agregues errores nuevos.
- **`Dashboard.jsx:122` — bug real**: `React.useState` llamado condicionalmente
  (`react-hooks/rules-of-hooks`). Merece su propio arreglo.
- **La app no usa Poppins** sino el stack del sistema. Decisión pendiente: o se
  carga Poppins, o se declara Inter como la alternativa oficial del producto.
- **Enlaces del footer** de Recursos y Legal apuntan a `#`: faltan las URLs.
- **`portada_docktask.pen`** contiene un mock del footer donde el logo está
  **recreado con vectores nativos** de Pencil. Sirve para maquetar, pero viola la
  regla de no recrear: **no exportes eso como asset**. Para producción se usan los
  SVG de `src/assets/`.
- **Fondo del login:** si hay que regenerarlo, exportá el frame `Login Background`
  del `.pen`, **no la portada**. La portada es una composición tipo póster con
  elementos grandes y centro vacío; con `bg-cover` sólo se ve su centro y queda
  recortada. El fondo necesita densidad uniforme.
