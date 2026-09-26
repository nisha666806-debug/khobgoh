import{auth,db,registrationAuth,registrationDb,onAuthStateChanged,signInWithEmailAndPassword,signOut,createUserWithEmailAndPassword,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,orderBy,limit,serverTimestamp,runTransaction,writeBatch,onSnapshot}from"./firebase.js";
 
const state={page:"dashboard",user:null,profile:null,students:[],rooms:[],supervisors:[],placements:[],residences:[],attendance:[],violations:[],cleanliness:[],teaRecipes:[],roster:[],activities:[],stageConfirms:[],stages:null,chat:[],dailySchedule:[],dutyLogs:[],wakeConfirms:[],wakeSettings:null,unsubs:[],_dutyNotified:false,_activityNotified:new Set()};
const $=id=>document.getElementById(id),uid=()=>auth.currentUser?.uid||"";
const isManager=()=>state.profile?.role==="manager",isHead=()=>state.profile?.role==="head",elevated=()=>isManager()||isHead();
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const jsStr=v=>String(v??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'");
const roomName=id=>state.rooms.find(r=>String(r.id)===String(id))?.name||"—";
const studentName=id=>state.students.find(s=>s.id===id)?.name||"—";
const supervisorName=id=>state.supervisors.find(s=>s.id===id)?.name||"—";
const currentResidence=id=>state.residences.find(r=>r.studentId===id&&!r.endDate)||null;
const residenceHistory=id=>state.residences.filter(r=>r.studentId===id).sort((a,b)=>String(a.startDate||"").localeCompare(String(b.startDate||"")));
const cap=r=>Number(r?.capacity||(r?.type==="supervisor"?4:8));
const roleLabel=r=>({manager:"Manager",head:"Сармураббӣ",supervisor:"Мураббӣ"})[r]||r||"—";
const DAY_KEYS=["sun","mon","tue","wed","thu","fri","sat"];
const DAY_LABELS={mon:"Душанбе",tue:"Сешанбе",wed:"Чоршанбе",thu:"Панҷшанбе",fri:"Ҷумъа",sat:"Шанбе",sun:"Якшанбе"};
const DEFAULT_STAGES=[{key:"start",label:"Кор оғоз шуд"},{key:"study",label:"Дарс тайёркунӣ оғоз шуд"},{key:"break",label:"Танаффус"},{key:"end",label:"Кор анҷом ёфт"}];
function closeModal(){$("modal")?.classList.add("hidden")}
function modal(h){$("modalContent").innerHTML=h;$("modal").classList.remove("hidden")}
function inviteCode(){const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let x="KHG-";for(let i=0;i<8;i++)x+=c[Math.floor(Math.random()*c.length)];return x}
function date(v){if(!v)return"—";const d=v?.toDate?v.toDate():new Date(v);return isNaN(d)?"—":d.toLocaleDateString("tg-TJ")}
function status(s){return({Active:"Фаъол","Temporarily absent":"Ғоиб",Transferred:"Гузаронида шуд",Removed:"Хориҷшуда"})[s]||s||"—"}
function att(s){return({present:"Ҳозир",absent:"Ғоиб",permission:"Иҷозат",sick:"Бемор"})[s]||s||"—"}
function todayStr(){return new Date().toISOString().slice(0,10)}
function todayKey(){return DAY_KEYS[new Date().getDay()]}
 
/* ---------- toast notifications ---------- */
function toast(msg,type="info"){
  let wrap=$("toastWrap");
  if(!wrap){wrap=document.createElement("div");wrap.id="toastWrap";wrap.className="toast-wrap";document.body.appendChild(wrap)}
  const t=document.createElement("div");t.className=`toast toast-${type}`;t.textContent=msg;wrap.appendChild(t);
  requestAnimationFrame(()=>t.classList.add("show"));
  setTimeout(()=>{t.classList.remove("show");setTimeout(()=>t.remove(),250)},3600);
}
const ok=m=>toast(m,"ok"),err=m=>toast(m,"err");
function setLoading(v){document.body.classList.toggle("is-loading",v)}
 
/* ---------- login / registration ---------- */
function renderLogin(){document.body.innerHTML=`<div class="login-page"><div class="login-card"><div class="login-logo"><img src="assets/dormitory-logo.png"></div><h1>Dormitory</h1><p class="login-subtitle">Системаи идоракунии хобгоҳ</p><div class="form-group"><label>Email</label><input id="loginEmail" type="email"></div><div class="form-group"><label>Парол</label><input id="loginPassword" type="password"></div><button class="btn btn-primary" onclick="login()">Ворид шудан</button><div class="register-link">Мураббӣ ҳастед? <button onclick="renderSupervisorRegistration()">Бақайдгирӣ</button></div></div></div>`}
async function login(){const e=$("loginEmail")?.value.trim(),p=$("loginPassword")?.value;if(!e||!p)return err("Email ва паролро ворид кунед.");try{await signInWithEmailAndPassword(auth,e,p)}catch(e){console.error(e);err("Email ё парол нодуруст аст.")}}
async function logout(){await signOut(auth)}
function renderSupervisorRegistration(){document.body.innerHTML=`<div class="login-page"><div class="login-card"><div class="login-logo"><img src="assets/dormitory-logo.png"></div><h1>Бақайдгирии мураббӣ</h1><p class="login-subtitle">Коди даъватро аз роҳбар гиред.</p><div class="form-group"><label>Email</label><input id="registerEmail" type="email"></div><div class="form-group"><label>Коди даъват</label><input id="registerInviteCode" placeholder="KHG-XXXXXXXX"></div><div class="form-group"><label>Парол</label><input id="registerPassword" type="password"></div><div class="form-group"><label>Такрори парол</label><input id="registerPassword2" type="password"></div><button class="btn btn-primary" onclick="registerSupervisor()">Бақайдгирӣ</button><button class="btn btn-secondary" onclick="renderLogin()">← Бозгашт</button></div></div>`}
async function registerSupervisor(){
 const email=$("registerEmail").value.trim(),code=$("registerInviteCode").value.trim().toUpperCase(),p=$("registerPassword").value,p2=$("registerPassword2").value;
 if(!email||!code||!p||!p2)return err("Ҳамаи майдонҳоро пур кунед.");if(p.length<6)return err("Парол бояд камаш 6 аломат дошта бошад.");if(p!==p2)return err("Паролҳо мувофиқ нестанд.");
 try{const ref=doc(registrationDb,"invitations",code),s=await getDoc(ref);if(!s.exists())return err("Коди даъват нодуруст аст.");const inv=s.data();if(inv.status!=="pending")return err("Код аллакай истифода шудааст.");if(String(inv.email).toLowerCase()!==email.toLowerCase())return err("Email мувофиқат намекунад.");
 const c=await createUserWithEmailAndPassword(registrationAuth,email,p);await setDoc(doc(registrationDb,"users",c.user.uid),{name:inv.name,email,phone:inv.phone||"",role:"supervisor",assignedRoomIds:inv.roomIds||[],inviteCode:code,createdAt:serverTimestamp()});await updateDoc(ref,{status:"used",uid:c.user.uid,usedAt:serverTimestamp()});
 for(const rid of inv.roomIds||[])try{await updateDoc(doc(registrationDb,"rooms",rid),{supervisorId:c.user.uid})}catch(e){console.error(e)}
 await signOut(registrationAuth);ok("Бақайдгирӣ бомуваффақият анҷом ёфт.");renderLogin();
 }catch(e){console.error(e);err("Хатогӣ: "+e.message)}
}
 
/* ---------- shell ---------- */
function shell(){
 document.body.innerHTML=`<div id="app"><aside class="sidebar"><div class="brand"><div class="logo brand-icon"><img src="assets/dormitory-logo.png"></div><div><b>Dormitory</b><small>Management System</small></div></div><nav id="nav"><button data-page="dashboard">📊 Dashboard</button><button data-page="students">👨‍🎓 Талабаҳо</button><button data-page="rooms">🛏️ Ҳуҷраҳо</button><button data-page="attendance">📋 Давомот</button><button data-page="violations">⚠️ Қоидавайронкунӣ</button><button data-page="cleanliness">🏆 Озмуни тозагӣ</button><button data-page="roster">🗓️ Навбатдорӣ</button><button data-page="tea">🍵 Чойнӯшӣ</button><button data-page="chat">💬 Чат</button><button data-page="supervisors">👥 Мураббиён</button></nav><div class="sidebar-bottom"><span>${esc(roleLabel(state.profile?.role))}</span><button id="logout">Баромадан</button></div></aside><div id="sidebarOverlay" class="sidebar-overlay"></div><main class="main"><div id="loadingBar" class="loading-bar"></div><header><button id="menu">☰</button><div><h1 id="title">Dashboard</h1><p id="subtitle">Идоракунии хобгоҳ</p></div><div class="user">👤 ${esc(state.profile?.name||state.profile?.email)}</div></header><section id="content"></section></main></div><div id="modal" class="modal hidden"><div class="modal-card"><button class="close" id="closeModal">×</button><div id="modalContent"></div></div></div>`;
 $("logout").onclick=logout;$("closeModal").onclick=closeModal;
 function closeSidebar(){document.querySelector(".sidebar")?.classList.remove("open");$("sidebarOverlay")?.classList.remove("show")}
 $("nav").onclick=e=>{const b=e.target.closest("[data-page]");if(b){state.page=b.dataset.page;renderPage();closeSidebar()}};
 $("menu").onclick=()=>{document.querySelector(".sidebar")?.classList.toggle("open");$("sidebarOverlay")?.classList.toggle("show")};
 $("sidebarOverlay").onclick=closeSidebar;
}
async function seedRooms(){if(!elevated())return;const s=await getDocs(collection(db,"rooms"));if(!s.empty)return;for(let i=1;i<=10;i++){const id=`room${String(i).padStart(2,"0")}`;await setDoc(doc(db,"rooms",id),{id,number:i,name:`Ҳуҷра №${i}`,type:i<=7?"student":"supervisor",capacity:i<=7?8:4,supervisorId:null,createdAt:serverTimestamp()})}}
 
/* ---------- real-time listeners ---------- */
function clearListeners(){state.unsubs.forEach(u=>{try{u()}catch(e){}});state.unsubs=[]}
function startListening(){
 clearListeners();
 state._syncErrors=new Set();
 setLoading(true);
 const el=elevated();
 const targets=[
  ["students",el?collection(db,"students"):query(collection(db,"students"),where("supervisorId","==",uid()))],
  ["rooms",el?collection(db,"rooms"):query(collection(db,"rooms"),where("supervisorId","==",uid()))],
  ["placements",el?collection(db,"placements"):query(collection(db,"placements"),where("supervisorId","==",uid()))],
  ["residences",el?collection(db,"residences"):query(collection(db,"residences"),where("supervisorId","==",uid()))],
  ["attendance",el?collection(db,"attendance"):query(collection(db,"attendance"),where("supervisorId","==",uid()))],
  ["violations",el?collection(db,"violations"):query(collection(db,"violations"),where("supervisorId","==",uid()))],
  ["cleanliness",el?collection(db,"cleanliness_inspections"):query(collection(db,"cleanliness_inspections"),where("supervisorId","==",uid()))],
  ["teaRecipes",collection(db,"tea_recipes")],
  ["roster",collection(db,"duty_roster")],
  ["activities",collection(db,"activities")],
  ["dailySchedule",collection(db,"daily_schedule")],
  ["dutyLogs",el?collection(db,"duty_logs"):query(collection(db,"duty_logs"),where("userId","==",uid()))],
  ["wakeConfirms",el?query(collection(db,"wake_confirmations"),where("date","==",todayStr())):query(collection(db,"wake_confirmations"),where("date","==",todayStr()),where("userId","==",uid()))],
  ["stageConfirms",collection(db,"stage_confirmations")],
  ["chat",query(collection(db,"chat_messages"),orderBy("createdAt","asc"),limit(200))]
 ];
 if(el)targets.push(["supervisors",query(collection(db,"users"),where("role","==","supervisor"))]);
 else state.supervisors=[{id:uid(),...state.profile}];
 let pending=targets.length+1,started=false;
 const markDone=()=>{pending--;if(pending<=0&&!started){started=true;setLoading(false)}};
 targets.forEach(([key,q])=>{
  let first=true;
  const unsub=onSnapshot(q,snap=>{
   state[key]=snap.docs.map(d=>({id:d.id,...d.data()}));
   if(first){first=false;markDone()}
   if(key==="roster")checkDutyNotice();
   if(key==="dailySchedule")checkActivityNotices();
   renderPage();
  },e=>{console.error(e);if(first){first=false;markDone()} if(!state._syncErrors)state._syncErrors=new Set(); const syncKey=e.code||e.message||key; if(!state._syncErrors.has(syncKey)){state._syncErrors.add(syncKey);err("Хатогии синхронизатсия: "+(e.code==="permission-denied"?"Иҷозаи дастрасӣ ба баъзе маълумот дода нашудааст.":e.message))}});
  state.unsubs.push(unsub);
 });
 const unsubWake=onSnapshot(doc(db,"app_settings","wake_schedule"),snap=>{ state.wakeSettings=snap.exists()?snap.data():null; markDone(); renderPage(); },e=>{console.error(e);markDone()});
 state.unsubs.push(unsubWake);
 const unsubStages=onSnapshot(doc(db,"app_settings","daily_stages"),snap=>{
  state.stages=snap.exists()?snap.data():null;markDone();renderPage();
 },e=>{console.error(e);markDone()});
 state.unsubs.push(unsubStages);
}
function checkDutyNotice(){
 if(state._dutyNotified||isManager())return;
 const rec=state.roster.find(r=>r.id===todayKey());
 if(rec?.supervisorIds?.includes(uid())){state._dutyNotified=true;toast("Шумо имрӯз навбатдор ҳастед 🔔","ok")}
}
 
/* ---------- automatic daily activities / wake-up / duty ---------- */
function notifyUser(title,body,key){
  toast(`${title}: ${body}`,"ok");
  try{ if("Notification" in window && Notification.permission==="granted") new Notification(title,{body}); }catch(e){}
}
async function requestNotifications(){
  try{ if("Notification" in window && Notification.permission==="default") await Notification.requestPermission(); }catch(e){}
}
function minutesNow(){const d=new Date();return d.getHours()*60+d.getMinutes();}
function parseHM(v){const m=String(v||"").match(/^(\d{1,2}):(\d{2})$/);return m?Number(m[1])*60+Number(m[2]):-1}
function activeDailyActivities(){
 const day=todayKey(), now=minutesNow();
 return state.dailySchedule.filter(a=>a.enabled!==false && (!a.days||a.days.includes(day))).map(a=>({...a,start:parseHM(a.startTime)})).filter(a=>a.start>=0&&a.start<=now).sort((a,b)=>b.start-a.start);
}
function checkActivityNotices(){
 const now=minutesNow(),day=todayKey(),date=todayStr();
 state.dailySchedule.filter(a=>a.enabled!==false&&(!a.days||a.days.includes(day))).forEach(a=>{const start=parseHM(a.startTime);if(start<0||start!==now)return;const key=`${date}_${a.id}`;if(state._activityNotified.has(key))return;state._activityNotified.add(key);notifyUser("Фаъолияти нав",`${a.title} — ${a.startTime}` ,key)});
}
function checkWakeNotice(){
 const t=parseHM(state.wakeSettings?.time);if(t<0||t!==minutesNow())return;const key=`wake_${todayStr()}`;if(state._activityNotified.has(key))return;state._activityNotified.add(key);notifyUser("Вақти бедоршавӣ",`Вақти бедоршавӣ ${state.wakeSettings.time} аст.` ,key);
}
setInterval(()=>{checkActivityNotices();checkWakeNotice();ensureActiveDutyLog().catch(e=>console.warn(e));renderPage();},20000);
function myActiveDuty(){
 const day=todayKey(), now=minutesNow();
 return state.roster.filter(r=>r.day===day&&r.startTime&&r.endTime&&((r.supervisorIds||[]).includes(uid())||r.supervisorId===uid())).find(r=>{const a=parseHM(r.startTime),b=parseHM(r.endTime);return a>=0&&b>=0&&(a<b?now>=a&&now<b:now>=a||now<b)});
}
async function ensureActiveDutyLog(){
 const d=myActiveDuty(); if(!d||elevated())return null;
 const key=`${d.id}_${uid()}_${todayStr()}`; const ref=doc(db,"duty_logs",key); const existing=state.dutyLogs.find(x=>x.id===key);
 if(existing)return existing;
 const started=new Date(); const parts=String(d.startTime||"").split(":"); if(parts.length===2){started.setHours(Number(parts[0]),Number(parts[1]),0,0); if(started.getTime()>Date.now())started.setDate(started.getDate()-1)}
 await setDoc(ref,{rosterId:d.id,userId:uid(),userName:state.profile?.name||state.profile?.email,date:todayStr(),startedAt:started.toISOString(),endedAt:null,createdAt:serverTimestamp()},{merge:true});
 return {id:key,rosterId:d.id,userId:uid(),userName:state.profile?.name||state.profile?.email,date:todayStr(),startedAt:started.toISOString(),endedAt:null};
}
async function finishDuty(id){
 const d=state.dutyLogs.find(x=>x.rosterId===id&&x.userId===uid());
 if(d?.endedAt)return;
 const key=d?.id||`${id}_${uid()}_${todayStr()}`;
 await setDoc(doc(db,"duty_logs",key),{rosterId:id,userId:uid(),userName:state.profile?.name||state.profile?.email,date:todayStr(),startedAt:d?.startedAt||new Date().toISOString(),endedAt:new Date().toISOString(),createdAt:serverTimestamp()},{merge:true});
 ok("Навбатдорӣ ба анҷом расид.");
}
function wakeStatusForMe(){return state.wakeConfirms.find(x=>x.userId===uid())}
async function confirmWake(){
 const key=`${todayStr()}_${uid()}`;
 await setDoc(doc(db,"wake_confirmations",key),{date:todayStr(),userId:uid(),userName:state.profile?.name||state.profile?.email,confirmedAt:new Date().toISOString(),createdAt:serverTimestamp()},{merge:true});
 ok("Вақти бедоршавӣ сабт шуд.");
}
function dailyScheduleCard(){
 const active=activeDailyActivities()[0];
 if(!active)return `<div class="section-card today-activity-card"><h3>Фаъолиятҳои имрӯза</h3><p>Ҳоло фаъолияти фаъол нест.</p></div>`;
 return `<div class="section-card today-activity-card active-now"><div><span class="live-badge">● ҲОЗИР</span><h3>${esc(active.title)}</h3><p>Оғоз: <b>${esc(active.startTime)}</b></p></div></div>`;
}
function wakeCard(){
 if(!state.wakeSettings?.time)return "";
 const w=wakeStatusForMe();
 return `<div class="section-card wake-card"><div><span>🌅 Бедоршавӣ</span><h3>${esc(state.wakeSettings.time)}</h3><p>${w?`✅ Бедоршавӣ сабт шуд: ${chatTime(w.confirmedAt)}`:"Тугмаро пахш кунед, вақте бедор шудед."}</p></div>${!w?`<button class="btn btn-primary" onclick="confirmWake()">🟢 Ман бедор шудам</button>`:""}</div>`;
}
function dutyCard(){
 const d=myActiveDuty(); if(!d)return ""; const log=state.dutyLogs.find(x=>x.rosterId===d.id&&x.userId===uid());
 return `<div class="section-card duty-live-card"><div><span class="live-badge">🛡️ НАВБАТДОРӢ</span><h3>${esc(d.title||"Навбатдорӣ")}</h3><p>${esc(d.startTime)} — ${esc(d.endTime)}</p><p>${log?.endedAt?`Анҷом: ${chatTime(log.endedAt)}`:"Навбат идома дорад."}</p></div>${!log?.endedAt?`<button class="btn btn-danger" onclick="finishDuty('${d.id}')">Ба анҷом расонидан</button>`:""}</div>`;
}
 
/* ---------- dashboard ---------- */
let trendChart=null;
const MONTHS_TG=["Янв","Фев","Март","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"];
function last6Months(){const out=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:`${d.getFullYear()}-${d.getMonth()}`,label:MONTHS_TG[d.getMonth()]})}return out}
function dashboardPage(){
 const active=state.students.filter(s=>s.status==="Active").length,sr=state.rooms.filter(r=>r.type==="student"),total=sr.reduce((a,r)=>a+cap(r),0),occ=state.students.filter(s=>s.status==="Active"&&s.roomId).length;
 $("content").innerHTML=`<div class="page-head"><div><h2>Dashboard</h2><p>Хулосаи ҳолати хобгоҳ</p></div>${elevated()?`<div class="action-row"><button class="btn btn-secondary" onclick="openDailyScheduleManager()">⏰ Ҷадвали фаъолиятҳо</button><button class="btn btn-secondary" onclick="openWakeManager()">🌅 Вақти бедоршавӣ</button></div>`:""}</div><div class="stats-grid"><div class="stat-card"><b>${active}</b><small>Талабаҳо</small></div><div class="stat-card"><b>${sr.length}</b><small>Ҳуҷраҳо</small></div><div class="stat-card"><b>${occ}</b><small>Ҷойҳои ишғолшуда</small></div><div class="stat-card"><b>${total-occ}</b><small>Ҷойҳои холӣ</small></div><div class="stat-card"><b>${state.attendance.length}</b><small>Давомот</small></div><div class="stat-card"><b>${state.violations.length}</b><small>Қоидавайронкунӣ</small></div></div>${dailyScheduleCard()}${wakeCard()}${dutyCard()}<div class="section-card"><h3>Ҳолати ҳуҷраҳо</h3><div class="room-grid">${sr.map(r=>`<div class="room-mini" onclick="openRoom('${r.id}')"><b>${esc(r.name)}</b><strong>${state.students.filter(s=>s.roomId===r.id&&s.status==="Active").length}/${cap(r)}</strong></div>`).join("")}</div></div><div class="section-card"><h3>Ҷадвали ҳафтаинаи фаъолиятҳо</h3>${renderActivityTable()}</div><div class="section-card"><h3>Тамоюли 6 моҳи охир</h3><div class="chart-box"><canvas id="trendChart"></canvas></div></div>`;
 renderTrendChart();
}
function renderTrendChart(){
 const canvas=$("trendChart");if(!canvas||typeof Chart==="undefined")return;
 const months=last6Months();
 const absences=months.map(m=>state.attendance.filter(a=>a.status!=="present"&&a.date&&(()=>{const d=new Date(a.date);return`${d.getFullYear()}-${d.getMonth()}`===m.key})()).length);
 const violations=months.map(m=>state.violations.filter(v=>{const d=v.createdAt?.toDate?.();return d&&`${d.getFullYear()}-${d.getMonth()}`===m.key}).length);
 trendChart?.destroy();
 trendChart=new Chart(canvas.getContext("2d"),{type:"line",data:{labels:months.map(m=>m.label),datasets:[
  {label:"Ғоибӣ",data:absences,borderColor:"#a3452c",backgroundColor:"rgba(163,69,44,.12)",tension:.3,fill:true},
  {label:"Қоидавайронкунӣ",data:violations,borderColor:"#0b5d3b",backgroundColor:"rgba(11,93,59,.12)",tension:.3,fill:true}
 ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{font:{family:"Manrope"}}}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}}});
}
 
