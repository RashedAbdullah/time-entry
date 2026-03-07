export function dateToTimeString(date: string | Date) {
  const d = new Date(date);

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function timeStringToDate(time: string, baseDate = new Date()) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);

  return date;
}

export function normalizeDate(dateString: string) {
  const d = new Date(dateString);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
