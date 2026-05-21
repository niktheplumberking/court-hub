"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const cities = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

export function CourtInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Simulated submission — replace with real API call.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-4 rounded-2xl border border-padel/30 bg-padel/10 p-8 text-white"
        role="status"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-padel text-ink">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-3xl">Got it.</h3>
        <p className="max-w-md text-white/70">
          Our team will be in touch within 24 hours with a tailored proposal and
          timeline for your court.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field
        id="inquiry-name"
        label="Full name"
        type="text"
        autoComplete="name"
        required
        placeholder="Your name"
      />
      <Field
        id="inquiry-contact"
        label="Phone or email"
        type="text"
        autoComplete="email"
        required
        placeholder="+971 50 000 0000 or hello@you.com"
      />
      <div className="flex flex-col gap-2">
        <label
          htmlFor="inquiry-location"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
        >
          Court location
        </label>
        <div className="relative">
          <select
            id="inquiry-location"
            name="location"
            required
            className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/30 min-h-[44px]"
            defaultValue=""
          >
            <option value="" disabled className="bg-ink">
              Select emirate
            </option>
            {cities.map((c) => (
              <option key={c} value={c} className="bg-ink">
                {c}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      <Button
        type="submit"
        variant="lime"
        size="lg"
        disabled={submitting}
        className="mt-2"
      >
        {submitting ? "Sending…" : "Request a proposal"}
      </Button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

function Field({ id, label, type, required, placeholder, autoComplete }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
      >
        {label}
        {required && <span className="ml-1 text-lime">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-lime focus:ring-2 focus:ring-lime/30 min-h-[44px]"
      />
    </div>
  );
}
