"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Role = "GUEST" | "USER" | "ADMIN";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        textDecoration: "none",
        color: "var(--text)",
        padding: "10px 12px",
        borderRadius: 12,
        fontWeight: 900,
        border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  const line: React.CSSProperties = {
    height: 2,
    width: 18,
    background: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    transition: "transform 180ms ease, opacity 180ms ease",
  };

  return (
    <span style={{ display: "grid", gap: 4 }}>
      <span
        style={{
          ...line,
          transform: open ? "translateY(6px) rotate(45deg)" : "none",
        }}
      />
      <span style={{ ...line, opacity: open ? 0 : 1 }} />
      <span
        style={{
          ...line,
          transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
        }}
      />
    </span>
  );
}

export default function SiteHeader() {
  const [role, setRole] = useState<Role>("GUEST");
  const pathname = usePathname();

  
  const [open, setOpen] = useState(false);

 
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      try {
        const res = await fetch("/api/me/role", { cache: "no-store" });
        const raw = await res.text();

        let data: any = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {}

        if (!alive) return;

        const r = (data?.role as Role) || "GUEST";
        setRole(r);
      } catch {
        if (!alive) return;
        setRole("GUEST");
      }
    }

    loadRole();
    return () => {
      alive = false;
    };
  }, []);

  const isAdmin = role === "ADMIN";
  const onAdminRoute = pathname?.startsWith("/admin");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: "rgba(11,18,32,0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/onalek-logo.jpg"
            alt="Onalek Financial Reach logo"
            width={44}
            height={44}
            style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}
            priority
          />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 1000, letterSpacing: 0.2 }}>ONALEK</div>
            <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700 }}>
              Financial Reach (PTY) LTD
            </div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        
        <nav className="navDesktop" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {!onAdminRoute ? (
            <>
              <NavLink href="/" label="Home" />
              <NavLink href="/apply" label="Apply" />
              <NavLink href="/upload" label="Upload" />
              <NavLink href="/status" label="Status" />
            </>
          ) : (
            <>
              <NavLink href="/admin/dashboard" label="Dashboard" />
            </>
          )}
        </nav>

        {/* Right side: hamburger (mobile) + auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
         
          <button
            className="navMobileBtn"
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            style={{
              display: "none",
              height: 40,
              width: 44,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HamburgerIcon open={open} />
          </button>

          <SignedOut>
            <SignInButton>
              <button className="btn btnPrimary" type="button">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open ? (
        <div
          className="navMobilePanel"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(11,18,32,0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="container" style={{ padding: "10px 0" }}>
            <div style={{ display: "grid", gap: 8 }}>
              {!onAdminRoute ? (
                <>
                  <NavLink href="/" label="Home" onClick={() => setOpen(false)} />
                  <NavLink href="/apply" label="Apply" onClick={() => setOpen(false)} />
                  <NavLink href="/upload" label="Upload" onClick={() => setOpen(false)} />
                  <NavLink href="/status" label="Status" onClick={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <NavLink href="/admin/dashboard" label="Dashboard" onClick={() => setOpen(false)} />
                </>
              )}

             
              {!onAdminRoute && isAdmin ? (
                <NavLink href="/admin/dashboard" label="Admin" onClick={() => setOpen(false)} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

     
      <style jsx global>{`
        @media (max-width: 760px) {
          .navDesktop {
            display: none !important;
          }
          .navMobileBtn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}