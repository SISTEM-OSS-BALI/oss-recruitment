"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Select,
  Input,
  Button,
  Table,
  Modal,
  Tag,
  Space,
} from "antd";
import {
  SearchOutlined,
  CloseOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useCandidates } from "@/app/hooks/applicant";
import { useHistoryCandidates } from "@/app/hooks/history-candidate";
import { ApplicantDataModel } from "@/app/models/applicant";
import { HistoryCandidateDataModel } from "@/app/models/history-candidate";
import { useRecruitment } from "../context";
import Columns from "./columns";

const { Text } = Typography;
const { Option } = Select;

/** Small helper */
function formatDateTime(v?: string | Date | null) {
  if (!v) return "-";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Content() {
  const { data: candidatesData = [] } = useCandidates({});
  const { data: historyCandidates = [] } = useHistoryCandidates({});
  const { setSummary, setSectionTitle, setSectionSubtitle } = useRecruitment();

  // filters
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  // history modal state
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyForCandidateId, setHistoryForCandidateId] = useState<
    string | null
  >(null);

  // page header
  useEffect(() => {
    setSectionTitle("Total Applicants");
    setSectionSubtitle(
      "Monitor the status and progress of all job applicants."
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOptions = useMemo(() => {
    const s = Array.from(
      new Set(
        (candidatesData as ApplicantDataModel[])
          .map((c) => c.stage?.trim())
          .filter(Boolean) as string[]
      )
    );
    return s.length
      ? s
      : ["Waiting", "Screening", "Interview", "Hired", "Rejected"];
  }, [candidatesData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (candidatesData as ApplicantDataModel[]).filter((c) => {
      const m1 =
        !status || (c.stage ?? "").toLowerCase() === status.toLowerCase();
      const m3 =
        !q ||
        c.user.name?.toLowerCase().includes(q) ||
        c.user.email?.toLowerCase().includes(q) ||
        c.user.phone?.toLowerCase().includes(q);
      return m1 && m3;
    });
  }, [candidatesData, status, search]);

  // summary
  const counts = useMemo(() => {
    const total = candidatesData.length;
    const by = (st: string) =>
      candidatesData.filter(
        (c) => c.stage?.toLowerCase() === st.toLowerCase()
      ).length;
    return {
      all: total,
      screening: by("Screening"),
      interview: by("Interview"),
      hired: by("Hired"),
      rejected: by("Rejected"),
      waiting: by("Waiting"),
    };
  }, [candidatesData]);

  const lastCountsRef = useRef<string>("");
  useEffect(() => {
    const sig = JSON.stringify(counts);
    if (sig === lastCountsRef.current) return;
    lastCountsRef.current = sig;
    setSummary([
      { key: "all", label: "Total Applicants", count: counts.all },
      { key: "screening", label: "Screening", count: counts.screening },
      { key: "interview", label: "Interview", count: counts.interview },
      { key: "hired", label: "Hired", count: counts.hired },
      { key: "rejected", label: "Rejected", count: counts.rejected },
      { key: "waiting", label: "Waiting", count: counts.waiting },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts]);

  // columns: pass an onHistory that opens modal
  const columns = Columns({
    onDetail: (id: string) => {},
    onHistory: (candidateId: string) => {
      setHistoryForCandidateId(candidateId);
      setHistoryVisible(true);
    },
  });

  // derive selected candidate & history items for modal
  const selectedCandidate: ApplicantDataModel | undefined = useMemo(
    () => candidatesData.find((c) => c.id === historyForCandidateId),
    [candidatesData, historyForCandidateId]
  );

  const candidateHistory: HistoryCandidateDataModel[] = useMemo(() => {
    if (!historyForCandidateId) return [];
    return [...historyCandidates]
      .filter((h) => h.applicant_id === historyForCandidateId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [historyCandidates, historyForCandidateId]);

  const page = 1;
  const totalPages = 1;

  return (
    <>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
        {/* Filters */}
        <Row gutter={10} style={{ margin: "12px 0 16px" }}>
          <Col xs={24} md={6}>
            <Select
              allowClear
              placeholder="Filter by Status"
              style={{ width: "100%" }}
              value={status}
              onChange={setStatus}
            >
              {statusOptions.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Input
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={2}>
            <Button type="primary" icon={<SearchOutlined />} block>
              Search
            </Button>
          </Col>
          <Col xs={12} md={2}>
            <Button
              danger
              icon={<CloseOutlined />}
              block
              onClick={() => {
                setStatus(undefined);
                setSearch("");
              }}
            >
              Clear
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <div
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Table<ApplicantDataModel>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            pagination={false}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
              padding: "10px 16px",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Button disabled>Previous</Button>
            <Text>
              Page {page} of {totalPages}
            </Text>
            <Button disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* History Modal */}
      <Modal
        open={historyVisible}
        onCancel={() => {
          setHistoryVisible(false);
          setHistoryForCandidateId(null);
        }}
        footer={null}
        title={
          <Space>
            <HistoryOutlined />
            <span>
              Stage History —{" "}
              {selectedCandidate?.user.name ?? "(Unknown Candidate)"}
            </span>
          </Space>
        }
      >
        {candidateHistory.length === 0 ? (
          <Text type="secondary">No history yet.</Text>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {candidateHistory.map((h) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #f0f0f0",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#fff",
                }}
              >
                <Tag color="blue" style={{ marginRight: 12 }}>
                  {h.stage}
                </Tag>
                <Text type="secondary">{formatDateTime(h.createdAt)}</Text>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
