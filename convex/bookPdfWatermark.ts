"use node";

// Per-buyer watermarked PDF download for the paid "keepsake PDF" add-on
// (see claude/16_payment_processor_decision.md, 2026-10-27 update). Split
// into its own file — rather than living in convex/bookAccess.ts alongside
// the other book-access queries/mutations — because this needs the "use
// node" runtime (pdf-lib, plus a plain fetch() of a large file) and an
// `action`, neither of which the rest of bookAccess.ts needs. A "use node"
// file in Convex may only contain actions (not queries/mutations), so the
// query/mutation helpers this action needs live in convex/bookPdfWatermarkData.ts
// instead and are called via ctx.runQuery/ctx.runMutation below.
//
// What this buys: a buyer who already paid for chapterAccess "full" can pay
// extra ($14.99, see PRODUCT_LABEL["book-pdf"] in bookAccess.ts) to download
// the actual manuscript PDF as a keepsake. Since a plain PDF has zero copy
// protection once it's on someone's disk, every page gets "Office Original
// · User: <their email>" stamped diagonally across the middle of every page
// before it's handed over — the "User:" label keeps the email from reading
// like a byline (i.e. it should never look like the buyer wrote the book) —
// a soft deterrent, not real DRM (same spirit as
// the /library reader's disabled right-click/print shortcuts): it can't
// stop someone determined, but a leaked copy is at least traceable back to
// exactly which buyer's email it came from. Deliberately a big stamp
// through the actual page content rather than a small line tucked at the
// bottom — a bottom-strip stamp can be cropped out of a page image in
// seconds, which would defeat the point entirely.

import { v, ConvexError } from "convex/values";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const BOOK_PDF_LANGUAGE = v.union(v.literal("en"), v.literal("zh"));

// Public: the buyer-facing download. Called from /library's "Download PDF"
// button (see library-reader.tsx) — re-verifies the grant fresh on every
// call via checkPdfGrant (in bookPdfWatermarkData.ts), same as every other
// gated read in bookAccess.ts, never trusting anything the client already
// has. Returns null (not an error) when the admin hasn't uploaded that
// language's master file yet, so the frontend can show "coming soon"
// instead of a broken download.
export const getWatermarkedBookPdf = action({
  args: {
    email: v.string(),
    code: v.string(),
    language: BOOK_PDF_LANGUAGE,
  },
  handler: async (ctx, args): Promise<{ url: string } | null> => {
    const grant = await ctx.runQuery(
      internal.bookPdfWatermarkData.checkPdfGrant,
      args,
    );
    if (!grant.ok) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Your access does not include the PDF download.",
      });
    }
    if (!grant.masterUrl) {
      return null;
    }

    const cached = await ctx.runQuery(
      internal.bookPdfWatermarkData.getCachedWatermarkedCopy,
      { email: grant.email, language: args.language },
    );
    if (cached) {
      return { url: cached };
    }

    const res = await fetch(grant.masterUrl);
    if (!res.ok) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Could not load the source PDF.",
      });
    }
    const sourceBytes = await res.arrayBuffer();

    const pdfDoc = await PDFDocument.load(sourceBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    // "User: <email>" rather than a bare email sitting next to the brand
    // name — a bare email next to "Office Original" could read as if the
    // buyer were the author/creator of the book; labeling it "User:" makes
    // clear the email is the reader this copy was issued to, not a byline.
    const stampText = `Office Original · User: ${grant.email}`;

    // A big diagonal stamp across the middle of the page, not a small line
    // tucked at the bottom — a bottom-strip stamp can just be cropped out of
    // a page image in ten seconds, which would defeat the whole point. This
    // one runs corner-to-corner through the actual content, so removing it
    // means retouching every single page by hand, not one quick crop.
    const ROTATION_DEGREES = 40;
    const rotationRad = (ROTATION_DEGREES * Math.PI) / 180;

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();
      const diagonal = Math.sqrt(width * width + height * height);
      // Size the text so it spans a large share of the page's diagonal —
      // long emails get a smaller stamp than short ones, but every page
      // reads as "clearly, deliberately watermarked" either way.
      const targetWidth = diagonal * 0.62;
      const unitWidth = font.widthOfTextAtSize(stampText, 1);
      const fontSize = Math.min(54, targetWidth / unitWidth);
      const textWidth = unitWidth * fontSize;

      // drawText's (x, y) is the start of the baseline, then the text
      // extends along the rotation direction from there — so to center the
      // rotated text on the page, walk back half the text's length along
      // that same direction from the page's center point.
      const centerX = width / 2;
      const centerY = height / 2;
      const x = centerX - (textWidth / 2) * Math.cos(rotationRad);
      const y = centerY - (textWidth / 2) * Math.sin(rotationRad);

      page.drawText(stampText, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.16,
        rotate: degrees(ROTATION_DEGREES),
      });
    }

    const watermarkedBytes = await pdfDoc.save();
    // pdf-lib's save() is typed as Uint8Array<ArrayBufferLike> (it could in
    // theory be backed by a SharedArrayBuffer), while Blob's constructor
    // wants an ArrayBufferView<ArrayBuffer> specifically — a TypeScript
    // typing mismatch, not a real runtime concern here (pdf-lib always
    // hands back a plain ArrayBuffer-backed array), so a double cast is the
    // standard way around it.
    const storageId = await ctx.storage.store(
      new Blob([watermarkedBytes as unknown as BlobPart], {
        type: "application/pdf",
      }),
    );
    const url = await ctx.storage.getUrl(storageId);
    if (!url) {
      throw new ConvexError({
        code: "INTERNAL",
        message: "Could not store the watermarked file.",
      });
    }

    await ctx.runMutation(internal.bookPdfWatermarkData.saveWatermarkedCopy, {
      email: grant.email,
      language: args.language,
      storageId,
      url,
    });

    return { url };
  },
});
