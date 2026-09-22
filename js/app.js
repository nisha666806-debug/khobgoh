const state={
 page:"dashboard", role:"Manager", user:"Manager",
 students:[
  {id:"s1",name:"Али Каримов",dob:"2010-05-12",phone:"900000001",address:"Душанбе",father:"900000011",className:"8-А",teacher:"Саидова М.",supervisor:"Мураббӣ 1",room:1,place:1,status:"Active"},
  {id:"s2",name:"Муҳаммад Назаров",dob:"2011-02-03",phone:"900000002",address:"Ҳисор",father:"900000012",className:"8-Б",teacher:"Раҳимов А.",supervisor:"Мураббӣ 1",room:1,place:2,status:"Active"},
  {id:"s3",name:"Фаридун Саидов",dob:"2010-08-21",phone:"900000003",address:"Ваҳдат",father:"900000013",className:"9-А",teacher:"Каримова Н.",supervisor:"Мураббӣ 2",room:2,place:1,status:"Active"}
 ],
 supervisors:Array.from({length:8},(_,i)=>({id:"u"+i,name:"Мураббӣ "+(i+1),phone:"9000000"+(20+i),rooms:[i<4?i+1:i-3]})),
 rooms:Array.from({length:10},(_,i)=>({id:i+1,name:"Room №"+(i+1),type:i<7?"Student":"Supervisor",capacity:i<7?8:4,supervisor:i<8?"Мураббӣ "+(i+1):""})),
 attendance:[], violations:[], cleanliness:[]
};

const $=s=>document.querySelector(s);
function save(){localStorage.setItem("dormitoryDemo",JSON.stringify(state))}
function load(){try{const x=JSON.parse(localStorage.getItem("dormitoryDemo"));if(x)Object.assign(state,x)}catch{}}
load();

const titles={dashboard:["Dashboard","Идоракунии хобгоҳ"],students:["Донишҷӯён","Маълумоти донишҷӯён"],rooms:["Ҳуҷраҳо","Ҳуҷраҳо ва ҷойҳои хоб"],attendance:["Attendance","Ҳозиршавии ҳаррӯза"],violations:["Қоидавайронкунӣ","Сабти ҳолатҳои вайронкунӣ"],cleanliness:["Озмуни тозагӣ","Рейтинги тозагии ҳуҷраҳо"],supervisors:["Мураббиён","Идоракунии мураббиён"]};

