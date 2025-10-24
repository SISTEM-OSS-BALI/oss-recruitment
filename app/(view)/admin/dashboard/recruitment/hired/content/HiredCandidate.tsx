"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Empty,
  List,
  Skeleton,
  Button,
  Modal,
  Select,
  Form,
  Typography,
  message,
  Tabs,
  Spin,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  FileWordOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

import type { ApplicantDataModel } from "@/app/models/applicant";
import {
  ScheduleHiredDataModel,
  ScheduleHiredPayloadCreateModel,
} from "@/app/models/hired";

import ScheduleHiredForm from "@/app/components/common/form/admin/hired";
import { formatDate, formatTime } from "@/app/utils/date-helper";
import CandidateInfoPanel from "@/app/components/common/information-panel";
import {
  useContractTemplate,
  useContractTemplates,
} from "@/app/hooks/contract-template";

// templating + conversions
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import mammoth from "mammoth";

const { Text } = Typography;

type GeneratedDoc = {
  // current authoritative DOCX blob
  docBlob: Blob | null;
  docName: string;

  // editable HTML content (text-based, not perfect layout)
  editedHtml: string;

  // preview render status
  previewReady: boolean;

  // optional PDF export
  pdfBlob?: Blob | null;
  pdfName?: string;
  pdfUrl?: string;
  previewError?: string | null;
};

