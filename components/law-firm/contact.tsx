"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, AlertCircle, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactProps {
  locale: string;
}

export function LawFirmContact({ locale }: ContactProps) {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const isRTL = locale === "ar" || locale === "fa";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setFormStatus("success");
  };

  return (
    <section id="contact" className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Ready to discuss your case? Contact us today for a free, confidential consultation.
            We're available 24/7 for emergencies.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Phone */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Phone</h3>
                  <p className="text-slate-300 mb-2">Call us 24/7 for emergencies</p>
                  <a href="tel:1-800-JUSTICE" className="text-amber-400 font-bold text-xl">
                    1-800-JUSTICE
                  </a>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Email</h3>
                  <p className="text-slate-300 mb-1">General inquiries</p>
                  <a href="mailto:info@justicelaw.com" className="text-amber-400">
                    info@justicelaw.com
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Main Office</h3>
                  <p className="text-slate-300">
                    123 Justice Avenue, Suite 500
                    <br />
                    Los Angeles, CA 90001
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">Office Hours</h3>
                  <div className="space-y-1 text-slate-300">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                    <p className="text-amber-400">Sunday: Closed (Emergency calls accepted)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="bg-amber-500/20 rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    24/7 Emergency Line
                  </h3>
                  <p className="text-slate-300 mb-2">
                    For urgent legal matters outside business hours
                  </p>
                  <a href="tel:1-800-JUSTICE" className="text-amber-400 font-bold">
                    1-800-JUSTICE
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Send Us a Message
            </h3>

            {formStatus === "success" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Message Sent Successfully
                </h4>
                <p className="text-slate-600 mb-6">
                  Thank you for contacting us. We will review your message and get back
                  to you within 24 hours.
                </p>
                <Button onClick={() => setFormStatus("idle")}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" required placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" required placeholder="Doe" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" type="tel" required placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="practiceArea">Practice Area *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a practice area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criminal-defense">Criminal Defense</SelectItem>
                      <SelectItem value="family-law">Family Law</SelectItem>
                      <SelectItem value="personal-injury">Personal Injury</SelectItem>
                      <SelectItem value="corporate-law">Corporate Law</SelectItem>
                      <SelectItem value="immigration">Immigration</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    placeholder="Please describe your legal issue in detail..."
                    rows={5}
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="consent" className="text-sm text-slate-600">
                    I understand that submitting this form does not create an attorney-client
                    relationship and agree to the privacy policy.
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6"
                  disabled={formStatus === "submitting"}
                >
                  {formStatus === "submitting" ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
