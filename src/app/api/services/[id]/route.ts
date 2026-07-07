import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.serviceEntry.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Error al obtener el servicio" },
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

    const laborCost = Number(body.laborCost);
    const partsCost = body.parts
      ? body.parts.reduce((sum: number, part: any) => sum + part.price * part.quantity, 0)
      : 0;
    const totalCost = laborCost + partsCost;

    const service = await prisma.serviceEntry.update({
      where: { id },
      data: {
        description: body.description,
        status: body.status,
        entryDate: new Date(body.entryDate),
        exitDate: body.exitDate ? new Date(body.exitDate) : null,
        laborCost,
        partsCost,
        totalCost,
        notes: body.notes || null,
        parts: body.parts || null,
        vehicleId: body.vehicleId,
      },
      include: {
        vehicle: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Error al actualizar el servicio" },
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
    await prisma.serviceEntry.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Servicio eliminado" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Error al eliminar el servicio" },
      { status: 500 }
    );
  }
}
