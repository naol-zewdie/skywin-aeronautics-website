"use client";

import { useState, useRef, useEffect } from "react";

interface ContactWizardProps {
  directEmail?: string;
  directPhone?: string;
}

const INTEREST_OPTIONS = [
  { id: "aerospace", label: "Aerospace Engineering & Design" },
  { id: "drones", label: "Drone Systems & UAV Solutions" },
  { id: "training", label: "Flight Training & Simulation" },
  { id: "defense", label: "Defense & Avionics Research" },
  { id: "partnership", label: "Strategic Partnership" },
  { id: "consulting", label: "General Consultation & Other" },
];

export default function ContactWizard({
  directEmail = "hr1.skywin@gmail.com",
  directPhone = "+1 956 272 1689",
}: ContactWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Aerospace Engineering & Design",
  ]);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus active input on step change
  useEffect(() => {
    setErrorMsg("");
    if (currentStep === 0) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
    } else if (currentStep === 1) {
      setTimeout(() => emailInputRef.current?.focus(), 150);
    } else if (currentStep === 3) {
      setTimeout(() => messageInputRef.current?.focus(), 150);
    }
  }, [currentStep]);

  const toggleInterest = (label: string) => {
    setErrorMsg("");
    setSelectedInterests((prev) =>
      prev.includes(label)
        ? prev.length > 1
          ? prev.filter((i) => i !== label)
          : prev
        : [...prev, label]
    );
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg("");
    if (step === 0) {
      if (!name.trim()) {
        setErrorMsg("Please enter your name to continue");
        return false;
      }
      if (name.trim().length < 2) {
        setErrorMsg("Name must be at least 2 characters");
        return false;
      }
    } else if (step === 1) {
      if (!email.trim()) {
        setErrorMsg("Please enter your email address");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg("Please enter a valid email address");
        return false;
      }
    } else if (step === 2) {
      if (selectedInterests.length === 0) {
        setErrorMsg("Please select at least one area of interest");
        return false;
      }
    } else if (step === 3) {
      if (!message.trim()) {
        setErrorMsg("Please provide a brief message or project description");
        return false;
      }
      if (message.trim().length < 5) {
        setErrorMsg("Please write at least a few words about your inquiry");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (currentStep < 3) {
        e.preventDefault();
        handleNext();
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const fullMessage = `[Areas of Interest: ${selectedInterests.join(
        ", "
      )}]\n\n${message.trim()}`;

      const formDataToSend = new FormData();
      formDataToSend.append("name", name.trim());
      formDataToSend.append("email", email.trim());
      formDataToSend.append("message", fullMessage);

      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setServerMsg(
          data.message ||
            "Your message has been sent successfully. A senior consultant will review it shortly."
        );
      } else {
        setErrorMsg(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again or reach out directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSelectedInterests(["Aerospace Engineering & Design"]);
    setMessage("");
    setCurrentStep(0);
    setIsSubmitted(false);
    setErrorMsg("");
    setServerMsg("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-7">
      {/* ── Direct Reach Out Cards Row ── */}
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          PREFER TO REACH US DIRECTLY?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* WhatsApp Card */}
          <a
            href={`https://wa.me/${directPhone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 overflow-hidden"
            style={{
              background: "rgba(12, 18, 28, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Ambient hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 50%, rgba(37, 211, 102, 0.14) 0%, transparent 70%)",
              }}
            />

            <div className="flex items-center gap-3.5 relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
                style={{
                  background: "rgba(37, 211, 102, 0.12)",
                  border: "1px solid rgba(37, 211, 102, 0.25)",
                }}
              >
                <svg
                  className="w-5 h-5 text-[#25D366]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>

              <div>
                <h3
                  className="text-[15px] font-bold text-white group-hover:text-emerald-300 transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  WhatsApp
                </h3>
                <p
                  className="text-xs text-white/50 group-hover:text-white/80 transition-colors mt-0.5 tracking-wider"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {directPhone}
                </p>
              </div>
            </div>

            <span className="text-white/40 text-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white">
              →
            </span>
          </a>

          {/* Email Card */}
          <a
            href={`mailto:${directEmail}`}
            className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 overflow-hidden"
            style={{
              background: "rgba(12, 18, 28, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Ambient hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 50%, rgba(69, 87, 109, 0.20) 0%, transparent 70%)",
              }}
            />

            <div className="flex items-center gap-3.5 relative z-10">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200"
                style={{
                  background: "rgba(69, 87, 109, 0.20)",
                  border: "1px solid rgba(69, 87, 109, 0.40)",
                }}
              >
                <svg
                  className="w-5 h-5 text-[#8fa3bf]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div>
                <h3
                  className="text-[15px] font-bold text-white group-hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Email
                </h3>
                <p
                  className="text-xs text-white/50 group-hover:text-white/80 transition-colors mt-0.5 tracking-wider truncate max-w-[190px] sm:max-w-none"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {directEmail}
                </p>
              </div>
            </div>

            <span className="text-white/40 text-lg transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white">
              →
            </span>
          </a>
        </div>
      </div>

      {/* ── Main Interactive Form Wizard Card ── */}
      <div
        className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-9 md:p-10 transition-all duration-300"
        style={{
          background: "rgba(11, 17, 28, 0.90)",
          border: "1px solid rgba(69, 87, 109, 0.22)",
          boxShadow:
            "0 20px 50px -10px rgba(0, 0, 0, 0.75), 0 0 35px rgba(69, 87, 109, 0.12)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Subtle decorative top inner theme glow */}
        <div
          className="absolute -top-[1px] left-1/4 right-1/4 h-[1px] opacity-80 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, #45576D, #6a7e98, transparent)",
          }}
        />

        {!isSubmitted ? (
          <div>
            {/* ── 4-Segment Progress Bar ── */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-7 sm:mb-8">
              {[0, 1, 2, 3].map((stepIdx) => {
                const isActive = stepIdx === currentStep;
                const isPassed = stepIdx < currentStep;

                return (
                  <div
                    key={stepIdx}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      background: isActive
                        ? "linear-gradient(90deg, #45576D 0%, #6a7e98 100%)"
                        : isPassed
                        ? "rgba(69, 87, 109, 0.65)"
                        : "rgba(255, 255, 255, 0.12)",
                      boxShadow: isActive
                        ? "0 0 14px rgba(106, 126, 152, 0.85)"
                        : "none",
                    }}
                  />
                );
              })}
            </div>

            {/* ── Step Content ── */}
            <div className="min-h-[160px] sm:min-h-[190px] flex flex-col justify-between">
              {/* STEP 1: NAME */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold text-white tracking-tight leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Let&apos;s start simple — what should we call you?
                    </h2>
                    <p
                      className="text-xs text-white/40 mt-1.5 uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step 01 / 04 — Introduction
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="your name *"
                      maxLength={100}
                      className="w-full rounded-xl px-5 py-4 text-base text-white outline-none transition-all duration-200 focus:border-[#6a7e98] focus:ring-1 focus:ring-[#45576D]"
                      style={{
                        background: "rgba(16, 23, 38, 0.85)",
                        border: errorMsg
                          ? "1px solid #ef4444"
                          : "1px solid rgba(69, 87, 109, 0.35)",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: EMAIL */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold text-white tracking-tight leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      What&apos;s the best email address to reach you?
                    </h2>
                    <p
                      className="text-xs text-white/40 mt-1.5 uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step 02 / 04 — Direct Communication
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="your.email@domain.com *"
                      maxLength={254}
                      className="w-full rounded-xl px-5 py-4 text-base text-white outline-none transition-all duration-200 focus:border-[#6a7e98] focus:ring-1 focus:ring-[#45576D]"
                      style={{
                        background: "rgba(16, 23, 38, 0.85)",
                        border: errorMsg
                          ? "1px solid #ef4444"
                          : "1px solid rgba(69, 87, 109, 0.35)",
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: SCOPE / CATEGORY */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold text-white tracking-tight leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      What can our team help you with?
                    </h2>
                    <p
                      className="text-xs text-white/40 mt-1.5 uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step 03 / 04 — Select one or more areas
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {INTEREST_OPTIONS.map((item) => {
                      const isSelected = selectedInterests.includes(item.label);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.label)}
                          className="flex items-center gap-3 p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer"
                          style={{
                            background: isSelected
                              ? "rgba(69, 87, 109, 0.22)"
                              : "rgba(16, 23, 38, 0.7)",
                            border: isSelected
                              ? "1px solid #6a7e98"
                              : "1px solid rgba(255, 255, 255, 0.09)",
                            boxShadow: isSelected
                              ? "0 0 16px rgba(69, 87, 109, 0.35)"
                              : "none",
                          }}
                        >
                          <span
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "border-sky-400 bg-sky-400/20 text-sky-400"
                                : "border-white/20 bg-white/[0.02]"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-2.5 h-2.5 text-sky-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-medium transition-colors ${
                              isSelected ? "text-white" : "text-white/70"
                            }`}
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: MESSAGE BRIEF */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl md:text-[28px] font-bold text-white tracking-tight leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Tell us about your project or mission
                    </h2>
                    <p
                      className="text-xs text-white/40 mt-1.5 uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Step 04 / 04 — Requirements & Specifications
                    </p>
                  </div>

                  <div className="relative">
                    <textarea
                      ref={messageInputRef}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      rows={5}
                      placeholder="Briefly describe your objectives, timeline, or specifications *"
                      maxLength={5000}
                      className="w-full rounded-xl px-5 py-4 text-sm text-white outline-none transition-all duration-200 resize-none focus:border-[#6a7e98] focus:ring-1 focus:ring-[#45576D]"
                      style={{
                        background: "rgba(16, 23, 38, 0.85)",
                        border: errorMsg
                          ? "1px solid #ef4444"
                          : "1px solid rgba(69, 87, 109, 0.35)",
                        fontFamily: "var(--font-mono)",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMsg && (
                <div
                  className="mt-3 text-xs text-red-400 flex items-center gap-2 animate-fadeIn"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* ── Wizard Controls / Action Buttons ── */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-white font-mono uppercase tracking-wider py-2.5 px-3 transition-colors cursor-pointer"
                >
                  ← BACK
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="group relative inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-lg text-white font-mono font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #23364F 0%, #45576D 100%)",
                  border: "1px solid rgba(106, 126, 152, 0.40)",
                  boxShadow: "0 0 24px rgba(69, 87, 109, 0.45)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    TRANSMITTING...
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === 3 ? "TRANSMIT INQUIRY" : "CONTINUE"}
                    </span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ── Submission Confirmation State ── */
          <div className="py-8 text-center space-y-6 animate-fadeIn">
            {/* Pulsing check badge */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#23364F]/50 border border-[#6a7e98]/50 text-[#6a7e98] shadow-[0_0_30px_rgba(69,87,109,0.4)]">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Transmission Confirmed.
              </h2>
              <p
                className="mt-3 max-w-lg mx-auto text-sm text-white/60 leading-relaxed"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Thank you,{" "}
                <span className="text-white font-semibold">{name}</span>. Your
                inquiry has been logged into our engineering dispatch queue. A
                senior consultant reviews it personally — usually back to you
                within one business day.
              </p>
            </div>

            {/* Summary card */}
            <div
              className="max-w-md mx-auto p-4 rounded-xl text-left space-y-2 text-xs"
              style={{
                background: "rgba(16, 23, 38, 0.8)",
                border: "1px solid rgba(69, 87, 109, 0.25)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div className="flex justify-between text-white/50">
                <span>RESPONDING TO:</span>
                <span className="text-white">{email}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>AREA OF FOCUS:</span>
                <span className="text-white truncate max-w-[200px]">
                  {selectedInterests.join(", ")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white uppercase font-mono tracking-wider transition-colors cursor-pointer py-2 px-4 rounded-lg border border-white/10 hover:border-white/20"
              >
                <span>SEND ANOTHER INQUIRY</span>
                <span>↻</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
