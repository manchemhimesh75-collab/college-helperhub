import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Edit,
  Clipboard,
  Download,
  Users,
  Search,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  FileCode,
  Image as ImageIcon,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Practical Resources",
    description: "Access thousands of practical files organized by college, course, year, semester, division, and subject.",
  },
  {
    icon: FileText,
    title: "Assignment References",
    description: "Find assignment templates and reference materials shared by seniors and peers across your college.",
  },
  {
    icon: Edit,
    title: "Online Document Editing",
    description: "Edit DOCX and PDF files directly in your browser. Personalize with your name, enrollment, roll number, and more.",
  },
  {
    icon: Clipboard,
    title: "Academic Clipboard",
    description: "Store text, images, PDFs, code snippets, and links. Access across all your devices instantly.",
  },
  {
    icon: Download,
    title: "DOCX & PDF Export",
    description: "Download your personalized documents as professional DOCX or PDF files with preserved formatting.",
  },
  {
    icon: Users,
    title: "College Communities",
    description: "Connect with students from your college, course, and division. Share resources within your academic circle.",
  },
  {
    icon: Search,
    title: "Smart Search & Filters",
    description: "Find exactly what you need with powerful search by subject, practical number, tags, file type, and more.",
  },
  {
    icon: Zap,
    title: "Batch Personalization",
    description: "Apply your details to multiple practicals at once. Download all as a ZIP with one click.",
  },
];

const stats = [
  { label: "Resources Shared", value: "50,000+" },
  { label: "Active Students", value: "25,000+" },
  { label: "Colleges", value: "500+" },
  { label: "Downloads/Month", value: "100,000+" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "B.Tech CSE, 3rd Year",
    college: "Tech Institute",
    content: "Saved me hours every week! I just upload the practical, fill my details, and download. The batch edit feature is a lifesaver for end-of-semester submissions.",
    avatar: "PS",
  },
  {
    name: "Rahul Patel",
    role: "MCA, 2nd Year",
    college: "State University",
    content: "The clipboard feature is amazing. I save code snippets, SQL queries, and diagrams from lectures and access them on my phone during labs. Game changer!",
    avatar: "RP",
  },
  {
    name: "Anita Desai",
    role: "B.Tech IT, Final Year",
    college: "Engineering College",
    content: "Finally a platform that understands college students' needs. The document editor preserves formatting perfectly, and I love the image replacement for photos and signatures.",
    avatar: "AD",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2" aria-label="College Academic Hub Home">
                <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold text-foreground">Academic Hub</span>
              </Link>
              <div className="hidden md:flex md:items-center md:gap-6">
                <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </Link>
                <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Testimonials
                </Link>
                <Link href="/explore" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Explore
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden py-20 lg:py-32" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                <span>Now supporting 500+ colleges across India</span>
              </div>
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Your College&apos;s{" "}
                <span className="text-primary">Academic Resource Hub</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find. Share. Personalize. Download.
                <br />
                The only platform built specifically for college students to manage practicals, assignments, and study resources.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link href="/register">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    Explore Resources
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Verified Student Accounts
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Host Approved Content
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  DOCX & PDF Export
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y bg-muted/30" aria-labelledby="stats-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 lg:py-32" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                Everything You Need for Academic Success
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful features designed specifically for college students' workflow
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="group p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30" aria-labelledby="how-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 id="how-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Get from discovery to personalized download in 4 simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Find Your Resource</h3>
                  <p className="text-sm text-muted-foreground">Browse by college, course, year, semester, division, and subject. Search with powerful filters.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Open & Preview</h3>
                  <p className="text-sm text-muted-foreground">View the document in-browser with high-fidelity rendering. See exactly what you&apos;ll get.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Personalize</h3>
                  <p className="text-sm text-muted-foreground">Auto-detect fields or manually edit. Replace photos, update names, enrollment numbers, dates, and more.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  4
                </div>
                <div className="pt-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Download & Submit</h3>
                  <p className="text-sm text-muted-foreground">Export as DOCX or PDF with perfect formatting. Batch process multiple files and download as ZIP.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 lg:py-32" aria-labelledby="testimonials-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                Trusted by Students Across India
              </h2>
              <p className="text-lg text-muted-foreground">
                See what students have to say about their experience
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.name}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.college}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <CheckCircle key={i} className="h-4 w-4 text-yellow-400 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-32" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-primary p-8 sm:p-12 lg:p-16 text-center">
              <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Simplify Your Academic Life?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands of students who save hours every week. Create your free account in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Browse Resources
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-primary-foreground/60">
                No credit card required · Verify with college email · Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4" aria-label="College Academic Hub Home">
                <GraduationCap className="h-8 w-8 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold text-foreground">Academic Hub</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                The premier platform for college students to find, share, personalize, and download academic resources.
              </p>
            </div>
            <nav aria-label="Product links">
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-foreground transition-colors">Explore Resources</Link></li>
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
              </ul>
            </nav>
            <nav aria-label="Company links">
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </nav>
            <nav aria-label="Legal links">
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                <li><Link href="/academic-integrity" className="hover:text-foreground transition-colors">Academic Integrity</Link></li>
              </ul>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} College Academic Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}