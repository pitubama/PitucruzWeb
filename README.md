# Web de Ismael de la Cruz

Web estática (HTML, CSS y JS sin dependencias). Se puede alojar en GitHub Pages, Netlify o Cloudflare Pages tal cual.

## Añadir un proyecto
1. Copia los stills en `img/` (JPG de unos 2000 px de ancho, calidad 80, pesan poco y se ven bien).
2. Abre `projects.js` y copia uno de los bloques. Cambia `slug`, `title`, `category`, `year`, `stills`...
3. Si tiene vídeo, añade `video: { provider: "vimeo", id: "123456789" }` o `{ provider: "youtube", id: "abcDEF123" }`.
4. El orden de la lista es el orden en la página de Trabajo. En la portada salen los dos primeros proyectos con `featured: true`.

## Probar en local
`python3 -m http.server` dentro de esta carpeta y abre http://localhost:8000

Las imágenes de `img/` son de relleno, generadas para la maqueta.
