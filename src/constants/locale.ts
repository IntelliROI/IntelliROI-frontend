export const CURRENCIES = [
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const COUNTRIES = [
  { iso: "IN", name: "India", dial: "+91", min: 10, max: 10 },
  { iso: "US", name: "United States", dial: "+1", min: 10, max: 10 },
  { iso: "GB", name: "United Kingdom", dial: "+44", min: 10, max: 10 },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", min: 9, max: 9 },
  { iso: "SG", name: "Singapore", dial: "+65", min: 8, max: 8 },
  { iso: "AU", name: "Australia", dial: "+61", min: 9, max: 9 },
  { iso: "CA", name: "Canada", dial: "+1", min: 10, max: 10 },
  { iso: "DE", name: "Germany", dial: "+49", min: 10, max: 11 },
  { iso: "FR", name: "France", dial: "+33", min: 9, max: 9 },
  { iso: "JP", name: "Japan", dial: "+81", min: 10, max: 10 },
  { iso: "SA", name: "Saudi Arabia", dial: "+966", min: 9, max: 9 },
  { iso: "MY", name: "Malaysia", dial: "+60", min: 9, max: 10 },
  { iso: "ID", name: "Indonesia", dial: "+62", min: 10, max: 12 },
  { iso: "PH", name: "Philippines", dial: "+63", min: 10, max: 10 },
  { iso: "BD", name: "Bangladesh", dial: "+880", min: 10, max: 10 },
  { iso: "LK", name: "Sri Lanka", dial: "+94", min: 9, max: 9 },
  { iso: "PK", name: "Pakistan", dial: "+92", min: 10, max: 10 },
  { iso: "NG", name: "Nigeria", dial: "+234", min: 10, max: 10 },
  { iso: "ZA", name: "South Africa", dial: "+27", min: 9, max: 9 },
  { iso: "BR", name: "Brazil", dial: "+55", min: 10, max: 11 },
] as const;

export type CountryIso = (typeof COUNTRIES)[number]["iso"];

export const DEFAULT_COUNTRY_ISO: CountryIso = "IN";
export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function findCountry(iso: string) {
  return COUNTRIES.find((c) => c.iso === iso);
}

/** Build +9198… from static dial + national digits. Empty if no number. */
export function toE164(iso: string, national: string): string {
  const country = findCountry(iso);
  const digits = digitsOnly(national);
  if (!country || !digits) return "";
  return `${country.dial}${digits}`;
}

export function isValidNationalNumber(iso: string, national: string): boolean {
  const country = findCountry(iso);
  const digits = digitsOnly(national);
  if (!country || digits.length === 0) return false;
  return digits.length >= country.min && digits.length <= country.max;
}

/** Split stored E.164 (+91…) back into country + national digits. */
export function fromE164(e164?: string | null): {
  iso: CountryIso;
  national: string;
} {
  const raw = (e164 ?? "").trim();
  if (!raw) return { iso: DEFAULT_COUNTRY_ISO, national: "" };
  const withPlus = raw.startsWith("+") ? raw : `+${digitsOnly(raw)}`;
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => withPlus.startsWith(c.dial));
  if (!match) {
    return { iso: DEFAULT_COUNTRY_ISO, national: digitsOnly(raw) };
  }
  return {
    iso: match.iso,
    national: digitsOnly(withPlus.slice(match.dial.length)),
  };
}
