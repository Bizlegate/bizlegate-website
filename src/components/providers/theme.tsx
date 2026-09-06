import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from "next-themes";

// This site has its own deliberately-designed alternating light/cream and
// navy section backgrounds (the editorial "深淺交錯" look used throughout
// the marketing pages and the /book sales page) — it is NOT the kind of
// app UI that should also flip to a separate dark theme based on the
// visitor's OS/browser preference. There is no manual dark-mode toggle
// anywhere in the UI, so the only way `.dark` was ever getting applied was
// automatically via the visitor's system setting — and doing so collapses
// --background and --secondary into the same near-identical dark navy,
// destroying the alternating section contrast everywhere on the site (this
// is exactly the bug the `/book` page's `.book-page` CSS override in
// index.css was built to work around for that one route). Forcing "light"
// here fixes it site-wide instead of route-by-route.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      {...props}
    >
      {children}
    </NextThemeProvider>
  );
}
