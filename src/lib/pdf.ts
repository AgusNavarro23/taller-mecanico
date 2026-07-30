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

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });

    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const hiRes = canvas.toDataURL("image/jpeg", 0.92);

    const imgWidth = 105;
    const imgHeight = 74;
    const xOff = 52.5;
    doc.addImage(hiRes, "JPEG", xOff, 0, imgWidth, imgHeight);
    return true;
  } catch {
    return false;
  }
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

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
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

function addInvoiceSection(
  doc: jsPDF,
  service: ServiceData,
  vehicle: { plate: string; brand: string; model: string; year: number },
  client: { name: string; phone: string | null; email: string | null },
  startY: number,
  includeHeader: boolean
): number {
  let y = startY;

  if (includeHeader) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Factura de Servicio", 15, y);
    y += 7;
  }

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${service.id.slice(0, 8).toUpperCase()}`, 15, y);
  doc.text(`Fecha: ${formatDate(new Date())}`, 140, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 8;

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

  let yLeft = y;
  leftInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, leftCol, yLeft);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftCol + 22, yLeft);
    yLeft += 6;
  });

  let yRight = y;
  rightInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightCol, yRight);
    doc.setFont("helvetica", "normal");
    doc.text(value, rightCol + 22, yRight);
    yRight += 6;
  });

  y = Math.max(yLeft, yRight) + 6;

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

  let endY = totalY + 18;

  if (service.notes) {
    if (endY > 260) { doc.addPage(); endY = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Notas:", 15, endY);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(service.notes, 180);
    doc.text(noteLines, 15, endY + 5);
    endY += noteLines.length * 5 + 10;
  }

  return endY;
}

export async function generateVehicleHistoryPDF(
  vehicle: VehicleData,
  services: ServiceData[],
  observations?: string
) {
  const doc = new jsPDF();
  await loadLogo(doc);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Historial del Vehículo", 15, 82);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 85, 195, 85);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  let y = 92;
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

  y = 92;
  clientInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, rightCol, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, rightCol + 26, y);
    y += 6;
  });

  y = Math.max(y, 92 + vehicleInfo.length * 6) + 8;

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
      s.notes ? truncate(s.notes, 40) : "—",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Ingreso", "Salida", "Descripción", "Zona", "Estado", "Notas"]],
      body: rows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 45 },
        3: { cellWidth: 30 },
        4: { cellWidth: 22 },
        5: { cellWidth: 43 },
      },
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY || y;

    const servicesWithParts = services.filter((s) => s.parts && s.parts.length > 0);
    if (servicesWithParts.length > 0) {
      let partsY = afterTableY + 10;
      if (partsY > 260) { doc.addPage(); partsY = 20; }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Repuestos Utilizados", 15, partsY);
      partsY += 8;

      const colWidth = 88;
      const leftX = 15;
      const rightX = 107;
      const maxDescLen = 30;

      for (let i = 0; i < servicesWithParts.length; i += 2) {
        const leftService = servicesWithParts[i];
        const rightService = servicesWithParts[i + 1];

        let yLeft = partsY;
        let yRight = partsY;

        const renderBlock = (service: ServiceData, x: number, startY: number): number => {
          let blockY = startY;

          if (blockY > 260) { doc.addPage(); blockY = 20; }

          const descTrunc = service.description.length > maxDescLen
            ? service.description.substring(0, maxDescLen) + "..."
            : service.description;

          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(80, 80, 80);
          doc.text(`Fecha: ${formatDate(service.entryDate)}`, x, blockY);
          blockY += 4;

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(descTrunc, x, blockY);
          blockY += 5;

          const partRows = (service.parts || []).map((p) => [
            p.name, String(p.quantity),
          ]);

          autoTable(doc, {
            startY: blockY,
            head: [["Repuesto", "Cant."]],
            body: partRows,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
            margin: { left: x },
            tableWidth: colWidth,
          });

          return (doc as any).lastAutoTable?.finalY || blockY + 10;
        };

        yLeft = renderBlock(leftService, leftX, yLeft);

        if (rightService) {
          yRight = renderBlock(rightService, rightX, yRight);
        }

        partsY = Math.max(yLeft, yRight) + 10;
      }
    }
  }

  if (observations && observations.trim()) {
    let obsY = (doc as any).lastAutoTable?.finalY || y + 20;
    obsY += 10;
    if (obsY > 250) { doc.addPage(); obsY = 20; }

    doc.setDrawColor(200, 200, 200);
    doc.line(15, obsY, 195, obsY);
    obsY += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones Generales", 15, obsY);
    obsY += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(observations, 180);
    doc.text(obsLines, 15, obsY);
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

  addInvoiceSection(doc, service, vehicle, client, 82, true);

  addFooter(doc);
  doc.save(`factura-${service.id.slice(0, 8)}.pdf`);
}

export async function generateBulkInvoicesPDF(
  services: ServiceData[],
  vehicle: { plate: string; brand: string; model: string; year: number },
  client: { name: string; phone: string | null; email: string | null }
) {
  const doc = new jsPDF();
  await loadLogo(doc);

  let currentY = 82;

  services.forEach((service, index) => {
    if (index > 0) {
      doc.addPage();
      currentY = 10;
    }

    currentY = addInvoiceSection(doc, service, vehicle, client, currentY, true);
  });

  addFooter(doc);
  doc.save(`facturas-${vehicle.plate}-${services.length}servicios.pdf`);
}
