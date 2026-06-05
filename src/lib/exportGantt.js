import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

function formatRows(tasks) {
  return tasks.map((t) => ({
    Task: t.name,
    Start: format(t.start, "yyyy-MM-dd"),
    End: format(t.end, "yyyy-MM-dd"),
    Progress: `${t.progress}%`,
  }));
}

export function exportToXlsx(tasks, filename = "gantt") {
  const ws = XLSX.utils.json_to_sheet(formatRows(tasks));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Gantt");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToCsv(tasks, filename = "gantt") {
  const ws = XLSX.utils.json_to_sheet(formatRows(tasks));
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPdf(tasks, filename = "gantt") {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Diagrama de Gantt", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Task", "Start", "End", "Progress"]],
    body: formatRows(tasks).map((r) => [r.Task, r.Start, r.End, r.Progress]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
}
