// Timezone utility for Bolivia (America/La_Paz = UTC-4)
export const BOLIVIA_TIMEZONE = "America/La_Paz";

/**
 * Formats a date string to Bolivia timezone
 * @param dateString - ISO date string from database (UTC)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Bolivia timezone
 */
export function formatDateBolivia(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: BOLIVIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...options,
  };

  return new Intl.DateTimeFormat("es-BO", defaultOptions).format(date);
}

/**
 * Formats date for printer output (DD/MM/YYYY HH:MM:SS in Bolivia timezone)
 */
export function formatDateForPrinter(dateString: string): string {
  return formatDateBolivia(dateString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Gets current time in Bolivia timezone
 */
export function getNowBolivia(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: BOLIVIA_TIMEZONE }));
}

/**
 * Converts UTC date to Bolivia timezone Date object
 */
export function toBoliviaTime(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  return new Date(date.toLocaleString("en-US", { timeZone: BOLIVIA_TIMEZONE }));
}