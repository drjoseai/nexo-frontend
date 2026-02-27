"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareHeart, Send, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = "general" | "bug" | "suggestion" | "complaint";

const FEEDBACK_TYPES: { value: FeedbackType; emoji: string; labelKey: string }[] = [
  { value: "general", emoji: "💬", labelKey: "typeGeneral" },
  { value: "suggestion", emoji: "💡", labelKey: "typeSuggestion" },
  { value: "bug", emoji: "🐛", labelKey: "typeBug" },
  { value: "complaint", emoji: "⚠️", labelKey: "typeComplaint" },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("feedback");

  const handleSubmit = async () => {
    if (!message.trim() || message.trim().length < 10) return;

    setIsSubmitting(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.trynexo.ai";
      const response = await fetch(`${apiBaseUrl}/api/v1/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          type: feedbackType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMessage("");
      setFeedbackType("general");
      setSubmitted(false);
    }, 300);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquareHeart className="h-5 w-5 text-primary" />
              {t("title")}
            </AlertDialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <MessageSquareHeart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{t("thankYouTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("thankYouMessage")}</p>
            <Button onClick={handleClose} className="mt-6">
              {t("close")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>

            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFeedbackType(type.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                    feedbackType === type.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border hover:border-primary/30 hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  <span>{type.emoji}</span>
                  <span>{t(type.labelKey)}</span>
                </button>
              ))}
            </div>

            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                placeholder={t("placeholder")}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-white/5 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{message.length < 10 && message.length > 0 ? t("minChars") : ""}</span>
                <span>{message.length}/2000</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || message.trim().length < 10}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t("submit")}
            </Button>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
