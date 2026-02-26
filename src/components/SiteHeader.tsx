"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Role = "GUEST" | "USER" | "ADMIN";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "var(--text)",
        padding: "10px 12px",
        borderRadius: 12,
        fontWeight: 900,
        border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const [role, setRole] = useState<Role>("GUEST");
  const pathname = usePathname();

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

        <nav style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {!pathname?.startsWith("/admin") ? (
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

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
    </header>
  );
}