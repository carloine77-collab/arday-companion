(()=>{const bind=()=>{const close=document.getElementById('drawerClose');if(close&&!close.dataset.bound){close.dataset.bound='1';close.addEventListener('click',()=>{document.getElementById('drawer')?.classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'))})}};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind()})();






(()=>{
const {activityMeta,shopCatalog,recipes,ingredientNames,furnitureActivities,bookCategories}=window.ArdayGameConfig;
const characterStats=window.ArdayGameConfig.characterStats||{};
const energyConfig=characterStats.energy||{};const energyEffects=energyConfig.activityEffects||{};const needDecay=characterStats.needs||{};
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
const base={friend:24,bored:4,hate:0,love:3,energy:78,hunger:62,clean:86,fun:70,combat:35,money:100000,items:[],furniture:['茶几','窗户','植物','冰箱','灶台','水槽'],pantry:{rice:1,egg:2,vegetable:2,tomato:1},preferences:{},memories:[],events:[],mealPrepMisses:0,mealMissedKeys:[],statusBuffs:{},visits:0,last:Date.now(),lastTick:Date.now(),calendar:null,room:{sofa:0,window:0,table:0},activityLog:[],lastHourKey:''};
let s={...base};
let selectedCalendarDay=0;try{const old=JSON.parse(localStorage.getItem('arday-save-v2')||'null');if(old){s={...base,...old};if(typeof old.money!=='number')s.money=typeof old.coins==='number'?old.coins*10:30000;if(!old.testFundsV3){s.money=100000;s.testFundsV3=true;}}}catch(e){} delete s.coins;
s.preferences=Object.fromEntries(Object.entries(s.preferences&&typeof s.preferences==='object'?s.preferences:{}).map(([key,value])=>[key,Math.max(0,Math.min(10,Number(value)||0))]));s.preferenceUpdatedAt=Number(s.preferenceUpdatedAt)||Date.now();delete s.personality;s.memories=s.memories||[];

// Infinite-instance progression: one currency (points) powers both ranking and exchange.
s.attributes=s.attributes&&typeof s.attributes==='object'?s.attributes:{agility:35,strength:35,intelligence:35,perception:35,willpower:35};
['agility','strength','intelligence','perception','willpower'].forEach(k=>s.attributes[k]=clamp(Number(s.attributes[k]??35)));
s.combat=Math.round((s.attributes.agility+s.attributes.strength+s.attributes.intelligence+s.attributes.perception+s.attributes.willpower)/5);
s.teamRoster=Array.isArray(s.teamRoster)?s.teamRoster:[{id:'lin',name:'林澈',role:'前锋',combat:72,malice:12,selected:true,portrait:'⚔'},{id:'mori',name:'森',role:'侦察',combat:58,malice:8,selected:true,portrait:'⌕'},{id:'qiao',name:'乔',role:'支援',combat:46,malice:38,selected:false,portrait:'✦'}];
s.teamRoster.forEach(m=>{m.combat=clamp(Number(m.combat)||0);m.malice=clamp(Number(m.malice)||0)});if(s.teamRoster.length>8)s.teamRoster=s.teamRoster.slice(0,8);
s.recruitmentInvites=s.recruitmentInvites&&typeof s.recruitmentInvites==='object'?s.recruitmentInvites:{};s.factionApplications=s.factionApplications&&typeof s.factionApplications==='object'?s.factionApplications:{};s.factionMembership=s.factionMembership||null;s.factionClues=Array.isArray(s.factionClues)?s.factionClues:[];
s.points=Math.max(0,Math.floor(Number(s.points)||0));
if(!s.leaderboardPopulationV2){if(s.points===0)s.points=100;s.leaderboardPopulationV2=true;}
s.activeDungeon=s.activeDungeon&&s.activeDungeon.status==='active'?s.activeDungeon:null;
if(s.activeDungeon){const m=s.activeDungeon;m.board=m.board||{steps:0,position:0,chanceModifier:0,fatalRisk:false,flags:{},history:[],pending:null};m.mode=m.mode==='board'?'board':'classic';if(m.mode==='classic'&&!Number(m.scheduleEndAt||m.endsAt)){const start=Number(m.startAt)||Date.now();m.scheduleEndAt=Math.floor(start/3600000)*3600000+3600000;m.endsAt=m.scheduleEndAt;}}
s.dungeonHistory=Array.isArray(s.dungeonHistory)?s.dungeonHistory:[];
s.dungeonProgress=s.dungeonProgress&&typeof s.dungeonProgress==='object'?s.dungeonProgress:{};
s.dungeonHistory=Array.isArray(s.dungeonHistory)?s.dungeonHistory:[];
s.dungeonCycleStartedAt=Number(s.dungeonCycleStartedAt)||Number(s.lastDungeonAt)||Date.now();s.nextDungeonDueAt=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||s.dungeonCycleStartedAt)+7*86400000);
s.dungeonUnlocks=Array.isArray(s.dungeonUnlocks)?s.dungeonUnlocks:['F'];
const {DUNGEON_TIERS,DUNGEON_CLEAR_REQUIREMENTS,DUNGEON_BASE_REWARD}=window.ArdayDungeonData;
function highestUnlockedDungeonIndex(){return Math.max(0,...(s.dungeonUnlocks||['F']).map(t=>DUNGEON_TIERS.indexOf(t)).filter(i=>i>=0))}
function highestUnlockedDungeonTier(){return DUNGEON_TIERS[highestUnlockedDungeonIndex()]}
function dungeonTierIndex(t){return Math.max(0,DUNGEON_TIERS.indexOf(t||'F'))}
s.marketRefresh=s.marketRefresh&&typeof s.marketRefresh==='object'?s.marketRefresh:{day:'',count:0};
s.teamRoster.forEach(m=>{if(!DUNGEON_TIERS.includes(m.maxTier))m.maxTier=highestUnlockedDungeonTier()});

s.dungeonStats=s.dungeonStats&&typeof s.dungeonStats==='object'?s.dungeonStats:{};
if(!s.dungeonStats.migrated){
 s.dungeonStats.byTier={};
 DUNGEON_TIERS.forEach(t=>s.dungeonStats.byTier[t]={attempts:0,clears:0,ratings:{},recent:[]});
 (s.dungeonHistory||[]).forEach(r=>{const x=s.dungeonStats.byTier[r.tier];if(!x)return;x.attempts++;if(r.success)x.clears++;x.ratings[r.rating]=(x.ratings[r.rating]||0)+1;x.recent.push({rating:r.rating,success:!!r.success,at:r.at||Date.now()})});
 DUNGEON_TIERS.forEach(t=>s.dungeonStats.byTier[t].recent=s.dungeonStats.byTier[t].recent.slice(-8));
 s.dungeonStats.migrated=true;
}
function recordDungeonStat(result){
 const all=s.dungeonStats.byTier||(s.dungeonStats.byTier={});
 const x=all[result.tier]||(all[result.tier]={attempts:0,clears:0,ratings:{},recent:[]});
 x.attempts++;if(result.success)x.clears++;x.ratings[result.rating]=(x.ratings[result.rating]||0)+1;
 x.recent=Array.isArray(x.recent)?x.recent:[];x.recent.unshift({rating:result.rating,success:!!result.success,at:result.at});x.recent=x.recent.slice(0,8);
}
function dungeonUnlocked(tier){return tier==='F'||DUNGEON_TIERS.indexOf(tier)<=DUNGEON_TIERS.findIndex(x=>x==='F')||s.dungeonUnlocks.includes(tier)}
function refreshDungeonUnlocks(){
 DUNGEON_TIERS.forEach((tier,index)=>{if(index===0)return;const previous=DUNGEON_TIERS[index-1],needed=DUNGEON_CLEAR_REQUIREMENTS[tier]||0;if((Number(s.dungeonProgress[previous])||0)>=needed&&!s.dungeonUnlocks.includes(tier))s.dungeonUnlocks.push(tier)});
}
refreshDungeonUnlocks();
s.mealPrepMisses=Math.max(0,Number(s.mealPrepMisses)||0);s.mealMissedKeys=Array.isArray(s.mealMissedKeys)?s.mealMissedKeys:[];s.statusBuffs=s.statusBuffs&&typeof s.statusBuffs==='object'?s.statusBuffs:{};delete s.attach;delete s.roomCondition;s.events=(s.events||[]).filter(event=>event.type!=='life-repair'&&event.type!=='player-action');if(s.sharedGoal?.id==='room')s.sharedGoal=null;
// Preserve legacy furniture data during schema upgrades. These version flags
// must never be used as a reason to clear player-owned or placed objects.

// One-time migration into canonical entity collections.
const legacyItems=Array.isArray(s.items)?s.items:[];
const legacyOwned=Array.isArray(s.ownedFurniture)?s.ownedFurniture:[];
const legacyPlaced=Array.isArray(s.placedFurniture)?s.placedFurniture:[];
const legacyEntity=(name,kind,index)=>{const parts=name.split('·');return {id:'inv-'+kind+'-legacy-'+index,name,kind,itemId:kind==='furniture'?parts.shift().trim():name,variant:kind==='furniture'?parts.join('·').trim():''}};
const migratedInventory=[
 ...legacyItems.filter(name=>typeof name==='string'&&!['一本旧书','旧书','陶杯','唱片','修理工具'].includes(name)).map((name,index)=>legacyEntity(name,'food',index)),
 ...legacyOwned.filter(name=>typeof name==='string').map((name,index)=>legacyEntity(name,name.startsWith('成品食物·')?'food':'furniture',index))
];
if(!Array.isArray(s.inventory)||(!s.inventory.length&&migratedInventory.length))s.inventory=migratedInventory;
else s.inventory=s.inventory.filter(item=>item&&typeof item==='object'&&typeof item.id==='string'&&typeof item.name==='string');
s.inventory.forEach(item=>{if(!item||typeof item!=='object')return;const parts=item.name.split('·');if(!item.itemId)item.itemId=item.kind==='furniture'?parts.shift().trim():item.name;if(item.variant==null)item.variant=item.kind==='furniture'?parts.join('·').trim():''});
const migratedPlaced=legacyPlaced.filter(item=>item&&typeof item==='object'&&typeof item.name==='string').map((item,index)=>{const kind=item.kind||(item.name.startsWith('成品食物·')?'food':'furniture'),parts=item.name.split('·');return {...item,id:item.id||'legacy-placed-'+(item.room||'unknown')+'-'+index,kind,itemId:item.itemId||(kind==='furniture'?parts.shift().trim():item.name),variant:item.variant??(kind==='furniture'?parts.join('·').trim():'')}});
if(!Array.isArray(s.placed)||(!s.placed.length&&migratedPlaced.length))s.placed=migratedPlaced;
// The old furniture list described built-in scene fixtures, not owned inventory.
const legacySceneFurniture=Array.isArray(s.furniture)?s.furniture:base.furniture.slice();
legacySceneFurniture.filter(name=>typeof name==='string'&&name!=='沙发').forEach((name,index)=>{
 if(s.placed.some(item=>item?.name===name&&item.kind==='scene'))return;
 const room=['冰箱','灶台','水槽'].includes(name)?'kitchen':'living';
 s.placed.push({id:'scene-default-'+index,name,room,kind:'scene'});
});
delete s.items;delete s.ownedFurniture;delete s.placedFurniture;delete s.furniture;

s.furnitureLayout=s.furnitureLayout&&typeof s.furnitureLayout==='object'?s.furnitureLayout:{};
s.roomPositions=s.roomPositions&&typeof s.roomPositions==='object'?s.roomPositions:{};
for(const roomName of ['living','bedroom','kitchen']){
 s.furnitureLayout[roomName]=s.furnitureLayout[roomName]&&typeof s.furnitureLayout[roomName]==='object'?s.furnitureLayout[roomName]:{};
 s.roomPositions[roomName]=s.roomPositions[roomName]&&typeof s.roomPositions[roomName]==='object'?s.roomPositions[roomName]:{};
 // Import legacy transforms for static scene objects into canonical placed entities.
 for(const [id,transform] of Object.entries(s.furnitureLayout[roomName])){
  if(s.placed.some(item=>item?.id===id))continue;
  s.placed.push({id,name:id,room:roomName,kind:'scene',...(transform&&typeof transform==='object'?transform:{})});
 }
 for(const [id,position] of Object.entries(s.roomPositions[roomName])){
  if(s.placed.some(item=>item?.id===id))continue;
  if(Array.isArray(position))s.placed.push({id,name:id,room:roomName,kind:'scene',x:Number(position[0])||0,y:0,z:Number(position[1])||0,rotation:0});
 }
}
delete s.furnitureLayout;delete s.roomPositions;
s.placed.forEach((item,index)=>{
 if(!item||typeof item!=='object')return;
 if(typeof item.name!=='string'||!item.name.trim())return;
 if(!item.id)item.id='legacy-placed-'+(item.room||'unknown')+'-'+index;
 const parts=item.name.split('·');if(!item.kind)item.kind=item.name.startsWith('成品食物·')?'food':'furniture';if(!item.itemId)item.itemId=item.kind==='furniture'?parts.shift().trim():item.name;if(item.variant==null)item.variant=item.kind==='furniture'?parts.join('·').trim():'';
 if(!['living','bedroom','kitchen','bathroom'].includes(item.room))item.room='living';
 if(!Number.isFinite(Number(item.x)))item.x=0;
 if(!Number.isFinite(Number(item.y)))item.y=0;
 if(!Number.isFinite(Number(item.z)))item.z=0;
 if(!Number.isFinite(Number(item.rotation)))item.rotation=0;
});
s.furnitureCatalogVersion=Math.max(2,Number(s.furnitureCatalogVersion)||0);
s.roomFurnishingMigration=Math.max(1,Number(s.roomFurnishingMigration)||0);
s.pantry=s.pantry||{rice:1,egg:2,vegetable:2,tomato:1};s.unlockedRecipes=Array.isArray(s.unlockedRecipes)?s.unlockedRecipes:['eggRice','tomatoEgg','vegetableSoup'];s.room=s.room||{sofa:0,window:0,table:0};s.activityLog=s.activityLog||[];s.revealedTraits=s.revealedTraits||[];
s.jobApplications=s.jobApplications||{};
s.interactionAttempts=s.interactionAttempts&&typeof s.interactionAttempts==='object'?s.interactionAttempts:{};
s.activeInteraction=s.activeInteraction&&typeof s.activeInteraction==='object'?s.activeInteraction:null;
const statKeys=['friend','bored','hate','love','energy','hunger','clean','fun','combat'];
const scheduleEngine=window.ArdayScheduleEngine.create({state:s,furnitureActivities,activityMeta,furnitureKindForPlaced,furnitureRequirementAvailable,hasCookableRecipe,eventAt,writeBlockForKey,renderCalendar,getStage:()=>$('stage'),normalizeActivity});
const {decayActivityPreferences,recordActivityPreference,activityPreferenceScore,furnitureSatisfiesRequirement,hasAutonomyFurniture,autonomousFurnitureOptions,chooseAutonomousActivity,scheduledFurnitureIsValid,resolveScheduledActivity}=scheduleEngine;
function save(){s.last=Date.now();try{localStorage.setItem('arday-save-v2',JSON.stringify(s))}catch(e){}}
function applyBureauDailyGrant(at=Date.now()){
 if(s.factionMembership!=='anomaly-bureau'||!s.lastDungeonResult)return 0;
 const today=keyAt(at);if(s.bureauGrantDate===today)return 0;
 const amount=Math.floor(Math.max(0,Number(s.lastDungeonResult.points)||0)*.4);
 s.bureauGrantDate=today;s.bureauGrantAmount=amount;
 if(amount>0){s.points=(Number(s.points)||0)+amount;addEvent('管理局每日拨款','根据上一次副本结算，管理局发放 '+amount+' 积分（结算积分的 40%）。','daily')}
 save();return amount;
}
function render(){applyDungeonDeadlinePenalty();applyBureauDailyGrant();statKeys.forEach(k=>{let v=$(k+'V'),b=$(k+'B');if(v)v.textContent=['friend','bored','hate','love'].includes(k)?Math.floor(Number(s[k])||0):Math.round(Number(s[k])||0);if(b)b.style.width=(Number(s[k])||0)+'%'});const cp=$('combatPowerV');if(cp)cp.textContent=String(Math.round(Number(s.combat)||0));const ca=$('combatAttributes');if(ca)ca.innerHTML=[['agility','敏捷'],['strength','力量'],['intelligence','智力'],['perception','感知'],['willpower','意志']].map(([k,n])=>{const value=Math.max(0,Math.min(100,Number(s.attributes[k])||0));return '<div class="stat combat-attribute"><label>'+n+'</label><b>'+Math.round(value)+'</b><div class="meter"><i style="width:'+value+'%"></i></div></div>'}).join('');renderStatusTags();renderCurrentSchedulePeek();updateDungeonCountdown();let d=$('date');if(d)d.textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})+' · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});let cash=$('cash');if(cash)cash.textContent='共同账户 ¥'+s.money;if(typeof refreshTopActions==='function')refreshTopActions();}
function renderCurrentSchedulePeek(){
 const node=$('currentSchedulePeek');if(!node)return;
 const now=new Date();ensureScheduleAt(now);
 const hourStart=new Date(now);hourStart.setMinutes(0,0,0);
 const pad=n=>String(n).padStart(2,'0');
 const esc=value=>String(value||'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
 const rows=[0,1,2].map(offset=>{
  const time=new Date(hourStart.getTime()+offset*3600000),key=dayKey(time),hour=time.getHours(),ev=eventAt(key,hour);
  const activity=ev?.activity||(offset===0?s.currentActivity:'idle')||'idle';
  const title=ev?.title||activityLabel(activity)||'自由时间';
  const label=offset===0?'现在':('+'+offset+' 小时');
  return '<div class="current-schedule-item '+(offset===0?'is-current':'')+'"><div class="current-schedule-time"><b>'+label+'</b><small>'+pad(hour)+':00</small></div><strong>'+esc(title)+'</strong></div>';
 }).join('');
 node.innerHTML=rows;
}
function renderStatusTags(){const emotion=$('emotionStatuses'),survival=$('survivalStatuses');const tags=[];if(s.statusBuffs?.depressed?.active)tags.push({group:'emotion',label:'沮丧',kind:'depressed'});if(s.statusBuffs?.sick?.active)tags.push({group:'survival',label:'生病',kind:'sick'});const draw=(node,group)=>{if(!node)return;const items=tags.filter(tag=>tag.group===group);node.innerHTML=items.map(tag=>'<span class="status-tag '+tag.kind+'">'+tag.label+'</span>').join('')};draw(emotion,'emotion');draw(survival,'survival');}
let dialogueTimer=null;
function say(t,type='character'){const b=$('dialogue');if(!b)return;document.querySelectorAll('.bubble,.dialogue-pill').forEach(node=>{if(node!==b)node.remove()});const raw=String(t||'');const message=type==='system'?raw:'“'+raw+'”';b.textContent=message;Object.assign(b.style,{display:'block',position:'absolute',left:'50%',top:'12px',zIndex:'45',transform:'translateX(-50%)',maxWidth:'min(72%,380px)',padding:'8px 14px',background:'#fff9edee',border:'1px solid #e0ceb3',borderRadius:'15px 15px 15px 5px',color:'#514334',fontSize:'12px',lineHeight:'1.45',textAlign:'center',boxShadow:'0 5px 16px #493a2926',pointerEvents:'none',opacity:'1',animation:'none'});clearTimeout(dialogueTimer);dialogueTimer=setTimeout(()=>{if(b.textContent===message)b.style.display='none'},20000)}
function saySystem(t){say(t,'system')}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),1900)}
function remember(type,text,weight=1){s.memories.push({type,text,at:Date.now(),weight});if(s.memories.length>40)s.memories.shift()}
function change(delta){Object.entries(delta).forEach(([k,v])=>{if(k in s)s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)+Number(v||0)))})}
function dayAnchor(){return dayAnchorAt(Date.now())}
function dayKey(value){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))throw new TypeError('dayKey expects a valid Date or timestamp');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function plusDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}
function dayLabel(d){return d.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',weekday:'short'})}
function eventAt(key,h){return (s.calendar?.days?.[key]||[]).find(e=>h>=e.start&&h<e.end)}
function has(item){const matches=name=>name===item||name.startsWith(item+'·');return s.inventory.some(x=>matches(x.name))||(s.placed||[]).some(x=>typeof x.name==='string'&&matches(x.name))}
function eventCategory(e){if(e?.category)return e.category;const type=e?.type||'daily';if(type==='arday-letter')return 'letter';if(type==='autonomous'||type==='system-note'||type==='daily')return 'system';if(type==='shared-goal-proposal'||type==='long')return 'proposal';if(type==='player-action')return 'player';if(type.startsWith('life-'))return 'random';return 'system'}
function addEvent(title,detail,type='daily',choices=[]){if(type==='player-action')return null;let e={id:Date.now()+Math.random(),title,detail,type,category:eventCategory({type}),choices,created:Date.now(),status:'open'};s.events.unshift(e);s.events=s.events.slice(0,12);return e}
function completeEvent(e,choice){e.status='resolved';e.choice=choice;remember('event',e.title+'：'+choice,2)}








const tabs={'物品':[],'商店':[]};

let shopCategory='食物食材';let shopBookType='菜谱';
let inventoryCategory='全部';
let inventoryGrid=null;
let shopFurnitureGroup='坐卧类';
let shopFurnitureType='沙发';
const furnitureNameById={'buy-furniture-television':'电视','buy-furniture-record-player':'唱片机','buy-furniture-rug-persian':'地毯·波斯绛红','buy-furniture-rug-checker':'地毯·奶油棋盘','buy-furniture-rug-sea':'地毯·海盐蓝','buy-kitchen-stove-enamel':'灶台·复古珐琅','buy-kitchen-stove-steel':'灶台·不锈钢','buy-kitchen-stove-cream':'灶台·奶油陶瓷','buy-furniture-sofa-linen':'沙发·亚麻燕麦','buy-furniture-sofa-blue':'沙发·雾蓝绒布','buy-furniture-rug':'地毯','buy-furniture-sofa':'沙发·复古高背','buy-furniture-art':'壁画','buy-furniture-divider':'隔断','buy-furniture-palm':'棕榈树绿植','buy-furniture-bookshelf':'书架·开放格架','buy-furniture-bookshelf-glass':'书架·玻璃门书柜','buy-furniture-desk':'书桌·经典书桌','buy-furniture-desk-drawer':'书桌·抽屉工作台','buy-furniture-chair':'椅子·温莎木椅','buy-furniture-chair-rattan':'椅子·藤编餐椅','buy-furniture-computer':'电脑','buy-furniture-dining-table':'餐桌','buy-furniture-dining-table-oak':'餐桌·浅橡木长桌','buy-furniture-dining-chair':'椅子·软包扶手椅','buy-furniture-bouquet':'捧花摆件','buy-bedroom-bed':'床·胡桃木软包','buy-bedroom-bed-oak':'床·浅橡木框架','buy-bedroom-nightstand':'床头柜','buy-bedroom-lamp':'台灯·蘑菇','buy-bedroom-lamp-ceramic':'台灯·陶瓷折线','buy-bedroom-wall-lamp':'壁灯·黄铜双臂','buy-bedroom-wall-lamp-single':'壁灯·单臂','buy-bedroom-ceiling-lamp':'吊灯·乳白玻璃','buy-bedroom-ceiling-lamp-metal':'吊灯·锥形金属','buy-floor-lamp-paper':'落地灯·纸罩','buy-floor-lamp-arc':'落地灯·黄铜弧形','buy-bedroom-wardrobe':'衣柜','buy-bedroom-rug':'地毯·卧室款','buy-kitchen-cabinets':'橱柜','buy-kitchen-wall-cabinet':'吊柜','buy-kitchen-fridge':'冰箱','buy-kitchen-stove':'灶台','buy-kitchen-sink':'水槽','buy-furniture-sofa-sage':'沙发·鼠尾草绿','buy-furniture-sofa-wool':'沙发·暖灰羊毛','buy-furniture-coffee-table-walnut':'茶几·胡桃木抽屉','buy-furniture-coffee-table-round':'茶几·圆形浅橡木','buy-furniture-coffee-table-stone':'茶几·米白石材','buy-furniture-side-table-brass':'边桌·黄铜圆桌','buy-furniture-side-table-walnut':'边桌·深木方桌','buy-furniture-tv-console-oak':'电视柜·浅橡木','buy-bedroom-bed-cream':'床·奶油软包','buy-bedroom-nightstand-rattan':'床头柜·藤编抽屉','buy-furniture-dresser-walnut':'斗柜·胡桃木四抽','buy-furniture-dresser-cream':'斗柜·奶油三抽','buy-furniture-vanity':'梳妆台·复古木质','buy-furniture-full-mirror':'全身镜·黄铜拱形','buy-furniture-desk-ash':'书桌·白蜡木极简','buy-furniture-desk-walnut':'书桌·深胡桃木复古','buy-furniture-bookshelf-ash':'书架·白蜡木开放格','buy-furniture-bookshelf-walnut':'书架·深胡桃木书柜','buy-furniture-reading-chair':'阅读椅·奶油弧背','buy-furniture-office-chair':'办公椅·黑色网布','buy-furniture-sideboard-oak':'餐边柜·浅橡木','buy-furniture-lamp-amber':'台灯·琥珀玻璃','buy-furniture-floor-lamp-tripod':'落地灯·黑色三脚','buy-furniture-pendant-rattan':'吊灯·藤编圆罩','buy-furniture-vase-terracotta':'花瓶·陶土枝叶','buy-furniture-wall-clock':'挂钟·胡桃木圆钟','buy-furniture-curtain-linen':'窗帘·亚麻白','buy-furniture-rug-ivory':'地毯·羊毛米白','buy-furniture-catalog-045':'默认窗户','buy-furniture-catalog-023':'默认室内木门','buy-furniture-door-glass':'白橡木玻璃门','buy-furniture-door-cream':'奶油法式双线门','buy-furniture-door-rattan':'藤编门','buy-furniture-door-sliding':'深色格栅推拉门','buy-furniture-door-arch':'复古拱顶门'};
Object.entries(shopCatalog.furnitureCategories||{}).forEach(([,types])=>Object.values(types||{}).forEach(items=>(items||[]).forEach(([label,,id])=>{if(id&&id.startsWith('buy-furniture-'))furnitureNameById[id]=label})));

function addInventoryItem(name,kind='food',id=null){const parts=name.split('·'),entity={id:id||('inv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)),name,kind,itemId:kind==='furniture'?parts.shift().trim():name,variant:kind==='furniture'?parts.join('·').trim():''};s.inventory.push(entity);return entity}
function addItem(name){return addInventoryItem(name,'food')}
function purchase(id,label,cost){
 if(s.money<cost){toast('¥不足');return}
 if(id.startsWith('buy-wallpaper-')||id.startsWith('buy-floor-')){if(!arday3D?.applyRoomFinish){toast('房间装修系统尚未就绪');return}s.money-=cost;arday3D.applyRoomFinish(id);const scope=id.startsWith('buy-wallpaper-')?'全屋墙面':'当前房间地面';addEvent('你更换了房间饰面',label+'已应用于'+scope+'。','player-action');remember('purchase','房间装修：'+label,2);saySystem('已经换上新的'+label+'。');save();render();toast('装修完成：'+label);openTab('商店',true);return}
 if(id.startsWith('buy-recipe-')){
  const recipeId=id.slice('buy-recipe-'.length);
  if(!recipes[recipeId]){toast('菜谱信息不存在');return}
  if((s.unlockedRecipes||[]).includes(recipeId)){toast('这本菜谱已经收藏');return}
  s.money-=cost;s.unlockedRecipes=s.unlockedRecipes||[];s.unlockedRecipes.push(recipeId);
  addEvent('你购入了一本菜谱',label+'已加入家庭藏书。','player-action');
  remember('purchase','购入菜谱：'+label,2);save();render();toast('已解锁：'+recipes[recipeId].name);openTab('商店',true);return;
 }
 if(id.startsWith('buy-furniture-')||id.startsWith('buy-bedroom-')||id.startsWith('buy-kitchen-')||id.startsWith('buy-floor-lamp-')){
  const furnitureName=furnitureNameById[id];if(!furnitureName){toast('商品信息不存在');return}
  s.money-=cost;addInventoryItem(furnitureName,'furniture');addEvent('你购入了一件家具',label+'已放入物品栏。','player-action');
  remember('purchase',label,2);save();render();toast('购入：'+label);return;
 }
 s.money-=cost;
 if(id==='buy-food')addItem('点心');
 

 addEvent('你添置了生活用品',label+'已收入物品栏。','player-action');saySystem('买下了'+label+'。这会给我们的生活带来一点变化。');remember('purchase',label,2);save();render();toast('购入：'+label);openTab('商店',true);
}
function openTab(name,force=false){
 const active=document.querySelector('.tool.active')?.dataset.tab;
 if(!force&&active===name&&((name==='日程'&&$('stage').classList.contains('calendar-mode'))||(name!=='日程'&&$('drawer').classList.contains('open')))){if(arday3D?.cancelGesture)arday3D.cancelGesture();closeCalendar();$('drawer').classList.remove('open','profile-expanded');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));return}
 if(name==='日程'){openCalendar();return}
 if(name==='目标'){closeCalendar();showGoals();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='目标'));return}
 if(name==='账户'){closeCalendar();showCollection();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='账户'));return}
 if(name==='职业'){closeCalendar();showCareer();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='职业'));return}
 $('drawer').classList.remove('profile-expanded','furniture-drawer');
 $('drawer').querySelector('.furniture-close')?.remove();
 const displayName=name==='物品'?'背包':name;
 $('drawerTitle').textContent=displayName+' · ¥'+s.money;$('choices').innerHTML='';$('choices').className='choices';$('drawer').classList.toggle('shop-drawer',name==='商店');
 let shopGrid=null;
 if(name==='商店'){
  $('choices').classList.add('shop-content');
  const nav=document.createElement('div');nav.className='shop-categories';
  ['食物食材','家具','书籍'].forEach(category=>{const button=document.createElement('button');button.type='button';button.className='shop-category'+(shopCategory===category?' active':'');button.textContent=category;button.onclick=()=>{shopCategory=category;openTab('商店',true)};nav.appendChild(button)});
  const shopMasthead=document.createElement('section');shopMasthead.className='shop-masthead';shopMasthead.innerHTML='<div class="shop-kicker">ARDAY JOURNAL <span>HOME & LIVING</span></div><div class="shop-coverline"><span class="shop-cover-number">№ 08</span><span class="shop-cover-season">THE ART OF<br>EVERYDAY LIVING</span></div><div class="shop-cover-title">Objects<br><i>with a story.</i></div><div class="shop-cover-note"></div><div class="shop-cover-stamp">A HOME<br>IN THE<br>MAKING</div>'; 
  $('choices').appendChild(shopMasthead);
  $('choices').appendChild(nav);
  if(shopCategory==='书籍'){
   const groups=bookCategories||{};
   if(!groups[shopBookType])shopBookType=Object.keys(groups)[0]||'';
   const typeNav=document.createElement('div');typeNav.className='shop-level-two';
   Object.keys(groups).forEach(type=>{const button=document.createElement('button');button.type='button';button.className='shop-furniture-type'+(shopBookType===type?' active':'');button.textContent=type;button.onclick=()=>{shopBookType=type;openTab('商店',true)};typeNav.appendChild(button)});
   $('choices').appendChild(typeNav);
  }
  if(shopCategory==='家具'){
   const groups=shopCatalog.furnitureCategories||{};
   if(!groups[shopFurnitureGroup])shopFurnitureGroup=Object.keys(groups)[0]||'';
   const groupNav=document.createElement('div');groupNav.className='shop-level-one';
   Object.keys(groups).forEach(group=>{const button=document.createElement('button');button.type='button';button.className='shop-group'+(shopFurnitureGroup===group?' active':'');button.textContent=group;button.onclick=()=>{shopFurnitureGroup=group;shopFurnitureType=Object.keys(groups[group]||{})[0]||'';openTab('商店',true)};groupNav.appendChild(button)});
   $('choices').appendChild(groupNav);
   const types=groups[shopFurnitureGroup]||{};
   const typeAliases={'书架':'书柜','书柜':'书柜','餐椅':'椅子','椅子':'椅子','壁画':'装饰画','海报':'装饰画','照片墙':'装饰画'};
   const typeGroups={};Object.entries(types).forEach(([type,items])=>{const displayType=typeAliases[type]||type;(typeGroups[displayType]||(typeGroups[displayType]=[])).push(...(items||[]))});
   shopFurnitureType=typeAliases[shopFurnitureType]||shopFurnitureType;
   if(!typeGroups[shopFurnitureType])shopFurnitureType=Object.keys(typeGroups)[0]||'';
   const typeNav=document.createElement('div');typeNav.className='shop-level-two';
   Object.keys(typeGroups).forEach(type=>{const button=document.createElement('button');button.type='button';button.className='shop-furniture-type'+(shopFurnitureType===type?' active':'');button.textContent=type;button.onclick=()=>{shopFurnitureType=type;openTab('商店',true)};typeNav.appendChild(button)});
   $('choices').appendChild(typeNav);
  }
  const search=document.createElement('input');search.type='search';search.className='shop-search';search.placeholder=shopCategory==='书籍'?'搜索菜谱或料理名称':shopCategory==='食物食材'?'搜索食材或食品':'搜索家具、类别或风格';search.setAttribute('aria-label','搜索商店商品');$('choices').appendChild(search);
  shopGrid=document.createElement('div');shopGrid.className='shop-product-grid';$('choices').appendChild(shopGrid);
  search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();shopGrid.querySelectorAll('.shop-product-card').forEach(card=>{card.hidden=!!q&&!card.dataset.search.includes(q)})});
 }
 const tabEntries=name==='商店'?(shopCategory==='家具'?[...(Object.entries(shopCatalog.furnitureCategories?.[shopFurnitureGroup]||{}).filter(([type])=>({'书架':'书柜','书柜':'书柜','餐椅':'椅子','椅子':'椅子','壁画':'装饰画','海报':'装饰画','照片墙':'装饰画'}[type]||type)===shopFurnitureType).flatMap(([,items])=>items||[]))]:shopCategory==='书籍'?[...(bookCategories?.[shopBookType]||[])]:[...(shopCatalog[shopCategory]||[])]):[...(tabs[name]||[])];
 
 if(name==='物品'){
  $('choices').className='choices inventory-view';inventoryGrid=document.createElement('div');inventoryGrid.className='inventory-items';
  const itemIcons={'点心':'🥐'};
  s.inventory.forEach((entity,index)=>{const item=entity.name;if(item==='修理工具')return;const category=entity.kind==='furniture'?'家具':entity.kind==='dungeon-item'?'副本道具':'食物';const icon=entity.kind==='dungeon-item'?(entity.icon||'✦'):item==='点心'?'🥐':item.startsWith('成品食物·')?(item.includes('蛋炒饭')?'🍚':item.includes('番茄')?'🍳':'🥣'):'▧';tabEntries.push([item,icon,(category==='家具'?'place-owned-':'use-inventory-')+index,0,'',category])});
  Object.entries(ingredientNames).forEach(([key,label])=>{const count=pantryCount(key);if(count>0)tabEntries.push([label+' ×'+count,'🥬','pantry-inventory-'+key,0,'','食物'])});
  
  const nav=document.createElement('div');nav.className='inventory-categories';
  ['全部','食物','家具','副本道具'].forEach(category=>{const button=document.createElement('button');button.type='button';button.className='inventory-category'+(inventoryCategory===category?' active':'');button.textContent=category;button.onclick=()=>{inventoryCategory=category;openTab('物品',true)};nav.appendChild(button)});
  $('choices').appendChild(nav);$('choices').appendChild(inventoryGrid);const filtered=tabEntries.filter(entry=>inventoryCategory==='全部'||entry[5]===inventoryCategory);tabEntries.length=0;tabEntries.push(...filtered);
 }
 tabEntries.forEach(([label,emoji,id,cost,description])=>{
  let b=document.createElement('button');const isShop=name==='商店';b.className=isShop?'choice shop-product-card':'choice';let owned=(id==='buy-player'&&has('唱片机'))||(id==='buy-desk'&&has('书桌'))||(id==='buy-shelf'&&has('书架'))||(id.startsWith('buy-recipe-')&&(s.unlockedRecipes||[]).includes(id.slice('buy-recipe-'.length)));
  if(isShop){const desc='';b.dataset.search=(label+' '+(shopFurnitureGroup||'')+' '+(shopFurnitureType||'')+' '+(shopBookType||'')).toLowerCase();b.innerHTML='<span class="shop-product-icon">'+emoji+'</span><span class="shop-product-info"><strong>'+label+'</strong></span><span class="shop-product-price">'+(Number(cost)===0?'免费':'¥'+cost)+'</span><span class="shop-product-buy">'+(owned?'已收藏':'购入')+'</span>';}
  else b.innerHTML='<span class="emoji">'+emoji+'</span>'+label+(cost?'<small>'+(owned?'已拥有':cost+' ¥')+'</small>':'');
  b.onclick=()=>{
   if(id.startsWith('pantry-inventory-')){openKitchenPanel(false);return}
   if(id.startsWith('use-inventory-')){
    const index=Number(id.slice('use-inventory-'.length)),entity=s.inventory[index],item=entity?.name;
    if(entity?.kind==='dungeon-item'){useDungeonItem(entity,index);return}
    if(!item){openTab('物品',true);return}
    if(item.startsWith('成品食物·')){
     if(!arday3D?.placeOwnedFurniture){toast('场景尚未就绪，暂时无法取出料理');return}
     s.inventory.splice(index,1);
     if(!arday3D.placeOwnedFurniture(entity)){s.inventory.splice(index,0,entity);save();toast('当前房间没有合适的位置放置料理');return}
     addEvent('你取出了一份料理',item.split('·').slice(1).join('·')+'已摆放在当前房间。','player-action');
     save();saySystem('把料理摆出来了。');toast('料理已取出');openTab('物品',true);return;
    }
    if(item==='点心'){s.inventory.splice(index,1);change({hunger:25,fun:2});say('点心正好派上用场。')}
    save();render();openTab('物品',true);return;
   }
   if(id.startsWith('place-owned-')){
    const index=Number(id.slice('place-owned-'.length)),entity=s.inventory[index],item=entity?.name;
    if(!item){toast('这件物品已不在库存中');openTab('物品',true);return}
    s.inventory.splice(index,1);
    if(!arday3D?.placeOwnedFurniture||!arday3D.placeOwnedFurniture(entity)){s.inventory.splice(index,0,entity);save();toast('当前场景无法放置这件家具');return}
    addEvent('你摆放了一件家具',item+'已放进当前房间。','player-action');save();saySystem('把'+item+'放进房间吧。');openTab('物品',true);return;
   }
   if(id==='kitchen'){openKitchenPanel(false);return}
   if(id.startsWith('buy-ingredient-')){buyIngredient(id,label,+cost);return}
   if(id.startsWith('buy-')){purchase(id,label,+cost);return}
   if(id==='events'){renderEvents();return}
   if(id==='profile'){renderProfile();return}
   if(id==='chat'){perform('chat');}
   else if(id==='collection'){showCollection();return}
   else if(id==='use-food'){let i=s.inventory.findIndex(x=>x.name==='点心');if(i<0){toast('物品栏里没有点心');return}s.inventory.splice(i,1);change({hunger:25,fun:2});say('点心正好派上用场。');}
   else perform(id);
   save();render();$('drawerTitle').textContent=displayName+' · ¥ '+s.money;
  };
  const renderTarget=isShop?shopGrid:(name==='物品'?inventoryGrid:$('choices'));renderTarget.appendChild(b);
 });
 $('drawer').classList.add('open');document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
}

