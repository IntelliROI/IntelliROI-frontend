import { pagedRequest, withQuery } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE, type Paged } from "@/lib/api/types";

export type AuditEntry = {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
};

type AuditDto = {
  id: string | number;
  time: string;
  actor?: string;
  action?: string;
  target?: string;
};

function toEntry(row: AuditDto): AuditEntry {
  return {
    id: String(row.id),
    time: row.time,
    actor: row.actor ?? "",
    action: row.action ?? "",
    target: row.target ?? "",
  };
}

async function listPath(path: string): Promise<Paged<AuditEntry>> {
  const page = await pagedRequest<AuditDto>(
    "auth",
    withQuery(path, { page: 1, page_size: LIST_DROPDOWN_PAGE_SIZE }),
  );
  return {
    items: page.items.map(toEntry),
    meta: page.meta,
  };
}

export const auditApi = {
  listTenant(): Promise<Paged<AuditEntry>> {
    return listPath("/audit-logs");
  },
  listPlatform(): Promise<Paged<AuditEntry>> {
    return listPath("/platform/audit-logs");
  },
};
