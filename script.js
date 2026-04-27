const API_BASE="https://prompt-optimizer-d29x.onrender.com/api";
const AUTH_API="https://prompt-optimizer-d29x.onrender.com/api/auth";


/* =========================
AUTH GUARD
========================= */

(function(){
const isLoginPage=
window.location.pathname.includes("login.html");

if(!isLoginPage && !localStorage.getItem("token")){
window.location="login.html";
}
})();


/* =========================
SIGNUP
========================= */

async function signup(){

try{

const name=document.getElementById("name").value.trim();
const email=document.getElementById("email").value.trim();
const password=document.getElementById("password").value.trim();

if(!name||!email||!password){
alert("Fill all fields");
return;
}

const res=await fetch(`${AUTH_API}/signup`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
password
})
});

alert(await res.text());

}catch(e){
console.error(e);
alert("Signup failed");
}

}


/* =========================
LOGIN
========================= */

async function login(){

try{

const email=document.getElementById("email").value.trim();
const password=document.getElementById("password").value.trim();

const res=await fetch(`${AUTH_API}/login`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
});

const data=await res.json();

if(data.token){

localStorage.setItem(
"token",
data.token
);

localStorage.setItem(
"userName",
data.name||"User"
);

window.location="index.html";

}else{
alert("Invalid credentials");
}

}catch(e){
console.error(e);
alert("Login failed");
}

}


/* =========================
LOGOUT
========================= */

function logout(){
localStorage.clear();
window.location="login.html";
}


/* =========================
GENERATE
========================= */

async function generate(){

const desc=document.getElementById("desc").value;
const frontend=document.getElementById("frontend").value;
const backend=document.getElementById("backend").value;
const database=document.getElementById("database").value;

if(!desc){
alert("Enter project description");
return;
}

document.getElementById(
"promptBox"
).innerText="Generating...";

try{

const res=await fetch(
`${API_BASE}/analyze`,
{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+localStorage.getItem("token")
},
body:JSON.stringify({
desc,
frontend,
backend,
database
})
}
);

if(!res.ok){
throw new Error(
"Server error "+res.status
);
}

const data=await res.json();

document.getElementById(
"promptBox"
).innerText=
data.improvedPrompt||"No prompt";

document.getElementById(
"agentBox"
).innerText=
data.agentMd||"No agent";

document.getElementById(
"tokens"
).innerText=
data.savedTokens||0;

document.getElementById(
"cost"
).innerText=
Number(
data.savedCost||0
).toFixed(6);

loadHistory();

}catch(e){
console.error(e);
document.getElementById(
"promptBox"
).innerText=
"Error: "+e.message;
}

}


/* =========================
LOAD HISTORY
========================= */

async function loadHistory(){

const box=
document.getElementById(
"history"
);

if(!box) return;

try{

const res=await fetch(
`${API_BASE}/history`,
{
headers:{
"Authorization":"Bearer "+
localStorage.getItem("token")
}
}
);

const data=await res.json();

box.innerHTML="";

if(!data.length){
box.innerHTML="<p>No history yet</p>";
return;
}

data.reverse().forEach(item=>{

box.innerHTML+=`
<div class='history-item'>
<b>Prompt:</b>
${item.prompt||"N/A"}
<br>
<b>Tokens:</b>
${item.optimizedTokens||0}
</div>
`;

});

}catch(e){
console.error(e);
}

}


/* =========================
COPY
========================= */

function copyPrompt(){

navigator.clipboard.writeText(
document.getElementById(
"promptBox"
).innerText
);

alert("Prompt copied");

}


function copyAgent(){

navigator.clipboard.writeText(
document.getElementById(
"agentBox"
).innerText
);

alert("Agent copied");

}


/* =========================
DOWNLOAD MD
========================= */

function downloadAgent(){

const text=
document.getElementById(
"agentBox"
).innerText;

const blob=
new Blob(
[text],
{type:"text/markdown"}
);

const a=
document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download="agent.md";
a.click();

}


/* =========================
LOAD USER
========================= */

function loadUser(){
const user=document.getElementById("userName");
if(user){
user.innerText=
localStorage.getItem("userName")||"User";
}
}

loadUser();
loadHistory();
