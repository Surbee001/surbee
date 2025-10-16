import LandingNavbar from '@/components/navigation/LandingNavbar';
import { fetchBlogPosts } from '@/lib/notion';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  const hero = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Cover / Hero */}
      <section className="pt-[80px]">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="relative overflow-hidden rounded-2xl h-[320px] md:h-[440px] bg-gray-100">
            {hero?.cover && (
              <img src={hero.cover} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
              <div className="text-sm uppercase tracking-wide text-white/80 mb-2" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>Surbee Blog</div>
              <h1 className="font-light leading-tight mb-3" style={{ fontSize: '32px', fontFamily: 'var(--font-inter), sans-serif' }}>{hero?.title || 'Surbee Blog'}</h1>
              <p className="text-white/90" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>{hero?.excerpt || 'Stories, product updates, and research on building better surveys and getting higher-quality answers.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section>
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 text-center">
          <p className="text-gray-600">We publish notes on product design, research rigor, and the practical craft of asking good questions. New posts a few times each month.</p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={post.url || `/blog/${post.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-[3px] bg-gray-100 h-56">
                {post.cover && (
                  <img src={post.cover} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-0 flex items-end">
                  <div className="p-4 w-full">
                    <div className="flex items-center justify-between text-white">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm">Read post →</span>
                      {post.date && (
                        <span className="text-xs bg-black/50 rounded-full px-2 py-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">{new Date(post.date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-medium leading-snug">{post.title}</h3>
                {post.excerpt && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
