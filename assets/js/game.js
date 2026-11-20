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
if(s.activeDungeon){s.activeDungeon.endsAt=0;s.activeDungeon.scheduleEndAt=0;s.activeDungeon.board=s.activeDungeon.board||{steps:0,position:0,lap:0,chanceModifier:0,fatalRisk:false,flags:{},history:[],pending:null};}
s.dungeonHistory=Array.isArray(s.dungeonHistory)?s.dungeonHistory:[];
s.dungeonProgress=s.dungeonProgress&&typeof s.dungeonProgress==='object'?s.dungeonProgress:{};
s.dungeonHistory=Array.isArray(s.dungeonHistory)?s.dungeonHistory:[];
s.dungeonCycleStartedAt=Number(s.dungeonCycleStartedAt)||Number(s.lastDungeonAt)||Date.now();s.nextDungeonDueAt=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||s.dungeonCycleStartedAt)+7*86400000);
s.dungeonUnlocks=Array.isArray(s.dungeonUnlocks)?s.dungeonUnlocks:['F'];
const DUNGEON_TIERS=['F','E','D','C','B','A','S','SS','SSS'];
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
const DUNGEON_CLEAR_REQUIREMENTS={F:0,E:3,D:4,C:5,B:6,A:8,S:10,SS:12,SSS:15};
const DUNGEON_BASE_REWARD={F:25,E:40,D:60,C:85,B:115,A:150,S:195,SS:250,SSS:330};
function dungeonUnlocked(tier){return tier==='F'||DUNGEON_TIERS.indexOf(tier)<=DUNGEON_TIERS.findIndex(x=>x==='F')||s.dungeonUnlocks.includes(tier)}
function refreshDungeonUnlocks(){
 DUNGEON_TIERS.forEach((tier,index)=>{if(index===0)return;const previous=DUNGEON_TIERS[index-1],needed=DUNGEON_CLEAR_REQUIREMENTS[tier]||0;if((Number(s.dungeonProgress[previous])||0)>=needed&&!s.dungeonUnlocks.includes(tier))s.dungeonUnlocks.push(tier)});
}
refreshDungeonUnlocks();
const preferenceCap=10,preferenceGain=.85,preferenceDailyDecay=.4;
const preferenceActivities=new Set(['read','write','program','chat','computerPlay','browseWeb','playPiano','exercise','laundry','watchTV','listenRecords','rest','music','wash','walk','bouquet','admireFlowers','smellFlowers']);
function decayActivityPreferences(at=Date.now()){
 const last=Number(s.preferenceUpdatedAt)||at,days=Math.max(0,(at-last)/86400000);
 const loss=preferenceDailyDecay*days;
 if(loss>0)for(const key of Object.keys(s.preferences||{}))s.preferences[key]=Math.max(0,Math.min(preferenceCap,(Number(s.preferences[key])||0)-loss));
 s.preferenceUpdatedAt=at;
}
function recordActivityPreference(activity,at=Date.now()){
 if(!preferenceActivities.has(activity))return;
 decayActivityPreferences(at);
 const key=activity==='read'?'reading':['write','program'].includes(activity)?'writing':activity;
 s.preferences=s.preferences||{};
 s.preferences[key]=Math.min(preferenceCap,Math.max(0,Number(s.preferences[key])||0)+preferenceGain);
}
function activityPreferenceScore(activity){
 const key=activity==='read'?'reading':['write','program'].includes(activity)?'writing':activity;
 const value=Math.max(0,Math.min(preferenceCap,Number(s.preferences?.[key])||0));
 return 2.8*(1-Math.exp(-value/4));
}
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
  change(effects);
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
function furnitureSatisfiesRequirement(item,requirement){
 if(!requirement)return true;
 const kind=furnitureKindForPlaced(item);
 const allowed={desk:['desk'],computer:['computer'],television:['television'],recordPlayer:['recordPlayer'],gameConsole:['gameConsole'],bouquet:['bouquet'],bookshelf:['bookshelf'],readingSpot:['bookshelf','desk','bed'],sink:['sink'],seat:['sofa','chair','cushion','bed','loftBed'],desk:['desk','loftBed'],stove:['stove'],piano:['piano'],washingMachine:['washingMachine'],treadmill:['treadmill','dumbbellRack']};
 return !allowed[requirement]||allowed[requirement].includes(kind);
}
function hasAutonomyFurniture(requirement,room=null){
 if(!requirement)return true;
 return (s.placed||[]).some(item=>item&&(!room||item.room===room)&&furnitureSatisfiesRequirement(item,requirement));
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
function autonomousFurnitureOptions(){
 const options=[];
 for(const item of (s.placed||[])){
  if(!item||!['living','bedroom','kitchen','bathroom'].includes(item.room))continue;
  const kind=furnitureKindForPlaced(item),set=kind&&furnitureActivities[kind];
  if(!set?.activities)continue;
  for(const [activity,context] of Object.entries(set.activities)){
   const meta=activityMeta[activity];
   if(meta?.duration!=='long'||!meta.autonomous||!meta.autonomy||activity==='eat')continue;
   if(!furnitureRequirementAvailable(meta.requires,item.room))continue;
   if(activity==='computerPlay'&&kind==='desk')continue;
   if(activity==='computerPlay'&&kind==='computer'&&!((s.placed||[]).some(entry=>String(entry.id)===String(item.supportId)&&furnitureKindForPlaced(entry)==='desk')))continue;
   if(activity==='cook'&&!hasCookableRecipe())continue;
   options.push({activity,meta,room:item.room,anchor:context?.anchor||meta.anchor||'default',furnitureId:item.id,furnitureKind:kind});
  }
 }
 return options;
}
function chooseAutonomousActivity(recentOverride=null,hour=new Date().getHours()){
 decayActivityPreferences();
 const recent=Array.isArray(recentOverride)?recentOverride:(s.activityLog||[]).slice(-5).map(item=>item.activity);
 const grouped=new Map();
 for(const option of autonomousFurnitureOptions()){
  const {activity:id,meta}=option;
  if(!meta.autonomous||!meta.autonomy||id==='eat'||!hasAutonomyFurniture(meta.requires,option.room))continue;
  if(!grouped.has(id))grouped.set(id,[]);
  grouped.get(id).push(option);
 }
 const repeatCosts=[7,4.5,2.5,1.2,.4];
 const candidates=[...grouped.entries()].map(([id,options])=>{
  // One activity receives one score regardless of how many pieces of furniture can host it.
  const option=options[Math.floor(Math.random()*options.length)],{meta}=option,spec=meta.autonomy;
  const level=Number(s[spec.need]??50),needScore=Math.max(0,spec.threshold-level)*spec.weight;
  const repeatPenalty=recent.slice(-5).reverse().reduce((sum,value,index)=>sum+(normalizeActivity(value)===id?(repeatCosts[index]||0):0),0);
  const preference=activityPreferenceScore(id);
  const socialBonus=id==='chat'?(Number(s.friend)||0)*.02:0;
  let timeBias=0;
  if(hour>=7&&hour<12&&['wash','cook','laundry'].includes(id))timeBias=1.3;
  else if(hour>=13&&hour<17&&['read','write','program','playPiano','exercise','walk'].includes(id))timeBias=1.3;
  else if(hour>=18&&hour<22&&['chat','watchTV','listenRecords','music','computerPlay','game'].includes(id))timeBias=1.3;
  return {...option,score:needScore+(spec.base||0)+preference+socialBonus+timeBias-repeatPenalty+Math.random()*2};
 }).filter(item=>Number.isFinite(item.score)&&!(normalizeActivity(recent[recent.length-1])===item.activity&&item.activity!=='sleep'));
 if(!candidates.length)return {activity:'idle',room:$('stage').classList.contains('bathroom-mode')?'bathroom':$('stage').classList.contains('bedroom-mode')?'bedroom':$('stage').classList.contains('kitchen-mode')?'kitchen':'living',anchor:'default',furnitureId:null,furnitureKind:null};
 const max=Math.max(...candidates.map(item=>item.score));
 const weighted=candidates.map(item=>({...item,weight:Math.exp((item.score-max)/13)}));
 const total=weighted.reduce((sum,item)=>sum+item.weight,0);
 let roll=Math.random()*total;
 for(const item of weighted){roll-=item.weight;if(roll<=0)return item}
 return weighted[weighted.length-1];
}
function normalizeActivity(a){return ({reading:'read',listen:'music'})[a]||a||'idle'}
// Resolve every hour through the calendar. Autonomous choice fills only an unassigned slot;
// fixed routines and player proposals already exist as calendar events and take precedence.
function scheduledFurnitureIsValid(ev){
 if(!ev?.furnitureId)return ev?.activity==='idle';
 const item=(s.placed||[]).find(entry=>String(entry.id)===String(ev.furnitureId));
 if(!item)return false;
 const kind=furnitureKindForPlaced(item),set=kind&&furnitureActivities[kind],activity=normalizeActivity(ev.activity),meta=activityMeta[activity];
 const linkedComputer=activity!=='computerPlay'||(kind==='desk'&&(s.placed||[]).some(entry=>entry.name==='电脑'&&String(entry.supportId)===String(item.id)))||(kind==='computer'&&(s.placed||[]).some(entry=>String(entry.id)===String(item.supportId)&&furnitureKindForPlaced(entry)==='desk'));
 const ingredientsAvailable=activity!=='cook'||hasCookableRecipe();
 const valid=!!set?.activities?.[activity]&&meta?.duration==='long'&&!!meta?.autonomous&&furnitureRequirementAvailable(meta.requires,item.room)&&linkedComputer&&ingredientsAvailable;
 if(valid&&ev.room!==item.room)ev.room=item.room;
 return valid;
}
function resolveScheduledActivity(key,hour){
 let ev=eventAt(key,hour);
 const needsChoice=!ev||ev.activity==='autonomous'||(normalizeActivity(ev.activity)==='idle'&&ev.kind!=='dungeon');
 const stalePlan=ev?.kind==='autonomous'&&!needsChoice&&!scheduledFurnitureIsValid(ev);
 if(needsChoice||stalePlan){
  let choice;
  if(stalePlan){
   const alternatives=autonomousFurnitureOptions().filter(option=>option.activity===normalizeActivity(ev.activity));
   choice=alternatives.length?alternatives[Math.floor(Math.random()*alternatives.length)]:chooseAutonomousActivity();
  }else choice=chooseAutonomousActivity();
  const activity=normalizeActivity(choice.activity),meta=activityMeta[activity]||{title:'自由时间'};
  if(ev){ev.title=activity==='idle'?'自由时间':(meta.menuLabel||meta.title);ev.activity=activity;ev.kind='autonomous';ev.autonomous=true;ev.source=ev.source||'day-ahead';ev.unresolved=false;ev.resolvedAt=Date.now();ev.room=choice.room;ev.anchor=choice.anchor;ev.furnitureId=choice.furnitureId;ev.furnitureKind=choice.furnitureKind;if(stalePlan)ev.replannedAt=Date.now()}
  else{writeBlockForKey(key,hour,hour+1,{title:activity==='idle'?'自由时间':(meta.menuLabel||meta.title),kind:'autonomous',activity,autonomous:true,source:'simulation',unresolved:false,resolvedAt:Date.now(),room:choice.room,anchor:choice.anchor,furnitureId:choice.furnitureId,furnitureKind:choice.furnitureKind});ev=eventAt(key,hour)}
  if($('stage').classList.contains('calendar-mode'))renderCalendar();
 }
 return {event:ev,activity:normalizeActivity(ev?.activity||'idle')};
}
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
  if(meal){const dishName=meal.name.split('·').slice(1).join('·'),recipe=Object.values(recipes).find(r=>r.name===dishName);s.placed=s.placed.filter(item=>item.id!==meal.id);arday3D?.consumePlacedMeal?.(meal.id);change({hunger:recipe?.hunger||28,fun:2});placedMealEaten=true;say('这道'+dishName+'是你做的？手艺真好。');remember('meal','Arday吃了'+dishName,2);}
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
  change(effects);
  
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

const ARDAY_FACTIONS=[
{id:'iron-gate',name:'铁门公会',type:'工会',guildRank:1,mark:'鐵',desc:'承接高危区域勘探与前线委托。'},{id:'night-heron',name:'夜鹭公会',type:'工会',guildRank:2,mark:'鷺',desc:'负责情报搜集、路线测绘与目标追踪。'},{id:'cinder-forge',name:'余烬公会',type:'工会',guildRank:3,mark:'爐',desc:'研究异常材料、维护装备与改造器械。'},{id:'blue-transit',name:'蓝线公会',type:'工会',guildRank:4,mark:'線',desc:'经营补给网络、跨区运输与安全撤离。'},{id:'stillwater',name:'静水教团',type:'教团',mark:'水',desc:'招募能够辨识梦境污染与精神回响的人。'},{id:'convergence',name:'归一教团',type:'教团',mark:'一',desc:'以统一理论解释不同异常现象。'},{id:'last-candle',name:'余烛教团',type:'教团',mark:'燭',desc:'保存旧时代遗物，研究仪式性异常。'},{id:'anomaly-bureau',name:'异常事务管理局',type:'管理局',mark:'局',desc:'负责异常事件登记、管制与公共安全。'}];
const ARDAY_CANDIDATE_POOL=[
{name:'闻野',role:'近战突入',combat:78,malice:18,portrait:'野',acceptance:.76},{name:'苏弥',role:'环境侦察',combat:64,malice:9,portrait:'弥',acceptance:.82},{name:'周既白',role:'战术支援',combat:71,malice:27,portrait:'白',acceptance:.68},{name:'罗缇',role:'异常研究',combat:52,malice:6,portrait:'缇',acceptance:.88},{name:'严朔',role:'重装防御',combat:86,malice:42,portrait:'朔',acceptance:.55},{name:'祁雾',role:'远程压制',combat:74,malice:61,portrait:'雾',acceptance:.48},{name:'程照',role:'火力压制',combat:82,malice:33,portrait:'照',acceptance:.63},{name:'白榆',role:'医疗支援',combat:59,malice:11,portrait:'榆',acceptance:.84},{name:'沈砚',role:'近距格斗',combat:69,malice:24,portrait:'砚',acceptance:.72},{name:'唐梨',role:'异常感知',combat:67,malice:15,portrait:'梨',acceptance:.79},{name:'顾临',role:'机动侦察',combat:75,malice:49,portrait:'临',acceptance:.52},{name:'叶澄',role:'远程狙击',combat:88,malice:37,portrait:'澄',acceptance:.57}];

const ARDAY_GUILD_MATERIALS=['异常结晶','稳定剂','旧时代零件','记忆碎片'];
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
 if(s.activeDungeon){showDungeonPending();$('drawer').classList.add('open');return}
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
 $('choices').innerHTML='<section class="guild-cover"><div class="guild-cover-sky"></div><div class="guild-cover-mountains"></div><div class="guild-cover-arch"><i></i><b></b></div><div class="guild-cover-copy"><small>THE FRONTIER · GUILD HALL</small><h2>组队</h2><span>选择目的地，召集队友</span></div><div class="guild-wallet"><small>持有积分</small><b>'+s.points.toLocaleString('zh-CN')+'</b></div><div class="guild-dungeon-deadline">'+dungeonDeadlineText()+'</div></section><section class="guild-destinations"><div class="guild-gate-grid">'+tiers+'</div></section><section class="guild-party"><div class="guild-section-head"><span>队友</span><small>'+selected.length+' / '+s.teamRoster.length+' · 最多 8 人</small></div><div class="guild-roster">'+members+'</div></section><section class="guild-strength"><div class="guild-strength-emblem">⚔</div><div class="guild-strength-copy"><small>EXPEDITION POWER</small><b>'+combined+'</b><span>队伍综合战力</span></div><div class="guild-strength-meter"><i style="width:'+Math.max(0,Math.min(100,combined))+'%"></i></div></section>';
 $('drawer').classList.add('open');
 $('choices').querySelectorAll('[data-instance-tier]').forEach(button=>button.onclick=()=>startDungeon(button.dataset.instanceTier));
 $('choices').querySelectorAll('[data-member]').forEach(button=>button.onclick=()=>{const m=s.teamRoster.find(x=>x.id===button.dataset.member);if(!m)return;if(!m.selected&&s.teamRoster.filter(x=>x.selected).length>=3){toast('最多携带 3 名自己的队友');return}m.selected=!m.selected;save();showDungeon()});
 $('choices').querySelectorAll('[data-remove-member]').forEach(button=>button.onclick=event=>{event.stopPropagation();const index=s.teamRoster.findIndex(x=>x.id===button.dataset.removeMember);if(index<0)return;const removed=s.teamRoster.splice(index,1)[0];save();toast('已移除队友：'+removed.name);showDungeon()});
}
const DUNGEON_BOARD_TILES=[
['explore','场景探索','⌂'],['apparition','灵异遭遇','◌'],['investigate','调查线索','⌕'],['rules','规则禁忌','≋'],['supply','物资补给','＋'],['route','路线选择','↗'],['npc','人物遭遇','♙'],['cognition','精神认知','◉'],['environment','时间环境','☾'],['trap','陷阱危机','△'],['reward','特殊机会','✦'],['climax','阶段剧情','◇']];
const DUNGEON_ITEM_CATALOG={stimulant:{name:'肾上腺素注射剂',type:'buff',icon:'✚',effects:{energy:16,agility:5,willpower:4}},standin:{name:'替身纸人',type:'life',icon:'纸',lifeSave:true},hex:{name:'恶意诅咒钉',type:'harm',icon:'†',tradeOnly:true},fate:{name:'命运筹码',type:'probability',icon:'◎',chance:8},misfortune:{name:'厄运筹码',type:'probability',icon:'⊗',tradeOnly:true},reprieve:{name:'七日豁免令',type:'extension',icon:'⌛',extendDays:7}};
const DUNGEON_EVENT_LIBRARY={
explore:{title:'封闭的实验楼',desc:'走廊的灯一盏盏亮起，尽头的门牌却写着不存在的楼层。',options:[{label:'检查门牌和墙体',effects:{perception:3,intelligence:2,energy:-2},chance:2},{label:'沿安全通道离开',effects:{willpower:2,clean:-1} }]},
apparition:{title:'走廊尽头的人影',desc:'一个穿着旧校服的人影背对着你。它的脚没有落在地面上。',options:[{label:'保持距离，观察它',effects:{perception:3,willpower:-2},chance:2},{label:'迅速撤离',effects:{energy:-3,agility:2},chance:-3,risk:true}]},
investigate:{title:'被涂改的值班记录',desc:'记录本上有一页被反复撕贴，残留字迹似乎在描述今晚的校园。',options:[{label:'整理残留信息',effects:{intelligence:3,perception:2,fun:-1},chance:3,flag:'optional-clue'},{label:'不再停留',effects:{willpower:1,energy:1}}]},
rules:{title:'广播中的校规',desc:'广播要求午夜后不得回应自己的名字。播音员随后念出了你的名字。',options:[{label:'不回应，关闭广播',effects:{willpower:4,energy:-2},chance:2},{label:'回应并询问身份',effects:{intelligence:2,willpower:-5,fun:-3},chance:-5,risk:true}]},
supply:{title:'器材室',desc:'器材室门没有锁，里面有旧手电、急救包和一排空荡荡的储物柜。',options:[{label:'搜寻可用物资',effects:{perception:2,energy:-1},item:'stimulant'},{label:'快速离开',effects:{agility:2,clean:1}}]},
route:{title:'两条楼梯',desc:'左侧楼梯通向明亮的大厅，右侧楼梯传来规律的敲击声。',options:[{label:'走向明亮处',effects:{willpower:2,energy:-1}},{label:'进入右侧楼梯',effects:{perception:3,agility:-2},chance:3,flag:'optional-route'}]},
npc:{title:'没有脸的值日生',desc:'值日生递来一张纸条，声称可以告诉你离开校园的方法。',options:[{label:'接受纸条并询问细节',effects:{intelligence:2,willpower:-1},flag:'npc-note'},{label:'拒绝接触，保持警惕',effects:{perception:2,willpower:2}}]},
cognition:{title:'重复的教室',desc:'教室里坐着许多和你一模一样的人。他们同时抬起头。',options:[{label:'确认自己的记忆',effects:{intelligence:2,willpower:3,fun:-3}},{label:'闭眼沿墙移动',effects:{agility:2,energy:-2},risk:true}]},
environment:{title:'全校停电',desc:'广播停止，钟表停在 23:17。窗外的操场却出现了清晨的日光。',options:[{label:'利用光线寻找出口',effects:{perception:2,agility:2,energy:-1}},{label:'留在原地等待',effects:{willpower:2,fun:-2,hunger:-1}}]},
trap:{title:'地板下的空洞',desc:'脚下的地砖突然塌陷，下面传来许多人的低声交谈。',options:[{label:'抓住栏杆翻越',effects:{strength:3,agility:-3,energy:-3},risk:true},{label:'退后寻找绕行路线',effects:{perception:2,energy:-2}}]},
reward:{title:'无人认领的储物柜',desc:'柜门上贴着你的名字，里面放着一件从未见过的物品。',options:[{label:'取走柜中物品',effects:{willpower:-1},item:'fate'},{label:'检查柜体后离开',effects:{intelligence:2,perception:1}}]},
climax:{title:'第三次钟声',desc:'钟声响起。校园布局正在向最初的样子收缩。',options:[{label:'记住变化并继续前进',effects:{intelligence:3,willpower:2},chance:4},{label:'趁空间收缩时冲刺',effects:{agility:3,energy:-4},risk:true}]}
};
function addDungeonItem(id){const data=DUNGEON_ITEM_CATALOG[id];if(!data)return null;const item=addInventoryItem(data.name,'dungeon-item');item.itemId=id;item.icon=data.icon;return item}
function useDungeonItem(entity,index){
 const data=DUNGEON_ITEM_CATALOG[entity.itemId];if(!data){toast('道具数据不存在');return}
 if(data.tradeOnly){toast('该道具目前仅作为交易物资保留，对人使用机制尚未开放');return}
 if(data.lifeSave){s.dungeonProtection=(Number(s.dungeonProtection)||0)+1;s.inventory.splice(index,1);toast('替身纸人已启用：下一次高危副本失败时自动生效')}
 else if(data.type==='probability'){s.nextDungeonChanceModifier=Math.min(.25,(Number(s.nextDungeonChanceModifier)||0)+data.chance/100);s.inventory.splice(index,1);toast('下次副本通关概率 +'+data.chance+'%')}
 else if(data.type==='extension'){s.nextDungeonDueAt=(Number(s.nextDungeonDueAt)||Date.now()+7*86400000)+data.extendDays*86400000;s.inventory.splice(index,1);toast('副本期限已延长七天')}
 else if(data.type==='buff'){Object.entries(data.effects).forEach(([key,value])=>{if(key in s.attributes)s.attributes[key]=clamp((Number(s.attributes[key])||0)+value);else if(key in s)s[key]=clamp((Number(s[key])||0)+value)});s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);s.inventory.splice(index,1);toast(data.name+'已使用')}
 save();render();openTab('物品',true);
}
function dungeonDeadlineText(at=Date.now()){const due=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||Number(s.dungeonCycleStartedAt)||at)+7*86400000),left=due-at;return left<=0?'已逾期 '+Math.ceil(-left/86400000)+' 天 · 需要立即进入副本':'距离下次强制副本 '+Math.floor(left/86400000)+' 天 '+Math.floor(left%86400000/3600000)+' 小时'}
function applyDungeonDeadlinePenalty(at=Date.now()){
 const due=Number(s.nextDungeonDueAt)||((Number(s.lastDungeonAt)||Number(s.dungeonCycleStartedAt)||at)+7*86400000);if(at<due)return;const today=keyAt(at);if(s.dungeonOverduePenaltyDay===today)return;
 s.dungeonOverduePenaltyDay=today;s.energy=clamp((Number(s.energy)||0)-6);s.hunger=clamp((Number(s.hunger)||0)-5);s.clean=clamp((Number(s.clean)||0)-3);s.fun=clamp((Number(s.fun)||0)-5);s.attributes.willpower=clamp((Number(s.attributes.willpower)||0)-2);s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);addEvent('副本期限逾期','连续七天未进入副本，异常侵蚀影响了生存状态与意志。','daily');save();
}
function renderDungeonBoard(){
 const mission=s.activeDungeon;if(!mission)return;const board=mission.board||(mission.board={steps:0,position:0,chanceModifier:0,fatalRisk:false,flags:{},history:[]});$('drawerTitle').textContent='校园灵异 · 副本';$('choices').className='choices infinite-view dungeon-board-view';
 const current=board.position||0,lap=Math.min(3,Math.floor((board.steps||0)/12)+1),progress=Math.min(100,(board.steps||0)/36*100);
 const cells=DUNGEON_BOARD_TILES.map((tile,i)=>'<div class="dungeon-board-cell tone-'+tile[0]+' '+(i===current?'is-here':'')+'"><span>'+tile[2]+'</span><b>'+tile[1]+'</b><small>'+String(i+1).padStart(2,'0')+'</small></div>').join('');
 const history=(board.history||[]).slice(-4).reverse().map(h=>'<div class="dungeon-log-row"><b>'+h.title+'</b><span>'+h.outcome+'</span></div>').join('');
 $('choices').innerHTML='<section class="dungeon-board-cover"><div class="dungeon-board-kicker">CAMPUS ANOMALY / INFINITE INSTANCE</div><div class="dungeon-board-title">夜间校园</div><p>教学楼 · 实验楼 · 宿舍区 · 地下通道</p><div class="dungeon-board-meta"><span>副本等级 <b>'+mission.tier+'</b></span><span>第 <b>'+Math.min(3,lap)+'</b> / 3 圈</span><span>通关修正 <b>'+((board.chanceModifier||0)>=0?'+':'')+board.chanceModifier+'%</b></span></div><div class="dungeon-board-progress"><i style="width:'+progress+'%"></i></div></section><section class="dungeon-board-map"><div class="dungeon-board-map-head"><b>校园路线</b><small>掷骰前进 · 共三圈</small></div><div class="dungeon-board-grid">'+cells+'</div><div class="dungeon-board-center"><span>ROUND</span><strong>'+Math.min(3,lap)+'</strong><small>'+Math.min(36,board.steps||0)+' / 36 STEPS</small></div></section><section class="dungeon-board-controls"><div class="dungeon-dice-display"><span>LAST ROLL</span><b>'+(board.lastRoll||'—')+'</b><small>'+(board.lastMove?'前进 '+board.lastMove+' 格':'等待掷骰')+'</small></div><button class="dungeon-roll-button" id="dungeonRoll" '+(board.steps>=36?'disabled':'')+'>掷骰前进 <span>⚄</span></button></section><section class="dungeon-board-notes"><div class="dungeon-board-map-head"><b>事件记录</b><small>线索不是通关门槛</small></div>'+(history||'<p>尚无事件记录。校园的第一声钟响还没有出现。</p>')+'</section><div class="dungeon-deadline-note">'+dungeonDeadlineText()+'</div>';
 const roll=$('dungeonRoll');if(roll)roll.onclick=rollDungeonBoard;
}
function rollDungeonBoard(){
 const mission=s.activeDungeon;if(!mission||mission.board?.pending)return;const board=mission.board,roll=1+Math.floor(Math.random()*6),move=Math.min(roll,36-board.steps);board.lastRoll=roll;board.lastMove=move;board.steps+=move;board.position=board.steps%12;
 const tile=DUNGEON_BOARD_TILES[board.position],event={...DUNGEON_EVENT_LIBRARY[tile[0]]};
 if(board.steps===12||board.steps===24){event.title=board.steps===12?'第一圈结束 · 广播室':'第二圈结束 · 地下档案室';event.desc=board.steps===12?'你已经确认校园的异常并非单一现象。广播里出现新的路线提示。':'校园的时间结构开始崩坏，远处的出口与入口逐渐重合。';event.options=[{label:'整理现有信息，继续调查',effects:{intelligence:3,perception:2,willpower:1},chance:3},{label:'不再停留，尽快前进',effects:{agility:2,energy:-2}}]}
 board.pending={event,tile:tile[0]};save();renderDungeonEvent();
}
function renderDungeonEvent(){
 const mission=s.activeDungeon;if(!mission?.board?.pending)return;const {event,tile}=mission.board.pending,cell=DUNGEON_BOARD_TILES.find(t=>t[0]===tile),lap=Math.min(3,Math.ceil(mission.board.steps/12));$('drawerTitle').textContent='事件 · '+event.title;$('choices').className='choices infinite-view dungeon-event-view';
 $('choices').innerHTML='<section class="dungeon-event-scene tone-'+tile+'"><small>ROUND 0'+lap+' / '+cell[1]+'</small><div class="dungeon-event-symbol">'+cell[2]+'</div><h2>'+event.title+'</h2><p>'+event.desc+'</p></section><section class="dungeon-event-choices"><div class="dungeon-event-label">选择行动</div>'+event.options.map((option,i)=>'<button class="dungeon-event-choice" data-dungeon-choice="'+i+'"><span>0'+(i+1)+'</span><b>'+option.label+'</b><i>›</i></button>').join('')+'</section><p class="dungeon-event-footnote">事件影响生存与战斗九项数值；少数事件改变通关概率或提供道具。线索与钥匙均非强制条件。</p>';
 $('choices').querySelectorAll('[data-dungeon-choice]').forEach(button=>button.onclick=()=>resolveDungeonEvent(Number(button.dataset.dungeonChoice)));
}
function resolveDungeonEvent(index){
 const mission=s.activeDungeon;if(!mission?.board?.pending)return;const board=mission.board,event=board.pending.event,option=event.options[index];if(!option)return;
 Object.entries(option.effects||{}).forEach(([key,value])=>{if(key in s.attributes)s.attributes[key]=clamp((Number(s.attributes[key])||0)+value);else if(['energy','hunger','clean','fun'].includes(key))s[key]=clamp((Number(s[key])||0)+value)});
 s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);mission.snapshot.playerPower=s.combat;mission.snapshot.energy=s.energy;mission.snapshot.hunger=s.hunger;mission.snapshot.clean=s.clean;if(option.chance)board.chanceModifier=Math.max(-25,Math.min(25,(Number(board.chanceModifier)||0)+option.chance));if(option.flag)board.flags[option.flag]=true;if(option.risk)board.fatalRisk=true;
 let reward='无额外收获';if(option.item&&Math.random()<.68){let id=option.item;const rare=Math.random();if(rare<.07)id='standin';else if(rare<.12)id='reprieve';else if(rare<.17)id='hex';else if(rare<.21)id='misfortune';const item=addDungeonItem(id);if(item)reward='获得道具：'+item.name}
 board.history=Array.isArray(board.history)?board.history:[];board.history.push({title:event.title,outcome:option.label+' · '+reward});board.history=board.history.slice(-12);board.pending=null;
 if(board.steps>=36){mission.scheduleEndAt=Date.now();save();settleDungeonIfDue(Date.now());return}save();render();renderDungeonBoard();
}
function showDungeonPending(){if(s.activeDungeon?.board?.pending)renderDungeonEvent();else renderDungeonBoard()}
function updateDungeonCountdown(){const m=s.activeDungeon;if(!m)return;const roll=$('dungeonRoll');if(roll)roll.disabled=!!m.board?.pending||(m.board?.steps||0)>=36}
function dungeonCooldownRemaining(){return 0}
function startDungeon(tier){
 if(s.activeDungeon){showDungeonPending();$('drawer').classList.add('open');return}
 const incompatible=s.teamRoster.filter(m=>m.selected&&dungeonTierIndex(m.maxTier)<dungeonTierIndex(tier));if(incompatible.length){toast('队友最高副本等级不足：'+incompatible.map(m=>m.name+'（'+(m.maxTier||'F')+'）').join('、'));return}
 if(!dungeonUnlocked(tier)){toast('尚未解锁');return}const energyCost=Number(({F:5,E:7,D:9,C:12,B:15,A:18,S:22,SS:26,SSS:30})[tier]||5);if(s.energy<energyCost){toast('精力不足');return}dispatchDungeon(tier,energyCost,DUNGEON_BASE_REWARD[tier]||25);
}
function dispatchDungeon(tier,energyCost,base){
 const now=Date.now(),selected=s.teamRoster.filter(m=>m.selected);if(selected.some(m=>dungeonTierIndex(m.maxTier)<dungeonTierIndex(tier))){toast('队友副本等级不足，无法进入');return}
 const strangers=Array.from({length:2},(_,i)=>({id:'stranger-'+now+'-'+i,name:'陌生匹配者 '+(i+1),combat:Math.round(34+Math.random()*54),malice:Math.round(8+Math.random()*82)})),team=[...selected,...strangers],teamPower=team.reduce((n,m)=>n+m.combat,0)/team.length,teamMalice=team.reduce((n,m)=>n+m.malice,0)/team.length,difficulty=[8,14,21,29,38,48,59,71,84][DUNGEON_TIERS.indexOf(tier)];
 s.energy=Math.max(0,s.energy-energyCost);s.lastDungeonAt=now;s.nextDungeonDueAt=now+7*86400000;const nextModifier=Number(s.nextDungeonChanceModifier)||0;s.nextDungeonChanceModifier=0;
 s.activeDungeon={id:'dungeon-'+now,status:'active',tier,energyCost,baseReward:base,difficulty,startAt:now,endsAt:0,scheduleEndAt:0,successChanceModifier:nextModifier,snapshot:{playerPower:s.combat,teamPower,teamMalice,energy:s.energy,hunger:s.hunger,clean:s.clean,selected:selected.map(m=>({id:m.id,name:m.name,combat:m.combat,malice:m.malice})),matchedStrangers:strangers},board:{steps:0,position:0,chanceModifier:0,fatalRisk:false,flags:{},history:[],pending:null}};
 s.activeInteraction=null;s.currentActivity='idle';s.currentActivityAnchor=null;s.currentActivityRoom=null;s.currentActivityFurnitureId=null;save();render();renderDungeonBoard();$('drawer').classList.add('open');
}
function settleDungeonIfDue(at=Date.now()){
 const mission=s.activeDungeon;if(!mission||mission.status!=='active')return false;const deadline=Number(mission.scheduleEndAt||mission.endsAt||0);if(!deadline||at<deadline)return false;
 const snap=mission.snapshot||{},board=mission.board||{},power=(Number(snap.playerPower)||0)*.48+(Number(snap.teamPower)||0)*.52,penalty=(100-(Number(snap.energy)||0))*.0011+(100-(Number(snap.hunger)||0))*.00035+(100-(Number(snap.clean)||0))*.00025,modifier=((Number(board.chanceModifier)||0)+(Number(mission.successChanceModifier)||0))/100,successChance=Math.max(.035,Math.min(.97,.50+(power-mission.difficulty)*.006-(Number(snap.teamMalice)||0)*.0038-penalty+modifier)),success=Math.random()<successChance;
 let fatal=false,survived=true;
 if(!success&&board.fatalRisk){const protection=s.inventory.findIndex(item=>item.kind==='dungeon-item'&&item.itemId==='standin');if(Number(s.dungeonProtection)>0)s.dungeonProtection--;else if(protection>=0)s.inventory.splice(protection,1);else{fatal=true;survived=false;s.energy=0;s.hunger=0;s.attributes.willpower=clamp(s.attributes.willpower-18);s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5)}}
 const raw=Math.round(Math.max(0,Math.min(100,50+power*.22-mission.difficulty*.25+(Math.random()*20-10)-(Number(snap.teamMalice)||0)*.12+(Number(board.chanceModifier)||0)*.25))),rating=success?(raw>=94?'SS':raw>=84?'S':raw>=72?'A':raw>=59?'B':'C'):(raw>=55?'C':'D'),earned=success?Math.max(5,Math.round(mission.baseReward*(.65+raw/150))):Math.max(2,Math.round(mission.baseReward*.12));
 s.points+=earned;if(success)s.dungeonProgress[mission.tier]=(Number(s.dungeonProgress[mission.tier])||0)+1;
 const before=[...s.dungeonUnlocks];refreshDungeonUnlocks();const newly=s.dungeonUnlocks.filter(x=>!before.includes(x)),result={tier:mission.tier,success,rating,score:raw,points:earned,successChance:Math.round(successChance*100),teamPower:Math.round(snap.teamPower||0),teamMalice:Math.round(snap.teamMalice||0),matchedCount:(snap.matchedStrangers||[]).length,at,unlocked:newly,survived,fatal,boardSteps:board.steps||36};
 recordDungeonStat(result);const elite=maybeMeetElite(mission.tier,at);if(elite)result.eliteEncounter={name:elite.name,relation:elite.relation};s.dungeonHistory.unshift(result);s.dungeonHistory=s.dungeonHistory.slice(0,80);s.activeDungeon=null;s.lastDungeonResult=result;
 addEvent('副本结算报告 · '+result.tier,'校园灵异副本已结束。'+(success?'成功通关':'未能通关')+'，评级 '+rating+'，获得 '+earned+' 积分。'+(fatal?'未使用保命道具，角色遭受濒死重创。':''),'daily');save();render();if($('drawer').classList.contains('open')&&$('drawerTitle').textContent.includes('副本'))showDungeonResult(result);return true;
}
function showDungeonResult(result){
 $('drawerTitle').textContent='副本结算';$('choices').className='choices infinite-view';
 $('choices').innerHTML='<section class="instance-result '+(result.success?'cleared':'failed')+'"><div class="result-emblem">'+(result.success?'✦':'✕')+'</div><div class="instance-result-status">'+(result.success?'通关':'失败')+'</div><div class="instance-rating">'+result.rating+'</div><div class="result-tier">'+result.tier+'级 · 校园灵异</div><p>通关概率 '+result.successChance+'% · 完成 '+result.boardSteps+' 格</p></section><div class="instance-reward"><span>获得积分</span><strong>+'+result.points+'</strong><small>累计 '+s.points.toLocaleString('zh-CN')+'</small></div><div class="instance-result-detail"><span>生还状态</span><b>'+(result.survived?'已生还':'濒死重创')+'</b><span>本次圈数</span><b>3 圈</b></div><button class="instance-primary" id="instanceAgain">返回组队</button>';
 $('instanceAgain').onclick=showDungeon;
}
function showEntertainment(){ $('drawerTitle').textContent='娱乐';$('choices').className='choices infinite-view';$('choices').innerHTML='<div class="illustrated-masthead"><div class="ink-illustration"><svg viewBox="0 0 300 100"><path d="M15 82 Q60 10 108 72 T205 38 T285 65" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="90" cy="38" r="20" fill="none" stroke="currentColor"/><path d="M80 38h20M90 28v20" stroke="currentColor"/></svg></div><h2>娱乐</h2></div><div class="illustrated-choice-grid"><button class="instance-strategy" onclick="toast(\'即将开放\')">🎴<strong>牌局</strong></button><button class="instance-strategy" onclick="toast(\'即将开放\')">🎮<strong>街机</strong></button><button class="instance-strategy" onclick="toast(\'即将开放\')">♟<strong>棋室</strong></button></div>';$('drawer').classList.add('open');}
const ARDAY_ELITE_RANKERS=[
{id:'elite-01',name:'霜原',role:'独行者',combat:98,malice:12,points:28640},
{id:'elite-02',name:'顾长夜',role:'战术指挥',combat:96,malice:19,points:25120},
{id:'elite-03',name:'沈知远',role:'异常猎手',combat:94,malice:8,points:22900},
{id:'elite-04',name:'裴照',role:'重装先锋',combat:93,malice:31,points:20500},
{id:'elite-05',name:'祁连',role:'远程狙击',combat:91,malice:14,points:18800},
{id:'elite-06',name:'温黛',role:'精神干涉',combat:90,malice:22,points:17400},
{id:'elite-07',name:'陆沉',role:'近战突击',combat:89,malice:27,points:15900},
{id:'elite-08',name:'谢临川',role:'情报分析',combat:88,malice:9,points:14600},
{id:'elite-09',name:'岑鸢',role:'环境适应',combat:86,malice:17,points:13300},
{id:'elite-10',name:'江砚',role:'医疗支援',combat:85,malice:11,points:12100}
];
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouchDevice?1.25:1.5));renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.76;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
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
    if((object.geometry.boundingSphere?.radius||0)<.23)return;
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
  const hallScene=window.ArdayHallScene?.create(T,scene,M,box);if(!hallScene)throw new Error('Public hall scene failed to initialize');
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
   [living,bedroom,kitchen,bathroom].forEach(g=>{if(g.userData.ceilingMesh)g.userData.ceilingMesh.visible=decorating;
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
  const furnitureModelAliases={"开放书架":{"model":"书架","variant":"开放格架"},"坐垫":{"model":"坐垫","variant":""},"雾面墙纸":{"model":"墙纸","variant":"雾面"},"极简书桌":{"model":"书桌","variant":"白蜡木极简"},"屏风":{"model":"隔断","variant":""},"陶瓷灶":{"model":"灶台","variant":"奶油陶瓷"},"锥形吊灯":{"model":"吊灯","variant":"锥形金属"},"复古沙发":{"model":"沙发","variant":"经典款"},"床头柜":{"model":"床头柜","variant":""},"陶土花瓶":{"model":"花瓶","variant":""},"伞架":{"model":"伞架","variant":""},"三抽斗柜":{"model":"斗柜","variant":"奶油三抽"},"木格书架":{"model":"书架","variant":"白蜡木开放格"},"吊柜":{"model":"吊柜","variant":""},"展示柜":{"model":"展示柜","variant":""},"躺椅":{"model":"躺椅","variant":""},"布艺床":{"model":"床","variant":""},"海报":{"model":"海报","variant":""},"深海墙纸":{"model":"墙纸","variant":"深海"},"棕榈树":{"model":"棕榈树绿植","variant":""},"水磨地板":{"model":"地板","variant":"水磨"},"蘑菇台灯":{"model":"台灯","variant":"蘑菇"},"默认室内木门":{"model":"门","variant":"标准胡桃木"},"门":{"model":"门","variant":"标准胡桃木"},"白橡木玻璃门":{"model":"门","variant":"白橡木玻璃门"},"奶油法式双线门":{"model":"门","variant":"奶油法式双线门"},"藤编门":{"model":"门","variant":"藤编门"},"深色格栅推拉门":{"model":"门","variant":"深色格栅推拉门"},"复古拱顶门":{"model":"门","variant":"复古拱顶门"},"懒人沙发":{"model":"懒人沙发","variant":""},"纸罩灯":{"model":"落地灯","variant":"纸罩"},"鞋柜":{"model":"鞋柜","variant":""},"梳妆台":{"model":"梳妆台","variant":""},"电视柜":{"model":"电视柜","variant":""},"玻璃书柜":{"model":"书架","variant":"玻璃门书柜"},"沙发床":{"model":"沙发床","variant":""},"榻榻米":{"model":"榻榻米","variant":""},"软包床":{"model":"床","variant":"奶油软包"},"复古书桌":{"model":"书桌","variant":"深胡桃木复古"},"哑铃架":{"model":"哑铃架","variant":""},"石材茶几":{"model":"茶几","variant":"米白石材"},"珐琅灶":{"model":"灶台","variant":"复古珐琅"},"壁画":{"model":"壁画","variant":""},"长餐桌":{"model":"餐桌","variant":"浅橡木长桌"},"几何地毯":{"model":"地毯","variant":"海盐蓝"},"水泥地板":{"model":"地板","variant":"水泥"},"抽屉书桌":{"model":"书桌","variant":"抽屉工作台"},"双臂壁灯":{"model":"壁灯","variant":"黄铜双臂"},"方形边桌":{"model":"边桌","variant":"深木方桌"},"木框床":{"model":"床","variant":"浅橡木框架"},"默认窗户":{"model":"窗","variant":""},"窗":{"model":"窗","variant":""},"圆形茶几":{"model":"茶几","variant":"圆形浅橡木"},"折线台灯":{"model":"台灯","variant":"陶瓷折线"},"卧室地毯":{"model":"地毯","variant":"羊毛米白"},"上床下桌":{"model":"上床下桌","variant":""},"木框挂钟":{"model":"挂钟","variant":""},"波斯地毯":{"model":"地毯","variant":"波斯绛红"},"羊毛沙发":{"model":"沙发","variant":"暖灰羊毛"},"亚麻窗帘":{"model":"窗帘","variant":""},"藤编柜":{"model":"床头柜","variant":"藤编抽屉"},"橱柜":{"model":"橱柜","variant":""},"钢琴":{"model":"钢琴","variant":""},"玻璃台灯":{"model":"台灯","variant":"琥珀玻璃"},"洗衣机":{"model":"洗衣机","variant":""},"亚麻沙发":{"model":"沙发","variant":"亚麻燕麦"},"餐边柜":{"model":"餐边柜","variant":""},"三脚灯":{"model":"落地灯","variant":"黑色三脚"},"冰箱":{"model":"冰箱","variant":""},"不锈钢灶":{"model":"灶台","variant":"不锈钢"},"圆形餐桌":{"model":"餐桌","variant":"圆形餐桌"},"酒柜":{"model":"酒柜","variant":""},"料理台":{"model":"料理台","variant":""},"复古妆台":{"model":"梳妆台","variant":""},"玻璃吊灯":{"model":"吊灯","variant":"乳白玻璃"},"石膏墙纸":{"model":"墙纸","variant":"石膏"},"休闲沙发":{"model":"沙发","variant":""},"任务板":{"model":"任务板","variant":""},"照片墙":{"model":"照片墙","variant":""},"唱片机":{"model":"唱片机","variant":""},"花束":{"model":"捧花摆件","variant":""},"复古书柜":{"model":"书架","variant":"深胡桃木书柜"},"四抽斗柜":{"model":"斗柜","variant":"胡桃木四抽"},"跑步机":{"model":"跑步机","variant":""},"藤编餐椅":{"model":"餐桌椅","variant":"藤编餐椅"},"双人床":{"model":"床","variant":""},"抽屉茶几":{"model":"茶几","variant":"胡桃木抽屉"},"水槽":{"model":"水槽","variant":""},"羊毛地毯":{"model":"地毯","variant":"羊毛米白"},"游戏机":{"model":"游戏机","variant":""},"衣柜":{"model":"衣柜","variant":""},"拱形镜":{"model":"全身镜","variant":"黄铜拱形"},"扶手餐椅":{"model":"餐桌椅","variant":"软包扶手椅"},"绒布沙发":{"model":"沙发","variant":"雾蓝绒布"},"网布椅":{"model":"办公椅","variant":""},"单臂壁灯":{"model":"壁灯","variant":"单臂"},"置物架":{"model":"置物架","variant":""},"衣帽架":{"model":"衣帽架","variant":""},"黄铜桌":{"model":"边桌","variant":"黄铜圆桌"},"格纹地毯":{"model":"地毯","variant":"奶油棋盘"},"电脑":{"model":"电脑","variant":""},"弧背椅":{"model":"椅子","variant":""},"藤编吊灯":{"model":"吊灯","variant":"藤编圆罩"},"电视":{"model":"电视","variant":""},"弧形灯":{"model":"落地灯","variant":"黄铜弧形"},"凳子":{"model":"凳子","variant":""},"默认室内木门":{"model":"门","variant":"标准胡桃木"},"标准胡桃木门":{"model":"门","variant":"标准胡桃木"}};
  function createOwnedFurniture(name,record=null){
   const alias=furnitureModelAliases[name];
   const variant=alias?.variant??(name.includes('·')?name.split('·').slice(1).join('·').trim():'');
   const modelName=alias?.model??name.split('·')[0].trim();
   const room=record?.room||roomMode||'living',parent=room==='bedroom'?bedroom:room==='kitchen'?kitchen:room==='bathroom'?bathroom:living;
   const id=record?.id||('furn-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
   const group=new T.Group();group.userData.ownedType=name;group.userData.furnitureKey=id;group.userData.roomKey=room;parent.add(group);
   const mat=(color,rough=.78,metalness=0)=>{const material=stylizeMaterial(new T.MeshStandardMaterial({color:recolorFurniture(color),roughness:Math.max(.08,Math.min(1,rough)),metalness:Math.max(0,Math.min(.9,metalness))}));material.userData.dyeable=metalness<.58&&rough>=.28;return material};
   const m={wood:mat(0x946746),oak:mat(0xc39a70),fabric:mat(0xb9a1a0,.95),sofa:mat(0xb9a1a0,.95),sofa2:mat(0xd3c5b1,.98),cream:mat(0xeee1cf,.9),dark:mat(0x39434b,.45),metal:mat(0x858783,.3,.72),leaf:mat(0x477a4d,.9),leaf2:mat(0x88a968,.9),clay:mat(0xb56d50),gold:mat(0xc5a15d,.35,.5),wall:mat(0xf0e4d2),screen:mat(0x25465b,.2)};
   const fabricMap=createPainterTexture('fabric'),woodMap=createPainterTexture('wood'),ceramicMap=createPainterTexture('ceramic');
   [m.fabric,m.sofa,m.sofa2].forEach(material=>applyPainterMap(material,fabricMap,.018));
   [m.wood,m.oak].forEach(material=>applyPainterMap(material,woodMap,.012));
   applyPainterMap(m.cream,ceramicMap,.006);applyPainterMap(m.wall,roomWallMap,.004);
   if(modelName==='地毯'){
    const palettes={'波斯绛红':[0x8f3f3a,0xd8b98b,0xead8b8,0xb78b4d],'奶油棋盘':[0xd8c8ad,0x9a8876,0xf0e5d4,0x9b8064],'海盐蓝':[0x55778a,0xb6c6c7,0xe0e5df,0xc2a66e],'羊毛米白':[0xd8cdbb,0xc6b8a2,0xf0e8da,0xb69b78]};
    const p=palettes[variant]||palettes['奶油棋盘'];m.fabric.color.setHex(p[0]);m.sofa2.color.setHex(p[1]);m.cream.color.setHex(p[2]);m.gold.color.setHex(p[3]);
   }
   if(modelName==='灶台'){
    const palettes={'复古珐琅':[0x8c4941,0xe4d4bd,0xb7a18a],'不锈钢':[0x424c54,0xc8d0d2,0x7c8589],'奶油陶瓷':[0xd8c9ae,0xf1e9dc,0xb9a78f]};
    const p=palettes[variant]||palettes['不锈钢'];m.dark.color.setHex(p[0]);m.metal.color.setHex(p[1]);m.cream.color.setHex(p[2]);
   }
   if(modelName==='沙发'&&variant==='雾蓝绒布'){m.fabric.color.setHex(0x657f94);m.sofa2.color.setHex(0x91a4b2);m.wood.color.setHex(0x594b43)}
   if(modelName==='沙发'&&variant==='鼠尾草绿'){m.fabric.color.setHex(0x82927b);m.sofa2.color.setHex(0xb2bba6);m.wood.color.setHex(0x665443)}
   if(modelName==='沙发'&&variant==='暖灰羊毛'){m.fabric.color.setHex(0xaaa69d);m.sofa2.color.setHex(0xd1cbc0);m.wood.color.setHex(0x71665a)}
   if(modelName==='沙发'&&variant==='亚麻燕麦'){m.fabric.color.setHex(0xc4ad91);m.sofa2.color.setHex(0xe1d3bd);m.wood.color.setHex(0x76543a)}
   // Furniture uses softly bevelled silhouettes instead of razor-sharp box primitives.
   function softBoxGeometry(w,h,d){
    const radius=Math.max(.016,Math.min(w,h,d)*.13),x=w/2,y=h/2,r=radius;
    const shape=new T.Shape();
    shape.moveTo(-x+r,-y);shape.lineTo(x-r,-y);shape.quadraticCurveTo(x,-y,x,-y+r);
    shape.lineTo(x,y-r);shape.quadraticCurveTo(x,y,x-r,y);
    shape.lineTo(-x+r,y);shape.quadraticCurveTo(-x,y,-x,y-r);
    shape.lineTo(-x,-y+r);shape.quadraticCurveTo(-x,-y,-x+r,-y);
    const bevel=Math.min(r*.56,d*.16);
    const geometry=new T.ExtrudeGeometry(shape,{depth:Math.max(.008,d-bevel*2),steps:1,bevelEnabled:true,bevelSegments:2,bevelThickness:bevel,bevelSize:bevel,curveSegments:4});
    geometry.translate(0,0,-d/2+bevel);geometry.computeVertexNormals();return geometry;
   }
   const box=(x,y,z,w,h,d,material)=>{const o=new T.Mesh(softBoxGeometry(w,h,d),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
   const cyl=(x,y,z,top,bottom,h,material)=>{const o=new T.Mesh(new T.CylinderGeometry(top,bottom,h,20),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;return o};
   const sphere=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;return o};
   const restoring=!!record&&['x','y','z','rotation','wallSide','wallOffset'].some(key=>Object.prototype.hasOwnProperty.call(record,key));
   let width=1,depth=1,height=.8,surfaceType='floor',surfaceY=.04,supportId=record?.supportId||null,wallAxis=null,wallSide=null,anchor=[0,.5],action=()=>{};
   const legs=(w,d,h,t)=>{for(const x of [-w/2+t,w/2-t])for(const z of [-d/2+t,d/2-t])box(x,h/2,z,t,h,t,m.wood)};
   if(modelName==='床'){
    action=()=>openFurnitureActions('bed',id);
    const isWood=variant==='浅橡木框架',isSoft=variant==='奶油软包',isDouble=name==='双人床';
    width=isDouble?3.55:3.1;depth=3.45;height=1.32;
    const frame=isWood?m.oak:isSoft?m.cream:m.wood;
    const textile=mat(isSoft?0xe8ddcc:isDouble?0xd8cbbb:0xcfc4b6,.97);
    const piping=mat(isWood?0xb69a76:isSoft?0xbba78f:0x9b8878,.86);
    const mattressW=isDouble?3.38:2.92;
    box(0,.2,0,mattressW+.12,.18,3.28,frame);
    box(0,.48,.05,mattressW,.3,3.12,m.cream);
    box(0,.66,.08,mattressW-.08,.12,3.02,textile);
    if(isWood){
     box(0,.96,-1.62,mattressW+.16,.94,.16,m.oak);
     box(0,.58,-1.52,mattressW+.12,.16,.2,m.wood);
     for(let x=-mattressW/2+.14;x<=mattressW/2-.13;x+=.24)box(x,.98,-1.52,.035,.78,.08,m.wood);
     for(const x of [-mattressW/2+.12,mattressW/2-.12]){
      box(x,.18,-1.5,.13,.34,.14,m.oak);box(x,.18,1.48,.13,.34,.14,m.oak);
     }
     box(0,.76,.55,mattressW-.22,.07,1.72,m.cream);
    }else if(isSoft){
     box(0,1.05,-1.63,mattressW+.18,1.5,.22,m.cream);
     box(0,1.03,-1.5,mattressW-.12,1.27,.12,textile);
     for(let x=-mattressW/2+.35;x<=mattressW/2-.3;x+=.42)box(x,1.04,-1.425,.018,1.05,.018,piping);
     for(const x of [-mattressW*.28,0,mattressW*.28])for(const y of [.68,1.02,1.36])sphere(x,y,-1.35,.035,.035,.018,piping);
     box(0,.74,.55,mattressW-.2,.1,1.72,m.cream);
    }else if(isDouble){
     // Double bed: wide upholstered wingback headboard with a split pair of sleeping pillows.
     box(0,.98,-1.62,mattressW+.22,1.34,.22,m.wood);
     box(0,.98,-1.48,mattressW-.08,1.14,.08,textile);
     for(const x of [-mattressW/2+.08,mattressW/2-.08]){
      const wing=box(x,.98,-1.38,.16,1.2,.32,m.cream);wing.rotation.y=x<0?-.1:.1;
     }
     for(const x of [-mattressW*.25,mattressW*.25]){
      const pillow=sphere(x,.92,-.88,.56,.16,.36,m.cream);pillow.rotation.x=-.14;
      for(const side of [-1,1])box(x+side*.25,.92,-.88,.012,.012,.3,piping);
     }
     box(0,.7,.54,mattressW-.16,.12,1.82,m.cream);
     box(0,.73,1.48,mattressW*.84,.15,.38,textile);
     for(const x of [-.62,0,.62])box(x,.99,-1.41,.025,.82,.018,piping);
    }else{
     box(0,.94,-1.62,mattressW+.12,1.22,.2,m.wood);
     box(0,.97,-1.49,mattressW-.08,.98,.06,m.fabric);
     box(0,.69,.52,mattressW-.12,.1,1.78,m.cream);
     for(const x of [-mattressW*.3,mattressW*.3]){
      const pillow=sphere(x,.91,-.9,.52,.15,.34,m.cream);pillow.rotation.x=-.12;
     }
    }
    const duvet=sphere(0,.79,.62,mattressW*.43,.13,1.05,textile);
    duvet.rotation.x=-.025;box(0,.73,1.55,mattressW*.86,.14,.36,textile);
    for(let i=0;i<7;i++){
     const x=-mattressW*.38+i*mattressW*.76/6;
     box(x,.91,.58,.012,.012,1.65,piping);
    }
    for(const x of [-mattressW*.34,mattressW*.34]){
     const pillow=sphere(x,.88,-.88,.48,.13,.32,m.cream);pillow.rotation.x=-.14;
    }
   }else if(modelName==='床头柜'){
    const woven=variant==='藤编抽屉';width=.88;depth=.78;height=.92;
    if(woven){
     const cane=mat(0xc5a47a,.94),frame=mat(0x76543d,.66),shadow=mat(0x4e3829,.82);
     box(0,.48,0,.82,.72,.68,frame);box(0,.87,0,.94,.1,.78,m.oak);
     // A single deep rattan basket drawer and an open lower shelf replace the standard twin-drawer front.
     box(0,.63,.36,.72,.38,.035,shadow);box(0,.63,.39,.7,.34,.035,cane);
     for(let x=-.31;x<=.311;x+=.055){const strand=box(x,.63,.414,.012,.31,.012,m.oak);strand.rotation.z=.12}
     for(let y=.49;y<=.771;y+=.055){const strand=box(0,y,.42,.68,.012,.012,m.cream);strand.rotation.y=.08}
     box(0,.31,.36,.72,.045,.035,m.oak);
     box(0,.25,0,.76,.045,.58,m.oak);
     for(const x of [-.32,.32]){
      const leg=box(x,.14,.25,.07,.28,.07,frame);leg.rotation.z=x*.12;
      const rear=box(x,.14,-.25,.07,.28,.07,frame);rear.rotation.z=x*.12;
     }
     box(0,.45,.43,.14,.025,.025,m.gold);
    }else{
     box(0,.47,0,.86,.76,.72,m.wood);box(0,.87,.02,.94,.1,.8,m.cream);
     for(const y of [.32,.62]){box(0,y,.37,.76,.25,.035,m.sofa2);for(const x of [-.19,.19])cyl(x,y,.405,.018,.018,.035,m.gold,10)}
     for(const x of [-.34,.34])box(x,.08,-.27,.09,.16,.09,m.dark);
    }
   }else if(modelName==='台灯'){
    width=.48;depth=.48;height=.92;surfaceType='tabletop';surfaceY=.9;
    if(variant==='蘑菇'){cyl(0,.12,0,.19,.22,.2,m.gold,16);cyl(0,.43,0,.055,.075,.48,m.cream,16);const dome=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);dome.scale.set(.31,.2,.31);dome.position.y=.72;group.add(dome)}else if(variant==='琥珀玻璃'){cyl(0,.12,0,.18,.2,.18,m.gold,20);cyl(0,.36,0,.07,.09,.38,m.metal,16);const globe=new T.Mesh(new T.SphereGeometry(.25,24,16),mat(0xc68b4f,.22,.12));globe.scale.set(1,.82,1);globe.position.y=.65;group.add(globe)}else if(variant==='陶瓷折线'){cyl(0,.12,0,.2,.22,.2,m.clay,16);const stem=new T.Mesh(new T.CylinderGeometry(.09,.16,.48,8),m.cream);stem.position.y=.43;group.add(stem);const shade=new T.Mesh(new T.CylinderGeometry(.28,.12,.28,12),m.cream);shade.position.y=.82;group.add(shade)}else{cyl(0,.12,0,.18,.2,.2,m.dark,16);cyl(0,.48,0,.045,.07,.58,m.gold,12);const shade=new T.Mesh(new T.CylinderGeometry(.27,.12,.3,16),m.cream);shade.position.y=.88;group.add(shade)}
   }else if(modelName==='壁灯'){
    width=.72;depth=.22;height=.78;wallAxis='x';wallSide='back';anchor=[0,3.15];box(0,0,-.04,.22,.42,.09,m.gold);cyl(0,-.16,.08,.045,.045,.28,m.gold,12);
    if(variant==='黄铜双臂'){for(const side of [-1,1]){const arm=box(side*.2,.06,.02,.34,.045,.045,m.gold);arm.rotation.z=side*.3;const shade=new T.Mesh(new T.ConeGeometry(.15,.2,12,1,true),m.cream);shade.position.set(side*.34,.22,.1);shade.rotation.x=Math.PI;group.add(shade);cyl(side*.34,.11,.1,.025,.025,.2,m.gold,10)}}else{const shade=new T.Mesh(new T.ConeGeometry(.2,.28,16,1,true),m.cream);shade.position.set(0,.16,.12);shade.rotation.x=Math.PI;group.add(shade);cyl(0,.02,.12,.025,.025,.2,m.gold,10)}
   }else if(modelName==='落地灯'){
    width=.68;depth=.68;height=1.92;surfaceType='floor';surfaceY=.04;
    cyl(0,.045,0,.31,.31,.09,m.dark,24);cyl(0,.105,0,.24,.24,.035,m.gold,24);
    if(variant==='黑色三脚'){
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3,leg=box(Math.cos(a)*.16,.88,Math.sin(a)*.16,.045,1.72,.045,mat(0x343638,.55,.25));leg.rotation.z=Math.cos(a)*.08;leg.rotation.x=Math.sin(a)*.08}
     cyl(0,1.72,0,.045,.045,.12,m.dark,16);const shade=new T.Mesh(new T.CylinderGeometry(.3,.17,.42,24,1,true),m.cream);shade.position.y=1.52;group.add(shade);
    }else if(variant==='黄铜弧形'){
     const arc=new T.CatmullRomCurve3([new T.Vector3(0,.13,0),new T.Vector3(0,.72,0),new T.Vector3(.12,1.38,0),new T.Vector3(.42,1.76,0),new T.Vector3(.47,1.62,0)]);
     group.add(new T.Mesh(new T.TubeGeometry(arc,32,.035,10,false),m.gold));
     const shade=new T.Mesh(new T.ConeGeometry(.23,.28,24,1,true),m.cream);shade.position.set(.47,1.48,0);shade.rotation.z=Math.PI;group.add(shade);cyl(.47,1.33,0,.035,.035,.13,m.gold,12);
    }else{
     cyl(0,.94,0,.035,.045,1.68,m.gold,16);cyl(0,1.78,0,.045,.045,.12,m.gold,16);
     const shade=new T.Mesh(new T.CylinderGeometry(.27,.16,.38,24,1,true),m.cream);shade.position.y=1.55;group.add(shade);
     const diffuser=new T.Mesh(new T.CircleGeometry(.16,24),m.cream);diffuser.position.y=1.35;diffuser.rotation.x=-Math.PI/2;group.add(diffuser);
    }
   }else if(modelName==='成品食物'){
    width=.74;depth=.74;height=.24;surfaceType='tabletop';
    const plate=mat(0xf4eee2,.28),plateEdge=mat(0xc9b99e,.32),rice=mat(0xf1e5c9,.92),egg=mat(0xe8bd58,.78),tomato=mat(0xc85e42,.82),green=mat(0x6f8c50,.9),meat=mat(0x8c5237,.86),noodle=mat(0xe6c77f,.84),broth=mat(0xb88a4f,.3),tofu=mat(0xe8d8b8,.9);
    cyl(0,.045,0,.365,.365,.055,plate,40);cyl(0,.076,0,.34,.34,.018,plateEdge,40);cyl(0,.088,0,.315,.315,.012,plate,40);
    const rim=new T.Mesh(new T.TorusGeometry(.315,.012,10,48),m.gold);rim.rotation.x=Math.PI/2;rim.position.y=.092;group.add(rim);
    const grain=(x,z,sx=.025,sz=.045,material=rice)=>sphere(x,.12,z,sx,.018,sz,material);
    const noodleLine=(pts,material=noodle,r=.018)=>{const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],.13,p[1])));group.add(new T.Mesh(new T.TubeGeometry(curve,28,r,8,false),material))};
    if(variant.includes('蛋炒饭')){
     for(let n=0;n<38;n++){const a=n*2.399,r=.045+Math.sqrt(n/38)*.225;grain(Math.cos(a)*r,Math.sin(a)*r,.018,.025,n%4===0?egg:n%7===0?green:rice)}
     for(let n=0;n<8;n++){const a=n*2.4,r=.12+(n%3)*.035;const o=box(Math.cos(a)*r,.145,Math.sin(a)*r,.035,.022,.028,n%3===0?green:egg);o.rotation.y=a}
    }else if(variant.includes('番茄炒蛋')){
     for(let n=0;n<5;n++){const a=n*1.25,r=.12+(n%2)*.045;const o=sphere(Math.cos(a)*r,.145,Math.sin(a)*r,.09,.035,.055,tomato);o.rotation.y=-a}
     for(let n=0;n<6;n++){const a=n*2.1,r=.09+(n%3)*.045;const o=sphere(Math.cos(a)*r,.16,Math.sin(a)*r,.075,.032,.052,egg);o.rotation.y=a}
    }else if(variant.includes('蔬菜汤')){
     const bowl=mat(0xe9dfca,.26);cyl(0,.15,0,.27,.31,.12,bowl,40);cyl(0,.205,0,.265,.265,.018,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.27,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.22;group.add(soupRim);
     for(let n=0;n<12;n++){const a=n*2.4,r=.08+(n%3)*.045;sphere(Math.cos(a)*r,.24,Math.sin(a)*r,.045,.022,.04,n%3===0?tomato:n%3===1?green:tofu)}
    }else if(variant.includes('红烧牛肉面')){
     const bowl=mat(0xd9d0bf,.24);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.29,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.245;group.add(soupRim);
     for(let n=0;n<5;n++){const a=n*1.25,r=.12+(n%2)*.04;noodleLine([[Math.cos(a)*r,Math.sin(a)*r],[Math.cos(a+.6)*r,Math.sin(a+.6)*r],[Math.cos(a+1.2)*r,Math.sin(a+1.2)*r]])}
     for(let n=0;n<4;n++){const o=sphere(Math.cos(n*1.6)*.13,.275,Math.sin(n*1.6)*.13,.065,.018,.045,meat);o.rotation.y=n*.6}
    }else if(variant.includes('奶油蘑菇烩饭')){
     for(let n=0;n<34;n++){const a=n*2.399,r=.04+Math.sqrt(n/34)*.2;grain(Math.cos(a)*r,Math.sin(a)*r,.023,.03,n%6===0?green:rice)}
     for(let n=0;n<8;n++){const a=n*2.1,r=.08+(n%3)*.045;const o=sphere(Math.cos(a)*r,.16,Math.sin(a)*r,.045,.025,.06,n%2?tofu:meat);o.rotation.y=a}
    }else if(variant.includes('香煎蛋吐司')){
     box(0,.125,0,.43,.07,.3,mat(0xc99657,.92));box(0,.16,0,.39,.018,.27,mat(0xf0d9a8,.9));sphere(0,.19,0,.13,.035,.11,egg);sphere(.025,.215,.005,.045,.012,.04,mat(0xf1d58a,.8));
    }else if(variant.includes('豆腐蔬菜煲')){
     const bowl=mat(0xd9cbb4,.26);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     const soupRim=new T.Mesh(new T.TorusGeometry(.29,.018,10,40),plateEdge);soupRim.rotation.x=Math.PI/2;soupRim.position.y=.245;group.add(soupRim);
     for(let n=0;n<10;n++){const a=n*2.4,r=.08+(n%3)*.045;sphere(Math.cos(a)*r,.26,Math.sin(a)*r,.045,.03,.04,n%3===0?tomato:n%3===1?green:tofu)}
    }else if(variant.includes('葱香土豆饼')){
     const pancake=mat(0xc99a52,.9),crust=mat(0x9a6937,.92);cyl(0,.12,0,.27,.27,.035,plate,36);
     for(let n=0;n<3;n++){const cake=cyl(0,.15+n*.035,0,.19,.19,.035,n===2?pancake:crust,32);cake.rotation.y=n*.18}
     for(let n=0;n<12;n++){const a=n*2.4,r=.07+(n%3)*.035;sphere(Math.cos(a)*r,.265,Math.sin(a)*r,.012,.006,.025,green)}
    }else if(variant.includes('土豆炖牛肉')){
     const bowl=mat(0xd9cbb4,.26);cyl(0,.15,0,.29,.33,.15,bowl,40);cyl(0,.225,0,.285,.285,.025,broth,40);
     for(let n=0;n<7;n++){const a=n*2.4,r=.07+(n%3)*.05;const o=box(Math.cos(a)*r,.27,Math.sin(a)*r,.065,.05,.065,n%2?tofu:meat);o.rotation.y=a}
    }
   }else if(modelName==='吊灯'){
    width=.78;depth=.78;height=.56;surfaceType='ceiling';cyl(0,.28,0,.07,.07,.12,m.gold,12);cyl(0,.04,0,.025,.025,.42,m.gold,10);if(variant==='藤编圆罩'){const shade=new T.Mesh(new T.SphereGeometry(.38,24,16,0,Math.PI*2,0,Math.PI/2),mat(0xb68d5e,.94));shade.position.y=-.12;shade.scale.set(1,.82,1);group.add(shade);cyl(0,-.31,0,.16,.16,.035,m.cream,24)}else if(variant==='乳白玻璃'){const globe=new T.Mesh(new T.SphereGeometry(.3,20,14),m.cream);globe.position.y=-.22;group.add(globe);cyl(0,-.48,0,.12,.12,.045,m.gold,12)}else{const shade=new T.Mesh(new T.CylinderGeometry(.34,.16,.28,20),m.cream);shade.position.y=-.25;group.add(shade);cyl(0,-.41,0,.18,.18,.035,m.gold,12)}
   }else if(modelName==='衣柜'){
    width=1.85;depth=.78;height=2.45;
    const body=mat(0x76543d,.68),front=mat(0xd8c8b3,.76),inner=mat(0x4c382c,.82);
    box(0,1.2,0,1.78,2.3,.68,body);box(0,2.38,0,1.92,.12,.78,m.oak);box(0,.08,0,1.86,.16,.76,m.dark);
    // Two full-height doors with recessed framed panels and separate handles.
    for(const x of [-.45,.45]){
     box(x,1.22,.355,.84,2.12,.045,front);
     for(const dx of [-.38,.38])box(x+dx,1.22,.383,.025,1.98,.018,m.oak);
     for(const y of [.25,2.19])box(x,y,.383,.78,.025,.018,m.oak);
     box(x,1.22,.382,.72,1.78,.012,m.cream);
     cyl(x+(x<0?.3:-.3),1.2,.425,.025,.025,.08,m.gold,12);
    }
    // A narrow central reveal, plinth and crown moulding make the carcass read as furniture.
    box(0,1.22,.36,.025,2.12,.02,inner);
    box(0,.16,.02,1.78,.12,.7,body);box(0,2.46,0,2.0,.08,.82,m.oak);
    for(const x of [-.72,.72])box(x,.12,.02,.1,.2,.72,m.dark);
   }else if(modelName==='卧室地毯'){
    width=3.4;depth=2.5;surfaceType='rug';box(0,.035,0,3.4,.07,2.5,m.fabric);box(0,.075,0,3.18,.012,2.28,m.sofa2);
   }else if(modelName==='橱柜'){
    width=2.8;depth=.82;height=1.05;surfaceType='table';surfaceY=1.1;
    const carcass=mat(0xb99b78,.72),front=mat(0xe4d8c7,.82),counter=mat(0xd9d2c5,.42);
    box(0,.47,0,2.72,.92,.76,carcass);box(0,.98,0,2.9,.13,.9,counter);
    // Three lower cabinet doors, two drawer banks and a recessed toe-kick.
    for(const x of [-.9,0,.9]){
     box(x,.46,.393,.82,.76,.035,front);
     for(const y of [.13,.79])box(x,y,.416,.76,.018,.012,m.oak);
     for(const dx of [-.37,.37])box(x+dx,.46,.416,.018,.68,.012,m.oak);
     cyl(x+(x<0?.27:-.27),.47,.44,.022,.022,.045,m.gold,10);
    }
    box(0,.12,.02,2.62,.18,.68,m.dark);
    box(0,.98,-.04,2.72,.025,.74,m.cream);
    for(const x of [-1.2,1.2])box(x,.46,-.395,.08,.78,.08,m.oak);
   }else if(modelName==='吊柜'){
    width=2.2;depth=.48;height=1.05;wallAxis='x';wallSide='back';anchor=[0,2.9];
    const carcass=mat(0x76543d,.68),door=mat(0xe6dac9,.78);
    box(0,0,0,2.16,1.0,.44,carcass);box(0,-.49,.22,2.22,.055,.5,m.oak);
    for(const x of [-.72,0,.72]){
     box(x,0,.235,.68,.91,.035,door);
     for(const dx of [-.3,.3])box(x+dx,0,.258,.018,.82,.012,m.oak);
     box(x,0,.258,.58,.018,.012,m.oak);
     cyl(x+(x<0?.23:-.23),-.02,.29,.018,.018,.045,m.gold,10);
    }
    for(const x of [-1.03,1.03])box(x,0,-.18,.07,.9,.08,m.wood);
   }else if(modelName==='冰箱'){
    action=()=>openKitchenPanel();width=1.02;depth=.86;height=2.2;
    const shell=mat(0xe8e4dc,.38),edge=mat(0xb9b7b0,.46),glass=mat(0x9eb6bc,.22,.12);
    box(0,1.08,0,1.02,2.16,.86,shell);box(0,2.19,0,1.04,.08,.88,edge);
    box(0,1.45,.445,.94,1.28,.035,m.cream);box(0,.52,.445,.94,.94,.035,m.cream);
    box(0,.99,.468,.94,.035,.025,edge);
    // Upper control strip and separate recessed handles.
    box(0,2.0,.47,.76,.12,.025,m.dark);for(let i=0;i<4;i++)cyl(-.24+i*.16,2.0,.492,.018,.018,.018,m.gold,10);
    for(const y of [.88,1.72]){
     box(.36,y,.49,.035,.28,.045,m.metal);
     box(.36,y,.515,.012,.2,.012,m.cream);
    }
    box(0,.05,0,.98,.08,.82,m.dark);
    for(const x of [-.39,.39])box(x,.12,.32,.09,.08,.08,edge);
   }else if(modelName==='灶台'){
    action=()=>openKitchenPanel();width=variant==='复古珐琅'?1.5:1.35;depth=.82;height=variant==='不锈钢'?1.02:.94;
    if(variant==='复古珐琅'){
     box(0,.43,0,1.5,.86,.82,m.dark);box(0,.91,0,1.56,.1,.9,m.cream);
     for(const x of [-.43,.43])for(const z of [-.23,.23]){cyl(x,.99,z,.17,.17,.06,m.dark);cyl(x,1.025,z,.105,.105,.025,m.gold)}
     for(const x of [-.58,.58])box(x,.32,.43,.16,.12,.035,m.gold);
     box(0,.18,.426,.82,.3,.035,m.clay);box(0,.18,.45,.66,.19,.018,m.dark);
    }else if(variant==='奶油陶瓷'){
     box(0,.42,0,1.35,.84,.82,m.cream);box(0,.88,0,1.42,.09,.87,m.cream);
     for(const x of [-.4,.4])for(const z of [-.23,.23]){cyl(x,.95,z,.18,.18,.06,m.gold);cyl(x,.99,z,.105,.105,.025,m.dark)}
     for(const x of [-.48,.48])cyl(x,.34,.43,.045,.045,.12,m.gold,10);
    }else{
     box(0,.47,0,1.35,.94,.82,m.dark);box(0,.99,0,1.4,.08,.86,m.metal);
     for(const x of [-.38,.38])for(const z of [-.22,.22]){cyl(x,1.05,z,.16,.16,.055,m.dark);cyl(x,1.09,z,.09,.09,.025,m.metal)}
     box(0,.22,.425,.95,.38,.035,m.metal);box(0,.22,.45,.76,.25,.018,m.dark);
    }
   }else if(modelName==='水槽'){
    action=()=>openFurnitureActions('sink',id);width=1.35;depth=.88;height=.98;
    const cabinet=mat(0xb18a61,.72),steel=mat(0xbfc5c5,.24,.48),basin=mat(0x687b80,.26,.28);
    box(0,.43,0,1.35,.86,.88,cabinet);
    box(0,.91,0,1.43,.12,.94,steel);
    // Inset sink bowl with a visible rim and sloped inner basin.
    box(0,.985,-.02,.82,.025,.58,m.metal);
    box(0,1.005,-.02,.72,.018,.46,basin);
    box(0,.96,-.29,.72,.055,.045,steel);box(0,.96,.25,.72,.055,.045,steel);
    for(const x of [-.36,.36])box(x,.96,-.02,.055,.055,.55,steel);
    // Gooseneck faucet and two separate controls.
    const tapCurve=new T.CatmullRomCurve3([new T.Vector3(0,1.02,-.31),new T.Vector3(0,1.24,-.31),new T.Vector3(0,1.43,-.18),new T.Vector3(0,1.43,.02),new T.Vector3(0,1.28,.06)]);
    group.add(new T.Mesh(new T.TubeGeometry(tapCurve,24,.027,10,false),steel));
    for(const x of [-.48,.48]){
     cyl(x,1.02,-.27,.04,.04,.07,m.gold,12);
     const lever=box(x,1.08,-.27,.13,.025,.035,steel);lever.rotation.z=x*.2;
    }
    box(0,.12,0,1.22,.16,.72,m.dark);
   }else if(modelName==='地毯'){
    width=3.7;depth=2.7;surfaceType='rug';surfaceY=.075;
    const wool=name==='羊毛地毯',bedroom=name==='卧室地毯';
    box(0,.035,0,width,.07,depth,m.fabric);
    const base=box(0,.074,0,3.48,.012,2.48,m.cream);
    box(0,.083,0,3.25,.012,2.25,m.fabric);
    for(const x of [-1.7,1.7])for(const z of [-1.2,1.2])box(x,.092,z,.14,.012,.14,m.gold);
    if(wool){
     // Thick wool pile: raised irregular tufts and short fringe make this visibly softer than the flat bedroom rug.
     const pile=mat(0xe9e1d4,.98),shade=mat(0xc8bca9,.98);
     for(let row=0;row<8;row++)for(let col=0;col<17;col++){
      const x=-1.48+col*.185+(row%2)*.045,z=-.98+row*.28;
      const tuft=sphere(x,.104,z,.075,.018,.075,(row+col)%4===0?shade:pile);
      tuft.scale.y=.55;
     }
     for(const z of [-1.28,1.28])for(let x=-1.58;x<=1.581;x+=.12){
      const fringe=box(x,.07,z,.018,.025,.14,pile);fringe.rotation.y=(Math.round(x*10)%2)*.12;
     }
     for(const x of [-1.68,1.68])for(let z=-1.15;z<=1.151;z+=.12)box(x,.07,z,.14,.025,.018,pile);
    }else if(bedroom){
     // Bedroom rug: a restrained central medallion, double inset border and corner rosettes.
     const border=mat(0xb69b78,.72),motif=mat(0x9c8064,.82);
     for(const z of [-1.13,1.13])box(0,.105,z,3.28,.018,.035,border);
     for(const x of [-1.58,1.58])box(x,.105,0,.035,.018,2.28,border);
     for(const x of [-1.42,1.42])for(const z of [-.98,.98]){
      const rosette=new T.Mesh(new T.OctahedronGeometry(.16,1),motif);rosette.position.set(x,.12,z);rosette.scale.set(1,.12,1);group.add(rosette);
      const center=sphere(x,.14,z,.045,.018,.045,m.gold);
     }
     const medallion=new T.Mesh(new T.TorusGeometry(.48,.018,8,48),border);medallion.rotation.x=Math.PI/2;medallion.position.y=.115;group.add(medallion);
     const inner=new T.Mesh(new T.TorusGeometry(.34,.012,8,48),motif);inner.rotation.x=Math.PI/2;inner.position.y=.118;group.add(inner);
     for(let i=0;i<8;i++){const a=i*Math.PI/4;const leaf=sphere(Math.cos(a)*.28,.125,Math.sin(a)*.28,.11,.012,.045,m.gold);leaf.rotation.y=-a;}
    }else if(variant==='波斯绛红'){
     for(let x=-1.25;x<=1.25;x+=.42)for(let z=-.82;z<=.82;z+=.42){const motif=new T.Mesh(new T.OctahedronGeometry(.105,0),m.gold);motif.position.set(x,.105,z);motif.scale.y=.12;group.add(motif)}
     box(0,.105,0,.08,.012,1.9,m.cream);
    }else if(variant==='奶油棋盘'){
     for(let x=-1.38;x<1.4;x+=.46)for(let z=-.92;z<.95;z+=.46)if((Math.round((x+1.38)/.46)+Math.round((z+.92)/.46))%2===0)box(x,.105,z,.44,.012,.44,m.sofa2);
    }else if(variant==='海盐蓝'){
     for(let z=-.82;z<=.82;z+=.28)box(0,.105,z,2.95,.012,.025,m.cream);
     for(const x of [-1.52,1.52])for(let z=-.9;z<=.9;z+=.3)box(x,.11,z,.055,.018,.055,m.gold);
    }
   }else if(modelName==='沙发'){
    width=2.35;depth=1.12;height=.94;action=()=>openFurnitureActions('sofa',id);
    const fabric=mat(variant==='雾蓝绒布'?0x657f94:variant==='亚麻燕麦'?0xc4ad91:variant==='暖灰羊毛'?0xaaa69d:0xe4d9c7,.96),fabricShade=mat(variant==='雾蓝绒布'?0x91a4b2:variant==='亚麻燕麦'?0xe1d3bd:variant==='暖灰羊毛'?0xd1cbc0:0xd3c5b1,.98),welt=mat(variant==='雾蓝绒布'?0x526b80:variant==='亚麻燕麦'?0xb69c7d:variant==='暖灰羊毛'?0x8d887f:0xc2b39e,.92),walnut=mat(variant==='雾蓝绒布'?0x594b43:variant==='亚麻燕麦'?0x76543a:variant==='暖灰羊毛'?0x71665a:0x67452f,.62),walnutEdge=mat(variant==='雾蓝绒布'?0x71808a:variant==='亚麻燕麦'?0x987451:variant==='暖灰羊毛'?0x938a7e:0x8a6344,.58);
    applyPainterMap(fabric,fabricMap,.026);applyPainterMap(fabricShade,fabricMap,.022);applyPainterMap(welt,fabricMap,.016);
    applyPainterMap(walnut,woodMap,.014);applyPainterMap(walnutEdge,woodMap,.012);
    const soft=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,32,22),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
    const seam=(points,r=.008,material=welt)=>{const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*3),r,8,false),material);group.add(mesh);mesh.castShadow=true};
    box(0,.27,0,2.08,.16,.82,walnut);box(0,.31,-.425,1.98,.19,.055,walnutEdge);box(0,.35,.39,1.98,.16,.06,walnut);
    for(const x of [-.62,0,.62]){soft(x,.49,-.105,.345,.145,.405,fabric);seam([[x-.29,.53,-.48],[x-.15,.55,-.49],[x,.55,-.49],[x+.15,.55,-.49],[x+.29,.53,-.48]],.009)}
    for(const x of [-.62,0,.62]){const back=soft(x,.755,.295,.34,.315,.16,fabricShade);back.rotation.x=-.13;seam([[x-.28,.73,.13],[x-.16,.72,.125],[x,.72,.12],[x+.16,.72,.125],[x+.28,.73,.13]],.007)}
    for(const x of [-1.015,1.015]){soft(x,.59,-.015,.17,.285,.49,fabric);soft(x,.855,-.045,.19,.085,.43,fabricShade);box(x,.39,.02,.055,.43,.79,walnut);seam([[x,.91,-.34],[x,.925,-.18],[x,.925,0],[x,.925,.18],[x,.91,.31]],.007)}
    for(const x of [-.86,.86])for(const z of [-.32,.32]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.25,12),walnut);leg.position.set(x,.125,z);group.add(leg);leg.castShadow=true}
    box(0,.19,-.423,1.86,.07,.035,walnutEdge);
    if(variant==='亚麻燕麦'){
     // Compact loveseat: tapered exposed legs, channel back and two broad cushions.
     box(0,.25,-.02,1.82,.12,.78,walnut);
     for(const x of [-.46,.46]){const cushion=soft(x,.49,-.09,.43,.14,.36,fabric);cushion.rotation.x=-.04}
     for(let x=-.72;x<=.721;x+=.24){const channel=box(x,.79,.405,.035,.43,.035,welt);channel.rotation.z=-.06}
     for(const x of [-.94,.94]){const arm=soft(x,.62,.02,.13,.24,.43,fabricShade);arm.rotation.z=-.08}
     width=2.2;depth=1.15;
    }else if(variant==='雾蓝绒布'){
     // L-shaped sectional: return chaise, extended base and a distinct corner back.
     box(.92,.27,.78,.78,.16,1.05,walnut);soft(.92,.49,.78,.37,.15,.48,fabric);const chaiseBack=soft(.92,.77,1.12,.37,.31,.15,fabricShade);chaiseBack.rotation.x=-.12;
     soft(1.28,.59,.76,.16,.28,.5,fabric);box(1.28,.39,.76,.055,.42,.78,walnut);width=3.05;depth=2.15;
    }else if(variant==='经典款'){
     for(const x of [-.72,-.36,0,.36,.72]){const tuft=new T.Mesh(new T.SphereGeometry(.035,8,6),gold);tuft.position.set(x,.86,.455);group.add(tuft)}
     box(0,.92,.31,1.78,.16,.13,walnut);for(const x of [-.82,.82]){const roll=soft(x,.78,.18,.18,.12,.48,fabricShade);roll.rotation.z=x<0?-.08:.08}
     width=2.35;depth=1.12;
    }else if(name==='羊毛沙发'||name==='休闲沙发'){
     const genericChildren=group.children.slice();for(const child of genericChildren)group.remove(child);
     if(name==='羊毛沙发'){
      width=2.55;depth=1.28;height=.88;
      box(0,.25,0,2.34,.2,.96,walnut);
      soft(0,.43,-.02,1.13,.17,.47,fabric);
      for(const x of [-.78,0,.78]){
       const seat=soft(x,.53,-.02,.39,.16,.43,fabricShade);
       const seamTube=new T.Mesh(new T.TorusGeometry(.31,.009,8,28),welt);
       seamTube.position.set(x,.57,-.025);seamTube.rotation.x=Math.PI/2;group.add(seamTube);
       const back=soft(x,.75,.36,.39,.28,.17,fabric);back.rotation.x=-.1;
      }
      for(const x of [-1.02,1.02]){
       soft(x,.62,-.02,.24,.31,.53,fabric);
       soft(x,.87,-.02,.24,.09,.43,fabricShade);
      }
      for(const x of [-.9,.9])for(const z of [-.38,.38]){
       const foot=new T.Mesh(new T.CylinderGeometry(.035,.045,.17,12),walnut);
       foot.position.set(x,.11,z);group.add(foot);
      }
     }else{
      width=2.3;depth=1.08;height=.98;
      box(0,.29,0,2.05,.12,.78,walnut);
      for(const x of [-.94,.94]){
       box(x,.57,-.02,.07,.64,.07,walnut);
       box(x,.83,.12,.08,.08,.5,walnut);
       box(x,.36,-.03,.07,.25,.08,walnut);
      }
      for(const x of [-.52,.52]){
       const seat=soft(x,.49,-.04,.48,.13,.36,fabric);
       const back=soft(x,.77,.27,.47,.25,.12,fabricShade);back.rotation.x=-.1;
       seam([[x-.35,.53,-.4],[x,.54,-.43],[x+.35,.53,-.4]],.008);
      }
      for(const x of [-.82,.82])for(const z of [-.29,.29]){
       const leg=new T.Mesh(new T.CylinderGeometry(.025,.035,.3,10),walnut);
       leg.position.set(x,.15,z);group.add(leg);
      }
     }
    }
    // Fine upholstery finishing: welted cushion edges, panel seams and recessed feet.
    for(const x of [-.62,0,.62]){
     const stitch=soft(x,.515,-.505,.22,.008,.012,welt);
     stitch.scale.set(.22,.012,.018);
     for(const side of [-1,1]){
      const seamLine=box(x+side*.285,.49,-.105,.012,.012,.62,welt);
      seamLine.rotation.z=side*.025;
     }
    }
    for(const x of [-1.015,1.015]){
     for(const z of [-.27,.27]){const piping=new T.Mesh(new T.TorusGeometry(.105,.009,6,24,Math.PI),welt);piping.position.set(x,.61,z);piping.rotation.z=Math.PI/2;group.add(piping)}
     box(x,.48,-.015,.018,.3,.68,walnutEdge);
    }
    for(const x of [-.86,.86])for(const z of [-.32,.32]){
     const ferrule=new T.Mesh(new T.CylinderGeometry(.054,.052,.045,16),walnutEdge);
     ferrule.position.set(x,.035,z);group.add(ferrule);
    }
   }else if(modelName==='壁画'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.5;depth=.14;height=1.18;wallAxis='x';wallSide='back';anchor=[0,1.9];
    box(0,0,0,1.52,1.18,.13,m.wood);box(0,0,.075,1.4,1.06,.035,m.gold);box(0,0,.098,1.32,.98,.018,m.cream);
    const arch=new T.Mesh(new T.CircleGeometry(.36,32,0,Math.PI),m.wall);arch.position.set(0,.17,.112);group.add(arch);box(0,-.19,.115,.72,.72,.012,m.wall);
    const stemA=new T.CatmullRomCurve3([new T.Vector3(-.22,-.34,.135),new T.Vector3(-.13,-.08,.145),new T.Vector3(-.16,.2,.14),new T.Vector3(-.32,.37,.135)]);
    const stemB=new T.CatmullRomCurve3([new T.Vector3(.1,-.36,.14),new T.Vector3(.19,-.08,.15),new T.Vector3(.12,.17,.14),new T.Vector3(.31,.35,.135)]);
    for(const curve of [stemA,stemB])group.add(new T.Mesh(new T.TubeGeometry(curve,20,.012,6,false),m.clay));
    for(const [x,y,rot] of [[-.27,-.08,-.6],[-.12,.12,.65],[-.3,.3,-.7],[.2,-.08,.65],[.14,.17,-.65],[.29,.3,.7]]){const leaf=sphere(x,y,.15,.12,.045,.018,m.leaf);leaf.rotation.z=rot}
    cyl(0,-.39,.145,.18,.18,.018,m.gold,16);
   }else if(modelName==='隔断'){
    width=2.45;depth=.34;height=2.12;
    for(let panel=0;panel<3;panel++){
     const x=(panel-1)*.82,angle=panel===1?0:(panel===0?.13:-.13);
     const part=new T.Group();part.position.set(x,0,0);part.rotation.y=angle;group.add(part);
     box(0,1.02,0,.075,2.02,.13,m.wood);box(0,1.02,.078,.72,1.78,.035,m.cream);
     for(const y of [.15,1.88])box(0,y,.105,.78,.09,.08,m.oak);
     for(let n=0;n<5;n++){const slat=box(-.27+n*.135,1.02,.105,.025,1.62,.025,n%2?m.gold:m.wood);slat.rotation.z=(n-2)*.035}
     for(const y of [.3,.58,.86,1.14,1.42,1.7])box(0,y,.12,.67,.018,.025,m.gold);
     box(0,.07,.02,.18,.14,.36,m.wood);
     if(panel<2)cyl(x+.405,1.02,.02,.035,.035,1.86,m.gold);
    }
   }else if(modelName==='棕榈树绿植'){
    width=1.05;depth=1.05;height=2.3;
    const pot=new T.Mesh(new T.CylinderGeometry(.23,.34,.48,24,1),m.clay);pot.position.y=.25;group.add(pot);
    cyl(0,.5,0,.31,.31,.055,m.gold,24);cyl(0,1.16,0,.055,.075,1.28,m.wood,14);
    for(let i=0;i<9;i++){
     const a=i*Math.PI*2/9,dx=Math.cos(a),dz=Math.sin(a);
     const curve=new T.CatmullRomCurve3([new T.Vector3(0,1.7,0),new T.Vector3(dx*.24,2.05,dz*.24),new T.Vector3(dx*.52,1.98,dz*.52),new T.Vector3(dx*.72,1.72,dz*.72)]);
     group.add(new T.Mesh(new T.TubeGeometry(curve,14,.018,6,false),m.leaf2));
     for(let n=1;n<=5;n++){const t=n/6,p=curve.getPoint(t);for(const side of [-1,1]){const leaflet=sphere(p.x-dz*side*.095,p.y-.025,p.z+dx*side*.095,.11,.025,.045,(n+i)%2?m.leaf:m.leaf2);leaflet.rotation.y=a;leaflet.rotation.z=side*.35}}
    }
    sphere(0,1.77,0,.14,.16,.14,m.leaf);
   }else if(modelName==='书架'){
    action=()=>openFurnitureActions('bookshelf',id);width=1.45;depth=.58;height=2.12;
    const open=variant==='开放格架',woodGrid=variant==='白蜡木开放格';
    const frame=variant==='深胡桃木书柜'?mat(0x503a2d,.62):woodGrid?mat(0xc4a77f,.7):m.wood;
    const shelf=woodGrid?mat(0xe0cba7,.68):variant==='深胡桃木书柜'?mat(0x74543a,.62):m.oak;
    if(open){
     for(const x of [-.65,.65])box(x,1.04,0,.075,2.08,.48,frame);
     for(const [y,w,d] of [[.16,1.34,.5],[.66,1.18,.46],[1.22,1.34,.46],[1.78,1.12,.42]])box(0,y,0,w,.065,d,shelf);
     box(0,1.02,-.225,1.26,1.92,.025,m.cream);
    }else if(woodGrid){
     box(0,1.05,-.02,1.48,2.1,.52,frame);
     box(0,1.05,.255,1.34,1.94,.035,m.cream);
     for(const y of [.16,.68,1.2,1.72,2.0])box(0,y,.015,1.42,.075,.55,shelf);
     for(const x of [-.46,0,.46])box(x,1.08,.015,.055,1.82,.52,frame);
     for(const x of [-.68,.68])box(x,1.05,0,.09,2.1,.58,frame);
    }else if(variant==='深胡桃木书柜'){
     // Vintage library cabinet: crown moulding, open upper shelves and closed lower doors.
     box(0,1.05,0,1.48,2.1,.55,frame);
     box(0,2.12,0,1.62,.12,.68,shelf);
     box(0,1.65,-.25,1.3,.82,.035,mat(0x3e2b20,.82));
     for(const y of [1.3,1.72,2.02])box(0,y,-.01,1.34,.055,.5,shelf);
     for(const x of [-.58,.58])box(x,1.58,.04,.075,1.0,.58,frame);
     box(0,.4,.29,1.4,.68,.035,frame);
     for(const x of [-.34,.34]){
      box(x,.4,.315,.64,.58,.025,shelf);
      for(const dx of [-.28,.28])box(x+dx,.4,.34,.018,.52,.018,m.oak);
      cyl(x+(x<0?.22:-.22),.4,.37,.025,.025,.05,m.gold,10);
     }
     for(const x of [-.7,.7])box(x,1.05,.02,.08,2.08,.62,frame);
    }else{
     // Glass-front display bookcase with framed double doors and a central meeting stile.
     box(0,1.05,0,1.48,2.1,.55,frame);
     box(0,.28,.29,1.38,.48,.035,shelf);
     for(const y of [.68,1.2,1.72])box(0,y,0,1.34,.055,.5,shelf);
     const glass=mat(0xc4d8d9,.14,.12);glass.transparent=true;glass.opacity=.26;
     for(const x of [-.34,.34]){
      box(x,1.38,.285,.62,1.18,.025,glass);
      for(const edge of [-.31,.31])box(x+edge,1.38,.305,.025,1.22,.045,frame);
      box(x,1.38,.305,.62,.025,.045,frame);
      cyl(x+(x<0?.24:-.24),1.34,.34,.018,.018,.05,m.gold,10);
     }
     box(0,.28,.31,1.38,.46,.035,frame);
     for(const x of [-.32,.32])cyl(x,.28,.35,.025,.025,.045,m.gold,10);
    }
    for(let level=0;level<3;level++){
     const y=.38+level*.53;
     for(let j=0;j<5;j++){
      const x=-.48+j*.22,bookH=.24+(j%3)*.07;
      const bookMat=[m.clay,m.leaf,m.gold,m.dark,m.sofa2][(j+level)%5];
      box(x,y,-.12,.13,bookH,.22,bookMat);
      box(x,y+bookH/2+.008,-.12,.105,.012,.225,m.cream);
      box(x,y,-.236,.012,bookH*.72,.012,shelf);
     }
    }
   }else if(modelName==='书桌'||modelName==='餐桌'){
    action=()=>modelName==='书桌'?openFurnitureActions('desk',id):openFurnitureActions('dining',id);
    const dining=modelName==='餐桌';width=dining?1.95:1.62;depth=dining?1.15:.88;height=dining?.82:.78;surfaceType='table';surfaceY=height+.05;
    if(dining&&variant==='浅橡木长桌'){
     box(0,.83,0,2.05,.13,1.12,m.oak);box(0,.91,0,1.98,.025,1.05,m.cream);
     for(const x of [-.82,.82])for(const z of [-.39,.39])box(x,.4,z,.12,.76,.12,m.wood);
     box(0,.38,0,1.5,.08,.08,m.wood);
     for(const x of [-.82,.82])box(x,.9,.57,.08,.08,.08,m.gold);
    }else if(dining){
     cyl(0,.4,0,.13,.2,.72,m.wood,12);cyl(0,.12,0,.62,.62,.13,m.oak,12);
     cyl(0,.82,0,.08,.08,.1,m.gold,12);cyl(0,.88,0,.62,.58,.12,m.wood,12);cyl(0,.95,0,.57,.57,.035,m.cream,12);
    }else if(variant==='白蜡木极简'){
     const top=mat(0xe0cba7,.58);box(0,.78,0,1.62,.095,.86,m.oak);box(0,.835,0,1.58,.025,.82,top);
     for(const x of [-.64,.64]){
      const legA=box(x,.4,-.29,.055,.72,.055,m.wood);legA.rotation.z=x<0?-.045:.045;
      const legB=box(x,.4,.29,.055,.72,.055,m.wood);legB.rotation.z=x<0?-.045:.045;
     }
     box(0,.67,-.31,1.3,.055,.06,m.oak);
    }else if(variant==='深胡桃木复古'){
     const walnut=mat(0x503626,.58),edge=mat(0x76543a,.56);
     box(0,.79,0,1.7,.16,.92,walnut);box(0,.88,0,1.72,.035,.94,edge);
     box(0,.58,-.32,1.42,.27,.12,walnut);
     for(const x of [-.48,0,.48]){
      box(x,.58,-.247,.42,.2,.025,edge);
      const knob=new T.Mesh(new T.SphereGeometry(.028,12,8),m.gold);knob.position.set(x,.58,-.22);group.add(knob);
     }
     for(const x of [-.68,.68])for(const z of [-.34,.34]){
      const leg=new T.Mesh(new T.CylinderGeometry(.045,.075,.68,12),walnut);leg.position.set(x,.39,z);group.add(leg);
     }
     box(0,.36,0,1.38,.07,.72,edge);
    }else{
     const carcass=mat(0xb18a61,.7),front=mat(0xd9c4a6,.72);
     box(-.43,.42,0,.58,.72,.78,carcass);
     for(let i=0;i<3;i++){
      const y=.2+i*.22;box(-.43,y,.405,.52,.19,.025,front);
      cyl(-.43,y,.445,.025,.025,.035,m.gold,10);
     }
     box(.42,.78,0,1.0,.1,.86,m.oak);box(.42,.835,0,.98,.025,.82,m.cream);
     for(const z of [-.34,.34])box(.42,.39,z,.09,.72,.09,m.wood);
     box(0,.73,-.37,.95,.1,.08,m.oak);
    }
    for(const z of [-depth/2,depth/2])box(0,height-.012,z,width*.94,.018,.018,m.oak);
   }else if(modelName==='椅子'||modelName==='餐桌椅'){
    action=()=>openFurnitureActions('chair',id);
    width=variant==='软包扶手椅'?.98:.78;depth=.82;height=1.08;
    if(variant==='藤编餐椅'){
     width=.78;depth=.82;
     const cane=mat(0xc39b6d,.96),wood=mat(0x76543d,.62),edge=mat(0x98724d,.66);
     box(0,.52,0,.74,.13,.7,wood);box(0,.59,.015,.7,.055,.66,edge);
     legs(.72,.66,.5,.055);
     // Dense crossed cane strips replace the former decorative metal-looking slats.
     for(let i=-3;i<=3;i++){const a=box(i*.085,.625,.015,.012,.012,.62,cane);a.rotation.y=.16;const b=box(0,.627,i*.085,.66,.012,.012,cane);b.rotation.y=-.12}
     for(const x of [-.32,.32]){
      const post=box(x,.88,-.31,.065,.58,.065,wood);post.rotation.z=x*.08;
      for(let y=.69;y<=1.08;y+=.075)box(x,.78+(y-.69),-.31,.075,.018,.07,edge);
     }
     const crest=new T.CatmullRomCurve3([new T.Vector3(-.35,1.12,-.31),new T.Vector3(-.25,1.18,-.31),new T.Vector3(0,1.2,-.31),new T.Vector3(.25,1.18,-.31),new T.Vector3(.35,1.12,-.31)]);
     group.add(new T.Mesh(new T.TubeGeometry(crest,24,.035,8,false),wood));
     for(let x=-.25;x<=.251;x+=.08){const strand=box(x,.88,-.31,.012,.38,.018,cane);}
    }else if(variant==='软包扶手椅'){
     width=1.02;depth=.9;height=1.12;
     const upholstery=mat(0xd8cbb8,.96),piping=mat(0xa68b6d,.78),frame=mat(0x76543d,.62);
     box(0,.49,0,.88,.18,.78,frame);box(0,.61,.015,.84,.18,.74,upholstery);
     box(0,1.0,-.31,.86,.78,.18,frame);box(0,1.0,-.205,.76,.65,.08,upholstery);
     for(const x of [-.46,.46]){
      const arm=box(x,.76,-.005,.13,.48,.76,frame);
      box(x,.91,.015,.15,.15,.72,upholstery);
      box(x,.69,.31,.15,.13,.12,piping);
     }
     for(const x of [-.34,.34])for(const z of [-.28,.28]){const leg=box(x,.23,z,.075,.46,.075,frame);leg.rotation.z=x*.045}
     for(let x=-.3;x<=.301;x+=.15){const seam=box(x,.705,.39,.012,.012,.018,piping)}
    }else{
     // Windsor-style curved crest rail, turned front legs and narrow vertical spindles.
     const wood=mat(0x805a3c,.58),edge=mat(0xa47b51,.56);
     box(0,.51,0,.66,.13,.66,m.oak);
     for(const x of [-.25,.25])for(const z of [-.24,.24]){const leg=cyl(x,.3,z,.038,.052,.58,wood,12);sphere(x,.56,z,.065,.045,.065,edge)}
     for(const z of [-.23,.23])box(0,.32,z,.54,.045,.045,wood);
     for(let x=-.25;x<=.251;x+=.125){const spindle=cyl(x,.83,-.29,.022,.022,.48,wood,10);sphere(x,.63,-.29,.038,.035,.038,edge)}
     const crest=new T.CatmullRomCurve3([new T.Vector3(-.34,1.08,-.29),new T.Vector3(-.3,1.17,-.29),new T.Vector3(-.15,1.21,-.29),new T.Vector3(0,1.22,-.29),new T.Vector3(.15,1.21,-.29),new T.Vector3(.3,1.17,-.29),new T.Vector3(.34,1.08,-.29)]);
     group.add(new T.Mesh(new T.TubeGeometry(crest,28,.045,10,false),wood));
     for(const x of [-.32,.32]){const post=box(x,.78,-.29,.065,.58,.065,wood);post.rotation.z=x*.08}
     for(const x of [-.3,.3]){const arm=box(x,.7,-.01,.075,.07,.58,wood);arm.rotation.z=x*.06}
    }
   }else if(modelName==='电脑'){
    action=()=>openFurnitureActions('computer',id);
    width=.72;depth=.55;height=.72;surfaceType='tabletop';surfaceY=.04;
    // Desktop monitor with a sculpted bezel, webcam, stand, keyboard keycaps and mouse.
    box(0,.48,-.16,.76,.49,.065,m.dark);box(0,.49,-.122,.704,.425,.012,m.screen);
    box(0,.49,-.113,.68,.395,.006,mat(0x718f9b,.34));
    box(0,.275,-.16,.075,.12,.09,m.metal);box(0,.205,-.16,.34,.035,.22,m.metal);
    sphere(0,.716,-.113,.018,.018,.012,m.gold);
    box(0,.07,.15,.68,.045,.23,m.dark);box(0,.096,.15,.6,.012,.17,m.cream);
    for(let row=0;row<4;row++)for(let col=0;col<13;col++){const key=box(-.265+col*.044,.108,.085+row*.043,.032,.012,.028,row===0?m.metal:m.oak);key.position.y=.108+((row+col)%5)*.001}
    const mouse=sphere(.43,.105,.16,.055,.025,.085,m.dark);mouse.rotation.y=-.18;
    for(const x of [-.43,.43]){box(x,.2,-.14,.085,.22,.12,m.wood);box(x,.2,-.072,.045,.12,.012,m.dark);cyl(x,.2,-.06,.018,.018,.012,m.gold,10)}
    box(0,.74,-.12,.16,.018,.012,m.gold);
   }else if(modelName==='电视'){
    action=()=>openFurnitureActions('television',id);width=1.62;depth=.58;height=1.42;surfaceType='floor';surfaceY=.04;
    box(0,.32,0,1.55,.58,.52,m.wood);box(0,.64,-.015,1.48,.045,.49,m.oak);box(0,.68,-.015,1.42,.025,.45,m.cream);
    for(const x of [-.57,.57])box(x,.075,.12,.09,.15,.1,m.dark);
    // Rounded, layered television housing with a recessed glass panel and a separate soundbar.
    box(0,1.2,-.12,1.48,.92,.095,m.dark);
    box(0,1.2,-.174,1.405,.845,.018,m.metal);
    box(0,1.2,-.186,1.375,.815,.012,m.screen);
    const tvGlow=box(0,1.2,-.194,1.31,.75,.004,mat(0x66899a,.3));tvGlow.material.emissive=new T.Color(0x1d3542);tvGlow.material.emissiveIntensity=.16;
    for(const x of [-.68,.68]){box(x,1.2,-.197,.012,.78,.008,m.cream)}
    box(0,.735,-.12,.12,.18,.09,m.metal);box(0,.66,-.12,.48,.045,.2,m.metal);
    box(0,.78,.32,.72,.075,.11,m.dark);for(let i=0;i<18;i++)box(-.31+i*.036,.78,.379,.012,.026,.006,m.metal);
    sphere(.66,.77,-.195,.012,.012,.008,m.gold);
   }else if(modelName==='唱片机'){
    action=()=>openFurnitureActions('recordPlayer',id);width=.92;depth=.78;height=.92;surfaceType='floor';surfaceY=.04;
    box(0,.48,0,.88,.2,.72,m.wood);box(0,.59,-.01,.9,.055,.74,m.oak);
    for(const x of [-.34,.34])for(const z of [-.25,.25])box(x,.13,z,.065,.24,.065,m.dark);
    cyl(0,.64,-.035,.27,.27,.045,m.metal,32);cyl(0,.672,-.035,.235,.235,.018,m.dark,40);
    for(let r=.07;r<.22;r+=.035){const groove=new T.Mesh(new T.TorusGeometry(r,.003,4,48),m.metal);groove.rotation.x=Math.PI/2;groove.position.set(0,.684,-.035);group.add(groove)}
    cyl(0,.686,-.035,.035,.035,.012,m.gold,20);
    const arm=box(.22,.71,-.02,.025,.025,.34,m.metal);arm.rotation.x=-.08;arm.rotation.y=-.24;
    sphere(.22,.72,-.19,.035,.025,.035,m.gold);
    box(0,.79,.27,.72,.025,.08,m.cream);
   }else if(modelName==='捧花摆件'){
    action=()=>openFurnitureActions('bouquet',id);
    width=.42;depth=.42;height=.72;surfaceType='floor';surfaceY=.04;
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.11,0),new T.Vector2(.17,.08),new T.Vector2(.2,.28),new T.Vector2(.13,.42),new T.Vector2(.085,.48)],18),m.clay);vase.position.y=.08;group.add(vase);
    cyl(0,.56,0,.11,.11,.035,m.gold,16);
    for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,x=Math.cos(angle),z=Math.sin(angle),stem=new T.CatmullRomCurve3([new T.Vector3(x*.035,.55,z*.035),new T.Vector3(x*.07,.75,z*.07),new T.Vector3(x*.14,.91+(i%2)*.05,z*.14)]);group.add(new T.Mesh(new T.TubeGeometry(stem,12,.012,6,false),m.leaf));const flower=new T.Group();flower.position.set(x*.14,.91+(i%2)*.05,z*.14);group.add(flower);for(let petal=0;petal<6;petal++){const a=petal*Math.PI/3,p=sphere(Math.cos(a)*.065,0,Math.sin(a)*.065,.06,.075,.045,[m.cream,m.clay,m.gold][i%3]);p.position.add(flower.position)}sphere(flower.position.x,flower.position.y+.015,flower.position.z,.035,.035,.035,m.gold,12)}

   }else if(modelName==='茶几'){
    width=variant==='圆形浅橡木'?1.12:1.42;depth=variant==='圆形浅橡木'?1.12:.88;height=.48;surfaceType='table';surfaceY=.52;
    if(variant==='圆形浅橡木'){cyl(0,.43,0,.56,.56,.1,m.oak,40);cyl(0,.22,0,.12,.16,.42,m.wood,20);cyl(0,.06,0,.42,.42,.08,m.oak,32)}
    else if(variant==='米白石材'){box(0,.43,0,1.44,.11,.9,mat(0xe5dfd4,.34));for(const x of [-.54,.54])for(const z of [-.3,.3])box(x,.21,z,.075,.42,.075,m.dark)}
    else{box(0,.4,0,1.42,.12,.86,m.wood);box(0,.47,0,1.38,.035,.82,m.oak);for(const x of [-.58,.58])for(const z of [-.32,.32])box(x,.2,z,.075,.38,.075,m.wood);for(const x of [-.36,.36]){box(x,.27,.44,.48,.19,.035,m.oak);cyl(x,.27,.47,.025,.025,.045,m.gold,10)}}
   }else if(modelName==='边桌'){
    width=.72;depth=.72;height=.68;surfaceType='table';surfaceY=.7;
    if(variant==='黄铜圆桌'){
     const brass=mat(0xb58c54,.32,.78),dark=mat(0x6c5946,.48,.55);
     cyl(0,.64,0,.34,.34,.075,brass,40);
     const inset=new T.Mesh(new T.TorusGeometry(.285,.012,8,48),dark);inset.rotation.x=Math.PI/2;inset.position.y=.682;group.add(inset);
     cyl(0,.34,0,.055,.075,.52,brass,24);
     for(let i=0;i<12;i++){const a=i*Math.PI/6,flute=box(Math.cos(a)*.047,.36,Math.sin(a)*.047,.012,.34,.012,dark);flute.rotation.y=-a}
     cyl(0,.07,0,.255,.255,.07,brass,32);
     const foot=new T.Mesh(new T.TorusGeometry(.22,.018,8,36),dark);foot.rotation.x=Math.PI/2;foot.position.y=.105;group.add(foot);
     for(let i=0;i<3;i++){const a=i*Math.PI*2/3;cyl(Math.cos(a)*.18,.035,Math.sin(a)*.18,.035,.035,.045,m.dark,12)}
    }else{
     const walnut=mat(0x62442f,.62),edge=mat(0x9a704b,.58),brass=mat(0xb28b58,.34,.65);
     box(0,.62,0,.72,.085,.72,walnut);box(0,.672,0,.68,.018,.68,edge);
     box(0,.42,.366,.52,.24,.025,edge);box(0,.42,.385,.46,.18,.018,walnut);
     for(const x of [-.13,.13])cyl(x,.42,.405,.018,.018,.035,brass,12);
     for(const x of [-.27,.27])for(const z of [-.27,.27]){
      const leg=new T.Mesh(new T.CylinderGeometry(.035,.055,.49,12),walnut);leg.position.set(x,.29,z);leg.rotation.z=-x*.12;leg.rotation.x=z*.12;group.add(leg);
     }
     box(0,.18,0,.58,.045,.58,edge);
     for(const x of [-.24,.24])for(const z of [-.24,.24])cyl(x,.045,z,.035,.035,.045,m.dark,10);
    }
   }else if(modelName==='电视柜'){
    width=2.15;depth=.58;height=.72;surfaceType='table';surfaceY=.78;
    box(0,.38,0,2.12,.68,.56,m.oak);box(0,.75,0,2.2,.09,.62,m.cream);
    for(const x of [-.72,0,.72]){box(x,.39,.29,.66,.56,.035,m.wood);box(x,.39,.315,.59,.48,.018,m.sofa2);for(const y of [.2,.56])box(x,y,.33,.5,.015,.012,m.cream)}
    for(const x of [-.93,.93])box(x,.08,-.18,.09,.16,.09,m.dark);
    // Cabinet door reveals, drawer-like central bay and continuous shadow gaps.
    for(const x of [-.72,0,.72]){
     box(x,.39,.322,.018,.49,.012,m.wood);
     const knob=new T.Mesh(new T.SphereGeometry(.028,12,8),m.gold);
     knob.position.set(x+(x===0?-.22:.22),.4,.345);group.add(knob);
    }
    for(const x of [-.93,.93])for(const z of [-.19,.19]){
     const foot=new T.Mesh(new T.CylinderGeometry(.045,.055,.18,12),m.wood);
     foot.position.set(x,.09,z);group.add(foot);
    }
   }else if(modelName==='斗柜'){
    const cream=variant==='奶油三抽';width=1.28;depth=.68;height=1.18;
    const body=cream?mat(0xe4d8c7,.82):mat(0x60432f,.62),front=cream?mat(0xf0e8dc,.9):mat(0x806044,.64),edge=mat(cream?0xbca88e:0x3d2d23,.68),brass=mat(0xb58d56,.35,.68);
    box(0,.57,0,1.22,1.08,.61,body);
    box(0,1.13,0,1.32,.1,.69,front);
    for(const x of [-.57,.57])box(x,.59,.32,.055,.95,.055,edge);
    const count=cream?3:4,drawerH=cream?.27:.205,spacing=cream?.31:.235;
    for(let i=0;i<count;i++){
     const y=.19+i*spacing;
     box(0,y,.323,1.08,drawerH,.055,edge);
     box(0,y,.357,1.015,drawerH-.045,.025,front);
     box(0,y+drawerH*.36,.374,.92,.012,.012,edge);
     if(cream){
      for(const x of [-.32,.32]){const pull=new T.Mesh(new T.TorusGeometry(.025,.009,6,16),brass);pull.position.set(x,y,.39);group.add(pull)}
     }else{
      for(const x of [-.31,.31]){cyl(x,y,.39,.024,.024,.045,brass,12);box(x,y,.414,.065,.018,.018,brass)}
     }
    }
    box(0,1.2,0,1.3,.035,.67,edge);
    for(const x of [-.48,.48])for(const z of [-.23,.23]){
     const foot=new T.Mesh(new T.CylinderGeometry(.045,.065,.17,12),body);foot.position.set(x,.085,z);foot.rotation.z=-x*.08;group.add(foot);
    }
    for(const x of [-.59,.59])box(x,.59,-.12,.035,.9,.035,front);
   }else if(modelName==='梳妆台'){
    width=1.42;depth=.68;height=1.62;surfaceType='table';surfaceY=.9;
    if(name==='复古妆台'){
     const walnut=mat(0x563b2b,.58),trim=mat(0x94704b,.52),ivory=mat(0xe6d7c2,.78);
     box(0,.86,0,1.48,.12,.66,walnut);box(0,.92,0,1.5,.035,.68,trim);
     // Three shallow drawers, a shaped apron and cabriole-style legs give the vintage vanity its own silhouette.
     for(const x of [-.45,0,.45]){box(x,.68,.34,.4,.23,.045,ivory);box(x,.68,.37,.36,.19,.018,walnut);cyl(x,.68,.405,.025,.025,.045,m.gold,12)}
     const apron=box(0,.48,.04,1.12,.18,.48,walnut);
     for(const x of [-.58,.58])for(const z of [-.22,.22]){
      const leg=box(x,.25,z,.075,.48,.075,walnut);leg.rotation.z=x<0?-.12:.12;
      sphere(x*1.08,.48,z,.075,.055,.075,trim);
     }
     box(0,1.18,-.22,.14,.5,.1,walnut);
     const frame=new T.Mesh(new T.SphereGeometry(.39,28,20),trim);frame.position.set(0,1.65,-.2);frame.scale.set(1,.82,.12);group.add(frame);
     const glass=new T.Mesh(new T.SphereGeometry(.34,28,20),mat(0x9eafb0,.2,.16));glass.position.set(0,1.65,-.185);glass.scale.set(1,.82,.1);group.add(glass);
     for(const x of [-.3,.3])sphere(x,1.98,-.18,.045,.07,.045,m.gold);
     sphere(0,2.02,-.18,.075,.075,.045,m.gold);
     width=1.55;height=2.12;
    }else{
     const top=mat(0xd9c7ae,.62),body=mat(0xe8ddcc,.8);
     box(0,.84,0,1.38,.1,.62,top);
     box(0,.66,.25,.76,.24,.035,body);box(0,.66,.28,.68,.19,.018,m.cream);
     cyl(0,.66,.31,.025,.025,.045,m.gold,12);
     for(const x of [-.56,.56]){
      const leg=box(x,.4,0,.075,.72,.075,m.wood);leg.rotation.z=x*.045;
      box(x,.4,.28,.16,.28,.035,body);
     }
     box(0,1.4,-.23,.08,.92,.08,m.wood);
     const mirrorFrame=new T.Mesh(new T.SphereGeometry(.32,28,20),m.oak);mirrorFrame.position.set(0,1.62,-.23);mirrorFrame.scale.set(1,.82,.13);group.add(mirrorFrame);
     const mirror=new T.Mesh(new T.SphereGeometry(.28,28,20),mat(0x9eafb0,.2,.16));mirror.position.set(0,1.62,-.205);mirror.scale.set(1,.82,.1);group.add(mirror);
    }
   }else if(modelName==='全身镜'){
    width=.92;depth=.3;height=2.12;
    const frame=mat(variant==='黄铜拱形'?0xb89a62:0x77563d,.42,variant==='黄铜拱形'?.62:.08);
    const rear=mat(0x493b32,.72);
    // Extruded arched frame and a shader-backed reflective face, rather than a flat grey panel.
    const outer=new T.Shape();outer.moveTo(-.42,-.91);outer.lineTo(-.42,.48);outer.quadraticCurveTo(-.42,.98,0,.98);outer.quadraticCurveTo(.42,.98,.42,.48);outer.lineTo(.42,-.91);outer.closePath();
    const frameGeo=new T.ExtrudeGeometry(outer,{depth:.12,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:28});frameGeo.translate(0,1.05,0);
    const frameMesh=new T.Mesh(frameGeo,frame);frameMesh.castShadow=true;frameMesh.receiveShadow=true;group.add(frameMesh);
    const inner=new T.Shape();inner.moveTo(-.345,-.82);inner.lineTo(-.345,.47);inner.quadraticCurveTo(-.345,.84,0,.84);inner.quadraticCurveTo(.345,.84,.345,.47);inner.lineTo(.345,-.82);inner.closePath();
    const mirrorMat=new T.ShaderMaterial({
     uniforms:{edgeTint:{value:new T.Color(0x53636a)},silverTint:{value:new T.Color(0xd9e1e1)}},
     vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
     fragmentShader:`uniform vec3 edgeTint;uniform vec3 silverTint;varying vec2 vUv;
      void main(){float edge=pow(abs(vUv.x-.5)*2.0,2.2);float sweep=exp(-pow((vUv.x-.28)*8.0,2.0))*.18;float vertical=.34+.32*vUv.y;vec3 reflection=mix(edgeTint,silverTint,vertical);reflection=mix(reflection,vec3(.96,.97,.94),sweep);reflection=mix(reflection,edgeTint,edge*.28);gl_FragColor=vec4(reflection,1.0);}`,
     side:T.DoubleSide,toneMapped:false
    });
    const mirror=new T.Mesh(new T.ShapeGeometry(inner,32),mirrorMat);mirror.position.set(0,1.05,.135);group.add(mirror);
    const innerLine=new T.CatmullRomCurve3([new T.Vector3(-.35,.23,.145),new T.Vector3(-.35,1.48,.145),new T.Vector3(-.34,1.68,.145),new T.Vector3(0,1.82,.145),new T.Vector3(.34,1.68,.145),new T.Vector3(.35,1.48,.145),new T.Vector3(.35,.23,.145)]);group.add(new T.Mesh(new T.TubeGeometry(innerLine,42,.008,6,false),mat(0xd3bd91,.38,.55)));
    box(0,.09,.02,.96,.14,.38,rear);
    for(const side of [-1,1]){const foot=new T.Mesh(new T.CylinderGeometry(.045,.07,.28,12),frame);foot.position.set(side*.31,.16,-.02);foot.rotation.z=side*.08;group.add(foot)}
    const support=box(0,.62,-.13,.055,1.1,.055,rear);support.rotation.x=-.2;
    for(const y of [.34,1.72])for(const side of [-1,1])cyl(side*.405,y,.145,.018,.018,.025,m.gold,10);
   }else if(modelName==='餐边柜'){
    width=1.92;depth=.64;height=1.22;surfaceType='table';surfaceY=1.26;
    const carcass=mat(0x76543d,.66),front=mat(0xc5a47e,.72),dark=mat(0x47372d,.78),brass=mat(0xb58d56,.34,.68),stone=mat(0xe5ded1,.42);
    box(0,.58,0,1.86,1.08,.6,carcass);
    box(0,1.16,0,1.98,.1,.68,stone);
    box(0,1.105,0,1.9,.035,.64,front);
    // Two paneled cupboards flank an open central display bay.
    for(const x of [-.62,.62]){
     box(x,.58,.315,.56,.88,.045,front);
     box(x,.58,.344,.47,.76,.018,carcass);
     box(x,.58,.357,.42,.7,.012,front);
     for(const y of [.25,.9])box(x,y,.37,.38,.012,.012,brass);
     cyl(x+(x<0?.17:-.17),.58,.39,.024,.024,.04,brass,12);
     for(const z of [-.2,.2]){const foot=new T.CylinderGeometry(.035,.05,.16,10);const f=new T.Mesh(foot,carcass);f.position.set(x,.08,z);group.add(f)}
    }
    box(0,.36,.28,.58,.035,.12,dark);box(0,.75,.28,.58,.035,.12,dark);
    for(const y of [.44,.83]){
     box(0,y,.16,.55,.025,.25,front);
     for(let k=0;k<3;k++){const bottle=cyl(-.17+k*.17,y+.11,.2,.035,.035,.19,k===1?m.leaf:m.clay,12);cyl(-.17+k*.17,y+.22,.2,.022,.022,.045,brass,10)}
    }
    box(0,1.22,.34,.48,.035,.025,brass);
    for(const x of [-.88,.88])for(const z of [-.22,.22]){const foot=new T.CylinderGeometry(.04,.055,.17,10);const f=new T.Mesh(foot,carcass);f.position.set(x,.085,z);group.add(f)}
   }else if(modelName==='阅读椅'){
    width=1.08;depth=1.02;height=1.24;action=()=>openFurnitureActions('chair',id);
    const timber=mat(0x76543d,.58),upholstery=mat(0xd8cbb8,.96),shade=mat(0xbcae9e,.98),piping=mat(0x9b8068,.82);
    applyPainterMap(upholstery,fabricMap,.024);applyPainterMap(shade,fabricMap,.022);
    // A deep wingback reading chair with a sprung seat, rolled arms and a tall enveloping back.
    box(0,.35,0,.96,.18,.88,timber);
    const seat=sphere(0,.57,.04,.49,.17,.43,upholstery,28);seat.scale.y=.78;
    const seatTop=sphere(0,.65,.055,.445,.09,.385,shade,28);
    const back=sphere(0,1.02,-.34,.47,.56,.15,upholstery,28);back.rotation.x=-.12;
    const innerBack=sphere(0,1.03,-.235,.365,.43,.055,shade,24);innerBack.rotation.x=-.12;
    for(const side of [-1,1]){
     const wing=sphere(side*.405,1.02,-.27,.105,.48,.18,upholstery,20);wing.rotation.z=-side*.13;
     const armBase=box(side*.43,.68,-.005,.16,.17,.68,timber);armBase.rotation.x=-.06;
     const arm=sphere(side*.43,.81,.015,.115,.105,.36,upholstery,20);arm.rotation.x=-.05;
     const armEdge=new T.CatmullRomCurve3([new T.Vector3(side*.43,.86,-.29),new T.Vector3(side*.43,.89,-.12),new T.Vector3(side*.43,.89,.12),new T.Vector3(side*.43,.84,.31)]);
     group.add(new T.Mesh(new T.TubeGeometry(armEdge,20,.012,7,false),piping));
     for(const z of [-.28,.28]){const leg=new T.Mesh(new T.CylinderGeometry(.035,.052,.42,12),timber);leg.position.set(side*.39,.2,z);leg.rotation.z=-side*.08;group.add(leg)}
    }
    const backSeam=new T.CatmullRomCurve3([new T.Vector3(-.34,.72,-.21),new T.Vector3(-.37,1.02,-.19),new T.Vector3(-.3,1.35,-.2),new T.Vector3(0,1.48,-.2),new T.Vector3(.3,1.35,-.2),new T.Vector3(.37,1.02,-.19),new T.Vector3(.34,.72,-.21)]);
    group.add(new T.Mesh(new T.TubeGeometry(backSeam,42,.009,6,false),piping));
    for(const x of [-.16,0,.16])for(const y of [.91,1.12])sphere(x,y,-.177,.018,.018,.012,m.gold,10);
    const frontSeam=new T.CatmullRomCurve3([new T.Vector3(-.37,.67,.37),new T.Vector3(-.2,.7,.42),new T.Vector3(0,.7,.43),new T.Vector3(.2,.7,.42),new T.Vector3(.37,.67,.37)]);
    group.add(new T.Mesh(new T.TubeGeometry(frontSeam,24,.009,6,false),piping));
    for(const z of [-.27,.27]){const rail=box(0,.18,z,.78,.06,.055,timber)}
    for(const side of [-1,1]){const brace=box(side*.4,.2,0,.045,.06,.5,timber);brace.rotation.z=side*.08}
   }else if(modelName==='花瓶'){
    width=.5;depth=.5;height=.88;surfaceType='tabletop';surfaceY=.04;
    const ceramic=mat(0xc58d70,.3),lip=mat(0xe2bda0,.28),inside=mat(0x805d4b,.82);
    const vase=new T.Mesh(new T.LatheGeometry([new T.Vector2(.12,0),new T.Vector2(.16,.06),new T.Vector2(.23,.2),new T.Vector2(.25,.36),new T.Vector2(.19,.52),new T.Vector2(.105,.66),new T.Vector2(.11,.72)],32),ceramic);vase.position.y=.08;group.add(vase);
    cyl(0,.805,0,.115,.115,.025,lip,32);
    for(let rib=0;rib<12;rib++){const a=rib*Math.PI*2/12,curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.16,.19,Math.sin(a)*.16),new T.Vector3(Math.cos(a)*.23,.39,Math.sin(a)*.23),new T.Vector3(Math.cos(a)*.15,.61,Math.sin(a)*.15)]);group.add(new T.Mesh(new T.TubeGeometry(curve,12,.006,5,false),lip))}
    for(let i=0;i<5;i++){const a=i*1.25,curve=new T.CatmullRomCurve3([new T.Vector3(0,.76,0),new T.Vector3(Math.cos(a)*.12,.95,Math.sin(a)*.12),new T.Vector3(Math.cos(a)*.22,1.12+(i%2)*.08,Math.sin(a)*.22)]);group.add(new T.Mesh(new T.TubeGeometry(curve,14,.012,6,false),m.leaf));for(let n=0;n<3;n++){const p=curve.getPoint(.45+n*.15);const leaf=sphere(p.x,p.y,p.z,.09,.025,.035,n%2?m.leaf:m.leaf2);leaf.rotation.y=a}}
   }else if(modelName==='挂钟'){
    width=.58;depth=.16;height=.68;wallAxis='x';wallSide='back';anchor=[0,2.0];
    const clockBody=cyl(0,0,.02,.29,.29,.07,m.wood,40);clockBody.rotation.x=Math.PI/2;const clockFace=cyl(0,0,.07,.245,.245,.018,m.cream,40);clockFace.rotation.x=Math.PI/2;
    cyl(0,0,.09,.012,.012,.02,m.gold,16);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const dot=sphere(Math.sin(a)*.19,Math.cos(a)*.19,.105,.012,.012,.012,m.dark)}
    const hand=box(.04,.055,.11,.012,.13,.008,m.dark);hand.rotation.z=-.35;
   }else if(modelName==='窗帘'){
    width=2.7;depth=.3;height=2.6;wallAxis='x';wallSide='back';anchor=[0,2.8];
    const cloth=mat(0xc9b9a5,.98),shade=mat(0xb5a18b,.98),rodMat=mat(0x92734f,.52,.62);
    const rod=cyl(0,1.22,0,.035,.035,2.82,rodMat,16);rod.rotation.z=Math.PI/2;
    for(const x of [-1.2,1.2]){
     box(x,1.18,0,.08,2.35,.16,m.wood);
     sphere(x,2.36,0,.075,.075,.075,m.gold);
    }
    for(let i=0;i<18;i++){
     const x=-1.25+i*.147,depthWave=Math.sin(i*.72);
     const fold=box(x,1.12,.015+depthWave*.018,.14,2.2,.075,i%3===0?shade:cloth);
     fold.rotation.z=Math.sin(i*.6)*.018;
     cyl(x,2.28,.02,.027,.027,.045,m.gold,8);
    }
    // Both panels gather toward the sides with visible tiebacks and hanging folds.
    for(const side of [-1,1]){
     const gather=side*1.02;
     const tie=box(gather,1.02,.105,.38,.075,.08,m.gold);tie.rotation.z=side*.08;
     for(let k=0;k<3;k++){
      const x=gather+side*(k*.055);
      const drape=box(x,.82,.055,.11,.72,.07,k%2?cloth:shade);
      drape.rotation.z=side*(.06+k*.025);
     }
     const tassel=new T.Mesh(new T.ConeGeometry(.045,.16,10),m.gold);
     tassel.position.set(gather, .91,.15);group.add(tassel);
    }
    box(0,2.34,-.015,2.5,.035,.045,m.wood);
   }else if(modelName==='办公椅'){
    width=.78;depth=.82;height=1.28;
    const frame=mat(0x454b50,.46,.72),mesh=mat(0x30383d,.96),fabric=mat(0x252b30,.98),trim=mat(0x68747a,.5,.5);
    // Five-spoke aluminium base, central gas lift and individual caster housings.
    cyl(0,.38,0,.055,.055,.48,frame,20);cyl(0,.16,0,.105,.105,.09,frame,20);
    for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5,x=Math.cos(a),z=Math.sin(a);
     const spoke=box(x*.23,.12,z*.23,.52,.045,.065,frame);spoke.rotation.y=-a;
     const fork=box(x*.46,.105,z*.46,.07,.09,.075,frame);
     const wheel=cyl(x*.49,.075,z*.49,.052,.052,.12,mesh,14);wheel.rotation.x=Math.PI/2;
    }
    // Separate seat pan, rounded cushion and adjustable arm supports.
    box(0,.57,.025,.68,.14,.66,frame);
    const cushion=new T.Mesh(new T.CapsuleGeometry(.29,.09,5,12),fabric);cushion.rotation.x=Math.PI/2;cushion.position.set(0,.67,.035);cushion.scale.set(1,.9,1);group.add(cushion);
    box(0,.75,-.245,.12,.12,.12,frame);
    for(const x of [-.37,.37]){
     box(x,.79,-.015,.065,.38,.065,frame);
     box(x,.98,.02,.1,.07,.34,mesh);
     box(x,.82,.025,.13,.045,.34,trim);
    }
    // Open mesh back with a visible perimeter frame, lumbar arc and headrest.
    for(const x of [-.29,.29]){const rail=box(x,1.04,-.28,.045,.62,.055,frame);rail.rotation.x=-.08}
    box(0,1.32,-.28,.58,.045,.055,frame);box(0,.76,-.25,.58,.045,.055,frame);
    for(let row=0;row<9;row++)for(let col=0;col<13;col++){
     const x=-.25+col*.041,y=.81+row*.058;
     if((row+col)%2===0)box(x,y,-.252,.012,.012,.012,mesh);
    }
    const lumbar=new T.CatmullRomCurve3([new T.Vector3(-.24,.91,-.29),new T.Vector3(-.12,.86,-.31),new T.Vector3(0,.85,-.32),new T.Vector3(.12,.86,-.31),new T.Vector3(.24,.91,-.29)]);
    group.add(new T.Mesh(new T.TubeGeometry(lumbar,20,.025,8,false),trim));
    box(0,1.43,-.27,.34,.16,.1,fabric);box(0,1.43,-.32,.3,.11,.035,mesh);
   }else if(modelName==='坐垫'){
    action=()=>openFurnitureActions('cushion',id);
    width=.82;depth=.82;height=.2;surfaceType='floor';
    const textile=mat(0xb9a1a0,.98),shadow=mat(0x97847f,.98),piping=mat(0xeee1cf,.92);
    applyPainterMap(textile,fabricMap,.03);applyPainterMap(shadow,fabricMap,.025);
    // Soft, overfilled cushion with rounded loft, double piping and four corner gathers.
    const base=sphere(0,.105,0,.405,.105,.405,shadow,28);base.scale.y=.72;
    const crown=sphere(0,.17,0,.39,.115,.39,textile,32);crown.scale.y=.82;
    const seam=new T.CatmullRomCurve3([
     new T.Vector3(-.31,.19,-.29),new T.Vector3(-.37,.21,0),new T.Vector3(-.29,.19,.31),
     new T.Vector3(0,.2,.37),new T.Vector3(.31,.19,.29),new T.Vector3(.37,.21,0),
     new T.Vector3(.29,.19,-.31),new T.Vector3(0,.2,-.37),new T.Vector3(-.31,.19,-.29)
    ]);
    group.add(new T.Mesh(new T.TubeGeometry(seam,64,.009,7,false),piping));
    for(const x of [-.28,.28])for(const z of [-.28,.28]){
     const gather=sphere(x,.16,z,.065,.045,.065,shadow,14);gather.rotation.y=Math.atan2(z,x);
     sphere(x*.82,.235,z*.82,.018,.012,.018,piping,10);
    }
    sphere(0,.265,0,.022,.012,.022,piping,10);
   }else if(modelName==='伞架'){
    width=.62;depth=.62;height=1.12;
    const vessel=mat(0x555b60,.38,.42),rim=mat(0x9a805f,.48,.58);
    cyl(0,.09,0,.29,.31,.17,vessel,28);
    cyl(0,.17,0,.3,.3,.045,rim,28);
    const body=cyl(0,.56,0,.22,.25,.72,vessel,28);
    cyl(0,.94,0,.25,.25,.075,rim,28);
    // Three umbrellas are visible above the stand, with differentiated canopy colours and curved handles.
    for(let i=0;i<3;i++){
     const a=i*Math.PI*2/3,x=Math.cos(a)*.11,z=Math.sin(a)*.11;
     const shaft=cyl(x,.95,z,.018,.018,.88,i===1?m.gold:m.wood,10);
     const canopy=new T.Mesh(new T.ConeGeometry(.18,.2,18,1,true),i===0?m.fabric:i===1?m.clay:m.leaf);
     canopy.position.set(x,.99,z);canopy.rotation.x=Math.PI;group.add(canopy);
     const tip=sphere(x,1.09,z,.035,.035,.035,m.gold);
     const handleCurve=new T.CatmullRomCurve3([
      new T.Vector3(x,.5,z),new T.Vector3(x,.38,z),new T.Vector3(x+.055,.34,z),new T.Vector3(x+.09,.4,z)
     ]);
     group.add(new T.Mesh(new T.TubeGeometry(handleCurve,12,.018,8,false),m.wood));
    }
   }else if(modelName==='展示柜'){
    width=1.55;depth=.62;height=2.05;surfaceType='table';surfaceY=2.08;
    const wood=mat(0x76543d,.62),glass=mat(0xc9dadd,.12,.12);glass.transparent=true;glass.opacity=.2;
    box(0,1.02,0,1.5,2.0,.56,wood);
    for(const y of [.12,.65,1.2,1.75,2.0])box(0,y,0,1.42,.055,.52,m.oak);
    for(const x of [-.72,.72])box(x,1.02,0,.08,2.0,.58,wood);
    // Framed glazed doors with a central meeting stile and discreet pulls.
    for(const x of [-.35,.35]){
     box(x,1.08,.29,.66,1.7,.018,glass);
     for(const dx of [-.32,.32])box(x+dx,1.08,.315,.025,1.76,.045,wood);
     for(const y of [.2,1.96])box(x,y,.315,.66,.025,.045,wood);
     cyl(x+(x<0?.25:-.25),1.05,.35,.018,.018,.045,m.gold,10);
    }
    box(0,1.08,.32,.035,1.72,.045,m.gold);
    for(let i=0;i<8;i++){
     const x=-.54+(i%4)*.36,y=.35+Math.floor(i/4)*.55;
     const ornament=sphere(x,y,.02,.09,.11,.07,i%2?m.clay:m.cream);
    }
   }else if(modelName==='躺椅'){
    width=1.05;depth=1.9;height=.95;action=()=>openFurnitureActions('sofa',id);
    const frame=mat(0x76543a,.62),canvas=mat(0xc5b49d,.94);
    for(const x of [-.43,.43]){
     const rail=box(x,.32,0,.065,.55,1.7,frame);
     const frontLeg=box(x,.16,.72,.07,.32,.07,frame);
     const rearLeg=box(x,.16,-.72,.07,.32,.07,frame);
     for(const z of [-.64,-.3,.08,.46])box(x,.56,z,.07,.055,.055,m.oak);
    }
    const seat=box(0,.58,.22,.82,.1,1.16,canvas);
    const back=box(0,.82,-.55,.82,.1,.72,canvas);back.rotation.x=-.42;
    const head=sphere(0,.91,-.72,.34,.11,.18,m.cream);head.rotation.x=-.4;
    for(const x of [-.28,.28]){
     const seam=box(x,.64,.22,.012,.012,1.06,m.oak);
     const backSeam=box(x,.87,-.55,.012,.012,.66,m.oak);backSeam.rotation.x=-.42;
    }
    for(const x of [-.48,.48]){
     const arm=box(x,.7,-.03,.075,.08,.58,frame);
     const support=box(x,.63,-.28,.06,.3,.06,frame);
    }
   }else if(modelName==='海报'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.02;depth=.14;height=1.32;wallAxis='x';wallSide='back';anchor=[0,2.05];
    const frame=mat(0x6c4c35,.62),matte=mat(0xe9dfcf,.92),ink=mat(0x354b50,.9),clay=mat(0xb96f55,.9),gold=mat(0xc59b59,.42,.38);
    box(0,0,0,1.02,1.32,.085,frame);
    box(0,0,.048,.94,1.24,.025,gold);
    box(0,0,.066,.88,1.18,.018,matte);
    box(0,0,.078,.78,1.08,.012,mat(0xd5d8cf,.95));
    // Layered mid-century landscape artwork with overlapping cut-paper hills and a sun disc.
    const sky=new T.Mesh(new T.PlaneGeometry(.74,.52),mat(0xb9c9c4,.98));sky.position.set(0,.23,.09);group.add(sky);
    const sunDisk=new T.Mesh(new T.CircleGeometry(.145,40),gold);sunDisk.position.set(.19,.39,.101);group.add(sunDisk);
    const hill1=new T.Shape();hill1.moveTo(-.37,-.02);hill1.quadraticCurveTo(-.18,.32,.02,.08);hill1.quadraticCurveTo(.22,-.05,.37,.16);hill1.lineTo(.37,-.27);hill1.lineTo(-.37,-.27);hill1.closePath();
    const hill2=new T.Shape();hill2.moveTo(-.37,-.16);hill2.quadraticCurveTo(-.12,.06,.08,-.13);hill2.quadraticCurveTo(.23,-.25,.37,-.07);hill2.lineTo(.37,-.27);hill2.lineTo(-.37,-.27);hill2.closePath();
    const h1=new T.Mesh(new T.ShapeGeometry(hill1),clay);h1.position.set(0,.13,.108);group.add(h1);
    const h2=new T.Mesh(new T.ShapeGeometry(hill2),ink);h2.position.set(0,.13,.112);group.add(h2);
    for(let i=0;i<5;i++){const line=box(-.2+i*.1,-.43,.105,.055,.012,.01,i%2?gold:ink)}
    for(const x of [-.405,.405])for(const y of [-.56,.56])cyl(x,y,.075,.018,.018,.018,gold,10);
    box(0,.63,.075,.72,.018,.012,frame);
   }else if(modelName==='门'){
    width=1.24;depth=.2;height=2.42;wallAxis='x';wallSide='back';anchor=[0,2.55];group.userData.isDoor=true;
    const isGlass=variant==='白橡木玻璃门',isCream=variant==='奶油法式双线门',isRattan=variant==='藤编门',isSliding=variant==='深色格栅推拉门',isArch=variant==='复古拱顶门';
    const timber=mat(isCream?0xe4d5bd:isGlass?0xb28d60:isRattan?0x9a7047:isSliding?0x554a42:isArch?0x876047:0x76513a,.72);
    const panel=mat(isCream?0xf0e6d7:isRattan?0xc49a68:isSliding?0x75675b:isArch?0xb28a63:0xa9845e,.82);
    const shadow=mat(0x4b3426,.86),glass=mat(0x9db9b7,.28,.12),brass=mat(0xc5a15d,.42,.45);
    // All door variants share the same 1.24 m casing and ground-level origin.
    // This is also the exact model used by the initial apartment doors.
    box(-.62,1.2,0,.12,2.4,.2,timber);box(.62,1.2,0,.12,2.4,.2,timber);box(0,2.38,0,1.36,.14,.2,timber);
    box(0,1.2,.035,1.08,2.22,.075,shadow);
    box(0,1.2,.08,1.02,2.16,.055,panel);
    if(isGlass){
     box(0,1.58,.12,.76,1.08,.04,glass);box(0,2.16,.145,.84,.07,.055,timber);box(0,1.0,.145,.84,.07,.055,timber);
     for(const x of [-.39,0,.39])box(x,1.57,.16,.025,1.12,.035,timber);
    }else if(isRattan){
     box(0,1.2,.12,.82,1.58,.045,shadow);
     for(let y=.48;y<=1.92;y+=.11)for(let x=-.36;x<=.36;x+=.11){const slat=box(x,y,.15,.025,.025,.025,brass);slat.rotation.z=.58}
     for(let y=.48;y<=1.92;y+=.11)for(let x=-.36;x<=.36;x+=.11){const slat=box(x,y,.155,.025,.025,.025,timber);slat.rotation.z=-.58}
    }else if(isSliding){
     box(-.24,1.2,.14,.48,2.0,.04,timber);box(.24,1.2,.17,.48,2.0,.04,panel);
     for(let x=-.4;x<=.4;x+=.13)box(x,1.2,.205,.035,1.92,.025,shadow);
     box(0,2.27,.12,1.12,.08,.07,brass);
    }else{
     for(const y of [.53,1.18,1.86]){
      const ph=y===1.18?.42:.5,ww=isCream?.84:.78;
      box(0,y,.115,ww,ph,.045,isCream?brass:timber);
      box(0,y,.143,ww-.08,ph-.08,.018,panel);
      if(isCream)box(0,y,.158,ww-.17,ph-.17,.012,panel);
     }
     if(isArch){
      const arch=new T.Mesh(new T.TorusGeometry(.43,.045,8,28,Math.PI),timber);arch.position.set(0,2.13,.16);arch.rotation.z=Math.PI;group.add(arch);
     }
    }
    // Consistent brass lever, lock escutcheon and destination plaque.
    cyl(.39,1.18,.16,.065,.065,.025,brass,18);box(.47,1.18,.19,.19,.035,.035,brass);cyl(.39,.94,.16,.035,.035,.025,m.metal,14);
    const plaque=box(0,2.06,.19,.52,.18,.045,brass);plaque.userData.doorDestinationPlaque=true;
    const labelCanvas=document.createElement('canvas');labelCanvas.width=320;labelCanvas.height=96;
    const labelTexture=new T.CanvasTexture(labelCanvas);labelTexture.encoding=T.sRGBEncoding;
    const labelMesh=new T.Mesh(new T.PlaneGeometry(.96,.29),new T.MeshBasicMaterial({map:labelTexture,transparent:true,side:T.DoubleSide,depthWrite:false}));
    labelMesh.position.set(0,2.66,.205);group.add(labelMesh);
    group.userData.doorDestinationCanvas=labelCanvas;group.userData.doorDestinationTexture=labelTexture;group.userData.doorDestinationLabel=labelMesh;
    group.userData.doorVariant=variant||'标准胡桃木';group.userData.doorPlaque=plaque;
   }else if(modelName==='懒人沙发'){
    width=1.5;depth=1.25;height=.85;action=()=>openFurnitureActions('sofa',id);
    const fabric=mat(0xb7a18d,.98),welt=mat(0x8d7866,.9);
    const bean=(x,y,z,sx,sy,sz,rot=0)=>{
     const o=new T.Mesh(new T.SphereGeometry(1,32,22),fabric);
     o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.z=rot;group.add(o);o.castShadow=true;return o;
    };
    bean(0,.36,.02,.68,.34,.58,-.04);
    bean(0,.61,-.2,.58,.43,.38,-.22);
    bean(-.38,.49,.13,.28,.29,.42,-.2);bean(.38,.49,.13,.28,.29,.42,.2);
    bean(0,.24,.28,.46,.16,.34,0);
    // A visible perimeter welt and gathered fabric folds distinguish the soft sack form.
    const seamCurve=new T.CatmullRomCurve3([
     new T.Vector3(-.48,.38,.45),new T.Vector3(-.25,.28,.55),
     new T.Vector3(0,.26,.58),new T.Vector3(.25,.28,.55),new T.Vector3(.48,.38,.45)
    ]);
    group.add(new T.Mesh(new T.TubeGeometry(seamCurve,28,.012,8,false),welt));
    for(const x of [-.24,0,.24]){
     const fold=box(x,.18,.43,.018,.012,.2,welt);fold.rotation.z=x*.25;
    }
   }else if(modelName==='鞋柜'){
    width=1.25;depth=.58;height=1.05;surfaceType='table';surfaceY=1.08;
    const carcass=mat(0xb18a61,.72),front=mat(0xe4d8c7,.78),shadow=mat(0x594536,.86);
    // Open-front three-tier shoe cabinet: the footwear is deliberately visible from the room.
    box(0,.52,-.015,1.2,.98,.53,carcass);
    box(0,1.02,0,1.3,.085,.62,m.oak);
    box(0,.52,-.285,1.12,.9,.035,shadow);
    for(const x of [-.59,.59])box(x,.53,.015,.075,.98,.59,front);
    for(const y of [.15,.43,.71])box(0,y,0,1.12,.045,.52,m.oak);
    for(const y of [.29,.57,.85])box(0,y,.278,1.12,.035,.045,carcass);
    const shoeUpper=[mat(0x6f5141,.88),mat(0x343a40,.84),mat(0x9a6248,.88)];
    const sole=mat(0xe6dfd1,.94),lace=mat(0xe8d9c5,.92);
    for(let row=0;row<3;row++)for(const x of [-.27,.27]){
     const baseY=.18+row*.28,upper=shoeUpper[(row+(x>0?1:0))%shoeUpper.length];
     box(x,baseY+.018,.105,.17,.035,.31,sole);
     const body=sphere(x,baseY+.09,.075,.083,.072,.145,upper);
     body.rotation.x=-.06;
     sphere(x,baseY+.09,.185,.08,.06,.085,upper);
     box(x,baseY+.12,-.025,.105,.07,.075,upper);
     box(x,baseY+.145,.045,.035,.065,.09,lace);
     for(let k=0;k<3;k++){
      const laceBar=box(x,baseY+.157,.025+k*.035,.075,.009,.012,lace);
      laceBar.rotation.y=(k-1)*.12;
     }
    }
    for(const x of [-.49,.49])for(const y of [.31,.59,.87])cyl(x,y,.315,.012,.012,.018,m.gold,8);
    for(const x of [-.49,.49])box(x,.08,-.2,.09,.16,.09,m.dark);
   }else if(modelName==='沙发床'){
    width=2.15;depth=1.5;height=.92;action=()=>openFurnitureActions('sofa',id);
    const frame=mat(0x76543a,.64),upholstery=mat(0xc9b9a5,.96),piping=mat(0x9f8972,.9);
    // Low convertible frame, pull-out platform and two independently upholstered panels.
    box(0,.25,0,2.08,.18,1.42,frame);
    box(0,.36,.34,2.0,.16,.72,upholstery);
    box(0,.29,.78,1.92,.12,.48,m.oak);
    box(0,.48,-.47,2.02,.72,.18,frame);
    box(0,.53,-.36,1.88,.58,.12,upholstery);
    for(const x of [-.93,.93]){
     box(x,.55,0,.16,.48,1.18,frame);
     box(x,.65,.04,.17,.22,.96,upholstery);
    }
    for(const x of [-.62,0,.62]){
     const seat=sphere(x,.49,.36,.31,.12,.33,upholstery);
     const seam=new T.Mesh(new T.TorusGeometry(.25,.008,6,24),piping);
     seam.position.set(x,.51,.36);seam.rotation.x=Math.PI/2;group.add(seam);
    }
    // Pull-out front rail and small caster feet.
    box(0,.22,.82,1.88,.09,.055,frame);
    for(const x of [-.86,.86])for(const z of [-.55,.65]){
     const foot=new T.Mesh(new T.CylinderGeometry(.035,.045,.16,12),m.dark);foot.position.set(x,.1,z);group.add(foot);
    }
   }else if(modelName==='榻榻米'){
    width=2.55;depth=2.15;height=.38;
    const base=mat(0x8e6848,.76),matting=mat(0xb9ad91,.98),edge=mat(0x58735c,.9);
    box(0,.16,0,2.55,.3,2.15,base);
    box(0,.33,0,2.48,.08,2.08,matting);
    // Four individual woven tatami panels with dark fabric binding.
    for(const x of [-.62,.62]){
     for(const z of [-.51,.51]){
      box(x,.39,z,1.18,.055,.98,matting);
      for(const side of [-1,1]){
       box(x+side*.575,.42,z,.025,.025,.94,edge);
       box(x,.42,z+side*.47,1.12,.025,.025,edge);
      }
      for(let line=-.48;line<=.481;line+=.09)box(x+line,.422,z,.008,.008,.88,mat(0xcfc4ac,.98));
     }
    }
    // Low raised perimeter and folded sleeping cushions.
    for(const x of [-1.22,1.22])box(x,.27,0,.06,.2,2.0,base);
    for(const z of [-1.02,1.02])box(0,.27,z,2.42,.2,.06,base);
    for(const x of [-.72,.72]){
     const pillow=sphere(x,.52,-.62,.34,.13,.24,m.cream);pillow.rotation.x=-.16;
    }
   }else if(modelName==='哑铃架'){
    action=()=>openFurnitureActions('dumbbellRack',id);
    width=1.35;depth=.68;height=1.02;
    const frame=mat(0x343b40,.42,.72),chrome=mat(0xaeb8bb,.28,.78),rubber=mat(0x252a2d,.92);
    // Two-tier steel rack with end uprights, stabilising feet and loaded dumbbells.
    for(const x of [-.59,.59]){
     box(x,.48,0,.065,.9,.58,frame);
     box(x,.91,0,.12,.08,.64,chrome);
     box(x,.08,0,.16,.12,.68,frame);
     for(const y of [.35,.72]){
      box(0,y,0,1.18,.065,.5,frame);
      box(0,y+.06,.22,1.18,.045,.045,chrome);
      for(const dx of [-.47,-.16,.16,.47]){
       const weight=cyl(dx,y+.15,0,.105,.105,.16,rubber,18);
       cyl(dx,y+.15,.095,.11,.11,.025,chrome,18);
       cyl(dx,y+.15,-.095,.11,.11,.025,chrome,18);
       cyl(dx,y+.15,0,.025,.025,.18,chrome,10);
      }
     }
    }
    for(let i=0;i<3;i++){const plate=cyl(-.55+i*.09,.1,-.34,.09,.09,.035,rubber,18);plate.rotation.x=Math.PI/2}
   }else if(modelName==='窗'){
    action=()=>openFurnitureActions('window',id);
    width=2.2;depth=.2;height=1.95;wallAxis='x';wallSide='back';anchor=[0,2.65];
    // Reuse the exact built-in room-window assembly: outdoor canvas, timed
    // sunlight, hinged open casements, curtain fabric, rings and brass rod.
    addWindowSun(parent,group,2.65);
    addWindowView(group,2.6,2.1,1.85);
    addOpenCasementWindow(group,m.oak);
    addWindowDressing(group,2.1,1.85,0xc7b7a4,2.6);
   }else if(modelName==='上床下桌'){
    width=3.0;depth=2.0;height=2.75;action=()=>openFurnitureActions('bed',id);for(const x of [-1.35,1.35]){box(x,1.35,0,.12,2.65,.12,m.wood);box(x,2.63,0,.18,.12,1.9,m.oak)}box(0,2.18,-.72,2.7,.16,.78,m.wood);box(0,2.3,-.72,2.65,.22,.72,m.fabric);box(0,2.55,-1.58,2.7,.5,.12,m.cream);for(const x of [-1.25,1.25])box(x,.82,.35,.1,1.6,.1,m.wood);box(0,.92,0,2.55,.12,.82,m.oak);box(0,.99,0,2.5,.04,.78,m.cream);for(const x of [-1.1,1.1])box(x,.45,0,.08,.88,.72,m.wood);for(let i=0;i<6;i++)box(-.22+i*.09,.18,.18,.045,.012,.3,m.gold);for(let i=0;i<5;i++){const step=box(-1.5,.22+i*.36,.65-i*.28,.38,.06,.24,m.oak);step.rotation.z=.0}
   }else if(modelName==='钢琴'){
    action=()=>openFurnitureActions('piano',id);
    width=1.62;depth=.92;height=1.42;
    const caseMat=mat(0x292a2b,.28,.46),wood=mat(0x62452f,.56),ivory=mat(0xf0eadc,.35),ebony=mat(0x18191b,.24);
    // Upright piano cabinet with fallboard, keyboard cheeks, music desk and pedals.
    box(0,.68,0,1.56,1.18,.76,caseMat);
    box(0,1.29,-.02,1.62,.12,.82,wood);
    box(0,.51,.405,1.42,.16,.12,wood);
    box(0,.57,.47,1.38,.055,.1,ebony);
    for(let i=0;i<52;i++){
     const x=-.665+i*.026;
     box(x,.59,.535,.024,.12,.045,ivory);
     if(i%7!==2&&i%7!==6&&i%7!==1&&i%7!==4){const black=box(x+.013,.66,.56,.014,.075,.035,ebony)}
    }
    box(0,.82,.34,1.36,.035,.08,wood);
    box(0,1.02,-.24,.96,.42,.06,caseMat);
    box(0,1.04,-.195,.86,.32,.018,wood);
    for(let i=0;i<5;i++)box(-.34+i*.17,1.04,-.18,.012,.24,.012,m.gold);
    for(const x of [-.62,.62])box(x,.08,-.22,.1,.16,.1,caseMat);
    for(const x of [-.22,0,.22]){const pedal=box(x,.055,.42,.045,.035,.18,m.metal);pedal.rotation.x=-.18}
    box(0,.16,.22,.62,.055,.22,caseMat);
   }else if(modelName==='洗衣机'){
    action=()=>openFurnitureActions('washingMachine',id);
    width=.92;depth=.86;height=1.28;
    const enamel=mat(0xe8e5df,.34,.18),steel=mat(0xaeb7b9,.28,.58),dark=mat(0x34434a,.18,.24),rubber=mat(0x252a2d,.88);
    box(0,.63,0,.88,1.22,.82,enamel);
    box(0,1.17,.42,.8,.18,.025,steel);
    box(0,1.18,.44,.58,.12,.012,dark);
    for(let i=0;i<3;i++){cyl(-.25+i*.25,1.18,.46,.035,.035,.025,m.metal,12);sphere(-.25+i*.25,1.18,.48,.012,.012,.012,m.gold)}
    // Deep porthole with rubber gasket, glass drum and concentric inner rings.
    const gasket=new T.Mesh(new T.TorusGeometry(.29,.055,14,40),rubber);gasket.position.set(0,.58,.43);group.add(gasket);
    const rim=new T.Mesh(new T.TorusGeometry(.255,.025,12,40),steel);rim.position.set(0,.58,.46);group.add(rim);
    const glass=new T.Mesh(new T.CircleGeometry(.225,40),dark);glass.position.set(0,.58,.445);group.add(glass);
    const drum=new T.Mesh(new T.TorusGeometry(.16,.012,8,32),steel);drum.position.set(0,.58,.46);group.add(drum);
    sphere(0,.58,.465,.11,.11,.012,mat(0x718c94,.22,.12));
    box(-.22,.98,.445,.22,.035,.018,m.cream);
    box(.25,.98,.445,.22,.035,.018,m.cream);
    for(const x of [-.34,.34])box(x,.06,.28,.1,.12,.12,rubber);
    box(0,.06,-.3,.72,.12,.12,rubber);
   }else if(modelName==='洗手台'){
    action=()=>openFurnitureActions('sink',id);width=1.28;depth=.82;height=1.72;
    const porcelain=mat(0xe8e5dc,.22),cabinet=mat(0x9b8064,.82),brass=mat(0xb18b58,.34,.58),mirror=mat(0xa9bdc0,.16,.42);
    box(0,.42,0,1.22,.82,.76,cabinet);box(0,.86,0,1.32,.12,.84,m.cream);box(0,.96,.02,1.12,.1,.66,porcelain);box(0,1.015,.04,.78,.035,.43,m.cream);
    const bowl=new T.Mesh(new T.TorusGeometry(.29,.045,10,32),porcelain);bowl.rotation.x=Math.PI/2;bowl.position.set(0,1.04,.04);group.add(bowl);
    const faucet=new T.CatmullRomCurve3([new T.Vector3(0,1.02,-.25),new T.Vector3(0,1.28,-.25),new T.Vector3(0,1.4,-.08),new T.Vector3(0,1.4,.05)]);group.add(new T.Mesh(new T.TubeGeometry(faucet,20,.024,8,false),brass));
    for(const x of [-.42,.42])cyl(x,1.04,-.22,.035,.035,.055,brass,12);
    box(0,1.58,-.37,1.12,.58,.045,m.wood);box(0,1.58,-.34,1.02,.48,.018,mirror);
    for(const x of [-.55,.55])box(x,.42,.39,.045,.7,.045,m.oak);
   }else if(modelName==='马桶'){
    width=.78;depth=1.12;height=.82;const ceramic=mat(0xe9e6de,.24),shadow=mat(0xb8b9b2,.55),seat=mat(0x59636a,.32);
    box(0,.55,-.34,.68,.72,.42,ceramic);box(0,.83,-.34,.72,.12,.46,m.cream);
    const pedestal=new T.Mesh(new T.CylinderGeometry(.27,.31,.43,28),ceramic);pedestal.position.set(0,.25,.13);group.add(pedestal);
    const bowl=new T.Mesh(new T.SphereGeometry(1,28,18),ceramic);bowl.scale.set(.38,.19,.48);bowl.position.set(0,.43,.2);group.add(bowl);
    const opening=new T.Mesh(new T.TorusGeometry(.245,.035,10,32),seat);opening.rotation.x=Math.PI/2;opening.position.set(0,.57,.2);group.add(opening);
    const inner=new T.Mesh(new T.CircleGeometry(.21,32),shadow);inner.rotation.x=-Math.PI/2;inner.position.set(0,.555,.2);group.add(inner);
    box(0,.93,-.35,.42,.035,.025,m.metal);box(.25,.97,-.34,.08,.06,.045,m.gold);
   }else if(modelName==='淋浴间'){
    action=()=>openFurnitureActions('sink',id);width=1.48;depth=1.42;height=2.32;
    const glass=mat(0xc8d9d8,.12,.08);glass.transparent=true;glass.opacity=.25;glass.depthWrite=false;const frame=mat(0x9b8064,.38,.52),stone=mat(0xc9c8c0,.42);
    box(0,.12,0,1.42,.18,1.36,stone);box(0,.22,0,1.26,.045,1.2,m.cream);
    for(const x of [-.68,.68])box(x,1.15,-.55,.045,2.1,.045,frame);
    for(const z of [-.55,.62])box(.68,1.15,z,.045,2.1,.045,frame);
    box(.68,1.15,.035,.025,2.0,1.12,glass);box(0,1.15,-.55,1.35,2.0,.025,glass);
    const pipe=new T.CatmullRomCurve3([new T.Vector3(-.5,2.05,-.45),new T.Vector3(-.5,2.18,-.45),new T.Vector3(-.5,2.2,-.22)]);group.add(new T.Mesh(new T.TubeGeometry(pipe,12,.025,8,false),m.metal));
    const head=new T.Mesh(new T.CylinderGeometry(.16,.2,.055,24),m.metal);head.rotation.x=Math.PI/2;head.position.set(-.5,2.17,-.18);group.add(head);
    cyl(-.48,1.08,-.42,.055,.055,.09,m.gold,12);box(-.48,1.2,-.42,.24,.035,.035,m.metal);
   }else if(modelName==='浴缸'){
    action=()=>openFurnitureActions('sink',id);width=2.25;depth=1.12;height=.72;const enamel=mat(0xe8e4dc,.26),outer=mat(0xd2c7b7,.72),metal=mat(0xaeb5b4,.28,.58);
    box(0,.34,0,2.16,.56,1.02,outer);box(0,.57,0,2.22,.16,1.1,enamel);box(0,.62,0,1.82,.035,.74,mat(0xb9c7c5,.3));
    for(const x of [-.9,.9])for(const z of [-.39,.39])sphere(x,.38,z,.12,.2,.12,enamel);
    cyl(.82,.78,-.37,.035,.035,.16,metal,12);cyl(.82,.87,-.37,.055,.055,.045,m.gold,12);
   }else if(modelName==='酒柜'){
    width=1.25;depth=.58;height=1.72;surfaceType='table';surfaceY=1.75;
    const wood=mat(0x503626,.62),back=mat(0x34251e,.82),glass=mat(0xc9dadd,.14,.12);glass.transparent=true;glass.opacity=.2;
    box(0,.84,0,1.2,1.62,.54,wood);box(0,1.68,0,1.28,.08,.62,m.oak);
    box(0,.86,-.275,1.08,1.42,.025,back);
    // Individual bottle cubbies below and stemware rail above.
    for(const y of [.28,.72,1.16]){
     box(0,y,.02,1.1,.045,.5,m.oak);
     for(const x of [-.4,-.13,.13,.4])box(x,y+.1,.04,.018,.18,.44,wood);
    }
    for(let i=0;i<5;i++){
     const x=-.42+i*.21;
     cyl(x,.48,.02,.052,.052,.25,i%2?m.clay:m.gold,14);
     cyl(x,.64,.02,.03,.03,.1,m.dark,12);
     cyl(x,.78,.02,.016,.016,.18,m.gold,10);
    }
    for(const x of [-.52,.52])box(x,.9,.285,.025,1.42,.025,wood);
    box(0,1.62,.285,1.08,.035,.035,wood);
    for(let i=0;i<4;i++){
     const x=-.36+i*.24;
     const stem=cyl(x,1.36,.12,.012,.012,.18,glass,10);
     const bowl=sphere(x,1.47,.12,.055,.075,.055,glass);
    }
   }else if(modelName==='料理台'){
    width=1.9;depth=.92;height=1.02;surfaceType='table';surfaceY=1.05;
    const island=mat(0x9c8064,.7),stone=mat(0xe5dfd4,.34),wood=mat(0xb18a61,.7);
    // Freestanding prep island, clearly different from the wall-side cabinet run.
    box(0,.48,0,1.78,.88,.82,island);
    box(0,.96,0,1.96,.14,.96,stone);
    box(0,.89,0,1.78,.035,.82,m.cream);
    // Open front shelves with a lower plinth and side cheeks.
    box(0,.1,0,1.68,.14,.72,wood);
    for(const x of [-.82,.82])box(x,.48,0,.08,.78,.78,wood);
    box(0,.34,.36,1.55,.045,.16,wood);box(0,.68,.36,1.55,.045,.16,wood);
    for(const x of [-.48,0,.48]){
     box(x,.5,.39,.012,.24,.018,m.oak);
     const basket=new T.Mesh(new T.BoxGeometry(.38,.16,.28),mat(0xd0b18b,.9));basket.position.set(x,.43,.17);group.add(basket);
     for(let line=-.12;line<=.121;line+=.04)box(x+line,.43,.315,.012,.14,.012,m.cream);
    }
    // Chopping board, knife rail and inset prep basin.
    box(-.48,1.055,-.12,.55,.035,.38,wood);
    box(-.48,1.08,-.12,.48,.012,.32,m.oak);
    const knife=box(-.43,1.13,-.12,.025,.11,.22,m.metal);knife.rotation.z=-.18;
    box(.54,1.045,-.08,.48,.025,.34,m.metal);
    box(.54,1.06,-.08,.39,.018,.25,m.dark);
   }else if(modelName==='任务板'){
    width=1.35;depth=.16;height=1.12;wallAxis='x';wallSide='back';anchor=[0,2.1];
    const frame=mat(0x76543d,.58),cork=mat(0xb98d61,.98),paper=mat(0xf0e8d8,.92);
    box(0,0,0,1.35,1.12,.1,frame);
    box(0,0,.058,1.22,1.0,.035,cork);
    for(const x of [-.62,.62])box(x,0,.085,.035,1.04,.045,m.gold);
    for(const y of [-.51,.51])box(0,y,.085,1.28,.035,.045,m.gold);
    // Pinned notes, a small calendar and a weekly list create separate readable zones.
    box(-.31,.18,.092,.48,.53,.018,paper);
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
     box(-.48+col*.105,.32-row*.105,.105,.075,.065,.008,row===0?m.clay:m.cream);
    }
    sphere(-.31,.46,.12,.035,.035,.025,m.gold);
    box(.34,.23,.095,.42,.34,.018,m.cream);
    for(let row=0;row<3;row++)box(.34,.32-row*.1,.11,.31,.012,.008,m.oak);
    for(const x of [.2,.48])sphere(x,.39,.13,.025,.025,.02,m.clay);
    box(.28,-.26,.095,.62,.34,.018,paper);
    for(let row=0;row<3;row++){
     box(.28,-.17-row*.09,.11,.43,.012,.008,m.oak);
     box(.03,-.17-row*.09,.115,.035,.035,.012,row===1?m.leaf:m.gold);
    }
    // A narrow lower ledge holds chalk and a small pencil cup.
    box(0,-.58,.15,1.12,.075,.18,frame);
    cyl(.43,-.47,.19,.065,.065,.16,m.clay,14);
    for(let i=0;i<3;i++){const pencil=cyl(.39+i*.035,-.34,.19,.009,.009,.24,m.gold,8);pencil.rotation.z=(i-1)*.1}
   }else if(modelName==='照片墙'){
    action=()=>openFurnitureActions('wallArt',id);
    width=1.95;depth=.16;height=1.45;wallAxis='x';wallSide='back';anchor=[0,2.15];
    const frameA=mat(0x76543d,.62),frameB=mat(0xb69a72,.62),matte=mat(0xf0e8d8,.92);
    const frames=[
     [-.62,.31,.48,.58,frameA,0x8ca49b],
     [0,.12,.62,.78,frameB,0x9aabb6],
     [.65,.34,.42,.5,frameA,0xc49b79],
     [-.34,-.47,.56,.44,frameB,0x8e887b],
     [.47,-.43,.62,.48,frameA,0x82918b]
    ];
    for(let i=0;i<frames.length;i++){
     const [x,y,w,h,frame,colour]=frames[i];
     box(x,y,0,w+.09,h+.09,.075,frame);
     box(x,y,.045,w,h,.018,matte);
     box(x,y,.06,w*.84,h*.84,.012,mat(colour,.92));
     // Different artwork silhouettes: landscape, portrait, botanical and abstract blocks.
     if(i===0){
      box(x,y-.07,.072,w*.72,.012,.008,m.cream);
      for(let k=0;k<4;k++)box(x-w*.3+k*.08,y+.08,.078,.07,.11,.008,k%2?m.leaf:m.clay);
     }else if(i===1){
      const sun=sphere(x+.13,y+.13,.08,.12,.12,.018,m.gold);
      const hill=box(x,y-.13,.078,w*.72,.14,.008,m.leaf);hill.rotation.z=-.08;
     }else if(i===2){
      const vase=sphere(x,y-.04,.08,.09,.16,.018,m.clay);
      for(let k=0;k<3;k++){const stem=box(x-.1+k*.1,y+.12,.085,.012,.22,.008,m.leaf);stem.rotation.z=(k-1)*.16}
     }else{
      for(let k=0;k<4;k++){const stripe=box(x-w*.28+k*.12,y,.08,.045,h*.68,.008,k%2?m.gold:m.cream);stripe.rotation.z=(k-1.5)*.12}
     }
    }
    // Small brass hanging rail unifies the asymmetrical gallery arrangement.
    box(0,.78,.015,1.45,.025,.035,m.gold);
   }else if(modelName==='跑步机'){
    action=()=>openFurnitureActions('treadmill',id);
    width=.9;depth=1.92;height=1.48;
    const frame=mat(0x343b40,.42,.72),belt=mat(0x20272b,.94),rail=mat(0x858f92,.42,.65),rubber=mat(0x171c20,.98);
    // Deep running deck with a continuous belt, end rollers and side foot rails.
    box(0,.19,0,.84,.22,1.82,frame);
    box(0,.315,0,.68,.025,1.62,belt);
    for(const z of [-.82,.82])cyl(0,.32,z,.035,.035,.7,rail,20);
    for(const x of [-.39,.39]){
     box(x,.34,0,.09,.045,1.72,rubber);
     box(x,.2,-.78,.1,.12,.16,frame);
     box(x,.2,.78,.1,.12,.16,frame);
     const upright=box(x,.83,-.62,.055,1.05,.055,rail);upright.rotation.x=-.18;
     const grip=box(x,.99,-1.02,.11,.09,.48,rubber);grip.rotation.x=.12;
    }
    box(0,1.27,-.98,.62,.34,.15,frame);
    box(0,1.29,-.895,.49,.22,.018,m.screen);
    box(0,1.12,-.88,.5,.035,.08,m.metal);
    for(let i=0;i<5;i++)cyl(-.19+i*.095,1.12,-.865,.018,.018,.018,i===2?m.clay:m.gold,10);
    for(const x of [-.27,.27]){const safety=box(x,1.08,-.82,.045,.025,.1,m.clay);safety.rotation.z=x*.12}
    for(const x of [-.3,.3])for(const z of [-.72,.72])cyl(x,.075,z,.045,.045,.08,rubber,12);
   }else if(modelName==='游戏机'){
    action=()=>openFurnitureActions('gameConsole',id);
    width=.72;depth=.48;height=.34;surfaceType='tabletop';surfaceY=.04;
    const shell=mat(0x30363b,.38,.58),edge=mat(0x555e64,.42,.55),vent=mat(0x171d22,.9),light=mat(0x8caeaa,.3,.2);
    // Low console chassis with layered shell, front ports and top ventilation.
    box(0,.13,0,.68,.2,.42,shell);
    box(0,.235,0,.65,.035,.4,edge);
    box(0,.258,0,.55,.012,.31,shell);
    for(let i=0;i<13;i++)box(-.25+i*.042,.267,-.12,.012,.008,.12,vent);
    for(const x of [-.25,.25]){box(x,.13,.215,.1,.055,.012,vent);cyl(x,.13,.23,.018,.018,.012,light,10)}
    for(const x of [-.24,.24]){const foot=box(x,.025,-.13,.12,.05,.12,vent)}
    // Two separate controllers with grips, thumb sticks, D-pad and face buttons.
    for(const x of [-.29,.29]){
     const pad=new T.Mesh(new T.SphereGeometry(1,24,16),shell);pad.position.set(x,.105,.39);pad.scale.set(.15,.065,.105);group.add(pad);
     for(const side of [-1,1]){const grip=new T.Mesh(new T.SphereGeometry(1,18,12),shell);grip.position.set(x+side*.075,.07,.43);grip.scale.set(.055,.06,.1);group.add(grip)}
     cyl(x-.045,.17,.36,.022,.022,.018,light,12);
     cyl(x+.045,.17,.36,.022,.022,.018,m.gold,12);
     for(let k=0;k<4;k++)sphere(x+.035+(k%2)*.035,.17,.405+Math.floor(k/2)*.035,.012,.012,.012,k%2?m.clay:m.cream);
    }
   }else if(modelName==='置物架'){
    width=1.3;depth=.52;height=1.92;
    const frame=mat(0x51463d,.46,.62),shelf=mat(0xb28c62,.66),back=mat(0x75604c,.88);
    for(const x of [-.59,.59])for(const z of [-.2,.2])box(x,.96,z,.055,1.88,.055,frame);
    // Five distinct shelves with raised lips, diagonal rear bracing and varied stored objects.
    for(let level=0;level<5;level++){
     const y=.13+level*.42;
     box(0,y,0,1.22,.055,.48,shelf);
     box(0,y+.045,.235,1.18,.045,.035,frame);
     for(const x of [-.55,.55])box(x,y+.08,-.18,.035,.16,.035,frame);
     if(level===0){
      for(let k=0;k<4;k++){const pot=cyl(-.39+k*.25,y+.17,.02,.065,.075,.2,k%2?m.clay:m.cream,14);cyl(-.39+k*.25,y+.28,.02,.055,.055,.025,m.leaf,14)}
     }else if(level===1){
      for(let k=0;k<5;k++){const book=box(-.45+k*.18,y+.16,.02,.13,.24,.24,[m.clay,m.cream,m.leaf,m.oak,m.fabric][k]);book.rotation.z=(k-2)*.035}
     }else if(level===2){
      for(let k=0;k<3;k++){const basket=box(-.38+k*.38,y+.12,.02,.29,.17,.3,mat(k===1?0xb99a73:0x9a7d5c,.94));for(let q=0;q<4;q++)box(-.48+k*.38+q*.06,y+.12,.18,.012,.13,.012,m.cream)}
     }else if(level===3){
      for(let k=0;k<3;k++){const frameBox=box(-.37+k*.37,y+.16,.02,.26,.24,.18,k===1?m.clay:m.cream);box(-.37+k*.37,y+.17,.12,.18,.16,.012,m.gold)}
     }else{
      const plant=cyl(-.35,y+.12,.02,.07,.09,.17,m.clay,14);
      for(let k=0;k<5;k++){const leaf=sphere(-.35+Math.cos(k*1.25)*.09,y+.28+Math.sin(k*1.25)*.04,.02,.07,.12,.035,m.leaf);leaf.rotation.z=Math.cos(k*1.25)*.5}
      for(let k=0;k<3;k++)box(.12+k*.14,y+.13,.02,.11,.2,.2,m.cream);
     }
    }
    for(const side of [-1,1]){const brace=box(side*.35,.96,-.225,.028,1.72,.028,frame);brace.rotation.z=side*.34}
   }else if(modelName==='衣帽架'){
    width=.82;depth=.82;height=2.05;
    const wood=mat(0x76543d,.62),brass=mat(0xb69a68,.48,.65);
    cyl(0,.075,0,.34,.34,.14,m.dark,24);
    cyl(0,1.0,0,.052,.065,1.82,wood,20);
    // A stepped crown with six curved hooks, each ending in a protective wooden knob.
    for(let i=0;i<6;i++){
     const a=i*Math.PI/3,x=Math.cos(a),z=Math.sin(a);
     const curve=new T.CatmullRomCurve3([
      new T.Vector3(x*.025,1.72,z*.025),
      new T.Vector3(x*.2,1.82,z*.2),
      new T.Vector3(x*.31,1.94,z*.31),
      new T.Vector3(x*.27,2.0,z*.27)
     ]);
     group.add(new T.Mesh(new T.TubeGeometry(curve,12,.022,8,false),brass));
     sphere(x*.27,2.0,z*.27,.055,.055,.055,wood);
     const collar=cyl(x*.04,1.73,z*.04,.075,.075,.035,m.gold,12);
     collar.rotation.x=Math.PI/2;
    }
    for(let i=0;i<3;i++){
     const a=i*Math.PI*2/3,x=Math.cos(a),z=Math.sin(a);
     const peg=box(x*.18,1.36,z*.18,.24,.045,.045,brass);peg.rotation.y=-a;
     sphere(x*.31,1.36,z*.31,.045,.045,.045,wood);
    }
    // A hanging coat and scarf establish scale and show how the hooks are used.
    const coat=box(.19,1.02,.1,.42,.68,.13,m.fabric);coat.rotation.z=-.08;
    const lapel=box(.19,1.34,.17,.22,.22,.025,m.cream);lapel.rotation.z=-.1;
    const scarf=box(-.2,1.26,.12,.1,.78,.035,mat(0x8a9b91,.96));scarf.rotation.z=.12;
   }else if(modelName==='凳子'){
    width=.66;depth=.66;height=.72;action=()=>openFurnitureActions('chair',id);
    const timber=mat(0x76543d,.62),seat=mat(0xc9b89f,.96),brass=mat(0x9b805f,.48,.55);
    // A round upholstered perch with four splayed legs and a circular footrest.
    cyl(0,.57,0,.34,.34,.13,timber,32);
    cyl(0,.655,0,.33,.33,.07,seat,32);
    const piping=new T.Mesh(new T.TorusGeometry(.315,.012,8,40),brass);piping.rotation.x=Math.PI/2;piping.position.y=.69;group.add(piping);
    for(let i=0;i<4;i++){
     const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a),z=Math.sin(a);
     const leg=box(x*.19,.29,z*.19,.075,.58,.075,timber);leg.rotation.z=-x*.13;leg.rotation.x=z*.13;
     sphere(x*.29,.055,z*.29,.055,.045,.055,brass);
    }
    const ring=new T.Mesh(new T.TorusGeometry(.22,.025,8,32),timber);ring.rotation.x=Math.PI/2;ring.position.y=.29;group.add(ring);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const tack=sphere(Math.cos(a)*.29,.67,Math.sin(a)*.29,.018,.018,.018,brass)}
   }else{toast('没有找到这种家具模型：'+name);return null}
   // Fine finish pass: small joinery, upholstery and hardware details for existing models.
   if(modelName==='床头柜'){for(const x of [-.31,.31])cyl(x,.075,-.27,.035,.035,.11,m.gold,12);box(0,.49,.414,.24,.025,.018,m.gold)}
   if(modelName==='椅子'||modelName==='餐桌椅'){const seatEdge=mat(0x9c8064,.9);for(const x of [-.29,.29]){box(x,.565,.34,.025,.025,.025,m.gold)}if(variant==='软包扶手椅'){for(const x of [-.3,.3]){const piping= new T.Mesh(new T.TorusGeometry(.27,.008,6,24,Math.PI),seatEdge);piping.position.set(x,.66,-.19);piping.rotation.y=Math.PI/2;group.add(piping)}}}
   if(modelName==='电脑'){const screenGlow=box(0,.49,-.112,.62,.012,.006,mat(0x6b9eb1,.28));screenGlow.material.emissive=new T.Color(0x23485b);screenGlow.material.emissiveIntensity=.28;for(let row=0;row<3;row++)for(let col=0;col<10;col++)box(-.27+col*.06,.104+row*.002,.105+row*.047,.035,.006,.025,m.metal)}
   const cabinetTopHeights={'床头柜':.94,'衣柜':2.52,'书架':2.16,'展示柜':2.08,'斗柜':1.22,'电视柜':.78,'橱柜':1.1,'鞋柜':1.08,'置物架':1.96,'酒柜':1.75,'餐边柜':1.26,'料理台':1.05,'吊柜':.55};
   if(Object.prototype.hasOwnProperty.call(cabinetTopHeights,modelName)){surfaceType='table';surfaceY=cabinetTopHeights[modelName]}
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
   ctx.fillStyle='rgba(247,239,224,.96)';ctx.beginPath();ctx.roundRect(3,3,314,90,15);ctx.fill();
   ctx.strokeStyle='#967657';ctx.lineWidth=5;ctx.stroke();
   ctx.fillStyle='#574532';ctx.font='600 48px "Noto Serif SC",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,160,49);
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
    button.onclick=()=>{item.doorDestination=value;item.group.userData.roomTarget=value;updateDoorDestinationLabel(item.group,value);const plaque=item.group.userData.doorPlaque;if(plaque?.material?.color)plaque.material.color.setHex(value==='hall'?0xc6ad83:value==='bathroom'?0xa6b9ae:0xc5a15d);persistFurniture(item);closeFurnitureActions();toast('门已通往'+label)};
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
   rig.rotation.set(0,0,0);rig.position.set(0,0,0);eyeGroups.forEach(g=>{g.scale.y=act==='sleep'?.055:1});if(act==='sleep')rig.rotation.set(-Math.PI/2,0,0);
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
  const raycaster=new T.Raycaster(),pointerNdc=new T.Vector2();
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
   const hits=raycaster.intersectObjects([...activeRoom.children,person],true);
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
     camera.updateMatrixWorld(true);
     const right=new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();
     const forward=new T.Vector3(-Math.sin(theta),0,-Math.cos(theta));
     const scale=targetRadius/Math.max(1,stage.clientHeight);
     if(roomMode==='hall'){hallCameraOffset.addScaledVector(right,-dx*scale);hallCameraOffset.addScaledVector(forward,dy*scale);}else{cameraTarget.addScaledVector(right,-dx*scale);cameraTarget.addScaledVector(forward,dy*scale);}
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
  function frame(t){const dt=Math.min(.06,(t-last)/1000);last=t;updateDaylight();if(pointers.size===0){targetTheta+=inertiaTheta*dt*1000;targetPhi+=inertiaPhi*dt*1000;const damp=Math.exp(-dt*5.2);inertiaTheta*=damp;inertiaPhi*=damp;if(Math.abs(inertiaTheta)<.000002)inertiaTheta=0;if(Math.abs(inertiaPhi)<.000002)inertiaPhi=0;applyCamera()}syncCamera(dt);
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
   const renderInterval=isTouchDevice?1000/40:1000/60;if(t-lastDraw>=renderInterval){renderer.render(scene,camera);lastDraw=t}
   arday3D.raf=requestAnimationFrame(frame)}
  scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material],opaque=mats.every(m=>m&&!m.transparent&&(m.opacity??1)>=.98);o.castShadow=opaque&&!o.userData.furnitureContactShadow;o.receiveShadow=opaque&&!o.userData.furnitureContactShadow}});
  updateDaylight(true);applyInkOutlines(scene);
  function cancelGesture(){pointers.forEach((_,id)=>{try{if(gestureSurface.hasPointerCapture(id))gestureSurface.releasePointerCapture(id)}catch(_){}});pointers.clear();drag=null;doorTap=null;pinchStart=0;inertiaTheta=0;inertiaPhi=0;dragVelocityTheta=0;dragVelocityPhi=0}
  arday3D={scene,camera,renderer,host,kitchen,bedroom,living,updateActivity,resize,setRoom,cancelGesture,consumePlacedMeal:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(!item)return false;item.group.parent?.remove(item.group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);s.placed=s.placed.filter(x=>x.id!==id);save();updateFurnitureHotspots();return true},applyRoomFinish:(id)=>{const finishes=s.roomFinishes||(s.roomFinishes={});const room=roomMode==='bedroom'?'bedroom':roomMode==='kitchen'?'kitchen':roomMode==='bathroom'?'bathroom':'living';if(id.startsWith('buy-wallpaper-')){finishes.wallpaper=id;[living,bedroom,kitchen].forEach(root=>applyWallpaperToRoom(root,id))}else{finishes[room]=finishes[room]||{};finishes[room].floor=id;const root=room==='bedroom'?bedroom:room==='kitchen'?kitchen:living;root.userData.floorMesh.material=M(id==='buy-floor-concrete'?0x69727b:0x424d5b)}} ,getRoom:()=>roomMode,getFurnitureById:id=>furnitureRegistry.find(item=>String(item.id)===String(id))||null,selectFurnitureById:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(item)selectFurniture(item)},placeOwnedFurniture:entity=>{if(!entity||typeof entity!=='object'||!entity.id||!entity.name)return false;const item=createOwnedFurniture(entity.name,{...entity,room:roomMode});if(!item)return false;selectFurniture(item);updateFurnitureHotspots();return true},raf:0};
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
