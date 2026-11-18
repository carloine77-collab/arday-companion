





(()=>{
const {activityMeta,shopCatalog,recipes,ingredientNames,furnitureActivities}=window.ArdayGameConfig;
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
const base={friend:24,attach:12,bored:4,hate:0,love:3,energy:78,hunger:62,clean:86,fun:70,money:100000,items:[],furniture:['茶几','窗户','植物','冰箱','灶台','水槽'],pantry:{rice:1,egg:2,vegetable:2,tomato:1},preferences:{},memories:[],events:[],visits:0,last:Date.now(),lastTick:Date.now(),calendar:null,room:{sofa:0,window:0,table:0},personality:null,activityLog:[],lastHourKey:''};
let s={...base};
let selectedCalendarDay=0;try{const old=JSON.parse(localStorage.getItem('arday-save-v2')||'null');if(old){s={...base,...old};if(typeof old.money!=='number')s.money=typeof old.coins==='number'?old.coins*10:30000;if(!old.testFundsV3){s.money=100000;s.testFundsV3=true;}}}catch(e){} delete s.coins;
s.preferences=s.preferences||{};s.memories=s.memories||[];delete s.roomCondition;s.events=(s.events||[]).filter(event=>event.type!=='life-repair');if(s.sharedGoal?.id==='room')s.sharedGoal=null;
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
 if(!['living','bedroom','kitchen'].includes(item.room))item.room='living';
 if(!Number.isFinite(Number(item.x)))item.x=0;
 if(!Number.isFinite(Number(item.y)))item.y=0;
 if(!Number.isFinite(Number(item.z)))item.z=0;
 if(!Number.isFinite(Number(item.rotation)))item.rotation=0;
});
s.furnitureCatalogVersion=Math.max(2,Number(s.furnitureCatalogVersion)||0);
s.roomFurnishingMigration=Math.max(1,Number(s.roomFurnishingMigration)||0);
s.pantry=s.pantry||{rice:1,egg:2,vegetable:2,tomato:1};s.room=s.room||{sofa:0,window:0,table:0};s.activityLog=s.activityLog||[];s.revealedTraits=s.revealedTraits||[];
s.jobApplications=s.jobApplications||{};
s.interactionAttempts=s.interactionAttempts&&typeof s.interactionAttempts==='object'?s.interactionAttempts:{};
s.activeInteraction=s.activeInteraction&&typeof s.activeInteraction==='object'?s.activeInteraction:null;
const statKeys=['friend','attach','bored','hate','love','energy','hunger','clean','fun'];
function save(){s.last=Date.now();try{localStorage.setItem('arday-save-v2',JSON.stringify(s))}catch(e){}}
function render(){statKeys.forEach(k=>{let v=$(k+'V'),b=$(k+'B');if(v)v.textContent=Math.round(Number(s[k])||0);if(b)b.style.width=(Number(s[k])||0)+'%'});let d=$('date');if(d)d.textContent=new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})+' · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});let cash=$('cash');if(cash)cash.textContent='共同账户 ¥'+s.money;if(typeof refreshTopActions==='function')refreshTopActions();}
function say(t){const b=$('dialogue');if(!b)return;document.querySelectorAll('.bubble,.dialogue-pill').forEach(node=>{if(node!==b)node.remove()});b.textContent=String(t||'');Object.assign(b.style,{display:'block',position:'absolute',left:'50%',top:'12px',zIndex:'45',transform:'translateX(-50%)',maxWidth:'min(72%,380px)',padding:'8px 14px',background:'#fff9edee',border:'1px solid #e0ceb3',borderRadius:'15px 15px 15px 5px',color:'#514334',fontSize:'12px',lineHeight:'1.45',textAlign:'center',boxShadow:'0 5px 16px #493a2926',pointerEvents:'none',opacity:'1',animation:'none'})}
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),1900)}
function remember(type,text,weight=1){s.memories.push({type,text,at:Date.now(),weight});if(s.memories.length>40)s.memories.shift()}
function change(delta){Object.entries(delta).forEach(([k,v])=>{if(k in s)s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)+Number(v||0)))})}
function dayAnchor(){return dayAnchorAt(Date.now())}
function dayKey(value){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))throw new TypeError('dayKey expects a valid Date or timestamp');return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function plusDays(d,n){let x=new Date(d);x.setDate(x.getDate()+n);return x}
function dayLabel(d){return d.toLocaleDateString('zh-CN',{month:'numeric',day:'numeric',weekday:'short'})}
function eventAt(key,h){return (s.calendar?.days?.[key]||[]).find(e=>h>=e.start&&h<e.end)}
function has(item){const matches=name=>name===item||name.startsWith(item+'·');return s.inventory.some(x=>matches(x.name))||(s.placed||[]).some(x=>typeof x.name==='string'&&matches(x.name))}
function eventCategory(e){if(e?.category)return e.category;const type=e?.type||'daily';if(type==='shared-goal-proposal'||type==='long')return 'proposal';if(type==='player-action')return 'player';if(type.startsWith('life-'))return 'random';return 'daily'}
function addEvent(title,detail,type='daily',choices=[]){let e={id:Date.now()+Math.random(),title,detail,type,category:eventCategory({type}),choices,created:Date.now(),status:'open'};s.events.unshift(e);s.events=s.events.slice(0,12);return e}
function completeEvent(e,choice){e.status='resolved';e.choice=choice;remember('event',e.title+'：'+choice,2)}








const tabs={'互动':Object.entries(activityMeta).filter(([,meta])=>meta.playerSelectable).map(([activity,meta])=>[meta.menuLabel||meta.title,meta.playerIcon||'•',activity]),'物品':[],'商店':[]};

let shopCategory='食物食材';
let inventoryCategory='全部';
let inventoryGrid=null;
let shopFurnitureGroup='起居空间';
let shopFurnitureType='沙发';
const furnitureNameById={'buy-furniture-television':'电视','buy-furniture-record-player':'唱片机','buy-furniture-rug-persian':'地毯·波斯绛红','buy-furniture-rug-checker':'地毯·奶油棋盘','buy-furniture-rug-sea':'地毯·海盐蓝','buy-kitchen-stove-enamel':'灶台·复古珐琅','buy-kitchen-stove-steel':'灶台·不锈钢','buy-kitchen-stove-cream':'灶台·奶油陶瓷','buy-furniture-sofa-linen':'沙发·亚麻燕麦','buy-furniture-sofa-blue':'沙发·雾蓝绒布','buy-furniture-rug':'地毯','buy-furniture-sofa':'沙发·复古高背','buy-furniture-art':'壁画','buy-furniture-divider':'隔断','buy-furniture-palm':'棕榈树绿植','buy-furniture-bookshelf':'书架·开放格架','buy-furniture-bookshelf-glass':'书架·玻璃门书柜','buy-furniture-desk':'书桌·经典书桌','buy-furniture-desk-drawer':'书桌·抽屉工作台','buy-furniture-chair':'椅子·温莎木椅','buy-furniture-chair-rattan':'椅子·藤编餐椅','buy-furniture-computer':'电脑','buy-furniture-dining-table':'餐桌','buy-furniture-dining-table-oak':'餐桌·浅橡木长桌','buy-furniture-dining-chair':'椅子·软包扶手椅','buy-furniture-bouquet':'捧花摆件','buy-bedroom-bed':'床·胡桃木软包','buy-bedroom-bed-oak':'床·浅橡木框架','buy-bedroom-nightstand':'床头柜','buy-bedroom-lamp':'台灯·蘑菇','buy-bedroom-lamp-ceramic':'台灯·陶瓷折线','buy-bedroom-wall-lamp':'壁灯·黄铜双臂','buy-bedroom-wall-lamp-single':'壁灯·单臂','buy-bedroom-ceiling-lamp':'吊灯·乳白玻璃','buy-bedroom-ceiling-lamp-metal':'吊灯·锥形金属','buy-floor-lamp-paper':'落地灯·纸罩','buy-floor-lamp-arc':'落地灯·黄铜弧形','buy-bedroom-wardrobe':'衣柜','buy-bedroom-rug':'地毯·卧室款','buy-kitchen-cabinets':'橱柜','buy-kitchen-wall-cabinet':'吊柜','buy-kitchen-fridge':'冰箱','buy-kitchen-stove':'灶台','buy-kitchen-sink':'水槽'};
function addInventoryItem(name,kind='food',id=null){const parts=name.split('·'),entity={id:id||('inv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)),name,kind,itemId:kind==='furniture'?parts.shift().trim():name,variant:kind==='furniture'?parts.join('·').trim():''};s.inventory.push(entity);return entity}
function addItem(name){return addInventoryItem(name,'food')}
function purchase(id,label,cost){
 if(s.money<cost){toast('¥不足');return}
 if(id.startsWith('buy-wallpaper-')||id.startsWith('buy-floor-')){if(!arday3D?.applyRoomFinish){toast('房间装修系统尚未就绪');return}s.money-=cost;arday3D.applyRoomFinish(id);const scope=id.startsWith('buy-wallpaper-')?'全屋墙面':'当前房间地面';addEvent('你更换了房间饰面',label+'已应用于'+scope+'。','player-action');remember('purchase','房间装修：'+label,2);say('已经换上新的'+label+'。');save();render();toast('装修完成：'+label);openTab('商店',true);return}
 if(id.startsWith('buy-furniture-')||id.startsWith('buy-bedroom-')||id.startsWith('buy-kitchen-')||id.startsWith('buy-floor-lamp-')){
  const furnitureName=furnitureNameById[id];if(!furnitureName){toast('商品信息不存在');return}
  s.money-=cost;addInventoryItem(furnitureName,'furniture');addEvent('你购入了一件家具',label+'已放入物品栏。','player-action');
  remember('purchase',label,2);save();render();toast('购入：'+label);return;
 }
 s.money-=cost;
 if(id==='buy-food')addItem('点心');
 

 addEvent('你添置了生活用品',label+'已收入物品栏。','player-action');say('买下了'+label+'。这会给我们的生活带来一点变化。');remember('purchase',label,2);save();render();toast('购入：'+label);openTab('商店',true);
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
 $('drawerTitle').textContent=name+' · ¥'+s.money;$('choices').innerHTML='';$('choices').className='choices';$('drawer').classList.toggle('shop-drawer',name==='商店');
 let shopGrid=null;
 if(name==='商店'){
  $('choices').classList.add('shop-content');
  const nav=document.createElement('div');nav.className='shop-categories';
  ['食物食材','家具'].forEach(category=>{const button=document.createElement('button');button.type='button';button.className='shop-category'+(shopCategory===category?' active':'');button.textContent=category;button.onclick=()=>{shopCategory=category;openTab('商店',true)};nav.appendChild(button)});
  const shopMasthead=document.createElement('section');shopMasthead.className='shop-masthead';shopMasthead.innerHTML='<div class="shop-kicker">ARDAY JOURNAL <span>HOME & LIVING</span></div><div class="shop-coverline"><span class="shop-cover-number">№ 08</span><span class="shop-cover-season">THE ART OF<br>EVERYDAY LIVING</span></div><div class="shop-cover-title">Objects<br><i>with a story.</i></div><div class="shop-cover-note"></div><div class="shop-cover-stamp">A HOME<br>IN THE<br>MAKING</div>'; 
  $('choices').appendChild(shopMasthead);
  $('choices').appendChild(nav);
  if(shopCategory==='家具'){
   const groups=shopCatalog.furnitureCategories||{};
   if(!groups[shopFurnitureGroup])shopFurnitureGroup=Object.keys(groups)[0]||'';
   const groupNav=document.createElement('div');groupNav.className='shop-level-one';
   Object.keys(groups).forEach(group=>{const button=document.createElement('button');button.type='button';button.className='shop-group'+(shopFurnitureGroup===group?' active':'');button.textContent=group;button.onclick=()=>{shopFurnitureGroup=group;shopFurnitureType=Object.keys(groups[group]||{})[0]||'';openTab('商店',true)};groupNav.appendChild(button)});
   $('choices').appendChild(groupNav);
   const types=groups[shopFurnitureGroup]||{};
   if(!types[shopFurnitureType])shopFurnitureType=Object.keys(types)[0]||'';
   const typeNav=document.createElement('div');typeNav.className='shop-level-two';
   Object.keys(types).forEach(type=>{const button=document.createElement('button');button.type='button';button.className='shop-furniture-type'+(shopFurnitureType===type?' active':'');button.textContent=type;button.onclick=()=>{shopFurnitureType=type;openTab('商店',true)};typeNav.appendChild(button)});
   $('choices').appendChild(typeNav);
  }
  const search=document.createElement('input');search.type='search';search.className='shop-search';search.placeholder='搜索家具、类别或风格';search.setAttribute('aria-label','搜索商店商品');$('choices').appendChild(search);
  shopGrid=document.createElement('div');shopGrid.className='shop-product-grid';$('choices').appendChild(shopGrid);
  search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();shopGrid.querySelectorAll('.shop-product-card').forEach(card=>{card.hidden=!!q&&!card.dataset.search.includes(q)})});
 }
 const tabEntries=name==='商店'?(shopCategory==='家具'?[...(shopCatalog.furnitureCategories?.[shopFurnitureGroup]?.[shopFurnitureType]||[])]:[...(shopCatalog[shopCategory]||[])]):[...(tabs[name]||[])];
 if(name==='互动'){$('choices').className='choices interaction-view';const hero=document.createElement('section');hero.className='interaction-masthead';hero.innerHTML='<div class="interaction-overline">A COMPANION JOURNAL <span>VOL. 01 / DAILY LIFE</span></div><div class="interaction-bigtitle">THE LITTLE<br><i>THINGS</i></div><div class="interaction-subtitle"></div><div class="interaction-asterisk"></div>'; $('choices').appendChild(hero);}
 if(name==='物品'){
  $('choices').className='choices inventory-view';inventoryGrid=document.createElement('div');inventoryGrid.className='inventory-items';
  const itemIcons={'点心':'🥐'};
  s.inventory.forEach((entity,index)=>{const item=entity.name;if(item==='修理工具')return;const category=entity.kind==='furniture'?'家具':'食物';tabEntries.push([item,itemIcons[item]||'▧',(category==='家具'?'place-owned-':'use-inventory-')+index,0,'',category])});
  Object.entries(ingredientNames).forEach(([key,label])=>{const count=pantryCount(key);if(count>0)tabEntries.push([label+' ×'+count,'🥬','pantry-inventory-'+key,0,'','食物'])});
  
  const nav=document.createElement('div');nav.className='inventory-categories';
  ['全部','食物','家具'].forEach(category=>{const button=document.createElement('button');button.type='button';button.className='inventory-category'+(inventoryCategory===category?' active':'');button.textContent=category;button.onclick=()=>{inventoryCategory=category;openTab('物品',true)};nav.appendChild(button)});
  $('choices').appendChild(nav);$('choices').appendChild(inventoryGrid);const filtered=tabEntries.filter(entry=>inventoryCategory==='全部'||entry[5]===inventoryCategory);tabEntries.length=0;tabEntries.push(...filtered);
 }
 tabEntries.forEach(([label,emoji,id,cost,description])=>{
  let b=document.createElement('button');const isShop=name==='商店';b.className=isShop?'choice shop-product-card':'choice';let owned=(id==='buy-player'&&has('唱片机'))||(id==='buy-desk'&&has('书桌'))||(id==='buy-shelf'&&has('书架'));
  if(isShop){const desc='';b.dataset.search=(label+' '+(shopFurnitureGroup||'')+' '+(shopFurnitureType||'')).toLowerCase();b.innerHTML='<span class="shop-product-icon">'+emoji+'</span><span class="shop-product-info"><strong>'+label+'</strong></span><span class="shop-product-price">'+(Number(cost)===0?'免费':'¥'+cost)+'</span><span class="shop-product-buy">购入</span>';}
  else b.innerHTML='<span class="emoji">'+emoji+'</span>'+label+(cost?'<small>'+(owned?'已拥有':cost+' ¥')+'</small>':'');
  b.onclick=()=>{
   if(id.startsWith('pantry-inventory-')){openKitchenPanel(false);return}
   if(id.startsWith('use-inventory-')){
    const index=Number(id.slice('use-inventory-'.length)),entity=s.inventory[index],item=entity?.name;
    if(!item){openTab('物品',true);return}
    if(item==='点心'){s.inventory.splice(index,1);change({hunger:25,fun:2});say('点心正好派上用场。')}
    
    save();render();openTab('物品',true);return;
   }
   if(id.startsWith('place-owned-')){
    const index=Number(id.slice('place-owned-'.length)),entity=s.inventory[index],item=entity?.name;
    if(!item){toast('这件物品已不在库存中');openTab('物品',true);return}
    s.inventory.splice(index,1);
    if(!arday3D?.placeOwnedFurniture||!arday3D.placeOwnedFurniture(entity)){s.inventory.splice(index,0,entity);save();toast('当前场景无法放置这件家具');return}
    addEvent('你摆放了一件家具',item+'已放进当前房间。','player-action');save();say('把'+item+'放进房间吧。');openTab('物品',true);return;
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
   save();render();$('drawerTitle').textContent=name+' · ¥ '+s.money;
  };
  const renderTarget=isShop?shopGrid:(name==='物品'?inventoryGrid:$('choices'));renderTarget.appendChild(b);
 });
 $('drawer').classList.add('open');document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
}

function eventChoicesLegacy(e){
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices event-detail-view';$('drawerTitle').textContent=e.title;
 $('choices').innerHTML='<div class="event-detail">'+e.detail+'</div><div class="calendar-actions"><button id="event-acknowledge">知道了</button></div>';
 $('event-acknowledge').onclick=()=>{completeEvent(e,'已阅');save();renderEvents()};
 $('drawer').classList.add('open');
}
function renderEvents(){
 $('drawer').classList.remove('furniture-drawer');$('drawer').querySelector('.furniture-close')?.remove();
 const open=s.events.filter(e=>e.status==='open').sort((a,b)=>(b.created||0)-(a.created||0));
 $('drawer').classList.remove('shop-drawer','profile-expanded');$('choices').className='choices';
 $('drawerTitle').textContent='最近发生的事';$('choices').className='choices events-view';$('choices').innerHTML='';
 if(!open.length){$('choices').innerHTML='<div class="event-empty"><span>✧</span><h3>暂时风平浪静</h3><p>阿尔的生活仍在继续。新的事情会在合适的时候发生。</p></div>';}
 open.forEach(e=>{
  const b=document.createElement('button');b.type='button';b.className='choice event-card';
  const copy=document.createElement('span');copy.className='event-copy';
  const titleNode=document.createElement('strong');titleNode.textContent=e.title;
  const detailNode=document.createElement('small');detailNode.textContent=e.detail;
  const timeNode=document.createElement('time');timeNode.textContent=new Date(e.created||Date.now()).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
  copy.append(titleNode,detailNode,timeNode);const arrow=document.createElement('span');arrow.className='event-arrow';arrow.textContent='›';b.append(copy,arrow);
  b.onclick=()=>eventChoices(e);$('choices').appendChild(b);
 });
 $('drawer').classList.add('open');
}








function closeCalendar(){if(arday3D?.cancelGesture)arday3D.cancelGesture();$('stage').classList.remove('calendar-mode');$('stage').style.touchAction='none';$('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'))}
function slotClick(di,h){
 ensureSchedule();let d=plusDays(dayAnchor(),di),key=dayKey(d),ev=eventAt(key,h);
 $('drawer').classList.add('open');
 if(ev&&ev.kind!=='autonomous'){
  $('drawerTitle').textContent=pad(ev.start)+':00 · '+ev.title;
  $('choices').innerHTML='<div class="calendar-actions"><button id="join">问他能否一起</button><button id="move">商量调整时间</button><button id="remove">让他自己安排</button><button id="return-existing">返回日程</button></div>';
  $('join').onclick=()=>{let yes=ev.kind!=='routine'&&ev.activity!=='sleep'&&ev.kind!=='work'&&s.energy>18&&s.bored<65&&s.hate<70;if(yes){ev.withPlayer=true;remember('planned','决定一起参与：'+ev.title,1);say('好啊，一起做也不错。')}else if(ev.activity==='sleep'||ev.title.includes('睡眠'))say('现在是我的睡眠时间。我不会为了临时邀请打乱作息。我们可以约在明天醒来以后。');else if(ev.kind==='work')say('我已经答应了这份工作，不能临时把它放下。等结束以后再一起安排吧。');else if(ev.kind==='routine')say('这是我固定的生活安排。我愿意商量，但不想直接取消它。');else say('这件事我想自己完成。等我结束后，我们再一起待一会儿。');save();render();$('drawer').classList.remove('open');renderCalendar();};
  $('move').onclick=()=>{
    const target=prompt('想调整到几点？请输入 0–23 之间的整点。'),n=Number(target),duration=ev.end-ev.start,oldStart=ev.start;
    if(!Number.isInteger(n)||n<0||n+duration>24){toast('这个时间不可用');return}
    const conflict=(s.calendar.days[key]||[]).some(x=>x!==ev&&n<x.end&&n+duration>x.start);
    if(conflict){toast('这个时段已有其他安排');return}
    ev.start=n;ev.end=n+duration;
    s.calendar.days[key].sort((a,b)=>a.start-b.start);save();renderCalendar();$('drawer').classList.remove('open');say('我把安排调整到了 '+pad(n)+':00。')
   };
  $('remove').onclick=()=>{if(ev.kind==='routine'||ev.kind==='sleep'||ev.kind==='work'){say(ev.kind==='work'?'这份工作已经答应下来，不能直接取消。':'这属于我的基本生活安排，我不打算取消。你可以和我商量调整，但不能直接替我决定。');s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'重视自主'])];save();return}s.calendar.days[key]=s.calendar.days[key].filter(x=>x!==ev);save();renderCalendar();$('drawer').classList.remove('open');say('好，这段时间我自己决定。')};
  $('return-existing').onclick=()=>{$('drawer').classList.remove('open')};return;
 }
 $('drawerTitle').textContent='提出安排 · '+dayLabel(d)+' '+pad(h)+':00';
 $('choices').innerHTML='<div class="calendar-note">邀请阿尔留出一小时。不同活动会受到他的状态、偏好和关系经历影响。</div><div class="choices">'+playerActivityOptions.map((x,i)=>'<button class="choice" data-p="'+i+'"><span class="emoji">'+x.icon+'</span>'+activityLabel(x.activity)+'</button>').join('')+'</div><div class="calendar-actions"><button id="return-empty">返回日程</button></div>';
 $('choices').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{
  const option=playerActivityOptions[Number(b.dataset.p)];
  const accepted=proposeActivityNow(option.activity,false,{slot:{key,start:h},dayOffset:di,source:'calendar'});
  $('drawer').classList.remove('open');
  toast(accepted?'阿尔接受了邀请':'这次安排没有被接受');
 });
 $('return-empty').onclick=()=>$('drawer').classList.remove('open');
}

