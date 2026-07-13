import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        client: true,
        services: {
          orderBy: { entryDate: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Error al obtener el vehículo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plate: body.plate,
        brand: body.brand,
        model: body.model,
        year: Number(body.year),
        color: body.color || null,
        vin: body.vin || null,
        clientId: body.clientId,
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Error al actualizar el vehículo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    await prisma.vehicle.delete({ where: { id } });

    if (vehicle) {
      await createNotification({
        title: "Vehículo eliminado",
        message: `${vehicle.brand} ${vehicle.model} — Patente: ${vehicle.plate}`,
        type: "delete",
        entityType: "vehicle",
      });
    }

    return NextResponse.json({ message: "Vehículo eliminado" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Error al eliminar el vehículo" },
      { status: 500 }
    );
  }
}
