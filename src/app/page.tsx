import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Zap, CreditCard, FileText } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { prisma } from "@/lib/prisma";
import { normalizePricing } from "@/lib/pricing";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  let pricing: ReturnType<typeof normalizePricing> | null = null;
  if (!session?.user?.id) {
    const settings = await prisma.appSettings.upsert({
      where: { id: "app" },
      update: {},
      create: { id: "app" },
      select: { pricing: true },
    });
    pricing = normalizePricing(settings.pricing);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/hesaby-logo.png" alt="Hesaby" width={270} height={72} className="h-16 w-auto" priority />
          </div>
          <nav className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            {!session?.user?.id ? (
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            ) : null}
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          </nav>
          <div className="flex items-center gap-4">
            {session?.user?.id ? (
              <>
                <Button variant="outline" asChild className="rounded-full px-4">
                  <Link href="/dashboard/invoice/new">Create Invoice</Link>
                </Button>
                <LogoutButton variant="outline" className="rounded-full px-4" />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:underline">
                  Log in
                </Link>
                <Button asChild className="rounded-full px-6">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Optimized for Egyptian Freelancers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1]">
              Create invoices in seconds. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Get paid faster.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The easiest way to generate professional invoices, track payments, and manage your freelance business. Support for local payments like InstaPay and Vodafone Cash.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="rounded-full px-8 h-14 text-base w-full sm:w-auto">
                {session?.user?.id ? (
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <Link href="/register">
                    Start for free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4">
                No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to get paid</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Stop wrestling with Word documents and Excel spreadsheets. Hesaby makes invoicing simple.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Ultra-fast Creation",
                  description: "Generate beautiful, professional invoices in under 30 seconds with our streamlined editor.",
                  icon: <Zap className="w-6 h-6 text-yellow-500" />
                },
                {
                  title: "Local Payments",
                  description: "Easily accept payments via InstaPay, Vodafone Cash, or PayPal with our smart manual verification flow.",
                  icon: <CreditCard className="w-6 h-6 text-green-500" />
                },
                {
                  title: "Professional PDF Export",
                  description: "Download high-quality, print-ready PDFs with one click. Look professional to every client.",
                  icon: <FileText className="w-6 h-6 text-blue-500" />
                }
              ].map((feature, i) => (
                <div key={i} className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!session?.user?.id && pricing ? (
          <section id="pricing" className="py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Start for free, upgrade when you need more power.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="border rounded-3xl p-8 flex flex-col">
                  <h3 className="text-2xl font-semibold mb-2">Free</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">0</span>
                    <span className="text-muted-foreground"> {pricing.currency}/month</span>
                  </div>
                  <p className="text-muted-foreground mb-8">Perfect for freelancers just starting out.</p>
                  <ul className="space-y-4 mb-8 flex-1">
                    {[
                      "Up to 3 invoices per month",
                      "1 basic template",
                      "Standard PDF export",
                      "Hesaby watermark"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full rounded-full h-12" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>

                <div className="border rounded-3xl p-8 flex flex-col bg-primary text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
                  <div className="absolute top-0 right-0 bg-white/20 px-4 py-1 rounded-bl-xl text-sm font-medium">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">{pricing.proMonthly}</span>
                    <span className="text-primary-foreground/80"> {pricing.currency}/month</span>
                  </div>
                  <p className="text-primary-foreground/80 mb-8">For established professionals who need more.</p>
                  <div className="text-sm text-primary-foreground/80 mb-6">
                    Yearly: {pricing.proYearly} {pricing.currency}/year • Lifetime: {pricing.lifetime} {pricing.currency} once
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {[
                      "Unlimited invoices",
                      "Premium templates",
                      "Custom brand logo & colors",
                      "No watermark",
                      "Priority support"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" className="w-full rounded-full h-12 text-primary" asChild>
                    <Link href="/register?plan=pro">Upgrade to Pro</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-4xl font-bold mb-6">Ready to look more professional?</h2>
            <p className="text-xl text-muted-foreground mb-10">Join hundreds of Egyptian freelancers who use Hesaby to get paid faster.</p>
            <Button size="lg" asChild className="rounded-full px-10 h-14 text-lg">
              <Link href="/register">Create Your First Invoice</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/hesaby-logo.png" alt="Hesaby" width={270} height={72} className="h-14 w-auto" />
          </div>
          <p>© {new Date().getFullYear()} Hesaby. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
