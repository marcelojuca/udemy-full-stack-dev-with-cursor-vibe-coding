'use client'

import { Button } from "@/components/ui/button"
import { Github, Menu, X } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import GoogleLoginButton from "./google-login-button"
import UserProfile from "./user-profile"
import { useState } from "react"

export function Header() {
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-2">
          <Github className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-lg sm:text-xl font-bold text-foreground">Dandi GitHub Analyzer</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <GoogleLoginButton className="px-4 py-2 text-sm">Sign In</GoogleLoginButton>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-2">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <GoogleLoginButton className="px-3 py-2 text-xs">Sign In</GoogleLoginButton>
          )}
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <a
              href="#features"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#about"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            {/* <a
              href="#support"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </a> */}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header

 