"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Linkedin, Mail, Phone, Award } from "lucide-react";

interface AttorneysProps {
  locale: string;
}

const practiceAreas = [
  "All",
  "Criminal Defense",
  "Family Law",
  "Personal Injury",
  "Corporate Law",
  "Immigration",
  "Real Estate",
];

const attorneys = [
  {
    id: 1,
    name: "John Mitchell",
    title: "Founding Partner",
    practiceArea: "Criminal Defense",
    image: "/images/attorney-john-mitchell.jpg",
    education: "J.D., Harvard Law School",
    admissions: ["Supreme Court", "Federal Circuit Courts", "State Bar of California"],
    bio: "Over 25 years of experience in criminal defense, with a 98% success rate in state and federal courts.",
  },
  {
    id: 2,
    name: "Sarah Chen",
    title: "Senior Partner",
    practiceArea: "Family Law",
    image: "/images/attorney-sarah-chen.jpg",
    education: "J.D., Yale Law School",
    admissions: ["State Bar of New York", "State Bar of California", "American Academy of Matrimonial Lawyers"],
    bio: "Board-certified family law specialist handling high-net-worth divorces and complex custody cases.",
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    title: "Partner",
    practiceArea: "Personal Injury",
    image: "/images/attorney-michael-rodriguez.jpg",
    education: "J.D., Stanford Law School",
    admissions: ["State Bar of California", "State Bar of Texas", "Federal Courts"],
    bio: "Has recovered over $200 million for injury victims through strategic negotiation and litigation.",
  },
  {
    id: 4,
    name: "Emily Thompson",
    title: "Associate Attorney",
    practiceArea: "Corporate Law",
    image: "/images/attorney-emily-thompson.jpg",
    education: "J.D., Columbia Law School",
    admissions: ["State Bar of New York", "SEC Compliance"],
    bio: "Specializes in corporate transactions, securities law, and mergers & acquisitions.",
  },
  {
    id: 5,
    name: "David Park",
    title: "Senior Counsel",
    practiceArea: "Immigration",
    image: "/images/attorney-david-park.jpg",
    education: "J.D., Georgetown Law",
    admissions: ["State Bar of Virginia", "Board of Immigration Appeals"],
    bio: "Expert in business immigration, naturalization, and deportation defense.",
  },
  {
    id: 6,
    name: "Jennifer Williams",
    title: "Partner",
    practiceArea: "Real Estate",
    image: "/images/attorney-jennifer-williams.jpg",
    education: "J.D., University of Southern California",
    admissions: ["State Bar of California", "Real Property Section"],
    bio: "Handles commercial and residential real estate transactions and disputes.",
  },
];

export function LawFirmAttorneys({ locale }: AttorneysProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const isRTL = locale === "ar" || locale === "fa";

  const filteredAttorneys =
    activeFilter === "All"
      ? attorneys
      : attorneys.filter((attorney) => attorney.practiceArea === activeFilter);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Our Attorneys
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Meet our team of experienced attorneys dedicated to fighting for your rights
            and achieving the best possible outcomes for your case.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {practiceAreas.map((area) => (
            <button
              key={area}
              onClick={() => setActiveFilter(area)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeFilter === area
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Attorneys Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAttorneys.map((attorney) => (
            <div
              key={attorney.id}
              className="bg-slate-50 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <div className="w-24 h-24 bg-slate-400 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-600">
                    {attorney.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {attorney.name}
                    </h3>
                    <p className="text-amber-600 font-medium">{attorney.title}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                    {attorney.practiceArea}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-slate-600 text-sm mb-4">{attorney.bio}</p>

                {/* Education */}
                <div className="flex items-start space-x-2 mb-3">
                  <Award className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{attorney.education}</span>
                </div>

                {/* Admissions */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Admissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {attorney.admissions.slice(0, 2).map((adm, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded"
                      >
                        {adm}
                      </span>
                    ))}
                    {attorney.admissions.length > 2 && (
                      <span className="text-xs text-slate-500">
                        +{attorney.admissions.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center space-x-4 pt-4 border-t border-slate-200">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button className="text-slate-400 hover:text-amber-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="text-slate-400 hover:text-green-600 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <div className="flex-1" />
                  <Link
                    href={`/law-firm/attorneys/${attorney.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-amber-600 font-semibold hover:text-amber-700"
                  >
                    View Profile
                    <Star className="w-4 h-4 ml-1 inline" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/law-firm/attorneys"
            className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            View All Attorneys
            <Star className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
