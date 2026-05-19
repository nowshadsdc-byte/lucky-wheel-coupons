import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAdminAuthenticated, adminLogout } from "../lib/api/auth";
import { Button } from "../components/ui/button";
import { LayoutDashboard, Users, Settings, Trophy, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin/_protected")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate({ to: "/admin/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);

  if (!ready) return null;

  const navItems: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/rewards", label: "Rewards", icon: Settings },
    { to: "/admin/winners", label: "Trophy" as any && "Winners", icon: Trophy },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="md:sticky md:top-20 h-fit">
          <nav className="flex md:flex-col gap-1">
            {navItems.map((item) => {
              const active = item.exact ? path === item.to : path.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active ? "bg-brand-charcoal text-white" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start mt-2 text-muted-foreground"
              onClick={() => {
                adminLogout();
                navigate({ to: "/admin/login" });
              }}
            >
              <LogOut className="size-4" /> Sign out
            </Button>
          </nav>
        </aside>
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
