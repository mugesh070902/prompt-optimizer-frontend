const API_BASE = "https://prompt-optimizer-d29x.onrender.com/api"; 
 
const descEl = document.getElementById("desc"); 
const frontendEl = document.getElementById("frontend"); 
const backendEl = document.getElementById("backend"); 
const databaseEl = document.getElementById("database"); 
 
const promptBox = document.getElementById("promptBox"); 
const agentBox = document.getElementById("agentBox"); 
const originalBox = document.getElementById("originalBox"); 
const optimizedCompareBox = document.getElementById("optimizedCompareBox"); 
const insightBox = document.getElementById("insightBox"); 
 
const tokensEl = document.getElementById("tokens"); 
const costEl = document.getElementById("cost"); 
const generateBtn = document.getElementById("generateBtn"); 
const btnText = generateBtn.querySelector(".btn-text"); 
const btnLoader = generateBtn.querySelector(".btn-loader"); 
 
const statusText = document.getElementById("statusText"); 
const statusSubtext = document.getElementById("statusSubtext"); 
 
const heroHistoryCount = document.getElementById("heroHistoryCount"); 
const heroTokenCount = document.getElementById("heroTokenCount"); 
const heroCostCount = document.getElementById("heroCostCount"); 
 
const historySidebar = document.getElementById("historySidebar"); 
const sidebar = document.getElementById("sidebar"); 
const overlay = document.getElementById("overlay"); 
 
const themeIcon = document.getElementById("themeIcon"); 
const themeText = document.getElementById("themeText"); 
 
const missingRequirements = document.getElementById("missingRequirements"); 
const overallScoreBadge = document.getElementById("overallScoreBadge"); 
const stackBadges = document.getElementById("stackBadges"); 
 
let historyStore = []; 
let activeHistoryIndex = -1; 
 
const templates = { 
  adminDashboard: { 
    desc: "Build a role-based admin dashboard for a business operations platform with secure login, analytics charts, user management, notifications, settings, activity logs, responsive UI, and API integrations. Include clean architecture, reusable components, error handling, search, filters, pagination, and deployment readiness.", 
    frontend: "React", 
    backend: "Spring Boot", 
    database: "MySQL" 
  }, 
  ecommerce: { 
    desc: "Create a full-stack e-commerce platform with product catalog, category filters, cart, wishlist, secure checkout, payment integration, order management, admin panel, inventory tracking, authentication, responsive design, and performance optimization. Include REST APIs, validation, and deployment support.", 
    frontend: "Next.js", 
    backend: "Node.js", 
    database: "PostgreSQL" 
  }, 
  resumeAnalyzer: { 
    desc: "Develop an AI-powered resume analyzer that accepts resume text or file upload, extracts skills, compares them against job descriptions, shows match score, highlights missing skills, suggests improvements, displays charts, and provides a learning roadmap. Include authentication, result history, and polished UI.", 
    frontend: "React", 
    backend: "Spring Boot", 
    database: "MySQL" 
  }, 
  crm: { 
    desc: "Build a CRM platform to manage leads, customers, sales pipeline, follow-ups, notes, task reminders, team collaboration, status tracking, analytics dashboard, and role-based access. Include search, filters, audit logs, notifications, API design, and scalable database structure.", 
    frontend: "Vue.js", 
    backend: "Laravel", 
    database: "MySQL" 
  }, 
  ats: { 
    desc: "Create an applicant tracking system with candidate profiles, job posting management, resume screening, interview stages, recruiter dashboard, status updates, search, filters, analytics, and communication history. Include authentication, role-based access, API integration, and responsive design.", 
    frontend: "Next.js", 
    backend: "FastAPI", 
    database: "PostgreSQL" 
  }, 
  studentManagement: { 
    desc: "Design a student management system with student records, attendance tracking, marks management, teacher dashboard, subject allocation, parent communication, report generation, role-based login, notifications, responsive UI, and admin analytics. Include secure APIs and structured database relationships.", 
    frontend: "Angular", 
    backend: "Spring Boot", 
    database: "MySQL" 
  } 
}; 
 
