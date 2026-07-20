# Malbec Connected FrontEnd

Malbec Connected es una plataforma web que conecta bodegas boutique argentinas con restaurantes, vinotecas y potenciales compradores. El frontend funciona como un foro público en el que se pueden consultar publicaciones de vinos, conocer sus características, visualizar la información de contacto de cada negocio y participar mediante comentarios y puntuaciones.

El proyecto fue desarrollado con React, React Router, TypeScript, Vite y Tailwind CSS, con una interfaz responsiva, rutas públicas y privadas, autenticación mediante JWT y comunicación con una API REST.

## Características principales

- Foro público con publicaciones ordenadas por fecha.
- Vista individual con información detallada de cada publicación.
- Visualización de bodega o vinoteca, producto, descripción, categoría, tipo, precio e imagen.
- Sistema de comentarios y puntuaciones de 1 a 5 estrellas.
- Registro, inicio de sesión y cierre de sesión de usuarios.
- Protección de rutas privadas mediante validación de sesión.
- Perfil administrable para cada negocio, con nombre de fantasía y datos de contacto.
- CRUD de publicaciones para usuarios autenticados.
- Control de propiedad para editar o eliminar únicamente publicaciones propias.
- Carga de imágenes JPG o PNG de hasta 2 MB.
- Confirmación mediante modal antes de eliminar una publicación.
- Validaciones de formularios y mensajes de error provenientes del frontend y del backend.
- Persistencia de la sesión y del perfil mediante `localStorage`.
- Diseño responsivo adaptado a dispositivos móviles y de escritorio.

## Rutas principales

### Rutas públicas

- `/`  
  Foro público con el listado de publicaciones.

- `/publicaciones/:id`  
  Detalle de una publicación, sus datos de contacto, comentarios y puntuación.

- `/about-us`  
  Información acerca de Malbec Connected y su historia.

- `/login`  
  Inicio de sesión.

- `/register`  
  Registro de nuevos usuarios.

### Rutas privadas

- `/dashboard`  
  Administración de publicaciones propias: creación, edición y eliminación.

- `/profile`  
  Administración del perfil y de los datos de contacto del negocio.

Las rutas privadas utilizan el componente `ProtectedRoute`. Si el usuario no posee una sesión válida, es redirigido a la pantalla de inicio de sesión.

## Estructura del proyecto

- `/app/routes`  
  Contiene las páginas y rutas principales de la aplicación: inicio, detalle de publicación, login, registro, perfil, dashboard y acerca de nosotros.

- `/app/components`  
  Componentes reutilizables como la barra de navegación, el pie de página, las tarjetas de publicaciones, el listado público, el modal de confirmación y la protección de rutas.

- `/app/lib`  
  Lógica de comunicación con la API, autenticación, almacenamiento del token, manejo del perfil y operaciones relacionadas con publicaciones.

- `/app/welcome`  
  Contenido visual utilizado en la sección institucional de la aplicación.

- `/public`  
  Imágenes, favicon y demás recursos estáticos.

- `/app/app.css`  
  Configuración global de estilos y Tailwind CSS.

- `/app/routes.ts`  
  Definición central de las rutas de React Router.

- `/app/root.tsx`  
  Estructura raíz de la aplicación, metadatos, estilos globales y manejo general de errores.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/MinChofi/MalbecConnected-Front.git
cd MalbecConnected-Front
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto. Puedes utilizar `.env.example` como referencia:

```env
APP_NAME=MalbecConnected
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` debe contener la URL base del backend, sin una barra final.

Ejemplo para producción:

