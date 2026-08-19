import { apiRequest } from "@/lib/api/client";

export type PolicyScope = "company" | "department" | "team";
export type PolicyEffect = "allow" | "deny";

export type AiPolicy = {
  id: number;
  company_id: number;
  scope_type: PolicyScope;
  department_id?: number;
  team_id?: number;
  effect: PolicyEffect;
  provider_id?: number;
  model_id?: number;
  daily_token_cap?: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CreatePolicyInput = {
  scope_type: PolicyScope;
  effect: PolicyEffect;
  department_id?: number;
  team_id?: number;
  provider_id?: number;
  model_id?: number;
  daily_token_cap?: number;
  status?: string;
};

type PolicyDto = {
  id: number;
  company_id?: number;
  scope_type: string;
  department_id?: number | null;
  team_id?: number | null;
  effect: string;
  provider_id?: number | null;
  model_id?: number | null;
  daily_token_cap?: number | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

function asList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function toPolicy(p: PolicyDto): AiPolicy {
  return {
    id: p.id,
    company_id: p.company_id ?? 0,
    scope_type: (p.scope_type as PolicyScope) ?? "company",
    department_id: p.department_id ?? undefined,
    team_id: p.team_id ?? undefined,
    effect: (p.effect as PolicyEffect) ?? "allow",
    provider_id: p.provider_id ?? undefined,
    model_id: p.model_id ?? undefined,
    daily_token_cap: p.daily_token_cap ?? undefined,
    status: p.status ?? "active",
    created_at: p.created_at ?? "",
    updated_at: p.updated_at ?? "",
  };
}

function toBody(input: CreatePolicyInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    scope_type: input.scope_type,
    effect: input.effect,
    status: input.status ?? "active",
  };
  if (input.department_id) body.department_id = input.department_id;
  if (input.team_id) body.team_id = input.team_id;
  if (input.provider_id) body.provider_id = input.provider_id;
  if (input.model_id) body.model_id = input.model_id;
  if (input.daily_token_cap) body.daily_token_cap = input.daily_token_cap;
  return body;
}

export const policiesApi = {
  async list(): Promise<AiPolicy[]> {
    const raw = await apiRequest<PolicyDto[]>("ai", "/policies");
    return asList<PolicyDto>(raw).map(toPolicy);
  },

  async create(input: CreatePolicyInput): Promise<AiPolicy> {
    const raw = await apiRequest<PolicyDto>("ai", "/policies", {
      method: "POST",
      body: toBody(input),
    });
    return toPolicy(raw);
  },

  async update(id: number, input: Partial<CreatePolicyInput>): Promise<AiPolicy> {
    const raw = await apiRequest<PolicyDto>("ai", `/policies/${id}`, {
      method: "PATCH",
      body: toBody({
        scope_type: input.scope_type ?? "company",
        effect: input.effect ?? "allow",
        ...input,
      }),
    });
    return toPolicy(raw);
  },

  async remove(id: number): Promise<void> {
    await apiRequest("ai", `/policies/${id}`, { method: "DELETE" });
  },
};
