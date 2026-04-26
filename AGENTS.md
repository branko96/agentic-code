# AGENTS.md

Guía operativa para agentes de IA que trabajen en este repositorio.

## 1. Objetivo del repo

Este proyecto es un monorepo con `pnpm` para una plantilla full-stack con:

- `apps/frontend`: aplicación Next.js 14 + React 18 + TypeScript
- `apps/backend`: API NestJS + Mongoose + TypeScript
- `tests/e2e`: pruebas end-to-end con Playwright
- `packages/*`: espacio reservado para paquetes compartidos

El workspace root coordina desarrollo, build, lint, typecheck y tests para todas las partes.

## 2. Mapa real del repositorio

```text
.
├── apps/
│   ├── frontend/           # Next.js app
│   │   ├── src/app/        # App Router
│   │   └── public/         # assets estáticos
│   └── backend/            # NestJS app
│       └── src/            # main.ts, app.module.ts, controladores/servicios
├── tests/
│   └── e2e/                # Playwright tests + config
├── packages/               # paquetes compartidos del monorepo
├── scripts/                # setup.sh, check-health.sh
├── .github/workflows/      # CI, E2E y PR checks
├── .husky/                 # hooks de git
├── package.json            # scripts root
├── pnpm-workspace.yaml     # definición de workspaces
├── README.md               # documentación general
├── CONTRIBUTING.md         # guía de contribución
└── AGENTS.md               # esta guía
```

## 3. Workspaces y stack

### Workspaces declarados

`pnpm-workspace.yaml` incluye:

- `apps/*`
- `packages/*`
- `tests/*`

### Versiones y herramientas base

- Node.js: `>=20.0.0`
- pnpm: `>=9.0.0`
- package manager fijado: `pnpm@9.0.0`
- `.nvmrc` presente en repo root

### Stack por área

#### Frontend (`apps/frontend`)

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ESLint con `next lint`

Scripts locales:

- `pnpm --filter frontend dev`
- `pnpm --filter frontend build`
- `pnpm --filter frontend start`
- `pnpm --filter frontend lint`
- `pnpm --filter frontend typecheck`
- `pnpm --filter frontend clean`

#### Backend (`apps/backend`)

- NestJS 10
- Mongoose / MongoDB
- TypeScript
- Jest para unit/integration style tests

Scripts locales:

- `pnpm --filter backend dev`
- `pnpm --filter backend build`
- `pnpm --filter backend start`
- `pnpm --filter backend start:prod`
- `pnpm --filter backend lint`
- `pnpm --filter backend test`
- `pnpm --filter backend test:cov`
- `pnpm --filter backend test:e2e`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend clean`

#### E2E (`tests/e2e`)

- Playwright
- TypeScript

Scripts locales:

- `pnpm --filter e2e-tests test`
- `pnpm --filter e2e-tests test:ui`
- `pnpm --filter e2e-tests test:headed`
- `pnpm --filter e2e-tests test:debug`
- `pnpm --filter e2e-tests report`

## 4. Comandos canónicos del root

Usar estos comandos desde el root salvo que haya una razón concreta para aislar un workspace:

```bash
pnpm install
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm clean
```

Definiciones reales del root:

- `pnpm dev`: corre `pnpm --parallel dev`
- `pnpm build`: corre `pnpm --recursive build`
- `pnpm test`: corre `pnpm --recursive test`
- `pnpm test:e2e`: corre `pnpm --filter e2e-tests test`
- `pnpm lint`: corre `pnpm --recursive lint`
- `pnpm typecheck`: corre `pnpm --recursive typecheck`

## 5. Flujo de trabajo recomendado para agentes

1. Leer `README.md`, `package.json` y el workspace afectado antes de editar.
2. Limitar cambios al área pedida; no refactorizar partes no relacionadas.
3. Preferir comandos root cuando el cambio cruza workspaces.
4. Si el cambio es local a un workspace, validar sólo ese workspace primero.
5. Antes de terminar, correr como mínimo las validaciones proporcionales al cambio.
6. Antes de commitear, asumir que Husky ejecutará `lint-staged`.

## 6. Validación mínima esperada

Elegir el set más pequeño que pruebe correctamente el cambio:

### Cambios sólo en documentación (`*.md`)

- `pnpm format:check`

### Cambios en frontend

- `pnpm --filter frontend lint`
- `pnpm --filter frontend typecheck`
- si afecta build/routing: `pnpm --filter frontend build`

### Cambios en backend

- `pnpm --filter backend lint`
- `pnpm --filter backend typecheck`
- `pnpm --filter backend test`
- si afecta arranque/compilación: `pnpm --filter backend build`

### Cambios cross-workspace o CI-sensitive

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

### Cambios que impactan flujos completos

- `pnpm test:e2e`

Nota: los E2E requieren más preparación. En CI se levanta MongoDB, se copia `apps/backend/.env.example` a `apps/backend/.env`, se inyecta `MONGODB_URI`, se hace `pnpm build` y luego se ejecuta Playwright.

## 7. Convenciones de código y formato

### Formatting

Según `.editorconfig` y `.prettierrc`:

- indentación de 2 espacios
- `lf`
- `utf-8`
- `semi: true`
- `singleQuote: true`
- `printWidth: 100`
- `trailingComma: es5`
- `arrowParens: always`

### TypeScript

Patrones explícitos en `CONTRIBUTING.md`:

- preferir tipos explícitos; evitar `any`
- nombres descriptivos
- funciones pequeñas y enfocadas
- seguir el estilo ya existente del archivo antes de introducir cambios

### React / Next.js

- componentes funcionales con TypeScript
- respetar la estructura bajo `src/app`
- no introducir patrones distintos si el archivo ya sigue App Router idiomático

### NestJS

- seguir organización modular
- usar tipos de retorno explícitos
- mantener consistencia con controladores/servicios existentes

## 8. Hooks y checks automáticos

### Husky pre-commit

`.husky/pre-commit` ejecuta:

```bash
pnpm lint-staged
```

### lint-staged

`.lintstagedrc.js` aplica:

- `**/*.{js,jsx,ts,tsx}` → `eslint --fix` + `prettier --write`
- `**/*.{json,md,yml,yaml}` → `prettier --write`
- `apps/frontend/**/*.{ts,tsx}` → `pnpm --filter frontend typecheck`
- `apps/backend/**/*.ts` → `pnpm --filter backend typecheck`

Consecuencia práctica:

- si tocás `AGENTS.md`, el commit probablemente re-formatee el archivo con Prettier
- si tocás TS de frontend/backend, el hook también ejecutará typecheck específico

### Husky commit-msg

`.husky/commit-msg` valida Conventional Commits con este patrón:

```text
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,100}
```

Usar mensajes como:

- `docs: rewrite AGENTS guide`
- `fix(backend): handle missing config`
- `feat(frontend): add dashboard card`

## 9. CI real del repositorio

### `.github/workflows/ci.yml`

Se ejecuta en `push` y `pull_request` sobre `main` y `develop`.

Jobs:

- `lint` → `pnpm lint` + `pnpm format:check`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`
- `build` → depende de los anteriores y corre `pnpm build`

