const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;
}

export function serviceDuration(service) {
  return service.fases.reduce((total, fase) => total + fase.minutos, 0);
}

function serviceTimeline(service, start) {
  let cursor = start;
  const phases = service.fases.map((fase) => {
    const phase = {
      ...fase,
      start: cursor,
      end: cursor + fase.minutos,
    };
    cursor = phase.end;
    return phase;
  });
  return { start, end: cursor, phases };
}

function getDayHours(date, hours) {
  const day = DAYS[new Date(`${date}T12:00:00`).getDay()];
  return hours[day] ?? null;
}

function bookingTimeline(booking, servicesById) {
  const service = servicesById[booking.serviceId];
  if (!service || !booking.date || !booking.time) return null;
  return {
    service,
    timeline: serviceTimeline(service, timeToMinutes(booking.time)),
  };
}

function fitsInExposure(guest, host, bufferTime) {
  if (!guest.service.permiteEnExposicion) return false;
  return host.timeline.phases.some(
    (phase) =>
      phase.tipo === "exposicion" &&
      guest.timeline.start >= phase.start + bufferTime &&
      guest.timeline.end <= phase.end - bufferTime,
  );
}

function activeCapacityAvailable(timelines, professionals, bufferTime) {
  const events = [];
  for (const { timeline } of timelines) {
    const intervals = timeline.phases
      .filter((phase) => phase.tipo === "activa")
      .map((phase) => [phase.start, phase.end + bufferTime])
      .sort(([startA], [startB]) => startA - startB);
    const merged = [];
    for (const [start, end] of intervals) {
      const previous = merged.at(-1);
      if (previous && start <= previous[1]) {
        previous[1] = Math.max(previous[1], end);
      } else {
        merged.push([start, end]);
      }
    }
    for (const [start, end] of merged) {
      events.push([start, 1]);
      events.push([end, -1]);
    }
  }
  events.sort(([timeA, deltaA], [timeB, deltaB]) => timeA - timeB || deltaA - deltaB);
  let active = 0;
  for (const [, delta] of events) {
    active += delta;
    if (active > professionals) return false;
  }
  return true;
}

function isAvailable(candidate, bookings, servicesById, professionals, bufferTime) {
  const existing = bookings
    .filter((booking) => booking.date === candidate.date)
    .map((booking) => bookingTimeline(booking, servicesById))
    .filter(Boolean);
  const overlaps = existing.filter(
    ({ timeline }) =>
      candidate.timeline.start < timeline.end &&
      timeline.start < candidate.timeline.end,
  );
  if (!overlaps.length) return true;

  const candidateGuest = { service: candidate.service, timeline: candidate.timeline };
  const onlyValidExposureInsertions = overlaps.every(
    (booking) =>
      fitsInExposure(candidateGuest, booking, bufferTime) ||
      fitsInExposure(booking, candidateGuest, bufferTime),
  );
  if (onlyValidExposureInsertions) {
    return activeCapacityAvailable(
      [...existing, candidate],
      professionals,
      bufferTime,
    );
  }
  if (professionals <= 1) return false;

  return activeCapacityAvailable(
    [...existing, candidate],
    professionals,
    bufferTime,
  );
}

export function getAvailableSlots({
  date,
  service,
  services,
  bookings = [],
  hours,
  scheduler = {},
  now = new Date(),
}) {
  if (!date || !service || !hours) return [];
  const opening = getDayHours(date, hours);
  if (!opening) return [];

  const slot = Math.max(1, Number(scheduler.timeSlot) || 15);
  const professionals = Math.max(1, Number(scheduler.professionals) || 1);
  const bufferTime = Math.max(0, Number(scheduler.bufferTime) || 0);
  const servicesById = Object.fromEntries(services.map((item) => [item.id, item]));
  const duration = serviceDuration(service);
  let openAt = timeToMinutes(opening.open);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  if (date === today) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    openAt = Math.max(openAt, Math.ceil(currentMinutes / slot) * slot);
  }
  const closeAt = timeToMinutes(opening.close);
  const available = [];

  for (let start = openAt; start + duration <= closeAt; start += slot) {
    const timeline = serviceTimeline(service, start);
    if (
      isAvailable(
        { date, service, timeline },
        bookings,
        servicesById,
        professionals,
        bufferTime,
      )
    ) {
      available.push(minutesToTime(start));
    }
  }
  return available;
}
