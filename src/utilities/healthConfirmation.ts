/** Retourne true si on est le même jour (ignore l’heure) */
export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Nombre de jours entre deux dates (absolu) */
export const daysBetween = (a: Date, b: Date) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

/**
 * Vaccination
 * - Actif le jour de dateGiven (si pas encore confirmé aujourd’hui)
 * - Ou le jour de nextDue (si dateGiven déjà passé)
 */
export function canConfirmVaccination(v: {
  dateGiven?: string | Date | null;
  nextDue?: string | Date | null;
  lastConfirmedAt?: string | Date | null;
}): boolean {
  const today = new Date();
  const dateGiven = v.dateGiven ? new Date(v.dateGiven) : null;
  const nextDue = v.nextDue ? new Date(v.nextDue) : null;
  const last = v.lastConfirmedAt ? new Date(v.lastConfirmedAt) : null;

  // Déjà confirmé aujourd’hui → bloqué
  if (last && isSameDay(last, today)) return false;

  // Jour de l’administration
  if (dateGiven && isSameDay(dateGiven, today)) return true;

  // Jour du rappel
  if (nextDue && isSameDay(nextDue, today)) return true;

  return false;
}

/**
 * Traitement
 * - Doit être dans la période [startDate, endDate]
 * - Respecte frequencyDays
 * - Pas déjà confirmé aujourd’hui (ou dans l’intervalle)
 */
export function canConfirmTreatment(t: {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  lastConfirmedAt?: string | Date | null;
  frequencyDays?: number | null;
}): boolean {
  const today = new Date();
  const start = t.startDate ? new Date(t.startDate) : null;
  const end = t.endDate ? new Date(t.endDate) : null;
  const last = t.lastConfirmedAt ? new Date(t.lastConfirmedAt) : null;
  const freq = t.frequencyDays && t.frequencyDays > 0 ? t.frequencyDays : 1;

  if (!start) return false;

  // Hors période
  if (today < start) return false;
  if (end && today > end) return false;

  // Déjà confirmé aujourd’hui
  if (last && isSameDay(last, today)) return false;

  // Première confirmation possible
  if (!last) {
    // On autorise si on est un multiple de frequencyDays depuis startDate
    const daysSinceStart = daysBetween(start, today);
    return daysSinceStart % freq === 0;
  }

  // Prochaine date autorisée = lastConfirmedAt + frequencyDays
  const nextAllowed = new Date(last);
  nextAllowed.setDate(nextAllowed.getDate() + freq);

  return today >= nextAllowed;
}

export type VaccinationActionState = "notyet" | "ready" | "waiting" | "missed" | "done";

export function getVaccinationStatus(v: {
  dateGiven?: string | Date | null;
  nextDue?: string | Date | null;
  lastConfirmedAt?: string | Date | null;
  vaccinated?: boolean;
}): { state: VaccinationActionState; date?: Date } {
  const today = new Date();
  const dateGiven = v.dateGiven ? new Date(v.dateGiven) : null;
  const nextDue = v.nextDue ? new Date(v.nextDue) : null;

  if (canConfirmVaccination(v)) return { state: "ready" };

  if (dateGiven && today < dateGiven) return { state: "notyet", date: dateGiven };

  if (v.vaccinated) {
    if (nextDue && today < nextDue) return { state: "waiting", date: nextDue };
    if (nextDue && today > nextDue) return { state: "missed", date: nextDue };
    return { state: "done" };
  }

  if (dateGiven && today > dateGiven && !isSameDay(dateGiven, today)) {
    return { state: "missed", date: dateGiven };
  }

  return { state: "notyet", date: dateGiven ?? undefined };
}

export type TreatmentActionState = "notyet" | "ready" | "waiting" | "done";

export function getTreatmentStatus(t: {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  lastConfirmedAt?: string | Date | null;
  frequencyDays?: number | null;
}): { state: TreatmentActionState; date?: Date } {
  const today = new Date();
  const start = t.startDate ? new Date(t.startDate) : null;
  const end = t.endDate ? new Date(t.endDate) : null;
  const freq = t.frequencyDays && t.frequencyDays > 0 ? t.frequencyDays : 1;
  const last = t.lastConfirmedAt ? new Date(t.lastConfirmedAt) : null;

  if (start && today < start) return { state: "notyet", date: start };
  if (end && today > end) return { state: "done" };
  if (canConfirmTreatment(t)) return { state: "ready" };

  let nextDate: Date | null = null;
  if (last) {
    nextDate = new Date(last);
    nextDate.setDate(nextDate.getDate() + freq);
  } else if (start) {
    nextDate = start;
  }
  return { state: "waiting", date: nextDate ?? undefined };
}