"use client";

import FormLogin from "@/app/components/common/form/login";
import { UserFormModel } from "@/app/models/user";
import { notification } from "antd";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import styles from "../../auth.module.css";

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
      notification.success({ message: "Signed in successfully" });
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session.user.role === "ADMIN") {
        router.push("/admin/dashboard/home");
      } else {
        router.push("/user");
      }
    } else {
      notification.error({ message: "Sign in failed" });
    }
  };

  const highlightStats = [
    { value: "120+", label: "Active openings every month" },
    { value: "50+", label: "Trusted hiring partners" },
    { value: "24/7", label: "Responsive candidate support" },
  ];

  return (
    <div className={styles.wrapper}>
      <span className={`${styles.glow} ${styles.glowPrimary}`} />
      <span className={`${styles.glow} ${styles.glowSecondary}`} />

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.leftPane}>
            <span className={styles.badge}>OSS Recruitment Platform</span>
            <h1 className={styles.title}>
              Build a professional career with the best <span>OSS</span> roles
            </h1>
            <p className={styles.subtitle}>
              Access curated openings, track hiring steps transparently, and get
              guided by our in-house HR experts throughout every stage.
            </p>

            <ul className={styles.highlights}>
              {highlightStats.map((item) => (
                <li key={item.label} className={styles.highlightItem}>
                  <span className={styles.statValue}>{item.value}</span>
                  <span className={styles.statLabel}>{item.label}</span>
                </li>
              ))}
            </ul>

            <div className={styles.infoCard}>
              <div className={styles.infoCardImage}>
                <Image
                  src="/assets/images/icon.png"
                  alt="OSS Recruitment"
                  width={64}
                  height={64}
                  priority
                />
              </div>
              <div className={styles.infoCardText}>
                <span className={styles.infoTitle}>
                  Centralized OSS recruitment portal
                </span>
                <span className={styles.infoSubtitle}>
                  Trusted by hundreds of professionals every month
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <p className={styles.formHeaderTitle}>Welcome Back</p>
                <p className={styles.formHeaderSubtitle}>
                  Sign in to continue your recruitment journey.
                </p>
              </div>

              <p className={styles.formHelper}>
                Use the email and password associated with your candidate
                account.
              </p>

              <FormLogin onFinish={handleLogin} loading={loading} />

              <div className={styles.formFooter}>
                <span>Don&apos;t have an account?</span>
                <Link href="/register">Create one now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
