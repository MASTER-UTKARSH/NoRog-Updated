import PDFDocument from "pdfkit";

/**
 * Generate a health report PDF and return it as a buffer.
 */
export const generateHealthPDF = async ({ user, profile, symptomLogs, prediction, medicineLogs }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const blue = "#2563EB";
      const dark = "#1E293B";
      const gray = "#64748B";

      // ─── Page 1: Patient Summary ───
      doc.fontSize(28).fillColor(blue).text("NoRog Health Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor(gray).text(`Generated on: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, { align: "center" });
      doc.moveDown(2);

      doc.fontSize(16).fillColor(dark).text("Patient Summary");
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor(gray);
      doc.text(`Name: ${user.name || "N/A"}`);
      doc.text(`Age: ${user.age || "N/A"} | Gender: ${user.gender || "N/A"}`);
      doc.text(`Location: ${user.location?.city || "N/A"}, ${user.location?.country || "N/A"}`);
      doc.moveDown(1);

      if (prediction) {
        doc.fontSize(14).fillColor(dark).text("Health Overview");
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor(gray);
        doc.text(`Overall Health Score: ${prediction.healthScore}/100`);
        doc.text(`Health Trend: ${prediction.trend}`);
        doc.text(`AI Summary: ${prediction.summary || "No summary available"}`);
      }

      // ─── Page 2: Medical History & Lifestyle ───
      doc.addPage();
      doc.fontSize(16).fillColor(dark).text("Medical History & Lifestyle");
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor(gray);

      if (profile) {
        doc.text(`Known Conditions: ${profile.medicalHistory?.join(", ") || "None reported"}`);
        doc.moveDown(0.5);

        if (profile.familyHistory?.length > 0) {
          doc.text("Family History (Genetic Risks):");
          profile.familyHistory.forEach((fh) => {
            doc.text(`  • ${fh.relation}: ${fh.condition}`);
          });
        } else {
          doc.text("Family History: None reported");
        }
        doc.moveDown(0.5);

        const ls = profile.lifestyle || {};
        doc.text("Lifestyle:");
        doc.text(`  • Smoker: ${ls.smoker ? "Yes" : "No"}`);
        doc.text(`  • Alcohol: ${ls.alcohol || "N/A"}`);
        doc.text(`  • Exercise: ${ls.exerciseFrequency || "N/A"}`);
        doc.text(`  • Sleep: ${ls.sleepHours || "N/A"} hrs/night`);
        doc.text(`  • Diet: ${ls.diet || "N/A"}`);
        doc.moveDown(0.5);

        if (profile.medicines?.length > 0) {
          doc.text("Current Medicines:");
          profile.medicines.forEach((m) => {
            doc.text(`  • ${m.name} — ${m.dosage}, ${m.frequency}`);
          });
        }
      }

      // ─── Page 3: Symptom History ───
      doc.addPage();
      doc.fontSize(16).fillColor(dark).text("Symptom History (Recent)");
      doc.moveDown(0.5);

      if (symptomLogs?.length > 0) {
        // Table header
        doc.fontSize(10).fillColor(blue);
        doc.text("Date                  Symptoms                          Severity   Notes", { underline: true });
        doc.moveDown(0.3);
        doc.fillColor(gray);

        symptomLogs.slice(0, 30).forEach((log) => {
          const date = new Date(log.date).toLocaleDateString();
          const symptoms = (log.symptoms || []).join(", ").substring(0, 35);
          const sev = `${log.severity}/10`;
          const notes = (log.notes || "—").substring(0, 25);
          doc.text(`${date.padEnd(22)}${symptoms.padEnd(34)}${sev.padEnd(11)}${notes}`);
        });
      } else {
        doc.fontSize(11).fillColor(gray).text("No symptom logs recorded yet.");
      }

      // ─── Page 4: AI Risk Assessment ───
      doc.addPage();
      doc.fontSize(16).fillColor(dark).text("AI Risk Assessment");
      doc.moveDown(0.5);

      if (prediction?.risks?.length > 0) {
        prediction.risks.forEach((risk) => {
          const color = risk.confidence > 60 ? "#EF4444" : risk.confidence > 30 ? "#F59E0B" : "#10B981";
          doc.fontSize(12).fillColor(color).text(`${risk.disease} — ${risk.confidence}% confidence`);
          doc.fontSize(10).fillColor(gray);
          doc.text(`  Urgency: ${risk.urgency}`);
          doc.text(`  Contributing: ${risk.contributingSymptoms?.join(", ") || "N/A"}`);
          if (risk.geneticFactor) doc.text(`  🧬 Genetic risk factor identified`);
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(11).fillColor(gray).text("No AI predictions available. Run an analysis first.");
      }

      // ─── Page 5: Medicine Interactions ───
      if (medicineLogs?.length > 0) {
        doc.addPage();
        doc.fontSize(16).fillColor(dark).text("Medicine Interactions");
        doc.moveDown(0.5);

        const latestMed = medicineLogs[0];
        if (latestMed.interactions?.length > 0) {
          latestMed.interactions.forEach((inter) => {
            const sColor = inter.severity === "severe" ? "#EF4444" : inter.severity === "moderate" ? "#F59E0B" : "#10B981";
            doc.fontSize(11).fillColor(sColor).text(`${inter.drug1} + ${inter.drug2} [${inter.severity}]`);
            doc.fontSize(10).fillColor(gray).text(`  ${inter.description}`);
            doc.moveDown(0.3);
          });
        } else {
          doc.fontSize(11).fillColor(gray).text("No interactions detected.");
        }
      }

      // ─── Footer on every page ───
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(gray);
        doc.text(
          "⚠️ This report is AI-generated for informational purposes only. It is not a medical diagnosis. Please consult a licensed physician.",
          50,
          doc.page.height - 40,
          { align: "center", width: doc.page.width - 100 }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
