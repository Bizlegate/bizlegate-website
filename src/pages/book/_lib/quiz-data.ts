/**
 * The "Office Politics Self-Diagnostic" — a 5-question quiz used as a
 * lead magnet on the /book page (see book-quiz-dialog.tsx). Content
 * translated from the confirmed quiz spec (project doc
 * office_politics_quiz.xlsx) and, for the "matching chapters" on each
 * result, mapped to real confirmed chapter titles from 03_chapters_en.md
 * rather than re-inventing chapter names — a couple of the original
 * Chinese chapter references (e.g. "辨識你的倦怠訊號") aren't written yet,
 * so those were swapped for the closest already-confirmed chapter instead
 * of pointing at something that doesn't exist in the book.
 *
 * Scoring (per spec): every answer is already lettered A/B/C/D, one
 * letter per diagnostic type — whichever letter was picked most often
 * across the 5 questions is the result; a tie is broken by the letter
 * picked on the last question. See computeQuizResult() in
 * book-quiz-dialog.tsx.
 */

export type QuizLetter = "A" | "B" | "C" | "D";

export type QuizOption = {
  letter: QuizLetter;
  text: string;
};

export type QuizQuestion = {
  key: string;
  prompt: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: "q1",
    prompt:
      "You pitch a new idea in a meeting. The next day, a coworker has already repackaged it as their own and pitched it straight to your boss. Your first instinct is usually to —",
    options: [
      {
        letter: "A",
        text: "You have a hunch who's behind it, but no proof — so you watch and wait.",
      },
      {
        letter: "B",
        text: "Pretend you didn't notice — maybe you're misreading the situation.",
      },
      {
        letter: "C",
        text: "Not deal with it right now — you already have too much on your plate.",
      },
      {
        letter: "D",
        text: "Immediately start calculating what this does to how your boss sees you.",
      },
    ],
  },
  {
    key: "q2",
    prompt:
      "You catch wind that your own team has been quietly speculating whether you're about to get replaced. The moment you find out, you —",
    options: [
      {
        letter: "A",
        text: "Decide not to push it — you're afraid of making things worse.",
      },
      {
        letter: "B",
        text: "Realize you have no idea how long this rumor has actually been going around.",
      },
      {
        letter: "C",
        text: "Don't have the energy to deal with it — you just hope they'll calm down on their own.",
      },
      {
        letter: "D",
        text: "Start to feel anxious that your position really might not be safe.",
      },
    ],
  },
  {
    key: "q3",
    prompt:
      "How many times this month have you actually taken a day off or left work on time?",
    options: [
      {
        letter: "A",
        text: "Almost never — you grit your teeth and stay.",
      },
      {
        letter: "B",
        text: "Hard to say — you've been too busy to keep track of the date.",
      },
      {
        letter: "C",
        text: "None — you're thinking about work even when you're trying to fall asleep.",
      },
      {
        letter: "D",
        text: "You don't quite dare take time off — worried it'll look like you're not committed enough.",
      },
    ],
  },
  {
    key: "q4",
    prompt:
      "Someone openly challenges your decision in a meeting. Your instinctive reaction is usually to —",
    options: [
      {
        letter: "A",
        text: "Hold it in, and deal with it privately after the meeting.",
      },
      {
        letter: "B",
        text: "Freeze — you're not entirely sure what they're really getting at.",
      },
      {
        letter: "C",
        text: "Not have the energy to argue — you just let it go.",
      },
      {
        letter: "D",
        text: "Worry a lot about how it looks — concerned it dents your authority.",
      },
    ],
  },
  {
    key: "q5",
    prompt:
      "If you had to describe your current state at work in one sentence, which is closest?",
    options: [
      {
        letter: "A",
        text: "“I know there's a problem, but I don't want to blow it up.”",
      },
      {
        letter: "B",
        text: "“I honestly can't tell what's actually going on in this office half the time.”",
      },
      {
        letter: "C",
        text: "“I'm running on fumes, but I can't stop.”",
      },
      {
        letter: "D",
        text: "“I'm still trying to prove I deserve this seat.”",
      },
    ],
  },
];

export type QuizResult = {
  type: QuizLetter;
  title: string;
  diagnosis: string;
  chapters: string[];
};

export const QUIZ_RESULTS: Record<QuizLetter, QuizResult> = {
  A: {
    type: "A",
    title: "The Slow Burn",
    diagnosis:
      "It's not that you don't know who's working against you — you just keep choosing to swallow it. But patience isn't free. It compounds, quietly, until it goes off at exactly the wrong moment. This is the profile most likely to miss the window to actually push back.",
    chapters: [
      "Managing the 55-Percenters",
      "Stop Learning to Get Along",
      "Think of Underperformance as a Shield",
    ],
  },
  B: {
    type: "B",
    title: "Off the Radar",
    diagnosis:
      "The most damaging part of office politics usually isn't the conflict itself — it's not being able to read the battlefield at all. You're not entirely sure who's actually an ally and who isn't. That fog keeps you permanently on the back foot.",
    chapters: ["Know Your Enemy", "Shattering Mediocre Alliances"],
  },
  C: {
    type: "C",
    title: "Running on Empty",
    diagnosis:
      "You're spending everything you have putting out the fire directly in front of you, with nothing left over to see the whole board. That's more dangerous than office politics itself — exhausted people make the worst calls, right when it matters most.",
    chapters: [
      "Busy Like a Machine, Alive Like a Human",
      "Attention Management",
      "A Fulfilling Life",
    ],
  },
  D: {
    type: "D",
    title: "Not Yet Entrenched",
    diagnosis:
      "You're spending a lot of energy proving you deserve this seat — but you haven't finished digging the moat around it yet. That insecurity is exactly what the people who know how to read it will use against you.",
    chapters: [
      "Building Your Moat",
      "Build Your Pack",
      "The Indispensable Hero Trap",
    ],
  },
};

/** Majority letter across the 5 answers; ties broken by the last question's
 * answer (per the confirmed quiz spec). */
export function computeQuizResult(answers: QuizLetter[]): QuizLetter {
  const counts: Record<QuizLetter, number> = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach((letter) => {
    counts[letter] += 1;
  });
  const max = Math.max(...Object.values(counts));
  const leaders = (Object.keys(counts) as QuizLetter[]).filter(
    (letter) => counts[letter] === max,
  );
  if (leaders.length === 1) return leaders[0];
  const lastAnswer = answers[answers.length - 1];
  return leaders.includes(lastAnswer) ? lastAnswer : leaders[0];
}
