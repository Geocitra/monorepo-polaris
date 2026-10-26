import { notFound } from 'next/navigation';
import { fetchPortalData } from '@/lib/api';
import { generateDynamicThemeCss } from '@/lib/dynamicThemeCss';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const { theme } = portalData;
  const primaryColor = theme.primaryHexColor || '#1890FF';
  const dynamicCss = generateDynamicThemeCss(primaryColor);

  return (
    <div
      data-polaris-theme="true"
      style={
        {
          '--portal-primary': primaryColor,
          '--portal-secondary': theme.secondaryHexColor || '#001529',
          '--portal-font': theme.fontFamily || 'Inter, sans-serif',
        } as React.CSSProperties
      }
      className="flex min-h-screen flex-col relative"
    >
      {dynamicCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: dynamicCss,
          }}
        />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}
