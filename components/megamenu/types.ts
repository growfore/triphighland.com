// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiMenuItem {
  id: string;
  label: string;
  url: string;
  children: ApiMenuItem[];
  parentId?: string | null;
  depth?: number;
}

export interface ApiMenuResponse {
  success: boolean;
  data: {
    items: ApiMenuItem[];
    version: string;
    updatedAt: string;
  };
}

// ─── Derived / UI Types ───────────────────────────────────────────────────────

/** A top-level nav item with optional flat children (max 2 levels from API) */
export interface NavItem {
  id: string;
  label: string;
  url: string;
  /** Children are always flat — the API only gives 2 levels */
  children: NavChild[];
}

export interface NavChild {
  id: string;
  label: string;
  url: string;
}
