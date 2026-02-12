"use client";

import { useState } from "react";
import { DollarSign, Shield, Heart, Building, ArrowRight, CheckCircle } from "lucide-react";

interface CaseResultsProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultCaseResults = [
  {
    icon: DollarSign,
    title: "$8.5M Settlement",
    category: "Personal Injury",
    description: "Multi-vehicle accident resulting in catastrophic injuries. Settled before trial for maximum compensation.",
    amount: "$8,500,000",
    outcome: "Settlement",
    date: "2024",
  },
  {
    icon: Shield,
    title: "Complete Acquittal",
    category: "Criminal Defense",
    description: "Faced serious felony charges. Built strong defense strategy resulting in all charges being dismissed.",
    amount: "N/A",
    outcome: "Not Guilty",
    date: "2024",
  },
  {
    icon: DollarSign,
    title: "$3.2M Medical Malpractice",
    category: "Personal Injury",
    description: "Surgical error case resulting in permanent disability. Thorough investigation led to substantial recovery.",
    amount: "$3,200,000",
    outcome: "Settlement",
    date: "2023",
  },
  {
    icon: Heart,
    title: "Full Custody Granted",
    category: "Family Law",
    description: "Complex custody battle with interstate complications. Achieved primary custody for our client.",
    amount: "N/A",
    outcome: "Custody",
    date: "2023",
  },
  {
    icon: DollarSign,
    title: "$12M Product Liability",
    category: "Personal Injury",
    description: "Defective product caused severe injuries. Landmark case against major manufacturer.",
    amount: "$12,000,000",
    outcome: "Verdict",
    date: "2023",
  },
  {
    icon: Building,
    title: "Business Merger Success",
    category: "Corporate Law",
    description: "Guided $50M merger between technology companies. All regulatory approvals obtained.",
    amount: "N/A",
    outcome: "Completed",
    date: "2023",
  },
  {
    icon: DollarSign,
    title: "$4.5M Construction Accident",
    category: "Personal Injury",
    description: "Severe injuries at construction site. Aggressive negotiation with insurance carriers.",
    amount: "$4,500,000",
    outcome: "Settlement",
    date: "2023",
  },
  {
    icon: Shield,
    title: "Drug Charges Dismissed",
    category: "Criminal Defense",
    description: "Wrongful possession charges. Evidence suppression led to complete dismissal.",
    amount: "N/A",
    outcome: "Not Guilty",
    date: "2022",
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

// Safely get case results array from dictionary
function getCaseResultsData(
  dict: Record<string, unknown> | undefined
): typeof defaultCaseResults {
  if (!dict) return defaultCaseResults;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.caseResults)) {
    return (lawfirmData.caseResults as Array<{
      title?: string;
      category?: string;
      description?: string;
      amount?: string;
      outcome?: string;
      date?: string;
    }>).map((result, index) => ({
      ...defaultCaseResults[index],
      title: result.title || defaultCaseResults[index]?.title,
      category: result.category || defaultCaseResults[index]?.category,
      description: result.description || defaultCaseResults[index]?.description,
      amount: result.amount || defaultCaseResults[index]?.amount,
      outcome: result.outcome || defaultCaseResults[index]?.outcome,
      date: result.date || defaultCaseResults[index]?.date,
      icon: defaultCaseResults[index]?.icon,
    }));
  }
  
  return defaultCaseResults;
}

export function LawFirmCaseResults({ locale, dictionary }: CaseResultsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;

  const title = getDictValue(lawfirm, "title", "Case Results");
  const subtitle = getDictValue(lawfirm, "subtitle", "Our track record speaks for itself. We have recovered millions for our clients and achieved countless victories in courtrooms across the country.");
  const confidentialTitle = getDictValue(lawfirm, "confidential.title", "Confidentiality Notice");
  const confidentialDesc = getDictValue(lawfirm, "confidential.description", "Due to attorney-client privilege and non-disclosure agreements, many of our case results cannot be publicly disclosed. The results shown represent a small fraction of our successful outcomes.");
  const recovered = getDictValue(lawfirm, "stats.recovered", "Recovered");
  const successRate = getDictValue(lawfirm, "stats.successRate", "Success Rate");
  const casesWon = getDictValue(lawfirm, "stats.casesWon", "Cases Won");
  const confidential = getDictValue(lawfirm, "stats.confidentialPercent", "Confidential");
  const filterAll = getDictValue(lawfirm, "filterAll", "All");
  const filterPersonal = getDictValue(lawfirm, "filterPersonal", "Personal Injury");
  const filterCriminal = getDictValue(lawfirm, "filterCriminal", "Criminal Defense");
  const filterFamily = getDictValue(lawfirm, "filterFamily", "Family Law");
  const filterCorporate = getDictValue(lawfirm, "filterCorporate", "Corporate Law");
  const uniqueResult = getDictValue(lawfirm, "uniqueResult", "Every case is unique. Your result may differ.");
  const cta = getDictValue(lawfirm, "cta", "Get Free Case Evaluation");

  const caseResults = getCaseResultsData(dict);

  const filters = [
    { key: "all", label: filterAll },
    { key: "Personal Injury", label: filterPersonal },
    { key: "Criminal Defense", label: filterCriminal },
    { key: "Family Law", label: filterFamily },
    { key: "Corporate Law", label: filterCorporate },
  ];

  const filteredResults = activeFilter === "all"
    ? caseResults
    : caseResults.filter((result) => result.category === activeFilter);

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

        {/* Confidentiality Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 mb-2">{confidentialTitle}</h3>
              <p className="text-amber-700">{confidentialDesc}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <DollarSign className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-slate-900 mb-1">$500M+</p>
            <p className="text-slate-600 text-sm">{recovered}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <Shield className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-slate-900 mb-1">98%</p>
            <p className="text-slate-600 text-sm">{successRate}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <CheckCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-slate-900 mb-1">2,500+</p>
            <p className="text-slate-600 text-sm">{casesWon}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <Shield className="w-10 h-10 text-purple-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-slate-900 mb-1">85%</p>
            <p className="text-slate-600 text-sm">{confidential}</p>
          </div>
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
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Case Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredResults.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <result.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{result.title}</h3>
                    <p className="text-sm text-slate-500">{result.category}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.outcome === "Settlement" ? "bg-green-100 text-green-700" :
                  result.outcome === "Not Guilty" ? "bg-blue-100 text-blue-700" :
                  result.outcome === "Custody" ? "bg-purple-100 text-purple-700" :
                  "bg-slate-100 text-slate-700"
                }`}>
                  {result.outcome}
                </span>
              </div>

              <p className="text-slate-600 mb-4">{result.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  {result.amount !== "N/A" && (
                    <p className="text-2xl font-bold text-green-600">{result.amount}</p>
                  )}
                  <p className="text-sm text-slate-500">{result.date}</p>
                </div>
                <button className="text-amber-600 font-semibold hover:text-amber-700 flex items-center">
                  Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-slate-500 text-sm mt-8 italic">
          {uniqueResult}
        </p>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
            {cta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
