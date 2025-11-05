"use client";

import SuccessPage from "@/app/components/common/form/admin/success";

/**
 * Halaman Success yang profesional berbasis Ant Design (tanpa Tailwind)
 * - Cocok untuk konfirmasi submit/aksi yang berhasil
 * - Menampilkan optional reference dari query param ?ref=...
 * - Tiga CTA: Dashboard, Beranda, Lihat Aktivitas
 */
export default function Succes() {
  return (
    <SuccessPage message=" Your review has been submitted successfully." />
  );
}
