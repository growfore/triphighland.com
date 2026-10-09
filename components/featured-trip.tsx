import { apiFetch } from "@/lib/api";
import { LucideCalendarClock, LucideCoins } from "lucide-react";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import Link from "next/link";

const TripOfTheMonth = async () => {
  const res = await apiFetch(`/featured/trip-of-the-month?includeActivity=true`,
    { method: "GET" },
  );
  const resJSON = await res.json();

  const trip = resJSON?.data?.featuredTag?.activity;

  return (
    <Link href={`/package/${trip[0].slug}`}>
      <div className="bg-primary/20 relative mx-auto py-12 p-2">
        <div className="container mx-auto">
          <Image
            alt={trip[0].keywords[0] || trip[0].title || ""}
            src={trip[0].images[0]}
            height={720}
            width={1280}
            className="w-full  h-120 md:h-full object-cover rounded-2xl cursor-pointer"
          />
          {/*<div className="bg-linear-to-b from-white to-transparent absolute inset-0" />*/}
          <div className="absolute bottom-2 md:bottom-24 md:left-12">
            <div className="flex items-center justify-center  bg-white p-4 rounded-4xl md:rounded-r-4xl">
              <div className="flex flex-col justify-start items-start space-y-2 ">
                <Badge>Trip of the Month</Badge>
                <h2 className="font-black text-md md:text-5xl text-primary">
                  {trip[0].title.split(":")[0]}{" "}
                </h2>
                <div className="flex gap-1 mt-4">
                  <div className="md:text-2xl flex gap-2 items-start   text-primary">
                    <LucideCalendarClock className="size-8" />
                    <div>
                      <p className="text-xs">Total Duration</p>
                      <p>{trip[0].duration}</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="md:text-2xl flex gap-2 items-start pl-10 text-primary">
                    <LucideCoins className="size-8" />
                    <div>
                      <p className="text-xs md:text-sm">Package Price</p>
                      <p>USD {trip[0].price}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripOfTheMonth;
