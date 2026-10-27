/**
 * Configuración centralizada del sitio Tio Peter AC
 * TODO: Reemplaza los valores con tus datos reales
 */

export const config = {
  // Datos de la marca
  brand: {
    name: "Tio Peter AC",
    tagline: "Expertos en belleza y cuidado capilar",
    description: "Salón especializado en tratamientos capilares químicos, cortes modernos y cuidado premium del cabello.",
    logo: "TP", // o URL de imagen
    city: "TODO: Ingresa tu ciudad",
    address: "TODO: Ingresa tu dirección completa",
    phone: "TODO: +XX XXX XXXXXX",
    whatsapp: "TODO: +XX XXX XXXXXX", // Número de WhatsApp con código país
    email: "TODO: contacto@example.com",
  },

  // Horarios de atención
  hours: {
    monday: { open: "09:00", close: "19:00" },
    tuesday: { open: "09:00", close: "19:00" },
    wednesday: { open: "09:00", close: "19:00" },
    thursday: { open: "09:00", close: "19:00" },
    friday: { open: "09:00", close: "19:00" },
    saturday: { open: "10:00", close: "18:00" },
    sunday: null, // Cerrado
  },

  // Redes sociales
  socials: {
    instagram: "https://instagram.com/tiopeterac",
    facebook: "https://facebook.com/TODO",
    tiktok: "https://tiktok.com/@TODO",
    google_reviews: "https://share.google/R58P6zAcdicFqPdrx",
  },

  // Google Calendar
  googleCalendar: {
    // URL pública del calendario embebido (obtén en Google Calendar → Configuración → Integrar)
    embedUrl: "TODO: https://calendar.google.com/calendar/embed?src=...",
    // Para usar Place Details API de Google Maps (mostrar reseñas reales)
    placeId: "TODO: ChIJxxxxxxx...", // Google Place ID del negocio
    apiKey: "TODO: AIzaSy...", // Google API Key (habilitar Places API)
  },

  // Configuración de la agenda
  scheduler: {
    // Intervalo mínimo de tiempo para agendar (en minutos)
    timeSlot: 15,
    // Número de profesionales/sillones disponibles
    professionals: 1,
    // Margen de tiempo entre reservas (en minutos)
    bufferTime: 0,
  },

  // Opciones de diseño
  theme: {
    primary: "#1a1a1a",      // Oscuro elegante
    secondary: "#d4af37",     // Dorado
    accent: "#ffffff",
    background: "#0f0f0f",
    textPrimary: "#ffffff",
    textSecondary: "#cccccc",
  },

  // Mensajes y textos
  messages: {
    heroTitle: "Belleza y cuidado capilar premium",
    heroSubtitle: "Tratamientos químicos, cortes y diseño especializado para ti",
    ctaBook: "Reservar ahora",
    ctaContact: "Contactar por WhatsApp",
  },
};

export default config;
