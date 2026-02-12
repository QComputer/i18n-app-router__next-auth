"use client";

import { CheckCircle2, Award, Users, Clock } from "lucide-react";

interface AboutProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultValues = [
  {
    icon: CheckCircle2,
    title: "Integrity",
    description: "We uphold the highest ethical standards in every case we handle.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for outstanding results and exceptional client service.",
  },
  {
    icon: Users,
    title: "Teamwork",
    description: "Our collaborative approach ensures comprehensive legal solutions.",
  },
  {
    icon: Clock,
    title: "Dedication",
    description: "We are committed to fighting for your rights around the clock.",
  },
];

// Helper to get nested value from dictionary
function getDictValue(dict: Record<string, unknown> | undefined, path: string, fallback: string): string {
  if (!dict) return fallback;
  const keys = path.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return fallback;
  }
  return value as string || fallback;
}

// Helper to get array from dictionary
function getDictArray<T>(dict: Record<string, unknown> | undefined, path: string, defaultValue: T[]): T[] {
  if (!dict) return defaultValue;
  const keys = path.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return defaultValue;
  }
  return value as T[];
}

export function LawFirmAbout({ locale, dictionary }: AboutProps) {
  const isRTL = locale === "ar" || locale === "fa";
  
  const dict = dictionary || {};
  
  // Get translations from lawfirm.about section
  const lawfirmDict = (dict.lawfirm || dict) as Record<string, unknown>;
  const aboutDict = (lawfirmDict.about || lawfirmDict) as Record<string, unknown>;
  
  // Get data from lawfirmData.about section
  const lawfirmDataDict = (dict.lawfirmData || dict.lawfirm || dict) as Record<string, unknown>;
  const aboutDataDict = (lawfirmDataDict.about || lawfirmDataDict) as Record<string, unknown>;

  const title = getDictValue(aboutDict, "title", "About Our Firm");
  const subtitle = getDictValue(aboutDict, "subtitle", "For over 25 years, Justice Law & Associates has been a trusted advocate for clients facing legal challenges. Our commitment to excellence and personalized attention has earned us a reputation as one of the premier law firms in the country.");
  const historyTitle = getDictValue(aboutDict, "historyTitle", "Our History");
  const history1 = getDictValue(aboutDict, "history1", "Founded in 1998 by John Mitchell, our firm began with a simple mission: to provide exceptional legal representation with integrity and compassion. What started as a small practice has grown into a multi-office firm with over 50 attorneys nationwide.");
  const history2 = getDictValue(aboutDict, "history2", "Throughout our history, we have handled thousands of cases across multiple practice areas, recovering billions of dollars for our clients and establishing precedents that have shaped legal landscapes.");
  const history3 = getDictValue(aboutDict, "history3", "Today, we continue to build on this legacy, combining traditional values with modern innovation to deliver the best possible outcomes for our clients.");
  const valuesTitle = getDictValue(aboutDict, "valuesTitle", "Our Core Values");
  const yearsExperience = getDictValue(aboutDict, "yearsExperience", "Years of Experience");
  const casesResolved = getDictValue(aboutDict, "casesResolved", "Cases Resolved");
  const yearsValue = getDictValue(aboutDataDict, "yearsValue", "25+");
  const casesValue = getDictValue(aboutDataDict, "casesValue", "10K+");

  interface ValueItem {
    title?: string;
    description?: string;
  }

  const valuesData = getDictArray<ValueItem>(aboutDataDict, "values", defaultValues.map(v => ({
    title: v.title,
    description: v.description,
  })));

  const values = valuesData.map((v, i) => ({
    ...defaultValues[i],
    title: v.title || defaultValues[i].title,
    description: v.description || defaultValues[i].description,
  }));

  return (
    <section id="about" className="py-20 bg-white">
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

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {historyTitle}
            </h3>
            <div className="space-y-4 text-slate-600">
              <p>{history1}</p>
              <p>{history2}</p>
              <p>{history3}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">{yearsValue}</div>
                <div className="text-sm text-slate-600">{yearsExperience}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">{casesValue}</div>
                <div className="text-sm text-slate-600">{casesResolved}</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              {valuesTitle}
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        {value.title}
                      </h4>
                      <p className="text-sm text-slate-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
