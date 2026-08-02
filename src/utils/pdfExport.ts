import { jsPDF } from 'jspdf';
import { PhishingResult, AnalysisHistory } from '@/types/phishing';

export const exportToPDF = (result: PhishingResult, emailText: string) => {
  console.log('exportToPDF called', result);
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('EchoMe Report', 20, 20);

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, 20, 30);

  // Score
  doc.setFontSize(16);
  doc.text(`Threat Score: ${result.score}/100`, 20, 45);

  const status = result.score < 30 ? 'SAFE' : result.score < 70 ? 'SUSPICIOUS' : 'PHISHING';
  doc.text(`Status: ${status}`, 20, 55);

  // Metrics
  doc.setFontSize(12);
  doc.text('Detection Metrics:', 20, 70);
  doc.setFontSize(10);
  doc.text(`• Keyword Matches: ${result.details.keywordMatches}`, 25, 80);
  doc.text(`• URL Issues: ${result.details.urlIssues}`, 25, 87);
  doc.text(`• Sensitive Requests: ${result.details.sensitiveRequests}`, 25, 94);
  doc.text(`• Brand Impersonation: ${result.details.brandImpersonation ? 'Yes' : 'No'}`, 25, 101);
  doc.text(`• Confidence: ${result.confidence}%`, 25, 108);

  // Reasons
  doc.setFontSize(12);
  doc.text('Detection Reasons:', 20, 125);
  doc.setFontSize(9);

  let yPos = 135;
  result.reasons.forEach((reason, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${reason}`, 170);
    doc.text(lines, 25, yPos);
    yPos += lines.length * 5 + 3;
  });

  // Email Preview
  if (yPos < 250) {
    doc.setFontSize(12);
    doc.text('Email Content Preview:', 20, yPos + 10);
    doc.setFontSize(8);
    const preview = emailText.substring(0, 300) + (emailText.length > 300 ? '...' : '');
    const previewLines = doc.splitTextToSize(preview, 170);
    doc.text(previewLines, 25, yPos + 20);
  }

  // Save
  doc.save(`echome-${Date.now()}.pdf`);
};

export const exportHistoryToPDF = (history: AnalysisHistory[]) => {
  if (history.length === 0) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text('EchoMe History Report', 20, 20);

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
  doc.text(`Total Analyses: ${history.length}`, 20, 37);

  let yPos = 50;

  history.forEach((item, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Analysis number
    doc.setFontSize(14);
    doc.text(`Analysis #${index + 1}`, 20, yPos);
    yPos += 10;

    // Date and score
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(item.timestamp).toLocaleString()}`, 25, yPos);
    yPos += 7;
    doc.text(`Score: ${item.result.score}/100`, 25, yPos);
    yPos += 7;

    const status = item.result.score < 30 ? 'SAFE' : item.result.score < 70 ? 'SUSPICIOUS' : 'PHISHING';
    doc.text(`Status: ${status}`, 25, yPos);
    yPos += 7;
    doc.text(`Confidence: ${item.result.confidence}%`, 25, yPos);
    yPos += 10;

    // Reasons
    doc.setFontSize(9);
    doc.text('Reasons:', 25, yPos);
    yPos += 7;

    item.result.reasons.slice(0, 3).forEach((reason, rIndex) => {
      const lines = doc.splitTextToSize(`• ${reason}`, 160);
      doc.text(lines, 30, yPos);
      yPos += lines.length * 5 + 2;
    });

    yPos += 10;
  });

  // Save
  doc.save(`echome-history-${new Date().toISOString().split('T')[0]}.pdf`);
};
