export const COMPANY_INDUSTRIES = [
  "Software / Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail / Ecommerce",
  "Education",
  "Consulting",
  "Media",
  "Other",
] as const;

export type CompanyIndustry = (typeof COMPANY_INDUSTRIES)[number];

/** Exact buckets from InteliROI Postman register _options. */
export const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
] as const;

export type CompanySize = (typeof COMPANY_SIZES)[number];

/**
 * IANA timezones for countries we support in locale.COUNTRIES.
 * value is what the API stores; label is for the dropdown only.
 */
export const COMPANY_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata — India" },
  { value: "Asia/Dubai", label: "Asia/Dubai — UAE" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo — Japan" },
  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur — Malaysia" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta — Indonesia" },
  { value: "Asia/Manila", label: "Asia/Manila — Philippines" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka — Bangladesh" },
  { value: "Asia/Colombo", label: "Asia/Colombo — Sri Lanka" },
  { value: "Asia/Karachi", label: "Asia/Karachi — Pakistan" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh — Saudi Arabia" },
  { value: "Europe/London", label: "Europe/London — United Kingdom" },
  { value: "Europe/Berlin", label: "Europe/Berlin — Germany" },
  { value: "Europe/Paris", label: "Europe/Paris — France" },
  { value: "America/New_York", label: "America/New_York — US Eastern" },
  { value: "America/Chicago", label: "America/Chicago — US Central" },
  { value: "America/Denver", label: "America/Denver — US Mountain" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles — US Pacific" },
  { value: "America/Toronto", label: "America/Toronto — Canada" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo — Brazil" },
  { value: "Australia/Sydney", label: "Australia/Sydney" },
  { value: "Africa/Lagos", label: "Africa/Lagos — Nigeria" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg — South Africa" },
] as const;

export type CompanyTimezone = (typeof COMPANY_TIMEZONES)[number]["value"];
