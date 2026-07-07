import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0],
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}
