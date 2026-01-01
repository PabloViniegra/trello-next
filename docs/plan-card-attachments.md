# Plan: Adjuntar Archivos a Tarjetas

## Resumen Ejecutivo

Implementar la funcionalidad de adjuntar archivos a las tarjetas utilizando **Vercel Blob Storage** como proveedor de almacenamiento. Esta feature permitirá a los usuarios subir, visualizar y eliminar archivos adjuntos en las tarjetas del tablero.

## Plan de Trabajo

1. Crea una issue en Github
2. Crea una rama feature partiendo desde `main`
3. Cambiate a la rama
4. Implementa la lógica de subida de archivos
5. Crea los test unitarios
6. El subagente code-reviewer debe revisar la calidad del codigo conforme a los estándares de AGENTS.md

## Considereaciones

- **No hagas commit ni push sin que yo revise primero**

- **Usa el componente Dropzone que se encuentra en `components/kibo-ui/dropzone/index.tsx`**

- **Asegúrate de mantener la consistencia con los patrones existentes en el código**

- **No se pueden subir archivos de mas de 4.5MB ni archivos con extensiones no permitidas**

---

## 1. Análisis del Estado Actual

### Estructura de Tarjetas Existente

```
db/schema.ts
├── card (tabla principal)
├── cardLabel (relación many-to-many con labels)
├── cardMember (relación many-to-many con usuarios)
└── comment (relación one-to-many)
```

**Nota:** Actualmente NO existe ninguna implementación de subida de archivos en el proyecto.

### Patrones Establecidos

- Server Actions con validación Zod
- Autenticación mediante `getCurrentUser()`
- Verificación de acceso con `hasUserBoardAccess()`
- Transacciones atómicas con `isolationLevel: 'serializable'`
- Logging de actividad con `logActivity()`
- Mensajes de error en español (es-ES)

---

## 2. Arquitectura Propuesta

### 2.1 Flujo de Upload

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Cliente   │────▶│  Server Action   │────▶│  Vercel Blob    │
│  (Browser)  │     │  (Validación)    │     │    Storage      │
└─────────────┘     └──────────────────┘     └─────────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │ (Metadata only)  │
                    └──────────────────┘
```

### 2.2 Método de Upload Recomendado

**Server Upload** para archivos ≤ 4.5 MB (límite de Vercel):

- Más simple de implementar
- Adecuado para documentos, imágenes y archivos comunes
- Validación completa en servidor antes de subir

**Consideración futura:** Para archivos grandes (>4.5 MB), implementar Client Upload con tokens seguros.

---

## 3. Modelo de Datos

### 3.1 Nueva Tabla: `cardAttachment`

```typescript
// db/schema.ts

export const cardAttachment = pgTable(
  "card_attachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    cardId: text("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),

    // Metadata del archivo
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    downloadUrl: text("download_url").notNull(),
    contentType: varchar("content_type", { length: 100 }).notNull(),
    fileSize: integer("file_size").notNull(), // en bytes

    // Auditoría
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("card_attachment_card_id_idx").on(table.cardId),
    index("card_attachment_uploaded_by_idx").on(table.uploadedBy),
  ],
);
```

### 3.2 Relaciones

```typescript
// Añadir a cardRelations
export const cardRelations = relations(card, ({ one, many }) => ({
  list: one(list, { fields: [card.listId], references: [list.id] }),
  cardLabels: many(cardLabel),
  cardMembers: many(cardMember),
  comments: many(comment),
  attachments: many(cardAttachment), // NUEVO
}));

export const cardAttachmentRelations = relations(cardAttachment, ({ one }) => ({
  card: one(card, {
    fields: [cardAttachment.cardId],
    references: [card.id],
  }),
  uploader: one(user, {
    fields: [cardAttachment.uploadedBy],
    references: [user.id],
  }),
}));
```

---

## 4. Estructura de Archivos

```
lib/
└── card-attachment/
    ├── actions.ts      # Server Actions (upload, delete)
    ├── queries.ts      # Consultas de lectura
    ├── schemas.ts      # Validación Zod
    ├── types.ts        # Tipos TypeScript
    └── constants.ts    # Límites, tipos permitidos

app/
└── boards/
    └── [id]/
        └── _components/
            ├── card-attachments.tsx          # Lista de adjuntos
            ├── card-attachment-item.tsx      # Item individual
            ├── card-attachment-upload.tsx    # Componente de upload
            └── delete-attachment-dialog.tsx  # Confirmación de borrado
