"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Empty,
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
  Input,
  DatePicker,
  FormInstance,
  Tag,
} from "antd";
import {
  FileWordOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  FileSearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import type { ApplicantDataModel } from "@/app/models/applicant";
import { ScheduleHiredDataModel } from "@/app/models/hired";

import ScheduleHiredForm, {
  ScheduleHiredFormValues,
} from "@/app/components/common/form/admin/hired";
import { formatDate } from "@/app/utils/date-helper";
import CandidateInfoPanel from "@/app/components/common/information-panel";
import {
  useContractTemplate,
  useContractTemplates,
} from "@/app/hooks/contract-template";

// templating
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

// supabase upload
import { createClient } from "@supabase/supabase-js";
import {
  useOfferingContractByApplicantId,
  useOfferingContracts,
} from "@/app/hooks/offering-contract";
import type { ContractTemplateDataModel } from "@/app/models/contract-template";

// schedule pretty card (compact timeline)
import SchedulePretty from "./ScheduleCard";

const { Text } = Typography;

/** ==== STATE TYPE ==== */
type GeneratedDoc = {
  templateUrl: string;
  docBlob: Blob | null;
  docName: string;
  vars: TemplateVariables;
  pdfBlob?: Blob | null;
  pdfName?: string;
  pdfUrl?: string;
};

type ContractFormValues = {
  candidate_full_name?: string;
  no_identity?: string;
  address?: string;
  no_phone?: string;
  position?: string;
  duties?: string[];
  month?: string;
  start_date?: Dayjs;
  salary?: string;
  bonus?: string[];
};

type TemplateVariables = {
  candidate_full_name: string;
  address: string;
  no_phone: string;
  no_identity: string;
  position: string;
  duties: string[];
  month: string;
  start_date: string;
  end_date: string;
  salary: string;
  sal: string;
  bonus: string[];
  candidate: ApplicantDataModel | null;
  user: ApplicantDataModel["user"] | null;
  job: ApplicantDataModel["job"] | null;
  schedules: ScheduleHiredDataModel[] | null;
  [key: string]: unknown;
};

/** ==== SUPABASE CLIENT ==== */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseBucket = "web-oss-recruitment";
const supabase = createClient(supabaseUrl, supabaseKey);

/** ==== HELPERS ==== */
const fetchArrayBuffer = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
  return res.arrayBuffer();
};

// pecah textarea/baris menjadi array item
const parseMultilineList = (
  vals?: Array<string | null | undefined>
): string[] =>
  (vals ?? [])
    .flatMap((value) =>
      String(value ?? "")
        .split(/\r?\n|;/g)
        .map((s) => s.replace(/^\s*[-–—•]\s*/, ""))
    )
    .map((s) => s.trim())
    .filter(Boolean);

