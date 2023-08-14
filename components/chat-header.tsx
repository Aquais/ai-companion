"use client";

import axios from "axios";
import { Companion, Message } from "@prisma/client";
import {
  ChevronLeft,
  Edit,
  MessagesSquare,
  MoreVertical,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { BotAvatar } from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface ChatHeaderProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatHeader = ({ companion }: ChatHeaderProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      await axios.delete(`/api/companion/${companion.id}`);
      toast({
        description: "Le compagnon a été supprimé",
      });
      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const onDeleteConversation = async () => {
    try {
      await axios.delete(`/api/chat/${companion.id}`);
      toast({
        description: "La conversation a été supprimée",
      });
      router.refresh();
    } catch (error) {
      toast({
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
      <div className="flex gap-x-2 items-center">
        <Button onClick={() => router.back()} size={"icon"} variant={"ghost"}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <BotAvatar src={companion.src} />
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <p className="font-bold">{companion.name}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessagesSquare className="w-3 h-3 mr-1" />
              {companion._count.messages}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Créé par {companion.userName}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"secondary"} size={"icon"}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDeleteConversation()}>
            <Trash className="w-4 h-4 mr-2" />
            Supprimer la conversation
          </DropdownMenuItem>{" "}
          {user?.id === companion.userId && (
            <>
              <DropdownMenuItem
                onClick={() => router.push(`/companion/${companion.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier le compagnon
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete()}>
                <Trash className="w-4 h-4 mr-2" />
                Supprimer le compagnon
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