function render(){
 const [t,s]=titles[state.page]||titles.dashboard;$("#title").textContent=t;$("#subtitle").textContent=s;
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 const fn={dashboard:dashboard,students:students,rooms:rooms,attendance:attendance,violations:violations,cleanliness:cleanliness,supervisors:supervisors}[state.page];
 $("#content").innerHTML=fn(); bind();
}
function activeStudents(){return state.students.filter(x=>x.status==="Active")}
function occupancy(){return activeStudents().filter(x=>x.room).length}
function dashboard(){const occ=occupancy(), places=7*8+2*4;return `<div class="grid">
<div class="card stat"><div><div class="muted">Total students</div><div class="num">${activeStudents().length}</div></div><div class="icon">👨‍🎓</div></div>
<div class="card stat"><div><div class="muted">Rooms</div><div class="num">10</div></div><div class="icon">🏠</div></div>
<div class="card stat"><div><div class="muted">Occupied places</div><div class="num">${occ}</div></div><div class="icon">🛏️</div></div>
<div class="card stat"><div><div class="muted">Available</div><div class="num">${places-occ}</div></div><div class="icon">✅</div></div>
</div><br><div class="grid">
<div class="card"><div class="section-head"><h2>Room occupancy</h2></div>${state.rooms.slice(0,7).map(r=>{let n=activeStudents().filter(s=>s.room===r.id).length;return `<p>${r.name} <b>${n}/${r.capacity}</b></p><div class="progress"><i style="width:${n/r.capacity*100}%"></i></div>`}).join("")}</div>
<div class="card"><div class="section-head"><h2>Quick actions</h2></div><div class="filters"><button class="primary" data-action="addStudent">+ Add Student</button><button class="primary" data-page="rooms">Assign Place</button><button class="primary" data-page="attendance">Attendance</button><button class="primary" data-page="violations">Add Violation</button><button class="primary" data-page="cleanliness">Cleanliness Check</button></div></div>
</div>`}
function students(){return `<div class="section-head"><h2>Students</h2><button class="primary" data-action="addStudent">+ Add Student</button></div><div class="filters"><input id="search" placeholder="Ҷустуҷӯ аз рӯи ном, синф, ҳуҷра..."></div><div class="table-wrap"><table class="table"><thead><tr><th>Ном</th><th>Синф</th><th>Supervisor</th><th>Room / Place</th><th>Status</th><th></th></tr></thead><tbody id="studentRows">${studentRows(state.students)}</tbody></table></div>`}
function studentRows(arr){return arr.map(s=>`<tr><td><b>${s.name}</b><br><span class="muted">${s.phone}</span></td><td>${s.className}</td><td>${s.supervisor}</td><td>${s.room?`№${s.room} / ${s.place}`:"—"}</td><td><span class="badge">${s.status}</span></td><td><button data-action="profile" data-id="${s.id}">View</button></td></tr>`).join("")||`<tr><td colspan="6" class="empty">Донишҷӯ ёфт нашуд</td></tr>`}
function rooms(){return `<div class="room-grid">${state.rooms.map(r=>{const ss=activeStudents().filter(s=>s.room===r.id);return `<div class="room"><div class="room-top"><div><h3>${r.name}</h3><span class="muted">${r.type} · ${r.supervisor||"—"}</span></div><b>${ss.length}/${r.capacity}</b></div><div class="places">${Array.from({length:r.capacity},(_,i)=>{let st=ss.find(s=>s.place===i+1);return `<div class="place ${st?"occupied":""}" data-action="${st?"profile":"assign"}" data-room="${r.id}" data-place="${i+1}" data-id="${st?.id||""}">Place ${i+1}<br>${st?st.name.split(" ")[0]:"Available"}</div>`}).join("")}</div></div>`}).join("")}</div>`}
function attendance(){let d=new Date().toISOString().slice(0,10);return `<div class="section-head"><h2>Attendance — ${d}</h2><button class="primary" data-action="saveAttendance">Save</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Room</th><th>Status</th><th>Note</th></tr></thead><tbody>${activeStudents().map(s=>`<tr><td>${s.name}</td><td>№${s.room}</td><td><select class="att" data-id="${s.id}"><option>Present</option><option>Absent</option><option>Permission</option><option>Sick</option></select></td><td><input class="attnote" data-id="${s.id}" placeholder="Reason"></td></tr>`).join("")}</tbody></table></div>`}
function violations(){return `<div class="section-head"><h2>Violations</h2><button class="primary" data-action="addViolation">+ Add Violation</button></div><div class="card">${state.violations.length?`<table class="table"><thead><tr><th>Date</th><th>Student</th><th>Text</th><th>Severity</th></tr></thead><tbody>${state.violations.map(v=>`<tr><td>${v.date}</td><td>${v.student}</td><td>${v.text}</td><td>${v.severity}</td></tr>`).join("")}</tbody></table>`:`<div class="empty">Ҳоло қоидавайронкунӣ нест</div>`}</div>`}
function cleanliness(){let days=["Tuesday","Wednesday","Thursday","Friday"];let scores=state.rooms.slice(0,7).map(r=>{let vals=days.map(d=>{let x=state.cleanliness.find(c=>c.room===r.id&&c.day===d);return x?x.total:0});return {...r,vals,total:vals.reduce((a,b)=>a+b,0)}}).sort((a,b)=>b.total-a.total);return `<div class="card"><div class="section-head"><h2>🏆 Weekly Competition</h2><button class="primary" data-action="cleanCheck">+ Cleanliness Check</button></div>${scores.map((r,i)=>`<div class="rank"><div class="rankno">${["🥇","🥈","🥉"][i]||("#"+(i+1))}</div><div style="flex:1"><b>${r.name}</b><div class="muted">Tue ${r.vals[0]} · Wed ${r.vals[1]} · Thu ${r.vals[2]} · Fri ${r.vals[3]}</div><div class="progress"><i style="width:${r.total/200*100}%"></i></div></div><b>${r.total}/200</b></div>`).join("")}</div>`}
function supervisors(){return `<div class="grid">${state.supervisors.map(s=>`<div class="card"><h3>${s.name}</h3><p class="muted">📞 ${s.phone}</p><p>Rooms: ${s.rooms.map(x=>"№"+x).join(", ")}</p><span class="badge">${activeStudents().filter(st=>st.supervisor===s.name).length} students</span></div>`).join("")}</div>`}