const fillTemplateToDocxBlob = (buf: ArrayBuffer, data: TemplateVariables) => {
  const zip = new PizZip(buf);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });
  doc.setData(data);
  try {
    doc.render();
  } catch (error) {
    console.error("Docxtemplater render error:", error);
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

const revokeBlobUrl = (url?: string) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

const buildTemplateVariables = (
  candidate: ApplicantDataModel | null,
  schedules: ScheduleHiredDataModel[]
): TemplateVariables => {
  const candidateName = candidate?.user.name || "";
  const candidateUser = candidate?.user ?? null;
  const candidateJob = candidate?.job ?? null;
  const startDefault = candidate?.createdAt
    ? formatDate(candidate.createdAt)
    : "";

  return {
    candidate_full_name: candidateName,
    address: candidateUser?.address || "",
    no_phone: candidateUser?.phone || "",
    no_identity: candidateUser?.no_identity || "",
    position: candidateJob?.name || "",
    duties: [] as string[],
    month: "",
    start_date: startDefault,
    end_date: "",
    salary: "",
    sal: "",
    bonus: [] as string[],
    candidate,
    user: candidateUser,
    job: candidateJob,
    schedules: schedules.length ? schedules : null,
  };
};

const mapTemplateVarsToFormValues = (
  vars: TemplateVariables
): ContractFormValues => ({
  candidate_full_name: vars.candidate_full_name,
  address: vars.address,
  no_phone: vars.no_phone,
  no_identity: vars.no_identity,
  position: vars.position,
  duties: Array.isArray(vars.duties) && vars.duties.length ? vars.duties : [""],
  month: vars.month,
  start_date: vars.start_date ? dayjs(vars.start_date) : undefined,
  salary: vars.salary,
  bonus: Array.isArray(vars.bonus) && vars.bonus.length ? vars.bonus : [""],
});

const cloneTemplateVariables = (
  vars: TemplateVariables
): TemplateVariables => ({
  ...vars,
  duties: Array.isArray(vars.duties) ? [...vars.duties] : [],
  bonus: Array.isArray(vars.bonus) ? [...vars.bonus] : [],
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
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
  onCreateSchedule: (payload: ScheduleHiredFormValues) => Promise<void>;
  onLoadingCreate: boolean;
}) {
  // ===== Filter schedules untuk kandidat ini
  const schedules = useMemo(
    () => listData.filter((s) => s.applicant_id === candidate?.id),
    [listData, candidate?.id]
  );
  const hasSchedules = schedules.length > 0;
  const templateDefaults = useMemo(
    () => buildTemplateVariables(candidate ?? null, schedules),
    [candidate, schedules]
  );

  const { onCreate: onCreateContract } = useOfferingContracts({});
  const { data: contractByApplicant } = useOfferingContractByApplicantId({
    applicant_id: candidate?.id || "",
  });
  const hasExistingContract = Boolean(
    contractByApplicant?.id || contractByApplicant?.filePath
  );

  // ===== Modal: pilih template
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templates } = useContractTemplates({});
  const { data: selectedTemplate } = useContractTemplate({
    id: selectedTemplateId || "",
  });

  // ===== Modal: hasil (preview/edit/export)
  const [isResultOpen, setIsResultOpen] = useState(false);

  // state kontrak
  const [docState, setDocState] = useState<GeneratedDoc | null>(null);

  // loading flags
  const [generating, setGenerating] = useState(false);
  const [applyingEdits, setApplyingEdits] = useState(false);
  const [convertingPdf, setConvertingPdf] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);

  // form edit variabel
  const [form] = Form.useForm<ContractFormValues>();

  // cleanup blob URL PDF saat unmount/tutup
  useEffect(() => {
    return () => revokeBlobUrl(docState?.pdfUrl);
  }, [docState]);

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => {
    if (generating) return;
    setIsPickerOpen(false);
  };
  const closeResult = () => {
    revokeBlobUrl(docState?.pdfUrl);
    setDocState(null);
    setIsResultOpen(false);
  };

  /** Convert DOCX → PDF via API server */
  const convertDocxBlobToPdf = useCallback(
    async (docBlob: Blob, docName: string) => {
      setConvertingPdf(true);
      try {
        const fileForServer = new File([docBlob], docName, {
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
        const pdfName = docName.replace(/\.docx$/i, "") + ".pdf";
        setDocState((prev) => {
          if (!prev) return prev;
          revokeBlobUrl(prev.pdfUrl);
          return { ...prev, pdfBlob, pdfUrl, pdfName };
        });
        message.success("Converted to PDF.");
      } finally {
        setConvertingPdf(false);
      }
    },
    []
  );

  // =========================
  // Step 1: Generate dari template + auto PDF
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

      const buf = await fetchArrayBuffer(selectedTemplate.filePath);
      const vars = cloneTemplateVariables(templateDefaults);

      const filledBlob = fillTemplateToDocxBlob(buf, vars);

      const cleanedBaseName =
        (selectedTemplate.name || "Contract")
          .replace(/[^\w\- ]+/g, "")
          .trim() || "Contract";
      const suggestedDocName = `${cleanedBaseName} - ${
        vars.candidate_full_name || "Candidate"
      }.docx`;

      setDocState({
        templateUrl: selectedTemplate.filePath,
        docBlob: filledBlob,
        docName: suggestedDocName,
        vars,
        pdfBlob: null,
        pdfName: undefined,
        pdfUrl: undefined,
      });

      // isi form awal
      form.setFieldsValue(mapTemplateVarsToFormValues(vars));

      setIsPickerOpen(false);
      setIsResultOpen(true);

      // auto convert untuk preview
      await convertDocxBlobToPdf(filledBlob, suggestedDocName);
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error));
    } finally {
      setGenerating(false);
    }
  }, [
    selectedTemplateId,
    selectedTemplate,
    convertDocxBlobToPdf,
    form,
    templateDefaults,
  ]);

  // =========================
  // Step 2: Apply Edits → re-render + auto PDF
  // =========================
  const handleApplyEdits = useCallback(async () => {
    if (!docState) {
      message.error("No document to update.");
      return;
    }
    try {
      setApplyingEdits(true);

      const v = await form.validateFields();

      const next: TemplateVariables = { ...docState.vars };

      // IDENTITAS
      next.candidate_full_name = v.candidate_full_name ?? "";
      next.address = v.address ?? "";
      next.no_phone = v.no_phone ?? "";
      next.no_identity = v.no_identity ?? "";

      // PASAL 1
      next.position = v.position ?? "";
      next.duties = parseMultilineList(v.duties);

      // PASAL 2
      const monthNum: number = Number(v.month ?? 0);
      next.month = isNaN(monthNum) ? "" : String(monthNum);

      const sd: Dayjs | undefined = v.start_date
        ? dayjs(v.start_date)
        : undefined;
      next.start_date = sd ? sd.format("YYYY-MM-DD") : "";

      // end_date = start_date + month bulan - 1 hari
      if (sd && monthNum > 0) {
        const ed = sd.add(monthNum, "month").subtract(1, "day");
        next.end_date = ed.format("YYYY-MM-DD");
      } else {
        next.end_date = "";
      }

      // PASAL 4
      next.salary = v.salary ?? "";
      next.sal = next.salary; // alias
      next.bonus = parseMultilineList(v.bonus);

      // render ulang
      const buf = await fetchArrayBuffer(docState.templateUrl);
      const rebuiltBlob = fillTemplateToDocxBlob(buf, next);

      revokeBlobUrl(docState.pdfUrl);

      setDocState({
        ...docState,
        docBlob: rebuiltBlob,
        vars: next,
        pdfBlob: null,
        pdfName: undefined,
        pdfUrl: undefined,
      });

      message.success("Edits applied. Regenerating PDF preview...");
      await convertDocxBlobToPdf(rebuiltBlob, docState.docName);
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error));
    } finally {
      setApplyingEdits(false);
    }
  }, [docState, form, convertDocxBlobToPdf]);

  // =========================
  // Step 3: Upload ke Supabase lalu create record
  // =========================
  const uploadToSupabase = async (file: Blob, fileName: string) => {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase env (NEXT_PUBLIC_SUPABASE_URL/KEY) belum diset."
      );
    }
    const safeName = fileName.replace(/\s+/g, "_");
    const folder = `contracts/${candidate?.id || "general"}`;
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(supabaseBucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(path);
    if (!pub?.publicUrl) throw new Error("Gagal mendapatkan public URL.");
    return { path, publicUrl: pub.publicUrl };
  };

  const uploadPdfToSupabase = async (file: Blob, fileName: string) => {
    const safeName = fileName.replace(/\s+/g, "_").replace(/\.docx$/i, ".pdf");
    const folder = `contracts`;
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from(supabaseBucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(path);
    if (!pub?.publicUrl) throw new Error("Gagal mendapatkan public URL (PDF).");
    return { path, publicUrl: pub.publicUrl };
  };

  const handleCreateContract = useCallback(async () => {
    if (!docState?.docBlob) {
      message.error("No document to create contract.");
      return;
    }
    try {
      setCreatingContract(true);

      // 1) Upload DOCX
      const { publicUrl: docxUrl } = await uploadToSupabase(
        docState.docBlob,
        docState.docName
      );

      // 2) Jika ada PDF, upload juga
      let pdfUrl: string | null = null;
      if (docState.pdfBlob) {
        const up = await uploadPdfToSupabase(
          docState.pdfBlob,
          docState.pdfName || docState.docName.replace(/\.docx$/i, ".pdf")
        );
        pdfUrl = up.publicUrl;
      }

      // 3) Create record ke API
      const payload = {
        applicant_id: candidate?.id || "",
        name: docState.pdfName || docState.docName,
        filePath: pdfUrl ?? docxUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onCreateContract(payload);

      message.success("Contract created & uploaded to Supabase.");
      // closeResult(); // opsional
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error));
    } finally {
      setCreatingContract(false);
    }
  }, [docState, candidate?.id, onCreateContract]);

  // =========================
  // Convert manual
  // =========================
  const handleConvertToPdf = useCallback(async () => {
    if (!docState?.docBlob) {
      message.error("No document found to convert.");
      return;
    }
    await convertDocxBlobToPdf(docState.docBlob, docState.docName);
  }, [docState, convertDocxBlobToPdf]);

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
          {/* Schedule */}
          {listLoading ? (
            <Card style={{ borderRadius: 14 }}>
              <Skeleton active />
            </Card>
          ) : hasSchedules ? (
            schedules.map((schedule, index) => (
              <SchedulePretty
                key={schedule.id ?? index}
                date={schedule.date}
                time={schedule.start_time}
                location={{
                  name: schedule.location?.name ?? "-",
                  description: schedule.location?.address ?? undefined,
                }}
              />
            ))
          ) : (
            <Card style={{ borderRadius: 14 }}>
              <ScheduleHiredForm
                candidateId={candidate.id!}
                loading={onLoadingCreate}
                onSubmit={onCreateSchedule}
              />
            </Card>
          )}

          {/* Contract Card — SELALU tampil di bawah schedule */}
          <Card
            style={{ borderRadius: 14, marginTop: 16 }}
            title={
              <Space>
                <FileWordOutlined />
                <span>File Contract</span>
              </Space>
            }
            extra={
              hasExistingContract ? (
                <Tag color="green">Created</Tag>
              ) : (
                <Tag>Not Created</Tag>
              )
            }
          >
            {hasExistingContract ? (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <div>
                  {/* <Text type="secondary" style={{ marginBottom: 25 }}>File Contract</Text> */}
                  <div>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      href={contractByApplicant?.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginRight: 8 }}
                    >
                      Open
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      href={contractByApplicant?.filePath}
                      download
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </Space>
            ) : (
              <Space direction="vertical" size={8}>
                <Text type="secondary">
                  No contract has been generated for this candidate.
                </Text>
                <Space>
                  <Select
                    style={{ minWidth: 260 }}
                    placeholder="Choose a contract template"
                    value={selectedTemplateId || undefined}
                    onChange={setSelectedTemplateId}
                    options={(templates || []).map((t) => ({
                      label: t.name,
                      value: t.id,
                    }))}
                  />
                  <Button
                    type="primary"
                    icon={<FileWordOutlined />}
                    onClick={() => {
                      if (!selectedTemplateId) {
                        message.info("Please select a template first.");
                        return;
                      }
                      openPicker();
                    }}
                  >
                    Create Contract
                  </Button>
                </Space>
                {selectedTemplateId ? (
                  <Text type="secondary">
                    Selected template:{" "}
                    <Text strong>
                      {
                        (templates || []).find(
                          (t) => t.id === selectedTemplateId
                        )?.name
                      }
                    </Text>
                  </Text>
                ) : null}
              </Space>
            )}
          </Card>
        </Space>
      </Col>

      {/* MODAL: pilih template (dipakai saat Create Contract ditekan) */}
      <TemplatePickerModal
        open={isPickerOpen}
        generating={generating}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
        onGenerate={handleGenerateContract}
        onCancel={closePicker}
        selectedTemplatePath={selectedTemplate?.filePath}
      />

      {/* MODAL: preview / edit / export */}
      <Modal
        open={isResultOpen}
        onCancel={closeResult}
        width={1100}
        bodyStyle={{ maxHeight: "75vh", overflowY: "auto" }}
        title="Contract Preview & Export"
        footer={[
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
            key="create"
            type="primary"
            onClick={handleCreateContract}
            loading={creatingContract}
            disabled={!docState?.docBlob}
          >
            Create Contract (Upload to Supabase)
          </Button>,
          <Button
            key="download-docx"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (!docState?.docBlob) return;
              const url = URL.createObjectURL(docState.docBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = docState.docName || "Contract.docx";
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!docState?.docBlob}
          >
            Download DOCX
          </Button>,
          <Button
            key="convert"
            icon={<FilePdfOutlined />}
            onClick={handleConvertToPdf}
            loading={convertingPdf}
            disabled={
              !docState?.docBlob || (!!docState?.pdfBlob && !convertingPdf)
            }
          >
            {docState?.pdfBlob ? "Reconvert PDF" : "Convert to PDF"}
          </Button>,
          <Button
            key="download-pdf"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (!docState?.pdfBlob || !docState?.pdfUrl) return;
              const a = document.createElement("a");
              a.href = docState.pdfUrl;
              a.download = docState.pdfName || "Contract.pdf";
              a.click();
            }}
            disabled={!docState?.pdfBlob}
          >
            Download PDF
          </Button>,
        ]}
      >
        {!docState ? (
          <div
            style={{ minHeight: "40vh", display: "grid", placeItems: "center" }}
          >
            <Spin />
          </div>
        ) : (
          <ContractResultTabs
            docState={docState}
            convertingPdf={convertingPdf}
            onConvertToPdf={handleConvertToPdf}
            form={form}
          />
        )}
      </Modal>
    </Row>
  );
}

