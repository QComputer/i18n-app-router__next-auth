"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Scale, Menu, X, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  locale: string;
  dictionary: {
    navigation: {
      practiceAreas: string;
      attorneys: string;
      about: string;
      contact: string;
    };
    cta: {
      freeConsultation: string;
    };
  };
}

const practiceAreas = [
  { name: "Criminal Defense", href: "/law-firm/criminal-defense" },
  { name: "Family Law", href: "/law-firm/family-law" },
  { name: "Personal Injury", href: "/law-firm/personal-injury" },
  { name: "Corporate Law", href: "/law-firm/corporate-law" },
  { name: "Immigration", href: "/law-firm/immigration" },
  { name: "Real Estate", href: "/law-firm/real-estate" },
  { name: "Estate Planning", href: "/law-firm/estate-planning" },
  { name: "Bankruptcy", href: "/law-firm/bankruptcy" },
  { name: "Intellectual Property", href: "/law-firm/ip" },
];

const attorneys = [
  { name: "John Mitchell", href: "/law-firm/attorneys/john-mitchell" },
  { name: "Sarah Chen", href: "/law-firm/attorneys/sarah-chen" },
  { name: "Michael Rodriguez", href: "/law-firm/attorneys/michael-rodriguez" },
  { name: "Emily Thompson", href: "/law-firm/attorneys/emily-thompson" },
];

export function Header({ locale, dictionary }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const isRTL = locale === "ar" || locale === "fa";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/law-firm" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-slate-900">
                Justice Law
              </span>
              <span className="block text-xs text-slate-500 tracking-wider">
                & ASSOCIATES
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Practice Areas Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("practice")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                <span>{dictionary.navigation.practiceAreas}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "practice" && (
                <div className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {practiceAreas.map((area) => (
                    <Link
                      key={area.name}
                      href={area.href}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Attorneys Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("attorneys")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium transition-colors">
                <span>{dictionary.navigation.attorneys}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "attorneys" && (
                <div className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-200">
                  {attorneys.map((attorney) => (
                    <Link
                      key={attorney.name}
                      href={attorney.href}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      {attorney.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/law-firm#about"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              {dictionary.navigation.about}
            </Link>

            <Link
              href="/law-firm#contact"
              className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              {dictionary.navigation.contact}
            </Link>
          </nav>

          {/* CTA Button & Phone */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">1-800-JUSTICE</span>
            </div>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">
              {dictionary.cta.freeConsultation}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Practice Areas */}
            <div className="space-y-2">
              <button
                className="flex items-center justify-between w-full text-left text-slate-700 font-medium"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "practice-mobile" ? null : "practice-mobile"
                  )
                }
              >
                <span>{dictionary.navigation.practiceAreas}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    activeDropdown === "practice-mobile" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "practice-mobile" && (
                <div className="pl-4 space-y-2">
                  {practiceAreas.map((area) => (
                    <Link
                      key={area.name}
                      href={area.href}
                      className="block text-sm text-slate-600 hover:text-slate-900"
                    >
                      {area.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Attorneys */}
            <div className="space-y-2">
              <button
                className="flex items-center justify-between w-full text-left text-slate-700 font-medium"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "attorneys-mobile" ? null : "attorneys-mobile"
                  )
                }
              >
                <span>{dictionary.navigation.attorneys}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    activeDropdown === "attorneys-mobile" && "rotate-180"
                  )}
                />
              </button>
              {activeDropdown === "attorneys-mobile" && (
                <div className="pl-4 space-y-2">
                  {attorneys.map((attorney) => (
                    <Link
                      key={attorney.name}
                      href={attorney.href}
                      className="block text-sm text-slate-600 hover:text-slate-900"
                    >
                      {attorney.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/law-firm#about"
              className="block text-slate-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.navigation.about}
            </Link>

            <Link
              href="/law-firm#contact"
              className="block text-slate-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.navigation.contact}
            </Link>

            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4">
              {dictionary.cta.freeConsultation}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
