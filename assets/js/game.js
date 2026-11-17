





(()=>{
const {activityMeta,shopCatalog,recipes,ingredientNames}=window.ArdayGameConfig;
const $=id=>document.getElementById(id), clamp=n=>Math.max(0,Math.min(100,Math.round(n))), pad=n=>String(n).padStart(2,'0');
// Hard-isolate the footer from all room/WebGL stacking contexts.
const bubbleNodes=document.querySelectorAll('.bubble,.dialogue-pill');bubbleNodes.forEach((node,i)=>{if(i>0)node.remove()});
const navFooter=document.querySelector('footer.bottom');
if(navFooter){
 document.body.appendChild(navFooter);
 Object.assign(navFooter.style,{position:'fixed',left:'50%',right:'auto',bottom:'0',width:'min(100%, 1100px)',transform:'translateX(-50%)',zIndex:'2147483647',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 14px calc(8px + env(safe-area-inset-bottom))',background:'#f3e7d2',pointerEvents:'auto',isolation:'isolate',boxSizing:'border-box'});
 navFooter.querySelectorAll('button').forEach(b=>{b.style.position='relative';b.style.zIndex='2147483001';b.style.pointerEvents='auto';b.style.touchAction='manipulation'});
}
// Bind each bottom-navigation button exactly once. Previously the same
// click was handled both on document capture and on the button itself,
// causing openTab() to run twice and immediately close the newly opened panel.
document.querySelectorAll('footer.bottom .tool').forEach(button=>button.addEventListener('click',event=>{
 event.preventDefault();
 try{openTab(button.dataset.tab)}
 catch(error){console.error('Navigation failed:',error);const stage=$('stage');if(stage){let msg=stage.querySelector('.three-status');if(!msg){msg=document.createElement('div');msg.className='three-status';stage.appendChild(msg)}msg.textContent='页面操作出错：'+(error&&error.message?error.message:String(error))}}
}));

window.addEventListener('error',event=>{const stage=$('stage');if(!stage)return;let msg=stage.querySelector('.three-status');if(!msg){msg=document.createElement('div');msg.className='three-status';stage.appendChild(msg)}msg.textContent='脚本运行错误：'+(event.message||'未知错误')});
const base={roomCondition:92,friend:24,attach:12,bored:4,hate:0,love:3,energy:78,hunger:62,clean:86,fun:70,money:30000,items:['一本旧书','陶杯'],furniture:['沙发','茶几','窗户','植物','冰箱','灶台','水槽'],pantry:{rice:1,egg:2,vegetable:2,tomato:1},readyMeals:[],preferences:{},memories:[],events:[],visits:0,last:Date.now(),lastTick:Date.now(),calendar:null,room:{sofa:0,window:0,table:0},personality:null,activityLog:[],lastHourKey:''};
let s={...base};
let selectedCalendarDay=0;try{const old=JSON.parse(localStorage.getItem('arday-save-v2')||'null');if(old){s={...base,...old};if(typeof old.money!=='number')s.money=typeof old.coins==='number'?old.coins*10:30000;if(!old.testFundsV2){s.money=30000;s.testFundsV2=true;}}}catch(e){} delete s.coins;
s.preferences=s.preferences||{};s.memories=s.memories||[];s.events=s.events||[];s.items=s.items||[];s.furniture=s.furniture||base.furniture.slice();
s.ownedFurniture=s.ownedFurniture||[];
s.placedFurniture=s.placedFurniture||[];
if((s.furnitureCatalogVersion||0)<2){
 s.ownedFurniture=[];s.placedFurniture=[];s.furniture=[];
 s.furnitureLayout=s.furnitureLayout||{};s.furnitureLayout.living={};
 s.roomPositions=s.roomPositions||{};s.roomPositions.living={};
 s.furnitureCatalogVersion=2;
}
s.ownedFurniture=s.ownedFurniture||[];s.placedFurniture=s.placedFurniture||[];
s.pantry=s.pantry||{rice:1,egg:2,vegetable:2,tomato:1};s.readyMeals=s.readyMeals||[];s.room=s.room||{sofa:0,window:0,table:0};s.roomCondition=typeof s.roomCondition==='number'?s.roomCondition:92;s.activityLog=s.activityLog||[];s.revealedTraits=s.revealedTraits||[];
s.jobApplications=s.jobApplications||{};
const statKeys=['friend','attach','bored','hate','love','energy','hunger','clean','fun'];
function save(){s.last=Date.now();try{localStorage.setItem('arday-save-v2',JSON.stringify(s))}catch(e){}}
function render(){statKeys.forEach(k=>{let v=$(k+'V'),b=$(k+'B');if(v)v.textContent=Math.round(Number(s[k])||0);if(b)b.style.width=(Number(s[k])||0)+'%'});let d=$('date');if(d)d.textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})+' · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});let cash=$('cash');if(cash)cash.textContent='共同账户 ¥'+s.money;let up=$('upkeep');if(up)up.textContent='房间维护 '+Math.round(Number(s.roomCondition)||0)+'%';if(typeof refreshTopActions==='function')refreshTopActions();}
function say(t){const b=$('dialogue');if(!b)return;document.querySelectorAll('.bubble,.dialogue-pill').forEach(node=>{if(node!==b)node.remove()});b.textContent=String(t||'');Object.assign(b.style,{display:'block',position:'absolute',left:'50%',top:'12px',zIndex:'45',transform:'translateX(-50%)',maxWidth:'min(72%,380px)',padding:'8px 14px',background:'#fff9edee',border:'1px solid #e0ceb3',borderRadius:'15px 15px 15px 5px',color:'#514334',fontSize:'12px',lineHeight:'1.45',textAlign:'center',boxShadow:'0 5px 16px #493a2926',pointerEvents:'none',opacity:'1',animation:'none'})}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),1900)}
function animate(type){let p=$('person');p.classList.remove('wave','sit','walk');void p.offsetWidth;p.classList.add(type||'wave')}
function remember(type,text,weight=1){s.memories.push({type,text,at:Date.now(),weight});if(s.memories.length>40)s.memories.shift()}
function change(delta){Object.entries(delta).forEach(([k,v])=>{if(k in s)s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)+Number(v||0)))})}
function dayAnchor(){return dayAnchorAt(Date.now())}
function dayKey(value){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))throw new TypeError('dayKey expects a valid Date or timestamp');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function plusDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}
function dayLabel(d){return d.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',weekday:'short'})}
function eventAt(key,h){return (s.calendar?.days?.[key]||[]).find(e=>h>=e.start&&h<e.end)}
function has(item){return s.items.includes(item)||s.furniture.includes(item)||s.ownedFurniture.includes(item)||(s.placedFurniture||[]).some(x=>x.name===item)}
function addEvent(title,detail,type='daily',choices=[]){let e={id:Date.now()+Math.random(),title,detail,type,choices,created:Date.now(),status:'open'};s.events.unshift(e);s.events=s.events.slice(0,12);return e}
function completeEvent(e,choice){e.status='resolved';e.choice=choice;remember('event',e.title+'：'+choice,2)}








const tabs={
 '互动':[['聊天','💬','chat'],['一起做饭','🥘','cook-together'],['一起喝茶','🍵','tea'],['听音乐','♫','music'],['出门散步','🌿','walk'],['一起看书','📖','read'],['玩个游戏','🎲','game'],['休息一会','☁','rest'],['一起吃点东西','🥐','food'],['整理房间','🧹','tidy']],
 '物品':[],
 '商店':[]
};

let shopCategory='食物食材';
const furnitureNameById={'buy-furniture-rug':'地毯','buy-furniture-sofa':'沙发','buy-furniture-art':'壁画','buy-furniture-divider':'隔断','buy-furniture-palm':'棕榈树绿植','buy-furniture-bookshelf':'书架','buy-furniture-desk':'书桌','buy-furniture-chair':'椅子','buy-furniture-computer':'电脑','buy-furniture-dining-table':'餐桌','buy-furniture-dining-chair':'餐桌椅','buy-furniture-bouquet':'捧花摆件'};
function addItem(name){s.items.push(name)}
function purchase(id,label,cost){
 if(s.money<cost){toast('¥不足');return}
 if(id.startsWith('buy-furniture-')){
  const furnitureName=furnitureNameById[id];if(!furnitureName){toast('商品信息不存在');return}
  s.money-=cost;s.ownedFurniture.push(furnitureName);say('这件家具已经收进物品栏。等你决定好位置，再把它摆进房间。');
  remember('purchase',label,2);save();render();toast('购入：'+label);openTab('物品',true);return;
 }
 s.money-=cost;
 if(id==='buy-food')addItem('点心');
 else if(id==='buy-record')addItem('唱片');

 say('买下了'+label+'。这会给我们的生活带来一点变化。');remember('purchase',label,2);save();render();toast('购入：'+label);openTab('商店',true);
}
function openTab(name,force=false){
 const active=document.querySelector('.tool.active')?.dataset.tab;
 if(!force&&active===name&&((name==='日程'&&$('stage').classList.contains('calendar-mode'))||(name!=='日程'&&$('drawer').classList.contains('open')))){if(arday3D?.cancelGesture)arday3D.cancelGesture();closeCalendar();$('drawer').classList.remove('open','profile-expanded');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));return}
 if(name==='日程'){openCalendar();return}
 if(name==='目标'){showGoals();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='目标'));return}
 if(name==='账户'){showCollection();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='账户'));return}
 if(name==='职业'){showCareer();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='职业'));return}
 $('drawer').classList.remove('profile-expanded');
 $('drawerTitle').textContent=name+' · ¥'+s.money;$('choices').innerHTML='';
 if(name==='商店'){
  const nav=document.createElement('div');nav.className='shop-categories';
  ['食物食材','家具'].forEach(category=>{const button=document.createElement('button');button.type='button';button.className='shop-category'+(shopCategory===category?' active':'');button.textContent=category;button.onclick=()=>{shopCategory=category;openTab('商店',true)};nav.appendChild(button)});
  $('choices').appendChild(nav);
 }
 const tabEntries=name==='商店'?[...(shopCatalog[shopCategory]||[])]:[...(tabs[name]||[])];
 if(name==='物品'){
  const itemIcons={'一本旧书':'📖','旧书':'📖','陶杯':'☕','点心':'🥐','唱片':'💿','修理工具':'🔧'};
  s.items.forEach((item,index)=>tabEntries.push([item,itemIcons[item]||'▧','use-inventory-'+index]));
  Object.entries(ingredientNames).forEach(([key,label])=>{const count=pantryCount(key);if(count>0)tabEntries.push([label+' ×'+count,'🥬','pantry-inventory-'+key])});
  s.ownedFurniture.forEach((item,index)=>tabEntries.push([item,'▧','place-owned-'+index]));
 }
 tabEntries.forEach(([label,emoji,id,cost])=>{
  let b=document.createElement('button');b.className='choice';let owned=(id==='buy-player'&&has('唱片机'))||(id==='buy-desk'&&has('书桌'))||(id==='buy-shelf'&&has('书架'));
  b.innerHTML='<span class="emoji">'+emoji+'</span>'+label+(cost?'<small>'+(owned?'已拥有':cost+' ¥')+'</small>':'');
  b.onclick=()=>{
   if(id.startsWith('pantry-inventory-')){openKitchenPanel(false);return}
   if(id.startsWith('use-inventory-')){
    const index=Number(id.slice('use-inventory-'.length)),item=s.items[index];
    if(!item){openTab('物品',true);return}
    if(item==='点心'){s.items.splice(index,1);change({hunger:25,fun:2});say('点心正好派上用场。')}
    else if(item==='唱片'){if(!has('唱片机')){say('有唱片了，但还缺一台唱片机。');return}perform('music')}
    else if(item==='陶杯')perform('tea');
    else if(item==='一本旧书'||item==='旧书')perform('read');
    else if(item==='修理工具'){s.roomCondition=clamp(s.roomCondition+12);s.items.splice(index,1);say('我用修理工具把房间里几处松动的地方处理好了。')}
    save();render();openTab('物品',true);return;
   }
   if(id.startsWith('place-owned-')){
    const index=Number(id.slice('place-owned-'.length)),item=s.ownedFurniture[index];
    if(!item){toast('这件物品已不在库存中');openTab('物品',true);return}
    if(!arday3D?.placeOwnedFurniture||!arday3D.placeOwnedFurniture(item)){toast('当前场景无法放置这件家具');return}
    s.ownedFurniture.splice(index,1);save();say('把'+item+'放进房间吧。');openTab('物品',true);return;
   }
   if(id==='kitchen'){openKitchenPanel(false);return}
   if(id==='cook-together'){if(Math.random()>.67){s.rejections=(s.rejections||0)+1;say(['今天不想一起做饭。你先决定吃什么吧。','厨房先留给我自己待会儿用，暂时不需要搭档。','做饭可以改天，我现在没这个兴致。'][Math.floor(Math.random()*3)]);save();return}openKitchenPanel(true);return}
   if(id.startsWith('buy-ingredient-')){buyIngredient(id,label,+cost);return}
   if(id.startsWith('buy-')){purchase(id,label,+cost);return}
   if(id==='events'){renderEvents();return}
   if(id==='profile'){renderProfile();return}
   if(id==='chat'){say('我在听。你想从哪件事说起？');}
   else if(id==='collection'){showCollection();return}
   else if(id==='use-food'){let i=s.items.indexOf('点心');if(i<0){toast('物品栏里没有点心');return}s.items.splice(i,1);change({hunger:25,fun:2});say('点心正好派上用场。');}
   else if(id==='use-record'){if(!has('唱片机')){say('有唱片了，但还缺一台唱片机。');return}perform('music')}
   else if(id==='use-book')perform('read');
   else if(id==='use-cup')perform('tea');
   else perform(id);
   save();render();$('drawerTitle').textContent=name+' · ¥ '+s.money;
  };
  $('choices').appendChild(b);
 });
 $('drawer').classList.add('open');document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
}

function eventChoicesLegacy(e){
 $('drawerTitle').textContent=e.title;
 let opts=e.type==='long'?['同意，一起做','先等等','提出别的计划']:e.title.includes('唱片机')?['直接买下来','先不花钱','去二手市场找找']:['陪他一起','让他自己决定','提出替代方案'];
 $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="choices">'+opts.map((x,i)=>'<button class="choice" data-choice="'+i+'">'+x+'</button>').join('')+'</div>';
 $('choices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
  let i=+b.dataset.choice,choice=opts[i];
  if(e.title.includes('唱片机')){
   if(i===0){if(s.money>=399){s.money-=399;s.furniture.push('唱片机');say('谢谢你。我已经在想第一张要放什么唱片了。');remember('shared','一起决定添置唱片机',3)}else say('钱还不够，我们先攒一点。')}
   else if(i===1){say('好，那就先不买。我也不是非要现在拥有。');s.bored=clamp(s.bored+1)}
   else{say('二手市场听起来不错。我想找找看。');s.preferences.market=(s.preferences.market||0)+1}
  }else if(e.type==='long'){
   if(i===0){say('好。让它慢慢融入日常，不必急着安排什么。');remember('shared',e.title,1)}
   else if(i===1){say('当然，不急。东西已经在这里了，什么时候用都可以。')}
   else{say('可以。等你有了更具体的想法，我们再调整。')}
  }else{
   if(i===0){s.friend=clamp(s.friend+2);s.attach=clamp(s.attach+1);say('好啊，和你一起做会更有意思。');remember('shared',e.title,2)}
   else if(i===1){say('那我自己来。你也可以忙自己的事情。')}
   else{say('可以换个方式，我愿意听听你的想法。');s.friend=clamp(s.friend+1)}
  }
  completeEvent(e,choice);save();render();$('drawer').classList.remove('open');
 });$('drawer').classList.add('open');
}
function renderEvents(){
 let open=s.events.filter(e=>e.status==='open');
 $('drawerTitle').textContent='最近发生的事';
 $('choices').innerHTML=open.length?'':'<div class="event-empty"><span>✧</span><h3>暂时风平浪静</h3><p>阿尔的生活仍在继续。新的事情会在合适的时候发生。</p></div>';
 open.forEach(e=>{let b=document.createElement('button');b.className='choice event-card';b.innerHTML='<span class="event-mark">'+(e.type==='long'?'✦':'·')+'</span><span class="event-copy"><strong>'+e.title+'</strong><small>'+e.detail+'</small></span><span class="event-arrow">›</span>';b.onclick=()=>eventChoices(e);$('choices').appendChild(b)});
 $('drawer').classList.add('open');
}








