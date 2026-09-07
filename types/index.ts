export type Categoria =
  | 'comida'
  | 'ropa'
  | 'ferreteria'
  | 'reposteria'
  | 'belleza'
  | 'transporte'
  | 'servicios'
  | 'variedades'
  | 'otros';

export interface Tienda {
  id: string;
  nombre: string;
  categoria: Categoria;
  descripcionCorta?: string;
  fotoPortadaUrl: string;
  ubicacion: string;
  /** Texto libre, ej. "Lun-Sáb 8am-6pm" */
  horario: string;
  /** Número en formato internacional, ej. "584121234567" */
  whatsapp: string;
  activa: boolean;
  /** Clave de una paleta de lib/constants.ts#ACENTOS. Si falta, se usa la paleta por defecto ('azul'). */
  colorAcento?: string;
  /** Usuario (sin @) o URL completa de Instagram. */
  instagram?: string;
  /** Usuario o URL completa de Facebook. */
  facebook?: string;
  /** Usuario o URL completa de Linktree. */
  linktree?: string;
  /** Logo cuadrado de la tienda (opcional) — usado en el lockup de marca al compartir un producto. */
  logoUrl?: string;
}

export interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  fotoUrl: string;
  fotosUrls?: string[];
  precio: number;
  descripcion?: string;
  disponible: boolean;
}
