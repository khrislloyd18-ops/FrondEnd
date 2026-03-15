import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaChartBar,
  FaDownload,
  FaFileAlt,
  FaFilePdf,
  FaPrint,
  FaSpinner,
  FaSyncAlt,
  FaUsers,
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { dashboard, students, courses as coursesApi } from '../../services/api';

const extractCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const toSentenceCase = (value) => {
  if (!value) return 'N/A';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const getStudentName = (student) => {
  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
  return student.name || fullName || `Student #${student.id ?? 'N/A'}`;
};

const mapStudentRow = (student) => ({
  id: student.id ?? 'N/A',
  student_id: student.student_id || 'N/A',
  name: getStudentName(student),
  email: student.email || 'N/A',
  course_code: student.course?.course_code || student.course_code || 'N/A',
  course_name: student.course?.course_name || student.course || 'N/A',
  status: toSentenceCase(student.status || 'enrolled'),
  year_level: student.year_level || student.enrollment_year || 'N/A',
});

const mapCourseRow = (course) => ({
  id: course.id ?? 'N/A',
  course_code: course.course_code || 'N/A',
  course_name: course.course_name || 'N/A',
  department: course.department || 'N/A',
  degree_level: toSentenceCase(course.degree_level || 'N/A'),
  duration_years: course.duration_years ?? 'N/A',
  total_credits: course.total_credits ?? 'N/A',
  is_active: course.is_active === false ? 'Inactive' : 'Active',
});

const mapSchoolDayRow = (entry) => ({
  date: formatDate(entry.date),
  day_type: toSentenceCase(entry.day_type || 'regular'),
  description: entry.description || 'Attendance tracking day',
  attendance_percentage:
    typeof entry.attendance_percentage === 'number'
      ? `${Math.round(entry.attendance_percentage)}%`
      : 'N/A',
});

const escapeCsvValue = (value) => {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildCsv = (rows, columns) => {
  const headerLine = columns.map((col) => escapeCsvValue(col.label)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvValue(row[col.key])).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
};

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getFileStamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const REPORT_SECTION_CONFIG = {
  students: {
    label: 'Students',
    title: 'Student List',
    description: 'Student roster, course assignment, and enrollment status.',
    accent: '#2563eb',
    surface: 'rgba(37, 99, 235, 0.12)',
    pdfHeadColor: [37, 99, 235],
    columns: [
      { key: 'student_id', label: 'Student ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'course_code', label: 'Course' },
      { key: 'status', label: 'Status' },
      { key: 'year_level', label: 'Year Level' },
    ],
  },
  courses: {
    label: 'Courses',
    title: 'Course List',
    description: 'Courses, departments, degree levels, and active status.',
    accent: '#7c3aed',
    surface: 'rgba(124, 58, 237, 0.12)',
    pdfHeadColor: [124, 58, 237],
    columns: [
      { key: 'course_code', label: 'Code' },
      { key: 'course_name', label: 'Course Name' },
      { key: 'department', label: 'Department' },
      { key: 'degree_level', label: 'Level' },
      { key: 'duration_years', label: 'Duration' },
      { key: 'is_active', label: 'Status' },
    ],
  },
  schoolDays: {
    label: 'School Days',
    title: 'School Days',
    description: 'Calendar days, attendance types, and participation rates.',
    accent: '#db2777',
    surface: 'rgba(219, 39, 119, 0.12)',
    pdfHeadColor: [219, 39, 119],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'day_type', label: 'Day Type' },
      { key: 'description', label: 'Description' },
      { key: 'attendance_percentage', label: 'Attendance' },
    ],
  },
};

const buildSelectedReportSections = (selectedSections, { studentRows, courseRows, schoolDayRows }) => {
  const rowsByKey = {
    students: studentRows,
    courses: courseRows,
    schoolDays: schoolDayRows,
  };

  return Object.entries(selectedSections)
    .filter(([, isSelected]) => isSelected)
    .map(([key]) => ({
      key,
      ...REPORT_SECTION_CONFIG[key],
      rows: rowsByKey[key] || [],
    }));
};

const buildWatermarkDataUrl = (src, opacity = 0.08) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas context unavailable.'));
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = opacity;
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => reject(new Error(`Failed to load watermark image from ${src}.`));
    image.src = src;
  });

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ReportsPage = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState({
    students: 0,
    courses: 0,
    schoolDays: 0,
    syncedAt: null,
  });
  const [dataPreview, setDataPreview] = useState({ students: [], courses: [], schoolDays: [] });
  const [activeTab, setActiveTab] = useState('students');
  const [selectedSections, setSelectedSections] = useState({
    students: true,
    courses: true,
    schoolDays: true,
  });
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    pdf: false,
    print: false,
    studentsCsv: false,
    coursesCsv: false,
    schoolDaysCsv: false,
    allJson: false,
  });

  const setActionState = (key, value) => {
    setActionLoading((prev) => ({ ...prev, [key]: value }));
  };

  const fetchSchoolDaysData = useCallback(async () => {
    try {
      return await dashboard.getAttendancePatterns();
    } catch (attendanceError) {
      return dashboard.getSchoolDays();
    }
  }, []);

  const fetchReportData = useCallback(async () => {
    const [studentsResult, coursesResult, schoolDaysResult] = await Promise.allSettled([
      students.getAll({ per_page: 1000 }),
      coursesApi.getAll(),
      fetchSchoolDaysData(),
    ]);

    const failedSources = [];

    const studentsData =
      studentsResult.status === 'fulfilled'
        ? extractCollection(studentsResult.value.data)
        : (failedSources.push('Students'), []);

    const coursesData =
      coursesResult.status === 'fulfilled'
        ? extractCollection(coursesResult.value.data)
        : (failedSources.push('Courses'), []);

    const schoolDaysData =
      schoolDaysResult.status === 'fulfilled'
        ? extractCollection(schoolDaysResult.value.data)
        : (failedSources.push('School Days'), []);

    return { studentsData, coursesData, schoolDaysData, failedSources };
  }, [fetchSchoolDaysData]);

  const refreshPreviewCounts = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const { studentsData, coursesData, schoolDaysData } = await fetchReportData();
      setDataPreview({
        students: studentsData.map(mapStudentRow),
        courses: coursesData.map(mapCourseRow),
        schoolDays: schoolDaysData.map(mapSchoolDayRow),
      });
      setPreview({
        students: studentsData.length,
        courses: coursesData.length,
        schoolDays: schoolDaysData.length,
        syncedAt: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Failed to load reports preview data:', error);
      toast.error('Unable to sync report datasets right now.');
    } finally {
      setLoadingPreview(false);
    }
  }, [fetchReportData]);

  useEffect(() => {
    refreshPreviewCounts();
  }, [refreshPreviewCounts]);

  const handleOpenAnalytics = () => {
    navigate('/dashboard');
  };

  const toggleSection = (key) => {
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    if (selectedSections[key] && selectedCount === 1) {
      toast.error('Select at least one report section.');
      return;
    }

    setSelectedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePdf = async () => {
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    if (!selectedCount) {
      toast.error('Select at least one report section.');
      return;
    }

    setActionState('pdf', true);
    try {
      const { studentsData, coursesData, schoolDaysData, failedSources } = await fetchReportData();
      const selectedReportSections = buildSelectedReportSections(selectedSections, {
        studentRows: studentsData.map(mapStudentRow),
        courseRows: coursesData.map(mapCourseRow),
        schoolDayRows: schoolDaysData.map(mapSchoolDayRow),
      });

      if (!selectedReportSections.some((section) => section.rows.length)) {
        toast.error('No data available for the selected report sections.');
        return;
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const generatedAt = new Date().toLocaleString();

      let watermarkDataUrl = null;
      try {
        watermarkDataUrl = await buildWatermarkDataUrl('/umtc.png');
      } catch (watermarkError) {
        console.warn('Unable to load UMTC watermark for PDF:', watermarkError);
      }

      const addWatermarkToPage = () => {
        if (!watermarkDataUrl) return;

        const watermarkSize = Math.min(pageWidth, pageHeight) * 0.56;
        const watermarkX = (pageWidth - watermarkSize) / 2;
        const watermarkY = (pageHeight - watermarkSize) / 2;
        doc.addImage(watermarkDataUrl, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize, undefined, 'FAST');
      };

      addWatermarkToPage();

      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, pageWidth, 72, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('UMTC Reports & Analytics', 40, 42);
      doc.setFontSize(11);
      doc.text('Institutional Summary Report', 40, 60);

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.text(`Generated: ${generatedAt}`, 40, 92);
      doc.text(
        `Selected Sections: ${selectedReportSections.map((section) => section.label).join(', ')}`,
        40,
        108
      );
      let summaryStartY = 124;

      const selectedFailedSources = selectedReportSections
        .map((section) => section.label)
        .filter((label) => failedSources.includes(label));

      if (selectedFailedSources.length) {
        doc.setTextColor(180, 83, 9);
        doc.text(`Partial data loaded: ${selectedFailedSources.join(', ')}`, 40, 124);
        summaryStartY = 140;
      }

      autoTable(doc, {
        startY: summaryStartY,
        head: [['Dataset', 'Records']],
        body: selectedReportSections.map((section) => [section.label, section.rows.length]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
      });

      const addTableSection = (section) => {
        if (!section.rows.length) return;

        doc.addPage();
        addWatermarkToPage();
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(15);
        doc.text(section.title, 40, 42);
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Showing ${Math.min(section.rows.length, 250)} of ${section.rows.length} rows`,
          40,
          60
        );

        autoTable(doc, {
          startY: 74,
          head: [section.columns.map((column) => column.label)],
          body: section.rows
            .slice(0, 250)
            .map((row) => section.columns.map((column) => row[column.key])),
          styles: { fontSize: 8, cellPadding: 4 },
          headStyles: { fillColor: section.pdfHeadColor },
          theme: 'striped',
        });
      };

      selectedReportSections.forEach(addTableSection);

      doc.save(`umtc-report-${getFileStamp()}.pdf`);
      toast.success('PDF report generated successfully.');
      setPreview((prev) => ({ ...prev, syncedAt: new Date().toLocaleString() }));
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      toast.error('Failed to generate PDF report.');
    } finally {
      setActionState('pdf', false);
    }
  };

  const handleOpenPrintView = async () => {
    const selectedCount = Object.values(selectedSections).filter(Boolean).length;
    if (!selectedCount) {
      toast.error('Select at least one report section.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      toast.error('Unable to open print view. Please allow pop-ups for this site.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preparing UMTC report...</title>
        </head>
        <body style="font-family: Segoe UI, sans-serif; padding: 24px; color: #374151;">
          Preparing print view...
        </body>
      </html>
    `);
    printWindow.document.close();

    setActionState('print', true);
    try {
      const { studentsData, coursesData, schoolDaysData, failedSources } = await fetchReportData();
      const selectedReportSections = buildSelectedReportSections(selectedSections, {
        studentRows: studentsData.map(mapStudentRow),
        courseRows: coursesData.map(mapCourseRow),
        schoolDayRows: schoolDaysData.map(mapSchoolDayRow),
      });

      if (!selectedReportSections.some((section) => section.rows.length)) {
        printWindow.close();
        toast.error('No data available for the selected report sections.');
        return;
      }

      const selectedFailedSources = selectedReportSections
        .map((section) => section.label)
        .filter((label) => failedSources.includes(label));
      const generatedAt = new Date().toLocaleString();
      const logoUrl = `${window.location.origin}/umtc.png`;

      const summaryCardsHtml = selectedReportSections
        .map(
          (section) => `
            <div class="summary-card" style="border-color: ${section.accent}; background: ${section.surface};">
              <span class="summary-label">${escapeHtml(section.label)}</span>
              <strong>${section.rows.length}</strong>
            </div>
          `
        )
        .join('');

      const sectionTablesHtml = selectedReportSections
        .map((section) => {
          const headerCells = section.columns
            .map((column) => `<th>${escapeHtml(column.label)}</th>`)
            .join('');

          const bodyRows = section.rows
            .slice(0, 250)
            .map(
              (row) => `
                <tr>
                  ${section.columns
                    .map((column) => `<td>${escapeHtml(row[column.key])}</td>`)
                    .join('')}
                </tr>
              `
            )
            .join('');

          return `
            <section class="report-section">
              <div class="section-header">
                <div>
                  <h2>${escapeHtml(section.title)}</h2>
                  <p>Showing ${Math.min(section.rows.length, 250)} of ${section.rows.length} rows</p>
                </div>
                <span class="section-badge" style="background: ${section.surface}; color: ${section.accent}; border-color: ${section.accent};">
                  ${escapeHtml(section.label)}
                </span>
              </div>
              <table>
                <thead style="background: ${section.surface}; color: ${section.accent};">
                  <tr>${headerCells}</tr>
                </thead>
                <tbody>
                  ${bodyRows}
                </tbody>
              </table>
            </section>
          `;
        })
        .join('');

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>UMTC Print Report</title>
            <style>
              :root {
                color-scheme: light;
              }

              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                background: #e5e7eb;
                color: #1f2937;
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
              }

              .toolbar {
                position: sticky;
                top: 0;
                z-index: 5;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 16px 24px;
                background: #111827;
                color: #f9fafb;
              }

              .toolbar-title {
                font-size: 14px;
                letter-spacing: 0.04em;
                text-transform: uppercase;
              }

              .toolbar button {
                border: none;
                border-radius: 999px;
                padding: 10px 18px;
                font-weight: 600;
                cursor: pointer;
              }

              .toolbar button.primary {
                background: #2563eb;
                color: #ffffff;
              }

              .toolbar button.secondary {
                background: #ffffff;
                color: #111827;
              }

              .page {
                width: 210mm;
                min-height: 297mm;
                margin: 24px auto;
                padding: 32px;
                position: relative;
                background: #ffffff;
                box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
                overflow: hidden;
              }

              .watermark {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                opacity: 0.08;
                z-index: 0;
              }

              .watermark img {
                width: min(55vw, 460px);
                height: auto;
              }

              .content {
                position: relative;
                z-index: 1;
              }

              .header {
                display: flex;
                justify-content: space-between;
                gap: 24px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
              }

              .brand {
                display: flex;
                gap: 16px;
                align-items: center;
              }

              .brand img {
                width: 72px;
                height: 72px;
                object-fit: contain;
              }

              .brand h1 {
                margin: 0;
                font-size: 28px;
                color: #111827;
              }

              .brand p,
              .meta p,
              .section-header p,
              .notice {
                margin: 6px 0 0;
                color: #6b7280;
                font-size: 14px;
              }

              .meta {
                min-width: 240px;
                text-align: right;
              }

              .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
                margin: 24px 0;
              }

              .summary-card {
                border: 1px solid;
                border-radius: 18px;
                padding: 16px;
              }

              .summary-card strong {
                display: block;
                margin-top: 6px;
                font-size: 28px;
                color: #111827;
              }

              .summary-label {
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              }

              .notice {
                padding: 14px 16px;
                border-radius: 14px;
                border: 1px solid #f59e0b;
                background: #fef3c7;
                color: #92400e;
              }

              .report-section {
                margin-top: 24px;
                break-inside: avoid;
              }

              .section-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 12px;
              }

              .section-header h2 {
                margin: 0;
                font-size: 20px;
                color: #111827;
              }

              .section-badge {
                border: 1px solid;
                border-radius: 999px;
                padding: 8px 12px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                overflow: hidden;
                border-radius: 16px;
              }

              th,
              td {
                padding: 10px 12px;
                text-align: left;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
                vertical-align: top;
              }

              tbody tr:nth-child(even) {
                background: #f9fafb;
              }

              .footer-note {
                margin-top: 28px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
              }

              @page {
                size: A4;
                margin: 14mm;
              }

              @media print {
                body {
                  background: #ffffff;
                }

                .toolbar {
                  display: none;
                }

                .page {
                  width: auto;
                  min-height: auto;
                  margin: 0;
                  padding: 0;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <div>
                <div class="toolbar-title">UMTC Reports and Analytics</div>
                <div>Select your printer or save as PDF from this print-ready view.</div>
              </div>
              <div>
                <button class="secondary" onclick="window.close()">Close</button>
                <button class="primary" onclick="window.print()">Print Report</button>
              </div>
            </div>

            <div class="watermark">
              <img src="${logoUrl}" alt="UMTC watermark" />
            </div>

            <main class="page">
              <div class="content">
                <section class="header">
                  <div class="brand">
                    <img src="${logoUrl}" alt="UMTC logo" />
                    <div>
                      <h1>UMTC Reports and Analytics</h1>
                      <p>Print-ready institutional summary for the selected report sections.</p>
                    </div>
                  </div>
                  <div class="meta">
                    <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
                    <p><strong>Sections:</strong> ${escapeHtml(
                      selectedReportSections.map((section) => section.label).join(', ')
                    )}</p>
                  </div>
                </section>

                <section class="summary-grid">
                  ${summaryCardsHtml}
                </section>

                ${
                  selectedFailedSources.length
                    ? `<div class="notice">Partial data loaded for: ${escapeHtml(
                        selectedFailedSources.join(', ')
                      )}</div>`
                    : ''
                }

                ${sectionTablesHtml}

                <p class="footer-note">
                  This print layout includes up to 250 rows per selected section for readability.
                </p>
              </div>
            </main>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      toast.success('Print view is ready.');
    } catch (error) {
      console.error('Failed to prepare print view:', error);
      printWindow.close();
      toast.error('Failed to prepare print view.');
    } finally {
      setActionState('print', false);
    }
  };

  const handleExportStudentsCsv = async () => {
    setActionState('studentsCsv', true);
    try {
      const { studentsData } = await fetchReportData();
      const studentRows = studentsData.map(mapStudentRow);

      if (!studentRows.length) {
        toast.error('No student data available to export.');
        return;
      }

      const csv = buildCsv(studentRows, [
        { key: 'id', label: 'ID' },
        { key: 'student_id', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'course_code', label: 'Course Code' },
        { key: 'course_name', label: 'Course Name' },
        { key: 'status', label: 'Status' },
        { key: 'year_level', label: 'Year Level' },
      ]);

      downloadFile(csv, `students-${getFileStamp()}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Student list exported.');
    } catch (error) {
      console.error('Failed to export students CSV:', error);
      toast.error('Failed to export student list.');
    } finally {
      setActionState('studentsCsv', false);
    }
  };

  const handleExportCoursesCsv = async () => {
    setActionState('coursesCsv', true);
    try {
      const { coursesData } = await fetchReportData();
      const courseRows = coursesData.map(mapCourseRow);

      if (!courseRows.length) {
        toast.error('No course data available to export.');
        return;
      }

      const csv = buildCsv(courseRows, [
        { key: 'id', label: 'ID' },
        { key: 'course_code', label: 'Course Code' },
        { key: 'course_name', label: 'Course Name' },
        { key: 'department', label: 'Department' },
        { key: 'degree_level', label: 'Degree Level' },
        { key: 'duration_years', label: 'Duration Years' },
        { key: 'total_credits', label: 'Total Credits' },
        { key: 'is_active', label: 'Status' },
      ]);

      downloadFile(csv, `courses-${getFileStamp()}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Courses exported.');
    } catch (error) {
      console.error('Failed to export courses CSV:', error);
      toast.error('Failed to export courses.');
    } finally {
      setActionState('coursesCsv', false);
    }
  };

  const handleExportSchoolDaysCsv = async () => {
    setActionState('schoolDaysCsv', true);
    try {
      const { schoolDaysData } = await fetchReportData();
      const schoolDayRows = schoolDaysData.map(mapSchoolDayRow);

      if (!schoolDayRows.length) {
        toast.error('No school days data available to export.');
        return;
      }

      const csv = buildCsv(schoolDayRows, [
        { key: 'date', label: 'Date' },
        { key: 'day_type', label: 'Day Type' },
        { key: 'description', label: 'Description' },
        { key: 'attendance_percentage', label: 'Attendance Percentage' },
      ]);

      downloadFile(csv, `school-days-${getFileStamp()}.csv`, 'text/csv;charset=utf-8;');
      toast.success('School days exported.');
    } catch (error) {
      console.error('Failed to export school days CSV:', error);
      toast.error('Failed to export school days.');
    } finally {
      setActionState('schoolDaysCsv', false);
    }
  };

  const handleExportAllJson = async () => {
    setActionState('allJson', true);
    try {
      const { studentsData, coursesData, schoolDaysData } = await fetchReportData();
      const payload = {
        generated_at: new Date().toISOString(),
        students: studentsData.map(mapStudentRow),
        courses: coursesData.map(mapCourseRow),
        school_days: schoolDaysData.map(mapSchoolDayRow),
      };

      downloadFile(
        JSON.stringify(payload, null, 2),
        `umtc-export-${getFileStamp()}.json`,
        'application/json;charset=utf-8;'
      );
      toast.success('Combined export saved.');
    } catch (error) {
      console.error('Failed to export all datasets:', error);
      toast.error('Failed to export all datasets.');
    } finally {
      setActionState('allJson', false);
    }
  };

  const previewItems = [
    {
      label: 'Students',
      count: preview.students,
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Courses',
      count: preview.courses,
      icon: FaBookOpen,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'School Days',
      count: preview.schoolDays,
      icon: FaCalendarAlt,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const reportSelectionItems = [
    {
      key: 'students',
      label: 'Students',
      description: REPORT_SECTION_CONFIG.students.description,
      icon: FaUsers,
      count: preview.students,
      activeClasses: 'border-blue-200 bg-blue-50',
      iconClasses: 'text-blue-600',
    },
    {
      key: 'courses',
      label: 'Courses',
      description: REPORT_SECTION_CONFIG.courses.description,
      icon: FaBookOpen,
      count: preview.courses,
      activeClasses: 'border-purple-200 bg-purple-50',
      iconClasses: 'text-purple-600',
    },
    {
      key: 'schoolDays',
      label: 'School Days',
      description: REPORT_SECTION_CONFIG.schoolDays.description,
      icon: FaCalendarAlt,
      count: preview.schoolDays,
      activeClasses: 'border-pink-200 bg-pink-50',
      iconClasses: 'text-pink-600',
    },
  ];

  const selectedSectionCount = Object.values(selectedSections).filter(Boolean).length;

  const isAnyActionLoading = Object.values(actionLoading).some(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Generate PDF reports and export institutional data from seeded backend records.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Dataset Overview</h2>
              <p className="text-sm text-gray-600">
                {preview.syncedAt ? `Last synced: ${preview.syncedAt}` : 'Syncing datasets...'}
              </p>
            </div>
            <button
              onClick={refreshPreviewCounts}
              disabled={loadingPreview || isAnyActionLoading}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loadingPreview ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaSyncAlt className="w-4 h-4" />
              )}
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {previewItems.map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${item.color} text-white flex items-center justify-center`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {loadingPreview ? '...' : item.count}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Data Tables */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Data Preview</h2>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            {[
              { key: 'students', label: `Students (${dataPreview.students.length})` },
              { key: 'courses', label: `Courses (${dataPreview.courses.length})` },
              { key: 'schoolDays', label: `School Days (${dataPreview.schoolDays.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white border border-b-white border-gray-200 -mb-px text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loadingPreview ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <FaSpinner className="w-5 h-5 animate-spin mr-2" /> Loading data...
            </div>
          ) : (
            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-gray-100">
              {activeTab === 'students' && (
                dataPreview.students.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No student records found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-blue-50 sticky top-0">
                      <tr>
                        {['Student ID', 'Name', 'Email', 'Course', 'Status', 'Year Level'].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-blue-700 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.students.map((s, i) => (
                        <tr key={s.id ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{s.student_id}</td>
                          <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                          <td className="px-4 py-2 text-gray-600">{s.email}</td>
                          <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{s.course_code}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.status === 'Enrolled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>{s.status}</span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{s.year_level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {activeTab === 'courses' && (
                dataPreview.courses.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No course records found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-purple-50 sticky top-0">
                      <tr>
                        {['Code', 'Course Name', 'Department', 'Level', 'Duration', 'Status'].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-purple-700 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.courses.map((c, i) => (
                        <tr key={c.id ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 font-mono text-purple-700 whitespace-nowrap">{c.course_code}</td>
                          <td className="px-4 py-2 font-medium text-gray-800">{c.course_name}</td>
                          <td className="px-4 py-2 text-gray-600">{c.department}</td>
                          <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{c.degree_level}</td>
                          <td className="px-4 py-2 text-gray-600 text-center">{c.duration_years}y</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.is_active === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                            }`}>{c.is_active}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {activeTab === 'schoolDays' && (
                dataPreview.schoolDays.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No school day records found.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-pink-50 sticky top-0">
                      <tr>
                        {['Date', 'Day Type', 'Description', 'Attendance'].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-pink-700 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataPreview.schoolDays.map((d, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{d.date}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              d.day_type === 'Regular' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>{d.day_type}</span>
                          </td>
                          <td className="px-4 py-2 text-gray-600">{d.description}</td>
                          <td className="px-4 py-2 text-gray-700 font-medium">{d.attendance_percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <FaChartBar className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-800 text-lg">Analytics</h3>
              <p className="text-sm text-gray-600 mb-5">Data analytics</p>
              <button
                onClick={handleOpenAnalytics}
                className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Open Dashboard
                <FaArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <FaFileAlt className="w-8 h-8 text-blue-600 mb-3" />
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">Reports</h3>
                  <p className="text-sm text-gray-600">
                    Choose which sections to include in the PDF or print-ready report.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold whitespace-nowrap">
                  {selectedSectionCount} selected
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {reportSelectionItems.map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedSections[item.key] ? item.activeClasses : 'border-blue-100 bg-white/80'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections[item.key]}
                      onChange={() => toggleSection(item.key)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <item.icon className={`w-4 h-4 ${item.iconClasses}`} />
                          <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                          {loadingPreview ? '...' : item.count} records
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleGeneratePdf}
                  disabled={actionLoading.pdf || loadingPreview}
                  className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading.pdf ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaFilePdf className="w-4 h-4" />
                      Generate PDF
                    </>
                  )}
                </button>

                <button
                  onClick={handleOpenPrintView}
                  disabled={actionLoading.print || loadingPreview}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading.print ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Preparing Print View...
                    </>
                  ) : (
                    <>
                      <FaPrint className="w-4 h-4" />
                      Open Print View
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <FaDownload className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-800 text-lg">Exports</h3>
              <p className="text-sm text-gray-600 mb-4">Save student list, courses, and school days</p>
              <div className="space-y-2">
                <button
                  onClick={handleExportStudentsCsv}
                  disabled={actionLoading.studentsCsv || loadingPreview}
                  className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-60"
                >
                  {actionLoading.studentsCsv ? 'Exporting Students...' : 'Export Students CSV'}
                </button>
                <button
                  onClick={handleExportCoursesCsv}
                  disabled={actionLoading.coursesCsv || loadingPreview}
                  className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-60"
                >
                  {actionLoading.coursesCsv ? 'Exporting Courses...' : 'Export Courses CSV'}
                </button>
                <button
                  onClick={handleExportSchoolDaysCsv}
                  disabled={actionLoading.schoolDaysCsv || loadingPreview}
                  className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-60"
                >
                  {actionLoading.schoolDaysCsv ? 'Exporting School Days...' : 'Export School Days CSV'}
                </button>
                <button
                  onClick={handleExportAllJson}
                  disabled={actionLoading.allJson || loadingPreview}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-60"
                >
                  {actionLoading.allJson ? 'Preparing Bundle...' : 'Export All (JSON)'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPage;
