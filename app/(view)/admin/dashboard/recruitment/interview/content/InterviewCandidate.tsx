"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Empty,
  Skeleton,
  Modal,
} from "antd";
import dayjs from "dayjs";

import type { CandidateDataModel } from "@/app/models/apply-job";
import ScheduleInterviewForm from "@/app/components/common/form/interview";
import {
  ScheduleInterviewDataModel,
  ScheduleInterviewPayloadCreateModel,
} from "@/app/models/interview";
import ScheduleTimeline from "./InterviewTimeline";
import CandidateInfoPanel from "@/app/components/common/information-panel";


/* ---------- helpers ---------- */


/* ================== Page ================== */
export default function InterviewSchedulePage({
  listData = [],
  listLoading = false,
  candidate,
  submitting = false,
  onCreateSchedule,
  onReschedule,
}: {
  selectedScheduleId?: string | null;
  candidate: CandidateDataModel | null;
  interviewers?: { value: string; label: string }[];
  listData?: ScheduleInterviewDataModel[];
  listLoading?: boolean;
  submitting?: boolean;
  onReschedule?: (args: {
    id: string;
    payload: ScheduleInterviewPayloadCreateModel;
  }) => Promise<void>;
  title?: string;
  onCreateSchedule: (
    payload: ScheduleInterviewPayloadCreateModel
  ) => Promise<void>;
}) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleInterviewDataModel | null>(
    null
  );

  const schedules = useMemo(
    () => listData.filter((s) => s.candidateId === candidate?.id),
    [listData, candidate?.id]
  );

  const openReschedule = (item: ScheduleInterviewDataModel) => {
    setEditing(item);
    setRescheduleOpen(true);
  };
  const closeReschedule = () => {
    setRescheduleOpen(false);
    setEditing(null);
  };

  const initialValues = editing && {
    candidateId: editing.candidateId,
    locationId: editing.locationId ?? editing.location?.id,
    online: !!editing.meeting_link,
    meeting_link: editing.meeting_link ?? "",
    date: dayjs(editing.date),
    start_time: dayjs(editing.start_time),
  };

  const handleRescheduleSubmit = async (
    values: ScheduleInterviewPayloadCreateModel
  ) => {
    if (!editing || !onReschedule) return;
    await onReschedule({ id: editing.id, payload: values });
    closeReschedule();
  };

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

  const hasSchedules = schedules.length > 0;

  return (
    <Row gutter={[16, 16]}>
      {/* LEFT PANEL (Profile) */}
      <Col xs={24} md={8}>
        <CandidateInfoPanel
          email={candidate.email}
          phone={candidate.phone}
          dateOfBirth={candidate.date_of_birth}
          jobName={candidate.job?.name}
          appliedAt={candidate.createdAt}
          updatedAt={candidate.updatedAt}
          cvUrl={candidate.curiculum_vitae_url}
          portfolioUrl={candidate.portfolio_url}
        />
      </Col>

      {/* RIGHT PANEL (Schedule / Form) */}
      <Col xs={24} md={16}>
        {listLoading ? (
          <Card style={{ borderRadius: 14 }}>
            <Skeleton active />
          </Card>
        ) : hasSchedules ? (
          <ScheduleTimeline
            schedules={schedules}
            onReschedule={openReschedule}
          />
        ) : (
          <Card style={{ borderRadius: 14 }}>
            <ScheduleInterviewForm
              candidateId={candidate.id!}
              loading={submitting}
              onSubmit={onCreateSchedule}
            />
          </Card>
        )}
      </Col>


      <Modal
        title="Reschedule Interview"
        open={rescheduleOpen}
        onCancel={closeReschedule}
        footer={null}
        destroyOnClose
      >
        {editing && (
          <ScheduleInterviewForm
            candidateId={candidate.id!}
            loading={false}
            onSubmit={handleRescheduleSubmit}
            initialValues={initialValues}
            submitText="Update Schedule"
            mode="update"
          />
        )}
      </Modal>
    </Row>
  );
}
