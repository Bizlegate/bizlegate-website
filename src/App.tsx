import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./lib/language.tsx";
import { DefaultProviders } from "./components/providers/default.tsx";
import AppLayout from "./components/layout/app-layout.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Services from "./pages/services/page.tsx";
import Process from "./pages/process/page.tsx";
import Inquire from "./pages/inquire/page.tsx";
import Shop from "./pages/shop/page.tsx";
import Library from "./pages/library/page.tsx";
import Admin from "./pages/admin/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <LanguageProvider>
      <DefaultProviders>
        <BrowserRouter>
          <Routes>
            {/* Outside layout - no shared nav/footer */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Inside layout - shared nav + footer */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/process" element={<Process />} />
              <Route path="/inquire" element={<Inquire />} />
              <Route path="/shop" element={<Shop />} />
              {/* /book-consult is retired (2026-10-09 /shop pivot) — this
                  redirect exists for anything already pointing at the old
                  URL (the printed book's back cover, rendered Office
                  Original video end-cards). The old three-tier book funnel
                  page (book/page.tsx and friends) stays on disk, unrouted,
                  per the site's "stub out, don't delete" convention — see
                  claude/00_project_status.md. */}
              <Route
                path="/book-consult"
                element={<Navigate to="/shop" replace />}
              />
              <Route path="/library" element={<Library />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DefaultProviders>
    </LanguageProvider>
  );
}
