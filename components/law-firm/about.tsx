"use client";

import { CheckCircle2, Award, Users, Clock } from "lucide-react";

interface AboutProps {
  locale: string;
}

const values = [
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

export function LawFirmAbout({ locale }: AboutProps) {
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            About Our Firm
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            For over 25 years, Justice Law & Associates has been a trusted advocate
            for clients facing legal challenges. Our commitment to excellence and
            personalized attention has earned us a reputation as one of the premier
            law firms in the country.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Our History
            </h3>
            <div className="space-y-4 text-slate-600">
              <p>
                Founded in 1998 by John Mitchell, our firm began with a simple mission:
                to provide exceptional legal representation with integrity and compassion.
                What started as a small practice has grown into a multi-office firm with
                over 50 attorneys nationwide.
              </p>
              <p>
                Throughout our history, we have handled thousands of cases across
                multiple practice areas, recovering billions of dollars for our clients
                and establishing precedents that have shaped legal landscapes.
              </p>
              <p>
                Today, we continue to build on this legacy, combining traditional
                values with modern innovation to deliver the best possible outcomes
                for our clients.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">25+</div>
                <div className="text-sm text-slate-600">Years of Experience</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-amber-500 mb-1">10K+</div>
                <div className="text-sm text-slate-600">Cases Resolved</div>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Our Core Values
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
