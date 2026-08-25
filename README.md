# 🚀 DataCraft Solutions - Plataforma Comercial para PyMEs

Web comercial y portafolio interactivo de alto impacto diseñado para vender servicios y proyectos de **Power BI, Automatizaciones ágiles con Python, Bases de Datos SQL y Excel Avanzado** a Pequeñas y Medianas Empresas (PyMEs).

---

## 📁 Archivos del Proyecto

- `index.html`: Estructura semántica, diseño moderno (glassmorphism), sección de confianza Python vs Power BI, calculadora y cotizador.
- `styles.css`: Estilos visuales, modo claro/oscuro, estilos de terminal de logs y componentes responsivos.
- `app.js`: Lógica interactiva (gráficos dinámicos con Chart.js, simulador con bitácora de logs en tiempo real, calculadora financiera de ROI y conexión a WhatsApp).

---

## ⚡ Cómo Probar la Web Localmente

1. Puedes abrir directamente el archivo `index.html` haciendo doble clic en él o arrastrándolo a tu navegador (Google Chrome, Microsoft Edge, etc.).
2. O bien, si usas la extensión **Live Server** en VS Code / Cloud Code, haz clic derecho en `index.html` -> *"Open with Live Server"*.

---

## 🛠️ Cómo Personalizar tus Datos

### 1. Cambiar tu número de WhatsApp
Abre `app.js` y busca en la línea **248**:
```javascript
const WHATSAPP_PHONE = '5491112345678'; // Reemplaza con tu código de país + número (sin el '+' ni guiones)
```
También en `index.html` busca el botón flotante de WhatsApp (línea **410**) y actualiza el enlace:
```html
<a href="https://wa.me/TU_NUMERO_AQUI?text=..." ...>
```

### 2. Cambiar Precios o Nombres de Paquetes
En `index.html`, en la sección `#paquetes`, puedes ajustar los precios (`Desde $350 USD`, etc.) y los tiempos de entrega para adaptarlos a tu mercado local.

### 3. Personalizar tu Nombre Comercial o Logo
En `index.html`, en la barra de navegación y pie de página, puedes reemplazar `DataCraft` por tu nombre personal (ej: `TuNombre Data Solutions`) o tu marca de consultoría.

---

## 🌐 Cómo Publicar tu Web Gratis en Internet (2 minutos)

### Opción A: Vercel (Recomendado)
1. Entra a [vercel.com](https://vercel.com) (inicia sesión con GitHub o email).
2. Arrastra la carpeta `data-solutions-portfolio` a la plataforma o vincula tu repositorio.
3. En 10 segundos tendrás una URL en vivo (ej: `tu-nombre-data.vercel.app`) con HTTPS gratis.

### Opción B: GitHub Pages
1. Sube estos 3 archivos a un repositorio en GitHub (ej: `pyme-data-solutions`).
2. Ve a **Settings -> Pages** y elige la rama `main` / `root`.
3. Tu web quedará publicada gratis en `tuusuario.github.io/pyme-data-solutions`.

### Opción C: Netlify Drop
1. Entra a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastra la carpeta `data-solutions-portfolio` y listo.

---

## 💡 Recomendación de Espacio de Trabajo
Te sugerimos abrir esta carpeta en tu editor:
`C:\Users\nico1\.gemini\antigravity\scratch\data-solutions-portfolio`
como tu espacio de trabajo activo.