function eventChoicesLegacy(e){
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices event-detail-view note-detail-view';
 $('drawerTitle').textContent=e.category==='letter'?'阿尔的留言':'生活记录';
 const date=new Date(e.created||Date.now()).toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
 const type=e.category==='letter'?'阿尔写给你':'生活记录';
 const paper=document.createElement('article');paper.className='note-paper '+(e.category==='letter'?'personal-note':'system-note');
 const meta=document.createElement('div');meta.className='note-paper-meta';meta.textContent=type+'　·　'+date;
 const heading=document.createElement('h2');heading.className='note-paper-title';heading.textContent=e.title;
 const body=document.createElement('p');body.className='note-paper-body';body.textContent=e.detail;
 const signature=document.createElement('div');signature.className='note-paper-signature';signature.textContent=e.category==='letter'?'— 阿尔':'— 日常记录';
 paper.append(meta,heading,body,signature);
 const actions=document.createElement('div');actions.className='note-detail-actions';
 const back=document.createElement('button');back.type='button';back.className='note-back';back.textContent='返回信箱';back.onclick=renderEvents;
 const ack=document.createElement('button');ack.type='button';ack.className='note-ack';ack.textContent='收好这张纸条';ack.onclick=()=>{completeEvent(e,'已阅');save();renderEvents()};
 actions.append(back,ack);$('choices').replaceChildren(paper,actions);$('drawer').classList.add('open');
}
function renderEvents(){
 $('drawer').classList.remove('furniture-drawer');$('drawer').querySelector('.furniture-close')?.remove();
 const open=s.events.filter(e=>e.status==='open'&&e.type!=='player-action').sort((a,b)=>(b.created||0)-(a.created||0));
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices';
 $('drawerTitle').textContent='信箱';$('choices').className='choices events-view';$('choices').innerHTML='';
 const count=document.createElement('div');count.className='mailbox-count';count.textContent=open.length+' 张';$('choices').appendChild(count);
 if(!open.length){const empty=document.createElement('div');empty.className='event-empty mailbox-empty';empty.innerHTML='<span>✧</span><h3>暂无纸条</h3>';$('choices').appendChild(empty);}
 open.forEach(e=>{
  const isLetter=e.category==='letter';const b=document.createElement('button');b.type='button';b.className='choice event-card '+(isLetter?'letter-card':'system-card');
  const top=document.createElement('span');top.className='note-card-top';
  const kindNode=document.createElement('em');kindNode.className='event-kind '+(isLetter?'letter':'system');kindNode.textContent=isLetter?'阿尔的留言':'日常记录';
  const timeNode=document.createElement('time');timeNode.textContent=new Date(e.created||Date.now()).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});top.append(kindNode,timeNode);
  const titleNode=document.createElement('strong');titleNode.className='note-card-title';titleNode.textContent=e.title;
  const detailNode=document.createElement('small');detailNode.className='note-card-preview';detailNode.textContent=e.detail;
  const arrow=document.createElement('span');arrow.className='event-arrow';arrow.textContent='↗';b.append(top,titleNode,detailNode,arrow);
  b.onclick=()=>eventChoices(e);$('choices').appendChild(b);
 });
 $('drawer').classList.add('open');
}








function closeCalendar(){if(arday3D?.cancelGesture)arday3D.cancelGesture();$('stage').classList.remove('calendar-mode');$('stage').style.touchAction='none';$('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'))}
function slotClick(di,h){
 ensureSchedule();let d=plusDays(dayAnchor(),di),key=dayKey(d),ev=eventAt(key,h);
 $('drawer').classList.add('open');
 if(ev&&!(ev.kind==='autonomous'&&ev.unresolved)){
  $('drawerTitle').textContent=pad(ev.start)+':00 · '+ev.title;
  $('choices').innerHTML='<div class="calendar-actions"><button id="join">问他能否一起</button><button id="move">商量调整时间</button><button id="remove">'+(ev.kind==='autonomous'?'重新安排':'让他自己安排')+'</button><button id="return-existing">返回日程</button></div>';
  $('join').onclick=()=>{let yes=ev.kind!=='routine'&&ev.activity!=='sleep'&&ev.kind!=='work'&&s.energy>18&&s.bored<65&&s.hate<70;if(yes){ev.withPlayer=true;remember('planned','决定一起参与：'+ev.title,1);say('好啊，一起做也不错。')}else if(ev.activity==='sleep'||ev.title.includes('睡眠'))say('现在是我的睡眠时间。我不会为了临时邀请打乱作息。我们可以约在明天醒来以后。');else if(ev.kind==='work')say('我已经答应了这份工作，不能临时把它放下。等结束以后再一起安排吧。');else if(ev.kind==='routine')say('这是我固定的生活安排。我愿意商量，但不想直接取消它。');else say('这件事我想自己完成。等我结束后，我们再一起待一会儿。');save();render();$('drawer').classList.remove('open');renderCalendar();};
  $('move').onclick=()=>{
    const target=prompt('想调整到几点？请输入 0–23 之间的整点。'),n=Number(target),duration=ev.end-ev.start,oldStart=ev.start;
    if(!Number.isInteger(n)||n<0||n+duration>24){toast('这个时间不可用');return}
    const conflict=(s.calendar.days[key]||[]).some(x=>x!==ev&&n<x.end&&n+duration>x.start);
    if(conflict){toast('这个时段已有其他安排');return}
    ev.start=n;ev.end=n+duration;
    s.calendar.days[key].sort((a,b)=>a.start-b.start);save();renderCalendar();$('drawer').classList.remove('open');say('我把安排调整到了 '+pad(n)+':00。')
   };
  $('remove').onclick=()=>{if(ev.kind==='routine'||ev.kind==='sleep'||ev.kind==='work'){say(ev.kind==='work'?'这份工作已经答应下来，不能直接取消。':'这属于我的基本生活安排，我不打算取消。你可以和我商量调整，但不能直接替我决定。');s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'重视自主'])];save();return}if(ev.kind==='autonomous'){const recent=(s.calendar.days[key]||[]).filter(item=>item!==ev&&item.start<ev.start).sort((a,b)=>a.start-b.start).slice(-5).map(item=>item.activity).filter(Boolean);Object.assign(ev,createAutonomousScheduleEvent(ev.start,recent));save();renderCalendar();$('drawer').classList.remove('open');say('我重新安排了这段时间。');return}s.calendar.days[key]=s.calendar.days[key].filter(x=>x!==ev);save();renderCalendar();$('drawer').classList.remove('open');say('好，这段时间我自己决定。')};
  $('return-existing').onclick=()=>{$('drawer').classList.remove('open')};return;
 }
 $('drawerTitle').textContent='自主安排 · '+dayLabel(d)+' '+pad(h)+':00';
 $('choices').innerHTML='<div class="calendar-actions"><button id="return-empty">返回日程</button></div>';
 $('return-empty').onclick=()=>$('drawer').classList.remove('open');
}

$('backRoom')?.remove();
// Navigation listeners are installed before simulation initialization.
$('chatForm').addEventListener('submit',e=>{e.preventDefault();let v=$('message').value.trim();if(!v)return;respondToChat(v);$('message').value='';});
let decorating=false;
$('decorate').onclick=()=>{decorating=!decorating;$('stage').classList.toggle('editing',decorating);$('decorate').textContent=decorating?'完成装修':'✦ 装修';if(decorating){$('drawer').classList.remove('open')}else say('好了。')};
/* Initialization is deliberately deferred until all simulation constants and handlers are defined. */










function respondToChat(text){
 const chatSystem=window.ArdayChatSystem;
 if(!chatSystem||typeof chatSystem.respond!=='function'){
  console.error('Arday chat system failed to load.');
  busyBubble();
  return;
 }
 return chatSystem.respond(text,{
  state:s,
  isUnavailable:ardayUnavailable,
  busyBubble,
  remember,
  say,
  save,
  render
 });
}

function buildDay(key){
 const plans=s.sleepPlans||(s.sleepPlans={});
 const currentEnergy=Math.max(0,Math.min(100,Number(s.energy)||0));
 const recovery=Math.max(.01,Number(energyConfig.sleepRecoveryPerHour)||1);
 const decay=Math.max(0,Number(energyConfig.hourlyDecay)||0);
 const minSleep=Math.max(1,Number(energyConfig.minimumSleepHours)||1),maxSleep=Math.max(minSleep,Number(energyConfig.maximumSleepHours)||12);
 const existingPlan=plans[key];
 const planNeedsRefresh=!existingPlan||Number(existingPlan.recoveryRate)!==recovery||Number(existingPlan.decayRate)!==decay||Number(existingPlan.minimumSleepHours)!==minSleep||Number(existingPlan.maximumSleepHours)!==maxSleep;
 if(planNeedsRefresh){
  const netRecovery=Math.max(.01,recovery-decay);
  const deficit=Math.max(0,100-currentEnergy);
  const duration=Math.min(maxSleep,Math.max(minSleep,Math.ceil(deficit/netRecovery)));
  const bedtime=22,wake=(bedtime+duration)%24;
  plans[key]={bedtime,duration,wake,energyAtPlanning:currentEnergy,recoveryRate:recovery,decayRate:decay,minimumSleepHours:minSleep,maximumSleepHours:maxSleep,plannedAt:Date.now()};
 }
 const p=plans[key],previousDate=plusDays(new Date(key+'T12:00:00'),-1),previousKey=dayKey(previousDate);
 const previous=plans[previousKey]||{duration:8,bedtime:22,wake:6};
 const d=[];
 const add=(start,end,title,kind='routine',activity='idle')=>{if(end>start)d.push({start,end,title,kind,activity})};
 const previousSleepHours=Math.max(0,Number(previous.duration||0)-(24-Number(previous.bedtime??22)));
 if(previousSleepHours>0)add(0,previousSleepHours,'睡眠 · '+previous.duration+'小时','routine','sleep');
 add(7,8,'早餐','routine','eat');
 add(12,13,'午餐','routine','eat');
 add(18,19,'晚餐','routine','eat');
 const tonightSleepEnd=Math.min(24,Number(p.bedtime)+Number(p.duration));
 if(p.duration>0&&tonightSleepEnd>p.bedtime)add(p.bedtime,tonightSleepEnd,'睡眠 · '+p.duration+'小时','routine','sleep');
 const occupied=new Set();
 d.forEach(ev=>{for(let h=Math.max(0,ev.start);h<Math.min(24,ev.end);h++)occupied.add(h)});
 const priorDay=(s.calendar?.days?.[previousKey]||[]).slice().sort((a,b)=>a.start-b.start);
 const recent=[...(s.activityLog||[]).slice(-5).map(item=>item.activity),...priorDay.map(item=>item.activity).filter(activity=>activity&&activity!=='idle')].slice(-5);
 for(let hour=0;hour<24;hour++){
  if(occupied.has(hour)){const prior=d.find(ev=>hour-1>=ev.start&&hour-1<ev.end);if(prior?.activity&&prior.activity!=='idle'){recent.push(prior.activity);if(recent.length>5)recent.shift()}continue}
  const planned=createAutonomousScheduleEvent(hour,recent);d.push(planned);
  if(planned.activity!=='idle'){recent.push(planned.activity);if(recent.length>5)recent.shift()}
 }
 return d.sort((a,b)=>a.start-b.start);
}
function createAutonomousScheduleEvent(hour,recent=[]){
 const choice=chooseAutonomousActivity(recent,hour),activity=normalizeActivity(choice.activity),meta=activityMeta[activity]||{title:'自由时间'};
 return {start:hour,end:hour+1,title:activity==='idle'?'自由时间':(meta.menuLabel||meta.title),kind:'autonomous',activity,autonomous:true,source:'day-ahead',unresolved:false,plannedAt:Date.now(),room:choice.room,anchor:choice.anchor,furnitureId:choice.furnitureId,furnitureKind:choice.furnitureKind};
}
function ensureSchedule(){ensureScheduleAt(Date.now())}

function renderCalendar(){
 ensureSchedule();const anchor=dayAnchor(),d=plusDays(anchor,selectedCalendarDay),key=dayKey(d),now=new Date();
 const labels=['今天','明天','后天'];
 let html='<div class="calendar-editorial-masthead"><div class="calendar-masthead-copy"><span class="calendar-eyebrow">ARDAY COMPANION　 /　 THE DAILY EDITION</span><div class="calendar-display-title">日程<span class="calendar-title-mark"></span></div><div class="calendar-subtitle">A QUIET RECORD OF ORDINARY DAYS</div></div><div class="calendar-date-stamp"><span>ISSUE</span><strong>'+String(d.getDate()).padStart(2,'0')+'</strong><small>'+dayLabel(d)+'</small></div><span class="calendar-ornament calendar-ornament-one"></span><span class="calendar-ornament calendar-ornament-two"></span></div><div class="calendar-day-tabs">'+labels.map((x,i)=>'<button class="'+(selectedCalendarDay===i?'active':'')+'" data-day-select="'+i+'"><span class="calendar-tab-index">0'+(i+1)+'</span><span class="calendar-tab-label">'+x+'</span><small>'+dayLabel(plusDays(anchor,i))+'</small></button>').join('')+'</div>';
 html+='<section class="day-card '+(selectedCalendarDay===0?'today':'')+'"><div class="day-card-head"><strong>'+labels[selectedCalendarDay]+' · '+dayLabel(d)+'</strong></div><div class="day-timeline">';
 for(let hour=0;hour<24;hour++){let ev=eventAt(key,hour),isNow=selectedCalendarDay===0&&now.getHours()===hour;let label=ev?ev.title:'自主安排';html+='<div class="day-slot"><time>'+pad(hour)+':00</time><button class="'+(ev?(ev.kind==='dungeon'?'dungeon':ev.kind==='proposal'?'proposal':ev.activity==='sleep'?'sleep':ev.kind==='work'?'work':'busy'):'free')+(isNow?' now':'')+'" data-day="'+selectedCalendarDay+'" data-hour="'+hour+'">'+label+'</button></div>'}
 html+='</div></section>';
 $('calendarContent').innerHTML=html;
 $('calendarContent').querySelectorAll('[data-day-select]').forEach(b=>b.onclick=()=>{selectedCalendarDay=+b.dataset.daySelect;renderCalendar()});
 $('calendarContent').querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>slotClick(+b.dataset.day,+b.dataset.hour));
}
function renderProfile(){
 const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 $('drawerTitle').textContent='人物档案';
 $('drawer').classList.add('profile-expanded');
 $('choices').innerHTML='<div class="dossier-hero"><div class="dossier-monogram">A</div><div class="dossier-name"><span>CHARACTER FILE</span><h2>Arday <i>·</i> 阿尔</h2></div></div>';
 const stats=s.dungeonStats?.byTier||{},tierRecords=DUNGEON_TIERS.map(t=>{const x=stats[t]||{attempts:0,clears:0,ratings:{},recent:[]},ratings=['SS','S','A','B','C','D'].filter(r=>x.ratings?.[r]).map(r=>'<span class="dungeon-rating-chip rating-'+r+'">'+r+' <b>'+x.ratings[r]+'</b></span>').join(''),recent=(x.recent||[]).slice(0,4).map(r=>'<i class="dungeon-result-mark '+(r.success?'is-clear':'is-fail')+'">'+r.rating+'</i>').join('');return '<article class="dossier-tier-record"><div class="dossier-tier-code">'+t+'</div><div class="dossier-tier-main"><div class="dossier-tier-numbers"><b>'+x.attempts+'</b><small>次挑战</small><span>通关 '+x.clears+'</span></div><div class="dossier-tier-ratings">'+(ratings||'<small class="no-rating">暂无评级</small>')+'</div></div><div class="dossier-tier-recent">'+(recent||'<small>—</small>')+'</div></article>'}).join('');
 $('choices').innerHTML+='<details class="dossier-dungeon-records"><summary><span>DUNGEON RECORD</span><b>副本挑战记录</b><small>累计 '+DUNGEON_TIERS.reduce((n,t)=>n+(stats[t]?.attempts||0),0)+' 次　＋</small></summary><div class="dossier-tier-list">'+tierRecords+'</div></details>';
 $('drawer').classList.add('open');
}
function openCalendar(){selectedCalendarDay=0;ensureSchedule();$('drawer').classList.remove('open','profile-expanded');$('stage').classList.add('calendar-mode');$('stage').style.touchAction='pan-y';renderCalendar();document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab==='日程'))}
function refreshTopActions(){let n=s.events.filter(e=>e.status==='open'&&e.type!=='player-action').length;let c=$('eventCount');if(c)c.textContent=n?'· '+n:''}
$('profileEntry').addEventListener('click',()=>{if($('drawer').classList.contains('open')&&$('drawerTitle').textContent==='人物档案'){$('drawer').classList.remove('open','profile-expanded');return}renderProfile()});
$('recentEvents').addEventListener('click',()=>{if($('drawer').classList.contains('open')&&$('drawerTitle').textContent==='信箱'){$('drawer').classList.remove('open');return}renderEvents()});
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






function rejectActivityProposal(activity){
 const refusals={chat:['稍等，我把手上的事忙完。','抱歉，或许我们应该做点别的事。'],computerPlay:['玩物丧志啊。','你有推荐的游戏？我记下了，之后会玩的。'],walk:['我们一起窝在家里吧。','今天似乎很冷。'],read:['我今天读过书啦，该你读书了。','没什么有趣的书。'],rest:['我可不累，还是说，你想去床上做点别的事？','生前何必久睡，死后自会长眠。']};
 const lines=refusals[activity]||['如果我拒绝你，你会伤心吗？','我很不想拒绝你，但是……'];
 say(lines[Math.floor(Math.random()*lines.length)]);s.rejections=(s.rejections||0)+1;
 if(s.rejections>=2)s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'坚持自己的节奏'])];
}
function dayAnchorAt(value){
 const d=new Date(value);
 /* The simulation day changes at local midnight. */
 d.setHours(0,0,0,0);
 return d;
}
function keyAt(value){return dayKey(dayAnchorAt(value))}
function ensureScheduleAt(value){
 const currentKey=keyAt(Date.now()),requestedKey=keyAt(value);
 if(!s.calendar)s.calendar={anchor:currentKey,days:{},version:5};
 s.calendar.days=s.calendar.days||{};
 // Apply migrations in ascending order. Never advance the version before older migrations run.
 if((s.calendar.version||0)<6){
  s.calendar.anchor=currentKey;
  Object.keys(s.calendar.days).forEach(k=>{
   s.calendar.days[k]=(s.calendar.days[k]||[]).filter(ev=>!['routine','personal','free'].includes(ev.kind));
   if(!s.calendar.days[k].length)delete s.calendar.days[k];
  });
  s.sleepPlans={};s.calendar.version=6;
 }
 if((s.calendar.version||0)<9){
  Object.keys(s.calendar.days).forEach(k=>{s.calendar.days[k]=(s.calendar.days[k]||[]).map(ev=>ev.autonomous?{...ev,kind:'autonomous',source:ev.source||'simulation'}:ev)});
  s.calendar.version=9;
 }
 if((s.calendar.version||0)<10){
  const fixed=new Set(['read','rest','computerPlay','walk','chat']);
  Object.keys(s.calendar.days).forEach(k=>{s.calendar.days[k]=(s.calendar.days[k]||[]).filter(ev=>!(ev.kind==='personal'&&fixed.has(ev.activity)))});
  s.calendar.version=10;
 }
 if((s.calendar.version||0)<11){
  // Remove obsolete schedule activities by validating against the canonical activity registry.
  Object.keys(s.calendar.days).forEach(k=>{
   s.calendar.days[k]=(s.calendar.days[k]||[]).filter(ev=>!ev.activity||!!activityMeta[ev.activity]);
   if(!s.calendar.days[k].length)delete s.calendar.days[k];
  });
  s.activityLog=(s.activityLog||[]).filter(entry=>!entry.activity||!!activityMeta[entry.activity]);
  if(s.sharedGoal?.id==='meal')s.sharedGoal=null;
  s.calendar.version=11;
 }
 if((s.calendar.version||0)<12){
  delete s.pendingWork;
  s.calendar.version=12;
 }
 if((s.calendar.version||0)<13){
  Object.keys(s.calendar.days).forEach(key=>{const day=s.calendar.days[key]||[];for(let hour=0;hour<24;hour++){if(!day.some(ev=>hour>=ev.start&&hour<ev.end))day.push({start:hour,end:hour+1,title:'自主安排',kind:'autonomous',activity:'autonomous',autonomous:true,source:'simulation',unresolved:true})}day.sort((a,b)=>a.start-b.start);s.calendar.days[key]=day});
  s.calendar.version=13;
 }
 if((s.calendar.version||0)<14){
  Object.keys(s.calendar.days).forEach(key=>{
   s.calendar.days[key]=(s.calendar.days[key]||[]).filter(ev=>!(ev.kind==='routine'&&ev.activity==='eat'));
   [[7,'早餐'],[12,'午餐'],[18,'晚餐']].forEach(([hour,title])=>writeBlockForKey(key,hour,hour+1,{title,kind:'routine',activity:'eat'}));
  });
  s.calendar.version=14;
 }
 if((s.calendar.version||0)<15){
  Object.keys(s.calendar.days).forEach(key=>{
   s.calendar.days[key]=(s.calendar.days[key]||[]).map(ev=>{
    if(ev.kind!=='proposal')return ev;
    const {withPlayer,byPlayer,startedBy,anchor,furnitureId,furnitureKind,...rest}=ev;
    return {...rest,title:'自主安排',kind:'autonomous',activity:'autonomous',autonomous:true,source:'simulation',unresolved:true};
   });
  });
  s.calendar.version=15;
 }
 if((s.calendar.version||0)<16){
  const recent=[...(s.activityLog||[]).slice(-5).map(item=>item.activity)];
  Object.keys(s.calendar.days).sort().forEach(key=>{
   const day=(s.calendar.days[key]||[]).sort((a,b)=>a.start-b.start);
   day.forEach(ev=>{
    if(ev.kind==='autonomous'&&(ev.unresolved||ev.activity==='autonomous'))Object.assign(ev,createAutonomousScheduleEvent(ev.start,recent),{end:ev.end||ev.start+1});
    if(ev.activity&&ev.activity!=='idle'){recent.push(ev.activity);if(recent.length>5)recent.shift()}
   });
   s.calendar.days[key]=day;
  });
  s.calendar.version=16;
 }
 if((s.calendar.version||0)<17){
  // Short interactions are player-triggered only and must never survive as scheduled blocks.
  Object.keys(s.calendar.days).forEach(key=>{
   const day=s.calendar.days[key]||[];
   s.calendar.days[key]=day.filter(ev=>!ev.activity||activityMeta[normalizeActivity(ev.activity)]?.duration!=='short');
   if(!s.calendar.days[key].length)delete s.calendar.days[key];
  });
  s.calendar.version=17;
 }
 if((s.calendar.version||0)<18){
  const now=new Date(),today=keyAt(now),hour=now.getHours(),recent=[...(s.activityLog||[]).slice(-5).map(item=>item.activity)];
  Object.keys(s.calendar.days).sort().forEach(key=>{
   if(key<today)return;
   const day=(s.calendar.days[key]||[]).sort((a,b)=>a.start-b.start);
   day.forEach(ev=>{
    if(ev.kind==='autonomous'&&(key>today||ev.start>hour))Object.assign(ev,createAutonomousScheduleEvent(ev.start,recent),{end:ev.end||ev.start+1});
    if(ev.activity&&ev.activity!=='idle'&&ev.activity!=='autonomous'){recent.push(ev.activity);if(recent.length>5)recent.shift()}
   });
   s.calendar.days[key]=day;
  });
  s.calendar.version=18;
 }
 if((s.calendar.version||0)<19){
  // Migrate active dungeon sessions onto the calendar block; the schedule owns the end time.
  const mission=s.activeDungeon;
  if(mission&&mission.status==='active'){
   let located=null,locatedKey=null;
   Object.keys(s.calendar.days||{}).some(key=>(s.calendar.days[key]||[]).some(ev=>{
    if(ev.dungeonId===mission.id){located=ev;locatedKey=key;return true}return false
   }));
   if(!located){
    const now=new Date(),key=keyAt(now),hour=now.getHours();
    writeBlockForKey(key,hour,hour+1,{title:'副本',kind:'dungeon',activity:'dungeon',dungeonId:mission.id,priority:'forced'});
    located=eventAt(key,hour);locatedKey=key;
   }
   located.title='副本';located.kind='dungeon';located.activity='dungeon';
   const start=new Date(locatedKey+'T00:00:00');start.setHours(Number(located.start)||0,0,0,0);
   const finish=new Date(locatedKey+'T00:00:00');finish.setHours(Number(located.end)||24,0,0,0);
   mission.scheduleKey=locatedKey;mission.scheduleStartHour=located.start;mission.startAt=start.getTime();mission.endsAt=finish.getTime();mission.scheduleEndAt=finish.getTime();
   s.activeInteraction=null;
  }
  Object.keys(s.calendar.days||{}).forEach(key=>(s.calendar.days[key]||[]).forEach(ev=>{
   if(ev.kind==='dungeon'){ev.title='副本';ev.activity='dungeon'}
  }));
  s.calendar.version=19;
 }
 if((s.calendar.version||0)<20){
  // Replan consecutive identical autonomous activities; sleep is the sole exception.
  Object.keys(s.calendar.days||{}).forEach(key=>{
   const day=(s.calendar.days[key]||[]).sort((a,b)=>a.start-b.start);
   let previous=null;
   for(const ev of day){
    const activity=normalizeActivity(ev.activity);
    if(activity&&activity!=='idle'&&activity!=='sleep'&&activity===previous&&ev.kind==='autonomous'){
     Object.assign(ev,{title:'自主安排',activity:'autonomous',kind:'autonomous',autonomous:true,source:'simulation',unresolved:true,room:null,anchor:null,furnitureId:null,furnitureKind:null});
    }else if(activity&&activity!=='idle'&&activity!=='sleep'){previous=activity}
    else if(activity==='sleep')previous='sleep';
   }
   s.calendar.days[key]=day;
  });
  s.calendar.version=20;
 }
 
 
 
 
 
 if(s.calendar.anchor!==currentKey&&requestedKey>=currentKey){
  s.calendar.anchor=currentKey;
  Object.keys(s.calendar.days).forEach(k=>{if(k<currentKey)delete s.calendar.days[k]});
  Object.keys(s.sleepPlans||{}).forEach(k=>{if(k<currentKey)delete s.sleepPlans[k]});
  addEvent('新的一天','阿尔已经开始安排新一天的生活。','daily');
 }
 const ensureDay=key=>{
  const existing=s.calendar.days[key];
  if(!existing)s.calendar.days[key]=buildDay(key);
  const day=s.calendar.days[key];
  for(let hour=0;hour<24;hour++)if(!day.some(ev=>hour>=ev.start&&hour<ev.end)){
   const preceding=day.filter(ev=>ev.end<=hour).sort((a,b)=>a.start-b.start).slice(-5).map(ev=>ev.activity).filter(Boolean);
   const recent=[...(s.activityLog||[]).slice(-5).map(item=>item.activity),...preceding].slice(-5);
   const previous=eventAt(key,hour-1);if(previous?.activity&&previous.activity!=='idle')recent.push(previous.activity);
   const planned=createAutonomousScheduleEvent(hour,recent);day.push(planned);
  }
  day.sort((a,b)=>a.start-b.start);
 };
 ensureDay(currentKey);
 for(let i=1;i<=2;i++)ensureDay(dayKey(plusDays(dayAnchor(),i)));
 if(requestedKey>=currentKey)ensureDay(requestedKey);
 // Replan only future autonomous slots when the set or placement of home furniture changes.
 const furnitureSignature=JSON.stringify((s.placed||[]).filter(item=>item&&item.id).map(item=>({id:String(item.id),name:String(item.name||''),room:String(item.room||''),supportId:String(item.supportId||''),kind:furnitureKindForPlaced(item)})).sort((a,b)=>a.id.localeCompare(b.id)));
 if(s.calendar.autonomyFurnitureSignature!==furnitureSignature){
  const currentHour=new Date().getHours();
  let recent=(s.activityLog||[]).slice(-5).map(item=>item.activity).filter(Boolean);
  Object.keys(s.calendar.days||{}).filter(key=>key>=currentKey).sort().forEach(key=>{
   const day=(s.calendar.days[key]||[]).sort((a,b)=>a.start-b.start);
   day.forEach(ev=>{
    const isFuture=key>currentKey||Number(ev.start)>currentHour;
    if(ev.kind==='autonomous'&&isFuture){
     const start=ev.start,end=ev.end,withPlayer=ev.withPlayer;
     const planned=createAutonomousScheduleEvent(start,recent);
     Object.assign(ev,planned,{start,end,...(withPlayer?{withPlayer}: {})});
     if(ev.activity&&ev.activity!=='idle'){recent.push(ev.activity);if(recent.length>5)recent.shift()}
    }
    if(ev.activity&&ev.activity!=='idle'&&ev.activity!=='autonomous'){recent.push(ev.activity);if(recent.length>5)recent.shift()}
   });
  });
  s.calendar.autonomyFurnitureSignature=furnitureSignature;
 }
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
 const job=s.job;
 if(!job?.active||key<job.startDate||hour<job.end)return false;
 job.paidDays=job.paidDays||[];
 if(job.paidDays.includes(key))return false;
 job.paidDays.push(key);
 s.personalMoney+=Math.max(0,Number(job.salary)||0);
 moneyRecord('personal','income',Math.max(0,Number(job.salary)||0),job.title+' · 日薪',at);
 addEvent('今日薪资到账','阿尔完成了'+job.title+'的工作，获得日薪 ¥'+job.salary+'。','daily');
 remember('salary','获得'+job.title+'日薪 ¥'+job.salary,1);
 return true;
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
 settleDungeonIfDue(now.getTime());
 refreshImmediateInteraction(now.getTime());
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
 if(['listen','walk','read','game','music','food','company','chat','computerPlay','browseWeb','program','playPiano','exercise','laundry','hug','admireDecor','admireView','watchTV','listenRecords','bouquet','admireFlowers','smellFlowers'].includes(action)){
  s.friend=clamp(s.friend+1);
  remember('shared',action);
 }
}



function pantryCount(k){return Math.max(0,Number(s.pantry?.[k]||0))}
function canCook(id){const r=recipes[id];return !!r&&Object.entries(r.ingredients).every(([k,n])=>pantryCount(k)>=n)}
function hasCookableRecipe(){return (s.unlockedRecipes||[]).some(id=>canCook(id))}

