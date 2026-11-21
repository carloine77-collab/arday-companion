(function(global){
 'use strict';
 function create({state,has,remember,addEvent,say}){
  const s=state;
  s.personalMoney=Number.isFinite(s.personalMoney)?Math.max(0,s.personalMoney):0;
  s.personalItems=s.personalItems||[];
  s.moneyLog=s.moneyLog||[];
  s.personalGoalHistory=Array.isArray(s.personalGoalHistory)?s.personalGoalHistory:[];
  s.personalGoals=Array.isArray(s.personalGoals)?s.personalGoals:[];
  if(!s.personalGoals.length&&s.personalGoal?.status==='active')s.personalGoals.push(s.personalGoal);
  delete s.personalGoal;
  delete s.nextGoalAt;
  function moneyRecord(account,kind,amount,note,at=Date.now()){
   s.moneyLog.unshift({account,kind,amount,note,at});
   if(s.moneyLog.length>40)s.moneyLog.length=40;
  }
  function personalGoalCatalog(){
   return [
    {type:'read',title:'读完一本书',condition:'累计完成 5 次阅读活动。',target:5,unit:'次阅读',icon:'▤'},
    {type:'write',title:'整理一份自己的文字',condition:'在书桌前完成 4 次写作或资料整理。',target:4,unit:'次写作',icon:'✎',requires:'书桌'},
    {type:'tidy',title:'把生活空间整理得更顺手',condition:'累计完成 4 次房间整理。',target:4,unit:'次整理',icon:'⌂'},
    {type:'jobs',title:'完成两份工作委托',condition:'成功完成 2 份工作并结算报酬。',target:2,unit:'份工作',icon:'▧'},
    {type:'save',title:'存下 ¥500',condition:'阿尔个人账户余额达到 ¥500。',target:500,unit:'元',icon:'◉'}
   ].filter(x=>(!x.requires||has(x.requires))&&(x.type!=='save'||s.personalMoney<500));
  }
  function ensurePersonalGoal(at=Date.now()){
   s.personalGoals=s.personalGoals.filter(g=>g&&g.status==='active').slice(0,2);
   while(s.personalGoals.length<2){
    const options=personalGoalCatalog().filter(x=>!s.personalGoals.some(g=>g.type===x.type));
    if(!options.length)break;
    const recent=s.personalGoalHistory.slice(0,2).map(x=>x.type);
    const fresh=options.filter(x=>!recent.includes(x.type));
    const pool=fresh.length?fresh:options;
    const g=pool[Math.floor(Math.random()*pool.length)];
    s.personalGoals.push({...g,status:'active',progress:g.type==='save'?Math.min(g.target,s.personalMoney):0,startedAt:at});
    remember('personal-goal','阿尔开始了自己的计划：'+g.title,2);
   }
   return s.personalGoals;
  }
  function updatePersonalGoal(activity,at=Date.now()){
   ensurePersonalGoal(at);
   s.personalGoals.forEach(g=>{
    if(g.status!=='active')return;
    if(g.type==='save')g.progress=Math.min(g.target,Math.max(0,Number(s.personalMoney)||0));
    else if(g.type==='jobs'&&activity==='work')g.progress=(g.progress||0)+1;
    else if(g.type===activity&&['read','write','tidy'].includes(activity))g.progress=(g.progress||0)+1;
    if(g.progress>=g.target){
     g.progress=g.target;g.status='completed';g.completedAt=at;
     s.personalGoalHistory.unshift({type:g.type,title:g.title,completedAt:at});s.personalGoalHistory=s.personalGoalHistory.slice(0,12);
     addEvent('阿尔完成了自己的计划','他完成了「'+g.title+'」。这是他自己决定并推进的一件事。','daily');
     remember('personal-goal','完成自己的计划：'+g.title,2);
     say('这件事总算做完了。');
    }
   });
   ensurePersonalGoal(at);
  }
  function reviewPersonalSpending(at){
   const date=new Date(at),dayKey=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
   if(s.personalLivingCostDay!==dayKey){
    s.personalLivingCostDay=dayKey;
    const due=18+Math.floor(Math.random()*19),paid=Math.min(Math.max(0,Number(s.personalMoney)||0),due);
    if(paid>0){s.personalMoney-=paid;moneyRecord('personal','expense',paid,'日常交通与生活开销',at)}
   }
   if((s.lastPersonalSpendingReview||0)>0&&at-s.lastPersonalSpendingReview<24*3600000)return;
   s.lastPersonalSpendingReview=at;
   if(s.personalGoals.some(g=>g.status==='active'&&g.type==='save'))return;
   if(s.personalMoney<45||Math.random()>.65)return;
   const options=[{name:'一本私人藏书',cost:38},{name:'一套书写用品',cost:46},{name:'一张自己收藏的唱片',cost:58},{name:'一件日常用品',cost:72}].filter(x=>x.cost<=s.personalMoney);
   if(!options.length)return;
   const item=options[Math.floor(Math.random()*options.length)];
   s.personalMoney-=item.cost;s.personalItems.push(item.name);
   moneyRecord('personal','expense',item.cost,'购买'+item.name,at);
   remember('personal-purchase','阿尔用自己的钱买了'+item.name,1);
   addEvent('阿尔买了件自己的东西','他用个人账户购买了'+item.name+'，没有动用共同账户。','daily');
  }
  return {moneyRecord,ensurePersonalGoal,updatePersonalGoal,reviewPersonalSpending};
 }
 global.ArdayEconomy={create};
})(window);
