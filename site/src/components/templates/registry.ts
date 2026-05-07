/**
 * Template registry — codegen consults this to decide whether to emit a thin
 * template-shim page.tsx (provider wrappers + a single template component) or
 * fall back to the per-key dump.
 *
 *  - byKey takes precedence over byType.
 *  - Each entry maps to { importPath, exportName }; codegen uses both to write
 *    the import + JSX in the shim.
 *  - As more page types get hand-designed, extend byType (sermon, ministry,
 *    team, blog, …).
 */

export type TemplateRef = { importPath: string; exportName: string };

export const templateRegistry: {
  byKey: Record<string, TemplateRef>;
  byType: Record<string, TemplateRef>;
  /**
   * Page keys that should redirect (server-side redirect shim) instead of
   * rendering a template. Maps page_key → destination URL. Codegen emits a
   * minimal page.tsx that calls Next's redirect() at request time. Wins over
   * byKey/byType lookup.
   */
  redirectKeys: Record<string, string>;
  fallback: TemplateRef | null;
} = {
  byKey: {
    home:               { importPath: "@/components/templates/HomeTemplate",            exportName: "HomeTemplate" },
    about:              { importPath: "@/components/templates/AboutTemplate",           exportName: "AboutTemplate" },
    contact:            { importPath: "@/components/templates/ContactTemplate",         exportName: "ContactTemplate" },
    live:               { importPath: "@/components/templates/LiveTemplate",            exportName: "LiveTemplate" },
    prayer:             { importPath: "@/components/templates/PrayerTemplate",          exportName: "PrayerTemplate" },
    ask:                { importPath: "@/components/templates/AskTemplate",             exportName: "AskTemplate" },
    gallery:            { importPath: "@/components/templates/GalleryTemplate",         exportName: "GalleryTemplate" },
    "sermons.index":    { importPath: "@/components/templates/SermonsIndexTemplate",    exportName: "SermonsIndexTemplate" },
    "ministries.index": { importPath: "@/components/templates/MinistriesIndexTemplate", exportName: "MinistriesIndexTemplate" },
    "team.index":       { importPath: "@/components/templates/TeamIndexTemplate",       exportName: "TeamIndexTemplate" },
    "blog.index":       { importPath: "@/components/templates/BlogIndexTemplate",       exportName: "BlogIndexTemplate" },
    "events.index":     { importPath: "@/components/templates/EventsIndexTemplate",     exportName: "EventsIndexTemplate" },
    "give.index":       { importPath: "@/components/templates/GiveIndexTemplate",       exportName: "GiveIndexTemplate" },
  },
  byType: {
    sermon:   { importPath: "@/components/templates/SermonTemplate",   exportName: "SermonTemplate" },
    ministry: { importPath: "@/components/templates/MinistryTemplate", exportName: "MinistryTemplate" },
    team:     { importPath: "@/components/templates/TeamTemplate",     exportName: "TeamTemplate" },
    blog:     { importPath: "@/components/templates/BlogTemplate",     exportName: "BlogTemplate" },
    event:    { importPath: "@/components/templates/EventTemplate",    exportName: "EventTemplate" },
    campaign: { importPath: "@/components/templates/CampaignTemplate", exportName: "CampaignTemplate" },
    location: { importPath: "@/components/templates/LocationTemplate", exportName: "LocationTemplate" },
  },
  redirectKeys: {
    // Bishop has two source page_keys — huel_wilson (the canonical bio page)
    // and bishopwilson (the cmsms profile duplicate). Send the duplicate to
    // the canonical URL.
    "team.bishopwilson": "/team/bishop-huel-wilson",
  },
  fallback: null,
};
