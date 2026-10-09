"use client";

import { useEffect, useState } from "react";

export type SiteContact = { email: string; phoneNumber: string; fullAddress: string; openHours: string };

const empty: SiteContact = { email: "", phoneNumber: "", fullAddress: "", openHours: "" };

// Tenant contact details for client-only pages, read via the same-origin proxy.
export function useSiteContact(): SiteContact {
  const [contact, setContact] = useState(empty);
  useEffect(() => {
    let alive = true;
    fetch("/api/site-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        const c = body?.data?.config;
        if (!alive || !c) return;
        const firstPhone = Array.isArray(c.phoneNumbers) ? Object.values(c.phoneNumbers[0] ?? {})[0] : "";
        setContact({
          email: c.email ?? "",
          phoneNumber: String(firstPhone ?? ""),
          fullAddress: c.fullAddress ?? "",
          openHours: c.openHours ?? "",
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return contact;
}