function closeCalendar(){if(arday3D?.cancelGesture)arday3D.cancelGesture();$('stage').classList.remove('calendar-mode');$('stage').style.touchAction='none';$('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'))}
function slotClick(di,h){
 ensureSchedule();let d=plusDays(dayAnchor(),di),key=dayKey(d),ev=eventAt(key,h);
 $('drawer').classList.add('open');
 if(ev){
  $('drawerTitle').textContent=pad(ev.start)+':00 · '+ev.title;
  $('choices').innerHTML='<div class="calendar-actions"><button id="join">问他能否一起</button><button id="move">商量调整时间</button><button id="remove">让他自己安排</button><button id="return-existing">返回日程</button></div>';
  $('join').onclick=()=>{let yes=ev.kind!=='routine'&&ev.activity!=='sleep'&&ev.kind!=='work'&&s.energy>18&&s.bored<65&&s.hate<70;if(yes){ev.withPlayer=true;remember('planned','决定一起参与：'+ev.title,1);say('好啊，一起做也不错。')}else if(ev.activity==='sleep'||ev.title.includes('睡眠'))say('现在是我的睡眠时间。我不会为了临时邀请打乱作息。我们可以约在明天醒来以后。');else if(ev.kind==='work')say('我已经答应了这份工作，不能临时把它放下。等结束以后再一起安排吧。');else if(ev.kind==='routine')say('这是我固定的生活安排。我愿意商量，但不想直接取消它。');else say('这件事我想自己完成。等我结束后，我们再一起待一会儿。');save();render();$('drawer').classList.remove('open');renderCalendar();};
  $('move').onclick=()=>{
    const target=prompt('想调整到几点？请输入 0–23 之间的整点。'),n=Number(target),duration=ev.end-ev.start,oldStart=ev.start;
    if(!Number.isInteger(n)||n<0||n+duration>24){toast('这个时间不可用');return}
    const conflict=(s.calendar.days[key]||[]).some(x=>x!==ev&&n<x.end&&n+duration>x.start);
    if(conflict){toast('这个时段已有其他安排');return}
    ev.start=n;ev.end=n+duration;
    if(s.pendingWork?.day===key&&s.pendingWork.start===oldStart){s.pendingWork.start=n;s.pendingWork.end=n+duration}
    s.calendar.days[key].sort((a,b)=>a.start-b.start);save();renderCalendar();$('drawer').classList.remove('open');say('我把安排调整到了 '+pad(n)+':00。')
   };
  $('remove').onclick=()=>{if(ev.kind==='routine'||ev.kind==='sleep'||ev.kind==='work'){say(ev.kind==='work'?'这份工作已经答应下来，不能直接取消。':'这属于我的基本生活安排，我不打算取消。你可以和我商量调整，但不能直接替我决定。');s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'重视自主'])];save();return}s.calendar.days[key]=s.calendar.days[key].filter(x=>x!==ev);save();renderCalendar();$('drawer').classList.remove('open');say('好，这段时间我自己决定。')};
  $('return-existing').onclick=()=>{$('drawer').classList.remove('open')};return;
 }
 $('drawerTitle').textContent='提出安排 · '+dayLabel(d)+' '+pad(h)+':00';
 $('choices').innerHTML='<div class="calendar-note">邀请阿尔留出一小时。不同活动会受到他的状态、偏好和关系经历影响。</div><div class="choices">'+[['一起吃点东西','🥐'],['散步','🌿'],['听音乐','♫'],['一起看书','📖'],['玩游戏','🎲'],['自由相处','☁']].map((x,i)=>'<button class="choice" data-p="'+i+'"><span class="emoji">'+x[1]+'</span>'+x[0]+'</button>').join('')+'</div><div class="calendar-actions"><button id="return-empty">返回日程</button></div>';
 $('choices').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{
  let i=+b.dataset.p,names=['一起吃点东西','散步','听音乐','一起看书','玩游戏','自由相处'],pref=['food','walk','music','reading','game','company'][i],score=s.friend*.28+s.attach*.22-s.bored*.5-s.hate*.35+(s.energy-50)*.16+(s.preferences[pref]||0)*4+(i===0&&s.hunger<40?12:0)+(i===2&&s.fun<40?10:0);
  let accepted=score>12+(di*1.5);
  if(accepted){s.calendar.days[key].push({start:h,end:h+1,title:names[i],kind:'proposal',byPlayer:true,withPlayer:true,activity:pref});s.calendar.days[key].sort((a,b)=>a.start-b.start);remember('planned','约定：'+names[i],1);say('可以，我把这段时间留给我们。');}
  else{change({bored:1});s.rejections=(s.rejections||0)+1;if(s.rejections>=2)s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'坚持自己的节奏'])];say(['这个时间我不太想这样安排。我们换个时间，或者各自安排也可以。','我知道你想和我一起，不过我现在确实不想这么做。希望你别把拒绝当成对你的否定。','这次我想说得明确一点：不。我有自己的计划。'][Math.min(2,s.rejections-1)]);}
  save();render();renderCalendar();$('drawer').classList.remove('open');toast(accepted?'阿尔接受了邀请':'阿尔拒绝了这次邀请 · 可以换个时间或活动');
 });
 $('return-empty').onclick=()=>$('drawer').classList.remove('open');
}

function initScene(){let hour=new Date().getHours();$('sun').style.opacity=hour<6||hour>20?'.12':hour<9||hour>17?'.55':'1';}
$('backRoom')?.remove();
// Navigation listeners are installed before simulation initialization.
$('chatForm').addEventListener('submit',e=>{e.preventDefault();let v=$('message').value.trim();if(!v)return;respondToChat(v);$('message').value='';});
let decorating=false;
$('decorate').onclick=()=>{decorating=!decorating;$('stage').classList.toggle('editing',decorating);$('decorate').textContent=decorating?'完成装修':'✦ 装修';if(decorating){$('drawer').classList.remove('open')}else say('好了。')};
document.querySelectorAll('.hotspot').forEach(b=>b.addEventListener('click',()=>{
 let obj=b.dataset.object;
 if(decorating&&arday3D?.selectFurnitureById&&['沙发','茶几','书桌','床'].includes(obj)){
  arday3D.selectFurnitureById(({沙发:'sofa',茶几:'table',书桌:'desk',床:'bed'})[obj]);return;
 }
 if(!decorating){
  if(obj==='茶几')openTab('物品');else if(obj==='沙发')perform('rest');else if(obj==='窗户')perform('read');
  return;
 }
 let opts=obj==='沙发'?['鼠尾草绿','暖杏色','砖红色']:obj==='窗户'?['打开窗帘','合上窗帘','换一幅窗景']:['摆上花瓶','放一本书','点亮台灯'];
 $('drawerTitle').textContent='调整 · '+obj;$('choices').innerHTML='';
 opts.forEach((o,i)=>{let x=document.createElement('button');x.className='choice';x.textContent=o;x.onclick=()=>{
  if(obj==='沙发'){document.querySelector('.sofa').style.background=['#819477','#d9a77d','#b96e5c'][i];s.room.sofa=i}
  if(obj==='窗户'){document.querySelector('.window').style.background=['linear-gradient(145deg,#b9d0c0,#f2d9a9)','linear-gradient(145deg,#9c9a91,#c9bba7)','linear-gradient(145deg,#c0d4dd,#f4d5a8)'][i];s.room.window=i}
  if(obj==='茶几'){say(o+'。');s.room.table=i;remember('room',o,1)}
  else say(obj+'有了新的样子。');
  save();$('drawer').classList.remove('open')
 };$('choices').appendChild(x)});
 $('drawer').classList.add('open');
}));
/* Initialization is deliberately deferred until all simulation constants and handlers are defined. */










function respondToChat(text){
 const t=text.toLowerCase(),pick=a=>a[Math.floor(Math.random()*a.length)],cur=s.currentActivity||'idle';
 const act={rest:'休息',eat:'吃东西',wash:'洗漱',read:'阅读',music:'听音乐',tidy:'整理房间',write:'写东西',walk:'散步',sleep:'睡觉',work:'工作',};
 let topic='general',reply='';
 if(/你好|嗨|早上好|晚上好|在吗|回来/.test(t)){topic='greeting';reply=pick(['你来了。我刚才在'+(act[cur]||'做自己的事')+'。','嗯，我在。你今天过得怎么样？','回来啦。刚才我正准备'+(cur==='sleep'?'睡觉':'继续手头的事')+'。'])}
 else if(/累|疲惫|困|睡不着|休息/.test(t)){topic='tired';reply=pick(['你听起来有点累。今天是什么事情最消耗你？','那先坐一会儿吧。我刚才也在休息。','你想聊聊原因，还是暂时换个轻松的话题？'])}
 else if(/难过|伤心|烦|生气|焦虑|压力|痛苦/.test(t)){topic='mood';reply=pick(['我先听你说。是刚发生了什么，还是最近一直积累着？','我不想随便劝你想开点。你最介意的究竟是哪一部分？','你希望我先听着，还是和你一起分析这件事？'])}
 else if(/钱|价格|贵|便宜|工作|赚钱|收入/.test(t)){topic='money';reply=pick(['我们现在有 ¥'+s.money+'。我觉得先留出生活开销比较稳妥。','我会看看适合自己的正式职位，也要考虑日程和精力。','最近先留意共同开销，再决定买什么。'])}
 else if(/音乐|唱片|歌/.test(t)){topic='music';reply=has('唱片机')?pick(['最近我常在晚上听唱片。你有特别喜欢的音乐吗？','我想找点没听过的音乐。','唱片机已经成了房间里常用的东西。']):'我也想听音乐，不过我们还没有唱片机。'}
 else if(/书|阅读|小说|读/.test(t)){topic='reading';reply=pick(['我最近读得比较慢。你在读什么？','你更喜欢故事，还是观点和论证？','有些书读完以后，想法会留很久。'])}
 else if(/吃|饿|饭|食物/.test(t)){topic='food';reply=pick(['我有点想吃热的东西。你今天吃饭了吗？','如果现在能选，我想吃点简单但有味道的东西。','我们可以看看库存还有什么。'])}
 else if(/房间|家具|装修|书桌|植物/.test(t)){topic='room';reply=pick(['房间维护度现在是 '+s.roomCondition+'。我觉得先处理真正影响生活的地方。','我希望房间慢慢有生活痕迹，而不是一下子塞满东西。','如果只能先改一处，我会考虑光线、收纳和使用频率。'])}
 else if(/对不起|抱歉|原谅/.test(t)){topic='apology';reply=pick(['我听到了。我会看之后怎么相处，不会只凭一句话判断。','谢谢你愿意说出来。我们可以慢慢把事情讲清楚。'])}
 else if(/喜欢|爱你|爱不爱|关系|朋友/.test(t)){topic='relationship';reply=pick(['我觉得关系不是靠一句话就能定下来的。我们相处的细节，我都算数。','我有自己的感受，也还在了解你。你最近怎么想我们的关系？','我们已经形成了一些只有彼此才懂的习惯。'])}
 else {topic='general';let p=s.memories.filter(m=>m.type==='conversation').slice(-1)[0];reply=p&&Math.random()<.4?'你刚才提到“'+p.text.slice(0,22)+'”。这和你现在说的事情有关系吗？':pick(['你说的这件事里，最让你在意的是哪一部分？','我还没有形成明确看法。你愿意再具体一点吗？','我想知道你为什么会这样想，而不只是听一个结论。','这件事我可能有不同看法。你想听听吗？'])}
 s.chatTopics=s.chatTopics||{};s.chatTopics[topic]=(s.chatTopics[topic]||0)+1;remember('conversation',text.slice(0,55));say(reply);save();render();
}






function buildDay(key){
 const plans=s.sleepPlans||(s.sleepPlans={});
 if(!plans[key]){
  const duration=Math.max(6,Math.min(11,Math.round(6.5+(100-s.energy)*.04+(Math.random()-.5)*2)));
  const bedtime=21+Math.floor(Math.random()*3);
  const wake=(bedtime+duration)%24;
  plans[key]={bedtime,duration,wake,energyAtPlanning:s.energy};
 }
 const p=plans[key],d=[];
 const add=(start,end,title,kind='personal',activity='idle')=>{if(end>start)d.push({start,end,title,kind,activity})};
 add(0,p.wake,'睡眠 · '+p.duration+'小时','routine','sleep');
 add(p.wake,p.wake+1,'起床、洗漱','routine','wash');
 add(p.wake+1,p.wake+2,'早餐','routine','eat');
 if(p.wake+2<12)add(p.wake+2,Math.min(12,p.wake+4),has('书桌')?'阅读 / 写作':'阅读与个人时间','personal',has('书桌')?'write':'read');
 add(12,13,'午餐','routine','eat');
  if(s.roomCondition<65)add(14,15,'整理和维护房间','personal','tidy');
 else add(14,15,has('唱片机')?'听音乐或阅读':'自由安排','personal',has('唱片机')?'music':'read');
 add(15,16,'自由时间','free','idle');
 add(16,17,has('书桌')?'写作 / 整理资料':'整理房间','personal',has('书桌')?'write':'tidy');
 add(18,19,'晚餐','routine','eat');
 add(19,20,'散步或休闲','personal','walk');
 add(20,p.bedtime-1,'自己的时间','free','idle');
 add(p.bedtime-1,p.bedtime,'洗漱、准备睡觉','routine','wash');
 add(p.bedtime,24,'睡眠','routine','sleep');
 return d.sort((a,b)=>a.start-b.start);
}
function ensureSchedule(){ensureScheduleAt(Date.now())}

function renderCalendar(){
 ensureSchedule();const anchor=dayAnchor(),d=plusDays(anchor,selectedCalendarDay),key=dayKey(d),now=new Date();
 const labels=['今天','明天','后天'];
 let html='<div class="calendar-day-tabs">'+labels.map((x,i)=>'<button class="'+(selectedCalendarDay===i?'active':'')+'" data-day-select="'+i+'">'+x+'<br><small>'+dayLabel(plusDays(anchor,i))+'</small></button>').join('')+'</div>';
 html+='<section class="day-card '+(selectedCalendarDay===0?'today':'')+'"><div class="day-card-head"><strong>'+labels[selectedCalendarDay]+' · '+dayLabel(d)+'</strong></div><div class="day-timeline">';
 for(let hour=0;hour<24;hour++){let ev=eventAt(key,hour),isNow=selectedCalendarDay===0&&now.getHours()===hour;let label=ev?ev.title:'空闲时间';html+='<div class="day-slot"><time>'+pad(hour)+':00</time><button class="'+(ev?(ev.kind==='proposal'?'proposal':ev.activity==='sleep'?'sleep':ev.kind==='work'?'work':'busy'):'free')+(isNow?' now':'')+'" data-day="'+selectedCalendarDay+'" data-hour="'+hour+'">'+label+'</button></div>'}
 html+='</div></section>';
 $('calendarContent').innerHTML=html;
 $('calendarContent').querySelectorAll('[data-day-select]').forEach(b=>b.onclick=()=>{selectedCalendarDay=+b.dataset.daySelect;renderCalendar()});
 $('calendarContent').querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>slotClick(+b.dataset.day,+b.dataset.hour));
}
function renderProfile(){
 const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const traits=['洞察人心','从容不羁','疏离矜贵','聪敏自持'];
 $('drawerTitle').textContent='人物档案';
 $('drawer').classList.add('profile-expanded');
 $('choices').innerHTML='<div class="dossier-hero"><div class="dossier-monogram">A</div><div class="dossier-name"><span>CHARACTER FILE</span><h2>Arday <i>·</i> 阿尔</h2></div></div>'+
 '<section class="profile-section dossier-section"><div class="section-kicker">PERSONALITY</div><h3>性格印象</h3><div class="trait-list">'+traits.map(x=>'<span class="trait-chip">'+x+'</span>').join('')+'</div></section>';
 $('drawer').classList.add('open');
}
function openCalendar(){selectedCalendarDay=0;ensureSchedule();$('drawer').classList.remove('open','profile-expanded');$('stage').classList.add('calendar-mode');$('stage').style.touchAction='pan-y';renderCalendar();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='日程'))}
function refreshTopActions(){let n=s.events.filter(e=>e.status==='open').length;let c=$('eventCount');if(c)c.textContent=n?'· '+n:''}
$('profileEntry').addEventListener('click',()=>{if($('drawer').classList.contains('open')&&$('drawerTitle').textContent==='人物档案'){$('drawer').classList.remove('open','profile-expanded');return}renderProfile()});
$('recentEvents').addEventListener('click',()=>{if($('drawer').classList.contains('open')&&$('drawerTitle').textContent==='最近发生的事'){$('drawer').classList.remove('open');return}renderEvents()});
document.querySelectorAll('[data-decorate-object]').forEach(b=>b.addEventListener('click',()=>{
 const obj=b.dataset.decorateObject,opts=obj==='沙发'?['鼠尾草绿','暖杏色','砖红色']:obj==='窗户'?['打开窗帘','合上窗帘','换一幅窗景']:['摆上花瓶','放一本书','点亮台灯'];
 $('drawerTitle').textContent='装修 · '+obj;$('choices').innerHTML='';
 opts.forEach((o,i)=>{let x=document.createElement('button');x.className='choice';x.textContent=o;x.onclick=()=>{
  if(obj==='沙发'){document.querySelector('.sofa').style.background=['#819477','#d9a77d','#b96e5c'][i];s.room.sofa=i}
  else if(obj==='窗户'){document.querySelector('.window').style.background=['linear-gradient(145deg,#b9d0c0,#f2d9a9)','linear-gradient(145deg,#9c9a91,#c9bba7)','linear-gradient(145deg,#c0d4dd,#f4d5a8)'][i];s.room.window=i}
  else{s.room.table=i;remember('room',o,1);say(o+'。')}
  save();$('drawer').classList.remove('open');
 };$('choices').appendChild(x)});
 $('drawer').classList.add('open');
}));



// === Unified activity / schedule / scene layer (v1) ===
// The calendar is the source of truth. Player actions, autonomous actions and
// scheduled actions all become time blocks in the same day schedule.






