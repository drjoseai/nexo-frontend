"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Users,
  CreditCard,
  Shield,
  Mail,
} from "lucide-react";

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

interface FAQSection {
  id: string;
  iconName: string;
  items: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: "whatIsNexo",
    iconName: "HelpCircle",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
      { questionKey: "q3", answerKey: "a3" },
    ],
  },
  {
    id: "howItWorks",
    iconName: "MessageCircle",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
      { questionKey: "q3", answerKey: "a3" },
    ],
  },
  {
    id: "avatars",
    iconName: "Users",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
      { questionKey: "q3", answerKey: "a3" },
      { questionKey: "q4", answerKey: "a4" },
    ],
  },
  {
    id: "plans",
    iconName: "CreditCard",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
      { questionKey: "q3", answerKey: "a3" },
      { questionKey: "q4", answerKey: "a4" },
    ],
  },
  {
    id: "privacy",
    iconName: "Shield",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
      { questionKey: "q3", answerKey: "a3" },
    ],
  },
  {
    id: "contact",
    iconName: "Mail",
    items: [
      { questionKey: "q1", answerKey: "a1" },
      { questionKey: "q2", answerKey: "a2" },
    ],
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HelpCircle,
  MessageCircle,
  Users,
  CreditCard,
  Shield,
  Mail,
};

export default function HelpContent() {
  const t = useTranslations("help");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {FAQ_SECTIONS.map((section) => {
            const IconComponent = iconMap[section.iconName];
            return (
              <div
                key={section.id}
                className="bg-card rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t(`sections.${section.id}.title`)}
                  </h2>
                </div>

                {/* FAQ Items */}
                <div className="divide-y divide-border">
                  {section.items.map((item, index) => {
                    const itemId = `${section.id}-${index}`;
                    const isOpen = openItems.has(itemId);
                    return (
                      <div key={itemId}>
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-secondary transition-colors"
                        >
                          <span className="text-foreground font-medium pr-4">
                            {t(`sections.${section.id}.${item.questionKey}`)}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-muted-foreground leading-relaxed">
                              {t(`sections.${section.id}.${item.answerKey}`)}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            {t("contactCta.title")}
          </h3>
          <p className="text-primary-foreground/80 mb-4">{t("contactCta.subtitle")}</p>
          <a
            href="mailto:support@trynexo.ai"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/10 transition-colors"
          >
            <Mail className="w-5 h-5" />
            {t("contactCta.button")}
          </a>
        </div>
      </div>
    </div>
  );
}