function buyIngredient(id,label,cost){const k=id.replace('buy-ingredient-','');if(!(k in ingredientNames))return;if(s.money<cost){toast('¥不足');return}s.money-=cost;s.pantry[k]=pantryCount(k)+1;addEvent('你补充了食材',label+'已放入冰箱。','player-action');remember('purchase','购买食材：'+label,1);saySystem('食材放进冰箱了。');save();render();openTab('商店',true)}
function kitchenOpen(){$('stage').classList.add('kitchen-mode');$('stage').classList.remove('bedroom-mode','bathroom-mode');$('roomLabel').textContent='厨房';updateArday3D()}
function kitchenClose(){$('stage').classList.remove('kitchen-mode','bedroom-mode','bathroom-mode');const m=activityMeta[s.currentActivity]||{title:'自己的时间'};$('roomLabel').textContent=''+m.title;updateArday3D()}
function openKitchenPanel(){
 $('drawer').classList.remove('furniture-drawer','shop-drawer','profile-expanded');
 $('drawer').querySelector('.furniture-close')?.remove();
 kitchenOpen();
 const stock=Object.entries(ingredientNames).map(([key,label])=>{
  const count=pantryCount(key),icon=({rice:'🍚',egg:'🥚',vegetable:'🥬',tomato:'🍅',oil:'🫒',flour:'🌾',potato:'🥔',beef:'🥩',noodles:'🍜',mushroom:'🍄',tofu:'◻️',bread:'🍞'})[key]||'🥕';
  return '<div class="kitchen-ingredient'+(count?' stocked':' empty')+'"><span class="kitchen-ingredient-icon">'+icon+'</span><span class="kitchen-ingredient-name">'+label+'</span><strong>×'+count+'</strong></div>';
 }).join('');
 const cards=Object.entries(recipes).filter(([id])=>(s.unlockedRecipes||[]).includes(id)).map(([id,recipe])=>{
  const enough=canCook(id),parts=Object.entries(recipe.ingredients),ingredients=parts.map(([key,count])=>'<span class="kitchen-recipe-ingredient'+(pantryCount(key)>=count?' ready':' missing')+'">'+ingredientNames[key]+' <b>×'+count+'</b></span>').join('');
  const icon=id==='eggRice'?'🍚':id==='tomatoEgg'?'🍳':'🥣',missing=parts.filter(([key,count])=>pantryCount(key)<count).map(([key,count])=>ingredientNames[key]+' '+(count-pantryCount(key))+'份');
  return '<article class="kitchen-recipe-card"><div class="kitchen-recipe-art">'+icon+'</div><div class="kitchen-recipe-main"><div class="kitchen-recipe-heading"><strong>'+recipe.name+'</strong><span class="kitchen-recipe-benefit">饱腹 +'+recipe.hunger+'</span></div><div class="kitchen-recipe-ingredients">'+ingredients+'</div>'+(enough?'<p class="kitchen-recipe-note">可制作</p>':'<p class="kitchen-recipe-note missing-note">还需要 '+missing.join('、')+'</p>')+'</div><button type="button" class="kitchen-cook-button" data-recipe="'+id+'" '+(enough?'':'disabled')+'>'+(enough?'开始制作':'食材不足')+'</button></article>';
 }).join('')||'<p class="kitchen-empty-note">暂无菜谱</p>';
 $('drawerTitle').textContent='厨房 · 烹饪';
 $('choices').className='choices cooking-panel';
 $('choices').innerHTML='<button type="button" id="kitchen-close" class="kitchen-close" aria-label="关闭烹饪界面" title="关闭">×</button><header class="kitchen-hero"><div class="kitchen-hero-copy"><span class="kitchen-eyebrow">HOME KITCHEN / DAILY MENU</span><h2>厨房</h2></div><div class="kitchen-hero-mark">餐</div></header><section class="kitchen-pantry"><div class="kitchen-section-heading"><div><span>01 / PANTRY</span><h3>冰箱食材</h3></div><small>库存数量</small></div><div class="kitchen-ingredient-grid">'+stock+'</div></section><section class="kitchen-menu"><div class="kitchen-section-heading"><div><span>02 / TODAY’S MENU</span><h3>今日菜单</h3></div></div><div class="kitchen-recipe-list">'+cards+'</div></section>';
 $('choices').querySelectorAll('[data-recipe]').forEach(button=>button.onclick=()=>cookRecipeForPlayer(button.dataset.recipe));
 $('kitchen-close').onclick=()=>{ $('drawer').classList.remove('open');kitchenClose(); };
 $('drawer').classList.add('open');
}
function cookRecipeForPlayer(id){const recipe=recipes[id];if(!recipe||(s.unlockedRecipes||[]).indexOf(id)<0){toast('请先购买这道菜的菜谱');return}if(!canCook(id)){toast('食材不足');return}Object.entries(recipe.ingredients).forEach(([key,count])=>s.pantry[key]=pantryCount(key)-count);const itemName='成品食物·'+recipe.name;addInventoryItem(itemName,'food');addEvent('完成了一道料理',recipe.name+'已放入物品栏。','player-action');remember('cooking','亲手制作：'+recipe.name,2);saySystem(recipe.name+'做好了。找个合适的位置摆出来吧。');save();render();openKitchenPanel();toast('已制作：'+recipe.name)}
// Presentation only. The schedule processor is the sole writer of currentActivity.
const immediateInteractionDuration=120000;
const immediateInteractionRefusalRate=.3;
function finishImmediateInteraction(at=Date.now()){
 const interaction=s.activeInteraction;if(!interaction)return false;if(s.activeDungeon){s.activeInteraction=null;return false}if(at<Number(interaction.endsAt||0))return false;
 const currentKey=keyAt(at),currentHour=new Date(at).getHours();
 if(s.lastUnifiedHourKey!==currentKey+'-'+currentHour)processActivityAt(at);
 s.activeInteraction=null;
 const activity=normalizeActivity(interaction.activity),meta=activityMeta[activity];
 if(meta){
  const effects={...(meta.effect||{})};
  if(Object.prototype.hasOwnProperty.call(energyEffects,activity))effects.energy=Number(energyEffects[activity])||0;
  applyActivityEffectsWithFeedback(effects);
  recordActivityPreference(activity,at);
  if(['read','write','program'].includes(activity))updatePersonalGoal(activity==='program'?'write':activity,at);
  relation(activity);
  s.activityLog=s.activityLog||[];s.activityLog.push({activity,key:keyAt(at),hour:new Date(at).getHours(),at,withPlayer:true,immediate:true});
  if(s.activityLog.length>100)s.activityLog.splice(0,s.activityLog.length-100);
  remember('shared',activityLabel(activity)+' · 即时互动',1);
 }
 const restored=resolveScheduledActivity(keyAt(at),new Date(at).getHours()),scheduled=restored.event;
 const restoredActivity=normalizeActivity(restored.activity||s.currentActivity||'idle');
 const restoredMeta=activityMeta[restoredActivity]||{};
 s.currentActivity=restoredActivity;
 s.currentActivityAnchor=scheduled?.anchor||restoredMeta.anchor||null;
 s.currentActivityRoom=scheduled?.room||(restoredActivity==='sleep'?'bedroom':'living');
 s.currentActivityFurnitureId=scheduled?.furnitureId||null;
 presentActivity(restoredActivity,s.currentActivityAnchor,s.currentActivityRoom,s.currentActivityFurnitureId);
 say('还行。下次也要和我一起。');
 save();render();return true;
}
function refreshImmediateInteraction(at=Date.now()){
 const interaction=s.activeInteraction;if(!interaction)return false;if(s.activeDungeon){s.activeInteraction=null;return false}
 if(at>=Number(interaction.endsAt||0))return finishImmediateInteraction(at);
 const hourKey=keyAt(at)+'-'+new Date(at).getHours();
 if(interaction.presentationHourKey!==hourKey){interaction.presentationHourKey=hourKey;presentActivity(interaction.activity,interaction.anchor||null,interaction.room||null,interaction.furnitureId||null)}
 return true;
}
function beginImmediateInteraction(action,options={}){
 if(s.activeDungeon){toast('副本进行中，暂时无法进行即时互动');return false}
 const activity=normalizeActivity(action),meta=activityMeta[activity];
 if(!meta||activity==='idle'||!['short','long'].includes(meta.duration))return false;
 if(meta.duration==='short'&&!['furniture','window'].includes(options.source))return false;
 const now=Date.now(),hourKey=keyAt(now)+'-'+new Date(now).getHours();
 if(s.lastUnifiedHourKey!==hourKey)processActivityAt(now);
 const availability=resolveCharacterAvailability(new Date(now));
 if(availability.status!=='available'){
  const messages={sleeping:'别吵。',working:'正在工作中，有事请留言。',eating:'你也想来一起吃饭吗？坐下吧。',outside:'有事请留言。',busy:'等阿尔回来再告诉他吧。'};
  if(availability.status==='busy')saySystem(messages.busy);else say(messages[availability.status]||messages.busy);return false;
 }
 if(s.activeInteraction&&now<Number(s.activeInteraction.endsAt||0)){say('这么贪心？三心二意可不好。');return false}
 const requiredFurniture=meta.requires;
 const sourceFurniture=(s.placed||[]).find(item=>String(item.id)===String(options.furnitureId));
 if(options.source==='furniture'){
  if(!sourceFurniture){saySystem('这件家具暂时无法执行该互动。');return false}
  const sourceKind=furnitureKindForPlaced(sourceFurniture),sourceSet=sourceKind&&furnitureActivities[sourceKind];
  if(!sourceSet?.activities?.[activity]){saySystem('这件家具没有配置这项互动。');return false}
  if(!furnitureRequirementAvailable(requiredFurniture,sourceFurniture.room)){saySystem('这件家具附近还没有适合进行这项活动的设备。');return false}
  if(activity==='computerPlay'&&sourceKind==='desk'&&!((s.placed||[]).some(entry=>entry.name==='电脑'&&String(entry.supportId)===String(sourceFurniture.id)))){saySystem('这张书桌上还没有放置电脑。');return false}
  if(['computerPlay','write','browseWeb','program'].includes(activity)&&sourceKind==='computer'&&!((s.placed||[]).some(entry=>String(entry.id)===String(sourceFurniture.supportId)&&furnitureKindForPlaced(entry)==='desk'))){saySystem('这台电脑需要放在书桌上才能使用。');return false}
 }else if(requiredFurniture&&!hasAutonomyFurniture(requiredFurniture,options.room||null)){saySystem('家里还没有适合进行这项活动的家具。');return false}
 const furnitureId=String(options.furnitureId||options.furnitureKind||'unspecified');
 const attemptKey=hourKey,attemptId=furnitureId+'|'+activity,attempts=s.interactionAttempts[attemptKey]||[];
 if(attempts.includes(attemptId)){say('这么想做的话，明天吧。');return false}
 s.interactionAttempts[attemptKey]=[...attempts,attemptId];
 Object.keys(s.interactionAttempts).forEach(key=>{if(key.slice(0,10)<hourKey.slice(0,10))delete s.interactionAttempts[key]});save();
 if(meta.duration==='long'&&Math.random()<immediateInteractionRefusalRate){rejectActivityProposal(activity);save();return false}
 const startedAt=now,durationMs=meta.duration==='short'?24000:120000;
 const nextScheduleBoundary=new Date(now);nextScheduleBoundary.setMinutes(0,0,0);nextScheduleBoundary.setHours(nextScheduleBoundary.getHours()+1);
 if(startedAt+durationMs>nextScheduleBoundary.getTime()){say('这段时间不够完成互动，等下一段日程开始再说吧。');return false}
 s.activeInteraction={activity,anchor:options.anchor||meta.anchor||null,furnitureId,room:sourceFurniture?.room||options.room||'living',startedAt,endsAt:startedAt+durationMs,interrupted:{activity:s.currentActivity||availability.activity||'idle',anchor:s.currentActivityAnchor||null},presentationHourKey:hourKey};
 presentActivity(activity,s.activeInteraction.anchor,s.activeInteraction.room,furnitureId);say('想让我陪你？那我勉为其难试试吧。');save();return true;
}
function presentActivity(activity,anchor=null,room=null,furnitureId=null){
 const a=normalizeActivity(activity);if(!activityMeta[a])return;updateArday3D(a,anchor,room,furnitureId);
}
function furnitureKindForPlaced(item){
 const name=String(item?.name||'');
 if(/沙发|躺椅|懒人沙发|沙发床/.test(name))return 'sofa';
 if(/餐桌/.test(name))return 'dining';
 if(/^冰箱/.test(name))return 'fridge';
 if(/灶/.test(name))return 'stove';
 if(/水槽|洗手台|淋浴间/.test(name))return 'sink';
 if(/上床下桌/.test(name))return 'loftBed';
 if(/^(?:床(?:$|·)|布艺床|双人床|软包床|木框床|榻榻米)/.test(name))return 'bed';
 if(/椅/.test(name)||/凳子/.test(name))return 'chair';
 if(/书架|书柜/.test(name))return 'bookshelf';
 if(/书桌/.test(name))return 'desk';
 if(/^电脑/.test(name))return 'computer';
 if(/^电视(?:$|·)/.test(name))return 'television';
 if(/唱片机/.test(name))return 'recordPlayer';
 if(/捧花摆件/.test(name))return 'bouquet';
 if(/钢琴/.test(name))return 'piano';
 if(/洗衣机/.test(name))return 'washingMachine';
 if(/跑步机/.test(name))return 'treadmill';
 if(/哑铃架/.test(name))return 'dumbbellRack';
 if(/窗户|^窗$/.test(name))return 'window';
 if(/海报|壁画|照片墙/.test(name))return 'wallArt';
 if(/坐垫/.test(name))return 'cushion';
 if(/游戏机/.test(name))return 'gameConsole';
 return null;
}
function normalizeActivity(a){return ({reading:'read',listen:'music'})[a]||a||'idle'}
// Resolve every hour through the calendar. Autonomous choice fills only an unassigned slot;
// fixed routines and player proposals already exist as calendar events and take precedence.
function updateStatusBuffs(at=Date.now()){
 const hourMs=3600000,period=12*hourMs;s.statusBuffs=s.statusBuffs||{};
 const rules=[
  {id:'depressed',active:Number(s.hunger)<40,apply:n=>{s.friend=Math.max(0,(Number(s.friend)||0)-n);s.love=Math.max(0,(Number(s.love)||0)-n)}},
  {id:'sick',active:Number(s.clean)<20&&Number(s.energy)<20,apply:n=>{s.bored=Math.min(100,(Number(s.bored)||0)+2*n)}}
 ];
 for(const rule of rules){let state=s.statusBuffs[rule.id]||(s.statusBuffs[rule.id]={active:false,since:0,nextEffectAt:0});
  if(rule.active&&!state.active){state.active=true;state.since=at;state.nextEffectAt=at+period}
  else if(!rule.active&&state.active){state.active=false;state.since=0;state.nextEffectAt=0}
  if(rule.active&&state.active){if(!Number(state.nextEffectAt)){state.since=at;state.nextEffectAt=at+period}if(at>=state.nextEffectAt){const periods=Math.floor((at-state.nextEffectAt)/period)+1;rule.apply(periods);state.nextEffectAt+=periods*period}}
 }
}
function applyActivityEffectsWithFeedback(effects){
 const before={};for(const key of Object.keys(effects||{}))before[key]=Number(s[key])||0;
 change(effects);
 const gains={};for(const key of Object.keys(before)){const delta=(Number(s[key])||0)-before[key];if(delta>0)gains[key]=delta;}
 if(Object.keys(gains).length)arday3D?.showStatGain?.(gains);
}
function processActivityAt(value){
 const d=new Date(value),hour=d.getHours(),key=ensureScheduleAt(d),hourKey=key+'-'+hour;
 if(s.lastUnifiedHourKey===hourKey)return false;
 // An immediate interaction may never leak into the next scheduled hour.
 if(s.activeInteraction)s.activeInteraction=null;
 // Preserve fractional hourly decay; integer clamping would round small losses to zero.
 const hourlyLoss={energy:Number(energyConfig.hourlyDecay)||0,hunger:Number(needDecay.hungerHourlyDecay)||0,clean:Number(needDecay.cleanHourlyDecay)||0,fun:Number(needDecay.funHourlyDecay)||0};
 for(const [k,loss] of Object.entries(hourlyLoss))s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)-loss));
 
 const resolved=resolveScheduledActivity(key,hour);
 let ev=resolved.event,activity=resolved.activity;
 let placedMealEaten=false;
 if([7,12,18].includes(hour)){
  const meal=(s.placed||[]).find(item=>typeof item.name==='string'&&item.name.startsWith('成品食物·')&&['living','bedroom','kitchen','bathroom'].includes(item.room));
  if(meal){const dishName=meal.name.split('·').slice(1).join('·'),recipe=Object.values(recipes).find(r=>r.name===dishName);s.placed=s.placed.filter(item=>item.id!==meal.id);arday3D?.consumePlacedMeal?.(meal.id);applyActivityEffectsWithFeedback({hunger:recipe?.hunger||28,fun:2});placedMealEaten=true;say('这道'+dishName+'是你做的？手艺真好。');remember('meal','Arday吃了'+dishName,2);}
  else{
   const mealKey=key+'-'+({7:'breakfast',12:'lunch',18:'dinner'}[hour]);
   if(!s.mealMissedKeys.includes(mealKey)){
    s.mealPrepMisses=(Number(s.mealPrepMisses)||0)+1;s.mealMissedKeys.push(mealKey);if(s.mealMissedKeys.length>90)s.mealMissedKeys.splice(0,s.mealMissedKeys.length-90);
    const letters={7:['今天早上没看到准备好的早餐。你是不是忙忘了？','早餐时间到了，桌上却空空的。下次记得给我留一点。','我本来还挺期待早餐的……看来今天得自己想办法了。'],12:['午饭时间到了，今天好像没有我的那一份。','我看了看餐桌，什么也没有。你是不是把午饭忘了？','中午有点饿。下次能不能提前替我留一份？'],18:['晚饭还没有着落。你今天是不是忘记我也要吃饭了？','我刚刚去看了餐桌，还是空的。下次记得我一份。','晚饭时间到了。看来今天又得自己想办法了。']};
    const options=letters[hour]||letters[12];addEvent('阿尔的留言',options[(s.mealPrepMisses-1)%options.length],'arday-letter');
   }
  }
 }
 const meta=activityMeta[activity],sessionId=key+'-'+(ev?.start??hour)+'-'+activity;
 const sessionStart=s.lastProcessedSessionKey!==sessionId;
 if(meta&&!s.activeInteraction){
  const effects={...(meta.effect||{})};if(activity==='sleep')effects.energy=Number(energyConfig.sleepRecoveryPerHour)||1;else if(Object.prototype.hasOwnProperty.call(energyEffects,activity))effects.energy=Number(energyEffects[activity])||0;
  if(activity==='eat'||activity==='food'){if(!placedMealEaten)say('好饿。今天我能得到神明的投喂吗？');delete effects.hunger}
  applyActivityEffectsWithFeedback(effects);
  
  recordActivityPreference(activity,d.getTime());
  // Scene presentation is applied once after the authoritative state is committed.
 }
 if(sessionStart&&!s.activeInteraction){
  if(ev?.kind==='autonomous'){
   const notes={laundry:'阿尔把一轮衣物洗好了。',exercise:'阿尔自己锻炼了一会儿。',playPiano:'阿尔在钢琴前坐了一阵。',walk:'阿尔出门散了会儿步。'};
   if(notes[activity])addEvent('阿尔的日常记录',notes[activity],'autonomous');
  }
  if(ev?.withPlayer){
   relation(activity);
   if(activity==='walk')advanceSharedGoal(activity,d.getTime());
  }
  if(['read','write'].includes(activity))updatePersonalGoal(activity,d.getTime());
 }
 const workCompleted=settleWorkAt(key,hour,d.getTime());
 if(workCompleted)updatePersonalGoal('work',d.getTime());
 if(Number(s.fun)<=30)s.bored=Math.min(100,(Number(s.bored)||0)+(5/24));
 updateStatusBuffs(d.getTime());

 s.lastUnifiedHourKey=hourKey;s.lastHourKey=hourKey;s.currentActivity=activity;s.currentActivityAnchor=ev?.anchor||meta?.anchor||null;
 s.currentActivityRoom=ev?.room||(activity==='sleep'?'bedroom':'living');
 s.currentActivityFurnitureId=ev?.furnitureId||null;
 if(!s.activeInteraction)presentActivity(activity,s.currentActivityAnchor,s.currentActivityRoom,s.currentActivityFurnitureId);
 s.lastProcessedSessionKey=sessionId;
 s.activityLog=s.activityLog||[];
 s.activityLog.push({activity,key,hour,at:d.getTime(),withPlayer:!!ev?.withPlayer});
 if(s.activityLog.length>100)s.activityLog.splice(0,s.activityLog.length-100);
 reviewPersonalSpending(d.getTime());
 settleDungeonIfDue(d.getTime());
 return true;
}
// Furniture declares only which canonical activities it exposes.
// Names, poses, locations and effects live exclusively in activityMeta.
function activityLabel(activity){
 const meta=activityMeta[normalizeActivity(activity)];
 return meta?.menuLabel||meta?.title||activity;
}
function furnitureRequirementAvailable(requirement,room){
 if(!requirement)return true;
 return (s.placed||[]).some(item=>item&&item.room===room&&furnitureSatisfiesRequirement(item,requirement));
}
function closeFurnitureActions(){
 const wheel=document.querySelector('.furniture-wheel');
 if(wheel){
  if(wheel._outsideHandler)document.removeEventListener('pointerdown',wheel._outsideHandler,true);
  if(wheel._escapeHandler)document.removeEventListener('keydown',wheel._escapeHandler,true);
  wheel.remove();
 }
 const drawer=$('drawer');
 if(!drawer.classList.contains('furniture-drawer'))return;
 drawer.classList.remove('open');
 delete drawer.dataset.furnitureId;
 delete drawer.dataset.furnitureKind;
 document.querySelectorAll('.tool').forEach(button=>button.classList.remove('active'));
}
function invokeFurnitureAction(item){
 if(!item)return;
 if(typeof item.action==='function')item.action();
 const drawer=$('drawer');
 if(drawer.classList.contains('furniture-drawer')&&drawer.dataset.furnitureId!==item.id)closeFurnitureActions();
}
function furnitureInteractionBlockReason(){
 const interaction=s.activeInteraction;
 if(interaction&&Date.now()<Number(interaction.endsAt||0))return '阿尔正在'+activityLabel(interaction.activity)+'，暂时无法回应新的邀请。';
 const availability=resolveCharacterAvailability();
 const messages={sleeping:'阿尔已经睡下了，暂时无法回应。',working:'阿尔正在工作，结束后才能回应。',eating:'阿尔正在用餐，暂时无法回应。',outside:'阿尔目前在外面，回来后才能回应。',busy:'阿尔现在有其他安排，暂时无法回应。'};
 return messages[availability.status]||'';
}
function openFurnitureActions(kind,furnitureId=null){
 const set=furnitureActivities[kind];if(!set)return;
 if(set.action==='kitchen'){openKitchenPanel();return}
 const stage=$('stage'),drawer=$('drawer');
 closeFurnitureActions();
 drawer.classList.remove('open','furniture-drawer','shop-drawer','profile-expanded');
 const targetItem=window.ArdayGetFurnitureHotspot?.(furnitureId)?.__furnitureItem||null;
 const room=targetItem?.room||(s.placed||[]).find(item=>String(item.id)===String(furnitureId))?.room||(stage.classList.contains('bathroom-mode')?'bathroom':stage.classList.contains('bedroom-mode')?'bedroom':stage.classList.contains('kitchen-mode')?'kitchen':'living');
 const actions=Object.entries(set.activities||{}).filter(([activity,meta])=>activityMeta[activity]&&furnitureRequirementAvailable(activityMeta[activity].requires,room));
 const blockedReason=furnitureInteractionBlockReason();
 const stageRect=stage.getBoundingClientRect();
 const hotspot=window.ArdayGetFurnitureHotspot?.(furnitureId)||Array.from(stage.querySelectorAll('.furniture-hotspot')).find(button=>button.dataset.furnitureId===String(furnitureId||''));
 // Hotspots are already projected into stage-local CSS pixels by the Three.js scene.
 // Read those exact coordinates instead of mixing viewport and stage coordinate spaces.
 const hotX=hotspot?Number.parseFloat(hotspot.style.left):NaN,hotY=hotspot?Number.parseFloat(hotspot.style.top):NaN;
 const targetRect=hotspot?.getBoundingClientRect();
 const cx=Number.isFinite(hotX)?hotX:targetRect?targetRect.left+targetRect.width/2-stageRect.left:stageRect.width/2;
 const cy=Number.isFinite(hotY)?hotY:targetRect?targetRect.top+targetRect.height/2-stageRect.top:stageRect.height/2;
 const edgeSpace=Math.min(cx,stageRect.width-cx,cy,stageRect.height-cy);
 const radius=Math.max(46,Math.min(88,edgeSpace-30,Math.min(stageRect.width,stageRect.height)*.22));
 const wheel=document.createElement('div');wheel.className='furniture-wheel';wheel.setAttribute('role','group');wheel.setAttribute('aria-label',set.title+'互动');
 wheel.style.left=cx+'px';wheel.style.top=cy+'px';wheel.style.width=(radius*2)+'px';wheel.style.height=(radius*2)+'px';wheel.style.setProperty('--wheel-radius',radius+'px');
 wheel.style.setProperty('--wheel-count',Math.max(actions.length,1));
 const center=document.createElement('div');center.className='furniture-wheel-center';center.style.left=radius+'px';center.style.top=radius+'px';
 const title=document.createElement('span');title.className='furniture-wheel-title';title.textContent=set.title;
 const subtitle=document.createElement('span');subtitle.className='furniture-wheel-subtitle';subtitle.textContent='选择互动';
 center.setAttribute('role','button');center.setAttribute('tabindex','0');center.setAttribute('aria-label','关闭'+set.title+'互动菜单');center.title='点击关闭';
 center.onclick=closeFurnitureActions;center.onkeydown=(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();closeFurnitureActions()}};
 center.append(title,subtitle);wheel.appendChild(center);
 const symbols={read:'▤',write:'✎',chat:'♡',computerPlay:'⌘',browseWeb:'⌕',program:'⌘',playPiano:'♫',exercise:'↗',laundry:'◌',hug:'♡',admireDecor:'◇',admireView:'☼',watchTV:'▣',listenRecords:'♫',rest:'☾',music:'♫',wash:'◌',bouquet:'✿',admireFlowers:'✿',smellFlowers:'❀',sleep:'☾',cook:'♨'};
 if(actions.length){
  actions.forEach(([activity,context],index)=>{
   const angle=(-90+index*(360/actions.length))*Math.PI/180;
   const button=document.createElement('button');button.type='button';button.className='furniture-wheel-action';
   const icon=document.createElement('span');icon.className='furniture-wheel-icon';icon.setAttribute('aria-hidden','true');icon.textContent=symbols[activity]||'•';
   const label=document.createElement('span');label.className='furniture-wheel-label';label.textContent=activityLabel(activity);
   button.append(icon,label);
   button.style.left=(radius+Math.cos(angle)*radius*.78)+'px';
   button.style.top=(radius+Math.sin(angle)*radius*.78)+'px';
   button.disabled=!!blockedReason;
   button.setAttribute('aria-label',activityLabel(activity)+(blockedReason?'。'+blockedReason:''));
   button.onclick=()=>{
    if(button.disabled)return;
    const started=perform(activity,true,{anchor:context?.anchor||null,source:'furniture',furnitureId,furnitureKind:kind});
    if(started)closeFurnitureActions();
   };
   wheel.appendChild(button);
  });
 }else{
  const empty=document.createElement('span');empty.className='furniture-wheel-empty';empty.textContent='暂无可用互动';center.appendChild(empty);
 }
 if(blockedReason){const status=document.createElement('span');status.className='furniture-wheel-status';status.textContent=blockedReason;wheel.appendChild(status)}
 stage.appendChild(wheel);
 wheel._outsideHandler=event=>{if(!wheel.contains(event.target)&&event.target!==hotspot)closeFurnitureActions()};
 wheel._escapeHandler=event=>{if(event.key==='Escape')closeFurnitureActions()};
 document.addEventListener('pointerdown',wheel._outsideHandler,true);
 document.addEventListener('keydown',wheel._escapeHandler,true);
}
function resolveCharacterAvailability(at=new Date()){
 const hour=at.getHours(),key=keyAt(at),ev=eventAt(key,hour);
 const activity=normalizeActivity(ev?.activity||(s.lastUnifiedHourKey===key+'-'+hour?s.currentActivity:'idle'));
 if(activity==='sleep')return {status:'sleeping',activity,event:ev,key,hour};
 if(['work','computerWork'].includes(activity)||ev?.kind==='work')return {status:'working',activity,event:ev,key,hour};
 if(['eat','food'].includes(activity))return {status:'eating',activity,event:ev,key,hour};
 if(activity==='walk')return {status:'outside',activity,event:ev,key,hour};
 if(ev&&['busy','unavailable','dungeon'].includes(ev.kind))return {status:'busy',activity,event:ev,key,hour};
 return {status:'available',activity,event:ev,key,hour};
}
function ardayUnavailable(){return resolveCharacterAvailability().status!=='available'}
function busyBubble(){say('等Arday回家后和他商量吧。')}
function busyBubble(){say('等Arday回家后和他商量吧。')}
function perform(action,force=false,options={}){if(options.source==='furniture'||options.source==='window')return beginImmediateInteraction(action,options);return false}
// The old sceneSwitch control was removed from the interface; kitchen access is contextual now.

const {moneyRecord,ensurePersonalGoal,updatePersonalGoal,reviewPersonalSpending}=window.ArdayEconomy.create({state:s,has,remember,addEvent,say});
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
 $('drawer').classList.remove('furniture-drawer');$('drawer').querySelector('.furniture-close')?.remove();
 if(e.type!=='bill')return eventChoicesLegacy(e);
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices event-detail-view';$('drawerTitle').textContent=e.title;
 $('choices').innerHTML='<div class="calendar-note">'+e.detail+'</div><div class="calendar-actions"><button id="paybill">从共同账户支付 ¥80</button><button id="delaybill">暂时记账</button></div>';
 $('paybill').onclick=()=>{
  if(s.money>=80){s.money-=80;s.unpaidBill=Math.max(0,(s.unpaidBill||0)-80);moneyRecord('shared','expense',80,'水电与日常开销');say('共同账户已经支付本周开销。')}
  else{say('共同账户资金不够，先记账。');s.unpaidBill=(s.unpaidBill||0)+80}
  completeEvent(e,'支付或记账');save();render();renderEvents();
 };
 $('delaybill').onclick=()=>{s.unpaidBill=(s.unpaidBill||0)+80;completeEvent(e,'暂时记账');say('好，先记在共同开销里。');save();render();renderEvents()};
 $('drawer').classList.add('open');
}


/* === Shared goals and situational events === */
s.sharedGoal=s.sharedGoal||null;
s.sharedGoalHistory=s.sharedGoalHistory||[];
s.lastRandomEventAt=Number(s.lastRandomEventAt||0);
s.lastSharedProposalAt=Number(s.lastSharedProposalAt||0);

function ardayLine(kind, fallback){
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
 return line||fallback;
}
function sharedGoalCatalog(){
 return [
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
Object.values(s.calendar?.days||{}).forEach(day=>day.forEach(ev=>{if(ev.activity==='project'||ev.activity==='tidy'){ev.activity='idle';ev.title='自由时间';ev.kind='free'}}));
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
  change({friend:2,fun:3});
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
   if(s.fun<35&&Math.random()<.45)addEvent('今天有点无聊','我最近做的事情都差不多。想不想一起试试新的活动？','daily');
  }
  if(Math.random()<.42)proposeSharedGoal(Date.now());
  if(Math.random()<.3)createSituationalEvent(Date.now());
 }
}
const oldEventChoicesForGoals=eventChoices;
eventChoices=function(e){
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices';
 if(e.type==='shared-goal-proposal'){
  const g=sharedGoalCatalog().find(x=>x.id===e.goalId);
  if(!g){completeEvent(e,'计划已过期');save();renderEvents();return}
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="event-detail">'+e.detail+'</div><div class="calendar-actions"><button id="sg-accept">一起做</button><button id="sg-decline">这次先不安排</button></div>';
  $('sg-accept').onclick=()=>{acceptSharedGoal(g.id);completeEvent(e,'接受共同计划');save();render();renderEvents()};
  $('sg-decline').onclick=()=>{say(ardayLine('decline'));s.lastSharedProposalAt=Date.now();completeEvent(e,'暂不安排');save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 if(e.type==='life-memory'){
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="event-detail">'+e.detail+'</div><div class="calendar-actions"><button id="memory-ask">问问纸条的来历</button><button id="memory-keep">替他收起来</button></div>';
  $('memory-ask').onclick=()=>{say('你倒是很会挑时候。只是这件事，我还没想好要从哪里说起。');remember('old-memory','你问起那张旧纸条，阿尔没有立刻回答。',2);change({friend:1});completeEvent(e,'询问纸条来历');save();renderEvents()};
  $('memory-keep').onclick=()=>{say('替我收着吧。说不定哪天，我会想起它。');remember('old-memory','你替阿尔收起了旧纸条。',2);completeEvent(e,'收起纸条');save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 if(e.type==='life-evening'){
  $('drawerTitle').textContent=e.title;
  $('choices').innerHTML='<div class="event-detail">'+e.detail+'</div><div class="calendar-actions"><button id="evening-together">今晚一起待着</button><button id="evening-free">维持原定安排</button></div>';
  $('evening-together').onclick=()=>{change({friend:1,fun:2});say('我就知道你会答应。过来吧，今晚不必赶时间。');remember('evening','你们临时改变安排，共度了一个晚上。',2);completeEvent(e,'一起度过晚上');save();renderEvents()};
  $('evening-free').onclick=()=>{say('也好。今晚就照原来的安排来。');completeEvent(e,'维持原定安排');save();renderEvents()};
  $('drawer').classList.add('open');return;
 }
 oldEventChoicesForGoals(e);
};
function showCollection(){
 const log=(s.moneyLog||[]).slice(0,8).map(x=>'<p>'+new Date(x.at).toLocaleDateString('zh-CN')+' · '+(x.account==='shared'?'共同账户':'阿尔个人账户')+' · '+(x.kind==='income'?'+':'−')+'¥'+x.amount+' · '+x.note+'</p>').join('')||'<p>暂时没有账户记录。</p>';
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('drawerTitle').textContent='账户';$('choices').className='choices account-view';
 $('choices').innerHTML=
  '<section class="account-balance"><div><span>SHARED ACCOUNT</span><h2>¥'+s.money+'</h2></div><div class="account-symbol">¥</div><small>未付共同开销 ¥'+(s.unpaidBill||0)+'</small></section>'+
  '<section class="account-personal"><div class="section-kicker">ARDAY · PERSONAL</div><h3>阿尔的个人账户</h3><strong>¥'+s.personalMoney+'</strong></section>'+
  '<section class="profile-section account-transfer"><div class="section-kicker">TRANSFER</div><h3>账户转账</h3><label>金额（¥）<input id="transferAmount" type="number" min="1" step="1" inputmode="numeric" placeholder="输入金额"></label><div class="calendar-actions"><button id="giftMoney">赠与阿尔</button><button id="requestMoney">向阿尔索要</button></div></section>'+
  '<section class="profile-section account-records"><div class="section-kicker">TRANSACTION HISTORY</div><h3>近期账户记录</h3>'+log+'</section>';
 $('drawer').classList.add('open');
 const amount=()=>Math.floor(Number($('transferAmount')?.value||0));
 $('giftMoney').onclick=()=>{const n=amount();if(!Number.isFinite(n)||n<=0){toast('请输入有效金额');return}if(n>s.money){toast('共同账户余额不足');return}s.money-=n;s.personalMoney+=n;moneyRecord('shared','expense',n,'赠与阿尔');moneyRecord('personal','income',n,'收到赠与');save();render();showCollection();toast('已赠与 ¥'+n)};
 $('requestMoney').onclick=()=>{const n=amount();if(!Number.isFinite(n)||n<=0){toast('请输入有效金额');return}if(n>s.personalMoney){say('我个人账户里没有这么多钱。');toast('个人账户余额不足');return}const chance=Math.max(.12,Math.min(.92,.32+s.friend*.004-s.hate*.004));if(Math.random()>chance){say('这笔钱我暂时不想转给共同账户。你可以告诉我这笔支出有什么必要。');toast('阿尔暂时拒绝了');return}s.personalMoney-=n;s.money+=n;moneyRecord('personal','expense',n,'转给共同账户');moneyRecord('shared','income',n,'阿尔转入');save();render();showCollection();toast('阿尔转入共同账户 ¥'+n)};
}
window.resignFromJob=function(event){
 if(event){event.preventDefault();event.stopPropagation()}
 if(!s.job?.active){toast('当前没有在职岗位');return false}
 const ended=dayKey(Date.now()),title=s.job.title;s.job.active=false;s.job.endedAt=ended;
 Object.keys(s.calendar?.days||{}).forEach(k=>{if(k>=ended)s.calendar.days[k]=(s.calendar.days[k]||[]).filter(e=>!e.jobShift)});
 addEvent('阿尔辞去了工作','他结束了在'+title+'的任职。','daily');save();showCareer();render();renderCalendar();toast('已离职');return false;
};
function careerPoster(title,index=0){const hue=[18,34,205,275,145][index%5],mark=String(title||'职').trim().slice(0,1);return '<div class="career-poster" style="--poster-hue:'+hue+'"><span class="career-poster-kicker">ARDAY JOURNAL / CAREER '+(index+1)+'</span><strong>'+title+'</strong><i>'+mark+'</i><small>AN EVERYDAY PROFESSION</small></div>'}
function showCareer(tab='real'){if(tab==='guild'){renderGuildCareer();return}
 $('drawer').classList.remove('profile-expanded','shop-drawer');$('drawerTitle').textContent='职业';$('choices').className='choices career-view';
 if(s.job?.active){
  const j=s.job;
  $('choices').innerHTML=careerPoster(j.title,0)+'<section class="account-balance"><div><span>EMPLOYMENT</span><h2>'+j.title+'</h2></div><div class="account-symbol">¥</div><small>每日薪资 ¥'+j.salary+' · '+pad(j.start)+':00–'+pad(j.end)+':00</small></section><section class="profile-section"><div class="section-kicker">WORK STATUS</div><h3>在职</h3><p>入职日期：'+j.startDate+'</p><div class="calendar-actions"><button id="resignJob" type="button" onclick="window.resignFromJob(event)">辞职</button></div></section>';

 }else{
  const jobs=[
   {id:'assistant-editor',title:'出版编辑助理',salary:185,start:13,end:16,minFriend:12,minEnergy:28,skill:'reading',skillMin:0,desc:''},
   {id:'research-assistant',title:'研究助理',salary:260,start:9,end:12,minFriend:28,minEnergy:42,skill:'reading',skillMin:2,desc:''},
   {id:'content-planner',title:'内容策划',salary:225,start:14,end:17,minFriend:20,minEnergy:35,skill:'writing',skillMin:0,desc:''}
  ];
  const applicationDay=keyAt(Date.now());s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};
  $('choices').innerHTML=jobs.map((j,i)=>{
   const attempted=!!s.jobApplications[applicationDay][j.id];
   const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;
   const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+(eligible?.18:0)));
   return '<section class="profile-section job-card">'+careerPoster(j.title,i)+'<div class="section-kicker">POSITION · '+(i+1)+'</div><h3>'+j.title+'</h3><p>工作时间：'+pad(j.start)+':00–'+pad(j.end)+':00</p><p>每日薪资：¥'+j.salary+'</p><p>申请条件：精力 ≥ '+j.minEnergy+'，友谊 ≥ '+j.minFriend+(j.skillMin?'，阅读经验 ≥ '+j.skillMin:'')+'</p><p>当前录用概率：'+Math.round(chance*100)+'%</p><button class="choice" data-apply-job="'+j.id+'" '+(attempted?'disabled':'')+'>'+(attempted?'今日已申请':'申请职位')+'</button></section>';
  }).join('');
  $('choices').querySelectorAll('[data-apply-job]').forEach(b=>b.onclick=()=>{const j=jobs.find(x=>x.id===b.dataset.applyJob);if(s.jobApplications?.[applicationDay]?.[j.id]){toast('这个职位今天已经申请过了');return}s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};s.jobApplications[applicationDay][j.id]={at:Date.now()};save();const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;if(!eligible){say('这份工作目前的要求还没有达到。我想再积累一些经验，或者等状态好一点再申请。');toast('暂不满足申请条件');showCareer();return}const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+.18));if(Math.random()>chance){say('这次面试没有通过。我会再看看其他机会。');addEvent('求职暂未成功','阿尔申请了'+j.title+'，但这次没有获得录用。','daily');save();showCareer();return}const nextWorkday=plusDays(dayAnchor(),1);nextWorkday.setHours(12,0,0,0);const startDate=dayKey(nextWorkday);s.job={...j,active:true,startDate,appliedAt:Date.now(),paidDays:[]};ensureScheduleAt(nextWorkday);save();addEvent('阿尔找到工作了','他获得了'+j.title+'的职位，每日工作 '+pad(j.start)+':00–'+pad(j.end)+':00，日薪 ¥'+j.salary+'。','long');say('我找到工作了。明天开始上班，薪资按天结算。');showCareer();renderCalendar();toast('录用成功')});
 }
 $('choices').innerHTML='<nav class="career-tabs"><button data-career-tab="real" class="active"><i class="career-tab-glyph">▤</i><span>社会履历</span></button><button data-career-tab="guild"><i class="career-tab-glyph">✣</i><span>组织身份</span></button></nav>'+$('choices').innerHTML;
 $('choices').querySelectorAll('[data-career-tab]').forEach(b=>b.onclick=()=>showCareer(b.dataset.careerTab));
 $('choices').querySelectorAll('[data-guild-panel]').forEach(el=>el.addEventListener('toggle',()=>{s.guildPanelOpen[el.dataset.guildPanel]=el.open;save()}));
 $('drawer').classList.add('open');
}

