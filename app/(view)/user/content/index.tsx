"use client";

import { useJobs } from "@/app/hooks/job";
import { useMobile } from "@/app/hooks/use-mobile";
import { useMemo, useState } from "react";
import { Row, Col, Typography, Input, Button, Card, Empty } from "antd";
import { sanitizeHtml } from "@/app/utils/sanitize-html";
import FilterSidebar, {
  type FilterSidebarSection,
} from "@/app/components/common/sidebar/user/filter-sidebar-job";
import JobCard from "@/app/components/common/card/user/job";
import { JobDataModel } from "@/app/models/job";
import dayjs from "dayjs";
import {
  AppstoreOutlined,
  DeploymentUnitOutlined,
  TeamOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { toCapitalized } from "@/app/utils/capitalized";

const { Title, Text } = Typography;

export default function JobList() {
  const { data: jobData } = useJobs({ queryString: "status=active" });
  const isMobile = useMobile();
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [workTypeFilters, setWorkTypeFilters] = useState<string[]>([]);
  const [employmentFilters, setEmploymentFilters] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState({
    status: [] as string[],
    workType: [] as string[],
    employment: [] as string[],
    location: [] as string[],
  });

  const clearFilters = () => {
    setStatusFilters([]);
    setWorkTypeFilters([]);
    setEmploymentFilters([]);
    setLocationFilters([]);
    setAppliedFilters({
      status: [],
      workType: [],
      employment: [],
      location: [],
    });
    setSearch("");
  };

  const applyFilters = () => {
    setAppliedFilters({
      status: statusFilters,
      workType: workTypeFilters,
      employment: employmentFilters,
      location: locationFilters,
    });
  };

  const getJobStatus = (job: JobDataModel) =>
    dayjs(job.until_at).diff(dayjs(), "hour") > 0 ? "Open" : "Closed";

  const formatEnum = (value?: string | null) =>
    value ? toCapitalized(value.replace(/_/g, " ")) : "";

  const uniqueOptions = (values: Array<string | null | undefined>) => {
    const set = new Set<string>();
    values.forEach((val) => {
      if (typeof val === "string" && val.trim()) {
        set.add(val);
      }
    });
    return Array.from(set);
  };

  const statusOptions = useMemo(
    () =>
      uniqueOptions((jobData ?? []).map((job) => getJobStatus(job))).map(
        (value) => ({ value, label: value })
      ),
    [jobData]
  );

  const workTypeOptions = useMemo(
    () =>
      uniqueOptions((jobData ?? []).map((job) => job.arrangement)).map(
        (value) => ({
          value,
          label: formatEnum(value),
        })
      ),
    [jobData]
  );

  const employmentOptions = useMemo(
    () =>
      uniqueOptions((jobData ?? []).map((job) => job.commitment)).map(
        (value) => ({
          value,
          label: formatEnum(value),
        })
      ),
    [jobData]
  );

  const locationOptions = useMemo(
    () =>
      uniqueOptions((jobData ?? []).map((job) => job.location?.name)).map(
        (value) => ({
          value,
          label: value,
        })
      ),
    [jobData]
  );

  const filterSections = useMemo<FilterSidebarSection[]>(
    () => [
      {
        key: "status",
        title: "Status",
        icon: <AppstoreOutlined />,
        options: statusOptions,
        value: statusFilters,
        onChange: setStatusFilters,
      },
      {
        key: "work_type",
        title: "Work Type",
        icon: <DeploymentUnitOutlined />,
        options: workTypeOptions,
        value: workTypeFilters,
        onChange: setWorkTypeFilters,
      },
      {
        key: "employment",
        title: "Employment",
        icon: <TeamOutlined />,
        options: employmentOptions,
        value: employmentFilters,
        onChange: setEmploymentFilters,
      },
      {
        key: "location",
        title: "Location",
        icon: <EnvironmentOutlined />,
        options: locationOptions,
        value: locationFilters,
        onChange: setLocationFilters,
      },
    ],
    [
      employmentFilters,
      employmentOptions,
      locationFilters,
      locationOptions,
      statusFilters,
      statusOptions,
      workTypeFilters,
      workTypeOptions,
    ]
  );

  // Filter logic
  const filteredJobs =
    jobData?.filter((job) => {
      const jobStatus = getJobStatus(job);
      const workTypeValue = job.arrangement ?? "";
      const employmentValue = job.commitment ?? "";
      const locationName = job.location?.name ?? "";

      // Status
      const statusMatch =
        appliedFilters.status.length === 0 ||
        appliedFilters.status.includes(jobStatus);
      // Work type
      const workTypeMatch =
        appliedFilters.workType.length === 0 ||
        (!!workTypeValue && appliedFilters.workType.includes(workTypeValue));
      // Employment
      const employmentMatch =
        appliedFilters.employment.length === 0 ||
        (!!employmentValue &&
          appliedFilters.employment.includes(employmentValue));
      // Location
      const locationMatch =
        appliedFilters.location.length === 0 ||
        (!!locationName && appliedFilters.location.includes(locationName));
      // Search
      const searchMatch =
        search.trim() === "" ||
        job.job_title.toLowerCase().includes(search.toLowerCase()) ||
        sanitizeHtml(job.description).toLowerCase().includes(search.toLowerCase()) ||
        locationName.toLowerCase().includes(search.toLowerCase());
      return (
        statusMatch &&
        workTypeMatch &&
        employmentMatch &&
        locationMatch &&
        searchMatch
      );
    }) || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 16px" }}>
      {/* JUDUL & SEARCH */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 36,
          marginTop: 10,
        }}
      >
        <Title
          level={3}
          style={{ fontWeight: 700, marginBottom: 0, textAlign: "center" }}
        >
          Available Job Positions
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 20, textAlign: "center", marginTop: 6 }}
        >
          Find jobs and internships <br />
          that suits your needs
        </Text>
        <div
          style={{
            marginTop: isMobile ? 20 : 30,
            width: "100%",
            maxWidth: isMobile ? "100%" : 620,
            display: "flex",
            gap: isMobile ? 12 : 18,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Input
            size="large"
            placeholder="Explore available positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{
              borderRadius: 12,
              background: "#f8fafc",
              fontSize: 17,
              borderColor: "#e6eeff",
              flex: 1,
              minHeight: isMobile ? 48 : undefined,
            }}
          />
          <Button
            type="primary"
            size="large"
            style={{
              borderRadius: 12,
              fontWeight: 600,
              padding: "0 34px",
              fontSize: 17,
              height: 48,
              width: isMobile ? "100%" : "auto",
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {/* KONTEN GRID */}
      <Row gutter={isMobile ? [24, 32] : 32} align="top">
        {/* FILTER SIDEBAR */}
        <Col
          xs={24}
          sm={7}
          md={7}
          lg={6}
          xl={5}
          style={{
            display: "flex",
            justifyContent: isMobile ? "flex-start" : "center",
            marginBottom: isMobile ? 20 : 0,
          }}
        >
          <div style={{ width: "100%", maxWidth: 360 }}>
            <FilterSidebar
              sections={filterSections}
              clearFilters={clearFilters}
              onApplyFilters={applyFilters}
            />
          </div>
        </Col>
        {/* JOB LIST */}
        <Col xs={24} sm={17} md={17} lg={18} xl={19}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? 16 : 28,
            }}
          >
            {filteredJobs.length === 0 ? (
              <Card
                style={{
                  borderRadius: 16,
                  borderColor: "#e2e8f0",
                  textAlign: "center",
                }}
              >
                <Empty description="No jobs match your criteria" />
              </Card>
            ) : (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </Col>
      </Row>
      </div>
    </div>
  );
}
