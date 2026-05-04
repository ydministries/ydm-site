import { createServerClient } from "./supabase";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
}

/**
 * Returns ALL blog post detail pages, excluding the index/author/category/tag
 * archive pages. Ordered by date_published DESC.
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const sb = createServerClient();
  const { data, error } = await sb
    .from("page_content")
    .select("page_key, field_key, value")
    .like("page_key", "blog.%")
    .neq("page_key", "blog.index")
    .not("page_key", "like", "blog.cat.%")
    .not("page_key", "like", "blog.tag.%")
    .not("page_key", "like", "blog.author.%")
    .in("field_key", ["meta.title", "excerpt", "image.01", "image.01.url", "date_published"]);
  if (error) {
    console.error("[blog] getAllBlogPosts failed:", error);
    return [];
  }
  const byPage = new Map<string, Record<string, string>>();
  for (const row of data ?? []) {
    if (!byPage.has(row.page_key)) byPage.set(row.page_key, {});
    byPage.get(row.page_key)![row.field_key] = row.value;
  }
  const posts: BlogPost[] = [];
  for (const [pageKey, fields] of byPage) {
    posts.push({
      slug: pageKey.replace(/^blog\./, ""),
      title: fields["meta.title"] ?? "",
      excerpt: fields["excerpt"] ?? "",
      thumbnail: fields["image.01"] ?? fields["image.01.url"] ?? "",
      date: fields["date_published"] ?? "",
    });
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

/**
 * Most recent OTHER posts (excluding the current page).
 */
export async function getRecentBlogPosts(
  currentSlug: string,
  limit = 3,
): Promise<BlogPost[]> {
  const all = await getAllBlogPosts();
  return all.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
