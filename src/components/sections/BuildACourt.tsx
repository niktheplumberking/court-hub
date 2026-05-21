"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionHeadline } from "@/components/ui/SectionHeadline";
import { CourtInquiryForm } from "@/components/forms/CourtInquiryForm";
import { ScrollReveal3D } from "@/components/ScrollReveal3D";
import { BuildACourtScene } from "./BuildACourtScene";

export function BuildACourt() {
  return (
    <section
      id="build-a-court"
      className="relative overflow-hidden bg-ink py-32 sm:py-40 lg:py-48"
    >
      <Container className="relative">
        <ScrollReveal3D>
          <div className="mb-14 flex flex-col gap-6">
            <SectionLabel accent="padel">Build a court</SectionLabel>
            <SectionHeadline className="font-display max-w-4xl text-[10vw] leading-[0.95] tracking-tight sm:text-[7vw] lg:text-[5vw]">
              Your courts.{" "}
              <span className="text-padel">Engineered to win.</span>
            </SectionHeadline>
            <p className="max-w-xl text-base text-white/60 sm:text-lg">
              Full turnkey construction — from soil survey to glass install to
              floodlights tuned for night play. We&apos;ve built across Dubai,
              Abu Dhabi, and Sharjah for clubs, hotels, and private estates.
            </p>
          </div>
        </ScrollReveal3D>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            <BuildACourtScene />

            <div className="flex items-center gap-3 rounded-2xl border border-padel/30 bg-padel/10 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-padel text-ink">
                <svg
                  aria-hidden
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  24-hour response, guaranteed.
                </div>
                <div className="text-xs text-white/50">
                  Send your details and we&apos;ll come back with a tailored
                  scope.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{
              duration: 0.85,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-md sm:p-10"
          >
            <CourtInquiryForm />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
