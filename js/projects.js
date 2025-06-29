// Personal disclaimer: VS Code github copilot autocomplete was used to help write this code.

// This contains all javascript for pulling data from the github API and displaying it similar to index.html 
// username is 'chrislambert-ky'



const GITHUB_USERNAME = 'chrislambert-ky';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// Function to fetch repositories from GitHub API
async function fetchGitHubRepos() {
    try 
    {
        const response = await fetch(`${GITHUB_API_URL}?sort=updated&per_page=100`, 
        {
            headers: 
            {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Portfolio-Page'
            }
        });
        
        if (!response.ok)
        {
            if (response.status === 404) 
                {throw new Error('GitHub user not found. Please check the username.');} 
            else if (response.status === 403) 
                {throw new Error('API rate limit exceeded. Please try again later.');} 
            else 
                {throw new Error(`HTTP error! status: ${response.status}`);}
        }
        
        const repos = await response.json();
        
        if (!Array.isArray(repos))
        {throw new Error('Invalid response format from GitHub API');}
        
        return repos.filter(repo => !repo.fork);
    } 
        catch (error) {console.error('Error fetching repositories:', error);throw error;}
}

function formatDate(dateString)
{
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', 
    { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function createProjectHTML(repo) 
{
    const updatedDate = formatDate(repo.updated_at);
    const stars = repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count}` : '';
    const forks = repo.forks_count > 0 ? `🔀 ${repo.forks_count}` : '';
    const language = repo.language || 'Not specified';
    
    let statsLine = `<li><b>Language:</b> ${language}</li>`;
    statsLine += `<li><b>Updated:</b> ${updatedDate}</li>`;
    if (stars) statsLine += `<li><b>Stars:</b> ${stars}</li>`;
    if (forks) statsLine += `<li><b>Forks:</b> ${forks}</li>`;
    if (repo.homepage) statsLine += `<li><b>Demo:</b> <a href="${repo.homepage}" target="_blank" rel="noopener">🔗 Live Demo</a></li>`;
    
    return `
        <div class="project">
            <h3><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h3>
            <ul class="job-details">
                <li><b>Description:</b> ${repo.description || 'No description available'}</li>
                ${statsLine}
            </ul>
        </div>
    `;
}

function renderProjects(repos) {
    const container = document.getElementById('projects-container');
    const projectsHTML = repos.map(repo => createProjectHTML(repo)).join('');
    container.innerHTML = projectsHTML;
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    const loadingDiv = document.getElementById('loading');
    
    loadingDiv.style.display = 'none';
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = `Error loading projects: ${message}`;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
}

async function loadProjects() {
    try {
        const repos = await fetchGitHubRepos();
        hideLoading();
        renderProjects(repos);
    } catch (error) {
        showError(error.message);
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);
