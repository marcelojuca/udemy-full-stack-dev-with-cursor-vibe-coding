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
    <section className="py-20 px-4 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">Loved by Developers Worldwide</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            See what the open source community is saying about Dandi GitHub Analyzer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-card-foreground mb-4 text-balance">&ldquo;{testimonial.content}&rdquo;</p>

                <div>
                  <div className="font-semibold text-card-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