function openSidebar() { 
  sidebar.classList.add("open"); 
  overlay.classList.add("show"); 
} 
 
function closeSidebar() { 
  sidebar.classList.remove("open"); 
  overlay.classList.remove("show"); 
} 
 
function applyTheme(theme) { 
  if (theme === "light") { 
    document.body.classList.add("light-mode"); 
    themeIcon.textContent = "☀️"; 
    themeText.textContent = "Light"; 
  } else { 
    document.body.classList.remove("light-mode"); 
    themeIcon.textContent = "🌙"; 
    themeText.textContent = "Dark"; 
  } 
  localStorage.setItem("promptpilot-theme", theme); 
} 
 
function toggleTheme() { 
  const isLight = document.body.classList.contains("light-mode"); 
  applyTheme(isLight ? "dark" : "light"); 
} 
 
function loadSavedTheme() { 
  const savedTheme = localStorage.getItem("promptpilot-theme") || "dark"; 
  applyTheme(savedTheme); 
} 
 
function applyTemplate(templateKey) { 
  const template = templates[templateKey]; 
  if (!template) return; 
 
  descEl.value = template.desc; 
  frontendEl.value = template.frontend; 
  backendEl.value = template.backend; 
  databaseEl.value = template.database; 
 
  originalBox.textContent = template.desc; 
  updateStackBadges(); 
  setStatus("success", "Template Loaded", "Project template added to workspace"); 
  showToast("Template applied"); 
} 
 
function switchTab(tabId, button) { 
  document.querySelectorAll(".tab-panel").forEach((panel) => { 
    panel.classList.remove("active"); 
  }); 
 
  document.querySelectorAll(".tab-btn").forEach((btn) => { 
    btn.classList.remove("active"); 
  }); 
 
  document.getElementById(tabId).classList.add("active"); 
  button.classList.add("active"); 
} 
 
function updateStackBadges() { 
  const frontend = frontendEl.value; 
  const backend = backendEl.value; 
  const database = databaseEl.value; 
 
  const badges = []; 
  if (frontend) badges.push(`<span class="stack-badge frontend">🎨 ${frontend}</span>`); 
  if (backend) badges.push(`<span class="stack-badge backend">⚙️ ${backend}</span>`); 
  if (database) badges.push(`<span class="stack-badge database">🗄️ ${database}</span>`); 
 
  stackBadges.innerHTML = badges.length 
    ? badges.join("") 
    : `<div class="empty-badge">Selected stack badges will appear here...</div>`; 
} 
 
function setLoadingState(isLoading) { 
  generateBtn.disabled = isLoading; 
 
  if (isLoading) { 
    btnText.textContent = "Generating..."; 
    btnLoader.classList.remove("hidden"); 
 
    promptBox.innerHTML = ` 
      <div class="loading-state"> 
        <span class="spinner"></span> 
        <span>Analyzing your project brief and generating optimized prompt...</span> 
      </div> 
    `; 
 
    agentBox.innerHTML = ` 
      <div class="loading-state"> 
        <span class="spinner"></span> 
        <span>Preparing agent.md instructions...</span> 
      </div> 
    `; 
 
    optimizedCompareBox.innerHTML = ` 
      <div class="loading-state"> 
        <span class="spinner"></span> 
        <span>Preparing comparison view...</span> 
      </div> 
    `; 
 
    insightBox.innerHTML = `<div class="empty-block">Generating insights...</div>`; 
    missingRequirements.innerHTML = `<div class="empty-block">Checking missing requirements...</div>`; 
 
    statusText.textContent = "Processing"; 
    statusSubtext.textContent = "Generating optimized outputs"; 
  } else { 
    btnText.textContent = "Generate Optimized Output"; 
    btnLoader.classList.add("hidden"); 
  } 
} 
 
function setStatus(type, title, subtitle) { 
  statusText.textContent = title; 
  statusSubtext.textContent = subtitle; 
 
  statusText.classList.remove("error-text", "success-text"); 
 
  if (type === "error") { 
    statusText.classList.add("error-text"); 
  } else if (type === "success") { 
    statusText.classList.add("success-text"); 
  } 
} 
 
