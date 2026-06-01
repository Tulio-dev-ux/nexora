import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/marketing/page-shell";
import { Badge } from "@/components/ui/badge";
import { getPost, blogPosts } from "@/lib/content/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/blog" className="text-cyan-400 text-sm hover:underline">
          ← Back to blog
        </Link>
        <div className="flex items-center gap-2 mt-6 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-xs text-slate-500">{post.readTime}</span>
          <span className="text-xs text-slate-500">{post.date}</span>
        </div>
        <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
        <div className="prose-docs">
          {post.content.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
