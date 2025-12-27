# Recordar Contraseña

Debemos darle la posibilidad al usuario de recordar su contraseña al iniciar sesión. Esto es un flujo clásico donde se le envia al correo que indique un codigo que debe introducir y permite al usuario cambiar la password (reestablecerla). Utiliza el mcp de better auth para implementarlo usando su framework.

## Flujo

1. El usuario hace click en el botón "Recordar Contraseña".
2. Se le pide que introduzca su correo.
3. Se le envia un correo con un codigo de verificación.
4. El usuario introduce el codigo de verificación.
5. Se le pide que introduzca su nueva contraseña.
6. Toaster de notificación de que se ha reestablecido la contraseña.

## Plan de Trabajo

1. Crea una issue en Github para esta funcionalidad.
2. Crea una rama de esta issue partiendo desde `main`.
3. Cambiate a esa rama.
4. Implementa la funcionalidad.
5. El subagente code-reviewer debe revisar el codigo para que se respeten los estándares de calidad de código de AGENTS.md.
6. Crea test unitarios de la funcionalidad. Estos deben pasar con éxito.
