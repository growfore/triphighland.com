"use client";
import { useEffect, useState } from "react";
import TripCard from "./cards/trip-card";

export default function PackagesBlock({
  count,
  category,
}: {
  count: number;
  category: string;
}) {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    async function getPackages() {
      try {
        console.log("Fetching datas...");
        const res = await fetch(
          `/api/activity?limit=${count}`,
          { cache: "no-store" },
        );

        const json = await res.json();
        setPackages(json.data);
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      }
    }

    console.log("we are here in packages block", packages);
    getPackages();
  }, [count, category]);

  return (
    <div className="my-8">
      <div className="flex flex-row gap-4 overflow-auto max-w-screen">
        {packages.map((pkg, index) => (
          <TripCard key={index} tour={pkg} />
        ))}
      </div>
    </div>
  );
}
