import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Shield, Languages } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { useAccess } from "@/hooks/use-access.ts";
import { useMediaValue, useZhEnabled } from "@/hooks/use-content.ts";
import { LOGO_KEY, LOGO_DEFAULT } from "@/lib/branding.ts";
import { useLanguage } from "@/lib/language.tsx";
import { useUiText } from "@/lib/ui-strings.ts";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const access = useAccess();
  const hasBackendAccess = access === "admin" || access === "staff";
  const logo = useMediaValue(LOGO_KEY, LOGO_DEFAULT);
  const { toggle } = useLanguage();
  const zhEnabled = useZhEnabled();

  const NAV_LINKS = [
    { to: "/", label: useUiText("nav", "home"), end: true },
    { to: "/services", label: useUiText("nav", "services"), end: false },
    { to: "/process", label: useUiText("nav", "process"), end: false },
    { to: "/inquire", label: useUiText("nav", "inquire"), end: false },
  ];
  const requestAccessLabel = useUiText("nav", "requestAccess");
  const siteManagerLabel = useUiText("nav", "siteManager");
  const langToggleLabel = useUiText("nav", "langToggle");
  const openMenuLabel = useUiText("nav", "openMenu");
  const closeMenuLabel = useUiText("nav", "closeMenu");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A1B2A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A1B2A]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Bizlegate home"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo.url}
            alt="Bizlegate — Your Local Associate"
            className="h-9 w-auto rounded-sm object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-bold tracking-wide text-primary">
              BIZLEGATE
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.28em] text-white/50">
              Your Local Associate
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-4 py-2 text-sm font-medium tracking-wide transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-white/70 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button asChild size="sm" className="ml-3">
            <Link to="/inquire">{requestAccessLabel}</Link>
          </Button>
          {zhEnabled && (
            <button
              type="button"
              onClick={toggle}
              className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              aria-label="Switch language"
            >
              <Languages className="size-4" />
              {langToggleLabel}
            </button>
          )}
          {hasBackendAccess && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "ml-1 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-primary" : "text-white/70 hover:text-white",
                )
              }
              aria-label={siteManagerLabel}
            >
              <Shield className="size-4" />
            </NavLink>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          {zhEnabled && (
            <button
              type="button"
              onClick={toggle}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-white"
              aria-label="Switch language"
            >
              <Languages className="size-5" />
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? closeMenuLabel : openMenuLabel}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-white/10 bg-[#0A1B2A] px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-4 py-3 text-base font-medium",
                  isActive
                    ? "bg-white/5 text-primary"
                    : "text-white/80 hover:bg-white/5 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button asChild className="mt-2 w-full" onClick={() => setOpen(false)}>
            <Link to="/inquire">{requestAccessLabel}</Link>
          </Button>
          {hasBackendAccess && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-md px-4 py-3 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white"
            >
              <Shield className="size-4" />
              {siteManagerLabel}
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
