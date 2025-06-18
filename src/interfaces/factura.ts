// src/interfaces/factura.ts (Puedes crear este archivo)

export interface DetalleFactura {
  DF_CANT: number
  ID_PRODUCTO: number
  DF_PRECIO_VENTA: number
  // Agrega más propiedades si tu API las devuelve y las necesitas
}

export interface Factura {
  ID_FACTURA: number
  FAC_FECHAHORA: string
  FAC_TOTAL: number
  DETALLE_FACTURA: DetalleFactura[]
  // Agrega más propiedades si tu API las devuelve y las necesitas
  // Por ejemplo, FAC_SUBTOTAL, FAC_IVA si vienen directas
}

// Interfaz para la información del usuario que guardas en localStorage
export interface UserAccount {
  UsuarioNombre: string
  UsuarioCorreo: string
  Cedula: string // La cédula es crucial para obtener las facturas
  // Agrega otras propiedades del usuario si las necesitas mostrar
}
