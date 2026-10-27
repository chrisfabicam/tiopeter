import test from "node:test";
import assert from "node:assert/strict";
import { getAvailableSlots } from "../scheduler.js";
import { services } from "../services.js";

const hours = {
  monday: { open: "09:00", close: "19:00" },
  tuesday: { open: "09:00", close: "19:00" },
  wednesday: { open: "09:00", close: "19:00" },
  thursday: { open: "09:00", close: "19:00" },
  friday: { open: "09:00", close: "19:00" },
  saturday: { open: "10:00", close: "18:00" },
  sunday: null,
};
const scheduler = { timeSlot: 15, professionals: 1, bufferTime: 0 };
const colorBooking = {
  serviceId: "color",
  date: "2026-10-28",
  time: "10:00",
};

function slotsFor(serviceId) {
  return getAvailableSlots({
    date: "2026-10-28",
    service: services.find((item) => item.id === serviceId),
    services,
    bookings: [colorBooking],
    hours,
    scheduler,
  });
}

function slotsForWithBuffer(serviceId, bufferTime) {
  return getAvailableSlots({
    date: "2026-10-28",
    service: services.find((item) => item.id === serviceId),
    services,
    bookings: [colorBooking],
    hours,
    scheduler: { ...scheduler, bufferTime },
  });
}

test("allows a compatible short service fully inside color exposure", () => {
  assert.ok(slotsFor("lavado").includes("10:30"));
  assert.ok(slotsFor("brushing").includes("10:30"));
  assert.ok(slotsFor("corte").includes("10:30"));
});

test("respects the configured margin around a color exposure", () => {
  const slots = slotsForWithBuffer("lavado", 10);
  assert.ok(slots.includes("10:30"));
  assert.ok(!slots.includes("10:15"));
});

test("rejects a service that does not fit in the exposure window", () => {
  assert.ok(!slotsFor("lavado-brushing").includes("10:30"));
});

test("rejects chemical and incompatible services during exposure", () => {
  assert.ok(!slotsFor("color").includes("10:30"));
  assert.ok(!slotsFor("peinado").includes("10:30"));
});