function showToast(message) { 
  const toast = document.getElementById("toast"); 
  toast.textContent = message; 
  toast.classList.add("show"); 
 
  clearTimeout(showToast.toastTimer); 
  showToast.toastTimer = setTimeout(() => { 
    toast.classList.remove("show"); 
  }, 2200); 
} 
 
function sanitizeText(value) { 
  if (value === null || value === undefined) return ""; 
  return String(value); 
} 
 
function truncateText(text, maxLength) { 
  if (!text) return ""; 
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text; 
} 
 
function formatRelativeTime(indexFromEnd) { 
  if (indexFromEnd === 0) return "Just now"; 
  if (indexFromEnd === 1) return "1 item ago"; 
  return `${indexFromEnd} items ago`; 
} 
 
function setActiveHistory(index) { 
  activeHistoryIndex = index; 
 
  const items = document.querySelectorAll(".history-chat-item"); 
  items.forEach((item, i) => { 
    item.classList.toggle("active", i === index); 
  }); 
} 
 
function updateProgress(id, score) { 
  document.getElementById(id).style.width = `${score}%`; 
} 
 
function calculatePromptQuality(originalInput, improvedPrompt) { 
  const promptText = (improvedPrompt || "").toLowerCase(); 
  const originalText = (originalInput || "").toLowerCase(); 
 
  const clarityKeywords = ["build", "create", "design", "develop", "include", "should", "must"]; 
  const technicalKeywords = ["api", "database", "authentication", "architecture", "frontend", "backend", "deployment", "validation", "responsive", "integration"]; 
  const businessKeywords = ["user", "admin", "customer", "business", "workflow", "dashboard", "analytics", "management"]; 
  const reuseKeywords = ["scalable", "reusable", "modular", "maintainable", "clean architecture", "structured"]; 
  const aiKeywords = ["prompt", "context", "requirements", "tasks", "output", "steps", "constraints"]; 
 
  function scoreByKeywords(text, keywords, max) { 
    let score = 0; 
    keywords.forEach((keyword) => { 
      if (text.includes(keyword)) score += Math.ceil(max / keywords.length); 
    }); 
    return Math.min(score, max); 
  } 
 
  const clarityScore = Math.min(100, 45 + Math.min(promptText.length / 12, 40) + scoreByKeywords(promptText, clarityKeywords, 20)); 
  const technicalScore = Math.min(100, 20 + scoreByKeywords(promptText, technicalKeywords, 80)); 
  const businessScore = Math.min(100, 20 + scoreByKeywords(promptText + " " + originalText, businessKeywords, 80)); 
  const reuseScore = Math.min(100, 25 + scoreByKeywords(promptText, reuseKeywords, 75)); 
  const aiScore = Math.min(100, 30 + scoreByKeywords(promptText, aiKeywords, 70)); 
 
  const overall = Math.round((clarityScore + technicalScore + businessScore + reuseScore + aiScore) / 5); 
 
  return { 
    clarityScore: Math.round(clarityScore), 
    technicalScore: Math.round(technicalScore), 
    businessScore: Math.round(businessScore), 
    reuseScore: Math.round(reuseScore), 
    aiScore: Math.round(aiScore), 
    overall 
  }; 
} 
 
function renderQualityScores(scores) { 
  document.getElementById("clarityScore").textContent = scores.clarityScore; 
  document.getElementById("technicalScore").textContent = scores.technicalScore; 
  document.getElementById("businessScore").textContent = scores.businessScore; 
  document.getElementById("reuseScore").textContent = scores.reuseScore; 
  document.getElementById("aiScore").textContent = scores.aiScore; 
  overallScoreBadge.textContent = `${scores.overall}/100`; 
 
  updateProgress("clarityBar", scores.clarityScore); 
  updateProgress("technicalBar", scores.technicalScore); 
  updateProgress("businessBar", scores.businessScore); 
  updateProgress("reuseBar", scores.reuseScore); 
  updateProgress("aiBar", scores.aiScore); 
} 
 