```

---

## 5. Implementación Detallada

### 5.1 Configuración de Vercel Blob

```bash
# Instalar dependencia
pnpm add @vercel/blob

# Variables de entorno (.env.local)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

```typescript
// lib/env.ts - Añadir validación
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    // ... existing
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
  },
});
```

### 5.2 Constantes y Configuración

```typescript
// lib/card-attachment/constants.ts

export const ATTACHMENT_CONFIG = {
  maxFileSize: 4.5 * 1024 * 1024, // 4.5 MB (límite Vercel)
  maxFilesPerCard: 10,

  allowedMimeTypes: [
    // Imágenes
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",

    // Documentos
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Texto
    "text/plain",
    "text/csv",
    "text/markdown",

    // Archivos comprimidos
    "application/zip",
    "application/x-rar-compressed",
  ],

  // Extensiones para validación adicional
  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".md",
    ".zip",
    ".rar",
  ],
} as const;

export const ATTACHMENT_ERRORS = {
  FILE_TOO_LARGE: "El archivo excede el tamaño máximo permitido (4.5 MB)",
  INVALID_FILE_TYPE: "Tipo de archivo no permitido",
  MAX_FILES_REACHED: "Has alcanzado el límite máximo de archivos adjuntos",
  UPLOAD_FAILED: "Error al subir el archivo. Por favor, inténtalo de nuevo",
  DELETE_FAILED: "Error al eliminar el archivo adjunto",
  NOT_FOUND: "Archivo adjunto no encontrado",
  UNAUTHORIZED: "No tienes permiso para realizar esta acción",
} as const;
```

### 5.3 Tipos

```typescript
// lib/card-attachment/types.ts

import type { cardAttachment } from "@/db/schema";

export type TCardAttachment = typeof cardAttachment.$inferSelect;
export type TCardAttachmentInsert = typeof cardAttachment.$inferInsert;

export type TCardAttachmentWithUploader = TCardAttachment & {
  uploader: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export type TUploadAttachmentResult = {
  success: boolean;
  data?: TCardAttachment;
  error?: string;
};

export type TDeleteAttachmentResult = {
  success: boolean;
  error?: string;
};
```

### 5.4 Schemas de Validación

```typescript
// lib/card-attachment/schemas.ts

import { z } from "zod";
import { ATTACHMENT_CONFIG, ATTACHMENT_ERRORS } from "./constants";

export const uploadAttachmentSchema = z.object({
  cardId: z.string().min(1, "ID de tarjeta requerido"),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= ATTACHMENT_CONFIG.maxFileSize,
      ATTACHMENT_ERRORS.FILE_TOO_LARGE,
    )
    .refine(
      (file) => ATTACHMENT_CONFIG.allowedMimeTypes.includes(file.type as any),
      ATTACHMENT_ERRORS.INVALID_FILE_TYPE,
    ),
});

export const deleteAttachmentSchema = z.object({
  attachmentId: z.string().min(1, "ID de adjunto requerido"),
});

export type TUploadAttachmentInput = z.infer<typeof uploadAttachmentSchema>;
export type TDeleteAttachmentInput = z.infer<typeof deleteAttachmentSchema>;
```

### 5.5 Server Actions