/* ====================== SUB COMPONENTS (Modal & Tabs) ====================== */
type ContractResultTabsProps = {
  docState: GeneratedDoc;
  convertingPdf: boolean;
  onConvertToPdf: () => Promise<void>;
  form: FormInstance<ContractFormValues>;
};

const ContractResultTabs = ({
  docState,
  convertingPdf,
  onConvertToPdf,
  form,
}: ContractResultTabsProps) => {
  const items = useMemo(
    () => [
      {
        key: "preview",
        label: (
          <Space>
            <FileSearchOutlined />
            <span>Preview Contract</span>
          </Space>
        ),
        children: (
          <PreviewTabContent
            docState={docState}
            convertingPdf={convertingPdf}
            onConvertToPdf={onConvertToPdf}
          />
        ),
      },
      {
        key: "edit",
        label: (
          <Space>
            <EditOutlined />
            <span>Edit Data Contract</span>
          </Space>
        ),
        children: <EditTabContent form={form} />,
      },
      {
        key: "info",
        label: (
          <Space>
            <DownloadOutlined />
            <span>Export Info</span>
          </Space>
        ),
        children: <InfoTabContent docState={docState} />,
      },
    ],
    [docState, convertingPdf, onConvertToPdf, form]
  );

  return <Tabs defaultActiveKey="preview" items={items} />;
};

