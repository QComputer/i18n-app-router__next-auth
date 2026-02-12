"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Phone, Clock, MessageCircle } from "lucide-react";

interface FAQProps {
  locale: string;
}

const faqs = [
  {
    question: "How much does a consultation cost?",
    answer: "We offer a free initial consultation for most cases. During this meeting, we will discuss the details of your case, explain your legal options, and provide you with an estimate of the costs involved. For complex matters, we may charge a nominal fee for the initial consultation.",
  },
  {
    question: "How long will my case take?",
    answer: "The duration of a case varies significantly depending on its complexity, the type of case, and the court schedule. Simple matters may be resolved in a few months, while complex litigation can take several years. We will provide you with a realistic timeline after reviewing your case.",
  },
  {
    question: "Do you work?",
    answer: "Yes, on a contingency basis we work on a contingency fee basis for many personal injury and wrongful death cases. This means you don't pay any upfront fees - we only get paid if we recover compensation for you. The percentage is discussed during your initial consultation.",
  },
  {
    question: "What should I bring to my first meeting?",
    answer: "Please bring any documents related to your case, including contracts, correspondence, police reports, medical records, photographs, and insurance information. The more information you can provide, the better we can evaluate your case.",
  },
  {
    question: "Can you handle cases outside of California?",
    answer: "While our primary offices are in California, we have a network of partner firms across the country and can refer you to trusted colleagues in other states. For federal cases, our attorneys are admitted to practice in multiple federal courts nationwide.",
  },
  {
    question: "What makes your firm different from others?",
    answer: "Our firm combines small-firm personal attention with large-firm resources. We treat each client like family, providing direct access to our attorneys and keeping you informed throughout your case. Our 98% success rate and $500+ million recovered demonstrate our commitment to results.",
  },
  {
    question: "Do you offer payment plans?",
    answer: "Yes, we understand that legal fees can be a significant concern. We offer flexible payment plans for retainer fees and can work with you to find a financial arrangement that fits your budget. We also accept credit cards and wire transfers.",
  },
  {
    question: "How do I get started?",
    answer: "Simply contact us by phone, email, or through our website. We will schedule your free consultation within 24-48 hours. During this meeting, we will listen to your story, evaluate your case, and outline your legal options.",
  },
];

export function LawFirmFAQ({ locale }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600">
            Find answers to common questions about working with our firm and the legal process.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-slate-900 text-lg">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still Have Questions?
          </h3>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Our team is ready to answer any additional questions you may have.
            Contact us today for your free consultation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:1-800-JUSTICE"
              className="flex items-center space-x-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>1-800-JUSTICE</span>
            </a>
            <Link
              href="/law-firm/contact"
              className="flex items-center space-x-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Us a Message</span>
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-6 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Available 24/7 for emergencies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
