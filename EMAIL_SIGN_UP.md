# Email para registro

En su momento, cuando el usuario se registraba en desarrollo tenia el enlace de verificación en la consola para mayor facilidad, dejando la feature de verificación de email para más adelante. Ahora ya tenemos establecida en el fichero `.env` las variables de RESEND: 

```
RESEND_API_KEY=<api_key>
RESEND_FROM=email_del_que_se_envia
```

También se creó un ejemplo de fichero de como usarlo en app/api/send/route.ts donde se envía un email de prueba. Puedes usarlo como ejemplo.

## Objetivo

Crea un email para el registro de un usuario e integralo en el flujo de registro. Para ello usa la dependencia de resend que ya se encuentra instalada. También tienes instalado `"@react-email/components": "1.0.2"` que es una librería para crear emails con react. Crea una plantilla adaptada a nuestros estilos de `globals.css` para que quede bien integrado con el resto de la aplicación.

## Plan de trabajo

1. Crea una issue en Github
2. Crea una rama de la feature partiendo de la rama `main`
3. Cambiate a ella
4. Implementa la funcionalidad
5. Revisa la implementación con el subagente de code-reviewer para garantizar la calidad del codigo conforme al AGENTS.md

## Consideraciones

- **No hagas commit ni push hasta que yo lo revise**
- **Agrega algún test unitario a la funcionalidad**
- **Esta es la documentación de React Email Templates: https://react.email/docs/introduction**