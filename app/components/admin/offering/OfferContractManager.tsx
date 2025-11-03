"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  FormInstance,
  Input,
  List,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileDoneOutlined,
  FilePdfOutlined,
  FileSearchOutlined,
  FileWordOutlined,
  LinkOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { createClient } from "@supabase/supabase-js";

import { formatDate } from "@/app/utils/date-helper";
import type { ApplicantDataModel } from "@/app/models/applicant";
import type { ScheduleHiredDataModel } from "@/app/models/hired";
import type { ContractTemplateDataModel } from "@/app/models/contract-template";
import {
  useContractTemplate,
  useContractTemplates,
} from "@/app/hooks/contract-template";
import {
  useOfferingContractByApplicantId,
  useOfferingContracts,
} from "@/app/hooks/offering-contract";
import SupaFileUploader from "@/app/utils/pdf-uploader";

const { Text } = Typography;

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

type OfferChecklistKey = "contractFinalized" | "signatureDirectur" | "decisionCandidate";

type OfferChecklistItem = {
  key: OfferChecklistKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseBucket = "web-oss-recruitment";
const supabase = createClient(supabaseUrl, supabaseKey);

const fetchArrayBuffer = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.status}`);
  return res.arrayBuffer();
};

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

type OfferContractManagerProps = {
  candidate: ApplicantDataModel | null;
  schedules?: ScheduleHiredDataModel[];
};

export function OfferContractManager({
  candidate,
  schedules = [],
}: OfferContractManagerProps) {
  const queryClient = useQueryClient();
  const templateDefaults = useMemo(
    () => buildTemplateVariables(candidate ?? null, schedules),
    [candidate, schedules]
  );

  const { onCreate: onCreateContract } = useOfferingContracts({});
  const {
    data: contractByApplicant,
    onRequestDirectorSignature,
    onRequestDirectorSignatureLoading,
    onUploadDirectorSignature,
    onUploadDirectorSignatureLoading,
    onApplyCandidateSignature,
    onApplyCandidateSignatureLoading,
    onSendFinalEmail,
    onSendFinalEmailLoading,
  } = useOfferingContractByApplicantId({
    applicant_id: candidate?.id || "",
  });
  const hasExistingContract = Boolean(
    contractByApplicant?.id || contractByApplicant?.filePath
  );

  const hasAccepetedCandidate = Boolean(
    contractByApplicant?.candidateDecision === "ACCEPTED"
  );
  const directorSignatureSignedAt =
    contractByApplicant?.directorSignatureSignedAt || null;
  const hasDirectorSigned = Boolean(directorSignatureSignedAt);
  const directorSignatureRequestedAt =
    contractByApplicant?.directorSignatureRequestedAt || null;
  const directorSignatureUrl =
    contractByApplicant?.directorSignatureUrl || null;
  const directorSignaturePath =
    contractByApplicant?.directorSignaturePath || null;
  const candidateSignatureUrl =
    contractByApplicant?.candidateSignatureUrl || null;
  const candidateSignedPdfUrl =
    contractByApplicant?.candidateSignedPdfUrl || null;
  const candidateSignedPdfAt =
    contractByApplicant?.candidateSignedPdfAt || null;
  const candidateNotifyEmail = contractByApplicant?.notifyEmail || "";

  const defaultDirectorEmail = useMemo(
    () => process.env.NEXT_PUBLIC_DIRECTOR_SIGNATURE_EMAIL || "",
    []
  );
  const [directorEmail, setDirectorEmail] = useState(defaultDirectorEmail);

  useEffect(() => {
    setDirectorEmail(defaultDirectorEmail);
  }, [candidate?.id, defaultDirectorEmail]);

  const isDirectorEmailValid = useMemo(() => {
    if (!directorEmail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directorEmail);
  }, [directorEmail]);

  const [offerChecklist, setOfferChecklist] = useState<
    Record<OfferChecklistKey, boolean>
  >({
    contractFinalized: hasExistingContract,
    signatureDirectur: hasDirectorSigned,
    decisionCandidate: hasAccepetedCandidate,
  });
  const [offerTriggeredAt, setOfferTriggeredAt] = useState<string | null>(null);
  const [sendingOffer, setSendingOffer] = useState(false);

  useEffect(() => {
    setOfferChecklist((prev) =>
      prev.contractFinalized === hasExistingContract
        ? prev
        : { ...prev, contractFinalized: hasExistingContract }
    );
  }, [hasExistingContract]);

  useEffect(() => {
    setOfferChecklist((prev) =>
      prev.decisionCandidate === hasAccepetedCandidate
        ? prev
        : { ...prev, decisionCandidate: hasAccepetedCandidate }
    );
  }, [hasAccepetedCandidate]);

  useEffect(() => {
    setOfferChecklist((prev) =>
      prev.signatureDirectur === hasDirectorSigned
        ? prev
        : { ...prev, signatureDirectur: hasDirectorSigned }
    );
  }, [hasDirectorSigned]);

  const updateChecklist = useCallback(
    (key: OfferChecklistKey, value: boolean) => {
      setOfferChecklist((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleRequestSignature = useCallback(async () => {
    if (!contractByApplicant?.id) {
      message.warning("Generate the contract before requesting signature.");
      return;
    }
    if (!directorEmail) {
      message.warning("Please assign director email first.");
      return;
    }
    if (!isDirectorEmailValid) {
      message.warning("Director email is invalid.");
      return;
    }
    try {
      await onRequestDirectorSignature({
        contractId: contractByApplicant.id,
        email: directorEmail,
      });
    } catch (error) {
      message.error("Failed to send signature request email.");
    }
  }, [
    contractByApplicant?.id,
    directorEmail,
    isDirectorEmailValid,
    onRequestDirectorSignature,
  ]);

  const handleUploadDirectorSignature = useCallback(
    async (path: string, url: string) => {
      if (!contractByApplicant?.id) return;
      try {
        await onUploadDirectorSignature({
          contractId: contractByApplicant.id,
          signaturePath: path,
          signatureUrl: url,
        });
      } catch (error) {
        message.error("Failed to attach signed contract.");
      }
    },
    [contractByApplicant?.id, onUploadDirectorSignature]
  );

  const handleRemoveDirectorSignature = useCallback(async () => {
    if (!contractByApplicant?.id) return;
    try {
      await onUploadDirectorSignature({
        contractId: contractByApplicant.id,
        signaturePath: null,
        signatureUrl: null,
      });
    } catch (error) {
      message.error("Failed to remove signed contract.");
    }
  }, [contractByApplicant?.id, onUploadDirectorSignature]);

  const handleApplyCandidateSignature = useCallback(async () => {
    if (!contractByApplicant?.id) return;
    if (!candidateSignatureUrl) {
      message.warning("Candidate has not uploaded a signature yet.");
      return;
    }
    try {
      await onApplyCandidateSignature({ contractId: contractByApplicant.id });
      message.success("Candidate signature applied to contract.");
    } catch (error) {
      message.error("Failed to apply candidate signature.");
    }
  }, [
    candidateSignatureUrl,
    contractByApplicant?.id,
    onApplyCandidateSignature,
  ]);

  const handleSendFinalEmail = useCallback(async () => {
    if (!contractByApplicant?.id) return;
    if (!candidateSignedPdfUrl) {
      message.warning("Generate the signed PDF before sending email.");
      return;
    }
    if (!candidateNotifyEmail) {
      message.warning("Assign candidate email in the contract form first.");
      return;
    }
    try {
      await onSendFinalEmail({ contractId: contractByApplicant.id });
      message.success("Signed contract sent to candidate.");
    } catch (error) {
      message.error("Failed to send signed contract email.");
    }
  }, [
    candidateNotifyEmail,
    candidateSignedPdfUrl,
    contractByApplicant?.id,
    onSendFinalEmail,
  ]);

  const handleResetOfferChecklist = useCallback(() => {
    setOfferTriggeredAt(null);
    setOfferChecklist({
      contractFinalized: hasExistingContract,
      signatureDirectur: hasDirectorSigned,
      decisionCandidate: hasAccepetedCandidate,
    });
  }, [hasExistingContract, hasAccepetedCandidate, hasDirectorSigned]);

  const handleTriggerOfferReady = useCallback(async () => {
    setSendingOffer(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setOfferTriggeredAt(new Date().toISOString());
      message.success(
        "Offer-ready notification has been queued for the candidate."
      );
    } finally {
      setSendingOffer(false);
    }
  }, []);

  const checklistItems = useMemo<OfferChecklistItem[]>(() => {
    const directorDescription = hasDirectorSigned
      ? `Signed on ${dayjs(directorSignatureSignedAt).format(
          "MMM D, YYYY HH:mm"
        )}`
      : directorSignatureRequestedAt
      ? `Awaiting director signature • requested ${dayjs(
          directorSignatureRequestedAt
        ).format("MMM D, YYYY HH:mm")}`
      : "Send the contract to directors for signature.";

    return [
      {
        key: "contractFinalized",
        title: "Contract finalized",
        description: hasExistingContract
          ? "Latest contract version saved and linked below."
          : "Generate the contract and ensure details are correct before sending.",
        icon: <FileDoneOutlined />,
        disabled: true,
      },
      {
        key: "decisionCandidate",
        title: "Candidate accepted",
        description: hasAccepetedCandidate ? "Candidate has accepted the offer." : "Candidate has not accepted the offer.",
        icon: <CheckOutlined />,
        disabled: true,
      },
      {
        key: "signatureDirectur",
        title: "Directors signed",
        description: directorDescription,
        icon: <UsergroupAddOutlined />,
        disabled: true,
      },
      // {
      //   key: "compensationApproved",
      //   title: "Compensation package approved",
      //   description:
      //     "Finance/HR has validated salary, allowances, and benefits in this offer.",
      //   icon: <SafetyCertificateOutlined />,
      // },
      // {
      //   key: "startDateConfirmed",
      //   title: "Start date aligned",
      //   description:
      //     "Candidate and hiring manager agree on the official start date.",
      //   icon: <CalendarOutlined />,
      // },
      // {
      //   key: "attachmentsPrepared",
      //   title: "Supporting documents prepared",
      //   description:
      //     "Onboarding checklist, policies, and handbook are ready for the candidate.",
      //   icon: <PaperClipOutlined />,
      // },
    ];
  }, [
    directorSignatureSignedAt,
    directorSignatureRequestedAt,
    hasAccepetedCandidate,
    hasDirectorSigned,
    hasExistingContract,
  ]);

  const checklistValues = useMemo(
    () => Object.values(offerChecklist),
    [offerChecklist]
  );
  const checklistPercent = useMemo(
    () =>
      Math.round(
        (checklistValues.filter(Boolean).length / checklistValues.length || 0) *
          100
      ),
    [checklistValues]
  );
  const isOfferReady = useMemo(
    () => checklistValues.every(Boolean),
    [checklistValues]
  );

  const statusTag = useMemo(() => {
    if (offerTriggeredAt) {
      return (
        <Tag color="purple">
          Sent {dayjs(offerTriggeredAt).format("MMM D, YYYY HH:mm")}
        </Tag>
      );
    }
    if (isOfferReady) {
      return <Tag color="blue">Ready to Send</Tag>;
    }
    return <Tag>Checklist Pending</Tag>;
  }, [offerTriggeredAt, isOfferReady]);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const { data: templates } = useContractTemplates({});
  const { data: selectedTemplate } = useContractTemplate({
    id: selectedTemplateId || "",
  });

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [docState, setDocState] = useState<GeneratedDoc | null>(null);
  const [generating, setGenerating] = useState(false);
  const [applyingEdits, setApplyingEdits] = useState(false);
  const [convertingPdf, setConvertingPdf] = useState(false);
  const [creatingContract, setCreatingContract] = useState(false);

  const [form] = Form.useForm<ContractFormValues>();

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
      });

      setIsResultOpen(true);
      message.success("Template generated successfully.");
      await convertDocxBlobToPdf(filledBlob, suggestedDocName);
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error));
    } finally {
      setGenerating(false);
      closePicker();
    }
  }, [
    selectedTemplateId,
    selectedTemplate?.filePath,
    selectedTemplate?.name,
    templateDefaults,
    convertDocxBlobToPdf,
    closePicker,
  ]);

  const handleApplyEdits = useCallback(async () => {
    if (!docState) {
      message.error("No document state to edit.");
      return;
    }

    try {
      setApplyingEdits(true);
      const values = await form.validateFields();
      const next: TemplateVariables = { ...docState.vars };

      next.candidate_full_name = values.candidate_full_name ?? "";
      next.no_identity = values.no_identity ?? "";
      next.address = values.address ?? "";
      next.no_phone = values.no_phone ?? "";
      next.position = values.position ?? "";
      next.month = values.month ?? "";
      next.salary = values.salary ?? "";
      next.duties = parseMultilineList(values.duties);
      next.bonus = parseMultilineList(values.bonus);
      next.start_date = values.start_date
        ? formatDate(values.start_date.toDate())
        : "";

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

      const { publicUrl: docxUrl } = await uploadToSupabase(
        docState.docBlob,
        docState.docName
      );

      let pdfUrl: string | null = null;
      if (docState.pdfBlob) {
        const up = await uploadPdfToSupabase(
          docState.pdfBlob,
          docState.pdfName || docState.docName.replace(/\.docx$/i, ".pdf")
        );
        pdfUrl = up.publicUrl;
      }

      const payload = {
        applicant_id: candidate?.id || "",
        name: docState.pdfName || docState.docName,
        filePath: pdfUrl ?? docxUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onCreateContract(payload);

      if (candidate?.id) {
        queryClient.invalidateQueries({
          queryKey: ["offering-contract", candidate.id],
        });
      }

      message.success("Contract created & uploaded to Supabase.");
      closeResult();
    } catch (error) {
      console.error(error);
      message.error(getErrorMessage(error));
    } finally {
      setCreatingContract(false);
    }
  }, [candidate?.id, closeResult, docState, onCreateContract, queryClient, uploadToSupabase, uploadPdfToSupabase]);

  const handleConvertToPdf = useCallback(async () => {
    if (!docState?.docBlob) {
      message.error("No document found to convert.");
      return;
    }
    await convertDocxBlobToPdf(docState.docBlob, docState.docName);
  }, [docState, convertDocxBlobToPdf]);

  useEffect(() => {
    if (!docState) {
      form.resetFields();
      return;
    }
    form.setFieldsValue(mapTemplateVarsToFormValues(docState.vars));
  }, [docState, form]);

  if (!candidate) {
    return (
      <Card style={{ borderRadius: 14 }}>
        <Empty description="No candidate selected" />
      </Card>
    );
  }

  return (
    <>
      <Card
        style={{ borderRadius: 14 }}
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
            <Alert
              type="success"
              message="Contract has been generated. You can still regenerate it if needed."
              showIcon
            />
            <Button
              type="dashed"
              icon={<ReloadOutlined />}
              onClick={openPicker}
            >
              Regenerate Contract
            </Button>
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
                    (templates || []).find((t) => t.id === selectedTemplateId)
                      ?.name
                  }
                </Text>
              </Text>
            ) : null}
          </Space>
        )}
      </Card>

      <Card
        style={{ borderRadius: 14, marginTop: 12 }}
        title={
          <Space>
            <MailOutlined />
            <span>Director Signature</span>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type={
              hasDirectorSigned
                ? "success"
                : directorSignatureRequestedAt
                ? "info"
                : "warning"
            }
            showIcon
            message={
              hasDirectorSigned
                ? "Signed document received from directors."
                : directorSignatureRequestedAt
                ? "Awaiting director signature. You can resend the email request if needed."
                : "Send the contract to directors for signature."
            }
            />

          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Text strong>Director email</Text>
            <Input
              placeholder="director@example.com"
              value={directorEmail}
              onChange={(event) => setDirectorEmail(event.target.value)}
              type="email"
            />
            {!isDirectorEmailValid && directorEmail ? (
              <Text type="danger">Please enter a valid email address.</Text>
            ) : null}
          </Space>

          <Space align="center" wrap>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={handleRequestSignature}
              disabled={!hasExistingContract || !isDirectorEmailValid}
              loading={onRequestDirectorSignatureLoading}
            >
              {directorSignatureRequestedAt ? "Resend Request" : "Send Signature Request"}
            </Button>
            {!hasExistingContract ? (
              <Tag>Generate contract first</Tag>
            ) : directorSignatureRequestedAt ? (
              <Tag color="purple">
                Requested {dayjs(directorSignatureRequestedAt).format("MMM D, YYYY HH:mm")}
              </Tag>
            ) : null}
            {hasDirectorSigned && directorSignatureSignedAt ? (
              <Tag color="green">
                Signed {dayjs(directorSignatureSignedAt).format("MMM D, YYYY HH:mm")}
              </Tag>
            ) : null}
          </Space>

          <Spin spinning={onUploadDirectorSignatureLoading}>
            <SupaFileUploader
              bucket={supabaseBucket}
              folder={
                candidate?.id
                  ? `director-signatures/${candidate.id}`
                  : "director-signatures"
              }
              allowedTypes={["pdf"]}
              label="Upload signed contract (PDF)"
              value={directorSignatureUrl ?? null}
              initialPath={directorSignaturePath ?? null}
              onUpload={handleUploadDirectorSignature}
              onDelete={() => {
                void handleRemoveDirectorSignature();
              }}
            />
          </Spin>
          {directorSignatureUrl ? (
            <Typography.Link
              href={directorSignatureUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View signed contract
            </Typography.Link>
          ) : (
            <Text type="secondary">
              Upload the signed PDF once directors have completed the signature.
            </Text>
          )}
      </Space>
    </Card>

      <Card
        style={{ borderRadius: 14, marginTop: 12 }}
        title={
          <Space>
            <FileDoneOutlined />
            <span>Candidate Signature</span>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type={
              candidateSignedPdfUrl
                ? "success"
                : candidateSignatureUrl
                ? "info"
                : "warning"
            }
            showIcon
            message={
              candidateSignedPdfUrl
                ? "Signed PDF generated. You can download or send it to the candidate."
                : candidateSignatureUrl
                ? "Candidate has uploaded a signature. Apply it to the contract."
                : "Waiting for candidate to upload signature."
            }
          />

          <Space direction="vertical" size={6}>
            <Text type="secondary">Candidate signature status</Text>
            <Space wrap>
              <Button
                type="primary"
                icon={<FileDoneOutlined />}
                disabled={!candidateSignatureUrl}
                loading={onApplyCandidateSignatureLoading}
                onClick={handleApplyCandidateSignature}
              >
                Generate Signed PDF
              </Button>
              {!candidateSignatureUrl ? (
                <Tag>Signature not uploaded yet</Tag>
              ) : null}
              {candidateSignedPdfAt ? (
                <Tag color="green">
                  Signed {dayjs(candidateSignedPdfAt).format("MMM D, YYYY HH:mm")}
                </Tag>
              ) : null}
            </Space>
          </Space>

          <Space direction="vertical" size={6}>
            <Text type="secondary">Candidate contact (notify email)</Text>
            <Text strong>
              {candidateNotifyEmail || "— (fill in contract form)"}
            </Text>
          </Space>

          {candidateSignedPdfUrl ? (
            <Space direction="vertical" size={8}>
              <Space wrap>
                <Button
                  icon={<DownloadOutlined />}
                  href={candidateSignedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Signed PDF
                </Button>
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  loading={onSendFinalEmailLoading}
                  disabled={!candidateNotifyEmail}
                  onClick={handleSendFinalEmail}
                >
                  Send Final Email
                </Button>
              </Space>
              {!candidateNotifyEmail ? (
                <Text type="danger">
                  Assign candidate email in the contract form before sending.
                </Text>
              ) : null}
            </Space>
          ) : (
            <Text type="secondary">
              Generate the signed PDF to enable download and email actions.
            </Text>
          )}
        </Space>
      </Card>

      <Card
        style={{ borderRadius: 14, marginTop: 12 }}
        title={
          <Space>
            <SendOutlined />
            <span>Trigger Offer Ready</span>
          </Space>
        }
        extra={statusTag}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type={
              isOfferReady
                ? "success"
                : hasExistingContract
                ? "info"
                : "warning"
            }
            showIcon
            message={
              isOfferReady
                ? "All checks are complete. You can now notify the candidate."
                : hasExistingContract
                ? "Verify each item before sending the offer."
                : "Generate and review the contract to unlock the notification."
            }
          />
          <Progress
            percent={checklistPercent}
            size="small"
            status={isOfferReady ? "active" : "normal"}
            showInfo
          />
          <List
            itemLayout="horizontal"
            dataSource={checklistItems}
            renderItem={(item) => {
              const checked = offerChecklist[item.key];
              const disabled =
                item.disabled ||
                (!hasExistingContract && item.key !== "contractFinalized");

              return (
                <List.Item
                  style={{ alignItems: "flex-start" }}
                  actions={[
                    <Switch
                      key={`${item.key}-switch`}
                      checked={checked}
                      onChange={(value) => updateChecklist(item.key, value)}
                      disabled={disabled}
                      checkedChildren="Done"
                      unCheckedChildren="Todo"
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={renderChecklistIcon(item.icon, checked)}
                    title={
                      <Text strong style={{ fontSize: 14 }}>
                        {item.title}
                      </Text>
                    }
                    description={
                      <Text type="secondary">{item.description}</Text>
                    }
                  />
                </List.Item>
              );
            }}
          />

          <Space align="center" wrap>
            <Popconfirm
              title="Send offer to candidate?"
              description="This will notify the candidate that the offer is ready for review and signature."
              okText="Send now"
              cancelText="Not yet"
              onConfirm={handleTriggerOfferReady}
              disabled={!isOfferReady || sendingOffer}
            >
              <Button
                type="primary"
                disabled={!isOfferReady}
                loading={sendingOffer}
              >
                Trigger Offer Ready
              </Button>
            </Popconfirm>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetOfferChecklist}
              disabled={sendingOffer}
            >
              Reset Checklist
            </Button>
            {offerTriggeredAt ? (
              <Text type="secondary">
                Candidate notified on{" "}
                {dayjs(offerTriggeredAt).format("MMM D, YYYY HH:mm")}
              </Text>
            ) : null}
          </Space>
        </Space>
      </Card>

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
            Create Contract
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
    </>
  );
}

const renderChecklistIcon = (icon: React.ReactNode, active: boolean) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: active ? "rgba(82,196,26,0.12)" : "rgba(0,0,0,0.04)",
      color: active ? "#52c41a" : "#8c8c8c",
      fontSize: 18,
    }}
  >
    {icon}
  </span>
);

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
        key: "vars",
        label: (
          <span>
            <EditOutlined /> Variables
          </span>
        ),
        children: (
          <VariableEditForm
            form={form}
            convertingPdf={convertingPdf}
            onConvertToPdf={onConvertToPdf}
          />
        ),
      },
      {
        key: "preview",
        label: (
          <span>
            <FileSearchOutlined /> Preview
          </span>
        ),
        children: (
          <div
            style={{
              minHeight: 360,
              border: "1px dashed #d9d9d9",
              borderRadius: 8,
              padding: 16,
            }}
          >
            {docState.pdfUrl ? (
              <iframe
                src={docState.pdfUrl}
                title="PDF Preview"
                style={{
                  width: "100%",
                  height: "60vh",
                  border: "none",
                  borderRadius: 8,
                }}
              />
            ) : convertingPdf ? (
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
              <Alert
                type="info"
                showIcon
                message="Generate the PDF to preview the document."
              />
            )}
          </div>
        ),
      },
      {
        key: "info",
        label: (
          <span>
            <FileWordOutlined /> Meta
          </span>
        ),
        children: <InfoTabContent docState={docState} />,
      },
    ],
    [docState, convertingPdf, form, onConvertToPdf]
  );

  return <Tabs items={items} destroyInactiveTabPane />;
};

type VariableEditFormProps = {
  form: FormInstance<ContractFormValues>;
  convertingPdf: boolean;
  onConvertToPdf: () => Promise<void>;
};

const VariableEditForm = ({
  form,
  convertingPdf,
  onConvertToPdf,
}: VariableEditFormProps) => (
  <div>
    <Alert
      style={{ marginBottom: 12 }}
      type="info"
      message="Update variables to match the offer details. Apply edits to refresh the document."
      showIcon
    />
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        duties: [""],
        bonus: [""],
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
    <Button
      type="primary"
      icon={<FilePdfOutlined />}
      style={{ marginTop: 12 }}
      loading={convertingPdf}
      onClick={onConvertToPdf}
    >
      Convert to PDF Again
    </Button>
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
      </Form>
    </Modal>
  );
};

export default OfferContractManager;
