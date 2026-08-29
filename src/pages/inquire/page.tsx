import { Section } from "@/components/layout/section.tsx";
import InquireHero from "./_components/inquire-hero.tsx";
import InquireForm from "./_components/inquire-form.tsx";

export default function Inquire() {
  return (
    <>
      <InquireHero />
      <Section>
        <InquireForm />
      </Section>
    </>
  );
}
