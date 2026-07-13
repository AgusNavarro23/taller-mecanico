import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        client: true,
        _count: {
          select: { services: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Error al obtener los vehículos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = vehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.create({
      data: {
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color || null,
        vin: data.vin || null,
        clientId: data.clientId,
      },
      include: {
        client: true,
      },
    });

    await createNotification({
      title: "Nuevo vehículo registrado",
      message: `${vehicle.brand} ${vehicle.model} — Patente: ${vehicle.plate}`,
      type: "vehicle",
      entityId: vehicle.id,
      entityType: "vehicle",
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Error al crear el vehículo" },
      { status: 500 }
    );
  }
}
