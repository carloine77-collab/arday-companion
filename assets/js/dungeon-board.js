const DUNGEON_BOARD_TILES=Array.from({length:36},(_,i)=>{const t=[['scene','场景','⌂'],['anomaly','异象','◌'],['clue','调查','⌕'],['crisis','危机','△'],['supply','补给','＋'],['turning','节点','◇']][i%6];return [...t]});

const DUNGEON_EVENT_LIBRARY={
scene:{title:'封闭的实验楼',desc:'走廊灯光依次亮起，尽头那扇写着旧校区编号的门后传来拖行声。',options:[{label:'推门进入',effects:{perception:1,energy:-1},chance:1},{label:'贴近门缝观察',effects:{intelligence:1,fun:-1},chance:2},{label:'沿墙绕开',effects:{agility:1,clean:-1}}]},
anomaly:{title:'走廊里的人影',desc:'旧校服学生背对你悬在走廊中央，而墙上的影子却先一步转过了头。',options:[{label:'叫出对方姓名',effects:{willpower:-1,intelligence:1},chance:1},{label:'屏住呼吸后退',effects:{willpower:1,energy:-1}},{label:'从侧面快速通过',effects:{agility:1,energy:-1},chance:-1}]},
clue:{title:'无人认领的日志',desc:'抽屉里的值班日志缺了几页，最后一页写着今晚的日期，笔迹竟与你完全相同。',options:[{label:'仔细比对笔迹',effects:{intelligence:1,perception:1,fun:-1},chance:2},{label:'带走日志',effects:{perception:1,energy:-1},item:'stimulant'},{label:'合上抽屉离开',effects:{willpower:1,clean:1}}]},
crisis:{title:'塌陷的地砖',desc:'脚下地砖突然塌陷，裂缝传来三声敲击，身后的脚步正以相同速度逼近。',options:[{label:'跃过裂缝',effects:{agility:1,energy:-1}},{label:'搬开碎砖寻找落脚点',effects:{strength:1,clean:-1},chance:1},{label:'躲进旁边教室',effects:{willpower:1,fun:-1},chance:-1}]},
supply:{title:'器材室',desc:'器材室里摆着落灰的急救用品，门外的广播正一遍遍念出你的名字。',options:[{label:'翻找急救箱',effects:{perception:1,energy:1},item:'stimulant'},{label:'拿走手电后离开',effects:{agility:1,willpower:1}},{label:'关门藏在柜后',effects:{willpower:1,clean:-1},chance:1}]},
turning:{title:'第三次钟声',desc:'钟楼第三声响起时校园骤然停电，灯光恢复后出口竟出现在教学楼另一侧。',options:[{label:'记录出口位置',effects:{intelligence:1,perception:1},chance:2},{label:'趁黑暗冲向出口',effects:{agility:1,energy:-1},chance:1},{label:'留在原地等待',effects:{willpower:1,fun:-1},chance:-1}]}
};

