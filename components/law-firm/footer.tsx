"use client";

import Link from "next/link";
import { Scale, Phone, Mail, MapPin, Clock, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

interface FooterProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

// Default English values
const defaultPracticeAreas = [
  { name: "Criminal Defense", href: "/law-firm/criminal-defense" },
  { name: "Family Law", href: "/law-firm/family-law" },
  { name: "Personal Injury", href: "/law-firm/personal-injury" },
  { name: "Corporate Law", href: "/law-firm/corporate-law" },
  { name: "Immigration", href: "/law-firm/immigration" },
  { name: "Real Estate", href: "/law-firm/real-estate" },
];

const defaultQuickLinks = [
  { name: "About Us", href: "/law-firm/about" },
  { name: "Attorneys", href: "/law-firm/attorneys" },
  { name: "Practice Areas", href: "/law-firm/practice-areas" },
  { name: "Case Results", href: "/law-firm/case-results" },
  { name: "Awards", href: "/law-firm/awards" },
  { name: "FAQ", href: "/law-firm/faq" },
  { name: "Contact", href: "/law-firm/contact" },
  { name: "Privacy Policy", href: "/law-firm/privacy" },
  { name: "Terms of Service", href: "/law-firm/terms" },
];

const defaultLocations = [
  { name: "Los Angeles", address: "123 Justice Avenue, Suite 500, Los Angeles, CA 90001" },
  { name: "San Francisco", address: "456 Legal Street, Suite 200, San Francisco, CA 94102" },
  { name: "San Diego", address: "789 Rights Blvd, Suite 300, San Diego, CA 92101" },
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

export function LawFirmFooter({ locale, dictionary }: FooterProps) {
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirmDict = (dict.lawfirm || dict) as Record<string, unknown>;
  const lawfirmDataDict = (dict.lawfirmData || dict.lawfirm || dict) as Record<string, unknown>;
  const footerDict = (lawfirmDict.footer || lawfirmDict) as Record<string, unknown>;

  const tagline = getDictValue(footerDict, "tagline", "Providing exceptional legal representation with integrity and dedication since 1998. Your rights, our mission.");
  const practiceAreas = getDictValue(footerDict, "practiceAreas", "Practice Areas");
  const quickLinks = getDictValue(footerDict, "quickLinks", "Quick Links");
  const contactUs = getDictValue(footerDict, "contactUs", "Contact Us");
  const phoneLabel = getDictValue(footerDict, "phoneLabel", "24/7 Emergency Line");
  const emailLabel = getDictValue(footerDict, "emailLabel", "General Inquiries");
  const addressLabel = getDictValue(footerDict, "addressLabel", "Los Angeles Office");
  const weekdayHours = getDictValue(footerDict, "weekdayHours", "Mon-Fri: 8AM - 6PM");
  const saturdayHours = getDictValue(footerDict, "saturdayHours", "Sat: 9AM - 1PM");
  const offices = getDictValue(footerDict, "offices", "Our Offices");
  const copyright = getDictValue(footerDict, "copyright", "All rights reserved.");
  const privacy = getDictValue(footerDict, "privacy", "Privacy Policy");
  const terms = getDictValue(footerDict, "terms", "Terms of Service");
  const disclaimerTitle = getDictValue(footerDict, "disclaimerTitle", "Disclaimer");
  const disclaimerText = getDictValue(footerDict, "disclaimerText", "Disclaimer: The information on this website is for general information purposes only. Nothing on this site should be taken as legal advice for any individual case or situation. This information is not intended to create, and receipt or viewing does not constitute, an attorney-client relationship.");

  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/law-firm" className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-500 rounded-lg">
                <Scale className="w-7 h-7 text-slate-900" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Justice Law</span>
                <span className="block text-xs text-slate-500 tracking-wider">
                  & ASSOCIATES
                </span>
              </div>
            </Link>
            <p className="text-slate-400 mb-6">
              {tagline}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{practiceAreas}</h3>
            <ul className="space-y-3">
              {defaultPracticeAreas.map((area) => (
                <li key={area.name}>
                  <Link
                    href={area.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{quickLinks}</h3>
            <ul className="space-y-3">
              {defaultQuickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">{contactUs}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">1-800-JUSTICE</p>
                  <p className="text-sm text-slate-500">{phoneLabel}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white">info@justicelaw.com</p>
                  <p className="text-sm text-slate-500">{emailLabel}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white">{addressLabel}</p>
                  <p className="text-sm text-slate-500">123 Justice Avenue, Suite 500</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white">{weekdayHours}</p>
                  <p className="text-sm text-slate-500">{saturdayHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="border-t border-white/10 mt-12 pt-12">
          <h3 className="text-white font-semibold text-lg mb-6">{offices}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {defaultLocations.map((location) => (
              <div key={location.name} className="bg-white/5 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2">{location.name}</h4>
                <p className="text-sm text-slate-400">{location.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Justice Law & Associates. {copyright}
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/law-firm/privacy" className="text-slate-500 hover:text-white transition-colors">
                {privacy}
              </Link>
              <Link href="/law-firm/terms" className="text-slate-500 hover:text-white transition-colors">
                {terms}
              </Link>
              <Link href="/law-firm/disclaimer" className="text-slate-500 hover:text-white transition-colors">
                {disclaimerTitle}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-slate-500 text-center">
            {disclaimerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
