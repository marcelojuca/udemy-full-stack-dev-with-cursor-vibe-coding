import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, GitBranch, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="container max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
          Unlock Insights from Your <span className="text-primary">GitHub Repositories</span>
        </h1>

        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          Get comprehensive summaries, track stars, discover cool facts, and monitor the latest pull requests and
          version updates from any open source GitHub repository.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start Analyzing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg">
            View Demo
          </Button>
        </div>

        {/* Hero Visual */}
        <div className="relative mx-auto max-w-3xl">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">Repository Insights</div>
                  <div className="text-sm text-muted-foreground">Comprehensive analytics</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">Star Tracking</div>
                  <div className="text-sm text-muted-foreground">Monitor popularity trends</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">PR Analysis</div>
                  <div className="text-sm text-muted-foreground">Latest updates & changes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
