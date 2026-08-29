import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireInquiryAccess } from "./authz";

const RESULT_TYPE = v.union(
  v.literal("A"),
  v.literal("B"),
  v.literal("C"),
  v.literal("D"),
);

// Very forgiving email shape check — real validation (bounce handling etc.)
// happens downstream when the address is actually used, this just blocks
// obvious junk.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: submit the /book page's "Office Politics Self-Diagnostic" quiz.
// Saves the lead and emails the owner (best-effort). The email address is
// the price of admission for seeing the result — see book-quiz-dialog.tsx.
export const submit = mutation({
  args: {
    email: v.string(),
    resultType: RESULT_TYPE,
    answers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim();
    if (!EMAIL_RE.test(email)) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please enter a valid email address.",
      });
    }
    if (args.answers.length === 0) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Please answer the quiz before submitting.",
      });
    }

    const id = await ctx.db.insert("quizLeads", {
      email,
      resultType: args.resultType,
      answers: args.answers,
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendQuizLeadNotification, {
      email,
      resultType: args.resultType,
      answers: args.answers,
    });

    return id;
  },
});

// Admin & staff: list all quiz leads, newest first.
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireInquiryAccess(ctx);
    return await ctx.db.query("quizLeads").order("desc").collect();
  },
});
