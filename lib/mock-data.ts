import type { Tienda, Producto } from '@/types';

// ---------------------------------------------------------------------------
// Helpers for deterministic placeholder images
// ---------------------------------------------------------------------------
function storeImg(seed: number) {
  return `https://picsum.photos/seed/store${seed}/600/400`;
}
function productImg(seed: number) {
  return `https://picsum.photos/seed/prod${seed}/400/400`;
}

// ---------------------------------------------------------------------------
// 5 tiendas de ejemplo (panadería, ropa, ferretería, repostería, belleza)
// ---------------------------------------------------------------------------
export const tiendas: Tienda[] = [
  {
    id: 'tienda-01',
    nombre: 'Panadería La Madrugada',
    categoria: 'comida',
    descripcionCorta: 'Pan artesanal, golfeados y empanadas recién horneados desde las 6am',
    fotoPortadaUrl: storeImg(1),
    ubicacion: 'Altos de Copacabana, Manz. 2 Casa 8',
    horario: 'Lun-Dom 6am – 12pm',
    whatsapp: '584121001001',
    activa: true,
  },
  {
    id: 'tienda-02',
    nombre: 'Boutique Verónica',
    categoria: 'ropa',
    descripcionCorta: 'Ropa femenina, accesorios y calzado a precios accesibles',
    fotoPortadaUrl: storeImg(2),
    ubicacion: 'Altos de Copacabana, Manz. 5 Casa 3',
    horario: 'Lun-Sáb 9am – 6pm',
    whatsapp: '584121002002',
    activa: true,
  },
  {
    id: 'tienda-03',
    nombre: 'Ferretería El Tornillo',
    categoria: 'ferreteria',
    descripcionCorta: 'Herramientas, materiales de construcción y artículos eléctricos para el hogar',
    fotoPortadaUrl: storeImg(3),
    ubicacion: 'Altos de Copacabana, Manz. 1 Casa 1',
    horario: 'Lun-Sáb 7am – 5pm',
    whatsapp: '584121003003',
    activa: true,
  },
  {
    id: 'tienda-04',
    nombre: 'Dulce Casa Repostería',
    categoria: 'reposteria',
    descripcionCorta: 'Tortas personalizadas, cupcakes y postres artesanales por encargo',
    fotoPortadaUrl: storeImg(4),
    ubicacion: 'Altos de Copacabana, Manz. 7 Casa 19',
    horario: 'Mar-Dom 8am – 8pm',
    whatsapp: '584121004004',
    activa: true,
  },
  {
    id: 'tienda-05',
    nombre: 'Salón Bella Imagen',
    categoria: 'belleza',
    descripcionCorta: 'Corte, color, manicure y tratamientos capilares con cita previa',
    fotoPortadaUrl: storeImg(5),
    ubicacion: 'Altos de Copacabana, Manz. 3 Casa 14',
    horario: 'Lun-Sáb 9am – 7pm',
    whatsapp: '584121005005',
    activa: true,
  },
];

// ---------------------------------------------------------------------------
// Productos por tienda (4 por tienda)
// ---------------------------------------------------------------------------
export const productos: Producto[] = [
  // --- Panadería La Madrugada ---
  { id: 'p-01', tiendaId: 'tienda-01', nombre: 'Golfeados (6 unid.)', fotoUrl: productImg(1), precio: 4.5, disponible: true },
  { id: 'p-02', tiendaId: 'tienda-01', nombre: 'Pan de jamón', fotoUrl: productImg(2), precio: 6.0, disponible: true },
  { id: 'p-03', tiendaId: 'tienda-01', nombre: 'Empanadas (3 unid.)', fotoUrl: productImg(3), precio: 3.5, disponible: false },
  { id: 'p-04', tiendaId: 'tienda-01', nombre: 'Cachito de queso', fotoUrl: productImg(4), precio: 1.5, disponible: true },

  // --- Boutique Verónica ---
  { id: 'p-05', tiendaId: 'tienda-02', nombre: 'Blusa floral talla S-XL', fotoUrl: productImg(5), precio: 18.0, disponible: true },
  { id: 'p-06', tiendaId: 'tienda-02', nombre: 'Jean skinny azul', fotoUrl: productImg(6), precio: 25.0, disponible: true },
  { id: 'p-07', tiendaId: 'tienda-02', nombre: 'Vestido de verano', fotoUrl: productImg(7), precio: 22.0, disponible: false },
  { id: 'p-08', tiendaId: 'tienda-02', nombre: 'Cartera de cuero', fotoUrl: productImg(8), precio: 14.0, disponible: true },

  // --- Ferretería El Tornillo ---
  { id: 'p-09', tiendaId: 'tienda-03', nombre: 'Bombillo LED 9W', fotoUrl: productImg(9), precio: 2.5, disponible: true },
  { id: 'p-10', tiendaId: 'tienda-03', nombre: 'Juego de destornilladores', fotoUrl: productImg(10), precio: 8.0, disponible: true },
  { id: 'p-11', tiendaId: 'tienda-03', nombre: 'Cinta eléctrica x3', fotoUrl: productImg(11), precio: 1.0, disponible: true },
  { id: 'p-12', tiendaId: 'tienda-03', nombre: 'Candado Prive 40mm', fotoUrl: productImg(12), precio: 5.0, disponible: false },

  // --- Dulce Casa Repostería ---
  { id: 'p-13', tiendaId: 'tienda-04', nombre: 'Torta tres leches (6p)', fotoUrl: productImg(13), precio: 18.0, disponible: true },
  { id: 'p-14', tiendaId: 'tienda-04', nombre: 'Cupcakes decorados x12', fotoUrl: productImg(14), precio: 15.0, disponible: true },
  { id: 'p-15', tiendaId: 'tienda-04', nombre: 'Brownie de chocolate', fotoUrl: productImg(15), precio: 3.0, disponible: true },
  { id: 'p-16', tiendaId: 'tienda-04', nombre: 'Cheesecake de fresa', fotoUrl: productImg(16), precio: 20.0, disponible: false },

  // --- Salón Bella Imagen ---
  { id: 'p-17', tiendaId: 'tienda-05', nombre: 'Corte de cabello', fotoUrl: productImg(17), precio: 8.0, disponible: true },
  { id: 'p-18', tiendaId: 'tienda-05', nombre: 'Tinte completo', fotoUrl: productImg(18), precio: 22.0, disponible: true },
  { id: 'p-19', tiendaId: 'tienda-05', nombre: 'Manicure + Pedicure', fotoUrl: productImg(19), precio: 12.0, disponible: true },
  { id: 'p-20', tiendaId: 'tienda-05', nombre: 'Keratina express', fotoUrl: productImg(20), precio: 30.0, disponible: false },
];
