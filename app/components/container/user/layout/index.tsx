"use client";

import dynamic from "next/dynamic";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Grid,
  Layout,
  Menu,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { usePathname, useRouter } from "next/navigation";
import { LogoutOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";
import getInitials from "@/app/utils/initials-username";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useChatUnread } from "@/app/hooks/chat";
import { SidebarMainUser } from "@/app/data/user/main/sidebar-data";
import { SidebarSettingUser } from "@/app/data/user/setting/sidebar-data";
import { useMemo } from "react";

// penting: matikan SSR untuk header
const MainHeader = dynamic(() => import("../header"), { ssr: false });

export default function UserLayout({
  children,
  username,
  userProfilePic,
}: {
  children: React.ReactNode;
  username: string;
  userProfilePic?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount, conversations, isFetching } = useChatUnread();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const showHeaderHome =
    pathname === "/user" ||
    pathname.startsWith("/user/home/apply-job/detail/employee-setup");
  const showHeaderDashboard =
    pathname.startsWith("/user/home") &&
    !pathname.startsWith("/user/home/apply-job/detail/employee-setup");

  const mainNavItems = SidebarMainUser() || [];
  const settingNavItems = SidebarSettingUser() || [];
  const navItems = useMemo(
    () => [...mainNavItems, ...settingNavItems].filter(Boolean),
    [mainNavItems, settingNavItems]
  );

  const activeNavKey = useMemo(() => {
    if (!pathname) return undefined;
    const match = navItems.find(
      (item) => typeof item?.key === "string" && pathname.startsWith(item.key)
    );
    return match?.key as string | undefined;
  }, [navItems, pathname]);

  const headerStyle = {
    background: "rgba(255,255,255,0.96)",
    padding: isMobile ? "12px 16px 8px" : "0 24px",
    display: "flex",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 12 : 0,
    boxShadow: "0 2px 12px rgba(15,23,42,0.08)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(8px)",
    height: isMobile ? "auto" : 64,
    lineHeight: isMobile ? "normal" : "64px",
  };

  const contentStyle = {
    margin: 0,
    padding: "24px 20px 32px",
    height: "auto",
    background: "transparent",
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => {
          signOut({ callbackUrl: "/login" });
        }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  const notificationItems: MenuProps["items"] =
    conversations.length > 0
      ? conversations.map((item) => {
          const title = "OSS Recruitment";
          const updatedAt = item.conversation?.updatedAt
            ? new Date(item.conversation.updatedAt).toLocaleString()
            : "";
          return {
            key: item.conversationId,
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  maxWidth: 280,
                }}
              >
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                  {item.unreadCount} pesan belum dibaca
                </div>
                {updatedAt && (
                  <div style={{ fontSize: 11, color: "#bfbfbf" }}>
                    {updatedAt}
                  </div>
                )}
              </div>
            ),
          };
        })
      : [
          {
            key: "empty",
            disabled: true,
            label: (
              <div style={{ padding: "8px 12px", fontSize: 13, color: "#999" }}>
                No new messages
              </div>
            ),
          },
        ];

  const handleNotificationClick: MenuProps["onClick"] = ({ key }) => {
    const target = conversations.find((item) => item.conversationId === key);
    if (!target) return;
    const applicantId =
      target.conversation?.applicant?.id ?? target.conversation?.applicantId;
    if (applicantId) {
      router.push(`/user/home/apply-job/${applicantId}/chat`);
    } else {
      router.push(`/user/home`);
    }
  };

  const navButtons = navItems
    .filter(Boolean)
    .map((item) => item as MenuProps["items"][number])
    .map((item) => {
      const navItem = item as {
        key?: string;
        label?: React.ReactNode;
        icon?: React.ReactNode;
        onClick?: () => void;
      };
      if (!navItem.key) return null;
      const isActive = activeNavKey === navItem.key;
      const handleClick = () => {
        if (navItem.onClick) {
          navItem.onClick();
          return;
        }
        router.push(String(navItem.key));
      };

      return (
        <Button
          key={navItem.key}
          type="text"
          onClick={handleClick}
          style={{
            borderRadius: 12,
            paddingInline: isMobile ? 12 : 16,
            height: isMobile ? 36 : 40,
            background: isActive ? "#edf3ff" : "transparent",
            color: isActive ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {navItem.icon}
            {navItem.label}
          </span>
        </Button>
      );
    });

  const brandNode = (
    <div style={{ lineHeight: 1.1 }}>
      <Typography.Text strong style={{ fontSize: 16 }}>
        OSS Recruitment
      </Typography.Text>
    </div>
  );

  const navNode = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        justifyContent: isMobile ? "flex-start" : "center",
        flex: 1,
        flexWrap: isMobile ? "nowrap" : "wrap",
        width: isMobile ? "100%" : "auto",
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? 4 : 0,
        paddingTop: isMobile ? 8 : 0,
        borderTop: isMobile ? "1px solid rgba(15,23,42,0.08)" : "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {navButtons}
    </div>
  );

  const actionsNode = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 10 : 14,
        minWidth: isMobile ? 0 : 240,
        justifyContent: isMobile ? "flex-end" : "flex-end",
      }}
    >
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: notificationItems,
          onClick: handleNotificationClick,
        }}
      >
        <Badge
          count={unreadCount}
          overflowCount={99}
          style={{ backgroundColor: "#ff4d4f" }}
          offset={[-2, 6]}
          showZero={false}
        >
          <Button
            type="text"
            loading={isFetching && unreadCount === 0}
            icon={<FontAwesomeIcon icon={faBell} />}
          />
        </Badge>
      </Dropdown>
      <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 8 : 12,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <Avatar
            size={isMobile ? 40 : 46}
            src={userProfilePic || undefined}
            style={{
              border: "2px solid #1890ff",
              background: "#e6f7ff",
              color: "#1890ff",
              fontWeight: 700,
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!userProfilePic && getInitials(username)}
          </Avatar>
          {!isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginRight: 10,
              }}
            >
              <Typography.Text strong style={{ fontSize: 15 }}>
                {username}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 12, marginTop: 0 }}
              >
                Candidate
              </Typography.Text>
            </div>
          )}
        </div>
      </Dropdown>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      {showHeaderHome && <MainHeader />}
      {showHeaderDashboard && (
        <Header style={headerStyle}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {brandNode}
                </div>
                {actionsNode}
              </div>
              {navNode}
            </div>
          ) : (
            <>
              <div style={{ minWidth: 220 }}>{brandNode}</div>
              {navNode}
              {actionsNode}
            </>
          )}
        </Header>
      )}
      <Content style={contentStyle}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {children}
        </div>
      </Content>
      <Footer
        style={{
          textAlign: "center",
          background: "transparent",
          color: "rgba(0,0,0,0.45)",
        }}
      >
        {new Date().getFullYear()} · OSS Recruitment
      </Footer>
    </Layout>
  );
}
