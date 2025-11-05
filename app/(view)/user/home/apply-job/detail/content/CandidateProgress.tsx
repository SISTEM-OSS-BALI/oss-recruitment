"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Card,
  Col,
  Row,
  Space,
  Steps,
  Tag,
  Typography,
  List,
  Button,
  Tooltip,
  Divider,
  Modal,
  Progress,
  Badge,
  Input,
  Alert,
  Image,
  message,
  Empty,
} from "antd";
import {
  CheckCircleTwoTone,
  SearchOutlined,
  MessageOutlined,
  LaptopOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { ApplicantDataModel } from "@/app/models/applicant";
import ResultMBTIComponent from "./ResultMBTIComponent";
import KTPWizard from "./UploadIdentityComponent";
import { useUser } from "@/app/hooks/user";
import { useOfferingContractByApplicantId } from "@/app/hooks/offering-contract";
import Link from "next/link";
import { useLocations } from "@/app/hooks/location";
import { humanizeType } from "@/app/utils/humanize";
import {
  PROGRESS_STAGE_ORDER,
  getStageLabel,
  toProgressStage,
} from "@/app/utils/recruitment-stage";
import SignaturePadUploader from "./SignatureUploader";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Props = {
  applicant: ApplicantDataModel;
  meta?: {
    screeningStartedOn?: string;
    screeningDeadline?: string;
    assignedTo?: string;
    interviewDate?: string;
    offerUrl?: string;
    rejectedReason?: string;
  };
};

const stageOrder = PROGRESS_STAGE_ORDER;

type CandidateDecisionState = "PENDING" | "ACCEPTED" | "DECLINED";

const DECISION_STATUS_META: Record<
  CandidateDecisionState,
  { label: string; color: string; helper: string }
> = {
  PENDING: {
    label: "Pending",
    color: "gold",
    helper: "Please review the offer to provide your decision.",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "green",
    helper:
      "You have accepted the offer. HR will contact you for the next steps.",
  },
  DECLINED: {
    label: "Declined",
    color: "red",
    helper:
      "You have declined the offer. You can contact HR if you change your mind.",
  },
};

// ---------------- Stage Config ----------------
type ActionItem = {
  key: string;
  label: string;
  button?: {
    text: string;
    disabled?: boolean;
    tooltip?: string;
    onClick?: () => void;
  };
};

type StageInfoItem = {
  label: string;
  value: React.ReactNode;
};

type SummaryMetric = {
  key: string;
  label: string;
  value: React.ReactNode;
  caption: React.ReactNode;
};

// ---------------- Component ----------------
export default function CandidateProgress({ applicant, meta }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionMode, setDecisionMode] = useState<"ACCEPT" | "DECLINE" | null>(
    null
  );
  const [isContractPreviewOpen, setIsContractPreviewOpen] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const router = useRouter();
  const currentStage = toProgressStage(applicant.stage);
  const nowStageIndex = stageOrder.findIndex((s) => s === currentStage);
  const normalizedStageIndex = nowStageIndex === -1 ? 0 : nowStageIndex;
  const { data: locations } = useLocations({});

  const {
    data: contractByApplicant,
    onSubmitDecision,
    onSubmitDecisionLoading,
  } = useOfferingContractByApplicantId({
    applicant_id: applicant.id || "",
  });

  const { onPatchDocument } = useUser({ id: applicant.user_id });

  const decisionStatus = useMemo<CandidateDecisionState>(() => {
    const raw = (contractByApplicant?.candidateDecision ||
      "PENDING") as CandidateDecisionState;
    return DECISION_STATUS_META[raw] ? raw : "PENDING";
  }, [contractByApplicant?.candidateDecision]);

  const decisionMeta = DECISION_STATUS_META[decisionStatus];
  const decisionAtDate = contractByApplicant?.candidateDecisionAt
    ? dayjs(contractByApplicant.candidateDecisionAt)
    : null;
  const decisionAtDisplay = decisionAtDate
    ? decisionAtDate.format("MMMM D, YYYY HH:mm")
    : null;
  const isDecisionLocked = decisionStatus !== "PENDING";
  const signatureUrlFromServer =
    contractByApplicant?.candidateSignatureUrl || null;
  const signaturePathFromServer =
    contractByApplicant?.candidateSignaturePath || null;
  const contractUrl = contractByApplicant?.filePath || null;
  const isContractPdf = useMemo(() => {
    if (!contractUrl) return false;
    const lower = contractUrl.toLowerCase();
    return lower.includes(".pdf");
  }, [contractUrl]);
  const directorSignedPdfUrl =
    contractByApplicant?.directorSignedPdfUrl || null;
  const candidateSignedPdfUrl =
    contractByApplicant?.candidateSignedPdfUrl || null;
  const finalDocumentUrl = useMemo(
    () => directorSignedPdfUrl || candidateSignedPdfUrl || null,
    [candidateSignedPdfUrl, directorSignedPdfUrl]
  );
  const firstPartyName =
    process.env.NEXT_PUBLIC_CONTRACT_FIRST_PARTY_NAME ||
    "CV OSS Bali Internasional";
  const firstPartyRepresentative =
    process.env.NEXT_PUBLIC_CONTRACT_FIRST_PARTY_REPRESENTATIVE ||
    "Putu Astina Putra";
  const firstPartyRole =
    process.env.NEXT_PUBLIC_CONTRACT_FIRST_PARTY_ROLE || "Direktur";

  const hasDirectorSignedDocument = Boolean(directorSignedPdfUrl);

  const handlePatchDocument = useCallback(
    async (nik: string, imageUrl: string) => {
      if (!applicant.user_id) return;
      await onPatchDocument({
        id: applicant.user_id,
        payload: {
          no_identity: nik,
          no_identity_url: imageUrl,
        },
      });
    },
    [applicant.user_id, onPatchDocument]
  );

  const handleOpenModal = useCallback(() => {
    setIsOpenModal(true);
  }, []);

  const handleCancelModal = useCallback(() => {
    setIsOpenModal(false);
  }, []);

  const handleOpenDecisionModal = useCallback(() => {
    setDecisionMode(
      decisionStatus === "ACCEPTED"
        ? "ACCEPT"
        : decisionStatus === "DECLINED"
        ? "DECLINE"
        : null
    );
    setSignatureUrl(signatureUrlFromServer);
    setSignaturePath(signaturePathFromServer);
    setRejectionReason(contractByApplicant?.candidateRejectionReason || "");
    setIsDecisionModalOpen(true);
  }, [
    contractByApplicant?.candidateRejectionReason,
    decisionStatus,
    signaturePathFromServer,
    signatureUrlFromServer,
  ]);

  const handleCloseDecisionModal = useCallback(() => {
    setIsDecisionModalOpen(false);
    setDecisionMode(null);
    setRejectionReason("");
    setSignatureUrl(null);
    setSignaturePath(null);
    setIsContractPreviewOpen(false);
  }, []);

  const handleSelectDecision = useCallback(
    (mode: "ACCEPT" | "DECLINE") => {
      if (isDecisionLocked) return;
      setDecisionMode(mode);
      if (mode === "ACCEPT" && contractUrl) {
        setIsContractPreviewOpen(true);
      }
      if (mode === "DECLINE") {
        setIsContractPreviewOpen(false);
      }
    },
    [contractUrl, isDecisionLocked]
  );


  const handleSubmitAcceptance = useCallback(async () => {
    if (!applicant?.id) return;
    if (!signatureUrl) {
      message.warning("Please upload your signature before submitting.");
      return;
    }

    try {
      const payload: {
        decision: CandidateDecisionState;
        signatureUrl: string;
        signaturePath?: string | null;
      } = {
        decision: "ACCEPTED",
        signatureUrl,
      };
      if (signaturePath) {
        payload.signaturePath = signaturePath;
      }

      await onSubmitDecision(payload);
      message.success("Thank you! Your acceptance has been submitted.");
      handleCloseDecisionModal();
    } catch (error) {
      message.error("Failed to submit your decision. Please try again.");
    }
  }, [
    applicant?.id,
    handleCloseDecisionModal,
    onSubmitDecision,
    signaturePath,
    signatureUrl,
  ]);

  const handleSubmitDecline = useCallback(async () => {
    if (!applicant?.id) return;
    try {
      const payload: {
        decision: CandidateDecisionState;
        rejectionReason?: string;
      } = {
        decision: "DECLINED",
      };

      if (rejectionReason.trim()) {
        payload.rejectionReason = rejectionReason.trim();
      }

      await onSubmitDecision(payload);
      message.success("Thank you for letting us know.");
      handleCloseDecisionModal();
    } catch (error) {
      message.error("Failed to submit your decision. Please try again.");
    }
  }, [
    applicant?.id,
    handleCloseDecisionModal,
    onSubmitDecision,
    rejectionReason,
  ]);

  const headOffice = useMemo(() => {
    if (!Array.isArray(locations)) return null;
    const ho = locations.find((item) => item.type === "HEAD_OFFICE");
    if (!ho) return null;
    return {
      name: ho.name,
      type: ho.type,
      mapsUrl: ho.maps_url,
    };
  }, [locations]);

  function getStageConfig(
    stage: string,
    applicant: ApplicantDataModel,
    router: ReturnType<typeof useRouter>,
    meta?: Props["meta"]
  ) {
    const m = meta || {};

    const mbtiUrl = applicant.mbti_test?.link_url || undefined;
    const mbtiDone = applicant.mbti_test?.is_complete === true;

    switch (stage) {
      case "APPLICATION":
        return {
          title: "Application Details",
          info: [
            {
              label: "Submitted On",
              value: dayjs(applicant.createdAt).format("MMMM D, YYYY"),
            },
            { label: "Position", value: applicant.job?.name ?? "-" },
          ],
          actions: [
            {
              key: "cv-review",
              label: "Recruiter will review your CV",
              button: {
                text: "View CV",
                onClick: () =>
                  window.open(
                    applicant.user?.curiculum_vitae_url || "#",
                    "_blank"
                  ),
                disabled: !applicant.user?.curiculum_vitae_url,
                tooltip: !applicant.user?.curiculum_vitae_url
                  ? "No CV found"
                  : "Open CV",
              },
            },
          ] as ActionItem[],
        };

      case "SCREENING":
        return {
          title: "Screening Stage Details",
          info: [
            { label: "STATUS", value: mbtiDone ? "Completed" : "In Progress" },
            // {
            //   label: "DEADLINE",
            //   value: dayjs(deadline).format("MMMM D, YYYY"),
            // },
            // {
            //   label: "STARTED ON",
            //   value: dayjs(startedOn).format("MMMM D, YYYY"),
            // },
            // { label: "ASSIGNED TO", value: m.assignedTo || "Recruitment Team" },
          ],
          actions: [
            {
              key: "mbti",
              label: "Complete MBTI Personality Test",
              button: {
                text: mbtiDone ? "Done" : "Take MBTI Test",
                disabled: mbtiDone ? true : !mbtiUrl,
                tooltip: mbtiDone
                  ? "Already completed"
                  : mbtiUrl
                  ? "Open MBTI Test"
                  : "Link unavailable",
                onClick: () => mbtiUrl && window.open(mbtiUrl, "_blank"),
              },
            },
          ] as ActionItem[],
        };

      case "INTERVIEW": {
        const interviews = [...(applicant.scheduleInterview ?? [])]
          .filter((it) => dayjs(it.start_time ?? it.date).isValid())
          .sort((a, b) => {
            const aTime = dayjs(a.start_time ?? a.date).valueOf();
            const bTime = dayjs(b.start_time ?? b.date).valueOf();
            return aTime - bTime;
          });

        const now = Date.now();
        const upcomingInterview =
          interviews.find(
            (item) => dayjs(item.start_time ?? item.date).valueOf() >= now
          ) ?? null;
        const latestInterview =
          interviews.length > 0 ? interviews[interviews.length - 1] : null;

        const selectedInterview = upcomingInterview ?? latestInterview ?? null;

        const rawInterviewDate =
          m.interviewDate ??
          selectedInterview?.start_time ??
          selectedInterview?.date ??
          null;

        const hasInterviewDate = Boolean(rawInterviewDate);
        const hasSelectedInterview =
          Boolean(selectedInterview) && hasInterviewDate;

        const interviewStatus = hasInterviewDate
          ? dayjs(rawInterviewDate).valueOf() < now
            ? "Completed"
            : "Scheduled"
          : "Awaiting schedule";

        const interviewDateDisplay = hasInterviewDate
          ? dayjs(rawInterviewDate).format("HH:mm, MMMM D, YYYY")
          : "-";

        const scheduleLabel = hasInterviewDate
          ? "Review or reschedule your interview"
          : "Schedule interview with recruiter";

        // —— HANYA HITUNG METHOD JIKA SUDAH ADA JADWAL ——
        let methodValue: React.ReactNode = "-";
        if (hasSelectedInterview) {
          const isOnline = selectedInterview!.is_online === true;
          if (isOnline) {
            const link = selectedInterview!.meeting_link;
            methodValue = link ? (
              <Link href={link} target="_blank" rel="noreferrer">
                Online Meeting (open link)
              </Link>
            ) : (
              "Online (link pending)"
            );
          } else {
            // offline — boleh fallback ke Head Office *hanya setelah ada jadwal*
            const hq = headOffice;
            methodValue = hq ? (
              <Space direction="vertical" size={2}>
                <Text strong>{hq.name} (Offline)</Text>
                {hq.type && <Tag color="blue">{humanizeType(hq.type)}</Tag>}
                {hq.mapsUrl && (
                  <Link href={hq.mapsUrl} target="_blank" rel="noreferrer">
                    View on Maps
                  </Link>
                )}
              </Space>
            ) : (
              "Offline (location pending)"
            );
          }
        }

        return {
          title: "Interview Stage Details",
          info: [
            { label: "Status", value: interviewStatus },
            { label: "Interview Date", value: interviewDateDisplay },
            { label: "Method", value: methodValue }, // <- saat belum ada jadwal, pasti "-"
          ],
          actions: [
            {
              key: "schedule",
              label: scheduleLabel,
              button: {
                text: hasInterviewDate ? "Reschedule" : "Schedule",
                tooltip: hasInterviewDate
                  ? "Update interview time"
                  : "Pick interview time",
                onClick: () =>
                  window.open(
                    `/evaluator/schedule?applicant_id=${applicant.id}`,
                    "_blank",
                    "noopener,noreferrer"
                  ),
              },
            },
            {
              key: "prep",
              label: "Read interview preparation guideline",
              button: {
                text: "Open Guide",
                onClick: () => window.open("/guide/interview", "_blank"),
              },
            },
            {
              key: "doc",
              label: "Upload Documents",
              button: {
                text: "Upload Documents",
                // onClick: handleOpenModal,
              },
            },
          ] as ActionItem[],
        };
      }

      case "OFFERING": {
        // OFFERING is the offer-sent stage (not the hiring/onboarding stage)
        const hasOfferDocument = Boolean(contractByApplicant?.filePath);

        const actions: ActionItem[] = [
          {
            key: "upload-identity",
            label: "Upload identity document",
            button: {
              text: applicant.user?.no_identity_url
                ? "Document Uploaded"
                : "Upload Document",
              onClick: handleOpenModal,
              disabled: !!applicant.user?.no_identity_url,
            },
          },
          {
            key: "offer",
            label: "Review the offer letter",
            button: {
              text: hasOfferDocument ? "View Offer" : "Offer Pending",
              onClick: () =>
                hasOfferDocument &&
                window.open(contractByApplicant!.filePath, "_blank"),
              disabled: !hasOfferDocument,
              tooltip: hasOfferDocument ? "Open Offer" : "No offer link",
            },
          },
          {
            key: "decision",
            label: `Offer decision — ${decisionMeta.label}`,
            button: {
              text:
                decisionStatus === "PENDING"
                  ? "Review Decision"
                  : "View Decision",
              onClick: handleOpenDecisionModal,
              tooltip: decisionMeta.helper,
              disabled: !hasOfferDocument && decisionStatus === "PENDING",
            },
          },
        ];
        if (finalDocumentUrl) {
          actions.push({
            key: "final-documents",
            label: hasDirectorSignedDocument
              ? "Download director signed contract"
              : "Download signed contract",
            button: {
              text: "Download Final PDF",
              onClick: () =>
                window.open(finalDocumentUrl, "_blank", "noopener,noreferrer"),
            },
          });
        } else {
          actions.push({
            key: "final-documents",
            label: "Final contract pending",
            button: {
              text: "Awaiting Upload",
              disabled: true,
              tooltip:
                "The final signed contract will appear here once available.",
            },
          });
        }

        const infoItems: StageInfoItem[] = [
          {
            label: "STATUS",
            value: "Offer Sent",
          },
          { label: "POSITION", value: applicant.job?.name ?? "-" },
          {
            label: "DECISION",
            value: (
              <Space size={6}>
                <Tag color={decisionMeta.color}>{decisionMeta.label}</Tag>
                {decisionStatus !== "PENDING" && decisionAtDisplay && (
                  <Text type="secondary">{decisionAtDisplay}</Text>
                )}
              </Space>
            ),
          },
        ];

        if (decisionStatus === "ACCEPTED" && signatureUrlFromServer) {
          infoItems.push({
            label: "SIGNED OFFER",
            value: (
              <Link
                href={signatureUrlFromServer}
                target="_blank"
                rel="noreferrer"
              >
                View Signature
              </Link>
            ),
          });
        }
        if (finalDocumentUrl) {
          infoItems.push({
            label: hasDirectorSignedDocument
              ? "DIRECTOR SIGNED CONTRACT"
              : "FINAL SIGNED CONTRACT",
            value: (
              <Link href={finalDocumentUrl} target="_blank" rel="noreferrer">
                View final PDF
              </Link>
            ),
          });
        }

        return {
          title: "Offer Stage",
          info: infoItems,
          actions,
        };
      }
      case "HIRING": {
        // HIRED is the hiring/onboarding stage
        const hasOfferDocument = Boolean(contractByApplicant?.filePath);

        const actions: ActionItem[] = [
          {
            key: "",
            label: "Upload identity document",
            button: {
              text: applicant.user?.no_identity_url
                ? "Document Uploaded"
                : "Upload Document",
              onClick: handleOpenModal,
              disabled: !!applicant.user?.no_identity_url,
            },
          },
          {
            key: "offer",
            label: "Review the offer letter",
            button: {
              text: hasOfferDocument ? "View Offer" : "Offer Pending",
              onClick: () =>
                hasOfferDocument &&
                window.open(contractByApplicant!.filePath, "_blank"),
              disabled: !hasOfferDocument,
              tooltip: hasOfferDocument ? "Open Offer" : "No offer link",
            },
          },
          {
            key: "decision",
            label: `Offer decision — ${decisionMeta.label}`,
            button: {
              text:
                decisionStatus === "PENDING"
                  ? "Review Decision"
                  : "View Decision",
              onClick: handleOpenDecisionModal,
              tooltip: decisionMeta.helper,
              disabled: !hasOfferDocument && decisionStatus === "PENDING",
            },
          },
        ];
        if (finalDocumentUrl) {
          actions.push({
            key: "final-documents",
            label: hasDirectorSignedDocument
              ? "Download director signed contract"
              : "Download signed contract",
            button: {
              text: "Download Final PDF",
              onClick: () =>
                window.open(finalDocumentUrl, "_blank", "noopener,noreferrer"),
            },
          });
        } else {
          actions.push({
            key: "final-documents",
            label: "Final contract pending",
            button: {
              text: "Awaiting Upload",
              disabled: true,
              tooltip:
                "The final signed contract will appear here once available.",
            },
          });
        }

        // For HIRED stage, provide onboarding action
        actions.push({
          key: "onboarding",
          label: "Complete onboarding documents",
          button: {
            text: "Open Onboarding",
            onClick: () => window.open("/onboarding", "_blank"),
          },
        });

        const infoItems: StageInfoItem[] = [
          {
            label: "STATUS",
            value: "Hiring",
          },
          { label: "POSITION", value: applicant.job?.name ?? "-" },
          {
            label: "DECISION",
            value: (
              <Space size={6}>
                <Tag color={decisionMeta.color}>{decisionMeta.label}</Tag>
                {decisionStatus !== "PENDING" && decisionAtDisplay && (
                  <Text type="secondary">{decisionAtDisplay}</Text>
                )}
              </Space>
            ),
          },
        ];

        if (decisionStatus === "ACCEPTED" && signatureUrlFromServer) {
          infoItems.push({
            label: "SIGNED OFFER",
            value: (
              <Link
                href={signatureUrlFromServer}
                target="_blank"
                rel="noreferrer"
              >
                View Signature
              </Link>
            ),
          });
        }
        if (finalDocumentUrl) {
          infoItems.push({
            label: hasDirectorSignedDocument
              ? "DIRECTOR SIGNED CONTRACT"
              : "FINAL SIGNED CONTRACT",
            value: (
              <Link href={finalDocumentUrl} target="_blank" rel="noreferrer">
                View final PDF
              </Link>
            ),
          });
        }

        return {
          title: "Hiring & Onboarding",
          info: infoItems,
          actions,
        };
      }

      case "REJECTED":
        return {
          title: "Application Result",
          info: [
            { label: "STATUS", value: "Rejected" },
            { label: "REASON", value: m.rejectedReason || "—" },
          ],
          actions: [
            {
              key: "feedback",
              label: "Read feedback & resources to improve",
              button: {
                text: "View Resources",
                onClick: () => window.open("/resources/improve", "_blank"),
              },
            },
          ] as ActionItem[],
        };

      default:
        return {
          title: "Information",
          info: [],
          actions: [] as ActionItem[],
        };
    }
  }

  const initials =
    (applicant.user?.name || "Candidate")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const stageConfig = getStageConfig(currentStage, applicant, router, meta);

  const progressTotal =
    currentStage === "REJECTED"
      ? stageOrder.length
      : Math.max(stageOrder.length - 1, 1);
  const progressPosition = Math.min(normalizedStageIndex + 1, progressTotal);
  const stageProgressPercent = Math.round(
    (progressPosition / progressTotal) * 100
  );
  const nextStageKey =
    normalizedStageIndex < stageOrder.length - 1
      ? stageOrder[normalizedStageIndex + 1]
      : null;
  const nextStageLabel =
    nextStageKey != null
      ? getStageLabel(nextStageKey)
      : currentStage === "REJECTED"
      ? "Process Closed"
      : "Journey Complete";
  const statusInfo = stageConfig.info.find(
    (item) => item.label?.toUpperCase?.() === "STATUS"
  );
  const statusValue =
    typeof statusInfo?.value === "string"
      ? statusInfo.value
      : getStageLabel(currentStage);
  const primaryAction = stageConfig.actions[0];
  const summaryMetrics = useMemo<SummaryMetric[]>(
    () => [
      {
        key: "submitted",
        label: "Submitted",
        value: dayjs(applicant.createdAt).format("MMM D, YYYY"),
        caption: "Application received",
      },
      {
        key: "status",
        label: "Status",
        value: statusValue,
        caption: `Current stage • ${getStageLabel(currentStage)}`,
      },
      {
        key: "next",
        label: nextStageKey ? "Next Milestone" : "Pipeline Status",
        value: nextStageLabel,
        caption: primaryAction?.label || "No outstanding actions",
      },
    ],
    [
      applicant.createdAt,
      currentStage,
      nextStageKey,
      nextStageLabel,
      primaryAction?.label,
      statusValue,
    ]
  );

  const stepsItems = useMemo(
    () =>
      stageOrder.map((stageKey, index) => {
        const isCompleted = normalizedStageIndex > index;
        const isCurrent = normalizedStageIndex === index;
        const status: "finish" | "process" | "wait" = isCompleted
          ? "finish"
          : isCurrent
          ? "process"
          : "wait";
        let descriptor: string;
        if (isCompleted) {
          descriptor = "Completed";
        } else if (isCurrent) {
          descriptor = stageKey === "REJECTED" ? "Closed" : "In progress";
        } else {
          descriptor = stageKey === "REJECTED" ? "N/A" : "Pending";
        }

        return {
          title: getStageLabel(stageKey),
          description: descriptor,
          icon:
            stageKey === "APPLICATION" ? (
              <FileTextOutlined />
            ) : stageKey === "SCREENING" ? (
              <SearchOutlined />
            ) : stageKey === "INTERVIEW" ? (
              <MessageOutlined />
            ) : stageKey === "OFFERING" ? (
              <FileDoneOutlined />
            ) : stageKey === "HIRING" ? (
              <LaptopOutlined />
            ) : (
              <CloseCircleOutlined />
            ),
          status,
        };
      }),
    [normalizedStageIndex]
  );

  return (
    <div
      style={{
        padding: "48px clamp(16px, 5vw, 72px)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
        }}
      >
        <Space direction="vertical" size={24} style={{ display: "flex" }}>
          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              background:
                "linear-gradient(130deg, rgba(44,62,180,1) 0%, rgba(100,71,229,1) 55%, rgba(137,107,255,1) 100%)",
              color: "#fff",
              boxShadow: "0 24px 60px rgba(60,51,153,0.35)",
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Row gutter={[24, 24]} align="middle" justify="space-between">
              <Col flex="auto">
                <Space direction="vertical" size={18}>
                  <Badge
                    status="processing"
                    text={
                      <span style={{ color: "rgba(255,255,255,0.8)" }}>
                        Apply Job Progress Tracking
                      </span>
                    }
                  />
                  <Space align="center" size={20}>
                    <Avatar
                      size={72}
                      src={applicant.user?.photo_url || undefined}
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "#fff",
                        fontSize: 28,
                        fontWeight: 600,
                        border: "2px solid rgba(255,255,255,0.35)",
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Space direction="vertical" size={4}>
                      <Title level={3} style={{ margin: 0, color: "#fff" }}>
                        {applicant.user?.name || "Candidate"} ·{" "}
                        {applicant.job?.name || "—"}
                      </Title>
                      <Text style={{ color: "rgba(255,255,255,0.75)" }}>
                        Application ID: #
                        {applicant.id.toUpperCase().slice(0, 8)}
                      </Text>
                      <Tag
                        color="success"
                        style={{
                          borderRadius: 999,
                          padding: "2px 12px",
                          width: "fit-content",
                        }}
                      >
                        Current Stage — {getStageLabel(currentStage)}
                      </Tag>
                    </Space>
                  </Space>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" align="center">
                  <Progress
                    type="circle"
                    percent={stageProgressPercent}
                    size={120}
                    strokeColor="#ffce73"
                    trailColor="rgba(255,255,255,0.25)"
                    format={(percent) => (
                      <span style={{ color: "#fff", fontWeight: 600 }}>
                        {percent}%
                      </span>
                    )}
                  />
                  <Button
                    size="large"
                    style={{
                      background: "#ffce73",
                      borderColor: "#ffce73",
                      color: "#1e2b5c",
                      fontWeight: 600,
                      boxShadow: "0 12px 24px rgba(255,206,115,0.35)",
                    }}
                    onClick={() =>
                      router.push(`/user/home/apply-job/${applicant.id}/chat`)
                    }
                    icon={<MessageOutlined />}
                  >
                    Contact Recruiter
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[20, 20]}>
            {summaryMetrics.map((metric) => (
              <Col xs={24} md={8} key={metric.key}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 18,
                    background: "#ffffff",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: 20, height: "100%" }}
                >
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ display: "flex" }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        fontSize: 12,
                      }}
                    >
                      {metric.label}
                    </Text>
                    <Title level={4} style={{ margin: 0 }}>
                      {metric.value}
                    </Title>
                    <Text type="secondary">{metric.caption}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 20px 56px rgba(15,23,42,0.12)",
            }}
            title={
              <Space align="center">
                <CheckCircleTwoTone twoToneColor="#52c41a" />
                <span>Pipeline Timeline</span>
              </Space>
            }
            bodyStyle={{ paddingTop: 12 }}
          >
            <Steps
              current={normalizedStageIndex}
              responsive
              items={stepsItems}
            />
          </Card>

          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 20px 56px rgba(15,23,42,0.1)",
            }}
            title={
              <Space align="center">
                <FileTextOutlined />
                <span>{stageConfig.title}</span>
              </Space>
            }
            bodyStyle={{ paddingTop: 16 }}
          >
            {stageConfig.info.length > 0 && (
              <>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {stageConfig.info.map((info) => (
                    <div
                      key={info.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "12px 16px",
                        background: "#f5f7ff",
                        borderRadius: 14,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, textTransform: "uppercase" }}
                      >
                        {info.label}
                      </Text>
                      <div style={{ textAlign: "right" }}>
                        {typeof info.value === "string" ? (
                          <Text strong>{info.value}</Text>
                        ) : (
                          info.value
                        )}
                      </div>
                    </div>
                  ))}
                </Space>
                <Divider />
              </>
            )}

            <Title level={5} style={{ marginBottom: 12 }}>
              Required Actions
            </Title>
            {stageConfig.actions.length > 0 ? (
              <List
                split={false}
                dataSource={stageConfig.actions}
                renderItem={(act) => (
                  <List.Item
                    key={act.key}
                    style={{
                      padding: "12px 16px",
                      background: "#f9fafc",
                      borderRadius: 14,
                      marginBottom: 12,
                    }}
                    actions={
                      act.button
                        ? [
                            <Tooltip
                              key={`${act.key}-tt`}
                              title={act.button.tooltip || act.button.text}
                            >
                              <Button
                                type="primary"
                                disabled={act.button.disabled}
                                onClick={act.button.onClick}
                                icon={
                                  act.key === "schedule" ? (
                                    <CalendarOutlined />
                                  ) : act.key === "offer" ? (
                                    <FileDoneOutlined />
                                  ) : undefined
                                }
                              >
                                {act.button.text}
                              </Button>
                            </Tooltip>,
                          ]
                        : undefined
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Text strong style={{ fontSize: 14 }}>
                          {act.label}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">
                No outstanding actions at this stage.
              </Text>
            )}
          </Card>

          {currentStage === "SCREENING" && applicant.mbti_test?.result && (
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "#ffffff",
                boxShadow: "0 20px 56px rgba(15,23,42,0.1)",
              }}
            >
              <ResultMBTIComponent result={applicant.mbti_test.result} />
            </Card>
          )}

          <Modal
            open={isDecisionModalOpen}
            onCancel={handleCloseDecisionModal}
            title="Offer Decision"
            width={720}
            footer={null}
          >
            <Space direction="vertical" size={16} style={{ display: "block" }}>
              <Space align="center" size={8}>
                <Tag
                  color={decisionMeta.color}
                  style={{ marginRight: 0, fontSize: 16, marginBottom: 12 }}
                >
                  {decisionMeta.label}
                </Tag>
                {decisionStatus !== "PENDING" && decisionAtDisplay && (
                  <Text type="secondary">Submitted {decisionAtDisplay}</Text>
                )}
              </Space>

              {isDecisionLocked && (
                <Alert
                  type="success"
                  showIcon
                  message={
                    decisionStatus === "ACCEPTED"
                      ? "You have already accepted this offer."
                      : "You have already declined this offer."
                  }
                  description="If you need to make changes, please contact the recruitment team."
                />
              )}

              <Text>{decisionMeta.helper}</Text>

              <Space size={12} style={{ marginBottom: 12, marginTop: 12 }}>
                <Button
                  type={decisionMode === "ACCEPT" ? "primary" : "default"}
                  onClick={() => handleSelectDecision("ACCEPT")}
                  disabled={isDecisionLocked}
                >
                  Accept Offer
                </Button>
                <Button
                  type={decisionMode === "DECLINE" ? "primary" : "default"}
                  danger
                  onClick={() => handleSelectDecision("DECLINE")}
                  disabled={isDecisionLocked}
                >
                  Decline Offer
                </Button>
              </Space>

              {decisionMode === "ACCEPT" && (
                <Space
                  direction="vertical"
                  size={16}
                  style={{ display: "block" }}
                >
                  <div>
                    <Text strong>Review the contract</Text>
                    <Text type="secondary" style={{ display: "block" }}>
                      Read the contract before signing. Click the button below
                      to open the contract preview.
                    </Text>
                    <Space wrap style={{ marginTop: 8 }}>
                      <Button
                        icon={<FileTextOutlined />}
                        onClick={() => setIsContractPreviewOpen(true)}
                        disabled={!contractUrl}
                      >
                        View Contract
                      </Button>
                      {contractUrl ? (
                        <Button
                          icon={<DownloadOutlined />}
                          href={contractUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </Button>
                      ) : (
                        <Tag>Contract not available yet</Tag>
                      )}
                    </Space>
                  </div>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={10}>
                      <div
                        style={{
                          background: "#f9fafc",
                          borderRadius: 14,
                          padding: 16,
                          height: "100%",
                        }}
                      >
                        <Text strong>Pihak Pertama</Text>
                        <div style={{ marginTop: 12 }}>
                          <Text>{firstPartyRepresentative}</Text>
                        </div>
                        <Text type="secondary">{firstPartyRole}</Text>
                        <Text type="secondary">{firstPartyName}</Text>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginTop: 16 }}
                        >
                          Tanda tangan pihak pertama akan dibubuhkan setelah
                          proses verifikasi internal.
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} md={14}>
                      <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                      >
                        <Text strong>
                          Pihak Kedua — {applicant.user?.name || "Candidate"}
                        </Text>
                        <Text type="secondary">
                          Gunakan kotak di bawah untuk menandatangani kontrak
                          secara digital. PNG atau JPG hingga 5MB.
                        </Text>
                        <SignaturePadUploader
                          bucket="web-oss-recruitment"
                          folder={`candidate-signatures/${applicant.id}`}
                          value={signatureUrl ?? undefined}
                          onUpload={(path, url) => {
                            setSignatureUrl(url);
                            setSignaturePath(path);
                          }}
                          onDelete={() => {
                            setSignatureUrl(null);
                            setSignaturePath(null);
                          }}
                          maxSizeMB={5}
                          width={360}
                          height={180}
                        />
                        {signatureUrl ? (
                          <div
                            style={{
                              border: "1px solid #f0f0f0",
                              borderRadius: 12,
                              padding: 12,
                              background: "#ffffff",
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{ display: "block", marginBottom: 8 }}
                            >
                              Pratinjau tanda tangan
                            </Text>
                            <Image
                              src={signatureUrl}
                              alt="Candidate signature preview"
                              style={{ maxWidth: "100%" }}
                              preview={false}
                            />
                          </div>
                        ) : null}
                      </Space>
                    </Col>
                  </Row>

                  <Button
                    type="primary"
                    style={{ marginTop: 12, marginBottom: 12 }}
                    icon={<FileDoneOutlined />}
                    onClick={handleSubmitAcceptance}
                    loading={onSubmitDecisionLoading}
                    disabled={!signatureUrl || isDecisionLocked}
                  >
                    Submit Acceptance
                  </Button>
                </Space>
              )}

              {decisionMode === "DECLINE" && (
                <Space
                  direction="vertical"
                  size={12}
                  style={{ display: "block" }}
                >
                  <Text strong>Optional note</Text>
                  <Text type="secondary">
                    Let us know why you are declining. This helps us improve the
                    process.
                  </Text>
                  <TextArea
                    placeholder="Share your reason (optional)"
                    rows={4}
                    value={rejectionReason}
                    disabled={isDecisionLocked}
                    onChange={(event) => setRejectionReason(event.target.value)}
                  />
                  <Button
                    danger
                    type="primary"
                    style={{ marginTop: 12 }}
                    onClick={handleSubmitDecline}
                    loading={onSubmitDecisionLoading}
                    disabled={isDecisionLocked}
                  >
                    Submit Decline
                  </Button>
                </Space>
              )}

              {!decisionMode && (
                <Alert
                  type="info"
                  showIcon
                  message="Select accept or decline to continue."
                />
              )}

              {decisionStatus === "ACCEPTED" && signatureUrlFromServer && (
                <Alert
                  type="info"
                  showIcon
                  message="Signature on file"
                  description={
                    <Link
                      href={signatureUrlFromServer}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View uploaded signature
                    </Link>
                  }
                />
              )}
            </Space>
          </Modal>

          <Modal
            open={isOpenModal}
            onCancel={handleCancelModal}
            onOk={handleCancelModal}
            title="Upload Identity Document"
            width={1000}
            footer={null}
          >
            <KTPWizard onPatchDocument={handlePatchDocument} />
          </Modal>

          <Modal
            open={isContractPreviewOpen}
            onCancel={() => setIsContractPreviewOpen(false)}
            footer={null}
            title="Contract Preview"
            width={960}
            bodyStyle={{ padding: 0, height: "70vh" }}
            destroyOnClose
          >
            {contractUrl ? (
              isContractPdf ? (
                <iframe
                  src={`${contractUrl}#toolbar=0`}
                  title="Contract document preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 32,
                  }}
                >
                  <Space direction="vertical" size={16} align="center">
                    <Text type="secondary">
                      Contract preview is available in DOCX format. Download the
                      document to review the content.
                    </Text>
                    <Button
                      icon={<DownloadOutlined />}
                      href={contractUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download Contract
                    </Button>
                  </Space>
                </div>
              )
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  padding: 24,
                }}
              >
                <Empty description="Contract not available yet" />
              </div>
            )}
          </Modal>
        </Space>
      </div>
    </div>
  );
}
