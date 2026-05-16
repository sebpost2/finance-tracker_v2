// No longer needed — theme is managed via cookie + server-side class on <html>
// Kept as empty export to avoid breaking any imports
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