function detectMissingRequirements(inputText) { 
  const text = (inputText || "").toLowerCase(); 
  const checks = [ 
    { key: "authentication", title: "Authentication / Authorization", hint: "Mention login, roles, permissions, or access control." }, 
    { key: "database", title: "Database Design", hint: "Mention database tables, relationships, or storage layer." }, 
    { key: "api", title: "API / Backend Flow", hint: "Mention REST APIs, endpoints, or backend processing." }, 
    { key: "error", title: "Error Handling", hint: "Mention validation, fallback states, or exception handling." }, 
    { key: "responsive", title: "Responsive Design", hint: "Mention mobile, tablet, and desktop adaptation." }, 
    { key: "deploy", title: "Deployment Readiness", hint: "Mention hosting, deployment, or production environment." }, 
    { key: "search", title: "Search / Filter Experience", hint: "Mention search, filter, sort, or pagination if needed." }, 
    { key: "analytics", title: "Analytics / Reporting", hint: "Mention charts, reports, or insight generation where relevant." } 
  ]; 
 
  return checks.filter((item) => !text.includes(item.key)); 
} 
 
function renderMissingRequirements(items) { 
  if (!items.length) { 
    missingRequirements.innerHTML = ` 
      <div class="detector-item"> 
        <h4>Looks Strong</h4> 
        <p>Your input already covers most important functional requirements.</p> 
      </div> 
    `; 
    return; 
  } 
 
  missingRequirements.innerHTML = items.map((item) => ` 
    <div class="detector-item"> 
      <h4>${item.title}</h4> 
      <p>${item.hint}</p> 
    </div> 
  `).join(""); 
} 
 
function generateInsights(desc, frontend, backend, database, scores, missingItems) { 
  const insights = [ 
    { 
      title: "Stack Selection", 
      text: `Selected stack: ${frontend || "No frontend selected"} + ${backend || "No backend selected"} + ${database || "No database selected"}.` 
    }, 
    { 
      title: "Prompt Strength", 
      text: `Overall quality score is ${scores.overall}/100. Strong prompts include user roles, modules, APIs, validations, edge cases, and deployment context.` 
    }, 
    { 
      title: "Requirement Coverage", 
      text: missingItems.length 
        ? `Your input is missing ${missingItems.length} important areas. Adding them can improve output quality.` 
        : "Your project input covers most major requirement areas well." 
    }, 
    { 
      title: "Optimization Suggestion", 
      text: "For enterprise-level prompts, include architecture, security flow, API contracts, database entities, and expected deliverables." 
    } 
  ]; 
 
  insightBox.innerHTML = insights.map((item) => ` 
    <div class="insight-item"> 
      <h4>${item.title}</h4> 
      <p>${item.text}</p> 
    </div> 
  `).join(""); 
} 
 
function exportContent(type, extension) { 
  let text = ""; 
  let filename = ""; 
 
  if (type === "prompt") { 
    text = promptBox.textContent.trim(); 
    filename = extension === "md" ? "prompt-output.md" : "prompt-output.txt"; 
  } else if (type === "agent") { 
    text = agentBox.textContent.trim(); 
    filename = extension === "md" ? "agent-output.md" : "agent-output.txt"; 
  } 
 
  if (!text || text.includes("will appear here")) { 
    showToast("No content to export"); 
    return; 
  } 
 
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" }); 
  const url = URL.createObjectURL(blob); 
  const link = document.createElement("a"); 
  link.href = url; 
  link.download = filename; 
  link.click(); 
  URL.revokeObjectURL(url); 
 
  showToast(`${filename} downloaded`); 
} 
 
