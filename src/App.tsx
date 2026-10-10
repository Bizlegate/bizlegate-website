import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./lib/language.tsx";
import { DefaultProviders } from "./components/providers/default.tsx";
import AppLayout from "./components/layout/app-layout.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Services from "./pages/services/page.tsx";
import Process from "./pages/process/page.tsx";
import Inquire from "./pages/inquire/page.tsx";
import Shop from "./pages/shop/page.tsx";
import Book from "./pages/book/page.tsx";
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
              {/* /book-consult is back as its own real page (2026-10-10 —
                  the user liked the original three-tier book funnel page
                  and didn't want it reduced to a redirect). It renders
                  independently of /shop, gated by its own admin toggle
                  (BookSiteToggle, site.bookEnabled, default off) — see
                  claude/22_shop_office_original_separation_strategy.md.
                  Both pages exist as fallbacks the admin can turn on/off
                  separately from /admin without needing code changes. */}
              <Route path="/book-consult" element={<Book />} />
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
