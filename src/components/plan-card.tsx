'use client'

import { useState } from 'react'
import { useToast } from '../hooks/use-toast'

export default function PlanCard() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleManagePlan = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await res.json()

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        })
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-primary-foreground">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium opacity-90">CURRENT PLAN</p>
          <h2 className="text-3xl font-bold mt-1">Researcher</h2>
        </div>
        <button
          onClick={handleManagePlan}
          disabled={isLoading}
          className="bg-primary-foreground/20 hover:bg-primary-foreground/30 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium text-foreground transition-colors">
          {isLoading ? 'Loading...' : 'Manage Plan'}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">API Usage</span>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Plan</span>
            <span>0/1,000 Credits</span>
          </div>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2">
            <div className="bg-primary-foreground h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Pay as you go</span>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="w-10 h-6 bg-primary-foreground/20 rounded-full p-1">
              <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
