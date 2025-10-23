"use client";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, message, Upload, Popconfirm, UploadProps, Image } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

type Variant = "thumbnail" | "profile";

interface ImageItem {
  url: string;
  path: string;
}
interface SupaImageUploaderProps {
  bucket?: string;
  folder?: string;
  label?: string;
  onUpload?: (path: string, url: string) => void;
  onDelete?: (path: string) => void;
  value?: string | null;
  onChange?: (value: string | null) => void;
  variant?: Variant; 
  maxSizeMB?: number;
  accept?: string;
}

export default function SupaImageUploader({
  bucket = "",
  folder = "",
  onUpload,
  onDelete,
  value,
  onChange,
  variant = "thumbnail",
  maxSizeMB = 5,
  accept = "image/*",
}: SupaImageUploaderProps) {
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(
    value ? { url: value, path: "" } : null
  );

  useEffect(() => {
    if (value) {
      if (!previewImage || previewImage.url !== value) {
        setPreviewImage({ url: value, path: "" });
      }
    } else {
      setPreviewImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isProfile = variant === "profile";
  const paddingTop = isProfile ? "100%" : "56.25%"; // 1:1 vs 16:9
  const borderRadiusImg = isProfile ? "50%" : 8;

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Hanya file gambar yang diperbolehkan.");
      return Upload.LIST_IGNORE;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      message.error(`Ukuran file maksimal ${maxSizeMB}MB.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
  }: RcCustomRequestOptions) => {
    try {
      if (!(file instanceof File)) throw new Error("File upload tidak valid");
      if (!bucket) throw new Error("Nama bucket wajib diisi");

      const fileName = file.name ?? "uploaded-image";
      const filePath = folder
        ? `${folder}/${Date.now()}-${fileName}`
        : `${Date.now()}-${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error("Gagal mendapatkan URL publik");

      setPreviewImage({ url: publicUrl, path: filePath });
      onUpload?.(filePath, publicUrl);
      onChange?.(publicUrl);
      message.success("Upload berhasil!");
      onSuccess?.(filePath as string);
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Unknown error");
      message.error("Upload gagal: " + err.message);
      onError?.(err);
    }
  };

  const handleDelete = async () => {
    if (!previewImage?.path && !previewImage?.url) {
      onChange?.(null);
      setPreviewImage(null);
      return;
    }
    if (previewImage?.path) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([previewImage.path]);
      if (error)
        return message.error("Gagal menghapus gambar: " + error.message);
    }
    setPreviewImage(null);
    onDelete?.(previewImage?.path ?? "");
    onChange?.(null);
    message.success("Gambar berhasil dihapus!");
  };

  return (
    <div>
      {!previewImage ? (
        <Upload.Dragger
          customRequest={handleUpload as UploadProps["customRequest"]}
          showUploadList={false}
          accept={accept}
          multiple={false}
          beforeUpload={beforeUpload}
          style={{
            border: "2px dashed #d9d9d9",
            borderRadius: 12,
            background: "#fcfcfc",
            width: "100%",
            padding: 0,
          }}
        >
          <div style={{ padding: 20, textAlign: "center" }}>
            <InboxOutlined style={{ fontSize: 40, color: "#aaa" }} />
            <div style={{ fontWeight: 600, fontSize: 16, marginTop: 10 }}>
              Drop your file here, atau{" "}
              <span
                style={{
                  color: "#3a7bd5",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                browse
              </span>
            </div>
            <div style={{ color: "#666", marginTop: 6, fontSize: 13 }}>
              JPG, PNG sampai {maxSizeMB}MB
            </div>
          </div>
        </Upload.Dragger>
      ) : (
        // PREVIEW: spacer + absolute layer
        <div style={{ marginTop: 16, width: "100%", position: "relative" }}>
          <div style={{ paddingTop }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#fcfcfc",
              border: "1.5px dashed #d9d9d9",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              key={previewImage.url} // force rerender saat URL berubah
              src={previewImage.url}
              alt="Preview"
               // <-- penting untuk absolute fill
              sizes="100vw"
              style={{
                objectFit: "cover",
                borderRadius: borderRadiusImg,
              }}
              onError={() => message.error("Gagal memuat gambar pratinjau")} // optional: skip Next image optimizer
            />

            <Popconfirm
              title="Hapus gambar ini?"
              onConfirm={handleDelete}
              okText="Ya"
              cancelText="Batal"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                type="primary"
                size="small"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  background: "red",
                  boxShadow: "0 2px 8px #00000014",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              />
            </Popconfirm>
          </div>
        </div>
      )}
    </div>
  );
}