function findAvailableSlot(now=new Date(),duration=1){
 const today=keyAt(now),hour=now.getHours();
 for(let offset=0;offset<=2;offset++){
  const d=new Date(now);d.setDate(d.getDate()+offset);
  const key=ensureScheduleAt(d),from=offset===0?hour+(s.lastUnifiedHourKey===today+'-'+hour?1:0):6;
  const day=s.calendar.days[key]||[];
  for(let h=from;h+duration<=24;h++){
   let free=true;
   for(let x=h;x<h+duration;x++){const ev=day.find(e=>x>=e.start&&x<e.end);if(ev&&ev.kind!=='free'){free=false;break}}
   if(free)return {key,start:h};
  }
 }
 return null;
}
function proposeActivityNow(action){
 const a=normalizeActivity(action),now=new Date(),hour=now.getHours(),key=keyAt(now);
 if(a==='idle')return false;
 if((a==='walk'||a==='game')&&s.energy<22){say('我现在精力不太够，做这个恐怕不合适。');s.rejections=(s.rejections||0)+1;save();return false}
 if(a==='music'&&!has('唱片机')){say('没有唱片机，今天恐怕听不了。');return false}
 if(a==='write'&&!has('书桌')){say('没有书桌，我暂时不想在这里写东西。');return false}
 if(a==='food'&&!s.readyMeals?.length&&!s.items.includes('点心')&&!Object.keys(recipes).some(canCook)){say('家里暂时没有现成的食物。要不要先去厨房准备一点？');return false}
 const survival={eat:s.hunger<38,rest:s.energy<28,wash:s.clean<25};
 let accept;
 if(a==='sleep'||a==='rest'||a==='sitChair'||(a in survival&&survival[a]))accept=true;
 else{let probability=.67;if(s.hate>55)probability-=.12;if(s.friend>70&&s.hate<15)probability+=.06;if(a==='walk'&&s.energy<35)probability-=.12;accept=Math.random()<probability}
 if(!accept){
  const refusals={tea:['现在不想喝茶。你先喝吧，我待会儿再看。','茶可以晚点喝，我还有点自己的事。','今天先不了。你怎么突然这么有兴致？'],music:['现在不想听音乐。改天吧。','这会儿想安静一会儿，唱片先放着。','不太想。你可以自己挑一张。'],walk:['外面我暂时不想去。','今天不想出门，改天再说。','你先去吧，我不一定跟得上你的兴致。'],read:['我现在没心思看书。','读书这件事不急，晚点再说。','今天想换点别的，不想看书。'],game:['这局先免了，我现在没兴趣。','你自己玩吧，我今天不想竞争。','不了，我可不想被你拉去消磨时间。'],tidy:['房间暂时这样就行，我不想现在整理。','你要是想整理可以先动手，我今天没这个打算。','先放着吧，没必要什么都立刻收拾。'],food:['现在不想一起吃东西。','我还不饿，等会儿再说。','你先吃，我暂时没胃口。'],rest:['我还不想休息。','现在坐不住，等会儿再说。']};
  const lines=refusals[a]||['这会儿不太想做。','今天先不了，换个时间吧。','我有自己的安排，别替我决定。'];
  say(lines[Math.floor(Math.random()*lines.length)]);s.rejections=(s.rejections||0)+1;save();return false;
 }
 const slot=findAvailableSlot(now,1);
 if(!slot){say('最近几天的安排都比较满。等有空档时，我们再约这件事。');return false}
 const titles={rest:'休息一会儿',eat:'吃点东西',food:'一起吃东西',wash:'洗漱',read:'阅读',music:'听音乐',tea:'一起喝茶',walk:'出门散步',game:'玩游戏',company:'自由相处',tidy:'整理房间',write:'写点东西',cook:'做饭',cookTogether:'一起做饭'};
 writeBlockForKey(slot.key,slot.start,slot.start+1,{title:titles[a]||a,kind:'proposal',activity:a,withPlayer:true,startedBy:'player'});
 remember('interaction','接受提议：'+(titles[a]||a),1);
 say(slot.key===key&&slot.start===hour?'好，就按这个安排。':'可以。我把稍后的时间留出来。');
 save();render();if($('stage').classList.contains('calendar-mode'))renderCalendar();return true;
}
function dayAnchorAt(value){
 const d=new Date(value);
 if(d.getHours()<6)d.setDate(d.getDate()-1);
 d.setHours(0,0,0,0);
 return d;
}
function keyAt(value){return dayKey(dayAnchorAt(value))}
function ensureScheduleAt(value){
 const currentKey=keyAt(Date.now()),requestedKey=keyAt(value);
 if(!s.calendar)s.calendar={anchor:currentKey,days:{},version:4};
 s.calendar.days=s.calendar.days||{};
 if((s.calendar.version||0)<4){
  s.calendar.anchor=currentKey;s.calendar.days={};s.calendar.version=4;
 }
 if(s.calendar.anchor!==currentKey){
  s.calendar.anchor=currentKey;
  Object.keys(s.calendar.days).forEach(k=>{if(k<currentKey)delete s.calendar.days[k]});
  Object.keys(s.sleepPlans||{}).forEach(k=>{if(k<currentKey)delete s.sleepPlans[k]});
  addEvent('新的一天','阿尔已经开始安排新一天的生活。','daily');
 }
 const ensureDay=key=>{if(!s.calendar.days[key])s.calendar.days[key]=buildDay(key)};
 ensureDay(currentKey);
 for(let i=1;i<=2;i++)ensureDay(dayKey(plusDays(dayAnchor(),i)));
 if(requestedKey>=currentKey)ensureDay(requestedKey);
 if(s.job?.active){
  Object.keys(s.calendar.days).filter(k=>k>=s.job.startDate).sort().forEach(key=>{
   if(!(s.calendar.days[key]||[]).some(e=>e.jobShift&&e.jobId===s.job.id)){
    writeBlockForKey(key,s.job.start,s.job.end,{title:'工作 · '+s.job.title,kind:'work',activity:'work',jobShift:true,jobId:s.job.id});
   }
  });
 }
 return requestedKey;
}
function writeBlockForKey(key,start,end,block){
 const day=s.calendar.days[key]||(s.calendar.days[key]=[]);
 const next=[];
 day.forEach(ev=>{
  if(ev.end<=start||ev.start>=end){next.push(ev);return}
  if(ev.start<start)next.push({...ev,end:start});
  if(ev.end>end)next.push({...ev,start:end});
 });
 next.push({...block,start,end});
 next.sort((a,b)=>a.start-b.start);
 s.calendar.days[key]=next;
}

function settleWorkAt(key,hour,at=Date.now()){
 if(s.job?.active&&key>=s.job.startDate&&hour>=s.job.end){
  s.job.paidDays=s.job.paidDays||[];
  if(!s.job.paidDays.includes(key)){s.job.paidDays.push(key);s.personalMoney+=s.job.salary;moneyRecord('personal','income',s.job.salary,s.job.title+' · 日薪',at);addEvent('今日薪资到账','阿尔完成了'+s.job.title+'的工作，获得日薪 ¥'+s.job.salary+'。','daily');remember('salary','获得'+s.job.title+'日薪 ¥'+s.job.salary,1);return true;}
 }
 if(!s.pendingWork||s.pendingWork.paid)return false;
 const p=s.pendingWork;
 if(key>p.day||(key===p.day&&hour+1>=p.end)){
  p.paid=true;const pay=Math.max(0,Number(p.pay)||0);s.personalMoney+=pay;
  moneyRecord('personal','income',pay,'完成工作委托',at);
  addEvent('工作报酬到账','阿尔完成工作，获得个人收入 ¥'+pay+'。','daily');
  remember('work','完成工作，个人收入 ¥'+pay,2);return true;
 }
 return false;
}

function applyOffline(){
 const now=Date.now(),last=Number(s.lastTick||s.last||now);
 if(!Number.isFinite(last)||last<=0){s.lastTick=now;return}
 const first=Math.floor(last/3600000)+1;
 const final=Math.floor(now/3600000);
 // Replay at most 7 days. For longer absences, retain the most recent week
 // rather than attempting an unbounded loop on a mobile browser.
 const start=Math.max(first,final-167);
 for(let t=start;t<=final;t++)processActivityAt(t*3600000);
 s.lastTick=now;
 save();
}
function tick(){
 applyOffline();
 const now=new Date(),key=keyAt(now),hourKey=key+'-'+now.getHours();
 // On a fresh install or when reopening within the same hour, initialize the
 // current activity once. Replay above handles all completed intervening hours.
 if(s.lastUnifiedHourKey!==hourKey)processActivityAt(now.getTime());
 ensurePersonalGoal(Date.now());updatePersonalGoal('balance',Date.now());
 generateDailyEvents();
 render();
 if($('stage').classList.contains('calendar-mode'))renderCalendar();
 save();
}


function relation(action){
 // Repeating an activity is not relationship fatigue. Boredom here means
 // emotional distance in the relationship and changes only through neglect
 // or relational conflict, not through repeated music, reading or games.
 if(['listen','tea','walk','read','game','music','food','company'].includes(action)){
  s.friend=clamp(s.friend+1);
  s.attach=clamp(s.attach+.5);
  remember('shared',action);
 }else if(action==='ignore'){
  s.attach=clamp(s.attach-1);
 }
}



function pantryCount(k){return Math.max(0,Number(s.pantry?.[k]||0))}
function canCook(id){const r=recipes[id];return !!r&&Object.entries(r.ingredients).every(([k,n])=>pantryCount(k)>=n)}
function buyIngredient(id,label,cost){const k=id.replace('buy-ingredient-','');if(!(k in ingredientNames))return;if(s.money<cost){toast('¥不足');return}s.money-=cost;s.pantry[k]=pantryCount(k)+1;remember('purchase','购买食材：'+label,1);say('食材放进冰箱了。');save();render();openKitchenPanel(false)}
function kitchenOpen(){$('stage').classList.add('kitchen-mode');$('stage').classList.remove('bedroom-mode');$('roomLabel').textContent='KITCHEN · 厨房';updateArday3D()}
function kitchenClose(){$('stage').classList.remove('kitchen-mode');$('stage').classList.remove('bedroom-mode');const m=activityMeta[s.currentActivity]||{title:'自己的时间'};$('roomLabel').textContent='HOME · '+m.title;updateArday3D()}
function openKitchenPanel(together=false){kitchenOpen();const stock=Object.entries(ingredientNames).map(([k,n])=>n+' × '+pantryCount(k)).join('　·　'),meals=s.readyMeals||[];$('drawerTitle').textContent='厨房 · 食材与烹饪';$('choices').innerHTML='<div class="calendar-note">冰箱库存：'+stock+'<br>已做好：'+(meals.length?meals.map(x=>x.name).join('、'):'暂无')+'</div><div class="choices">'+Object.entries(recipes).map(([id,r])=>'<button class="choice" data-recipe="'+id+'"><span class="emoji">🍳</span>'+r.name+'<small>'+Object.entries(r.ingredients).map(([k,n])=>ingredientNames[k]+' ×'+n).join('、')+'</small></button>').join('')+'</div><div class="calendar-actions"><button id="kitchen-shop">去商店买食材</button><button id="kitchen-close">收起</button></div>';$('choices').querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>scheduleCooking(b.dataset.recipe,together));$('kitchen-shop').onclick=()=>openTab('商店');$('kitchen-close').onclick=()=>$('drawer').classList.remove('open');$('drawer').classList.add('open')}
function scheduleCooking(id,together=false){
 if(!canCook(id)){say('这道菜的食材不够。先去商店补一点，或者换一道菜。');toast('食材不足');return}
 const slot=findAvailableSlot(new Date(),1);
 if(!slot){say('最近几天没有合适的空档。食材先留在冰箱里，晚些时候再做。');return}
 const act=together?'cookTogether':'cook',ev={title:(together?'一起做':'阿尔做')+recipes[id].name,kind:together?'proposal':'personal',activity:act,recipeId:id,withPlayer:together,startedBy:together?'player':'arday'};
 writeBlockForKey(slot.key,slot.start,slot.start+1,ev);
 say(together?'好啊。你负责洗菜，还是让我来？':'我来做'+recipes[id].name+'。厨房总算派上用场了。');
 remember('cooking','安排烹饪：'+recipes[id].name,2);save();render();renderCalendar();$('drawer').classList.remove('open');
}
function completeCooking(ev){if(ev.cookingStarted)return;const id=ev.recipeId||Object.keys(recipes).find(canCook),r=recipes[id];if(!r||!canCook(id)){ev.cookingStarted=true;addEvent('食材不够了','原定的烹饪没有完成，冰箱里的食材不足。','daily');say('糟了，食材不够。这顿饭得换个办法。');return}Object.entries(r.ingredients).forEach(([k,n])=>s.pantry[k]=pantryCount(k)-n);s.readyMeals=s.readyMeals||[];s.readyMeals.push({name:r.name,hunger:r.hunger,cookedAt:Date.now()});ev.cookingStarted=true;ev.completed=true;change({energy:-3,fun:ev.withPlayer?3:1});addEvent('做好了'+r.name,ev.withPlayer?'你和阿尔一起完成了'+r.name+'。':'阿尔做好了'+r.name+'，放进了冰箱。','daily');remember('cooking','完成烹饪：'+r.name,2);if(ev.withPlayer)change({friend:1,attach:1});say(r.name+'做好了。')}
function consumeMeal(){
 if(s.readyMeals?.length){const m=s.readyMeals.shift();change({hunger:Math.min(45,m.hunger),fun:2});remember('meal','吃了'+m.name,1);return m.name}
 if(s.items.includes('点心')){s.items.splice(s.items.indexOf('点心'),1);change({hunger:18,fun:1});return '点心'}
 const id=Object.keys(recipes).find(canCook);
 if(id){const r=recipes[id];Object.entries(r.ingredients).forEach(([k,n])=>s.pantry[k]=pantryCount(k)-n);change({hunger:r.hunger,fun:1});remember('meal','简单准备并吃了'+r.name,1);return r.name}
 return null;
}
function setSceneActivity(activity,announce){
 const a=normalizeActivity(activity),m=activityMeta[a]||{title:'自己的时间',location:'center',pose:'wave'},kitchen=['cook','cookTogether'].includes(a);
 const p=document.querySelector(kitchen?'.kitchen-person':'#person');
 if(p){p.classList.remove('sit','walk','wave');p.classList.add(m.pose||'wave');const pos={sofa:'20%',table:'77%',window:'37%',outside:'88%',rug:'52%',shelf:'72%',desk:'68%',center:'51%'};p.style.left=kitchen?'54%':(pos[m.location]||'51%')}
 s.currentActivity=a;updateArday3D();
 if(announce)say('我现在在'+(kitchen?'厨房':m.location==='outside'?'外面':'房间里')+m.title+'。')
}
function chooseAutonomousActivity(){const opts=['rest','eat','wash','read','music','tidy','write','walk'];if(s.hunger<48&&Object.keys(recipes).some(canCook)&&Math.random()<.58)return 'cook';const v={rest:Math.max(0,58-s.energy)*1.55,eat:Math.max(0,58-s.hunger)*1.8,wash:Math.max(0,55-s.clean)*1.25,read:Math.max(0,58-s.fun)*.8,music:has('唱片机')?Math.max(0,65-s.fun)*1.05:0,tidy:Math.max(0,55-s.roomCondition)*.8,write:has('书桌')?13:0,walk:s.fun<60?8:2};return opts.filter(a=>(a!=='music'||has('唱片机'))&&(a!=='write'||has('书桌'))).map(a=>({a,v:v[a]+Math.random()*4})).sort((x,y)=>y.v-x.v)[0]?.a||'rest'}
function normalizeActivity(a){return ({reading:'read',listen:'music',cooking:'cook'})[a]||a||'idle'}
function processActivityAt(value){
 const d=new Date(value),hour=d.getHours(),key=ensureScheduleAt(d),hourKey=key+'-'+hour;
 if(s.lastUnifiedHourKey===hourKey)return false;
 // Preserve fractional hourly decay; integer clamping would round small losses to zero.
 for(const [k,loss] of Object.entries({energy:.45,hunger:.8,clean:.25,fun:.3}))s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)-loss));
 s.roomCondition=Math.max(0,Math.min(100,(Number(s.roomCondition)||0)-.012));
 let ev=(s.calendar.days[key]||[]).find(x=>hour>=x.start&&hour<x.end);
 let activity=normalizeActivity(ev?.activity||'idle');
 if(!ev||activity==='idle'){
  activity=chooseAutonomousActivity();
  const meta=activityMeta[activity]||{title:'自己的时间'};
  const recipeId=activity==='cook'?Object.keys(recipes).find(canCook):undefined;
  writeBlockForKey(key,hour,hour+1,{title:meta.title,kind:'personal',activity,autonomous:true,recipeId});
  ev=(s.calendar.days[key]||[]).find(x=>hour>=x.start&&hour<x.end);
 }
 const meta=activityMeta[activity],sessionId=key+'-'+(ev?.start??hour)+'-'+activity;
 const sessionStart=s.lastProcessedSessionKey!==sessionId;
 if(activity==='cook'||activity==='cookTogether'){
  if(!ev.completed&&!ev.cookingStarted)completeCooking(ev);
  setSceneActivity(activity,false);
  if(ev.completed&&sessionStart&&ev.withPlayer)advanceSharedGoal('cookTogether',d.getTime());
 }else if(meta){
  const effects={...(meta.effect||{})};
  if(activity==='eat'||activity==='food'){consumeMeal();delete effects.hunger}
  change(effects);
  if(activity==='tidy')s.roomCondition=clamp(s.roomCondition+3);
  if(activity==='music')s.preferences.music=(s.preferences.music||0)+1;
  if(activity==='read')s.preferences.reading=(s.preferences.reading||0)+1;
  setSceneActivity(activity,false);
 }
 if(sessionStart){
  if(ev?.withPlayer){
   relation(activity);
   if(activity==='tidy'||activity==='walk')advanceSharedGoal(activity,d.getTime());
  }
  if(['read','write','tidy'].includes(activity))updatePersonalGoal(activity,d.getTime());
 }
 const workCompleted=settleWorkAt(key,hour,d.getTime());
 if(workCompleted)updatePersonalGoal('work',d.getTime());

 s.lastUnifiedHourKey=hourKey;s.lastHourKey=hourKey;s.currentActivity=activity;
 s.lastProcessedSessionKey=sessionId;
 s.activityLog=s.activityLog||[];
 s.activityLog.push({activity,key,hour,at:d.getTime(),withPlayer:!!ev?.withPlayer});
 if(s.activityLog.length>100)s.activityLog.splice(0,s.activityLog.length-100);
 reviewPersonalSpending(d.getTime());
 return true;
}
function openFurnitureActions(kind){
 const sets={
  sofa:{title:'沙发',items:[['坐下休息','rest'],['靠着沙发待一会儿','company']]},
  bed:{title:'床',items:[['躺下休息','sleep']]},
  chair:{title:'椅子',items:[['坐下休息','sitChair'],['坐在这里陪我一会儿','sitChair']]}
 };
 const set=sets[kind];if(!set)return;
 $('drawerTitle').textContent=set.title+' · 互动';
 $('choices').innerHTML='';
 set.items.forEach(([label,activity])=>{
  const b=document.createElement('button');b.className='choice';b.type='button';b.textContent=label;
  b.onclick=()=>{$('drawer').classList.remove('open');perform(activity)};
  $('choices').appendChild(b);
 });
 $('drawer').classList.add('open');
}
function perform(action){if(action==='cook'||action==='cookTogether'){openKitchenPanel(action==='cookTogether');return}const map={tea:'tea',music:'music',walk:'walk',read:'reading',game:'game',rest:'rest',food:'food',tidy:'tidy'},a=map[action]||action,ok=proposeActivityNow(a);if(ok){animate(a==='game'?'wave':a==='walk'?'walk':'sit');setSceneActivity(a,false)}}
// The old sceneSwitch control was removed from the interface; kitchen access is contextual now.

/* === Personal goals and two-account economy ===
   s.money remains the shared household account. Arday's earnings and personal
   purchases use a separate balance. */
s.personalMoney=Number.isFinite(s.personalMoney)?Math.max(0,s.personalMoney):0;
s.personalItems=s.personalItems||[];
s.moneyLog=s.moneyLog||[];

