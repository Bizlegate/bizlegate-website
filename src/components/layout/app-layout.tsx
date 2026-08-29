import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./navbar.tsx";
import Footer from "./footer.tsx";

export default function AppLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change for a clean page-to-page experience.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
