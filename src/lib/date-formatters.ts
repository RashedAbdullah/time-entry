/**
 * All date/time fields on TimeEntry (`date`, `startDateTime`, `endTime`) store a
 * "wall clock" value with no real timezone attached — the app doesn't do timezone
 * conversion, it just needs the hours/minutes the user typed to come back unchanged
 * no matter where the server or browser happens to run. To keep that guarantee we
 * always read/write these fields using the UTC getters/setters, never the local
 * (machine-timezone-dependent) ones. Never use `getHours`/`setHours` etc. on these
 * fields — use the helpers below instead.
 */

// "HH:mm" (as stored) -> "HH:mm" (unchanged, kept for API symmetry/back-compat)
export function dateToTimeString(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

// "HH:mm" + a UTC-midnight calendar day -> a Date storing that wall-clock time
export function timeStringToDate(time: string, baseDate: Date = new Date()) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(baseDate);
  date.setUTCHours(hours, minutes, 0, 0);

  return date;
}

// Accepts a "yyyy-MM-dd" string (or a Date, using its local calendar components)
// and returns a Date pinned to UTC midnight of that calendar day.
export function normalizeDate(dateInput: string | Date) {
  if (typeof dateInput === "string") {
    const [datePart] = dateInput.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  return new Date(
    Date.UTC(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate(),
    ),
  );
}

// "yyyy-MM-dd" for the browser's *local* calendar day (i.e. what the user
// considers "today"). Never use `new Date().toISOString().slice(0, 10)` for
// this — that reads the UTC calendar day, which is a different day than the
// user's local day for several hours around midnight in most timezones.
export function todayDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Turns a stored UTC-wall-clock value into a Date whose *local* getters return
// those same UTC components — safe to hand to date-fns `format()`/`isSameDay()`/
// etc. so display always matches what was entered, regardless of the viewer's
// timezone.
export function toDisplayDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
    d.getUTCMilliseconds(),
  );
}

// "yyyy-MM-dd" key for a stored `date` field, read via UTC components.
export function dateKey(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
