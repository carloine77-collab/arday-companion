/* Arday chat matching and relationship-difference selection. */
(()=>{
 'use strict';
 const COPY=()=>window.ArdayChatCopy;
 const LIBRARIES=['d1','d2','d3','d4'];
 const CATEGORY_TOPICS={
  '问候':'greeting','疲惫与休息':'tired','情绪与压力':'mood','金钱与工作':'money',
  '音乐':'music','阅读':'reading','饮食':'food','房间与家具':'room','道歉':'apology',
  '关系':'relationship','通用回应':'general'
 };
 const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().trim();
 const randomItem=items=>items[Math.floor(Math.random()*items.length)];
 const stat=value=>{
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
 };
 function selectLibrary(state){
  const love=stat(state?.love),hate=stat(state?.hate);
  const friend=stat(state?.friend),bored=stat(state?.bored);
  const d1=love-hate,d2=friend-bored;
  let dimension;
  if(love>=80) dimension='D1';
  else if(d1>d2) dimension='D1';
  else if(d2>d1) dimension='D2';
  else dimension=Math.random()<0.5?'D1':'D2';
  const difference=dimension==='D1'?d1:d2;
  let positive=difference>0;
  if(difference===0) positive=Math.random()<0.5;
  const library=dimension==='D1'?(positive?'d1':'d2'):(positive?'d3':'d4');
  return {library,dimension,d1,d2,difference,love,hate,friend,bored,positive};
 }
 function findMatch(input,entries){
  const message=normalize(input);
  if(!message)return null;
  const candidates=[];
  for(const entry of entries||[]){
   let bestLength=0,bestKeyword='';
   for(const keyword of entry.keywords||[]){
    const term=normalize(keyword);
    if(term&&message.includes(term)&&term.length>bestLength){
     bestLength=term.length;bestKeyword=keyword;
    }
   }
   if(bestLength)candidates.push({entry,score:bestLength,keyword:bestKeyword});
  }
  if(!candidates.length)return null;
  const longest=Math.max(...candidates.map(item=>item.score));
  return randomItem(candidates.filter(item=>item.score===longest));
 }
 function respond(input,dependencies){
  const deps=dependencies||{};
  if(typeof deps.isUnavailable==='function'&&deps.isUnavailable()){
   if(typeof deps.busyBubble==='function')deps.busyBubble();
   return {status:'busy'};
  }
  const state=deps.state||{};
  const copy=COPY();
  if(!copy||!Array.isArray(copy.entries)){
   console.error('Arday chat copy data is unavailable.');
   if(typeof deps.busyBubble==='function')deps.busyBubble();
   return {status:'missing-copy'};
  }
  const match=findMatch(input,copy.entries);
  const selection=selectLibrary(state);
  const category=match?.entry.category||'通用回应';
  const pool=match?.entry.replies?.[selection.library]||copy.fallback?.[selection.library]||[];
  const reply=pool.length?randomItem(pool):'我在听。过来，慢慢告诉我。';
  const topic=CATEGORY_TOPICS[category]||'general';
  state.chatTopics=state.chatTopics||{};
  state.chatTopics[topic]=(state.chatTopics[topic]||0)+1;
  if(typeof deps.remember==='function')deps.remember('conversation',String(input).slice(0,55));
  if(typeof deps.say==='function')deps.say(reply);
  if(typeof deps.save==='function')deps.save();
  if(typeof deps.render==='function')deps.render();
  return {
   status:'replied',category,keyword:match?.keyword||null,library:selection.library,
   dimension:selection.dimension,d1:selection.d1,d2:selection.d2,difference:selection.difference
  };
 }
 window.ArdayChatSystem={respond,selectLibrary,findMatch};
})();
