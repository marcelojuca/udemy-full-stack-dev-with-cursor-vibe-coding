'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Notification from '../../components/Notification';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../contexts/AuthContext';
// Removed API key validation imports; not needed for GitHub summarizer flow
import TopBar from '../../components/TopBar';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [responseData, setResponseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { sidebarVisible, toggleSidebar } = useSidebar();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponseData(null);

    if (!githubUrl.trim()) {
      window.showToastNotification('Please enter a GitHub URL', 'error');
      return;
    }
    if (!apiKey.trim()) {
      window.showToastNotification('Please enter an API key', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
      });

      const data = await res.json();
      setResponseData(data);

      if (!res.ok) {
        setError(data?.error || 'Request failed');
        window.showToastNotification(data?.error || 'Request failed', 'error');
        return;
      }

      window.showToastNotification('Repository analyzed successfully', 'success');
    } catch (err: any) {
      console.error('Error calling GitHub summarizer:', err);
      setError('Unexpected error calling GitHub summarizer');
      window.showToastNotification('Unexpected error', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl shadow-sm border border-border p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Analyze a GitHub Repository</h2>
                <p className="text-muted-foreground">
                  Enter a GitHub repository URL and your API key to get a JSON summary.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-foreground mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-foreground mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key here..."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Summarize Repository</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">How it works</h3>
                      <p className="text-sm text-foreground/80">
                        Provide a GitHub URL like <code>https://github.com/owner/repo</code> and your API key. We&apos;ll fetch the README and return a JSON analysis.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 text-red-800 border border-red-200 rounded p-3 text-sm">
                    {error}
                  </div>
                )}

                {responseData && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Response</h4>
                    <pre className="w-full text-left text-xs md:text-sm bg-muted text-foreground p-4 rounded-lg overflow-auto">
{JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification />
    </div>
  );
}
