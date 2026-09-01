import { recipeRepository } from '@/lib/repositories/recipe.repository';

export async function GET() {
  const { recipes } = await recipeRepository.list({
    status: 'published',
    limit: 50,
  });

  const siteUrl = 'https://flavornest.xyz';
  const pubDate = new Date().toUTCString();

  const itemsXml = recipes
    .map((recipe) => {
      const recipeUrl = `${siteUrl}/recipes/${recipe.slug}/`;
      const date = new Date(recipe.publishedAt || recipe.createdAt).toUTCString();
      const imageUrl = recipe.heroImage?.url || '';

      return `    <item>
      <title><![CDATA[${recipe.title}]]></title>
      <link>${recipeUrl}</link>
      <guid isPermaLink="true">${recipeUrl}</guid>
      <pubDate>${date}</pubDate>
      <description><![CDATA[${recipe.shortDescription || recipe.introduction}]]></description>
      ${
        imageUrl
          ? `<enclosure url="${imageUrl}" length="0" type="image/webp" />`
          : ''
      }
      <category>${recipe.primaryCategorySlug.replace(/-/g, ' ')}</category>
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FlavorNest - Simple Recipes. Big Flavor.</title>
    <link>${siteUrl}/</link>
    <description>Tested, reliable, and delicious weeknight recipes for everyday home cooks.</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
