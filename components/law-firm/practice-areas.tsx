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
}

const practiceAreas = [
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

export function LawFirmPracticeAreas({ locale }: PracticeAreasProps) {
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Practice Areas
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Our experienced attorneys specialize in a wide range of legal practice areas,
            providing comprehensive solutions for all your legal needs.
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
                  href={area.href}
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700"
                >
                  Learn More
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
              href={area.href}
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
            View All Practice Areas
            <Star className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