function modal(html){$("#modalContent").innerHTML=html;$("#modal").classList.remove("hidden")}
function bind(){
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>actions(b.dataset.action,b.dataset.id,b.dataset.room,b.dataset.place));
 const search=$("#search");if(search)search.oninput=()=>{$("#studentRows").innerHTML=studentRows(state.students.filter(s=>(s.name+s.className+s.room+s.supervisor).toLowerCase().includes(search.value.toLowerCase())))}
}
function actions(a,id,room,place){
 if(a==="addStudent")modal(`<h2>Новый студент</h2><form class="form" id="studentForm"><div class="form-grid"><label>Full name<input name="name" required></label><label>Date of birth<input type="date" name="dob"></label><label>Phone<input name="phone"></label><label>Father phone<input name="father"></label><label>Class<input name="className"></label><label>Class teacher<input name="teacher"></label></div><label>Address<input name="address"></label><button class="primary">Save Student</button></form>`);
 if(a==="profile"){let s=state.students.find(x=>x.id===id);modal(`<h2>${s.name}</h2><p><b>Phone:</b> ${s.phone}</p><p><b>DOB:</b> ${s.dob}</p><p><b>Address:</b> ${s.address}</p><p><b>Father:</b> ${s.father}</p><p><b>Class:</b> ${s.className}</p><p><b>Teacher:</b> ${s.teacher}</p><p><b>Supervisor:</b> ${s.supervisor}</p><p><b>Room:</b> ${s.room||"—"} / ${s.place||"—"}</p><p><b>Status:</b> ${s.status}</p>`)}
 if(a==="assign")modal(`<h2>Assign Place</h2><p>Room №${room}, Place ${place}</p><form class="form" id="assignForm"><label>Student<select name="student">${activeStudents().filter(s=>!s.room).map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select></label><button class="primary">Confirm placement</button></form>`);
 if(a==="addViolation")modal(`<h2>Add Violation</h2><form class="form" id="violationForm"><label>Student<select name="student">${activeStudents().map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select></label><label>Description<textarea name="text" required></textarea></label><label>Severity<select name="severity"><option>Low</option><option>Medium</option><option>High</option></select></label><button class="primary">Save</button></form>`);
 if(a==="cleanCheck")modal(`<h2>Cleanliness Check</h2><form class="form" id="cleanForm"><label>Room<select name="room">${state.rooms.slice(0,7).map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}</select></label><label>Day<select name="day"><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></label><div class="form-grid">${["Bed linen / bed arrangement","Dust / cleanliness","Freshness / ventilation","Wardrobes","Overall appearance"].map((x,i)=>`<label>${x}<input type="number" name="c${i}" min="0" max="10" value="10"></label>`).join("")}</div><button class="primary">Save score</button></form>`);
 if(a==="saveAttendance"){document.querySelectorAll(".att").forEach(el=>{let s=state.students.find(x=>x.id===el.dataset.id);state.attendance.push({student:s.name,date:new Date().toISOString().slice(0,10),status:el.value,note:document.querySelector(`.attnote[data-id="${el.dataset.id}"]`)?.value||"",supervisor:s.supervisor,timestamp:Date.now()})});save();alert("Attendance saved");}
}
$("#nav").onclick=e=>{let b=e.target.closest("button");if(b){state.page=b.dataset.page;render()}}
$("#closeModal").onclick=()=>$("#modal").classList.add("hidden");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.add("hidden")};
$("#menu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
$("#logout").onclick=()=>{state.user="Manager";alert("Logged out (demo mode)")};
document.addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target);
 if(e.target.id==="studentForm"){state.students.push({id:"s"+Date.now(),name:f.get("name"),dob:f.get("dob"),phone:f.get("phone"),address:f.get("address"),father:f.get("father"),className:f.get("className"),teacher:f.get("teacher"),supervisor:"Мураббӣ 1",room:null,place:null,status:"Active"});save();$("#modal").classList.add("hidden");render()}
 if(e.target.id==="assignForm"){let s=state.students.find(x=>x.id===f.get("student"));s.room=Number(e.target.closest(".modal-card").querySelector("p").textContent.match(/№(\d+),/)[1]);s.place=Number(e.target.closest(".modal-card").querySelector("p").textContent.match(/Place (\d+)/)[1]);save();$("#modal").classList.add("hidden");render()}
 if(e.target.id==="violationForm"){let s=state.students.find(x=>x.id===f.get("student"));state.violations.push({student:s.name,date:new Date().toISOString().slice(0,10),text:f.get("text"),severity:f.get("severity"),supervisor:s.supervisor,timestamp:Date.now()});save();$("#modal").classList.add("hidden");render()}
 if(e.target.id==="cleanForm"){let vals=[0,1,2,3,4].map(i=>Number(f.get("c"+i)));state.cleanliness.push({room:Number(f.get("room")),day:f.get("day"),criteria:vals,total:vals.reduce((a,b)=>a+b,0),timestamp:Date.now()});save();$("#modal").classList.add("hidden");render()}
});
render();