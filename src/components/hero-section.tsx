import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, GitBranch, Star } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 text-center">
      <div className="container max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-4 sm:mb-6 leading-tight">
          Unlock Insights from Your <span className="text-primary">GitHub Repositories</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground text-balance mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
          Get comprehensive summaries, track stars, discover cool facts, and monitor the latest pull requests and
          version updates from any open source GitHub repository.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
          <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            Start Analyzing <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            View Demo
          </Button>
        </div>

        {/* Hero Visual */}
        <div className="relative mx-auto max-w-3xl">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-card-foreground text-sm sm:text-base">Repository Insights</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Comprehensive analytics</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-accent/10 rounded-lg flex-shrink-0">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-card-foreground text-sm sm:text-base">Star Tracking</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Monitor popularity trends</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-card-foreground text-sm sm:text-base">PR Analysis</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Latest updates & changes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
