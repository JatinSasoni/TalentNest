/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const SectionTitle = ({ children }) => (
  <h2
    style={{
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#2563eb",
      borderBottom: "1px solid #e5e7eb",
      paddingBottom: "4px",
      marginBottom: "8px",
      marginTop: "14px",
    }}
  >
    {children}
  </h2>
);

export const ResumePreview = forwardRef(function ResumePreview(
  { draft, screen = false },
  ref
) {
  const { personal, experience, projects = [], education, skills } = draft;
  const contactLine = [personal.email, personal.phone, personal.location]
    .filter(Boolean)
    .join(" · ");

  const pageStyle = screen
    ? {
        width: "100%",
        minHeight: "680px",
        padding: "24px 28px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11px",
        lineHeight: 1.45,
        color: "#111827",
        boxSizing: "border-box",
      }
    : {
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11px",
        lineHeight: 1.45,
        color: "#111827",
        boxSizing: "border-box",
      };

  return (
    <div
      ref={ref}
      className="resume-preview-export mx-auto bg-white text-gray-900 shadow-lg"
      style={pageStyle}
    >
      <header style={{ marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>
        {contactLine && (
          <p style={{ margin: "6px 0 0", fontSize: "10px", color: "#4b5563" }}>
            {contactLine}
          </p>
        )}
      </header>

      {personal.summary?.trim() && (
        <section>
          <SectionTitle>Summary</SectionTitle>
          <p style={{ margin: 0, color: "#374151" }}>{personal.summary}</p>
        </section>
      )}

      {experience.some(
        (e) => e.company || e.role || e.bullets?.some((b) => b?.trim())
      ) && (
        <section>
          <SectionTitle>Experience</SectionTitle>
          {experience.map((exp) => {
            const hasContent =
              exp.company ||
              exp.role ||
              exp.bullets?.some((b) => b?.trim());
            if (!hasContent) return null;

            const dateRange = [exp.start, exp.end].filter(Boolean).join(" – ");

            return (
              <div
                key={exp.id}
                style={{ marginBottom: "10px", pageBreakInside: "avoid" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "baseline",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "12px" }}>
                    {exp.role || "Role"}
                    {exp.company ? ` · ${exp.company}` : ""}
                  </p>
                  {dateRange && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dateRange}
                    </span>
                  )}
                </div>
                <ul
                  style={{
                    margin: "4px 0 0",
                    paddingLeft: "16px",
                    color: "#374151",
                  }}
                >
                  {(exp.bullets || [])
                    .filter((b) => b?.trim())
                    .map((bullet, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>
                        {bullet}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {projects.some(
        (p) => p.name || p.link || p.bullets?.some((b) => b?.trim())
      ) && (
        <section>
          <SectionTitle>Projects</SectionTitle>
          {projects.map((proj) => {
            const hasContent =
              proj.name ||
              proj.link ||
              proj.bullets?.some((b) => b?.trim());
            if (!hasContent) return null;

            const dateRange = [proj.start, proj.end].filter(Boolean).join(" – ");

            return (
              <div
                key={proj.id}
                style={{ marginBottom: "10px", pageBreakInside: "avoid" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "baseline",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "12px" }}>
                    {proj.name || "Project"}
                    {proj.link ? (
                      <span style={{ fontWeight: 400, color: "#4b5563" }}>
                        {" "}
                        · {proj.link}
                      </span>
                    ) : null}
                  </p>
                  {dateRange && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dateRange}
                    </span>
                  )}
                </div>
                <ul
                  style={{
                    margin: "4px 0 0",
                    paddingLeft: "16px",
                    color: "#374151",
                  }}
                >
                  {(proj.bullets || [])
                    .filter((b) => b?.trim())
                    .map((bullet, i) => (
                      <li key={i} style={{ marginBottom: "2px" }}>
                        {bullet}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {education.some((e) => e.school || e.degree || e.year) && (
        <section>
          <SectionTitle>Education</SectionTitle>
          {education.map((edu) => {
            if (!edu.school && !edu.degree && !edu.year) return null;
            return (
              <div key={edu.id} style={{ marginBottom: "8px" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "12px" }}>
                  {edu.degree || "Degree"}
                  {edu.school ? ` · ${edu.school}` : ""}
                </p>
                {edu.year && (
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "10px",
                      color: "#6b7280",
                    }}
                  >
                    {edu.year}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <p style={{ margin: 0, color: "#374151" }}>{skills.join(" · ")}</p>
        </section>
      )}
    </div>
  );
});
