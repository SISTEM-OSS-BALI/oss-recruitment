"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Segmented,
  Space,
  Button,
  Card,
  Tag,
  Divider,
  Anchor,
  Affix,
  List,
  message,
  Empty,
} from "antd";
import {
  ShareAltOutlined,
  DownloadOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// ————————————————————————————————————————————————
// GuidebookContent — Ant Design edition (no Tailwind)
// • Search, tag filters, sticky TOC, print/share actions
// • Responsive layout: Left TOC (Affix), Main content, Right help panel
// ————————————————————————————————————————————————

export default function GuidebookContent() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const activeSectionRef = useRef("");

  const tags = [
    "All",
    "General",
    "Installation",
    "Configuration",
    "Features",
    "Operations",
    "Reference",
  ];

  const chapters = useMemo(
    () => [
      {
        id: "intro",
        title: "Introduction",
        summary:
          "A quick overview of the guide's purpose, scope, and how to navigate it effectively.",
        lastUpdated: "2025-10-25",
        estimated: "3 min",
        tags: ["General"],
        sections: [
          {
            heading: "Document Goals",
            content: [
              "Serve as the official reference for new and advanced users.",
              "Provide consistent operational standards across teams.",
              "Reduce repeated questions and configuration errors.",
            ],
          },
          {
            heading: "How to Use",
            content: [
              "Use the search to find specific topics.",
              "Skim each chapter summary, then dive into details.",
              "Follow the Quickstart if this is your first time.",
            ],
          },
        ],
      },
      {
        id: "quickstart",
        title: "Quickstart",
        summary: "The shortest path from zero to ready.",
        lastUpdated: "2025-10-26",
        estimated: "7 min",
        tags: ["Installation", "Configuration"],
        sections: [
          {
            heading: "Prerequisites",
            content: [
              "Valid account access and proper roles.",
              "Active credentials/tokens.",
              "Stable network connection.",
            ],
          },
          {
            heading: "Fast Steps",
            content: [
              "Create/sign in → verify email.",
              "Initial configuration (profile, organization, preferences).",
              "Test the main features to confirm the flow works.",
            ],
          },
        ],
      },
      {
        id: "core-features",
        title: "Core Features",
        summary: "Key features explained with practical tips.",
        lastUpdated: "2025-10-27",
        estimated: "10 min",
        tags: ["Features", "Operations"],
        sections: [
          {
            heading: "Navigation & Layout",
            content: [
              "Use the sidebar for core modules and the header for quick actions.",
              "Use global search to jump between pages.",
              "Keyboard: / to focus search, g → m to go to modules.",
            ],
          },
          {
            heading: "Data Management",
            content: [
              "Use filter & sort for faster discovery.",
              "Export (CSV/PDF) for reporting.",
              "Track changes via the history/audit page.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ & Troubleshooting",
        summary: "Common questions, frequent errors, and quick fixes.",
        lastUpdated: "2025-10-28",
        estimated: "6 min",
        tags: ["Operations", "Reference"],
        sections: [
          {
            heading: "Frequently Asked",
            content: [
              "How to reset password? → Profile page.",
              "Can't log in? → Check connectivity & account status.",
              "Slow performance? → Clear cache & limit active tabs.",
            ],
          },
          {
            heading: "Quick Diagnosis",
            content: [
              "Capture the complete error message.",
              "Repeat the steps → confirm it's reproducible.",
              "Report via the official channel with screenshots/logs.",
            ],
          },
        ],
      },
      {
        id: "appendix",
        title: "Appendix & References",
        summary: "Glossary, file structure, and reference links.",
        lastUpdated: "2025-10-29",
        estimated: "4 min",
        tags: ["Reference"],
        sections: [
          {
            heading: "Glossary",
            content: [
              "Token: an access key representing user authorization.",
              "SLA: the agreed service-level commitment.",
              "Backup: a data copy used for recovery.",
            ],
          },
          {
            heading: "Useful Links",
            content: [
              "Help Center & Advanced Docs.",
              "Service Status & Incident History.",
              "Security & Compliance Guide.",
            ],
          },
        ],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      const hitTag = activeTag === "All" || c.tags.includes(activeTag);
      const blocks = [
        c.title,
        c.summary,
        ...(c.sections?.flatMap((s) => [s.heading, ...(s.content || [])]) ||
          []),
      ];
      const hitText = !q ? true : blocks.join(" ").toLowerCase().includes(q);
      return hitTag && hitText;
    });
  }, [chapters, query, activeTag]);

//   const stats = useMemo(() => {
//     const totalChapters = chapters.length;
//     const totalSections = chapters.reduce(
//       (sum, chapter) => sum + (chapter.sections?.length || 0),
//       0
//     );
//     const totalMinutes = chapters.reduce((sum, chapter) => {
//       const match = chapter.estimated.match(/\d+/);
//       return sum + (match ? parseInt(match[0], 10) : 0);
//     }, 0);
//     const avgMinutes = totalChapters
//       ? Math.max(1, Math.round(totalMinutes / totalChapters))
//       : 0;
//     const lastUpdated = chapters.reduce((latest, current) => {
//       const latestDate = latest ? new Date(latest) : null;
//       const currentDate = new Date(current.lastUpdated);
//       if (!latestDate || currentDate > latestDate) {
//         return current.lastUpdated;
//       }
//       return latest;
//     }, "");
//     return {
//       totalChapters,
//       totalSections,
//       avgMinutes,
//       lastUpdated,
//     };
//   }, [chapters]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = Math.min(
        100,
        Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100)
      );
      setProgress(pct);

      if (typeof window === "undefined") {
        return;
      }

      const containerRectTop = el.getBoundingClientRect().top;
      const threshold = 32;
      let currentId = activeSectionRef.current;
      let closestOffset = Number.NEGATIVE_INFINITY;

      filtered.forEach((chapter) => {
        const node = document.getElementById(chapter.id);
        if (!node) return;

        const nodeRectTop = node.getBoundingClientRect().top;
        const offsetTop =
          nodeRectTop - containerRectTop + scrollTop;

        if (offsetTop <= scrollTop + threshold && offsetTop > closestOffset) {
          closestOffset = offsetTop;
          currentId = chapter.id;
        }
      });

      if (currentId !== activeSectionRef.current) {
        activeSectionRef.current = currentId;
        setActiveSection(currentId);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [filtered]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!filtered.length) {
      activeSectionRef.current = "";
      setActiveSection("");
      return;
    }

    if (!filtered.some((chapter) => chapter.id === activeSectionRef.current)) {
      const firstId = filtered[0].id;
      activeSectionRef.current = firstId;
      setActiveSection(firstId);
    }
  }, [filtered]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Guide Book",
          text: "Check out the official guide.",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success("Link copied to clipboard");
      }
    } catch {
      // ignore
    }
  };

  const handlePrint = () => window.print();

  const handleAnchorClick = (e, link) => {
    e.preventDefault();

    const rawHref = link?.href || "";
    const anchorId = rawHref.startsWith("#")
      ? rawHref.slice(1)
      : rawHref.split("#")[1];

    if (!anchorId) return;

    const container = contentRef.current;
    const target =
      typeof document !== "undefined"
        ? document.getElementById(anchorId)
        : null;

    if (!target) return;

    if (container) {
      const containerRectTop = container.getBoundingClientRect().top;
      const targetRectTop = target.getBoundingClientRect().top;
      const offsetTop =
        targetRectTop - containerRectTop + container.scrollTop - 12;

      container.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    activeSectionRef.current = anchorId;
    setActiveSection(anchorId);
  };

  const anchorItems = filtered.map((c) => ({
    key: c.id,
    href: `#${c.id}`,
    title: c.title,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eef3ff 0%, #ffffff 45%)",
      }}
    >
      {/* <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9,
          background: "#fff",
          padding: "4px 12px",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: progress > 0 ? "0 6px 12px rgba(15,23,42,0.04)" : "none",
        }}
      >
        <Progress percent={progress} showInfo={false} size="small" />
      </div> */}

      <div
        style={{
          padding: "32px 24px 48px",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(31,60,136,1) 0%, rgba(98,68,245,1) 55%, rgba(138,114,249,1) 100%)",
            color: "#fff",
            boxShadow: "0 24px 60px rgba(31,60,136,0.35)",
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Space direction="vertical" size={16}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Official Playbook
                </Text>
                <Title level={2} style={{ color: "#fff", margin: 0 }}>
                  Guide Book
                </Title>
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                  }}
                >
                  Navigate onboarding, configuration, and day-to-day operations with a curated,
                  always up-to-date reference. Designed for fast adoption and long-term success.
                </Paragraph>
                <Space size={[8, 8]} wrap>
                  {["Structured chapters", "Expert tips", "Download-ready"].map((item) => (
                    <Tag
                      key={item}
                      style={{
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 999,
                        padding: "2px 10px",
                      }}
                    >
                      {item}
                    </Tag>
                  ))}
                </Space>
                <Space>
                  <Button
                    type="primary"
                    ghost
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handlePrint}
                    style={{
                      background: "#fff",
                      color: "#1f3c88",
                      borderRadius: 6,
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    Download PDF
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: "#ffffff",
                boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Statistic
                title="Chapters"
                value={stats.totalChapters}
                valueStyle={{ color: "#1f3c88", fontWeight: 600 }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Coverage from introductions to advanced operations.
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: "#ffffff",
                boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Statistic
                title="Total sections"
                value={stats.totalSections}
                valueStyle={{ color: "#1f3c88", fontWeight: 600 }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Detailed walkthroughs for every critical scenario.
              </Text>
            </Card>
          </Col>
        </Row> */}

        <Card
          bordered={false}
          style={{
            marginTop: 24,
            borderRadius: 18,
            background: "#ffffff",
            boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[16, 16]} align="middle">
            {/* <Col xs={24} md={16}>
              <Input
                ref={searchRef}
                size="large"
                allowClear
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, features, or terms… (press / to focus)"
                prefix={<SearchOutlined />}
              />
            </Col> */}
            <Col xs={24} md={24}>
              <Segmented
                block
                options={tags}
                value={activeTag}
                onChange={(v) => setActiveTag(v)}
                style={{ background: "#f1f4ff", borderRadius: 999 }}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 24]} style={{ marginTop: 32 }}>
          <Col xs={24} xl={5}>
            <Affix offsetTop={120}>
              <Card
                size="small"
                bordered={false}
                title={<span style={{ fontWeight: 600 }}>Table of Contents</span>}
                style={{
                  borderRadius: 16,
                  background: "#ffffff",
                  boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                }}
                bodyStyle={{ padding: 16 }}
              >
                {anchorItems.length ? (
                  <Anchor
                    items={anchorItems}
                    replace
                    affix={false}
                    onClick={handleAnchorClick}
                    activeKey={activeSection || undefined}
                    getContainer={() => {
                      if (contentRef.current) return contentRef.current;
                      if (typeof window !== "undefined") {
                        return document.body;
                      }
                      return undefined;
                    }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No items"
                  />
                )}
              </Card>
            </Affix>
          </Col>

          <Col xs={24} xl={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "#ffffff",
                boxShadow: "0 20px 56px rgba(15,23,42,0.12)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div
                ref={contentRef}
                id="guidebook-scroll-container"
                style={{
                  maxHeight: "calc(100vh - 260px)",
                  overflow: "auto",
                  padding: 24,
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ padding: "32px 0" }}>
                    <Empty description="No results for the current keyword/filters" />
                  </div>
                ) : (
                  filtered.map((c) => (
                    <Card
                      key={c.id}
                      id={c.id}
                      hoverable
                      style={{
                        marginBottom: 20,
                        borderRadius: 18,
                        border: "1px solid #eef2ff",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
                        boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
                      }}
                      bodyStyle={{ padding: 24 }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Title level={4} style={{ marginBottom: 4 }}>
                            {c.title}
                          </Title>
                          <Text type="secondary">{c.summary}</Text>
                        </Col>
                      </Row>

                      <Space size={[8, 8]} wrap style={{ marginTop: 12 }}>
                        {c.tags.map((t) => (
                          <Tag
                            key={t}
                            color="blue"
                            style={{ borderRadius: 999, padding: "0 12px" }}
                          >
                            {t}
                          </Tag>
                        ))}
                      </Space>

                      <Divider
                        style={{ margin: "16px 0", borderBlockStart: "1px solid #edf1ff" }}
                      />

                      {c.sections?.map((s, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <Title level={5} style={{ marginBottom: 8 }}>
                            {s.heading}
                          </Title>
                          <List
                            size="small"
                            split={false}
                            dataSource={s.content || []}
                            renderItem={(item) => (
                              <List.Item style={{ padding: "6px 0", border: "none" }}>
                                <Space align="start" size={12}>
                                  <CheckCircleFilled
                                    style={{ color: "#2b74ff", marginTop: 4, fontSize: 12 }}
                                  />
                                  <Text>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </div>
                      ))}

                      <Divider
                        style={{ margin: "16px 0", borderBlockStart: "1px solid #edf1ff" }}
                      />
                      {/* <Button
                        type="link"
                        icon={<ArrowUpOutlined />}
                        onClick={() =>
                          contentRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          })
                        }
                        style={{ paddingLeft: 0 }}
                      >
                        Back to top
                      </Button> */}
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={5}>
            <Affix offsetTop={120}>
              <Space direction="vertical" size="large" style={{ display: "flex" }}>
                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Document Status</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Space size={12} wrap>
                    <Tag color="success" style={{ borderRadius: 999, padding: "0 12px" }}>
                      Stable
                    </Tag>
                    <Text type="secondary">Maintained by Ops Excellence</Text>
                  </Space>
                  <Paragraph type="secondary" style={{ marginTop: 12 }}>
                    The team reviews updates every sprint and aligns with compliance requirements.
                  </Paragraph>
                </Card>

                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Need Help?</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <List
                    size="small"
                    split={false}
                    dataSource={[
                      "Help Center",
                      "Security & Compliance",
                      "Contact Administrator",
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "6px 0", border: "none" }}>
                        <a href="#">{item}</a>
                      </List.Item>
                    )}
                  />
                </Card>

                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Quick Notes</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <List
                    size="small"
                    split={false}
                    dataSource={[
                      "Save a PDF snapshot for annual audits.",
                      "Use the TOC for quick navigation.",
                      "Update the FAQ when new patterns emerge.",
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "6px 0", border: "none" }}>
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </Affix>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function formatDateEN(iso) {
  try {
    const d = new Date(iso);
    const f = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
    return f;
  } catch {
    return iso;
  }
}
