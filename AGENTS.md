# AGENTS.md

Guía operativa para agentes de IA que trabajen en este repositorio.

## 1. Qué es este repo

Monorepo con `pnpm` para una plantilla full-stack con:

- `apps/frontend`: Next.js 14 + React 18 + TypeScript
- `apps/backend`: NestJS 10 + Mongoose + TypeScript
- `tests/e2e`: Playwright

El root coordina instalación, desarrollo, lint, typecheck, tests y build.

## 2. Estructura real del proyecto

```text
.
├── apps/
│   ├── frontend/           # app Next.js
│   │   ├── src/app/        # App Router
│   │   └── src/            # app, componentes y utilidades
│   └── backend/            # app NestJS
│       └── src/            # main.ts, app.module.ts, módulos/servicios
├── tests/
│   └── e2e/                # Playwright
├── scripts/                # setup.sh, check-health.sh
├── .github/workflows/      # CI, E2E y PR checks
├── .husky/                 # hooks git
├── package.json            # scripts root
├── pnpm-workspace.yaml     # workspaces declarados
├── README.md
├── CONTRIBUTING.md
└── AGENTS.md
```

Notas verificadas:

- `pnpm-workspace.yaml` declara `apps/*`, `packages/*` y `tests/*`.
- En este checkout no existe un directorio `packages/` real. No asumir paquetes compartidos hasta que exista alguno.
- Los workspaces efectivos hoy son `frontend`, `backend` y `e2e-tests`.

## 3. Runtime y herramientas base

- Node requerido en root: `>=20.0.0`
- `.nvmrc`: `20.11.0`
- pnpm requerido: `>=9.0.0`
- package manager fijado: `pnpm@9.0.0`

## 4. Scripts canónicos del root

Definidos en `package.json`:

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm build
pnpm build:frontend
pnpm build:backend
pnpm test
pnpm test:e2e
pnpm lint
pnpm format
pnpm format:check
pnpm typecheck
pnpm clean
```

Implementación real:

- `pnpm dev` → `pnpm --parallel dev`
- `pnpm build` → `pnpm --recursive build`
- `pnpm test` → `pnpm --recursive test`
- `pnpm test:e2e` → `pnpm --filter e2e-tests test`
- `pnpm lint` → `pnpm --recursive lint`
- `pnpm typecheck` → `pnpm --recursive typecheck`

Usar comandos root cuando el cambio cruza más de un workspace. Si el cambio es local, validar primero con `--filter`.

## 5. Workspaces y comandos locales

### Frontend (`apps/frontend`)

Stack verificado en `apps/frontend/package.json`:

- Next.js `^14.1.0`
- React `^18.2.0`
- TypeScript
- Tailwind CSS
- ESLint con `next lint`

Scripts:

```bash
pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend start
pnpm --filter frontend lint
pnpm --filter frontend typecheck
pnpm --filter frontend clean
```

Buscar primero en:

- `apps/frontend/src/app`
- `apps/frontend/src/components` si existe
- `apps/frontend/src/lib` si existe

### Backend (`apps/backend`)

Stack verificado en `apps/backend/package.json`:

- NestJS `^10.3.0`
- Mongoose `^8.1.0`
- `@nestjs/config`
- Jest

Scripts:

```bash
pnpm --filter backend dev
pnpm --filter backend build
pnpm --filter backend start
pnpm --filter backend start:dev
pnpm --filter backend start:debug
pnpm --filter backend start:prod
pnpm --filter backend lint
pnpm --filter backend test
pnpm --filter backend test:watch
pnpm --filter backend test:cov
pnpm --filter backend test:e2e
pnpm --filter backend typecheck
pnpm --filter backend clean
```

Buscar primero en:

- `apps/backend/src/main.ts`
- `apps/backend/src/app.module.ts`
- módulos, controladores y servicios bajo `apps/backend/src`

### E2E (`tests/e2e`)

Stack verificado en `tests/e2e/package.json`:

- `@playwright/test`
- TypeScript

Scripts:

```bash
pnpm --filter e2e-tests test
pnpm --filter e2e-tests test:ui
pnpm --filter e2e-tests test:headed
pnpm --filter e2e-tests test:debug
pnpm --filter e2e-tests test:codegen
pnpm --filter e2e-tests report
```

Buscar primero en:

- `tests/e2e/playwright.config.ts`
- `tests/e2e/tests`

## 6. Convenciones de formato y estilo

Según `.editorconfig`:

- charset `utf-8`
- fin de línea `lf`
- indentación de 2 espacios
- `insert_final_newline = true`
- en Markdown no se recortan trailing spaces

Según `.prettierrc`:

- `semi: true`
- `singleQuote: true`
- `printWidth: 100`
- `trailingComma: es5`
- `tabWidth: 2`
- `useTabs: false`
- `arrowParens: always`
- `endOfLine: lf`

Según `CONTRIBUTING.md`:

- evitar `any`
- usar nombres descriptivos
- mantener funciones pequeñas y enfocadas
- seguir el estilo existente del archivo antes de introducir patrones nuevos

## 7. Hooks locales y efecto sobre commits

### Pre-commit

`.husky/pre-commit` ejecuta:

```bash
pnpm lint-staged
```

`.lintstagedrc.js` aplica:

- `**/*.{js,jsx,ts,tsx}` → `eslint --fix` y `prettier --write`
- `**/*.{json,md,yml,yaml}` → `prettier --write`
- `apps/frontend/**/*.{ts,tsx}` → `pnpm --filter frontend typecheck`
- `apps/backend/**/*.ts` → `pnpm --filter backend typecheck`

Consecuencia práctica:

- si tocás `AGENTS.md`, el hook va a re-formatearlo con Prettier
- si tocás TypeScript de frontend o backend, además corre typecheck específico

### Commit message

`.husky/commit-msg` valida Conventional Commits con:

```text
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .{1,100}
```

Ejemplos válidos:

- `docs: rewrite AGENTS guide`
- `fix(backend): handle missing config`
- `feat(frontend): add dashboard card`

## 8. CI real del repositorio

### `.github/workflows/ci.yml`

Trigger:

- `push` a `main` y `develop`
- `pull_request` hacia `main` y `develop`

Jobs:

- `lint` → `pnpm lint` y `pnpm format:check`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`
- `build` → depende de `lint`, `typecheck` y `test`, luego corre `pnpm build`

