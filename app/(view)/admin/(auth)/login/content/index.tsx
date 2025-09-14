"use client";

import FormLogin from "@/app/components/common/form/login";
import { UserFormModel } from "@/app/models/user";
import { primaryColor, secondaryColor } from "@/app/utils/color";
import { Col, Image, notification, Row, Typography } from "antd";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const { Title} = Typography;

export default function LoginContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: UserFormModel) => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (res?.ok) {
      notification.success({ message: "Login berhasil!" });

      router.push("/admin/dashboard/home");
    } else {
      notification.error({ message: "Login gagal!" });
    }
  };

  return (
    <div style={{ height: "100vh", background: "#fff" }}>
      <Row style={{ height: "100%" }}>
        {/* Kiri - Ilustrasi */}
        <Col
          span={12}
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
          }}
        >
          <Image
            src="/assets/images/icon.png"
            alt="Illustration"
            preview={false}
            width={400}
            height={400}
          />
        </Col>

        {/* Kanan - Form Login */}
        <Col
          span={12}
          style={{
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "#fff",
          }}
        >
          <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
            <div style={{ marginBottom: 30, textAlign: "center" }}>
              <Title level={2}>OSS Recruitment</Title>
            </div>

            <Title level={4} style={{ textAlign: "center" }}>
              Masuk ke Akun Anda
            </Title>
            <FormLogin onFinish={handleLogin} loading={loading} />
          </div>
        </Col>
      </Row>
    </div>
  );
}
