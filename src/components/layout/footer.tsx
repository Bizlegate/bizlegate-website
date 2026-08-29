import { Link } from "react-router-dom";
import { useMediaValue } from "@/hooks/use-content.ts";
import { LOGO_KEY, LOGO_DEFAULT } from "@/lib/branding.ts";
import { useUiText } from "@/lib/ui-strings.ts";

export default function Footer() {
  const year = new Date().getFullYear();
  const logo = useMediaValue(LOGO_KEY, LOGO_DEFAULT);

  const FOOTER_LINKS = [
    { to: "/", label: useUiText("nav", "home") },
    { to: "/services", label: useUiText("nav", "services") },
    { to: "/process", label: useUiText("nav", "process") },
    { to: "/inquire", label: useUiText("nav", "inquire") },
  ];
  const navigateLabel = useUiText("footer", "navigate");
  const description = useUiText("footer", "description");
  const rights = useUiText("footer", "rights");
  const locations = useUiText("footer", "locations");

  return (
    <footer className="border-t border-white/10 bg-[#0A1B2A] text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="Bizlegate"
              className="h-11 w-auto rounded-sm object-contain"
            />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg font-bold tracking-wide text-primary">
                BIZLEGATE
              </span>
              <span className="text-[0.6rem] uppercase tracking-[0.28em] text-white/50">
                Your Local Associate
              </span>
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            {description}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
            {navigateLabel}
          </h3>
          <ul className="space-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6">
          <p>© {year} Bizlegate. {rights}</p>
          <p className="tracking-wide">{locations}</p>
        </div>
      </div>
    </footer>
  );
}
