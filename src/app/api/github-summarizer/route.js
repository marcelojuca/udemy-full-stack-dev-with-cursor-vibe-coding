import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeReadme } from '../../../lib/chain';
import { checkAndIncrementUsage } from '../../../lib/rate-limiting';
import { getBasicRepoInfo } from '../../../lib/get-repo-info';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { githubUrl } = await request.json();
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check rate limiting and increment usage
    const rateLimitResult = await checkAndIncrementUsage(apiKey);
    
    if (!rateLimitResult.allowed) {
      const statusCode = rateLimitResult.error === 'Invalid API key' ? 401 : 429;
      return NextResponse.json(
        { 
          valid: false, 
          error: rateLimitResult.error,
          usage: rateLimitResult.usage,
          limit: rateLimitResult.limit
        },
        { status: statusCode }
      );
    }

    // Validate GitHub URL
    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    if (!githubUrl.startsWith('https://github.com/')) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format' },
        { status: 400 }
      );
    }

    try {
      // Fetch README content and repository information in parallel
      const [readmeContent, repoInfo] = await Promise.all([
        getReadmeContent(githubUrl),
        getBasicRepoInfo(githubUrl)
      ]);
      
      // Analyze the README using LangChain
      const analysis = await analyzeReadme(readmeContent);
      
      return NextResponse.json({
        success: true,
        analysis,
        githubUrl,
        repositoryInfo: {
          stars: repoInfo.stars,
          version: repoInfo.version,
          website: repoInfo.website,
          license: repoInfo.license
        },
        usage: rateLimitResult.usage,
        limit: rateLimitResult.limit
      });
    } catch (readmeError) {
      console.error('Error processing GitHub repository:', readmeError);
      return NextResponse.json(
        { error: readmeError.message || 'Failed to process GitHub repository' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getReadmeContent(githubUrl) {
  try {
    // Parse the GitHub URL to extract owner and repo
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    // Construct the raw README URL
    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

    // Fetch the README content
    const response = await fetch(readmeUrl);

    if (!response.ok) {
      // Try fallback to master branch if main doesn't exist
      const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const fallbackResponse = await fetch(fallbackUrl);

      if (!fallbackResponse.ok) {
        throw new Error('README not found in main or master branch');
      }

      return await fallbackResponse.text();
    }

    return await response.text();

  } catch (error) {
    console.error('Error fetching README:', error);
    throw new Error('Failed to fetch README content');
  }
}