$('backRoom')?.remove();
// Navigation listeners are installed before simulation initialization.
$('chatForm').addEventListener('submit',e=>{e.preventDefault();let v=$('message').value.trim();if(!v)return;respondToChat(v);$('message').value='';});
let decorating=false;
$('decorate').onclick=()=>{decorating=!decorating;$('stage').classList.toggle('editing',decorating);$('decorate').textContent=decorating?'完成装修':'✦ 装修';if(decorating){$('drawer').classList.remove('open')}else say('好了。')};
/* Initialization is deliberately deferred until all simulation constants and handlers are defined. */










function respondToChat(text){
 if(ardayUnavailable()){busyBubble();return}
 const t=text.toLowerCase(),pick=a=>a[Math.floor(Math.random()*a.length)],cur=s.currentActivity||'idle';
 const act={rest:'休息',eat:'吃东西',wash:'洗漱',read:'阅读',music:'听音乐',write:'写东西',walk:'散步',sleep:'睡觉',work:'工作',};
 let topic='general',reply='';
 if(/你好|嗨|早上好|晚上好|在吗|回来/.test(t)){topic='greeting';reply=pick(['你来了。我刚才在'+(act[cur]||'做自己的事')+'。','嗯，我在。你今天过得怎么样？','回来啦。刚才我正准备'+(cur==='sleep'?'睡觉':'继续手头的事')+'。'])}
 else if(/累|疲惫|困|睡不着|休息/.test(t)){topic='tired';reply=pick(['你听起来有点累。今天是什么事情最消耗你？','那先坐一会儿吧。我刚才也在休息。','你想聊聊原因，还是暂时换个轻松的话题？'])}
 else if(/难过|伤心|烦|生气|焦虑|压力|痛苦/.test(t)){topic='mood';reply=pick(['我先听你说。是刚发生了什么，还是最近一直积累着？','我不想随便劝你想开点。你最介意的究竟是哪一部分？','你希望我先听着，还是和你一起分析这件事？'])}
 else if(/钱|价格|贵|便宜|工作|赚钱|收入/.test(t)){topic='money';reply=pick(['我们现在有 ¥'+s.money+'。我觉得先留出生活开销比较稳妥。','我会看看适合自己的正式职位，也要考虑日程和精力。','最近先留意共同开销，再决定买什么。'])}
 else if(/音乐|唱片|歌/.test(t)){topic='music';reply=has('唱片机')?pick(['最近我常在晚上听唱片。你有特别喜欢的音乐吗？','我想找点没听过的音乐。','唱片机已经成了房间里常用的东西。']):'我也想听音乐，不过我们还没有唱片机。'}
 else if(/书|阅读|小说|读/.test(t)){topic='reading';reply=pick(['我最近读得比较慢。你在读什么？','你更喜欢故事，还是观点和论证？','有些书读完以后，想法会留很久。'])}
 else if(/吃|饿|饭|食物/.test(t)){topic='food';reply=pick(['我有点想吃热的东西。你今天吃饭了吗？','如果现在能选，我想吃点简单但有味道的东西。','我们可以看看库存还有什么。'])}
 else if(/房间|家具|装修|书桌|植物/.test(t)){topic='room';reply=pick(['我希望房间慢慢有生活痕迹，而不是一下子塞满东西。','如果只能先改一处，我会考虑光线、收纳和使用频率。'])}
 else if(/对不起|抱歉|原谅/.test(t)){topic='apology';reply=pick(['我听到了。我会看之后怎么相处，不会只凭一句话判断。','谢谢你愿意说出来。我们可以慢慢把事情讲清楚。'])}
 else if(/喜欢|爱你|爱不爱|关系|朋友/.test(t)){topic='relationship';reply=pick(['我觉得关系不是靠一句话就能定下来的。我们相处的细节，我都算数。','我有自己的感受，也还在了解你。你最近怎么想我们的关系？','我们已经形成了一些只有彼此才懂的习惯。'])}
 else {topic='general';let p=s.memories.filter(m=>m.type==='conversation').slice(-1)[0];reply=p&&Math.random()<.4?'你刚才提到“'+p.text.slice(0,22)+'”。这和你现在说的事情有关系吗？':pick(['你说的这件事里，最让你在意的是哪一部分？','我还没有形成明确看法。你愿意再具体一点吗？','我想知道你为什么会这样想，而不只是听一个结论。','这件事我可能有不同看法。你想听听吗？'])}
 s.chatTopics=s.chatTopics||{};s.chatTopics[topic]=(s.chatTopics[topic]||0)+1;remember('conversation',text.slice(0,55));say(reply);save();render();
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
 for(let hour=0;hour<24;hour++)if(!occupied.has(hour))d.push({start:hour,end:hour+1,title:'自主安排',kind:'autonomous',activity:'autonomous',autonomous:true,source:'simulation',unresolved:true});
 return d.sort((a,b)=>a.start-b.start);
}
function ensureSchedule(){ensureScheduleAt(Date.now())}

