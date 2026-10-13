"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  LucideCheck,
  LucideUser,
  LucideHeart,
  LucideHome,
  LucideSmile,
  type LucideIcon,
} from "lucide-react";

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

import Photo from "@/components/site/photo";
import { SpamTrap, useSpamCheck } from "@/components/site/spam-trap";
import { sendErrorMessage } from "@/components/site/enquiry-form";

// ── Types ─────────────────────────────────────────────────────────────────────

type TripCategory = { id: string; categoryHandle: string; categoryName: string; categoryImage?: string | null };

export type SiteContact = { email: string; phoneNumber: string; fullAddress: string; openHours: string };

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

const GROUP_OPTIONS: { value: GroupType; label: string; icon: LucideIcon }[] = [
  { value: "solo", label: "Solo", icon: LucideUser },
  { value: "couple", label: "Couple", icon: LucideHeart },
  { value: "family", label: "Family", icon: LucideHome },
  { value: "friends", label: "Friends", icon: LucideSmile },
];

const locationSchema = z.object({
  name: z.string().optional(),
  days: z.string().optional(),
});

const itineraryFormSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.email("Invalid email address"),
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
    inclusions: z.array(z.enum(INCLUSION_IDS)),
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
            code: "custom",
            message: "Location name is required",
            path: ["locations", index, "name"],
          });
        }
        const dayNum = Number(location.days);
        if (!location.days || isNaN(dayNum) || dayNum <= 0) {
          ctx.addIssue({
            code: "custom",
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

// ── Main form component ───────────────────────────────────────────────────────

export default function ItineraryForm({ categories, contact: siteConfig }: { categories: TripCategory[]; contact: SiteContact }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | false>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const looksAutomated = useSpamCheck();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedStep = useRef(false);
  const [step, setStep] = useState(0);

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

  const values = useWatch({ control: form.control });
  const letUsChoose = values.letUsChooseLocations;
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
    } catch {
      setSubmitError("Something went wrong sending your request. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step navigation ─────────────────────────────────────────────────────────

  // After Back/Continue, move focus to the new step's heading so keyboard and
  // screen-reader users land at the top of the step instead of on a vanished button.
  useEffect(() => {
    if (!movedStep.current) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [step]);

  const goNext = async () => {
    const valid = await form.trigger(
      STEP_FIELDS[step] as (keyof ItineraryFormValues)[],
    );
    if (!valid) return;
    movedStep.current = true;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    movedStep.current = true;
    setStep((s) => Math.max(s - 1, 0));
  };

  // Selected category object for the summary
  const selectedCategory = categories.find(
    (c) => c.categoryName === values.experienceType,
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Body */}
      <section className="wrap grid grid-cols-1 items-start gap-x-24 gap-y-14 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-20">
        {/* Form — 2 cols */}
        <div className="min-w-0">
          {/* Step indicator */}
          <nav aria-label="Form progress" className="mb-12">
            <ol className="flex border-t border-line">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                return (
                  <li key={s.label} className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => { movedStep.current = true; setStep(i); }}
                      disabled={!isDone}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Step ${i + 1} of ${STEPS.length}: ${s.label}${isDone ? " (completed)" : ""}`}
                      className={`-mt-px flex w-full flex-col items-start gap-2 border-t-2 pt-3 text-left transition-colors disabled:cursor-default ${
                        isActive ? "border-ink text-ink" : isDone ? "border-highland-deep text-highland-deep hover:text-ink" : "border-transparent text-ink-muted"
                      }`}
                    >
                      {isDone ? <LucideCheck className="size-4" strokeWidth={2.2} aria-hidden /> : <Icon className="size-4" strokeWidth={1.6} aria-hidden />}
                      <span className="meta text-[11px] max-sm:sr-only">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className="meta mt-4 text-[11px] text-ink-muted sm:hidden" aria-hidden>
              Step {step + 1} of {STEPS.length} · <span className="text-ink">{STEPS[step].label}</span>
            </p>
          </nav>

          <Form {...form}>
            <form ref={formRef} onSubmit={(e) => form.handleSubmit(onSubmit)(e)} className="relative">
              <SpamTrap />
              {/* ── Step 0: Trip Basics ─────────────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <h2 ref={headingRef} tabIndex={-1} className="h-sub mb-3 outline-none">Trip Basics</h2>
                    <p className="text-sm text-ink-muted mb-6">
                      Let&apos;s start with the fundamentals of your adventure.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-ink">
                          Total Duration *
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(v as Duration)}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-11">
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
                        <FormLabel className="text-sm font-medium text-ink">
                          Experience / Trek Type *
                        </FormLabel>

                        {categories.length > 0 ? (
                          <div role="group" aria-label="Experience type" className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {categories.map((cat) => (
                              <ExperienceTypeCard
                                key={cat.id}
                                category={cat}
                                selected={field.value === cat.categoryName}
                                onClick={() => field.onChange(cat.categoryName)}
                              />
                            ))}
                          </div>
                        ) : (
                          // No categories from the API: fall back to free text so the step isn't a dead end.
                          <FormControl>
                            <Input placeholder="e.g. Everest region trek, cultural tour" className="h-11" {...field} />
                          </FormControl>
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
                        <FormLabel className="text-sm font-medium text-ink">
                          Preferred Start Date *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            min={today}
                            className="h-11"
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
                    <h2 ref={headingRef} tabIndex={-1} className="h-sub mb-3 outline-none">Locations</h2>
                    <p className="text-sm text-ink-muted mb-6">
                      Add your desired destinations with planned days at each,
                      or let our experts curate the perfect route.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="letUsChooseLocations"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 border border-line bg-card p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) form.clearErrors("locations");
                            }}
                            className="mt-0.5 data-[state=checked]:border-highland-deep data-[state=checked]:bg-highland-deep"
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="text-sm font-medium text-ink cursor-pointer">
                            Let us choose the best locations for you
                          </FormLabel>
                          <p className="text-xs text-ink-muted mt-0.5">
                            Our expert team will design the optimal route based
                            on your duration and experience type.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!letUsChoose && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-ink">
                        Your Locations
                      </p>

                      {fields.map((fieldItem, index) => (
                        <div
                          key={fieldItem.id}
                          className="flex items-start gap-3 p-4 border border-line bg-card"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <FormField
                                control={form.control}
                                name={`locations.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-ink-muted font-medium">
                                      Location
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. Pokhara"
                                        className="h-9 text-sm"
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
                                    <FormLabel className="text-xs text-ink-muted font-medium">
                                      Days
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="3"
                                        className="h-9 text-sm"
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
                              aria-label={`Remove location ${index + 1}`}
                              className="mt-5 flex size-11 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-destructive"
                            >
                              <LucideTrash2 className="size-4" aria-hidden />
                            </button>
                          )}
                        </div>
                      ))}

                      <button type="button" onClick={() => append({ name: "", days: "" })} className="btn-mono inline-flex min-h-11 items-center gap-2 hover:bg-ink hover:text-paper">
                        <LucidePlus className="size-4" aria-hidden />
                        Add another location
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Group ────────────────────────────────────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 ref={headingRef} tabIndex={-1} className="h-sub mb-3 outline-none">Your Group</h2>
                    <p className="text-sm text-ink-muted mb-6">
                      Help us tailor the itinerary to your group&apos;s
                      dynamics.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="groupType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-ink">
                          Group Type *
                        </FormLabel>
                        <div role="group" aria-label="Group type" className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {GROUP_OPTIONS.map((opt) => (
                            <button
                              type="button"
                              key={opt.value}
                              onClick={() => field.onChange(opt.value)}
                              aria-pressed={field.value === opt.value}
                              className="flex min-h-11 flex-col items-center gap-2 border border-line bg-card p-4 text-sm font-medium text-ink-soft transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                            >
                              <opt.icon className="size-5" strokeWidth={1.6} aria-hidden />
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
                        <FormLabel className="text-sm font-medium text-ink">
                          Number of Travellers *
                        </FormLabel>
                        <Select
                          onValueChange={(v) =>
                            field.onChange(v as TravellerCount)
                          }
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-11">
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
                    <h2 ref={headingRef} tabIndex={-1} className="h-sub mb-3 outline-none">Preferences</h2>
                    <p className="text-sm text-ink-muted mb-6">
                      Customise every detail of your experience. You can select
                      multiple options where applicable.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="inclusions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-ink mb-3 block">
                          Pick Your Inclusions
                        </FormLabel>
                        <div role="group" aria-label="Inclusions" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {INCLUSIONS.map((item) => {
                            const checked = field.value.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`flex min-h-11 cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                                  checked ? "border-ink bg-card" : "border-line bg-card/60 hover:border-ink"
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
                                  className="data-[state=checked]:border-highland-deep data-[state=checked]:bg-highland-deep"
                                />
                                <span className="text-sm text-ink-soft">
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
                        <FormLabel className="text-sm font-medium text-ink flex items-center gap-2 mb-2">
                          <LucideBed className="w-4 h-4 text-highland-deep" />
                          Stay / Accommodation Preferences *
                          <span className="text-xs font-normal text-ink-muted ml-1">
                            (select all that apply)
                          </span>
                        </FormLabel>
                        <div role="group" aria-label="Accommodation preferences" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                                aria-pressed={checked}
                                className="chip whitespace-normal bg-card text-left text-ink-soft hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
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
                        <FormLabel className="text-sm font-medium text-ink flex items-center gap-2 mb-2">
                          <LucideUtensils className="w-4 h-4 text-highland-deep" />
                          Food Preferences *
                          <span className="text-xs font-normal text-ink-muted ml-1">
                            (select all that apply)
                          </span>
                        </FormLabel>
                        <div role="group" aria-label="Food preferences" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                                aria-pressed={checked}
                                className="chip whitespace-normal bg-card text-left text-ink-soft hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
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
                        <FormLabel className="text-sm font-medium text-ink">
                          Other Mentions / Special Requests
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dietary restrictions, health conditions, birthday celebrations, special requirements…"
                            rows={4}
                            className="resize-none"
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
                    <h2 ref={headingRef} tabIndex={-1} className="h-sub mb-3 outline-none">Contact Details</h2>
                    <p className="text-sm text-ink-muted mb-6">
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
                          <FormLabel className="text-sm font-medium text-ink">
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              autoComplete="name"
                              className="h-11"
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
                          <FormLabel className="text-sm font-medium text-ink">
                            Email *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              autoComplete="email"
                              className="h-11"
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
                        <FormLabel className="text-sm font-medium text-ink">
                          Phone (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+977 9800000000"
                            autoComplete="tel"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Review summary */}
                  <div className="border border-line bg-card p-4 space-y-2 text-sm">
                    <p className="font-medium text-ink mb-3">
                      Your Itinerary Summary
                    </p>

                    {/* Selected experience with image */}
                    {selectedCategory && (
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-line">
                        {selectedCategory.categoryImage && (
                          <span className="relative size-14 shrink-0 overflow-hidden rounded-[4px]">
                            <Photo src={selectedCategory.categoryImage} alt="" sizes="56px" />
                          </span>
                        )}
                        <div>
                          <p className="text-xs text-ink-muted font-medium">
                            Experience Type
                          </p>
                          <p className="text-sm font-medium text-ink">
                            {selectedCategory.categoryName}
                          </p>
                        </div>
                      </div>
                    )}

                    {(
                      [
                        ["Duration", values.duration],
                        ["Start Date", values.startDate],
                        [
                          "Locations",
                          values.letUsChooseLocations
                            ? "Team will choose"
                            : (values.locations ?? []).filter((l) => l?.name)
                                .map((l) => l?.name)
                                .join(", ") || undefined,
                        ],
                        ["Group Type", values.groupType],
                        ["Travellers", values.numberOfTravellers],
                        [
                          "Stay",
                          (values.accommodationPreferences ?? []).map(accommodationLabel)
                            .join(", ") || undefined,
                        ],
                        [
                          "Food",
                          (values.foodPreferences ?? []).map(foodLabel)
                            .join(", ") || undefined,
                        ],
                      ] as [string, string | undefined][]
                    )
                      .filter(([, v]) => Boolean(v))
                      .map(([label, value]) => (
                        <div key={label} className="flex gap-2 text-ink-soft">
                          <span className="font-medium text-ink-soft w-28 shrink-0">
                            {label}:
                          </span>
                          <span className="capitalize">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-line-soft">
                <button type="button" onClick={goPrev} disabled={step === 0} className="btn-outline disabled:invisible">
                  Back
                </button>

                {/* Keyed so React never morphs Continue into Submit mid-click. */}
                {step < STEPS.length - 1 ? (
                  <button key="next" type="button" onClick={goNext} className="btn-primary">
                    Continue
                  </button>
                ) : (
                  <button key="submit" type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="btn-primary disabled:opacity-60">
                    <LucideSend className="size-4" aria-hidden />
                    {isSubmitting ? "Sending…" : "Send My Request"}
                  </button>
                )}
              </div>

              {submitError && (
                <div role="alert" className="mt-4 border border-destructive bg-rose-tint px-4 py-3 text-sm text-ink">
                  {submitError}
                  {siteConfig.phoneNumber ? ` You can also call us on ${siteConfig.phoneNumber}.` : ""}
                </div>
              )}

              {submitSuccess && (
                <div role="status" className="mt-4 flex items-center gap-3 border border-highland-deep bg-highland-tint px-4 py-3 text-sm font-medium text-ink">
                  <LucideCheckCircle2 className="size-4 shrink-0 text-highland-deep" aria-hidden />
                  Request sent! Our team will craft your custom itinerary within
                  24 hours.
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-10 border-t border-line pt-10 lg:sticky lg:top-28 lg:border-0 lg:pt-0">
          <div>
            <h2 className="display mb-6 text-[17px]">
              Other Ways to Reach Us
            </h2>
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
              ).filter(({ value }) => value).map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-highland-deep" />
                    <p className="text-sm font-medium text-ink">{label}</p>
                  </div>
                  <p className="text-sm text-ink-muted pl-6">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line-soft" />

          <div>
            <h2 className="display mb-4 text-[17px]">
              Why a Custom Itinerary?
            </h2>
            <ul className="space-y-3 text-sm text-ink-muted leading-relaxed">
              {[
                "Crafted around your exact dates, pace, and fitness level.",
                "Choose your own locations or let our experts build the perfect route.",
                "Flexible inclusions — you decide what's in your package.",
                "No hidden costs; transparent pricing for every element.",
              ].map((point) => (
                <li key={point} className="flex gap-2">
                  <LucideCheckCircle2 className="w-4 h-4 text-highland-deep shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line-soft" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <LucideClock className="w-4 h-4 text-highland-deep" />
              <h2 className="display text-[17px]">
                Response Times
              </h2>
            </div>
            <div className="space-y-3 text-sm text-ink-muted leading-relaxed">
              <p>
                Custom itinerary proposals are delivered within 24–48 hours.
              </p>
              {siteConfig.phoneNumber && <p>For urgent planning, call us at {siteConfig.phoneNumber}.</p>}
              {siteConfig.openHours && <p>Available {siteConfig.openHours}.</p>}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
