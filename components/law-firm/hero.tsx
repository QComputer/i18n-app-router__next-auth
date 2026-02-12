"use client";

import { ArrowRight, CheckCircle2, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  locale: string;
  tagline: string;
  primaryHeadline: string;
  secondaryHeadline: string;
  primaryCTAText: string;
}

export function LawFirmHero({
  locale,
  tagline,
  primaryHeadline,
  secondaryHeadline,
  primaryCTAText,
}: HeroProps) {
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%)]" style={{ backgroundSize: "60px 60px" }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className={`text-center lg:text-${isRTL ? "right" : "left"}`}>
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-400 font-medium tracking-wide">
                {tagline}
              </span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {primaryHeadline}
            </h1>

            {/* Secondary Headline */}
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {secondaryHeadline}
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-10">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">25+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">24/7 Emergency Line</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-300">$500M+ Recovered</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-6 text-lg w-full sm:w-auto"
              >
                {primaryCTAText}
                <ArrowRight className={`w-5 h-5 mr-2 ${isRTL ? "rotate-180" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg w-full sm:w-auto"
              >
                View Our Results
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="hidden lg:block">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400 mb-2">10K+</div>
                  <div className="text-slate-400">Cases Won</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400 mb-2">98%</div>
                  <div className="text-slate-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400 mb-2">50+</div>
                  <div className="text-slate-400">Attorneys</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-400 mb-2">15</div>
                  <div className="text-slate-400">Offices</div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-center text-slate-400 text-sm">
                  "Justice delayed is justice denied. We fight for you."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
