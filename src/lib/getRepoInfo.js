/**
 * Fetches additional repository information from GitHub API
 * @param {string} githubUrl - The GitHub repository URL
 * @returns {Object} Repository information including stars, version, website, and license
 */
export async function getRepoInfo(githubUrl) {
  try {
    // Parse the GitHub URL to extract owner and repo
    const urlParts = githubUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL format');
    }

    // Fetch repository information from GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Repo-Info-Fetcher'
      }
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error('Repository not found');
      }
      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData = await repoResponse.json();

    // Fetch latest release information
    let latestVersion = null;
    try {
      const releaseResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Repo-Info-Fetcher'
        }
      });

      if (releaseResponse.ok) {
        const releaseData = await releaseResponse.json();
        latestVersion = releaseData.tag_name;
      }
    } catch (releaseError) {
      console.warn('Could not fetch latest release:', releaseError.message);
    }

    // If no release found, try to get the latest tag
    if (!latestVersion) {
      try {
        const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Repo-Info-Fetcher'
          }
        });

        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          if (tagsData.length > 0) {
            latestVersion = tagsData[0].name;
          }
        }
      } catch (tagError) {
        console.warn('Could not fetch latest tag:', tagError.message);
      }
    }

    return {
      stars: repoData.stargazers_count || 0,
      version: latestVersion || 'No releases found',
      website: repoData.homepage || repoData.html_url,
      license: repoData.license?.name || 'No license specified',
      description: repoData.description || '',
      language: repoData.language || '',
      forks: repoData.forks_count || 0,
      watchers: repoData.watchers_count || 0,
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at
    };

  } catch (error) {
    console.error('Error fetching repository info:', error);
    throw new Error(`Failed to fetch repository information: ${error.message}`);
  }
}

/**
 * Fetches only basic repository information (stars, version, website, license)
 * @param {string} githubUrl - The GitHub repository URL
 * @returns {Object} Basic repository information
 */
export async function getBasicRepoInfo(githubUrl) {
  try {
    const repoInfo = await getRepoInfo(githubUrl);
    
    return {
      stars: repoInfo.stars,
      version: repoInfo.version,
      website: repoInfo.website,
      license: repoInfo.license
    };
  } catch (error) {
    console.error('Error fetching basic repository info:', error);
    throw error;
  }
}
