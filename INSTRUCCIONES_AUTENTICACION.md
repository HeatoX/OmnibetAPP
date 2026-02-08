# Guía de Configuración de Autenticación (Supabase + Vercel)

El error que estás viendo (`localhost:3000`) ocurre porque Supabase no sabe cuál es la dirección real de tu aplicación en internet y usa la de "desarrollo" por defecto.

Para arreglarlo, sigue estos pasos:

### 1. Obtén tu URL de Vercel
Es la dirección que usas para entrar a la página (probablemente algo como `https://omnibet-app.vercel.app`).

### 2. Configura Supabase
1. Ve a tu [Dashboard de Supabase](https://supabase.com/dashboard).
2. Entra en tu proyecto **Omnibet AI**.
3. En la barra lateral izquierda, ve a **Authentication** (icono de candado).
4. Haz clic en **URL Configuration** (bajo la sección "Settings").
5. En **Site URL**, borra `http://localhost:3000` y pega tu URL de Vercel completa (incluyendo `https://`).
6. En **Redirect URLs**, añade también tu URL de Vercel seguida de `/auth/callback`. Ejemplo: `https://omnibet-app.vercel.app/auth/callback`.
7. Haz clic en **Save**.

### 3. Prueba de nuevo
Intenta registrarte con un nuevo correo o solicita un nuevo link de verificación. Ahora los correos te enviarán a la página correcta.

---
> [!IMPORTANT]
> Si cambias el **Site URL**, los links antiguos que ya te llegaron al correo seguirán fallando. Debes generar uno nuevo después de guardar los cambios.
