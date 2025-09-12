import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, GitBranch, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 text-center">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6 leading-tight">
          Unlock Insights from Your <span className="text-primary">GitHub Repositories</span>
        </h1>
      </div>
    </section>
  )
}
