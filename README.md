# PrograIIExamelFinal

Aplicación móvil del examen final de Programación II. Permite iniciar sesión con Supabase y trabajar con una fotografía: elegirla de la galería, tomarla con la cámara, cambiarla o quitarla de la vista previa.

La autenticación usa Supabase Auth. No hay usuarios simulados. La pantalla principal solo se muestra si existe una sesión válida, y esa sesión se conserva al cerrar la aplicación.

## Requisitos

- Node.js 22 o superior
- npm
- La aplicación Expo Go en un teléfono, o un emulador
- Un proyecto de Supabase con el proveedor de correo activado

La cámara se prueba en un teléfono físico. El simulador de iOS no tiene cámara.

## Instalación

En la carpeta del proyecto:

```bash
npm install
cp .env.example .env
```

Abre `.env` y reemplaza los valores con los de tu proyecto de Supabase:

- `EXPO_PUBLIC_SUPABASE_URL`: Project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: clave `anon` public

En Supabase: **Project Settings → API**.

El archivo `.env` no se sube a git. `.env.example` solo tiene valores de ejemplo.

## Usuario de prueba

La aplicación inicia sesión. No crea cuentas. En el panel de Supabase:

1. Entra a **Authentication → Users**.
2. Crea un usuario con correo y contraseña.
3. Si el proyecto exige confirmar el correo, márcalo como confirmado.

Usa ese mismo correo y contraseña en la pantalla de login.

## Ejecución

```bash
npx expo start
```

Escanea el código QR con Expo Go. También puedes abrir Android o iOS desde el menú de Expo.

Si cambias el archivo `.env`, detén el servidor y vuelve a ejecutar `npx expo start`.

## Dependencias

| Paquete | Uso |
| --- | --- |
| expo | Proyecto y herramientas de Expo SDK 58 |
| react y react-native | Interfaz |
| typescript | Tipado |
| @supabase/supabase-js | Inicio y cierre de sesión |
| @react-native-async-storage/async-storage | Guardar la sesión en el teléfono |
| react-native-url-polyfill | Soporte de URL que Supabase necesita en React Native |
| expo-image-picker | Galería y cámara |
| expo-status-bar | Barra de estado |

## Estructura

```text
App.tsx
.env.example
src/screens/LoginScreen.tsx
src/screens/HomeScreen.tsx
src/services/supabase.ts
src/navigation/AppNavigator.tsx
```

`AppNavigator` revisa la sesión al abrir la app. Sin sesión muestra el login. Con sesión muestra la pantalla principal. Al cerrar sesión, Supabase borra la sesión guardada y la app vuelve al login.

## Uso

1. Inicia sesión con el correo y la contraseña creados en Supabase.
2. En la pantalla principal, abre la galería o toma una fotografía.
3. La imagen queda en la vista previa. Elegir o tomar otra la reemplaza.
4. **Eliminar fotografía** la quita solo de la vista previa.
5. **Cerrar sesión** regresa al login.

Los errores de login, permisos y las confirmaciones de la fotografía se muestran en la misma pantalla.
