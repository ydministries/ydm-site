// HAND-STYLED — sections live in ./_sections (leading underscore = no route registration).
// Codegen skips this file because it already exists; if you regen, move sections aside first.
import type { Metadata } from "next";
import { fetchPageContent, fetchAssets } from "@/lib/content";
import { ContentProviderWrapper } from "@/components/ContentProviderWrapper";
import { AssetProviderWrapper } from "@/components/AssetProviderWrapper";
import { Hero } from "./_sections/Hero";
import { Story } from "./_sections/Story";
import { Beliefs } from "./_sections/Beliefs";
import { LeadershipTeaser } from "./_sections/LeadershipTeaser";
import { CTA } from "./_sections/CTA";

const PAGE_KEY = "about";

export async function generateMetadata(): Promise<Metadata> {
  const [page, global] = await Promise.all([
    fetchPageContent(PAGE_KEY),
    fetchPageContent("global"),
  ]);
  const siteName = global.get("site_name")?.value ?? "Yeshua Deliverance Ministries";
  const title = page.get("seo.title")?.value ?? global.get("seo.title")?.value ?? "";
  const description = page.get("seo.description")?.value ?? global.get("seo.description")?.value ?? "";
  return {
    title,
    description,
    openGraph: { title, description, siteName },
  };
}

export default async function AboutPage() {
  const [content, assets] = await Promise.all([
    fetchPageContent(PAGE_KEY),
    fetchAssets(PAGE_KEY + "."),
  ]);
  const contentEntries = Array.from(content.values());
  const assetEntries = Array.from(assets.values());

  return (
    <ContentProviderWrapper pageKey={PAGE_KEY} entries={contentEntries}>
      <AssetProviderWrapper entries={assetEntries}>
        <Hero />
        <Story />
        <Beliefs />
        <LeadershipTeaser />
        <CTA />
      </AssetProviderWrapper>
    </ContentProviderWrapper>
  );
}
