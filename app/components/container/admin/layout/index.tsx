import { Avatar, Button, Dropdown, Layout, Menu, Typography } from "antd";
import { MainBreadcrumb } from "@/app/components/common/breadcrumb";
import { SiderAdmin } from "../sider";
import { LogoutOutlined, NotificationFilled } from "@ant-design/icons";
import getInitials from "@/app/utils/initials-username";

const { Header, Content, Footer } = Layout;

// (Optional) Extract styles for easier maintenance
const headerStyle = {
  background: "#fff",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const contentStyle = {
  margin: "24px 16px",
  padding: 24,
  height: "auto",
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const innerLayoutStyle = {
  background: "#f5f5f5",
};

const menu = (
  <Menu>
    <Menu.Item
      key="logout"
      icon={<LogoutOutlined />}
      onClick={() => {
        // TODO: Implement your logout logic here!
        // For example: signOut() or router.push('/login')
        alert("Logout clicked! (Ganti dengan logic logout aslimu)");
      }}
    >
      Logout
    </Menu.Item>
  </Menu>
);

export default function AdminLayout({
  children,
  username,
  userProfilePic,
}: {
  children: React.ReactNode;
  username: string;
  userProfilePic?: string;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SiderAdmin />
      <Layout style={innerLayoutStyle}>
        <Header style={headerStyle}>
          <div style={{ padding: 24 }}>
            <MainBreadcrumb />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 240,
              justifyContent: "flex-end",
            }}
          >
            <Button icon={<NotificationFilled />}></Button>
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <Avatar
                  size={50}
                  src={userProfilePic || undefined} // undefined kalau kosong, biar pakai fallback
                  style={{
                    border: "2px solid #1890ff",
                    background: "#e6f7ff",
                    color: "#1890ff",
                    fontWeight: 700,
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!userProfilePic && getInitials(username)}
                </Avatar>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginRight: 15,
                  }}
                >
                  <Typography.Text strong style={{ fontSize: 15 }}>
                    {username}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 14, marginTop: 0 }}
                  >
                    Admin
                  </Typography.Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={contentStyle}>{children}</Content>
        <Footer style={{ textAlign: "center", background: "#fff" }}>
          {/* Tambahkan isi footer di sini jika perlu */}
        </Footer>
      </Layout>
    </Layout>
  );
}
