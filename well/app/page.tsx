import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Well</span>Check
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-24 space-y-8 md:py-32">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Team Management & Wellbeing in One Place
            </h1>
            <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
              Track team mood, manage projects, and improve workplace wellbeing with our comprehensive platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-primary">Well</span>Check
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WellCheck. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
