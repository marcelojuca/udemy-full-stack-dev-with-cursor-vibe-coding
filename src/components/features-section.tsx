import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, GitBranch, Star, FileText, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Repository Summaries",
    description:
      "Get AI-powered summaries of any GitHub repository, understanding its purpose, tech stack, and key features at a glance.",
  },
  {
    icon: Star,
    title: "Star Analytics",
    description:
      "Track star growth over time, analyze popularity trends, and compare repositories to understand community engagement.",
  },
  {
    icon: Zap,
    title: "Cool Facts Discovery",
    description:
      "Uncover interesting statistics, contributor insights, and unique patterns that make each repository special.",
  },
  {
    icon: GitBranch,
    title: "Pull Request Insights",
    description:
      "Monitor the latest important pull requests, track development activity, and stay updated on project evolution.",
  },
  {
    icon: BarChart3,
    title: "Version Tracking",
    description:
      "Keep track of version releases, changelog analysis, and understand the development lifecycle of projects.",
  },
  {
    icon: Shield,
    title: "Security Analysis",
    description: "Get insights into repository security practices, dependency health, and code quality metrics.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-4 leading-tight">
            Powerful Features for Repository Analysis
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Everything you need to understand and track GitHub repositories, from basic insights to advanced analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-lg w-fit mb-3 sm:mb-4">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-card-foreground text-base sm:text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
