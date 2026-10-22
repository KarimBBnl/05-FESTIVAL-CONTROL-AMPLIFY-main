# FESTIVAL CONTROL · React Native + Expo Web + AWS Amplify

Aplicación para gestionar la programación de un festival. El backend usa **AWS Amplify Gen 2** y guarda los eventos en una API de datos; la interfaz Expo Web consume esa API para consultar y modificar la programación.

## Inicio rápido

```bash
npm install
npm run sandbox
npm run web
```

`npm run sandbox` necesita credenciales AWS configuradas y crea recursos en tu cuenta. Genera `amplify_outputs.json` en la raíz; ese archivo es local y está excluido de Git. Inicia el frontend después de que termine el sandbox.

## Backend y permisos

- El modelo `Event` guarda artista, escenario, hora y estado.
- La API key permite **lectura y escritura públicas**, según la configuración elegida para esta demo. Cualquier persona con acceso a la aplicación puede crear, editar o borrar eventos.
- La API key caduca a los **30 días**. Para producción, restringe las escrituras a usuarios autenticados y revisa la política de acceso antes de desplegar.
- En una base de datos vacía, la aplicación crea los cuatro eventos de ejemplo una sola vez. Los cambios posteriores se guardan en AWS.

## Despliegue con AWS Amplify Hosting

```bash
npm run build:web
```

El resultado estático se genera en `dist/`. Conecta el repositorio y la rama `main` a Amplify Hosting y usa `amplify.yml`: el pipeline despliega también el backend para la rama.

## Prueba de alumno

1. Abrir **Eventos** y filtrar por escenario o artista.
2. Crear `TECHNO TITANS`, escenario `MAIN STAGE`, hora `21:45` y estado `CONFIRMED`.
3. Editar el evento y cambiar la hora a `23:00`.
4. Cambiar el estado a `DELAYED`.
5. Eliminar el evento.

## Referencia docente

https://github.com/albertohdezakkari/04-PILARES-SERVERLESS
