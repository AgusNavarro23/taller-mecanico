import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notifications";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      );
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isFirstUser ? "ADMIN" : "USER",
        approved: isFirstUser,
      },
    });

    if (isFirstUser) {
      await createNotification({
        title: "Administrador creado",
        message: `${name} (${email}) se registró como administrador del sistema.`,
        type: "admin",
      });
    } else {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", approved: true },
      });

      for (const admin of admins) {
        await createNotification({
          title: "Nuevo registro pendiente",
          message: `${name} (${email}) se registró y espera aprobación.`,
          type: "registration",
          entityId: user.id,
          entityType: "user",
        });
      }
    }

    return NextResponse.json(
      {
        message: isFirstUser
          ? "Administrador creado exitosamente. Ya podés iniciar sesión."
          : "Usuario creado exitosamente. Esperá la aprobación del administrador.",
        userId: user.id,
        isFirstUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = (error as any).issues || [];
      return NextResponse.json(
        { error: issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