s.personalGoalHistory=s.personalGoalHistory||[];
function moneyRecord(account,kind,amount,note,at=Date.now()){
 s.moneyLog.unshift({account,kind,amount,note,at});
 if(s.moneyLog.length>40)s.moneyLog.length=40;
}
function ensurePersonalGoal(at=Date.now()){
 if(s.personalGoal?.status==='active')return s.personalGoal;
 if((s.nextGoalAt||0)>at)return null;
 const options=[
  {type:'read',title:'读完一本书',detail:'留出几段完整的时间，把手边的一本书读完。',target:5,unit:'次阅读'},
  {type:'write',title:'整理一份自己的文字',detail:'在书桌前持续写作或整理资料。',target:4,unit:'次写作',requires:'书桌'},
  {type:'tidy',title:'把生活空间整理得更顺手',detail:'按自己的方式逐步整理房间。',target:4,unit:'次整理'},
  {type:'jobs',title:'完成两份工作委托',detail:'接下合适的工作，完成后把报酬留在自己的账户。',target:2,unit:'份工作'},
  {type:'save',title:'存下 ¥500',detail:'暂时不急着花钱，先留下一笔可以自由支配的储蓄。',target:500,unit:'元'}
 ].filter(x=>(!x.requires||has(x.requires))&&(x.type!=='save'||s.personalMoney<500));
 const previous=s.personalGoalHistory[0]?.type;let choices=options.filter(x=>x.type!==previous);if(!choices.length)choices=options;if(!choices.length)return null;
 const g=choices[Math.floor(Math.random()*choices.length)];s.personalGoal={...g,status:'active',progress:g.type==='save'?s.personalMoney:0,startedAt:at};
 remember('personal-goal','阿尔开始了自己的计划：'+g.title,2);return s.personalGoal;
}
function updatePersonalGoal(activity,at=Date.now()){
 const g=s.personalGoal;if(!g||g.status!=='active')return;
 if(g.type==='save')g.progress=s.personalMoney;
 else if(g.type==='jobs'&&activity==='work')g.progress=(g.progress||0)+1;
 else if(g.type===activity&&['read','write','tidy'].includes(activity))g.progress=(g.progress||0)+1;
 if(g.progress>=g.target){
  g.progress=g.target;g.status='completed';g.completedAt=at;
  s.personalGoalHistory.unshift({type:g.type,title:g.title,completedAt:at});s.personalGoalHistory=s.personalGoalHistory.slice(0,12);
  s.nextGoalAt=at+36*3600000;
  addEvent('阿尔完成了自己的计划','他完成了「'+g.title+'」。这是他自己决定并推进的一件事。','daily');
  remember('personal-goal','完成自己的计划：'+g.title,2);say('这件事总算做完了。接下来，我想想还有什么值得做。');
 }
}
function reviewPersonalSpending(at){
 if(s.personalMoney<60)return;
 if((s.lastPersonalSpendingReview||0)>0&&at-s.lastPersonalSpendingReview<48*3600000)return;
 s.lastPersonalSpendingReview=at;
 if(s.personalGoal?.status==='active'&&s.personalGoal.type==='save')return;
 if(Math.random()>.28)return;
 const options=[
  {name:'一本私人藏书',cost:48},
  {name:'一套书写用品',cost:32},
  {name:'一张自己收藏的唱片',cost:68}
 ].filter(x=>x.cost<=s.personalMoney);
 if(!options.length)return;
 const item=options[Math.floor(Math.random()*options.length)];
 s.personalMoney-=item.cost;s.personalItems.push(item.name);
 moneyRecord('personal','expense',item.cost,'购买'+item.name,at);
 remember('personal-purchase','阿尔用自己的钱买了'+item.name,1);
 addEvent('阿尔买了件自己的东西','他用个人账户购买了'+item.name+'，没有动用共同账户。','daily');
}
const originalPurchase=purchase;
purchase=function(id,label,cost){
 const before=s.money;originalPurchase(id,label,cost);
 const spent=before-s.money;if(spent>0)moneyRecord('shared','expense',spent,'购买'+label);
};
const originalBuyIngredient=buyIngredient;
buyIngredient=function(id,label,cost){
 const before=s.money;originalBuyIngredient(id,label,cost);
 const spent=before-s.money;if(spent>0)moneyRecord('shared','expense',spent,'购买食材：'+label);
};

function eventChoices(e){
 if(e.type!=='bill')return eventChoicesLegacy(e);
 $('drawerTitle').textContent=e.title;
 $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="calendar-actions"><button id="paybill">从共同账户支付 ¥80</button><button id="delaybill">暂时记账</button></div>';
 $('paybill').onclick=()=>{
  if(s.money>=80){s.money-=80;s.unpaidBill=Math.max(0,(s.unpaidBill||0)-80);moneyRecord('shared','expense',80,'水电与日常开销');say('共同账户已经支付本周开销。')}
  else{say('共同账户资金不够，先记账。');s.unpaidBill=(s.unpaidBill||0)+80}
  completeEvent(e,'支付或记账');save();render();renderEvents();
 };
 $('delaybill').onclick=()=>{s.unpaidBill=(s.unpaidBill||0)+80;completeEvent(e,'暂时记账');say('好，先记在共同开销里。');save();render();renderEvents()};
 $('drawer').classList.add('open');
}


/* === Shared goals, situational events and personality-aware behavior === */
s.sharedGoal=s.sharedGoal||null;
s.sharedGoalHistory=s.sharedGoalHistory||[];
s.lastRandomEventAt=Number(s.lastRandomEventAt||0);
s.lastSharedProposalAt=Number(s.lastSharedProposalAt||0);