/* ---------- weekly activity table ---------- */
function renderActivityTable(){
 const days=["mon","tue","wed","thu","fri","sat","sun"];
 const classes=[...new Set(state.students.map(s=>s.className).map(x=>(x||"").trim()).filter(Boolean))].sort();
 if(!classes.length)return"<p>Аввал ба талабаҳо синф диҳед, то ҷадвал намоён шавад.</p>";
 const canEdit=elevated();
 let html='<div class="table-wrap"><table><tr><th>Рӯз</th>'+classes.map(c=>`<th>${esc(c)}</th>`).join("")+"</tr>";
 days.forEach(dk=>{
  html+=`<tr><td>${DAY_LABELS[dk]}</td>`+classes.map(c=>{
   const a=state.activities.find(x=>x.day===dk&&x.className===c);
   return `<td class="activity-cell"${canEdit?` onclick="openActivity('${dk}','${jsStr(c)}')"`:""}>${esc(a?.activity||"—")}</td>`;
  }).join("")+"</tr>";
 });
 html+="</table></div>";
 return html;
}
function openActivity(dk,cls){const a=state.activities.find(x=>x.day===dk&&x.className===cls);modal(`<h2>${DAY_LABELS[dk]} — ${esc(cls)}</h2><div class="form-group"><label>Фаъолият</label><input id="activityText" value="${esc(a?.activity||"")}"></div><button class="btn btn-primary" onclick="saveActivity('${dk}','${jsStr(cls)}')">Нигоҳ доштан</button>`)}
async function saveActivity(dk,cls){const v=$("activityText").value.trim();await setDoc(doc(db,"activities",`${dk}_${cls}`),{day:dk,className:cls,activity:v,updatedAt:serverTimestamp()},{merge:true});closeModal();ok("Ҷадвал нав шуд.")}
 