```typescript
// lib/card-attachment/actions.ts

"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath, revalidateTag } from "next/cache";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/db";
import { cardAttachment, card } from "@/db/schema";
import { eq, and } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/get-user";
import { hasUserBoardAccess } from "@/lib/board/queries";
import { getBoardIdByCardId } from "@/lib/card/queries";
import { logActivity } from "@/lib/activity/actions";

import { uploadAttachmentSchema, deleteAttachmentSchema } from "./schemas";
import { ATTACHMENT_CONFIG, ATTACHMENT_ERRORS } from "./constants";
import { getAttachmentCountByCardId } from "./queries";
import type { TUploadAttachmentResult, TDeleteAttachmentResult } from "./types";

export async function uploadAttachment(
  formData: FormData,
): Promise<TUploadAttachmentResult> {
  try {
    // 1. Autenticación
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED };
    }

    // 2. Extraer y validar datos
    const cardId = formData.get("cardId") as string;
    const file = formData.get("file") as File;

    const validation = uploadAttachmentSchema.safeParse({ cardId, file });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Datos inválidos",
      };
    }

    // 3. Verificar acceso al tablero
    const boardId = await getBoardIdByCardId(cardId);
    if (!boardId) {
      return { success: false, error: "Tarjeta no encontrada" };
    }

    const hasAccess = await hasUserBoardAccess(boardId, user.id);
    if (!hasAccess) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED };
    }

    // 4. Verificar límite de archivos
    const currentCount = await getAttachmentCountByCardId(cardId);
    if (currentCount >= ATTACHMENT_CONFIG.maxFilesPerCard) {
      return { success: false, error: ATTACHMENT_ERRORS.MAX_FILES_REACHED };
    }

    // 5. Subir a Vercel Blob
    const blob = await put(`cards/${cardId}/${createId()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // 6. Guardar metadata en DB
    const attachmentId = createId();
    const [newAttachment] = await db
      .insert(cardAttachment)
      .values({
        id: attachmentId,
        cardId,
        fileName: file.name,
        fileUrl: blob.url,
        downloadUrl: blob.downloadUrl,
        contentType: file.type,
        fileSize: file.size,
        uploadedBy: user.id,
      })
      .returning();

    // 7. Registrar actividad
    await logActivity({
      type: "ATTACHMENT_ADDED",
      boardId,
      cardId,
      userId: user.id,
      metadata: { fileName: file.name },
    });

    // 8. Revalidar cache
    revalidateTag(`card-${cardId}`);
    revalidatePath(`/boards/${boardId}`);

    return { success: true, data: newAttachment };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return { success: false, error: ATTACHMENT_ERRORS.UPLOAD_FAILED };
  }
}

