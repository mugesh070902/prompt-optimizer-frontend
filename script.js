/* =========================
   CONFIG
========================= */

const API_BASE = "https://prompt-optimizer-d29x.onrender.com/api";
const AUTH_API = "https://prompt-optimizer-d29x.onrender.com/api/auth";


/* =========================
   AUTH GUARD
========================= */

function requireLogin() {

 const publicPage =
   window.location.pathname.includes("login.html");

 if(!localStorage.getItem("token") && !publicPage){
     window.location.href="login.html";
 }

}

requireLogin();


/* =========================
   SIGNUP
========================= */

async function signup(){

 try{

 const name=
 document.getElementById("name").value.trim();

 const email=
 document.getElementById("email").value.trim();

 const password=
 document.getElementById("password").value.trim();


 if(!name || !email || !password){
   alert("Fill all fields");
   return;
 }


 const res=
 await fetch(`${AUTH_API}/signup`,{

 method:"POST",

 headers:{
 "Content-Type":"application/json"
 },

 body:JSON.stringify({
   name:name,
   email:email,
   password:password
 })

 });


 const msg=await res.text();

 alert(msg);

 }
 catch(e){

 alert("Signup failed");

 console.error(e);

 }

}



/* =========================
   LOGIN
========================= */

async function login(){

 try{

 const email=
 document.getElementById("email").value.trim();

 const password=
 document.getElementById("password").value.trim();


 const res=
 await fetch(`${AUTH_API}/login`,{

 method:"POST",

 headers:{
 "Content-Type":"application/json"
 },

 body:JSON.stringify({
 email:email,
 password:password
 })

 });


 const data=
 await res.json();


 if(data.token){

 localStorage.setItem(
 "token",
 data.token
 );

 localStorage.setItem(
 "userName",
 data.name || "User"
 );

 alert("Login Success");

 window.location.href="index.html";

 }

 else{

 alert("Invalid credentials");

 }

 }
 catch(e){

 console.error(e);

 alert("Login failed");

 }

}



/* =========================
   LOGOUT
========================= */

function logout(){

 localStorage.removeItem("token");
 localStorage.removeItem("userName");

 window.location.href="login.html";

}



/* =========================
   GENERATE PROMPT
========================= */

async function generate(){

 const desc=
 document.getElementById("desc").value;

 const frontend=
 document.getElementById("frontend").value;

 const backend=
 document.getElementById("backend").value;

 const database=
 document.getElementById("database").value;



 document.getElementById(
 "promptBox"
 ).innerText=
 "⏳ Generating...";


 document.getElementById(
 "agentBox"
 ).innerText="";


 try{

 const res=
 await fetch(
 `${API_BASE}/analyze`,
 {

 method:"POST",

 headers:{
 "Content-Type":"application/json",

 "Authorization":
 "Bearer "+
 localStorage.getItem("token")
 },

 body:JSON.stringify({

 desc:desc,
 frontend:frontend,
 backend:backend,
 database:database

 })

 });


 if(!res.ok){
 throw new Error(
 "Server Error "+res.status
 );
 }


 const data=
 await res.json();


 console.log(data);


 document.getElementById(
 "promptBox"
 ).innerText=
 data.improvedPrompt ||
 "No Prompt";


 document.getElementById(
 "agentBox"
 ).innerText=
 data.agentMd ||
 "No agent.md";


 document.getElementById(
 "tokens"
 ).innerText=
 data.savedTokens || 0;


 document.getElementById(
 "cost"
 ).innerText=
 data.savedCost
 ? Number(
 data.savedCost
 ).toFixed(6)
 : "0.000000";


 loadHistory();

 }

 catch(e){

 console.error(e);

 document.getElementById(
 "promptBox"
 ).innerText=
 "❌ "+e.message;

 }

}



/* =========================
   HISTORY
========================= */

async function loadHistory(){

 const box=
 document.getElementById(
 "history"
 );


 if(!box) return;


 try{

 const res=
 await fetch(
 `${API_BASE}/history`,
 {

 headers:{
 "Authorization":
 "Bearer "+
 localStorage.getItem("token")
 }

 });

 const data=
 await res.json();


 box.innerHTML="";


 if(!data.length){

 box.innerHTML=
 "<p>No History Yet</p>";

 return;
 }


 data.reverse().forEach(item=>{

 box.innerHTML+=`

 <div class="history-item">

 <b>Prompt:</b>
 ${item.prompt || "N/A"}

 <br>

 <b>Tokens:</b>
 ${item.optimizedTokens || 0}

 </div>

 `;

 });

 }

 catch(e){

 console.error(
 "History error",
 e
 );

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
   EXPORT AGENT MD
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

 a.href=
 URL.createObjectURL(blob);

 a.download=
 "agent.md";

 a.click();

}



/* =========================
   USER DISPLAY
========================= */

function loadUser(){

 let name=
 localStorage.getItem(
 "userName"
 );

 let userBox=
 document.getElementById(
 "userName"
 );

 if(userBox){
 userBox.innerText=
 name || "User";
 }

}

loadUser();



/* =========================
   AUTO LOAD HISTORY
========================= */

loadHistory();
