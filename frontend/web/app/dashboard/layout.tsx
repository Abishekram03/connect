"use client";

import {
  Inbox,
  Sparkles,
  BookOpen,
  BarChart3,
  Palette,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { icon: Inbox, label: "Inbox", href: "/dashboard/inbox" },
  { icon: Sparkles, label: "AI", href: "/dashboard/ai" },
  { icon: BookOpen, label: "Knowledge", href: "/dashboard/knowledge" },
  { icon: BarChart3, label: "Insights", href: "/dashboard/insights" },
  { icon: Palette, label: "Widget", href: "/dashboard/widget" },
  { icon: UserCog, label: "Teams", href: "/dashboard/teams" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/signin");
      return;
    }
    if (!user.organization && pathname !== "/dashboard/workspace-setup") {
      router.push("/dashboard/workspace-setup");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/signin");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex md:w-12 md:shrink-0 md:flex-col md:items-center md:bg-background md:py-2.5">
        <Link
          href="/dashboard/inbox"
          className="mb-5 flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-xs font-bold text-primary-foreground"
        >
          C
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href || pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-ink text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col items-center gap-0.5">
          <Link
            href="/dashboard/settings"
            title="Settings"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              pathname === "/dashboard/settings"
                ? "bg-ink text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-surface-2 transition-colors hover:bg-surface-2"
            >
              <div className="flex h-full w-full items-center justify-center bg-accent text-[10px] font-medium text-accent-foreground">
                {initials}
              </div>
            </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute left-full bottom-0 z-20 ml-2 w-40 rounded-lg border border-border bg-card p-2 shadow-lg">
                <div className="border-b border-border pb-1.5 mb-1.5">
                  <p className="text-[10px] font-semibold text-ink">{user.name}</p>
                  <p className="text-[8px] text-muted-foreground">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <LogOut className="h-3 w-3" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex md:hidden shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2">
        <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-1.5 text-ink hover:bg-surface-2">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard/inbox" className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-[10px] font-bold text-white">
          C
        </Link>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent text-[10px] font-medium text-accent-foreground"
        >
          {initials}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-56 bg-card p-3 shadow-lg md:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-[10px] font-bold text-white">C</div>
                <span className="text-xs font-semibold text-ink">Connect</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {navItems.map(({ icon: Icon, label, href }) => {
                const isActive = pathname === href || pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                      isActive
                        ? "bg-ink text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-border" />
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                  pathname === "/dashboard/settings"
                    ? "bg-ink text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Log out
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Mobile bottom nav — visible only on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-card px-2 py-1 md:hidden">
        {navItems.slice(0, 5).map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
        {navItems.length > 5 && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] text-muted-foreground"
          >
            <Menu className="h-4 w-4" />
            <span className="leading-none">More</span>
          </button>
        )}
      </nav>

      <main className="flex flex-1 flex-col overflow-hidden pb-12 md:pb-0">
        {children}
      </main>
    </div>
  );
}
