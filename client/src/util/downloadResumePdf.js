export const downloadResumePdf = async (element, filename = "resume.pdf") => {
  if (!element) {
    throw new Error("Preview element not found");
  }

  const html2pdf = (await import("html2pdf.js")).default;

  const safeName = filename.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  const finalName = safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;

  await html2pdf()
    .set({
      margin: [8, 8, 8, 8],
      filename: finalName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    })
    .from(element)
    .save();
};