function loadHistoryItem(index) { 
  const item = historyStore[index]; 
  if (!item) return; 
 
  const promptText = item.improvedPrompt || item.prompt || "No prompt available."; 
  const agentText = item.agentMd || item.agent || "No agent.md available."; 
  const savedTokens = Number(item.savedTokens || item.optimizedTokens || 0); 
  const savedCost = Number(item.savedCost || 0); 
  const originalDesc = item.originalDesc || item.desc || item.projectDescription || ""; 
 
  promptBox.textContent = promptText; 
  agentBox.textContent = agentText; 
  originalBox.textContent = originalDesc || "No original input available."; 
  optimizedCompareBox.textContent = promptText; 
 
  tokensEl.textContent = savedTokens; 
  costEl.textContent = savedCost.toFixed(6); 
 
  descEl.value = originalDesc; 
  frontendEl.value = item.frontend || ""; 
  backendEl.value = item.backend || ""; 
  databaseEl.value = item.database || ""; 
  updateStackBadges(); 
 
  const scores = calculatePromptQuality(originalDesc, promptText); 
  renderQualityScores(scores); 
 
  const missing = detectMissingRequirements(originalDesc); 
  renderMissingRequirements(missing); 
  generateInsights(originalDesc, frontendEl.value, backendEl.value, databaseEl.value, scores, missing); 
 
  setStatus("success", "Loaded", "History item loaded into workspace"); 
  setActiveHistory(index); 
  closeSidebar(); 
} 
 
function renderHistorySidebar(data) { 
  if (!Array.isArray(data) || data.length === 0) { 
    historySidebar.innerHTML = `<div class="empty-history">No history available yet.</div>`; 
    heroHistoryCount.textContent = "0"; 
    heroTokenCount.textContent = "0"; 
    heroCostCount.textContent = "$0.000000"; 
    return; 
  } 
 
  historySidebar.innerHTML = ""; 
  const reversedData = [...data].reverse(); 
  historyStore = reversedData; 
 
  reversedData.forEach((item, index) => { 
    const titleText = sanitizeText( 
      item.originalDesc || 
      item.desc || 
      item.prompt || 
      item.improvedPrompt || 
      "Untitled optimization" 
    ); 
 
    const tokenValue = Number(item.optimizedTokens || item.savedTokens || 0); 
 
    const chatItem = document.createElement("div"); 
    chatItem.className = "history-chat-item"; 
    chatItem.innerHTML = ` 
      <div class="history-chat-title">${truncateText(titleText, 50)}</div> 
      <div class="history-chat-meta"> 
        <span class="history-chat-token">${tokenValue} tokens</span> 
        <span class="history-chat-time">${formatRelativeTime(index)}</span> 
      </div> 
    `; 
 
    chatItem.addEventListener("click", () => { 
      loadHistoryItem(index); 
    }); 
 
    historySidebar.appendChild(chatItem); 
  }); 
 
  heroHistoryCount.textContent = reversedData.length; 
  const totalTokens = reversedData.reduce((sum, item) => sum + Number(item.optimizedTokens || item.savedTokens || 0), 0); 
  heroTokenCount.textContent = totalTokens; 
  const latestCost = Number(reversedData[0]?.savedCost || 0); 
  heroCostCount.textContent = `$${latestCost.toFixed(6)}`; 
} 
 
async function generate() { 
  const desc = descEl.value.trim(); 
  const frontend = frontendEl.value; 
  const backend = backendEl.value; 
  const database = databaseEl.value; 
 
  if (!desc) { 
    setStatus("error", "Missing Input", "Please describe your project first"); 
    promptBox.textContent = "Please enter your project description before generating."; 
    agentBox.textContent = "agent.md generation is waiting for project input."; 
    originalBox.textContent = "Please enter your project description first."; 
    optimizedCompareBox.textContent = "Optimized output will appear after generation."; 
    showToast("Please enter project description"); 
    descEl.focus(); 
    return; 
  } 
 
  setLoadingState(true); 
  originalBox.textContent = desc; 
  tokensEl.textContent = "0"; 
  costEl.textContent = "0.000000"; 
 
  try { 
    const res = await fetch(`${API_BASE}/analyze`, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json" 
      }, 
      body: JSON.stringify({ desc, frontend, backend, database }) 
    }); 
 
    if (!res.ok) { 
      throw new Error(`Server error: ${res.status}`); 
    } 
 
    const text = await res.text(); 
 
    let data; 
    try { 
      data = JSON.parse(text); 
    } catch { 
      throw new Error("Invalid JSON response from server"); 
    } 
 
    const improvedPrompt = sanitizeText(data.improvedPrompt) || "No prompt returned from backend."; 
    const agentMd = sanitizeText(data.agentMd) || "No agent.md returned from backend."; 
 
    promptBox.textContent = improvedPrompt; 
    agentBox.textContent = agentMd; 
    optimizedCompareBox.textContent = improvedPrompt; 
 
    const savedTokens = Number(data.savedTokens || 0); 
    const savedCost = Number(data.savedCost || 0); 
 
    tokensEl.textContent = savedTokens; 
    costEl.textContent = savedCost.toFixed(6); 
 
    const scores = calculatePromptQuality(desc, improvedPrompt); 
    renderQualityScores(scores); 
 
    const missing = detectMissingRequirements(desc); 
    renderMissingRequirements(missing); 
    generateInsights(desc, frontend, backend, database, scores, missing); 
 
    setStatus("success", "Generated", "Optimized prompt and agent.md ready"); 
    showToast("Output generated successfully"); 
 
    await loadHistory(); 
  } catch (err) { 
    console.error("ERROR:", err); 
    promptBox.textContent = `Error: ${err.message}`; 
    agentBox.textContent = "Please check backend status, API response, or browser console."; 
    optimizedCompareBox.textContent = "Unable to compare because generation failed."; 
    setStatus("error", "Failed", err.message); 
    showToast("Generation failed"); 
  } finally { 
    setLoadingState(false); 
  } 
} 
 
