'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Notification from '../../components/Notification';
import TopBar from '../../components/TopBar';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../contexts/AuthContext';
// removed api key management imports

export default function Protected() {
  // removed api key management state
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const router = useRouter();
  const { sidebarVisible, toggleSidebar } = useSidebar();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [router, isAuthenticated, authLoading]);

  useEffect(() => {
    // Load repo analysis from session (set by playground)
    try {
      const stored = sessionStorage.getItem('repoAnalysisResponse');
      const storedUrl = sessionStorage.getItem('repoGithubUrl');
      if (stored) setAnalysis(JSON.parse(stored));
      if (storedUrl) setRepoUrl(storedUrl);
    } catch {}
  }, []);

  const handleBackToPlayground = () => {
    router.push('/playground');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Mobile Backdrop */}
        {sidebarVisible && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => toggleSidebar()}
          />
        )}
        
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="fixed md:relative z-50 md:z-auto">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <TopBar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-foreground mb-4">No Analysis Found</h2>
                <p className="text-muted-foreground mb-6">Submit a repository on the Playground to see the analysis here.</p>
                <button onClick={handleBackToPlayground} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-sm font-medium transition-colors">Go to Playground</button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Component */}
        <Notification />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Backdrop */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      {sidebarVisible && (
        <div className="fixed md:relative z-50 md:z-auto">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Repository Analysis</h3>
                  <p className="text-sm text-muted-foreground">Below is the analysis for your submitted repository.</p>
                </div>
              </div>
            </div>
            {/* Repository Analysis Result */}
            {analysis && (
              <div className="mb-6 bg-card rounded-xl shadow-sm border border-border">
                <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Repository Analysis</h2>
                    {repoUrl && (
                      <p className="text-sm text-muted-foreground mt-1 break-all">{repoUrl}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const text = JSON.stringify(analysis, null, 2);
                      navigator.clipboard.writeText(text).then(() => {
                        window?.showToastNotification?.('Copied analysis to clipboard', 'success');
                      }).catch(() => {
                        window?.showToastNotification?.('Failed to copy', 'error');
                      });
                    }}
                    className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium"
                    aria-label="Copy analysis"
                    title="Copy analysis"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-4m-6 10H8a2 2 0 01-2-2v-4a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="p-6">
                  <pre className="w-full text-left text-xs md:text-sm bg-muted text-foreground p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words">
{JSON.stringify(analysis, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification />
    </div>
  );
}