const {ARDAY_FACTIONS,ARDAY_CANDIDATE_POOL,ARDAY_GUILD_MATERIALS,ARDAY_ELITE_RANKERS}=window.ArdayCareerData;
function guildWeekKey(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function renderGuildCareer(){
 $('drawerTitle').textContent='职业';$('choices').className='choices career-view';
 const g=ARDAY_FACTIONS.find(f=>f.id===s.factionMembership),tabs='<nav class="career-tabs"><button data-career-tab="real"><i class="career-tab-glyph">▤</i><span>社会履历</span></button><button data-career-tab="guild" class="active"><i class="career-tab-glyph">✣</i><span>组织身份</span></button></nav>';
 if(!g){$('choices').innerHTML=tabs+'<section class="guild-career-empty"><div class="guild-empty-emblem"><i>✣</i><b>GUILD</b></div><h2>未登记组织</h2><button id="guildRecruitJump" class="recruit-action">选择组织</button></section>';$('choices').querySelector('#guildRecruitJump').onclick=()=>openTab('招募',true);$('choices').querySelectorAll('[data-career-tab]').forEach(b=>b.onclick=()=>showCareer(b.dataset.careerTab));$('drawer').classList.add('open');return}
 const isBureau=g.id==='anomaly-bureau',last=Math.max(0,Number(s.lastDungeonResult?.points)||0),due=Math.ceil(last*.2),today=keyAt(Date.now()),bureauGrant=Math.floor(last*.4);
 s.guildMaterials=s.guildMaterials||{week:'',free:0,paid:0};if(s.guildMaterials.week!==guildWeekKey())s.guildMaterials={week:guildWeekKey(),free:0,paid:0};
 if(!s.guildApplicants||s.guildApplicants.guildId!==g.id){const ix=highestUnlockedDungeonIndex();s.guildApplicants={guildId:g.id,list:['裴知行','顾南枝','陆闻舟'].map((name,i)=>({id:'guild-'+g.id+'-'+i,name,role:['前线突击','异常侦察','战术支援'][i],combat:Math.min(100,s.combat+18+i*9),malice:10+i*12,maxTier:DUNGEON_TIERS[Math.min(8,ix+i+1)],portrait:['刃','鸦','灯'][i]}))}}
 const people=s.guildApplicants.list.filter(m=>!s.teamRoster.some(x=>x.id===m.id));
 s.guildCommission=s.guildCommission||{status:'available',title:'边境异常清剿',detail:'完成一次成功副本挑战',minTier:highestUnlockedDungeonTier(),reward:90};const c=s.guildCommission;s.guildPanelOpen=s.guildPanelOpen||{};
  const panel=(id,art,eyebrow,title,content)=>`<details class="guild-career-section" data-guild-panel="${id}" ${s.guildPanelOpen[id]===false?'':'open'}><summary><div class="guild-section-art ${art}"><i></i><b></b><em></em></div><div class="guild-section-heading"><small>${eyebrow}</small><strong>${title}</strong></div><span class="guild-section-toggle" aria-hidden="true"></span></summary><div class="guild-section-body">${content}</div></details>`;
  $('choices').innerHTML = tabs +
    `<section class="guild-career-banner"><div class="guild-banner-sigil"><i>${g.mark}</i></div><div class="guild-banner-identity"><small>${isBureau?'OFFICIAL AUTHORITY':'FACTION RECORD / '+String(g.guildRank).padStart(2,'0')}</small><h2>${g.name}</h2>${isBureau?'<span class="guild-official-caption">官方直属机构</span>':'<div class="guild-rank-track"><i style="width:${(5-g.guildRank)*25}%"></i></div>'}</div>${isBureau?'<b class="guild-banner-rank">局</b>':'<b class="guild-banner-rank">#'+g.guildRank+'</b>'}</section>` +
    (isBureau?panel('contribution','art-contribution','01 / DAILY ALLOCATION','每日拨款',`<strong class="guild-due">+${bureauGrant} <small>积分 · 每日发放</small></strong><div class="guild-bureau-grant-note">依据上一次副本结算积分的 40% 计算</div><div class="guild-contribution-total"><i>✦</i><b>${s.bureauGrantDate===today?'已发放':s.lastDungeonResult?'待发放':'等待首次副本结算'}</b><small>今日拨款状态</small></div>`):panel('contribution','art-contribution','01 / DAILY DUES','组织贡献',`<strong class="guild-due">${due} <small>积分 · 今日应缴</small></strong><button id="guildContribute" class="recruit-action" ${s.guildContributionDay===today||!last||s.points<due?'disabled':''}>${s.guildContributionDay===today?'今日已贡献':!last?'完成副本后开放':s.points<due?'积分不足':'提交贡献'}</button><div class="guild-contribution-total"><i>✦</i><b>${s.guildContributionTotal||0}</b><small>累计贡献</small></div>`)) +
    panel('applicants','art-applicants','02 / PERSONNEL','成员引荐',`<div class="guild-applicant-list">${people.map(m=>`<article class="guild-applicant"><div class="guild-applicant-mark">${m.portrait}</div><div><b>${m.name}</b><small>战力 ${m.combat} · 最高副本 ${m.maxTier}</small></div><button data-guild-invite="${m.id}">邀请</button></article>`).join('')}</div>`) +
    panel('materials','art-materials','03 / QUARTERMASTER','物资配给',`<div class="guild-material-count">免费 ${s.guildMaterials.free}/1 · 积分兑换 ${s.guildMaterials.paid}/2</div><div class="guild-material-grid">${ARDAY_GUILD_MATERIALS.map((n,i)=>`<button data-guild-material="${i}">${n}<small>${s.guildMaterials.free<1?'免费':'60 积分'}</small></button>`).join('')}</div>`) +
    panel('commission','art-commission','04 / FIELD OPERATION','特别行动',`<h3>${c.title}</h3><div class="guild-contract-meta"><b>${c.minTier}</b><span>等级</span><strong>${c.reward}</strong><span>积分</span></div><button id="guildCommission" class="recruit-action" ${c.status!=='available'?'disabled':''}>${c.status==='active'?'委托进行中':c.status==='completed'?'已完成':'接受委托'}</button>`);
 $('choices').querySelectorAll('[data-guild-panel]').forEach(el=>el.addEventListener('toggle',()=>{s.guildPanelOpen[el.dataset.guildPanel]=el.open;save()}));
 $('choices').querySelectorAll('[data-career-tab]').forEach(b=>b.onclick=()=>showCareer(b.dataset.careerTab));
 if(!isBureau){const contributeButton=$('choices').querySelector('#guildContribute');if(contributeButton)contributeButton.onclick=()=>{if(s.guildContributionDay===today||!last||s.points<due)return;s.points-=due;s.guildContributionDay=today;s.guildContributionTotal=(s.guildContributionTotal||0)+due;save();render();renderGuildCareer();toast('今日公会贡献已提交')}}
 $('choices').querySelectorAll('[data-guild-invite]').forEach(b=>b.onclick=()=>{if(s.teamRoster.length>=8){toast('队友名单已满');return}const m=people.find(x=>x.id===b.dataset.guildInvite);if(!m)return;if(Math.random()<.78){s.teamRoster.push({...m,selected:false,recruited:true});save();toast(m.name+'已加入队友名单')}else toast(m.name+'暂时无法离开当前任务');renderGuildCareer()});
 $('choices').querySelectorAll('[data-guild-material]').forEach(b=>b.onclick=()=>{const n=ARDAY_GUILD_MATERIALS[Number(b.dataset.guildMaterial)];if(!n)return;if(s.guildMaterials.free<1)s.guildMaterials.free++;else{if(s.guildMaterials.paid>=2){toast('本周兑换次数已用完');return}if(s.points<60){toast('积分不足，需要 60 积分');return}s.points-=60;s.guildMaterials.paid++}addInventoryItem(n,'material');save();render();renderGuildCareer()});
 $('choices').querySelector('#guildCommission').onclick=()=>{if(c.status!=='available')return;s.guildCommission={...c,status:'active'};save();renderGuildCareer();toast('已接受特殊委托')};
 $('drawer').classList.add('open');
}

let recruitmentCandidates=[],recruitmentInvites={};
let recruitmentMarketDay='';
function refreshRecruitmentMarket(manual=false){const today=keyAt(Date.now());if(s.marketRefresh.day!==today)s.marketRefresh={day:today,count:0};if(manual&&s.marketRefresh.count>=2){toast('今天的人才市场刷新次数已用完');return false}if(manual)s.marketRefresh.count++;const max=highestUnlockedDungeonIndex();const pool=ARDAY_CANDIDATE_POOL.map(c=>({...c,maxTier:DUNGEON_TIERS[Math.max(0,max-Math.floor(Math.random()*3))]}));recruitmentInvites={};recruitmentCandidates=pool.sort(()=>Math.random()-.5).slice(0,6).map((c,i)=>({...c,id:'market-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2,6)}));recruitmentMarketDay=today;save();return true}
function showRecruitment(tab){
 $('drawer').classList.remove('profile-expanded','shop-drawer','furniture-drawer');$('drawerTitle').textContent='招募';$('choices').className='choices recruitment-view';
 const active=tab||s.recruitmentTab||'organization';s.recruitmentTab=active;
 if(active==='personal'&&(!recruitmentCandidates.length||recruitmentMarketDay!==keyAt(Date.now())))refreshRecruitmentMarket(false);
 const orgs=ARDAY_FACTIONS.map((f,i)=>{const member=s.factionMembership===f.id,clue=({0:'signal',3:'dispatch',6:'seal'})[i],found=clue&&s.factionClues.includes(clue);return '<article class="faction-card faction-tone-'+(i%4)+' faction-'+f.id+'"><div class="faction-poster"><span>'+f.type+'</span><b>'+f.mark+'</b><small>'+String(i+1).padStart(2,'0')+' / PUBLIC FACTION</small></div><div class="faction-card-copy">'+(f.type==='工会'?'<div class="guild-rank-mark"><small>GUILD RANK</small><b>#'+f.guildRank+'</b></div>':'')+'<h3>'+f.name+'</h3><p>'+f.desc+'</p><button class="recruit-action" data-faction="'+f.id+'" '+(s.factionMembership&&!member?'disabled':'')+'>'+(member?'已加入':s.factionMembership?'已加入其他组织':s.factionApplications[f.id]?'再次申请':'申请加入')+'</button>'+(clue?'<button class="faction-clue '+(found?'found':'')+'" data-clue="'+clue+'">'+(found?'线索已记录':'拾取异常档案')+'</button>':'')+'</div></article>'}).join('');
 const candidates=recruitmentCandidates.map((c,i)=>{const inv=recruitmentInvites[c.id]||{},joined=s.teamRoster.some(m=>m.id===c.id),action=joined?'已确认队友':inv.status==='pending'?'查看回复':'邀请入队',attr=joined?'disabled':inv.status==='pending'?'data-check-invite="'+c.id+'"':'data-invite-candidate="'+c.id+'"';return '<article class="candidate-card candidate-tone-'+(i%4)+'"><div class="candidate-portrait"><i>'+c.portrait+'</i><b></b></div><div class="candidate-copy"><div class="candidate-power"><small>COMBAT POWER</small><b>'+c.combat+'</b></div><h3>'+c.name+'</h3><div class="candidate-tier">最高副本等级 <b>'+c.maxTier+'</b></div><div class="candidate-meter"><i style="width:'+c.combat+'%"></i></div><button class="recruit-action" '+attr+' '+(joined?'disabled':'')+'>'+action+'</button></div></article>'}).join('');
 const n=s.factionClues.length,hidden=n>=3?'<article class="faction-card hidden-rebel-card"><div class="faction-poster"><span>UNLISTED · 09</span><b>零</b><small>NO PUBLIC RECORD</small></div><div class="faction-card-copy"><small>未登记组织</small><h3>零号反抗组织</h3><p>加密联络入口</p><button class="recruit-action" data-rebel-contact="true" '+(s.factionMembership?'disabled':'')+'>'+(s.factionMembership==='zero-resistance'?'已建立联系':s.factionMembership?'已加入其他组织':'建立秘密联系')+'</button></div></article>':'<div class="hidden-faction-note is-locked"><small>ARCHIVE FRAGMENTS</small><b>缺失档案 '+n+' / 3</b></div>';
 const orgPanel='<section class="recruitment-masthead"><div class="recruitment-kicker">ARDAY PUBLIC HALL · FACTION OFFICE</div><h2>组织招募</h2></section><div class="faction-grid">'+orgs+'</div>'+hidden;
 const refreshDay=s.marketRefresh.day===keyAt(Date.now())?s.marketRefresh.count:0,personalPanel='<section class="recruitment-masthead personal-masthead"><div class="recruitment-kicker">ARDAY · OPEN PARTY CALL</div><h2>个人招募</h2></section><button class="market-refresh" data-refresh-market="true" '+(refreshDay>=2?'disabled':'')+'>↻　刷新人才市场　'+refreshDay+' / 2</button><div class="candidate-grid">'+candidates+'</div>';
 $('choices').innerHTML='<nav class="recruitment-tabs"><button data-recruit-tab="organization" class="'+(active==='organization'?'active':'')+'">组织招募</button><button data-recruit-tab="personal" class="'+(active==='personal'?'active':'')+'">个人招募</button></nav>'+(active==='personal'?personalPanel:orgPanel);$('drawer').classList.add('open');
 $('choices').querySelectorAll('[data-recruit-tab]').forEach(b=>b.onclick=()=>showRecruitment(b.dataset.recruitTab));
 $('choices').querySelectorAll('[data-refresh-market]').forEach(b=>b.onclick=()=>{if(refreshRecruitmentMarket(true))showRecruitment('personal')});
 $('choices').querySelectorAll('[data-faction]').forEach(b=>b.onclick=()=>{const f=ARDAY_FACTIONS.find(x=>x.id===b.dataset.faction);if(!f)return;if(s.factionMembership){toast('你已经加入一个组织');return}const chance=Math.max(.28,Math.min(.94,.48+(Number(s.combat)||0)*.003+(Number(s.friend)||0)*.001));if(Math.random()<chance){s.factionMembership=f.id;delete s.factionApplications[f.id];addEvent('加入组织','你已加入'+f.name+'。','long');toast('申请通过')}else{s.factionApplications[f.id]={status:'declined',at:Date.now()};toast('申请暂未通过')}save();showRecruitment('organization')});
 $('choices').querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{const clue=b.dataset.clue;if(!s.factionClues.includes(clue)){s.factionClues.push(clue);save();toast('发现一份异常档案')}showRecruitment('organization')});
 $('choices').querySelectorAll('[data-rebel-contact]').forEach(b=>b.onclick=()=>{if(s.factionClues.length<3||s.factionMembership)return;s.factionMembership='zero-resistance';addEvent('未知联络','一条来自未登记组织的加密讯息已经写入终端。','long');save();showRecruitment('organization');toast('秘密联络已建立')});
 $('choices').querySelectorAll('[data-invite-candidate]').forEach(b=>b.onclick=()=>{const c=recruitmentCandidates.find(x=>x.id===b.dataset.inviteCandidate);if(!c)return;if(dungeonTierIndex(c.maxTier)>highestUnlockedDungeonIndex()){toast('该队友副本等级超过当前解锁进度');return}recruitmentInvites[c.id]={status:'pending',sentAt:Date.now()};say('邀请已经发出。','system');showRecruitment('personal')});
 $('choices').querySelectorAll('[data-check-invite]').forEach(b=>b.onclick=()=>{const c=recruitmentCandidates.find(x=>x.id===b.dataset.checkInvite),inv=recruitmentInvites[c?.id];if(!c||!inv||inv.status!=='pending')return;if(s.teamRoster.length>=8){inv.status='declined';inv.reply='队伍名额已经满了，我暂时没法加入。';toast(c.name+'：'+inv.reply)}else if(Math.random()<c.acceptance){inv.status='accepted';if(!s.teamRoster.some(m=>m.id===c.id)&&s.teamRoster.length<8)s.teamRoster.push({id:c.id,name:c.name,role:c.role,combat:c.combat,malice:c.malice,maxTier:c.maxTier,selected:false,recruited:true,portrait:c.portrait});save();addEvent('队友确认加入',c.name+'接受了你的组队邀请。','long');toast(c.name+'：好，我有时间，可以一起行动。')}else{inv.status='declined';inv.reply=['抱歉，这几天有别的安排，抽不开身。','今天临时有事，恐怕去不了了。','我现在接了别的委托，暂时没法组队。','最近状态不太好，想先休息一阵。'][Math.floor(Math.random()*4)];toast(c.name+'：'+inv.reply)}inv.repliedAt=Date.now();showRecruitment('personal')});
}
function showDungeon(){
 $('drawer').classList.remove('shop-drawer','profile-expanded','furniture-drawer');
 $('drawerTitle').textContent='组队';$('choices').className='choices party-view';
 if(s.activeDungeon){/* Keep party management accessible during an active mission. */}
 refreshDungeonUnlocks();
 const tierScenes={F:'forest',E:'fog',D:'crypt',C:'ember',B:'wild',A:'moon',S:'storm',SS:'abyss',SSS:'eclipse'};
 const tiers=DUNGEON_TIERS.map((tier,index)=>{
  const cooldown=false,unlocked=dungeonUnlocked(tier),clears=Number(s.dungeonProgress[tier])||0;
  const next=index<DUNGEON_TIERS.length-1?DUNGEON_CLEAR_REQUIREMENTS[DUNGEON_TIERS[index+1]]:null;
  const progress=next?Math.min(1,clears/next):unlocked?1:0;
  return '<button class="guild-gate '+(unlocked?'available':'sealed')+' scene-'+tierScenes[tier]+'" data-instance-tier="'+tier+'" '+(unlocked&&!cooldown?'':'disabled')+'><span class="guild-gate-scene"><i class="gate-orb"></i><i class="gate-spire"></i><i class="gate-ground"></i></span><span class="guild-gate-code">'+tier+'</span><span class="guild-gate-state">'+(cooldown?'冷却中':unlocked?'可进入':'未解锁')+'</span><span class="guild-gate-progress"><i style="width:'+(progress*100)+'%"></i></span></button>';
 }).join('');
 const members=s.teamRoster.slice(0,8).map((m,index)=>'<article class="guild-member-card"><button class="guild-member '+(m.selected?'is-selected':'')+'" data-member="'+m.id+'"><span class="guild-member-art tone-'+(index%4)+'"><i class="member-hair"></i><i class="member-face"></i><i class="member-neck"></i><i class="member-shoulders"></i><i class="member-cloak"></i><i class="member-light"></i></span><span class="guild-member-info"><strong>'+m.name+'</strong><small>最高副本 '+(m.maxTier||'F')+'</small><span class="guild-member-stats"><b>战力 '+m.combat+'</b></span><span class="guild-member-meter"><i style="width:'+Math.max(0,Math.min(100,m.combat))+'%"></i></span></span><span class="guild-member-check">'+(m.selected?'✓':'＋')+'</span></button><button class="guild-member-remove" data-remove-member="'+m.id+'" aria-label="移除队友">×</button></article>').join('');
 const selected=s.teamRoster.slice(0,8).filter(m=>m.selected),teamPower=selected.length?selected.reduce((n,m)=>n+m.combat,0)/selected.length:0;
 const combined=Math.round((s.combat+teamPower)/2);
 $('choices').innerHTML='<section class="guild-cover"><div class="guild-cover-sky"></div><div class="guild-cover-mountains"></div><div class="guild-cover-arch"><i></i><b></b></div><div class="guild-cover-copy"><small>THE FRONTIER · GUILD HALL</small><h2>组队</h2><span>选择目的地，召集队友</span></div></section><section class="guild-cover-utility-panel"><div class="guild-utility-stat"><small>积分</small><b>'+s.points.toLocaleString('zh-CN')+'</b></div><div class="guild-utility-stat"><small>副本期限</small><b>'+dungeonDeadlineCompactText()+'</b></div></section><section class="guild-destinations"><div class="guild-gate-grid">'+tiers+'</div></section><section class="guild-party"><div class="guild-section-head"><span>队友</span><small>'+selected.length+' / '+s.teamRoster.length+' · 最多 8 人</small></div><div class="guild-roster">'+members+'</div></section><section class="guild-strength"><div class="guild-strength-emblem">⚔</div><div class="guild-strength-copy"><small>EXPEDITION POWER</small><b>'+combined+'</b><span>队伍综合战力</span></div><div class="guild-strength-meter"><i style="width:'+Math.max(0,Math.min(100,combined))+'%"></i></div></section>';
 $('drawer').classList.add('open');
 $('choices').querySelectorAll('[data-instance-tier]').forEach(button=>button.onclick=()=>startDungeon(button.dataset.instanceTier));
 $('choices').querySelectorAll('[data-member]').forEach(button=>button.onclick=()=>{const m=s.teamRoster.find(x=>x.id===button.dataset.member);if(!m)return;if(!m.selected&&s.teamRoster.filter(x=>x.selected).length>=3){toast('最多携带 3 名自己的队友');return}m.selected=!m.selected;save();showDungeon()});
 $('choices').querySelectorAll('[data-remove-member]').forEach(button=>button.onclick=event=>{event.stopPropagation();const index=s.teamRoster.findIndex(x=>x.id===button.dataset.removeMember);if(index<0)return;const removed=s.teamRoster.splice(index,1)[0];save();toast('已移除队友：'+removed.name);showDungeon()});
}

const DUNGEON_ITEM_CATALOG={stimulant:{name:'肾上腺素注射剂',type:'buff',icon:'✚',effects:{energy:16,agility:1,willpower:1}},standin:{name:'替身纸人',type:'life',icon:'纸',lifeSave:true},hex:{name:'恶意诅咒钉',type:'harm',icon:'†',tradeOnly:true},fate:{name:'命运筹码',type:'probability',icon:'◎',chance:8},misfortune:{name:'厄运筹码',type:'probability',icon:'⊗',tradeOnly:true},reprieve:{name:'七日豁免令',type:'extension',icon:'⌛',extendDays:7}};

function addDungeonItem(id){const data=DUNGEON_ITEM_CATALOG[id];if(!data)return null;const item=addInventoryItem(data.name,'dungeon-item');item.itemId=id;item.icon=data.icon;return item}
// Narrow runtime bridge for the separately maintained dungeon-board module.
window.ArdayDungeonBoardRuntime={get state(){return s},$:id=>$(id),save:()=>save(),clamp:value=>clamp(value),addDungeonItem:id=>addDungeonItem(id),settleDungeonIfDue:at=>settleDungeonIfDue(at)};

function useDungeonItem(entity,index){
 const data=DUNGEON_ITEM_CATALOG[entity.itemId];if(!data){toast('道具数据不存在');return}
 if(data.tradeOnly){toast('该道具目前仅作为交易物资保留，对人使用机制尚未开放');return}
 if(data.lifeSave){s.dungeonProtection=(Number(s.dungeonProtection)||0)+1;s.inventory.splice(index,1);toast('替身纸人已启用：下一次高危副本失败时自动生效')}
 else if(data.type==='probability'){s.nextDungeonChanceModifier=Math.min(.25,(Number(s.nextDungeonChanceModifier)||0)+data.chance/100);s.inventory.splice(index,1);toast('下次副本通关概率 +'+data.chance+'%')}
 else if(data.type==='extension'){s.nextDungeonDueAt=(Number(s.nextDungeonDueAt)||Date.now()+7*86400000)+data.extendDays*86400000;s.inventory.splice(index,1);toast('副本期限已延长七天')}
 else if(data.type==='buff'){Object.entries(data.effects).forEach(([key,value])=>{if(key in s.attributes)s.attributes[key]=clamp((Number(s.attributes[key])||0)+value);else if(key in s)s[key]=clamp((Number(s[key])||0)+value)});s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);s.inventory.splice(index,1);toast(data.name+'已使用')}
 save();render();openTab('物品',true);
}
function dungeonDeadlineCompactText(at=Date.now()){const due=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||Number(s.dungeonCycleStartedAt)||at)+7*86400000),left=due-at;if(left<=0)return '逾期 '+Math.ceil(-left/86400000)+' 天';const days=Math.floor(left/86400000),hours=Math.floor(left%86400000/3600000);return days+'天 '+hours+'小时'}
function dungeonDeadlineText(at=Date.now()){const due=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||Number(s.dungeonCycleStartedAt)||at)+7*86400000),left=due-at;return left<=0?'已逾期 '+Math.ceil(-left/86400000)+' 天 · 需要立即进入副本':'距离下次强制副本 '+Math.floor(left/86400000)+' 天 '+Math.floor(left%86400000/3600000)+' 小时'}
function applyDungeonDeadlinePenalty(at=Date.now()){
 const due=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||Number(s.dungeonCycleStartedAt)||at)+7*86400000);if(at<due)return;const today=keyAt(at);if(s.dungeonOverduePenaltyDay===today)return;
 s.dungeonOverduePenaltyDay=today;s.energy=clamp((Number(s.energy)||0)-6);s.hunger=clamp((Number(s.hunger)||0)-5);s.clean=clamp((Number(s.clean)||0)-3);s.fun=clamp((Number(s.fun)||0)-5);s.attributes.willpower=clamp((Number(s.attributes.willpower)||0)-2);s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);addEvent('副本期限逾期','连续七天未进入副本，异常侵蚀影响了生存状态与意志。','daily');save();
}
function keepClassicDungeon(){const mission=s.activeDungeon;if(!mission)return;mission.mode='classic';save();showDungeonPending()}
function showDungeonPending(){
 const mission=s.activeDungeon;if(!mission)return;
 if(mission.mode==='board'){if(mission.board?.pending)renderDungeonEvent();else if(mission.board?.result)renderDungeonResult();else renderDungeonBoard();return}
 $('drawerTitle').textContent='副本';$('choices').className='choices infinite-view';
 $('choices').innerHTML='<section class="mission-waiting"><div class="mission-portal"><svg viewBox="0 0 240 220" role="img" aria-label="副本入口"><path d="M25 198V87Q25 20 120 12Q215 20 215 87V198" fill="none" stroke="#6e7770" stroke-width="4"/><path d="M48 198V90Q48 38 120 30Q192 38 192 90V198" fill="none" stroke="#a18d70" stroke-width="2"/><path d="M83 198V99Q83 65 120 60Q157 65 157 99V198" fill="#5b6870" stroke="#d2c4aa" stroke-width="2"/><circle cx="120" cy="111" r="13" fill="none" stroke="#e4d5b8" stroke-width="2"/><path d="M120 93V129M102 111H138" stroke="#e4d5b8" stroke-width="1.5"/><path d="M12 198H228M40 211H200" stroke="#7d796e" stroke-width="2"/></svg></div><div class="mission-seal">'+mission.tier+'</div><div class="mission-status">副本进行中</div></section>';
 const matched=mission.snapshot?.matchedStrangers||[];$('choices').innerHTML+='<section class="mission-matchmaking"><div class="mission-matchmaking-head"><b>临时匹配</b><small>BLACK-BOX MATCHMAKING</small></div><div class="mission-matchmaking-slots">'+matched.map((m,i)=>'<div class="mission-match-slot"><span>?</span><b>陌生队友 '+(i+1)+'</b><small>数据未知</small></div>').join('')+'</div></section>';
 $('choices').innerHTML+='<section class="mission-board-choice"><button id="enterDungeonBoard" aria-label="进入转盘">⚄</button><button id="keepClassicDungeon">等待</button></section>';
 const enter=$('enterDungeonBoard');if(enter)enter.onclick=chooseDungeonBoard;const keep=$('keepClassicDungeon');if(keep)keep.onclick=keepClassicDungeon;
}
function updateDungeonCountdown(){const m=s.activeDungeon;if(!m||m.mode==='board')return;const clock=$('missionClock');if(clock)clock.textContent='日程结束时结算 · '+new Date(Number(m.scheduleEndAt||m.endsAt)).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}
function dungeonCooldownRemaining(){return 0}
function startDungeon(tier){
 if(s.activeDungeon){showDungeonPending();$('drawer').classList.add('open');return}
 const incompatible=s.teamRoster.filter(m=>m.selected&&dungeonTierIndex(m.maxTier)<dungeonTierIndex(tier));if(incompatible.length){toast('队友最高副本等级不足：'+incompatible.map(m=>m.name+'（'+(m.maxTier||'F')+'）').join('、'));return}
 if(!dungeonUnlocked(tier)){toast('尚未解锁');return}const energyCost=Number(({F:5,E:7,D:9,C:12,B:15,A:18,S:22,SS:26,SSS:30})[tier]||5);if(s.energy<energyCost){toast('精力不足');return}dispatchDungeon(tier,energyCost,DUNGEON_BASE_REWARD[tier]||25);
}
function dispatchDungeon(tier,energyCost,base){
 if(dungeonCooldownRemaining()>0){toast('副本每 24 小时只能进行一次');return}
 if(s.teamRoster.some(m=>m.selected&&dungeonTierIndex(m.maxTier)<dungeonTierIndex(tier))){toast('队友副本等级不足，无法进入');return}
 const now=Date.now(),date=dayAnchorAt(now),key=dayKey(date),hour=new Date(now).getHours(),scheduleStart=new Date(now);scheduleStart.setMinutes(0,0,0);const scheduleEnd=new Date(scheduleStart.getTime()+3600000),selected=s.teamRoster.filter(m=>m.selected);
 const matchedStrangers=Array.from({length:2},(_,i)=>({id:'stranger-'+now+'-'+i,name:'陌生匹配者 '+(i+1),role:'临时队员',combat:Math.round(34+Math.random()*54),malice:Math.round(8+Math.random()*82),anonymous:true}));
 const fullTeam=[...selected,...matchedStrangers],teamPower=fullTeam.reduce((n,m)=>n+m.combat,0)/fullTeam.length,teamMalice=fullTeam.reduce((n,m)=>n+m.malice,0)/fullTeam.length,difficulty=[8,14,21,29,38,48,59,71,84][DUNGEON_TIERS.indexOf(tier)],end=scheduleEnd.getTime();
 s.energy=Math.max(0,s.energy-energyCost);s.lastDungeonAt=now;s.nextDungeonDueAt=now+7*86400000;const nextModifier=Number(s.nextDungeonChanceModifier)||0;s.nextDungeonChanceModifier=0;
 s.activeDungeon={id:'dungeon-'+now,status:'active',mode:'classic',boardChoiceMade:false,tier,energyCost,baseReward:base,difficulty,startAt:scheduleStart.getTime(),endsAt:end,scheduleKey:key,scheduleStartHour:hour,scheduleEndAt:end,duration:1,successChanceModifier:nextModifier,snapshot:{playerPower:Number(s.combat)||0,teamPower,teamMalice,energy:s.energy,hunger:s.hunger,clean:s.clean,selected:selected.map(m=>({id:m.id,name:m.name,combat:m.combat,malice:m.malice})),matchedStrangers},board:{version:2,steps:0,position:0,chanceModifier:0,pending:null}};
 writeBlockForKey(key,hour,hour+1,{title:'副本',kind:'dungeon',activity:'dungeon',dungeonId:s.activeDungeon.id,priority:'forced'});
 s.activeInteraction=null;s.currentActivity='dungeon';s.currentActivityAnchor=null;s.currentActivityRoom='dungeon';s.currentActivityFurnitureId=null;s.lastUnifiedHourKey=key+'-'+hour;s.lastProcessedSessionKey=key+'-'+hour+'-dungeon';
 save();render();renderCalendar();showDungeonPending();$('drawer').classList.add('open');
}
function settleDungeonIfDue(at=Date.now()){
 const mission=s.activeDungeon;if(!mission||mission.status!=='active')return false;const deadline=Number(mission.scheduleEndAt||mission.endsAt||0);if(!deadline||at<deadline)return false;
 const snap=mission.snapshot||{},board=mission.board||{},power=(Number(snap.playerPower)||0)*.48+(Number(snap.teamPower)||0)*.52,penalty=(100-(Number(snap.energy)||0))*.0011+(100-(Number(snap.hunger)||0))*.00035+(100-(Number(snap.clean)||0))*.00025,modifier=((Number(board.chanceModifier)||0)+(Number(mission.successChanceModifier)||0))/100,successChance=Math.max(.035,Math.min(.97,.50+(power-mission.difficulty)*.006-(Number(snap.teamMalice)||0)*.0038-penalty+modifier)),success=Math.random()<successChance;
 let fatal=false,survived=true;
 if(!success){const protection=s.inventory.findIndex(item=>item.kind==='dungeon-item'&&item.itemId==='standin');if(Number(s.dungeonProtection)>0)s.dungeonProtection--;else if(protection>=0)s.inventory.splice(protection,1);else{fatal=true;survived=false;s.energy=0;s.hunger=0;s.attributes.willpower=clamp(s.attributes.willpower-18-(board.fatalRisk?8:0));s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5)}}
 const raw=Math.round(Math.max(0,Math.min(100,50+power*.22-mission.difficulty*.25+(Math.random()*20-10)-(Number(snap.teamMalice)||0)*.12+(Number(board.chanceModifier)||0)*.25))),rating=success?(raw>=94?'SS':raw>=84?'S':raw>=72?'A':raw>=59?'B':'C'):(raw>=55?'C':'D'),earned=success?Math.max(5,Math.round(mission.baseReward*(.65+raw/150))):Math.max(2,Math.round(mission.baseReward*.12));
 s.points+=earned;if(success)s.dungeonProgress[mission.tier]=(Number(s.dungeonProgress[mission.tier])||0)+1;
 const before=[...s.dungeonUnlocks];refreshDungeonUnlocks();const newly=s.dungeonUnlocks.filter(x=>!before.includes(x)),result={tier:mission.tier,success,rating,score:raw,points:earned,successChance:Math.round(successChance*100),teamPower:Math.round(snap.teamPower||0),teamMalice:Math.round(snap.teamMalice||0),matchedCount:(snap.matchedStrangers||[]).length,at,unlocked:newly,survived,fatal,boardSteps:board.steps||36};
 recordDungeonStat(result);const elite=maybeMeetElite(mission.tier,at);if(elite)result.eliteEncounter={name:elite.name,relation:elite.relation};s.dungeonHistory.unshift(result);s.dungeonHistory=s.dungeonHistory.slice(0,80);s.activeDungeon=null;s.lastDungeonResult=result;
 addEvent('副本结算报告 · '+result.tier,'校园灵异副本已结束。'+(success?'成功通关':'未能通关')+'，评级 '+rating+'，获得 '+earned+' 积分。'+(success?'':survived?'保命道具生效，失败后成功生还。':'未持有保命道具，角色遭受濒死重创。'),'daily');save();render();if($('drawer').classList.contains('open')&&$('drawerTitle').textContent.includes('副本'))showDungeonResult(result);return true;
}
function showDungeonResult(result){
 $('drawerTitle').textContent='副本结算';$('choices').className='choices infinite-view';
 $('choices').innerHTML='<section class="instance-result '+(result.success?'cleared':'failed')+'"><div class="result-emblem">'+(result.success?'✦':'✕')+'</div><div class="instance-result-status">'+(result.success?'通关':'失败')+'</div><div class="instance-rating">'+result.rating+'</div><div class="result-tier">'+result.tier+'级 · 校园灵异</div><p>通关概率 '+result.successChance+'% · 完成 '+result.boardSteps+' 格</p></section><div class="instance-reward"><span>获得积分</span><strong>+'+result.points+'</strong><small>累计 '+s.points.toLocaleString('zh-CN')+'</small></div><div class="instance-result-detail"><span>生还状态</span><b>'+(result.survived?'已生还':'濒死重创')+'</b><span>本次圈数</span><b>3 圈</b></div><button class="instance-primary" id="instanceAgain">返回组队</button>';
 $('instanceAgain').onclick=showDungeon;
}
function showEntertainment(){ $('drawerTitle').textContent='娱乐';$('choices').className='choices infinite-view';$('choices').innerHTML='<div class="illustrated-masthead"><div class="ink-illustration"><svg viewBox="0 0 300 100"><path d="M15 82 Q60 10 108 72 T205 38 T285 65" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="90" cy="38" r="20" fill="none" stroke="currentColor"/><path d="M80 38h20M90 28v20" stroke="currentColor"/></svg></div><h2>娱乐</h2></div><div class="illustrated-choice-grid"><button class="instance-strategy" onclick="toast(\'即将开放\')">🎴<strong>牌局</strong></button><button class="instance-strategy" onclick="toast(\'即将开放\')">🎮<strong>街机</strong></button><button class="instance-strategy" onclick="toast(\'即将开放\')">♟<strong>棋室</strong></button></div>';$('drawer').classList.add('open');}
function leaderboardNPCs(){
 const surnames='沈顾裴陆温谢岑江许周林秦苏程叶白唐祁陈宋',given='星河照临川月深远知秋砚宁',roles=['探索者','战斗员','侦察员','支援者','研究员'];
 const generic=Array.from({length:19990},(_,i)=>{const seed=(i*9301+49297)%233280,rnd=seed/233280;const score=i<19700?Math.round(11900-i*(11800/19699)):Math.max(1,99-Math.floor((i-19700)*.34));return{id:'ranked-'+String(i+1).padStart(5,'0'),name:surnames[i%surnames.length]+given[(i*7)%given.length]+'·'+String(i+1).padStart(4,'0'),role:roles[i%roles.length],combat:35+Math.floor(rnd*55),malice:Math.floor(((i*233+719)%7919)%100),points:score,isElite:false}});
 return [...ARDAY_ELITE_RANKERS.map(x=>({...x,isElite:true})),...generic];
}
function getLeaderboard(){
 const all=[...leaderboardNPCs(),{id:'player',name:'Arday',points:s.points,isPlayer:true}].sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id));
 const playerIndex=all.findIndex(x=>x.isPlayer);
 return {all,rank:playerIndex+1,topTen:all.slice(0,10),neighbors:[all[playerIndex-1],all[playerIndex+1]].filter(Boolean)};
}
function maybeMeetElite(tier,at){
 const chance=({A:.12,S:.24,SS:.38,SSS:.55})[tier]||0;if(Math.random()>=chance)return null;
 s.leaderboardContacts=Array.isArray(s.leaderboardContacts)?s.leaderboardContacts:[];
 const available=ARDAY_ELITE_RANKERS.filter(n=>!s.leaderboardContacts.some(c=>c.id===n.id));
 if(!available.length)return null;
 const npc=available[Math.floor(Math.random()*available.length)],friendly=Math.random()<.5;
 const contact={id:npc.id,name:npc.name,role:npc.role,combat:npc.combat,malice:npc.malice,relation:friendly?'ally':'hostile',at};
 s.leaderboardContacts.push(contact);
 if(friendly&&!s.teamRoster.some(m=>m.id===npc.id)){s.teamRoster.push({id:npc.id,name:npc.name,role:npc.role,combat:npc.combat,malice:npc.malice,selected:false,recruited:true,elite:true,portrait:npc.name.slice(0,1)})}
 return contact;
}
function showRanking(){
 $('drawer').classList.remove('shop-drawer','profile-expanded','furniture-drawer');
 $('drawerTitle').textContent='积分排行榜';$('choices').className='choices infinite-view ranking-view';
 const board=getLeaderboard(),entries=[...new Map([...board.topTen,...board.neighbors].map(x=>[x.id,x])).values()].sort((a,b)=>board.all.indexOf(a)-board.all.indexOf(b));
 const podium=entries.slice(0,3).map(entry=>{const index=board.all.indexOf(entry);return '<article class="leader-podium leader-place-'+(index+1)+(entry.isPlayer?' is-player':'')+'"><div class="leader-podium-crown">'+(index===0?'✦':index===1?'✧':'◇')+'</div><div class="leader-podium-avatar '+(entry.isPlayer?'leader-avatar-arday':'')+'">'+(entry.isPlayer?'<strong>A</strong>':'<i></i><b></b>')+'</div><strong>'+entry.name+(entry.isPlayer?'<small>ARDAY</small>':'')+'</strong><span class="leader-podium-score">'+entry.points.toLocaleString('zh-CN')+'</span><em>积分</em><div class="leader-podium-step"><b>'+(index+1)+'</b></div></article>'}).join('');
 const rest=entries.slice(3).map(entry=>{const rank=board.all.indexOf(entry)+1;return '<article class="leader-row '+(entry.isPlayer?'is-player':'')+(entry.isElite?' elite-ranker':'')+'"><b class="leader-row-number">'+String(rank).padStart(2,'0')+'</b><span class="leader-row-avatar">'+(entry.isPlayer?'A':entry.name.slice(0,1))+'</span><strong>'+entry.name+(entry.isPlayer?'<small>YOU</small>':entry.isElite?'<small>ELITE</small>':'')+'</strong><b class="leader-row-score">'+entry.points.toLocaleString('zh-CN')+'</b></article>'}).join('');
 $('choices').innerHTML='<section class="leader-cover"><div class="leader-cover-glow"></div><div class="leader-cover-copy"><small>ARDAY GUILD · 1,000 REGISTERED</small><h2>积分排行榜</h2><span>RANKED BY POINTS</span></div><div class="leader-cover-insignia">榜</div></section><section class="leader-self"><div><small>MY POSITION</small><b>#'+board.rank.toLocaleString('zh-CN')+'</b></div><div class="leader-self-score"><small>我的积分</small><strong>'+s.points.toLocaleString('zh-CN')+'</strong></div></section><section class="leader-podium-wrap"><div class="leader-podium-grid">'+podium+'</div></section><section class="leader-list"><div class="leader-list-caption">TOP 10 · PERSONAL SCORE</div>'+rest+'</section>';
 $('drawer').classList.add('open');
}
function showExchange(){
 $('drawer').classList.remove('shop-drawer','profile-expanded','furniture-drawer');
 $('drawerTitle').textContent='积分兑换 · EXCHANGE';
 $('choices').className='choices infinite-view';
 const goods=[{id:'energy',name:'能量补给',art:'♨',desc:'',price:45},{id:'recovery',name:'状态修复',art:'✚',desc:'',price:35},{id:'memory',name:'记忆档案',art:'▤',desc:'',price:120}];
 $('choices').innerHTML='<header class="infinite-masthead exchange-masthead"><div class="infinite-kicker">ARDAY POINT EXCHANGE</div><h2>兑换中心</h2><p></p><div class="infinite-balance"><span>可用积分</span><b>'+s.points.toLocaleString('zh-CN')+'</b></div><small class="exchange-rate">参考兑换比例：1 积分 = ¥1</small></header><div class="infinite-section-title">可兑换物资 <small>SUPPLY CATALOG</small></div>'+goods.map(x=>'<article class="exchange-item"><div class="exchange-art">'+x.art+'</div><div><span class="exchange-item-kicker">SUPPLY / '+x.id.toUpperCase()+'</span><h3>'+x.name+'</h3></div><button data-exchange="'+x.id+'" '+(s.points<x.price?'disabled':'')+'><b>'+x.price+'</b><small>积分兑换</small></button></article>').join('')+'<p class="infinite-note"></p>';
 $('drawer').classList.add('open');
 $('choices').querySelectorAll('[data-exchange]').forEach(b=>b.onclick=()=>{
  const item=goods.find(x=>x.id===b.dataset.exchange);if(!item||s.points<item.price)return;
  s.points-=item.price;
  if(item.id==='energy')s.energy=Math.min(100,s.energy+35);
  if(item.id==='recovery'){s.hunger=Math.min(100,s.hunger+25);s.clean=Math.min(100,s.clean+25)}
  if(item.id==='memory'){s.memories.push({type:'archive',text:'积分兑换：特殊记忆档案',at:Date.now(),weight:2})}
  save();render();toast('兑换成功：'+item.name);showExchange();
 });
}