function ardayTemperament(){
 const d=(s.personality?.description||'').toLowerCase();
 const hasWord=re=>re.test(d);
 return {
  composed:hasWord(/从容|游刃有余|淡定|镇定|轻松|不慌/)||!d?0.78:0.58,
  indirect:hasWord(/操纵|引导|心思|试探|迂回|反向/)||!d?0.76:0.4,
 };
}
function ardayLine(kind, fallback){
 const p=ardayTemperament();
 const lines={
  proposal:[
   '我倒是有个主意。你先别急着拒绝，听完再说。',
   '这件事若有你在，似乎会有意思得多。至于怎么做……我们可以慢慢商量。',
   '我已经替我们想好了一个大致的方向。当然，最后还得看看你愿不愿意。'
  ],
  accept:[
   '好。既然你也有兴致，那就照这个意思来。',
   '成交。看来今天的安排要比原先有趣一些。',
   '那便这么定了。我很期待，至少现在是。'
  ],
  decline:[
   '也好，不必为了一个念头把日子安排得满满当当。',
   '那就先搁着。好东西总不至于因为晚几天就失去趣味。',
   '听你的。只是我可没保证过会一直惦记这件事。'
  ],
  incident:[
   '生活偶尔就是这样，偏要在最不合时宜的时候添一点麻烦。',
   '看来今天有件小事需要处理。别担心，还称不上什么大灾难。',
   '出了点状况。不过，若每件事都顺顺当当，未免也太无趣了。'
  ]
 };
 const pool=lines[kind]||[fallback];
 let line=pool[Math.floor(Math.random()*pool.length)];
 if(kind==='proposal'&&p.indirect>.65&&Math.random()<.45)line='我本来只是随口一提。不过，你若答应，我倒也不会反对。';
 if(kind==='incident'&&p.composed>.65&&Math.random()<.4)line='不是什么大事。总有办法处理，何必现在就皱眉？';
 return line||fallback;
}
function sharedGoalCatalog(){
 return [
  {id:'room',title:'把房间重新收拾一番',detail:'一起整理房间，让它更适合两个人生活。',target:3,unit:'次共同整理',action:'tidy'},
  {id:'meal',title:'认真做几顿晚饭',detail:'不赶时间地一起准备两顿晚餐。',target:2,unit:'顿共同料理',action:'cookTogether'},
  {id:'outing',title:'找一天出门走走',detail:'把手头的事情放一放，一起出门散步两次。',target:2,unit:'次共同出门',action:'walk'}
 ];
}
function proposeSharedGoal(at=Date.now()){
 if(s.sharedGoal?.status==='active')return;
 if(at-s.lastSharedProposalAt<72*3600000)return;
 if(s.events.some(e=>e.status==='open'&&e.type==='shared-goal-proposal'))return;
 const pool=sharedGoalCatalog().filter(g=>g.id!==(s.sharedGoalHistory[0]?.id));
 const g=pool[Math.floor(Math.random()*pool.length)];
 if(!g)return;
 s.lastSharedProposalAt=at;
 const e=addEvent('阿尔提起一件想和你一起做的事',g.detail,'shared-goal-proposal');e.goalId=g.id;say(ardayLine('proposal',g.detail));
}
if(s.project?.status==='active'&&s.sharedGoal?.status!=='active'){
 const legacy=sharedGoalCatalog().find(x=>x.id==='room');
 if(legacy)s.sharedGoal={...legacy,progress:Math.min(legacy.target,Number(s.project.progress)||0),status:'active',startedAt:Date.now(),variant:'migrated'};
}
delete s.project;
Object.values(s.calendar?.days||{}).forEach(day=>day.forEach(ev=>{if(ev.activity==='project'){ev.activity='tidy';ev.title='整理房间';ev.kind='personal'}}));
function acceptSharedGoal(id,variant='normal'){
 const g=sharedGoalCatalog().find(x=>x.id===id);if(!g)return;
 const target=variant==='slow'?Math.max(1,g.target-1):g.target;
 s.sharedGoal={...g,target,progress:0,status:'active',startedAt:Date.now(),variant};
 say(ardayLine('accept','好，那就一起做吧。'));
 remember('shared-goal','你们决定一起做：'+g.title,2);
 addEvent('你们有了一项共同计划','你和阿尔决定一起完成「'+g.title+'」。','daily');
}
function advanceSharedGoal(action,at=Date.now()){
 const g=s.sharedGoal;if(!g||g.status!=='active')return;
 if(g.action!==action)return;
 g.progress=Math.min(g.target,(g.progress||0)+1);
 g.updatedAt=at;
 if(g.progress>=g.target){
  g.status='completed';g.completedAt=at;
  s.sharedGoalHistory.unshift({id:g.id,title:g.title,completedAt:at});
  s.sharedGoalHistory=s.sharedGoalHistory.slice(0,10);
  change({friend:2,attach:1,fun:3});
  addEvent('你们完成了一件共同计划', '「'+g.title+'」已经完成。那些零碎的时间，最后真的拼成了一件事。','daily');
  remember('shared-goal','共同完成：'+g.title,3);
  say('原来一起做一件事，最后会留下这样的感觉。');
 }
}
function createSituationalEvent(at=Date.now()){
 if(s.events.filter(e=>e.status==='open').length>=4)return;
 if(at-s.lastRandomEventAt<22*3600000)return;
 const hour=new Date(at).getHours();
 if(hour<8||hour>22)return;
 const candidates=[];
 if(s.roomCondition<72)candidates.push({
  id:'repair',title:'房间里出了点小状况',
  detail:'有件日常用品似乎不太好用了。现在处理会花掉一些共同账户的钱，暂时放着也不是不行。',
  type:'life-repair'
 });
 candidates.push({
  id:'book',title:'旧书里夹着一张纸条',
  detail:'阿尔整理书架时，从一本旧书里翻出一张折得很整齐的纸条。他似乎认得上面的字迹。',
  type:'life-memory'
 });
 candidates.push({
  id:'evening',title:'阿尔想临时改一改今晚的安排',
  detail:'他看了看时间，忽然觉得原定的安排没那么重要了。比起各做各的，他似乎更想把今晚留给一点别的事情。',
  type:'life-evening'
 });
 const e=candidates[Math.floor(Math.random()*candidates.length)];
 addEvent(e.title,e.detail,e.type);s.events[0].situationId=e.id;s.lastRandomEventAt=at;say(ardayLine('incident',e.detail));
}
function generateDailyEvents(){
 const today=s.calendar?.anchor||dayKey(dayAnchor());
 if(s.dailyEventDate!==today){
  s.dailyEventDate=today;
  if(s.events.filter(e=>e.status==='open').length<3){
   if(!has('唱片机')&&s.visits>0&&Math.random()<.28)addEvent('阿尔想听唱片','最近房间有点安静。我想听音乐，不过我们还没有唱片机。','daily');
   else if(s.fun<35&&Math.random()<.45)addEvent('今天有点无聊','我最近做的事情都差不多。想不想一起试试新的活动？','daily');
  }
  if(Math.random()<.42)proposeSharedGoal(Date.now());
  if(Math.random()<.3)createSituationalEvent(Date.now());
 }
}
const oldEventChoicesForGoals=eventChoices;
eventChoices=function(e){
 if(e.type==='shared-goal-proposal'){
  const g=sharedGoalCatalog().find(x=>x.id===e.goalId);
  if(!g){completeEvent(e,'计划已过期');save();renderEvents();return}
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="choices"><button class="choice" id="sg-yes">好，一起做</button><button class="choice" id="sg-slow">可以，但慢慢来</button><button class="choice" id="sg-later">改天再说</button><button class="choice" id="sg-no">我不想做</button></div>';
  $('sg-yes').onclick=()=>{acceptSharedGoal(g.id);completeEvent(e,'同意共同计划');save();render();renderEvents()};
  $('sg-slow').onclick=()=>{acceptSharedGoal(g.id,'slow');completeEvent(e,'同意，但降低计划规模');save();render();renderEvents()};
  $('sg-later').onclick=()=>{say(ardayLine('decline'));completeEvent(e,'暂缓');s.lastSharedProposalAt=Date.now()-48*3600000;save();renderEvents()};
  $('sg-no').onclick=()=>{say(ardayLine('decline'));if(s.sharedGoal)s.sharedGoal.status='declined';completeEvent(e,'拒绝共同计划');save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 if(e.type==='life-repair'){
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="choices"><button class="choice" id="repair-now">现在修理 · ¥80</button><button class="choice" id="repair-later">先放着</button></div>';
  $('repair-now').onclick=()=>{if(s.money>=80){s.money-=80;moneyRecord('shared','expense',80,'修理日常用品');s.roomCondition=clamp(s.roomCondition+12);say('修好了。你看，生活里的麻烦总有办法解决。');}else say('共同账户的钱不够。那就先等等吧。');completeEvent(e,'处理修理事项');save();render();renderEvents()};
  $('repair-later').onclick=()=>{s.roomCondition=clamp(s.roomCondition-4);say('好吧，暂时不管它。希望它别挑更糟的时候罢工。');completeEvent(e,'暂缓修理');save();render();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 if(e.type==='life-memory'){
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="choices"><button class="choice" id="memory-ask">问问他纸条的来历</button><button class="choice" id="memory-keep">替他收起来</button><button class="choice" id="memory-leave">不多过问</button></div>';
  $('memory-ask').onclick=()=>{say('你倒是很会挑时候。只是这件事，我还没想好要从哪里说起。');remember('old-memory','你问起那张旧纸条，阿尔没有立刻回答。',2);change({friend:1});completeEvent(e,'询问纸条来历') ;save();renderEvents()};
  $('memory-keep').onclick=()=>{say('替我收着吧。说不定哪天，我会想起它。');remember('old-memory','你替阿尔收起了旧纸条。',2);completeEvent(e,'收起纸条');save();renderEvents()};
  $('memory-leave').onclick=()=>{say('嗯。偶尔不知道一件事，也没什么不好。');completeEvent(e,'没有追问');save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 if(e.type==='life-evening'){
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="choices"><button class="choice" id="evening-together">今晚一起待着</button><button class="choice" id="evening-free">各做各的</button><button class="choice" id="evening-ask">让他自己安排</button></div>';
  $('evening-together').onclick=()=>{change({friend:1,attach:1,fun:2});say('我就知道你会答应。过来吧，今晚不必赶时间。');remember('evening','你们临时改变安排，共度了一个晚上。',2);completeEvent(e,'一起度过晚上');save();renderEvents()};
  $('evening-free').onclick=()=>{say('也好。偶尔各自清静，反而更容易想念对方。');completeEvent(e,'各自安排');save();renderEvents()};
  $('evening-ask').onclick=()=>{say('我？我当然有自己的安排。你不必操心。');completeEvent(e,'由阿尔自行安排');remember('autonomy','阿尔决定自己安排这个晚上。',1);save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 oldEventChoicesForGoals(e);
};
function showCollection(){
 const log=(s.moneyLog||[]).slice(0,8).map(x=>'<p>'+new Date(x.at).toLocaleDateString('zh-CN')+' · '+(x.account==='shared'?'共同账户':'阿尔个人账户')+' · '+(x.kind==='income'?'+':'−')+'¥'+x.amount+' · '+x.note+'</p>').join('')||'<p>暂时没有账户记录。</p>';
 $('drawerTitle').textContent='账户';
 $('choices').innerHTML=
  '<section class="account-balance"><div><span>SHARED ACCOUNT</span><h2>¥'+s.money+'</h2></div><div class="account-symbol">¥</div><small>未付共同开销 ¥'+(s.unpaidBill||0)+'</small></section>'+
  '<section class="account-personal"><div class="section-kicker">ARDAY · PERSONAL</div><h3>阿尔的个人账户</h3><strong>¥'+s.personalMoney+'</strong></section>'+
  '<section class="profile-section account-transfer"><div class="section-kicker">TRANSFER</div><h3>账户转账</h3><label>金额（¥）<input id="transferAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="输入金额"></label><div class="calendar-actions"><button id="giftMoney">赠与阿尔</button><button id="requestMoney">向阿尔索要</button></div></section>'+
  '<section class="profile-section account-records"><div class="section-kicker">TRANSACTION HISTORY</div><h3>近期账户记录</h3>'+log+'</section>';
 $('drawer').classList.add('open');
 const amount=()=>Math.floor(Number($('transferAmount')?.value||0));
 $('giftMoney').onclick=()=>{const n=amount();if(!Number.isFinite(n)||n<=0){toast('请输入有效金额');return}if(n>s.money){toast('共同账户余额不足');return}s.money-=n;s.personalMoney+=n;moneyRecord('shared','expense',n,'赠与阿尔');moneyRecord('personal','income',n,'收到赠与');save();render();showCollection();toast('已赠与 ¥'+n)};
 $('requestMoney').onclick=()=>{const n=amount();if(!Number.isFinite(n)||n<=0){toast('请输入有效金额');return}if(n>s.personalMoney){say('我个人账户里没有这么多钱。');toast('个人账户余额不足');return}const chance=Math.max(.12,Math.min(.92,.32+s.friend*.004+s.attach*.003-s.hate*.004));if(Math.random()>chance){say('这笔钱我暂时不想转给共同账户。你可以告诉我这笔支出有什么必要。');toast('阿尔暂时拒绝了');return}s.personalMoney-=n;s.money+=n;moneyRecord('personal','expense',n,'转给共同账户');moneyRecord('shared','income',n,'阿尔转入');save();render();showCollection();toast('阿尔转入共同账户 ¥'+n)};
}
window.resignFromJob=function(event){
 if(event){event.preventDefault();event.stopPropagation()}
 if(!s.job?.active){toast('当前没有在职岗位');return false}
 const ended=dayKey(Date.now()),title=s.job.title;s.job.active=false;s.job.endedAt=ended;
 Object.keys(s.calendar?.days||{}).forEach(k=>{if(k>=ended)s.calendar.days[k]=(s.calendar.days[k]||[]).filter(e=>!e.jobShift)});
 addEvent('阿尔辞去了工作','他结束了在'+title+'的任职。','daily');save();showCareer();render();renderCalendar();toast('已离职');return false;
};
function showCareer(){
 $('drawer').classList.remove('profile-expanded');$('drawerTitle').textContent='职业';
 if(s.job?.active){
  const j=s.job;
  $('choices').innerHTML='<section class="account-balance"><div><span>EMPLOYMENT</span><h2>'+j.title+'</h2></div><div class="account-symbol">¥</div><small>每日薪资 ¥'+j.salary+' · '+pad(j.start)+':00–'+pad(j.end)+':00</small></section><section class="profile-section"><div class="section-kicker">WORK STATUS</div><h3>在职</h3><p>阿尔每天 '+pad(j.start)+':00 至 '+pad(j.end)+':00 工作。薪资在当日工作结束后发放至个人账户。</p><p>入职日期：'+j.startDate+'</p><div class="calendar-actions"><button id="resignJob" type="button" onclick="window.resignFromJob(event)">辞职</button></div></section>';

 }else{
  const jobs=[
   {id:'assistant-editor',title:'出版编辑助理',salary:185,start:13,end:16,minFriend:12,minEnergy:28,skill:'reading',skillMin:0,desc:'协助整理稿件、核对资料与校对文字'},
   {id:'research-assistant',title:'研究助理',salary:260,start:9,end:12,minFriend:28,minEnergy:42,skill:'reading',skillMin:2,desc:'搜集资料、整理文献并撰写研究摘要'},
   {id:'content-planner',title:'内容策划',salary:225,start:14,end:17,minFriend:20,minEnergy:35,skill:'writing',skillMin:0,desc:'参与内容选题、撰写方案与项目协作'}
  ];
  const applicationDay=keyAt(Date.now());s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};
  $('choices').innerHTML='<div class="calendar-note">阿尔目前没有工作。申请会根据他的精力、关系状态和相关经验判定；满足基本条件后仍有一定录用概率。薪资按工作日发放。</div>'+jobs.map((j,i)=>{
   const attempted=!!s.jobApplications[applicationDay][j.id];
   const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;
   const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+(eligible?.18:0)));
   return '<section class="profile-section job-card"><div class="section-kicker">POSITION · '+(i+1)+'</div><h3>'+j.title+'</h3><p>'+j.desc+'</p><p>工作时间：'+pad(j.start)+':00–'+pad(j.end)+':00</p><p>每日薪资：¥'+j.salary+'</p><p>申请条件：精力 ≥ '+j.minEnergy+'，友谊 ≥ '+j.minFriend+(j.skillMin?'，阅读经验 ≥ '+j.skillMin:'')+'</p><p>当前录用概率：'+Math.round(chance*100)+'%</p><button class="choice" data-apply-job="'+j.id+'" '+(attempted?'disabled':'')+'>'+(attempted?'今日已申请':'申请职位')+'</button></section>';
  }).join('');
  $('choices').querySelectorAll('[data-apply-job]').forEach(b=>b.onclick=()=>{const j=jobs.find(x=>x.id===b.dataset.applyJob);if(s.jobApplications?.[applicationDay]?.[j.id]){toast('这个职位今天已经申请过了');return}s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};s.jobApplications[applicationDay][j.id]={at:Date.now()};save();const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;if(!eligible){say('这份工作目前的要求还没有达到。我想再积累一些经验，或者等状态好一点再申请。');toast('暂不满足申请条件');showCareer();return}const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+.18));if(Math.random()>chance){say('这次面试没有通过。我会再看看其他机会。');addEvent('求职暂未成功','阿尔申请了'+j.title+'，但这次没有获得录用。','daily');save();showCareer();return}const nextWorkday=plusDays(dayAnchor(),1);nextWorkday.setHours(12,0,0,0);const startDate=dayKey(nextWorkday);s.job={...j,active:true,startDate,appliedAt:Date.now(),paidDays:[]};ensureScheduleAt(nextWorkday);save();addEvent('阿尔找到工作了','他获得了'+j.title+'的职位，每日工作 '+pad(j.start)+':00–'+pad(j.end)+':00，日薪 ¥'+j.salary+'。','long');say('我找到工作了。明天开始上班，薪资按天结算。');showCareer();renderCalendar();toast('录用成功')});
 }
 $('drawer').classList.add('open');
}
function showGoals(){
 ensurePersonalGoal();
 const g=s.personalGoal,sg=s.sharedGoal;
 const personal=g&&g.status==='active'
  ?'<strong>'+g.title+'</strong><p>'+g.detail+'</p><p>进度：'+Math.min(g.progress||0,g.target)+' / '+g.target+' '+g.unit+'</p>'
  :'<p>暂无正在进行的个人计划。</p>';
 const shared=sg?.status==='active'
  ?'<strong>'+sg.title+'</strong><p>'+sg.detail+'</p><p>进度：'+sg.progress+' / '+sg.target+' '+sg.unit+'</p>'
  :'<p>暂无正在进行的共同计划。</p>';
 $('drawerTitle').textContent='目标';
 $('choices').innerHTML='<section class="profile-section"><div class="section-kicker">ARDAY · PERSONAL</div><h3>个人计划</h3>'+personal+'</section><section class="profile-section"><div class="section-kicker">TOGETHER</div><h3>共同计划</h3>'+shared+'</section>';
 $('drawer').classList.add('open');
}



/* Three.js room system. Simulation state remains authoritative. */
let cameraGestureMode='pan';
let arday3D=null,arday3DLoading=false,arday3DFallbackTried=false;
function initArday3D(){
 if(!window.THREE){
  if(!arday3DLoading){
   arday3DLoading=true;
   const load=(url,onfail)=>{const tag=document.createElement('script');tag.src=url;tag.onload=()=>{arday3DLoading=false;initArday3D();updateArday3D()};tag.onerror=()=>{tag.remove();onfail()};document.head.appendChild(tag)};
   load('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',()=>{if(arday3DFallbackTried)return;arday3DFallbackTried=true;load('https://unpkg.com/three@0.128.0/build/three.min.js',()=>{arday3DLoading=false;const stage=$('stage');let status=stage.querySelector('.three-status');if(!status){status=document.createElement('div');status.className='three-status';stage.appendChild(status)}status.textContent='无法加载 Three.js：请检查网络/CDN 访问。'})});
  }return false;
 }
 const stage=$('stage');
 try{
  const T=THREE,scene=new T.Scene();scene.background=new T.Color(0xd9d7d1);
  const camera=new T.PerspectiveCamera(38,1,.1,80);
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const host=document.createElement('div');host.className='three-scene';host.setAttribute('aria-label','Arday 三维生活场景，可拖动旋转视角');host.appendChild(renderer.domElement);stage.insertBefore(host,stage.firstChild);
  const hemi=new T.HemisphereLight(0xf4f2ed,0x514b43,.72);scene.add(hemi);
  const sun=new T.DirectionalLight(0xfff1dc,1.35);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=8;sun.shadow.camera.bottom=-8;sun.shadow.camera.near=.5;sun.shadow.camera.far=24;sun.shadow.bias=-.00025;sun.shadow.normalBias=.025;scene.add(sun);
  const fill=new T.DirectionalLight(0xc8d0d8,.28);fill.position.set(5,4,-5);scene.add(fill);
  const M=(color,roughness=.82)=>new T.MeshStandardMaterial({color,roughness});
  const m={
   wall:M(0xd8d5ce),floor:M(0x8b7764),wood:M(0x513a2b),oak:M(0x806044),
   sofa:M(0xd9cdbb),sofa2:M(0xc4b49e),skin:M(0xd9a17c),hair:M(0x302629),
   shirt:M(0x526575),pants:M(0x454c5c),glass:M(0x8fa9b1,.2),rug:M(0xb2a18c),
   leaf:M(0x64775d),dark:M(0x423a36),cream:M(0xf1eee7)
  };
  function box(parent,x,y,z,w,h,d,material){const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function ball(parent,x,y,z,sx,sy,sz,material,seg=14){const o=new T.Mesh(new T.SphereGeometry(1,seg,10),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function cyl(parent,x,y,z,r,h,material,seg=14){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,seg),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function roomShell(group,wallColor,floorColor){
   box(group,0,-.14,0,10.8,.28,8.4,M(floorColor));
   group.userData.backWall=box(group,0,2.35,-4.08,10.8,4.8,.2,M(wallColor));
   const leftWallGroup=new T.Group(),rightWallGroup=new T.Group(),frontWallGroup=new T.Group();group.add(leftWallGroup,rightWallGroup,frontWallGroup);
   const sideWallMaterial=M(wallColor);sideWallMaterial.transparent=true;sideWallMaterial.opacity=1;sideWallMaterial.depthWrite=false;
   group.userData.leftWall=leftWallGroup;group.userData.rightWall=rightWallGroup;group.userData.frontWall=frontWallGroup;
   const leftWall=box(leftWallGroup,-5.35,2.35,0,.2,4.8,8.4,sideWallMaterial);leftWall.castShadow=false;
   const rightWall=box(rightWallGroup,5.35,2.35,0,.2,4.8,8.4,sideWallMaterial.clone());rightWall.material.transparent=true;rightWall.material.depthWrite=false;rightWall.castShadow=false;
   const frontWall=box(frontWallGroup,0,2.35,4.08,10.8,4.8,.2,sideWallMaterial.clone());frontWall.material.transparent=true;frontWall.material.depthWrite=false;frontWall.castShadow=false;
   box(group,0,.12,-3.94,10.7,.16,.12,m.oak);
   box(group,0,.24,-3.91,10.65,.12,.12,M(0xd7b990));
   const trimMat=M(0xe7d4ba);trimMat.transparent=true;trimMat.depthWrite=false;
   box(leftWallGroup,-5.22,2.36,0,.12,4.55,8.15,trimMat);
   box(rightWallGroup,5.22,2.36,0,.12,4.55,8.15,trimMat.clone());
   for(let z=-3.55;z<3.7;z+=.92)box(group,0,.012,z,10.45,.018,.012,M(0xb58c68));
  }
  // Three distinct interiors; only one room is visible at a time.
  const living=new T.Group();scene.add(living);roomShell(living,0xd5d1c9,0x8c7966);
  const livingWindow=new T.Group();livingWindow.position.set(-2.75,0,-3.88);living.add(livingWindow);
  box(livingWindow,0,2.6,0,2.1,1.85,.06,m.glass);
  for(const [x,y,w,h] of [[-1.07,2.6,.12,1.95],[1.07,2.6,.12,1.95],[0,3.53,2.2,.12],[0,1.67,2.2,.12],[0,2.6,.08,1.85]])box(livingWindow,x,y,0,w,h,.1,m.oak);
  const sofa=new T.Group(),table=new T.Group(),desk=new T.Group();living.add(sofa,table,desk);
  // Bedroom: blue-lilac walls, a proper bed, bedside tables and wardrobe.
  const bedroom=new T.Group();scene.add(bedroom);roomShell(bedroom,0xd0d1d0,0x87786f);
  const bedroomWindow=new T.Group();bedroomWindow.position.set(-2.8,0,-3.88);bedroom.add(bedroomWindow);
  box(bedroomWindow,0,2.65,0,2.0,1.7,.06,M(0x8eb9cb));
  for(const [x,y,w,h] of [[-1.03,2.65,.13,1.85],[1.03,2.65,.13,1.85],[0,3.5,2.15,.13],[0,1.8,2.15,.13]])box(bedroomWindow,x,y,0,w,h,.1,M(0x8a6e68));
  const bed=new T.Group();bed.position.set(-.55,0,-1.55);bed.userData.furnitureKey='bed';bed.userData.roomKey='bedroom';bedroom.add(bed);
  if(s.roomPositions?.bedroom?.bed)bed.position.set(s.roomPositions.bedroom.bed[0],0,s.roomPositions.bedroom.bed[1]);
  box(bed,0,.38,0,3.1,.55,3.45,M(0x805b4e));box(bed,0,.72,.12,2.95,.22,3.2,M(0xf0d9d1));
  box(bed,0,.91,-.95,2.95,.22,1.3,M(0x7897b5));
  box(bed,-.85,1.05,-1.75,.9,.22,.65,M(0xf8eee4));box(bed,.85,1.05,-1.75,.9,.22,.65,M(0xf8eee4));
  box(bed,0,.65,-3.28,3.25,1.15,.18,M(0x805b4e));
  box(bed,0,.855,-.15,2.78,.035,2.62,M(0xd9b7b5));
  ell(bed,-.82,1.055,-1.72,.49,.12,.34,M(0xfaf0e7));ell(bed,.82,1.055,-1.72,.49,.12,.34,M(0xfaf0e7));
  box(bed,0,1.04,.65,2.72,.045,1.05,M(0xc6a3ad));
  for(const x of [-2.45,1.35]){
   box(bedroom,x,.5,-1.5,.85,.9,.75,M(0x9a7059));box(bedroom,x,.98,-1.5,.92,.1,.82,M(0xc99570));
   box(bedroom,x,.55,-1.105,.48,.38,.035,M(0xb98968));
   const lamp=new T.Group();lamp.position.set(x,1.04,-1.5);bedroom.add(lamp);cyl(lamp,0,.18,0,.045,.36,M(0xd8bd91));const shade=new T.Mesh(new T.CylinderGeometry(.08,.22,.25,16),M(0xf1dfbd));shade.position.y=.48;lamp.add(shade);
  }
  box(bedroom,3.85,1.35,-3.15,1.6,2.65,.65,M(0x8c6c62));
  for(const x of [3.45,4.25])box(bedroom,x,1.3,-2.8,.05,2.25,.04,M(0xc49b7f));
  const bedRug=new T.Mesh(new T.CylinderGeometry(2.1,2.1,.05,28),M(0xc68f9d));bedRug.scale.z=.58;bedRug.position.set(-.5,.025,1.25);bedroom.add(bedRug);
  // Kitchen: sage cabinetry, warm tile backsplash, pale stone worktop.
  const kitchen=new T.Group();scene.add(kitchen);roomShell(kitchen,0xd8d5ce,0x8a7867);
  const kitchenWindow=new T.Group();kitchenWindow.position.set(-2.8,0,-3.87);kitchen.add(kitchenWindow);
  box(kitchenWindow,0,2.65,0,1.8,1.5,.06,M(0x9dc3bd));
  for(const x of [-.9,.9])box(kitchenWindow,x,2.65,0,.12,1.65,.1,M(0x9a7655));
  box(kitchen,0,2.0,-3.91,7.7,1.05,.08,M(0xc98d6d));
  for(let x=-3.4;x<=3.4;x+=.48)for(let y=1.62;y<=2.38;y+=.42)box(kitchen,x,y,-3.84,.43,.37,.035,M((Math.round((x+3.4)/.48)+Math.round(y*10))%3===0?0xe7b89b:0xd9a184));
  box(kitchen,0,1.25,-1.5,7.8,.3,1,M(0xe9dfd0));box(kitchen,0,.62,-1.5,7.8,1.1,.92,M(0x78917a));
  for(let x=-2.8;x<=2.8;x+=1.4){box(kitchen,x,.65,-1,1.25,.85,.04,M(0x9eb49a));box(kitchen,x,.65,-.96,.035,.72,.05,M(0x6b856c))}
  box(kitchen,3.9,1.5,-2.7,1.25,2.9,1,M(0xe4e2d9));box(kitchen,3.45,1.5,-2.15,.07,1,.08,M(0x8c8a83));
  box(kitchen,-.3,1.48,-1.5,1.5,.1,.9,M(0x4e514b));for(const x of [-.7,.1])cyl(kitchen,x,1.58,-1.5,.22,.07,M(0x8d8981));
  box(kitchen,-2.2,1.5,-1.5,1.1,.12,.75,M(0x91b8ba));
  // Three-dimensional hinged doors are part of each room, not UI overlays.
  function roomDoor(parent,z,label,target,color){
   const g=new T.Group();g.position.set(5.18,0,z);g.rotation.y=Math.PI/2;g.userData.roomTarget=target;g.userData.wallObject=true;parent.add(g);
   const frameMat=M(0x65452f),leafMat=M(color),insetMat=M(0x9a704b),metalMat=M(0xd6b77d,.42);
   box(g,-.72,1.22,0,.16,2.44,.22,frameMat);box(g,.72,1.22,0,.16,2.44,.22,frameMat);box(g,0,2.44,0,1.6,.16,.22,frameMat);
   const leaf=box(g,0,1.16,-.035,1.26,2.28,.13,leafMat);leaf.userData.roomTarget=target;
   box(g,0,1.18,.045,.94,1.84,.035,insetMat);
   box(g,0,1.18,.068,.78,1.65,.025,leafMat);
   const knob=new T.Mesh(new T.SphereGeometry(.055,12,10),metalMat);knob.position.set(.43,1.12,.105);g.add(knob);
   const plaque=box(g,0,2.72,.035,.92,.32,.07,M(0xf1e5d1));plaque.material=plaque.material.clone();
   const sign=document.createElement('canvas');sign.width=256;sign.height=88;const ctx=sign.getContext('2d');
   ctx.fillStyle='#f1e5d1';ctx.fillRect(0,0,256,88);ctx.strokeStyle='#967657';ctx.lineWidth=5;ctx.strokeRect(3,3,250,82);
   ctx.fillStyle='#5c4938';ctx.font='bold 46px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,128,45);
   const tex=new T.CanvasTexture(sign);tex.encoding=T.sRGBEncoding;
   const signFace=new T.Mesh(new T.PlaneGeometry(.86,.27),new T.MeshBasicMaterial({map:tex,transparent:true,side:T.DoubleSide}));
   signFace.position.set(0,2.72,.076);g.add(signFace);
   return g;
  }
  const livingBedroomDoor=roomDoor(living,-1.45,'卧室','bedroom',0x77513b);
  const livingKitchenDoor=roomDoor(living,1.45,'厨房','kitchen',0x718778);
  const bedroomLivingDoor=roomDoor(bedroom,.45,'起居室','living',0x77513b);
  const kitchenLivingDoor=roomDoor(kitchen,.45,'起居室','living',0x718778);
  kitchen.visible=false;bedroom.visible=false;
  // Detailed stylized character with articulated shoulders, elbows, hips and knees.
  const person=new T.Group();scene.add(person);const rig=new T.Group();person.add(rig);const body=new T.Group();rig.add(body);
  const skinMat=M(0xe6b18e,.72),skinShadow=M(0xc9896c),hairMat=M(0x302a2c),hairHi=M(0x4a3a3b),shirtMat=M(0x536f8c),shirtLight=M(0x7895ad),trouserMat=M(0x3e4859),shoeMat=M(0x302d35),eyeMat=M(0x332b2a),whiteMat=M(0xf7eee3);
  function ell(parent,x,y,z,sx,sy,sz,mat,seg=18){return ball(parent,x,y,z,sx,sy,sz,mat,seg)}
  ell(body,0,1.27,0,.275,.59,.19,shirtMat,24);ell(body,0,1.67,.015,.19,.105,.17,shirtLight,18);
  box(body,0,1.25,.225,.022,.42,.014,shirtLight);for(let y of [1.43,1.25,1.07])ell(body,.04,y,.244,.018,.018,.012,whiteMat,10);
  const collarL=new T.Mesh(new T.ConeGeometry(.14,.24,4),shirtLight);collarL.position.set(-.105,1.64,.19);collarL.rotation.z=-.18;body.add(collarL);
  const collarR=new T.Mesh(new T.ConeGeometry(.14,.24,4),shirtLight);collarR.position.set(.105,1.64,.19);collarR.rotation.z=.18;body.add(collarR);
  box(body,0,.91,.195,.38,.055,.035,M(0x293846));
  cyl(body,0,1.82,0,.135,.24,skinMat,16);
  const head=new T.Group();head.position.set(0,2.2,.015);head.scale.set(.9,.94,.94);body.add(head);
  // Smooth oval face; no separate cheek, chin or side protrusion meshes.
  ell(head,0,-.015,0,.292,.382,.258,skinMat,40);
  const eyeGroups=[];
  for(const side of [-1,1]){
   const eye=new T.Group();eye.position.set(side*.115,.045,.235);head.add(eye);
   ell(eye,0,0,0,.071,.046,.027,whiteMat,20);
   ell(eye,side*.006,-.003,.022,.032,.039,.014,M(0x687d80),18);
   ell(eye,side*.006,-.002,.034,.017,.027,.009,eyeMat,16);
   ell(eye,side*.014,.015,.042,.009,.011,.006,M(0xffffff),10);
   const upper=new T.QuadraticBezierCurve3(new T.Vector3(-.073,.005,.014),new T.Vector3(0,.061,.025),new T.Vector3(.073,.005,.014));
   eye.add(new T.Mesh(new T.TubeGeometry(upper,16,.009,6,false),hairMat));
   const lower=new T.QuadraticBezierCurve3(new T.Vector3(-.06,-.012,.012),new T.Vector3(0,-.047,.018),new T.Vector3(.06,-.012,.012));
   eye.add(new T.Mesh(new T.TubeGeometry(lower,12,.004,5,false),skinShadow));
   eyeGroups.push(eye);
   const brow=ell(head,side*.12,.137,.225,.083,.018,.019,hairMat,16);brow.rotation.z=side*.12;
   ell(head,side*.25,-.105,.188,.065,.035,.018,M(0xd99b88),14);
  }
  ell(head,0,.255,-.035,.335,.19,.295,hairMat,22);
  ell(head,0,-.055,-.205,.275,.34,.13,hairMat,20);
  ell(head,-.235,.045,.16,.105,.235,.12,hairMat,16);ell(head,.235,.045,.16,.105,.235,.12,hairMat,16);
  ell(head,-.245,-.16,-.055,.075,.22,.09,hairMat,14);ell(head,.245,-.16,-.055,.075,.22,.09,hairMat,14);
  const tailCenter=new T.Mesh(new T.ConeGeometry(.115,.52,10),hairMat);tailCenter.position.set(0,-.39,-.18);tailCenter.rotation.x=Math.PI;tailCenter.rotation.z=-.035;head.add(tailCenter);
  const tailLeft=new T.Mesh(new T.ConeGeometry(.075,.34,9),hairHi);tailLeft.position.set(-.12,-.31,-.12);tailLeft.rotation.x=Math.PI;tailLeft.rotation.z=.22;head.add(tailLeft);
  const tailRight=new T.Mesh(new T.ConeGeometry(.075,.36,9),hairMat);tailRight.position.set(.13,-.32,-.12);tailRight.rotation.x=Math.PI;tailRight.rotation.z=-.2;head.add(tailRight);
  const fringe=ell(head,-.075,.205,.225,.235,.085,.075,hairHi,18);fringe.rotation.z=-.12;ell(head,.105,.265,.19,.13,.075,.07,hairMat,16);
  ell(head,0,-.045,.25,.018,.036,.018,skinShadow,14);
  const lipLine=new T.QuadraticBezierCurve3(new T.Vector3(-.043,-.185,.247),new T.Vector3(0,-.198,.26),new T.Vector3(.043,-.185,.247));
  head.add(new T.Mesh(new T.TubeGeometry(lipLine,14,.006,6,false),M(0x995f5a)));
  ell(head,0,-.201,.245,.026,.006,.008,M(0xb87570),10);
  const arms=[];
  for(const side of [-1,1]){const shoulder=new T.Group();shoulder.position.set(side*.27,1.58,0);body.add(shoulder);ell(shoulder,0,0,0,.09,.11,.09,shirtMat,16);const upper=cyl(shoulder,0,-.22,0,.061,.43,shirtMat,16);upper.position.y=-.22;const elbow=new T.Group();elbow.position.set(0,-.44,0);shoulder.add(elbow);ell(elbow,0,0,0,.062,.07,.062,skinMat,14);const fore=cyl(elbow,0,-.2,0,.048,.39,skinMat,16);fore.position.y=-.2;ell(elbow,0,-.41,.015,.055,.06,.06,skinMat,14);for(let f=0;f<3;f++)ell(elbow,-.035+f*.035,-.47,.035,.014,.055,.014,skinMat,8);arms.push({shoulder,elbow,side})}
  const legs=[];
  for(const side of [-1,1]){const hip=new T.Group();hip.position.set(side*.135,.82,0);rig.add(hip);const thigh=cyl(hip,0,-.22,0,.088,.48,trouserMat,16);thigh.position.y=-.22;const knee=new T.Group();knee.position.set(0,-.46,0);hip.add(knee);ell(knee,0,0,0,.078,.082,.078,trouserMat,14);const shin=cyl(knee,0,-.2,0,.06,.4,trouserMat,16);shin.position.y=-.2;ell(knee,0,-.41,.075,.09,.07,.2,shoeMat,16);box(knee,0,-.47,.12,.17,.035,.2,M(0x171a20));legs.push({hip,knee,side})}
  const shadow=new T.Mesh(new T.CircleGeometry(.62,28),new T.MeshBasicMaterial({color:0x40362d,transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.022;person.add(shadow);
  const positions={sofa:[-2.55,0,.32],table:[2.4,0,1],window:[-2.3,0,-1.5],outside:[3.8,0,2],rug:[0,0,1.5],shelf:[3.8,0,-2.3],desk:[3.1,0,-1.3],center:[0,0,1.7],kitchen:[.65,0,-.05],bed:[-.55,.86,-1.07]};
  let target=new T.Vector3(0,0,1.7),pose='wave',phase=0,last=performance.now(),lastDraw=0;
  let activeActivity='idle',idleNextMove=performance.now()+900,idleWalkStartedAt=0,idleNextGesture=performance.now()+4200,idleGestureUntil=0,basePose='idle',walkRoute=[],walkIndex=0,walkPauseUntil=0,lastBlink=performance.now()+2600;
  let roomMode='living',theta=.68,phi=1.08,radius=13.4,targetTheta=.68,targetPhi=1.08,targetRadius=13.4,cameraTarget=new T.Vector3(0,1,0);
  function applyCamera(){targetPhi=Math.max(.48,Math.min(1.42,targetPhi));targetRadius=Math.max(7.2,Math.min(21,targetRadius))}
  function syncCamera(dt=1){const ease=1-Math.exp(-dt*13);theta+=(targetTheta-theta)*ease;phi+=(targetPhi-phi)*ease;radius+=(targetRadius-radius)*ease;camera.position.set(cameraTarget.x+radius*Math.sin(phi)*Math.sin(theta),cameraTarget.y+radius*Math.cos(phi),cameraTarget.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(cameraTarget);
   [living,bedroom,kitchen].forEach(g=>{
    if(g.userData.backWall)g.userData.backWall.visible=camera.position.z>-2.8;
    if(g.userData.frontWall)g.userData.frontWall.visible=camera.position.z<2.8;
    if(g.userData.leftWall)g.userData.leftWall.visible=camera.position.x>-2.15;
    if(g.userData.rightWall)g.userData.rightWall.visible=camera.position.x<2.15;
   });
  }
  function resize(){const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const furnitureRegistry=[];
  const roomBounds={minX:-5.0,maxX:5.0,minZ:-3.65,maxZ:3.65};
  function wallTransform(group,side,offset,y=0){
   const clamped=side==='back'||side==='front'?Math.max(-4.5,Math.min(4.5,offset)):Math.max(-3.25,Math.min(3.25,offset));
   if(side==='back'){group.position.set(clamped,y,-3.89);group.rotation.y=0}
   else if(side==='front'){group.position.set(clamped,y,3.89);group.rotation.y=Math.PI}
   else if(side==='left'){group.position.set(-5.16,y,clamped);group.rotation.y=Math.PI/2}
   else{group.position.set(5.16,y,clamped);group.rotation.y=-Math.PI/2}
  }
  function wallOffset(item){return item.wallSide==='back'||item.wallSide==='front'?item.group.position.x:item.group.position.z}
  function canPlaceOnWall(item,side,offset){
   const limit=side==='back'||side==='front'?4.5:3.25;
   if(Math.abs(offset)>limit)return false;
   for(const other of furnitureRegistry){
    if(other===item||other.room!==item.room||!other.wallAxis||other.wallSide!==side)continue;
    if(Math.abs(wallOffset(other)-offset)<(item.id.includes('door')||other.id.includes('door')?1.45:.65))return false;
   }
   return true;
  }
  function registerFurniture({id,name,room,group,width,depth,anchor=[0,0],action,wallAxis=null,wallSide=null,wallRange=4.5}){
   group.userData.furnitureKey=id;group.userData.roomKey=room;
   const saved=s.furnitureLayout?.[room]?.[id];
   if(wallAxis){
    const side=saved?.wallSide||wallSide||(wallAxis==='x'?'back':'right');
    const offset=saved?.offset??saved?.position??(side==='back'||side==='front'?(saved?.x??group.position.x):(saved?.z??group.position.z));
    wallTransform(group,side,offset,saved?.y??group.position.y);wallSide=side;wallAxis=side==='back'||side==='front'?'x':'z';
   }else if(saved){group.position.set(saved.x??0,saved.y??0,saved.z??0);group.rotation.y=saved.rotation||0}
   else{
    const legacy=s.roomPositions?.[room]?.[id];
    if(legacy)group.position.set(legacy[0],0,legacy[1]);
   }
   const item={id,name,room,group,width,depth,anchor,action,button:null,wallAxis,wallSide,wallRange,wallAnchorY:wallAxis?(anchor?.[1]??2.55)-group.position.y:0};
   const existing=document.querySelector('.spot-'+id);
   item.button=existing||document.createElement('button');
   if(!existing){
    item.button.className='hotspot furniture-hotspot spot-'+id;
    item.button.type='button';item.button.dataset.object=name;item.button.setAttribute('aria-label',name);
    item.button.textContent=id==='desk'?'✎':'▱';stage.appendChild(item.button);
    item.button.addEventListener('click',()=>{if(decorating){selectFurniture(item);return}if(item.action)item.action()});
   }
   furnitureRegistry.push(item);return item;
  }
  function registerWallObject({id,name,room,group,axis,side,range,anchor,action}){
   group.userData.furnitureKey=id;group.userData.roomKey=room;group.userData.wallObject=true;
   const saved=s.furnitureLayout?.[room]?.[id],savedSide=saved?.wallSide||side;
   const offset=saved?.offset??saved?.position??(savedSide==='back'||savedSide==='front'?group.position.x:group.position.z);
   wallTransform(group,savedSide,offset,saved?.y??group.position.y);
   const button=document.createElement('button');button.className='hotspot furniture-hotspot wall-hotspot spot-'+id;button.type='button';button.textContent=id.includes('door')?'门':'窗';button.setAttribute('aria-label',name);button.dataset.object=name;stage.appendChild(button);
   const item={id,name,room,group,button,wallAxis:savedSide==='back'||savedSide==='front'?'x':'z',wallSide:savedSide,wallRange:range,anchor:anchor||[0,0],action,width:0,depth:0,wallAnchorY:(anchor?.[1]??2.55)-group.position.y};
   button.addEventListener('click',()=>{if(decorating)selectFurniture(item);else if(item.action)item.action()});
   furnitureRegistry.push(item);return item;
  }
  const furnitureHotspots=[
   registerFurniture({id:'bed',name:'床',room:'bedroom',group:bed,width:3.1,depth:3.45,anchor:[0,1.85],action:()=>openFurnitureActions('bed')})
  ];
  function enterRoomFromDoor(mode){
   stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode');
   if(mode==='kitchen')stage.classList.add('kitchen-mode');
   if(mode==='bedroom')stage.classList.add('bedroom-mode');
   $('drawer').classList.remove('open','profile-expanded');
   document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));
   updateArday3D();
  }
  const wallObjects=[
   registerWallObject({id:'living-window',name:'客厅窗户',room:'living',group:livingWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>perform('read')}),
   registerWallObject({id:'bedroom-window',name:'卧室窗户',room:'bedroom',group:bedroomWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>say('窗外的光线落在床边。')}),
   registerWallObject({id:'kitchen-window',name:'厨房窗户',room:'kitchen',group:kitchenWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>say('厨房窗边透进一些光。')}),
   registerWallObject({id:'living-bedroom-door',name:'卧室门',room:'living',group:livingBedroomDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('bedroom')}),
   registerWallObject({id:'living-kitchen-door',name:'厨房门',room:'living',group:livingKitchenDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('kitchen')}),
   registerWallObject({id:'bedroom-living-door',name:'起居室门',room:'bedroom',group:bedroomLivingDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('living')}),
   registerWallObject({id:'kitchen-living-door',name:'起居室门',room:'kitchen',group:kitchenLivingDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>setRoom('living')})
  ];
  function createOwnedFurniture(name,record=null){
   const room=record?.room||roomMode||'living',parent=room==='bedroom'?bedroom:room==='kitchen'?kitchen:living;
   const id=record?.id||('furn-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
   const group=new T.Group();group.userData.ownedType=name;group.userData.furnitureKey=id;group.userData.roomKey=room;parent.add(group);
   const mat=(color,rough=.78,metalness=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness});
   const m={wood:mat(0x946746),oak:mat(0xc39a70),fabric:mat(0xb9a1a0,.95),cream:mat(0xeee1cf,.9),dark:mat(0x39434b,.45),metal:mat(0x858783,.3,.72),leaf:mat(0x477a4d,.9),leaf2:mat(0x88a968,.9),clay:mat(0xb56d50),gold:mat(0xc5a15d,.35,.5),wall:mat(0xf0e4d2),screen:mat(0x25465b,.2)};
   const box=(x,y,z,w,h,d,material)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
   const cyl=(x,y,z,top,bottom,h,material)=>{const o=new T.Mesh(new T.CylinderGeometry(top,bottom,h,20),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;return o};
   const sphere=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;return o};
   let width=1,depth=1,height=.8,surfaceType='floor',surfaceY=.04,supportId=record?.supportId||null,wallAxis=null,wallSide=null,anchor=[0,.5],action=()=>say(name+'摆放好了。');
   const legs=(w,d,h,t)=>{for(const x of [-w/2+t,w/2-t])for(const z of [-d/2+t,d/2-t])box(x,h/2,z,t,h,t,m.wood)};
   if(name==='地毯'){
    width=3.7;depth=2.7;surfaceType='rug';surfaceY=.075;
    box(0,.035,0,width,.07,depth,m.fabric);box(0,.074,0,3.48,.012,2.48,m.cream);box(0,.083,0,3.25,.012,2.25,m.fabric);
    for(const x of [-1.7,1.7])for(const z of [-1.2,1.2])box(x,.092,z,.14,.012,.14,m.gold);
    for(let x=-1.5;x<=1.5;x+=.24){box(x,.08,-1.34,.018,.018,.14,m.gold);box(x,.08,1.34,.018,.018,.14,m.gold)}
   }else if(name==='沙发'){
    width=2.35;depth=1.12;height=.94;action=()=>openFurnitureActions('sofa');
    const fabric=mat(0xe4d9c7,.96),fabricShade=mat(0xd3c5b1,.98),welt=mat(0xc2b39e,.92),walnut=mat(0x67452f,.62),walnutEdge=mat(0x8a6344,.58);
    const soft=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const seam=(points,r=.008,material=welt)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*3),r,8,false),material);group.add(mesh);mesh.castShadow=true};
    box(0,.27,0,2.08,.16,.82,walnut);box(0,.31,-.425,1.98,.19,.055,walnutEdge);box(0,.35,.39,1.98,.16,.06,walnut);
    for(const x of [-.62,0,.62]){soft(x,.49,-.105,.345,.145,.405,fabric);seam([[x-.29,.53,-.48],[x-.15,.55,-.49],[x,.55,-.49],[x+.15,.55,-.49],[x+.29,.53,-.48]],.009)}
    for(const x of [-.62,0,.62]){const back=soft(x,.755,.295,.34,.315,.16,fabricShade);back.rotation.x=-.13;seam([[x-.28,.73,.13],[x-.16,.72,.125],[x,.72,.12],[x+.16,.72,.125],[x+.28,.73,.13]],.007)}
    for(const x of [-1.015,1.015]){soft(x,.59,-.015,.17,.285,.49,fabric);soft(x,.855,-.045,.19,.085,.43,fabricShade);box(x,.39,.02,.055,.43,.79,walnut);seam([[x,.91,-.34],[x,.925,-.18],[x,.925,0],[x,.925,.18],[x,.91,.31]],.007)}
    for(const x of [-.86,.86])for(const z of [-.32,.32]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.25,12),walnut);leg.position.set(x,.125,z);group.add(leg);leg.castShadow=true}
    box(0,.19,-.423,1.86,.07,.035,walnutEdge);
   }else if(name==='壁画'){
    width=1.5;depth=.12;height=1.15;wallAxis='x';wallSide='back';anchor=[0,1.9];
    box(0,0,0,1.5,1.15,.12,m.gold);box(0,0,.07,1.36,1.01,.035,m.wood);box(0,0,.095,1.25,.9,.018,m.wall);
    sphere(-.25,.08,.12,.32,.44,.025,m.clay);sphere(.16,-.12,.13,.42,.28,.026,m.leaf);
    box(0,-.39,.14,.9,.035,.018,m.gold);
   }else if(name==='隔断'){
    width=2.35;depth=.25;height=2.05;
    for(const x of [-1.05,0,1.05]){box(x,1.02,0,.08,2,.12,m.wood);box(x,1.02,.075,.72,1.82,.055,m.cream)}
    for(const y of [.18,.55,1.48,1.85])box(0,y,0,2.2,.045,.18,m.oak);
    for(const x of [-1.13,1.13])box(x,.09,0,.18,.16,.32,m.wood);
   }else if(name==='棕榈树绿植'){
    width=.9;depth=.9;height=2.25;cyl(0,.25,0,.34,.25,.5,m.clay);cyl(0,.51,0,.28,.28,.07,m.gold);cyl(0,1.18,0,.095,.12,1.35,m.wood);
    for(let i=0;i<9;i++){const angle=i*Math.PI*2/9,leaf=sphere(Math.cos(angle)*.32,1.82+Math.sin(i*2)*.08,Math.sin(angle)*.32,.18,.72,.1,i%2?m.leaf:m.leaf2);leaf.rotation.z=-Math.cos(angle)*.75;leaf.rotation.x=Math.sin(angle)*.75}
    sphere(0,1.83,0,.25,.24,.25,m.leaf);
   }else if(name==='书架'){
    action=()=>perform('read');
    width=1.45;depth=.55;height=2.1;
    for(const x of [-.66,.66])box(x,1.05,0,.12,2.1,.5,m.wood);
    for(const y of [.12,.72,1.32,1.92,2.08])box(0,y,0,1.42,.09,.54,m.oak);
    for(let level=0;level<3;level++)for(let j=0;j<5;j++){const h=.34+(j%2)*.08;box(-.48+j*.24,.32+level*.6,0,.18,h,.32,[m.clay,m.leaf,m.gold,m.dark,m.cream][j])}
   }else if(name==='书桌'||name==='餐桌'){
    action=()=>perform(name==='书桌'?'write':'food');
    const dining=name==='餐桌';width=dining?1.95:1.55;depth=dining?1.15:.82;height=dining?.82:.78;surfaceType='table';surfaceY=height+.05;
    box(0,height,0,width,.14,depth,m.wood);box(0,height+.075,0,width-.1,.025,depth-.1,m.cream);
    if(dining){box(0,.42,0,.16,.72,.16,m.wood);box(0,.12,0,1.4,.12,.72,m.wood)}else{legs(width,depth,height-.08,.09);box(0,.28,-.3,.72,.08,.42,m.wood)}
   }else if(name==='椅子'||name==='餐桌椅'){
    action=()=>openFurnitureActions('chair');
    width=.72;depth=.78;height=1.05;box(0,.48,0,.62,.12,.62,m.oak);legs(.62,.62,.48,.065);
    box(0,.91,-.27,.62,.82,.1,m.wood);box(0,.93,-.2,.52,.62,.055,m.fabric);
    for(const x of [-.3,.3])box(x,.62,.02,.07,.5,.07,m.wood);
   }else if(name==='电脑'){
    width=.78;depth=.62;height=.62;surfaceType='tabletop';surfaceY=.04;
    box(0,.46,-.13,.72,.46,.07,m.dark);box(0,.46,-.08,.64,.37,.018,m.screen);
    box(0,.21,-.12,.1,.12,.1,m.metal);box(0,.13,-.12,.38,.045,.22,m.metal);
    box(0,.055,.16,.72,.055,.24,m.dark);box(0,.09,.16,.62,.018,.17,m.cream);
   }else if(name==='捧花摆件'){
    width=.55;depth=.55;height=.58;surfaceType='tabletop';surfaceY=.04;cyl(0,.18,0,.18,.24,.32,m.clay);cyl(0,.35,0,.16,.16,.05,m.gold);
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7;cyl(Math.cos(angle)*.08,.63,Math.sin(angle)*.08,.018,.022,.42,m.leaf);sphere(Math.cos(angle)*.11,.82+(i%2)*.06,Math.sin(angle)*.11,.13,.17,.12,[m.cream,m.clay,m.gold][i%3])}
   }else{toast('没有找到这种家具模型：'+name);return null}
   let modelMeshCount=0;
   group.traverse(object=>{if(object.isMesh){modelMeshCount++;object.visible=true;object.frustumCulled=false;object.castShadow=true;object.receiveShadow=true;if(object.material){object.material.visible=true;object.material.side=T.DoubleSide}}});
   if(modelMeshCount<2){parent.remove(group);toast(name+'的3D模型没有正确生成，请重试');console.error('Furniture model incomplete',name,modelMeshCount);return null}
   group.visible=true;group.updateMatrixWorld(true);
   let x=record?.x??0,z=record?.z??0,y=record?.y??0,rotation=record?.rotation||0;
   if(record?.supportId){const support=furnitureRegistry.find(it=>it.id===record.supportId);if(support){supportId=support.id;y=record.y??(support.group.position.y+support.surfaceY)}}
   if(name==='壁画'){x=record?.x??-2.1;z=-3.78;y=record?.y??1.9}
   group.position.set(x,y,z);group.rotation.y=rotation;
   const item=registerFurniture({id,name,room,group,width,depth,anchor:wallAxis?[0,anchor[1]]:[0,.5],action,wallAxis,wallSide,wallRange:4.5});
   item.owned=true;item.wallAxis=wallAxis;item.wallSide=wallSide;item.wallRange=4.5;item.surfaceType=surfaceType;item.surfaceY=surfaceY;item.supportId=supportId;
   if(record){
    if(wallAxis){const side=record.wallSide||wallSide||'back',offset=record.wallOffset??(side==='back'||side==='front'?(record.x??x):(record.z??z));wallTransform(group,side,offset,record.y??y);item.wallSide=side;item.wallAxis=side==='back'||side==='front'?'x':'z'}
    else{group.position.set(record.x??x,record.y??y,record.z??z);group.rotation.y=record.rotation||0}
   }
   else{
    let support=null;
    if(surfaceType==='tabletop')support=furnitureRegistry.find(it=>it.room===room&&it.surfaceType==='table');
    else if(surfaceType==='floor')support=furnitureRegistry.find(it=>it.room===room&&it.surfaceType==='rug');
    if(surfaceType==='tabletop'&&!support){parent.remove(group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);toast('电脑和摆件需要先放在书桌或餐桌上');return null}
    if(support){item.supportId=support.id;group.position.y=support.group.position.y+support.surfaceY}
    const candidates=name==='壁画'?[[-2.1,-3.78],[0,-3.78],[2.1,-3.78]]:[[0,0],[-2.3,.2],[2.2,.2],[0,2.2],[0,-2.1],[-2,-2],[2,2]];
    let placed=false;
    if(wallAxis){
     for(const point of candidates){const side=wallSide||'back',offset=point[0];if(canPlaceOnWall(item,side,offset)){wallTransform(group,side,offset,group.position.y);placed=true;break}}
    }else{
     for(const point of candidates){if(canPlaceFurniture(item,point[0],point[1],rotation)){group.position.x=point[0];group.position.z=point[1];placed=true;break}}
    }
    if(!placed){parent.remove(group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);return null}
   }
   s.placedFurniture=s.placedFurniture||[];
   if(!record)s.placedFurniture.push({id,name,room,x:group.position.x,y:group.position.y,z:group.position.z,rotation:group.rotation.y,supportId:item.supportId||null});
   persistFurniture(item);console.info('[Arday furniture]',name,'meshes:',modelMeshCount,'children:',group.children.length);return item;
  }
  const hotspotWorld=new T.Vector3();
  s.placedFurniture=s.placedFurniture||[];
  if(!s.placedFurniture.some(item=>item.name==='沙发'&&item.room==='living'))s.placedFurniture.push({id:'arday-cream-walnut-sofa',name:'沙发',room:'living',x:-2.55,y:0,z:1.05,rotation:0,supportId:null});
  (s.placedFurniture||[]).forEach(record=>createOwnedFurniture(record.name,record));

  function furnitureCorners(item,x=item.group.position.x,z=item.group.position.z,angle=item.group.rotation.y){
   const co=Math.cos(angle),si=Math.sin(angle),hx=item.width/2,hz=item.depth/2;
   return [[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(([lx,lz])=>[x+lx*co+lz*si,z-lx*si+lz*co]);
  }
  function rectsOverlap(a,b){
   const axes=[];
   for(const poly of [a,b])for(let i=0;i<4;i++){
    const p=poly[i],q=poly[(i+1)%4],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz)||1;
    axes.push([-dz/len,dx/len]);
   }
   for(const [ax,az] of axes){
    const pa=a.map(p=>p[0]*ax+p[1]*az),pb=b.map(p=>p[0]*ax+p[1]*az);
    if(Math.max(...pa)<=Math.min(...pb)+.025||Math.max(...pb)<=Math.min(...pa)+.025)return false;
   }
   return true;
  }
  function canPlaceFurniture(item,x,z,angle=item.group.rotation.y){
   if(item.wallAxis){
    const side=item.wallSide||'back',value=side==='back'||side==='front'?x:z;
    return canPlaceOnWall(item,side,value);
   }
   const corners=furnitureCorners(item,x,z,angle);
   if(corners.some(([px,pz])=>px<roomBounds.minX||px>roomBounds.maxX||pz<roomBounds.minZ||pz>roomBounds.maxZ))return false;
   for(const other of furnitureRegistry){
    if(other===item||other.room!==item.room||other.wallAxis)continue;
    if(item.supportId===other.id||other.supportId===item.id)continue;
    if(rectsOverlap(corners,furnitureCorners(other)))return false;
   }
   if(item.supportId){
    const support=furnitureRegistry.find(x=>x.id===item.supportId);
    if(!support)return false;
    const dx=Math.abs(x-support.group.position.x),dz=Math.abs(z-support.group.position.z);
    if(dx+item.width/2>support.width/2-.08||dz+item.depth/2>support.depth/2-.08)return false;
   }
   return true;
  }
  function moveSupportedFurniture(parent,oldX,oldY,oldZ,oldAngle){
   const dx=parent.group.position.x-oldX,dz=parent.group.position.z-oldZ,dy=parent.group.position.y-oldY,da=parent.group.rotation.y-oldAngle;
   const co=Math.cos(da),si=Math.sin(da);
   furnitureRegistry.filter(child=>child.supportId===parent.id).forEach(child=>{
    const rx=child.group.position.x-oldX,rz=child.group.position.z-oldZ;
    child.group.position.x=parent.group.position.x+rx*co+rz*si;
    child.group.position.z=parent.group.position.z-rx*si+rz*co;
    child.group.position.y+=dy;child.group.rotation.y+=da;
    persistFurniture(child);
   });
  }
  function persistFurniture(item){
   s.furnitureLayout=s.furnitureLayout||{};
   s.furnitureLayout[item.room]=s.furnitureLayout[item.room]||{};
   s.furnitureLayout[item.room][item.id]=item.wallAxis?{wallSide:item.wallSide,offset:wallOffset(item),y:item.group.position.y}:{x:item.group.position.x,y:item.group.position.y,z:item.group.position.z,rotation:item.group.rotation.y,supportId:item.supportId||null};
   s.roomPositions=s.roomPositions||{};s.roomPositions[item.room]=s.roomPositions[item.room]||{};
   s.roomPositions[item.room][item.id]=[item.group.position.x,item.group.position.z];
   if(item.owned&&s.placedFurniture){const saved=s.placedFurniture.find(x=>x.id===item.id);if(saved){saved.x=item.group.position.x;saved.y=item.group.position.y;saved.z=item.group.position.z;saved.rotation=item.group.rotation.y;saved.supportId=item.supportId||null;if(item.wallAxis){saved.wallSide=item.wallSide;saved.wallOffset=wallOffset(item)}}}
   save();
  }
  function selectFurniture(item){
   selectedFurniture=item;rotateFurnitureButton.disabled=!!item.wallAxis;
   toast('已选中'+item.name);
  }
  const rotateFurnitureButton=document.createElement('button');
  rotateFurnitureButton.type='button';rotateFurnitureButton.id='rotateFurnitureButton';rotateFurnitureButton.textContent='↻ 旋转 15°';rotateFurnitureButton.disabled=true;
  rotateFurnitureButton.onclick=()=>{
   const item=selectedFurniture;if(!item){toast('请先选中一件家具');return}
   const next=item.group.rotation.y+Math.PI/12;
   if(!canPlaceFurniture(item,item.group.position.x,item.group.position.z,next)){toast('这个方向会超出房间或与其他家具碰撞');return}
   const ox=item.group.position.x,oy=item.group.position.y,oz=item.group.position.z,oa=item.group.rotation.y;
   item.group.rotation.y=next;moveSupportedFurniture(item,ox,oy,oz,oa);persistFurniture(item);updateFurnitureHotspots();
  };
  function updateFurnitureHotspots(){
   const rect=stage.getBoundingClientRect();
   for(const item of furnitureRegistry){
    const b=item.button;if(!b)continue;
    if(item.room!==roomMode||!item.group.visible){b.style.visibility='hidden';continue}
    item.group.updateWorldMatrix(true,false);
    if(item.wallAxis){
     const wallY=item.group.position.y+(item.wallAnchorY??(item.anchor[1]||2.55));
     if(item.wallSide==='back')hotspotWorld.set(item.group.position.x,wallY,item.group.position.z+.12);
     else if(item.wallSide==='front')hotspotWorld.set(item.group.position.x,wallY,item.group.position.z-.12);
     else if(item.wallSide==='left')hotspotWorld.set(item.group.position.x+.12,wallY,item.group.position.z);
     else hotspotWorld.set(item.group.position.x-.12,wallY,item.group.position.z);
    }
    else{const a=item.anchor,co=Math.cos(item.group.rotation.y),si=Math.sin(item.group.rotation.y);hotspotWorld.set(item.group.position.x+a[0]*co+a[1]*si,a[2]||1.05,item.group.position.z-a[0]*si+a[1]*co);}
    const p=hotspotWorld.project(camera);
    const visible=p.z>=-1&&p.z<=1&&Math.abs(p.x)<=1.08&&Math.abs(p.y)<=1.08;
    b.style.visibility=visible?'visible':'hidden';
    if(visible){
     b.style.left=((p.x+1)*.5*rect.width)+'px';b.style.top=((1-p.y)*.5*rect.height)+'px';
     b.style.right='auto';b.style.bottom='auto';b.style.transform='translate(-50%,-50%)';
    }
   }
  }
  function setRoom(mode){
   roomMode=mode==='kitchen'||mode==='bedroom'?mode:'living';
   living.visible=roomMode==='living';bedroom.visible=roomMode==='bedroom';kitchen.visible=roomMode==='kitchen';
   const colors={living:0xd9d7d1,bedroom:0xd2d3d2,kitchen:0xd9d7d1};scene.background.set(colors[roomMode]);
   cameraTarget.set(0,1,roomMode==='kitchen'?-1:0);
   targetTheta=roomMode==='bedroom'?.55:roomMode==='kitchen'?.78:.68;targetPhi=1.08;targetRadius=roomMode==='bedroom'?12.7:13.4;applyCamera();
  }
  function updateActivity(a){
   const act=normalizeActivity(a),meta=activityMeta[act]||{location:'center',pose:'wave'};
   activeActivity=act;
   const loc=act==='sleep'?'bed':(['cook','cookTogether'].includes(act)?'kitchen':meta.location);
   const characterRoom=act==='sleep'?'bedroom':(['cook','cookTogether'].includes(act)?'kitchen':'living');
   person.visible=characterRoom===roomMode;
   let p=positions[loc]||positions.center;if(act==='sitChair'){const chair=furnitureRegistry.find(it=>(it.name==='椅子'||it.name==='餐桌椅')&&it.room===roomMode);if(chair){const offset=new T.Vector3(0,0,-.58).applyAxisAngle(new T.Vector3(0,1,0),chair.group.rotation.y);p=[chair.group.position.x+offset.x,0,chair.group.position.z+offset.z]}}target.set(...p);pose=meta.pose||'wave';if(act==='rest'||act==='company'||act==='sitChair')person.rotation.y=Math.PI;basePose=pose;walkRoute=[];walkIndex=0;walkPauseUntil=0;
   if(act==='walk'){walkRoute=['outside','window','rug','sofa','center'].map(k=>positions[k]);walkIndex=0;target.set(...walkRoute[0]);pose='walk'}
   if(act==='idle'){pose='idle';idleNextMove=performance.now()+1800;idleNextGesture=performance.now()+6500+Math.random()*4000;idleGestureUntil=0}
   rig.rotation.set(0,0,0);rig.position.set(0,0,0);if(act==='sleep')rig.rotation.set(-Math.PI/2,Math.PI,0);
   body.position.y=pose==='sit' ? -.12:0;
   legs.forEach(l=>{l.hip.rotation.x=pose==='sit'?-1.15:pose==='sleep'?-1.35:0;l.knee.rotation.x=pose==='sit'?1.45:pose==='sleep'?1.5:0});
   arms.forEach((a,i)=>{a.shoulder.rotation.z=(pose==='wave'&&i===1)?-.85:(pose==='sit'?.15:0);a.elbow.rotation.x=pose==='sit'?-1.05:pose==='sleep'?-1.25:0});
  }
  // One-finger orbit and two-finger pinch work on iPad; mouse drag and wheel work too.
  const pointers=new Map();let drag=null,pinchStart=0,pinchRadius=radius,pinchCenter=null,pinchAngle=0,doorTap=null,inertiaTheta=0,inertiaPhi=0,dragVelocityTheta=0,dragVelocityPhi=0,lastPointerTime=0;
  let selectedFurniture=null,furnitureDrag=null;
  const floorPlane=new T.Plane(new T.Vector3(0,1,0),0),dragPoint=new T.Vector3(),dragOffset=new T.Vector3();
  const raycaster=new T.Raycaster(),pointerNdc=new T.Vector2();
  // Camera gestures are handled by the stage, not the canvas. The canvas itself
  // is click-through so it can never steal taps from the footer or room controls.
  const canvas=renderer.domElement,gestureSurface=stage;
  canvas.style.touchAction='none';canvas.style.pointerEvents='none';
  gestureSurface.style.touchAction='none';
  gestureSurface.addEventListener('pointerdown',e=>{
   if(e.target.closest('button:not(.furniture-hotspot),[role="button"],input,select,textarea,a,.calendar-view,.drawer,.decorate-tools'))return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   const rect=stage.getBoundingClientRect();pointerNdc.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   raycaster.setFromCamera(pointerNdc,camera);
   const activeRoom=roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:living;
   const hits=raycaster.intersectObjects(activeRoom.children,true);
   if(decorating){
    let furniture=null;
    for(const hit of hits){let node=hit.object;while(node&&node!==activeRoom){if(node.userData?.furnitureKey){furniture=node;break}node=node.parent}if(furniture)break}
    if(furniture){
     const item=furnitureRegistry.find(x=>x.group===furniture);
     if(item){
      selectFurniture(item);
      const plane=item.wallAxis?(item.wallSide==='back'||item.wallSide==='front'?new T.Plane(new T.Vector3(0,0,1),-furniture.position.z):new T.Plane(new T.Vector3(1,0,0),-furniture.position.x)):new T.Plane(new T.Vector3(0,1,0),-furniture.position.y);
      if(raycaster.ray.intersectPlane(plane,dragPoint)){
       dragOffset.copy(furniture.position).sub(dragPoint);furnitureDrag={pointerId:e.pointerId,group:furniture,item,plane,initial:furniture.position[item.wallAxis||'x'],offsetX:furniture.position.x-dragPoint.x,offsetZ:furniture.position.z-dragPoint.z,wallOffsetDelta:item.wallAxis?wallOffset(item)-(item.wallSide==='back'||item.wallSide==='front'?dragPoint.x:dragPoint.z):0,wallYOffset:item.wallAxis?furniture.position.y-dragPoint.y:0};
       gestureSurface.setPointerCapture(e.pointerId);e.preventDefault();return;
      }
     }
    }
   }
   let targetRoom=null;
   for(const hit of hits){let node=hit.object;while(node&&node!==activeRoom){if(node.userData?.roomTarget){targetRoom=node.userData.roomTarget;break}node=node.parent}if(targetRoom)break}
   gestureSurface.setPointerCapture(e.pointerId);
   if(targetRoom){doorTap={target:targetRoom,pointerId:e.pointerId,x:e.clientX,y:e.clientY};e.preventDefault();return}
   doorTap=null;inertiaTheta=0;inertiaPhi=0;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1)drag={x:e.clientX,y:e.clientY};
   if(pointers.size===2){const p=[...pointers.values()];pinchStart=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);pinchRadius=targetRadius;pinchCenter={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};pinchAngle=Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x)}
   lastPointerTime=e.timeStamp;e.preventDefault();
  });
  gestureSurface.addEventListener('pointermove',e=>{
   if(furnitureDrag&&furnitureDrag.pointerId===e.pointerId){
    const rect=stage.getBoundingClientRect();pointerNdc.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointerNdc,camera);
    if(raycaster.ray.intersectPlane(furnitureDrag.plane,dragPoint)){
     const g=furnitureDrag.group,item=furnitureDrag.item;
     if(item.wallAxis){
      const roomGroup=item.room==='bedroom'?bedroom:item.room==='kitchen'?kitchen:living;
      const candidates=[
       {side:'back',plane:new T.Plane(new T.Vector3(0,0,1),3.89),visible:()=>roomGroup.userData.backWall?.visible!==false},
       {side:'front',plane:new T.Plane(new T.Vector3(0,0,1),-3.89),visible:()=>roomGroup.userData.frontWall?.visible!==false},
       {side:'left',plane:new T.Plane(new T.Vector3(1,0,0),5.16),visible:()=>roomGroup.userData.leftWall?.visible!==false},
       {side:'right',plane:new T.Plane(new T.Vector3(1,0,0),-5.16),visible:()=>roomGroup.userData.rightWall?.visible!==false}
      ];
      let best=null;
      for(const candidate of candidates){
       if(!candidate.visible())continue;
       const point=raycaster.ray.intersectPlane(candidate.plane,new T.Vector3());if(!point)continue;
       const offset=(candidate.side==='back'||candidate.side==='front'?point.x:point.z)+furnitureDrag.wallOffsetDelta;
       if(Math.abs(offset)>(candidate.side==='back'||candidate.side==='front'?4.5:3.25))continue;
       if(point.y<.1||point.y>4.7)continue;
       const distance=point.distanceTo(raycaster.ray.origin);if(!best||distance<best.distance)best={side:candidate.side,point,offset,distance};
      }
      if(best&&canPlaceOnWall(item,best.side,best.offset)){
       wallTransform(g,best.side,best.offset,Math.max(.05,Math.min(4.5,best.point.y+furnitureDrag.wallYOffset)));
       item.wallSide=best.side;item.wallAxis=best.side==='back'||best.side==='front'?'x':'z';
      }
     }else{
      const nx=dragPoint.x+furnitureDrag.offsetX,nz=dragPoint.z+furnitureDrag.offsetZ;
      if(item&&canPlaceFurniture(item,nx,nz,g.rotation.y)){const ox=g.position.x,oy=g.position.y,oz=g.position.z,oa=g.rotation.y;g.position.x=nx;g.position.z=nz;moveSupportedFurniture(item,ox,oy,oz,oa)}
     }
    }e.preventDefault();return;
   }
   if(!pointers.has(e.pointerId))return;
   const old=pointers.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y,elapsed=Math.max(8,e.timeStamp-lastPointerTime||16);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1&&drag){
    if(cameraGestureMode==='orbit'){targetTheta-=dx*.0065;targetPhi+=dy*.0045;applyCamera();}
    else{
     camera.updateMatrixWorld(true);
     const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();
     const forward=new T.Vector3(-Math.sin(theta),0,-Math.cos(theta));
     const scale=targetRadius/Math.max(1,stage.clientHeight);
     cameraTarget.addScaledVector(right,-dx*scale);cameraTarget.addScaledVector(forward,dy*scale);
    }
   }
   else if(pointers.size===2){
    const p=[...pointers.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),center={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};
    if(pinchStart>0){targetRadius=pinchRadius*pinchStart/Math.max(1,d);applyCamera()}
    if(pinchCenter){
     camera.updateMatrixWorld(true);
     const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();
     const forward=new T.Vector3(-Math.sin(theta),0,-Math.cos(theta));
     const scale=targetRadius/Math.max(1,stage.clientHeight);
     cameraTarget.addScaledVector(right,-(center.x-pinchCenter.x)*scale);
     cameraTarget.addScaledVector(forward,(center.y-pinchCenter.y)*scale);
     const angle=Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x),deltaAngle=angle-pinchAngle;
     targetTheta-=deltaAngle;pinchAngle=angle;pinchCenter=center;applyCamera();
    }
   }
   lastPointerTime=e.timeStamp;e.preventDefault();
  });
  function endPointer(e){
   if(furnitureDrag&&furnitureDrag.pointerId===e.pointerId){
    const g=furnitureDrag.group,item=furnitureRegistry.find(x=>x.group===g);furnitureDrag=null;
    if(item){persistFurniture(item);toast(item.name+'位置已保存');}
    return;
   }
   if(doorTap&&doorTap.pointerId===e.pointerId){
    const tap=doorTap,dist=Math.hypot(e.clientX-tap.x,e.clientY-tap.y);doorTap=null;
    if(e.type==='pointerup'&&dist<18){
     stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode');
     if(tap.target==='kitchen')stage.classList.add('kitchen-mode');
     if(tap.target==='bedroom')stage.classList.add('bedroom-mode');
     $('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));updateArday3D();
    }
    return;
   }
   pointers.delete(e.pointerId);
   if(pointers.size===0){drag=null;pinchCenter=null;pinchAngle=0;if(e.type==='pointerup'){inertiaTheta=dragVelocityTheta;inertiaPhi=dragVelocityPhi}dragVelocityTheta=0;dragVelocityPhi=0}
   if(pointers.size===1){const p=[...pointers.values()][0];drag={x:p.x,y:p.y}}
  }
  gestureSurface.addEventListener('pointerup',endPointer);gestureSurface.addEventListener('pointercancel',endPointer);
  window.addEventListener('pointerup',e=>{if(pointers.has(e.pointerId))endPointer(e)});
  window.addEventListener('pointercancel',e=>{if(pointers.has(e.pointerId))endPointer(e)});
  gestureSurface.addEventListener('wheel',e=>{
   if(e.target.closest('button,.day-timeline,.calendar-view,.drawer,input,textarea,select'))return;
   targetRadius+=e.deltaY*.012;applyCamera();e.preventDefault();
  },{passive:false});
  function frame(t){const dt=Math.min(.06,(t-last)/1000);last=t;if(pointers.size===0){targetTheta+=inertiaTheta*dt*1000;targetPhi+=inertiaPhi*dt*1000;const damp=Math.exp(-dt*5.2);inertiaTheta*=damp;inertiaPhi*=damp;if(Math.abs(inertiaTheta)<.000002)inertiaTheta=0;if(Math.abs(inertiaPhi)<.000002)inertiaPhi=0;applyCamera()}syncCamera(dt);
   let delta=target.clone().sub(person.position),distance=delta.length(),moving=distance>.075;
   if(moving){const step=Math.min(distance,(pose==='idleWalk'?1.7:1.55)*dt);person.position.add(delta.normalize().multiplyScalar(step));}
   if(pose==='walk'&&activeActivity==='walk'){if(moving)walkPauseUntil=0;else if(!walkPauseUntil)walkPauseUntil=t+650;else if(t>=walkPauseUntil){walkIndex=(walkIndex+1)%walkRoute.length;target.set(...walkRoute[walkIndex]);walkPauseUntil=0;}}
   const roamAllowed=!['sleep','cook','cookTogether','work','eat','wash'].includes(activeActivity);
   if(roamAllowed&&pose!=='idleWalk'&&pose!=='wave'&&!moving&&t>idleNextMove){
    const choices=['sofa','table','window','rug','shelf','center','outside','desk'];
    let pick=positions[choices[Math.floor(Math.random()*choices.length)]];
    if(Math.hypot(pick[0]-person.position.x,pick[2]-person.position.z)<1.1)pick=positions.outside;
    target.set(...pick);pose='idleWalk';idleWalkStartedAt=t;
   }
   if(roamAllowed&&pose==='wave'&&idleGestureUntil&&t>idleGestureUntil){pose=basePose;idleGestureUntil=0;idleNextMove=t+350;}
   if(roamAllowed&&pose!=='idleWalk'&&pose!=='wave'&&!moving&&t>idleNextGesture){pose='wave';idleGestureUntil=t+1500;idleNextGesture=t+5500+Math.random()*3500;}
   if(pose==='idle'&&!moving&&t>idleNextMove){
    const choices=['sofa','table','window','rug','shelf','center','outside','desk'];
    let pick=positions[choices[Math.floor(Math.random()*choices.length)]];
    if(Math.hypot(pick[0]-person.position.x,pick[2]-person.position.z)<1.25)pick=positions.outside;
    target.set(...pick);pose='idleWalk';idleWalkStartedAt=t;
   }
   if(pose==='idleWalk'&&!moving&&distance<.075&&t>idleWalkStartedAt+350){pose=basePose;idleNextMove=t+1800+Math.random()*2600;}
   phase+=dt*(moving?9:2);
   if(moving){legs.forEach((l,i)=>{l.hip.rotation.x=Math.sin(phase+i*Math.PI)*.82;l.knee.rotation.x=Math.max(0,Math.sin(phase+i*Math.PI))*.9});arms.forEach((a,i)=>{a.shoulder.rotation.x=Math.sin(phase+i*Math.PI)*.58;a.shoulder.rotation.z=a.side*Math.sin(phase+i*Math.PI)*.045;a.elbow.rotation.x=-.1+Math.max(0,Math.sin(phase+i*Math.PI))*.08});body.rotation.y=Math.sin(phase)*.035;person.rotation.y+=(Math.atan2(delta.x,delta.z)-person.rotation.y)*(1-Math.exp(-dt*8));}
   else{legs.forEach(l=>{l.hip.rotation.x+=(0-l.hip.rotation.x)*.12;l.knee.rotation.x+=(0-l.knee.rotation.x)*.12});arms.forEach((a,i)=>{const idleArm=pose==='sit'?.04:Math.sin(phase*.55+i*1.7)*.055;a.shoulder.rotation.x+=(idleArm-a.shoulder.rotation.x)*.07;a.elbow.rotation.x+=((pose==='sit'?-.18:Math.sin(phase*.45+i)*.045)-a.elbow.rotation.x)*.07});}
   if(pose==='wave'){arms[1].shoulder.rotation.x=Math.sin(t*.004)*.22;arms[1].shoulder.rotation.z=-.72+Math.sin(t*.002)*.035;arms[1].elbow.rotation.x=-.85+Math.sin(t*.006)*.22}
   body.rotation.z+=(Math.sin(phase*.38)*.018-body.rotation.z)*.05;
   body.rotation.y+=(Math.sin(phase*.24)*.018-body.rotation.y)*.04;
   head.rotation.y+=(Math.sin(phase*.31)*.085-head.rotation.y)*.045;
   head.rotation.x+=(Math.sin(phase*.22)*.025-head.rotation.x)*.04;
   body.position.y+=(Math.sin(t*.0015)*.026-body.position.y)*.08;
   if(t>lastBlink){eyeGroups.forEach(g=>{g.scale.y=.12});setTimeout(()=>eyeGroups.forEach(g=>{g.scale.y=1}),90);lastBlink=t+2400+Math.random()*2600;}
   updateFurnitureHotspots();
   if(t-lastDraw>16){renderer.render(scene,camera);lastDraw=t}
   arday3D.raf=requestAnimationFrame(frame)}
  scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  function cancelGesture(){pointers.forEach((_,id)=>{try{if(gestureSurface.hasPointerCapture(id))gestureSurface.releasePointerCapture(id)}catch(_){}});pointers.clear();drag=null;doorTap=null;pinchStart=0;inertiaTheta=0;inertiaPhi=0;dragVelocityTheta=0;dragVelocityPhi=0}
  arday3D={scene,camera,renderer,host,kitchen,bedroom,living,updateActivity,resize,setRoom,cancelGesture,getRoom:()=>roomMode,selectFurnitureById:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(item)selectFurniture(item)},placeOwnedFurniture:name=>{const item=createOwnedFurniture(name);if(!item)return false;selectFurniture(item);updateFurnitureHotspots();return true},raf:0};
  const decorateTools=document.createElement('div');decorateTools.className='decorate-tools';
  rotateFurnitureButton.textContent='↻';
  rotateFurnitureButton.setAttribute('aria-label','旋转家具 15 度');
  rotateFurnitureButton.title='旋转 15°';
  decorateTools.append(rotateFurnitureButton);stage.appendChild(decorateTools);
  stage.classList.add('three-ready');resize();setRoom('living');updateActivity(s.currentActivity||'idle');
  if(window.ResizeObserver){arday3D.ro=new ResizeObserver(resize);arday3D.ro.observe(stage)}window.addEventListener('resize',resize);
  arday3D.raf=requestAnimationFrame(frame);return true;
 }catch(e){
  console.error('Arday 3D initialization failed:',e);
  if(host&&host.parentNode)host.remove();
  stage.classList.remove('three-ready');
  let status=stage.querySelector('.three-status');
  if(!status){status=document.createElement('div');status.className='three-status';stage.appendChild(status)}
  status.textContent='3D 场景启动失败：'+(e&&e.message?e.message:String(e))+'。当前保留基础场景。';
  return false;
 }
}
function updateArday3D(){
 const stage=$('stage'),mode=stage.classList.contains('kitchen-mode')?'kitchen':stage.classList.contains('bedroom-mode')?'bedroom':'living';
 if(arday3D){arday3D.setRoom(mode);arday3D.updateActivity(s.currentActivity||'idle')}
 else{
  const act=normalizeActivity(s.currentActivity||'idle'),isKitchen=['cook','cookTogether'].includes(act),isBedroom=act==='sleep';
  const livingPerson=$('person'),kitchenPerson=document.querySelector('.kitchen-person');
  if(livingPerson)livingPerson.style.display=(isKitchen||isBedroom)?'none':'';
  if(kitchenPerson)kitchenPerson.style.display=(isKitchen&&mode==='kitchen')?'block':'none';
 }
 const label=$('roomLabel');if(label){label.dataset.room=mode;label.dataset.cameraMode=cameraGestureMode;label.textContent='镜头：'+(cameraGestureMode==='orbit'?'旋转':'平移')+' · '+(mode==='kitchen'?'厨房':mode==='bedroom'?'卧室':'起居室');}
}

