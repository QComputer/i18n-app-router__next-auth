"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, Shield, Lock, AlertTriangle } from "lucide-react";

interface CaseResultsProps {
  locale: string;
}

const caseResults = [
  {
    id: 1,
    title: "$15M Settlement",
    category: "Personal Injury",
    description: "Multi-vehicle accident case resulting in spinal injuries. Achieved record settlement for our client.",
    amount: "$15,000,000",
    outcome: "Settlement",
  },
  {
    id: 2,
    title: "Acquittal on All Charges",
    category: "Criminal Defense",
    description: "Federal drug trafficking charges dismissed after successful motion challenging evidence.",
    amount: "N/A",
    outcome: "Not Guilty",
  },
  {
    id: 3,
    title: "$8.5M Medical Malpractice",
    category: "Personal Injury",
    description: "Surgical error resulting in permanent disability. Full compensation for future care.",
    amount: "$8,500,000",
    outcome: "Settlement",
  },
  {
    id: 4,
    title: "Custody Victory",
    category: "Family Law",
    description: "Successfully obtained full custody for parent facing false allegations.",
    amount: "N/A",
    outcome: "Custody Granted",
  },
  {
    id: 5,
    title: "$12M Product Liability",
    category: "Personal Injury",
    description: "Defective product caused severe injuries. Landmark verdict against manufacturer.",
    amount: "$12,000,000",
    outcome: "Verdict",
  },
  {
    id: 6,
    title: "Business Merger",
    category: "Corporate Law",
    description: "Facilitated $45M merger between tech companies with optimal terms for client.",
    amount: "$45,000,000",
    outcome: "Completed",
  },
];

export function LawFirmCaseResults({ locale }: CaseResultsProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const isRTL = locale === "ar" || locale === "fa";

  const categories = ["All", "Personal Injury", "Criminal Defense", "Family Law", "Corporate Law"];

  const filteredResults =
    activeCategory === "All"
      ? caseResults
      : caseResults.filter((result) => result.category === activeCategory);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Case Results
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Our track record speaks for itself. We've recovered billions for our clients
            and achieved countless victories in courtrooms across the country.
          </p>
        </div>

        {/* Confidentiality Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12 flex items-start space-x-4">
          <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">
              Confidentiality Notice
            </h4>
            <p className="text-sm text-amber-700">
              Due to attorney-client privilege and non-disclosure agreements, many of our
              case results cannot be publicly disclosed. The results shown here represent
              a fraction of our successful outcomes. Contact us for more information about
              your specific case.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900">$500M+</div>
            <div className="text-sm text-slate-600">Recovered</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900">98%</div>
            <div className="text-sm text-slate-600">Success Rate</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900">2,500+</div>
            <div className="text-sm text-slate-600">Cases Won</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-6 text-center">
            <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-slate-900">100%</div>
            <div className="text-sm text-slate-600">Confidential</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Case Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-slate-100"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium">
                  {result.category}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  result.outcome === "Not Guilty" || result.outcome === "Custody Granted"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {result.outcome}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {result.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6">{result.description}</p>

              {/* Amount */}
              {result.amount !== "N/A" && (
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {result.amount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Every case is unique. Your result may be different.
          </p>
          <Link
            href="/law-firm/contact"
            className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            Get Your Free Case Evaluation
          </Link>
        </div>
      </div>
    </section>
  );
}
