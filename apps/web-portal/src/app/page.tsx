'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { FeaturePillars } from '@/components/landing/feature-pillars';
import { InstitutionTrustBar } from '@/components/landing/institution-trust-bar';
import { WorkflowSteps } from '@/components/landing/workflow-steps';
import { ContentShowcase } from '@/components/landing/content-showcase';
import { SolutionSection } from '@/components/landing/solution-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { AboutSection } from '@/components/landing/about-section';
import { ContentReaderModal, ContentItemDetails } from '@/components/landing/content-reader-modal';
import { LegalPolicyModal, PolicyType } from '@/components/landing/legal-policy-modal';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PublicConciergeWidget } from '@/components/chat/public-concierge-widget';
import { HeroVideoBackground, HERO_REELS } from '@/components/landing/hero-video-background';

export default function LandingHomePage() {
  const [selectedContent, setSelectedContent] = useState<ContentItemDetails | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER'>('ALL');
  const [activeSolutionTab, setActiveSolutionTab] = useState<'DPR' | 'DPRD' | 'PEMDA'>('DPR');
  const [policyType, setPolicyType] = useState<PolicyType | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col font-sans">
      {/* 1. TOP STICKY NAVBAR */}
      <LandingNavbar
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onSelectSolutionTab={(tab) => setActiveSolutionTab(tab)}
      />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* 2. HERO SECTION: FULL-BLEED VIDEO WITH CLEAN NARRATIVE   */}
        {/* ======================================================== */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-[96vh] flex flex-col justify-start bg-slate-950 pt-16 sm:pt-20 lg:pt-24 pb-36 sm:pb-48 lg:pb-52 text-white overflow-hidden">
          {/* Continuous Full-Bleed Video Background */}
          <HeroVideoBackground
            activeReelIndex={activeReelIndex}
            onActiveIndexChange={setActiveReelIndex}
            onProgressChange={setProgressPct}
          />

          {/* CLEAN FRONT NARRATIVE WITHOUT CLUTTER */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-2xl text-left space-y-3">
              <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white sm:text-4xl lg:text-5xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                HALO DARI POLARIS
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-100 sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                DARI GAGASAN PUBLIK MENJADI KOMUNIKASI YANG BERDAMPAK
              </p>

              {/* Action Button on top of video */}
              <div className="pt-3 flex items-center">
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-center text-sm font-extrabold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 hover:shadow-blue-500/40 cursor-pointer"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. 4 FEATURE PILLARS (STRIP BELOW HERO)                  */}
        {/* ======================================================== */}
        <FeaturePillars onSelectCategory={(cat) => setActiveCategory(cat)} />

        {/* ======================================================== */}
        {/* 4. INSTITUTIONAL SOCIAL PROOF / TRUST EMBLEMS            */}
        {/* ======================================================== */}
        <InstitutionTrustBar />

        {/* ======================================================== */}
        {/* 5. WORKFLOW STEPS (HOW POLARIS WORKS)                    */}
        {/* ======================================================== */}
        <WorkflowSteps />

        {/* ======================================================== */}
        {/* 6. INTERACTIVE CONTENT SHOWCASE (ARTIKEL, INFOGRAFIS, DLL)*/}
        {/* ======================================================== */}
        <ContentShowcase
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onOpenReader={(item) => setSelectedContent(item)}
        />

        {/* ======================================================== */}
        {/* 7. SOLUTIONS BY INSTITUTION / ROLE                       */}
        {/* ======================================================== */}
        <SolutionSection
          activeTab={activeSolutionTab}
          onTabChange={setActiveSolutionTab}
          onRequestDemo={scrollToPricing}
        />

        {/* ======================================================== */}
        {/* 8. TRANSPARENT PRICING SECTION (PAKET HARGA WORKSPACE)   */}
        {/* ======================================================== */}
        <PricingSection onSelectPlan={scrollToPricing} />

        {/* ======================================================== */}
        {/* 9. ABOUT POLARIS MISSION & METRICS                       */}
        {/* ======================================================== */}
        <AboutSection onRequestDemo={scrollToPricing} />

        {/* ======================================================== */}
        {/* 10. BOTTOM BANNER CALL-TO-ACTION                         */}
        {/* ======================================================== */}
        <section className="py-20 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-black uppercase tracking-wider inline-block">
              Siap Memulai Sekarang?
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
              Ubah Setiap Pemikiran Strategis Anda Menjadi Konten Publikasi Berkelas Dunia.
            </h2>

            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Bergabunglah dengan para pemimpin eksekutif dan legislatif yang telah mempercayakan diseminasi gagasan dan telaah kebijakan melalui ekosistem POLARIS.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={scrollToPricing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm sm:text-base shadow-xl hover:bg-blue-50 transition-all text-center cursor-pointer"
              >
                Ajukan Permohonan Lisensi Sekarang
              </button>

              <button
                onClick={scrollToPricing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600/40 border border-white/20 text-white font-extrabold text-sm sm:text-base hover:bg-blue-600/60 transition-all text-center cursor-pointer"
              >
                Lihat Rincian Paket Harga
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 11. COMPREHENSIVE FOOTER */}
      <LandingFooter
        onOpenPolicy={(t) => setPolicyType(t)}
        onRequestDemo={scrollToPricing}
        onSelectCategory={(cat) => setActiveCategory(cat)}
      />

      {/* 12. INTERACTIVE CONTENT READER MODAL (HIGH Z-INDEX) */}
      <ContentReaderModal
        item={selectedContent}
        onClose={() => setSelectedContent(null)}
      />

      {/* 13. LEGAL POLICY MODAL (TERMS, PRIVACY, SECURITY) */}
      <LegalPolicyModal
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

      <PublicConciergeWidget />
    </div>
  );
}
