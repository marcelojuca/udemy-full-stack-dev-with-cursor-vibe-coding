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
    icon: Zap,
    title: "Cool Facts Discovery",
    description:
      "Uncover interesting statistics, contributor insights, and unique patterns that make each repository special.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-8 sm:py-12 md:py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-4 leading-tight">
            Powerful Features for Repository Analysis
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Everything you need to understand and track GitHub repositories, from basic insights to advanced analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto justify-items-center">
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
