//@ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense } from "react";

import {
  LucideMail,
  LucideMapPin,
  LucidePhone,
  LucideSend,
  LucideCheckCircle2,
  LucideClock,
  LucidePlus,
  LucideTrash2,
  LucideCompass,
  LucideUsers,
  LucideUtensils,
  LucideBed,
  LucideStar,
  LucideMap,
  LucideLoader2,
  LucideCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useSiteContact } from "@/components/site/use-site-contact";
import Photo from "@/components/site/photo";
import { SpamTrap, useSpamCheck } from "@/components/site/spam-trap";
import { sendErrorMessage } from "@/components/site/enquiry-form";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TripCategory {
  id: string;
  categoryHandle: string;
  categoryName: string;
  categoryImage: string | null;
  createdAt: string;
}

const DURATION_VALUES = [
  "1–3 days",
  "4–7 days",
  "8–10 days",
  "11–14 days",
  "15–20 days",
  "21+ days",
] as const;
type Duration = (typeof DURATION_VALUES)[number];

const INCLUSION_IDS = [
  "guide",
  "porter",
  "permits",
  "transport",
  "insurance",
  "firstaid",
  "sleeping-bag",
  "helicopter",
] as const;
type InclusionId = (typeof INCLUSION_IDS)[number];

const ACCOMMODATION_VALUES = [
  "teahouse",
  "lodge",
  "luxury-lodge",
  "camping",
  "hotel",
  "mix",
] as const;
type AccommodationValue = (typeof ACCOMMODATION_VALUES)[number];

const FOOD_PREF_VALUES = [
  "local",
  "continental",
  "vegetarian",
  "vegan",
  "halal",
  "flexible",
] as const;
type FoodPrefValue = (typeof FOOD_PREF_VALUES)[number];

const GROUP_TYPE_VALUES = ["solo", "couple", "family", "friends"] as const;
type GroupType = (typeof GROUP_TYPE_VALUES)[number];

const TRAVELLER_COUNT_VALUES = [
  "1",
  "2",
  "3",
  "4",
  "5–7",
  "8–10",
  "11–15",
  "16+",
] as const;
type TravellerCount = (typeof TRAVELLER_COUNT_VALUES)[number];

const INCLUSIONS: { id: InclusionId; label: string }[] = [
  { id: "guide", label: "Licensed Guide" },
  { id: "porter", label: "Porter Service" },
  { id: "permits", label: "Trekking Permits & TIMS" },
  { id: "transport", label: "Airport Transfers" },
  { id: "firstaid", label: "First Aid / Medical Kit" },
  { id: "sleeping-bag", label: "Sleeping Bag & Equipment" },
  { id: "helicopter", label: "Helicopter Rescue Cover" },
];

const ACCOMMODATION: { value: AccommodationValue; label: string }[] = [
  { value: "teahouse", label: "Teahouse / Guesthouse" },
  { value: "lodge", label: "Comfortable Lodge" },
  { value: "luxury-lodge", label: "Luxury Lodge" },
  { value: "camping", label: "Camping" },
  { value: "hotel", label: "Hotel (city nights)" },
  { value: "mix", label: "Mix (flexible)" },
];

const FOOD_PREFS: { value: FoodPrefValue; label: string }[] = [
  { value: "local", label: "Local Nepali Cuisine" },
  { value: "continental", label: "Continental" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "flexible", label: "Flexible / No Preference" },
];

const GROUP_OPTIONS: { value: GroupType; label: string; emoji: string }[] = [
  { value: "solo", label: "Solo", emoji: "🧍" },
  { value: "couple", label: "Couple", emoji: "👫" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { value: "friends", label: "Friends", emoji: "🧑‍🤝‍🧑" },
];

const locationSchema = z.object({
  name: z.string().optional(),
  days: z.string().optional(),
});

const itineraryFormSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    duration: z.enum(DURATION_VALUES, { error: "Please select a duration" }),
    experienceType: z.string().min(1, "Please select an experience type"),
    startDate: z.string().min(1, "Please select a start date"),
    letUsChooseLocations: z.boolean(),
    locations: z.array(locationSchema),
    groupType: z.enum(GROUP_TYPE_VALUES, {
      error: "Please select a group type",
    }),
    numberOfTravellers: z.enum(TRAVELLER_COUNT_VALUES, {
      error: "Please select number of travellers",
    }),
    inclusions: z.array(z.enum(INCLUSION_IDS)).default([]),
    accommodationPreferences: z
      .array(z.enum(ACCOMMODATION_VALUES))
      .min(1, "Please select at least one accommodation preference"),
    foodPreferences: z
      .array(z.enum(FOOD_PREF_VALUES))
      .min(1, "Please select at least one food preference"),
    otherMentions: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.letUsChooseLocations) {
      data.locations.forEach((location, index) => {
        if (!location.name || location.name.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Location name is required",
            path: ["locations", index, "name"],
          });
        }
        const dayNum = Number(location.days);
        if (!location.days || isNaN(dayNum) || dayNum <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Must be at least 1 day",
            path: ["locations", index, "days"],
          });
        }
      });
    }
  });

