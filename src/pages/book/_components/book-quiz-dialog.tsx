import { useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { api } from "@/convex/_generated/api.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import {
  QUIZ_QUESTIONS,
  QUIZ_RESULTS,
  computeQuizResult,
  type QuizLetter,
} from "../_lib/quiz-data.ts";
import { markBuyClicked } from "../_lib/use-exit-intent.ts";
import { closeBookQuiz, useBookQuizOpen } from "../_lib/use-quiz-dialog.ts";
import { useBookPrice } from "../_lib/use-book-price.ts";
import { PriceTag } from "./price-tag.tsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = number | "email" | "result";

/**
 * The single shared instance of the "Office Politics Self-Diagnostic" quiz
 * — 5 questions, an email gate, then a result unlocking the matching
 * diagnosis and chapters. Opened via the shared store in use-quiz-dialog.ts
 * from either the exit-intent "leave attempt" trigger or the mid-page
 * "Take the Free Diagnostic" button, so there's only ever one instance of
 * this UI mounted on the page.
 */
export default function BookQuizDialog() {
  const open = useBookQuizOpen();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<(QuizLetter | undefined)[]>(
    Array(QUIZ_QUESTIONS.length).fill(undefined),
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizLetter | null>(null);

  const submitQuiz = useMutation(api.quiz.submit);
  const { regularPrice, salePrice, onSale } = useBookPrice();

  function selectAnswer(questionIndex: number, letter: QuizLetter) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = letter;
      return next;
    });
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setStep(questionIndex + 1);
    } else {
      setStep("email");
    }
  }

  async function handleEmailSubmit() {
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
    setSubmitting(true);
    try {
      const finalAnswers = answers.filter(
        (letter): letter is QuizLetter => letter !== undefined,
      );
      const resultType = computeQuizResult(finalAnswers);
      await submitQuiz({
        email: trimmed,
        resultType,
        answers: finalAnswers,
      });
      setResult(resultType);
      setStep("result");
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? (error.data as { message: string }).message
          : "Something went wrong — please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) closeBookQuiz();
  }

  function handleBuyFromResult() {
    markBuyClicked();
    closeBookQuiz();
    toast.info("Checkout is coming soon — thanks for your patience.");
  }

  const questionIndex = typeof step === "number" ? step : null;
  const question =
    questionIndex !== null ? QUIZ_QUESTIONS[questionIndex] : null;
  const progressValue =
    questionIndex !== null
      ? ((questionIndex + 1) / QUIZ_QUESTIONS.length) * 100
      : 100;
  const resultData = result ? QUIZ_RESULTS[result] : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {question && questionIndex !== null && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Not sure this book is for you?
              </DialogTitle>
              <DialogDescription>
                Take the free 2-minute Office Politics Self-Diagnostic — it
                will tell you exactly which chapters matter most for your
                situation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Progress value={progressValue} className="h-1.5" />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {questionIndex + 1} / {QUIZ_QUESTIONS.length}
                </span>
              </div>
              <p className="font-medium text-foreground">{question.prompt}</p>
              <div className="grid gap-2">
                {question.options.map((option) => (
                  <button
                    key={option.letter}
                    type="button"
                    onClick={() => selectAnswer(questionIndex, option.letter)}
                    className="cursor-pointer rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
              {questionIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setStep(questionIndex - 1)}
                >
                  <ArrowLeft className="mr-1 size-4" />
                  Back
                </Button>
              )}
            </div>
          </>
        )}

        {step === "email" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Almost there.
              </DialogTitle>
              <DialogDescription>
                Enter your email to unlock your result and the chapters that
                match your situation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEmailSubmit();
                  }}
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer"
                onClick={() => setStep(QUIZ_QUESTIONS.length - 1)}
              >
                <ArrowLeft className="mr-1 size-4" />
                Back
              </Button>
            </div>
            <DialogFooter>
              <Button
                className="w-full cursor-pointer sm:w-auto"
                onClick={handleEmailSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Unlocking your result…
                  </>
                ) : (
                  "See My Result"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "result" && resultData && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Your type: {resultData.title}
              </DialogTitle>
              <DialogDescription>{resultData.diagnosis}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Chapters for you
              </p>
              <ul className="space-y-1.5 text-sm text-foreground/90">
                {resultData.chapters.map((chapter) => (
                  <li key={chapter}>&ldquo;{chapter}&rdquo;</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                Be the Outsmarter has real tactics for exactly this — not
                reassurance, moves you can actually use.
              </p>
            </div>
            <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <PriceTag
                regularPrice={regularPrice}
                salePrice={salePrice}
                onSale={onSale}
                size="md"
              />
              <Button
                className="w-full cursor-pointer sm:w-auto"
                onClick={handleBuyFromResult}
              >
                Get the Book
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
