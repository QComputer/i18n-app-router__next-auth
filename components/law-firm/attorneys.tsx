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
  ArrowRight,
  Star,
} from "lucide-react";

interface AttorneysProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultAttorneys = [
  {
    name: "John Mitchell",
    title: "Senior Partner",
    specializations: ["Criminal Defense"],
    bio: "Over 20 years of experience in criminal defense, John Mitchell has successfully defended thousands of clients in high-profile cases. His track record includes numerous acquittals and reduced sentences.",
    admissions: ["Supreme Court", "Federal Court", "State Bar"],
    image: "/images/attorney-john.jpg",
    featured: true,
  },
  {
    name: "Sarah Chen",
    title: "Partner",
    specializations: ["Family Law"],
    bio: "Sarah Chen brings compassion and expertise to every family law case. She specializes in divorce, child custody, and adoption, helping families navigate difficult transitions with care.",
    admissions: ["Supreme Court", "State Bar"],
    image: "/images/attorney-sarah.jpg",
    featured: true,
  },
  {
    name: "Michael Rodriguez",
    title: "Senior Attorney",
    specializations: ["Personal Injury"],
    bio: "Michael Rodriguez has recovered millions for injury victims. His aggressive approach with insurance companies ensures clients receive the maximum compensation they deserve.",
    admissions: ["Federal Court", "State Bar"],
    image: "/images/attorney-michael.jpg",
    featured: true,
  },
  {
    name: "Emily Thompson",
    title: "Partner",
    specializations: ["Corporate Law"],
    bio: "Emily Thompson advises businesses on complex legal matters including mergers, acquisitions, and corporate governance. She helps companies navigate the legal landscape with strategic counsel.",
    admissions: ["Supreme Court", "Federal Court", "State Bar"],
    image: "/images/attorney-emily.jpg",
    featured: false,
  },
  {
    name: "David Park",
    title: "Senior Attorney",
    specializations: ["Immigration"],
    bio: "David Park has helped thousands of families achieve their American dream. His expertise in immigration law makes him a trusted advisor for complex immigration matters.",
    admissions: ["Federal Court", "State Bar"],
    image: "/images/attorney-david.jpg",
    featured: false,
  },
  {
    name: "Jennifer Williams",
    title: "Associate Attorney",
    specializations: ["Real Estate"],
    bio: "Jennifer Williams protects clients' interests in property transactions and disputes. Her attention to detail ensures smooth real estate deals and effective dispute resolution.",
    admissions: ["State Bar"],
    image: "/images/attorney-jennifer.jpg",
    featured: false,
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

// Safely get attorneys array from dictionary
function getAttorneysData(
  dict: Record<string, unknown> | undefined
): typeof defaultAttorneys {
  if (!dict) return defaultAttorneys;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.attorneys)) {
    return (lawfirmData.attorneys as Array<{
      name?: string;
      title?: string;
      specializations?: string[];
      bio?: string;
      admissions?: string[];
      featured?: boolean;
    }>).map((attorney, index) => ({
      ...defaultAttorneys[index],
      name: attorney.name || defaultAttorneys[index]?.name,
      title: attorney.title || defaultAttorneys[index]?.title,
      specializations: attorney.specializations || defaultAttorneys[index]?.specializations,
      bio: attorney.bio || defaultAttorneys[index]?.bio,
      admissions: attorney.admissions || defaultAttorneys[index]?.admissions,
      featured: attorney.featured ?? defaultAttorneys[index]?.featured,
    }));
  }
  
  return defaultAttorneys;
}

export function LawFirmAttorneys({ locale, dictionary }: AttorneysProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;
  const lawfirmAttorneys = lawfirm?.attorneys as Record<string, unknown> | undefined;

  const title = getDictValue(lawfirm, "title", "Our Attorneys");
  const subtitle = getDictValue(lawfirm, "subtitle", "Meet our team of experienced attorneys dedicated to fighting for your rights and achieving the best possible outcomes for your case.");
  const filterAll = getDictValue(lawfirm, "filterAll", "All");
  const filterCriminal = getDictValue(lawfirm, "filterCriminal", "Criminal Defense");
  const filterFamily = getDictValue(lawfirm, "filterFamily", "Family Law");
  const filterPersonal = getDictValue(lawfirm, "filterPersonal", "Personal Injury");
  const filterCorporate = getDictValue(lawfirm, "filterCorporate", "Corporate Law");
  const filterImmigration = getDictValue(lawfirm, "filterImmigration", "Immigration");
  const filterRealEstate = getDictValue(lawfirm, "filterRealEstate", "Real Estate");
  const admissions = getDictValue(lawfirm, "admissions", "Admissions:");
  const more = getDictValue(lawfirm, "more", "More");
  const viewProfile = getDictValue(lawfirm, "viewProfile", "View Profile");
  const viewAll = getDictValue(lawfirm, "viewAll", "View All Attorneys");

  const attorneys = getAttorneysData(dict);

  const filters = [
    { key: "all", label: filterAll },
    { key: "Criminal Defense", label: filterCriminal },
    { key: "Family Law", label: filterFamily },
    { key: "Personal Injury", label: filterPersonal },
    { key: "Corporate Law", label: filterCorporate },
    { key: "Immigration", label: filterImmigration },
    { key: "Real Estate", label: filterRealEstate },
  ];

  const filteredAttorneys = activeFilter === "all"
    ? attorneys
    : attorneys.filter((attorney) => attorney.specializations.includes(activeFilter));

  const getSpecializationIcon = (spec: string) => {
    switch (spec) {
      case "Criminal Defense": return Shield;
      case "Family Law": return Heart;
      case "Personal Injury": return Car;
      case "Corporate Law": return Building;
      case "Immigration": return Users;
      case "Real Estate": return Home;
      default: return Shield;
    }
  };

  return (
    <section className="py-20 bg-white">
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

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Attorneys Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAttorneys.map((attorney, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
            >
              {/* Avatar Placeholder */}
              <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="w-24 h-24 bg-slate-300 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-500">
                    {attorney.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {attorney.name}
                </h3>
                <p className="text-amber-600 font-medium mb-3">
                  {attorney.title}
                </p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {attorney.specializations.slice(0, 2).map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                  {attorney.specializations.length > 2 && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      +{attorney.specializations.length - 2}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {attorney.bio}
                </p>

                {/* Admissions */}
                <div className="text-xs text-slate-500 mb-4">
                  <span className="font-medium">{admissions}</span> {attorney.admissions.join(", ")}
                </div>

                {/* View Profile Link */}
                <Link
                  href={`/law-firm/attorneys/${attorney.name.toLowerCase().replace(" ", "-")}`}
                  className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700"
                >
                  {viewProfile}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/law-firm/attorneys"
            className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            {viewAll}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
