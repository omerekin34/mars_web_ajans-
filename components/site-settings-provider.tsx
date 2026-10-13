"use client";

import { createContext, useContext } from "react";
import { fallbackSiteSettings, type SiteSettings } from "@/lib/public-content";

const SiteSettingsContext = createContext<SiteSettings>(fallbackSiteSettings);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
