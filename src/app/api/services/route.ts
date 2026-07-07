import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    const where = vehicleId ? { vehicleId } : {};

    const services = await prisma.serviceEntry.findMany({
      where,
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Error al obtener los servicios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = serviceSchema.parse(body);

    const laborCost = Number(data.laborCost);
    const partsCost = data.parts
      ? data.parts.reduce((sum, part) => sum + part.price * part.quantity, 0)
      : 0;
    const totalCost = laborCost + partsCost;

    const service = await prisma.serviceEntry.create({
      data: {
        description: data.description,
        status: data.status,
        entryDate: new Date(data.entryDate),
        exitDate: data.exitDate ? new Date(data.exitDate) : null,
        laborCost,
        partsCost,
        totalCost,
        notes: data.notes || null,
        parts: data.parts || null,
        vehicleId: data.vehicleId,
      },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Error al crear el servicio" },
      { status: 500 }
    );
  }
}
