import 'server-only';

type Post = {
  id: string;
  title: string;
  slug: string;
  cover?: string;
  excerpt?: string;
  date?: string;
  url?: string;
};

const sample: Post[] = [
  {
    id: 'sample-1',
    title: 'Introducing Surbee Lyra',
    slug: 'introducing-surbee-lyra',
    cover: 'https://images.unsplash.com/photo-1517816428104-797678c7cf00?q=80&w=1600&auto=format&fit=crop',
    excerpt: 'A faster way to craft thoughtful surveys and get higher-quality responses.',
    date: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Survey Quality: What Actually Matters',
    slug: 'survey-quality-what-matters',
    cover: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop',
    excerpt: 'Speed-runs and bots ruin research. Here’s how we fight back.',
    date: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    title: 'How the Credit Network Works',
    slug: 'how-credit-network-works',
    cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop',
    excerpt: 'Earn credits by helping others; spend them to get great answers.',
    date: new Date().toISOString(),
  },
];

export async function fetchBlogPosts(): Promise<Post[]> {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
  const db = process.env.NOTION_BLOG_DATABASE_ID || process.env.NOTION_DATABASE_ID;
  if (!token || !db) {
    return sample;
  }
  try {
    const { Client } = await import('@notionhq/client');
    const notion = new Client({ auth: token });
    const res: any = await notion.databases.query({
      database_id: db,
      filter: {
        property: 'Published',
        checkbox: { equals: true },
      },
      sorts: [
        { property: 'Date', direction: 'descending' },
      ],
    });
    const posts: Post[] = res.results.map((p: any) => {
      const props = p.properties || {};
      const title = (props.Name?.title?.[0]?.plain_text) || 'Untitled';
      const slug = (props.Slug?.rich_text?.[0]?.plain_text) || p.id;
      const excerpt = props.Excerpt?.rich_text?.[0]?.plain_text;
      const date = props.Date?.date?.start;
      const cover = p.cover?.external?.url || p.cover?.file?.url;
      return { id: p.id, title, slug, excerpt, date, cover, url: p.url };
    });
    return posts;
  } catch (e) {
    console.warn('Notion fetch failed, using sample posts', e);
    return sample;
  }
}

export type { Post };

