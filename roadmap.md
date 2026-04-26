# Roadmap

Ideas de features para futuras iteraciones del boilerplate.

## Prioridad alta

### 1. Autenticación y autorización
- Login y registro con email/password.
- OAuth con Google y GitHub.
- Roles y permisos para áreas administrativas.
- Recuperación de contraseña y verificación de email.

### 2. Observabilidad lista para producción
- Logging estructurado en frontend y backend.
- Métricas básicas de API y performance.
- Trazas distribuidas entre Next.js y NestJS.
- Integración opcional con Sentry o similar.

### 3. Docker y entornos reproducibles
- Dockerfiles para frontend, backend y tests.
- Docker Compose para levantar app + MongoDB.
- Configuración para desarrollo local y CI.

### 4. Documentación de API y DX
- Swagger/OpenAPI en backend.
- Colección de Postman o Bruno.
- Guías de onboarding y ejemplos de flujos comunes.

## Prioridad media

### 5. Panel de administración
- Layout administrativo reutilizable.
- CRUD genérico para entidades comunes.
- Gestión de usuarios, roles y auditoría.

### 6. Boilerplate de pagos
- Integración base con Stripe.
- Manejo de webhooks en NestJS.
- Ejemplos de checkout y suscripciones.

### 7. Caching y colas
- Redis para caching y rate limiting.
- BullMQ para jobs asincrónicos.
- Ejemplos de colas para emails y procesamiento en background.

### 8. Tiempo real
- Soporte para WebSockets o SSE.
- Notificaciones en vivo.
- Ejemplo de presencia o feed en tiempo real.

### 9. GraphQL opcional
- Endpoint GraphQL conviviente con REST.
- Codegen de tipos para frontend.
- Ejemplo de queries, mutations y subscriptions.

## Prioridad baja

### 10. Multi-tenant
- Separación por workspace u organización.
- Estrategias de aislamiento de datos.
- Seed inicial para cuentas demo.

### 11. Internacionalización
- i18n en frontend.
- Soporte para múltiples locales y formateo.
- Estrategia de traducciones compartidas.

### 12. Feature flags
- Activación gradual de funcionalidades.
- Integración con flags por entorno o por tenant.
- Ejemplos de rollout seguro.

### 13. Mobile-ready APIs
- Flujos de auth pensados para apps móviles.
- Versionado de API.
- Contratos estables para clientes nativos.

## Extras útiles
- Generador de módulos CRUD.
- Seeds y fixtures para desarrollo.
- Templates de CI adicionales.
- Dashboards de monitoreo preconfigurados.
- Ejemplos de testing de integración con base de datos real.