### `.github/workflows/e2e.yml`

Se ejecuta en `push` y `pull_request` sobre `main` y `develop`.

Incluye:

- servicio MongoDB 7
- instalación de browsers de Playwright
- setup de `apps/backend/.env`
- `pnpm build`
- `pnpm test:e2e`

### `.github/workflows/pr-check.yml`

Checks adicionales para PRs:

- título de PR semántico
- warnings por PR muy grande
- dependency review con fallo desde severidad `moderate`
- aviso si aparecen `console.*` nuevos
- aviso si aparecen `TODO` / `FIXME`

## 10. Scripts auxiliares

### `scripts/setup.sh`

Usarlo para bootstrap local del proyecto. Según `README.md`, instala dependencias, crea env files, instala browsers de Playwright e inicializa git.

### `scripts/check-health.sh`

Útil para verificar que los servicios estén corriendo correctamente.

## 11. Configuración y entorno

Datos importantes inferidos del repo:

- el backend espera `.env`
- en E2E se usa `apps/backend/.env.example` como base
- MongoDB es una dependencia real del backend/E2E
- frontend y backend viven típicamente en `3000` y `3001` respectivamente según `README.md`

Si una tarea toca configuración:

- no hardcodear secretos
- no commitear `.env`
- preferir documentar variables nuevas en `README.md` si la tarea lo requiere

## 12. Cómo decidir dónde tocar

### Si la tarea menciona UI, rutas o componentes

Buscar primero en:

- `apps/frontend/src/app`
- `apps/frontend/src/components` si existe o aparece luego en el repo
- `apps/frontend/src/lib`

### Si la tarea menciona API, módulos o datos

Buscar primero en:

- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`
- controladores/servicios/módulos bajo `apps/backend/src`

### Si la tarea menciona journeys de usuario

Buscar primero en:

- `tests/e2e/playwright.config.ts`
- `tests/e2e/tests`

## 13. Reglas prácticas para agentes

- No inventar arquitectura: derivarla de los archivos actuales.
- No asumir que `packages/` está en uso activo si no hay paquetes concretos.
- No documentar comandos no soportados por `package.json`.
- No decir que algo corre en CI si no aparece en `.github/workflows`.
- No agregar nuevas capas o abstracciones en cambios pequeños.
- Mantener commits y PRs chicos cuando sea posible; `pr-check.yml` marca PRs grandes.
- Evitar introducir `console.log`, `TODO` y `FIXME` nuevos porque PR checks los señalan.

## 14. Checklist rápido antes de cerrar una tarea

- ¿Leí el workspace correcto antes de editar?
- ¿El comando de validación ejecutado coincide con el área tocada?
- ¿El cambio respeta Prettier/EditorConfig?
- ¿El mensaje de commit sigue Conventional Commits?
- ¿Estoy documentando sólo hechos verificables del repo?

## 15. Comando mínimo sugerido para este repo

Para cambios pequeños y localizados:

```bash
pnpm format:check
```

Para cambios de código en un workspace:

```bash
pnpm --filter <workspace> lint
pnpm --filter <workspace> typecheck
```

Para validar como CI:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
```