type ItineraryFormValues = z.infer<typeof itineraryFormSchema>;

const STEPS = [
  { label: "Trip Basics", icon: LucideCompass },
  { label: "Locations", icon: LucideMap },
  { label: "Group", icon: LucideUsers },
  { label: "Preferences", icon: LucideStar },
  { label: "Contact", icon: LucideMail },
] as const;

const STEP_FIELDS: Record<number, (keyof ItineraryFormValues)[]> = {
  0: ["duration", "experienceType", "startDate"],
  1: ["letUsChooseLocations", "locations"],
  2: ["groupType", "numberOfTravellers"],
  3: ["inclusions", "accommodationPreferences", "foodPreferences"],
  4: ["fullName", "email", "phone"],
};

function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
}

function accommodationLabel(v: AccommodationValue): string {
  return ACCOMMODATION.find((a) => a.value === v)?.label ?? v;
}

function foodLabel(v: FoodPrefValue): string {
  return FOOD_PREFS.find((f) => f.value === v)?.label ?? v;
}

// ── Experience Type Card ──────────────────────────────────────────────────────

// Trip categories, styled like the homepage category tiles.
function ExperienceTypeCard({
  category,
  selected,
  onClick,
}: {
  category: TripCategory;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`ht-tile relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[4px] text-left text-white outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-highland-deep focus-visible:ring-offset-2 ${
        selected ? "ring-[3px] ring-highland-deep ring-offset-2" : ""
      }`}
    >
      <Photo src={category.categoryImage} alt="" sizes="(min-width: 640px) 220px, 50vw" />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,12,10,0)_35%,rgba(14,12,10,.8)_100%)]" />
      {selected && (
        <span className="absolute right-2 top-2 flex size-7 items-center justify-center bg-highland-deep text-white">
          <LucideCheck className="size-4" strokeWidth={2.5} />
        </span>
      )}
      <span className="display relative p-3 text-[14px] leading-tight sm:p-4 sm:text-[15px]">{category.categoryName}</span>
    </button>
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────

const CustomItineraryForm = () => (
  <Suspense fallback={<div>Loading…</div>}>
    <ItineraryForm_Component />
  </Suspense>
);

export default CustomItineraryForm;

// ── Main form component ───────────────────────────────────────────────────────

