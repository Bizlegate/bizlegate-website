import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { useUiText } from "@/lib/ui-strings.ts";

export default function NotFound() {
  const location = useLocation();
  const title = useUiText("notFound", "title");
  const body = useUiText("notFound", "body");
  const returnHome = useUiText("notFound", "returnHome");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {body}
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link to="/">{returnHome}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
