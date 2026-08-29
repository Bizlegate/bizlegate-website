import { useQuery } from "convex/react";
import { format } from "date-fns";
import { Mail, Sparkles } from "lucide-react";
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
import { QUIZ_RESULTS } from "@/pages/book/_lib/quiz-data.ts";

/** Admin view of leads captured by the /book page's "Office Politics
 * Self-Diagnostic" quiz — see convex/quiz.ts. */
export default function QuizLeadsList() {
  const leads = useQuery(api.quiz.list, {});

  if (leads === undefined) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No quiz leads yet</EmptyTitle>
          <EmptyDescription>
            Emails captured from the /book page's self-diagnostic quiz will
            appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead._id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <a
              href={`mailto:${lead.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Mail className="size-4" />
              {lead.email}
            </a>
            <Badge variant="secondary">
              {lead.resultType} —{" "}
              {QUIZ_RESULTS[lead.resultType]?.title ?? "Unknown"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(lead._creationTime), "PPp")}
          </span>
        </div>
      ))}
    </div>
  );
}
