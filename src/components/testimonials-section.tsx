import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Open Source Maintainer",
    content:
      "Dandi has completely changed how I track and understand the repositories I maintain. The insights are incredibly valuable.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Senior Developer at TechCorp",
    content:
      "The PR analysis feature helps our team stay on top of important changes across all the open source projects we depend on.",
    rating: 5,
  },
  {
    name: "Emily Johnson",
    role: "DevOps Engineer",
    content:
      "Love the cool facts feature! It helps me discover interesting patterns and statistics I never would have found manually.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance mb-4 leading-tight">
            Loved by Developers Worldwide
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            See what the open source community is saying about Dandi GitHub Analyzer.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border h-full">
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <div className="flex items-center space-x-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-card-foreground mb-4 text-balance text-sm sm:text-base leading-relaxed flex-grow">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="mt-auto">
                  <div className="font-semibold text-card-foreground text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
