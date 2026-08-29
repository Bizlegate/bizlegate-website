import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./lib/language.tsx";
import { DefaultProviders } from "./components/providers/default.tsx";
import AppLayout from "./components/layout/app-layout.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import Services from "./pages/services/page.tsx";
import Process from "./pages/process/page.tsx";
import Inquire from "./pages/inquire/page.tsx";
import Book from "./pages/book/page.tsx";
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
              <Route path="/book" element={<Book />} />
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
