# Sistema de Actividad y Auditoría

Este documento describe el sistema completo de actividad y auditoría implementado en el Trello Clone.

## 🎯 Resumen

El sistema de actividad y auditoría permite rastrear todas las acciones realizadas en los tableros, listas, tarjetas, etiquetas y miembros. Proporciona una traza completa de auditoría para compliance y permite a los usuarios ver la actividad reciente.

## 📋 Estado Actual

### ✅ Completado (Fases 1-3)

#### Fase 1: Fundamentos ✅
- **Base de datos**: 3 nuevas tablas con índices optimizados
  - `activity_log` (registros de actividad)
  - `notification` (futuras notificaciones)
  - `user_notification_preferences` (preferencias de usuario)
- **Tipos**: Definiciones TypeScript completas
- **Queries**: Consultas optimizadas con caché (30s revalidación)
- **Logging**: Sistema de logging no-bloqueante

#### Fase 2: Integración ✅
- **Board Actions**: Logging en crear, actualizar, eliminar tableros
- **List Actions**: Logging en crear, actualizar, reordenar listas
- **Card Actions**: Logging en crear, actualizar, mover, eliminar tarjetas
- **Label Actions**: Logging en crear, asignar, remover etiquetas
- **Board Member Actions**: Logging en agregar/remover miembros
- **Metadata rica**: Incluye cambios específicos y valores previos/nuevos

#### Fase 3: UI de Actividad ✅
- **ActivityFeed**: Componente principal con carga infinita
- **ActivityItem**: Items individuales con avatar, icono y mensaje
- **Formatters**: Mensajes en español con timestamps relativos
- **API Route**: Endpoint `/api/boards/[id]/activity` con paginación
- **Sidebar integrada**: Feed de actividad en página de tablero

### 🔄 Pendiente (Fases 4-6)

#### Fase 4: Notificaciones (Próxima)
- Sistema de notificaciones push
- Preferencias de usuario por tipo de actividad
- Notificaciones por email

#### Fase 5: Dashboard de Usuario
- Página `/activity` con toda la actividad del usuario
- Filtros por tipo, por fecha, por tablero
- Búsqueda y paginación

#### Fase 6: Administración
- Panel de administración para moderadores
- Exportación de logs de auditoría
- Configuración global del sistema

## 🏗️ Arquitectura

### Base de Datos

```sql
-- Registros de actividad
CREATE TABLE activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT NOT NULL,
  board_id TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
  metadata TEXT NOT NULL DEFAULT '{}',
  previous_values TEXT NOT NULL DEFAULT '{}',
  new_values TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices optimizados
CREATE INDEX activity_board_created_idx ON activity_log(board_id, created_at);
CREATE INDEX activity_user_created_idx ON activity_log(user_id, created_at);
```

### Tipos de Actividad

Los tipos de actividad siguen el patrón `entidad.acción`:

- `board.created`, `board.updated`, `board.deleted`
- `list.created`, `list.updated`, `list.deleted`, `list.reordered`
- `card.created`, `card.updated`, `card.deleted`, `card.moved`
- `label.created`, `label.updated`, `label.deleted`, `label.assigned`, `label.removed`
- `member.added`, `member.removed`

### Metadata

Cada actividad incluye metadata específica para proporcionar contexto rico:

```typescript
// Ejemplo: Actualización de tarjeta
{
  titleChanged: true,
  descriptionChanged: false,
  dueDateChanged: true,
  newDueDate: "2024-12-25",
  previousDueDate: null
}
```

## 🚀 Uso

### Ver Actividad en un Tablero

1. Navega a cualquier tablero
2. El feed de actividad aparece en la barra lateral derecha
3. Muestra las últimas 5 actividades por defecto
4. "Ver más" expande a todas las actividades con carga infinita

### API de Actividad

```typescript
// Obtener actividad de un tablero
GET /api/boards/[boardId]/activity?offset=0&limit=20

// Respuesta
{
  "activities": [
    {
      "id": "uuid",
      "actionType": "card.created",
      "entityType": "card",
      "createdAt": "2024-12-25T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "image": null
      },
      "metadata": {
        "cardTitle": "Nueva funcionalidad"
      }
    }
  ],
  "hasMore": true
}
```

## 🧹 Mantenimiento

### Limpieza de Logs Antiguos

Para prevenir que la base de datos crezca indefinidamente, ejecuta la limpieza periódicamente:

```bash
# Limpiar logs de actividad mayores a 180 días
pnpm cleanup:activity

# O programáticamente
import { cleanupOldActivityLogs } from '@/lib/activity/cleanup'
await cleanupOldActivityLogs()
```

### Monitoreo

- Los logs se almacenan con índices optimizados para consultas rápidas
- El sistema incluye caché con tags para invalidación automática
- Todas las operaciones de logging son no-bloqueantes

## 🔧 Configuración

### Variables de Entorno

No se requieren variables adicionales. El sistema usa la conexión existente a PostgreSQL.

### Rendimiento

- **Caché**: 30 segundos de revalidación en queries
- **Índices**: Optimizados para consultas por tablero, usuario y entidad
- **Paginación**: Limitada a 100 resultados máximo por consulta
- **Logging asíncrono**: No bloquea operaciones principales

## 📊 Métricas

### Cobertura Actual

- ✅ **100%** de acciones de tablero
- ✅ **100%** de acciones de lista
- ✅ **100%** de acciones de tarjeta
- ✅ **100%** de acciones de etiqueta
- ✅ **100%** de acciones de miembro

### Próximas Métricas

- Cobertura de UI (sidebar, página dedicada)
- Rendimiento de queries (tiempo de respuesta)
- Uso de caché (hit rate)
- Tamaño de base de datos (logs generados)

## 🐛 Solución de Problemas

### Logs no aparecen

1. Verificar que las migraciones se aplicaron:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_name IN ('activity_log', 'notification', 'user_notification_preferences');
   ```

2. Revisar errores en logs del servidor durante operaciones

3. Verificar que el usuario esté autenticado

### Performance lenta

1. Verificar índices:
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'activity_log';
   ```

2. Revisar configuración de caché

3. Monitorear queries lentas

### Datos corruptos

1. Ejecutar validación de datos:
   ```sql
   SELECT COUNT(*) FROM activity_log WHERE metadata::text = '';
   ```

2. Limpiar datos inválidos si es necesario

## 🎯 Próximos Pasos

### Fase 4: Notificaciones
- [ ] Implementar tabla `notification`
- [ ] Sistema de envío de notificaciones
- [ ] Preferencias por usuario
- [ ] Notificaciones por email

### Fase 5: Dashboard de Usuario
- [ ] Página `/activity` con actividad global
- [ ] Filtros avanzados
- [ ] Búsqueda de actividades
- [ ] Paginación infinita

### Fase 6: Administración
- [ ] Panel de moderación
- [ ] Exportación de logs
- [ ] Configuración del sistema

---

## 📝 Notas Técnicas

- **Lenguaje**: Todo el código en español (UI) / inglés (técnico)
- **Framework**: Next.js 16 con App Router
- **Base de datos**: PostgreSQL con Drizzle ORM
- **Cache**: Next.js unstable_cache con tags
- **UI**: Shadcn/ui con Tailwind CSS
- **Tipos**: TypeScript strict mode