"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Heart,
  Car,
  Building,
  Users,
  Home,
  FileText,
  DollarSign,
  Lightbulb,
  Star,
} from "lucide-react";

interface PracticeAreasProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultPracticeAreas = [
  {
    icon: Shield,
    name: "Criminal Defense",
    description: "Defending your rights in criminal proceedings with aggressive representation.",
    featured: true,
    href: "/law-firm/criminal-defense",
  },
  {
    icon: Heart,
    name: "Family Law",
    description: "Compassionate guidance through divorce, custody, and family matters.",
    featured: true,
    href: "/law-firm/family-law",
  },
  {
    icon: Car,
    name: "Personal Injury",
    description: "Fighting for maximum compensation for injury victims.",
    featured: true,
    href: "/law-firm/personal-injury",
  },
  {
    icon: Building,
    name: "Corporate Law",
    description: "Strategic counsel for business formation, mergers, and acquisitions.",
    featured: false,
    href: "/law-firm/corporate-law",
  },
  {
    icon: Users,
    name: "Immigration",
    description: "Navigating complex immigration processes with expertise.",
    featured: false,
    href: "/law-firm/immigration",
  },
  {
    icon: Home,
    name: "Real Estate",
    description: "Protecting your interests in property transactions and disputes.",
    featured: false,
    href: "/law-firm/real-estate",
  },
  {
    icon: FileText,
    name: "Estate Planning",
    description: "Securing your legacy with wills, trusts, and probate services.",
    featured: false,
    href: "/law-firm/estate-planning",
  },
  {
    icon: DollarSign,
    name: "Bankruptcy",
    description: "Helping individuals and businesses find financial freedom.",
    featured: false,
    href: "/law-firm/bankruptcy",
  },
  {
    icon: Lightbulb,
    name: "Intellectual Property",
    description: "Protecting your innovations, trademarks, and creative works.",
    featured: false,
    href: "/law-firm/ip",
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

// Safely get practice areas array from dictionary
function getPracticeAreasData(
  dict: Record<string, unknown> | undefined
): typeof defaultPracticeAreas {
  if (!dict) return defaultPracticeAreas;
  
  // Try lawfirmData.practiceAreas first
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.practiceAreas)) {
    return (lawfirmData.practiceAreas as Array<{
      name?: string;
      description?: string;
      featured?: boolean;
      href?: string;
    }>).map((area, index) => ({
      ...defaultPracticeAreas[index],
      name: area.name || defaultPracticeAreas[index]?.name,
      description: area.description || defaultPracticeAreas[index]?.description,
      featured: area.featured ?? defaultPracticeAreas[index]?.featured,
      href: area.href || defaultPracticeAreas[index]?.href,
      icon: defaultPracticeAreas[index]?.icon,
    }));
  }
  
  return defaultPracticeAreas;
}

export function LawFirmPracticeAreas({ locale, dictionary }: PracticeAreasProps) {
  const isRTL = locale === "ar" || locale === "fa";
  
  const dict = dictionary || {};
  
  // Get translations from lawfirm section
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;
  const lawfirmPracticeAreas = lawfirm?.practiceAreas as Record<string, unknown> | undefined;
  
  const title = getDictValue(lawfirm, "title", "Practice Areas");
  const subtitle = getDictValue(lawfirm, "subtitle", "Our experienced attorneys specialize in a wide range of legal practice areas, providing comprehensive solutions for all your legal needs.");
  const learnMore = getDictValue(lawfirm, "learnMore", "Learn More");
  const viewAll = getDictValue(lawfirm, "viewAll", "View All Practice Areas");
  
  // Get practice areas data
  const practiceAreas = getPracticeAreasData(dict);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Featured Areas */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {practiceAreas
            .filter((area) => area.featured)
            .map((area, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-100"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
                  <area.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {area.name}
                </h3>
                <p className="text-slate-600 mb-6">{area.description}</p>
                <Link
                  href={area.href || "#"}
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700"
                >
                  {learnMore}
                  <Star className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))}
        </div>

        {/* All Areas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceAreas.map((area, index) => (
            <Link
              key={index}
              href={area.href || "#"}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all block"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <area.icon className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">{area.name}</h4>
                  <p className="text-sm text-slate-600">{area.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/law-firm/practice-areas"
            className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            {viewAll}
            <Star className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
