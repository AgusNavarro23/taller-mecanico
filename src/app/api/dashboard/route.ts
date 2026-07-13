import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalClients,
      totalVehicles,
      totalServices,
      pendingServices,
      inProgressServices,
      readyServices,
      deliveredServices,
      revenueResult,
      recentServices,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.serviceEntry.count(),
      prisma.serviceEntry.count({ where: { status: "PENDIENTE" } }),
      prisma.serviceEntry.count({ where: { status: "EN_REPARACION" } }),
      prisma.serviceEntry.count({ where: { status: "LISTO" } }),
      prisma.serviceEntry.count({ where: { status: "ENTREGADO" } }),
      prisma.serviceEntry.aggregate({ _sum: { totalCost: true } }),
      prisma.serviceEntry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: {
            include: { client: true },
          },
        },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.totalCost ?? 0);

    return NextResponse.json({
      totalClients,
      totalVehicles,
      totalServices,
      pendingServices,
      inProgressServices,
      readyServices,
      deliveredServices,
      totalRevenue,
      recentServices,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
