import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireInquiryAccess } from "./authz";

// Public: submit an intake inquiry. Saves the submission and emails the owner.
export const submit = mutation({
  args: {
    fullName: v.string(),
    organization: v.string(),
    title: v.string(),
    email: v.string(),
    linkedinUrl: v.optional(v.string()),
    arrivalDate: v.optional(v.string()),
    departureDate: v.optional(v.string()),
    dateFlexible: v.optional(v.boolean()),
    partySize: v.optional(v.number()),
    interests: v.array(v.string()),
    objectives: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic server-side validation of required fields.
    if (
      args.fullName.trim() === "" ||
      args.organization.trim() === "" ||
      args.title.trim() === "" ||
      args.email.trim() === "" ||
      args.objectives.trim() === ""
    ) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please complete all required fields.",
      });
    }

    const id = await ctx.db.insert("formSubmissions", {
      fullName: args.fullName.trim(),
      organization: args.organization.trim(),
      title: args.title.trim(),
      email: args.email.trim(),
      linkedinUrl: args.linkedinUrl?.trim() || undefined,
      arrivalDate: args.arrivalDate,
      departureDate: args.departureDate,
      dateFlexible: args.dateFlexible,
      partySize: args.partySize,
      interests: args.interests,
      objectives: args.objectives.trim(),
    });

    // Notify the owner by email (best-effort, runs asynchronously).
    await ctx.scheduler.runAfter(0, internal.emails.sendInquiryNotification, {
      fullName: args.fullName.trim(),
      organization: args.organization.trim(),
      title: args.title.trim(),
      email: args.email.trim(),
      linkedinUrl: args.linkedinUrl?.trim() || undefined,
      arrivalDate: args.arrivalDate,
      departureDate: args.departureDate,
      dateFlexible: args.dateFlexible,
      partySize: args.partySize,
      interests: args.interests,
      objectives: args.objectives.trim(),
    });

    return id;
  },
});

// Admin & staff: list all submissions, newest first.
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireInquiryAccess(ctx);
    return await ctx.db.query("formSubmissions").order("desc").collect();
  },
});