type PreviewTabContentProps = {
  docState: GeneratedDoc;
  convertingPdf: boolean;
  onConvertToPdf: () => Promise<void>;
};

const PreviewTabContent = ({
  docState,
  convertingPdf,
  onConvertToPdf,
}: PreviewTabContentProps) => (
  <div
    style={{
      maxHeight: "60vh",
      overflow: "hidden",
      background: "#f5f5f5",
      border: "1px solid #d9d9d9",
      borderRadius: 8,
      padding: 16,
      position: "relative",
    }}
  >
    {convertingPdf && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.6)",
          zIndex: 1,
        }}
      >
        <Spin />
      </div>
    )}

    {docState.pdfUrl ? (
      <iframe
        src={docState.pdfUrl}
        style={{
          width: "100%",
          height: "60vh",
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          background: "#fff",
        }}
      />
    ) : (
      <div
        style={{
          minHeight: "40vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Space direction="vertical" align="center">
          <Empty description="No PDF yet" />
          <Button
            icon={<FilePdfOutlined />}
            onClick={onConvertToPdf}
            disabled={!docState.docBlob}
            loading={convertingPdf}
          >
            Convert to PDF for Preview
          </Button>
        </Space>
      </div>
    )}
  </div>
);

const EditTabContent = ({
  form,
}: {
  form: FormInstance<ContractFormValues>;
}) => (
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
    <Form
      form={form}
      layout="vertical"
      style={{
        background: "#fff",
        width: 860,
        maxWidth: "100%",
        margin: "0 auto",
        padding: "24px 28px",
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <Alert
        style={{ margin: "8px 0 16px" }}
        type="info"
        message="Personal Information"
        showIcon
      />
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Form.Item name="candidate_full_name" label="Candidate Full Name">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="no_identity" label="Identity Number">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="no_phone" label="Phone">
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        style={{ margin: "8px 0 16px" }}
        type="info"
        message="ARTICLE 1 — Position & Duties"
        showIcon
      />
      <Form.Item name="position" label="Position">
        <Input />
      </Form.Item>
      <Form.List name="duties">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, idx) => (
              <Row
                key={field.key}
                gutter={8}
                align="middle"
                style={{ marginBottom: 8 }}
              >
                <Col flex="auto">
                  <Form.Item
                    {...field}
                    label={idx === 0 ? "Job Duties" : undefined}
                    name={[field.name]}
                    fieldKey={field.fieldKey}
                    rules={[
                      {
                        required: true,
                        message: "Fill the duty or remove this line.",
                      },
                    ]}
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      placeholder={`Job Duty ${idx + 1}`}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add("")}
            >
              Add Duty
            </Button>
          </>
        )}
      </Form.List>

      <Alert
        style={{ margin: "8px 0 16px" }}
        type="info"
        message="ARTICLE 2 — Employment Period"
        showIcon
      />
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Form.Item name="month" label="Month (duration in months)">
            <Input placeholder="e.g. 3" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="start_date" label="Start Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        style={{ margin: "8px 0 16px" }}
        type="info"
        message="ARTICLE 4 — Salary & Bonuses"
        showIcon
      />
      <Form.Item label="Salary Amount" name="salary">
        <Input placeholder="e.g. Rp 3.000.000" />
      </Form.Item>

      <Form.List name="bonus">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, idx) => (
              <Row
                key={field.key}
                gutter={8}
                align="middle"
                style={{ marginBottom: 8 }}
              >
                <Col flex="auto">
                  <Form.Item
                    {...field}
                    label={idx === 0 ? "Bonuses / Allowances" : undefined}
                    name={[field.name]}
                    fieldKey={field.fieldKey}
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      placeholder={`Bonus/Allowance ${idx + 1}`}
                    />
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add("")}
            >
              Add Bonus/Allowance
            </Button>
          </>
        )}
      </Form.List>
    </Form>

    <Alert
      style={{ marginTop: 12 }}
      type="info"
      message="Click Apply Edits to re-render the template and refresh the PDF preview."
      showIcon
    />
  </div>
);

const InfoTabContent = ({ docState }: { docState: GeneratedDoc }) => (
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

    <Text type="secondary">Preview uses PDF rendering for accuracy.</Text>
  </Space>
);

type TemplatePickerModalProps = {
  open: boolean;
  generating: boolean;
  templates?: ContractTemplateDataModel[];
  selectedTemplateId: string;
  onSelectTemplate: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
  selectedTemplatePath?: string;
};

const TemplatePickerModal = ({
  open,
  generating,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onGenerate,
  onCancel,
  selectedTemplatePath,
}: TemplatePickerModalProps) => {
  const options = useMemo(
    () =>
      (templates || []).map((template) => ({
        label: template.name,
        value: template.id,
      })),
    [templates]
  );

  return (
    <Modal
      title="Select Contract Template"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={generating}>
          Cancel
        </Button>,
        <Button
          key="generate"
          type="primary"
          loading={generating}
          disabled={!selectedTemplateId}
          onClick={onGenerate}
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
            onChange={onSelectTemplate}
            options={options}
          />
        </Form.Item>

        {selectedTemplatePath && (
          <Text type="secondary" style={{ wordBreak: "break-all" }}>
            Source: {selectedTemplatePath}
          </Text>
        )}
      </Form>
    </Modal>
  );
};
