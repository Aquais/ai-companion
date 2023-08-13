import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const user = await currentUser();

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.companionId) {
      return new NextResponse("Missing companionId", { status: 400 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const companion = await prismadb.companion.update({
      where: { id: params.companionId, userId: user.id },
      data: {
        src,
        name,
        description,
        instructions,
        seed,
        categoryId,
        userId: user.id,
        userName: user.firstName,
      },
    });

    return new NextResponse(JSON.stringify(companion), { status: 200 });
  } catch (e) {
    console.log("[COMPANION__PATCH]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.companionId) {
      return new NextResponse("Missing companionId", { status: 400 });
    }

    const companion = await prismadb.companion.delete({
      where: { id: params.companionId },
    });

    return new NextResponse(JSON.stringify(companion), { status: 200 });
  } catch (e) {
    console.log("[COMPANION__DELETE]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
