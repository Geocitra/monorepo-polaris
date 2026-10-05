'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LaptopMockup } from '@/components/landing/laptop-mockup';
import { FeaturePillars } from '@/components/landing/feature-pillars';
import { InstitutionTrustBar } from '@/components/landing/institution-trust-bar';
import { WorkflowSteps } from '@/components/landing/workflow-steps';
import { ContentShowcase, showcaseItems } from '@/components/landing/content-showcase';
import { SolutionSection } from '@/components/landing/solution-section';
import { PricingSection } from '@/components/landing/pricing-section';
import { AboutSection } from '@/components/landing/about-section';
import { ContentReaderModal, ContentItemDetails } from '@/components/landing/content-reader-modal';
import { LegalPolicyModal, PolicyType } from '@/components/landing/legal-policy-modal';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PublicConciergeWidget } from '@/components/chat/public-concierge-widget';

export default function LandingHomePage() {
  const [selectedContent, setSelectedContent] = useState<ContentItemDetails | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER'>('ALL');
  const [activeSolutionTab, setActiveSolutionTab] = useState<'DPR' | 'DPRD' | 'PEMDA'>('DPR');
  const [policyType, setPolicyType] = useState<PolicyType | null>(null);

  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000';

  const handleMockupSelectType = (type: 'ARTIKEL' | 'INFOGRAFIS' | 'POSTER') => {
    setActiveCategory(type);
    const found = showcaseItems.find((i) => i.type === type);
    if (found) {
      setSelectedContent(found);
    }
  };

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
        {/* 2. HERO SECTION                                          */}
        {/* ======================================================== */}
        <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-[#fafbfc]">
          {/* BACKGROUND DECORATIVE ELEMENTS */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-tr from-blue-100/30 via-indigo-50/20 to-transparent blur-3xl rounded-full -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* LEFT COLUMN: HERO TEXT CONTENT */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
                {/* BRAND NAME */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-none">
                  POLARIS
                </h1>

                {/* MAIN HEADLINE */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
                  Membuat setiap ide dan pemikiran Anda menjadi konten yang siap dibagikan.
                </h2>

                {/* SUBTITLE EXPLANATION */}
                <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed font-normal max-w-xl">
                  Platform untuk membantu Eksekutif, Legislatif, dan pemangku kepentingan publik menghasilkan artikel, infografis, dan poster secara cepat, berkualitas, dan sesuai kebutuhan.
                </p>

                {/* CTA BUTTONS ROW */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <a
                    href={`${DASHBOARD_URL}/register`}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-95 transition-all text-center"
                  >
                    <span>Daftar Akun Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <button
                    onClick={scrollToPricing}
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-extrabold text-sm sm:text-base hover:bg-slate-50 active:scale-95 transition-all text-center shadow-xs cursor-pointer"
                  >
                    <span>Lihat Paket Harga</span>
                  </button>
                </div>

                {/* TRUST BADGE */}
                <div className="pt-3 flex items-center gap-4 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Terintegrasi Data Regulasi</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Format Standar Parlemen</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: LAPTOP MOCKUP DISPLAYING POLARIS UI */}
              <div className="lg:col-span-6 relative">
                <LaptopMockup
                  onSelectType={handleMockupSelectType}
                  onRequestDemo={scrollToPricing}
                />
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
        <PricingSection onSelectPlan={() => {
          window.location.href = `${DASHBOARD_URL}/register`;
        }} />

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
              <a
                href={`${DASHBOARD_URL}/register`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm sm:text-base shadow-xl hover:bg-blue-50 transition-all text-center"
              >
                Daftar Akun Workspace Sekarang
              </a>

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