/* ---------- students ---------- */
function studentsPage(){
 if($("studentRows")){renderStudentRows($("studentSearch")?.value||"");return}
 const canAdd=elevated()||state.profile?.role==="supervisor";
 $("content").innerHTML=`<div class="page-head"><div><h2>Талабаҳо</h2><p>Рӯйхати талабаҳо</p></div>${canAdd?'<button class="btn btn-primary" onclick="openAddStudent()">+ Талабаи нав</button>':""}</div><div class="toolbar"><input id="studentSearch" placeholder="Ҷустуҷӯ..." oninput="renderStudentRows(this.value)"></div><div class="table-wrap"><table><thead><tr><th>Ном</th><th>Синф</th><th>Телефон</th><th>Ҳуҷра</th><th>Ҷой</th><th>Мураббӣ</th><th>Ҳолат</th></tr></thead><tbody id="studentRows"></tbody></table></div>`;renderStudentRows("");
}
function renderStudentRows(x){x=String(x||"").toLowerCase();const a=state.students.filter(s=>!x||`${s.name} ${s.className||""} ${s.phone||""}`.toLowerCase().includes(x));$("studentRows").innerHTML=a.map(s=>`<tr><td><button class="link-btn" onclick="openStudent('${s.id}')">${esc(s.name)}</button></td><td>${esc(s.className||"—")}</td><td>${esc(s.phone||"—")}</td><td>${esc(roomName(s.roomId))}</td><td>${s.place||"—"}</td><td>${esc(supervisorName(s.supervisorId))}</td><td>${status(s.status)}</td></tr>`).join("")||`<tr><td colspan="7">Талаба ёфт нашуд.</td></tr>`}
function openAddStudent(){
 const sup=state.profile?.role==="supervisor";
 const rooms=state.rooms.filter(r=>r.type==="student" && (!sup || (state.profile.assignedRoomIds||[]).includes(r.id)));
 if(sup && !rooms.length)return err("Ба шумо ҳуҷраи таъиншуда вуҷуд надорад.");
 const room=rooms[0];
 const freePlaces=room?Array.from({length:cap(room)},(_,i)=>i+1).filter(i=>!state.students.some(s=>s.status==="Active"&&s.roomId===room.id&&Number(s.place)===i)):[];
 if(sup && !freePlaces.length)return err("Дар ҳуҷраи шумо ҷойи холӣ нест.");
 modal(`<h2>Талабаи нав</h2><div class="form-grid"><div class="form-group"><label>Номи пурра</label><input id="studentName"></div><div class="form-group"><label>Таваллуд</label><input id="studentDob" type="date"></div><div class="form-group"><label>Телефон</label><input id="studentPhone"></div><div class="form-group"><label>Телефони падар</label><input id="studentFather"></div><div class="form-group"><label>Суроға</label><input id="studentAddress"></div><div class="form-group"><label>Синф</label><input id="studentClass"></div><div class="form-group"><label>Муаллими синф</label><input id="studentTeacher"></div>${sup?`<div class="form-group"><label>Ҳуҷра</label><select id="studentRoom">${rooms.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</select></div><div class="form-group"><label>Ҷойи хоб</label><select id="studentPlace">${freePlaces.map(i=>`<option value="${i}">${i}</option>`).join("")}</select></div>`:""}<div class="form-group"><label>Санаи омадан ба хобгоҳ</label><input id="studentStartDate" type="date" value="${todayStr()}"></div></div><button class="btn btn-primary" onclick="createStudent()">Сабт кардан</button>`)
}
async function createStudent(){
 const name=$("studentName").value.trim();if(!name)return err("Номро ворид кунед.");
 const sup=state.profile?.role==="supervisor";
 const startDate=$("studentStartDate")?.value||"";if(sup&&!startDate)return err("Санаи омаданро интихоб кунед.");
 const data={name,dob:$("studentDob").value,phone:$("studentPhone").value.trim(),fatherPhone:$("studentFather").value.trim(),address:$("studentAddress").value.trim(),className:$("studentClass").value.trim(),classTeacher:$("studentTeacher").value.trim(),supervisorId:sup?uid():null,roomId:sup?$("studentRoom").value:null,place:sup?Number($("studentPlace").value):null,status:"Active",admissionDate:sup?startDate:null,departureDate:null,createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
 try{
  if(sup){const rid=data.roomId,p=Number(data.place),roomRef=doc(db,"rooms",rid);await runTransaction(db,async t=>{const rr=await t.get(roomRef);if(!rr.exists())throw Error("Ҳуҷра ёфт нашуд.");if(rr.data().supervisorId!==uid())throw Error("Ин ҳуҷра ба шумо тааллуқ надорад.");if(p<1||p>cap(rr.data()))throw Error("Ҷойи хоб нодуруст аст.");const taken=state.students.some(s=>s.status==="Active"&&s.roomId===rid&&Number(s.place)===p);if(taken)throw Error("Ин ҷой аллакай ишғол шудааст.");const sr=doc(collection(db,"students"));t.set(sr,data);const pr=doc(collection(db,"placements"));t.set(pr,{studentId:sr.id,roomId:rid,place:p,supervisorId:uid(),action:"assigned",startDate,createdAt:serverTimestamp()});const res=doc(collection(db,"residences"));t.set(res,{studentId:sr.id,roomId:rid,place:p,supervisorId:uid(),startDate,endDate:null,createdAt:serverTimestamp()})});
  }else{const ref=await addDoc(collection(db,"students"),data);}
  closeModal();ok("Талаба илова шуд.");
 }catch(e){console.error(e);err(e.message||"Хатогӣ ҳангоми сабт.")}
}
function openStudent(id){const s=state.students.find(x=>x.id===id);if(!s)return;const a=state.attendance.filter(x=>x.studentId===id),v=state.violations.filter(x=>x.studentId===id),rh=residenceHistory(id),canEdit=isManager()||(state.profile?.role==="supervisor"&&s.supervisorId===uid());
 modal(`<h2>${esc(s.name)}</h2><div class="profile-grid"><div><b>Таваллуд:</b> ${date(s.dob)}</div><div><b>Телефон:</b> ${esc(s.phone||"—")}</div><div><b>Падар:</b> ${esc(s.fatherPhone||"—")}</div><div><b>Суроға:</b> ${esc(s.address||"—")}</div><div><b>Синф:</b> ${esc(s.className||"—")}</div><div><b>Муаллим:</b> ${esc(s.classTeacher||"—")}</div><div><b>Ҳуҷра:</b> ${esc(roomName(s.roomId))}</div><div><b>Ҷой:</b> ${s.place||"—"}</div><div><b>Мураббӣ:</b> ${esc(supervisorName(s.supervisorId))}</div><div><b>Ҳолат:</b> ${status(s.status)}</div><div><b>Омад ба хобгоҳ:</b> ${date(s.admissionDate)}</div><div><b>Баромад:</b> ${date(s.departureDate)}</div></div>
 ${canEdit?`<div class="action-row">${s.roomId?`<button class="btn btn-secondary" onclick="openTransferStudent('${s.id}')">Гузарондан ба ҳуҷраи дигар</button><button class="btn btn-secondary" onclick="removeFromRoom('${s.id}')">Хориҷ аз ҳуҷра</button>`:""}<button class="btn btn-secondary" onclick="openEditStudent('${s.id}')">Ислоҳ</button>${elevated()?`<button class="btn btn-danger" onclick="deleteStudent('${s.id}')">Нест кардан</button>`:""}</div>`:""}
 <h3>Таърихи истиқомат</h3><div class="table-wrap"><table><tr><th>Аз сана</th><th>То сана</th><th>Ҳуҷра</th><th>Ҷой</th></tr>${rh.map(x=>`<tr><td>${esc(x.startDate||"—")}</td><td>${esc(x.endDate||"Ҳозир")}</td><td>${esc(roomName(x.roomId))}</td><td>${x.place||"—"}</td></tr>`).join("")||"<tr><td colspan=4>Таърих нест.</td></tr>"}</table></div><h3>Давомот</h3><div class="table-wrap"><table><tr><th>Сана</th><th>Ҳолат</th><th>Эзоҳ</th></tr>${a.map(x=>`<tr><td>${esc(x.date)}</td><td>${att(x.status)}</td><td>${esc(x.note||"—")}</td></tr>`).join("")||"<tr><td colspan=3>Маълумот нест.</td></tr>"}</table></div><h3>Қоидавайронкунӣ</h3><div class="table-wrap"><table><tr><th>Тавсиф</th><th>Дараҷа</th></tr>${v.map(x=>`<tr><td>${esc(x.description)}</td><td>${esc(x.severity||"—")}</td></tr>`).join("")||"<tr><td colspan=2>Маълумот нест.</td></tr>"}</table></div>`)
}
function openEditStudent(id){const s=state.students.find(x=>x.id===id);if(!s)return;const canEdit=elevated()||(state.profile?.role==="supervisor"&&s.supervisorId===uid());if(!canEdit)return err("Иҷозаи таҳрир надоред.");modal(`<h2>Ислоҳи маълумот</h2><div class="form-grid"><div class="form-group"><label>Номи пурра</label><input id="studentName" value="${esc(s.name)}"></div><div class="form-group"><label>Таваллуд</label><input id="studentDob" type="date" value="${esc(s.dob||"")}"></div><div class="form-group"><label>Телефон</label><input id="studentPhone" value="${esc(s.phone||"")}"></div><div class="form-group"><label>Телефони падар</label><input id="studentFather" value="${esc(s.fatherPhone||"")}"></div><div class="form-group"><label>Суроға</label><input id="studentAddress" value="${esc(s.address||"")}"></div><div class="form-group"><label>Синф</label><input id="studentClass" value="${esc(s.className||"")}"></div><div class="form-group"><label>Муаллими синф</label><input id="studentTeacher" value="${esc(s.classTeacher||"")}"></div><div class="form-group"><label>Санаи омадан</label><input id="studentStartDate" type="date" value="${esc(s.admissionDate||currentResidence(id)?.startDate||"")}"></div><div class="form-group"><label>Ҳолат</label><select id="studentStatus"><option value="Active"${s.status==="Active"?" selected":""}>Фаъол</option><option value="Temporarily absent"${s.status==="Temporarily absent"?" selected":""}>Ғоиб</option><option value="Transferred"${s.status==="Transferred"?" selected":""}>Гузаронида шуд</option><option value="Removed"${s.status==="Removed"?" selected":""}>Хориҷшуда</option></select></div></div><button class="btn btn-primary" onclick="updateStudent('${id}')">Нигоҳ доштан</button>`)}
async function updateStudent(id){const name=$("studentName").value.trim();if(!name)return err("Номро ворид кунед.");const s=state.students.find(x=>x.id===id);const start=$("studentStartDate")?.value||s.admissionDate||null;try{await updateDoc(doc(db,"students",id),{name,dob:$("studentDob").value,phone:$("studentPhone").value.trim(),fatherPhone:$("studentFather").value.trim(),address:$("studentAddress").value.trim(),className:$("studentClass").value.trim(),classTeacher:$("studentTeacher").value.trim(),status:$("studentStatus").value,admissionDate:start,updatedAt:serverTimestamp()});closeModal();ok("Маълумот нигоҳ дошта шуд.")}catch(e){err(e.message)}}
async function deleteStudent(id){if(!isManager())return err("Танҳо Manager метавонад талабаро пурра нест кунад.");if(!confirm("Талаба пурра нест карда шавад? Ин амал бозгашт надорад."))return;await deleteDoc(doc(db,"students",id));closeModal();ok("Талаба нест карда шуд.")}
function openTransferStudent(sid){const s=state.students.find(x=>x.id===sid);if(!s)return;const sup=state.profile?.role==="supervisor";const rooms=state.rooms.filter(r=>r.type==="student"&&r.id!==s.roomId&&(!sup||(state.profile.assignedRoomIds||[]).includes(r.id)));if(sup)return err("Мураббӣ танҳо ҳуҷраи ба худ вобастаро идора мекунад. Барои гузаронидан ба ҳуҷраи дигар Manager амал мекунад.");modal(`<h2>Гузарондани ${esc(s.name)}</h2><div class="form-group"><label>Ҳуҷраи нав</label><select id="transferRoom">${rooms.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</select></div><div class="form-group"><label>Ҷой</label><input id="transferPlace" type="number" min="1"></div><div class="form-group"><label>Мураббӣ</label><select id="transferSupervisor">${state.supervisors.map(x=>`<option value="${x.id}">${esc(x.name||x.email)}</option>`).join("")}</select></div><div class="form-group"><label>Санаи гузариш</label><input id="transferDate" type="date" value="${todayStr()}"></div><button class="btn btn-primary" onclick="confirmTransfer('${sid}')">Гузарондан</button>`)}
async function confirmTransfer(sid){const rid=$("transferRoom").value,p=Number($("transferPlace").value),sp=$("transferSupervisor").value,startDate=$("transferDate").value||todayStr();if(!rid||!p||!sp)return err("Ҳамаи майдонҳоро пур кунед.");try{await runTransaction(db,async t=>{const sr=doc(db,"students",sid),rr=doc(db,"rooms",rid),ss=await t.get(sr),rs=await t.get(rr);if(!ss.exists())throw Error("Талаба ёфт нашуд.");if(!rs.exists())throw Error("Ҳуҷра ёфт нашуд.");if(p<1||p>cap(rs.data()))throw Error("Ҷойи хоб нодуруст аст.");if(state.students.some(s=>s.id!==sid&&s.status==="Active"&&s.roomId===rid&&Number(s.place)===p))throw Error("Ҷой аллакай ишғол шудааст.");const oldRes=state.residences.find(r=>r.studentId===sid&&!r.endDate);if(oldRes)t.update(doc(db,"residences",oldRes.id),{endDate:startDate});t.update(sr,{roomId:rid,place:p,supervisorId:sp,status:"Active",admissionDate:ss.data().admissionDate||startDate,updatedAt:serverTimestamp()});const pr=doc(collection(db,"placements"));t.set(pr,{studentId:sid,roomId:rid,place:p,supervisorId:sp,action:"transferred",startDate,createdAt:serverTimestamp()});const res=doc(collection(db,"residences"));t.set(res,{studentId:sid,roomId:rid,place:p,supervisorId:sp,startDate,endDate:null,createdAt:serverTimestamp()})});closeModal();ok("Талаба гузаронида шуд.")}catch(e){err(e.message)}}
async function removeFromRoom(sid){const s=state.students.find(x=>x.id===sid);if(!s)return;const can=isManager()||(state.profile?.role==="supervisor"&&s.supervisorId===uid());if(!can)return err("Шумо ин талабаро идора карда наметавонед.");if(!confirm("Талаба аз ҳуҷра хориҷ карда шавад?"))return;const endDate=prompt("Санаи баромадан аз хобгоҳ:",todayStr())||todayStr();try{await runTransaction(db,async t=>{t.update(doc(db,"students",sid),{roomId:null,place:null,supervisorId:null,departureDate:endDate,status:"Removed",updatedAt:serverTimestamp()});const oldRes=state.residences.find(r=>r.studentId===sid&&!r.endDate);if(oldRes)t.update(doc(db,"residences",oldRes.id),{endDate});const pr=doc(collection(db,"placements"));t.set(pr,{studentId:sid,roomId:s.roomId||null,place:s.place||null,supervisorId:s.supervisorId||uid(),action:"removed",endDate,createdAt:serverTimestamp()})});closeModal();ok("Талаба аз ҳуҷра хориҷ шуд.")}catch(e){err(e.message)}}
 
/* ---------- rooms (manager: full CRUD; students & supervisors sections shown separately) ---------- */
function roomsPage(){
 if($("roomCards")){renderRoomCards($("roomSearch")?.value||"");return}
 $("content").innerHTML=`<div class="page-head"><div><h2>Ҳуҷраҳо</h2><p>Ҷойҳои хоб</p></div>${elevated()?'<button class="btn btn-primary" onclick="openAddRoom()">+ Ҳуҷраи нав</button>':""}</div><div class="toolbar"><input id="roomSearch" placeholder="Ҷустуҷӯ аз рӯи ном ё мураббӣ..." oninput="renderRoomCards(this.value)"></div><div id="roomCards"></div>`;renderRoomCards("");
}
function renderRoomCards(x){
 x=String(x||"").toLowerCase();
 const match=r=>!x||`${r.name} ${supervisorName(r.supervisorId)}`.toLowerCase().includes(x);
 const students=state.rooms.filter(r=>r.type!=="supervisor"&&match(r)).sort((a,b)=>(a.number||0)-(b.number||0));
 const staffRooms=state.rooms.filter(r=>r.type==="supervisor"&&match(r)).sort((a,b)=>(a.number||0)-(b.number||0));
 const card=r=>{const n=state.students.filter(s=>s.roomId===r.id&&s.status==="Active").length;return`<div class="room-card" onclick="openRoom('${r.id}')"><h3>🛏️ ${esc(r.name)}</h3><strong>${n}/${cap(r)}</strong><p>${cap(r)-n} ҷой холӣ</p><small>${esc(supervisorName(r.supervisorId))}</small></div>`};
 $("roomCards").innerHTML=`<h3>Ҳуҷраҳои талабаҳо</h3><div class="room-grid large">${students.map(card).join("")||'<p>Ҳуҷра ёфт нашуд.</p>'}</div><h3 style="margin-top:22px">Ҳуҷраи мураббиён</h3><div class="room-grid large">${staffRooms.map(card).join("")||'<p>Ҳуҷра ёфт нашуд.</p>'}</div>`;
}
function openRoom(id){const r=state.rooms.find(x=>x.id===id);if(!r)return;const ss=state.students.filter(s=>s.roomId===id),n=cap(r);let b="";for(let i=1;i<=n;i++){const s=ss.find(x=>Number(x.place)===i);b+=`<div class="bed ${s?"occupied":"free"}" ${s?`onclick="openStudent('${s.id}')"`:""}><span>${i}</span>${s?`<strong>${esc(s.name)}</strong>`:"<small>Ҷой холӣ</small>"}</div>`}
 modal(`<h2>${esc(r.name)}</h2><p>Иқтидор: ${n} | Ишғолшуда: ${ss.length} | Холӣ: ${n-ss.length}</p><p>Мураббӣ: ${esc(supervisorName(r.supervisorId))}</p><div class="beds-grid">${r.type==="supervisor"?"":b}</div>${elevated()?`<div class="action-row">${r.type!=="supervisor"?`<button class="btn btn-primary" onclick="openAssignStudent('${id}')">+ Ҷойгиркунӣ</button>`:""}<button class="btn btn-secondary" onclick="openAssignSupervisor('${id}')">${r.supervisorId?"Иваз кардани мураббӣ":"Таъини мураббӣ"}</button><button class="btn btn-secondary" onclick="openEditRoom('${id}')">Ислоҳи ҳуҷра</button><button class="btn btn-danger" onclick="deleteRoom('${id}')">Нест кардани ҳуҷра</button></div>`:""}`);
}
function openAddRoom(){modal(`<h2>Ҳуҷраи нав</h2><div class="form-group"><label>Ном</label><input id="roomName" placeholder="Ҳуҷра №11"></div><div class="form-group"><label>Рақам</label><input id="roomNumber" type="number" min="1"></div><div class="form-group"><label>Иқтидор (ҷойҳо)</label><input id="roomCapacity" type="number" min="1" value="8"></div><div class="form-group"><label>Навъ</label><select id="roomType"><option value="student">Талабаҳо</option><option value="supervisor">Мураббиён</option></select></div><button class="btn btn-primary" onclick="saveNewRoom()">Сохтан</button>`)}
async function saveNewRoom(){const name=$("roomName").value.trim();if(!name)return err("Номи ҳуҷраро ворид кунед.");await addDoc(collection(db,"rooms"),{name,number:Number($("roomNumber").value)||0,capacity:Number($("roomCapacity").value)||8,type:$("roomType").value,supervisorId:null,createdAt:serverTimestamp()});closeModal();ok("Ҳуҷра сохта шуд.")}
function openEditRoom(id){const r=state.rooms.find(x=>x.id===id);if(!r)return;modal(`<h2>Ислоҳи ҳуҷра</h2><div class="form-group"><label>Ном</label><input id="roomName" value="${esc(r.name)}"></div><div class="form-group"><label>Рақам</label><input id="roomNumber" type="number" value="${r.number||0}"></div><div class="form-group"><label>Иқтидор (ҷойҳо)</label><input id="roomCapacity" type="number" value="${cap(r)}"></div><div class="form-group"><label>Навъ</label><select id="roomType"><option value="student"${r.type!=="supervisor"?" selected":""}>Талабаҳо</option><option value="supervisor"${r.type==="supervisor"?" selected":""}>Мураббиён</option></select></div><button class="btn btn-primary" onclick="updateRoom('${id}')">Нигоҳ доштан</button>`)}
async function updateRoom(id){const name=$("roomName").value.trim();if(!name)return err("Номро ворид кунед.");await updateDoc(doc(db,"rooms",id),{name,number:Number($("roomNumber").value)||0,capacity:Number($("roomCapacity").value)||8,type:$("roomType").value});closeModal();ok("Ҳуҷра нав шуд.")}
async function deleteRoom(id){if(state.students.some(s=>s.roomId===id))return err("Аввал ҳамаи талабаҳоро аз ин ҳуҷра хориҷ кунед.");if(!confirm("Ин ҳуҷра нест карда шавад?"))return;await deleteDoc(doc(db,"rooms",id));closeModal();ok("Ҳуҷра нест карда шуд.")}
function openAssignStudent(rid){const r=state.rooms.find(x=>x.id===rid);const free=state.students.filter(s=>s.status==="Active"&&!s.roomId),places=Array.from({length:cap(r)},(_,i)=>i+1).filter(p=>!state.students.some(s=>s.roomId===rid&&Number(s.place)===p));modal(`<h2>Ҷойгиркунӣ</h2><div class="form-group"><label>Талаба</label><select id="assignStudent">${free.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></div><div class="form-group"><label>Ҷой</label><select id="assignPlace">${places.map(p=>`<option value="${p}">${p}</option>`).join("")}</select></div><div class="form-group"><label>Мураббӣ</label><select id="assignSupervisor">${state.supervisors.map(s=>`<option value="${s.id}">${esc(s.name||s.email)}</option>`).join("")}</select></div><div class="form-group"><label>Санаи омадан ба хобгоҳ</label><input id="assignStartDate" type="date" value="${todayStr()}"></div><button class="btn btn-primary" onclick="assignStudent('${rid}')">Тасдиқ</button>`)}
async function assignStudent(rid){const sid=$("assignStudent").value,p=Number($("assignPlace").value),sp=$("assignSupervisor").value,startDate=$("assignStartDate").value||todayStr();if(!sid||!p||!sp)return err("Ҳамаи майдонҳоро пур кунед.");try{await runTransaction(db,async t=>{const sr=doc(db,"students",sid),rr=doc(db,"rooms",rid),ss=await t.get(sr),rs=await t.get(rr);if(!ss.exists())throw Error("Талаба ёфт нашуд.");if(!rs.exists())throw Error("Ҳуҷра ёфт нашуд.");if(p<1||p>cap(rs.data()))throw Error("Ҷойи хоб нодуруст аст.");if(state.students.some(s=>s.id!==sid&&s.status==="Active"&&s.roomId===rid&&Number(s.place)===p))throw Error("Ҷой аллакай ишғол шудааст.");t.update(sr,{roomId:rid,place:p,supervisorId:sp,status:"Active",admissionDate:ss.data()?.admissionDate||startDate,departureDate:null,updatedAt:serverTimestamp()});const pr=doc(collection(db,"placements"));t.set(pr,{studentId:sid,roomId:rid,place:p,supervisorId:sp,action:"assigned",startDate,createdAt:serverTimestamp()});const res=doc(collection(db,"residences"));t.set(res,{studentId:sid,roomId:rid,place:p,supervisorId:sp,startDate,endDate:null,createdAt:serverTimestamp()})});closeModal();ok("Талаба ҷойгир карда шуд.")}catch(e){err(e.message)}}
 
/* ---------- attendance journal (tap + / − ) ---------- */
function attendancePage(){
 if($("journalRows")){renderJournal();return}
 $("content").innerHTML=`<div class="page-head"><div><h2>Давомот</h2><p>Журнали ҳаррӯза — тугмаи + ё − -ро зер кунед</p></div><input id="journalDate" type="date" value="${todayStr()}" onchange="renderJournal()"></div><div class="toolbar"><input id="journalSearch" placeholder="Ҷустуҷӯ аз рӯи ном..." oninput="renderJournal()"></div><div id="journalRows" class="journal-list"></div>`;
 renderJournal();
}
function renderJournal(){
 const dateVal=$("journalDate")?.value||todayStr(),x=($("journalSearch")?.value||"").toLowerCase();
 const list=state.students.filter(s=>s.status==="Active"&&(!x||s.name.toLowerCase().includes(x)));
 $("journalRows").innerHTML=list.map(s=>{
  const rec=state.attendance.find(a=>a.studentId===s.id&&a.date===dateVal);
  const st=rec?.status;
  return `<div class="journal-row"><span class="jr-name">${esc(s.name)}<small>${esc(roomName(s.roomId))}</small></span><div class="jr-actions"><button class="jr-btn jr-minus${st==="absent"?" active":""}" onclick="markJournal('${s.id}','${dateVal}','absent')">−</button><button class="jr-btn jr-plus${st==="present"?" active":""}" onclick="markJournal('${s.id}','${dateVal}','present')">+</button><select class="jr-other" onchange="markJournal('${s.id}','${dateVal}',this.value)"><option value="">Дигар</option><option value="permission"${st==="permission"?" selected":""}>Иҷозат</option><option value="sick"${st==="sick"?" selected":""}>Бемор</option></select></div></div>`;
 }).join("")||"<p>Талаба ёфт нашуд.</p>";
}
async function markJournal(sid,dateVal,status){if(!status)return;const s=state.students.find(x=>x.id===sid);if(!s)return;await setDoc(doc(db,"attendance",`${sid}_${dateVal}`),{studentId:sid,roomId:s.roomId||null,supervisorId:elevated()?(s.supervisorId||uid()):uid(),date:dateVal,status,note:"",createdAt:serverTimestamp()},{merge:true})}
 
/* ---------- violations ---------- */
function violationsPage(){
 if($("violationRows")){renderViolationRows($("violationSearch")?.value||"");return}
 $("content").innerHTML=`<div class="page-head"><div><h2>Қоидавайронкунӣ</h2></div><button class="btn btn-primary" onclick="openViolation()">+ Сабт</button></div><div class="toolbar"><input id="violationSearch" placeholder="Ҷустуҷӯ аз рӯи ном ё дараҷа..." oninput="renderViolationRows(this.value)"></div><div class="table-wrap"><table><tr><th>Талаба</th><th>Ҳуҷра</th><th>Тавсиф</th><th>Дараҷа</th>${elevated()?"<th>Амал</th>":""}</tr><tbody id="violationRows"></tbody></table></div>`;renderViolationRows("");
}
function renderViolationRows(x){x=String(x||"").toLowerCase();const mgr=elevated();const list=state.violations.filter(v=>!x||`${studentName(v.studentId)} ${v.severity||""}`.toLowerCase().includes(x));$("violationRows").innerHTML=list.map(v=>`<tr><td>${esc(studentName(v.studentId))}</td><td>${esc(roomName(v.roomId))}</td><td>${esc(v.description)}</td><td>${esc(v.severity||"—")}</td>${mgr?`<td class="action-cell"><button class="link-btn" onclick="openEditViolation('${v.id}')">Ислоҳ</button><button class="link-btn danger" onclick="deleteViolation('${v.id}')">Нест</button></td>`:""}</tr>`).join("")||`<tr><td colspan="5">Сабт ёфт нашуд.</td></tr>`}
function openViolation(){modal(`<h2>Қоидавайронкунӣ</h2><div class="form-group"><label>Талаба</label><select id="violationStudent">${state.students.filter(s=>s.status==="Active").map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select></div><div class="form-group"><label>Дараҷа</label><select id="violationSeverity"><option>Одатӣ</option><option>Муҳим</option><option>Ҷиддӣ</option></select></div><div class="form-group"><label>Тавсиф</label><textarea id="violationDescription"></textarea></div><button class="btn btn-primary" onclick="saveViolation()">Сабт</button>`)}
async function saveViolation(){const sid=$("violationStudent").value,s=state.students.find(x=>x.id===sid),d=$("violationDescription").value.trim();if(!s||!d)return err("Тавсифро ворид кунед.");await addDoc(collection(db,"violations"),{studentId:sid,roomId:s.roomId||null,supervisorId:elevated()?(s.supervisorId||uid()):uid(),description:d,severity:$("violationSeverity").value,createdAt:serverTimestamp()});closeModal();ok("Сабт шуд.")}
function openEditViolation(id){const v=state.violations.find(x=>x.id===id);if(!v)return;modal(`<h2>Ислоҳи қоидавайронкунӣ</h2><div class="form-group"><label>Талаба</label><input value="${esc(studentName(v.studentId))}" disabled></div><div class="form-group"><label>Дараҷа</label><select id="violationSeverity"><option${v.severity==="Одатӣ"?" selected":""}>Одатӣ</option><option${v.severity==="Муҳим"?" selected":""}>Муҳим</option><option${v.severity==="Ҷиддӣ"?" selected":""}>Ҷиддӣ</option></select></div><div class="form-group"><label>Тавсиф</label><textarea id="violationDescription">${esc(v.description||"")}</textarea></div><button class="btn btn-primary" onclick="updateViolation('${id}')">Нигоҳ доштан</button>`)}
async function updateViolation(id){const d=$("violationDescription").value.trim();if(!d)return err("Тавсифро ворид кунед.");await updateDoc(doc(db,"violations",id),{description:d,severity:$("violationSeverity").value});closeModal();ok("Тағйирот нигоҳ дошта шуд.")}
async function deleteViolation(id){if(!confirm("Ин сабт нест карда шавад?"))return;await deleteDoc(doc(db,"violations",id));ok("Сабт нест карда шуд.")}
 
/* ---------- cleanliness (with leaderboard) ---------- */
function cleanlinessPage(){
 const byRoom={};state.cleanliness.forEach(x=>{(byRoom[x.roomId]=byRoom[x.roomId]||[]).push(x.total||0)});
 const board=Object.entries(byRoom).map(([rid,scores])=>({rid,avg:scores.reduce((a,b)=>a+b,0)/scores.length})).sort((a,b)=>b.avg-a.avg);
 const medal=i=>["🥇","🥈","🥉"][i]||`${i+1}.`;
 $("content").innerHTML=`<div class="page-head"><div><h2>Озмуни тозагӣ</h2></div><button class="btn btn-primary" onclick="openCleanliness()">+ Арзёбӣ</button></div>
 <div class="section-card"><h3>Рейтинги ҳуҷраҳо</h3>${board.length?`<div class="leaderboard">${board.map((b,i)=>`<div class="leaderboard-row"><span class="lb-rank">${medal(i)}</span><span class="lb-name">${esc(roomName(b.rid))}</span><span class="lb-bar"><span style="width:${Math.round(b.avg/50*100)}%"></span></span><span class="lb-score">${b.avg.toFixed(1)}/50</span></div>`).join("")}</div>`:"<p>Ҳанӯз арзёбӣ нест.</p>"}</div>
 <div class="section-card"><h3>Таърихи арзёбиҳо</h3><div class="table-wrap"><table><tr><th>Сана</th><th>Ҳуҷра</th><th>Хол</th><th>Мураббӣ</th></tr>${state.cleanliness.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(roomName(x.roomId))}</td><td>${x.total||0}/50</td><td>${esc(supervisorName(x.supervisorId))}</td></tr>`).join("")||'<tr><td colspan="4">Маълумот нест.</td></tr>'}</table></div></div>`;
}
function openCleanliness(){modal(`<h2>Арзёбии тозагӣ</h2><div class="form-group"><label>Сана</label><input id="cleanDate" type="date" value="${todayStr()}"></div><div class="form-group"><label>Ҳуҷра</label><select id="cleanRoom">${state.rooms.filter(r=>r.type==="student").map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")}</select></div>${["Фарш","Катҳо","Тиреза","Санитария","Тартиби умумӣ"].map((x,i)=>`<div class="form-group"><label>${x}</label><input id="clean${i+1}" type="number" min="0" max="10" value="10"></div>`).join("")}<button class="btn btn-primary" onclick="saveCleanliness()">Сабт</button>`)}
async function saveCleanliness(){const v=[1,2,3,4,5].map(i=>Number($("clean"+i).value));if(v.some(x=>x<0||x>10))return err("Ҳар меъёр 0–10 бошад.");await addDoc(collection(db,"cleanliness_inspections"),{roomId:$("cleanRoom").value,supervisorId:uid(),date:$("cleanDate").value,criteria:v,total:v.reduce((a,b)=>a+b,0),createdAt:serverTimestamp()});closeModal();ok("Арзёбӣ сабт шуд.")}
 
/* ---------- duty roster + daily stage confirmations ---------- */
function rosterPage(){
 const canEdit=elevated(),tk=todayKey();
 $("content").innerHTML=`<div class="page-head"><div><h2>Навбатдорӣ</h2><p>Навбатдории ҳафтаинаи мураббиён</p></div></div>
 <div class="section-card"><h3>Ҷадвали навбатдорӣ</h3><div class="table-wrap"><table><tr><th>Рӯз</th><th>Мураббӣ(ҳо)</th>${canEdit?"<th>Амал</th>":""}</tr>${Object.keys(DAY_LABELS).map(k=>{const rec=state.roster.find(x=>x.id===k);const names=(rec?.supervisorIds||[]).map(supervisorName).join(", ")||"—";return `<tr class="${k===tk?"today-row":""}"><td>${DAY_LABELS[k]}${k===tk?" 🔔":""}</td><td>${esc(names)}</td>${canEdit?`<td><button class="link-btn" onclick="openEditRoster('${k}')">Ислоҳ</button></td>`:""}</tr>`}).join("")}</table></div></div>
 <div class="section-card"><h3>Фаъолиятҳои имрӯза</h3>${renderStagesBoard()}</div>`;
}
function openEditRoster(k){const rec=state.roster.find(x=>x.id===k);modal(`<h2>Навбатдории ${DAY_LABELS[k]}</h2><div class="form-group"><label>Мураббиён</label>${state.supervisors.map(s=>`<label class="checkbox-row"><input type="checkbox" class="roster-check" value="${s.id}"${(rec?.supervisorIds||[]).includes(s.id)?" checked":""}>${esc(s.name||s.email)}</label>`).join("")}</div><div class="form-group"><label>Оғоз</label><input id="dutyStart" type="time" value="${esc(rec?.startTime||"")}"></div><div class="form-group"><label>Анҷом</label><input id="dutyEnd" type="time" value="${esc(rec?.endTime||"")}"></div><div class="form-group"><label>Номи навбат</label><input id="dutyTitle" value="${esc(rec?.title||"Навбатдорӣ")}"></div><button class="btn btn-primary" onclick="saveRoster('${k}')">Нигоҳ доштан</button>`)}
async function saveRoster(k){const ids=[...document.querySelectorAll(".roster-check:checked")].map(x=>x.value);const start=$("dutyStart")?.value||"";const end=$("dutyEnd")?.value||"";const title=$("dutyTitle")?.value.trim()||"Навбатдорӣ";await setDoc(doc(db,"duty_roster",k),{id:k,day:k,supervisorIds:ids,startTime:start,endTime:end,title,updatedAt:serverTimestamp()},{merge:true});closeModal();ok("Навбатдорӣ нигоҳ дошта шуд.")}
function renderStagesBoard(){
 const stages=state.stages?.list?.length?state.stages.list:DEFAULT_STAGES;
 const ts=todayStr(),canManage=elevated();
 return `<div class="stage-list">${stages.map(st=>{const conf=state.stageConfirms.find(x=>x.id===`${ts}_${st.key}`);return `<div class="stage-row${conf?" confirmed":""}"><span>${esc(st.label)}</span>${conf?`<small>✅ ${esc(conf.confirmedByName||"")}</small>`:`<button class="btn btn-secondary" onclick="confirmStage('${st.key}','${jsStr(st.label)}')">Тасдиқ кардан</button>`}</div>`}).join("")}</div>${canManage?'<button class="btn btn-secondary" style="margin-top:12px" onclick="openEditStages()">Ислоҳи рӯйхати марҳалаҳо</button>':""}`;
}
async function confirmStage(key,label){await setDoc(doc(db,"stage_confirmations",`${todayStr()}_${key}`),{date:todayStr(),stageKey:key,label,confirmedBy:uid(),confirmedByName:state.profile?.name||state.profile?.email,createdAt:serverTimestamp()});ok("Тасдиқ шуд.")}
function openEditStages(){const stages=state.stages?.list?.length?state.stages.list:DEFAULT_STAGES;modal(`<h2>Марҳалаҳои рӯз</h2><div class="form-group"><label>Ҳар марҳала дар як сатр нависед</label><textarea id="stagesText" rows="6">${stages.map(s=>esc(s.label)).join("\n")}</textarea></div><button class="btn btn-primary" onclick="saveStages()">Нигоҳ доштан</button>`)}
async function saveStages(){const lines=$("stagesText").value.split("\n").map(x=>x.trim()).filter(Boolean);if(!lines.length)return err("Камаш як марҳала нависед.");const list=lines.map((label,i)=>({key:"s"+i,label}));await setDoc(doc(db,"app_settings","daily_stages"),{list},{merge:false});closeModal();ok("Рӯйхати марҳалаҳо нав шуд.")}
 
/* ---------- admin daily schedule + wake settings ---------- */
function openDailyScheduleManager(){
 const rows=state.dailySchedule.map(a=>`<div class="schedule-row"><b>${esc(a.title)}</b><span>${esc(a.startTime)}</span><button class="link-btn danger" onclick="deleteDailySchedule('${a.id}')">Нест</button></div>`).join("")||"<p>Ҳанӯз ҷадвал нест.</p>";
 modal(`<h2>Фаъолиятҳои ҳаррӯза</h2><div class="schedule-list">${rows}</div><hr><div class="form-group"><label>Номи фаъолият</label><input id="dailyTitle" placeholder="Масалан: Дарс тайёркунӣ"></div><div class="form-group"><label>Вақт</label><input id="dailyTime" type="time"></div><div class="form-group"><label>Рӯзҳо</label><div class="days-checks">${Object.entries(DAY_LABELS).map(([k,v])=>`<label class="checkbox-row"><input type="checkbox" class="daily-day" value="${k}" checked>${v}</label>`).join("")}</div></div><button class="btn btn-primary" onclick="saveDailySchedule()">Илова кардан</button>`);
}
async function saveDailySchedule(){const title=$("dailyTitle").value.trim(),startTime=$("dailyTime").value,days=[...document.querySelectorAll(".daily-day:checked")].map(x=>x.value);if(!title||!startTime||!days.length)return err("Ном, вақт ва рӯзҳоро пур кунед.");await addDoc(collection(db,"daily_schedule"),{title,startTime,days,enabled:true,createdBy:uid(),createdAt:serverTimestamp()});closeModal();ok("Фаъолият ба ҷадвал илова шуд.");}
async function deleteDailySchedule(id){if(!confirm("Ин фаъолият нест карда шавад?"))return;await deleteDoc(doc(db,"daily_schedule",id));openDailyScheduleManager();}
function openWakeManager(){
 const list=[...state.wakeConfirms].sort((a,b)=>(a.confirmedAt||"").localeCompare(b.confirmedAt||""));
 modal(`<h2>🌅 Вақти бедоршавӣ</h2><div class="form-group"><label>Вақти умумии бедоршавӣ</label><input id="wakeTime" type="time" value="${esc(state.wakeSettings?.time||"06:30")}"></div><button class="btn btn-primary" onclick="saveWakeManager()">Нигоҳ доштан</button>
 <h3 style="margin-top:20px">Бедоршавии имрӯза</h3><div class="table-wrap"><table><tr><th>Ном</th><th>Вақт</th></tr>${list.map(m=>`<tr><td>${esc(m.userName||"—")}</td><td>${chatTime(m.confirmedAt)}</td></tr>`).join("")||'<tr><td colspan="2">Ҳанӯз ҳеҷ кас тасдиқ накардааст.</td></tr>'}</table></div>`);
}
async function saveWakeManager(){const time=$("wakeTime").value;if(!time)return err("Вақтро интихоб кунед.");await setDoc(doc(db,"app_settings","wake_schedule"),{time,updatedAt:serverTimestamp(),updatedBy:uid()},{merge:true});closeModal();ok("Вақти бедоршавӣ нигоҳ дошта шуд.");}
 
/* ---------- tea recipe menu ---------- */
function teaPage(){
 $("content").innerHTML=`<div class="page-head"><div><h2>Менюи чойнӯшӣ</h2><p>Рецептҳои умумии чойнӯшӣ</p></div>${elevated()?'<button class="btn btn-primary" onclick="openAddTea()">+ Рецепти нав</button>':""}</div><div id="teaList" class="tea-grid"></div>`;
 renderTeaList();
}
function renderTeaList(){const el=$("teaList");if(!el)return;el.innerHTML=state.teaRecipes.map(r=>`<div class="tea-card" onclick="openTeaRecipe('${r.id}')"><h3>🍵 ${esc(r.name)}</h3><p>${esc((r.ingredients||"").slice(0,90))}${(r.ingredients||"").length>90?"…":""}</p></div>`).join("")||"<p>Ҳанӯз рецепт нест.</p>"}
function openAddTea(){modal(`<h2>Рецепти нав</h2><div class="form-group"><label>Ном</label><input id="teaName"></div><div class="form-group"><label>Маводҳо</label><textarea id="teaIngredients"></textarea></div><div class="form-group"><label>Тарзи тайёркунӣ</label><textarea id="teaSteps"></textarea></div><button class="btn btn-primary" onclick="saveTea()">Сабт</button>`)}
async function saveTea(){const name=$("teaName").value.trim();if(!name)return err("Номро ворид кунед.");await addDoc(collection(db,"tea_recipes"),{name,ingredients:$("teaIngredients").value.trim(),steps:$("teaSteps").value.trim(),createdBy:uid(),createdAt:serverTimestamp()});closeModal();ok("Рецепт илова шуд.")}
function openTeaRecipe(id){const r=state.teaRecipes.find(x=>x.id===id);if(!r)return;modal(`<h2>🍵 ${esc(r.name)}</h2><h3>Маводҳо</h3><p>${esc(r.ingredients||"—").replaceAll("\n","<br>")}</p><h3>Тарзи тайёркунӣ</h3><p>${esc(r.steps||"—").replaceAll("\n","<br>")}</p>${elevated()?`<div class="action-row"><button class="btn btn-danger" onclick="deleteTea('${id}')">Нест кардан</button></div>`:""}`)}
async function deleteTea(id){if(!confirm("Ин рецепт нест карда шавад?"))return;await deleteDoc(doc(db,"tea_recipes",id));closeModal();ok("Рецепт нест карда шуд.")}
 
/* ---------- staff chat (manager + supervisors + head) ---------- */
function chatPage(){
 if($("chatBox")){renderChat();return}
 const myName=state.profile?.name||state.profile?.email||"Корбар";
 $("content").innerHTML=`<div class="chat-page">
   <div class="chat-card">
     <div class="chat-header">
       <div class="chat-avatar"><span>💬</span><i class="chat-online-dot"></i></div>
       <div class="chat-header-text"><h2>Чати хобгоҳ</h2><p><span class="chat-status-dot"></span> Муоширати дохилии Manager ва мураббиён</p></div>
       <button class="chat-history-btn" type="button" title="Навтарин паёмҳо" onclick="document.getElementById('chatBox')?.scrollTo({top:document.getElementById('chatBox').scrollHeight,behavior:'smooth'})">↻</button>
     </div>
     <div class="chat-box" id="chatBox"></div>
     <div class="chat-composer">
       <button class="chat-add-btn" type="button" title="Илова" aria-label="Илова">+</button>
       <div class="chat-input-wrap"><input id="chatInput" autocomplete="off" placeholder="Паём нависед..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}"></div>
       <button class="chat-send-btn" type="button" aria-label="Фиристодан" onclick="sendChat()">➤</button>
     </div>
     <div class="chat-footer-note">Шумо ҳамчун <b>${esc(myName)}</b> паём мефиристед.</div>
   </div>
 </div>`;
 renderChat();
}
function chatTime(v){if(!v)return"Ҳозир";const d=v?.toDate?v.toDate():new Date(v);return isNaN(d)?"Ҳозир":d.toLocaleTimeString("tg-TJ",{hour:"2-digit",minute:"2-digit"})}
function chatInitial(name){const x=String(name||"?").trim();return esc(x.charAt(0).toUpperCase()||"?")}
function renderChat(){
 const box=$("chatBox");if(!box)return;
 const msgs=state.chat||[];
 box.innerHTML=msgs.map(m=>{const mine=m.senderId===uid();return `<div class="chat-row${mine?" mine":""}">
   ${mine?"":`<div class="chat-mini-avatar">${chatInitial(m.senderName)}</div>`}
   <div class="chat-msg${mine?" mine":""}">
     ${mine?"":`<div class="chat-sender">${esc(m.senderName||"—")}</div>`}
     <div class="chat-text">${esc(m.text||"").replaceAll("\n","<br>")}</div>
     <div class="chat-meta">${chatTime(m.createdAt)} ${mine?"✓✓":""}</div>
   </div>
 </div>`}).join("")||`<div class="chat-empty"><div class="chat-empty-icon">💬</div><h3>Ҳанӯз паём нест</h3><p>Паёми аввалро ба гурӯҳи хобгоҳ фиристед.</p></div>`;
 box.scrollTop=box.scrollHeight;
}
async function sendChat(){const inp=$("chatInput"),v=inp.value.trim();if(!v)return;inp.value="";try{await addDoc(collection(db,"chat_messages"),{text:v,senderId:uid(),senderName:state.profile?.name||state.profile?.email,role:state.profile?.role,createdAt:serverTimestamp()});}catch(e){inp.value=v;err(e.message||"Паём фиристода нашуд.")}}
 
/* ---------- supervisors (invite + promote to head) ---------- */
function supervisorsPage(){
 if(!elevated()&&!isHead()){$("content").innerHTML=`<div class="section-card"><h2>Мураббӣ</h2><p>Ҳуҷраҳо: ${(state.profile.assignedRoomIds||[]).map(roomName).join(", ")||"—"}</p></div>`;return}
 const mgr=elevated();
 $("content").innerHTML=`<div class="page-head"><div><h2>Мураббиён</h2><p>Идоракунии мураббиён</p></div>${mgr?'<button class="btn btn-primary" onclick="openAddSupervisor()">+ Мураббии нав</button>':""}</div><div class="table-wrap"><table><tr><th>Ном</th><th>Email</th><th>Телефон</th><th>Ҳуҷраҳо</th><th>Нақш</th>${mgr?"<th>Амал</th>":""}</tr>${state.supervisors.map(s=>`<tr><td>${esc(s.name||"—")}</td><td>${esc(s.email||"—")}</td><td>${esc(s.phone||"—")}</td><td>${(s.assignedRoomIds||[]).map(roomName).map(esc).join(", ")||"—"}</td><td>${roleLabel(s.role||"supervisor")}</td>${mgr?`<td><button class="link-btn" onclick="toggleHeadRole('${s.id}','${s.role==="head"?"supervisor":"head"}')">${s.role==="head"?"Бозгардонидан ба мураббӣ":"Таъин чун Сармураббӣ"}</button></td>`:""}</tr>`).join("")}</table></div>`;
}
function openAddSupervisor(){modal(`<h2>Мураббии нав</h2><div class="form-group"><label>Ном</label><input id="inviteName"></div><div class="form-group"><label>Email</label><input id="inviteEmail" type="email"></div><div class="form-group"><label>Телефон</label><input id="invitePhone"></div><div class="form-group"><label>Ҳуҷраҳо</label>${state.rooms.filter(r=>r.type!=="supervisor").map(r=>`<label class="checkbox-row"><input type="checkbox" class="invite-room-checkbox" value="${r.id}">${esc(r.name)}</label>`).join("")}</div><button class="btn btn-primary" onclick="createSupervisorInvitation()">Сохтани даъват</button>`)}
async function createSupervisorInvitation(){const name=$("inviteName").value.trim(),email=$("inviteEmail").value.trim(),phone=$("invitePhone").value.trim(),rooms=[...document.querySelectorAll(".invite-room-checkbox:checked")].map(x=>x.value);if(!name||!email)return err("Ном ва email-ро пур кунед.");if(!rooms.length)return err("Ҳуҷра интихоб кунед.");const code=inviteCode();await setDoc(doc(db,"invitations",code),{name,email,phone,roomIds:rooms,role:"supervisor",status:"pending",createdBy:uid(),createdAt:serverTimestamp()});closeModal();modal(`<h2>Даъват сохта шуд ✅</h2><div class="invite-code">${code}</div><p>Email: <b>${esc(email)}</b></p><button class="btn btn-primary" onclick="closeModal()">Хуб</button>`)}
async function toggleHeadRole(sid,newRole){await updateDoc(doc(db,"users",sid),{role:newRole});ok(newRole==="head"?"Ба сармураббӣ таъин шуд.":"Ба мураббии оддӣ баргардонида шуд.")}
function openAssignSupervisor(roomId){modal(`<h2>Таъини мураббӣ</h2><select id="roomSupervisor">${state.supervisors.map(s=>`<option value="${s.id}">${esc(s.name||s.email)}</option>`).join("")}</select><button class="btn btn-primary" onclick="assignSupervisorToRoom('${roomId}')">Сабт</button>`)}
async function assignSupervisorToRoom(roomId){
 const sid=$("roomSupervisor").value;
 const room=state.rooms.find(x=>x.id===roomId);
 const oldSid=room?.supervisorId;
 await updateDoc(doc(db,"rooms",roomId),{supervisorId:sid});
 const r=doc(db,"users",sid),s=await getDoc(r);
 if(s.exists())await updateDoc(r,{assignedRoomIds:[...new Set([...(s.data().assignedRoomIds||[]),roomId])]});
 if(oldSid&&oldSid!==sid){
  const or_=doc(db,"users",oldSid),os=await getDoc(or_);
  if(os.exists())await updateDoc(or_,{assignedRoomIds:(os.data().assignedRoomIds||[]).filter(x=>x!==roomId)});
 }
 closeModal();ok("Мураббӣ таъин шуд.")
}
 
/* ---------- routing ---------- */
function renderPage(){
 const t={dashboard:["Dashboard","Идоракунии хобгоҳ"],students:["Талабаҳо","Идоракунии талабаҳо"],rooms:["Ҳуҷраҳо","Ҷойҳои хоб"],attendance:["Давомот","Журнали ҳаррӯза"],violations:["Қоидавайронкунӣ","Назорати қоидаҳо"],cleanliness:["Озмуни тозагӣ","Арзёбии ҳуҷраҳо"],roster:["Навбатдорӣ","Навбатдории мураббиён"],tea:["Менюи чойнӯшӣ","Рецептҳои умумӣ"],chat:["Чат","Барои роҳбарият ва мураббиён"],supervisors:["Мураббиён","Идоракунии мураббиён"]};
 $("title").textContent=t[state.page]?.[0]||"Dashboard";$("subtitle").textContent=t[state.page]?.[1]||"";
 document.querySelectorAll("#nav [data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 ({dashboard:dashboardPage,students:studentsPage,rooms:roomsPage,attendance:attendancePage,violations:violationsPage,cleanliness:cleanlinessPage,roster:rosterPage,tea:teaPage,chat:chatPage,supervisors:supervisorsPage}[state.page]||dashboardPage)();
}
 
onAuthStateChanged(auth,async user=>{
 if(!user){clearListeners();state.user=null;state.profile=null;renderLogin();return}
 try{
  state.user=user;const p=await getDoc(doc(db,"users",user.uid));if(!p.exists())throw Error("Профили корбар вуҷуд надорад.");state.profile={id:user.uid,...p.data()};
  if(!["manager","supervisor","head"].includes(state.profile.role))throw Error("Нақши корбар нодуруст аст.");
  shell();await seedRooms();startListening();requestNotifications();ensureActiveDutyLog().catch(e=>console.warn(e));renderPage();
 }catch(e){console.error(e);err(e.message);await signOut(auth);renderLogin()}
});
 
if("serviceWorker"in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(e=>console.warn("SW registration failed:",e))})}
 
Object.assign(window,{login,logout,renderLogin,renderSupervisorRegistration,registerSupervisor,closeModal,
 openAddStudent,createStudent,openStudent,openEditStudent,updateStudent,deleteStudent,openTransferStudent,confirmTransfer,removeFromRoom,renderStudentRows,
 openRoom,renderRoomCards,openAddRoom,saveNewRoom,openEditRoom,updateRoom,deleteRoom,openAssignStudent,assignStudent,
 renderJournal,markJournal,
 openViolation,saveViolation,openEditViolation,updateViolation,deleteViolation,renderViolationRows,
 openCleanliness,saveCleanliness,
 openActivity,saveActivity,openDailyScheduleManager,saveDailySchedule,deleteDailySchedule,openWakeManager,saveWakeManager,confirmWake,finishDuty,
 openEditRoster,saveRoster,confirmStage,openEditStages,saveStages,
 openAddTea,saveTea,openTeaRecipe,deleteTea,
 sendChat,
 openAddSupervisor,createSupervisorInvitation,toggleHeadRole,openAssignSupervisor,assignSupervisorToRoom});
 