export async function deleteAttachment(data: {
  attachmentId: string;
}): Promise<TDeleteAttachmentResult> {
  try {
    // 1. Autenticación
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED };
    }

    // 2. Validar input
    const validation = deleteAttachmentSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: "ID de adjunto inválido" };
    }

    // 3. Obtener el adjunto
    const [attachment] = await db
      .select()
      .from(cardAttachment)
      .where(eq(cardAttachment.id, data.attachmentId))
      .limit(1);

    if (!attachment) {
      return { success: false, error: ATTACHMENT_ERRORS.NOT_FOUND };
    }

    // 4. Verificar acceso al tablero
    const boardId = await getBoardIdByCardId(attachment.cardId);
    if (!boardId) {
      return { success: false, error: "Tarjeta no encontrada" };
    }

    const hasAccess = await hasUserBoardAccess(boardId, user.id);
    if (!hasAccess) {
      return { success: false, error: ATTACHMENT_ERRORS.UNAUTHORIZED };
    }

    // 5. Eliminar de Vercel Blob
    await del(attachment.fileUrl);

    // 6. Eliminar de DB
    await db
      .delete(cardAttachment)
      .where(eq(cardAttachment.id, data.attachmentId));

    // 7. Registrar actividad
    await logActivity({
      type: "ATTACHMENT_REMOVED",
      boardId,
      cardId: attachment.cardId,
      userId: user.id,
      metadata: { fileName: attachment.fileName },
    });

    // 8. Revalidar cache
    revalidateTag(`card-${attachment.cardId}`);
    revalidatePath(`/boards/${boardId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return { success: false, error: ATTACHMENT_ERRORS.DELETE_FAILED };
  }
}
```

### 5.6 Queries

```typescript
// lib/card-attachment/queries.ts

import { db } from "@/db";
import { cardAttachment, user } from "@/db/schema";
import { eq, count } from "drizzle-orm";

import type { TCardAttachment, TCardAttachmentWithUploader } from "./types";

export async function getAttachmentsByCardId(
  cardId: string,
): Promise<TCardAttachmentWithUploader[]> {
  const attachments = await db
    .select({
      id: cardAttachment.id,
      cardId: cardAttachment.cardId,
      fileName: cardAttachment.fileName,
      fileUrl: cardAttachment.fileUrl,
      downloadUrl: cardAttachment.downloadUrl,
      contentType: cardAttachment.contentType,
      fileSize: cardAttachment.fileSize,
      uploadedBy: cardAttachment.uploadedBy,
      createdAt: cardAttachment.createdAt,
      uploader: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(cardAttachment)
    .leftJoin(user, eq(cardAttachment.uploadedBy, user.id))
    .where(eq(cardAttachment.cardId, cardId))
    .orderBy(cardAttachment.createdAt);

  return attachments;
}

export async function getAttachmentCountByCardId(
  cardId: string,
): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(cardAttachment)
    .where(eq(cardAttachment.cardId, cardId));

  return result?.count ?? 0;
}

export async function getAttachmentById(
  attachmentId: string,
): Promise<TCardAttachment | undefined> {
  const [attachment] = await db
    .select()
    .from(cardAttachment)
    .where(eq(cardAttachment.id, attachmentId))
    .limit(1);

  return attachment;
}
```

## 6. Actualización de Tipos de Actividad

```typescript
// lib/activity/types.ts - Añadir nuevos tipos

export type TActivityType =
  | "BOARD_CREATED"
  | "BOARD_UPDATED"
  // ... existing types
  | "ATTACHMENT_ADDED" // NUEVO
  | "ATTACHMENT_REMOVED"; // NUEVO
```

```typescript
// lib/activity/formatters.ts - Añadir formateadores

case 'ATTACHMENT_ADDED':
  return `adjuntó "${metadata?.fileName}" a la tarjeta`

case 'ATTACHMENT_REMOVED':
  return `eliminó el adjunto "${metadata?.fileName}" de la tarjeta`
```

---

## 7. Integración en Card Detail Dialog

```typescript
// app/boards/[id]/_components/card-detail-dialog.tsx

// Añadir import
import { CardAttachments } from './card-attachments'
import { getAttachmentsByCardId } from '@/lib/card-attachment/queries'

// En el componente, obtener adjuntos
const attachments = await getAttachmentsByCardId(cardId)

// En el JSX, después de la sección de comentarios o donde corresponda
<CardAttachments
  cardId={cardId}
  attachments={attachments}
  canEdit={hasEditAccess}
/>
```

---

## 8. Migración de Base de Datos

```bash
# Generar migración
pnpm drizzle-kit generate

# Aplicar migración
pnpm drizzle-kit migrate
```
---

## 9. Testing

### Tests Unitarios

```typescript
// __tests__/lib/card-attachment/actions.test.ts

describe("uploadAttachment", () => {
  it("should reject files exceeding size limit");
  it("should reject invalid file types");
  it("should reject when max files reached");
  it("should upload file and create db record");
  it("should log activity after upload");
});

describe("deleteAttachment", () => {
  it("should delete from blob storage");
  it("should delete from database");
  it("should log activity after deletion");
  it("should reject unauthorized users");
});
```

---

## 10. Checklist de Implementación

### Fase 1: Setup y Base de Datos

- [ ] Instalar `@vercel/blob`
- [ ] Configurar `BLOB_READ_WRITE_TOKEN` en `.env.local`
- [ ] Crear tabla `cardAttachment` en schema
- [ ] Generar y aplicar migración
- [ ] Actualizar tipos de actividad

### Fase 2: Backend

- [ ] Crear `lib/card-attachment/constants.ts`
- [ ] Crear `lib/card-attachment/types.ts`
- [ ] Crear `lib/card-attachment/schemas.ts`
- [ ] Crear `lib/card-attachment/queries.ts`
- [ ] Crear `lib/card-attachment/actions.ts`
- [ ] Actualizar formateadores de actividad

### Fase 3: Frontend

- [ ] Crear `CardAttachments` component
- [ ] Crear `CardAttachmentUpload` component
- [ ] Crear `CardAttachmentItem` component
- [ ] Crear `DeleteAttachmentDialog` component
- [ ] Integrar en `CardDetailDialog`
- [ ] Añadir utilidad `formatFileSize` en `lib/utils.ts`

### Fase 4: Testing y Polish

- [ ] Escribir tests unitarios
- [ ] Escribir tests E2E
- [ ] Revisar accesibilidad (a11y)
- [ ] Optimizar UX (loading states, error handling)
- [ ] Documentar en README si aplica

---

## 11. Consideraciones Futuras

### Client Upload para Archivos Grandes

Para soportar archivos >4.5 MB, implementar:

1. API Route para generar tokens de upload
2. Uso de `@vercel/blob/client` para upload directo
3. Callback de completado para guardar metadata

### Previsualizaciones

- Generar thumbnails para imágenes
- Preview de PDFs con `react-pdf`
- Preview de documentos Office

### Límites por Plan

- Implementar límites de almacenamiento por usuario/organización
- Dashboard de uso de almacenamiento

---

## 12. Estimación de Tiempo

| Fase       | Tiempo Estimado |
| ---------- | --------------- |
| Setup y BD | 1-2 horas       |
| Backend    | 3-4 horas       |
| Frontend   | 4-5 horas       |
| Testing    | 2-3 horas       |
| **Total**  | **10-14 horas** |

---

## 13. Recursos

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob npm](https://www.npmjs.com/package/@vercel/blob)
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
