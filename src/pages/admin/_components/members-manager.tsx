import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import { Trash2, UserPlus, Users, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";

type MemberRole = "admin" | "staff";

function roleLabel(role: MemberRole): string {
  return role === "admin" ? "Owner / Admin" : "Staff (inquiries only)";
}

export default function MembersManager() {
  const data = useQuery(api.users.listMembers, {});
  const invite = useMutation(api.users.inviteMember);
  const revoke = useMutation(api.users.revokeMember);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("staff");
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter an email address.");
      return;
    }
    setSubmitting(true);
    try {
      await invite({ email: trimmed, role });
      toast.success(`Invitation added for ${trimmed}.`);
      setEmail("");
      setRole("staff");
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Could not add the invitation.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (memberEmail: string | undefined) => {
    if (!memberEmail) return;
    try {
      await revoke({ email: memberEmail });
      toast.success(`Access removed for ${memberEmail}.`);
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Could not remove access.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Invite form */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
          <UserPlus className="size-5 text-primary" />
          Invite a team member
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Only people you invite here can access the backend. Anyone else who
          signs in is sent back to the public site.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:flex-1"
          />
          <Select
            value={role}
            onValueChange={(v) => setRole(v as MemberRole)}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff (inquiries only)</SelectItem>
              <SelectItem value="admin">Admin (full access)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={submitting}
            className="cursor-pointer"
          >
            Send invite
          </Button>
        </div>
      </div>

      {/* Members list */}
      {data === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <MemberSection
            title="Active members"
            icon={<Users className="size-4" />}
            emptyText="No active members yet."
            rows={data.activeMembers.map((m) => ({
              key: m._id,
              name: m.name,
              email: m.email,
              role: m.role,
              badge:
                m.role === "admin" ? (
                  <Badge className="gap-1">
                    <ShieldCheck className="size-3" />
                    {roleLabel(m.role)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{roleLabel(m.role)}</Badge>
                ),
              meta: `Joined ${format(new Date(m.createdAt), "PP")}`,
              canRemove: m.role !== "admin",
            }))}
            onRevoke={handleRevoke}
          />

          {data.pendingInvites.length > 0 && (
            <MemberSection
              title="Pending invitations"
              icon={<Clock className="size-4" />}
              emptyText=""
              rows={data.pendingInvites.map((m) => ({
                key: m._id,
                name: undefined,
                email: m.email,
                role: m.role,
                badge: (
                  <Badge variant="outline" className="text-muted-foreground">
                    {roleLabel(m.role)}
                  </Badge>
                ),
                meta: "Waiting for first sign-in",
                canRemove: true,
              }))}
              onRevoke={handleRevoke}
            />
          )}
        </div>
      )}
    </div>
  );
}

type MemberRow = {
  key: string;
  name: string | undefined;
  email: string | undefined;
  role: MemberRole;
  badge: React.ReactNode;
  meta: string;
  canRemove: boolean;
};

function MemberSection({
  title,
  icon,
  emptyText,
  rows,
  onRevoke,
}: {
  title: string;
  icon: React.ReactNode;
  emptyText: string;
  rows: MemberRow[];
  onRevoke: (email: string | undefined) => void;
}) {
  return (
    <div>
      <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h4>
      {rows.length === 0 ? (
        emptyText ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Nothing here yet</EmptyTitle>
              <EmptyDescription>{emptyText}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-card-foreground">
                  {row.name ?? row.email ?? "Unknown"}
                </p>
                {row.name && (
                  <p className="truncate text-sm text-muted-foreground">
                    {row.email}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {row.meta}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {row.badge}
                {row.canRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-destructive hover:text-destructive"
                    onClick={() => onRevoke(row.email)}
                    aria-label="Remove access"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
