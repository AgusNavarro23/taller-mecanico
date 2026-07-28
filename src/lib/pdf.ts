import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY = {
  name: "Taller Electromecánico",
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("es-AR");
}

async function loadLogo(doc: jsPDF): Promise<boolean> {
  try {
    const res = await fetch("/Header.jpeg");
    if (!res.ok) return false;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    doc.addImage(dataUrl, "JPEG", 0, 0, 210, 59);
    return true;
  } catch {
    return false;
  }
}

function addHeader(doc: jsPDF) {
}

function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `${COMPANY.name} — Documento generado automáticamente`,
    doc.internal.pageSize.width / 2,
    pageHeight - 10,
    { align: "center" }
  );
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_REPARACION: "En Reparación",
    LISTO: "Listo",
    ENTREGADO: "Entregado",
  };
  return labels[status] || status;
}

interface VehicleData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  mileage: number | null;
  client: {
    name: string;
    phone: string | null;
    email: string | null;
  };
}

interface ServiceData {
  id: string;
  description: string;
  status: string;
  repairArea: string | null;
  entryDate: string;
  exitDate: string | null;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string | null;
  parts: { name: string; quantity: number; price: number }[] | null;
}

export async function generateVehicleHistoryPDF(
  vehicle: VehicleData,
  services: ServiceData[]
) {
  const doc = new jsPDF();
  await loadLogo(doc);
  addHeader(doc);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Historial del Vehículo", 15, 70);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 73, 195, 73);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let y = 80;
  const leftCol = 15;
  const rightCol = 110;

  const vehicleInfo: [string, string][] = [
    ["Patente:", vehicle.plate],
    ["Vehículo:", `${vehicle.brand} ${vehicle.model} ${vehicle.year}`],
    ["Color:", vehicle.color || "—"],
    ["VIN:", vehicle.vin || "—"],
    ["Kilometraje:", vehicle.mileage != null ? `${vehicle.mileage.toLocaleString("es-AR")} km` : "—"],
  ];
  const clientInfo: [string, string][] = [
    ["Propietario:", vehicle.client.name],
    ["Teléfono:", vehicle.client.phone || "—"],
    ["Email:", vehicle.client.email || "—"],
  ];

  vehicleInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftCol + 28, y);
    y += 6;
  });

  y = 80;
  clientInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, rightCol + 26, y);
    y += 6;
  });

  y = Math.max(y, 80 + vehicleInfo.length * 6) + 8;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, y, 180, 14, 2, 2, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Servicios: ${services.length}`, 22, y + 9);

  y += 22;

  if (services.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("No hay servicios registrados para este vehículo.", 15, y + 10);
    doc.setTextColor(0, 0, 0);
  } else {
    const rows = services.map((s) => [
      formatDate(s.entryDate),
      s.exitDate ? formatDate(s.exitDate) : "—",
      s.description,
      s.repairArea || "—",
      statusLabel(s.status),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Ingreso", "Salida", "Descripción", "Zona", "Estado"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 22 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
      },
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY || y;

    const servicesWithParts = services.filter((s) => s.parts && s.parts.length > 0);
    if (servicesWithParts.length > 0) {
      let partsY = afterTableY + 10;
      if (partsY > 260) { doc.addPage(); partsY = 20; }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Detalle de Repuestos", 15, partsY);
      partsY += 6;

      servicesWithParts.forEach((service) => {
        if (partsY > 260) { doc.addPage(); partsY = 20; }

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${service.description} — ${formatDate(service.entryDate)}`, 15, partsY);
        partsY += 5;

        const partRows = (service.parts || []).map((p) => [
          p.name, String(p.quantity), formatCurrency(p.price), formatCurrency(p.price * p.quantity),
        ]);

        autoTable(doc, {
          startY: partsY,
          head: [["Repuesto", "Cant.", "Precio Unit.", "Subtotal"]],
          body: partRows,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
          margin: { left: 15 },
          tableWidth: 100,
        });

        partsY = (doc as any).lastAutoTable?.finalY + 8;
      });
    }
  }

  addFooter(doc);
  doc.save(`historial-${vehicle.plate}.pdf`);
}

export async function generateServiceInvoicePDF(
  service: ServiceData,
  vehicle: { plate: string; brand: string; model: string; year: number },
  client: { name: string; phone: string | null; email: string | null }
) {
  const doc = new jsPDF();
  await loadLogo(doc);
  addHeader(doc);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Factura de Servicio", 15, 70);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${service.id.slice(0, 8).toUpperCase()}`, 15, 77);
  doc.text(`Fecha: ${formatDate(new Date())}`, 140, 77);
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 82, 195, 82);

  let y = 90;
  const leftCol = 15;
  const rightCol = 110;

  const leftInfo: [string, string][] = [
    ["Cliente:", client.name],
    ["Teléfono:", client.phone || "—"],
    ["Email:", client.email || "—"],
  ];
  const rightInfo: [string, string][] = [
    ["Vehículo:", `${vehicle.brand} ${vehicle.model} ${vehicle.year}`],
    ["Patente:", vehicle.plate],
    ["Estado:", statusLabel(service.status)],
  ];

  if (service.repairArea) {
    rightInfo.push(["Zona:", service.repairArea]);
  }

  leftInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftCol + 22, y);
    y += 6;
  });

  y = 90;
  rightInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, rightCol + 22, y);
    y += 6;
  });

  y = Math.max(y, 90 + leftInfo.length * 6) + 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Servicio", 15, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(service.description, 180);
  doc.text(descLines, 15, y);
  y += descLines.length * 5 + 4;

  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 8;

  const conceptRows: string[][] = [
    ["Mano de obra", "1", formatCurrency(Number(service.laborCost)), formatCurrency(Number(service.laborCost))],
  ];

  if (service.parts && service.parts.length > 0) {
    service.parts.forEach((p) => {
      const subtotal = p.price * p.quantity;
      conceptRows.push([p.name, String(p.quantity), formatCurrency(p.price), formatCurrency(subtotal)]);
    });
  }

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Cant.", "Precio Unit.", "Subtotal"]],
    body: conceptRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, fontStyle: "bold" },
    },
  });

  const afterTableY = (doc as any).lastAutoTable?.finalY || y;
  const totalY = afterTableY + 10;

  doc.setFillColor(6, 182, 212);
  doc.roundedRect(120, totalY, 75, 12, 2, 2, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL: ${formatCurrency(Number(service.totalCost))}`, 157, totalY + 8, { align: "center" });
  doc.setTextColor(0, 0, 0);

  if (service.notes) {
    let notesY = totalY + 22;
    if (notesY > 260) { doc.addPage(); notesY = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Notas:", 15, notesY);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(service.notes, 180);
    doc.text(noteLines, 15, notesY + 5);
  }

  addFooter(doc);
  doc.save(`factura-${service.id.slice(0, 8)}.pdf`);
}
