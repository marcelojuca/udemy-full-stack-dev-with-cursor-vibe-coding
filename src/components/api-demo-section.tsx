"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, BookOpen, Copy, Check } from "lucide-react"
import { toast } from "sonner"

const defaultPayload = {
  githubUrl: "https://github.com/langchain-ai/langchain",
}

const mockResponse = {
  success: true,
  analysis: {
    summary:
      "The LangChain repository is a Python framework designed for building applications powered by large language models (LLMs). It offers tools for chaining components, integrating third-party services, and future-proofing AI application development. The ecosystem includes complementary tools like LangSmith for evaluation, LangGraph for agent orchestration, and deployment platforms, all aimed at simplifying and enhancing LLM-based application creation.",
    cool_facts: [
      "LangChain supports real-time data augmentation by connecting LLMs to diverse data sources and external systems through a vast library of integrations.",
      "The framework is part of a broader ecosystem that includes tools like LangSmith for observability and LangGraph for complex agent orchestration, with adoption by major companies like LinkedIn, Uber, and GitLab.",
    ],
    githubUrl: "https://github.com/langchain-ai/langchain",
  },
}

export function ApiDemoSection() {
  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2))
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSendRequest = async () => {
    try {
      setIsLoading(true)

      // Parse the payload to validate JSON
      const parsedPayload = JSON.parse(payload)

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, return mock response
      setResponse(mockResponse)
      toast.success("Analysis completed successfully!")
    } catch (error) {
      toast.error("Invalid JSON payload. Please check your syntax.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Copied to clipboard!")
  }

  const resetDemo = () => {
    setPayload(JSON.stringify(defaultPayload, null, 2))
    setResponse(null)
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Interactive Demo
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Try Our API Live</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test the GitHub Analyzer API with real requests. Edit the payload below and see instant results.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Request Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        POST
                      </Badge>
                      Request
                    </CardTitle>
                    <CardDescription>/api/github-summarizer</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(payload)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
                  <Textarea
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="font-mono text-sm min-h-[120px]"
                    placeholder="Enter JSON payload..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendRequest} disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={resetDemo}>
                    Reset
                  </Button>

                  <Button variant="outline" size="icon">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {response && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          200 OK
                        </Badge>
                      )}
                      Response
                    </CardTitle>
                    <CardDescription>{response ? "Analysis completed" : "Waiting for request..."}</CardDescription>
                  </div>
                  {response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>

                    {/* Formatted Response Preview */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Formatted Results
                      </h4>

                      <div>
                        <h5 className="font-medium mb-2">Summary</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">{response.analysis.summary}</p>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Cool Facts</h5>
                        <ul className="space-y-2">
                          {response.analysis.cool_facts.map((fact: string, index: number) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Send a request to see the response</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documentation Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <BookOpen className="h-5 w-5" />
              View Full Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
