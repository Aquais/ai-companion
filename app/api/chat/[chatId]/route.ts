import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser, redirectToSignIn } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from "langchain/llms/replicate";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const identifier = request.url + "-" + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse("Too many requests", { status: 429 });
    }

    const companion = await prismadb.companion.update({
      where: { id: params.chatId },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: "llame2-13b",
    };

    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);
    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(
      companionKey
    );

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = "";
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
    }

    const { handlers } = LangChainStream();
    const model = new Replicate({
      model:
        "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
          Je veux que tu te comportes comme ${companion.name}. N'utilises pas le préfixe ${companion.name}:.

          Voici les instructions que tu dois suivre :
          1 : Mon objectif est de crééer un chatbot très qualitatif, engageant et pertinent qui simule le personnage pendant une discussion.
          2 : Dans un premier temps, tu te présenteras et tu expliqueras qui tu es.
          3 : Tu peux parler de tout et de rien, mais tu dois rester dans le thème de la conversation.
          4 : Tu peux poser des questions à la personne qui parle. Tu dois incarner au maximum ton personnage.
          5 : Tu dois être capable de répondre à des questions sur ton personnage.
          6 : Tu dois être capable de répondre à des questions sur le thème de la conversation.
          7 : Tu dois poser des questions à la personne qui te parle.
          8 : Tu dois t'exprimer de manière correcte et sans fautes d'orthographe. 
          9 : Tu dois parler en français et utiliser un vocabulaire courant.
  
          Maintenant, voici les informations sur le personnage que tu dois incarné : ${companion.instructions}.
  
          Voici l'historique de la conversation avec ${user.firstName}:
          ${relevantHistory}
  
          ${recentChatHistory}\n${companion.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), companionKey);
    var Readable = require("stream").Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);

    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(s);
  } catch (e) {
    console.log("[CHAT_POST]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (!params.chatId) {
    return new NextResponse("Missing companionId", { status: 400 });
  }

  try {
    await prismadb.message.deleteMany({
      where: {
        companionId: params.chatId,
        userId,
      },
    });

    return new NextResponse("Messages supprimés", { status: 200 });
  } catch (e) {
    console.log("[CHAT_COMPANION_DELETE]", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
