// components/chat/DeleteHistoryButton.tsx
// Botón con confirmación para borrar historial de chat

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteHistoryButtonProps {
  avatarName: string;
  onDelete: () => Promise<void>;
  disabled?: boolean;
}

export function DeleteHistoryButton({
  avatarName,
  onDelete,
  disabled = false,
}: DeleteHistoryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled || isDeleting}
          className="text-white/40 hover:text-red-400 hover:bg-red-400/10"
          title="Borrar historial"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Borrar historial</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-background border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar historial de chat?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminarán todos los mensajes con {avatarName}. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Borrando..." : "Borrar historial"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