```env
VITE_API_URL=https://malbecconnected-back.onrender.com
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

### 5. Verificar los tipos de TypeScript

```bash
npm run typecheck
```

### 6. Compilar el proyecto para producción

```bash
npm run build
```

### 7. Ejecutar la compilación de producción

```bash
npm run start
```

## Endpoints principales

La aplicación se comunica con el backend mediante una API REST. Las rutas protegidas envían el token JWT en el encabezado `Authorization`.

### Autenticación

- **POST `/auth/register`**  
  Registra un nuevo usuario y devuelve un token JWT.

- **POST `/auth/login`**  
  Autentica al usuario y devuelve su información junto con un token JWT.

- **GET `/auth/me`**  
  Valida la sesión y obtiene los datos del usuario autenticado.

### Perfil

- **GET `/api/profile`**  
  Obtiene el perfil del negocio autenticado.

- **PUT `/api/profile`**  
  Actualiza el nombre de fantasía, dirección, teléfono y correo de contacto.

### Publicaciones

- **GET `/api/publications`**  
  Obtiene el listado público de publicaciones activas.

- **GET `/api/publications/:id`**  
  Obtiene el detalle de una publicación, sus comentarios y su puntuación.

- **POST `/api/publications`**  
  Crea una publicación. Requiere autenticación y un nombre de fantasía configurado.

- **PUT `/api/publications/:id`**  
  Actualiza una publicación perteneciente al usuario autenticado.

- **DELETE `/api/publications/:id`**  
  Realiza la baja lógica de una publicación perteneciente al usuario autenticado.

- **POST `/api/publications/:id/comments`**  
  Agrega un comentario y una puntuación a una publicación. Requiere autenticación.

## Autenticación

La autenticación se realiza mediante JWT.

Después del registro o del inicio de sesión, el token se almacena en `localStorage` y se incluye automáticamente en las solicitudes protegidas:

```http
Authorization: Bearer <token>
```

El frontend utiliza `/auth/me` para comprobar que la sesión siga siendo válida. Cuando el usuario cierra sesión, se eliminan el token y los datos almacenados, y se lo redirige al inicio público.

## Tecnologías utilizadas

### React 19

Biblioteca principal para construir la interfaz mediante componentes reutilizables y estados reactivos.

### React Router 7

Framework de navegación y renderizado utilizado para definir rutas públicas, privadas y dinámicas. El proyecto tiene habilitado el renderizado del lado del servidor.

### TypeScript

Añade tipado estático al proyecto y facilita la detección temprana de errores durante el desarrollo.

### Vite

Herramienta de desarrollo y compilación que ofrece recarga rápida mediante HMR y generación optimizada de archivos de producción.

### Tailwind CSS 4

Framework de utilidades utilizado para crear estilos responsivos y mantener una identidad visual consistente.

### Fetch API

Se utiliza mediante un cliente HTTP centralizado para comunicarse con el backend, procesar respuestas y unificar el manejo de errores.

### Local Storage

Permite conservar el token JWT, los datos básicos del usuario y la información del perfil entre recargas del navegador.

## Seguridad

- Autenticación mediante JWT para las operaciones privadas.
- Validación de la sesión antes de mostrar rutas protegidas.
- Envío del token mediante el encabezado `Authorization`.
- Validaciones de datos tanto en el frontend como en el backend.
- Control de propiedad de las publicaciones desde el backend.
- Restricción de imágenes a formatos JPG y PNG con un tamaño máximo de 2 MB.
- Manejo centralizado de errores de red y respuestas HTTP.
- Confirmación previa antes de eliminar publicaciones.
- Uso de HTTPS recomendado para frontend y backend en producción.
- Configuración de CORS en el backend para permitir únicamente el dominio autorizado del frontend.

## Despliegue

El frontend puede desplegarse en Vercel o en cualquier plataforma compatible con aplicaciones Node.js.

Durante el despliegue se debe configurar la siguiente variable de entorno:

```env
VITE_API_URL=https://malbecconnected-back.onrender.com
```

La URL definitiva del frontend es:

```text
https://malbec-connected-front.vercel.app
```

## Notas

- El backend y la base de datos deben estar funcionando para cargar publicaciones, autenticar usuarios y administrar perfiles.
- Para crear publicaciones es obligatorio configurar previamente el nombre de fantasía desde la sección Perfil.
- Las imágenes se convierten a formato Base64 antes de ser enviadas al backend.
- La eliminación de publicaciones es lógica: dejan de mostrarse públicamente, pero permanecen almacenadas con estado inactivo.
- Los comentarios solo pueden ser creados por usuarios autenticados.

---

## Alumno

Desarrollado por **Francisco Hector Sofia**, alumno de la UAI para la materia **Metodologías y Desarrollo Web**.