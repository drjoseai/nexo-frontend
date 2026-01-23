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
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a2e] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
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
                className="bg-white dark:bg-[#252542] rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t(`sections.${section.id}.title`)}
                  </h2>
                </div>

                {/* FAQ Items */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {section.items.map((item, index) => {
                    const itemId = `${section.id}-${index}`;
                    const isOpen = openItems.has(itemId);
                    return (
                      <div key={itemId}>
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-[#2a2a4a] transition-colors"
                        >
                          <span className="text-gray-800 dark:text-gray-200 font-medium pr-4">
                            {t(`sections.${section.id}.${item.questionKey}`)}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
        <div className="mt-8 text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            {t("contactCta.title")}
          </h3>
          <p className="text-purple-100 mb-4">{t("contactCta.subtitle")}</p>
          <a
            href="mailto:support@trynexo.ai"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            {t("contactCta.button")}
          </a>
        </div>
      </div>
    </div>
  );
}

