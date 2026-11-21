(()=>{
 const data=window.ArdayCommissionData;
 const clamp=value=>Math.max(0,Math.min(100,Math.round(Number(value)||0)));
 window.ArdayCommissionSystem={
  create({state,keyAt,addDungeonItem,grantPoints,random=Math.random}){
   const allTasks=data.modules.flatMap(module=>module.tasks.map(task=>({...task,module:module.id,moduleLabel:module.label,moduleMark:module.mark,icon:module.icon})));
   const pick=items=>items.length?items[Math.floor(random()*items.length)]:null;
   const createTask=(definition,slot,source)=>({...definition,slot,source,claimed:false,claimedAt:0});
   function ensureBoard(at=Date.now()){
    const day=keyAt(at),existing=state.dailyCommissions;
    if(!existing||existing.day!==day||!Array.isArray(existing.tasks)){
     const tasks=[],used=new Set();
     data.modules.forEach(module=>{
      const definition=pick(module.tasks.filter(task=>!used.has(task.id)));
      if(definition){used.add(definition.id);tasks.push(createTask({...definition,module:module.id,moduleLabel:module.label,moduleMark:module.mark,icon:module.icon},'core',module.id))}
     });
     const bonus=pick(allTasks.filter(task=>!used.has(task.id)));
     if(bonus)tasks.push(createTask(bonus,'bonus','any'));
     state.dailyCommissions={day,tasks,rerolls:0};
    }else{
     existing.tasks=existing.tasks.filter(task=>task&&typeof task.id==='string'&&Array.isArray(task.activities)&&data.moduleStats[task.module]);
     existing.rerolls=Math.max(0,Math.min(data.freeRerolls,Math.floor(Number(existing.rerolls)||0)));
    }
    return state.dailyCommissions;
   }
   function getProgress(task,at=Date.now()){
    const board=ensureBoard(at),entries=Array.isArray(state.activityLog)?state.activityLog:[];
    const seen=new Set();let count=0;
    entries.forEach(entry=>{
     if(entry?.key!==board.day||!task.activities.includes(entry.activity))return;
     const stamp=task.distinctActivities?entry.activity:(entry.at||String(entry.key)+'-'+String(entry.hour)+'-'+String(entry.activity));
     if(seen.has(stamp))return;seen.add(stamp);count++;
    });
    return Math.min(Math.max(1,Number(task.target)||1),count);
   }
   function claim(id,at=Date.now()){
    const board=ensureBoard(at),task=board.tasks.find(item=>item.id===id);
    if(!task)return {ok:false,reason:'委托不存在'};
    if(task.claimed)return {ok:false,reason:'奖励已经领取'};
    if(getProgress(task,at)<Math.max(1,Number(task.target)||1))return {ok:false,reason:'委托尚未完成'};
    const pool=data.moduleStats[task.module]||[];
    const eligible=pool.filter(key=>{
     const value=task.module==='combat'?state.attributes?.[key]:state[key];
     return clamp(value)<100;
    });
    const statKey=pick(eligible);let fallbackPoints=0;
    if(statKey){
     if(task.module==='combat')state.attributes[statKey]=clamp(state.attributes[statKey])+1;
     else state[statKey]=clamp(state[statKey])+1;
     if(task.module==='combat')state.combat=Math.round(Object.values(state.attributes||{}).reduce((sum,value)=>sum+(Number(value)||0),0)/5);
    }else{
     fallbackPoints=5;if(typeof grantPoints==='function')grantPoints(fallbackPoints);
    }
    let item=null;
    if(task.module==='combat'&&random()<data.combatItemDropChance){
     const itemId=pick(data.combatItemPool);if(itemId&&typeof addDungeonItem==='function')item=addDungeonItem(itemId);
    }
    task.claimed=true;task.claimedAt=at;
    return {ok:true,statKey,statLabel:statKey?data.statLabels[statKey]:'',amount:statKey?1:0,itemName:item?.name||'',fallbackPoints};
   }
   function reroll(id,at=Date.now()){
    const board=ensureBoard(at),taskIndex=board.tasks.findIndex(item=>item.id===id);
    if(taskIndex<0)return {ok:false,reason:'委托不存在'};
    const old=board.tasks[taskIndex];
    if(old.claimed||getProgress(old,at)>0)return {ok:false,reason:'已有进度的委托不能更换'};
    if(board.rerolls>=data.freeRerolls)return {ok:false,reason:'今日更换次数已用完'};
    const used=new Set(board.tasks.map(item=>item.id));
    const candidates=old.source==='any'?allTasks.filter(item=>!used.has(item.id)):allTasks.filter(item=>item.module===old.source&&!used.has(item.id));
    const next=pick(candidates);
    if(!next)return {ok:false,reason:'没有可替换的委托'};
    board.tasks[taskIndex]=createTask(next,old.slot,old.source);board.rerolls++;
    return {ok:true,task:board.tasks[taskIndex]};
   }
   return {ensureBoard,getBoard:()=>ensureBoard(),getProgress,claim,reroll};
  }
 };
})();