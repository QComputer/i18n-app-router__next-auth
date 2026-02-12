"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Shield, ChevronDown } from "lucide-react";

interface ContactProps {
  locale: string;
  dictionary?: Record<string, unknown>;
}

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

// Helper to get nested object from dictionary
function getDictObject<T>(dict: Record<string, unknown> | undefined, path: string, defaultValue: T): T {
  if (!dict) return defaultValue;
  const keys = path.split(".");
  let value: unknown = dict;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return defaultValue;
  }
  return value as T;
}

export function LawFirmContact({ locale, dictionary }: ContactProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    practiceArea: "",
    message: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isRTL = locale === "ar" || locale === "fa";

  const dict = dictionary || {};
  const lawfirmDict = (dict.lawfirm || dict) as Record<string, unknown>;
  const lawfirmDataDict = (dict.lawfirmData || dict.lawfirm || dict) as Record<string, unknown>;
  const contactDict = (lawfirmDict.contact || lawfirmDict) as Record<string, unknown>;

  const title = getDictValue(contactDict, "title", "Contact Us");
  const subtitle = getDictValue(contactDict, "subtitle", "Ready to discuss your case? Contact us today for a free and confidential consultation. We are available 24/7 for emergencies.");

  const phoneDict = getDictObject<{title?: string; subtitle?: string; number?: string}>(lawfirmDataDict, "contact.phone", { title: "Phone", subtitle: "Call for emergencies 24/7", number: "021-1234-5678" });
  const emailDict = getDictObject<{title?: string; subtitle?: string; address?: string}>(lawfirmDataDict, "contact.email", { title: "Email", subtitle: "General inquiries", address: "info@justicelaw.ir" });
  const addressDict = getDictObject<{title?: string; fullAddress?: string}>(lawfirmDataDict, "contact.address", { title: "Main Office", fullAddress: "1234 Main Street, Suite 500, City, State 12345" });
  const hoursDict = getDictObject<{title?: string; weekday?: string; saturday?: string; sunday?: string}>(lawfirmDataDict, "contact.hours", { title: "Business Hours", weekday: "Mon-Thu: 8AM - 6PM", saturday: "Fri: 8AM - 1PM", sunday: "Sat: Closed" });
  const emergencyDict = getDictObject<{title?: string; subtitle?: string; cta?: string}>(lawfirmDataDict, "contact.emergency", { title: "24/7 Emergency Line", subtitle: "For urgent legal matters outside business hours", cta: "Call Now" });
  
  const formDict = getDictObject<{
    title?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    practiceArea?: string;
    message?: string;
    consent?: string;
    submit?: string;
    sending?: string;
    placeholders?: Record<string, string>;
  }>(lawfirmDataDict, "contact.form", {
    title: "Send a Message",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    practiceArea: "Practice Area",
    message: "Message",
    consent: "I understand that submitting this form does not create an attorney-client relationship and I agree to the privacy policy.",
    submit: "Send Message",
    sending: "Sending...",
    placeholders: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      practiceArea: "Select a practice area",
      message: "Please describe your legal matter in detail...",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{phoneDict.title}</h3>
                  <p className="text-sm text-slate-500">{phoneDict.subtitle}</p>
                  <p className="text-amber-600 font-semibold">{phoneDict.number}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{emailDict.title}</h3>
                  <p className="text-sm text-slate-500">{emailDict.subtitle}</p>
                  <p className="text-slate-700">{emailDict.address}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{addressDict.title}</h3>
                  <p className="text-sm text-slate-500">{addressDict.fullAddress}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{hoursDict.title}</h3>
                  <p className="text-sm text-slate-500">{hoursDict.weekday}</p>
                  <p className="text-sm text-slate-500">{hoursDict.saturday}</p>
                  <p className="text-sm text-slate-500">{hoursDict.sunday}</p>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800">{emergencyDict.title}</h3>
                  <p className="text-sm text-red-600">{emergencyDict.subtitle}</p>
                  <button className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                    {emergencyDict.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Message Sent Successfully!</h3>
                  <p className="text-slate-600 mb-8">
                    Thank you for contacting us. We will review your message and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">{formDict.title}</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {formDict.firstName}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={formDict.placeholders?.firstName}
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {formDict.lastName}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={formDict.placeholders?.lastName}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {formDict.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={formDict.placeholders?.email}
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {formDict.phone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder={formDict.placeholders?.phone}
                      />
                    </div>
                  </div>

                  {/* Practice Area */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {formDict.practiceArea}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.practiceArea}
                        onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">{formDict.placeholders?.practiceArea}</option>
                        <option value="criminal">Criminal Defense</option>
                        <option value="family">Family Law</option>
                        <option value="personal">Personal Injury</option>
                        <option value="corporate">Corporate Law</option>
                        <option value="immigration">Immigration</option>
                        <option value="realestate">Real Estate</option>
                        <option value="bankruptcy">Bankruptcy</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {formDict.message}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      placeholder={formDict.placeholders?.message}
                      required
                    />
                  </div>

                  {/* Consent */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                      required
                    />
                    <p className="text-sm text-slate-600">{formDict.consent}</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 text-white py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? formDict.sending : formDict.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
