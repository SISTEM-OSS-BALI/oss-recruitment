import { useState, useMemo } from "react";
import { Flex, Form, Input, Tabs, Typography, Empty, message } from "antd";
import Title from "antd/es/typography/Title";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { useJob, useJobs } from "@/app/hooks/job";
import {
  JobDataModel,
  JobPayloadCreateModel,
  JobPayloadUpdateModel,
} from "@/app/models/job";

import CustomButton from "@/app/components/common/custom-buttom";
import JobModal from "@/app/components/common/modal/admin/job";
import JobCard from "./JobCards";
import { useRouter } from "next/navigation";
import ModalRecommendedCandidate from "./ModalRecommendedCandidate";

const { Text } = Typography;

const WORK_TYPE_OPTIONS = ["ONSITE", "HYBRID", "REMOTE"] as const;
const EMPLOYMENT_TYPE_OPTIONS = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
] as const;
const TYPE_JOB_OPTIONS = ["TEAM_MEMBER", "REFFERAL"] as const;

export default function SettingJobContent() {
  const [form] = Form.useForm<JobDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedJob, setSelectedJob] = useState<JobDataModel | null>(null);
  const [recommendedJob, setRecommendedJob] = useState<JobDataModel | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "inactive" | "draft">(
    "all"
  );

  const router = useRouter();

  const goToManageCandidate = (jobId: string) => {
    router.push(
      `/admin/dashboard/setting-job/manage-candidates?job_id=${encodeURIComponent(
        jobId
      )}`
    )
  };

  const {
    data: jobsData = [],
    onCreate: jobCreate,
    onCreateLoading: jobLoadingCreate,
    onDelete: onDeleteJob,
  } = useJobs({});

  const { onUpdate: jobUpdate, onUpdateLoading: jobLoadingUpdate } = useJob({
    id: selectedJob?.id || "",
  });

  const filtered = useMemo(() => {
    const bySearch = (j: JobDataModel) =>
      j.name.toLowerCase().includes(search.toLowerCase());

    const byTab = (j: JobDataModel) => {
      if (tab === "active") return j.is_published === true;
      if (tab === "inactive") return j.is_published === false;
      if (tab === "draft") return j.is_published === false;
      return true;
    };

    return jobsData.filter((j) => bySearch(j) && byTab(j));
  }, [jobsData, search, tab]);

  const handleEdit = (id: string) => {
    const jobEdit = jobsData.find((job) => job.id === id);
    if (!jobEdit) return;
    setSelectedJob(jobEdit);
    setModalType("update");
    setModalOpen(true);

    const isReferral = jobEdit.type_job === "REFFERAL";
    form.setFieldsValue({
      ...jobEdit,
      type_job: jobEdit.type_job ?? TYPE_JOB_OPTIONS[0],
      salary:
        isReferral || !jobEdit.salary
          ? undefined
          : Number(jobEdit.salary.replace(/[^\d]/g, "")),
      work_type: isReferral
        ? WORK_TYPE_OPTIONS[0]
        : jobEdit.work_type ?? WORK_TYPE_OPTIONS[0],
      employment: isReferral
        ? EMPLOYMENT_TYPE_OPTIONS[0]
        : jobEdit.employment ?? EMPLOYMENT_TYPE_OPTIONS[0],
      show_salary: isReferral ? false : Boolean(jobEdit.show_salary),
      until_at: dayjs(jobEdit.until_at),
    });
  };

  const buildPayload = (
    values: JobDataModel
  ): JobPayloadCreateModel & JobPayloadUpdateModel => {
    const until = values.until_at ? dayjs(values.until_at).toISOString() : null;
    if (!until) {
      throw new Error("Date is required");
    }
    const jobType =
      (values.type_job as (typeof TYPE_JOB_OPTIONS)[number]) ??
      TYPE_JOB_OPTIONS[0];
    const salaryValue = values.salary;
    const parsedSalary =
      typeof salaryValue === "number"
        ? salaryValue.toString()
        : (salaryValue ?? "").toString();

    if (jobType === "TEAM_MEMBER" && !parsedSalary) {
      throw new Error("Salary is required");
    }

    if (jobType === "TEAM_MEMBER") {
      if (!values.work_type) {
        throw new Error("Work type is required");
      }
      if (!values.employment) {
        throw new Error("Employment type is required");
      }
    }

    const workTypeValue =
      values.work_type ?? WORK_TYPE_OPTIONS[0];
    const employmentValue =
      values.employment ?? EMPLOYMENT_TYPE_OPTIONS[0];

    return {
      name: values.name,
      description: values.description,
      location_id: values.location_id,
      is_published: Boolean(values.is_published),
      salary: jobType === "TEAM_MEMBER" ? parsedSalary : "",
      type_job: jobType,
      work_type: workTypeValue,
      employment: employmentValue,
      show_salary:
        jobType === "REFFERAL" ? false : Boolean(values.show_salary),
      until_at: until,
    } as JobPayloadCreateModel & JobPayloadUpdateModel;
  };

  const handleFinish = async (values: JobDataModel) => {
    try {
      const payload = buildPayload(values);

      if (modalType === "create") {
        await jobCreate(payload);
      } else if (selectedJob?.id) {
        await jobUpdate({ id: selectedJob.id, payload });
      }

      form.resetFields();
      setSelectedJob(null);
      setModalOpen(false);
      setModalType("create");
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to save job. Please try again."
      );
    }
  };

  const handleTogglePublish = async (id: string, next: boolean) => {
    const current = jobsData.find((j) => j.id === id);
    if (!current) return;
    try {
      const payload: JobPayloadUpdateModel = {
        is_published: next,
      };
      await jobUpdate({ id, payload });
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Failed to update job status."
      );
    }
  };

  return (
    <div>
      <Title level={4}>Job Management</Title>

      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{ marginBottom: 16 }}
      >
        <Input
          style={{ maxWidth: 360 }}
          prefix={<SearchOutlined />}
          placeholder="Search job title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CustomButton
          title="Add Job"
          onClick={() => {
            form.resetFields();
            form.setFieldsValue({
              type_job: TYPE_JOB_OPTIONS[0],
              work_type: WORK_TYPE_OPTIONS[0],
              employment: EMPLOYMENT_TYPE_OPTIONS[0],
              show_salary: true,
            });
            setSelectedJob(null);
            setModalType("create");
            setModalOpen(true);
          }}
          icon={<PlusOutlined />}
        />
      </Flex>

      <Tabs
        activeKey={tab}
        onChange={(k: string) => setTab(k)}
        items={[
          {
            key: "all",
            label: (
              <>
                All <TagCount count={jobsData.length} />
              </>
            ),
          },
          {
            key: "active",
            label: (
              <>
                Active{" "}
                <TagCount
                  count={jobsData.filter((j) => j.is_published).length}
                />
              </>
            ),
          },
          {
            key: "inactive",
            label: (
              <>
                Inactive{" "}
                <TagCount
                  count={jobsData.filter((j) => !j.is_published).length}
                />
              </>
            ),
          },
          {
            key: "draft",
            label: (
              <>
                Drafts{" "}
                <TagCount
                  count={jobsData.filter((j) => !j.is_published).length}
                />
              </>
            ),
          },
        ]}
      />

      <InfoTip />

      {filtered.length === 0 ? (
        <Empty description="No jobs found" style={{ marginTop: 24 }} />
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={handleEdit}
              onDelete={onDeleteJob}
              onTogglePublish={handleTogglePublish}
              goToPage={() => goToManageCandidate(job.id)}
              onShowRecommendations={(job) => setRecommendedJob(job)}
            />
          ))}
        </div>
      )}

      <JobModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          form.resetFields();
          setSelectedJob(null);
          setModalType("create");
        }}
        form={form}
        type={modalType}
        initialValues={
          modalType === "update" ? selectedJob ?? undefined : undefined
        }
        handleFinish={handleFinish}
        loadingCreate={jobLoadingCreate}
        loadingUpdate={jobLoadingUpdate}
      />

      <ModalRecommendedCandidate
        open={Boolean(recommendedJob)}
        jobId={recommendedJob?.id}
        jobName={recommendedJob?.name}
        onClose={() => setRecommendedJob(null)}
      />
    </div>
  );
}

function TagCount({ count }: { count: number }) {
  return (
    <span
      style={{
        background: "#f0f2f5",
        borderRadius: 12,
        padding: "0 8px",
        marginLeft: 6,
        fontSize: 12,
      }}
    >
      {count}
    </span>
  );
}

function InfoTip() {
  return (
    <div
      style={{
        border: "1px solid #e6f4ff",
        background: "#e6f4ff88",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <Text>
        Tips: Process applicants regularly to keep your job visible and attract
        more candidates.
      </Text>
    </div>
  );
}
