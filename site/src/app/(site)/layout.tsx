import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/content";
import { ContentProviderWrapper } from "@/components/ContentProviderWrapper";
import { AdminEditProvider } from "@/components/admin/AdminEditProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const global = await fetchPageContent("global");
  const siteName = global.get("site_name")?.value ?? "Yeshua Deliverance Ministries";
  const seoTitle = global.get("meta.title")?.value ?? siteName;
  const seoDesc = global.get("meta.description")?.value ?? "";
  const ogImage = global.get("meta.og_image")?.value;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ydministries.ca";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: seoTitle, template: `%s | ${siteName}` },
    description: seoDesc,
    openGraph: {
      type: "website",
      siteName,
      title: seoTitle,
      description: seoDesc,
      locale: "en_CA",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image", title: seoTitle, description: seoDesc },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalContent = await fetchPageContent("global");
  const globalEntries = Array.from(globalContent.values());

  // Detect admin/bishop server-side so the (site) tree can render the
  // inline-edit overlay for editors. Anonymous visitors get isAdmin=false
  // and the overlay collapses to a no-op.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role;
    isAdmin = role === "admin" || role === "bishop";
  }

  return (
    <ContentProviderWrapper pageKey="global" entries={globalEntries}>
      <AdminEditProvider isAdmin={isAdmin}>
        <SiteHeader />
        <main className="min-h-screen bg-ydm-cream text-ydm-ink font-body">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
        </main>
        <SiteFooter />
      </AdminEditProvider>
    </ContentProviderWrapper>
  );
}
