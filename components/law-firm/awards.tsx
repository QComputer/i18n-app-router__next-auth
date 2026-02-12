"use client";

import Link from "next/link";
import { Award, Star, BadgeCheck } from "lucide-react";

interface AwardsProps {
  locale: string;
}

const awards = [
  {
    name: "Super Lawyers",
    year: "2024",
    description: "Top 100 Attorneys in the Nation",
    category: "Recognition",
  },
  {
    name: "Martindale-Hubbell",
    year: "2024",
    description: "AV Preeminent Rating (Highest Possible)",
    category: "Rating",
  },
  {
    name: "Best Lawyers",
    year: "2024",
    description: "Lawyer of the Year in Criminal Defense",
    category: "Award",
  },
  {
    name: "National Trial Lawyers",
    year: "2023",
    description: "Top 100 Trial Lawyers",
    category: "Recognition",
  },
  {
    name: "Avvo",
    year: "2024",
    description: "Superb Rating (10.0/10.0)",
    category: "Rating",
  },
  {
    name: "American Bar Association",
    year: "2024",
    description: "Certified in Multiple Practice Areas",
    category: "Certification",
  },
];

const barAdmissions = [
  "Supreme Court of the United States",
  "Federal Circuit Courts",
  "California State Bar",
  "New York State Bar",
  "Texas State Bar",
  "Florida State Bar",
];

export function LawFirmAwards({ locale }: AwardsProps) {
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Awards & Recognitions
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Our commitment to excellence has been recognized by leading legal organizations
            and peer review services across the country.
          </p>
        </div>

        {/* Awards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {awards.map((award, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-slate-100"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {award.name}
              </h3>
              <p className="text-amber-600 font-semibold mb-3">{award.year}</p>
              <p className="text-slate-600">{award.description}</p>
              <span className="inline-block mt-4 bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
                {award.category}
              </span>
            </div>
          ))}
        </div>

        {/* Certifications & Ratings */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Certifications */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <BadgeCheck className="w-8 h-8 text-amber-600" />
              <h3 className="text-2xl font-bold text-slate-900">
                Bar Admissions
              </h3>
            </div>
            <p className="text-slate-600 mb-6">
              Our attorneys are admitted to practice in the following courts:
            </p>
            <ul className="space-y-3">
              {barAdmissions.map((admission, idx) => (
                <li key={idx} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-slate-700">{admission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Star className="w-8 h-8 text-amber-600" />
              <h3 className="text-2xl font-bold text-slate-900">
                Client Ratings
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">Avvo Rating</span>
                  <span className="text-amber-600 font-bold">10.0/10</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 bg-amber-500 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">Martindale-Hubbell</span>
                  <span className="text-amber-600 font-bold">AV Preeminent</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 bg-amber-500 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">Super Lawyers</span>
                  <span className="text-amber-600 font-bold">Top 100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div
                    className="h-2 bg-amber-500 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/law-firm/about"
            className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Learn More About Our Firm
            <Star className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
