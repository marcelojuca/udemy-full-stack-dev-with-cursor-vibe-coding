import { Button } from "@/components/ui/button"
import { Github, Twitter, Linkedin } from "lucide-react"

function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Github className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg font-bold text-card-foreground">Dandi</span>
            </div>
            <p className="text-muted-foreground text-balance text-sm sm:text-base leading-relaxed">
              Unlock insights from GitHub repositories with powerful analytics and tracking tools.
            </p>
            <div className="flex space-x-2 sm:space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#about" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Careers
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors text-sm sm:text-base">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">
              © 2024 Dandi GitHub Analyzer. All rights reserved.
            </p>
            <div className="text-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-4 py-2">
                Start Analyzing Repositories Today
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
export default Footer