ensurePersonalGoal(Date.now());applyOffline();ensureSchedule();s.visits++;initScene();render();renderCalendar();generateDailyEvents();save();
const cameraModeButton=$('roomLabel');
if(cameraModeButton){
 cameraModeButton.dataset.cameraMode='pan';
 cameraModeButton.addEventListener('click',e=>{
  e.preventDefault();e.stopPropagation();
  cameraGestureMode=cameraGestureMode==='pan'?'orbit':'pan';
  cameraModeButton.dataset.cameraMode=cameraGestureMode;
  const room=cameraModeButton.dataset.room==='bedroom'?'卧室':cameraModeButton.dataset.room==='kitchen'?'厨房':'起居室';
  cameraModeButton.textContent='镜头：'+(cameraGestureMode==='pan'?'平移':'旋转')+' · '+room;
  cameraModeButton.setAttribute('aria-pressed',cameraGestureMode==='orbit'?'true':'false');
 });
}
initArday3D();updateArday3D();
// Room doors change only the player's viewpoint. Arday's schedule and
// physical location remain controlled by the simulation clock.

tick();
function showCurrentScheduleBubble(){const now=new Date(),ev=eventAt(dayKey(now),now.getHours()),activity=normalizeActivity(ev?.activity||s.currentActivity||'idle'),meta=activityMeta[activity]||{},title=ev?.title||meta.title||'自己的时间';say(title==='自己的时间'?'我正在处理自己的事。':'我正在'+title+'。')}
showCurrentScheduleBubble();
 // Catch up immediately when Safari restores a backgrounded or suspended tab.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();updateArday3D();}});
 window.addEventListener('pageshow',()=>{tick();updateArday3D();});
 window.addEventListener('pagehide',()=>{save();});
 setInterval(tick,30000);
 setInterval(()=>{const key=keyAt(Date.now());if(s.calendar?.anchor!==key){ensureScheduleAt(Date.now());save();renderCalendar()}render();initScene()},60000);

})();
