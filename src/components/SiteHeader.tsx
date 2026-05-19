import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-7 h-7">
            <span className="rounded-sm bg-brand-coral" />
            <span className="rounded-sm bg-brand-orange" />
            <span className="rounded-sm bg-brand-teal" />
            <span className="rounded-sm bg-brand-green" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold uppercase tracking-wide text-sm">Skills Development Centre</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Spin the Wheel</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {isAdmin ? (
            <Link to="/" className="text-muted-foreground hover:text-foreground">Back to site</Link>
          ) : (
            <Link to="/admin/login" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <Sparkles className="size-3.5" /> Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