function dungeonDiceMarkup(value){
 const patterns={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
 return '<span class="dungeon-dice-stage"><span class="dungeon-dice-cube">'+[1,2,3,4,5,6].map(n=>'<span class="dungeon-dice-face face-'+n+'" data-face="'+n+'">'+Array.from({length:9},(_,i)=>'<i class="'+(patterns[n].includes(i)?'pip':'')+'"></i>').join('')+'</span>').join('')+'</span></span>';
}
function dungeonDiceFinalTransform(value){return {1:'rotateX(0deg) rotateY(0deg)',2:'rotateX(0deg) rotateY(-90deg)',3:'rotateX(0deg) rotateY(180deg)',4:'rotateX(0deg) rotateY(90deg)',5:'rotateX(-90deg) rotateY(0deg)',6:'rotateX(90deg) rotateY(0deg)'}[value]||'rotateX(0deg) rotateY(0deg)'}
function dungeonBoardPosition(i){if(i<10)return {r:1,c:i+1};if(i<18)return {r:i-8,c:10};if(i<28)return {r:10,c:28-i};return {r:37-i,c:1}}
function dungeonPlayerTokenMarkup(){return '<i class="dungeon-player-token" aria-label="玩家位置"><i class="token-head"></i><i class="token-body"></i><i class="token-leg token-leg-a"></i><i class="token-leg token-leg-b"></i></i>'}
function renderDungeonBoard(){
 const mission=s.activeDungeon;if(!mission)return;const board=mission.board||(mission.board={steps:0,position:0,chanceModifier:0});
 if(board.version!==2){const oldSteps=Math.max(0,Number(board.steps)||0);board.steps=Math.min(108,oldSteps*3);board.version=2;board.position=board.steps?((board.steps-1)%36):0;board.isRolling=false}
 $('drawerTitle').textContent='副本';$('choices').className='choices infinite-view dungeon-board-view';
 const lap=Math.min(3,Math.floor((board.steps||0)/36)+1),progress=Math.min(100,(board.steps||0)/108*100),current=board.position||0;
 const cells=DUNGEON_BOARD_TILES.map((tile,i)=>{const p=dungeonBoardPosition(i),here=i===current;return '<div class="dungeon-board-cell tone-'+tile[0]+' '+(here?'is-here':'')+'" data-board-cell="'+i+'" style="grid-row:'+p.r+';grid-column:'+p.c+'"><span>'+tile[2]+'</span><b>'+String(i+1).padStart(2,'0')+'</b>'+(here?dungeonPlayerTokenMarkup():'')+'</div>'}).join('');
 const roll=Number(board.lastRoll)||0;
 $('choices').innerHTML='<section class="dungeon-board-cover"><div class="dungeon-board-title">校园</div><div class="dungeon-board-meta"><span>'+mission.tier+'</span><span>'+lap+' / 3</span><span>'+((board.chanceModifier||0)>=0?'+':'')+(board.chanceModifier||0)+'%</span></div><div class="dungeon-board-progress"><i style="width:'+progress+'%"></i></div></section><section class="dungeon-board-map"><div class="dungeon-board-grid">'+cells+'</div><div class="dungeon-board-center"><strong>'+lap+'</strong><small> / 3</small></div></section><section class="dungeon-board-controls"><div class="dungeon-dice-display">'+dungeonDiceMarkup(roll||1)+'</div><button class="dungeon-roll-button" id="dungeonRoll" '+(board.steps>=108||board.isRolling||board.isMoving?'disabled':'')+'><span>投掷</span></button></section>';
 const cube=$('choices').querySelector('.dungeon-dice-cube');if(cube)cube.style.transform=dungeonDiceFinalTransform(roll||1);
 const button=$('dungeonRoll');if(button)button.onclick=rollDungeonBoard;
}
function dungeonMoveTokenTo(position){
 const root=$('choices');if(!root||!root.classList.contains('dungeon-board-view'))return;
 root.querySelectorAll('.dungeon-player-token').forEach(token=>token.remove());root.querySelectorAll('.dungeon-board-cell.is-here').forEach(cell=>cell.classList.remove('is-here'));
 const cell=root.querySelector('[data-board-cell="'+position+'"]');if(cell){cell.classList.add('is-here');cell.insertAdjacentHTML('beforeend',dungeonPlayerTokenMarkup())}
}
function animateDungeonBoardMove(mission,remaining){
 const b=mission.board;if(!b||s.activeDungeon!==mission||!b.isMoving)return;
 if(remaining<=0){
  b.isMoving=false;b.moveTarget=null;const tile=DUNGEON_BOARD_TILES[b.position],base=DUNGEON_EVENT_LIBRARY[tile[0]],event={...base,options:base.options.map(o=>({...o,effects:{...o.effects}}))};
  if(b.steps===36||b.steps===72){event.title=b.steps===36?'广播室':'地下档案室';event.desc=b.steps===36?'广播传出你的声音，控制台的监控画面却停留在十分钟前。':'地下档案柜里每份档案都贴着同一张照片，照片拍摄日期是明天。';event.options=[{label:'检查广播或档案',effects:{intelligence:1,perception:1},chance:1},{label:'破坏异常设备',effects:{strength:1,energy:-1},chance:1},{label:'立即离开现场',effects:{agility:1,willpower:1},chance:-1}]}
  b.pending={event,tile:tile[0]};save();if($('choices')?.classList.contains('dungeon-board-view'))renderDungeonEvent();return;
 }
 b.steps=Math.min(108,b.steps+1);b.position=(b.steps-1)%36;dungeonMoveTokenTo(b.position);
 const root=$('choices'),progress=root?.querySelector('.dungeon-board-progress i');if(progress)progress.style.width=(b.steps/108*100)+'%';
 const center=root?.querySelector('.dungeon-board-center strong');if(center)center.textContent=String(Math.min(3,Math.floor(b.steps/36)+1));
 setTimeout(()=>animateDungeonBoardMove(mission,remaining-1),125);
}
function rollDungeonBoard(){
 const mission=s.activeDungeon;if(!mission||mission.mode!=='board'||mission.board?.pending||mission.board?.result||mission.board?.isRolling||mission.board?.isMoving)return;
 const b=mission.board,roll=1+Math.floor(Math.random()*6);b.isRolling=true;b.lastRoll=roll;
 const button=$('dungeonRoll'),cube=$('choices').querySelector('.dungeon-dice-cube');if(button)button.disabled=true;if(cube){cube.classList.remove('is-rolling');void cube.offsetWidth;cube.classList.add('is-rolling')}
 setTimeout(()=>{if(s.activeDungeon!==mission||mission.mode!=='board')return;b.isRolling=false;const die=$('choices').querySelector('.dungeon-dice-cube');if(die){die.classList.remove('is-rolling');die.style.transform=dungeonDiceFinalTransform(roll)}
  const move=Math.min(roll,108-b.steps);if(move<=0){mission.scheduleEndAt=Date.now();save();settleDungeonIfDue(Date.now());return}b.isMoving=true;b.moveTarget=b.steps+move;animateDungeonBoardMove(mission,move);
 },1050);
}
function dungeonEffectLabel(key){return ({agility:'敏捷',strength:'力量',intelligence:'智力',perception:'感知',willpower:'意志',energy:'精力',hunger:'饥饿',clean:'整洁',fun:'愉悦'})[key]||key}
function renderDungeonResult(){
 const mission=s.activeDungeon;if(!mission?.board?.result)return;const r=mission.board.result;$('drawerTitle').textContent='行动结果';$('choices').className='choices infinite-view dungeon-event-view';
 const rows=(r.changes||[]).map(x=>'<div class="dungeon-result-change '+(x.delta>0?'is-up':x.delta<0?'is-down':'')+'"><span>'+dungeonEffectLabel(x.key)+'</span><b>'+(x.delta>0?'+':'')+x.delta+'</b></div>').join('');
 const chance=r.chanceDelta?'<div class="dungeon-result-change '+(r.chanceDelta>0?'is-up':'is-down')+'"><span>通关概率修正</span><b>'+(r.chanceDelta>0?'+':'')+r.chanceDelta+'%</b></div>':'';
 const item=r.itemName?'<div class="dungeon-result-item">＋ '+r.itemName+'</div>':'';
 const none=!rows&&!chance&&!item?'<p class="dungeon-result-note">没有获得额外收益，行动消耗了时间。</p>':'';
 $('choices').innerHTML='<section class="dungeon-event-modal dungeon-result-modal"><div class="dungeon-result-mark">✓</div><small>行动结果</small><h2>'+r.title+'</h2><p class="dungeon-result-choice">'+r.choice+'</p><div class="dungeon-result-changes">'+rows+chance+item+none+'</div><button class="dungeon-result-continue" id="continueDungeonBoard">返回棋盘</button></section>';
 const button=$('continueDungeonBoard');if(button)button.onclick=continueDungeonBoard;
}
function continueDungeonBoard(){const mission=s.activeDungeon;if(!mission?.board?.result)return;const b=mission.board;b.result=null;if(b.steps>=108){mission.scheduleEndAt=Date.now();save();settleDungeonIfDue(Date.now());return}save();renderDungeonBoard()}
function renderDungeonEvent(){
 const mission=s.activeDungeon;if(!mission?.board?.pending)return;const {event,tile}=mission.board.pending,cell=DUNGEON_BOARD_TILES.find(t=>t[0]===tile);$('drawerTitle').textContent='';$('choices').className='choices infinite-view dungeon-event-view';
 $('choices').innerHTML='<section class="dungeon-event-modal tone-'+tile+'"><div class="dungeon-event-symbol">'+cell[2]+'</div><h2>'+event.title+'</h2><p>'+event.desc+'</p><div class="dungeon-event-choices">'+event.options.map((o,i)=>'<button class="dungeon-event-choice" data-dungeon-choice="'+i+'"><span>'+(i+1)+'</span><b>'+o.label+'</b><i>›</i></button>').join('')+'</div></section>';
 $('choices').querySelectorAll('[data-dungeon-choice]').forEach(button=>button.onclick=()=>resolveDungeonEvent(Number(button.dataset.dungeonChoice)));
}
function resolveDungeonEvent(index){
 const mission=s.activeDungeon;if(!mission?.board?.pending)return;const b=mission.board,event=b.pending.event,option=event.options[index];if(!option)return;
 const changes=[];b.statGains=b.statGains||{};Object.entries(option.effects||{}).forEach(([key,value])=>{const target=key in s.attributes?s.attributes:['energy','hunger','clean','fun'].includes(key)?s:null;if(!target)return;const before=Number(target[key])||0;let delta=Number(value)||0;if(delta>0){const used=Number(b.statGains[key])||0;delta=Math.min(delta,Math.max(0,2-used));b.statGains[key]=used+delta}target[key]=clamp(before+delta);const actual=Number(target[key])-before;if(actual)changes.push({key,delta:actual})});
 s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);mission.snapshot.playerPower=s.combat;mission.snapshot.energy=s.energy;mission.snapshot.hunger=s.hunger;mission.snapshot.clean=s.clean;
 let chanceDelta=0;if(option.chance){const before=Number(b.chanceModifier)||0;b.chanceModifier=Math.max(-10,Math.min(10,before+option.chance));chanceDelta=b.chanceModifier-before}
 let itemName='';if(option.item&&!b.itemFound&&Math.random()<.18){const item=addDungeonItem(option.item);if(item){itemName=item.name||'特殊道具';b.itemFound=true}}
 b.pending=null;b.result={title:event.title,choice:option.label,changes,chanceDelta,itemName};save();renderDungeonResult();
}
function chooseDungeonBoard(){const mission=s.activeDungeon;if(!mission)return;mission.mode='board';mission.boardChoiceMade=true;mission.scheduleEndAt=0;mission.endsAt=0;save();if(mission.board?.pending)renderDungeonEvent();else if(mission.board?.result)renderDungeonResult();else renderDungeonBoard()}
