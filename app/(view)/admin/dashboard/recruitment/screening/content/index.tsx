// recruitment/screening/CandidatesPage.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Input,
  List,
  Typography,
  Empty,
  Pagination,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { reorderImmutable } from "@/app/utils/reoder";
import DraggableCandidateItem from "@/app/utils/dnd-helper";
import { ApplicantDataModel } from "@/app/models/applicant";
import { useCandidate, useCandidates } from "@/app/hooks/applicant";
import CandidateOverview from "./CandidateOverview";
import { useRecruitment } from "../../context";
import { RecruitmentStage } from "@prisma/client";
import { useMbtiTests } from "@/app/hooks/mbti-test";


const { Title, Text } = Typography;

interface Payload {
  user_id: string,
  applicant_id: string
}

// Summary key -> Enum stage backend
const STAGE_MAP: Record<string, RecruitmentStage | undefined> = {
  new_aplicant: RecruitmentStage.NEW_APLICANT,
  screening: RecruitmentStage.SCREENING,
  interview: RecruitmentStage.INTERVIEW,
  hired: RecruitmentStage.HIRED,
  rejected: RecruitmentStage.REJECTED,
  waiting: RecruitmentStage.WAITING,
};

export default function CandidatesPage() {
  const { setSummary, setSectionTitle, setSectionSubtitle, setOnUpdateStatus } =
    useRecruitment();
    const [selectedId, setSelectedId] = useState<string | null>(null);

  const { onCreate: onCreateTestMbti } = useMbtiTests({});

  const { data: candidatesData = [] } = useCandidates({});
  const { onUpdateStatus: updateStatus } = useCandidate({id: selectedId!});

  const screening = useMemo(
    () => candidatesData.filter((c) => c.stage === RecruitmentStage.SCREENING),
    [candidatesData]
  );

  // sumber kebenaran untuk DnD list (lokal)
  const [list, setList] = useState<ApplicantDataModel[]>([]);
  useEffect(() => {
    // inisialisasi / merge aman saat data berubah
    setList((prev) => {
      if (prev.length !== screening.length) return [...screening];
      const map = new Map(screening.map((c) => [c.id, c]));
      return prev.map((c) => map.get(c.id) ?? c);
    });
  }, [screening]);

  // Summary (tampilan header di layout)
  const counts = useMemo(() => {
    const total = candidatesData.length;
    const by = (st: string) =>
      candidatesData.filter((c) => c.stage?.toLowerCase() === st.toLowerCase())
        .length;
    return {
      all: total,
      screening: by("Screening"),
      interview: by("Interview"),
      hired: by("Hired"),
      rejected: by("Rejected"),
      waiting: by("Waiting"),
    };
  }, [candidatesData]);

  useEffect(() => {
    setSectionTitle("Candidate Overview");
    setSectionSubtitle(
      "Summary of candidate profiles and application details."
    );
    setSummary([
      { key: "all", label: "Total Applicants", count: counts.all },
      { key: "screening", label: "Screening", count: counts.screening },
      { key: "interview", label: "Interview", count: counts.interview },
      { key: "hired", label: "Hired", count: counts.hired },
      { key: "rejected", label: "Rejected", count: counts.rejected },
      { key: "waiting", label: "Waiting", count: counts.waiting },
    ]);
    // hanya bergantung pada counts object
  }, [counts, setSummary, setSectionTitle, setSectionSubtitle]);

  // Search, selection, pagination (berbasis list lokal)
  const [query, setQuery] = useState("");

  const handleCreateTestMbti = async () => {
    const payload : Payload = {
      user_id: selected?.user_id ?? "",
      applicant_id : selectedId ?? ""
    };
    await onCreateTestMbti(payload);

  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const n = c.user.name?.toLowerCase() ?? "";
      const e = c.user.email?.toLowerCase() ?? "";
      const p = c.user.phone?.toLowerCase() ?? "";
      return n.includes(q) || e.includes(q) || p.includes(q);
    });
  }, [list, query]);

  const [page, setPage] = useState(1);
  const pageSize = 8;
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const selected = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? null,
    [filtered, selectedId]
  );

  // Reorder saat hover item lain
  const onHoverMove = useCallback((dragId: string, overId: string) => {
    setList((prev) => {
      const from = prev.findIndex((x) => x.id === dragId);
      const to = prev.findIndex((x) => x.id === overId);
      if (from === -1 || to === -1 || from === to) return prev;
      return reorderImmutable(prev, from, to);
    });
  }, []);

  // === Daftarkan handler drop ke header card ===
  useEffect(() => {
    const handler = async (candidateId: string, statusKey: string) => {
      const targetStage = STAGE_MAP[statusKey.toLowerCase()];
      if (!targetStage) return; // "all" atau key tak dikenal → no-op

      try {
        // Optimistic: hilangkan dari list lokal (karena bukan NEW_APLICANT lagi)
        setList((prev) => prev.filter((c) => c.id !== candidateId));

        await updateStatus({ id: candidateId, stage: targetStage });
        // invalidate sudah dilakukan oleh hook-mu → data akan fresh
        message.success("Status updated");
      } catch (e: unknown) {
        if (e instanceof Error) {
          message.error(e.message || "Failed to update status");
        } else {
          message.error("Failed to update status");
        }
      }
    };

    setOnUpdateStatus(() => handler);
    return () => setOnUpdateStatus(undefined);
    // setOnUpdateStatus stabil dari context; updateStatus stabil dari react-query
  }, [setOnUpdateStatus, updateStatus]);

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT */}
      <Col xs={24} md={8}>
        <Card style={{ height: "100%" }} bodyStyle={{ paddingBottom: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Candidate List
            </Title>
            <Text type="secondary">
              Drag & drop to reorder. Drag ke header card untuk update stage.
            </Text>
          </div>

          <Input
            placeholder="Search candidates..."
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            allowClear
            style={{ margin: "12px 0 16px" }}
          />

          <List
            dataSource={paged}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No candidates"
                />
              ),
            }}
            renderItem={(item, idx) => (
              <DraggableCandidateItem
                key={item.id}
                id={item.id}
                stage={item.stage || ""}
                name={item.user.name || "No Name"}
                image_url={item.user.photo_url || undefined}
                email={item.user.email || ""}
                status={item.stage || ""}
                active={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
                visibleIndex={(page - 1) * pageSize + idx}
                onHoverMove={onHoverMove}
              />
            )}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "8px 0 16px",
            }}
          >
            <Pagination
              size="small"
              current={page}
              onChange={setPage}
              total={filtered.length}
              pageSize={pageSize}
              showSizeChanger={false}
            />
          </div>
        </Card>
      </Col>

      {/* RIGHT */}
      <Col xs={24} md={16}>
        <Card style={{ height: "100%" }}>
          <CandidateOverview
            candidate={selected}
            onCreateMbtiTest={handleCreateTestMbti}
          />
        </Card>
      </Col>
    </Row>
  );
}
