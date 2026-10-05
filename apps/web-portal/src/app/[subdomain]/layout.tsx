import { notFound } from 'next/navigation';
import { fetchPortalData } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AskPolarisWidget } from '@/components/chat/ask-polaris-widget';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const portalData = await fetchPortalData(subdomain);

  if (!portalData) {
    notFound();
  }

  const { theme, member } = portalData;

  return (
    <div
      style={
        {
          '--portal-primary': theme.primaryHexColor,
          '--portal-secondary': theme.secondaryHexColor,
          '--portal-font': theme.fontFamily,
        } as React.CSSProperties
      }
      className="flex min-h-screen flex-col relative"
    >
      <Navbar
        subdomain={subdomain}
        officialName={member.fullName}
        partyAffiliation={member.partyAffiliation}
      />
      <main className="flex-1">{children}</main>
      <Footer
        officialName={member.fullName}
        dapilName={member.dapilName}
        partyAffiliation={member.partyAffiliation}
      />
      {/* FLOATING AI CIVIC CHAT WIDGET */}
      <AskPolarisWidget subdomain={subdomain} officialName={member.fullName} />
    </div>
  );
}
