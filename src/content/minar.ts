import { SERVICIO } from "@/content/servicio";

export const REGALOS = {
  etiqueta: "003 / regalos",
  titulo: "Regala potencia de minería",
  subtitulo: "Códigos regalo para una persona o para todo tu equipo",
  puntos: [
    "Un código por persona; cada uno lo activa con su propia wallet.",
    "Para equipos, clientes o eventos.",
    "Factura a nombre de la empresa si la necesitas.",
  ],
  boton: "Apuntarme a la lista de espera",
} as const;

/** Aviso de apertura que se ofrece a quien aprueba el test de Aprende. */
const { plazasPotenciaExtra: plazas, potenciaExtraPct: extra } = SERVICIO.certificado;

export const AVISO_APERTURA = {
  titulo: `Para los ${plazas} primeros: ${extra} % más de potencia`,
  descripcion:
    `Si estás entre las ${plazas} primeras personas en aprobar el test y dejar su email, tendrás un ${extra} % más de potencia en cada compra durante el primer año desde que abramos la venta. Te enviaremos tu código por email al abrir.`,
  condiciones: "Un código por email, por orden de llegada. No se cambia por dinero.",
  email: "Tu email",
  consentimiento: "Acepto que guardéis mi email para avisarme de la apertura y enviarme mi código.",
  boton: "Quiero mi plaza",
  enviando: "Enviando",
  hecho: `Hecho. Si estás entre los ${plazas} primeros, te enviaremos tu código cuando abramos.`,
  error: "No hemos podido guardar tu email. Inténtalo otra vez en un momento.",
} as const;

export const SOLICITUD_POTENCIA = {
  pregunta: "¿Necesitas más de 1 PH/s?",
  enlace: "Escríbenos",
  titulo: "Solicita más potencia",
  descripcion: "Indica la potencia y la fecha que necesitas.",
  potencia: "Potencia (PH/s)",
  fecha: "Fecha",
  email: "Email",
  consentimiento: "Acepto que guardéis estos datos para atender mi solicitud.",
  enviar: "Enviar solicitud",
  enviando: "Enviando",
  hecho: "Solicitud guardada",
  confirmacion: "Hemos guardado tu potencia, fecha y email.",
  error: "No hemos podido guardar tu solicitud. Inténtalo de nuevo.",
} as const;