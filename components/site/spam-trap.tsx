"use client";

import { useEffect, useRef } from "react";

// Lightweight bot filter for the enquiry forms: a field people never see (bots
// fill every input) plus a minimum time between page load and submit.
const FIELD = "company_website";
const MIN_FILL_MS = 3000;

export function SpamTrap() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name={FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

// Returns a check to call on submit: true when the submission looks automated.
export function useSpamCheck() {
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return (form: HTMLFormElement) => {
    const trap = new FormData(form).get(FIELD);
    return Boolean(trap) || !mountedAt.current || Date.now() - mountedAt.current < MIN_FILL_MS;
  };
}