export function ItineraryForm_Component() {
  const siteConfig = useSiteContact();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | false>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const looksAutomated = useSpamCheck();
  const [step, setStep] = useState(0);

  // Categories state
  const [categories, setCategories] = useState<TripCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch all pages of categories
  useEffect(() => {
    const fetchAllCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const allCategories: TripCategory[] = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          const res = await fetch(
            `/api/trip-category?page=${page}&limit=50`,
          );
          if (!res.ok) throw new Error("Failed to fetch categories");
          const json = await res.json();
          const { tripCategories, pagination } = json.data;
          allCategories.push(...tripCategories);
          totalPages = pagination.totalPages;
          page++;
        }

        // Filter out the default placeholder category
        setCategories(
          allCategories.filter((c) => c.categoryHandle !== "default"),
        );
      } catch (err) {
        setCategoriesError(
          "Could not load experience types. Please try again.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchAllCategories();
  }, []);

  const form = useForm<ItineraryFormValues>({
    resolver: zodResolver(itineraryFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      duration: undefined,
      experienceType: "",
      startDate: "",
      letUsChooseLocations: false,
      locations: [{ name: "", days: "" }],
      groupType: undefined,
      numberOfTravellers: undefined,
      inclusions: [],
      accommodationPreferences: [],
      foodPreferences: [],
      otherMentions: "",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  const letUsChoose = form.watch("letUsChooseLocations");
  const today = new Date().toISOString().split("T")[0];

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = async (data: ItineraryFormValues) => {
    setSubmitError(false);
    // Bots see the normal success message so they don't retry; nothing is sent.
    if (formRef.current && looksAutomated(formRef.current)) {
      setSubmitSuccess(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const locationsSummary = data.letUsChooseLocations
        ? "Let the team choose"
        : data.locations
            .map(
              (l) =>
                `${l.name} (${l.days} day${Number(l.days) > 1 ? "s" : ""})`,
            )
            .join(", ");

      const inclusionLabels = data.inclusions
        .map((id) => INCLUSIONS.find((i) => i.id === id)?.label ?? id)
        .join(", ");

      // TripEleven delivers to the tenant's own address; replyTo lets the
      // team answer the traveller directly.
      const res = await fetch(`/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          replyTo: data.email,
          subject: `Custom Itinerary Request from ${data.fullName} — ${data.experienceType}`,
          text: [
            `── Personal Info ──`,
            `Name:                  ${data.fullName}`,
            `Email:                 ${data.email}`,
            `Phone:                 ${data.phone || "Not provided"}`,
            ``,
            `── Trip Details ──`,
            `Duration:              ${data.duration}`,
            `Experience Type:       ${data.experienceType}`,
            `Start Date:            ${data.startDate}`,
            ``,
            `── Locations ──`,
            `Locations:             ${locationsSummary}`,
            ``,
            `── Group ──`,
            `Group Type:            ${data.groupType}`,
            `No. of Travellers:     ${data.numberOfTravellers}`,
            ``,
            `── Preferences ──`,
            `Inclusions:            ${inclusionLabels || "None selected"}`,
            `Accommodation:         ${data.accommodationPreferences.map(accommodationLabel).join(", ")}`,
            `Food Preference:       ${data.foodPreferences.map(foodLabel).join(", ")}`,
            ``,
            `── Other Mentions ──`,
            data.otherMentions || "None",
          ].join("\n"),
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        setSubmitError((await sendErrorMessage(res)) ?? "Something went wrong sending your request. Please try again.");
        return;
      }

      setSubmitSuccess(true);
      form.reset();
      setStep(0);
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch {
      setSubmitError("Something went wrong sending your request. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step navigation ─────────────────────────────────────────────────────────

  const goNext = async () => {
    const valid = await form.trigger(
      STEP_FIELDS[step] as (keyof ItineraryFormValues)[],
    );
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  // Selected category object for the summary
  const selectedCategory = categories.find(
    (c) => c.categoryName === form.watch("experienceType"),
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-14 px-6 md:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            Plan Your Custom Itinerary
          </h1>
          <p className="text-muted text-base max-w-lg">
            Tell us your dream adventure and we&apos;ll craft a personalised
            trek just for you — dates, pace, locations, and every detail.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Form — 2 cols */}
        <div className="lg:col-span-2">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.label} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => isDone && setStep(i)}
                    className={`flex flex-col items-center gap-1 px-3 transition-opacity ${
                      i > step ? "opacity-40 cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 ${
                        isActive
                          ? "bg-primary border-primary text-white"
                          : isDone
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-gray-100 border-gray-200 text-gray-400"
                      }`}
                    >
                      {isDone ? (
                        <LucideCheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isActive ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-px w-8 md:w-12 mb-5 shrink-0 transition-colors ${
                        i < step ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <Form {...form}>
            {/* @ts-expect-error onsubmit has some issues */}
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="relative">
              <SpamTrap />
              {/* ── Step 0: Trip Basics ─────────────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Trip Basics</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Let&apos;s start with the fundamentals of your adventure.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Total Duration *
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v as Duration)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 focus:ring-primary rounded-md h-11">
                              <SelectValue placeholder="How many days?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DURATION_VALUES.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ── Experience Type — image card grid ── */}
                  <FormField
                    control={form.control}
                    name="experienceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Experience / Trek Type *
                        </FormLabel>

                        {categoriesLoading && (
                          <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
                            <LucideLoader2 className="w-4 h-4 animate-spin" />
                            Loading experience types…
                          </div>
                        )}

                        {categoriesError && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {categoriesError}
                          </div>
                        )}

                        {!categoriesLoading && !categoriesError && (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                              {categories.map((cat) => (
                                <ExperienceTypeCard
                                  key={cat.id}
                                  category={cat}
                                  selected={field.value === cat.categoryName}
                                  onClick={() =>
                                    field.onChange(cat.categoryName)
                                  }
                                />
                              ))}
                            </div>

                          </>
                        )}

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Preferred Start Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={today}
                            className="border-gray-300 focus-visible:ring-primary rounded-md h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 1: Locations ───────────────────────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Locations</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Add your desired destinations with planned days at each,
                      or let our experts curate the perfect route.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="letUsChooseLocations"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) form.clearErrors("locations");
                            }}
                            className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="text-gray-800 font-semibold text-sm cursor-pointer">
                            Let us choose the best locations for you
                          </FormLabel>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Our expert team will design the optimal route based
                            on your duration and experience type.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!letUsChoose && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">
                        Your Locations
                      </p>

                      {fields.map((fieldItem, index) => (
                        <div
                          key={fieldItem.id}
                          className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <FormField
                                control={form.control}
                                name={`locations.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-gray-500 font-medium">
                                      Location
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. Pokhara"
                                        className="border-gray-300 focus-visible:ring-primary rounded-md h-9 text-sm"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormField
                                control={form.control}
                                name={`locations.${index}.days`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-gray-500 font-medium">
                                      Days
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="3"
                                        className="border-gray-300 focus-visible:ring-primary rounded-md h-9 text-sm"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mt-6 p-1.5 rounded-none text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LucideTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: "", days: "" })}
                      >
                        <LucidePlus className="w-4 h-4" />
                        Add Another Location
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Group ────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Your Group</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Help us tailor the itinerary to your group&apos;s
                      dynamics.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="groupType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Group Type *
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                          {GROUP_OPTIONS.map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => field.onChange(opt.value)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-sm font-medium ${
                                field.value === opt.value
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-gray-200 text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <span className="text-2xl">{opt.emoji}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfTravellers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Number of Travellers *
                        </FormLabel>
                        <Select
                          onValueChange={(v) =>
                            field.onChange(v as TravellerCount)
                          }
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full border-gray-300 focus:ring-primary rounded-md h-11">
                              <SelectValue placeholder="How many people?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAVELLER_COUNT_VALUES.map((n) => (
                              <SelectItem key={n} value={n}>
                                {n} {n === "1" ? "person" : "people"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 3: Preferences ─────────────────────────────────────── */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Preferences</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Customise every detail of your experience. You can select
                      multiple options where applicable.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="inclusions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm mb-3 block">
                          Pick Your Inclusions
                        </FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {INCLUSIONS.map((item) => {
                            const checked = field.value.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                                  checked
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() =>
                                    field.onChange(
                                      toggleArrayItem<InclusionId>(
                                        field.value,
                                        item.id,
                                      ),
                                    )
                                  }
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <span className="text-sm text-gray-700">
                                  {item.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accommodationPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <LucideBed className="w-4 h-4 text-primary" />
                          Stay / Accommodation Preferences *
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            (select all that apply)
                          </span>
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ACCOMMODATION.map((opt) => {
                            const checked = field.value.includes(opt.value);
                            return (
                              <button
                                type="button"
                                key={opt.value}
                                onClick={() =>
                                  field.onChange(
                                    toggleArrayItem<AccommodationValue>(
                                      field.value,
                                      opt.value,
                                    ),
                                  )
                                }
                                className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all ${
                                  checked
                                    ? "border-primary bg-primary/5 text-primary font-medium"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="foodPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <LucideUtensils className="w-4 h-4 text-primary" />
                          Food Preferences *
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            (select all that apply)
                          </span>
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {FOOD_PREFS.map((opt) => {
                            const checked = field.value.includes(opt.value);
                            return (
                              <button
                                type="button"
                                key={opt.value}
                                onClick={() =>
                                  field.onChange(
                                    toggleArrayItem<FoodPrefValue>(
                                      field.value,
                                      opt.value,
                                    ),
                                  )
                                }
                                className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all ${
                                  checked
                                    ? "border-primary bg-primary/5 text-primary font-medium"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherMentions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Other Mentions / Special Requests
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dietary restrictions, health conditions, birthday celebrations, special requirements…"
                            rows={4}
                            className="resize-none border-gray-300 focus-visible:ring-primary rounded-md"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* ── Step 4: Contact ──────────────────────────────────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Contact Details</h2>
                    <p className="text-sm text-gray-500 mb-6">
                      Almost done! We&apos;ll use this info to send you your
                      custom itinerary proposal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold text-sm">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              className="border-gray-300 focus-visible:ring-primary rounded-md h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold text-sm">
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              className="border-gray-300 focus-visible:ring-primary rounded-md h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm">
                          Phone (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+977 9800000000"
                            className="border-gray-300 focus-visible:ring-primary rounded-md h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Review summary */}
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2 text-sm">
                    <p className="font-semibold text-gray-800 mb-3">
                      Your Itinerary Summary
                    </p>

                    {/* Selected experience with image */}
                    {selectedCategory && (
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                        {selectedCategory.categoryImage && (
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-[4px]">
                            <Photo src={selectedCategory.categoryImage} alt="" sizes="56px" />
                          </span>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            Experience Type
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {selectedCategory.categoryName}
                          </p>
                        </div>
                      </div>
                    )}

                    {(
                      [
                        ["Duration", form.watch("duration")],
                        ["Start Date", form.watch("startDate")],
                        [
                          "Locations",
                          form.watch("letUsChooseLocations")
                            ? "Team will choose"
                            : form
                                .watch("locations")
                                .filter((l) => l.name)
                                .map((l) => l.name)
                                .join(", ") || undefined,
                        ],
                        ["Group Type", form.watch("groupType")],
                        ["Travellers", form.watch("numberOfTravellers")],
                        [
                          "Stay",
                          form
                            .watch("accommodationPreferences")
                            .map(accommodationLabel)
                            .join(", ") || undefined,
                        ],
                        [
                          "Food",
                          form
                            .watch("foodPreferences")
                            .map(foodLabel)
                            .join(", ") || undefined,
                        ],
                      ] as [string, string | undefined][]
                    )
                      .filter(([, v]) => Boolean(v))
                      .map(([label, value]) => (
                        <div key={label} className="flex gap-2 text-gray-600">
                          <span className="font-medium text-gray-700 w-28 shrink-0">
                            {label}:
                          </span>
                          <span className="capitalize">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPrev}
                  disabled={step === 0}
                  className="border-gray-300 text-gray-600 h-11 px-6 rounded-none"
                >
                  Back
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-11 rounded-none"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-11 rounded-none gap-2 transition-colors"
                  >
                    <LucideSend className="w-4 h-4" />
                    {isSubmitting ? "Sending…" : "Send My Request"}
                  </Button>
                )}
              </div>

              {submitError && (
                <div role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                  {siteConfig.phoneNumber ? ` You can also call us on ${siteConfig.phoneNumber}.` : ""}
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-3 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium mt-4">
                  <LucideCheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  Request sent! Our team will craft your custom itinerary within
                  24 hours.
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-10 lg:sticky lg:top-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Other Ways to Reach Us
            </h3>
            <div className="space-y-5">
              {(
                [
                  { icon: LucideMail, label: "Email", value: siteConfig.email },
                  {
                    icon: LucidePhone,
                    label: "Phone",
                    value: siteConfig.phoneNumber,
                  },
                  {
                    icon: LucideMapPin,
                    label: "Location",
                    value: siteConfig.fullAddress,
                  },
                ] as const
              ).map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <p className="text-sm font-bold text-gray-900">{label}</p>
                  </div>
                  <p className="text-sm text-gray-500 pl-6">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Why a Custom Itinerary?
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 leading-relaxed">
              {[
                "Crafted around your exact dates, pace, and fitness level.",
                "Choose your own locations or let our experts build the perfect route.",
                "Flexible inclusions — you decide what's in your package.",
                "No hidden costs; transparent pricing for every element.",
              ].map((point) => (
                <li key={point} className="flex gap-2">
                  <LucideCheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <LucideClock className="w-4 h-4 text-primary" />
              <h3 className="text-xl font-bold text-gray-900">
                Response Times
              </h3>
            </div>
            <div className="space-y-3 text-sm text-gray-500 leading-relaxed">
              <p>
                Custom itinerary proposals are delivered within 24–48 hours.
              </p>
              <p>For urgent planning, call us at {siteConfig.phoneNumber}.</p>
              <p>Available {siteConfig.openHours}.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
