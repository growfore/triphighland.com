"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LucideMessageCircle } from "lucide-react";

interface BookingFormProps {
  activityId: string;
  productName: string;
  price: string;
  days: number;
}

interface FormValues {
  startDate: Date | null;
  groupSize: number;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  productName,
  price,
  activityId,
  days,
}) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState();
  const router = useRouter();

  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { startDate: null, groupSize: 1 },
  });

  const [people, setPeople] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(people * Number(price));
  }, [people, price]);

  const onSubmit = async (data: FormValues) => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 shadow-lg p-4 rounded-md border max-w-sm"
    >
      <div className="font-semibold text-2xl">
        Starting From ${price}{" "}
        <span className="text-muted-foreground text-sm">per person</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input type="date"/>
        {/* <DatePicker setStartDate={setStartDate} />
        {formState.errors.startDate && (
          <p className="text-red-500 text-sm">Start date is required</p>
        )} */}
      </div>
      <div className="space-y-2">
        <Label htmlFor="groupSize">Group Size</Label>
        <Input
          max={Number(days)}
          type="number"
          {...register("groupSize", { required: true, min: 1 })}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="mt-1 w-full"
          min={1}
        />
        {formState.errors.groupSize && (
          <p className="text-red-500 text-sm">Group size must be at least 1</p>
        )}
      </div>
      <div>
        <p className="">Total:</p>
        <span className="font-bold text-xl">${total}</span>
      </div>

      <Button size={"lg"} type="submit" className="w-full">
        {loading ? "Booking..." : "Book Now"}
      </Button>
      {/* <div className="border p-2 rounded-sm flex flex-col gap-2">
        <div className="flex gap-1 items-center">
          <div className="size-12 flex items-center justify-center rounded-sm aspect-square">
            <CircleCheckBig className="text-green-600" />
          </div>
          <div>
            <p className="font-medium">Flexible Booking</p>
            <p className="text-muted-foreground">
              Change your days upto 30 Days prior
            </p>
          </div>
        </div>

        <div className="flex gap-1 items-center">
          <div className="size-12 flex items-center justify-center rounded-full aspect-square">
            <CircleCheckBig className="text-green-600" />
          </div>
          <div>
            <p className="font-medium">24/7 Local Support</p>
            <p className="text-muted-foreground">
              Dedicated Local Team Available
            </p>
          </div>
        </div>
      </div> */}
      <div>
        <Link
          href={
            "https://api.whatsapp.com/send/?phone=9779841328947&text&type=phone_number&app_absent=0"
          }
        >
          <Button type="button" className="w-full" variant={"outline"}>
            <LucideMessageCircle /> <p>Make an Inquiry</p>
          </Button>
        </Link>
        <p className="text-xs pt-2">
          Don&apos;t worry, you will get on contact with the guide who posted
          this trip.
        </p>
      </div>
    </form>
  );
};
