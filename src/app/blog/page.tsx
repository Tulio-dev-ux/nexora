import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/content/blog-posts";

export default function BlogPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Blog</h1>
        <p className="text-slate-400 mb-12">Insights on AI, Discord, automation, and technology.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:neon-glow transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-slate-500">{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg leading-snug">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">{post.excerpt}</p>
                  <p className="text-xs text-slate-500">{post.date}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
