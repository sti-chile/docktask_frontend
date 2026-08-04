# CLAUDE.md

**Las reglas del proyecto están en [`AGENTS.md`](./AGENTS.md). Leelo antes de
escribir código.** Ahí está el formato, la paleta y tipografía de marca, las
reglas duras del logo, las convenciones de commits y la deuda conocida.

Este archivo es un puntero a propósito: duplicar las reglas garantiza que las dos
copias se desincronicen y que nadie sepa cuál manda. `AGENTS.md` es la única
fuente de verdad y lo leen todos los agentes, no sólo Claude.

## Recordatorios rápidos

- Formato: 4 espacios, sin punto y coma, comillas dobles, ancho 100. Corré
  `npm run format` antes de commitear; no formatees con la config de tu editor.
- Los cuatro comandos que tienen que pasar antes de terminar:
  `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.
- Paleta: usá los tokens `brand-*` de Tailwind, nunca hex sueltos.
- El logo **nunca** se recrea: se usan los SVG de `src/assets/`.
- Commits en español, conventional, uno por unidad de trabajo, **sin atribución
  de IA**.

## Verificación visual

Para revisar cambios de UI de verdad, levantá el dev server y mirá la pantalla en
un navegador antes de declarar que algo funciona. Un build en verde no prueba que
la vista se vea bien, y si nada importa un componente, el bundler lo descarta sin
compilarlo: un `vite build` exitoso **no** valida un archivo que nadie importa.
