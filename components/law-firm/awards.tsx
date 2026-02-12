"use client";

import { Shield, Star, Award, TrendingUp } from "lucide-react";

interface AwardsProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultAwards = [
  { name: "Avvo Superb Rating", description: "Highest rating possible on Avvo", icon: "⭐" },
  { name: "Martindale-Hubbell AV Preeminent", description: "Highest peer review rating", icon: "🏆" },
  { name: "Super Lawyers Selection", description: "Recognized as Super Lawyer", icon: "🌟" },
  { name: "Best Lawyers Award", description: "Named in Best Lawyers", icon: "⚖️" },
  { name: "Million Dollar Advocates", description: "Membership in elite group", icon: "💰" },
  { name: "Top 100 Trial Lawyers", description: "National Trial Lawyers Association", icon: "🎯" },
];

const defaultBarAdmissions = [
  "Supreme Court of the United States",
  "Federal Court of Appeals",
  "Federal District Court",
  "State Bar Association",
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

// Safely get awards array from dictionary
function getAwardsData(
  dict: Record<string, unknown> | undefined
): typeof defaultAwards {
  if (!dict) return defaultAwards;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.awards)) {
    return (lawfirmData.awards as Array<{
      name?: string;
      description?: string;
      icon?: string;
    }>).map((award, index) => ({
      ...defaultAwards[index],
      name: award.name || defaultAwards[index]?.name,
      description: award.description || defaultAwards[index]?.description,
      icon: award.icon || defaultAwards[index]?.icon,
    }));
  }
  
  return defaultAwards;
}

// Safely get bar admissions array from dictionary
function getBarAdmissionsData(
  dict: Record<string, unknown> | undefined
): string[] {
  if (!dict) return defaultBarAdmissions;
  
  const lawfirmData = dict.lawfirmData as Record<string, unknown> | undefined;
  if (lawfirmData && Array.isArray(lawfirmData.barAdmissions)) {
    return lawfirmData.barAdmissions as string[];
  }
  
  return defaultBarAdmissions;
}

export function LawFirmAwards({ locale, dictionary }: AwardsProps) {
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirm = dict.lawfirm as Record<string, unknown> | undefined;

  const title = getDictValue(lawfirm, "title", "Awards & Recognition");
  const subtitle = getDictValue(lawfirm, "subtitle", "Our commitment to excellence has been recognized by leading legal organizations and peer review services across the country.");
  const barAdmissionsTitle = getDictValue(lawfirm, "barAdmissions", "Bar Admissions");
  const barAdmissionsDesc = getDictValue(lawfirm, "barDescription", "Our attorneys are admitted to practice in the following courts:");
  const clientRatingsTitle = getDictValue(lawfirm, "clientRatings", "Client Ratings");
  const avvoRating = getDictValue(lawfirm, "avvoRating", "Avvo Rating");
  const martindale = getDictValue(lawfirm, "martindale", "Martindale-Hubbell");
  const superLawyers = getDictValue(lawfirm, "superLawyers", "Super Lawyers");
  const learnMore = getDictValue(lawfirm, "learnMore", "Learn More About Our Firm");

  const awards = getAwardsData(dict);
  const barAdmissions = getBarAdmissionsData(dict);

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

        {/* Awards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {awards.map((award, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-2xl">
                  {award.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">{award.name}</h3>
                  <p className="text-slate-400 text-sm">{award.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar Admissions */}
        <div className="bg-white/5 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{barAdmissionsTitle}</h3>
            <p className="text-slate-400">{barAdmissionsDesc}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {barAdmissions.map((admission, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg"
              >
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-white text-sm">{admission}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Ratings */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-8">{clientRatingsTitle}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-6 border border-amber-500/30">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-white font-bold text-lg">{avvoRating}</p>
              <p className="text-slate-400 text-sm">10/10 Rating</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-6 border border-blue-500/30">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-white font-bold text-lg">{martindale}</p>
              <p className="text-slate-400 text-sm">AV Preeminent</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
              <div className="text-4xl mb-2">🌟</div>
              <p className="text-white font-bold text-lg">{superLawyers}</p>
              <p className="text-slate-400 text-sm">Rising Star</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center bg-amber-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
            {learnMore}
            <TrendingUp className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}
