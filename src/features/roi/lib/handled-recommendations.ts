const storageKey = (companySlug: string) =>
  `intelliroi_handled_recs:${companySlug}`;

export function readHandledRecIds(companySlug: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(storageKey(companySlug));
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(ids)) return new Set();
    return new Set(
      ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0),
    );
  } catch {
    return new Set();
  }
}

export function markRecHandled(companySlug: string, id: number) {
  if (typeof window === "undefined" || !Number.isFinite(id) || id <= 0) return;
  const next = readHandledRecIds(companySlug);
  next.add(id);
  sessionStorage.setItem(storageKey(companySlug), JSON.stringify([...next]));
}
