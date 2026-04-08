/**
 * AI Prompt Optimizer - Frontend Application
 * Vanilla JavaScript with fetch() API for backend communication
 */

// ============================================
// Configuration
// ============================================

const API_BASE_URL = 'http://localhost:8080/api';
const NOTIFICATION_TIMEOUT = 3000;

// ============================================
// DOM Elements
// ============================================

const promptForm = document.getElementById('promptForm');
const promptInput = document.getElementById('promptInput');
const charCount = document.getElementById('charCount');
const loadingSpinner = document.getElementById('loadingSpinner');

const analyzerSection = document.querySelector('.analyzer-section');
const resultsSection = document.getElementById('resultsSection');
const historySection = document.getElementById('historySection');

const scoreValue = document.getElementById('scoreValue');
const scoreDescription = document.getElementById('scoreDescription');
const issuesList = document.getElementById('issuesList');
const improvedPromptBox = document.getElementById('improvedPromptBox');

const copyButton = document.getElementById('copyButton');
const backButton = document.getElementById('backButton');
const viewHistoryButton = document.getElementById('viewHistoryButton');
const backFromHistoryButton = document.getElementById('backFromHistoryButton');

const notification = document.getElementById('notification');
const historyList = document.getElementById('historyList');
const historyStats = document.getElementById('historyStats');

// ============================================
// State Management
// ============================================

let currentAnalysis = null;
let currentPage = 0;
const pageSize = 10;

// ============================================
// Event Listeners
// ============================================

// Form submission
promptForm.addEventListener('submit', handleFormSubmit);

// Character counter
promptInput.addEventListener('input', updateCharCount);

// Buttons
copyButton.addEventListener('click', copyToClipboard);
backButton.addEventListener('click', showAnalyzer);
backFromHistoryButton.addEventListener('click', showAnalyzer);
viewHistoryButton.addEventListener('click', loadAndShowHistory);

// ============================================
// Main Functions
// ============================================

/**
 * Handle form submission - analyze prompt
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    const promptText = promptInput.value.trim();

    if (!promptText) {
        showNotification('Please enter a prompt', 'error');
        return;
    }

    if (promptText.length < 10) {
        showNotification('Prompt must be at least 10 characters', 'error');
        return;
    }

    // Show loading state
    showLoadingState(true);

    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: promptText })
        });

        if (!response.ok) {
            const error = await parseJsonSafe(response);
            throw new Error(error?.message || error?.error || `HTTP ${response.status}`);
        }

        const data = await parseJsonSafe(response);
        currentAnalysis = data;

        // Display results
        displayResults(data);
        showResults();
        showNotification('Analysis complete!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        showLoadingState(false);
    }
}

/**
 * Display analysis results
 */
function displayResults(analysis) {
    // Score
    scoreValue.textContent = Math.round(analysis.analysisScore);
    const scoreLevel = getScoreLevel(analysis.analysisScore);
    scoreDescription.textContent = scoreLevel.description;
    scoreDescription.style.color = scoreLevel.color;

    // Issues
    displayIssues(analysis.issues);

    // Improved prompt
    improvedPromptBox.innerHTML = escapeHtml(analysis.improvedPrompt);
    document.getElementById("agentMdBox").textContent = analysis.agentMd || "No markdown available";
}

/**
 * Display issues list
 */
function displayIssues(issues) {
    issuesList.innerHTML = '';

    if (!issues || issues.length === 0) {
        issuesList.innerHTML = '<div class="issues-list empty">✅ No issues detected! Your prompt is well-structured.</div>';
        return;
    }

    issues.forEach(issue => {
        const issueElement = document.createElement('div');
        issueElement.className = 'issue-item';
        issueElement.innerHTML = `
            <span class="issue-icon">⚠️</span>
            <span class="issue-text">${escapeHtml(issue)}</span>
        `;
        issuesList.appendChild(issueElement);
    });
}

/**
 * Load and display history
 */
async function loadAndShowHistory() {
    try {
        showLoadingState(true);

        // Fetch stats
        const statsResponse = await fetch(`${API_BASE_URL}/stats`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats');
        const stats = await statsResponse.json();

        historyStats.innerHTML = `<p>Total prompts analyzed: <strong>${stats.totalPrompts}</strong></p>`;

        // Fetch history
        const historyResponse = await fetch(
            `${API_BASE_URL}/history?page=${currentPage}&size=${pageSize}`
        );

        if (!historyResponse.ok) throw new Error('Failed to fetch history');
        const historyData = await historyResponse.json();

        displayHistoryItems(historyData.content || []);
        showHistory();
        showNotification('History loaded', 'success');
    } catch (error) {
        console.error('Error loading history:', error);
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        showLoadingState(false);
    }
}

/**
 * Display history items
 */
function displayHistoryItems(items) {
    historyList.innerHTML = '';

    if (!items || items.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No prompts in history yet. Analyze your first prompt! 🚀</div>';
        return;
    }

    items.forEach(item => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';

        const date = new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const scoreColor = getScoreLevel(item.analysisScore).color;

        historyElement.innerHTML = `
            <div class="history-item__header">
                <div>
                    <div class="history-item__text">
                        ${escapeHtml(item.promptText.substring(0, 80))}${item.promptText.length > 80 ? '...' : ''}
                    </div>
                    <div class="history-item__date">${date}</div>
                </div>
                <div class="history-item__score" style="background-color: ${scoreColor}">
                    ${Math.round(item.analysisScore)}%
                </div>
            </div>
            <div class="history-item__actions">
                <button class="btn btn--outline" onclick="viewHistoryDetail(${item.id})">View Details</button>
                <button class="btn btn--outline" onclick="deleteHistoryItem(${item.id})">Delete</button>
            </div>
        `;

        historyList.appendChild(historyElement);
    });
}

