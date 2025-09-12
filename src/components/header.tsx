'use client'

import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import GoogleLoginButton from "./GoogleLoginButton"
import UserProfile from "./UserProfile"

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Github className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Dandi GitHub Analyzer</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
          <a
            href="#support"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Support
          </a>
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <GoogleLoginButton className="px-4 py-2 text-sm">
              Sign In
            </GoogleLoginButton>
          )}
        </div>
      </div>
    </header>
  )
}
