/* eslint-disable react/prop-types */
import { HiPlus, HiTrash } from "react-icons/hi2";
import {
  emptyEducation,
  emptyExperience,
  emptyProject,
  parseSkillsFromInput,
} from "../../util/resumeBuilderDefaults";

const inputClass =
  "w-full rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-400";

const labelClass = "block text-sm text-gray-600 dark:text-gray-400 mb-1";

const SectionBlock = ({ title, children, onAdd, addLabel }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </h3>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-blue-400 hover:text-blue-500 inline-flex items-center gap-1"
        >
          <HiPlus />
          {addLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

export const ResumeBuilderForm = ({ draft, setDraft }) => {
  const updatePersonal = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  const updateExperience = (id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const updateBullet = (expId, index, value) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const bullets = [...exp.bullets];
        bullets[index] = value;
        return { ...exp, bullets };
      }),
    }));
  };

  const addBullet = (expId) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ""] } : exp
      ),
    }));
  };

  const removeBullet = (expId, index) => {
    setDraft((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const bullets = exp.bullets.filter((_, i) => i !== index);
        return { ...exp, bullets: bullets.length ? bullets : [""] };
      }),
    }));
  };

  const addExperience = () => {
    setDraft((prev) => ({
      ...prev,
      experience: [...prev.experience, emptyExperience()],
    }));
  };

  const removeExperience = (id) => {
    setDraft((prev) => ({
      ...prev,
      experience:
        prev.experience.length > 1
          ? prev.experience.filter((e) => e.id !== id)
          : prev.experience,
    }));
  };

  const updateProject = (id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    }));
  };

  const updateProjectBullet = (projId, index, value) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projId) return proj;
        const bullets = [...proj.bullets];
        bullets[index] = value;
        return { ...proj, bullets };
      }),
    }));
  };

  const addProjectBullet = (projId) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === projId ? { ...proj, bullets: [...proj.bullets, ""] } : proj
      ),
    }));
  };

  const removeProjectBullet = (projId, index) => {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id !== projId) return proj;
        const bullets = proj.bullets.filter((_, i) => i !== index);
        return { ...proj, bullets: bullets.length ? bullets : [""] };
      }),
    }));
  };

  const addProject = () => {
    setDraft((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), emptyProject()],
    }));
  };

  const removeProject = (id) => {
    setDraft((prev) => {
      const projects = prev.projects || [];
      return {
        ...prev,
        projects:
          projects.length > 1
            ? projects.filter((p) => p.id !== id)
            : projects,
      };
    });
  };

  const updateEducation = (id, field, value) => {
    setDraft((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    setDraft((prev) => ({
      ...prev,
      education: [...prev.education, emptyEducation()],
    }));
  };

  const removeEducation = (id) => {
    setDraft((prev) => ({
      ...prev,
      education:
        prev.education.length > 1
          ? prev.education.filter((e) => e.id !== id)
          : prev.education,
    }));
  };

  const skillsInputValue =
    draft.skillsInput ?? draft.skills?.join(", ") ?? "";

  const updateSkills = (value) => {
    setDraft((prev) => ({
      ...prev,
      skillsInput: value,
      skills: parseSkillsFromInput(value),
    }));
  };

  return (
    <div>
      <SectionBlock title="Personal">
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              className={inputClass}
              value={draft.personal.fullName}
              onChange={(e) => updatePersonal("fullName", e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={draft.personal.email}
                onChange={(e) => updatePersonal("email", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={draft.personal.phone}
                onChange={(e) => updatePersonal("phone", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              value={draft.personal.location}
              onChange={(e) => updatePersonal("location", e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className={labelClass}>Summary</label>
            <textarea
              rows={3}
              className={inputClass}
              value={draft.personal.summary}
              onChange={(e) => updatePersonal("summary", e.target.value)}
              placeholder="Short intro about you..."
            />
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Experience" onAdd={addExperience} addLabel="Add job">
        <div className="space-y-4">
          {draft.experience.map((exp, expIndex) => (
            <div
              key={exp.id}
              className="p-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Job {expIndex + 1}</span>
                {draft.experience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="text-red-400 hover:text-red-500"
                    aria-label="Remove job"
                  >
                    <HiTrash />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    className={inputClass}
                    value={exp.role}
                    onChange={(e) =>
                      updateExperience(exp.id, "role", e.target.value)
                    }
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    className={inputClass}
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, "company", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Start</label>
                  <input
                    className={inputClass}
                    value={exp.start}
                    onChange={(e) =>
                      updateExperience(exp.id, "start", e.target.value)
                    }
                    placeholder="Jan 2022"
                  />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input
                    className={inputClass}
                    value={exp.end}
                    onChange={(e) =>
                      updateExperience(exp.id, "end", e.target.value)
                    }
                    placeholder="Present"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <label className={labelClass}>Points</label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <input
                      className={inputClass}
                      value={bullet}
                      onChange={(e) =>
                        updateBullet(exp.id, bulletIndex, e.target.value)
                      }
                      placeholder="What you did..."
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBullet(exp.id, bulletIndex)}
                        className="text-gray-400 hover:text-red-400 shrink-0"
                      >
                        <HiTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(exp.id)}
                  className="text-xs text-blue-400"
                >
                  + add point
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Projects" onAdd={addProject} addLabel="Add project">
        <div className="space-y-4">
          {(draft.projects || []).map((proj, projIndex) => (
            <div
              key={proj.id}
              className="p-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">
                  Project {projIndex + 1}
                </span>
                {(draft.projects || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="text-red-400 hover:text-red-500"
                    aria-label="Remove project"
                  >
                    <HiTrash />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Project name</label>
                  <input
                    className={inputClass}
                    value={proj.name}
                    onChange={(e) =>
                      updateProject(proj.id, "name", e.target.value)
                    }
                    placeholder="E-commerce App"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Link (optional)</label>
                  <input
                    className={inputClass}
                    value={proj.link}
                    onChange={(e) =>
                      updateProject(proj.id, "link", e.target.value)
                    }
                    placeholder="github.com/you/project"
                  />
                </div>
                <div>
                  <label className={labelClass}>Start</label>
                  <input
                    className={inputClass}
                    value={proj.start}
                    onChange={(e) =>
                      updateProject(proj.id, "start", e.target.value)
                    }
                    placeholder="Jan 2023"
                  />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input
                    className={inputClass}
                    value={proj.end}
                    onChange={(e) =>
                      updateProject(proj.id, "end", e.target.value)
                    }
                    placeholder="Mar 2023"
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <label className={labelClass}>Points</label>
                {proj.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <input
                      className={inputClass}
                      value={bullet}
                      onChange={(e) =>
                        updateProjectBullet(proj.id, bulletIndex, e.target.value)
                      }
                      placeholder="What you built..."
                    />
                    {proj.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProjectBullet(proj.id, bulletIndex)}
                        className="text-gray-400 hover:text-red-400 shrink-0"
                      >
                        <HiTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addProjectBullet(proj.id)}
                  className="text-xs text-blue-400"
                >
                  + add point
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Education"
        onAdd={addEducation}
        addLabel="Add school"
      >
        <div className="space-y-4">
          {draft.education.map((edu, eduIndex) => (
            <div
              key={edu.id}
              className="p-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">
                  School {eduIndex + 1}
                </span>
                {draft.education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <HiTrash />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>School</label>
                  <input
                    className={inputClass}
                    value={edu.school}
                    onChange={(e) =>
                      updateEducation(edu.id, "school", e.target.value)
                    }
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input
                      className={inputClass}
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      className={inputClass}
                      value={edu.year}
                      onChange={(e) =>
                        updateEducation(edu.id, "year", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Skills">
        <label className={labelClass}>
          Type skills separated by commas
        </label>
        <textarea
          rows={3}
          className={inputClass}
          value={skillsInputValue}
          onChange={(e) => updateSkills(e.target.value)}
          placeholder="React, Node.js, MongoDB, Python, AWS..."
        />
        {draft.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {draft.skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="bg-blue-500 text-white text-xs py-1 px-3 rounded-full dark:bg-blue-400"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </SectionBlock>
    </div>
  );
};
