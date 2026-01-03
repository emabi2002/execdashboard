// ============================================================
// EXPORT SERVICE
// PDF and Excel report generation for EDMS
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DivisionStats, ExecAlert, SLAMetrics } from './ilms-types';

// Division names for display
const DIVISION_NAMES: Record<string, string> = {
  survey: 'Surveyor General',
  planning: 'Physical Planning',
  ilg: 'Integrated Land Groups',
  state: 'State/Alienated Land',
  titles: 'Registrar of Titles',
  customer: 'Customer Services',
  legal: 'Legal/Case Management',
  audit: 'Audit & Compliance',
  corporate: 'Corporate Services',
  ict: 'ICT/Systems Admin',
};

// ============================================================
// PDF EXPORT
// ============================================================

export function exportExecutiveSummaryPDF(
  divisionStats: DivisionStats[],
  slaMetrics: SLAMetrics[],
  alerts: ExecAlert[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header
  doc.setFillColor(24, 24, 27); // zinc-950
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Command Center Report', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Integrated Land Management System - Papua New Guinea', 14, 28);
  doc.text(`Generated: ${now.toLocaleString()}`, 14, 35);

  // Reset text color for body
  doc.setTextColor(0, 0, 0);

  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, 52);

  const totalSubmissions = divisionStats.reduce((sum, d) => sum + d.total_submissions, 0);
  const totalPending = divisionStats.reduce((sum, d) => sum + d.submissions_pending, 0);
  const totalOverdue = divisionStats.reduce((sum, d) => sum + d.submissions_overdue, 0);
  const totalCompleted = divisionStats.reduce((sum, d) => sum + d.submissions_processed, 0);
  const slaCompliance = totalSubmissions > 0
    ? Math.round(((totalSubmissions - totalOverdue) / totalSubmissions) * 100)
    : 100;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Submissions: ${totalSubmissions}`, 14, 62);
  doc.text(`Pending: ${totalPending}`, 14, 68);
  doc.text(`Completed: ${totalCompleted}`, 80, 62);
  doc.text(`Overdue: ${totalOverdue}`, 80, 68);
  doc.text(`SLA Compliance: ${slaCompliance}%`, 140, 62);
  doc.text(`Active Alerts: ${alerts.length}`, 140, 68);

  // Division Performance Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Division Performance', 14, 82);

  const divisionTableData = divisionStats.map(stat => [
    DIVISION_NAMES[stat.division_code] || stat.division_code,
    stat.total_submissions.toString(),
    stat.submissions_processed.toString(),
    stat.submissions_pending.toString(),
    stat.submissions_overdue.toString(),
    `${stat.approval_rate}%`,
  ]);

  autoTable(doc, {
    startY: 88,
    head: [['Division', 'Total', 'Completed', 'Pending', 'Overdue', 'Efficiency']],
    body: divisionTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 158, 11], // amber-500
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  // SLA Compliance Table
  const slaStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SLA Compliance by Division', 14, slaStartY);

  const slaTableData = slaMetrics.map(metric => [
    metric.division,
    metric.total_submissions.toString(),
    metric.within_sla.toString(),
    metric.breached_sla.toString(),
    `${metric.sla_compliance_rate}%`,
    `${metric.avg_processing_days} days`,
  ]);

  autoTable(doc, {
    startY: slaStartY + 6,
    head: [['Division', 'Total', 'Within SLA', 'Breached', 'Compliance', 'Avg. Processing']],
    body: slaTableData,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233], // sky-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
  });

  // Active Alerts
  if (alerts.length > 0) {
    const alertsStartY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Active Alerts', 14, alertsStartY);

    const alertsTableData = alerts.slice(0, 10).map(alert => [
      alert.severity.toUpperCase(),
      alert.title,
      alert.source_division,
      alert.alert_type.replace('_', ' '),
      new Date(alert.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: alertsStartY + 6,
      head: [['Severity', 'Title', 'Division', 'Type', 'Date']],
      body: alertsTableData,
      theme: 'striped',
      headStyles: {
        fillColor: [239, 68, 68], // red-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Department of Lands & Physical Planning - Papua New Guinea`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`EDMS_Executive_Report_${now.toISOString().split('T')[0]}.pdf`);
}

// ============================================================
// CSV EXPORT (Excel compatible)
// ============================================================

export function exportDivisionStatsCSV(divisionStats: DivisionStats[]): void {
  const headers = [
    'Division',
    'Total Submissions',
    'Processed',
    'Pending',
    'Overdue',
    'Rejected',
    'Escalated',
    'Approval Rate (%)',
    'Avg Response Time (hours)',
  ];

  const rows = divisionStats.map(stat => [
    DIVISION_NAMES[stat.division_code] || stat.division_code,
    stat.total_submissions,
    stat.submissions_processed,
    stat.submissions_pending,
    stat.submissions_overdue,
    0, // rejected - would come from actual data
    stat.escalated_count,
    stat.approval_rate,
    stat.avg_response_time_hours,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  downloadCSV(csvContent, `EDMS_Division_Stats_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportSLAMetricsCSV(slaMetrics: SLAMetrics[]): void {
  const headers = [
    'Division',
    'Total Submissions',
    'Within SLA',
    'Breached SLA',
    'Compliance Rate (%)',
    'Avg Processing Days',
  ];

  const rows = slaMetrics.map(metric => [
    metric.division,
    metric.total_submissions,
    metric.within_sla,
    metric.breached_sla,
    metric.sla_compliance_rate,
    metric.avg_processing_days,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  downloadCSV(csvContent, `EDMS_SLA_Metrics_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportAlertsCSV(alerts: ExecAlert[]): void {
  const headers = [
    'ID',
    'Title',
    'Message',
    'Severity',
    'Source Division',
    'Alert Type',
    'Acknowledged',
    'Created At',
  ];

  const rows = alerts.map(alert => [
    alert.id,
    `"${alert.title.replace(/"/g, '""')}"`,
    `"${alert.message.replace(/"/g, '""')}"`,
    alert.severity,
    alert.source_division,
    alert.alert_type,
    alert.acknowledged ? 'Yes' : 'No',
    new Date(alert.created_at).toISOString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  downloadCSV(csvContent, `EDMS_Alerts_${new Date().toISOString().split('T')[0]}.csv`);
}

// Helper function to download CSV
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================
// EXPORT BUTTON COMPONENT HELPER
// ============================================================

export type ExportFormat = 'pdf' | 'csv';
export type ExportType = 'executive-summary' | 'division-stats' | 'sla-metrics' | 'alerts';

export async function exportReport(
  format: ExportFormat,
  type: ExportType,
  data: {
    divisionStats?: DivisionStats[];
    slaMetrics?: SLAMetrics[];
    alerts?: ExecAlert[];
  }
): Promise<void> {
  const { divisionStats = [], slaMetrics = [], alerts = [] } = data;

  if (format === 'pdf') {
    if (type === 'executive-summary') {
      exportExecutiveSummaryPDF(divisionStats, slaMetrics, alerts);
    }
  } else if (format === 'csv') {
    switch (type) {
      case 'division-stats':
        exportDivisionStatsCSV(divisionStats);
        break;
      case 'sla-metrics':
        exportSLAMetricsCSV(slaMetrics);
        break;
      case 'alerts':
        exportAlertsCSV(alerts);
        break;
      case 'executive-summary':
        exportDivisionStatsCSV(divisionStats);
        break;
    }
  }
}
