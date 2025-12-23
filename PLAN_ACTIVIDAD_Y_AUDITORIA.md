# Plan de Implementación: Sistema de Actividad y Auditoría

> **Prioridad:** Alta  
> **Fecha de creación:** 23 de diciembre de 2025  
> **Estimación:** 3-4 semanas  

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Objetivos](#objetivos)
3. [Requisitos Técnicos](#requisitos-técnicos)
4. [Arquitectura de Datos](#arquitectura-de-datos)
5. [Fases de Implementación](#fases-de-implementación)
6. [Especificaciones Detalladas](#especificaciones-detalladas)
7. [Tests y Validación](#tests-y-validación)
8. [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)
9. [Plan de Rollout](#plan-de-rollout)

---

## 🎯 Visión General

Implementar un sistema completo de auditoría y actividad que permita a los usuarios:
- Rastrear todos los cambios realizados en tableros, listas y tarjetas
- Visualizar una línea de tiempo de actividad
- Recibir notificaciones en tiempo real de eventos relevantes
- Consultar un feed personalizado de actividad del usuario

---

## 🎯 Objetivos

### Objetivos Principales
- ✅ Registrar todas las acciones significativas en el sistema
- ✅ Proporcionar visibilidad completa del historial de cambios
- ✅ Mejorar la colaboración mediante notificaciones contextuales
- ✅ Cumplir con requisitos de auditoría y trazabilidad

### Objetivos Secundarios
- 🔔 Reducir la sobrecarga de notificaciones (notificaciones inteligentes)
- ⚡ Mantener rendimiento óptimo con grandes volúmenes de actividad
- 📱 Soporte para notificaciones web push (futuro)

---

## 🛠️ Requisitos Técnicos

### Stack Tecnológico
- **Base de datos:** PostgreSQL + Drizzle ORM
- **Real-time:** Server-Sent Events (SSE) o WebSockets (evaluar)
- **Cache:** Redis (opcional, para optimización)
- **Validación:** Zod schemas
- **Estado cliente:** Zustand + optimistic updates

### Dependencias Nuevas
```json
{
  "dependencies": {
    "@vercel/postgres": "^0.10.0",  // Si usamos Vercel Postgres
    "pusher-js": "^8.4.0",          // Alternativa para real-time
    "pusher": "^5.2.0"              // Server-side para Pusher
  }
}
```

---

## 📊 Arquitectura de Datos

### 1. Tabla: `activity_log`

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quién realizó la acción
  user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  
  -- Tipo de acción
  action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'move', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'board', 'list', 'card', 'label', 'member'
  
  -- Entidad afectada
  entity_id UUID NOT NULL,
  board_id UUID NOT NULL REFERENCES board(id) ON DELETE CASCADE,
  
  -- Datos adicionales
  metadata JSONB DEFAULT '{}',      -- Datos específicos del cambio
  previous_values JSONB,            -- Estado anterior (para rollback futuro)
  new_values JSONB,                 -- Estado nuevo
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT fk_board FOREIGN KEY (board_id) REFERENCES board(id)
);

-- Índices para optimización
CREATE INDEX idx_activity_board ON activity_log(board_id, created_at DESC);
CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
```

### 2. Tabla: `notification`

```sql
CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinatario
  user_id UUID NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  
  -- Referencia a actividad
  activity_id UUID REFERENCES activity_log(id) ON DELETE CASCADE,
  
  -- Contenido
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'card_assigned', 'card_due', 'mention', etc.
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Metadatos
  metadata JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user(id),
  CONSTRAINT fk_activity FOREIGN KEY (activity_id) REFERENCES activity_log(id)
);

-- Índices
CREATE INDEX idx_notification_user_unread ON notification(user_id, is_read, created_at DESC);
CREATE INDEX idx_notification_created ON notification(created_at DESC);
```

### 3. Tabla: `user_notification_preferences`

```sql
CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  
  -- Preferencias de notificaciones
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Tipos de notificaciones
  notify_card_assigned BOOLEAN DEFAULT TRUE,
  notify_card_due BOOLEAN DEFAULT TRUE,
  notify_card_comments BOOLEAN DEFAULT TRUE,
  notify_board_updates BOOLEAN DEFAULT FALSE,
  notify_mentions BOOLEAN DEFAULT TRUE,
  
  -- Configuración avanzada
  digest_frequency VARCHAR(20) DEFAULT 'instant', -- 'instant', 'hourly', 'daily', 'weekly'
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🚀 Fases de Implementación

### **Fase 1: Fundamentos (Semana 1)**
**Objetivo:** Establecer la infraestructura base de auditoría

#### Tareas:
- [ ] **1.1** Crear migraciones de base de datos
  - Tabla `activity_log`
  - Tabla `notification`
  - Tabla `user_notification_preferences`
  - Índices de rendimiento

- [ ] **1.2** Definir schemas Zod
  - `lib/activity/schemas.ts`
  - `lib/notification/schemas.ts`
  - Tipos TypeScript correspondientes

- [ ] **1.3** Crear queries base
  - `lib/activity/queries.ts`
  - `lib/notification/queries.ts`
  - Funciones de lectura optimizadas

- [ ] **1.4** Implementar helper de logging
  - `lib/activity/logger.ts`
  - Función genérica `logActivity()`
  - Wrapper para acciones comunes

#### Entregables:
- ✅ Base de datos configurada
- ✅ Schemas y tipos definidos
- ✅ Sistema de logging funcional

---

### **Fase 2: Integración con Acciones Existentes (Semana 1-2)**
**Objetivo:** Registrar actividad en todas las acciones del sistema

#### Tareas:
- [ ] **2.1** Integrar logging en Board actions
  - `createBoard` → log "board.created"
  - `updateBoard` → log "board.updated"
  - `deleteBoard` → log "board.deleted"

- [ ] **2.2** Integrar logging en List actions
  - `createList` → log "list.created"
  - `updateList` → log "list.updated"
  - `deleteList` → log "list.deleted"
  - `reorderLists` → log "list.reordered"

- [ ] **2.3** Integrar logging en Card actions
  - `createCard` → log "card.created"
  - `updateCard` → log "card.updated"
  - `deleteCard` → log "card.deleted"
  - `moveCard` → log "card.moved"
  - `reorderCards` → log "card.reordered"

- [ ] **2.4** Integrar logging en Label actions
  - `createLabel` → log "label.created"
  - `assignLabel` → log "label.assigned"
  - `removeLabel` → log "label.removed"

- [ ] **2.5** Integrar logging en BoardMember actions
  - `addBoardMember` → log "member.added"
  - `removeBoardMember` → log "member.removed"

#### Entregables:
- ✅ Todas las acciones registran actividad
- ✅ Metadata completo en cada log
- ✅ Tests unitarios actualizados

---

### **Fase 3: UI de Actividad (Semana 2)**
**Objetivo:** Mostrar historial de actividad a los usuarios

#### Tareas:
- [ ] **3.1** Componente ActivityFeed
  - `app/boards/[id]/_components/activity-feed.tsx`
  - Lista de actividades con scroll infinito
  - Iconos y formato por tipo de actividad
  - Timestamps relativos (hace 2 horas, ayer, etc.)

- [ ] **3.2** Componente ActivityItem
  - `app/boards/[id]/_components/activity-item.tsx`
  - Avatar del usuario
  - Descripción formateada
  - Link a la entidad relacionada

- [ ] **3.3** Integrar en vista de tablero
  - Sidebar colapsable con actividad
  - Toggle para mostrar/ocultar
  - Filtros básicos (por tipo, por usuario)

- [ ] **3.4** Vista de actividad del usuario
  - `app/activity/page.tsx`
  - Feed personal de todas las actividades
  - Filtros por tablero
  - Paginación

#### Entregables:
- ✅ UI funcional de actividad
- ✅ Diseño responsive
- ✅ Experiencia de usuario fluida

---

### **Fase 4: Sistema de Notificaciones (Semana 2-3)**
**Objetivo:** Notificar a usuarios sobre eventos relevantes

#### Tareas:
- [ ] **4.1** Servicio de notificaciones
  - `lib/notification/service.ts`
  - Función `createNotification()`
  - Lógica de generación inteligente
  - Prevención de spam

- [ ] **4.2** Server Actions
  - `lib/notification/actions.ts`
  - `markAsRead()`
  - `markAllAsRead()`
  - `deleteNotification()`
  - `updatePreferences()`

- [ ] **4.3** Queries optimizadas
  - `getUnreadNotifications()`
  - `getNotificationCount()`
  - `getUserPreferences()`

- [ ] **4.4** Integrar con activity logging
  - Trigger automático de notificaciones
  - Reglas de negocio:
    - Notificar cuando te asignan una tarjeta
    - Notificar cuando alguien comenta (futuro)
    - Notificar cuando te mencionan (futuro)
    - Notificar cambios en tarjetas que sigues (futuro)

#### Entregables:
- ✅ Sistema de notificaciones funcional
- ✅ Notificaciones basadas en eventos
- ✅ Preferencias configurables

---

### **Fase 5: UI de Notificaciones (Semana 3)**
**Objetivo:** Interfaz para gestionar notificaciones

#### Tareas:
- [ ] **5.1** Componente NotificationBell
  - `components/notification-bell.tsx`
  - Badge con contador de no leídas
  - Dropdown con lista de notificaciones
  - Marca como leída al abrir

- [ ] **5.2** Componente NotificationList
  - `components/notification-list.tsx`
  - Lista de notificaciones
  - Acción de marcar como leída
  - Acción de eliminar

- [ ] **5.3** Página de notificaciones
  - `app/notifications/page.tsx`
  - Vista completa de todas las notificaciones
  - Filtros (leídas/no leídas, por tipo)
  - Acciones en batch

- [ ] **5.4** Configuración de preferencias
  - `app/settings/notifications/page.tsx`
  - Toggle para cada tipo de notificación
  - Configuración de digest
  - Quiet hours (futuro)

#### Entregables:
- ✅ UI completa de notificaciones
- ✅ Badge en navbar funcional
- ✅ Página de configuración

---

### **Fase 6: Notificaciones en Tiempo Real (Semana 3-4)**
**Objetivo:** Actualizar notificaciones sin recargar la página

#### Opciones de Implementación:

**Opción A: Server-Sent Events (SSE)** ⭐ Recomendada
- Más simple de implementar
- Unidireccional (servidor → cliente)
- Compatible con serverless
- Menor overhead

**Opción B: WebSockets**
- Bidireccional
- Más complejo de escalar
- Requiere servidor con estado

**Opción C: Polling**
- Más simple pero menos eficiente
- Buena para empezar

#### Tareas (usando SSE):
- [ ] **6.1** Endpoint SSE
  - `app/api/notifications/stream/route.ts`
  - Stream de eventos de notificaciones
  - Autenticación con session

- [ ] **6.2** Hook cliente
  - `lib/notification/use-notifications.ts`
  - EventSource para recibir eventos
  - Actualizar Zustand store
  - Reconexión automática

- [ ] **6.3** Zustand store
  - `store/notification-store.ts`
  - Estado de notificaciones
  - Contador de no leídas
  - Acciones optimistas

- [ ] **6.4** Integración en UI
  - Actualización en tiempo real del badge
  - Toast cuando llega notificación nueva
  - Sonido opcional (configurable)

#### Entregables:
- ✅ Notificaciones en tiempo real
- ✅ Experiencia instantánea
- ✅ Fallback a polling si SSE falla

---

## 📝 Especificaciones Detalladas

### Tipos de Actividad

```typescript
// lib/activity/types.ts

export const ACTIVITY_TYPES = {
  // Board
  BOARD_CREATED: 'board.created',
  BOARD_UPDATED: 'board.updated',
  BOARD_DELETED: 'board.deleted',
  
  // List
  LIST_CREATED: 'list.created',
  LIST_UPDATED: 'list.updated',
  LIST_DELETED: 'list.deleted',
  LIST_REORDERED: 'list.reordered',
  
  // Card
  CARD_CREATED: 'card.created',
  CARD_UPDATED: 'card.updated',
  CARD_DELETED: 'card.deleted',
  CARD_MOVED: 'card.moved',
  CARD_REORDERED: 'card.reordered',
  
  // Label
  LABEL_CREATED: 'label.created',
  LABEL_UPDATED: 'label.updated',
  LABEL_DELETED: 'label.deleted',
  LABEL_ASSIGNED: 'label.assigned',
  LABEL_REMOVED: 'label.removed',
  
  // Member
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
} as const;

export type TActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

export type TActivityLog = {
  id: string;
  userId: string;
  actionType: TActivityType;
  entityType: 'board' | 'list' | 'card' | 'label' | 'member';
  entityId: string;
  boardId: string;
  metadata: Record<string, unknown>;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: Date;
  
  // Relations
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};
```

### Formato de Mensajes de Actividad

```typescript
// lib/activity/formatters.ts

export function formatActivityMessage(activity: TActivityLog): string {
  const userName = activity.user?.name || 'Alguien';
  
  switch (activity.actionType) {
    case ACTIVITY_TYPES.CARD_CREATED:
      return `${userName} creó la tarjeta "${activity.metadata.title}"`;
    
    case ACTIVITY_TYPES.CARD_UPDATED:
      const changes = [];
      if (activity.metadata.titleChanged) {
        changes.push(`cambió el título a "${activity.newValues?.title}"`);
      }
      if (activity.metadata.descriptionChanged) {
        changes.push('actualizó la descripción');
      }
      if (activity.metadata.dueDateChanged) {
        changes.push(`cambió la fecha de vencimiento a ${formatDate(activity.newValues?.dueDate)}`);
      }
      return `${userName} ${changes.join(', ')} en "${activity.metadata.cardTitle}"`;
    
    case ACTIVITY_TYPES.CARD_MOVED:
      return `${userName} movió "${activity.metadata.cardTitle}" de "${activity.metadata.fromList}" a "${activity.metadata.toList}"`;
    
    case ACTIVITY_TYPES.LABEL_ASSIGNED:
      return `${userName} añadió la etiqueta "${activity.metadata.labelName}" a "${activity.metadata.cardTitle}"`;
    
    case ACTIVITY_TYPES.MEMBER_ADDED:
      return `${userName} añadió a ${activity.metadata.memberName} al tablero`;
    
    // ... más casos
    
    default:
      return `${userName} realizó una acción`;
  }
}
```

### Helper de Logging

```typescript
// lib/activity/logger.ts

import { db } from '@/db';
import { activityLog } from '@/db/schema';
import type { TActivityType } from './types';

type TLogActivityParams = {
  userId: string;
  actionType: TActivityType;
  entityType: 'board' | 'list' | 'card' | 'label' | 'member';
  entityId: string;
  boardId: string;
  metadata?: Record<string, unknown>;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
};

export async function logActivity(params: TLogActivityParams): Promise<void> {
  try {
    await db.insert(activityLog).values({
      userId: params.userId,
      actionType: params.actionType,
      entityType: params.entityType,
      entityId: params.entityId,
      boardId: params.boardId,
      metadata: params.metadata || {},
      previousValues: params.previousValues,
      newValues: params.newValues,
    });
    
    // Trigger de notificaciones si es necesario
    await triggerNotifications(params);
  } catch (error) {
    // Log error pero no fallar la operación principal
    console.error('Error logging activity:', error);
  }
}

// Ejemplo de uso en una acción
export async function updateCard(input: TUpdateCardInput) {
  const user = await getUser();
  if (!user) throw new Error('No autenticado');
  
  const previousCard = await db.query.card.findFirst({
    where: eq(card.id, input.id),
  });
  
  const updatedCard = await db
    .update(card)
    .set(input)
    .where(eq(card.id, input.id))
    .returning();
  
  // Log activity
  await logActivity({
    userId: user.id,
    actionType: ACTIVITY_TYPES.CARD_UPDATED,
    entityType: 'card',
    entityId: input.id,
    boardId: updatedCard[0].boardId,
    metadata: {
      cardTitle: updatedCard[0].title,
      titleChanged: previousCard?.title !== updatedCard[0].title,
      descriptionChanged: previousCard?.description !== updatedCard[0].description,
      dueDateChanged: previousCard?.dueDate !== updatedCard[0].dueDate,
    },
    previousValues: previousCard,
    newValues: updatedCard[0],
  });
  
  return { success: true, data: updatedCard[0] };
}
```

---

## 🧪 Tests y Validación

### Tests Unitarios

```typescript
// __tests__/lib/activity/logger.test.ts

import { describe, it, expect, vi } from 'vitest';
import { logActivity } from '@/lib/activity/logger';
import { ACTIVITY_TYPES } from '@/lib/activity/types';

describe('Activity Logger', () => {
  it('should log card creation activity', async () => {
    const params = {
      userId: 'user-123',
      actionType: ACTIVITY_TYPES.CARD_CREATED,
      entityType: 'card' as const,
      entityId: 'card-456',
      boardId: 'board-789',
      metadata: { cardTitle: 'Test Card' },
    };
    
    await expect(logActivity(params)).resolves.not.toThrow();
  });
  
  it('should include previous and new values for updates', async () => {
    const params = {
      userId: 'user-123',
      actionType: ACTIVITY_TYPES.CARD_UPDATED,
      entityType: 'card' as const,
      entityId: 'card-456',
      boardId: 'board-789',
      previousValues: { title: 'Old Title' },
      newValues: { title: 'New Title' },
    };
    
    await expect(logActivity(params)).resolves.not.toThrow();
  });
});
```

### Tests de Integración

```typescript
// __tests__/lib/activity/integration.test.ts

import { describe, it, expect } from 'vitest';
import { createCard } from '@/lib/card/actions';
import { getActivityByBoard } from '@/lib/activity/queries';

describe('Activity Integration', () => {
  it('should create activity log when card is created', async () => {
    const result = await createCard({
      title: 'Test Card',
      listId: 'list-123',
    });
    
    expect(result.success).toBe(true);
    
    const activities = await getActivityByBoard('board-789');
    const cardCreatedActivity = activities.find(
      a => a.actionType === ACTIVITY_TYPES.CARD_CREATED
    );
    
    expect(cardCreatedActivity).toBeDefined();
    expect(cardCreatedActivity?.metadata.cardTitle).toBe('Test Card');
  });
});
```

---

## ⚡ Consideraciones de Rendimiento

### 1. Índices de Base de Datos
```sql
-- Ya definidos en la arquitectura
CREATE INDEX idx_activity_board ON activity_log(board_id, created_at DESC);
CREATE INDEX idx_activity_user ON activity_log(user_id, created_at DESC);
```

### 2. Paginación
- Implementar cursor-based pagination para feeds largos
- Límite de 50 items por página
- Scroll infinito en UI

### 3. Caché
```typescript
// lib/activity/queries.ts
import { unstable_cache } from 'next/cache';

export const getBoardActivity = unstable_cache(
  async (boardId: string, limit = 50) => {
    return await db.query.activityLog.findMany({
      where: eq(activityLog.boardId, boardId),
      orderBy: [desc(activityLog.createdAt)],
      limit,
      with: { user: true },
    });
  },
  ['board-activity'],
  { 
    tags: ['activity'],
    revalidate: 30, // 30 segundos
  }
);
```

### 4. Optimización de Notificaciones
- Batch notifications: agrupar notificaciones similares
- Digest mode: enviar resumen en lugar de notificaciones individuales
- Throttling: no más de X notificaciones por minuto

### 5. Limpieza de Datos Antiguos
```typescript
// scripts/cleanup-old-activity.ts
// Ejecutar via cron job mensual

async function cleanupOldActivity() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  await db.delete(activityLog).where(
    lt(activityLog.createdAt, sixMonthsAgo)
  );
}
```

---

## 🚢 Plan de Rollout

### Semana 1: Fundamentos + Integración
- ✅ Base de datos lista
- ✅ Logging integrado en todas las acciones
- ✅ Tests pasando

### Semana 2: UI de Actividad
- ✅ Feed de actividad visible en tableros
- ✅ Vista de actividad personal
- ✅ Beta testing interno

### Semana 3: Notificaciones
- ✅ Sistema de notificaciones funcional
- ✅ UI de notificaciones
- ✅ Preferencias configurables

### Semana 4: Tiempo Real + Polish
- ✅ Notificaciones en tiempo real (SSE)
- ✅ Refinamiento de UX
- ✅ Optimizaciones de rendimiento
- ✅ Documentación completa

### Lanzamiento
- 📢 Comunicación a usuarios
- 📊 Monitoreo de métricas
- 🐛 Bug fixes y ajustes

---

## 📊 Métricas de Éxito

### KPIs
- ✅ 100% de acciones registran actividad
- ✅ Latencia de notificaciones < 2 segundos
- ✅ Tiempo de carga de feed < 500ms
- ✅ 0 errores críticos en producción
- ✅ > 80% de usuarios activan notificaciones

### Monitoreo
- Rate de eventos de actividad
- Tasa de notificaciones leídas vs no leídas
- Tiempo de respuesta de queries
- Errores de SSE/reconexiones

---

## 🔮 Futuras Mejoras

### Post-MVP
- [ ] Filtros avanzados en feed de actividad
- [ ] Búsqueda en actividad
- [ ] Exportar historial de actividad
- [ ] Webhooks para eventos de actividad
- [ ] Notificaciones por email
- [ ] Notificaciones push (PWA)
- [ ] Rollback de cambios (usando previous_values)
- [ ] Activity heatmap (visualización de actividad)

---

## 📚 Referencias

- [Next.js Server-Sent Events](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [Drizzle ORM Indexes](https://orm.drizzle.team/docs/indexes-constraints)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Better Auth Sessions](https://www.better-auth.com/docs/concepts/sessions)

---

**Última actualización:** 23 de diciembre de 2025  
**Mantenedor:** Equipo Trello Clone  
**Estado:** 📝 Planificación
