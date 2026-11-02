'use client';

import React from 'react';
import { DomainManagementPanel } from '../DomainManagementPanel';

interface ThemeDomainSectionProps {
  subdomainSlug: string;
  customDomain: string;
  onDomainUpdated?: () => void;
}

export function ThemeDomainSection({
  subdomainSlug,
  customDomain,
  onDomainUpdated,
}: ThemeDomainSectionProps) {
  return (
    <DomainManagementPanel
      currentSubdomain={subdomainSlug}
      currentCustomDomain={customDomain}
      onDomainUpdated={onDomainUpdated}
    />
  );
}

