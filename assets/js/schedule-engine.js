/* Autonomous schedule selection and activity-preference engine. */
window.ArdayScheduleEngine = (() => {
 function create(context) {
  const {state:s,furnitureActivities,activityMeta,furnitureKindForPlaced,furnitureRequirementAvailable,hasCookableRecipe,eventAt,writeBlockForKey,renderCalendar,getStage,normalizeActivity}=context;
  if(!s||!furnitureActivities||!activityMeta||typeof normalizeActivity!=='function')throw new Error('ArdayScheduleEngine: missing required dependencies');
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
 if(!candidates.length)return {activity:'idle',room:getStage()?.classList.contains('bathroom-mode')?'bathroom':getStage()?.classList.contains('bedroom-mode')?'bedroom':getStage()?.classList.contains('kitchen-mode')?'kitchen':'living',anchor:'default',furnitureId:null,furnitureKind:null};
 const max=Math.max(...candidates.map(item=>item.score));
 const weighted=candidates.map(item=>({...item,weight:Math.exp((item.score-max)/13)}));
 const total=weighted.reduce((sum,item)=>sum+item.weight,0);
 let roll=Math.random()*total;
 for(const item of weighted){roll-=item.weight;if(roll<=0)return item}
 return weighted[weighted.length-1];
}
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
  if(getStage()?.classList.contains('calendar-mode'))renderCalendar();
 }
 return {event:ev,activity:normalizeActivity(ev?.activity||'idle')};
}
  return {decayActivityPreferences,recordActivityPreference,activityPreferenceScore,furnitureSatisfiesRequirement,hasAutonomyFurniture,autonomousFurnitureOptions,chooseAutonomousActivity,scheduledFurnitureIsValid,resolveScheduledActivity};
 }
 return {create};
})();