Además sube artefactos de build de frontend y backend.

### `.github/workflows/e2e.yml`

Trigger:

- `push` a `main` y `develop`
- `pull_request` hacia `main` y `develop`

Flujo real:

- levanta MongoDB 7 como service
- instala dependencias
- instala browsers de Playwright
- copia `apps/backend/.env.example` a `apps/backend/.env`
- agrega `MONGODB_URI=mongodb://localhost:27017/e2e-test`
- corre `pnpm build`
- corre `pnpm test:e2e`

### `.github/workflows/pr-check.yml`

Checks adicionales en PR:

- valida título semántico de PR
- avisa si el PR toca muchos archivos o agrega muchas líneas
- ejecuta dependency review y falla desde severidad `moderate`
- avisa si aparecen `console.log|debug|info|warn|error`
- avisa si aparecen `TODO` o `FIXME`

## 9. Validación mínima recomendada

Elegir el set más pequeño que cubra el cambio real.

### Solo documentación

```bash
pnpm format:check
```

### Frontend

```bash
pnpm --filter frontend lint
pnpm --filter frontend typecheck
```

Si toca build, rutas o configuración de Next:

```bash
pnpm --filter frontend build
```

### Backend

```bash
pnpm --filter backend lint
pnpm --filter backend typecheck
pnpm --filter backend test
```

Si toca arranque o compilación:

```bash
pnpm --filter backend build
```

### Cambios transversales

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

### Flujos end-to-end

```bash
pnpm test:e2e
```

Nota: los E2E dependen de MongoDB y de preparar `apps/backend/.env` como en CI.

## 10. Configuración y entorno

Hechos verificables del repo:

- el backend usa `.env.example`
- el workflow E2E genera `apps/backend/.env` a partir de ese archivo
- MongoDB es dependencia real para backend/E2E
- `README.md` documenta frontend en `3000` y backend en `3001`

Reglas prácticas:

- no hardcodear secretos
- no commitear `.env`
- si agregás variables nuevas, actualizar la documentación correspondiente

## 11. Scripts auxiliares

- `scripts/setup.sh`: bootstrap local; `README.md` indica que instala dependencias, crea env files e instala Playwright
- `scripts/check-health.sh`: verificación rápida de salud del entorno/servicios

## 12. Cómo trabajar bien en este repo

- Leer primero `package.json`, `README.md` y el workspace afectado.
- No inventar estructura ni features no verificadas en archivos reales.
- No documentar comandos que no existan en `package.json`.
- No asumir que `packages/*` está en uso porque el workspace lo permita.
- Mantener cambios acotados; no refactorizar fuera de alcance.
- Evitar introducir `console.*`, `TODO` y `FIXME` nuevos porque PR checks los señalan.
- Mantener commits y PRs razonablemente chicos; `pr-check.yml` advierte sobre PRs grandes.

## 13. Checklist rápido para agentes

Antes de cerrar una tarea:

- ¿Leí el workspace correcto antes de editar?
- ¿Validé con el comando proporcional al área tocada?
- ¿El cambio respeta `.editorconfig` y Prettier?
- ¿El commit cumple Conventional Commits?
- ¿Todo lo documentado está confirmado por archivos del repo?
- ¿Evité asumir un `packages/` inexistente o rutas no presentes?

## 14. Para esta tarea de documentación

Si solo modificás `AGENTS.md`, la validación mínima suficiente es:

```bash
pnpm format:check
```

Aun así, el commit va a pasar por `lint-staged`, que reformatea Markdown automáticamente.
