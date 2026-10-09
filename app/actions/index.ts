import { apiFetch } from "@/lib/api";

export async function getCities() {
  try {
    const res = await apiFetch("/city?page=1&limit=100");
    if (!res.ok) throw new Error("Failed to fetch cities");
    return await res.json();
  } catch (error) {
    console.error("Error fetching cities:", error);
    return { data: { cities: [] } };
  }
}

export async function getRegions() {
  try {
    const res = await apiFetch("/region?page=1&limit=100");
    if (!res.ok) throw new Error("Failed to fetch regions");
    return await res.json();
  } catch (error) {
    console.error("Error fetching regions:", error);
    return { data: { regions: [] } };
  }
}

export async function getTripCategories() {
  const res = await apiFetch("/trip-category?page=1&limit=100");
  const data = await res.json();
  return data;
}

export async function getTripTypes() {
  const res = await apiFetch("/trip-type?page=1&limit=100");
  const data = await res.json();
  return data;
}

export async function fetchActivityData(editId: number) {
  const res = await apiFetch(`/activity/${editId}`);
  if (!res.ok) throw new Error("Failed to fetch activity");

  const data = await res.json();
  return data;
}