function copyPrompt() { 
  const text = promptBox.textContent.trim(); 
  if (!text || text === "Your optimized prompt will appear here...") { 
    showToast("No prompt to copy"); 
    return; 
  } 
 
  navigator.clipboard.writeText(text) 
    .then(() => showToast("Prompt copied")) 
    .catch(() => showToast("Copy failed")); 
} 
 
function copyAgent() { 
  const text = agentBox.textContent.trim(); 
  if (!text || text === "Generated agent instructions will appear here...") { 
    showToast("No agent.md to copy"); 
    return; 
  } 
 
  navigator.clipboard.writeText(text) 
    .then(() => showToast("agent.md copied")) 
    .catch(() => showToast("Copy failed")); 
} 
 
async function loadHistory() { 
  try { 
    const res = await fetch(`${API_BASE}/history`); 
 
    if (!res.ok) { 
      throw new Error(`History fetch failed: ${res.status}`); 
    } 
 
    const data = await res.json(); 
    renderHistorySidebar(data); 
  } catch (err) { 
    console.error("History load error:", err); 
    historySidebar.innerHTML = `<div class="empty-history">Unable to load history right now.</div>`; 
  } 
} 
 
function clearAll() { 
  descEl.value = ""; 
  frontendEl.value = ""; 
  backendEl.value = ""; 
  databaseEl.value = ""; 
 
  promptBox.textContent = "Your optimized prompt will appear here..."; 
  agentBox.textContent = "Generated agent instructions will appear here..."; 
  originalBox.textContent = "Your original project description will appear here..."; 
  optimizedCompareBox.textContent = "Your optimized prompt will appear here..."; 
  insightBox.innerHTML = `<div class="empty-block">Optimization insights will appear here...</div>`; 
  missingRequirements.innerHTML = `<div class="empty-block">Missing requirement insights will appear here...</div>`; 
 
  tokensEl.textContent = "0"; 
  costEl.textContent = "0.000000"; 
 
  renderQualityScores({ 
    clarityScore: 0, 
    technicalScore: 0, 
    businessScore: 0, 
    reuseScore: 0, 
    aiScore: 0, 
    overall: 0 
  }); 
 
  updateStackBadges(); 
  setStatus("success", "Ready", "Waiting for input"); 
  setActiveHistory(-1); 
  showToast("Workspace cleared"); 
} 
 
document.addEventListener("keydown", (e) => { 
  if (e.ctrlKey && e.key === "Enter") { 
    generate(); 
  } 
 
  if (e.key === "Escape") { 
    closeSidebar(); 
  } 
}); 
 
loadSavedTheme(); 
loadHistory(); 
updateStackBadges(); 
renderQualityScores({ 
  clarityScore: 0, 
  technicalScore: 0, 
  businessScore: 0, 
  reuseScore: 0, 
  aiScore: 0, 
  overall: 0 
});
