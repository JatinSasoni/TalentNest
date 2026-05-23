/** A4 width at 96dpi — keeps html2canvas layout aligned with 210mm export */
const A4_WIDTH_PX = 794;
/** Approx. printable height inside A4 (px at 96dpi, after typical padding) */
const A4_CONTENT_HEIGHT_PX = 1000;
const FILL_TARGET_RATIO = 0.9;
const FILL_TRIGGER_RATIO = 0.78;
const MAX_FILL_SCALE = 1.32;

const waitForLayout = () =>
  new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

/** Scale up short resumes so one page is used better (capped to avoid a 2nd page). */
const computeFillScale = (element) => {
  const contentHeight = element.getBoundingClientRect().height;
  if (contentHeight >= A4_CONTENT_HEIGHT_PX * FILL_TRIGGER_RATIO) {
    return 1;
  }
  const targetHeight = A4_CONTENT_HEIGHT_PX * FILL_TARGET_RATIO;
  return Math.min(Math.max(targetHeight / contentHeight, 1), MAX_FILL_SCALE);
};

export const downloadResumePdf = async (element, filename = "resume.pdf") => {
  if (!element) {
    throw new Error("Preview element not found");
  }

  const html2pdf = (await import("html2pdf.js")).default;

  const safeName = filename.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  const finalName = safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;

  const previousHeight = element.style.height;
  const previousMinHeight = element.style.minHeight;
  const previousFill = element.style.getPropertyValue("--resume-fill");

  element.style.height = "auto";
  element.style.minHeight = "0";

  try {
    let fillScale = computeFillScale(element);
    element.style.setProperty("--resume-fill", String(fillScale));
    await waitForLayout();

    const refined = computeFillScale(element);
    if (Math.abs(refined - fillScale) > 0.02) {
      fillScale = refined;
      element.style.setProperty("--resume-fill", String(fillScale));
      await waitForLayout();
    }

    await html2pdf()
      .set({
        margin: 0,
        filename: finalName,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: A4_WIDTH_PX,
          windowWidth: A4_WIDTH_PX,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(element)
      .save();
  } finally {
    element.style.height = previousHeight;
    element.style.minHeight = previousMinHeight;
    if (previousFill) {
      element.style.setProperty("--resume-fill", previousFill);
    } else {
      element.style.removeProperty("--resume-fill");
    }
  }
};
