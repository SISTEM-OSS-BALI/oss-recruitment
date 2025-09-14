"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Typography,
  Grid,
  Button,
} from "antd";
import {
  LoginOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const BASE_NAV = [
  { key: "home", label: "Home", href: "/" },
  { key: "about", label: "About", href: "/about" },
  { key: "jobseeker", label: "Job Seeker", href: "/job-seeker" },
  { key: "contact", label: "Contact", href: "/contact" },
];

export default function MainHeader({
  // opsional: override label & href ketika mode back
  backLabel = "Back to Jobs",
  backHref, // contoh: "/job-seeker" atau "/jobs"
}: {
  user?: { name: string } | null;
  backLabel?: string;
  backHref?: string;
}) {
  const pathname = usePathname();
  const screens = useBreakpoint();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerStyle: React.CSSProperties = {
    background: "#fff",
    padding: screens.md ? "0 32px" : "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    minHeight: scrolled ? 62 : 70,
    boxShadow: scrolled
      ? "0 6px 14px rgba(0,0,0,0.06)"
      : "0 2px 8px rgba(0,0,0,0.04)",
    transition: "all .2s ease",
  };

  // Tentukan link back default bila tidak dioper melalui props
  const getBackLink = () => {
    if (backHref) return backHref;
    // heuristik: kalau lagi di halaman job detail / lamaran, arahkan ke job listing
    if (pathname.startsWith("/job-seeker")) return "/job-seeker";
    if (pathname.startsWith("/jobs")) return "/jobs";
    // fallback
    return "/";
  };

  // --- NAV normal (hanya di "/") ---
  const nav = (
    <>
      {screens.md && (
        <Menu
          mode="horizontal"
          selectable={false}
          style={{
            flex: 2,
            justifyContent: "center",
            borderBottom: "none",
            fontWeight: 500,
            fontSize: 16,
            background: "none",
            boxShadow: "none",
          }}
          items={BASE_NAV.map((item) => ({
            key: item.key,
            label: (
              <Link href={item.href} style={{ color: "#222" }}>
                {item.label}
              </Link>
            ),
          }))}
        />
      )}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <Link href="/login">
          <Button icon={<LoginOutlined />} type="primary">
            Login
          </Button>
        </Link>
      </div>
    </>
  );

  // --- BACK LINK seperti screenshot ---
  const back = (
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <Link
        href={getBackLink()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#445066",
          fontSize: 16,
          textDecoration: "none",
          padding: "6px 8px",
          borderRadius: 8,
        }}
      >
        <ArrowLeftOutlined style={{ fontSize: 18 }} />
        <span>{backLabel}</span>
      </Link>
    </div>
  );

  return (
    <Header style={headerStyle}>
      {pathname === "/" ? (
        <>
          {/* LOGO + NAV */}
          <div style={{ flex: 1 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography.Title
                level={4}
                style={{ color: "#2467e7", margin: 0, fontWeight: 700 }}
              >
                One Step Solution Bali
              </Typography.Title>
            </Link>
          </div>
          {nav}
        </>
      ) : (
        back
      )}
    </Header>
  );
}
