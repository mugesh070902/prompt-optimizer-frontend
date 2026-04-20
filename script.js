const API_BASE = "https://prompt-optimizer-d29x.onrender.com/api";

async function generate() {

  const desc = document.getElementById("desc").value;
  const frontend = document.getElementById("frontend").value;
  const backend = document.getElementById("backend").value;
  const database = document.getElementById("database").value;

  document.getElementById("promptBox").innerText = "⏳ Generating...";
  document.getElementById("agentBox").innerText = "";
  document.getElementById("tokens").innerText = "0";
  document.getElementById("cost").innerText = "0.000000";

  try {

    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ desc, frontend, backend, database })
    });

    // 🔥 CHECK RESPONSE FIRST
    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const text = await res.text();

    // 🔥 SAFE PARSE
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON response");
    }

    console.log("API RESPONSE:", data); // 🔍 debug

    // 🔥 SAFE UI UPDATE
    document.getElementById("promptBox").innerText =
      data.improvedPrompt || "⚠️ No prompt returned";

    document.getElementById("agentBox").innerText =
      data.agentMd || "⚠️ No agent.md returned";

    document.getElementById("tokens").innerText =
      data.savedTokens || 0;

    document.getElementById("cost").innerText =
      data.savedCost ? Number(data.savedCost).toFixed(6) : "0.000000";

    loadHistory();

  } catch (err) {

    console.error("ERROR:", err);

    document.getElementById("promptBox").innerText =
      "❌ Error: " + err.message;

    document.getElementById("agentBox").innerText =
      "Check backend / console";
  }
}

async function loadHistory() {

  const res = await fetch(`${API_BASE}/history`);
  const data = await res.json();

  const box = document.getElementById("history");
  box.innerHTML = "";

  data.reverse().forEach(item => {
    box.innerHTML += `
      <div class="history-item">
        <b>Prompt:</b> ${item.prompt || "N/A"}<br>
        <b>Tokens:</b> ${item.optimizedTokens || 0}
      </div>
    `;
  });
}

function copyPrompt() {
  navigator.clipboard.writeText(document.getElementById("promptBox").innerText);
}

function copyAgent() {
  navigator.clipboard.writeText(document.getElementById("agentBox").innerText);
}

loadHistory();