function renderCalendar(){
 ensureSchedule();const anchor=dayAnchor(),d=plusDays(anchor,selectedCalendarDay),key=dayKey(d),now=new Date();
 const labels=['今天','明天','后天'];
 let html='<div class="calendar-editorial-masthead"><div class="calendar-masthead-copy"><span class="calendar-eyebrow">ARDAY COMPANION　 /　 THE DAILY EDITION</span><div class="calendar-display-title">日程<span class="calendar-title-mark"></span></div><div class="calendar-subtitle">A QUIET RECORD OF ORDINARY DAYS</div></div><div class="calendar-date-stamp"><span>ISSUE</span><strong>'+String(d.getDate()).padStart(2,'0')+'</strong><small>'+dayLabel(d)+'</small></div><span class="calendar-ornament calendar-ornament-one"></span><span class="calendar-ornament calendar-ornament-two"></span></div><div class="calendar-day-tabs">'+labels.map((x,i)=>'<button class="'+(selectedCalendarDay===i?'active':'')+'" data-day-select="'+i+'"><span class="calendar-tab-index">0'+(i+1)+'</span><span class="calendar-tab-label">'+x+'</span><small>'+dayLabel(plusDays(anchor,i))+'</small></button>').join('')+'</div>';
 html+='<section class="day-card '+(selectedCalendarDay===0?'today':'')+'"><div class="day-card-head"><strong>'+labels[selectedCalendarDay]+' · '+dayLabel(d)+'</strong></div><div class="day-timeline">';
 for(let hour=0;hour<24;hour++){let ev=eventAt(key,hour),isNow=selectedCalendarDay===0&&now.getHours()===hour;let label=ev?ev.title:'自主安排';html+='<div class="day-slot"><time>'+pad(hour)+':00</time><button class="'+(ev?(ev.kind==='proposal'?'proposal':ev.activity==='sleep'?'sleep':ev.kind==='work'?'work':'busy'):'free')+(isNow?' now':'')+'" data-day="'+selectedCalendarDay+'" data-hour="'+hour+'">'+label+'</button></div>'}
 html+='</div></section>';
 $('calendarContent').innerHTML=html;
 $('calendarContent').querySelectorAll('[data-day-select]').forEach(b=>b.onclick=()=>{selectedCalendarDay=+b.dataset.daySelect;renderCalendar()});
 $('calendarContent').querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>slotClick(+b.dataset.day,+b.dataset.hour));
}
function renderProfile(){
 const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const traits=characterStats.personalityTraits||['洞察人心','从容不羁','疏离矜贵','聪敏自持'];
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






const playerActivityOptions=Object.entries(activityMeta).filter(([,meta])=>meta.playerSelectable).map(([activity,meta])=>({activity,icon:meta.playerIcon||'•'}));
function scheduleSlotAvailable(key,start,duration=1){
 const day=s.calendar.days[key]||[];
 for(let h=start;h<start+duration;h++){
  const ev=day.find(e=>h>=e.start&&h<e.end);
  if(ev&&!['free','autonomous'].includes(ev.kind))return false;
 }
 return true;
}
function findAvailableSlot(now=new Date(),duration=1){
 const today=keyAt(now),hour=now.getHours();
 for(let offset=0;offset<=2;offset++){
  const d=new Date(now);d.setDate(d.getDate()+offset);
  const key=ensureScheduleAt(d),from=offset===0?hour+(s.lastUnifiedHourKey===today+'-'+hour?1:0):6;
  for(let h=from;h+duration<=24;h++)if(scheduleSlotAvailable(key,h,duration))return {key,start:h};
 }
 return null;
}
function evaluateActivityProposal(activity,dayOffset=0){
 const score=s.friend*.28+s.attach*.22-s.bored*.5-s.hate*.35+(s.energy-50)*.16+(s.preferences?.[activity]||0)*4+(activity==='computerPlay'&&s.fun<40?10:0);
 const survival=(activity==='rest'&&s.energy<28)||(activity==='eat'&&s.hunger<38);
 // The fresh-save baseline is 11.84; the former threshold of 12 rejected
 // every ordinary invitation before preferences had time to develop.
 return survival||score>8+(Math.max(0,dayOffset)*1.5);
}
function rejectActivityProposal(activity){
 const refusals={chat:['我想先自己待一会儿，晚些再聊吧。','今天暂时没有聊天的兴致。'],computerPlay:['现在不太想玩电脑游戏。','这会儿想做点别的。'],walk:['外面我暂时不想去。','今天不想出门，改天吧。'],read:['我现在没心思看书。','读书这件事不急，晚点再说。'],rest:['我还不想休息。','现在坐不住，等会儿再说。']};
 const lines=refusals[activity]||['这会儿不太想做。','我有自己的安排，换个时间吧。'];
 say(lines[Math.floor(Math.random()*lines.length)]);s.rejections=(s.rejections||0)+1;
 if(s.rejections>=2)s.revealedTraits=[...new Set([...(s.revealedTraits||[]),'坚持自己的节奏'])];
}
function proposeActivityNow(action,force=false,options={}){
 // A scheduled invitation targets a future slot. Arday being asleep, at work,
 // eating or outside right now must not block booking a later available hour.
 const a=normalizeActivity(action),now=new Date();
 if(a==='idle'||!activityMeta[a])return false;
 if((a==='walk'||a==='computerPlay')&&s.energy<22){say('我现在精力不太够，做这个恐怕不合适。');s.rejections=(s.rejections||0)+1;save();return false}
 const requiredFurniture=activityMeta[a].requires;
 if(requiredFurniture&&!hasAutonomyFurniture(requiredFurniture)){say('家里还没有适合进行这项活动的家具。');return false}
 const slot=options.slot||findAvailableSlot(now,1),dayOffset=Number(options.dayOffset)||0;
 if(!slot){say('最近几天的安排都比较满。等有空档时，我们再约这件事。');return false}
 if(!scheduleSlotAvailable(slot.key,slot.start,1)){say('这个时间已经有其他安排了。我们换个时间吧。');return false}
 const accepted=force||evaluateActivityProposal(a,dayOffset);
 if(!accepted){rejectActivityProposal(a);save();return false}
 const title=activityMeta[a].menuLabel||activityMeta[a].title||a;
 writeBlockForKey(slot.key,slot.start,slot.start+1,{title,kind:'proposal',activity:a,withPlayer:true,byPlayer:true,anchor:options.anchor||null,startedBy:options.source||'player'});
 remember('planned','约定：'+title,1);say(slot.key===keyAt(now)&&slot.start===now.getHours()+1?'好，我把稍后的时间留出来。':'可以，我把这段时间留给我们。');
 save();render();if($('stage').classList.contains('calendar-mode'))renderCalendar();return true;
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
 
 
 
 
 
 if(s.calendar.anchor!==currentKey){
  s.calendar.anchor=currentKey;
  Object.keys(s.calendar.days).forEach(k=>{if(k<currentKey)delete s.calendar.days[k]});
  Object.keys(s.sleepPlans||{}).forEach(k=>{if(k<currentKey)delete s.sleepPlans[k]});
  addEvent('新的一天','阿尔已经开始安排新一天的生活。','daily');
 }
 const ensureDay=key=>{
  const existing=s.calendar.days[key],previousPlan=s.sleepPlans?.[key],generated=buildDay(key);
  if(!existing)s.calendar.days[key]=generated;
  else if(previousPlan!==s.sleepPlans?.[key]){
   const preserved=existing.filter(ev=>ev.activity!=='sleep');
   s.calendar.days[key]=[...preserved,...generated.filter(ev=>ev.activity==='sleep')].sort((a,b)=>a.start-b.start);
  }
  const day=s.calendar.days[key];
  for(let hour=0;hour<24;hour++)if(!day.some(ev=>hour>=ev.start&&hour<ev.end))day.push({start:hour,end:hour+1,title:'自主安排',kind:'autonomous',activity:'autonomous',autonomous:true,source:'simulation',unresolved:true});
  day.sort((a,b)=>a.start-b.start);
 };
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
 if(['listen','tea','walk','read','game','music','food','company','chat','computerPlay','watchTV','listenRecords','bouquet','admireFlowers','smellFlowers'].includes(action)){
  s.friend=clamp(s.friend+1);
  s.attach=clamp(s.attach+.5);
  remember('shared',action);
 }else if(action==='ignore'){
  s.attach=clamp(s.attach-1);
 }
}



function pantryCount(k){return Math.max(0,Number(s.pantry?.[k]||0))}
function canCook(id){const r=recipes[id];return !!r&&Object.entries(r.ingredients).every(([k,n])=>pantryCount(k)>=n)}
function buyIngredient(id,label,cost){const k=id.replace('buy-ingredient-','');if(!(k in ingredientNames))return;if(s.money<cost){toast('¥不足');return}s.money-=cost;s.pantry[k]=pantryCount(k)+1;addEvent('你补充了食材',label+'已放入冰箱。','player-action');remember('purchase','购买食材：'+label,1);say('食材放进冰箱了。');save();render();openKitchenPanel(false)}
function kitchenOpen(){$('stage').classList.add('kitchen-mode');$('stage').classList.remove('bedroom-mode');$('roomLabel').textContent='厨房';updateArday3D()}
function kitchenClose(){$('stage').classList.remove('kitchen-mode');$('stage').classList.remove('bedroom-mode');const m=activityMeta[s.currentActivity]||{title:'自己的时间'};$('roomLabel').textContent=''+m.title;updateArday3D()}
function openKitchenPanel(){
 $('drawer').classList.remove('furniture-drawer');$('drawer').querySelector('.furniture-close')?.remove();
 kitchenOpen();
 const stock=Object.entries(ingredientNames).map(([key,label])=>'<span class="cooking-stock-item">'+label+' <b>×'+pantryCount(key)+'</b></span>').join('');
 const cards=Object.entries(recipes).map(([id,recipe])=>{const enough=canCook(id),ingredients=Object.entries(recipe.ingredients).map(([key,count])=>ingredientNames[key]+' ×'+count).join('　·　');return '<article class="cooking-card"><div class="cooking-dish-icon">'+(id==='eggRice'?'🍚':id==='tomatoEgg'?'🍳':'🥣')+'</div><div class="cooking-dish-copy"><strong>'+recipe.name+'</strong><small>'+ingredients+'</small></div><button type="button" class="cooking-make" data-recipe="'+id+'" '+(enough?'':'disabled')+'>'+(enough?'制作':'缺少食材')+'</button></article>'}).join('');
 $('drawerTitle').textContent='烹饪';$('choices').className='choices cooking-panel';
 $('choices').innerHTML='<section class="cooking-stock"><div class="cooking-section-title">冰箱库存</div><div class="cooking-stock-list">'+stock+'</div></section><section class="cooking-recipes"><div class="cooking-section-title">选择菜品</div>'+cards+'</section><div class="cooking-footer"><span>成品会放入物品栏，可摆放在任意房间</span><button type="button" id="kitchen-close">完成</button></div>';
 $('choices').querySelectorAll('[data-recipe]').forEach(button=>button.onclick=()=>cookRecipeForPlayer(button.dataset.recipe));$('kitchen-close').onclick=()=>$('drawer').classList.remove('open');$('drawer').classList.add('open');
}
function cookRecipeForPlayer(id){const recipe=recipes[id];if(!recipe)return;if(!canCook(id)){toast('食材不足');return}Object.entries(recipe.ingredients).forEach(([key,count])=>s.pantry[key]=pantryCount(key)-count);const itemName='成品食物·'+recipe.name;addInventoryItem(itemName,'food');addEvent('完成了一道料理',recipe.name+'已放入物品栏。','player-action');remember('cooking','亲手制作：'+recipe.name,2);say(recipe.name+'做好了。找个合适的位置摆出来吧。');save();render();openKitchenPanel();toast('已制作：'+recipe.name)}
// Presentation only. The schedule processor is the sole writer of currentActivity.
const immediateInteractionDuration=120000;
const immediateInteractionRefusalRate=.3;
function finishImmediateInteraction(at=Date.now()){
 const interaction=s.activeInteraction;if(!interaction||at<Number(interaction.endsAt||0))return false;
 s.activeInteraction=null;
 const activity=normalizeActivity(interaction.activity),meta=activityMeta[activity];
 if(meta){
  const effects={...(meta.effect||{})};
  if(Object.prototype.hasOwnProperty.call(energyEffects,activity))effects.energy=Number(energyEffects[activity])||0;
  change(effects);
  const preferenceKey=activity==='read'?'reading':activity==='write'?'writing':activity;
  if(['read','write','chat','computerPlay','watchTV','listenRecords','rest','music','wash','tea','bouquet','admireFlowers','smellFlowers'].includes(activity))s.preferences[preferenceKey]=(s.preferences[preferenceKey]||0)+1;
  if(['read','write'].includes(activity))updatePersonalGoal(activity,at);
  relation(activity);
  s.activityLog=s.activityLog||[];s.activityLog.push({activity,key:keyAt(at),hour:new Date(at).getHours(),at,withPlayer:true,immediate:true});
  if(s.activityLog.length>100)s.activityLog.splice(0,s.activityLog.length-100);
  remember('shared',activityLabel(activity)+' · 即时互动',1);
 }
 presentActivity(s.currentActivity||'idle',s.currentActivityAnchor||null);
 say('好了。我们接着做刚才的事吧。');
 save();render();return true;
}
function refreshImmediateInteraction(at=Date.now()){
 const interaction=s.activeInteraction;if(!interaction)return false;
 if(at>=Number(interaction.endsAt||0))return finishImmediateInteraction(at);
 const hourKey=keyAt(at)+'-'+new Date(at).getHours();
 if(interaction.presentationHourKey!==hourKey){interaction.presentationHourKey=hourKey;presentActivity(interaction.activity,interaction.anchor||null,interaction.room||null,interaction.furnitureId||null)}
 return true;
}
function beginImmediateInteraction(action,options={}){
 const activity=normalizeActivity(action),meta=activityMeta[activity];
 if(!meta||activity==='idle')return false;
 const now=Date.now(),hourKey=keyAt(now)+'-'+new Date(now).getHours();
 if(s.lastUnifiedHourKey!==hourKey)processActivityAt(now);
 const availability=resolveCharacterAvailability(new Date(now));
 if(availability.status!=='available'){
  const messages={sleeping:'我现在已经睡下了，暂时不回应其他安排。',working:'我正在工作，结束以后再来找我吧。',eating:'我正在吃饭，等吃完再说。',outside:'我已经出门了，回来以后再一起做吧。',busy:'我现在有其他安排，暂时无法回应。'};
  say(messages[availability.status]||messages.busy);return false;
 }
 if(s.activeInteraction&&now<Number(s.activeInteraction.endsAt||0)){say('等我把手头这件事做完，好吗？');return false}
 const requiredFurniture=meta.requires;
 if(requiredFurniture&&!hasAutonomyFurniture(requiredFurniture)){say('家里还没有适合进行这项活动的家具。');return false}
 const sourceFurniture=(s.placed||[]).find(item=>item.id===options.furnitureId);
 if(options.source==='furniture'&&sourceFurniture&&!furnitureRequirementAvailable(requiredFurniture,sourceFurniture.room)){say('这件家具附近还没有适合进行这项活动的设备。');return false}
 const furnitureId=String(options.furnitureId||options.furnitureKind||'unspecified');
 const attemptKey=hourKey,attemptId=furnitureId+'|'+activity,attempts=s.interactionAttempts[attemptKey]||[];
 if(attempts.includes(attemptId)){say('这一个小时里，我们已经为这件事问过一次了。');return false}
 s.interactionAttempts[attemptKey]=[...attempts,attemptId];
 Object.keys(s.interactionAttempts).forEach(key=>{if(key.slice(0,10)<hourKey.slice(0,10))delete s.interactionAttempts[key]});save();
 if(Math.random()<immediateInteractionRefusalRate){rejectActivityProposal(activity);save();return false}
 const startedAt=now;
 s.activeInteraction={activity,anchor:options.anchor||meta.anchor||null,furnitureId,room:sourceFurniture?.room||'living',startedAt,endsAt:startedAt+immediateInteractionDuration,interrupted:{activity:s.currentActivity||availability.activity||'idle',anchor:s.currentActivityAnchor||null},presentationHourKey:hourKey};
 presentActivity(activity,s.activeInteraction.anchor,s.activeInteraction.room,furnitureId);say('好，陪你一会儿。');save();return true;
}
function presentActivity(activity,anchor=null,room=null,furnitureId=null){
 const a=normalizeActivity(activity);if(!activityMeta[a])return;updateArday3D(a,anchor,room,furnitureId);
}
function hasAutonomyFurniture(requirement){
 const names=(s.placed||[]).filter(item=>item&&typeof item.name==='string').map(item=>item.name);
 if(requirement==='desk')return names.some(name=>name.includes('书桌'));
 if(requirement==='computer')return names.some(name=>name.includes('电脑'));
 if(requirement==='television')return names.some(name=>name==='电视');
 if(requirement==='recordPlayer')return names.some(name=>name==='唱片机');
 if(requirement==='bouquet')return names.some(name=>name==='捧花摆件');
 if(requirement==='bookshelf')return names.some(name=>name.includes('书架'));
 if(requirement==='readingSpot')return names.some(name=>/书架|书桌/.test(name));
 if(requirement==='sink')return names.some(name=>name.includes('水槽'));
 if(requirement==='seat')return names.some(name=>/沙发|椅子|床/.test(name));
 return true;
}
function chooseAutonomousActivity(){
 const recent=(s.activityLog||[]).slice(-5).map(item=>item.activity);
 const temperament=typeof ardayTemperament==='function'?ardayTemperament():{composed:.6,indirect:.4};
 const description=(typeof s.personality==='string'?s.personality:(s.personality?.description||characterStats.personalityTraits?.join(' ')||'')).toLowerCase();
 const candidates=Object.entries(activityMeta).filter(([id,meta])=>meta.autonomous&&meta.autonomy&&id!=='eat'&&hasAutonomyFurniture(meta.requires)).map(([id,meta])=>{
  const spec=meta.autonomy,level=Number(s[spec.need]??50),needScore=Math.max(0,spec.threshold-level)*spec.weight;
  let personality=0;
  if(/好奇|求知|敏锐|聪明|洞察|聪敏|善于思考|理性/.test(description)&&['read','write'].includes(id))personality+=5;
  if(/安静|内向|独处|疏离/.test(description)&&['read','music','rest'].includes(id))personality+=4;
  if(/活泼|外向|热情|健谈/.test(description)&&['chat','walk'].includes(id))personality+=4;
  if(/自律|认真|勤奋|专注/.test(description)&&id==='write')personality+=4;
  if(id==='chat')personality+=(Number(s.friend)||0)*.045+(Number(s.attach)||0)*.025;
  if(id==='rest')personality+=Math.max(0,45-(Number(s.energy)||0))*.22;
  if(id==='computerPlay')personality+=Math.max(0,50-(Number(s.fun)||0))*.16;
  const repeatPenalty=recent.filter(x=>x===id).length*3.2;
  const preference=(Number(s.preferences?.[id==='read'?'reading':id==='write'?'writing':id])||0)*1.8;
  const temperamentBias=id==='rest'?(1-temperament.composed)*1.5:0;
  return {activity:id,score:needScore+(spec.base||0)+personality+preference+temperamentBias-repeatPenalty+Math.random()*3};
 }).filter(item=>Number.isFinite(item.score)&&item.score>=0);
 if(!candidates.length)return 'walk';
 const max=Math.max(...candidates.map(item=>item.score));
 const weighted=candidates.map(item=>({...item,weight:Math.max(.15,item.score-max+5)}));
 const total=weighted.reduce((sum,item)=>sum+item.weight,0);
 let roll=Math.random()*total;
 for(const item of weighted){roll-=item.weight;if(roll<=0)return item.activity}
 return weighted[weighted.length-1].activity;
}
function normalizeActivity(a){return ({reading:'read',listen:'music'})[a]||a||'idle'}
// Resolve every hour through the calendar. Autonomous choice fills only an unassigned slot;
// fixed routines and player proposals already exist as calendar events and take precedence.
function resolveScheduledActivity(key,hour){
 let ev=eventAt(key,hour);
 if(!ev||ev.activity==='autonomous'||normalizeActivity(ev.activity)==='idle'){
  const activity=chooseAutonomousActivity(),meta=activityMeta[activity]||{title:'自己的时间'};
  if(ev){ev.title=meta.menuLabel||meta.title;ev.activity=activity;ev.kind='autonomous';ev.autonomous=true;ev.source=ev.source||'simulation';ev.unresolved=false;ev.resolvedAt=Date.now()}
  else{writeBlockForKey(key,hour,hour+1,{title:meta.menuLabel||meta.title,kind:'autonomous',activity,autonomous:true,source:'simulation',unresolved:false,resolvedAt:Date.now()});ev=eventAt(key,hour)}
  if($('stage').classList.contains('calendar-mode'))renderCalendar();
 }
 return {event:ev,activity:normalizeActivity(ev?.activity||'idle')};
}
function processActivityAt(value){
 const d=new Date(value),hour=d.getHours(),key=ensureScheduleAt(d),hourKey=key+'-'+hour;
 if(s.lastUnifiedHourKey===hourKey)return false;
 // Preserve fractional hourly decay; integer clamping would round small losses to zero.
 const hourlyLoss={energy:Number(energyConfig.hourlyDecay)||0,hunger:Number(needDecay.hungerHourlyDecay)||0,clean:Number(needDecay.cleanHourlyDecay)||0,fun:Number(needDecay.funHourlyDecay)||0};
 for(const [k,loss] of Object.entries(hourlyLoss))s[k]=Math.max(0,Math.min(100,(Number(s[k])||0)-loss));
 
 const resolved=resolveScheduledActivity(key,hour);
 let ev=resolved.event,activity=resolved.activity;
 let placedMealEaten=false;
 if([7,12,18].includes(hour)){
  const meal=(s.placed||[]).find(item=>typeof item.name==='string'&&item.name.startsWith('成品食物·'));
  if(meal){const dishName=meal.name.split('·').slice(1).join('·'),recipe=Object.values(recipes).find(r=>r.name===dishName);s.placed=s.placed.filter(item=>item.id!==meal.id);arday3D?.consumePlacedMeal?.(meal.id);change({hunger:Math.min(45,recipe?.hunger||28),fun:2});placedMealEaten=true;say('这道'+dishName+'是你做的？谢谢，我正好饿了。');remember('meal','Arday吃了'+dishName,2);}
 }
 const meta=activityMeta[activity],sessionId=key+'-'+(ev?.start??hour)+'-'+activity;
 const sessionStart=s.lastProcessedSessionKey!==sessionId;
 if(meta){
  const effects={...(meta.effect||{})};if(activity==='sleep')effects.energy=Number(energyConfig.sleepRecoveryPerHour)||1;else if(Object.prototype.hasOwnProperty.call(energyEffects,activity))effects.energy=Number(energyEffects[activity])||0;
  if(activity==='eat'||activity==='food'){if(!placedMealEaten)say('我有点饿了，不过桌上还没有准备好的饭菜。');delete effects.hunger}
  change(effects);
  
  if(['read','write','chat','computerPlay','watchTV','listenRecords','walk','rest','music','wash'].includes(activity)){
   const preferenceKey=activity==='read'?'reading':activity==='write'?'writing':activity;
   s.preferences[preferenceKey]=(s.preferences[preferenceKey]||0)+1;
  }
  // Scene presentation is applied once after the authoritative state is committed.
 }
 if(sessionStart){
  if(ev?.withPlayer){
   relation(activity);
   if(activity==='walk')advanceSharedGoal(activity,d.getTime());
  }
  if(['read','write'].includes(activity))updatePersonalGoal(activity,d.getTime());
 }
 const workCompleted=settleWorkAt(key,hour,d.getTime());
 if(workCompleted)updatePersonalGoal('work',d.getTime());

 s.lastUnifiedHourKey=hourKey;s.lastHourKey=hourKey;s.currentActivity=activity;s.currentActivityAnchor=ev?.anchor||meta?.anchor||null;
 if(!s.activeInteraction)presentActivity(activity);
 s.lastProcessedSessionKey=sessionId;
 s.activityLog=s.activityLog||[];
 s.activityLog.push({activity,key,hour,at:d.getTime(),withPlayer:!!ev?.withPlayer});
 if(s.activityLog.length>100)s.activityLog.splice(0,s.activityLog.length-100);
 reviewPersonalSpending(d.getTime());
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
 const patterns={desk:/书桌/,computer:/电脑/,television:/^电视$/,recordPlayer:/^唱片机$/,bookshelf:/书架/,readingSpot:/书架|书桌/,sink:/水槽/,seat:/沙发|椅子|床/,bouquet:/^捧花摆件$/};
 const pattern=patterns[requirement];if(!pattern)return true;
 return (s.placed||[]).some(item=>item&&item.room===room&&pattern.test(item.name||''));
}
function closeFurnitureActions(){
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
 const drawer=$('drawer'),choices=$('choices'),sourceFurniture=(s.placed||[]).find(item=>item.id===furnitureId);
 const room=sourceFurniture?.room||( $('stage').classList.contains('bedroom-mode')?'bedroom':$('stage').classList.contains('kitchen-mode')?'kitchen':'living');
 drawer.classList.remove('shop-drawer','profile-expanded');
 drawer.classList.add('furniture-drawer');
 drawer.dataset.furnitureId=furnitureId||'';
 drawer.dataset.furnitureKind=kind;
 $('drawerTitle').textContent=set.title;
 choices.className='choices furniture-choices';
 choices.innerHTML='';
 const blockedReason=furnitureInteractionBlockReason();
 Object.entries(set.activities||{}).forEach(([activity,context])=>{
  const meta=activityMeta[activity];if(!meta)return;
  if(!furnitureRequirementAvailable(meta.requires,room))return;
  const b=document.createElement('button');b.className='choice';b.type='button';b.textContent=activityLabel(activity);
  b.disabled=!!blockedReason;
  if(blockedReason)b.setAttribute('aria-label',activityLabel(activity)+'。'+blockedReason);
  b.onclick=()=>{
   if(b.disabled)return;
   const started=perform(activity,true,{anchor:context?.anchor||null,source:'furniture',furnitureId,furnitureKind:kind});
   if(started)closeFurnitureActions();
  };
  choices.appendChild(b);
 });
 if(!choices.children.length){
  const empty=document.createElement('div');empty.className='furniture-empty';empty.textContent='目前没有可用的互动';choices.appendChild(empty);
 }
 if(blockedReason){
  const note=document.createElement('div');note.className='furniture-status';note.textContent=blockedReason;choices.appendChild(note);
 }
 let close=drawer.querySelector('.furniture-close');
 if(!close){
  close=document.createElement('button');close.type='button';close.className='close furniture-close';close.setAttribute('aria-label','关闭家具互动');close.textContent='×';
  drawer.querySelector('.drawer-head').appendChild(close);
 }
 close.onclick=closeFurnitureActions;
 document.querySelectorAll('.tool').forEach(button=>button.classList.remove('active'));
 drawer.classList.add('open');
}
function resolveCharacterAvailability(at=new Date()){
 const hour=at.getHours(),key=keyAt(at),ev=eventAt(key,hour);
 const activity=normalizeActivity(ev?.activity||(s.lastUnifiedHourKey===key+'-'+hour?s.currentActivity:'idle'));
 if(activity==='sleep')return {status:'sleeping',activity,event:ev,key,hour};
 if(['work','computerWork'].includes(activity)||ev?.kind==='work')return {status:'working',activity,event:ev,key,hour};
 if(['eat','food'].includes(activity))return {status:'eating',activity,event:ev,key,hour};
 if(activity==='walk')return {status:'outside',activity,event:ev,key,hour};
 if(ev&&['busy','unavailable'].includes(ev.kind))return {status:'busy',activity,event:ev,key,hour};
 return {status:'available',activity,event:ev,key,hour};
}
function ardayUnavailable(){return resolveCharacterAvailability().status!=='available'}
function busyBubble(){say('等Arday回家后和他商量吧。')}
function busyBubble(){say('等Arday回家后和他商量吧。')}
function perform(action,force=false,options={}){if(options.source==='furniture'||options.source==='window')return beginImmediateInteraction(action,options);proposeActivityNow(action,force,options)}
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


/* === Shared goals, situational events and personality-aware behavior === */
s.sharedGoal=s.sharedGoal||null;
s.sharedGoalHistory=s.sharedGoalHistory||[];
s.lastRandomEventAt=Number(s.lastRandomEventAt||0);
s.lastSharedProposalAt=Number(s.lastSharedProposalAt||0);

function ardayTemperament(){
 const d=(typeof s.personality==='string'?s.personality:(s.personality?.description||characterStats.personalityTraits?.join(' ')||'')).toLowerCase();
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
  $('evening-together').onclick=()=>{change({friend:1,attach:1,fun:2});say('我就知道你会答应。过来吧，今晚不必赶时间。');remember('evening','你们临时改变安排，共度了一个晚上。',2);completeEvent(e,'一起度过晚上');save();renderEvents()};
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
 $('requestMoney').onclick=()=>{const n=amount();if(!Number.isFinite(n)||n<=0){toast('请输入有效金额');return}if(n>s.personalMoney){say('我个人账户里没有这么多钱。');toast('个人账户余额不足');return}const chance=Math.max(.12,Math.min(.92,.32+s.friend*.004+s.attach*.003-s.hate*.004));if(Math.random()>chance){say('这笔钱我暂时不想转给共同账户。你可以告诉我这笔支出有什么必要。');toast('阿尔暂时拒绝了');return}s.personalMoney-=n;s.money+=n;moneyRecord('personal','expense',n,'转给共同账户');moneyRecord('shared','income',n,'阿尔转入');save();render();showCollection();toast('阿尔转入共同账户 ¥'+n)};
}
window.resignFromJob=function(event){
 if(event){event.preventDefault();event.stopPropagation()}
 if(!s.job?.active){toast('当前没有在职岗位');return false}
 const ended=dayKey(Date.now()),title=s.job.title;s.job.active=false;s.job.endedAt=ended;
 Object.keys(s.calendar?.days||{}).forEach(k=>{if(k>=ended)s.calendar.days[k]=(s.calendar.days[k]||[]).filter(e=>!e.jobShift)});
 addEvent('阿尔辞去了工作','他结束了在'+title+'的任职。','daily');save();showCareer();render();renderCalendar();toast('已离职');return false;
};
function careerPoster(title,index=0){const hue=[18,34,205,275,145][index%5],mark=String(title||'职').trim().slice(0,1);return '<div class="career-poster" style="--poster-hue:'+hue+'"><span class="career-poster-kicker">ARDAY JOURNAL / CAREER '+(index+1)+'</span><strong>'+title+'</strong><i>'+mark+'</i><small>AN EVERYDAY PROFESSION</small></div>'}
function showCareer(){
 $('drawer').classList.remove('profile-expanded','shop-drawer');$('drawerTitle').textContent='职业';$('choices').className='choices career-view';
 if(s.job?.active){
  const j=s.job;
  $('choices').innerHTML=careerPoster(j.title,0)+'<section class="account-balance"><div><span>EMPLOYMENT</span><h2>'+j.title+'</h2></div><div class="account-symbol">¥</div><small>每日薪资 ¥'+j.salary+' · '+pad(j.start)+':00–'+pad(j.end)+':00</small></section><section class="profile-section"><div class="section-kicker">WORK STATUS</div><h3>在职</h3><p>入职日期：'+j.startDate+'</p><div class="calendar-actions"><button id="resignJob" type="button" onclick="window.resignFromJob(event)">辞职</button></div></section>';

 }else{
  const jobs=[
   {id:'assistant-editor',title:'出版编辑助理',salary:185,start:13,end:16,minFriend:12,minEnergy:28,skill:'reading',skillMin:0,desc:'协助整理稿件、核对资料与校对文字'},
   {id:'research-assistant',title:'研究助理',salary:260,start:9,end:12,minFriend:28,minEnergy:42,skill:'reading',skillMin:2,desc:'搜集资料、整理文献并撰写研究摘要'},
   {id:'content-planner',title:'内容策划',salary:225,start:14,end:17,minFriend:20,minEnergy:35,skill:'writing',skillMin:0,desc:'参与内容选题、撰写方案与项目协作'}
  ];
  const applicationDay=keyAt(Date.now());s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};
  $('choices').innerHTML=jobs.map((j,i)=>{
   const attempted=!!s.jobApplications[applicationDay][j.id];
   const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;
   const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+(eligible?.18:0)));
   return '<section class="profile-section job-card">'+careerPoster(j.title,i)+'<div class="section-kicker">POSITION · '+(i+1)+'</div><h3>'+j.title+'</h3><p>'+j.desc+'</p><p>工作时间：'+pad(j.start)+':00–'+pad(j.end)+':00</p><p>每日薪资：¥'+j.salary+'</p><p>申请条件：精力 ≥ '+j.minEnergy+'，友谊 ≥ '+j.minFriend+(j.skillMin?'，阅读经验 ≥ '+j.skillMin:'')+'</p><p>当前录用概率：'+Math.round(chance*100)+'%</p><button class="choice" data-apply-job="'+j.id+'" '+(attempted?'disabled':'')+'>'+(attempted?'今日已申请':'申请职位')+'</button></section>';
  }).join('');
  $('choices').querySelectorAll('[data-apply-job]').forEach(b=>b.onclick=()=>{const j=jobs.find(x=>x.id===b.dataset.applyJob);if(s.jobApplications?.[applicationDay]?.[j.id]){toast('这个职位今天已经申请过了');return}s.jobApplications=s.jobApplications||{};s.jobApplications[applicationDay]=s.jobApplications[applicationDay]||{};s.jobApplications[applicationDay][j.id]={at:Date.now()};save();const skill=j.skill==='reading'?(s.preferences.reading||0):(s.preferences.writing||0),eligible=s.energy>=j.minEnergy&&s.friend>=j.minFriend&&skill>=j.skillMin;if(!eligible){say('这份工作目前的要求还没有达到。我想再积累一些经验，或者等状态好一点再申请。');toast('暂不满足申请条件');showCareer();return}const chance=Math.max(0,Math.min(.92,.18+(s.energy-j.minEnergy)*.008+(s.friend-j.minFriend)*.006+Math.min(15,skill)*.018+.18));if(Math.random()>chance){say('这次面试没有通过。我会再看看其他机会。');addEvent('求职暂未成功','阿尔申请了'+j.title+'，但这次没有获得录用。','daily');save();showCareer();return}const nextWorkday=plusDays(dayAnchor(),1);nextWorkday.setHours(12,0,0,0);const startDate=dayKey(nextWorkday);s.job={...j,active:true,startDate,appliedAt:Date.now(),paidDays:[]};ensureScheduleAt(nextWorkday);save();addEvent('阿尔找到工作了','他获得了'+j.title+'的职位，每日工作 '+pad(j.start)+':00–'+pad(j.end)+':00，日薪 ¥'+j.salary+'。','long');say('我找到工作了。明天开始上班，薪资按天结算。');showCareer();renderCalendar();toast('录用成功')});
 }
 $('drawer').classList.add('open');
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
let cameraGestureMode='pan';
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
  const camera=new T.PerspectiveCamera(38,1,.1,80);
  const isTouchDevice=window.matchMedia('(pointer: coarse)').matches;
  const renderer=new T.WebGLRenderer({antialias:!isTouchDevice,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,isTouchDevice?1.15:1.35));renderer.outputEncoding=T.sRGBEncoding;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
  host=document.createElement('div');host.className='three-scene';host.setAttribute('aria-label','Arday 三维生活场景，可拖动旋转视角');host.appendChild(renderer.domElement);stage.insertBefore(host,stage.firstChild);
  const hemi=new T.HemisphereLight(0xf4f2ed,0x514b43,.72);scene.add(hemi);
  const sun=new T.DirectionalLight(0xfff1dc,1.35);sun.position.set(-4,9,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.near=.5;sun.shadow.camera.far=24;sun.shadow.bias=-.00012;sun.shadow.normalBias=.018;sun.shadow.radius=3;sun.shadow.camera.updateProjectionMatrix();scene.add(sun);
  const fill=new T.DirectionalLight(0xc8d0d8,.28);fill.position.set(5,4,-5);scene.add(fill);
  const daylightWindows=[],practicalLights=[];let lastDaylightUpdate=0;
  const lampShadow=new T.SpotLight(0xffd8a6,0,5.5,Math.PI/3,.82,1.8);lampShadow.castShadow=false;lampShadow.shadow.mapSize.set(256,256);lampShadow.shadow.camera.near=.12;lampShadow.shadow.camera.far=6;lampShadow.shadow.bias=-.00016;lampShadow.shadow.normalBias=.035;lampShadow.shadow.radius=5;scene.add(lampShadow,lampShadow.target);
  function addWindowSun(root,windowGroup){
   const spot=new T.SpotLight(0xffe7bd,0,9,Math.PI/4,.72,1.35);
   spot.position.set(0,2.65,.16);spot.target.position.set(0,.32,3.75);
   spot.castShadow=true;spot.shadow.mapSize.set(256,256);spot.shadow.camera.near=.1;spot.shadow.camera.far=10;spot.shadow.bias=-.00012;spot.shadow.normalBias=.025;spot.shadow.radius=4;
   windowGroup.add(spot,spot.target);
   const beam=new T.Mesh(new T.PlaneGeometry(2.75,3.8),new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false,
    uniforms:{sunColor:{value:new T.Color(0xffdfaa)},sunStrength:{value:0}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform vec3 sunColor;uniform float sunStrength;varying vec2 vUv;
     void main(){vec2 p=vUv*2.0-1.0;float edgeX=1.0-smoothstep(.72,1.0,abs(p.x));float edgeY=1.0-smoothstep(.72,1.0,abs(p.y));float broad=pow(max(0.0,1.0-dot(p*vec2(.78,1.0),p*vec2(.78,1.0))),1.35);float streak=.94+.06*sin((p.x*8.0+p.y*2.0)*3.14159);float alpha=edgeX*edgeY*broad*streak*sunStrength*.18;gl_FragColor=vec4(sunColor,alpha);}`
   }));
   beam.rotation.x=-Math.PI/2;beam.position.set(0,.026,1.42);beam.renderOrder=2;beam.frustumCulled=false;windowGroup.add(beam);
   daylightWindows.push({root,windowGroup,spot,beam});
  }
  function updateDaylight(force=false){
   const now=Date.now();if(!force&&now-lastDaylightUpdate<1000)return;lastDaylightUpdate=now;
   const d=new Date(),h=d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;
   const keys=[{h:0,c:0x26334c,a:.16,s:0,e:.18},{h:5,c:0x596b8a,a:.24,s:.05,e:.3},{h:7,c:0xe8b58a,a:.65,s:.45,e:.55},{h:10,c:0xffedcf,a:1.05,s:1.25,e:.92},{h:14,c:0xfff0d9,a:1.1,s:1.35,e:1},{h:17,c:0xf2a16f,a:.78,s:.8,e:.72},{h:19,c:0x5b6689,a:.32,s:.12,e:.32},{h:21,c:0x29364f,a:.18,s:0,e:.2},{h:24,c:0x26334c,a:.16,s:0,e:.18}];
   let i=0;while(i<keys.length-1&&h>keys[i+1].h)i++;
   const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],t=Math.max(0,Math.min(1,(h-a.h)/(b.h-a.h))),mix=(x,y)=>x+(y-x)*t,col=new T.Color(a.c).lerp(new T.Color(b.c),t);
   hemi.color.copy(col);hemi.intensity=mix(a.a,b.a);sun.color.copy(col).lerp(new T.Color(0xfff1dc),.42);sun.intensity=mix(a.s,b.s);sun.castShadow=sun.intensity>.08;
   sun.position.set(-Math.cos((h-6)/12*Math.PI)*7,8,Math.sin((h-6)/12*Math.PI)*5+1);sun.target.position.set(0,0,0);sun.target.updateMatrixWorld();
   fill.color.copy(col).lerp(new T.Color(0xa8c4e2),.48);fill.intensity=mix(a.e,b.e);renderer.toneMappingExposure=mix(.76,.98,Math.min(1,hemi.intensity));scene.background.copy(col).lerp(new T.Color(0xd9d7d1),.58);
   const daylight=Math.max(0,Math.min(1,(h-5.8)/1.7,(20-h)/2.2)),night=h>=20||h<5?1:h>=18?(h-18)/2:h<7?(7-h)/2:0;
   daylightWindows.forEach(w=>{const active=w.root===(roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:living),strength=mix(a.s,b.s)*1.55*daylight*(active?1:.12),sunDrift=Math.sin((h-8)/12*Math.PI)*1.05;w.spot.intensity=strength;w.spot.target.position.set(sunDrift,.32,3.75);w.spot.target.updateMatrixWorld();w.spot.castShadow=active&&strength>.08;w.beam.position.x=sunDrift*.46;w.beam.material.uniforms.sunStrength.value=daylight*(active?1:.12)*Math.max(.18,mix(a.s,b.s));w.beam.material.uniforms.sunColor.value.copy(col).lerp(new T.Color(0xffdca5),.62)});
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
      float softContrast=smoothstep(0.015,0.98,inkLuminance);
      outgoingLight*=mix(0.94,1.035,softContrast);
      float paperGrain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5;
      outgoingLight*=1.0+paperGrain*0.006;
      #include <tonemapping_fragment>`
    );
   };
   material.customProgramCacheKey=()=> 'arday-soft-light-v3';
   material.roughness=Math.max(material.roughness??.8,.62);
   return material;
  }
  const M=(color,roughness=.82)=>stylizeMaterial(new T.MeshStandardMaterial({color:recolorFurniture(color),roughness}));
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
   uniforms:{outlineColor:{value:new T.Color(0x40352f)},outlineAlpha:{value:.78},outlineThickness:{value:.0085}},
   vertexShader:`uniform float outlineThickness;
    void main(){float wobble=sin(position.x*13.0+position.y*7.0)*sin(position.z*11.0-position.y*5.0);float width=outlineThickness*(1.0+0.10*wobble);vec3 expanded=position+normalize(normal)*width;gl_Position=projectionMatrix*modelViewMatrix*vec4(expanded,1.0);}`,
   fragmentShader:`uniform vec3 outlineColor;uniform float outlineAlpha;
    void main(){gl_FragColor=vec4(outlineColor,outlineAlpha);}`,
   side:T.BackSide,transparent:true,depthTest:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1,toneMapped:false
  });
  function applyInkOutlines(root){
   root.traverse(object=>{
    if(!object.isMesh||object.userData.inkOutline||!object.geometry||!object.geometry.attributes?.normal)return;
    if(!object.geometry.boundingSphere)object.geometry.computeBoundingSphere();
    if((object.geometry.boundingSphere?.radius||0)<.11)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    if(!materials.some(material=>material&&material.isMeshStandardMaterial&&!material.transparent&&(material.opacity??1)>.94&&(material.roughness??1)>.28))return;
    const shell=new T.Mesh(object.geometry,inkOutlineMaterial);
    shell.name='hand-drawn-ink-outline';shell.userData.inkOutline=true;shell.frustumCulled=false;
    shell.castShadow=false;shell.receiveShadow=false;shell.renderOrder=1;
    object.userData.hasInkOutline=true;object.add(shell);
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
  const lampGlowTexture=radialTexture('rgba(255,224,174,.5)','rgba(255,198,126,.16)');
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
   const sideWallMaterial=M(wallColor);sideWallMaterial.transparent=true;sideWallMaterial.opacity=1;sideWallMaterial.depthWrite=false;
   group.userData.leftWall=leftWallGroup;group.userData.rightWall=rightWallGroup;group.userData.frontWall=frontWallGroup;
   // Side walls terminate exactly at the front/back wall planes; all four
   // exterior faces now share the same room footprint without overhangs.
   const leftWall=box(leftWallGroup,-5.3,2.35,0,.2,4.8,8.16,sideWallMaterial);leftWall.castShadow=false;
   const rightWall=box(rightWallGroup,5.3,2.35,0,.2,4.8,8.16,sideWallMaterial.clone());rightWall.material.transparent=true;rightWall.material.depthWrite=false;rightWall.castShadow=false;
   const frontWall=box(frontWallGroup,0,2.35,4.08,10.8,4.8,.2,sideWallMaterial.clone());frontWall.material.transparent=true;frontWall.material.depthWrite=false;frontWall.castShadow=false;
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
  const addWindowView=(windowGroup,centerY)=>{const view=new T.Mesh(new T.PlaneGeometry(2.1,1.85),new T.MeshBasicMaterial({map:outdoorTexture,toneMapped:false,side:T.DoubleSide}));view.position.set(0,centerY,.012);view.renderOrder=1;view.castShadow=false;view.receiveShadow=false;view.userData.windowScenery=true;windowGroup.add(view);const pane=box(windowGroup,0,centerY,.066,2.1,1.85,.035,m.glass);pane.castShadow=false;pane.receiveShadow=false;pane.renderOrder=2;};
  addWindowView(livingWindow,2.6);
  for(const [x,y,w,h] of [[-1.07,2.6,.12,1.95],[1.07,2.6,.12,1.95],[0,3.53,2.2,.12],[0,1.67,2.2,.12],[0,2.6,.08,1.85]])box(livingWindow,x,y,0,w,h,.1,m.oak);
  addWindowDressing(livingWindow,2.1,1.85,0xc7b7a4,2.6);
  const sofa=new T.Group(),table=new T.Group(),desk=new T.Group();living.add(sofa,table,desk);
  // Bedroom shell is intentionally empty; all movable furnishings are shop items.
  const bedroom=new T.Group();scene.add(bedroom);roomShell(bedroom,0xd0d1d0,0xb99b83);
  const bedroomWindow=new T.Group();bedroomWindow.position.set(-2.8,0,-3.88);bedroom.add(bedroomWindow);addWindowSun(bedroom,bedroomWindow);
  addWindowView(bedroomWindow,2.6);
  for(const [x,y,w,h] of [[-1.07,2.6,.12,1.95],[1.07,2.6,.12,1.95],[0,3.53,2.2,.12],[0,1.67,2.2,.12],[0,2.6,.08,1.85]])box(bedroomWindow,x,y,0,w,h,.1,M(0x8a6e68));
  addWindowDressing(bedroomWindow,2.1,1.85,0xb9a9a0,2.6);
  // Kitchen shell keeps its tiled backsplash; cabinets and appliances are purchased separately.
  const kitchen=new T.Group();scene.add(kitchen);roomShell(kitchen,0xd8d5ce,0xc0a487);
  const kitchenWindow=new T.Group();kitchenWindow.position.set(-2.8,0,-3.87);kitchen.add(kitchenWindow);addWindowSun(kitchen,kitchenWindow);
  addWindowView(kitchenWindow,2.6);
  for(const [x,y,w,h] of [[-1.07,2.6,.12,1.95],[1.07,2.6,.12,1.95],[0,3.53,2.2,.12],[0,1.67,2.2,.12],[0,2.6,.08,1.85]])box(kitchenWindow,x,y,0,w,h,.1,M(0x9a7655));
  addWindowDressing(kitchenWindow,2.1,1.85,0xd0c4b1,2.6);
  box(kitchen,0,1.12,-3.91,7.7,.55,.08,M(0xc98d6d));
  for(let x=-3.4;x<=3.4;x+=.48)for(let y=.88;y<=1.35;y+=.42)box(kitchen,x,y,-3.84,.43,.37,.035,M((Math.round((x+3.4)/.48)+Math.round(y*10))%3===0?0xe7b89b:0xd9a184));
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
  let roomMode='living',theta=.68,phi=1.08,radius=13.4,targetTheta=.68,targetPhi=1.08,targetRadius=13.4,cameraTarget=new T.Vector3(0,1,0);
  function applyCamera(){targetPhi=Math.max(.48,Math.min(1.42,targetPhi));targetRadius=Math.max(7.2,Math.min(21,targetRadius))}
  function syncCamera(dt=1){const ease=1-Math.exp(-dt*13);theta+=(targetTheta-theta)*ease;phi+=(targetPhi-phi)*ease;radius+=(targetRadius-radius)*ease;camera.position.set(cameraTarget.x+radius*Math.sin(phi)*Math.sin(theta),cameraTarget.y+radius*Math.cos(phi),cameraTarget.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(cameraTarget);
   [living,bedroom,kitchen].forEach(g=>{if(g.userData.ceilingMesh)g.userData.ceilingMesh.visible=decorating;
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
   const width=item.id?.includes('window')?2.1:item.id?.includes('door')?1.2:(Number(item.width)||.35);
   const half=width/2,limit=wallHalf-half;
   if(Math.abs(offset)>limit)return false;
   for(const other of furnitureRegistry){
    if(other===item||other.room!==item.room||!other.wallAxis||other.wallSide!==side)continue;
    const otherWidth=other.id?.includes('window')?2.1:other.id?.includes('door')?1.2:(Number(other.width)||.35);
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
   const item={id,name,room,group,width,depth,anchor,action,button:null,wallAxis,wallSide,wallRange,wallAnchorY:wallAxis?(anchor?.[1]??2.55)-group.position.y:0};
   const existing=document.querySelector('.spot-'+id);
   item.button=existing||document.createElement('button');
   if(!existing){
    item.button.className='hotspot furniture-hotspot spot-'+id;
    item.button.type='button';item.button.dataset.object=name;item.button.setAttribute('aria-label',name);
    item.button.textContent=id==='desk'?'✎':'▱';stage.appendChild(item.button);
   }
   /* Rebind on every scene rebuild: existing hotspot DOM nodes otherwise retain stale closures or no action. */
   item.button.onclick=()=>{if(decorating){selectFurniture(item);return}invokeFurnitureAction(item)};
   item.button.dataset.object=name;item.button.setAttribute('aria-label',name);
   furnitureRegistry.push(item);return item;
  }
  function registerWallObject({id,name,room,group,axis,side,range,anchor,action}){
   group.userData.furnitureKey=id;group.userData.roomKey=room;group.userData.wallObject=true;
   const saved=s.placed?.find(item=>item.id===id),savedSide=id.includes('window')?'back':(saved?.wallSide||side);
   const offset=saved?.wallOffset??saved?.offset??saved?.position??(savedSide==='back'||savedSide==='front'?group.position.x:group.position.z);
   wallTransform(group,savedSide,offset,saved?.y??group.position.y);
   const button=document.createElement('button');button.className='hotspot furniture-hotspot wall-hotspot spot-'+id;button.type='button';button.textContent=id.includes('door')?'门':'窗';button.setAttribute('aria-label',name);button.dataset.object=name;stage.appendChild(button);
   const item={id,name,room,group,button,wallAxis:savedSide==='back'||savedSide==='front'?'x':'z',wallSide:savedSide,wallRange:range,anchor:anchor||[0,0],action,width:0,depth:0,wallAnchorY:(anchor?.[1]??2.55)-group.position.y};
   button.onclick=()=>{if(decorating)selectFurniture(item);else invokeFurnitureAction(item)};
   furnitureRegistry.push(item);return item;
  }
  const furnitureHotspots=[];
  function enterRoomFromDoor(mode){
   stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode');
   if(mode==='kitchen')stage.classList.add('kitchen-mode');
   if(mode==='bedroom')stage.classList.add('bedroom-mode');
   closeFurnitureActions();
   $('drawer').classList.remove('open','profile-expanded','furniture-drawer');
   $('drawer').querySelector('.furniture-close')?.remove();
   document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));
   updateArday3D();
  }
  // The outdoor view is part of each movable window assembly.
  // The back wall remains solid behind it; no dynamic wall cut-outs are used.
  const wallObjects=[
   registerWallObject({id:'living-window',name:'客厅窗户',room:'living',group:livingWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>perform('read',false,{source:'window',furnitureId:'living-window',anchor:'shelf'})}),
   registerWallObject({id:'bedroom-window',name:'卧室窗户',room:'bedroom',group:bedroomWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>say('窗外的光线落在床边。')}),
   registerWallObject({id:'kitchen-window',name:'厨房窗户',room:'kitchen',group:kitchenWindow,axis:'x',side:'back',range:2.8,anchor:[0,2.65],action:()=>say('厨房窗边透进一些光。')}),
   registerWallObject({id:'living-bedroom-door',name:'卧室门',room:'living',group:livingBedroomDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('bedroom')}),
   registerWallObject({id:'living-kitchen-door',name:'厨房门',room:'living',group:livingKitchenDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('kitchen')}),
   registerWallObject({id:'bedroom-living-door',name:'起居室门',room:'bedroom',group:bedroomLivingDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>enterRoomFromDoor('living')}),
   registerWallObject({id:'kitchen-living-door',name:'起居室门',room:'kitchen',group:kitchenLivingDoor,axis:'z',side:'right',range:3.0,anchor:[0,2.55],action:()=>setRoom('living')})
  ];
  function createOwnedFurniture(name,record=null){
   const variant=name.includes('·')?name.split('·').slice(1).join('·').trim():'';
   const modelName=name.split('·')[0].trim();
   const room=record?.room||roomMode||'living',parent=room==='bedroom'?bedroom:room==='kitchen'?kitchen:living;
   const id=record?.id||('furn-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7));
   const group=new T.Group();group.userData.ownedType=name;group.userData.furnitureKey=id;group.userData.roomKey=room;parent.add(group);
   const mat=(color,rough=.78,metalness=0)=>stylizeMaterial(new T.MeshStandardMaterial({color:recolorFurniture(color),roughness:Math.max(rough,.62),metalness:Math.min(metalness,.45)}));
   const m={wood:mat(0x946746),oak:mat(0xc39a70),fabric:mat(0xb9a1a0,.95),sofa:mat(0xb9a1a0,.95),sofa2:mat(0xd3c5b1,.98),cream:mat(0xeee1cf,.9),dark:mat(0x39434b,.45),metal:mat(0x858783,.3,.72),leaf:mat(0x477a4d,.9),leaf2:mat(0x88a968,.9),clay:mat(0xb56d50),gold:mat(0xc5a15d,.35,.5),wall:mat(0xf0e4d2),screen:mat(0x25465b,.2)};
   const fabricMap=createPainterTexture('fabric'),woodMap=createPainterTexture('wood'),ceramicMap=createPainterTexture('ceramic');
   [m.fabric,m.sofa,m.sofa2].forEach(material=>applyPainterMap(material,fabricMap,.018));
   [m.wood,m.oak].forEach(material=>applyPainterMap(material,woodMap,.012));
   applyPainterMap(m.cream,ceramicMap,.006);applyPainterMap(m.wall,roomWallMap,.004);
   if(modelName==='地毯'){
    const palettes={'波斯绛红':[0x8f3f3a,0xd8b98b,0xead8b8,0xb78b4d],'奶油棋盘':[0xd8c8ad,0x9a8876,0xf0e5d4,0x9b8064],'海盐蓝':[0x55778a,0xb6c6c7,0xe0e5df,0xc2a66e]};
    const p=palettes[variant]||palettes['奶油棋盘'];m.fabric.color.setHex(p[0]);m.sofa2.color.setHex(p[1]);m.cream.color.setHex(p[2]);m.gold.color.setHex(p[3]);
   }
   if(modelName==='灶台'){
    const palettes={'复古珐琅':[0x8c4941,0xe4d4bd,0xb7a18a],'不锈钢':[0x424c54,0xc8d0d2,0x7c8589],'奶油陶瓷':[0xd8c9ae,0xf1e9dc,0xb9a78f]};
    const p=palettes[variant]||palettes['不锈钢'];m.dark.color.setHex(p[0]);m.metal.color.setHex(p[1]);m.cream.color.setHex(p[2]);
   }
   if(modelName==='沙发'&&variant==='雾蓝绒布'){m.fabric.color.setHex(0x657f94);m.sofa2.color.setHex(0x91a4b2);m.wood.color.setHex(0x594b43)}
   if(modelName==='沙发'&&variant==='亚麻燕麦'){m.fabric.color.setHex(0xc4ad91);m.sofa2.color.setHex(0xe1d3bd);m.wood.color.setHex(0x76543a)}
   const box=(x,y,z,w,h,d,material)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;o.receiveShadow=true;return o};
   const cyl=(x,y,z,top,bottom,h,material)=>{const o=new T.Mesh(new T.CylinderGeometry(top,bottom,h,20),material);o.position.set(x,y,z);group.add(o);o.castShadow=true;return o};
   const sphere=(x,y,z,sx,sy,sz,material)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,14),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);group.add(o);o.castShadow=true;return o};
   const restoring=!!record&&['x','y','z','rotation','wallSide','wallOffset'].some(key=>Object.prototype.hasOwnProperty.call(record,key));
   let width=1,depth=1,height=.8,surfaceType='floor',surfaceY=.04,supportId=record?.supportId||null,wallAxis=null,wallSide=null,anchor=[0,.5],action=()=>say(name+'摆放好了。');
   const legs=(w,d,h,t)=>{for(const x of [-w/2+t,w/2-t])for(const z of [-d/2+t,d/2-t])box(x,h/2,z,t,h,t,m.wood)};
   if(modelName==='床'){
    width=3.1;depth=3.45;height=1.25;action=()=>openFurnitureActions('bed',id);const oakFrame=variant==='浅橡木框架',frameMat=oakFrame?m.oak:m.wood,headMat=oakFrame?m.cream:m.fabric,duvet=mat(oakFrame?0xe4ddd0:0xcfc4b6,.98),duvetEdge=mat(oakFrame?0xc8bca9:0xb6a797,.94),piping=mat(oakFrame?0xb29b7d:0x9b8878,.86);box(0,.22,0,2.92,.2,3.2,m.dark);box(0,.38,0,3.12,.16,3.42,frameMat);for(const x of [-1.35,1.35])for(const z of [-1.48,1.48])box(x,.17,z,.12,.28,.12,frameMat);box(0,.59,.08,2.92,.28,3.12,m.fabric);box(0,.75,-.04,2.82,.08,2.96,m.sofa2);box(0,1.08,-1.59,3.12,1.48,.22,frameMat);box(0,1.08,-1.45,2.82,1.18,.12,headMat);box(0,.98,-1.365,2.48,.82,.035,m.sofa2);for(const x of [-1.22,1.22]){box(x,1.05,-1.45,.055,1.12,.16,frameMat);box(x,1.62,-1.45,.16,.12,.17,frameMat)}for(const x of [-.82,.82]){const pillow=sphere(x,.91,-.88,.52,.14,.36,m.cream);pillow.rotation.x=-.16;const seam=sphere(x,.91,-.88,.5,.012,.345,piping);seam.position.z-=.008}const cover=sphere(0,.81,.57,1.36,.12,1.13,duvet);cover.position.y=.82;cover.rotation.x=-.025;box(0,.76,1.63,2.72,.12,.38,duvet);for(let i=0;i<5;i++){const x=-1.02+i*.51;const fold=sphere(x,.91,.52,.025,.012,.92,duvetEdge);fold.rotation.y=(i-2)*.035}box(0,.79,1.08,2.74,.035,.035,piping);
   }else if(modelName==='床头柜'){
    width=.88;depth=.78;height=.92;box(0,.47,0,.86,.76,.72,m.wood);box(0,.87,.02,.94,.1,.8,m.cream);for(const y of [.32,.62]){box(0,y,.37,.76,.25,.035,m.sofa2);for(const x of [-.19,.19])cyl(x,y,.405,.018,.018,.035,m.gold,10)}for(const x of [-.34,.34])box(x,.08,-.27,.09,.16,.09,m.dark);
   }else if(modelName==='台灯'){
    width=.48;depth=.48;height=.92;surfaceType='tabletop';surfaceY=.9;
    if(variant==='蘑菇'){cyl(0,.12,0,.19,.22,.2,m.gold,16);cyl(0,.43,0,.055,.075,.48,m.cream,16);const dome=new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),m.cream);dome.scale.set(.31,.2,.31);dome.position.y=.72;group.add(dome)}else if(variant==='陶瓷折线'){cyl(0,.12,0,.2,.22,.2,m.clay,16);const stem=new T.Mesh(new T.CylinderGeometry(.09,.16,.48,8),m.cream);stem.position.y=.43;group.add(stem);const shade=new T.Mesh(new T.CylinderGeometry(.28,.12,.28,12),m.cream);shade.position.y=.82;group.add(shade)}else{cyl(0,.12,0,.18,.2,.2,m.dark,16);cyl(0,.48,0,.045,.07,.58,m.gold,12);const shade=new T.Mesh(new T.CylinderGeometry(.27,.12,.3,16),m.cream);shade.position.y=.88;group.add(shade)}
   }else if(modelName==='壁灯'){
    width=.72;depth=.22;height=.78;wallAxis='x';wallSide='back';anchor=[0,3.15];box(0,0,-.04,.22,.42,.09,m.gold);cyl(0,-.16,.08,.045,.045,.28,m.gold,12);
    if(variant==='黄铜双臂'){for(const side of [-1,1]){const arm=box(side*.2,.06,.02,.34,.045,.045,m.gold);arm.rotation.z=side*.3;const shade=new T.Mesh(new T.ConeGeometry(.15,.2,12,1,true),m.cream);shade.position.set(side*.34,.22,.1);shade.rotation.x=Math.PI;group.add(shade);cyl(side*.34,.11,.1,.025,.025,.2,m.gold,10)}}else{const shade=new T.Mesh(new T.ConeGeometry(.2,.28,16,1,true),m.cream);shade.position.set(0,.16,.12);shade.rotation.x=Math.PI;group.add(shade);cyl(0,.02,.12,.025,.025,.2,m.gold,10)}
   }else if(modelName==='落地灯'){
    width=.68;depth=.68;height=1.92;surfaceType='floor';surfaceY=.04;
    cyl(0,.045,0,.31,.31,.09,m.dark,24);cyl(0,.105,0,.24,.24,.035,m.gold,24);
    if(variant==='黄铜弧形'){
     const arc=new T.CatmullRomCurve3([new T.Vector3(0,.13,0),new T.Vector3(0,.72,0),new T.Vector3(.12,1.38,0),new T.Vector3(.42,1.76,0),new T.Vector3(.47,1.62,0)]);
     group.add(new T.Mesh(new T.TubeGeometry(arc,32,.035,10,false),m.gold));
     const shade=new T.Mesh(new T.ConeGeometry(.23,.28,24,1,true),m.cream);shade.position.set(.47,1.48,0);shade.rotation.z=Math.PI;group.add(shade);cyl(.47,1.33,0,.035,.035,.13,m.gold,12);
    }else{
     cyl(0,.94,0,.035,.045,1.68,m.gold,16);cyl(0,1.78,0,.045,.045,.12,m.gold,16);
     const shade=new T.Mesh(new T.CylinderGeometry(.27,.16,.38,24,1,true),m.cream);shade.position.y=1.55;group.add(shade);
     const diffuser=new T.Mesh(new T.CircleGeometry(.16,24),m.cream);diffuser.position.y=1.35;diffuser.rotation.x=-Math.PI/2;group.add(diffuser);
    }
   }else if(modelName==='成品食物'){
    width=.72;depth=.72;height=.16;surfaceType='floor';cyl(0,.055,0,.34,.34,.045,m.cream,32);const rim=new T.Mesh(new T.TorusGeometry(.29,.018,8,32),m.gold);rim.rotation.x=Math.PI/2;rim.position.y=.083;group.add(rim);const colors=variant.includes('番茄')?[0xc86b4d,0xf0c77c,0x66834b]:variant.includes('汤')?[0x9aaf78,0xd7b77b,0xb96f4f]:[0xe5bf69,0xd5a94e,0x7e9857];for(let i=0;i<7;i++){const angle=i*Math.PI*2/7,r=.13+(i%3)*.035,food=sphere(Math.cos(angle)*r,.12+(i%2)*.018,Math.sin(angle)*r,.09,.055,.075,mat(colors[i%3],.88));food.rotation.y=angle}for(let i=0;i<3;i++){const garnish=sphere((i-1)*.055,.18,.015,.025,.012,.055,m.leaf2);garnish.rotation.z=(i-1)*.35}
   }else if(modelName==='吊灯'){
    width=.72;depth=.72;height=.5;surfaceType='ceiling';cyl(0,.28,0,.07,.07,.12,m.gold,12);cyl(0,.04,0,.025,.025,.42,m.gold,10);if(variant==='乳白玻璃'){const globe=new T.Mesh(new T.SphereGeometry(.3,20,14),m.cream);globe.position.y=-.22;group.add(globe);cyl(0,-.48,0,.12,.12,.045,m.gold,12)}else{const shade=new T.Mesh(new T.CylinderGeometry(.34,.16,.28,20),m.cream);shade.position.y=-.25;group.add(shade);cyl(0,-.41,0,.18,.18,.035,m.gold,12)}
   }else if(modelName==='衣柜'){
    width=1.85;depth=.78;height=2.45;box(0,1.22,0,1.82,2.38,.74,m.wood);box(0,2.43,0,1.94,.12,.82,m.oak);box(0,.08,0,1.9,.16,.8,m.dark);for(const x of [-.45,.45]){box(x,1.25,.39,.82,2.12,.055,m.sofa2);for(const y of [.35,1.05,1.75,2.15])box(x,y,.423,.68,.018,.012,m.cream);cyl(x+(x<0?.28:-.28),1.25,.45,.025,.025,.1,m.gold,10)}box(0,2.2,.12,.08,.12,.4,m.wood);
   }else if(modelName==='卧室地毯'){
    width=3.4;depth=2.5;surfaceType='rug';box(0,.035,0,3.4,.07,2.5,m.fabric);box(0,.075,0,3.18,.012,2.28,m.sofa2);
   }else if(modelName==='橱柜'){
    width=2.8;depth=.82;height=1.05;surfaceType='table';surfaceY=1.1;box(0,.48,0,2.76,.96,.78,m.wood);box(0,1,0,2.9,.12,.9,m.cream);for(const x of [-.92,0,.92]){box(x,.49,.405,.84,.82,.045,m.sofa2);box(x,.49,.435,.045,.48,.025,m.gold);for(const y of [.24,.72])box(x,y,.44,.66,.018,.012,m.cream)}box(0,.92,-.12,2.62,.035,.58,m.dark);
   }else if(modelName==='吊柜'){
    width=2.2;depth=.48;height=1.05;wallAxis='x';wallSide='back';anchor=[0,2.9];box(0,0,0,2.2,1.05,.48,m.wood);box(0,.54,.25,2.28,.08,.55,m.oak);for(const x of [-.72,0,.72]){box(x,0,.25,.68,.94,.04,m.sofa2);box(x,0,.28,.54,.8,.018,m.cream);cyl(x,0,.32,.018,.018,.06,m.gold,10)}
   }else if(modelName==='冰箱'){
    action=()=>openKitchenPanel();width=1.02;depth=.86;height=2.2;box(0,1.08,0,1.02,2.16,.86,m.cream);box(0,2.19,0,1.04,.08,.88,m.wood);box(0,1.43,.445,.94,1.32,.035,m.sofa2);box(0,.52,.445,.94,.92,.035,m.sofa2);box(0,.99,.47,.94,.035,.025,m.gold);for(const y of [.88,1.72])box(.36,y,.49,.035,.28,.045,m.metal);box(0,.05,0,.98,.08,.82,m.dark);
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
    action=()=>openFurnitureActions('sink',id);width=1.35;depth=.88;height=.98;box(0,.43,0,1.35,.86,.88,m.wood);box(0,.91,0,1.43,.12,.94,m.cream);box(0,.99,-.02,.82,.035,.55,m.metal);box(0,1.01,-.02,.72,.025,.45,m.dark);for(const x of [-.55,.55])box(x,.51,.455,.24,.78,.035,m.sofa2);cyl(0,1.22,-.25,.035,.035,.4,m.metal);cyl(0,1.41,-.08,.035,.035,.38,m.metal);cyl(0,1.24,.02,.09,.09,.045,m.gold,12);
   }else if(modelName==='地毯'){
    width=3.7;depth=2.7;surfaceType='rug';surfaceY=.075;
    box(0,.035,0,width,.07,depth,m.fabric);box(0,.074,0,3.48,.012,2.48,m.cream);box(0,.083,0,3.25,.012,2.25,m.fabric);
    for(const x of [-1.7,1.7])for(const z of [-1.2,1.2])box(x,.092,z,.14,.012,.14,m.gold);
    for(let x=-1.5;x<=1.5;x+=.24){box(x,.08,-1.34,.018,.018,.14,m.gold);box(x,.08,1.34,.018,.018,.14,m.gold)}
    if(variant==='波斯绛红'){
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
    const fabric=mat(variant==='雾蓝绒布'?0x657f94:variant==='亚麻燕麦'?0xc4ad91:0xe4d9c7,.96),fabricShade=mat(variant==='雾蓝绒布'?0x91a4b2:variant==='亚麻燕麦'?0xe1d3bd:0xd3c5b1,.98),welt=mat(variant==='雾蓝绒布'?0x526b80:variant==='亚麻燕麦'?0xb69c7d:0xc2b39e,.92),walnut=mat(variant==='雾蓝绒布'?0x594b43:variant==='亚麻燕麦'?0x76543a:0x67452f,.62),walnutEdge=mat(variant==='雾蓝绒布'?0x71808a:variant==='亚麻燕麦'?0x987451:0x8a6344,.58);
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
     // Traditional high-back silhouette with rolled arms and button tufting.
     for(const x of [-.72,-.36,0,.36,.72]){const tuft= new T.Mesh(new T.SphereGeometry(.035,8,6),gold);tuft.position.set(x,.86,.455);group.add(tuft)}
     box(0,.92,.31,1.78,.16,.13,walnut);for(const x of [-.82,.82]){const roll=soft(x,.78,.18,.18,.12,.48,fabricShade);roll.rotation.z=x<0?-.08:.08}
     width=2.35;depth=1.12;
    }
   }else if(modelName==='壁画'){
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
    action=()=>openFurnitureActions('bookshelf',id);width=1.45;depth=.55;height=2.1;
    for(const x of [-.62,.62]){const side=box(x,1.02,0,.09,2.04,.46,m.wood);side.rotation.z=x<0?-.055:.055}
    for(const [y,w,d] of [[.18,1.3,.5],[.72,1.18,.46],[1.28,1.05,.42],[1.82,.92,.38]])box(0,y,0,w,.075,d,m.oak);
    for(let level=0;level<3;level++)for(let j=0;j<4;j++){const ht=.26+(j%2)*.1;box(-.39+j*.26,.34+level*.55,-.035,.15,ht,.25,[m.clay,m.leaf,m.gold,m.dark][j])}
    if(variant==='玻璃门书柜'){const glass=mat(0xc4d8d9,.18,.12);glass.transparent=true;glass.opacity=.3;box(-.3,1.02,.245,.55,1.7,.025,glass);box(.3,1.02,.245,.55,1.7,.025,glass);box(0,1.02,.265,.035,1.78,.04,m.gold);for(const x of [-.06,.06])cyl(x,1.02,.29,.018,.018,.045,m.gold,10)}
    const braceL=box(-.39,1.02,-.22,.045,1.75,.04,m.gold);braceL.rotation.z=-.28;const braceR=box(.39,1.02,-.22,.045,1.75,.04,m.gold);braceR.rotation.z=.28;
   }else if(modelName==='书桌'||modelName==='餐桌'){
    action=()=>modelName==='书桌'?openFurnitureActions('desk',id):openFurnitureActions('dining',id);const dining=modelName==='餐桌';width=dining?1.95:1.55;depth=dining?1.15:.82;height=dining?.82:.78;surfaceType='table';surfaceY=height+.05;
    if(dining&&variant==='浅橡木长桌'){box(0,.83,0,2.05,.13,1.12,m.oak);box(0,.91,0,1.98,.025,1.05,m.cream);for(const x of [-.82,.82])for(const z of [-.39,.39])box(x,.4,z,.12,.76,.12,m.wood);box(0,.38,0,1.5,.08,.08,m.wood)}else if(dining){cyl(0,.4,0,.13,.2,.72,m.wood,12);cyl(0,.12,0,.62,.62,.13,m.oak,12);cyl(0,.82,0,.08,.08,.1,m.gold,12);cyl(0,.88,0,.62,.58,.12,m.wood,12);cyl(0,.95,0,.57,.57,.035,m.cream,12)}
    else{box(0,.78,0,1.55,.12,.82,m.wood);box(0,.86,0,1.48,.025,.75,m.cream);if(variant==='抽屉工作台'){box(0,.61,.28,.92,.28,.35,m.oak);for(const x of [-.32,.32])cyl(x,.62,.47,.025,.025,.04,m.gold,10)}for(const x of [-.52,.52]){box(x,.38,0,.12,.72,.72,m.wood);box(x,.4,.38,.68,.06,.08,m.oak)}box(0,.59,-.34,1.25,.28,.1,m.wood);for(const x of [-.42,0,.42])cyl(x,.59,-.275,.025,.025,.04,m.gold,10);box(0,1.02,-.34,1.2,.26,.08,m.oak)}
   }else if(modelName==='椅子'||modelName==='餐桌椅'){
    action=()=>openFurnitureActions('chair',id);
    width=variant==='软包扶手椅'?.92:.72;depth=.78;height=1.05;
    if(variant==='藤编餐椅'){box(0,.49,0,.72,.12,.66,m.wood);box(0,.56,.015,.66,.07,.6,m.oak);legs(.7,.64,.48,.06);for(let x=-.25;x<=.251;x+=.09){const slat=box(x,.83,-.28,.025,.48,.045,m.gold);slat.rotation.z=x*-.12}box(0,1.08,-.29,.74,.1,.1,m.wood);}
    else if(variant==='软包扶手椅'){
     // Upholstered lounge chair: wide seat, padded back and projecting arm rests.
     box(0,.49,0,.82,.17,.72,m.wood);box(0,.61,.015,.76,.16,.68,m.fabric);
     box(0,1.0,-.29,.78,.78,.16,m.wood);box(0,1.0,-.195,.68,.62,.08,m.fabric);
     for(const x of [-.42,.42]){box(x,.72,-.015,.12,.52,.68,m.wood);box(x,.86,-.02,.14,.2,.62,m.fabric)}
     legs(.82,.72,.48,.075);
    }else{
     // Windsor chair: open spindle back, shaped crest rail and turned legs.
     box(0,.49,0,.62,.12,.62,m.oak);legs(.62,.62,.48,.065);
     box(0,.98,-.29,.68,.12,.09,m.wood);
     for(let x=-.25;x<=.251;x+=.125)cyl(x,.79,-.29,.025,.025,.42,m.oak,8);
     for(const x of [-.3,.3])box(x,.62,.02,.07,.5,.07,m.wood);
    }
   }else if(modelName==='电脑'){
    action=()=>openFurnitureActions('computer',id);
    width=.72;depth=.55;height=.72;surfaceType='tabletop';surfaceY=.04;
    box(0,.48,-.16,.76,.49,.065,m.dark);box(0,.49,-.122,.704,.425,.012,m.screen);box(0,.245,-.16,.075,.12,.09,m.metal);box(0,.18,-.16,.34,.035,.22,m.metal);
    box(0,.07,.15,.68,.045,.23,m.dark);box(0,.096,.15,.6,.012,.17,m.cream);
    for(const x of [-.43,.43]){box(x,.2,-.14,.085,.22,.12,m.wood);box(x,.2,-.072,.045,.12,.012,m.dark);cyl(x,.2,-.06,.018,.018,.012,m.gold,10)}
    box(0,.74,-.12,.16,.018,.012,m.gold);
   }else if(modelName==='电视'){
    action=()=>openFurnitureActions('television',id);width=1.62;depth=.58;height=1.42;surfaceType='floor';surfaceY=.04;
    box(0,.32,0,1.55,.58,.52,m.wood);box(0,.64,-.015,1.48,.045,.49,m.oak);box(0,.68,-.015,1.42,.025,.45,m.cream);
    for(const x of [-.57,.57])box(x,.075,.12,.09,.15,.1,m.dark);
    box(0,1.2,-.12,1.48,.92,.095,m.dark);box(0,1.2,-.174,1.39,.82,.012,m.screen);
    const tvGlow=box(0,1.2,-.181,1.32,.74,.006,mat(0x66899a,.3));tvGlow.material.emissive=new T.Color(0x1d3542);tvGlow.material.emissiveIntensity=.16;
    box(0,.75,-.12,.12,.16,.09,m.metal);box(0,.66,-.12,.48,.045,.2,m.metal);
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
   }else{toast('没有找到这种家具模型：'+name);return null}
   // Fine finish pass: small joinery, upholstery and hardware details for existing models.
   if(modelName==='床'){for(const x of [-1.36,1.36]){const finial=sphere(x,1.78,-1.57,.075,.075,.075,m.gold);finial.scale.set(.075,.075,.075)}box(0,.73,1.68,2.78,.035,.035,m.cream)}
   if(modelName==='床头柜'){for(const x of [-.31,.31])cyl(x,.075,-.27,.035,.035,.11,m.gold,12);box(0,.49,.414,.24,.025,.018,m.gold)}
   if(modelName==='衣柜'){for(const x of [-.45,.45]){for(const y of [.25,2.2])box(x, y,.426,.72,.035,.025,m.oak);for(const side of [-1,1])box(x+side*.36,1.25,.426,.025,1.9,.025,m.oak);box(x+(x<0?.28:-.28),1.25,.474,.025,.42,.025,m.gold)}box(0,2.52,.02,1.96,.07,.84,m.cream)}
   if(modelName==='橱柜'){for(const x of [-.92,0,.92]){box(x,.49,.442,.72,.72,.018,m.oak);box(x,.49,.454,.66,.66,.012,m.sofa2);cyl(x+(x<0?.25:-.25),.49,.475,.022,.022,.035,m.gold,10)}box(0,1.065,0,2.94,.035,.92,m.oak)}
   if(modelName==='冰箱'){box(0,2.12,.468,.72,.018,.012,m.cream);for(const y of [1.43,.52])box(0,y,.468,.82,.018,.012,m.cream)}
   if(modelName==='水槽'){for(const x of [-.48,.48]){cyl(x,1.02,-.25,.045,.045,.06,m.gold,12);const handle=box(x,1.055,-.25,.12,.025,.035,m.metal);handle.rotation.z=x*.18}box(0,.91,.477,.96,.025,.018,m.oak)}
   if(modelName==='书桌'||modelName==='餐桌'){for(const x of [-.42,.42]){const ferrule=new T.Mesh(new T.CylinderGeometry(.068,.068,.09,12),m.gold);ferrule.position.set(x,.105,.0);group.add(ferrule)}box(0,.16,.0,width*.72,.035,depth*.72,m.oak);for(const x of [-width*.42,width*.42])box(x,height-.07,0,.025,.045,depth*.86,m.gold)}
   if(modelName==='椅子'||modelName==='餐桌椅'){const seatEdge=mat(0x9c8064,.9);for(const x of [-.29,.29]){box(x,.565,.34,.025,.025,.025,m.gold)}if(variant==='软包扶手椅'){for(const x of [-.3,.3]){const piping= new T.Mesh(new T.TorusGeometry(.27,.008,6,24,Math.PI),seatEdge);piping.position.set(x,.66,-.19);piping.rotation.y=Math.PI/2;group.add(piping)}}}
   if(modelName==='书架'){for(let level=0;level<3;level++)for(let j=0;j<4;j++){const x=-.39+j*.26,y=.34+level*.55;box(x,y+.02,.105,.105,.018,.012,m.gold)}}
   if(modelName==='书桌'||modelName==='餐桌'){for(const x of [-.42,.42]){const ferrule=new T.Mesh(new T.CylinderGeometry(.068,.068,.09,12),m.gold);ferrule.position.set(x,.105,.0);group.add(ferrule)}box(0,.16,.0,width*.72,.035,depth*.72,m.oak)}
   if(modelName==='电脑'){const screenGlow=box(0,.49,-.112,.62,.012,.006,mat(0x6b9eb1,.28));screenGlow.material.emissive=new T.Color(0x23485b);screenGlow.material.emissiveIntensity=.28;for(let row=0;row<3;row++)for(let col=0;col<10;col++)box(-.27+col*.06,.104+row*.002,.105+row*.047,.035,.006,.025,m.metal)}
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
   if(modelName==='台灯'||modelName==='壁灯'||modelName==='吊灯'||modelName==='落地灯'){const isCeiling=modelName==='吊灯',isFloor=modelName==='落地灯',lampPoint=new T.PointLight(0xffd39a,isCeiling?2.5:isFloor?1.8:1.05,isCeiling?8.5:isFloor?7:4.8,1.8);lampPoint.position.set(isFloor&&variant==='黄铜弧形'?.47:0,isCeiling?-.56:isFloor?1.48:modelName==='台灯'?.72:-.02,isCeiling?0:modelName==='壁灯'?.24:0);lampPoint.castShadow=false;group.add(lampPoint);const enabled=record?.lightOn!==false,bulb=new T.Mesh(new T.SphereGeometry(isCeiling?.105:.075,16,12),new T.MeshStandardMaterial({color:enabled?0xffe4b5:0x786f63,emissive:enabled?0x8d5422:0x000000,emissiveIntensity:enabled?.55:0,roughness:.28,metalness:.05}));bulb.position.copy(lampPoint.position);group.add(bulb);const glow=new T.Sprite(new T.SpriteMaterial({map:lampGlowTexture,color:0xffdfae,transparent:true,opacity:enabled?.48:0,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));glow.position.copy(lampPoint.position);glow.scale.set(isCeiling?1.15:.82,isCeiling?1.15:.82,1);glow.visible=enabled;group.add(glow);practicalLights.push({light:lampPoint,base:lampPoint.intensity,enabled,bulb,glow,group,room});group.userData.lampLight=lampPoint;group.userData.lampBulb=bulb;action=()=>{const item=furnitureRegistry.find(x=>x.group===group);if(!item)return;item.lightOn=!item.lightOn;const light=practicalLights.find(x=>x.light===lampPoint);if(light){light.enabled=item.lightOn;if(light.glow)light.glow.visible=item.lightOn}updateDaylight(true);persistFurniture(item);toast(item.name+(item.lightOn?'已开启':'已关闭'))}}
   group.position.set(x,y,z);group.rotation.y=rotation;
   const item=registerFurniture({id,name,room,group,width,depth,anchor:wallAxis?[0,anchor[1]]:[0,.5],action,wallAxis,wallSide,wallRange:4.5,record});
   item.owned=true;item.kind=record?.kind||(name.startsWith('成品食物·')?'food':'furniture');if(group.userData.lampLight){item.lightOn=record?.lightOn!==false;const light=practicalLights.find(x=>x.light===group.userData.lampLight);if(light){light.enabled=item.lightOn;if(light.glow)light.glow.visible=item.lightOn}}item.wallAxis=wallAxis;item.wallSide=wallSide;item.wallRange=4.5;item.surfaceType=surfaceType;item.surfaceY=surfaceY;item.supportId=supportId;
   item.dyeMaterials=[];group.traverse(object=>{if(object.isMesh&&object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{if(material?.map===fabricMap&&!item.dyeMaterials.includes(material))item.dyeMaterials.push(material)})}});
   if(record?.dyeColor)item.dyeMaterials.forEach(material=>material.color.setHex(record.dyeColor));item.dyeColor=record?.dyeColor||null;
   if(restoring){
    if(wallAxis){const side=record.wallSide||wallSide||'back',offset=record.wallOffset??(side==='back'||side==='front'?(record.x??x):(record.z??z));wallTransform(group,side,offset,modelName==='吊柜'?y:(record.y??y));item.wallSide=side;item.wallAxis=side==='back'||side==='front'?'x':'z';item.wallAnchorY=(anchor?.[1]??2.55)-group.position.y}
    else{const legacyRugSupport=record.supportId&&s.placed?.some(it=>it.id===record.supportId&&it.name?.startsWith('地毯'));if(legacyRugSupport)item.supportId=null;group.position.set(record.x??x,legacyRugSupport?0:(record.y??y),record.z??z);group.rotation.y=record.rotation||0}
   }
   else{
    let support=null;
    if(surfaceType==='tabletop'||['电脑','捧花摆件'].includes(modelName))support=furnitureRegistry.find(it=>it.room===room&&it.surfaceType==='table');
    let placed=false;
    if(surfaceType==='ceiling'){group.position.set(0,4.45,0);placed=true;}
    else if(surfaceType==='tabletop'&&support){
     item.supportId=support.id;
     const siblings=furnitureRegistry.filter(it=>it.room===room&&it.supportId===support.id);
     const offsets=modelName==='电脑'?[[0,0],[-.36,0],[.36,0],[0,.16],[0,-.16]]:siblings.some(it=>it.name==='电脑')?[[.49,0],[-.49,0],[0,.25],[0,-.25],[0,0]]:[[.49,0],[-.49,0],[0,.25],[0,-.25],[0,0]];
     const co=Math.cos(support.group.rotation.y),si=Math.sin(support.group.rotation.y);
     for(const [ox,oz] of offsets){
      const x=support.group.position.x+ox*co+oz*si,z=support.group.position.z-ox*si+oz*co;
      group.position.set(x,support.group.position.y+support.surfaceY+.015,z);
      group.rotation.y=support.group.rotation.y;
      if(canPlaceFurniture(item,x,z,group.rotation.y)){placed=true;break}
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
    if(!placed){parent.remove(group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);return null}
   }
   s.placed=s.placed||[];
   if(!record)s.placed.push({id,name,room,kind:name.startsWith('成品食物·')?'food':'furniture',x:group.position.x,y:group.position.y,z:group.position.z,rotation:group.rotation.y,supportId:item.supportId||null});
   persistFurniture(item);console.info('[Arday furniture]',name,'meshes:',modelMeshCount,'children:',group.children.length);return item;
  }
  const hotspotWorld=new T.Vector3();
  s.placed=s.placed||[];
  s.placed=s.placed.filter(item=>item?.id!=='arday-cream-walnut-sofa');
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
    persistFurniture(child);
   });
  }
  function persistFurniture(item){
   s.placed=s.placed||[];
   let saved=s.placed.find(x=>x.id===item.id);
   if(!saved){saved={id:item.id,name:item.name,room:item.room,kind:item.kind||(item.owned?'furniture':'scene'),itemId:item.kind==='furniture'?item.name.split('·')[0].trim():item.name,variant:item.kind==='furniture'?item.name.split('·').slice(1).join('·').trim():''};s.placed.push(saved)}
   Object.assign(saved,{name:item.name,room:item.room,itemId:item.kind==='furniture'?item.name.split('·')[0].trim():item.name,variant:item.kind==='furniture'?item.name.split('·').slice(1).join('·').trim():'',x:item.group.position.x,y:item.group.position.y,z:item.group.position.z,rotation:item.group.rotation.y,supportId:item.supportId||null});
   if(item.dyeColor)saved.dyeColor=item.dyeColor;
   if(typeof item.lightOn==='boolean')saved.lightOn=item.lightOn;
   if(item.wallAxis){saved.wallSide=item.wallSide;saved.wallOffset=wallOffset(item)}
   save();
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
   roomMode=mode==='kitchen'||mode==='bedroom'?mode:'living';
   living.visible=roomMode==='living';bedroom.visible=roomMode==='bedroom';kitchen.visible=roomMode==='kitchen';
   const root=roomMode==='bedroom'?bedroom:roomMode==='kitchen'?kitchen:living,finish=s.roomFinishes?.[roomMode],wallpaper=s.roomFinishes?.wallpaper||finish?.wallpaper||'buy-wallpaper-warm-white';
   applyWallpaperToRoom(root,wallpaper);
   if(finish?.floor){root.userData.floorMesh.material=M(finish.floor==='buy-floor-concrete'?0x69727b:0x424d5b)}
   const colors={living:0x343b46,bedroom:0x3b4654,kitchen:0x343b46};scene.background.set(colors[roomMode]);
   cameraTarget.set(0,1,roomMode==='kitchen'?-1:0);updateDaylight(true);
   targetTheta=roomMode==='bedroom'?.55:roomMode==='kitchen'?.78:.68;targetPhi=1.08;targetRadius=roomMode==='bedroom'?12.7:13.4;applyCamera();
  }
  function updateActivity(a,anchorOverride,roomOverride,furnitureIdOverride){
   const act=normalizeActivity(a),meta=activityMeta[act]||{location:'center',pose:'wave',anchor:'default'};
   activeActivity=act;const characterRoom=roomOverride==='bedroom'||roomOverride==='kitchen'?roomOverride:(act==='sleep'?'bedroom':'living');person.visible=characterRoom===roomMode;
   const anchor=anchorOverride||meta.anchor||'default';let p=positions[meta.location]||positions.center,faceAngle=person.rotation.y;
   const furniture=(predicate,room=characterRoom)=>furnitureRegistry.filter(it=>it.room===room&&predicate(it));
   const nearest=(items,origin)=>items.sort((a,b)=>Math.hypot(a.group.position.x-origin.x,a.group.position.z-origin.z)-Math.hypot(b.group.position.x-origin.x,b.group.position.z-origin.z))[0];
   const nearestSeat=(origin,room=characterRoom)=>nearest(furniture(it=>['椅子','餐桌椅'].includes(it.name)||it.name.startsWith('椅子·'),room).filter(it=>Math.hypot(it.group.position.x-origin.x,it.group.position.z-origin.z)<=2.35),origin);
   const faceToward=(from,to)=>Math.atan2(to.x-from.x,to.z-from.z);
   if(anchor==='desk'){
    const sourceFurniture=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride)[0]:null;
    const computer=sourceFurniture?.name==='电脑'?sourceFurniture:furniture(it=>it.name==='电脑'&&it.supportId)[0];
    const desk=sourceFurniture?.name.startsWith('书桌')?sourceFurniture:(computer&&furniture(it=>it.id===computer.supportId)[0])||furniture(it=>it.name.startsWith('书桌'))[0];
    if(desk){const seat=nearestSeat(desk.group.position);
     if(seat){p=[seat.group.position.x,0,seat.group.position.z];faceAngle=faceToward(seat.group.position,desk.group.position)}
     else{const offset=new T.Vector3(0,0,Math.max(.82,desk.depth/2+.48)).applyAxisAngle(new T.Vector3(0,1,0),desk.group.rotation.y);p=[desk.group.position.x+offset.x,0,desk.group.position.z+offset.z];faceAngle=faceToward({x:p[0],z:p[2]},desk.group.position)}}
   }else if(anchor==='shelf'){
    const shelf=furniture(it=>it.name.startsWith('书架'))[0];if(shelf){const seat=nearestSeat(shelf.group.position),offset=new T.Vector3(0,0,-(shelf.depth/2+.52)).applyAxisAngle(new T.Vector3(0,1,0),shelf.group.rotation.y);p=seat?[seat.group.position.x,0,seat.group.position.z]:[shelf.group.position.x+offset.x,0,shelf.group.position.z+offset.z];faceAngle=seat?faceToward(seat.group.position,shelf.group.position):faceToward({x:p[0],z:p[2]},shelf.group.position)}
   }else if(anchor==='sofa'){
    const sofa=furniture(it=>it.name.startsWith('沙发'))[0];if(sofa){const seat=new T.Vector3(0,.61,-.08).applyAxisAngle(new T.Vector3(0,1,0),sofa.group.rotation.y);p=[sofa.group.position.x+seat.x,sofa.group.position.y+seat.y,sofa.group.position.z+seat.z];faceAngle=sofa.group.rotation.y+Math.PI}
   }else if(anchor==='table'){
    const table=furniture(it=>it.name.startsWith('餐桌'))[0];if(table){const offset=new T.Vector3(0,0,-(table.depth/2+.48)).applyAxisAngle(new T.Vector3(0,1,0),table.group.rotation.y);p=[table.group.position.x+offset.x,0,table.group.position.z+offset.z];faceAngle=Math.atan2(table.group.position.x-p[0],table.group.position.z-p[2])}
   }else if(anchor==='chair'){
    const selectedChair=furnitureIdOverride?furniture(it=>it.id===furnitureIdOverride)[0]:null;
    const chair=selectedChair||nearest(furniture(it=>['椅子','餐桌椅'].includes(it.name)||it.name.startsWith('椅子·'),characterRoom),person.position);if(chair){p=[chair.group.position.x,0,chair.group.position.z];faceAngle=chair.group.rotation.y}
   }else if(anchor==='bouquet'){
    const bouquet=furniture(it=>it.name==='捧花摆件')[0];if(bouquet){p=[bouquet.group.position.x,0,bouquet.group.position.z+.9];faceAngle=Math.PI}
   }else if(anchor==='bed'){
    const bed=furniture(it=>it.name.startsWith('床'),'bedroom')[0];if(bed){const half=(Number(bed.depth)||3.42)/2,headBack=2.585,clearance=.16,z=Math.min(half-.2,Math.max(.98,headBack-half+clearance)),offset=new T.Vector3(0,.92,z).applyAxisAngle(new T.Vector3(0,1,0),bed.group.rotation.y);p=[bed.group.position.x+offset.x,bed.group.position.y+offset.y,bed.group.position.z+offset.z];faceAngle=bed.group.rotation.y}
   }
   target.set(...p);pose=meta.pose||'wave';activityFacing=faceAngle;if(['sofa','desk','shelf','table','chair','bouquet','bed'].includes(anchor))person.rotation.y=faceAngle;
   basePose=pose;walkRoute=[];walkIndex=0;walkPauseUntil=0;
   if(act==='walk'){walkRoute=['outside','window','rug','sofa','center'].map(k=>positions[k]);walkIndex=0;target.set(...walkRoute[0]);pose='walk'}
   if(act==='idle'){pose='idle';idleNextMove=performance.now()+1800;idleNextGesture=performance.now()+6500+Math.random()*4000;idleGestureUntil=0}
   rig.rotation.set(0,0,0);rig.position.set(0,0,0);eyeGroups.forEach(g=>{g.scale.y=act==='sleep'?.055:1});if(act==='sleep')rig.rotation.set(-Math.PI/2,0,0);
   body.position.y=pose==='sit'?-.32:0;legs.forEach(l=>{l.hip.rotation.x=pose==='sit'?-1.15:pose==='sleep'?-1.35:0;l.knee.rotation.x=pose==='sit'?1.45:pose==='sleep'?1.5:0});
   arms.forEach((arm,i)=>{arm.shoulder.rotation.z=(pose==='wave'&&i===1)?-.85:(pose==='sit'?.15:0);arm.elbow.rotation.x=pose==='sit'?-1.05:pose==='sleep'?-1.25:0});
  }
  // One-finger orbit and two-finger pinch work on iPad; mouse drag and wheel work too.
  const pointers=new Map();let drag=null,pinchStart=0,pinchRadius=radius,pinchCenter=null,pinchAngle=0,doorTap=null,furnitureTap=null,sceneDismissTap=null,inertiaTheta=0,inertiaPhi=0,dragVelocityTheta=0,dragVelocityPhi=0,lastPointerTime=0;
  let selectedFurniture=null,furnitureDrag=null;
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
   furnitureTap=null;
   if(!decorating){for(const hit of hits){let node=hit.object;while(node&&node!==activeRoom){const key=node.userData?.furnitureKey;if(key){const found=furnitureRegistry.find(x=>x.id===key&&x.room===roomMode);if(found&&found.action){furnitureTap={item:found,pointerId:e.pointerId,x:e.clientX,y:e.clientY};break}}node=node.parent}if(furnitureTap)break}}
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
      const nx=dragPoint.x+furnitureDrag.offsetX,nz=dragPoint.z+furnitureDrag.offsetZ;
      if(item){const previousSupport=item.supportId,previousAllowSupportOverlap=item.allowSupportOverlap,previousAngle=g.rotation.y;let support=null,overlapSupport=null;if(item.surfaceType==='tabletop'||['电脑','捧花摆件'].includes(item.name)){const tables=furnitureRegistry.filter(other=>other.room===item.room&&other.surfaceType==='table');support=tables.find(other=>{const dx=nx-other.group.position.x,dz=nz-other.group.position.z,co=Math.cos(other.group.rotation.y),si=Math.sin(other.group.rotation.y),lx=dx*co-dz*si,lz=dx*si+dz*co;return Math.abs(lx)+item.width/2<=other.width/2-.08&&Math.abs(lz)+item.depth/2<=other.depth/2-.08});if(!support&&previousSupport){const old=furnitureRegistry.find(other=>other.id===previousSupport);if(old&&window.ArdayFurniturePlacement.rectsOverlap(window.ArdayFurniturePlacement.corners(item,nx,nz,g.rotation.y),window.ArdayFurniturePlacement.corners(old)))overlapSupport=old;}}item.supportId=(support||overlapSupport)?.id||null;item.allowSupportOverlap=!!overlapSupport;const nextY=item.surfaceType==='ceiling'?4.45:support?support.group.position.y+support.surfaceY+.015:overlapSupport?overlapSupport.group.position.y+overlapSupport.surfaceY+.015:0;if(support)g.rotation.y=support.group.rotation.y;if(canPlaceFurnitureWithSupports(item,nx,nz,g.rotation.y,nextY)){const ox=g.position.x,oy=g.position.y,oz=g.position.z,oa=previousAngle;g.position.x=nx;g.position.z=nz;g.position.y=nextY;moveSupportedFurniture(item,ox,oy,oz,oa)}else{item.supportId=previousSupport;item.allowSupportOverlap=previousAllowSupportOverlap;g.rotation.y=previousAngle;}}
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
    const tap=doorTap,dist=Math.hypot(e.clientX-tap.x,e.clientY-tap.y);doorTap=null;sceneDismissTap=null;
    if(e.type==='pointerup'&&dist<18){
     stage.classList.remove('calendar-mode','kitchen-mode','bedroom-mode');
     if(tap.target==='kitchen')stage.classList.add('kitchen-mode');
     if(tap.target==='bedroom')stage.classList.add('bedroom-mode');
     $('drawer').classList.remove('open');document.querySelectorAll('.tool').forEach(b=>b.classList.remove('active'));updateArday3D();
    }
    return;
   }
   if(furnitureTap&&furnitureTap.pointerId===e.pointerId){
    const tap=furnitureTap;furnitureTap=null;sceneDismissTap=null;
    if(e.type==='pointerup'&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<18){invokeFurnitureAction(tap.item);return}
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
   let delta=target.clone().sub(person.position),distance=delta.length(),moving=distance>.075;
   if(moving){const step=Math.min(distance,(pose==='idleWalk'?1.7:1.55)*dt);person.position.add(delta.normalize().multiplyScalar(step));}
   if(pose==='walk'&&activeActivity==='walk'){if(moving)walkPauseUntil=0;else if(!walkPauseUntil)walkPauseUntil=t+650;else if(t>=walkPauseUntil){walkIndex=(walkIndex+1)%walkRoute.length;target.set(...walkRoute[walkIndex]);walkPauseUntil=0;}}
   const roamAllowed=activeActivity==='idle';
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
    legs.forEach(l=>{l.hip.rotation.x+=((pose==='sit'?-1.15:pose==='sleep'?-1.35:0)-l.hip.rotation.x)*.12;l.knee.rotation.x+=((pose==='sit'?1.45:pose==='sleep'?1.5:0)-l.knee.rotation.x)*.12});
    const reading=activeActivity==='read',writing=activeActivity==='write',eating=activeActivity==='eat'||activeActivity==='food',typing=['work','computerWork','computerPlay'].includes(activeActivity),watching=activeActivity==='watchTV',listening=activeActivity==='listenRecords'||activeActivity==='music',conversing=activeActivity==='chat'||activeActivity==='tea'||activeActivity==='company',drinkingTea=activeActivity==='tea',inspecting=activeActivity==='bouquet'||activeActivity==='admireFlowers',smelling=activeActivity==='smellFlowers',washing=activeActivity==='wash',resting=activeActivity==='rest'||activeActivity==='sitChair';
    arms.forEach((a,i)=>{
     let shoulderX=pose==='sit'?.04:Math.sin(phase*.55+i*1.7)*.055;
     let elbowX=pose==='sit'?-.18:Math.sin(phase*.45+i)*.045;
     let shoulderZ=pose==='sit'?.15:0;
     if(reading){shoulderX=.12+Math.sin(t*.003+i*2.2)*.075;elbowX=-.58+Math.sin(t*.004+i*2.8)*.12;shoulderZ=(i===0?.23:-.18)+Math.sin(t*.002+i)*.025}
     if(typing){shoulderX=.18+Math.sin(t*.012+i*2.5)*.025;elbowX=-.72+Math.sin(t*.01+i)*.035;shoulderZ=i===0?.16:-.16}
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
     if(reading&&Math.sin(t*.0011)>.985){head.rotation.y+=(.42-head.rotation.y)*.12;head.rotation.x+=(-.08-head.rotation.x)*.12}
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
   body.rotation.z+=(Math.sin(phase*.38)*.018-body.rotation.z)*.05;
   body.rotation.y+=(Math.sin(phase*.24)*.018-body.rotation.y)*.04;
   head.rotation.y+=(Math.sin(phase*.31)*.085-head.rotation.y)*.045;
   head.rotation.x+=(Math.sin(phase*.22)*.025-head.rotation.x)*.04;
   body.position.y+=(Math.sin(t*.0015)*.026-body.position.y)*.08;
   if(t>lastBlink&&activeActivity!=='sleep'){eyeGroups.forEach(g=>{g.scale.y=.12});setTimeout(()=>{if(activeActivity!=='sleep')eyeGroups.forEach(g=>{g.scale.y=1})},90);lastBlink=t+2400+Math.random()*2600;}
   updateFurnitureHotspots();
   if(t-lastDraw>16){renderer.render(scene,camera);lastDraw=t}
   arday3D.raf=requestAnimationFrame(frame)}
  scene.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material],opaque=mats.every(m=>m&&!m.transparent&&(m.opacity??1)>=.98);o.castShadow=opaque&&!o.userData.furnitureContactShadow;o.receiveShadow=opaque&&!o.userData.furnitureContactShadow}});
  updateDaylight(true);applyInkOutlines(scene);
  function cancelGesture(){pointers.forEach((_,id)=>{try{if(gestureSurface.hasPointerCapture(id))gestureSurface.releasePointerCapture(id)}catch(_){}});pointers.clear();drag=null;doorTap=null;pinchStart=0;inertiaTheta=0;inertiaPhi=0;dragVelocityTheta=0;dragVelocityPhi=0}
  arday3D={scene,camera,renderer,host,kitchen,bedroom,living,updateActivity,resize,setRoom,cancelGesture,consumePlacedMeal:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(!item)return false;item.group.parent?.remove(item.group);item.button?.remove();furnitureRegistry.splice(furnitureRegistry.indexOf(item),1);s.placed=s.placed.filter(x=>x.id!==id);save();updateFurnitureHotspots();return true},applyRoomFinish:(id)=>{const finishes=s.roomFinishes||(s.roomFinishes={});const room=roomMode==='bedroom'?'bedroom':roomMode==='kitchen'?'kitchen':'living';if(id.startsWith('buy-wallpaper-')){finishes.wallpaper=id;[living,bedroom,kitchen].forEach(root=>applyWallpaperToRoom(root,id))}else{finishes[room]=finishes[room]||{};finishes[room].floor=id;const root=room==='bedroom'?bedroom:room==='kitchen'?kitchen:living;root.userData.floorMesh.material=M(id==='buy-floor-concrete'?0x69727b:0x424d5b)}} ,getRoom:()=>roomMode,selectFurnitureById:id=>{const item=furnitureRegistry.find(x=>x.id===id);if(item)selectFurniture(item)},placeOwnedFurniture:entity=>{if(!entity||typeof entity!=='object'||!entity.id||!entity.name)return false;const item=createOwnedFurniture(entity.name,{...entity,room:roomMode});if(!item)return false;selectFurniture(item);updateFurnitureHotspots();return true},raf:0};
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
function updateArday3D(activity=s.currentActivity||'idle',anchor=s.currentActivityAnchor||null,room=null,furnitureId=null){
 const stage=$('stage'),mode=stage.classList.contains('kitchen-mode')?'kitchen':stage.classList.contains('bedroom-mode')?'bedroom':'living';
 if(arday3D){arday3D.setRoom(mode);arday3D.updateActivity(activity,anchor,room,furnitureId)}
 else{
  const status=stage.querySelector('.three-status');
  if(status)status.textContent='3D 场景尚未就绪，当前活动将在场景恢复后显示。';
 }
 const label=$('roomLabel');if(label){label.dataset.room=mode;label.textContent=mode==='bedroom'?'卧室':mode==='kitchen'?'厨房':'起居室';}
}

ensurePersonalGoal(Date.now());applyOffline();ensureSchedule();s.visits++;render();renderCalendar();generateDailyEvents();save();
const cameraPanButton=$('cameraPan'),cameraOrbitButton=$('cameraOrbit');
function setCameraGestureMode(mode){cameraGestureMode=mode==='orbit'?'orbit':'pan';cameraPanButton?.classList.toggle('active',cameraGestureMode==='pan');cameraOrbitButton?.classList.toggle('active',cameraGestureMode==='orbit');cameraPanButton?.setAttribute('aria-pressed',cameraGestureMode==='pan'?'true':'false');cameraOrbitButton?.setAttribute('aria-pressed',cameraGestureMode==='orbit'?'true':'false');}
cameraPanButton?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setCameraGestureMode('pan')});
cameraOrbitButton?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setCameraGestureMode('orbit')});
initArday3D();if(s.activeInteraction)presentActivity(s.activeInteraction.activity,s.activeInteraction.anchor||null,s.activeInteraction.room||null);else updateArday3D();
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