export default function HiredSchedulePage({
  listData = [],
  listLoading = false,
  candidate,
  onCreateSchedule,
  onLoadingCreate,
}: {
  selectedScheduleId?: string | null;
  candidate: ApplicantDataModel | null;
  listData?: ScheduleHiredDataModel[];
  listLoading?: boolean;
  onCreateSchedule: (payload: ScheduleHiredPayloadCreateModel) => Promise<void>;
  onLoadingCreate: boolean;
}) {
  // ===== Filter schedules for this candidate
  const schedules = useMemo(
    () => listData.filter((s) => s.candidate_id === candidate?.id),
    [listData, candidate?.id]
  );
  const hasSchedules = schedules.length > 0;

  // ===== Modal: pick contract template
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templates } = useContractTemplates({});
  const { data: selectedTemplate } = useContractTemplate({
    id: selectedTemplateId || "",
  });

  // ===== Modal: contract preview/editor/export
  const [isResultOpen, setIsResultOpen] = useState(false);

  // full contract state
  const [docState, setDocState] = useState<GeneratedDoc | null>(null);

  // loading flags
  const [generating, setGenerating] = useState(false); // generate first doc
  const [applyingEdits, setApplyingEdits] = useState(false); // rebuild docx from edited text
  const [convertingPdf, setConvertingPdf] = useState(false); // server PDF convert

  // editable content DOM ref (contentEditable div)
  const editorRef = useRef<HTMLDivElement | null>(null);

  // high-fidelity preview DOM ref (for docx-preview)
  const previewRef = useRef<HTMLDivElement | null>(null);

  // cleanup object URLs (PDF) when unmount or modal close
  useEffect(() => {
    return () => {
      if (docState?.pdfUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(docState.pdfUrl);
      }
    };
  }, [docState]);

  // picker modal helpers
  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => {
    if (generating) return;
    setIsPickerOpen(false);
  };

  // result modal close helper
  const closeResult = () => {
    if (docState?.pdfUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(docState.pdfUrl);
    }
    setDocState(null);
    setIsResultOpen(false);
  };

  // =========================
  // Utility functions
  // =========================

  // 1. download template docx as ArrayBuffer
  const fetchArrayBuffer = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
    return res.arrayBuffer();
  };

  // 2. fill {{placeholders}} using docxtemplater -> return filled DOCX Blob
  const fillTemplateToDocxBlob = (
    buf: ArrayBuffer,
    data: Record<string, any>
  ) => {
    const zip = new PizZip(buf);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" },
    });

    doc.setData(data);

    try {
      doc.render();
    } catch (e: any) {
      console.error("Docxtemplater render error:", e);
      throw new Error(
        "Failed to fill template. Please check variable placeholders."
      );
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    return out as Blob;
  };

  // 3. DOCX Blob → editable HTML (mammoth). This loses some complex layout, but gives text.
  const docxBlobToEditableHtml = async (docBlob: Blob): Promise<string> => {
    const ab = await docBlob.arrayBuffer();
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: ab });
    return html;
  };

  // 4. edited HTML → DOCX Blob (html-docx-js). This loses high-end Word styling, but round-trips the text.
  const htmlToDocxBlob = async (html: string): Promise<Blob> => {
    const htmlDocx = (await import("html-docx-js/dist/html-docx")).default;
    const wrappedHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charSet="utf-8" /></head>
        <body>${html}</body>
      </html>`;
    const blob = htmlDocx.asBlob(wrappedHtml);
    return blob;
  };

  // 5. render DOCX visually with docx-preview into previewRef
  // 5. render DOCX visually with docx-preview into previewRef
  const renderAccuratePreview = useCallback(async (blob: Blob | null) => {
    if (!blob || !previewRef.current) {
      return null;
    }

    const container = previewRef.current;
    container.innerHTML = "";

    try {
      const { renderAsync } = await import("docx-preview");
      const ab = await blob.arrayBuffer();

      // Render into container
      await renderAsync(ab, container, undefined, {
        className: "docx-wrapper",
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
      });

      // --- PATCH 1: normalize text color so it's readable ---
      // Some templates use white text for headers/body. On white bg it's invisible.
      // We'll check computed color; if it's too light, force black.
      const normalizeTextColor = () => {
        // Query all text elements that might carry inline styles
        const textNodes = container.querySelectorAll<HTMLElement>(
          ".docx p, .docx span, .docx div, .docx li"
        );

        textNodes.forEach((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color; // like 'rgb(255, 255, 255)'
          // parse rgb(...) → [r,g,b]
          const match = color.match(
            /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
          );
          if (!match) return;
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);

          // compute simple luminance-like brightness
          // classic formula: 0 (black) ... 255 (white-ish)
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          // if it's too bright (super light on white bg), force black
          if (brightness > 200) {
            // override inline to something readable
            el.style.color = "#000000";
          }
        });
      };

      normalizeTextColor();

      // --- PATCH 2: scale page(s) to fit width ---
      requestAnimationFrame(() => {
        const pageEl = container.querySelector<HTMLElement>(".docx");
        if (!pageEl) return;

        const pageWidthPx = pageEl.scrollWidth;
        const maxWidthPx = container.clientWidth;

        if (pageWidthPx > 0 && maxWidthPx > 0) {
          // downscale only (never blow up)
          const scale = Math.min(1, maxWidthPx / pageWidthPx);

          pageEl.style.transformOrigin = "top left";
          pageEl.style.transform = `scale(${scale})`;

          const scaledHeight = pageEl.scrollHeight * scale;
          container.style.height = `${scaledHeight}px`;
        }
      });

      return { success: true, error: null as string | null };
    } catch (error: any) {
      console.error("Preview render error:", error);
      container.innerHTML = "";

      const errorMessage =
        error?.message || "Failed to render document preview.";
      return { success: false, error: errorMessage };
    }
  }, []);

  // whenever the modal opens AND we have a docBlob AND preview isn't ready,
  // actually render the preview now that previewRef is mounted.
  useEffect(() => {
    (async () => {
      if (
        isResultOpen &&
        docState?.docBlob &&
        previewRef.current &&
        !docState.previewReady
      ) {
        const previewResult = await renderAccuratePreview(docState.docBlob);
        if (!previewResult) return;

        setDocState((prev) =>
          prev
            ? {
                ...prev,
                previewReady: true,
                previewError: previewResult.success
                  ? null
                  : previewResult.error || "Failed to render document preview.",
              }
            : prev
        );
      }
    })();
  }, [
    isResultOpen,
    docState?.docBlob,
    docState?.previewReady,
    renderAccuratePreview,
  ]);

  // map candidate data into template placeholders
  const buildTemplateVariables = () => {
    const candidateName = candidate?.user.name || "";
    const candidateUser = candidate?.user ?? null;
    const candidateJob = candidate?.job ?? null;
    const candidateSchedule = schedules.length ? schedules : null;

    return {
      candidate_full_name: candidateName,
      address: candidateUser?.address || "",
      no_phone: candidateUser?.phone || "",
      no_identity: candidateUser?.no_identity || "",
      position: candidateJob?.name || "",
      start_date: candidate?.createdAt ? formatDate(candidate.createdAt) : "",
      today: formatDate(new Date().toISOString()),
      candidate,
      user: candidateUser,
      job: candidateJob,
      schedules: candidateSchedule,
    };
  };

  // =========================
  // Step 1: Generate contract from template
  // =========================
  const handleGenerateContract = useCallback(async () => {
    if (!selectedTemplateId) {
      message.warning("Please select a contract template first.");
      return;
    }
    if (!selectedTemplate?.filePath) {
      message.error("Template URL not found.");
      return;
    }

    try {
      setGenerating(true);

      // 1. get template .docx as ArrayBuffer
      const buf = await fetchArrayBuffer(selectedTemplate.filePath);

      // 2. build variables for placeholders
      const vars = buildTemplateVariables();

      // 3. fill template -> DOCX blob
      const filledBlob = fillTemplateToDocxBlob(buf, vars);

      // 4. convert that DOCX into editable HTML
      const editableHtml = await docxBlobToEditableHtml(filledBlob);

      // 5. suggest filename
      const cleanedBaseName =
        (selectedTemplate.name || "Contract")
          .replace(/[^\w\- ]+/g, "")
          .trim() || "Contract";

      const suggestedDocName = `${cleanedBaseName} - ${
        vars.candidate_full_name || "Candidate"
      }.docx`;

      // 6. store state
      setDocState({
        docBlob: filledBlob,
        docName: suggestedDocName,
        editedHtml: editableHtml,
        previewReady: false, // we'll render preview after modal mounts
        previewError: null,
        pdfBlob: null,
        pdfName: undefined,
        pdfUrl: undefined,
      });

      // open result modal AFTER setting state
      setIsPickerOpen(false);
      setIsResultOpen(true);
      message.success("Document generated successfully.");
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Failed to generate document.");
    } finally {
      setGenerating(false);
    }
  }, [selectedTemplateId, selectedTemplate, candidate]);

  // =========================
  // Step 2: Apply edits / rebuild DOCX
  // =========================
  const handleApplyEdits = useCallback(async () => {
    if (!docState) {
      message.error("No document to update.");
      return;
    }

    try {
      setApplyingEdits(true);

      // 1. get updated HTML from editor
      const latestHtml =
        editorRef.current?.innerHTML ?? docState.editedHtml ?? "";

      // 2. convert that HTML back to DOCX blob
      const rebuiltBlob = await htmlToDocxBlob(latestHtml);

      // 3. clear old PDF url if any (it's outdated now)
      if (docState.pdfUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(docState.pdfUrl);
      }

      // 4. update state: new doc blob, new editedHtml, reset previewReady
      setDocState({
        docBlob: rebuiltBlob,
        docName: docState.docName,
        editedHtml: latestHtml,
        previewReady: false, // need rerender preview with new blob
        previewError: null,
        pdfBlob: null,
        pdfName: undefined,
        pdfUrl: undefined,
      });

      message.success("Edits applied.");
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Failed to apply edits.");
    } finally {
      setApplyingEdits(false);
    }
  }, [docState]);

  // After Apply Edits we set previewReady:false,
  // and our useEffect above will notice that and re-render preview
  // next render tick (modal is still open, docBlob changed).

  // =========================
  // Step 3: Convert DOCX -> PDF via backend API
  // =========================
  const handleConvertToPdf = useCallback(async () => {
    if (!docState?.docBlob) {
      message.error("No document found to convert.");
      return;
    }

    try {
      setConvertingPdf(true);

      // make a File we can send via FormData
      const fileForServer = new File([docState.docBlob], docState.docName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const fd = new FormData();
      fd.append("file", fileForServer);

      const res = await fetch("/api/convert/docs-pdf", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Convert error ${res.status}`);
      }

      const pdfBlob = await res.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const pdfName = docState.docName.replace(/\.docx$/i, "") + ".pdf";

      // cleanup old pdf url if existed
      if (docState.pdfUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(docState.pdfUrl);
      }

      setDocState({
        ...docState,
        pdfBlob,
        pdfUrl,
        pdfName,
      });

      message.success("Converted to PDF.");
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Convert to PDF failed.");
    } finally {
      setConvertingPdf(false);
    }
  }, [docState]);

  // =========================
  // Download helpers
  // =========================
  const handleDownloadDocx = useCallback(() => {
    if (!docState?.docBlob) return;
    const url = URL.createObjectURL(docState.docBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = docState.docName || "Contract.docx";
    a.click();
    URL.revokeObjectURL(url);
  }, [docState]);

  const handleDownloadPdf = useCallback(() => {
    if (!docState?.pdfBlob || !docState.pdfUrl) return;
    const a = document.createElement("a");
    a.href = docState.pdfUrl;
    a.download = docState.pdfName || "Contract.pdf";
    a.click();
  }, [docState]);

  // =========================
  // Tabs content for the result modal
  // =========================
  const resultTabs = useMemo(() => {
    if (!docState) return [];

    return [
      {
        key: "preview",
        label: (
          <Space>
            <FileSearchOutlined />
            <span>Preview (Exact Layout)</span>
          </Space>
        ),
        children: (
          <div
            style={{
              maxHeight: "60vh",
              overflow: "auto",
              background: "#f5f5f5",
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
              position: "relative",
            }}
          >
            {docState.previewError && (
              <Alert
                type="error"
                message="Preview could not be rendered"
                description={docState.previewError}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <div
              ref={previewRef}
              style={{
                position: "relative",
                width: "100%",
              }}
            />
            {!docState.previewReady && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <Spin />
              </div>
            )}
          </div>
        ),
      },
      {
        key: "edit",
        label: (
          <Space>
            <EditOutlined />
            <span>Editable Content</span>
          </Space>
        ),
        children: (
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              background: "#f5f5f5",
              border: "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                background: "#fff",
                color: "#000",
                width: 800,
                maxWidth: "100%",
                margin: "0 auto",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: "32px 40px",
                lineHeight: 1.5,
                fontSize: 14,
                fontFamily:
                  "Helvetica, Arial, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                whiteSpace: "normal",
                wordBreak: "break-word",
                outline: "none",
              }}
              dangerouslySetInnerHTML={{
                __html: docState.editedHtml || "",
              }}
            />
          </div>
        ),
      },
      {
        key: "info",
        label: (
          <Space>
            <DownloadOutlined />
            <span>Export Info</span>
          </Space>
        ),
        children: (
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div>
              <Text type="secondary">DOCX file name</Text>
              <div>
                <Text strong>{docState.docName}</Text>
              </div>
            </div>

            {docState.pdfName && (
              <div>
                <Text type="secondary">PDF file name</Text>
                <div>
                  <Text strong>{docState.pdfName}</Text>
                </div>
              </div>
            )}

            <Text type="secondary">Preview (Exact Layout)</Text>
          </Space>
        ),
      },
    ];
  }, [docState]);

  // =========================
  // Render page
  // =========================

  if (!candidate) {
    return (
      <div
        style={{
          height: 560,
          display: "grid",
          placeItems: "center",
          color: "#bfbfbf",
        }}
      >
        <Empty description="No Candidate Selected" />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT: Candidate Info */}
      <Col xs={24} md={8}>
        <CandidateInfoPanel
          email={candidate.user.email}
          phone={candidate.user.phone}
          dateOfBirth={candidate.user.date_of_birth}
          jobName={candidate.job?.name}
          appliedAt={candidate.createdAt}
          stage={candidate.stage}
          updatedAt={candidate.updatedAt}
          cvUrl={candidate.user.curiculum_vitae_url}
          portfolioUrl={candidate.user.portfolio_url}
        />
      </Col>

      {/* RIGHT: Schedule + Contract */}
      <Col xs={24} md={16}>
        <Space
          direction="vertical"
          style={{ display: "block", width: "100%" }}
          size={12}
        >
          <Button onClick={openPicker} icon={<FileWordOutlined />}>
            Create Contract
          </Button>

          {listLoading ? (
            <Card style={{ borderRadius: 14 }}>
              <Skeleton active />
            </Card>
          ) : hasSchedules ? (
            <Card
              style={{ borderRadius: 14 }}
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Schedule</span>
                </Space>
              }
              headStyle={{ borderBottom: "none" }}
            >
              <List
                dataSource={schedules}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space size={8} wrap>
                          <strong>{formatDate(item.date)}</strong>
                          <span>at</span>
                          <strong>{formatTime(item.start_time)}</strong>
                        </Space>
                      }
                      description={<span>Location: {item.location.name}</span>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          ) : (
            <Card style={{ borderRadius: 14 }}>
              <ScheduleHiredForm
                candidateId={candidate.id!}
                loading={onLoadingCreate}
                onSubmit={onCreateSchedule}
              />
            </Card>
          )}
        </Space>
      </Col>

      {/* MODAL: pick template */}
      <Modal
        title="Select Contract Template"
        open={isPickerOpen}
        onCancel={closePicker}
        footer={[
          <Button key="cancel" onClick={closePicker} disabled={generating}>
            Cancel
          </Button>,
          <Button
            key="generate"
            type="primary"
            loading={generating}
            disabled={!selectedTemplateId}
            onClick={handleGenerateContract}
            icon={<ReloadOutlined />}
          >
            Generate
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Template" required>
            <Select
              placeholder="Choose a template"
              value={selectedTemplateId || undefined}
              onChange={(val) => setSelectedTemplateId(val)}
              options={(templates || []).map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />
          </Form.Item>

          {selectedTemplate?.filePath && (
            <Text type="secondary" style={{ wordBreak: "break-all" }}>
              Source: {selectedTemplate.filePath}
            </Text>
          )}
        </Form>
      </Modal>

      {/* MODAL: preview / edit / export */}
      <Modal
        open={isResultOpen}
        onCancel={closeResult}
        width={1100}
        bodyStyle={{
          maxHeight: "75vh",
          overflowY: "auto",
        }}
        title="Contract Preview & Export"
        footer={[
          <Button key="close" onClick={closeResult}>
            Close
          </Button>,

          <Button
            key="apply"
            icon={<SaveOutlined />}
            loading={applyingEdits}
            onClick={handleApplyEdits}
            disabled={!docState}
          >
            Apply Edits
          </Button>,

          <Button
            key="download-docx"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadDocx}
            disabled={!docState?.docBlob}
          >
            Download DOCX
          </Button>,

          <Button
            key="convert"
            icon={<FilePdfOutlined />}
            onClick={handleConvertToPdf}
            loading={convertingPdf}
            disabled={!docState?.docBlob || !!docState?.pdfBlob}
          >
            {docState?.pdfBlob ? "Converted" : "Convert to PDF"}
          </Button>,

          <Button
            key="download-pdf"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPdf}
            disabled={!docState?.pdfBlob}
          >
            Download PDF
          </Button>,
        ]}
      >
        {!docState ? (
          <div
            style={{
              minHeight: "40vh",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Spin />
          </div>
        ) : (
          <Tabs defaultActiveKey="preview" items={resultTabs} />
        )}
      </Modal>
    </Row>
  );
}