/**
 * View detailed history item
 */
async function viewHistoryDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/history/${id}`);
        if (!response.ok) throw new Error('Failed to fetch prompt details');

        const detail = await response.json();
        currentAnalysis = detail;
        displayResults(detail);
        showResults();
        showNotification('Details loaded', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Delete history item
 */
async function deleteHistoryItem(id) {
    if (!confirm('Are you sure you want to delete this prompt?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/history/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete prompt');

        showNotification('Prompt deleted', 'success');
        loadAndShowHistory(); // Reload history
    } catch (error) {
        console.error('Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Copy improved prompt to clipboard
 */
async function copyToClipboard() {
    if (!currentAnalysis) return;

    try {
        await navigator.clipboard.writeText(currentAnalysis.improvedPrompt);
        showNotification('Copied to clipboard!', 'success');
        copyButton.textContent = '✅ Copied!';
        setTimeout(() => {
            copyButton.textContent = '📋 Copy to Clipboard';
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        showNotification('Failed to copy', 'error');
    }
}

/**
 * Download agent.md as a file
 */
function downloadMarkdown() {
    if (!currentAnalysis || !currentAnalysis.agentMd) {
        showNotification('No agent.md available to download', 'error');
        return;
    }

    const blob = new Blob([currentAnalysis.agentMd], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('agent.md downloaded!', 'success');
}

// ============================================
// UI State Management
// ============================================

/**
 * Show analyzer section, hide others
 */
function showAnalyzer() {
    analyzerSection.style.display = 'block';
    resultsSection.style.display = 'none';
    historySection.style.display = 'none';
    promptInput.value = '';
    updateCharCount();
}

/**
 * Show results section
 */
function showResults() {
    analyzerSection.style.display = 'none';
    resultsSection.style.display = 'block';
    historySection.style.display = 'none';
    window.scrollTo(0, 0);
}

/**
 * Show history section
 */
function showHistory() {
    analyzerSection.style.display = 'none';
    resultsSection.style.display = 'none';
    historySection.style.display = 'block';
    window.scrollTo(0, 0);
}

/**
 * Show/hide loading spinner
 */
function showLoadingState(isLoading) {
    if (isLoading) {
        loadingSpinner.style.display = 'inline-block';
        promptForm.querySelector('button').disabled = true;
    } else {
        loadingSpinner.style.display = 'none';
        promptForm.querySelector('button').disabled = false;
    }
}

/**
 * Update character counter
 */
function updateCharCount() {
    const length = promptInput.value.length;
    charCount.textContent = length;
    
    // Visual feedback for length
    if (length < 10) {
        charCount.style.color = '#ef4444'; // Red
    } else if (length < 50) {
        charCount.style.color = '#f59e0b'; // Amber
    } else {
        charCount.style.color = '#10b981'; // Green
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get score level description and color
 */
function getScoreLevel(score) {
    if (score >= 80) {
        return { description: 'Excellent! Well-structured prompt', color: '#10b981' };
    } else if (score >= 60) {
        return { description: 'Good prompt with minor improvements needed', color: '#3b82f6' };
    } else if (score >= 40) {
        return { description: 'Fair - Consider addressing identified issues', color: '#f59e0b' };
    } else {
        return { description: 'Needs improvement - Multiple issues detected', color: '#ef4444' };
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, NOTIFICATION_TIMEOUT);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function parseJsonSafe(response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Prompt Optimizer loaded');
    console.log('API Base URL:', API_BASE_URL);
    
    // Test API connection
    fetch(`${API_BASE_URL}/health`)
        .then(res => res.json())
        .then(data => console.log('Backend health check:', data))
        .catch(err => console.warn('Backend not available:', err.message));
});

function downloadMarkdown() {
    if (!currentAnalysis || !currentAnalysis.agentMd) {
        showNotification("No markdown available!", "error");
        return;
    }

    const blob = new Blob([currentAnalysis.agentMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "agent.md";
    a.click();

    URL.revokeObjectURL(url);
}
