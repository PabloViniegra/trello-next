# Email Configuration

Este proyecto usa [Resend](https://resend.com) para el envío de emails de verificación.

## Desarrollo

En desarrollo, el sistema está configurado para:
- Mostrar el enlace de verificación en la consola (suficiente para testing)
- Intentar enviar emails solo si se detecta un dominio verificado
- No bloquear el flujo de registro si el email falla

### Variables de Entorno (Desarrollo)

```bash
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM=Trello Clone <onboarding@resend.dev>
```

> **Nota**: Con `onboarding@resend.dev` solo puedes enviar emails a tu propio correo verificado en Resend. Esto es una limitación de seguridad de Resend para evitar spam.

## Producción

Para enviar emails a cualquier destinatario en producción, necesitas:

### 1. Verificar un Dominio

1. Ve a [resend.com/domains](https://resend.com/domains)
2. Agrega tu dominio (ej: `trelloclone.com`)
3. Configura los registros DNS que te proporciona Resend:
   - SPF record
   - DKIM record
   - DMARC record (opcional pero recomendado)
4. Espera la verificación (puede tomar hasta 72 horas)

### 2. Actualizar Variables de Entorno

```bash
RESEND_API_KEY=tu_api_key_de_produccion
RESEND_FROM=Trello Clone <noreply@tudominio.com>
```

### 3. Consideraciones de Producción

- **Rate Limits**: Resend tiene límites de envío según tu plan
- **Bounce Handling**: Considera implementar manejo de bounces
- **Analytics**: Resend proporciona métricas de apertura y clicks
- **Webhook Events**: Puedes recibir eventos de email (delivered, bounced, etc.)

## Testing

### Test Manual en Desarrollo

1. Regístrate con tu email verificado en Resend
2. Verifica el link en la consola
3. También recibirás el email si usas tu correo verificado

### Test Automático

Los tests unitarios mockean Resend, así que no necesitas configuración adicional:

```bash
pnpm test __tests__/lib/email/service.test.ts
```

## Plantillas de Email

Las plantillas están en `emails/templates/` y usan [@react-email/components](https://react.email):

- `verification-email.tsx`: Email de verificación de cuenta

### Estilos

Los estilos están adaptados de `app/globals.css` para mantener consistencia visual:

- Colores primarios: `#7f6a3f` (brand), `#f7f6f2` (background)
- Tipografía: Sans-serif system fonts
- Border radius: 8px
- Responsive design

### Personalización

Para editar el template:

```bash
# Instalar react-email CLI (opcional)
npm install -g react-email

# Preview de emails (opcional)
email dev
```

## Troubleshooting

### Error: "You can only send testing emails to..."

**Causa**: Estás usando `onboarding@resend.dev` (modo de prueba)

**Solución**: 
- En desarrollo: Usa tu correo verificado en Resend
- En producción: Verifica un dominio y usa `noreply@tudominio.com`

### Email no se envía en desarrollo

**Esperado**: En desarrollo con credenciales de prueba, el email solo se intenta enviar si usas tu correo verificado. El link siempre aparece en consola.

### Email va a spam

**Soluciones**:
1. Verifica que tu dominio tenga SPF, DKIM, y DMARC configurados
2. Usa un dominio con buena reputación
3. Evita palabras spam en el asunto/contenido
4. Warming up: Empieza con bajo volumen y aumenta gradualmente

## Referencias

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Better Auth Email Verification](https://www.better-auth.com/docs/plugins/email-verification)
