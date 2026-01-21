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
import { Space_Grotesk,} from "next/font/google";

const { Title, Text } = Typography;

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// const bodyFont = Plus_Jakarta_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
// });

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

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 16px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* JUDUL & SEARCH */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 40,
              marginTop: 8,
              textAlign: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                background: "rgba(37,99,235,0.12)",
                color: "#1d4ed8",
                fontWeight: 600,
                letterSpacing: 0.2,
                fontSize: 13,
              }}
            >
              Opportunity Hub
            </span>
            <Title
              level={2}
              className={headingFont.className}
              style={{
                marginBottom: 0,
                fontWeight: 700,
                fontSize: isMobile ? 30 : 38,
              }}
            >
              Available Job Positions
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? 16 : 19,
                lineHeight: 1.5,
                maxWidth: 640,
              }}
            >
              Find curated opportunities and internships that match your goals,
              preferred schedule, and location.
            </Text>

            <div
              style={{
                marginTop: 8,
                width: "100%",
                maxWidth: isMobile ? "100%" : 740,
                display: "flex",
                gap: isMobile ? 12 : 16,
                flexDirection: isMobile ? "column" : "row",
                background: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 18,
                padding: 8,
                boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Input
                size="large"
                placeholder="Search roles, skills, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{
                  borderRadius: 14,
                  background: "transparent",
                  fontSize: 16,
                  borderColor: "transparent",
                  boxShadow: "none",
                  flex: 1,
                  minHeight: isMobile ? 48 : undefined,
                }}
              />
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: 14,
                  fontWeight: 600,
                  padding: "0 30px",
                  fontSize: 16,
                  height: 48,
                  width: isMobile ? "100%" : "auto",
                  boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
                }}
              >
                Search
              </Button>
            </div>
          </div>

          {/* KONTEN GRID */}
          <Row gutter={isMobile ? [20, 28] : 28} align="top">
            {/* FILTER SIDEBAR */}
            <Col
              xs={24}
              sm={8}
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
            <Col xs={24} sm={16} md={17} lg={18} xl={19}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? 16 : 24,
                }}
              >
                {filteredJobs.length === 0 ? (
                  <Card
                    style={{
                      borderRadius: 18,
                      borderColor: "#e2e8f0",
                      textAlign: "center",
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: "0 12px 26px rgba(15,23,42,0.06)",
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
