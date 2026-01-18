"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Form,
  Image,
  Input,
  Row,
  Space,
  Steps,
  Typography,
  message,
} from "antd";
import {
  CloudUploadOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import SupaImageUploader from "@/app/utils/image-uploader";

type KTPResult = { nik?: string };
type APIResponse = { error: boolean; message: string; result?: KTPResult };

const API_ENDPOINT =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_OCR_PYTHON) ||
  "http://127.0.0.1:8000/ocr";

export default function UploadIdentityComponent({
  onPatchDocument,
}: {
  onPatchDocument: (nik: string, imageUrl: string) => Promise<void>;
}) {
  const { Title, Text } = Typography;
  const [form] = Form.useForm<KTPResult>();

  const [current, setCurrent] = useState<0 | 1>(0);

  const [imageUrl, setImageUrl] = useState<string | null>(null); // public URL
  const [imagePath, setImagePath] = useState<string | null>(null); // path di bucket (optional untuk delete)

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "Idle" | "Uploading" | "Processing" | "Done" | "Error"
  >("Idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [parsed, setParsed] = useState<KTPResult | null>(null);

  const inFlightRef = useRef(false);

  const filenameBase = useMemo(() => {
    if (!imagePath && !imageUrl) return "ktp";
    const guess =
      imagePath?.split("/").pop() ||
      imageUrl?.split("?")[0].split("/").pop() ||
      "ktp";
    return guess.replace(/\.[a-z0-9]+$/i, "") || "ktp";
  }, [imagePath, imageUrl]);

  // ambil blob dari public URL supabase (untuk dikirim ke OCR sebagai "file")
  const fetchBlobFromPublicUrl = useCallback(async (url: string) => {
    const resp = await fetch(url, { mode: "cors" });
    if (!resp.ok) {
      throw new Error(`Cannot download image: ${resp.status}`);
    }
    return await resp.blob();
  }, []);

  const handleProcess = useCallback(async () => {
    setErrorMsg("");

    if (!imageUrl) {
      message.warning("Please upload the ID card image first.");
      return;
    }
    if (inFlightRef.current) {
      message.info("Processing…");
      return;
    }
    inFlightRef.current = true;

    try {
      setLoading(true);
      setStatus("Uploading");

      // unduh gambar dari public URL supabase -> ubah jadi File -> kirim ke backend OCR
      const blob = await fetchBlobFromPublicUrl(imageUrl);
      const ext =
        blob.type && blob.type.includes("/")
          ? `.${blob.type.split("/")[1]}`
          : "";
      const file = new File([blob], `${filenameBase}${ext || ".jpg"}`, {
        type: blob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      const raw = await res
        .clone()
        .text()
        .catch(() => "");
      if (!res.ok) {
        throw new Error(`Server ${res.status}: ${raw || "An error occurred."}`);
      }

      setStatus("Processing");
      const json = (raw ? JSON.parse(raw) : await res.json()) as APIResponse;

      if (!json || typeof json !== "object") {
        throw new Error("Invalid response.");
      }
      if (json.error) {
        throw new Error(json.message || "Processing failed.");
      }

      const result = json.result || {};
      setParsed(result);
      form.setFieldsValue({ nik: result.nik || "" });

      setStatus("Done");
      message.success("Data retrieved successfully.");
      // auto ke Step 2
      setCurrent(1);
    } catch (e: any) {
      const msg = e?.message || "Processing failed.";
      setErrorMsg(msg);
      setStatus("Error");
      message.error(msg);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [fetchBlobFromPublicUrl, filenameBase, form, imageUrl]);

  const goPrev = useCallback(() => setCurrent(0), []);

  const handleUpdateDocument = useCallback(async (nik: string, imageUrl: string) => {
    await onPatchDocument(nik, imageUrl);
  }, [onPatchDocument]);

  return (
    <Space direction="vertical" size={16} style={{ display: "block" }}>
      <Title level={3} style={{ marginBottom: 0 }}>
        ID Card Verification
      </Title>
      <Text type="secondary">
        Upload your document, then review and confirm the NIK.
      </Text>

      <Steps
        current={current}
        style={{ marginTop: 8 }}
        items={[{ title: "Upload & Process" }, { title: "Preview & NIK" }]}
      />

      <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
        {/* STEP 1: hanya uploader + tombol Process pojok kanan bawah */}
        {current === 0 && (
          <Col xs={24}>
            <Card
              title="Upload Document"
              bordered
              bodyStyle={{ paddingBottom: 64, position: "relative" }}
            >
              <SupaImageUploader
                bucket="web-oss-recruitment"
                folder="no-identity"
                label="Upload Photo"
                variant="profile"
                maxSizeMB={15}
                onUpload={(path, url) => {
                  setImagePath(path);
                  setImageUrl(url);
                  // reset state hasil sebelumnya
                  setParsed(null);
                  form.resetFields();
                  setStatus("Idle");
                  setErrorMsg("");
                }}
                onDelete={() => {
                  setImagePath(null);
                  setImageUrl(null);
                  setParsed(null);
                  form.resetFields();
                }}
              />

              <Descriptions size="small" column={1} style={{ marginTop: 12 }}>
                <Descriptions.Item label="Status">{status}</Descriptions.Item>
                {errorMsg && (
                  <Descriptions.Item label="Details">
                    <Text type="danger">{errorMsg}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                }}
              >
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={handleProcess}
                  disabled={!imageUrl || loading}
                  loading={
                    loading &&
                    (status === "Uploading" || status === "Processing")
                  }
                >
                  Process
                </Button>
              </div>
            </Card>
          </Col>
        )}

        {/* STEP 2: pratinjau + form NIK */}
        {current === 1 && (
          <>
            <Col xs={24} md={10}>
              <Card title="Document Preview" bordered>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="ID Card Preview"
                    style={{ maxHeight: 420, objectFit: "contain" }}
                  />
                ) : (
                  <Alert type="info" message="No preview available." showIcon />
                )}
              </Card>
            </Col>

            <Col xs={24} md={14}>
              <Card title="Confirm NIK" bordered>
                <Alert
                  type="info"
                  showIcon
                  message="Review and correct the NIK below if necessary."
                  style={{ marginBottom: 12 }}
                />
                <Form<KTPResult>
                  form={form}
                  layout="vertical"
                  initialValues={{ nik: parsed?.nik || "" }}
                >
                  <Form.Item
                    label="NIK (National ID Number)"
                    name="nik"
                    rules={[
                      { required: true, message: "NIK is required." },
                      {
                        pattern: /^[0-9]{16}$/,
                        message: "NIK must be 16 digits.",
                      },
                    ]}
                  >
                    <Input placeholder="Example: 5103xxxxxxxxxxxx" allowClear />
                  </Form.Item>

                  <Flex gap={8} style={{ marginTop: 8 }} wrap="wrap">
                    <Button icon={<ArrowLeftOutlined />} onClick={goPrev}>
                      Back
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        const nik = form.getFieldValue("nik");
                        handleUpdateDocument(nik, imageUrl || "");
                      }}
                    >
                      Submit NIK
                    </Button>
                  </Flex>
                </Form>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </Space>
  );
}
