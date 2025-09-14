import dynamic from "next/dynamic";
import { Layout } from "antd";
import { Content, Footer } from "antd/es/layout/layout";

// penting: matikan SSR untuk header
const MainHeader = dynamic(() => import("../header"), { ssr: false });

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        <MainHeader />
        <Content>{children}</Content>
        <Footer style={{ textAlign: "center", background: "#fff" }} />
      </Layout>
    </Layout>
  );
}
