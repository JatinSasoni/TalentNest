/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const pdf = (px) => `calc(${px}px * var(--resume-fill, 1))`;

const typeScale = (forPdf) =>
  forPdf
    ? {
        body: pdf(11.5),
        lineHeight: 1.45,
        contact: pdf(10.5),
        meta: pdf(10),
        entryTitle: pdf(12.5),
        sectionTitle: pdf(13),
        name: pdf(28),
        sectionGapTop: pdf(18),
        sectionGapBottom: pdf(10),
        entryGap: pdf(11),
        headerGap: pdf(12),
        bulletGap: pdf(4),
        listPad: pdf(18),
        padding: `${pdf(46)} ${pdf(53)}`,
      }
    : {
        body: "11.5px",
        lineHeight: 1.48,
        contact: "10.5px",
        meta: "10px",
        entryTitle: "12.5px",
        sectionTitle: "12px",
        name: "28px",
        sectionGapTop: "18px",
        sectionGapBottom: "10px",
        entryGap: "11px",
        headerGap: "12px",
        bulletGap: "3px",
        listPad: "18px",
        padding: "24px 28px",
      };

const SectionTitle = ({ children, type }) => (
  <h2
    style={{
      fontSize: type.sectionTitle,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#2563eb",
      borderBottom: "1px solid #e5e7eb",
      paddingBottom: "5px",
      marginBottom: type.sectionGapBottom,
      marginTop: type.sectionGapTop,
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
  const forPdf = !screen;
  const type = typeScale(forPdf);
  const contactLine = [personal.email, personal.phone, personal.location]
    .filter(Boolean)
    .join(" · ");

  const pageStyle = screen
    ? {
        width: "100%",
        minHeight: "680px",
        padding: type.padding,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: type.body,
        lineHeight: type.lineHeight,
        color: "#111827",
        boxSizing: "border-box",
      }
    : {
        width: "210mm",
        padding: type.padding,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: type.body,
        lineHeight: type.lineHeight,
        color: "#111827",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
      };

  return (
    <div
      ref={ref}
      className="resume-preview-export mx-auto bg-white text-gray-900 shadow-lg"
      style={pageStyle}
    >
      <header style={{ marginBottom: type.headerGap }}>
        <h1
          style={{
            fontSize: type.name,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          {personal.fullName || "Your Name"}
        </h1>
        {contactLine && (
          <p
            style={{
              margin: `${forPdf ? pdf(8) : "8px"} 0 0`,
              fontSize: type.contact,
              color: "#4b5563",
            }}
          >
            {contactLine}
          </p>
        )}
      </header>

      {personal.summary?.trim() && (
        <section>
          <SectionTitle type={type}>Summary</SectionTitle>
          <p style={{ margin: 0, color: "#374151" }}>{personal.summary}</p>
        </section>
      )}

      {experience.some(
        (e) => e.company || e.role || e.bullets?.some((b) => b?.trim())
      ) && (
        <section>
          <SectionTitle type={type}>Experience</SectionTitle>
          {experience.map((exp) => {
            const hasContent =
              exp.company ||
              exp.role ||
              exp.bullets?.some((b) => b?.trim());
            if (!hasContent) return null;

            const dateRange = [exp.start, exp.end].filter(Boolean).join(" – ");

            return (
              <div key={exp.id} style={{ marginBottom: type.entryGap }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "baseline",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: type.entryTitle,
                    }}
                  >
                    {exp.role || "Role"}
                    {exp.company ? ` · ${exp.company}` : ""}
                  </p>
                  {dateRange && (
                    <span
                      style={{
                        fontSize: type.meta,
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
                    margin: `${type.bulletGap} 0 0`,
                    paddingLeft: type.listPad,
                    color: "#374151",
                  }}
                >
                  {(exp.bullets || [])
                    .filter((b) => b?.trim())
                    .map((bullet, i) => (
                      <li key={i} style={{ marginBottom: type.bulletGap }}>
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
          <SectionTitle type={type}>Projects</SectionTitle>
          {projects.map((proj) => {
            const hasContent =
              proj.name ||
              proj.link ||
              proj.bullets?.some((b) => b?.trim());
            if (!hasContent) return null;

            const dateRange = [proj.start, proj.end].filter(Boolean).join(" – ");

            return (
              <div key={proj.id} style={{ marginBottom: type.entryGap }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "8px",
                    alignItems: "baseline",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: type.entryTitle,
                    }}
                  >
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
                        fontSize: type.meta,
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
                    margin: `${type.bulletGap} 0 0`,
                    paddingLeft: type.listPad,
                    color: "#374151",
                  }}
                >
                  {(proj.bullets || [])
                    .filter((b) => b?.trim())
                    .map((bullet, i) => (
                      <li key={i} style={{ marginBottom: type.bulletGap }}>
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
          <SectionTitle type={type}>Education</SectionTitle>
          {education.map((edu) => {
            if (!edu.school && !edu.degree && !edu.year) return null;
            return (
              <div key={edu.id} style={{ marginBottom: type.entryGap }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: type.entryTitle,
                  }}
                >
                  {edu.degree || "Degree"}
                  {edu.school ? ` · ${edu.school}` : ""}
                </p>
                {edu.year && (
                  <p
                    style={{
                      margin: `${type.bulletGap} 0 0`,
                      fontSize: type.meta,
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
          <SectionTitle type={type}>Skills</SectionTitle>
          <p style={{ margin: 0, color: "#374151" }}>{skills.join(" · ")}</p>
        </section>
      )}
    </div>
  );
});
