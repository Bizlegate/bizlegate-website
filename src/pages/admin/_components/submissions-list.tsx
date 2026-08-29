import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Mail, Inbox } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import { INTEREST_OPTIONS } from "@/pages/inquire/_lib/interests.ts";

function interestLabel(value: string): string {
  return INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "PP");
  } catch {
    return iso;
  }
}

export default function SubmissionsList() {
  const submissions = useQuery(api.submissions.list, {});

  if (submissions === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>No inquiries yet</EmptyTitle>
          <EmptyDescription>
            New intake form submissions will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <div
          key={s._id}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-card-foreground">
                {s.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {s.title} · {s.organization}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(s._creationTime), "PPp")}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <a
              href={`mailto:${s.email}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <Mail className="size-4" />
              {s.email}
            </a>
            {s.linkedinUrl && (
              <a
                href={s.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LinkedIn
              </a>
            )}
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Travel: </span>
              {formatDate(s.arrivalDate)} → {formatDate(s.departureDate)}
              {s.dateFlexible && (
                <span className="text-muted-foreground"> (flexible)</span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground">Party size: </span>
              {s.partySize ?? "—"}
            </div>
          </div>

          {s.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {s.interests.map((i) => (
                <Badge key={i} variant="secondary">
                  {interestLabel(i)}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Objectives
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
              {s.objectives}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
