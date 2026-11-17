(function(global){
 'use strict';
 function create({state,has,remember,addEvent,say}){
  const s=state;
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
 
  return {moneyRecord,ensurePersonalGoal,updatePersonalGoal,reviewPersonalSpending};
 }
 global.ArdayEconomy={create};
})(window);
