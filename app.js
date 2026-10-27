import config from "./config.js";
import { getAvailableSlots, serviceDuration } from "./scheduler.js";
import { services } from "./services.js";

const byId = (id) => document.getElementById(id);
const serviceById = Object.fromEntries(services.map((service) => [service.id, service]));
const storageKey = "tiopeter-bookings";
let exampleBookings = [];
let localBookings = readLocalBookings();

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readLocalBookings() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function allBookings() {
  return [...exampleBookings, ...localBookings];
}

function whatsappUrl(message) {
  const phone = config.brand.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function applyBrandConfig() {
  document.documentElement.style.setProperty("--forest", config.theme.primary);
  document.documentElement.style.setProperty("--clay", config.theme.secondary);
  document.documentElement.style.setProperty("--cream", config.theme.accent);
  document.documentElement.style.setProperty("--paper", config.theme.background);
  document.documentElement.style.setProperty("--ink", config.theme.textPrimary);
  document.documentElement.style.setProperty("--muted", config.theme.textSecondary);
  document.title = `${config.brand.name} — ${config.brand.tagline}`;
  byId("hero-title").textContent = config.messages.heroTitle;
  byId("hero-subtitle").textContent = config.messages.heroSubtitle;
  byId("contact-address").textContent = config.brand.address;
  byId("contact-phone").textContent = config.brand.phone;
  byId("contact-phone").href = `tel:${config.brand.phone.replace(/\s/g, "")}`;
  byId("footer-location").textContent = config.brand.city;
  byId("footer-year").textContent = new Date().getFullYear();

  const appointmentMessage = `Hola, quiero consultar por una cita en ${config.brand.name}.`;
  byId("hero-whatsapp").href = whatsappUrl(appointmentMessage);
  byId("contact-whatsapp").href = whatsappUrl(appointmentMessage);
  byId("reviews-link").href = config.socials.googleReviews;

  const calendarContainer = byId("calendar-container");
  if (config.googleCalendar.embedUrl.startsWith("https://")) {
    const iframe = document.createElement("iframe");
    iframe.src = config.googleCalendar.embedUrl;
    iframe.title = `Agenda de ${config.brand.name}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    calendarContainer.replaceChildren(iframe);
  }
}

function renderServices() {
  const list = byId("service-list");
  const picker = byId("service-select");

  for (const service of services) {
    const card = document.createElement("article");
    card.className = "service-card";
    const category = document.createElement("span");
    category.textContent = service.categoria;
    const heading = document.createElement("h3");
    heading.textContent = service.nombre;
    const description = document.createElement("p");
    description.textContent = service.descripcion;
    const duration = document.createElement("span");
    duration.className = "service-time";
    duration.textContent = service.duracion;
    card.append(category, heading, description, duration);
    list.append(card);

    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.nombre} · ${service.duracion}`;
    picker.append(option);
  }
}

function refreshAvailableTimes() {
  const service = serviceById[byId("service-select").value];
  const date = byId("booking-date").value;
  const select = byId("booking-time");
  select.replaceChildren(new Option("Elegí fecha y servicio", ""));
  select.disabled = true;
  if (!service || !date) return;

  const slots = getAvailableSlots({
    date,
    service,
    services,
    bookings: allBookings(),
    hours: config.hours,
    scheduler: config.scheduler,
  });
  if (!slots.length) {
    select.replaceChildren(new Option("No hay horarios disponibles", ""));
    byId("booking-message").textContent =
      "No encontramos horarios para esa fecha. Probá con otro día o escribinos por WhatsApp.";
    return;
  }
  byId("booking-message").textContent = "";
  select.replaceChildren(new Option("Seleccioná un horario", ""));
  for (const slot of slots) select.add(new Option(slot, slot));
  select.disabled = false;
}

function calendarDateRange(date, time, duration) {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + duration * 60_000);
  const format = (value) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `${format(start)}/${format(end)}`;
}

function showConfirmation(booking, service) {
  const message = [
    `Hola, quiero confirmar mi reserva en ${config.brand.name}.`,
    `Servicio: ${service.nombre}`,
    `Fecha: ${booking.date} a las ${booking.time}`,
    `Nombre: ${booking.customerName}`,
    `Teléfono: ${booking.customerPhone}`,
    booking.note ? `Nota: ${booking.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${service.nombre} · ${config.brand.name}`,
    dates: calendarDateRange(booking.date, booking.time, serviceDuration(service)),
    details: `Reserva a nombre de ${booking.customerName}. Para confirmar, contactá al salón por WhatsApp.`,
    location: config.brand.address,
  });
  const calendarLink = document.createElement("a");
  calendarLink.href = `https://calendar.google.com/calendar/render?${params}`;
  calendarLink.target = "_blank";
  calendarLink.rel = "noreferrer";
  calendarLink.textContent = "Agregar a Google Calendar";
  const whatsappLink = document.createElement("a");
  whatsappLink.href = whatsappUrl(message);
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noreferrer";
  whatsappLink.textContent = "Confirmar por WhatsApp";
  const status = byId("booking-message");
  status.replaceChildren(
    document.createTextNode("Guardamos tu solicitud en este dispositivo. "),
    calendarLink,
    document.createTextNode(" · "),
    whatsappLink,
  );
}

async function loadExampleBookings() {
  try {
    const response = await fetch("./bookings.example.json");
    if (response.ok) {
      const sample = await response.json();
      exampleBookings = Array.isArray(sample) ? sample : [];
    }
  } catch {
    exampleBookings = [];
  }
}

byId("booking-date").min = localDateString(new Date());
applyBrandConfig();
renderServices();
await loadExampleBookings();

byId("service-select").addEventListener("change", refreshAvailableTimes);
byId("booking-date").addEventListener("change", refreshAvailableTimes);

byId("booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const service = serviceById[formData.get("service")];
  const date = formData.get("date");
  const time = formData.get("time");
  const currentSlots = getAvailableSlots({
    date,
    service,
    services,
    bookings: allBookings(),
    hours: config.hours,
    scheduler: config.scheduler,
  });
  if (!service || !currentSlots.includes(time)) {
    byId("booking-message").textContent =
      "Ese horario ya no está disponible. Elegí otro horario para continuar.";
    refreshAvailableTimes();
    return;
  }

  const booking = {
    id: `reserva-${Date.now()}`,
    serviceId: service.id,
    date,
    time,
    customerName: String(formData.get("name")).trim(),
    customerPhone: String(formData.get("phone")).trim(),
    note: String(formData.get("note")).trim(),
    createdAt: new Date().toISOString(),
  };
  localBookings = [...localBookings, booking];
  try {
    localStorage.setItem(storageKey, JSON.stringify(localBookings));
  } catch {
    localBookings = localBookings.filter((item) => item.id !== booking.id);
    byId("booking-message").textContent =
      "No pudimos guardar la reserva en este dispositivo. Escribinos por WhatsApp para coordinar.";
    return;
  }
  showConfirmation(booking, service);
  refreshAvailableTimes();
});

byId("contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = byId("contact-note").value.trim();
  if (!message) return;
  window.open(whatsappUrl(`Hola, soy ${config.brand.name}. ${message}`), "_blank", "noopener,noreferrer");
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = byId("site-nav");
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute("aria-label", expanded ? "Abrir menú" : "Cerrar menú");
  navigation.classList.toggle("is-open", !expanded);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    navigation.classList.remove("is-open");
  }
});
