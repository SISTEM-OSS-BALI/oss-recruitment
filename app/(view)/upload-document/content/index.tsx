"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Space, Typography, Button, Divider, message } from "antd";
import SupaPdfUploader from "@/app/utils/pdf-uploader";

const { Title, Text } = Typography;

export default function UploadDocumentContent() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const contractId = searchParams?.get("contract_id") || null;
  const router = useRouter();

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <Card
        style={{ borderRadius: 14 }}
        title={
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0 }}>
              Upload Director-Signed Document
            </Title>
            <Text type="secondary">
              Upload the final signed PDF. The file will be stored in Supabase
              Storage and previewed below.
            </Text>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ display: "block" }}>
          <SupaPdfUploader
            bucket="web-oss-recruitment"
            folder="pdf"
            value={pdfUrl ?? undefined}
            onUpload={(path: string, url: string) => {
              setPdfPath(path);
              setPdfUrl(url);
              message.success("PDF uploaded to Supabase.");
              if (contractId) {
                (async () => {
                  try {
                    const res = await fetch(
                      `/api/admin/dashboard/offering-contract/${contractId}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          directorSignedPdfUrl: url,
                        }),
                      }
                    );
                    if (!res.ok) {
                      const txt = await res.text().catch(() => "");
                      throw new Error(txt || `Status ${res.status}`);
                    }
                    message.success("Saved signed PDF URL to contract.");
                    router.push("upload-document/success");
                  } catch (err) {
                    console.error("Failed to update offering contract:", err);
                    message.error("Failed to save signed PDF URL to contract.");
                  }
                })();
              }
            }}
            onDelete={() => {
              setPdfPath(null);
              setPdfUrl(null);
              message.info("PDF removed.");
            }}
          />

          {pdfUrl && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Space direction="vertical" size={6} style={{ display: "block" }}>
                <Text strong>File info</Text>
                <Text type="secondary">
                  <b>Path:</b> {pdfPath}
                </Text>

                <Space wrap>
                  <Button
                    type="link"
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in new tab
                  </Button>

                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(pdfUrl);
                      message.success("URL copied to clipboard.");
                    }}
                  >
                    Copy URL
                  </Button>

                  <Button
                    onClick={() => {
                      if (pdfPath) {
                        navigator.clipboard.writeText(pdfPath);
                        message.success("Path copied to clipboard.");
                      }
                    }}
                  >
                    Copy Path
                  </Button>
                </Space>
              </Space>

              <div
                style={{
                  marginTop: 8,
                  height: 560,
                  border: "1px solid #f0f0f0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </div>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
