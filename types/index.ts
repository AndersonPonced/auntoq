export type Categoria =
  | 'comida'
  | 'ropa'
  | 'ferreteria'
  | 'reposteria'
  | 'belleza'
  | 'transporte'
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
  /** Clave de una paleta de lib/constants.ts#ACENTOS. Si falta, se usa la paleta por defecto ('naranja'). */
  colorAcento?: string;
}

export interface Producto {
  id: string;
  tiendaId: string;
  nombre: string;
  fotoUrl: string;
  precio: number;
  disponible: boolean;
}
