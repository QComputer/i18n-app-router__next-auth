"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialsProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultTestimonials = [
  {
    id: 1,
    name: "Robert Thompson",
    case: "Criminal Defense",
    rating: 5,
    text: "John Mitchell saved my future. Facing serious charges felt overwhelming, but his expertise and dedication led to a complete acquittal. I can't thank him enough for his tireless work on my case.",
    date: "January 2024",
  },
  {
    id: 2,
    name: "Maria Santos",
    case: "Family Law",
    rating: 5,
    text: "Sarah Chen handled my divorce with such compassion and professionalism. She fought for my children's best interests while keeping the process as peaceful as possible. Highly recommend.",
    date: "December 2023",
  },
  {
    id: 3,
    name: "James Wilson",
    case: "Personal Injury",
    rating: 5,
    text: "After my car accident, Michael Rodriguez recovered $2.5 million for me and my family. His aggressive approach with the insurance company made all the difference. True advocate!",
    date: "November 2023",
  },
  {
    id: 4,
    name: "Linda Chen",
    case: "Corporate Law",
    rating: 5,
    text: "Emily Thompson helped me navigate a complex merger. Her attention to detail and business acumen exceeded my expectations. A true professional in every sense.",
    date: "October 2023",
  },
  {
    id: 5,
    name: "Ahmed Hassan",
    case: "Immigration",
    rating: 5,
    text: "David Park made my American dream possible. His expertise in immigration law helped my family obtain green cards in record time. Forever grateful!",
    date: "September 2023",
  },
  {
    id: 6,
    name: "Patricia Moore",
    case: "Real Estate",
    rating: 5,
    text: "Jennifer Williams saved our commercial property deal from falling through. Her negotiation skills and knowledge of real estate law are unmatched. Excellent work!",
    date: "August 2023",
  },
];

const defaultPlatforms = [
  { name: "Google Reviews", icon: "⭐" },
  { name: "Avvo", icon: "⚖️" },
  { name: "Martindale-Hubbell", icon: "🏆" },
  { name: "Facebook", icon: "👍" },
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

// Safely get testimonials array from dictionary
function getTestimonialsData(
  dict: Record<string, unknown> | undefined
): typeof defaultTestimonials {
  if (!dict) return defaultTestimonials;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.testimonials)) {
    return (lawfirmData.testimonials as Array<{
      name?: string;
      case?: string;
      rating?: number;
      text?: string;
      date?: string;
    }>).map((t, index) => ({
      ...defaultTestimonials[index],
      name: t.name || defaultTestimonials[index]?.name,
      case: t.case || defaultTestimonials[index]?.case,
      rating: t.rating ?? defaultTestimonials[index]?.rating,
      text: t.text || defaultTestimonials[index]?.text,
      date: t.date || defaultTestimonials[index]?.date,
    }));
  }
  
  return defaultTestimonials;
}

export function LawFirmTestimonials({ locale, dictionary }: TestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;

  const title = getDictValue(lawfirm, "title", "What Our Clients Say");
  const subtitle = getDictValue(lawfirm, "subtitle", "Don't just take our word for it. Hear from the clients whose lives we've changed and cases we've won.");
  const reviewUs = getDictValue(lawfirm, "reviewUs", "Review us on:");
  const caseLabel = getDictValue(lawfirm, "case", "Case");

  const testimonials = getTestimonialsData(dict);

  const platforms = defaultPlatforms;

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            {/* Quote Icon */}
            <Quote className="w-12 h-12 text-amber-400 mb-6" />

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-6">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Text */}
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-lg">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-slate-500">
                  {testimonials[activeIndex].case} {caseLabel} • {testimonials[activeIndex].date}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === activeIndex ? "bg-amber-400" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* All Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                "{testimonial.text}"
              </p>
              <p className="text-white font-medium">{testimonial.name}</p>
              <p className="text-slate-400 text-sm">{testimonial.case}</p>
            </div>
          ))}
        </div>

        {/* Review Platforms */}
        <div className="text-center mt-12">
          <p className="text-slate-400 mb-6">{reviewUs}</p>
          <div className="flex flex-wrap justify-center gap-6">
            {platforms.map((platform, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg"
              >
                <span>{platform.icon}</span>
                <span className="text-white font-medium">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
