"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const COMPANY_SIZES = [
  { value: "", label: "Please select" },
  { value: "1-50", label: "1–50" },
  { value: "51-250", label: "51–250" },
  { value: "251-500", label: "251–500" },
  { value: "501-1000", label: "501–1,000" },
  { value: "1001-5000", label: "1,001–5,000" },
  { value: "5001-10000", label: "5,001–10,000" },
  { value: "10001+", label: "10,001+" },
];

const INTERESTS = [
  { value: "", label: "Select one from the dropdown options below" },
  { value: "enterprise", label: "Surbee Enterprise" },
  { value: "api", label: "API for Enterprise" },
  { value: "custom", label: "Custom Integrations" },
  { value: "volume", label: "Volume Pricing" },
  { value: "whitelabel", label: "White-label Solution" },
];

export default function ContactSalesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companySize: "",
    companyName: "",
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    interest: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 relative"
        style={{
          fontFamily: '"Opening Hours Sans", "Inter", sans-serif',
        }}
      >
        {/* Background gradient - sky effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(147, 197, 253, 0.5) 15%, rgba(59, 130, 246, 0.3) 30%, rgba(30, 58, 138, 0.4) 50%, rgba(15, 23, 42, 0.8) 70%, rgb(19, 19, 20) 100%)",
            zIndex: 0,
          }}
        />
        {/* Overlay gradient - dark from bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgb(19, 19, 20) 0%, rgb(19, 19, 20) 30%, transparent 70%)",
            zIndex: 1,
          }}
        />
        <div className="max-w-lg w-full text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-3" style={{ color: "var(--surbee-fg-primary)" }}>
            Thank you for reaching out!
          </h1>
          <p className="mb-8" style={{ color: "var(--surbee-fg-secondary)" }}>
            Our sales team will get back to you within 24 hours.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="h-11 px-6 rounded-full text-sm font-semibold transition-all"
            style={{
              backgroundColor: "var(--surbee-fg-primary, #E8E8E8)",
              color: "var(--surbee-bg-primary, rgb(19, 19, 20))"
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const inputStyles = {
    backgroundColor: "transparent",
    color: "var(--surbee-fg-primary)",
    border: "1px solid rgba(232, 232, 232, 0.15)",
  };

  const labelStyles = {
    color: "var(--surbee-fg-primary)",
    fontSize: "14px",
    fontWeight: 600,
  };

  return (
    <div
      className="min-h-screen overflow-auto pb-32 relative"
      style={{
        fontFamily: '"Opening Hours Sans", "Inter", sans-serif',
        fontSize: "16px",
        lineHeight: "24px",
      }}
    >
      {/* Background gradient - sky effect: white → light blue → dark blue → black */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(147, 197, 253, 0.5) 15%, rgba(59, 130, 246, 0.3) 30%, rgba(30, 58, 138, 0.4) 50%, rgba(15, 23, 42, 0.8) 70%, rgb(19, 19, 20) 100%)",
          zIndex: 0,
          minHeight: "100%",
        }}
      />
      {/* Overlay gradient - dark from bottom to transparent at top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgb(19, 19, 20) 0%, rgb(19, 19, 20) 30%, transparent 70%)",
          zIndex: 1,
          minHeight: "100%",
        }}
      />
      {/* Close Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 right-6 z-20 flex justify-center items-center transition-all duration-200 cursor-pointer rounded-full w-9 h-9 hover:bg-white/20"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "var(--surbee-fg-primary)" }}
        aria-label="Close"
      >
        <svg height="20" width="20" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.499 23.624A1.1 1.1 0 0 1 8.4 22.512c0-.295.108-.576.322-.777l5.71-5.723-5.71-5.71a1.07 1.07 0 0 1-.322-.777c0-.63.483-1.098 1.099-1.098.308 0 .549.107.763.308l5.737 5.724 5.763-5.737c.228-.228.469-.322.763-.322.616 0 1.112.483 1.112 1.099 0 .308-.094.549-.335.79l-5.723 5.723 5.71 5.71c.227.2.335.482.335.79 0 .616-.496 1.112-1.125 1.112a1.06 1.06 0 0 1-.79-.322l-5.71-5.723-5.697 5.723a1.1 1.1 0 0 1-.803.322" fill="currentColor" />
        </svg>
      </button>

      <div className="mx-auto max-w-screen-2xl md:grid md:grid-cols-12 md:gap-x-6 md:px-8 relative z-10">
        {/* Left Column - Info */}
        <section className="md:col-span-4 md:col-start-2 mt-10 sm:mt-20">
          <div className="w-full max-md:max-w-[calc(100%-3rem)] max-md:mx-auto flex flex-col gap-5 items-start">
            <h1
              className="text-4xl md:text-5xl font-medium max-w-[600px] text-balance"
              style={{ color: "var(--surbee-fg-primary)" }}
            >
              Contact our sales team
            </h1>
            <p style={{ color: "var(--surbee-fg-primary)", fontSize: "16px" }}>
              Get started today with Surbee Enterprise
            </p>
            <p style={{ color: "var(--surbee-fg-secondary)", fontSize: "16px" }}>
              The survey platform you know—built for work. Empower your teams with secure AI you can trust.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-8 sm:mt-12 max-md:max-w-[calc(100%-3rem)] max-md:mx-auto">
            <h2
              className="text-sm font-normal mb-3"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              Features
            </h2>
            <ul className="space-y-3">
              {[
                "No training on your data",
                "Unlimited surveys & responses",
                "Easy member, role, and billing management",
                "Integrations with your tools",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2" style={{ color: "var(--surbee-fg-primary)", fontSize: "16px" }}>
                  <svg height="20" width="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right Column - Form */}
        <section className="md:col-span-5 md:col-start-7 md:row-span-12 mt-8 sm:mt-12">
          <div className="max-md:max-w-[calc(100%-3rem)] max-md:mx-auto">
            <div
              className="rounded-2xl px-6 py-6"
              style={{
                backgroundColor: "rgba(232, 232, 232, 0.02)",
              }}
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                {/* Company Size */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>Company size *</div>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-full text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size.value} value={size.value} disabled={size.value === ""}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Company Name */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>Company name *</div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                    className="w-full h-11 px-4 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* First Name */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>First name *</div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    className="w-full h-11 px-4 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* Last Name */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>Last name *</div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    className="w-full h-11 px-4 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* Work Email */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>Work email *</div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full h-11 px-4 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* Phone */}
                <label className="col-span-2 sm:col-span-1">
                  <div className="mb-1" style={labelStyles}>Phone number *</div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className="w-full h-11 px-4 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* Interest */}
                <label className="col-span-2">
                  <div className="mb-1" style={labelStyles}>Which of our products or services are you interested in? *</div>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-full text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  >
                    {INTERESTS.map((interest) => (
                      <option key={interest.value} value={interest.value} disabled={interest.value === ""}>
                        {interest.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Message */}
                <label className="col-span-2">
                  <div className="mb-1" style={labelStyles}>
                    Can you share more about your business needs and challenges?
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg text-base resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={inputStyles}
                  />
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="col-span-2 h-11 rounded-full text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "var(--surbee-fg-primary, #E8E8E8)",
                    color: "var(--surbee-bg-primary, rgb(19, 19, 20))",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>

              <p
                className="mt-6 text-base"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                For other inquiries, visit our{" "}
                <a
                  href="mailto:support@surbee.com"
                  className="underline underline-offset-2 transition-colors hover:opacity-70"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  help center
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
