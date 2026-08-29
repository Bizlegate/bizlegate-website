import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api.js";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { useContentGetter, useEffectiveLang } from "@/hooks/use-content.ts";
import { uiText } from "@/lib/ui-strings.ts";
import { INTEREST_OPTIONS } from "../_lib/interests.ts";
import { INQUIRE_FORM, INQUIRE_SUCCESS } from "../_lib/inquire-data.ts";

function buildFormSchema(lang: "en" | "zh") {
  const m = (key: string) => uiText("form", key, lang);
  return z
    .object({
      fullName: z.string().min(1, m("nameRequired")),
      organization: z.string().min(1, m("organizationRequired")),
      title: z.string().min(1, m("titleRequired")),
      email: z.string().email(m("emailInvalid")),
      linkedinUrl: z
        .string()
        .url(m("urlInvalid"))
        .optional()
        .or(z.literal("")),
      arrivalDate: z.date().optional(),
      departureDate: z.date().optional(),
      dateFlexible: z.boolean(),
      partySize: z
        .string()
        .optional()
        .refine(
          (v) => !v || (/^\d+$/.test(v) && Number(v) > 0 && Number(v) <= 100),
          m("partySizeInvalid"),
        ),
      interests: z.array(z.string()),
      objectives: z.string().min(1, m("objectivesRequired")),
      privacyAck: z.boolean().refine((v) => v === true, m("privacyRequired")),
    })
    .refine(
      (data) =>
        !data.arrivalDate ||
        !data.departureDate ||
        data.departureDate >= data.arrivalDate,
      { message: m("departureAfterArrival"), path: ["departureDate"] },
    );
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

function DatePickerField({
  value,
  onChange,
  placeholder,
  lang,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder: string;
  lang: "en" | "zh";
}) {
  const [open, setOpen] = useState(false);
  const locale = lang === "zh" ? zhTW : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "PPP", { locale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          locale={locale}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          disabled={(date) =>
            date < new Date(new Date().setHours(0, 0, 0, 0))
          }
        />
      </PopoverContent>
    </Popover>
  );
}

export default function InquireForm() {
  const submit = useMutation(api.submissions.submit);
  const [submitted, setSubmitted] = useState(false);
  const t = useContentGetter();
  const lang = useEffectiveLang();
  const formSchema = useMemo(() => buildFormSchema(lang), [lang]);
  const submittingLabel = uiText("form", "submitting", lang);
  const genericErrorLabel = uiText("form", "genericError", lang);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      organization: "",
      title: "",
      email: "",
      linkedinUrl: "",
      dateFlexible: false,
      partySize: "",
      interests: [],
      objectives: "",
      privacyAck: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submit({
        fullName: values.fullName,
        organization: values.organization,
        title: values.title,
        email: values.email,
        linkedinUrl: values.linkedinUrl ? values.linkedinUrl : undefined,
        arrivalDate: values.arrivalDate
          ? values.arrivalDate.toISOString()
          : undefined,
        departureDate: values.departureDate
          ? values.departureDate.toISOString()
          : undefined,
        dateFlexible: values.dateFlexible,
        partySize: values.partySize ? Number(values.partySize) : undefined,
        interests: values.interests,
        objectives: values.objectives,
      });
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : genericErrorLabel;
      toast.error(message);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground">
          {t(INQUIRE_SUCCESS.title.key, INQUIRE_SUCCESS.title.text)}
        </h3>
        <p className="mt-3 text-muted-foreground">
          {t(INQUIRE_SUCCESS.body.key, INQUIRE_SUCCESS.body.text)}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-9">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(INQUIRE_FORM.fullName.labelKey, INQUIRE_FORM.fullName.label)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        INQUIRE_FORM.fullName.placeholderKey,
                        INQUIRE_FORM.fullName.placeholder,
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      INQUIRE_FORM.organization.labelKey,
                      INQUIRE_FORM.organization.label,
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        INQUIRE_FORM.organization.placeholderKey,
                        INQUIRE_FORM.organization.placeholder,
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(INQUIRE_FORM.title.labelKey, INQUIRE_FORM.title.label)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        INQUIRE_FORM.title.placeholderKey,
                        INQUIRE_FORM.title.placeholder,
                      )}
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
                  <FormLabel>
                    {t(INQUIRE_FORM.email.labelKey, INQUIRE_FORM.email.label)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t(
                        INQUIRE_FORM.email.placeholderKey,
                        INQUIRE_FORM.email.placeholder,
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      INQUIRE_FORM.email.descriptionKey,
                      INQUIRE_FORM.email.description,
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(INQUIRE_FORM.linkedin.labelKey, INQUIRE_FORM.linkedin.label)}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      INQUIRE_FORM.linkedin.placeholderKey,
                      INQUIRE_FORM.linkedin.placeholder,
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="arrivalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t(INQUIRE_FORM.arrival.labelKey, INQUIRE_FORM.arrival.label)}
                  </FormLabel>
                  <DatePickerField
                    value={field.value}
                    onChange={field.onChange}
                    lang={lang}
                    placeholder={t(
                      INQUIRE_FORM.datePlaceholder.key,
                      INQUIRE_FORM.datePlaceholder.text,
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    {t(
                      INQUIRE_FORM.departure.labelKey,
                      INQUIRE_FORM.departure.label,
                    )}
                  </FormLabel>
                  <DatePickerField
                    value={field.value}
                    onChange={field.onChange}
                    lang={lang}
                    placeholder={t(
                      INQUIRE_FORM.datePlaceholder.key,
                      INQUIRE_FORM.datePlaceholder.text,
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dateFlexible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer font-normal">
                    {t(INQUIRE_FORM.flexible.labelKey, INQUIRE_FORM.flexible.label)}
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="partySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t(
                      INQUIRE_FORM.partySize.labelKey,
                      INQUIRE_FORM.partySize.label,
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder={t(
                        INQUIRE_FORM.partySize.placeholderKey,
                        INQUIRE_FORM.partySize.placeholder,
                      )}
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
            name="interests"
            render={() => (
              <FormItem>
                <FormLabel>
                  {t(
                    INQUIRE_FORM.interests.labelKey,
                    INQUIRE_FORM.interests.label,
                  )}
                </FormLabel>
                <FormDescription>
                  {t(
                    INQUIRE_FORM.interests.descriptionKey,
                    INQUIRE_FORM.interests.description,
                  )}
                </FormDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((option) => {
                    const selected = form
                      .watch("interests")
                      .includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          const current = form.getValues("interests");
                          form.setValue(
                            "interests",
                            selected
                              ? current.filter((v) => v !== option.value)
                              : [...current, option.value],
                            { shouldValidate: true },
                          );
                        }}
                        className={cn(
                          "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                        )}
                      >
                        {t(option.labelKey, option.label)}
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
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t(
                    INQUIRE_FORM.objectives.labelKey,
                    INQUIRE_FORM.objectives.label,
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder={t(
                      INQUIRE_FORM.objectives.placeholderKey,
                      INQUIRE_FORM.objectives.placeholder,
                    )}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <FormField
              control={form.control}
              name="privacyAck"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(c) => field.onChange(c === true)}
                        className="mt-0.5"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground">
                      {t(INQUIRE_FORM.privacy.key, INQUIRE_FORM.privacy.text)}
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              t(INQUIRE_FORM.submit.key, INQUIRE_FORM.submit.text)
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
