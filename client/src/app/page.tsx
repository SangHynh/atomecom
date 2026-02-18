import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">Atomecom</h1>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Modern E-commerce Experience
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Built with Next.js 15, Shadcn UI, and Clean Architecture using Domain Driven Design.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
               <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/products">
               <Button size="lg" variant="outline">Browse Products</Button>
            </Link>
          </div>
        </section>

        {/* Features Preview */}
        <div className="grid gap-8 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Secure Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                    Full JWT Authentication flow with Refresh Tokens and Role-based Access Control.
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    Protected area for Admins to manage users and products (Requires Login).
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Modern Stack</CardTitle>
                </CardHeader>
                <CardContent>
                   Next.js App Router, Tailwind CSS, Zustand, and TanStack Query.
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
