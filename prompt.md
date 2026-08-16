# A un Toque — Prompt para generar el código (Next.js)

> Fecha: 2026-07-22
> Origen: mockups generados en Google Stitch (proyecto `4815057533553412347`, 4 pantallas mobile) + decisiones de arquitectura acordadas con el Sr. Anderson.
> Uso: copiar el bloque de abajo tal cual en Claude Code, Gemini o el asistente que uses para generar el proyecto Next.js.

---

## Prompt

```
Actúa como un desarrollador frontend/fullstack senior. Genera el código completo de "A un Toque", un directorio/catálogo web de tiendas de casa (negocios informales que operan desde su vivienda) en una urbanización. NO es un ecommerce con carrito ni checkout: el flujo de compra termina en un link a WhatsApp del dueño de la tienda. El objetivo del MVP es resolver el descubrimiento — hoy la única forma de enterarse de qué tiendas existen es un grupo de WhatsApp donde todo se pierde.

## STACK TÉCNICO
- Next.js 14+ (App Router), TypeScript
- Tailwind CSS (configura los tokens de diseño abajo en tailwind.config.ts, no uses valores sueltos)
- **NO conectes ningún backend ni base de datos todavía.** Sin Supabase, sin Firebase, sin ningún servicio externo. Esta primera versión es 100% frontend con datos mock locales (un archivo `lib/mock-data.ts` con arrays de tiendas y productos, tipados según el modelo de datos de abajo). El objetivo es ver y validar visualmente el diseño antes de invertir en backend.
- PWA: manifest.json + ícono + "agregar a inicio", sin necesidad de instalar desde una tienda de apps
- Componentes funcionales + hooks, código limpio
- Mobile-first estricto (el 90%+ del uso real será desde el celular), pero debe verse bien también en desktop (contenido centrado en una columna máx. 480px, no estirar los cards a todo el ancho)
- Sin autenticación de comprador. Sin backend de pagos. Sin carrito.

## DESIGN SYSTEM (de Stitch, proyecto `4815057533553412347`)

### Colores
- Primario (Naranja cálido): #FF6B35 — acentos, ícono de marca, elementos destacados
- Primario oscuro (texto/íconos sobre fondo claro, mayor contraste): #A63300
- Primario contenedor (fondos de chips seleccionados, botones secundarios): #FF7949
- Fondo base (cálido, NO blanco puro): #FFF4F3
- Superficie de tarjetas: #FFFFFF
- Texto principal: #4E211E
- Texto secundario/muted: #834C48
- Borde sutil: #E09C96
- WhatsApp (botón de pedido — excepción intencional al color primario, aprovecha reconocimiento inmediato): #25D366
- Badge "Agotado": gris neutro #9CA3AF, texto tachado

### Tipografía
- Headline: Sora (títulos de pantalla, nombre de tienda, precios)
- Body: Plus Jakarta Sans (texto general, descripciones, horarios)
- Precio de producto: Sora bold, tamaño grande (destaca sobre el nombre del producto)

### Forma
- Roundness base: 8px (inputs, chips pequeños)
- Cards de tienda/producto: 16px
- Botón "Pedir por WhatsApp": full rounded o 16px, ancho completo

## MODELO DE DATOS (tipos TypeScript + mock local, sin backend por ahora)

Define estos tipos en `types/index.ts` y úsalos para tipar el mock de `lib/mock-data.ts`. Están pensados para mapear 1:1 a tablas reales cuando se conecte un backend después, así que no cambies la forma:

```ts
type Categoria = 'comida' | 'ropa' | 'ferreteria' | 'reposteria' | 'belleza' | 'otros';

interface Tienda {
  id: string;
  nombre: string;
  categoria: Categoria;
  descripcionCorta?: string;
  fotoPortadaUrl: string;
  ubicacion: string; // ej. "Manzana 4, Casa 12"
  horario: string; // texto libre, ej. "Lun-Sáb 8am-6pm"
  whatsapp: string; // número en formato internacional, ej. "584121234567"
  activa: boolean;
}

interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  fotoUrl: string;
  precio: number;
  disponible: boolean;
}
```

No agregues más campos ni entidades de las listadas arriba. El MVP es intencionalmente mínimo — nada de pedidos, pagos, usuarios ni reviews todavía. En `lib/mock-data.ts` exporta un array `tiendas: Tienda[]` y `productos: Producto[]`, y simula las consultas (filtrar por categoría, buscar por texto, obtener por id) con funciones simples en el mismo archivo o en `lib/queries.ts`, para que sea fácil reemplazarlas por llamadas reales a un backend después sin tocar los componentes.

## PANTALLAS (4 rutas)

### 1. Inicio (`/`)
- Saludo corto: "Hola, vecino"
- Buscador (input, no funcional aún en esta pantalla — redirige a `/buscar?q=` al escribir o dar enter)
- Fila horizontal scrolleable de chips de categoría: Todas, Comida, Ropa, Ferretería, Repostería, Belleza, Otros. "Todas" seleccionada por defecto.
- Listado vertical de `StoreCard` (todas las tiendas activas, o filtradas por chip seleccionado sin recargar página — filtro client-side sobre los datos ya cargados)
- Cada `StoreCard`: foto de portada, nombre, chip de categoría, horario, ubicación. Al tocarla, navega a `/tienda/[id]`

### 2. Categoría (`/categoria/[slug]`)
- Header con botón de regreso y el nombre de la categoría
- Misma fila de chips, con la categoría actual seleccionada
- Listado de `StoreCard` filtrado por categoría (sobre el mock local)
- Contador arriba de la lista: "{n} tiendas encontradas"

### 3. Ficha de tienda (`/tienda/[id]`)
- Foto de portada grande, botón de regreso flotante encima
- Nombre, chip de categoría, horario, ubicación
- Sección "Catálogo": grid de 2 columnas de `ProductCard` (foto cuadrada, nombre, precio grande). Si `disponible = false`, la tarjeta se atenúa y el precio va tachado con badge "Agotado"
- Botón fijo abajo, ancho completo, verde WhatsApp: "Pedir por WhatsApp" → abre `https://wa.me/{whatsapp}?text=Hola,%20vi%20tu%20catálogo%20en%20A%20un%20Toque%20y%20quiero%20pedir:%20`

### 4. Búsqueda (`/buscar`)
- Buscador activo arriba (recibe query param `q` si viene de otra pantalla)
- Busca por coincidencia de texto en nombre de tienda y nombre de producto, filtrando client-side sobre el mock local
- Resultados mezclados: `StoreCard` para tiendas que matchean, `ProductCard` compacto (con nombre de la tienda debajo en texto gris pequeño) para productos que matchean
- Estado vacío antes de escribir: "Búsquedas recientes" con 3 chips de ejemplo (puede quedar como UI estática en el MVP, sin persistencia real)

## COMPONENTES REUTILIZABLES
- `SearchBar`
- `CategoryChips`
- `StoreCard`
- `ProductCard`
- `WhatsAppButton` (recibe `whatsapp` y `storeName` como props, arma el link `wa.me` con mensaje prellenado)
- `EmptyState` (para categorías sin tiendas o búsquedas sin resultados)

## REGLAS DE NEGOCIO (no romper)
- NO incluir carrito de compras, checkout, ni pasarela de pago.
- NO pedir login ni registro al comprador.
- El único mecanismo de conversión es el botón "Pedir por WhatsApp" en la ficha de tienda.
- Los datos en esta versión son 100% mock local en código — NO generes panel de administración ni ninguna integración de backend, no es parte de este alcance todavía.
- Dejar el modelo de datos y la estructura de carpetas preparados para que en el futuro se agreguen (sin necesidad de reescribir el core): backend real (Supabase u otro), pedidos in-app, pagos (Pago Móvil/Zelle/Binance Pay), self-service para dueños de tienda, y logística/delivery. No implementes nada de esto ahora, solo no lo bloquees arquitectónicamente — las funciones de `lib/queries.ts` deben ser el único lugar que haya que tocar para pasar de mock a backend real después.

## ENTREGABLES
- Estructura de carpetas: `app/`, `components/`, `lib/mock-data.ts`, `lib/queries.ts`, `types/`
- `tailwind.config.ts` con los tokens de color, tipografía y roundness definidos arriba
- `lib/mock-data.ts` con 5 tiendas de ejemplo (panadería, tienda de ropa, ferretería, repostería casera, peluquería) y sus productos, para poder ver la app funcionando de inmediato sin configurar nada
- `manifest.json` + meta tags básicos para PWA ("agregar a inicio")
- Meta tags de SEO básicos por página
- Código accesible: etiquetas semánticas, alt text en imágenes, contraste AA mínimo
```

---

## Referencia
- Mockups Stitch: https://stitch.withgoogle.com/projects/4815057533553412347
- Contexto y estrategia del proyecto: nota Obsidian `_brain/proyectos/A-un-Toque.md`

## Pendiente tras generar el código
- Revisar visualmente contra las capturas de Stitch y ajustar detalles finos
- Una vez validado el diseño: conectar backend real (Supabase u otro) reemplazando `lib/queries.ts`, sin tocar componentes
- Cargar las tiendas reales de la urbanización (reemplazar el mock de ejemplo)
- Decidir hosting (Vercel es la opción natural para Next.js)
