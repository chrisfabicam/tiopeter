# Tio Peter AC

Sitio estático en español para Tio Peter AC, salón en Pocitos, Montevideo.
Está hecho con HTML, CSS y JavaScript nativo; no necesita servidor ni
dependencias para publicarse.

## Probar localmente

Necesitás Node.js 18 o superior para ejecutar los tests.

```sh
python3 -m http.server 8000
```

Abrí [http://localhost:8000](http://localhost:8000). Para ejecutar las pruebas
del motor de agenda:

```sh
npm test
```

Las reservas de ejemplo están en `bookings.example.json`. Las reservas hechas
desde el formulario se guardan en `localStorage` del navegador actual; no se
sincronizan entre dispositivos ni reemplazan una confirmación del salón.
Antes de usar la agenda como fuente de disponibilidad compartida, conectala a
un servicio central de reservas.

## Configuración

Editá `config.js` para ajustar los datos de marca, contacto, redes, horarios,
tema y agenda:

- WhatsApp: `brand.whatsapp`, en formato internacional con código de país y
  sin espacios (por ejemplo, `+59895246506`).
- Instagram y reseñas: `socials.instagram` y `socials.googleReviews`.
- Ubicación: `brand.city` y `brand.address`.
- Horarios: `hours`, usando claves de días en inglés (`monday` a `sunday`) y
  horas de 24 horas (`HH:MM`). Usá `null` para marcar un día cerrado.
- Agenda: `scheduler.timeSlot` define los intervalos de inicio, `professionals`
  los profesionales/sillones disponibles y `bufferTime` los minutos de margen
  entre fases activas y antes y después de una ventana de exposición.

Los servicios se editan en `services.js`. Cada servicio contiene su `id`,
`nombre`, `categoria`, `precio` opcional y una lista `fases`. Las fases son
secuenciales y llevan `nombre`, `minutos` y `tipo`: `"activa"` ocupa al
profesional y `"exposicion"` lo libera. Activá `permiteEnExposicion` únicamente
para los servicios cortos que pueden insertarse completos dentro de una fase
de exposición, respetando el margen configurado.

### Google Calendar

En Google Calendar, abrí la configuración del calendario, copiá la URL de
integración y pegala en `googleCalendar.embedUrl` en `config.js`. Hasta que se
configure, el sitio muestra un mensaje en lugar de un calendario vacío. El
formulario genera un enlace individual para agregar cada reserva a Google
Calendar.

### Reseñas de Google Places (opcional)

La sección de reseñas muestra un placeholder y el enlace directo a las reseñas
de Google; no publica opiniones inventadas. `googleCalendar.placeId` y
`googleCalendar.apiKey` están reservados para una integración futura. Para
mostrar reseñas reales habrá que implementar una integración compatible con
Google Places y sus políticas; no publiques una clave de API sin restricciones
en el JavaScript del sitio.

## Publicar en GitHub Pages

1. Subí los cambios a la rama `main`.
2. En GitHub, abrí **Settings → Pages**.
3. En **Build and deployment**, elegí **Deploy from a branch**.
4. Seleccioná `main` y la carpeta `/(root)`, y guardá.

GitHub Pages publicará `index.html` y los archivos estáticos desde la raíz del
repositorio. El sitio funciona bajo una ruta de proyecto de GitHub Pages y no
requiere un proceso de build.

## Estructura

- `index.html` y `styles.css`: contenido y diseño responsive.
- `app.js`: interacción de la página, reservas locales y enlaces de confirmación.
- `config.js`: configuración de marca, contacto, horarios y agenda.
- `services.js`: servicios, duración y fases.
- `scheduler.js`: cálculo local de horarios disponibles.
- `tests/scheduler.test.js`: pruebas de compatibilidad durante exposiciones.
