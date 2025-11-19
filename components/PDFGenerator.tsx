import { jsPDF } from "jspdf";
import { GeneratedImage } from "../types";

export const generatePDF = (
  images: GeneratedImage[],
  theme: string,
  childName: string
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Filter images
  const coverImage = images.find((img) => img.type === 'cover');
  const pages = images.filter((img) => img.type === 'page');

  // --- Cover Page ---
  if (coverImage) {
    // Add Cover Image
    doc.addImage(coverImage.url, "JPEG", 0, 0, pageWidth, pageHeight, undefined, 'FAST');

    // Add Title Box (Semi-transparent white background for readability)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 40, pageWidth - 40, 60, 5, 5, "F");

    // Add Text
    doc.setTextColor(45, 52, 54); // Dark Gray
    doc.setFont("helvetica", "bold");
    
    // Child's Name
    doc.setFontSize(36);
    doc.text(childName + "'s", pageWidth / 2, 60, { align: "center" });
    
    // "Coloring Book"
    doc.setFontSize(24);
    doc.setFont("helvetica", "normal");
    doc.text("Coloring Book", pageWidth / 2, 75, { align: "center" });
    
    // Theme subtitle
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text(theme.toUpperCase(), pageWidth / 2, 90, { align: "center" });
    
    // Footer Credit
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Created with DreamColor AI", pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  // --- Content Pages ---
  pages.forEach((page, index) => {
    doc.addPage();
    
    // Add a border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Add Image centered
    // Maintain aspect ratio, fit within margins
    const margin = 20;
    const maxImgWidth = pageWidth - (margin * 2);
    const maxImgHeight = pageHeight - (margin * 2) - 20; // space for caption
    
    doc.addImage(page.url, "JPEG", margin, margin, maxImgWidth, maxImgHeight, undefined, 'FAST');

    // Optional caption or page number
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${index + 1}`, pageWidth / 2, pageHeight - 15, { align: "center" });
  });

  doc.save(`${childName.replace(/\s+/g, '_')}_Coloring_Book.pdf`);
};