"use client";

import { useState } from "react";
import { ChevronDown, Phone, MessageCircle, Clock, Shield } from "lucide-react";

interface FAQProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultQuestions = [
  {
    q: "How much does a consultation cost?",
    a: "We offer a free initial consultation for most cases. During this meeting, we review your case details, explain your legal options, and provide an estimate of costs. For complex matters, a nominal fee may be charged for the initial consultation.",
  },
  {
    q: "How long will my case take?",
    a: "Case duration varies significantly based on complexity, type of case, and court schedules. Simple matters may be resolved in a few months, while complex litigation can take several years. After reviewing your case, we will provide a realistic timeline.",
  },
  {
    q: "Do you work on a contingency basis?",
    a: "Yes, we work on a contingency fee basis for many personal injury and wrongful death cases. This means you pay nothing upfront - we only get paid if we recover compensation for you. The percentage is discussed during the initial consultation.",
  },
  {
    q: "What should I bring to my first meeting?",
    a: "Please bring any documents related to your case, including contracts, correspondence, police reports, medical records, photos, and insurance information. The more information you can provide, the better we can evaluate your case.",
  },
  {
    q: "Can you handle cases outside of the city?",
    a: "While our main offices are located in the city, we have a network of partner firms across the country and can refer you to trusted colleagues in other states. For federal cases, our attorneys are admitted to practice in multiple federal courts.",
  },
  {
    q: "What makes your firm different from others?",
    a: "Our firm offers the combination of small-firm attention with large-firm resources. We treat every client like family, providing direct access to attorneys and keeping you informed throughout your case. Our 98% success rate and $500+ million recovered demonstrates our commitment to results.",
  },
  {
    q: "Do you offer payment plans?",
    a: "Yes, we understand that legal fees can be a significant concern. We offer flexible payment plans for retainer fees and can work with you to find a financial arrangement that fits your budget. We also accept credit cards and wire transfers.",
  },
  {
    q: "How do I get started?",
    a: "Simply contact us by phone, email, or through our website. We will schedule your free consultation within 24-48 hours. During this meeting, we listen to your story, evaluate your case, and outline your legal options.",
  },
];

// Helper to get nested value from dictionary
function getDictValue(dict: Record<string, unknown> | undefined, path: string, fallback: string): string {
  if (!dict) return fallback;
  const keys = path.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return fallback;
    }
  }
  return typeof value === "string" ? value : fallback;
}

// Safely get FAQs array from dictionary
function getFAQsData(
  dict: Record<string, unknown> | undefined
): typeof defaultQuestions {
  if (!dict) return defaultQuestions;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.faqs)) {
    return (lawfirmData.faqs as Array<{
      question?: string;
      answer?: string;
    }>).map((faq, index) => ({
      ...defaultQuestions[index],
      q: faq.question || defaultQuestions[index]?.q,
      a: faq.answer || defaultQuestions[index]?.a,
    }));
  }
  
  // Also try faq.questions
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;
  const faqSection = lawfirm?.faq as Record<string, unknown> | undefined;
  if (faqSection && Array.isArray(faqSection.questions)) {
    return (faqSection.questions as Array<{
      q?: string;
      a?: string;
    }>).map((item, index) => ({
      ...defaultQuestions[index],
      q: item.q || defaultQuestions[index]?.q,
      a: item.a || defaultQuestions[index]?.a,
    }));
  }
  
  return defaultQuestions;
}

export function LawFirmFAQ({ locale, dictionary }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;
  const faqSection = lawfirm?.faq as Record<string, unknown> | undefined;

  const title = getDictValue(lawfirm, "faq.title", "Frequently Asked Questions");
  const subtitle = getDictValue(lawfirm, "faq.subtitle", "Find answers to common questions about working with our firm and the legal process.");
  
  const stillQuestionsTitle = faqSection?.stillQuestions ? 
    getDictValue(faqSection as Record<string, unknown>, "title", "Still have questions?") :
    getDictValue(lawfirm, "faq.stillQuestions.title", "Still have questions?");
  const stillQuestionsSubtitle = faqSection?.stillQuestions ?
    getDictValue(faqSection as Record<string, unknown>, "subtitle", "Our team is ready to answer any additional questions. Contact us today for a free consultation.") :
    getDictValue(lawfirm, "faq.stillQuestions.subtitle", "Our team is ready to answer any additional questions. Contact us today for a free consultation.");
  const call = getDictValue(lawfirm, "faq.stillQuestions.call", "Call");
  const message = getDictValue(lawfirm, "faq.stillQuestions.message", "Send a message");
  const emergency = getDictValue(lawfirm, "faq.emergency", "Available 24/7 for emergencies");

  const questions = getFAQsData(dict);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600">
            {subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="font-semibold text-slate-900 text-lg">
                  {question.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="p-6 bg-white text-slate-600 leading-relaxed">
                  {question.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            {stillQuestionsTitle}
          </h3>
          <p className="text-slate-300 mb-8">
            {stillQuestionsSubtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+1-555-123-4567"
              className="inline-flex items-center bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              <Phone className="w-5 h-5 ml-2" />
              {call}
            </a>
            <a
              href="/law-firm/contact"
              className="inline-flex items-center bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5 ml-2" />
              {message}
            </a>
          </div>

          <div className="flex items-center justify-center mt-6 text-slate-400">
            <Clock className="w-5 h-5 ml-2" />
            <span className="text-sm">{emergency}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
