import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Error al obtener los clientes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = clientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        dni: data.dni || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Error al crear el cliente" },
      { status: 500 }
    );
  }
}
