"use client";

import { createContext, useContext } from "react";
import { waLinkFor, type GalleryPhoto, type SiteInfo, type Slots } from "@/lib/site";

type Ctx = { site: SiteInfo; img: Slots; gallery: GalleryPhoto[]; apiUrl: string };
const ContentContext = createContext<Ctx | null>(null);

export function ContentProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Coordonnées, images et galerie (modifiables depuis l'admin) dans les composants client */
export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent doit être utilisé dans <ContentProvider>");
  return { ...ctx, wa: (text?: string) => waLinkFor(ctx.site, text) };
}
