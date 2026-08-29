export type ProcessStep = {
  /** Content key prefix, e.g. "process.step.1" -> ".title" and ".body" */
  baseKey: string;
  title: string;
  body: string;
};

/**
 * The seven-step engagement flow, from first inquiry through to the
 * execution of the visit. All copy is CMS-driven with these defaults.
 */
export const PROCESS_STEPS: ProcessStep[] = [
  {
    baseKey: "process.step.1",
    title: "Confidential inquiry",
    body: "You share your objectives, timeline, and the people you need to reach through our secure intake. Nothing is disclosed to any third party. We review within one business day.",
  },
  {
    baseKey: "process.step.2",
    title: "Discovery consultation",
    body: "We meet to understand your delegation, priorities, and the outcomes that define success. This is where strategy takes shape and where we listen more than we speak.",
  },
  {
    baseKey: "process.step.3",
    title: "Tailored proposal",
    body: "You receive a clear plan: the introductions we can open, the itinerary we recommend, the logistics we handle, and transparent terms. No obligation, no surprises.",
  },
  {
    baseKey: "process.step.4",
    title: "Groundwork & introductions",
    body: "Once aligned, we activate our local network, confirm meetings, and prepare every counterpart. We brief you on context, etiquette, and the people you are about to meet.",
  },
  {
    baseKey: "process.step.5",
    title: "Arrival & orchestration",
    body: "From the moment you land, we manage transport, translation, accommodation, and pacing so your team stays focused entirely on the conversations that matter.",
  },
  {
    baseKey: "process.step.6",
    title: "On-the-ground execution",
    body: "We accompany your delegation, adapt in real time, and capture every milestone. You move with confidence, knowing a trusted associate is always one step ahead.",
  },
  {
    baseKey: "process.step.7",
    title: "Follow-through Service upon request",
    body: "After the visit, we help sustain the relationships you built, relay follow-ups, and remain your point of contact in Taiwan long after you have flown home — available as an ongoing paid engagement whenever you need us.",
  },
];