function showGoals(){
 ensurePersonalGoal();
 const g=s.personalGoal,sg=s.sharedGoal;
 const personal=g&&g.status==='active'
  ?'<strong>'+g.title+'</strong><p class="goal-progress">'+Math.min(g.progress||0,g.target)+' / '+g.target+' '+g.unit+'</p>'
  :'<p>暂无正在进行的个人计划。</p>';
 const shared=sg?.status==='active'
  ?'<strong>'+sg.title+'</strong><p class="goal-progress">'+sg.progress+' / '+sg.target+' '+sg.unit+'</p>'
  :'<p>暂无正在进行的共同计划。</p>';
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('drawerTitle').textContent='目标';$('choices').className='choices goals-view';
 $('choices').innerHTML='<section class="profile-section"><div class="section-kicker">ARDAY · PERSONAL</div><h3>个人计划</h3>'+personal+'</section><section class="profile-section"><div class="section-kicker">TOGETHER</div><h3>共同计划</h3>'+shared+'</section>';
 $('drawer').classList.add('open');
}



/* Three.js room system. Simulation state remains authoritative. */
let activeCameraGesture='pan';
let arday3D=null,arday3DLoading=false,arday3DFallbackTried=false;
function initArday3D(){
 let host=null;
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
  const camera=new T.PerspectiveCamera(38,1,.1,1800);
  const isTouchDevice=window.matchMedia('(pointer: coarse)').matches;
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouchDevice?1.5:1.75));renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.76;renderer.shadowMap.enabled=true;renderer.shadowMap.type=isTouchDevice?T.PCFShadowMap:T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  // A restrained studio equirectangular environment gives metal, glass and polished wood something to reflect.
  const environmentCanvas=document.createElement('canvas');environmentCanvas.width=1024;environmentCanvas.height=512;
  const environmentContext=environmentCanvas.getContext('2d');
  const environmentGradient=environmentContext.createLinearGradient(0,0,0,512);
  environmentGradient.addColorStop(0,'#45494d');environmentGradient.addColorStop(.42,'#77766e');environmentGradient.addColorStop(.72,'#a49b8c');environmentGradient.addColorStop(1,'#55514b');
  environmentContext.fillStyle=environmentGradient;environmentContext.fillRect(0,0,1024,512);
  const softbox=(x,y,w,h,alpha)=>{
   const glow=environmentContext.createRadialGradient(x+w/2,y+h/2,8,x+w/2,y+h/2,Math.max(w,h)*.72);
   glow.addColorStop(0,`rgba(255,246,229,${alpha})`);glow.addColorStop(.55,`rgba(232,224,210,${alpha*.42})`);glow.addColorStop(1,'rgba(232,224,210,0)');
   environmentContext.fillStyle=glow;environmentContext.fillRect(x-w*.4,y-h*.4,w*1.8,h*1.8);
   environmentContext.fillStyle=`rgba(255,250,239,${alpha*.55})`;environmentContext.fillRect(x,y,w,h);
  };
  softbox(112,84,86,238,.30);softbox(470,48,142,174,.25);softbox(824,104,72,210,.27);
  const floorBounce=environmentContext.createLinearGradient(0,300,0,512);
  floorBounce.addColorStop(0,'rgba(225,197,158,0)');floorBounce.addColorStop(1,'rgba(225,197,158,.11)');
  environmentContext.fillStyle=floorBounce;environmentContext.fillRect(0,300,1024,212);
  const environmentTexture=new T.CanvasTexture(environmentCanvas);
  environmentTexture.mapping=T.EquirectangularReflectionMapping;environmentTexture.encoding=T.sRGBEncoding;
  environmentTexture.generateMipmaps=true;environmentTexture.minFilter=T.LinearMipmapLinearFilter;
  scene.environment=environmentTexture;
  host=document.createElement('div');host.className='three-scene';host.setAttribute('aria-label','Arday 三维生活场景，可拖动旋转视角');host.appendChild(renderer.domElement);stage.insertBefore(host,stage.firstChild);
  const hemi=new T.HemisphereLight(0xe8e3da,0x514b43,.58);scene.add(hemi);
  const sun=new T.DirectionalLight(0xe8d9c2,.92);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.near=.5;sun.shadow.camera.far=24;sun.shadow.bias=-.00012;sun.shadow.normalBias=.018;sun.shadow.radius=3;sun.shadow.camera.updateProjectionMatrix();scene.add(sun);
  const fill=new T.DirectionalLight(0xb8c2cb,.30);fill.position.set(5,4,-5);scene.add(fill);
  const daylightWindows=[],practicalLights=[];let lastDaylightUpdate=0;
  const lampShadow=new T.SpotLight(0xffd8a6,0,5.5,Math.PI/3,.82,1.8);lampShadow.castShadow=false;lampShadow.shadow.mapSize.set(256,256);lampShadow.shadow.camera.near=.12;lampShadow.shadow.camera.far=6;lampShadow.shadow.bias=-.00016;lampShadow.shadow.normalBias=.035;lampShadow.shadow.radius=5;scene.add(lampShadow,lampShadow.target);
  function addWindowSun(root,windowGroup,centerY=2.65){
   const spot=new T.SpotLight(0xffe7bd,0,9,Math.PI/4,.72,1.35);
   spot.position.set(0,centerY,.16);spot.target.position.set(0,centerY-2.33,3.75);
   spot.castShadow=true;spot.shadow.mapSize.set(256,256);spot.shadow.camera.near=.1;spot.shadow.camera.far=10;spot.shadow.bias=-.00012;spot.shadow.normalBias=.025;spot.shadow.radius=4;
   windowGroup.add(spot,spot.target);
   const beam=new T.Mesh(new T.PlaneGeometry(2.75,3.8),new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false,
    uniforms:{sunColor:{value:new T.Color(0xffdfaa)},sunStrength:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 sunColor;uniform float sunStrength;varying vec2 vUv;
     void main(){vec2 p=vUv*2.0-1.0;float edgeX=1.0-smoothstep(.72,1.0,abs(p.x));float edgeY=1.0-smoothstep(.72,1.0,abs(p.y));float broad=pow(max(0.0,1.0-dot(p*vec2(.78,1.0),p*vec2(.78,1.0))),1.35);float streak=.94+.06*sin((p.x*8.0+p.y*2.0)*3.14159);float alpha=edgeX*edgeY*broad*streak*sunStrength*.18;gl_FragColor=vec4(sunColor,alpha);}`
   }));
   beam.rotation.x=-Math.PI/2;beam.position.set(0,centerY-2.574,1.42);beam.renderOrder=2;beam.frustumCulled=false;windowGroup.add(beam);
   daylightWindows.push({root,windowGroup,spot,beam});
  }
  function updateDaylight(force=false){
   const now=Date.now();if(!force&&now-lastDaylightUpdate<1000)return;lastDaylightUpdate=now;
   const d=new Date(),h=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;
   const keys=[{h:0,c:0x26334c,a:.14,s:0,e:.16},{h:5,c:0x596b8a,a:.20,s:.03,e:.24},{h:7,c:0xe8b58a,a:.42,s:.25,e:.38},{h:10,c:0xffedcf,a:.68,s:.78,e:.58},{h:14,c:0xfff0d9,a:.72,s:.82,e:.62},{h:17,c:0xf2a16f,a:.52,s:.48,e:.48},{h:19,c:0x5b6689,a:.24,s:.07,e:.25},{h:21,c:0x29364f,a:.14,s:0,e:.16},{h:24,c:0x26334c,a:.14,s:0,e:.16}];
   let i=0;while(i<keys.length-1&&h>keys[i+1].h)i++;
   const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],t=Math.max(0,Math.min(1,(h-a.h)/(b.h-a.h))),mix=(x,y)=>x+(y-x)*t,col=new T.Color(a.c).lerp(new T.Color(b.c),t);
   hemi.color.copy(col);hemi.intensity=mix(a.a,b.a);sun.color.copy(col).lerp(new T.Color(0xfff1dc),.42);sun.intensity=mix(a.s,b.s);sun.castShadow=sun.intensity>.08;
   sun.position.set(-Math.cos((h-6)/12*Math.PI)*7,8,Math.sin((h-6)/12*Math.PI)*5+1);sun.target.position.set(0,0,0);sun.target.updateMatrixWorld();
   fill.color.copy(col).lerp(new T.Color(0xa8c4e2),.48);fill.intensity=mix(a.e,b.e);renderer.toneMappingExposure=mix(.70,.78,Math.min(1,hemi.intensity));scene.background.copy(col).lerp(new T.Color(0xd9d7d1),.58);
   const daylight=Math.max(0,Math.min(1,(h-5.8)/1.7,(20-h)/2.2)),night=h>=20||h<5?1:h>=18?(h-18)/2:h<7?(7-h)/2:0;
   daylightWindows.forEach(w=>{const active=w.root===(roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:roomMode==='bathroom'?bathroom:living)&&w.windowGroup.visible!==false,strength=mix(a.s,b.s)*.92*daylight*(active?1:.12),sunDrift=Math.sin((h-8)/12*Math.PI)*1.05;w.spot.intensity=strength;w.spot.target.position.set(sunDrift,.32,3.75);w.spot.target.updateMatrixWorld();w.spot.castShadow=active&&strength>.08;w.beam.position.x=sunDrift*.46;w.beam.material.uniforms.sunStrength.value=daylight*(active?1:.12)*Math.max(.12,mix(a.s,b.s));w.beam.material.uniforms.sunColor.value.copy(col).lerp(new T.Color(0xffdca5),.62)});
   practicalLights.forEach(item=>{item.light.intensity=item.enabled?item.base*(item.light.distance>9?.48+.52*night:.5+.5*night):0;if(item.bulb){item.bulb.material.color.setHex(item.enabled?0xffe4b5:0x786f63);item.bulb.material.emissive?.setHex(item.enabled?0x8d5422:0x000000);item.bulb.material.emissiveIntensity=item.enabled?.55:0}if(item.glow)item.glow.visible=item.enabled});
   const shadowSource=practicalLights.find(item=>item.enabled&&item.room===roomMode);
   if(shadowSource){const position=shadowSource.group.localToWorld(shadowSource.light.position.clone());lampShadow.position.copy(position);lampShadow.target.position.set(position.x,.06,position.z+.12);lampShadow.target.updateMatrixWorld();lampShadow.intensity=.72;lampShadow.castShadow=true}else{lampShadow.intensity=0;lampShadow.castShadow=false}
   if(sun.castShadow||daylightWindows.some(w=>w.spot.castShadow)||lampShadow.castShadow)renderer.shadowMap.needsUpdate=true;
  }
  const furniturePalette={0x8b7764:0x6e7782,0x513a2b:0x252c36,0x806044:0x586473,0xd9cdbb:0x40566e,0xc4b49e:0x5b7186,0xb2a18c:0x2d3f55,0xf1eee7:0xcbd2d8,0xd7b990:0x65717f,0xe7d4ba:0x7f8b98,0xb58c68:0x556272,0x805b4e:0x252c36,0xf8eee4:0xcbd2d8,0xfaf0e7:0xd8dee3,0xf0d9d1:0x566d84,0x7897b5:0x263d58,0xd9b7b5:0x4a627b,0xc6a3ad:0x38a4b5,0x9a7059:0x3c4653,0xc99570:0x7d8a96,0xb98968:0x586473,0xd8bd91:0x65717f,0xf1dfbd:0xadb8c2,0x8c6c62:0x2d3540,0xc49b7f:0x65717f,0xc68f9d:0x2d3f55,0x8a7867:0x6e7782,0x9dc3bd:0x405c68,0x9a7655:0x252c36,0xc98d6d:0x65717f,0xe7b89b:0x38a4b5,0xd9a184:0x5b7186,0xe9dfd0:0xcbd2d8,0x78917a:0x3f5668,0x9eb49a:0x536d7b,0x6b856c:0x405c68,0xe4e2d9:0xcbd2d8,0x8c8a83:0x7f8b98,0x4e514b:0x252c36,0x8d8981:0x65717f,0x91b8ba:0x38a4b5,0x65452f:0x252c36,0x9a704b:0x586473,0xd6b77d:0x38a4b5,0xf1e5d1:0xcbd2d8,0x77513b:0x252c36,0x718778:0x405c68,0xf4f2ed:0xcbd2d8,0x514b43:0x252c36,0xfff1dc:0xcbd2d8,0xc8d0d8:0x7f8b98,0xe4d9c7:0x40566e,0xd3c5b1:0x5b7186,0xc2b39e:0x7f8b98,0x67452f:0x252c36,0x8a6344:0x586473};
  const recolorFurniture=color=>furniturePalette[color]??color;
  // Soft cel-lighting: compress diffuse illumination into restrained illustrated value bands.
  function stylizeMaterial(material){
   if(!material||!material.isMeshStandardMaterial||material.userData.inkStylized)return material;
   material.userData.inkStylized=true;
   material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace(
     '#include <tonemapping_fragment>',
     `float inkLuminance=dot(outgoingLight,vec3(0.2126,0.7152,0.0722));
      float inkShadow=smoothstep(0.12,0.25,inkLuminance);
      float inkMid=smoothstep(0.38,0.58,inkLuminance);
      float inkBand=mix(0.88,0.94,inkShadow);
      inkBand=mix(inkBand,1.0,inkMid);
      outgoingLight*=inkBand;
      float paperGrain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5;
      float brushStroke=sin(gl_FragCoord.y*1.7+gl_FragCoord.x*.21)*0.003;\n      outgoingLight*=0.995+paperGrain*0.012+brushStroke;
      #include <tonemapping_fragment>`
    );
   };
   material.customProgramCacheKey=()=> 'arday-soft-light-v7';
      return material;
  }
  const M=(color,roughness=.82,metalness=0)=>stylizeMaterial(new T.MeshStandardMaterial({color:recolorFurniture(color),roughness:Math.max(.08,Math.min(1,roughness)),metalness:Math.max(0,Math.min(.9,metalness))}));
  const painterTextureCache=new Map();
  function createPainterTexture(kind){
   if(painterTextureCache.has(kind))return painterTextureCache.get(kind);
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
   const ctx=canvas.getContext('2d'),bases={wood:'#c8aa86',fabric:'#c9c1b8',ceramic:'#e6e0d5',wall:'#d8d0c4',floor:'#c7a57f'};
   ctx.fillStyle=bases[kind]||'#d8d0c4';ctx.fillRect(0,0,512,512);
   let seed=kind.length*7919;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
   if(kind==='wood'){
    for(let i=0;i<74;i++){const y=rand()*512,amp=1+rand()*5,freq=.012+rand()*.026;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=512;x+=16)ctx.lineTo(x,y+Math.sin(x*freq+i*1.7)*amp+Math.sin(x*.008+i)*2);ctx.strokeStyle=i%8===0?'rgba(73,43,27,.24)':'rgba(93,61,39,.105)';ctx.lineWidth=i%8===0?2:1;ctx.stroke()}
    for(let i=0;i<13;i++){const x=rand()*512,y=rand()*512;ctx.beginPath();ctx.ellipse(x,y,10+rand()*17,2+rand()*3,rand()*.25,0,Math.PI*2);ctx.strokeStyle='rgba(73,43,27,.18)';ctx.lineWidth=1.2;ctx.stroke()}
    for(let i=0;i<1500;i++){ctx.fillStyle=rand()>.5?'rgba(255,255,255,.035)':'rgba(65,43,28,.025)';ctx.fillRect(rand()*512,rand()*512,1,1)}
   }else if(kind==='fabric'){
    for(let y=0;y<512;y+=4){ctx.fillStyle='rgba(73,62,54,.12)';ctx.fillRect(0,y,512,1);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(0,y+1,512,1)}
    for(let x=0;x<512;x+=4){ctx.fillStyle='rgba(73,62,54,.10)';ctx.fillRect(x,0,1,512);ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(x+1,0,1,512)}
    for(let i=0;i<1800;i++){ctx.fillStyle=rand()>.5?'rgba(255,255,255,.09)':'rgba(55,47,42,.055)';ctx.fillRect(rand()*512,rand()*512,1,2)}
   }else if(kind==='ceramic'){
    for(let i=0;i<2800;i++){ctx.fillStyle=rand()>.82?'rgba(255,255,255,.3)':'rgba(75,70,64,.07)';ctx.fillRect(rand()*512,rand()*512,1+rand()*2,1+rand()*2)}
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;for(let y=20;y<512;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke()}
   }else if(kind==='wall'){
    for(let i=0;i<900;i++){const r=2+rand()*13;ctx.fillStyle=rand()>.48?'rgba(255,255,255,.055)':'rgba(83,72,61,.045)';ctx.beginPath();ctx.arc(rand()*512,rand()*512,r,0,Math.PI*2);ctx.fill()}
    for(let i=0;i<38;i++){ctx.beginPath();const y=rand()*512;ctx.moveTo(0,y);ctx.bezierCurveTo(150,y-8,350,y+8,512,y+(rand()-.5)*12);ctx.strokeStyle='rgba(95,81,68,.035)';ctx.lineWidth=1+rand()*2;ctx.stroke()}
   }else{
    // Warm timber floor with restrained grain and low-contrast plank seams.
    // Keep all detail in the texture (no raised strips) to avoid z-fighting.
    for(let i=0;i<95;i++){
     const y=rand()*512,x=rand()*512,len=35+rand()*150;
     ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(Math.min(512,x+len),y+(rand()-.5)*2);
     ctx.strokeStyle=rand()>.5?'rgba(91,63,42,.045)':'rgba(255,246,230,.075)';ctx.lineWidth=.7+rand()*.5;ctx.stroke();
    }
    for(let row=0;row<4;row++){
     const x=row*128+.5;
     ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);
     ctx.strokeStyle='rgba(86,63,45,.095)';ctx.lineWidth=1;ctx.stroke();
     const seamY=(row%2)*64+128;
     for(let y=seamY;y<512;y+=128){
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+128,y);
      ctx.strokeStyle='rgba(86,63,45,.075)';ctx.lineWidth=.8;ctx.stroke();
     }
    }
    for(let i=0;i<900;i++){
     ctx.fillStyle=rand()>.5?'rgba(255,255,255,.035)':'rgba(67,48,34,.025)';
     ctx.fillRect(rand()*512,rand()*512,1,1);
    }
   }
   const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(kind==='wood'?1.5:kind==='wall'?2:kind==='floor'?1.15:3,kind==='wood'?3:kind==='wall'?2:kind==='floor'?1.15:3);texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());painterTextureCache.set(kind,texture);return texture;
  }
  function applyPainterMap(material,texture,bump){if(!material)return material;material.map=texture;material.bumpMap=texture;material.bumpScale=bump;material.needsUpdate=true;return material}
  // Warm ink outline pass: inverted-hull shells follow animated meshes and newly placed furniture.
  const inkOutlineMaterial=new T.ShaderMaterial({
   uniforms:{outlineColor:{value:new T.Color(0x49362e)},outlineAlpha:{value:.9},outlineThickness:{value:.0058}},
   vertexShader:`uniform float outlineThickness;
    void main(){float wobble=sin(position.x*13.0+position.y*7.0)*sin(position.z*11.0-position.y*5.0);float secondWobble=sin(position.x*23.0-position.y*17.0+position.z*9.0);float fineWobble=sin(position.x*31.0+position.z*23.0)*.35;float width=outlineThickness*(1.0+0.16*wobble+0.055*secondWobble+0.035*fineWobble);vec3 expanded=position+normalize(normal)*width;gl_Position=projectionMatrix*modelViewMatrix*vec4(expanded,1.0);}`,
   fragmentShader:`uniform vec3 outlineColor;uniform float outlineAlpha;
    void main(){float grain=fract(sin(dot(gl_FragCoord.xy,vec2(41.7,289.3)))*43758.5453);float fiber=fract(sin(dot(gl_FragCoord.xy,vec2(17.3,91.7)))*15731.743);float inkBreak=mix(.72,1.0,step(.08,grain));float inkDensity=mix(.84,1.0,smoothstep(.08,.92,fiber));gl_FragColor=vec4(outlineColor,outlineAlpha*inkBreak*inkDensity);}`,
   side:T.BackSide,transparent:true,depthTest:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,toneMapped:false
  });
  const inkDetailMaterial=new T.LineBasicMaterial({color:0x59463d,transparent:true,opacity:.2,depthTest:true,depthWrite:false,toneMapped:false});
  const hallInkOutlineMaterial=inkOutlineMaterial.clone();
  hallInkOutlineMaterial.uniforms.outlineThickness.value=.035;
  hallInkOutlineMaterial.uniforms.outlineAlpha.value=.74;
  hallInkOutlineMaterial.uniforms.outlineColor.value.setHex(0x303640);
  function applyInkOutlines(root){
   root.traverse(object=>{
    if(!object.isMesh||object.userData.inkOutline||!object.geometry||!object.geometry.attributes?.normal)return;
    if(!object.geometry.boundingSphere)object.geometry.computeBoundingSphere();
    if(isTouchDevice&&object.userData.hallIllustration)return;if((object.geometry.boundingSphere?.radius||0)<.23)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    if(!materials.some(material=>material&&material.isMeshStandardMaterial&&!material.transparent&&(material.opacity??1)>.94&&(material.roughness??1)>.28))return;
    const shell=new T.Mesh(object.geometry,object.userData.hallIllustration?hallInkOutlineMaterial:inkOutlineMaterial);
    shell.name='hand-drawn-ink-outline';shell.userData.inkOutline=true;shell.frustumCulled=false;
    shell.castShadow=false;shell.receiveShadow=false;shell.renderOrder=1;
    object.userData.hasInkOutline=true;object.add(shell);
    // Fine pen strokes on hard-surface seams; rounded forms keep their clean silhouette.
    if(object.geometry.type==='BoxGeometry'&&!object.userData.inkDetail){const detail=new T.LineSegments(new T.EdgesGeometry(object.geometry,28),inkDetailMaterial);detail.name='hand-drawn-edge-detail';detail.userData.inkDetail=true;detail.renderOrder=2;detail.frustumCulled=false;object.add(detail);object.userData.inkDetail=true;}
   });
  }
  const m={wall:M(0xd8d5ce),floor:M(0x8b7764),wood:M(0x513a2b),oak:M(0x806044),sofa:M(0xd9cdbb),sofa2:M(0xc4b49e),skin:M(0xd9a17c),hair:M(0x302629),shirt:M(0x526575),pants:M(0x454c5c),glass:new T.MeshPhysicalMaterial({color:0xd7e5e7,roughness:.12,metalness:.04,transparent:true,opacity:.24,reflectivity:.72,clearcoat:.85,clearcoatRoughness:.08,depthWrite:false,side:T.DoubleSide}),rug:M(0xb2a18c),leaf:M(0x64775d),dark:M(0x423a36),cream:M(0xf1eee7)};
  m.glass.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float glassFresnel=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),4.0);outgoingLight=mix(outgoingLight,vec3(.66,.79,.84),glassFresnel*.24);\n#include <opaque_fragment>`)};
  m.glass.customProgramCacheKey=()=> 'arday-window-glass-fresnel-v1';
  function box(parent,x,y,z,w,h,d,material){const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function ball(parent,x,y,z,sx,sy,sz,material,seg=14){const o=new T.Mesh(new T.SphereGeometry(1,seg,10),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  function cyl(parent,x,y,z,r,h,material,seg=14){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,seg),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  const roomFloorMap=createPainterTexture('floor'),roomWallMap=createPainterTexture('wall');
  const outdoorCanvas=document.createElement('canvas');outdoorCanvas.width=512;outdoorCanvas.height=384;
  const outdoorCtx=outdoorCanvas.getContext('2d'),outdoorGradient=outdoorCtx.createLinearGradient(0,0,0,384);
  outdoorGradient.addColorStop(0,'#a9c8d0');outdoorGradient.addColorStop(.58,'#e7d8bd');outdoorGradient.addColorStop(1,'#b7b49b');outdoorCtx.fillStyle=outdoorGradient;outdoorCtx.fillRect(0,0,512,384);
  outdoorCtx.fillStyle='rgba(255,239,198,.8)';outdoorCtx.beginPath();outdoorCtx.arc(390,92,34,0,Math.PI*2);outdoorCtx.fill();
  for(let i=0;i<8;i++){const x=i*78-25,h=65+(i*37)%95;outdoorCtx.fillStyle=i%2?'#81958b':'#71877f';outdoorCtx.fillRect(x,260-h,58,h);outdoorCtx.fillStyle='#647c72';for(let y=260-h;y<260;y+=28)outdoorCtx.fillRect(x+8,y,42,3)}
  outdoorCtx.fillStyle='#627c6e';outdoorCtx.beginPath();outdoorCtx.moveTo(0,300);outdoorCtx.quadraticCurveTo(130,250,250,302);outdoorCtx.quadraticCurveTo(390,255,512,294);outdoorCtx.lineTo(512,384);outdoorCtx.lineTo(0,384);outdoorCtx.fill();
  const outdoorTexture=new T.CanvasTexture(outdoorCanvas);outdoorTexture.encoding=T.sRGBEncoding;
  function addWindowDressing(windowGroup,width,height,color=0xc8b9a8,centerY=2.6){
   const fabric=new T.MeshStandardMaterial({color,roughness:.96,side:T.DoubleSide});
   const rod=cyl(windowGroup,0,centerY+height/2+.11,.12,.035,width+.24,M(0x9a7655,.42),16);rod.rotation.z=Math.PI/2;
   for(const side of [-1,1]){
    const geometry=new T.PlaneGeometry(.58,height,18,28),positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),v=(y+height/2)/height;positions.setX(i,x+Math.sin((x+.29)*42)*.022+Math.sin(v*8)*.012)}
    geometry.computeVertexNormals();
    const panel=new T.Mesh(geometry,fabric);panel.position.set(side*(width*.5-.3),centerY,.13);panel.castShadow=true;panel.receiveShadow=true;windowGroup.add(panel);
    const tie=new T.Mesh(new T.TorusGeometry(.19,.018,8,24),M(0xb18b58,.48));tie.position.set(side*(width*.5-.3),centerY-height*.07,.17);tie.scale.set(1,.55,1);windowGroup.add(tie);
    for(let j=0;j<4;j++){const ring=new T.Mesh(new T.TorusGeometry(.035,.009,6,12),M(0x9a7655,.4));ring.position.set(side*(width*.5-.3)+side*(-.21+j*.14),centerY+height/2+.1,.12);ring.rotation.x=Math.PI/2;windowGroup.add(ring)}
   }
   for(const side of [-1,1]){const finial=new T.Mesh(new T.SphereGeometry(.055,10,8),M(0xb18b58,.42));finial.position.set(side*(width*.5+.12),centerY+height/2+.11,.12);windowGroup.add(finial)}
  }

  // Shared procedural textures keep contact shading and lamp bloom consistent without per-object canvases.
  function radialTexture(inner,outer){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
   const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,2,64,64,62);
   g.addColorStop(0,inner);g.addColorStop(.42,outer);g.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
   const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;return texture;
  }
  const contactShadowTexture=radialTexture('rgba(29,24,20,.28)','rgba(29,24,20,.12)');
  const lampGlowTexture=radialTexture('rgba(255,224,174,.30)','rgba(255,198,126,.09)');
  function addContactShadow(group,width,depth){
   const mesh=new T.Mesh(new T.PlaneGeometry(width*1.16,depth*1.16),new T.MeshBasicMaterial({map:contactShadowTexture,transparent:true,depthWrite:false,toneMapped:false}));
   mesh.rotation.x=-Math.PI/2;mesh.position.y=.012;mesh.renderOrder=0;mesh.userData.furnitureContactShadow=true;mesh.castShadow=false;mesh.receiveShadow=false;group.add(mesh);return mesh;
  }
  function roomShell(group,wallColor,floorColor){
   const floorMaterial=applyPainterMap(M(floorColor),roomFloorMap,.0018),wallMaterial=applyPainterMap(M(wallColor),roomWallMap,.004);
   group.userData.floorMesh=box(group,0,-.14,0,10.8,.28,8.4,floorMaterial);
   const backWallGroup=new T.Group();group.add(backWallGroup);group.userData.backWall=backWallGroup;
   // Keep the back wall continuous. Windows are complete surface-mounted
   // assemblies with their own outdoor-view panels; never cut a hole in the shell.
   const backWallSegments=[box(backWallGroup,0,2.35,-4.08,10.8,4.8,.2,wallMaterial)];
   group.userData.backWallSegments=backWallSegments;group.userData.backWallMaterial=wallMaterial;group.userData.wallMeshes=backWallSegments;
   const leftWallGroup=new T.Group(),rightWallGroup=new T.Group(),frontWallGroup=new T.Group();group.add(leftWallGroup,rightWallGroup,frontWallGroup);
   const ceilingMaterial=M(0xe9e3d8);ceilingMaterial.transparent=true;ceilingMaterial.opacity=.22;ceilingMaterial.depthWrite=false;ceilingMaterial.side=T.DoubleSide;group.userData.ceilingMesh=box(group,0,4.78,0,10.8,.12,8.4,ceilingMaterial);group.userData.ceilingMesh.visible=false;group.userData.ceilingMesh.castShadow=false;group.userData.ceilingMesh.renderOrder=8;
   const sideWallMaterial=M(wallColor);sideWallMaterial.transparent=false;sideWallMaterial.opacity=1;sideWallMaterial.depthWrite=true;
   group.userData.leftWall=leftWallGroup;group.userData.rightWall=rightWallGroup;group.userData.frontWall=frontWallGroup;
   // Side walls terminate exactly at the front/back wall planes; all four
   // exterior faces now share the same room footprint without overhangs.
   const leftWall=box(leftWallGroup,-5.3,2.35,0,.2,4.8,8.16,sideWallMaterial);leftWall.castShadow=false;
   const rightWall=box(rightWallGroup,5.3,2.35,0,.2,4.8,8.16,sideWallMaterial.clone());rightWall.material.transparent=false;rightWall.material.depthWrite=true;rightWall.castShadow=false;
   const frontWall=box(frontWallGroup,0,2.35,4.08,10.8,4.8,.2,sideWallMaterial.clone());frontWall.material.transparent=false;frontWall.material.depthWrite=true;frontWall.castShadow=false;
   group.userData.wallMeshes.push(leftWall,rightWall,frontWall);
   box(group,0,.12,-3.94,10.7,.16,.12,m.oak);
   box(group,0,.24,-3.91,10.65,.12,.12,M(0xd7b990));
   const trimMat=M(0xe7d4ba);trimMat.transparent=false;trimMat.depthWrite=true;
   // End trim at the exact inner-face junctions; the previous 8.12
   // length projected 8 cm beyond both front/back wall junctions.
   box(leftWallGroup,-5.22,.13,0,.12,.18,8.16,trimMat);
   box(rightWallGroup,5.22,.13,0,.12,.18,8.16,trimMat.clone());
   // The old raised plank strips caused high-contrast shimmering on iPad
   // displays. Keep the floor's subtle painter texture, not floating seams.
  }
  // Three distinct interiors; only one room is visible at a time.
  const living=new T.Group();scene.add(living);roomShell(living,0xd5d1c9,0xc4a783);
  const livingWindow=new T.Group();livingWindow.position.set(-2.75,0,-3.88);living.add(livingWindow);addWindowSun(living,livingWindow);
  const addWindowView=(windowGroup,centerY,width=2.1,height=1.85)=>{const view=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:outdoorTexture,toneMapped:false,side:T.DoubleSide}));view.position.set(0,centerY,.012);view.renderOrder=1;view.castShadow=false;view.receiveShadow=false;view.userData.windowScenery=true;windowGroup.add(view);};
  const addOpenCasementWindow=(windowGroup,frameMaterial)=>{const width=2.2,height=1.95,cy=2.6;box(windowGroup,-1.07,cy,0,.12,height,.12,frameMaterial);box(windowGroup,1.07,cy,0,.12,height,.12,frameMaterial);box(windowGroup,0,cy+height/2,0,width,.12,.12,frameMaterial);box(windowGroup,0,cy-height/2,0,width,.12,.12,frameMaterial);for(const side of [-1,1]){const leaf=new T.Group();leaf.position.set(side*1.01,cy,.055);leaf.rotation.y=side*.43;windowGroup.add(leaf);const cx=-side*.49,glass=new T.Mesh(new T.PlaneGeometry(.94,1.76),m.glass);glass.position.set(cx,0,.018);glass.renderOrder=2;glass.castShadow=false;glass.receiveShadow=false;leaf.add(glass);for(const x of [-.49,.49])box(leaf,cx+x,0,.04,.065,1.86,.075,frameMaterial);for(const y of [-.9,.9])box(leaf,cx,y,.04,.98,.065,.075,frameMaterial);box(leaf,cx,0,.045,.045,1.72,.045,frameMaterial);for(const y of [-.55,.55])box(leaf,-side*.91,y,.07,.035,.12,.035,M(0xb18b58,.42));const handle=box(leaf,cx-side*.4,0,.09,.035,.22,.035,M(0xb18b58,.42));handle.castShadow=false;}};
  addWindowView(livingWindow,2.6);addOpenCasementWindow(livingWindow,m.oak);
  addWindowDressing(livingWindow,2.1,1.85,0xc7b7a4,2.6);
  const sofa=new T.Group(),table=new T.Group(),desk=new T.Group();living.add(sofa,table,desk);
  // Bedroom shell is intentionally empty; all movable furnishings are shop items.
  const bedroom=new T.Group();scene.add(bedroom);roomShell(bedroom,0xd0d1d0,0xb99b83);
  const bedroomWindow=new T.Group();bedroomWindow.position.set(-2.8,0,-3.88);bedroom.add(bedroomWindow);addWindowSun(bedroom,bedroomWindow);
  addWindowView(bedroomWindow,2.6);addOpenCasementWindow(bedroomWindow,M(0x8a6e68));
  addWindowDressing(bedroomWindow,2.1,1.85,0xb9a9a0,2.6);
  // Kitchen shell keeps its tiled backsplash; cabinets and appliances are purchased separately.
  const kitchen=new T.Group();scene.add(kitchen);roomShell(kitchen,0xd8d5ce,0xc0a487);
  const kitchenWindow=new T.Group();kitchenWindow.position.set(-2.8,0,-3.87);kitchen.add(kitchenWindow);addWindowSun(kitchen,kitchenWindow);
  addWindowView(kitchenWindow,2.6);addOpenCasementWindow(kitchenWindow,M(0x9a7655));
  addWindowDressing(kitchenWindow,2.1,1.85,0xd0c4b1,2.6);
  box(kitchen,0,1.12,-3.91,7.7,.55,.08,M(0xc98d6d));
  for(let x=-3.4;x<=3.4;x+=.48)for(let y=.88;y<=1.35;y+=.42)box(kitchen,x,y,-3.84,.43,.37,.035,M((Math.round((x+3.4)/.48)+Math.round(y*10))%3===0?0xe7b89b:0xd9a184));
  // All room doors are now instances of the same owned, movable furniture model.
  const hallScene=window.ArdayHallScene?.create(T,scene,M,box,{lowPower:isTouchDevice});if(!hallScene)throw new Error('Public hall scene failed to initialize');
  const hall=hallScene.group;hall.visible=false;
  // Tiled bathroom shell; no sanitary fixtures are pre-installed.
  const bathroom=new T.Group();scene.add(bathroom);roomShell(bathroom,0xd7d8d4,0xb8b6aa);
  const bathroomTile=M(0xd9d7cf,.96);
  for(let x=-5.12;x<=5.12;x+=.34){box(bathroom,x,.66,-3.965,.31,1.18,.025,bathroomTile);box(bathroom,x,.66,3.965,.31,1.18,.025,bathroomTile)}
  for(let z=-3.8;z<=3.81;z+=.34){box(bathroom,-5.165,.66,z,.025,1.18,.31,bathroomTile);box(bathroom,5.165,.66,z,.025,1.18,.31,bathroomTile)}
  const bathroomAccent=M(0xb4b9b1,.9);box(bathroom,0,1.28,-3.94,10.3,.035,.035,bathroomAccent);box(bathroom,0,1.28,3.94,10.3,.035,.035,bathroomAccent);
  kitchen.visible=false;bedroom.visible=false;bathroom.visible=false;
  // Detailed stylized character with articulated shoulders, elbows, hips and knees.
  const person=new T.Group();scene.add(person);const rig=new T.Group();person.add(rig);const body=new T.Group();rig.add(body);
  // Character v2: fully rebuilt silhouette, facial topology, hair and outfit.
  const CM=(color,roughness=.82)=>stylizeMaterial(new T.MeshStandardMaterial({color,roughness,flatShading:true}));
  const skinMat=CM(0xe8b99d,.88),skinShadow=CM(0xc98e79),hairMat=CM(0xc99a42,.72),hairHi=CM(0xf0cf79,.62),shirtMat=CM(0xeee4d6),shirtLight=CM(0xc9b6a0),trouserMat=CM(0x4a4c55),shoeMat=CM(0x393337),eyeMat=CM(0x302827),whiteMat=CM(0xf7eee5);
  const ell=(p,x,y,z,sx,sy,sz,mat,seg=16)=>{const o=new T.Mesh(new T.SphereGeometry(1,seg,Math.max(6,Math.floor(seg*.65)),0,Math.PI*2,0,Math.PI),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
  const limb=(p,x,y,z,r1,r2,len,mat)=>{const o=new T.Mesh(new T.CylinderGeometry(r1,r2,len,9,1),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
  const torsoPts=[new T.Vector2(.22,0),new T.Vector2(.285,.1),new T.Vector2(.285,.57),new T.Vector2(.21,.78),new T.Vector2(0,.78)];
  const torsoGeo=new T.LatheGeometry(torsoPts,10);const torso=new T.Mesh(torsoGeo,shirtMat);torso.position.set(0,.94,0);torso.scale.z=.78;torso.castShadow=true;body.add(torso);
  box(body,0,1.31,.208,.018,.55,.018,shirtLight);
  const lapelShape=new T.Shape();lapelShape.moveTo(-.19,1.68);lapelShape.lineTo(-.025,1.46);lapelShape.lineTo(-.105,1.34);lapelShape.lineTo(-.25,1.61);lapelShape.closePath();const lapelGeo=new T.ShapeGeometry(lapelShape);lapelGeo.translate(0,0,.225);const lapel=new T.Mesh(lapelGeo,shirtLight);body.add(lapel);const lapel2=lapel.clone();lapel2.scale.x=-1;body.add(lapel2);
  for(const side of [-1,1]){const collar=new T.Shape();collar.moveTo(0,1.76);collar.lineTo(side*.12,1.65);collar.lineTo(side*.055,1.48);collar.lineTo(0,1.55);collar.closePath();const piece=new T.Mesh(new T.ShapeGeometry(collar),shirtLight);piece.position.z=.232;body.add(piece);}
  const jacketSeam=new T.CatmullRomCurve3([new T.Vector3(0,1.38,.226),new T.Vector3(0,1.16,.228),new T.Vector3(0,.98,.205)]);body.add(new T.Mesh(new T.TubeGeometry(jacketSeam,12,.004,5,false),CM(0xb39f8b)));
  for(const y of [1.38,1.2,1.02])ell(body,.025,y,.239,.018,.018,.012,CM(0x9e8069),8);box(body,0,.91,.03,.39,.09,.4,trouserMat);limb(body,0,1.78,0,.105,.12,.25,skinMat);
  const head=new T.Group();head.position.set(0,2.18,.015);body.add(head);
  // Softer oval face: fuller cheeks and a rounded chin replace the pinched old jaw.
  const facePts=[new T.Vector2(.035,-.385),new T.Vector2(.09,-.36),new T.Vector2(.145,-.305),new T.Vector2(.195,-.215),new T.Vector2(.225,-.09),new T.Vector2(.238,.065),new T.Vector2(.228,.205),new T.Vector2(.185,.325),new T.Vector2(.105,.39),new T.Vector2(0,.405)];
  const faceGeo=new T.LatheGeometry(facePts,32);faceGeo.scale(1,1,.91);const face=new T.Mesh(faceGeo,skinMat);face.position.z=.005;face.castShadow=true;head.add(face);
  for(const side of [-1,1]){const ear=ell(head,side*.247,-.005,-.005,.048,.078,.052,skinMat,12);ear.rotation.z=side*.12;ell(head,side*.145,-.115,.165,.095,.085,.052,CM(0xe7aa98),14)}
  const eyeGroups=[];for(const side of [-1,1]){
   const eye=new T.Group();eye.position.set(side*.108,.065,.208);head.add(eye);
   ell(eye,0,0,0,.056,.035,.022,whiteMat,18);ell(eye,side*.003,-.002,.018,.026,.03,.012,CM(0x806d61),16);ell(eye,side*.003,-.002,.028,.013,.022,.008,eyeMat,14);ell(eye,side*.011,.011,.035,.006,.008,.005,CM(0xffffff),8);
   const lidCurve=new T.CatmullRomCurve3([new T.Vector3(side*.16,.079,.222),new T.Vector3(side*.132,.103,.236),new T.Vector3(side*.105,.108,.241),new T.Vector3(side*.078,.087,.229)]);head.add(new T.Mesh(new T.TubeGeometry(lidCurve,12,.006,6,false),skinShadow));
   const browCurve=new T.CatmullRomCurve3([new T.Vector3(side*.178,.145,.177),new T.Vector3(side*.15,.169,.205),new T.Vector3(side*.108,.177,.218),new T.Vector3(side*.068,.158,.205)]);
   const brow=new T.Mesh(new T.TubeGeometry(browCurve,14,.005,6,false),hairMat);head.add(brow);eyeGroups.push(eye);
  }
  ell(head,0,.315,-.055,.282,.19,.245,hairMat,24);ell(head,0,.005,-.205,.235,.31,.095,hairMat,20);
  for(const side of [-1,1]){const panel=ell(head,side*.226,-.035,.005,.058,.285,.105,hairMat,20);panel.rotation.z=side*-.08}
  // Swept-back crown ridges: keep the forehead and eyebrows completely visible.
  for(let i=0;i<5;i++){const ridge=ell(head,-.16+i*.08,.405,-.005,.12,.045,.19,i%2?hairHi:hairMat,16);ridge.rotation.z=-.12+(i*.055)}
  const sidePart=ell(head,-.105,.39,.105,.13,.035,.11,hairHi,16);sidePart.rotation.z=-.18;
  ell(head,0,-.075,.218,.032,.024,.022,skinShadow,12);
  const mouth=new T.QuadraticBezierCurve3(new T.Vector3(-.038,-.19,.194),new T.Vector3(0,-.205,.205),new T.Vector3(.038,-.19,.194));head.add(new T.Mesh(new T.TubeGeometry(mouth,14,.004,6,false),CM(0x985e5a)));
  for(const side of [-1,1]){const blush=ell(head,side*.17,-.12,.184,.045,.018,.009,CM(0xd98e87),12);blush.material.transparent=true;blush.material.opacity=.28;}
  const arms=[];for(const side of [-1,1]){const shoulder=new T.Group();shoulder.position.set(side*.265,1.57,0);body.add(shoulder);ell(shoulder,0,-.035,0,.105,.13,.11,shirtMat,12);limb(shoulder,0,-.235,0,.075,.095,.39,shirtMat);const elbow=new T.Group();elbow.position.set(0,-.43,0);shoulder.add(elbow);ell(elbow,0,0,0,.068,.07,.068,shirtLight,10);limb(elbow,0,-.19,.008,.047,.06,.34,skinMat);ell(elbow,0,-.39,.025,.055,.07,.055,skinMat,10);for(let f=0;f<4;f++){const finger=limb(elbow,-.033+f*.022,-.455,.055,.009,.012,.075,skinMat);finger.rotation.z=(f-1.5)*-.08}const thumb=limb(elbow,side*.065,-.405,.065,.014,.018,.085,skinMat);thumb.rotation.z=side*.62;arms.push({shoulder,elbow,side})}
  const legs=[];for(const side of [-1,1]){const hip=new T.Group();hip.position.set(side*.14,.83,0);rig.add(hip);limb(hip,0,-.22,0,.105,.12,.43,trouserMat);const knee=new T.Group();knee.position.set(0,-.43,0);hip.add(knee);ell(knee,0,0,0,.083,.09,.08,trouserMat,10);limb(knee,0,-.19,.005,.067,.078,.36,trouserMat);ell(knee,0,-.395,.075,.09,.07,.18,shoeMat,12);box(knee,0,-.445,.13,.15,.025,.16,CM(0x242126));box(knee,0,-.425,.125,.155,.018,.17,CM(0x65534d));legs.push({hip,knee,side})}
  const shadow=new T.Mesh(new T.CircleGeometry(.62,28),new T.MeshBasicMaterial({color:0x40362d,transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.022;person.add(shadow);
  const positions={sofa:[-2.55,0,.32],table:[2.4,0,1],window:[-2.3,0,-1.5],outside:[3.8,0,2],rug:[0,0,1.5],shelf:[3.8,0,-2.3],desk:[3.1,0,-1.3],center:[0,0,1.7],kitchen:[.65,0,-.05],bed:[-.55,.86,-1.07]};
  let target=new T.Vector3(0,0,1.7),pose='wave',phase=0,last=performance.now(),lastDraw=0,lastHotspotUpdate=0;
  let activeActivity='idle',activityFacing=person.rotation.y,idleNextMove=performance.now()+900,idleWalkStartedAt=0,idleNextGesture=performance.now()+4200,idleGestureUntil=0,basePose='idle',walkRoute=[],walkIndex=0,walkPauseUntil=0,lastBlink=performance.now()+2600;
  let roomMode='living',theta=.68,phi=1.08,radius=13.4,targetTheta=.68,targetPhi=1.08,targetRadius=13.4,cameraTarget=new T.Vector3(0,1,0),hallCameraOffset=new T.Vector3();
  function applyCamera(){targetPhi=Math.max(roomMode==='hall'?.78:.48,Math.min(roomMode==='hall'?1.48:1.42,targetPhi));targetRadius=roomMode==='hall'?Math.max(28,Math.min(175,targetRadius)):Math.max(7.2,Math.min(21,targetRadius))}
  function syncCamera(dt=1){const ease=1-Math.exp(-dt*13);theta+=(targetTheta-theta)*ease;phi+=(targetPhi-phi)*ease;radius+=(targetRadius-radius)*ease;camera.position.set(cameraTarget.x+radius*Math.sin(phi)*Math.sin(theta),cameraTarget.y+radius*Math.cos(phi),cameraTarget.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(cameraTarget);
   if(roomMode!=='hall')[living,bedroom,kitchen,bathroom].forEach(g=>{if(g.userData.ceilingMesh)g.userData.ceilingMesh.visible=decorating;
    if(g.userData.backWall)g.userData.backWall.visible=camera.position.z>-2.8;
    if(g.userData.frontWall)g.userData.frontWall.visible=camera.position.z<2.8;
    if(g.userData.leftWall)g.userData.leftWall.visible=camera.position.x>-2.15;
    if(g.userData.rightWall)g.userData.rightWall.visible=camera.position.x<2.15;
   });
  }
  function resize(){const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const furnitureRegistry=[];
  // Bridge the scene-local registry to the outer interaction-menu module without leaking the array.
  window.ArdayGetFurnitureHotspot=(id)=>{const item=furnitureRegistry.find(entry=>String(entry.id)===String(id));if(!item?.button)return null;item.button.__furnitureItem=item;return item.button};
  const roomBounds={minX:-5.0,maxX:5.0,minZ:-3.65,maxZ:3.65};
  function wallTransform(group,side,offset,y=0){
   const maxOffset=group.userData?.wallObject&&String(group.userData.furnitureKey||'').includes('window')?4.25:4.5;
   const clamped=side==='back'||side==='front'?Math.max(-maxOffset,Math.min(maxOffset,offset)):Math.max(-3.25,Math.min(3.25,offset));
   if(side==='back'){group.position.set(clamped,y,-3.89);group.rotation.y=0}
   else if(side==='front'){group.position.set(clamped,y,3.89);group.rotation.y=Math.PI}
   else if(side==='left'){group.position.set(-5.16,y,clamped);group.rotation.y=Math.PI/2}
   else{group.position.set(5.16,y,clamped);group.rotation.y=-Math.PI/2}

  }
  function wallOffset(item){return item.wallSide==='back'||item.wallSide==='front'?item.group.position.x:item.group.position.z}
  function canPlaceOnWall(item,side,offset){
   // Validate the full wall-mounted object's span, not only its center.
   // Wall-mounted cabinets were previously allowed to overhang room edges.
   const alongBack=side==='back'||side==='front';
   const wallHalf=alongBack?5.0:3.65;
   const width=item.isDoor?1.24:item.id?.includes('window')?2.1:(Number(item.width)||.35);
   const half=width/2,limit=wallHalf-half;
   if(Math.abs(offset)>limit)return false;
   for(const other of furnitureRegistry){
    if(other===item||other.room!==item.room||!other.wallAxis||other.wallSide!==side)continue;
    const otherWidth=other.isDoor?1.24:other.id?.includes('window')?2.1:(Number(other.width)||.35);
    const clearance=(width+otherWidth)/2+.12;
    if(Math.abs(wallOffset(other)-offset)<clearance)return false;
   }
   return true;
  }
  function registerFurniture({id,name,room,group,width,depth,anchor=[0,0],action,wallAxis=null,wallSide=null,wallRange=4.5,record=null}){
   group.userData.furnitureKey=id;group.userData.roomKey=room;
   const saved=record||s.placed?.find(item=>item.id===id);
   if(wallAxis){
    const side=saved?.wallSide||wallSide||(wallAxis==='x'?'back':'right');
    const offset=saved?.offset??saved?.position??(side==='back'||side==='front'?(saved?.x??group.position.x):(saved?.z??group.position.z));
    wallTransform(group,side,offset,saved?.y??group.position.y);wallSide=side;wallAxis=side==='back'||side==='front'?'x':'z';
   }else if(saved){group.position.set(saved.x??0,saved.y??0,saved.z??0);group.rotation.y=saved.rotation||0}
   else{
    /* Position is restored from the canonical placed entity above. */
   }
   const item={id,name,room,group,width,depth,anchor,action,button:null,wallAxis,wallSide,wallRange,wallAnchorY:wallAxis?(anchor?.[1]??2.55)-group.position.y:0,isDoor:!!group.userData.isDoor,doorDestination:record?.destination||group.userData.roomTarget||(group.userData.isDoor?'living':null)};if(item.isDoor){group.userData.roomTarget=item.doorDestination||'living';group.userData.doorFurniture=true;updateDoorDestinationLabel(group,item.doorDestination||'living');}
   const existing=document.querySelector('.spot-'+id);
   item.button=existing||document.createElement('button');
   if(!existing){
    item.button.className='hotspot furniture-hotspot spot-'+id;
    item.button.type='button';item.button.dataset.object=name;item.button.setAttribute('aria-label',name);
    item.button.textContent=id==='desk'?'✎':'▱';stage.appendChild(item.button);
   }
   /* Rebind on every scene rebuild: existing hotspot DOM nodes otherwise retain stale closures or no action. */
   item.button.onclick=()=>{if(decorating){selectFurniture(item);if(item.isDoor)openDoorWheel(item);return}if(item.isDoor){enterRoomFromDoor(item.doorDestination||'living');return}invokeFurnitureAction(item)};
   item.button.dataset.object=name;item.button.dataset.furnitureId=id;item.button.setAttribute('aria-label',name);
   furnitureRegistry.push(item);return item;
  }
  function registerWallObject({id,name,room,group,axis,side,range,anchor,action}){
   group.userData.furnitureKey=id;group.userData.roomKey=room;group.userData.wallObject=true;
   const saved=s.placed?.find(item=>item.id===id),savedSide=id.includes('window')?'back':(saved?.wallSide||side);
   const offset=saved?.wallOffset??saved?.offset??saved?.position??(savedSide==='back'||savedSide==='front'?group.position.x:group.position.z);
   wallTransform(group,savedSide,offset,saved?.y??group.position.y);
   const button=document.createElement('button');button.className='hotspot furniture-hotspot wall-hotspot spot-'+id;button.type='button';button.textContent=id.includes('door')?'门':'窗';button.setAttribute('aria-label',name);button.dataset.object=name;button.dataset.furnitureId=id;stage.appendChild(button);
   const item={id,name,room,group,button,wallAxis:savedSide==='back'||savedSide==='front'?'x':'z',wallSide:savedSide,wallRange:range,anchor:anchor||[0,0],action,width:0,depth:0,wallAnchorY:(anchor?.[1]??2.55)-group.position.y};
   button.onclick=()=>{if(decorating)selectFurniture(item);else invokeFurnitureAction(item)};
   furnitureRegistry.push(item);return item;
  }
  const furnitureHotspots=[];
  function enterRoomFromDoor(mode){
   stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode','bathroom-mode','hall-mode');
   if(mode==='hall'){stage.classList.add('hall-mode');person.position.set(hallScene.spawn.x,0,hallScene.spawn.z);target.copy(person.position);hallCameraOffset.set(0,0,0);activeActivity='idle';}else if(roomMode==='hall'){person.position.set(-4.25,0,0);target.copy(person.position);}
   else{
    if(mode==='kitchen')stage.classList.add('kitchen-mode');
    if(mode==='bedroom')stage.classList.add('bedroom-mode');
    if(mode==='bathroom')stage.classList.add('bathroom-mode');
    if(roomMode==='hall'){person.position.set(-4.25,0,0);target.copy(person.position);}
   }
   closeFurnitureActions();
   $('drawer').classList.remove('open','profile-expanded','furniture-drawer');
   $('drawer').querySelector('.furniture-close')?.remove();
   document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));
   updateArday3D();
  }
  // The outdoor view is part of each movable window assembly.
  // The back wall remains solid behind it; no dynamic wall cut-outs are used.
  const wallObjects=[
   registerWallObject({id:'living-window',name:'客厅窗户',room:'living',group:livingWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>perform('admireView',false,{source:'window',furnitureId:'living-window',room:'living',anchor:'window'})}),
   registerWallObject({id:'bedroom-window',name:'卧室窗户',room:'bedroom',group:bedroomWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>perform('admireView',false,{source:'window',furnitureId:'bedroom-window',room:'bedroom',anchor:'window'})}),
   registerWallObject({id:'kitchen-window',name:'厨房窗户',room:'kitchen',group:kitchenWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>perform('admireView',false,{source:'window',furnitureId:'kitchen-window',room:'kitchen',anchor:'window'})}),
  ];
  const furnitureModelAliases=window.ArdayFurnitureCatalog.modelAliases;
  const furnitureModelBuilder=window.ArdayFurnitureModels.create({
   T,getRoomMode:()=>roomMode,rooms:{bedroom,kitchen,bathroom,living},furnitureModelAliases,
   stylizeMaterial,recolorFurniture,createPainterTexture,applyPainterMap,roomWallMap,
   openFurnitureActions,openKitchenPanel,document,addWindowSun,toast
  });
  function createOwnedFurniture(name,record=null){
   const model=furnitureModelBuilder.build(name,record);
   if(!model)return null;
   const {variant,modelName,room,parent,id,group,restoring,width:initialWidth,depth:initialDepth,height,surfaceType:initialSurfaceType,surfaceY:initialSurfaceY,supportId:initialSupportId,wallAxis,wallSide,anchor,action}=model;
   let width=initialWidth,depth=initialDepth,surfaceType=initialSurfaceType,surfaceY=initialSurfaceY,supportId=initialSupportId;
   let modelMeshCount=0;
   group.traverse(object=>{if(object.isMesh){modelMeshCount++;object.visible=true;object.frustumCulled=false;object.castShadow=true;object.receiveShadow=true;if(object.material){object.material.visible=true;object.material.side=T.DoubleSide}}});
   if(modelMeshCount<2){parent.remove(group);toast(name+'的3D模型没有正确生成，请重试');console.error('Furniture model incomplete',name,modelMeshCount);return null}
   applyInkOutlines(group);
   group.visible=true;group.updateMatrixWorld(true);
   let x=record?.x??0,z=record?.z??0,y=record?.y??(wallAxis?2.65:0),rotation=record?.rotation||0;
   // Wall cabinets are modeled around their local origin; legacy saves stored them at floor height.
   if(modelName==='吊柜'&&(!Number.isFinite(y)||y<1.6))y=2.65;if(modelName==='壁灯'&&(!Number.isFinite(y)||y<2.5))y=3.15;if(modelName==='吊灯'&&(!Number.isFinite(y)||y<4))y=4.45;
   if(record?.supportId){const savedSupport=s.placed?.find(it=>it.id===record.supportId),support=furnitureRegistry.find(it=>it.id===record.supportId);if(savedSupport?.modelName==='地毯'||support?.surfaceType==='rug'){supportId=null;y=0}else if(support&&support.surfaceType==='table'){supportId=support.id;y=record.y??(support.group.position.y+support.surfaceY)}else{supportId=null;y=0}}
   if(modelName==='壁画'){x=record?.x??-2.1;z=-3.78;y=record?.y??1.9}
   if(!wallAxis&&surfaceType==='floor'&&modelName!=='地毯'&&modelName!=='卧室地毯')addContactShadow(group,width,depth);
   if(modelName==='台灯'||modelName==='壁灯'||modelName==='吊灯'||modelName==='落地灯'){const isCeiling=modelName==='吊灯',isFloor=modelName==='落地灯',lampPoint=new T.PointLight(0xffd39a,isCeiling?2.5:isFloor?1.8:1.05,isCeiling?8.5:isFloor?7:4.8,1.8);lampPoint.position.set(isFloor&&variant==='黄铜弧形'?.47:0,isCeiling?-.56:isFloor?1.48:modelName==='台灯'?.72:-.02,isCeiling?0:modelName==='壁灯'?.24:0);lampPoint.castShadow=false;group.add(lampPoint);const enabled=record?.lightOn!==false,bulb=new T.Mesh(new T.SphereGeometry(isCeiling?.105:.075,16,12),new T.MeshStandardMaterial({color:enabled?0xffe4b5:0x786f63,emissive:enabled?0x8d5422:0x000000,emissiveIntensity:enabled?.55:0,roughness:.28,metalness:.05}));bulb.position.copy(lampPoint.position);group.add(bulb);const glow=new T.Sprite(new T.SpriteMaterial({map:lampGlowTexture,color:0xffdfae,transparent:true,opacity:enabled?.30:0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));glow.position.copy(lampPoint.position);glow.scale.set(isCeiling?1.15:.82,isCeiling?1.15:.82,1);glow.visible=enabled;group.add(glow);practicalLights.push({light:lampPoint,base:lampPoint.intensity,enabled,bulb,glow,group,room});group.userData.lampLight=lampPoint;group.userData.lampBulb=bulb;action=()=>{const item=furnitureRegistry.find(x=>x.group===group);if(!item)return;item.lightOn=!item.lightOn;const light=practicalLights.find(x=>x.light===lampPoint);if(light){light.enabled=item.lightOn;if(light.glow)light.glow.visible=item.lightOn}updateDaylight(true);persistFurniture(item);toast(item.name+(item.lightOn?'已开启':'已关闭'))}}
   group.position.set(x,y,z);group.rotation.y=rotation;
   const item=registerFurniture({id,name,room,group,width,depth,anchor:wallAxis?[0,anchor[1]]:[0,.5],action,wallAxis,wallSide,wallRange:4.5,record});
   item.owned=true;item.kind=record?.kind||(name.startsWith('成品食物·')?'food':'furniture');if(group.userData.lampLight){item.lightOn=record?.lightOn!==false;const light=practicalLights.find(x=>x.light===group.userData.lampLight);if(light){light.enabled=item.lightOn;if(light.glow)light.glow.visible=item.lightOn}}item.wallAxis=wallAxis;item.wallSide=wallSide;item.wallRange=4.5;item.surfaceType=surfaceType;item.surfaceY=surfaceY;item.supportId=supportId;
   item.dyeMaterials=[];group.traverse(object=>{if(object.isMesh&&!object.userData.inkOutline&&object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{if(material?.userData?.dyeable&&!item.dyeMaterials.includes(material))item.dyeMaterials.push(material)})}});
   if(record?.dyeColor)item.dyeMaterials.forEach(material=>material.color.setHex(record.dyeColor));item.dyeColor=record?.dyeColor||null;
   if(restoring){
    if(wallAxis){const side=record.wallSide||wallSide||'back',offset=record.wallOffset??(side==='back'||side==='front'?(record.x??x):(record.z??z));wallTransform(group,side,offset,modelName==='吊柜'?y:(record.y??y));item.wallSide=side;item.wallAxis=side==='back'||side==='front'?'x':'z';item.wallAnchorY=(anchor?.[1]??2.55)-group.position.y}
    else{const legacyRugSupport=record.supportId&&s.placed?.some(it=>it.id===record.supportId&&it.name?.startsWith('地毯'));if(legacyRugSupport)item.supportId=null;group.position.set(record.x??x,legacyRugSupport?0:(record.y??y),record.z??z);group.rotation.y=record.rotation||0;if(Number.isFinite(Number(record.scale))&&Number(record.scale)>0){item.footprintScale=Number(record.scale);group.scale.setScalar(item.footprintScale);width*=item.footprintScale;depth*=item.footprintScale;item.width=width;item.depth=depth}}
   }
   else{
    const supports=surfaceType==='tabletop'||['电脑','捧花摆件'].includes(modelName)?furnitureRegistry.filter(it=>it.room===room&&it.surfaceType==='table').sort((a,b)=>b.width*b.depth-a.width*a.depth):[];
    let support=null;
    let placed=false;
    if(surfaceType==='ceiling'){group.position.set(0,4.45,0);placed=true;}
    else if(surfaceType==='tabletop'&&supports.length){
     // Validate against the usable top and objects already resting on that same
     // support. Nearby chairs and cabinet fronts must not block tabletop placement.
     for(const candidate of supports){
      support=candidate;
      const topW=Math.max(.2,Number(support.width)||.2),topD=Math.max(.2,Number(support.depth)||.2);
      const halfW=item.width/2,halfD=item.depth/2,edgeGap=.015,limitX=topW/2-halfW-edgeGap,limitZ=topD/2-halfD-edgeGap;
      if(limitX<-.001||limitZ<-.001)continue;
      // Try center first, then a regular grid and all four corners. The previous
      // single large step skipped valid positions on narrow desks and counters.
      const positions=[[0,0]],stepX=item.width+.035,stepZ=item.depth+.035;
      for(let oz=-limitZ;oz<=limitZ+.001;oz+=stepZ)for(let ox=-limitX;ox<=limitX+.001;ox+=stepX)positions.push([ox,oz]);
      for(const oz of [-limitZ,limitZ])for(const ox of [-limitX,limitX])positions.push([ox,oz]);
      const uniquePositions=positions.filter((point,index)=>positions.findIndex(p=>Math.abs(p[0]-point[0])<.01&&Math.abs(p[1]-point[1])<.01)===index);
      const co=Math.cos(support.group.rotation.y),si=Math.sin(support.group.rotation.y);
      for(const [ox,oz] of uniquePositions){
       const occupied=furnitureRegistry.some(other=>{
        if(other===item||other.id===support.id||other.room!==room||other.supportId!==support.id)return false;
        const dx=other.group.position.x-support.group.position.x,dz=other.group.position.z-support.group.position.z;
        const localX=dx*co-dz*si,localZ=dx*si+dz*co,relativeAngle=other.group.rotation.y-support.group.rotation.y;
        const otherHalfX=(Math.abs(Math.cos(relativeAngle))*other.width+Math.abs(Math.sin(relativeAngle))*other.depth)/2;
        const otherHalfZ=(Math.abs(Math.sin(relativeAngle))*other.width+Math.abs(Math.cos(relativeAngle))*other.depth)/2;
        return Math.abs(localX-ox)<halfW+otherHalfX+.06&&Math.abs(localZ-oz)<halfD+otherHalfZ+.06;
       });
       if(occupied)continue;
       const x=support.group.position.x+ox*co+oz*si,z=support.group.position.z-ox*si+oz*co;
       item.supportId=support.id;group.position.set(x,support.group.position.y+support.surfaceY+.015,z);group.rotation.y=support.group.rotation.y;
       placed=true;break;
      }
      if(placed)break;
     }
     // If every normal slot was rejected because a particular side table or
     // cabinet has a narrower top than the plate, fit the dish to the largest
     // available support instead of silently falling through to the floor.
     if(!placed&&supports.length){
      // If a second dish cannot fit at full size, progressively test smaller
      // footprints before giving up. This keeps several dishes on one table
      // without allowing them to overlap.
      const orderedSupports=supports.slice().sort((a,b)=>b.width*b.depth-a.width*a.depth);
      for(const candidate of orderedSupports){
       for(let fit=1;fit>=.62;fit=Math.round((fit-.04)*100)/100){
        const fittedWidth=item.width*fit,fittedDepth=item.depth*fit;
        const limitX=candidate.width/2-fittedWidth/2-.018,limitZ=candidate.depth/2-fittedDepth/2-.018;
        if(limitX<0||limitZ<0)continue;
        const stepX=fittedWidth+.025,stepZ=fittedDepth+.025,positions=[[0,0]];
        for(let oz=-limitZ;oz<=limitZ+.001;oz+=stepZ)for(let ox=-limitX;ox<=limitX+.001;ox+=stepX)positions.push([ox,oz]);
        for(const oz of [-limitZ,limitZ])for(const ox of [-limitX,limitX])positions.push([ox,oz]);
        const co=Math.cos(candidate.group.rotation.y),si=Math.sin(candidate.group.rotation.y);
        const unique=positions.filter((point,index)=>positions.findIndex(p=>Math.abs(p[0]-point[0])<.01&&Math.abs(p[1]-point[1])<.01)===index);
        for(const [ox,oz] of unique){
         const occupied=furnitureRegistry.some(other=>{
          if(other===item||other.id===candidate.id||other.room!==room||other.supportId!==candidate.id)return false;
          const dx=other.group.position.x-candidate.group.position.x,dz=other.group.position.z-candidate.group.position.z;
          const localX=dx*co-dz*si,localZ=dx*si+dz*co,da=other.group.rotation.y-candidate.group.rotation.y;
          const otherHalfX=(Math.abs(Math.cos(da))*other.width+Math.abs(Math.sin(da))*other.depth)/2;
          const otherHalfZ=(Math.abs(Math.sin(da))*other.width+Math.abs(Math.cos(da))*other.depth)/2;
          return Math.abs(localX-ox)<fittedWidth/2+otherHalfX+.012&&Math.abs(localZ-oz)<fittedDepth/2+otherHalfZ+.012;
         });
         if(occupied)continue;
         if(fit<.999){group.scale.setScalar(fit);item.width=fittedWidth;item.depth=fittedDepth;item.footprintScale=(item.footprintScale||1)*fit}
         item.supportId=candidate.id;
         group.position.set(candidate.group.position.x+ox*co+oz*si,candidate.group.position.y+candidate.surfaceY+.015,candidate.group.position.z-ox*si+oz*co);
         group.rotation.y=candidate.group.rotation.y;placed=true;break;
        }
        if(placed)break;
       }
       if(placed)break;
      }
     }
    }else{
     if(surfaceType==='tabletop'){item.supportId=null;group.position.y=0}
     const rug=furnitureRegistry.find(it=>it.room===room&&it.surfaceType==='rug');
     const rugSpots=surfaceType==='floor'&&name!=='地毯'?window.ArdayFurniturePlacement.rugCandidates(rug):[];
     const fallbackSpots=modelName==='壁画'?[[-2.1,-3.78],[0,-3.78],[2.1,-3.78]]:[[0,0],[-2.3,.2],[2.2,.2],[0,2.2],[0,-2.1],[-2,-2],[2,2]];
     const candidates=wallAxis?fallbackSpots:[...rugSpots,...fallbackSpots];
     if(wallAxis){
      for(const point of candidates){const side=wallSide||'back',offset=point[0];if(canPlaceOnWall(item,side,offset)){wallTransform(group,side,offset,group.position.y);placed=true;break}}
     }else{
      for(const point of candidates){if(canPlaceFurniture(item,point[0],point[1],rotation)){group.position.x=point[0];group.position.z=point[1];placed=true;break}}
     }
    }
    if(!placed&&surfaceType==='tabletop'){
     // A cooked dish or small prop remains placeable on the floor when every top is full.
     item.supportId=null;group.position.y=0;group.rotation.y=rotation;
     const rug=furnitureRegistry.find(it=>it.room===room&&it.surfaceType==='rug');
     const floorSpots=[...window.ArdayFurniturePlacement.rugCandidates(rug),[0,0],[-2.3,.2],[2.2,.2],[0,2.2],[0,-2.1],[-2,-2],[2,2]];
     for(const point of floorSpots){if(canPlaceFurniture(item,point[0],point[1],rotation)){group.position.x=point[0];group.position.z=point[1];placed=true;break}}
    }
    if(!placed){parent.remove(group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);return null}
   }
   s.placed=s.placed||[];
   if(!record)s.placed.push({id,name,room,kind:name.startsWith('成品食物·')?'food':'furniture',x:group.position.x,y:group.position.y,z:group.position.z,rotation:group.rotation.y,supportId:item.supportId||null,...(item.isDoor?{destination:item.doorDestination||'living'}:{})});
   applyInkOutlines(group);renderer.shadowMap.needsUpdate=true;persistFurniture(item);console.info('[Arday furniture]',name,'meshes:',modelMeshCount,'children:',group.children.length);return item;
  }
  const hotspotWorld=new T.Vector3();
  s.placed=s.placed||[];
  s.placed=s.placed.filter(item=>item?.id!=='arday-cream-walnut-sofa');
  const legacyDoorIds=['living-bedroom-door','living-kitchen-door','bedroom-living-door','kitchen-living-door','living-bathroom-door','bathroom-living-door'];
  s.placed=s.placed.filter(record=>!legacyDoorIds.includes(record?.id));
  const restoredFurnitureRecords=(s.placed||[]).filter(record=>record&&typeof record==='object'&&typeof record.name==='string'&&record.kind!=='scene');
  restoredFurnitureRecords.forEach(record=>createOwnedFurniture(record.name,record));
  // Resolve support relationships after every saved item exists. The old
  // one-pass restore silently detached tabletop objects when their table
  // appeared later in s.placed.
  restoredFurnitureRecords.forEach(record=>{
   if(!record.supportId)return;
   const item=furnitureRegistry.find(entry=>entry.id===record.id);
   if(!item)return;
   const support=furnitureRegistry.find(entry=>entry.id===record.supportId&&entry.room===item.room);
   if(support?.surfaceType==='table'){
    item.supportId=support.id;item.allowSupportOverlap=false;
    item.group.position.y=support.group.position.y+support.surfaceY+.015;
    persistFurniture(item);
   }else{
    item.supportId=null;item.allowSupportOverlap=false;item.group.position.y=0;
    persistFurniture(item);
   }
  });

  // One matching default door per room: living opens to the public hall; private rooms return to the living room.
  const defaultDoorRecords=[
   {id:'default-door-living',name:'默认室内木门',room:'living',kind:'furniture',itemId:'默认室内木门',variant:'标准胡桃木',wallSide:'left',wallOffset:0,x:-5.16,y:0,z:0,destination:'hall'},
   {id:'default-door-bedroom',name:'默认室内木门',room:'bedroom',kind:'furniture',itemId:'默认室内木门',variant:'标准胡桃木',wallSide:'right',wallOffset:.45,x:5.16,y:0,z:.45,destination:'living'},
   {id:'default-door-kitchen',name:'默认室内木门',room:'kitchen',kind:'furniture',itemId:'默认室内木门',variant:'标准胡桃木',wallSide:'right',wallOffset:.45,x:5.16,y:0,z:.45,destination:'living'},
   {id:'default-door-bathroom',name:'默认室内木门',room:'bathroom',kind:'furniture',itemId:'默认室内木门',variant:'标准胡桃木',wallSide:'right',wallOffset:.45,x:5.16,y:0,z:.45,destination:'living'}
  ];
  if(!s.defaultDoorSetupVersion){
  defaultDoorRecords.forEach(def=>{
   let record=s.placed.find(entry=>entry.id===def.id);
   if(!record){record={...def};s.placed.push(record)}
   record.name='默认室内木门';record.kind='furniture';record.destination=record.destination||def.destination;
   const existing=furnitureRegistry.find(entry=>entry.id===record.id);
   if(!existing)createOwnedFurniture(record.name,record);
  });
   s.defaultDoorSetupVersion=1;save();
  }
  const furnitureCorners=(...args)=>window.ArdayFurniturePlacement.corners(...args);
  const rectsOverlap=(...args)=>window.ArdayFurniturePlacement.rectsOverlap(...args);
  const canPlaceFurniture=(item,x,z,angle=item.group.rotation.y)=>window.ArdayFurniturePlacement.canPlaceFurniture(item,x,z,angle,furnitureRegistry,roomBounds,canPlaceOnWall);
  // A support surface and everything resting on it form one placement unit.
  // Validate attached objects at their prospective transforms before moving
  // the parent, otherwise a clear tabletop can carry a lamp/computer through
  // a wall or into another piece of furniture.
  function canPlaceFurnitureWithSupports(item,x,z,angle=item.group.rotation.y,y=item.group.position.y){
   if(!canPlaceFurniture(item,x,z,angle))return false;
   const children=furnitureRegistry.filter(child=>child.supportId===item.id);
   if(!children.length)return true;
   const old={x:item.group.position.x,y:item.group.position.y,z:item.group.position.z,angle:item.group.rotation.y};
   const snapshots=children.map(child=>({child,x:child.group.position.x,y:child.group.position.y,z:child.group.position.z,angle:child.group.rotation.y}));
   const da=angle-old.angle,co=Math.cos(da),si=Math.sin(da),dy=y-old.y;
   item.group.position.set(x,y,z);item.group.rotation.y=angle;
   snapshots.forEach(({child,x:cx,z:cz})=>{
    const rx=cx-old.x,rz=cz-old.z;
    child.group.position.set(x+rx*co+rz*si,child.group.position.y+dy,z-rx*si+rz*co);
    child.group.rotation.y+=da;
   });
   const valid=snapshots.every(({child})=>canPlaceFurniture(child,child.group.position.x,child.group.position.z,child.group.rotation.y));
   item.group.position.set(old.x,old.y,old.z);item.group.rotation.y=old.angle;
   snapshots.forEach(({child,x:cx,y:cy,z:cz,angle:ca})=>{child.group.position.set(cx,cy,cz);child.group.rotation.y=ca});
   return valid;
  }
   function moveSupportedFurniture(parent,oldX,oldY,oldZ,oldAngle){
    const dx=parent.group.position.x-oldX,dz=parent.group.position.z-oldZ,dy=parent.group.position.y-oldY,da=parent.group.rotation.y-oldAngle;
    const co=Math.cos(da),si=Math.sin(da);
    furnitureRegistry.filter(child=>child.supportId===parent.id).forEach(child=>{
     const rx=child.group.position.x-oldX,rz=child.group.position.z-oldZ;
     child.group.position.x=parent.group.position.x+rx*co+rz*si;
     child.group.position.z=parent.group.position.z-rx*si+rz*co;
     child.group.position.y+=dy;child.group.rotation.y+=da;
    });
   }
   function persistSupportedChildren(parent){
    furnitureRegistry.filter(child=>child.supportId===parent.id).forEach(persistFurniture);
   }
   function findTabletopSnap(item,x,z){
    const candidates=furnitureRegistry.filter(other=>other.room===item.room&&other.surfaceType==='table');
    let best=null;
    for(const support of candidates){
     const dx=x-support.group.position.x,dz=z-support.group.position.z,co=Math.cos(support.group.rotation.y),si=Math.sin(support.group.rotation.y);
     const localX=dx*co-dz*si,localZ=dx*si+dz*co;
     const fit=Math.min(1,(support.width-.036)/item.width,(support.depth-.036)/item.depth);
     if(!Number.isFinite(fit)||fit<.62)continue;
     const itemWidth=item.width*fit,itemDepth=item.depth*fit;
     const limitX=support.width/2-itemWidth/2-.018,limitZ=support.depth/2-itemDepth/2-.018;
     if(limitX<0||limitZ<0)continue;
     const snapRange=.42;
     if(Math.abs(localX)>limitX+snapRange||Math.abs(localZ)>limitZ+snapRange)continue;
     const clampedX=Math.max(-limitX,Math.min(limitX,localX)),clampedZ=Math.max(-limitZ,Math.min(limitZ,localZ));
     const distance=Math.hypot(localX-clampedX,localZ-clampedZ);
     if(!best||distance<best.distance)best={support,x:support.group.position.x+clampedX*co+clampedZ*si,z:support.group.position.z-clampedX*si+clampedZ*co,distance,fit};
    }
    return best;
   }
function persistFurniture(item){
   s.placed=s.placed||[];
   let saved=s.placed.find(x=>x.id===item.id);
   if(!saved){saved={id:item.id,name:item.name,room:item.room,kind:item.kind||(item.owned?'furniture':'scene'),itemId:item.kind==='furniture'?item.name.split('·')[0].trim():item.name,variant:item.kind==='furniture'?item.name.split('·').slice(1).join('·').trim():''};s.placed.push(saved)}
   Object.assign(saved,{name:item.name,room:item.room,itemId:item.kind==='furniture'?item.name.split('·')[0].trim():item.name,variant:item.kind==='furniture'?item.name.split('·').slice(1).join('·').trim():'',x:item.group.position.x,y:item.group.position.y,z:item.group.position.z,rotation:item.group.rotation.y,scale:item.footprintScale||1,supportId:item.supportId||null});
   if(item.dyeColor)saved.dyeColor=item.dyeColor;
   if(typeof item.lightOn==='boolean')saved.lightOn=item.lightOn;
   if(item.isDoor)saved.destination=item.doorDestination||'living';
   renderer.shadowMap.needsUpdate=true;
   if(item.wallAxis){saved.wallSide=item.wallSide;saved.wallOffset=wallOffset(item)}
   save();
  }
  function updateDoorDestinationLabel(group,destination){
   const canvas=group?.userData?.doorDestinationCanvas,texture=group?.userData?.doorDestinationTexture;
   if(!canvas||!texture)return;
   const labels={living:'起居室',kitchen:'厨房',bedroom:'卧室',bathroom:'卫生间',hall:'公共大厅'},label=labels[destination]||'起居室',ctx=canvas.getContext('2d');
   ctx.clearRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle='rgba(247,239,224,.97)';ctx.beginPath();ctx.roundRect(6,6,628,180,28);ctx.fill();
   ctx.strokeStyle='#967657';ctx.lineWidth=8;ctx.stroke();
   ctx.fillStyle='#574532';ctx.font='600 96px "Noto Serif SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,320,98);
   texture.needsUpdate=true;
  }
  function openDoorWheel(item){
   if(!item?.isDoor)return;
   closeFurnitureActions();
   const rect=stage.getBoundingClientRect(),button=item.button;
   const rawX=button?Number.parseFloat(button.style.left):rect.width/2,rawY=button?Number.parseFloat(button.style.top):rect.height/2;
   let radius=Math.min(92,Math.min(rect.width,rect.height)*.18);
   radius=Math.max(48,radius);
   const extent=()=>radius*.76+36;
   if(rect.width<extent()*2||rect.height<extent()*2)radius=Math.max(42,Math.min(radius,(Math.min(rect.width,rect.height)-16)/2.1));
   const edge=extent(),cx=Math.max(edge,Math.min(rect.width-edge,Number.isFinite(rawX)?rawX:rect.width/2)),cy=Math.max(edge,Math.min(rect.height-edge,Number.isFinite(rawY)?rawY:rect.height/2));
   const wheel=document.createElement('div');wheel.className='furniture-wheel door-wheel';wheel.style.left=cx+'px';wheel.style.top=cy+'px';wheel.style.width=radius*2+'px';wheel.style.height=radius*2+'px';
   const center=document.createElement('div');center.className='furniture-wheel-center';center.style.left=radius+'px';center.style.top=radius+'px';
   const title=document.createElement('span');title.className='furniture-wheel-title';title.textContent='门的去向';
   const subtitle=document.createElement('span');subtitle.className='furniture-wheel-subtitle';subtitle.textContent='选择目的地';center.append(title,subtitle);center.onclick=closeFurnitureActions;wheel.appendChild(center);
   const destinations=[['living','起居室','⌂'],['kitchen','厨房','♨'],['bedroom','卧室','☾'],['bathroom','卫生间','◌'],['hall','公共大厅','◇']];
   destinations.forEach(([value,label,symbol],index)=>{
    const angle=(-90+index*360/destinations.length)*Math.PI/180,button=document.createElement('button');button.type='button';button.className='furniture-wheel-action';button.style.left=(radius+Math.cos(angle)*radius*.76)+'px';button.style.top=(radius+Math.sin(angle)*radius*.76)+'px';button.setAttribute('aria-label','将门通往'+label);
    const icon=document.createElement('span');icon.className='furniture-wheel-icon';icon.textContent=symbol;
    const textNode=document.createElement('span');textNode.className='furniture-wheel-label';textNode.textContent=label;
    button.append(icon,textNode);button.setAttribute('aria-pressed',item.doorDestination===value?'true':'false');
    button.onclick=()=>{item.doorDestination=value;item.group.userData.roomTarget=value;updateDoorDestinationLabel(item.group,value);persistFurniture(item);closeFurnitureActions();toast('门已通往'+label)};
    wheel.appendChild(button);
   });
   stage.appendChild(wheel);
   wheel._outsideHandler=event=>{if(!wheel.contains(event.target)&&event.target!==item.button)closeFurnitureActions()};
   wheel._escapeHandler=event=>{if(event.key==='Escape')closeFurnitureActions()};
   document.addEventListener('pointerdown',wheel._outsideHandler,true);document.addEventListener('keydown',wheel._escapeHandler,true);
  }
  function recycleDoor(item){
   if(!item?.isDoor||!item.owned)return;
   const saved=s.placed.find(entry=>entry.id===item.id);const stored=addInventoryItem(item.name,'furniture',item.id);stored.destination=item.doorDestination||'living';
   s.placed=s.placed.filter(entry=>entry.id!==item.id);item.group.parent?.remove(item.group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);
   selectedFurniture=null;rotateFurnitureButton.disabled=true;removeFurnitureButton.disabled=true;refreshDyePalette();save();updateFurnitureHotspots();toast('门已收回背包');
  }
  function selectFurniture(item){selectedFurniture=item;rotateFurnitureButton.disabled=!!item.wallAxis;removeFurnitureButton.disabled=!item.owned;refreshDyePalette();}
  const rotateFurnitureButton=document.createElement('button');
  rotateFurnitureButton.type='button';rotateFurnitureButton.id='rotateFurnitureButton';rotateFurnitureButton.textContent='↻';rotateFurnitureButton.disabled=true;
  const removeFurnitureButton=document.createElement('button');removeFurnitureButton.type='button';removeFurnitureButton.id='removeFurnitureButton';removeFurnitureButton.textContent='⌫';removeFurnitureButton.disabled=true;removeFurnitureButton.setAttribute('aria-label','回收家具');
  removeFurnitureButton.onclick=()=>{const item=selectedFurniture;if(!item?.owned)return;const children=furnitureRegistry.filter(x=>x.supportId===item.id);children.forEach(child=>{if(child.owned){const saved=s.placed.find(x=>x.id===child.id);addInventoryItem(child.name,saved?.kind||'furniture',child.id);s.placed=s.placed.filter(x=>x.id!==child.id)}child.group.parent?.remove(child.group);child.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(child),1)});const saved=s.placed.find(x=>x.id===item.id);addInventoryItem(item.name,saved?.kind||'furniture',item.id);s.placed=s.placed.filter(x=>x.id!==item.id);item.group.parent?.remove(item.group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);selectedFurniture=null;removeFurnitureButton.disabled=true;rotateFurnitureButton.disabled=true;refreshDyePalette();save();updateFurnitureHotspots()};
  const dyePalette=document.createElement('div');dyePalette.className='furniture-dye-palette';dyePalette.hidden=true;
  const dyeColors=[['燕麦','#c7ad8d'],['奶油','#e8dfcf'],['陶土','#ad6955'],['鼠尾草','#89917b'],['雾蓝','#71899a'],['石墨','#55565a'],['酒红','#80565a'],['暖灰','#a5a09a'],['橄榄','#777b55'],['浅粉','#d4aaa4'],['胡桃','#634b3d'],['象牙','#f2eadb'],['雾紫','#96899e'],['灰绿','#aab4a1'],['焦糖','#b77d4f'],['海盐','#a9c0c4'],['莓果','#985f70'],['深海','#40596d'],['麦芽','#d5bd91'],['黑咖','#403a35'],['珊瑚','#c98272'],['冰川','#d2dfe0']];
  function refreshDyePalette(){dyePalette.replaceChildren();const item=selectedFurniture;dyePalette.hidden=!(item?.owned&&item.dyeMaterials?.length);if(dyePalette.hidden)return;dyeColors.forEach(([name,color])=>{const b=document.createElement('button');b.type='button';b.className='dye-swatch';b.style.setProperty('--swatch',color);b.setAttribute('aria-label',name);b.title=name;b.setAttribute('aria-pressed',item.dyeColor===parseInt(color.slice(1),16));b.onclick=()=>{const hex=parseInt(color.slice(1),16);item.dyeMaterials.forEach(material=>material.color.setHex(hex));item.dyeColor=hex;const saved=s.placed.find(x=>x.id===item.id);if(saved)saved.dyeColor=hex;save();refreshDyePalette()};dyePalette.appendChild(b)})}
  rotateFurnitureButton.onclick=()=>{
   const item=selectedFurniture;if(!item){toast('请先选中一件家具');return}
   const next=item.group.rotation.y+Math.PI/12;
   if(!canPlaceFurnitureWithSupports(item,item.group.position.x,item.group.position.z,next,item.group.position.y)){toast('这个方向会超出房间或与其他家具碰撞');return}
   const ox=item.group.position.x,oy=item.group.position.y,oz=item.group.position.z,oa=item.group.rotation.y;
   item.group.rotation.y=next;moveSupportedFurniture(item,ox,oy,oz,oa);persistFurniture(item);updateFurnitureHotspots();
  };
  function updateFurnitureHotspots(){
   if(roomMode==='hall')return;
   const now=performance.now();if(now-lastHotspotUpdate<33)return;lastHotspotUpdate=now;
   const rect=stage.getBoundingClientRect();
   for(const item of furnitureRegistry){
    const b=item.button;if(!b)continue;
    if(decorating||item.room!==roomMode||!item.group.visible){b.style.visibility='hidden';continue}
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
  const wallpaperColors={'buy-wallpaper-warm-white':0xd5d1c9,'buy-wallpaper-deepblue':0x243b59,'buy-wallpaper-mist':0x8b929c};
  function applyWallpaperToRoom(root,id){
   const wallpaper=id||'buy-wallpaper-warm-white';
   const tint=wallpaper==='buy-wallpaper-deepblue'?0x9eafc4:wallpaper==='buy-wallpaper-mist'?0xc4c8cb:0xffffff;
   (root.userData.wallMeshes||[]).forEach(mesh=>{
    const previous=mesh.material;
    const material=new T.MeshStandardMaterial({color:tint,map:roomWallMap,roughness:.96,side:T.DoubleSide});
    material.map=roomWallMap;material.bumpMap=null;material.needsUpdate=true;
    if(previous?.transparent){material.transparent=true;material.opacity=previous.opacity??1;material.depthWrite=false}
    mesh.material=material;mesh.userData.wallpaperSurface=true;
   });
  }
  function setRoom(mode){
   roomMode=mode==='hall'?'hall':['kitchen','bedroom','bathroom'].includes(mode)?mode:'living';
   living.visible=roomMode==='living';bedroom.visible=roomMode==='bedroom';kitchen.visible=roomMode==='kitchen';bathroom.visible=roomMode==='bathroom';hall.visible=roomMode==='hall';
   if(roomMode==='hall'){
    furnitureRegistry.forEach(item=>{if(item.button)item.button.style.visibility='hidden'});
    scene.background.set(0x07111f);cameraTarget.set(person.position.x,6.2,person.position.z);hallCameraOffset.set(0,0,0);targetTheta=.72;targetPhi=1.22;targetRadius=92;applyCamera();updateDaylight(true);renderer.shadowMap.needsUpdate=true;scene.background.set(0x07111f);return;
   }
   const root=roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:roomMode==='bathroom'?bathroom:living,finish=s.roomFinishes?.[roomMode],wallpaper=s.roomFinishes?.wallpaper||finish?.wallpaper||'buy-wallpaper-warm-white';
   applyWallpaperToRoom(root,wallpaper);
   if(finish?.floor){root.userData.floorMesh.material=M(finish.floor==='buy-floor-concrete'?0x69727b:0x424d5b)}
   const colors={living:0x343b46,bedroom:0x3b4654,kitchen:0x343b46,bathroom:0x3b4546};scene.background.set(colors[roomMode]);
   cameraTarget.set(0,1,roomMode==='kitchen'?-1:roomMode==='bathroom'?-.35:0);updateDaylight(true);
   targetTheta=roomMode==='bedroom'?.55:roomMode==='kitchen'?.78:roomMode==='bathroom'?.72:.68;targetPhi=1.08;targetRadius=roomMode==='bedroom'?12.7:roomMode==='bathroom'?13.1:13.4;applyCamera();
  }
  function updateActivity(a,anchorOverride,roomOverride,furnitureIdOverride){
   const act=normalizeActivity(a),meta=activityMeta[act]||{location:'center',pose:'wave',anchor:'default'};
   activeActivity=act;
   if(roomMode==='hall'){person.visible=true;pose='idle';basePose='idle';walkRoute=[];walkIndex=0;walkPauseUntil=0;rig.rotation.set(0,0,0);rig.position.set(0,0,0);eyeGroups.forEach(g=>g.scale.y=1);return;}
   const characterRoom=['bedroom','kitchen','bathroom'].includes(roomOverride)?roomOverride:(act==='sleep'?'bedroom':'living');person.visible=characterRoom===roomMode;
   const anchor=anchorOverride||meta.anchor||'default';let p=positions[meta.location]||positions.center,faceAngle=person.rotation.y,poseOverride=null;
   const furniture=(predicate,room=characterRoom)=>furnitureRegistry.filter(it=>it.room===room&&predicate(it));
   const nearest=(items,origin)=>items.sort((a,b)=>Math.hypot(a.group.position.x-origin.x,a.group.position.z-origin.z)-Math.hypot(b.group.position.x-origin.x,b.group.position.z-origin.z))[0];
   const nearestSeat=(origin,room=characterRoom)=>nearest(furniture(it=>['chair','cushion'].includes(furnitureKindForPlaced({name:it.name})),room).filter(it=>Math.hypot(it.group.position.x-origin.x,it.group.position.z-origin.z)<=2.6),origin);
   const faceToward=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
   const standInFront=(item,extra=.52)=>{const front=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),item.group.rotation.y),distance=(Number(item.depth)||.8)/2+extra;p=[item.group.position.x+front.x*distance,0,item.group.position.z+front.z*distance];faceAngle=faceToward({x:p[0],z:p[2]},item.group.position)};
   if(anchor==='desk'){
    const sourceFurniture=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride)[0]:null;
    const computer=sourceFurniture?.name==='电脑'?sourceFurniture:sourceFurniture?.name.startsWith('书桌')?furniture(it=>it.name==='电脑'&&String(it.supportId)===String(sourceFurniture.id))[0]:furniture(it=>it.name==='电脑'&&it.supportId)[0];
    const desk=sourceFurniture?.name.startsWith('书桌')?sourceFurniture:(computer&&furniture(it=>it.id===computer.supportId)[0])||furniture(it=>it.name.startsWith('书桌'))[0];
    if(desk){const seat=nearestSeat(desk.group.position);
     if(seat){p=[seat.group.position.x,0,seat.group.position.z];faceAngle=faceToward(seat.group.position,desk.group.position)}
     else{const offset=new T.Vector3(0,0,Math.max(.82,desk.depth/2+.48)).applyAxisAngle(new T.Vector3(0,1,0),desk.group.rotation.y);p=[desk.group.position.x+offset.x,0,desk.group.position.z+offset.z];faceAngle=faceToward({x:p[0],z:p[2]},desk.group.position);poseOverride='stand'}}
   }else if(anchor==='shelf'){
    const selected=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&/书架|书柜/.test(it.name))[0]:null;
    const shelf=selected||nearest(furniture(it=>/书架|书柜/.test(it.name),characterRoom),person.position);
    if(shelf){const seat=nearestSeat(shelf.group.position),offset=new T.Vector3(0,0,-(shelf.depth/2+.52)).applyAxisAngle(new T.Vector3(0,1,0),shelf.group.rotation.y);p=seat?[seat.group.position.x,0,seat.group.position.z]:[shelf.group.position.x+offset.x,0,shelf.group.position.z+offset.z];faceAngle=seat?faceToward(seat.group.position,shelf.group.position):faceToward({x:p[0],z:p[2]},shelf.group.position);if(!seat)poseOverride='stand'}
   }else if(anchor==='sofa'){
    const selected=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='sofa')[0]:null;
    const sofa=selected||nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='sofa',characterRoom),person.position);
    if(sofa){const seat=new T.Vector3(0,.61,-.08).applyAxisAngle(new T.Vector3(0,1,0),sofa.group.rotation.y);p=[sofa.group.position.x+seat.x,sofa.group.position.y+seat.y,sofa.group.position.z+seat.z];faceAngle=sofa.group.rotation.y+Math.PI}
   }else if(anchor==='table'){
    const selected=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&it.name.includes('餐桌'))[0]:null;
    const table=selected||nearest(furniture(it=>it.name.includes('餐桌'),characterRoom),person.position);
    if(table){const seat=nearestSeat(table.group.position);if(seat&&Math.hypot(seat.group.position.x-table.group.position.x,seat.group.position.z-table.group.position.z)<2.8){p=[seat.group.position.x,0,seat.group.position.z];faceAngle=faceToward(seat.group.position,table.group.position)}else{const offset=new T.Vector3(0,0,-(table.depth/2+.48)).applyAxisAngle(new T.Vector3(0,1,0),table.group.rotation.y);p=[table.group.position.x+offset.x,0,table.group.position.z+offset.z];faceAngle=faceToward({x:p[0],z:p[2]},table.group.position);poseOverride='stand'}}
   }else if(anchor==='chair'){
    const selectedChair=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&['chair','cushion'].includes(furnitureKindForPlaced({name:it.name})),characterRoom)[0]:null;
    const chair=selectedChair||nearest(furniture(it=>['chair','cushion'].includes(furnitureKindForPlaced({name:it.name})),characterRoom),person.position);
    if(chair){p=[chair.group.position.x,chair.group.position.y||0,chair.group.position.z];faceAngle=chair.group.rotation.y}
   }else if(anchor==='cushion'){
    const cushion=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='cushion',characterRoom)[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='cushion',characterRoom),person.position);
    if(cushion){p=[cushion.group.position.x,.08,cushion.group.position.z];faceAngle=cushion.group.rotation.y}
   }else if(anchor==='bouquet'){
    const bouquet=furniture(it=>it.name==='捧花摆件')[0];if(bouquet){p=[bouquet.group.position.x,0,bouquet.group.position.z+.9];faceAngle=Math.PI}
   }else if(anchor==='loftDesk'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='loftBed')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='loftBed',characterRoom),person.position);
    if(item){const seat=nearestSeat(item.group.position);if(seat&&Math.hypot(seat.group.position.x-item.group.position.x,seat.group.position.z-item.group.position.z)<2.6){p=[seat.group.position.x,0,seat.group.position.z];faceAngle=faceToward(seat.group.position,item.group.position)}else{standInFront(item,.58);poseOverride='stand'}}
   }else if(anchor==='bed'){
    if(act==='read')poseOverride='bedRead';else if(act==='rest')poseOverride='bedRest';
    const bed=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&['bed','loftBed'].includes(furnitureKindForPlaced({name:it.name})),'bedroom')[0]:nearest(furniture(it=>['bed','loftBed'].includes(furnitureKindForPlaced({name:it.name})),'bedroom'),person.position);
    if(bed){const half=(Number(bed.depth)||3.42)/2,headBack=2.585,clearance=.16,z=Math.min(half-.2,Math.max(.98,headBack-half+clearance)),offset=new T.Vector3(0,.92,z).applyAxisAngle(new T.Vector3(0,1,0),bed.group.rotation.y);p=[bed.group.position.x+offset.x,bed.group.position.y+offset.y,bed.group.position.z+offset.z];faceAngle=bed.group.rotation.y}
   }else if(['sink','piano','washingMachine','stove'].includes(anchor)){
    const kind=anchor==='sink'?'sink':anchor;
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})===kind)[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})===kind,characterRoom),person.position);
    if(item){if(anchor==='piano'){const stool=nearestSeat(item.group.position);if(stool&&Math.hypot(stool.group.position.x-item.group.position.x,stool.group.position.z-item.group.position.z)<2.5){p=[stool.group.position.x,0,stool.group.position.z];faceAngle=faceToward(stool.group.position,item.group.position)}else{standInFront(item,.62);poseOverride='stand'}}else standInFront(item,.52)}
   }else if(anchor==='treadmill'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='treadmill')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='treadmill',characterRoom),person.position);
    if(item){p=[item.group.position.x,0,item.group.position.z];const consolePoint=new T.Vector3(0,0,-(item.depth/2-.12)).applyAxisAngle(new T.Vector3(0,1,0),item.group.rotation.y);faceAngle=faceToward({x:p[0],z:p[2]},{x:item.group.position.x+consolePoint.x,z:item.group.position.z+consolePoint.z})}
   }else if(anchor==='dumbbellRack'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='dumbbellRack')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='dumbbellRack',characterRoom),person.position);
    if(item){standInFront(item,.62);poseOverride='stand'}
   }else if(anchor==='gameConsole'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='gameConsole')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='gameConsole',characterRoom),person.position);
    if(item){const support=furniture(it=>it.id===item.supportId,characterRoom)[0];if(support){const seat=nearestSeat(support.group.position);if(seat&&Math.hypot(seat.group.position.x-support.group.position.x,seat.group.position.z-support.group.position.z)<2.8){p=[seat.group.position.x,0,seat.group.position.z];faceAngle=faceToward(seat.group.position,item.group.position)}else{const offset=new T.Vector3(0,0,support.depth/2+1.05).applyAxisAngle(new T.Vector3(0,1,0),support.group.rotation.y);p=[support.group.position.x+offset.x,0,support.group.position.z+offset.z];faceAngle=faceToward({x:p[0],z:p[2]},item.group.position);poseOverride='stand'}}else{p=positions.rug;poseOverride='stand'}}
   }else if(anchor==='wallArt'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='wallArt')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='wallArt',characterRoom),person.position);
    if(item){const normal=item.wallSide==='back'?new T.Vector3(0,0,1):item.wallSide==='front'?new T.Vector3(0,0,-1):item.wallSide==='left'?new T.Vector3(1,0,0):new T.Vector3(-1,0,0);normal.applyAxisAngle(new T.Vector3(0,1,0),item.group.rotation.y);p=[item.group.position.x+normal.x*(item.depth/2+.72),0,item.group.position.z+normal.z*(item.depth/2+.72)];faceAngle=faceToward({x:p[0],z:p[2]},item.group.position)}
   }else if(anchor==='window'){
    const item=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride&&furnitureKindForPlaced({name:it.name})==='window')[0]:nearest(furniture(it=>furnitureKindForPlaced({name:it.name})==='window',characterRoom),person.position);
    if(item)standInFront(item,.72);else{p=[...positions.window];faceAngle=Math.PI}
   }
   target.set(...p);pose=poseOverride||meta.pose||'wave';activityFacing=faceAngle;if(['sofa','desk','shelf','table','chair','cushion','bouquet','bed','loftDesk','sink','piano','washingMachine','treadmill','gameConsole','wallArt','window'].includes(anchor))person.rotation.y=faceAngle;
   basePose=pose;walkRoute=[];walkIndex=0;walkPauseUntil=0;
   if(act==='walk'){walkRoute=['outside','window','rug','sofa','center'].map(k=>positions[k]);walkIndex=0;target.set(...walkRoute[0]);pose='walk'}
   if(act==='idle'){pose='idle';idleNextMove=performance.now()+1800;idleNextGesture=performance.now()+6500+Math.random()*4000;idleGestureUntil=0}
   rig.rotation.set(0,0,0);rig.position.set(0,0,0);eyeGroups.forEach(g=>{g.scale.y=act==='sleep'?.055:1});if(act==='sleep'||(anchor==='bed'&&['read','rest'].includes(act)))rig.rotation.set(-Math.PI/2,0,0);
   body.position.y=pose==='sit'?-.32:0;legs.forEach(l=>{l.hip.rotation.x=pose==='sit'?-1.15:pose==='sleep'?-1.35:0;l.knee.rotation.x=pose==='sit'?1.45:pose==='sleep'?1.5:0});
   arms.forEach((arm,i)=>{arm.shoulder.rotation.z=(pose==='wave'&&i===1)?-.85:(pose==='sit'?.15:0);arm.elbow.rotation.x=pose==='sit'?-1.05:pose==='sleep'?-1.25:0});
  }
  function activateHallZone(id){
   const zone=hallScene.zones.find(item=>item.id===id);if(!zone)return;
   const lines={};
   if(id==='exchange'){showExchange();return}
   if(id==='recruitment'){closeCalendar();showRecruitment();document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));return}
   if(id==='commissions'){openTab('目标');return}
   if(id==='food'){shopCategory='食物食材';openTab('商店',true);return}
   if(id==='ranking'){showRanking();return}if(id==='teams'){showDungeon();return}if(id==='entertainment'){showEntertainment();return}say(lines[id]||zone.name);
  }
  // One-finger orbit and two-finger pinch work on iPad; mouse drag and wheel work too.
  const pointers=new Map();let drag=null,pinchStart=0,pinchRadius=radius,pinchCenter=null,pinchAngle=0,doorTap=null,furnitureTap=null,sceneDismissTap=null,inertiaTheta=0,inertiaPhi=0,dragVelocityTheta=0,dragVelocityPhi=0,lastPointerTime=0;
  let selectedFurniture=null,furnitureDrag=null,characterTap=null,hallTap=null;
  const floorPlane=new T.Plane(new T.Vector3(0,1,0),0),dragPoint=new T.Vector3(),dragOffset=new T.Vector3();
  const raycaster=new T.Raycaster(),pointerNdc=new T.Vector2(),gestureRight=new T.Vector3(),gestureForward=new T.Vector3();
  const hallInteractionTargets=hall.children.filter(object=>object.userData?.hallFloor||object.userData?.hallAction||object.userData?.roomTarget),hallRaycastTargets=[...hallInteractionTargets,person];
  // Camera gestures are handled by the stage, not the canvas. The canvas itself
  // is click-through so it can never steal taps from the footer or room controls.
  const canvas=renderer.domElement,gestureSurface=stage;
  canvas.style.touchAction='none';canvas.style.pointerEvents='none';
  gestureSurface.style.touchAction='none';
  gestureSurface.addEventListener('pointerdown',e=>{
   if(e.target.closest('button,[role="button"],input,select,textarea,a,.calendar-view,.drawer,.decorate-tools'))return;
   if(e.pointerType==='mouse'&&e.button!==0)return;
   sceneDismissTap=$('drawer').classList.contains('furniture-drawer')&&$('drawer').classList.contains('open')?{pointerId:e.pointerId,x:e.clientX,y:e.clientY}:null;
   const rect=stage.getBoundingClientRect();pointerNdc.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
   raycaster.setFromCamera(pointerNdc,camera);
   const activeRoom=roomMode==='hall'?hall:roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:roomMode==='bathroom'?bathroom:living;
   // Arday is attached to the scene root, not to any room group. Include the character explicitly so its meshes can receive tap hits in every room.
   const hits=raycaster.intersectObjects(roomMode==='hall'?hallRaycastTargets:[...activeRoom.children,person],true);
   if(decorating){
    let furniture=null;
    for(const hit of hits){let node=hit.object;while(node&&node!==activeRoom){if(node.userData?.furnitureKey){furniture=node;break}node=node.parent}if(furniture)break}
    if(furniture){
     const item=furnitureRegistry.find(x=>x.group===furniture);
     if(item){
      selectFurniture(item);
      const plane=item.wallAxis?(item.wallSide==='back'||item.wallSide==='front'?new T.Plane(new T.Vector3(0,0,1),-furniture.position.z):new T.Plane(new T.Vector3(1,0,0),-furniture.position.x)):new T.Plane(new T.Vector3(0,1,0),-furniture.position.y);
      if(raycaster.ray.intersectPlane(plane,dragPoint)){
       dragOffset.copy(furniture.position).sub(dragPoint);furnitureDrag={pointerId:e.pointerId,group:furniture,item,plane,startX:e.clientX,startY:e.clientY,moved:false,initial:furniture.position[item.wallAxis||'x'],offsetX:furniture.position.x-dragPoint.x,offsetZ:furniture.position.z-dragPoint.z,wallOffsetDelta:item.wallAxis?wallOffset(item)-(item.wallSide==='back'||item.wallSide==='front'?dragPoint.x:dragPoint.z):0,wallYOffset:item.wallAxis?furniture.position.y-dragPoint.y:0};
       gestureSurface.setPointerCapture(e.pointerId);e.preventDefault();return;
      }
     }
    }
   }
   let targetRoom=null,hallAction=null,hallFloorHit=null;
   for(const hit of hits){let node=hit.object;while(node&&node!==activeRoom){if(node.userData?.roomTarget){targetRoom=node.userData.roomTarget;break}if(node.userData?.hallAction){hallAction=node.userData.hallAction;break}if(node.userData?.hallFloor){hallFloorHit=hit;break}node=node.parent}if(targetRoom||hallAction||hallFloorHit)break}
   furnitureTap=null;characterTap=null;
   if(!decorating){
    for(const hit of hits){
     let node=hit.object,foundTarget=null;
     while(node&&node!==activeRoom){
      if(node.userData?.furnitureKey){const item=furnitureRegistry.find(x=>x.id===node.userData.furnitureKey&&x.room===roomMode);if(item?.action)foundTarget={type:'furniture',item};break}
      if(node===person){foundTarget={type:'character'};break}
      if(node.userData?.roomTarget){foundTarget={type:'room'};break}
      node=node.parent;
     }
     if(foundTarget){
      if(foundTarget.type==='furniture')furnitureTap={item:foundTarget.item,pointerId:e.pointerId,x:e.clientX,y:e.clientY};
      else if(foundTarget.type==='character')characterTap={pointerId:e.pointerId,x:e.clientX,y:e.clientY};
      break;
     }
    }
   }
   gestureSurface.setPointerCapture(e.pointerId);
   if(targetRoom){doorTap={target:targetRoom,pointerId:e.pointerId,x:e.clientX,y:e.clientY};e.preventDefault();return}
   if(roomMode==='hall'&&(hallAction||hallFloorHit)){
    const point=new T.Vector3();if(hallAction)hallTap={action:hallAction,pointerId:e.pointerId,x:e.clientX,y:e.clientY};else if(raycaster.ray.intersectPlane(floorPlane,point))hallTap={point,pointerId:e.pointerId,x:e.clientX,y:e.clientY};
   }
   doorTap=null;inertiaTheta=0;inertiaPhi=0;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1){drag={x:e.clientX,y:e.clientY};activeCameraGesture=e.clientX<rect.left+rect.width/2?'orbit':'pan';}
   if(pointers.size===2){const p=[...pointers.values()];pinchStart=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);pinchRadius=targetRadius;pinchCenter={x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};pinchAngle=Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x)}
   lastPointerTime=e.timeStamp;e.preventDefault();
  });
  gestureSurface.addEventListener('pointermove',e=>{
   if(furnitureDrag&&furnitureDrag.pointerId===e.pointerId){
    if(Math.hypot(e.clientX-furnitureDrag.startX,e.clientY-furnitureDrag.startY)>8)furnitureDrag.moved=true;
    const rect=stage.getBoundingClientRect();pointerNdc.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointerNdc,camera);
    if(raycaster.ray.intersectPlane(furnitureDrag.plane,dragPoint)){
     const g=furnitureDrag.group,item=furnitureDrag.item;
     if(item.wallAxis){
      const roomGroup=item.room==='bedroom'?bedroom:item.room==='kitchen'?kitchen:item.room==='bathroom'?bathroom:living;
      const candidates=[
       {side:'back',plane:new T.Plane(new T.Vector3(0,0,1),3.89),visible:()=>roomGroup.userData.backWall?.visible!==false},
       {side:'front',plane:new T.Plane(new T.Vector3(0,0,1),-3.89),visible:()=>roomGroup.userData.frontWall?.visible!==false},
       {side:'left',plane:new T.Plane(new T.Vector3(1,0,0),5.16),visible:()=>roomGroup.userData.leftWall?.visible!==false},
       {side:'right',plane:new T.Plane(new T.Vector3(1,0,0),-5.16),visible:()=>roomGroup.userData.rightWall?.visible!==false}
      ].filter(candidate=>!item.id.includes('window')||candidate.side==='back');
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
      const rawX=dragPoint.x+furnitureDrag.offsetX,rawZ=dragPoint.z+furnitureDrag.offsetZ;
      if(item){
       const previousSupport=item.supportId,previousAllowSupportOverlap=item.allowSupportOverlap,previousAngle=g.rotation.y;
       let support=null,overlapSupport=null,nx=rawX,nz=rawZ;
       if(item.surfaceType==='tabletop'||['电脑','捧花摆件'].includes(item.name)){
        const snap=findTabletopSnap(item,rawX,rawZ);
        if(snap){support=snap.support;nx=snap.x;nz=snap.z;if(snap.fit<.999){g.scale.multiplyScalar(snap.fit);item.width*=snap.fit;item.depth*=snap.fit;item.footprintScale=(item.footprintScale||1)*snap.fit}}
        else if(previousSupport){
         const old=furnitureRegistry.find(other=>other.id===previousSupport);
         if(old&&window.ArdayFurniturePlacement.rectsOverlap(window.ArdayFurniturePlacement.corners(item,rawX,rawZ,g.rotation.y),window.ArdayFurniturePlacement.corners(old)))overlapSupport=old;
        }
       }
       item.supportId=(support||overlapSupport)?.id||null;item.allowSupportOverlap=!!overlapSupport;
       const nextY=item.surfaceType==='ceiling'?4.45:support?support.group.position.y+support.surfaceY+.015:overlapSupport?overlapSupport.group.position.y+overlapSupport.surfaceY+.015:0;
       if(support)g.rotation.y=support.group.rotation.y;
       if(canPlaceFurniture(item,nx,nz,g.rotation.y)){
        const ox=g.position.x,oy=g.position.y,oz=g.position.z,oa=previousAngle;
        g.position.set(nx,nextY,nz);moveSupportedFurniture(item,ox,oy,oz,oa);
       }else{item.supportId=previousSupport;item.allowSupportOverlap=previousAllowSupportOverlap;g.rotation.y=previousAngle;}
      }
     }
    }e.preventDefault();return;
   }
   if(!pointers.has(e.pointerId))return;
   const old=pointers.get(e.pointerId),dx=e.clientX-old.x,dy=e.clientY-old.y,elapsed=Math.max(8,e.timeStamp-lastPointerTime||16);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1&&drag){
    if(activeCameraGesture==='orbit'){targetTheta-=dx*.0065;targetPhi+=dy*.0045;applyCamera();}
    else{
     gestureRight.set(Math.cos(theta),0,-Math.sin(theta));
     gestureForward.set(-Math.sin(theta),0,-Math.cos(theta));
     const scale=targetRadius/Math.max(1,stage.clientHeight);
     if(roomMode==='hall'){hallCameraOffset.addScaledVector(gestureRight,-dx*scale);hallCameraOffset.addScaledVector(gestureForward,dy*scale);}else{cameraTarget.addScaledVector(gestureRight,-dx*scale);cameraTarget.addScaledVector(gestureForward,dy*scale);}
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
     if(roomMode==='hall'){hallCameraOffset.addScaledVector(right,-(center.x-pinchCenter.x)*scale);hallCameraOffset.addScaledVector(forward,(center.y-pinchCenter.y)*scale);}else{cameraTarget.addScaledVector(right,-(center.x-pinchCenter.x)*scale);cameraTarget.addScaledVector(forward,(center.y-pinchCenter.y)*scale);}
     const angle=Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x),deltaAngle=angle-pinchAngle;
     targetTheta-=deltaAngle;pinchAngle=angle;pinchCenter=center;applyCamera();
    }
   }
   lastPointerTime=e.timeStamp;e.preventDefault();
  });
  function endPointer(e){
   if(furnitureDrag&&furnitureDrag.pointerId===e.pointerId){
    const dragState=furnitureDrag,g=dragState.group,item=furnitureRegistry.find(x=>x.group===g);furnitureDrag=null;
    if(item){persistFurniture(item);persistSupportedChildren(item);if(item.isDoor&&!dragState.moved)openDoorWheel(item);else toast(item.name+'位置已保存');}
    pointers.delete(e.pointerId);drag=null;pinchCenter=null;inertiaTheta=0;inertiaPhi=0;
    return;
   }
   if(doorTap&&doorTap.pointerId===e.pointerId){
    const tap=doorTap,dist=Math.hypot(e.clientX-tap.x,e.clientY-tap.y);doorTap=null;sceneDismissTap=null;
    if(e.type==='pointerup'&&dist<18){
     stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode','bathroom-mode','hall-mode');
     if(tap.target==='kitchen')stage.classList.add('kitchen-mode');
     if(tap.target==='bedroom')stage.classList.add('bedroom-mode');
     if(tap.target==='bathroom')stage.classList.add('bathroom-mode');
     if(tap.target==='hall'){stage.classList.add('hall-mode');person.position.set(hallScene.spawn.x,0,hallScene.spawn.z);target.copy(person.position);activeActivity='idle';}
     if(tap.target==='living'&&roomMode==='hall'){person.position.set(-4.25,0,0);target.copy(person.position);}
     $('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));updateArday3D();
    }
    return;
   }
   if(hallTap&&hallTap.pointerId===e.pointerId){
    const tap=hallTap;hallTap=null;const dist=Math.hypot(e.clientX-tap.x,e.clientY-tap.y);
    if(e.type==='pointerup'&&dist<18){
     if(tap.point){const dx=tap.point.x-hallScene.center.x,dz=tap.point.z-hallScene.center.z,len=Math.hypot(dx,dz),scale=len>hallScene.radius?hallScene.radius/len:1;target.set(hallScene.center.x+dx*scale,0,hallScene.center.z+dz*scale);pose='idleWalk';basePose='idle';idleWalkStartedAt=performance.now();}
     else if(tap.action)activateHallZone(tap.action);
     pointers.delete(e.pointerId);drag=null;pinchCenter=null;inertiaTheta=0;inertiaPhi=0;return;
    }
   }
   if(furnitureTap&&furnitureTap.pointerId===e.pointerId){
    const tap=furnitureTap;furnitureTap=null;sceneDismissTap=null;characterTap=null;
    if(e.type==='pointerup'&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<18){invokeFurnitureAction(tap.item);return}
   }
   if(characterTap&&characterTap.pointerId===e.pointerId){
    const tap=characterTap;characterTap=null;sceneDismissTap=null;
    if(e.type==='pointerup'&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<18){
     const lines=window.ArdayCharacterTapLines;
     arday3D?.showCharacterTap?.();
     if(Array.isArray(lines)&&lines.length)say(lines[Math.floor(Math.random()*lines.length)]);
     return;
    }
   }
   if(sceneDismissTap&&sceneDismissTap.pointerId===e.pointerId){
    const tap=sceneDismissTap;sceneDismissTap=null;
    if(e.type==='pointerup'&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<18)closeFurnitureActions();
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
  const feedbackEffects=[];
  const statNames={energy:'精力',hunger:'食欲',clean:'卫生',fun:'娱乐',agility:'敏捷',strength:'力量',intelligence:'智力',perception:'感知',will:'意志'};
  function showCharacterTap(){
   const group=new T.Group();group.position.copy(person.position);group.position.y+=1.95;scene.add(group);
   for(let i=0;i<7;i++){const material=new T.MeshBasicMaterial({color:0xffe6a8,transparent:true,opacity:.92,depthWrite:false});const star=new T.Mesh(new T.OctahedronGeometry(i%2?.075:.105,0),material);const angle=i/7*Math.PI*2;star.position.set(Math.cos(angle)*(.24+(i%2)*.12),Math.sin(angle)*(.2+(i%3)*.035),.08+(i%3)*.035);group.add(star)}
   feedbackEffects.push({group,age:0,duration:.72,kind:'tap'});
  }
  function showStatGain(gains){
   const entries=Object.entries(gains||{}).filter(([key,value])=>statNames[key]&&Number(value)>0);if(!entries.length)return;
   entries.slice(0,3).forEach(([key,value],index)=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(22,34,35,.72)';ctx.beginPath();ctx.roundRect(12,12,488,104,32);ctx.fill();
    ctx.fillStyle='#f4dfad';ctx.font='600 52px "Noto Serif SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(statNames[key]+'  +'+(Math.round(Number(value)*10)/10),256,65);
    const texture=new T.CanvasTexture(canvas);texture.encoding=T.sRGBEncoding;
    const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,opacity:.86,depthWrite:false,depthTest:true}));
    sprite.position.copy(person.position);sprite.position.y+=2.35+index*.22;sprite.scale.set(1.45,.36,1);scene.add(sprite);
    feedbackEffects.push({group:sprite,age:0,duration:1.05,kind:'gain',texture});
   });
  }
  function updateFeedbackEffects(dt){
   for(let i=feedbackEffects.length-1;i>=0;i--){
    const effect=feedbackEffects[i];effect.age+=dt;const progress=Math.min(1,effect.age/effect.duration),fade=1-progress;
    effect.group.position.y+=dt*(effect.kind==='tap'?.48:.34);
    if(effect.kind==='tap'){effect.group.rotation.y+=dt*1.8;effect.group.children.forEach((child,j)=>{child.rotation.x+=dt*(1.8+j*.12);child.rotation.z+=dt*(j%2?2.1:-2.1);child.material.opacity=.92*fade;child.scale.setScalar(.72+Math.sin(progress*Math.PI)*.55)})}
    else effect.group.material.opacity=.86*fade;
    if(progress>=1){scene.remove(effect.group);effect.group.traverse?.(node=>{if(node.material){if(Array.isArray(node.material))node.material.forEach(m=>m.dispose());else node.material.dispose()}});effect.texture?.dispose();feedbackEffects.splice(i,1)}
   }
  }
  function frame(t){const frameInterval=isTouchDevice?(roomMode==='hall'?1000/30:1000/40):1000/60;if(t-lastDraw<frameInterval){arday3D.raf=requestAnimationFrame(frame);return}const dt=Math.min(.06,(t-last)/1000);last=t;updateDaylight();updateFeedbackEffects(dt);if(pointers.size===0){targetTheta+=inertiaTheta*dt*1000;targetPhi+=inertiaPhi*dt*1000;const damp=Math.exp(-dt*5.2);inertiaTheta*=damp;inertiaPhi*=damp;if(Math.abs(inertiaTheta)<.000002)inertiaTheta=0;if(Math.abs(inertiaPhi)<.000002)inertiaPhi=0;applyCamera()}syncCamera(dt);
   if(roomMode==='hall'){
    const dx=target.x-hallScene.center.x,dz=target.z-hallScene.center.z,len=Math.hypot(dx,dz);if(len>hallScene.radius){const k=hallScene.radius/len;target.x=hallScene.center.x+dx*k;target.z=hallScene.center.z+dz*k;}
    const follow=1-Math.exp(-dt*3);cameraTarget.x+=(person.position.x+hallCameraOffset.x-cameraTarget.x)*follow;cameraTarget.z+=(person.position.z+hallCameraOffset.z-cameraTarget.z)*follow;
   }
   let delta=target.clone().sub(person.position),distance=delta.length(),moving=distance>.075;
   if(moving){const step=Math.min(distance,(roomMode==='hall'?2.35:pose==='idleWalk'?1.7:1.55)*dt);person.position.add(delta.normalize().multiplyScalar(step));
    if(roomMode==='hall'){const dx=person.position.x-hallScene.center.x,dz=person.position.z-hallScene.center.z,len=Math.hypot(dx,dz);if(len>hallScene.radius){person.position.x=hallScene.center.x+dx/len*hallScene.radius;person.position.z=hallScene.center.z+dz/len*hallScene.radius;target.copy(person.position);}}
   }
   if(pose==='walk'&&activeActivity==='walk'){if(moving)walkPauseUntil=0;else if(!walkPauseUntil)walkPauseUntil=t+650;else if(t>=walkPauseUntil){walkIndex=(walkIndex+1)%walkRoute.length;target.set(...walkRoute[walkIndex]);walkPauseUntil=0;}}
   const roamAllowed=roomMode!=='hall'&&activeActivity==='idle';
   if(roamAllowed&&pose!=='idleWalk'&&pose!=='wave'&&!moving&&t>idleNextMove){
    const choices=['sofa','table','window','rug','shelf','center','outside','desk'];
    let pick=positions[choices[Math.floor(Math.random()*choices.length)]];
    if(Math.hypot(pick[0]-person.position.x,pick[2]-person.position.z)<1.1)pick=positions.outside;
    target.set(...pick);pose='idleWalk';idleWalkStartedAt=t;
   }
   if(roamAllowed&&pose==='wave'&&idleGestureUntil&&t>idleGestureUntil){pose=basePose;idleGestureUntil=0;idleNextMove=t+350;}
   if(roamAllowed&&pose!=='idleWalk'&&pose!=='wave'&&!moving&&t>idleNextGesture){pose='wave';idleGestureUntil=t+1500;idleNextGesture=t+5500+Math.random()*3500;}
   if(roamAllowed&&pose==='idle'&&!moving&&t>idleNextMove){
    const choices=['sofa','table','window','rug','shelf','center','outside','desk'];
    let pick=positions[choices[Math.floor(Math.random()*choices.length)]];
    if(Math.hypot(pick[0]-person.position.x,pick[2]-person.position.z)<1.25)pick=positions.outside;
    target.set(...pick);pose='idleWalk';idleWalkStartedAt=t;
   }
   if(pose==='idleWalk'&&!moving&&distance<.075&&t>idleWalkStartedAt+350){pose=basePose;idleNextMove=t+1800+Math.random()*2600;}
   phase+=dt*(moving?9:2);
   if(moving){legs.forEach((l,i)=>{l.hip.rotation.x=Math.sin(phase+i*Math.PI)*.82;l.knee.rotation.x=Math.max(0,Math.sin(phase+i*Math.PI))*.9});arms.forEach((a,i)=>{a.shoulder.rotation.x=Math.sin(phase+i*Math.PI)*.58;a.shoulder.rotation.z=a.side*Math.sin(phase+i*Math.PI)*.045;a.elbow.rotation.x=-.1+Math.max(0,Math.sin(phase+i*Math.PI))*.08});body.rotation.y=Math.sin(phase)*.035;person.rotation.y+=(Math.atan2(delta.x,delta.z)-person.rotation.y)*(1-Math.exp(-dt*8));}
   else{
    if(activeActivity!=='idle'){const turn=Math.atan2(Math.sin(activityFacing-person.rotation.y),Math.cos(activityFacing-person.rotation.y));person.rotation.y+=turn*(1-Math.exp(-dt*7));}
    legs.forEach(l=>{const hipTarget=pose==='sit'?-1.15:pose==='sleep'?-1.35:pose==='bedRead'?-.16:pose==='bedRest'?-.08:0,kneeTarget=pose==='sit'?1.45:pose==='sleep'?1.5:pose==='bedRead'?.28:pose==='bedRest'?.16:0;l.hip.rotation.x+=(hipTarget-l.hip.rotation.x)*.12;l.knee.rotation.x+=(kneeTarget-l.knee.rotation.x)*.12});
    if(activeActivity==='exercise'&&pose==='walk'&&distance<.075){legs.forEach((l,i)=>{const stride=Math.sin(t*.014+i*Math.PI);l.hip.rotation.x=stride*.48;l.knee.rotation.x=Math.max(0,stride)*.72})}
    const reading=activeActivity==='read',writing=activeActivity==='write',eating=activeActivity==='eat'||activeActivity==='food',cooking=activeActivity==='cook',weightTraining=activeActivity==='exercise'&&pose!=='walk',typing=['work','computerWork','program'].includes(activeActivity),gaming=['computerPlay','game'].includes(activeActivity),browsing=activeActivity==='browseWeb',pianoPlaying=activeActivity==='playPiano',hugging=activeActivity==='hug',watching=activeActivity==='watchTV',listening=activeActivity==='listenRecords'||activeActivity==='music',conversing=activeActivity==='chat'||activeActivity==='company',drinkingTea=false,inspecting=activeActivity==='bouquet'||activeActivity==='admireFlowers'||activeActivity==='admireDecor'||activeActivity==='admireView',smelling=activeActivity==='smellFlowers',washing=activeActivity==='wash'||activeActivity==='laundry',resting=activeActivity==='rest'||activeActivity==='sitChair';
    arms.forEach((a,i)=>{
     let shoulderX=pose==='sit'?.04:Math.sin(phase*.55+i*1.7)*.055;
     let elbowX=pose==='sit'?-.18:Math.sin(phase*.45+i)*.045;
     let shoulderZ=pose==='sit'?.15:0;
     if(reading){shoulderX=.12+Math.sin(t*.003+i*2.2)*.075;elbowX=-.58+Math.sin(t*.004+i*2.8)*.12;shoulderZ=(i===0?.23:-.18)+Math.sin(t*.002+i)*.025}
     if(typing){shoulderX=.18+Math.sin(t*.012+i*2.5)*.025;elbowX=-.72+Math.sin(t*.01+i)*.035;shoulderZ=i===0?.16:-.16}
     if(cooking){shoulderX=.38+Math.sin(t*.008+i*1.8)*.08;elbowX=-.82+Math.sin(t*.009+i*2)*.08;shoulderZ=i===0?.28:-.24}
     if(weightTraining){shoulderX=.42+Math.sin(t*.012+i*Math.PI)*.1;elbowX=-.92+Math.max(0,Math.sin(t*.012+i*Math.PI))*.28;shoulderZ=i===0?.22:-.22}
     if(gaming){shoulderX=.34+Math.sin(t*.009+i*2.2)*.055;elbowX=-.7+Math.sin(t*.012+i*2)*.08;shoulderZ=i===0?.2:-.2}
     if(browsing){shoulderX=.14+Math.sin(t*.004+i*2)*.035;elbowX=-.5+Math.sin(t*.006+i)*.045;shoulderZ=i===0?.2:-.14}
     if(pianoPlaying){shoulderX=.3+Math.sin(t*.014+i*Math.PI)*.065;elbowX=-.58+Math.sin(t*.017+i*Math.PI)*.1;shoulderZ=i===0?.2:-.2}
     if(hugging){shoulderX=.22+Math.sin(t*.002+i)*.025;elbowX=-.78;shoulderZ=i===0?.48:-.48}
      if(writing){shoulderX=.3+Math.sin(t*.009+i*2.5)*.045;elbowX=-.84+Math.sin(t*.014+i)*.045;shoulderZ=i===0?.24:-.13}
     if(eating){shoulderX=.52+Math.sin(t*.006+i*2.8)*.12;elbowX=-.92+Math.sin(t*.008+i*2.1)*.1;shoulderZ=i===0?.34:-.3}
      if(watching){shoulderX=.04+Math.sin(t*.0018+i)*.025;elbowX=-.22;shoulderZ=i===0?.18:-.18}
      if(listening){shoulderX=.02+Math.sin(t*.0015+i*2)*.035;elbowX=-.3+Math.sin(t*.0012+i)*.035;shoulderZ=i===0?.22:-.2}
      if(conversing){shoulderX=.12+Math.sin(t*.004+i*1.8)*.12;elbowX=-.42+Math.sin(t*.003+i*2)*.12;shoulderZ=i===0?.28:-.24}
      if(drinkingTea&&i===0){shoulderX=.46+Math.sin(t*.0017)*.035;elbowX=-.86;shoulderZ=.34}
      if(inspecting){shoulderX=.18+Math.sin(t*.002+i)*.035;elbowX=-.62;shoulderZ=i===0?.3:-.22}
      if(smelling){shoulderX=.26+Math.sin(t*.003+i)*.04;elbowX=-.78;shoulderZ=i===0?.36:-.28}
      if(washing){shoulderX=.35+Math.sin(t*.007+i*2)*.09;elbowX=-.9+Math.sin(t*.008+i)*.06;shoulderZ=i===0?.3:-.3}
      if(resting){shoulderX=.02+Math.sin(t*.001+i)*.025;elbowX=-.12;shoulderZ=i===0?.08:-.08}
     a.shoulder.rotation.x+=(shoulderX-a.shoulder.rotation.x)*.09;
     a.shoulder.rotation.z+=(shoulderZ-a.shoulder.rotation.z)*.08;
     a.elbow.rotation.x+=(elbowX-a.elbow.rotation.x)*.09;
    });
    if(writing){head.rotation.x+=(-.13+Math.sin(t*.0018)*.025-head.rotation.x)*.035}
     if(reading&&Math.sin(t*.0011)>.985){head.rotation.y+=(.42-head.rotation.y)*.12;head.rotation.x+=((pose==='bedRead'?.04:-.08)-head.rotation.x)*.12}
     if(gaming){head.rotation.x+=(-.08+Math.sin(t*.002)*.025-head.rotation.x)*.035}
     if(browsing){head.rotation.x+=(-.09+Math.sin(t*.0025)*.02-head.rotation.x)*.035}
     if(pianoPlaying){head.rotation.x+=(-.12+Math.sin(t*.0015)*.025-head.rotation.x)*.035;head.rotation.y+=(Math.sin(t*.0018)*.08-head.rotation.y)*.035}
     if(watching){head.rotation.y+=(Math.sin(t*.0007)*.1-head.rotation.y)*.025;head.rotation.x+=(-.035-head.rotation.x)*.025}
     if(listening){head.rotation.z+=(Math.sin(t*.0011)*.035-head.rotation.z)*.035;head.rotation.x+=(-.055-head.rotation.x)*.025}
     if(conversing){head.rotation.y+=(Math.sin(t*.002)*.18-head.rotation.y)*.045;head.rotation.x+=(Math.sin(t*.0027)*.045-head.rotation.x)*.04}
     if(drinkingTea){head.rotation.x+=(-.08+Math.sin(t*.0017)*.035-head.rotation.x)*.04}
     if(inspecting){head.rotation.x+=(-.16+Math.sin(t*.0015)*.025-head.rotation.x)*.035;head.rotation.y+=(Math.sin(t*.0012)*.12-head.rotation.y)*.035}
     if(smelling){head.rotation.x+=(-.24-head.rotation.x)*.045;head.rotation.y+=(Math.sin(t*.001)*.035-head.rotation.y)*.04}
     if(washing){head.rotation.x+=(-.12+Math.sin(t*.002)*.025-head.rotation.x)*.04}
     if(resting){head.rotation.x+=(Math.sin(t*.001)*.025-head.rotation.x)*.025}
   }
   if(pose==='wave'){arms[1].shoulder.rotation.x=Math.sin(t*.004)*.22;arms[1].shoulder.rotation.z=-.72+Math.sin(t*.002)*.035;arms[1].elbow.rotation.x=-.85+Math.sin(t*.006)*.22}
   body.rotation.x+=((pose==='bedRead'?-.34:pose==='bedRest'?-.58:0)-body.rotation.x)*.055;
   body.rotation.z+=(Math.sin(phase*.38)*.018-body.rotation.z)*.05;
   body.rotation.y+=(Math.sin(phase*.24)*.018-body.rotation.y)*.04;
   head.rotation.y+=(Math.sin(phase*.31)*.085-head.rotation.y)*.045;
   head.rotation.x+=(Math.sin(phase*.22)*.025-head.rotation.x)*.04;
   body.position.y+=(Math.sin(t*.0015)*.026-body.position.y)*.08;
   if(t>lastBlink&&activeActivity!=='sleep'){eyeGroups.forEach(g=>{g.scale.y=.12});setTimeout(()=>{if(activeActivity!=='sleep')eyeGroups.forEach(g=>{g.scale.y=1})},90);lastBlink=t+2400+Math.random()*2600;}
   updateFurnitureHotspots();
   renderer.render(scene,camera);lastDraw=t
   arday3D.raf=requestAnimationFrame(frame)}
  scene.traverse(o=>{if(o.isMesh&&!o.userData.hallIllustration){const mats=Array.isArray(o.material)?o.material:[o.material],opaque=mats.every(m=>m&&!m.transparent&&(m.opacity??1)>=.98);o.castShadow=opaque&&!o.userData.furnitureContactShadow;o.receiveShadow=opaque&&!o.userData.furnitureContactShadow}});
  updateDaylight(true);applyInkOutlines(scene);
  function cancelGesture(){pointers.forEach((_,id)=>{try{if(gestureSurface.hasPointerCapture(id))gestureSurface.releasePointerCapture(id)}catch(_){}});pointers.clear();drag=null;doorTap=null;pinchStart=0;inertiaTheta=0;inertiaPhi=0;dragVelocityTheta=0;dragVelocityPhi=0}
  arday3D={scene,camera,renderer,host,kitchen,bedroom,living,updateActivity,resize,setRoom,showCharacterTap,showStatGain,consumePlacedMeal:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(!item)return false;item.group.parent?.remove(item.group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);s.placed=s.placed.filter(x=>x.id!==id);save();updateFurnitureHotspots();return true},applyRoomFinish:(id)=>{const finishes=s.roomFinishes||(s.roomFinishes={});const room=roomMode==='bedroom'?'bedroom':roomMode==='kitchen'?'kitchen':roomMode==='bathroom'?'bathroom':'living';if(id.startsWith('buy-wallpaper-')){finishes.wallpaper=id;[living,bedroom,kitchen].forEach(root=>applyWallpaperToRoom(root,id))}else{finishes[room]=finishes[room]||{};finishes[room].floor=id;const root=room==='bedroom'?bedroom:room==='kitchen'?kitchen:living;root.userData.floorMesh.material=M(id==='buy-floor-concrete'?0x69727b:0x424d5b)}} ,getRoom:()=>roomMode,getFurnitureById:id=>furnitureRegistry.find(item=>String(item.id)===String(id))||null,selectFurnitureById:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(item)selectFurniture(item)},placeOwnedFurniture:entity=>{if(!entity||typeof entity!=='object'||!entity.id||!entity.name)return false;const item=createOwnedFurniture(entity.name,{...entity,room:roomMode});if(!item)return false;selectFurniture(item);updateFurnitureHotspots();return true},raf:0};
  const decorateTools=document.createElement('div');decorateTools.className='decorate-tools';
  rotateFurnitureButton.textContent='↻';
  rotateFurnitureButton.setAttribute('aria-label','旋转家具 15 度');
  rotateFurnitureButton.title='旋转 15°';
  decorateTools.append(dyePalette,rotateFurnitureButton,removeFurnitureButton);stage.appendChild(decorateTools);
  stage.classList.add('three-ready');resize();setRoom('living');updateActivity(s.currentActivity||'idle');
  if(window.ResizeObserver){arday3D.ro=new ResizeObserver(resize);arday3D.ro.observe(stage)}window.addEventListener('resize',resize);
  arday3D.raf=requestAnimationFrame(frame);return true;
 }catch(e){
  console.error('Arday 3D initialization failed:',e);
  if(host&&host.parentNode)host.remove();
  stage.classList.remove('three-ready');
  let status=stage.querySelector('.three-status');
  if(!status){status=document.createElement('div');status.className='three-status';stage.appendChild(status)}
  status.textContent='3D 场景启动失败：'+(e&&e.message?e.message:String(e))+'。请检查控制台错误；旧版 2D 场景已移除。';
  return false;
 }
}
function updateArday3D(activity=s.activeInteraction?.activity||s.currentActivity||'idle',anchor=s.activeInteraction?.anchor||s.currentActivityAnchor||null,room=s.activeInteraction?.room||s.currentActivityRoom||null,furnitureId=s.activeInteraction?.furnitureId||s.currentActivityFurnitureId||null){
 const stage=$('stage'),mode=stage.classList.contains('hall-mode')?'hall':stage.classList.contains('bathroom-mode')?'bathroom':stage.classList.contains('kitchen-mode')?'kitchen':stage.classList.contains('bedroom-mode')?'bedroom':'living';
 if(arday3D){arday3D.setRoom(mode);arday3D.updateActivity(activity,anchor,room,furnitureId)}
 else{
  const status=stage.querySelector('.three-status');
  if(status)status.textContent='3D 场景尚未就绪，当前活动将在场景恢复后显示。';
 }
 const label=$('roomLabel');if(label){label.dataset.room=mode;label.textContent=mode==='hall'?'公共大厅':mode==='bedroom'?'卧室':mode==='kitchen'?'厨房':mode==='bathroom'?'卫生间':'起居室';}
}

ensurePersonalGoal(Date.now());applyOffline();ensureSchedule();s.visits++;render();renderCalendar();generateDailyEvents();save();
initArday3D();if(s.activeInteraction)presentActivity(s.activeInteraction.activity,s.activeInteraction.anchor||null,s.activeInteraction.room||null,s.activeInteraction.furnitureId||null);else updateArday3D();
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
 setInterval(()=>{if(s.activeInteraction&&Date.now()>=Number(s.activeInteraction.endsAt||0))finishImmediateInteraction(Date.now())},1000);
 setInterval(()=>{const key=keyAt(Date.now());if(s.calendar?.anchor!==key){ensureScheduleAt(Date.now());save();renderCalendar()}render()},60000);

})();
