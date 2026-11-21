const DUNGEON_BOARD_TYPES=[
 ['scene','场景',['⌂','▤','▥','▦','⌂','▤']],
 ['anomaly','异象',['◌','◉','◍','◌','◉','◍']],
 ['clue','调查',['⌕','▧','▤','⌕','▧','▤']],
 ['crisis','危机',['△','╳','⚠','△','╳','⚠']],
 ['supply','补给',['＋','✚','▣','＋','✚','▣']],
 ['turning','节点',['◇','✧','◈','◇','✧','◈']]
];
const DUNGEON_BOARD_TILES=Array.from({length:36},(_,i)=>{const t=DUNGEON_BOARD_TYPES[i%6],variant=Math.floor(i/6);return [t[0],t[1],t[2][variant],variant]});
const DUNGEON_STAT_LABELS={energy:'精力',hunger:'食欲',clean:'卫生',fun:'娱乐',agility:'敏捷',strength:'力量',intelligence:'智力',perception:'感知',willpower:'意志'};
const DUNGEON_STAT_KEYS=new Set(Object.keys(DUNGEON_STAT_LABELS));
const DUNGEON_BOARD_MAX_STEPS=108;
const DUNGEON_ROUND_STAGES=[
 {title:'01 / 规则',center:'规则',mark:'I'},
 {title:'02 / 调查',center:'调查',mark:'II'},
 {title:'03 / 逃生',center:'逃生',mark:'III'}
];

let dungeonBoardTimer=null,dungeonBoardRunToken=0,dungeonBoardAnimatingMissionId=null;

const C=(stat,difficulty,successText,successEffects,failureText,failureEffects,successChance=1,failureChance=-1)=>({stat,difficulty,success:{text:successText,effects:successEffects,chance:successChance},failure:{text:failureText,effects:failureEffects,chance:failureChance}});
const O=(label,effects={},chance=0,check=null,item=null)=>({label,effects,chance,...(check?{check}:{}),...(item?{item}:{})});
const D=(id,title,desc,options,weight=1)=>({id,title,desc,options,weight});
const DUNGEON_EVENT_LIBRARY={
scene:[
D('scene-chemistry','化学楼的晚自习','实验台上的计时器还剩四十分钟，所有烧杯却映出同一间空教室。',[O('核对实验记录',{intelligence:1},0,C('intelligence',57,'你发现记录中的反应时间被人为改写。',{perception:1},'数据在眼前自行重排，你只得匆忙离开。',{energy:-1})),O('关闭总电源',{strength:1,energy:-1},1),O('从通风廊撤离',{agility:1,clean:-1})]),
D('scene-gym','熄灯后的体育馆','记分牌停在 00:00，篮球从看台深处滚来，落地声却来自头顶。',[O('沿边线快速穿过',{agility:1,energy:-1},0,C('agility',54,'你踩着球声的间隙抵达出口。',{willpower:1},'看台回声扰乱方向，你撞上器材架。',{clean:-1,energy:-1})),O('检查记分牌',{intelligence:1,fun:-1},1),O('躲进器材室',{willpower:1,clean:-1})]),
D('scene-auditorium','礼堂的第二场演出','幕布落下后，台上仍有一道影子保持谢幕姿势，观众席却坐满湿漉漉的空衣服。',[O('拉开幕布',{willpower:1},0,C('willpower',60,'幕布后只有一面朝向观众席的旧镜子。',{perception:1},'镜面里的人群同时起身，你被迫退回走廊。',{fun:-1})),O('检查观众席',{perception:1,energy:-1},1),O('从侧门离开',{agility:1})],.9),
D('scene-rooftop','天台门禁','门禁显示你刚刚刷卡离开，但门外的雨棚下还站着一个与你穿着相同的人。',[O('尝试重置门禁',{intelligence:1},0,C('intelligence',62,'后台记录显示，另一张卡来自明天。',{perception:1},'门锁反向闭合，你被金属边缘划伤。',{clean:-1},2,-1)),O('强行推开门',{strength:1,energy:-1},1),O('从楼梯间绕行',{agility:1,fun:-1})]),
D('scene-specimen','标本走廊','玻璃柜里每只动物都朝向走廊尽头，唯独一只空柜映出了你的背影。',[O('逐柜核对标签',{perception:1,fun:-1},0,C('perception',58,'标签编号指向一间已经拆除的教室。',{intelligence:1},'玻璃后的倒影开始移动，你打碎柜门脱身。',{clean:-1})),O('遮住空柜玻璃',{willpower:1},1),O('直接离开',{agility:1,energy:-1})]),
D('scene-lostfound','失物招领处','登记簿上出现一件尚未丢失的物品，领取人一栏写着你的名字。',[O('翻查旧登记',{intelligence:1},0,C('intelligence',55,'你找到一条与当前路线吻合的地下通道记录。',{perception:1},'登记簿的页码不断减少，你浪费了不少时间。',{energy:-1})),O('取走那件物品',{perception:1},0,null,'fate'),O('销毁登记页',{willpower:1,clean:-1})]),
],
anomaly:[
D('anomaly-rollcall','空座位点名','老师连续点了三次同一个名字。教室里那个空座位，每次都比上一次更靠近你。',[O('回答到',{willpower:1},0,C('willpower',59,'点名声停下，座位恢复原位。',{energy:1},'你的声音从空座位后方传来。',{energy:-2})),O('查看点名册',{intelligence:1,fun:-1},1),O('离开教室',{agility:1,clean:-1})]),
D('anomaly-broadcast','倒放的广播','广播先播报了明天的天气，随后逐字念出你刚才尚未说出口的话。',[O('拆开广播终端',{intelligence:1,energy:-1},0,C('intelligence',61,'你定位到信号来自已拆除的旧楼。',{perception:1},'终端发出刺耳反馈，你只能立即撤离。',{fun:-1},2,-1)),O('记录播报内容',{perception:1},1),O('捂住耳朵离开',{willpower:1,energy:-1})]),
D('anomaly-mirror','镜中迟到者','镜子里的学生比现实慢半拍。你停下时，镜中人仍在向前走。',[O('观察动作差异',{perception:1},0,C('perception',57,'镜中人的脚步指向一条隐藏楼梯。',{intelligence:1},'镜面突然起雾，你的视线短暂失焦。',{energy:-1})),O('用布遮住镜子',{strength:1,clean:-1},1),O('不回头离开',{willpower:1,fun:-1})]),
D('anomaly-vending','自动售货机','售货机屏幕显示“请投递一段记忆”。出货口里传来硬币滚动声。',[O('输入错误密码',{intelligence:1},0,C('intelligence',56,'机器吐出一枚刻着楼层编号的旧硬币。',{perception:1},'屏幕亮起你的学生证照片，机器开始报警。',{willpower:-1})),O('撬开出货口',{strength:1,energy:-1},0,null,'stimulant'),O('拔掉电源',{agility:1,clean:-1})]),
D('anomaly-umbrella','雨伞下的脚步','走廊没有下雨，伞面却不断滴水。伞下传出两个人的脚步，地面只有一组脚印。',[O('跟随第二组脚步',{willpower:1},0,C('willpower',63,'脚步把你带到一扇原本不存在的侧门。',{agility:1},'有人贴近耳边呼吸，你的娱乐状态下降。',{fun:-1})),O('检查地面水迹',{perception:1,clean:-1},1),O('抢走雨伞',{strength:1,energy:-1})]),
D('anomaly-photo','没有脸的合照','毕业合照里所有人的脸都被擦去，只有最后一排多出一个尚未毕业的身影。',[O('辨认背景建筑',{perception:1},0,C('perception',60,'照片拍摄地点是地图上被涂黑的区域。',{intelligence:1},'照片表层剥落，粉尘刺激了眼睛。',{clean:-1},2,-1)),O('撕下多出的身影',{willpower:1,energy:-1},1),O('把照片放回原处',{fun:1,clean:1})],.85)
],
clue:[
D('clue-report','缺页的实验报告','报告结论写着“实验对象已离校”，但实验日期是下周，签名栏是你的笔迹。',[O('复算实验数据',{intelligence:1},0,C('intelligence',58,'公式指向地下设备层的备用电源。',{perception:1},'数据在计算器上变成一串重复日期。',{energy:-1},2,-1)),O('带走原始样本',{perception:1,energy:-1},0,null,'fate'),O('销毁报告',{willpower:1,clean:-1})]),
D('clue-card','失效的门禁卡','卡片记录显示它在十年前刷开了今天的门，卡面却还带着温度。',[O('读取芯片',{intelligence:1},0,C('intelligence',55,'你提取到一段被隐藏的路线数据。',{perception:1},'芯片过热熔断，线索随之消失。',{clean:-1})),O('沿刷卡记录追踪',{perception:1,energy:-1},1),O('折断卡片',{strength:1,willpower:1})]),
D('clue-timetable','被改写的课表','每节课都安排在同一间教室，最后一节的授课教师是“值日生”。',[O('比对课程时间',{intelligence:1},0,C('intelligence',62,'空白时段对应一条未标注的地下通道。',{perception:1},'课表上的时间开始与腕表同步倒退。',{willpower:-1},2,-1)),O('询问值日生',{willpower:1,fun:-1},1),O('撕下最后一页',{strength:1,clean:-1})]),
D('clue-journal','校刊剪报','一篇旧校刊报道了尚未发生的事故，配图中的窗户正是你身后的那一扇。',[O('核对新闻档案',{intelligence:1,fun:-1},0,C('intelligence',57,'原稿留下了事故地点和一段手写警告。',{perception:1},'档案柜自动上锁，你在黑暗中摸索出口。',{energy:-1})),O('拍下剪报',{perception:1},0,null,'stimulant'),O('将剪报烧毁',{willpower:1,clean:-1})]),
D('clue-pipeline','地下管线图','图纸上多出一条通往操场中央的管线，施工单位一栏写着“尚未成立”。',[O('测算管线走向',{intelligence:1},0,C('intelligence',60,'管线尽头连接着一处未登记的设备间。',{perception:1},'线条延伸到纸张之外，你失去了方向。',{energy:-1})),O('寻找检修井',{agility:1,clean:-1},1),O('收起图纸',{willpower:1,fun:1})]),
D('clue-library','图书馆借阅记录','同一本书在闭馆后被借出七次，七个读者都填写了同一个座位号。',[O('调取座位监控',{perception:1},0,C('perception',56,'监控里出现一条通往地下阅览室的楼梯。',{intelligence:1},'监控切成实时视角，你正坐在屏幕里。',{fun:-1})),O('借走那本书',{intelligence:1},0,null,'fate'),O('关闭阅览室',{willpower:1,energy:-1})],.9)
],
crisis:[
D('crisis-stairs','楼梯间的回声','你向下走了两层，楼层指示牌却从 4 变成了 6，身后的脚步没有改变节奏。',[O('跨越两级台阶',{agility:1,energy:-1},0,C('agility',57,'你在楼层错位前冲进安全门。',{willpower:1},'台阶突然延长，你摔倒后擦伤手臂。',{clean:-1,energy:-1})),O('扶墙确认方向',{perception:1,fun:-1},1),O('冲向最近出口',{willpower:1,energy:-2})]),
D('crisis-leak','实验室泄漏','警报灯没有声音，透明液体正沿地面朝你的影子流动。',[O('关闭通风阀',{strength:1,energy:-1},0,C('strength',60,'阀门锁死前被你扳回，危险暂时解除。',{willpower:1},'阀门反弹，液体溅到衣袖。',{clean:-2})),O('寻找防护面罩',{perception:1},0,null,'stimulant'),O('破窗撤离',{agility:1,clean:-1})]),
D('crisis-bridge','玻璃连廊裂纹','脚下玻璃出现蛛网状裂纹，裂纹另一端映出一条并不存在的走廊。',[O('快速跑过',{agility:1,energy:-1},0,C('agility',62,'你在玻璃完全碎裂前抵达对岸。',{energy:1},'碎片划破鞋底，你跌出连廊。',{clean:-1,energy:-2})),O('沿承重梁移动',{strength:1,willpower:1},1),O('原路退回',{perception:1,fun:-1})]),
D('crisis-firedoor','锁闭的防火门','门后有人持续敲击，门牌却标注着“墙体内部，无通道”。',[O('强行破门',{strength:1,energy:-2},0,C('strength',64,'门后是空的消防通道，墙上留有逃生标记。',{perception:1},'门框脱落砸中肩膀，你被迫撤退。',{energy:-1},2,-1)),O('寻找备用钥匙',{intelligence:1,perception:1},1),O('回应敲门声',{willpower:1,fun:-1})]),
D('crisis-equipment','坠落的体育器材','吊环在无人触碰时开始摆动，器材架上的铁片一块块滑向通道。',[O('稳住器材架',{strength:1,clean:-1},0,C('strength',58,'器材停止滑动，架底露出一枚旧钥匙。',{perception:1},'器材架倾倒，你只能跳开避让。',{energy:-1,clean:-1})),O('从垫子上翻越',{agility:1,energy:-1},1),O('拉响警铃',{willpower:1,fun:-1})]),
D('crisis-water','漫水的盥洗室','水位不断上涨，水面上漂着一张写有你当前坐标的纸条。',[O('关闭总阀',{intelligence:1},0,C('intelligence',59,'阀门后藏着一条干燥的检修通道。',{agility:1},'阀门转动后水流反而加快，你仓促爬上隔间。',{energy:-1,clean:-1})),O('踩着隔间翻出',{agility:1,energy:-1},1),O('捞起纸条',{perception:1,clean:-1})],.9)
],
supply:[
D('supply-infirmary','医务室值班窗','窗口后摆着一排药瓶，标签上写着不同日期，最晚的一瓶标注着“刚刚”。',[O('核对药品批次',{intelligence:1},0,C('intelligence',58,'你找到一支未开封的应急注射剂。',{perception:1},'药瓶颜色发生变化，你立刻放弃。',{willpower:1})),O('请求值班人员',{willpower:1,fun:-1},0,null,'stimulant'),O('翻窗离开',{agility:1,clean:-1})]),
D('supply-machine','停运的自动售货机','机器断电多年，出货口却不断落下温热的硬币。',[O('拆开后盖',{strength:1,energy:-1},0,C('strength',56,'你找到一枚可用的校园通行币。',{perception:1},'弹簧机构突然回弹，手腕受到冲击。',{energy:-1})),O('检查电路',{intelligence:1},1),O('取走出货口物品',{perception:1},0,null,'fate')]),
D('supply-security','保安室钥匙板','钥匙板上挂着所有教室的钥匙，唯独值班室的钥匙插在门外。',[O('寻找钥匙编号',{perception:1},0,C('perception',59,'你发现一把标记为“地下层”的钥匙。',{intelligence:1},'钥匙板整体脱落，金属声引来了脚步。',{willpower:-1},2,-1)),O('拿走最旧的钥匙',{agility:1,energy:-1},1),O('锁上保安室',{strength:1,clean:-1})]),
D('supply-club','社团储物柜','柜门贴着一个不存在的社团名称，里面整齐摆放着尚未发放的奖品。',[O('检查社团档案',{intelligence:1},0,C('intelligence',55,'档案显示社团活动地点在旧礼堂地下。',{perception:1},'柜门关闭后无法再次打开，你空手离开。',{fun:-1})),O('取走应急用品',{perception:1},0,null,'stimulant'),O('撬开相邻柜门',{strength:1,clean:-1},1)]),
D('supply-kitchen','食堂后厨','灶台仍有余温，餐盘里放着一份没有菜单编号的晚餐。',[O('检查食物来源',{perception:1},0,C('perception',61,'餐盘底部藏着一张出口示意图。',{intelligence:1},'食物散发出刺鼻气味，你感到反胃。',{hunger:-1,fun:-1})),O('补充体力',{energy:1,hunger:1},0,null,'stimulant'),O('从后门离开',{agility:1,clean:-1})],.95),
D('supply-library','图书馆应急灯','应急灯照亮的只有一排书架，书脊上的编号恰好组成一串坐标。',[O('按编号排列书籍',{intelligence:1},0,C('intelligence',60,'书架移开，露出一处隐藏补给格。',{perception:1},'书架滑轨卡死，灰尘呛得你不断咳嗽。',{clean:-1})),O('取走应急灯',{perception:1},0,null,'fate'),O('记下坐标后离开',{willpower:1,energy:1})])
],
turning:[
D('turning-clock','倒转的校钟','钟面指针逆向移动，钟声却比正常时间快了整整一小时。',[O('校准钟摆',{intelligence:1},0,C('intelligence',62,'钟声停下，校园地图上的出口重新显现。',{perception:1},'钟摆突然加速，你被迫从钟楼撤离。',{energy:-1},2,-1)),O('跟随钟声前进',{willpower:1,energy:-1},1),O('拆下指针',{strength:1,clean:-1})]),
D('turning-map','重新绘制的校园地图','地图上的道路每隔几秒就改变一次，只有你刚走过的路线保持不动。',[O('记忆路线变化',{intelligence:1},0,C('intelligence',57,'你找到了三条路线的共同交点。',{perception:1},'路线变化过快，你无法确认刚才的位置。',{fun:-1})),O('沿旧路返回',{willpower:1,energy:-1},1),O('撕下地图',{strength:1,clean:-1})]),
D('turning-building','不存在的第四栋','导航反复指向第四栋教学楼，校园里却只有三栋楼，远处窗户逐层亮起。',[O('观察亮灯顺序',{perception:1},0,C('perception',61,'灯光组成一条通往出口的箭头。',{intelligence:1},'所有窗户同时亮起，你的判断被彻底打乱。',{willpower:-1})),O('朝亮灯处前进',{agility:1,energy:-1},1),O('关闭导航',{willpower:1,fun:1})]),
D('turning-rain','悬停的雨','雨滴停在半空，只有操场中央的积水仍在向下流动，像一面垂直的镜子。',[O('触碰积水',{willpower:1,clean:-1},0,C('willpower',63,'镜面映出一条真实存在的撤离路线。',{perception:1},'水面传来强烈牵引，你耗费精力挣脱。',{energy:-2},2,-1)),O('绕开操场',{agility:1},1),O('记录雨滴位置',{intelligence:1,fun:-1})]),
D('turning-exit','出口广播','广播宣布出口将在三分钟后关闭，但广播里的倒计时比腕表快了两倍。',[O('计算真实时间',{intelligence:1},0,C('intelligence',60,'你识破倒计时误差，找到提前开放的出口。',{agility:1},'两套时间互相冲突，你错过一段安全窗口。',{energy:-1},2,-1)),O('立即冲刺',{agility:1,energy:-2},1),O('等待广播结束',{willpower:1,fun:-1})]),
D('turning-classroom','终点教室','教室黑板写着“本次调查已结束”，讲台上却放着下一轮的骰子。',[O('检查黑板背面',{perception:1},0,C('perception',64,'黑板后藏着一枚刻有出口符号的筹码。',{intelligence:1},'粉笔字迹渗出水迹，你的注意力被持续消耗。',{fun:-1},2,-1)),O('拿起下一轮骰子',{willpower:1},0,null,'fate'),O('离开教室',{agility:1,energy:-1})],.8)
]
};

function dungeonDiceMarkup(value){
 const patterns={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
 return '<span class="dungeon-dice-stage"><span class="dungeon-dice-cube">'+[1,2,3,4,5,6].map(n=>'<span class="dungeon-dice-face face-'+n+'" data-face="'+n+'">'+Array.from({length:9},(_,i)=>'<i class="'+(patterns[n].includes(i)?'pip':'')+'"></i>').join('')+'</span>').join('')+'</span></span>';
}
function dungeonDiceFinalTransform(value){return {1:'rotateX(0deg) rotateY(0deg)',2:'rotateX(0deg) rotateY(-90deg)',3:'rotateX(0deg) rotateY(180deg)',4:'rotateX(0deg) rotateY(90deg)',5:'rotateX(-90deg) rotateY(0deg)',6:'rotateX(90deg) rotateY(0deg)'}[value]||'rotateX(0deg) rotateY(0deg)'}
function ensureDungeonBoardLayout(board){const layout=board.tileLayout;if(Array.isArray(layout)&&layout.length===36&&new Set(layout).size===36&&layout.every(index=>Number.isInteger(index)&&index>=0&&index<36))return layout;const next=Array.from({length:36},(_,i)=>i);for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}board.tileLayout=next;return next}
function dungeonBoardPosition(i){if(i<10)return {r:1,c:i+1};if(i<18)return {r:i-8,c:10};if(i<28)return {r:10,c:28-i};return {r:37-i,c:1}}
function dungeonPlayerTokenMarkup(){return '<i class="dungeon-player-token" aria-label="玩家位置"><i class="token-head"></i><i class="token-body"></i><i class="token-leg token-leg-a"></i><i class="token-leg token-leg-b"></i></i>'}
function renderDungeonBoard(){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};
 const mission=s.activeDungeon;if(!mission)return;if(settleDungeonIfDue?.(Date.now()))return;const board=mission.board||(mission.board={version:3,missionId:mission.id,steps:0,position:0,chanceModifier:0});board.eventHistory=Array.isArray(board.eventHistory)?board.eventHistory:[];if(board.missionId&&board.missionId!==mission.id)return;board.missionId=mission.id;
 if(board.version!==3){const oldVersion=Number(board.version)||0;if(oldVersion<2){const oldSteps=Math.max(0,Number(board.steps)||0);board.steps=Math.min(DUNGEON_BOARD_MAX_STEPS,oldSteps*3)}board.steps=Math.max(0,Math.min(DUNGEON_BOARD_MAX_STEPS,Math.floor(Number(board.steps)||0)));board.position=board.steps%36;board.version=3;if(!Number.isInteger(Number(board.pendingRoll))||Number(board.pendingRoll)<1||Number(board.pendingRoll)>6)board.isRolling=false;if(!Number.isInteger(Number(board.moveTarget))||Number(board.moveTarget)<=board.steps||Number(board.moveTarget)>DUNGEON_BOARD_MAX_STEPS)board.isMoving=false;save()}
 $('drawerTitle').textContent='副本';$('choices').className='choices infinite-view dungeon-board-view';
 const lap=Math.min(3,Math.floor((board.steps||0)/36)+1),progress=Math.min(100,(board.steps||0)/DUNGEON_BOARD_MAX_STEPS*100),current=board.position||0,stage=DUNGEON_ROUND_STAGES[lap-1];
 const hasLayout=Array.isArray(board.tileLayout)&&board.tileLayout.length===36&&new Set(board.tileLayout).size===36&&board.tileLayout.every(index=>Number.isInteger(index)&&index>=0&&index<36),layout=ensureDungeonBoardLayout(board);if(!hasLayout)save();const cells=layout.map((tileIndex,i)=>{const tile=DUNGEON_BOARD_TILES[tileIndex],p=dungeonBoardPosition(i),here=i===current,round=Math.floor(i/12)+1;return '<div class="dungeon-board-cell tone-'+tile[0]+' tile-variant-'+tile[3]+' lap-'+round+' '+(here?'is-here':'')+'" data-board-cell="'+i+'" aria-label="'+(i+1)+' '+tile[1]+'" style="grid-row:'+p.r+';grid-column:'+p.c+'"><span>'+tile[2]+'</span><b>'+String(i+1).padStart(2,'0')+'</b>'+(here?dungeonPlayerTokenMarkup():'')+'</div>'}).join('');
 const roll=Number(board.lastRoll)||0;
 $('choices').innerHTML='<section class="dungeon-board-cover stage-'+lap+'"><div class="dungeon-campus-art" aria-hidden="true"><svg class="campus-engraving" viewBox="0 0 900 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="campusSky" x2="0" y2="1"><stop stop-color="#172b36"/><stop offset=".7" stop-color="#52645d"/><stop offset="1" stop-color="#a49a7d"/></linearGradient><linearGradient id="campusStone" x2="1"><stop stop-color="#182b32"/><stop offset=".48" stop-color="#647166"/><stop offset="1" stop-color="#20343a"/></linearGradient><radialGradient id="campusMoon"><stop stop-color="#fff4d7"/><stop offset="1" stop-color="#d1c39e"/></radialGradient></defs><rect width="900" height="300" fill="url(#campusSky)"/><circle cx="690" cy="75" r="38" fill="url(#campusMoon)" opacity=".88"/><circle cx="690" cy="75" r="55" fill="none" stroke="#e4d7b7" stroke-opacity=".22"/><g fill="none" stroke="#d8c9a7" stroke-opacity=".38"><path d="M0 205 Q150 175 300 204 T600 196 T900 190"/><path d="M0 221 Q160 194 320 220 T640 208 T900 207"/></g><g fill="url(#campusStone)" stroke="#c8bb9c" stroke-opacity=".42" stroke-width="1.5"><path d="M70 300V185h35v-22h145v22h34v115z"/><path d="M110 185l12-24h111l13 24z"/><path d="M320 300V130h38V90h22V55h28v35h22v40h38v170z"/><path d="M350 130l39-40 39 40z"/><path d="M650 300V190h38v-22h125v22h35v110z"/><path d="M690 190l14-25h100l14 25z"/></g><g fill="#e1d2aa" opacity=".72"><path d="M375 154h18v28h-18zM375 205h18v28h-18zM375 256h18v28h-18zM145 215h16v24h-16zM190 215h16v24h-16zM720 215h16v24h-16zM765 215h16v24h-16z"/></g><g fill="none" stroke="#e0d2b1" stroke-opacity=".52" stroke-width="1"><path d="M0 270H900M0 282H900M300 300l90-88 90 88M600 300l90-60 90 60"/></g><g fill="#172a30"><path d="M0 300q35-70 70 0M25 300q45-95 90 0M830 300q35-75 70 0M790 300q45-95 90 0"/></g><g fill="#f1e4c5" opacity=".75"><circle cx="115" cy="55" r="1.5"/><circle cx="235" cy="42" r="1.2"/><circle cx="490" cy="50" r="1.3"/><circle cx="815" cy="40" r="1.4"/><circle cx="565" cy="100" r="1"/></g></svg><div class="campus-haze"></div></div><div class="dungeon-cover-poster"><span class="campus-edition">NIGHT STUDY　/　03</span><span class="dungeon-board-title">校园</span><span class="campus-seal" aria-hidden="true">夜</span></div></section><section class="dungeon-board-map"><div class="dungeon-board-grid">'+cells+'</div><div class="dungeon-board-center"><small>'+stage.center+'</small><strong>'+lap+'</strong><small> / 3</small></div></section><section class="dungeon-board-controls"><button class="dungeon-board-exit" id="leaveDungeonBoard" type="button" aria-label="退出转盘">退出转盘</button><div class="dungeon-dice-display">'+dungeonDiceMarkup(roll||1)+'</div><button class="dungeon-roll-button" id="dungeonRoll" '+(board.steps>=DUNGEON_BOARD_MAX_STEPS||board.isRolling||board.isMoving?'disabled':'')+'><span>投掷</span></button></section>';
 const cube=$('choices').querySelector('.dungeon-dice-cube');if(cube)cube.style.transform=dungeonDiceFinalTransform(roll||1);
 const button=$('dungeonRoll');if(button)button.onclick=rollDungeonBoard;const leave=$('leaveDungeonBoard');if(leave)leave.onclick=leaveDungeonBoard;
 resumeDungeonBoard(mission);
}
function dungeonMoveTokenTo(position){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};
 const root=$('choices');if(!root||!root.classList.contains('dungeon-board-view'))return;
 root.querySelectorAll('.dungeon-player-token').forEach(token=>token.remove());root.querySelectorAll('.dungeon-board-cell.is-here').forEach(cell=>cell.classList.remove('is-here'));
 const cell=root.querySelector('[data-board-cell="'+position+'"]');if(cell){cell.classList.add('is-here');cell.insertAdjacentHTML('beforeend',dungeonPlayerTokenMarkup())}
}
function pauseDungeonBoard(){const runtime=window.ArdayDungeonBoardRuntime||{},mission=runtime.state?.activeDungeon;if(!mission||mission.mode!=='board')return false;if(dungeonBoardTimer!==null)clearTimeout(dungeonBoardTimer);dungeonBoardTimer=null;dungeonBoardRunToken++;dungeonBoardAnimatingMissionId=null;runtime.save?.();return true}
function leaveDungeonBoard(){const runtime=window.ArdayDungeonBoardRuntime||{},mission=runtime.state?.activeDungeon;if(!mission)return;pauseDungeonBoard();if(runtime.settleDungeonIfDue?.(Date.now()))return;runtime.showDungeon?.()}
function resumeDungeonBoard(mission){const runtime=window.ArdayDungeonBoardRuntime||{},b=mission?.board;if(!b||runtime.state?.activeDungeon!==mission||mission.mode!=='board')return;if(runtime.settleDungeonIfDue?.(Date.now()))return;if(b.steps>=DUNGEON_BOARD_MAX_STEPS&&!b.pending&&!b.result){mission.scheduleEndAt=Date.now();mission.endsAt=mission.scheduleEndAt;runtime.save?.();runtime.settleDungeonIfDue?.(Date.now());return}if(b.pending){renderDungeonEvent();return}if(b.result){renderDungeonResult();return}if(b.isRolling){const roll=Number(b.pendingRoll);if(Number.isInteger(roll)&&roll>=1&&roll<=6){b.isRolling=false;delete b.pendingRoll;const move=Math.min(roll,DUNGEON_BOARD_MAX_STEPS-b.steps);if(move>0){b.isMoving=true;b.moveTarget=b.steps+move}else{b.isMoving=false;mission.scheduleEndAt=Date.now();runtime.save?.();runtime.settleDungeonIfDue?.(Date.now());return}}else b.isRolling=false;runtime.save?.()}if(b.isMoving){const target=Number(b.moveTarget);if(Number.isInteger(target)&&target>b.steps&&target<=DUNGEON_BOARD_MAX_STEPS){startDungeonBoardMovement(mission);return}b.isMoving=false;delete b.moveTarget;runtime.save?.()}}
function startDungeonBoardMovement(mission){const b=mission?.board;if(!b||!b.isMoving||dungeonBoardAnimatingMissionId===mission.id)return;dungeonBoardAnimatingMissionId=mission.id;const token=++dungeonBoardRunToken;animateDungeonBoardMove(mission,token)}
function dungeonCloneEvent(event){return {...event,options:event.options.map(option=>({...option,effects:{...(option.effects||{})},check:option.check?{...option.check,success:{...option.check.success,effects:{...(option.check.success.effects||{})}},failure:{...option.check.failure,effects:{...(option.check.failure.effects||{})}}}:null}))}}
function dungeonPickEvent(type,history,lap){const pool=DUNGEON_EVENT_LIBRARY[type]||DUNGEON_EVENT_LIBRARY.scene,available=pool.filter(event=>!history.includes(event.id+':lap'+lap)),candidates=available.length?available:pool,total=candidates.reduce((sum,event)=>sum+Math.max(.05,Number(event.weight)||1),0);let roll=Math.random()*total;for(const event of candidates){roll-=Math.max(.05,Number(event.weight)||1);if(roll<=0)return event}return candidates[candidates.length-1]}
function dungeonStageEvent(event,lap){const copy=dungeonCloneEvent(event);if(lap===2){copy.title+=' · 重现';copy.desc+=' 你认出这处场景，但其中一件物品的位置与上次不同。'}else if(lap===3){copy.title+=' · 封锁';copy.desc+=' 警报已经响起，身后的追逐声越来越近。'}copy.options.forEach(option=>{if(option.check)option.check.difficulty=Math.min(78,option.check.difficulty+(lap-1)*4)});return copy}
function createDungeonBoardPending(mission){
 const b=mission.board,layout=ensureDungeonBoardLayout(b),tile=DUNGEON_BOARD_TILES[layout[b.position]??b.position],type=tile[0];b.eventHistory=Array.isArray(b.eventHistory)?b.eventHistory:[];
 let event;
 if(b.steps===36||b.steps===72){
  const first=b.steps===36;
  event={id:first?'milestone-broadcast':'milestone-archive',title:first?'广播室的回声':'地下档案室',desc:first?'广播传出你的声音，控制台的监控画面却停留在十分钟前。扬声器里还有一个声音，在替你回答尚未提出的问题。':'地下档案柜里每份档案都贴着同一张照片，照片拍摄日期是明天。最底层的抽屉正在从里面缓慢敲击。',options:[
   O(first?'追查广播源':'比对档案日期',{intelligence:1},0,C('intelligence',64,first?'你定位到广播信号来自已经拆除的旧楼。':'你发现所有档案都对应同一个尚未发生的日期。',{perception:1},'监控画面突然切换为实时视角，你只能先行撤离。',{energy:-1,fun:-1},2,-1)),
   O(first?'拆除控制台':'打开最底层抽屉',{strength:1,energy:-1},1,C('strength',60,'异常设备停止运转，内部留下应急补给。',{willpower:1},'设备反向启动，你被迫放弃现场。',{clean:-1},1,-1),'stimulant'),
   O('记下位置后离开',{agility:1,willpower:1},-1)
  ]};
 }else{
  const lap=Math.min(3,Math.max(1,Math.floor((b.steps-1)/36)+1)),selected=dungeonPickEvent(type,b.eventHistory,lap);event=dungeonStageEvent(selected,lap);b.eventHistory.push(selected.id+':lap'+lap);b.eventHistory=b.eventHistory.slice(-48);
 }
 b.pending={event,tile:type};
}
function animateDungeonBoardMove(mission,token){const runtime=window.ArdayDungeonBoardRuntime||{},s=runtime.state,b=mission?.board;if(!b||token!==dungeonBoardRunToken||s?.activeDungeon!==mission||mission.mode!=='board')return;if(runtime.settleDungeonIfDue?.(Date.now())){dungeonBoardAnimatingMissionId=null;return}if(!b.isMoving){dungeonBoardAnimatingMissionId=null;return}if(b.steps<Number(b.moveTarget)){b.steps=Math.min(DUNGEON_BOARD_MAX_STEPS,b.steps+1);b.position=b.steps%36;runtime.save?.();dungeonMoveTokenTo(b.position);const root=runtime.$?.('choices'),center=root?.querySelector('.dungeon-board-center strong');if(center)center.textContent=String(Math.min(3,Math.floor(b.steps/36)+1));dungeonBoardTimer=setTimeout(()=>animateDungeonBoardMove(mission,token),330);return}b.isMoving=false;delete b.moveTarget;dungeonBoardAnimatingMissionId=null;createDungeonBoardPending(mission);runtime.save?.();if(runtime.$?.('drawer')?.classList.contains('open'))dungeonBoardTimer=setTimeout(()=>{if(s.activeDungeon===mission&&mission.board?.pending&&runtime.$('choices')?.classList.contains('dungeon-board-view'))renderDungeonEvent()},420)}
function finishDungeonRoll(mission){const runtime=window.ArdayDungeonBoardRuntime||{},s=runtime.state,b=mission?.board;if(!b||s?.activeDungeon!==mission||mission.mode!=='board'||!b.isRolling)return;if(runtime.settleDungeonIfDue?.(Date.now()))return;const roll=Number(b.pendingRoll);b.isRolling=false;delete b.pendingRoll;const move=Math.min(Number.isInteger(roll)&&roll>=1&&roll<=6?roll:1,DUNGEON_BOARD_MAX_STEPS-b.steps);if(move<=0){mission.scheduleEndAt=Date.now();runtime.save?.();runtime.settleDungeonIfDue?.(Date.now());return}b.isMoving=true;b.moveTarget=b.steps+move;runtime.save?.();startDungeonBoardMovement(mission)}
function rollDungeonBoard(){const runtime=window.ArdayDungeonBoardRuntime||{},s=runtime.state,mission=s?.activeDungeon,b=mission?.board;if(!mission||mission.mode!=='board'||!b)return;if(runtime.settleDungeonIfDue?.(Date.now()))return;if(b.steps>=DUNGEON_BOARD_MAX_STEPS||b.pending||b.result||b.isRolling||b.isMoving)return;const roll=1+Math.floor(Math.random()*6);b.isRolling=true;b.pendingRoll=roll;b.lastRoll=roll;runtime.save?.();const button=runtime.$('dungeonRoll'),cube=runtime.$('choices').querySelector('.dungeon-dice-cube');if(button)button.disabled=true;if(cube){cube.classList.remove('is-rolling');void cube.offsetWidth;cube.classList.add('is-rolling')}dungeonBoardTimer=setTimeout(()=>{dungeonBoardTimer=null;finishDungeonRoll(mission)},1050)}
function dungeonEffectLabel(key){return DUNGEON_STAT_LABELS[key]||''}
function renderDungeonResult(){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};
 if(settleDungeonIfDue?.(Date.now()))return;const mission=s.activeDungeon;if(!mission?.board?.result)return;const r=mission.board.result;$('drawerTitle').textContent='行动结果';$('choices').className='choices infinite-view dungeon-event-view';
 const rows=(r.changes||[]).map(x=>'<div class="dungeon-result-change '+(x.delta>0?'is-up':x.delta<0?'is-down':'')+'"><span>'+dungeonEffectLabel(x.key)+'</span><b>'+(x.delta>0?'+':'')+x.delta+'</b></div>').join('');
 const chance=r.chanceDelta?'<div class="dungeon-result-change '+(r.chanceDelta>0?'is-up':'is-down')+'"><span>通关概率修正</span><b>'+(r.chanceDelta>0?'+':'')+r.chanceDelta+'%</b></div>':'';
 const item=r.itemName?'<div class="dungeon-result-item">＋ '+r.itemName+'</div>':'';
 const outcome=r.outcomeText?'<p class="dungeon-result-outcome">'+r.outcomeText+(r.checkChance!==null&&r.checkChance!==undefined?' · '+dungeonEffectLabel(r.checkStat)+'检定 '+r.checkChance+'%':'')+'</p>':'';
 $('choices').innerHTML='<section class="dungeon-event-modal dungeon-result-modal"><button class="dungeon-board-exit" id="leaveDungeonBoard" type="button" aria-label="退出转盘">退出转盘</button><div class="dungeon-result-mark">'+(r.checkPassed===false?'↘':'✓')+'</div><small>行动结果</small><h2>'+r.title+'</h2><p class="dungeon-result-choice">'+r.choice+'</p>'+outcome+'<div class="dungeon-result-changes">'+rows+chance+item+'</div><button class="dungeon-result-continue" id="continueDungeonBoard">返回棋盘</button></section>';
 const button=$('continueDungeonBoard');if(button)button.onclick=continueDungeonBoard;const leave=$('leaveDungeonBoard');if(leave)leave.onclick=leaveDungeonBoard;
}
function continueDungeonBoard(){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};if(settleDungeonIfDue?.(Date.now()))return;const mission=s.activeDungeon;if(!mission?.board?.result)return;const b=mission.board;b.result=null;if(b.steps>=DUNGEON_BOARD_MAX_STEPS){mission.board.completedAt=Date.now();mission.scheduleEndAt=mission.board.completedAt;mission.endsAt=mission.scheduleEndAt;save();settleDungeonIfDue(Date.now());return}save();renderDungeonBoard()}
function renderDungeonEvent(){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};
 if(settleDungeonIfDue?.(Date.now()))return;const mission=s.activeDungeon;if(!mission?.board?.pending)return;const {event,tile}=mission.board.pending,cell=DUNGEON_BOARD_TILES.find(t=>t[0]===tile);$('drawerTitle').textContent='';$('choices').className='choices infinite-view dungeon-event-view';
 $('choices').innerHTML='<section class="dungeon-event-modal tone-'+tile+'"><button class="dungeon-board-exit" id="leaveDungeonBoard" type="button" aria-label="退出转盘">退出转盘</button><div class="dungeon-event-symbol">'+cell[2]+'</div><h2>'+event.title+'</h2><p>'+event.desc+'</p><div class="dungeon-event-choices">'+event.options.map((o,i)=>'<button class="dungeon-event-choice" data-dungeon-choice="'+i+'"><span>'+(i+1)+'</span><b>'+o.label+'</b>'+(o.check?'<small>'+dungeonEffectLabel(o.check.stat)+'检定</small>':'')+'<i>›</i></button>').join('')+'</div></section>';
 const leave=$('leaveDungeonBoard');if(leave)leave.onclick=leaveDungeonBoard;$('choices').querySelectorAll('[data-dungeon-choice]').forEach(button=>button.onclick=()=>resolveDungeonEvent(Number(button.dataset.dungeonChoice)));
}
function resolveDungeonEvent(index){
 const {state:s,$,save,clamp,addDungeonItem,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};
 if(settleDungeonIfDue?.(Date.now()))return;const mission=s.activeDungeon;if(!mission?.board?.pending)return;const b=mission.board,event=b.pending.event,option=event.options[index];if(!option)return;
 let outcome=null,checkChance=null,checkStat=null;
 if(option.check){checkStat=option.check.stat;const target=checkStat in s.attributes?s.attributes:s,score=Math.max(0,Math.min(100,Number(target[checkStat])||0));checkChance=Math.max(20,Math.min(85,Math.round(52+(score-50)*.58-(Number(option.check.difficulty||55)-55)*.72)));const passed=Math.random()*100<checkChance;outcome=passed?option.check.success:option.check.failure}
 const effects={...(option.effects||{})};Object.entries(outcome?.effects||{}).forEach(([key,value])=>effects[key]=(Number(effects[key])||0)+(Number(value)||0));const changes=[];b.statGains=b.statGains||{};
 Object.entries(effects).forEach(([key,value])=>{if(!DUNGEON_STAT_KEYS.has(key))return;const target=key in s.attributes?s.attributes:s;const before=Number(target[key])||0;let delta=Number(value)||0;if(delta>0){const used=Number(b.statGains[key])||0;delta=Math.min(delta,Math.max(0,2-used));b.statGains[key]=used+delta}target[key]=clamp(before+delta);const actual=Number(target[key])-before;if(actual)changes.push({key,delta:actual})});
 s.combat=Math.round(Object.values(s.attributes).reduce((n,v)=>n+Number(v||0),0)/5);mission.snapshot.playerPower=s.combat;mission.snapshot.energy=s.energy;mission.snapshot.hunger=s.hunger;mission.snapshot.clean=s.clean;
 let chanceDelta=0;const chanceTotal=(Number(option.chance)||0)+(Number(outcome?.chance)||0);if(chanceTotal){const before=Number(b.chanceModifier)||0;b.chanceModifier=Math.max(-10,Math.min(10,before+chanceTotal));chanceDelta=b.chanceModifier-before}
 let itemName='';const itemId=outcome?.item||option.item,itemChance=Number(outcome?.itemChance??option.itemChance??.18);if(itemId&&!b.itemFound&&Math.random()<Math.max(0,Math.min(1,itemChance))){const item=addDungeonItem(itemId);if(item){itemName=item.name||'特殊道具';b.itemFound=true}}
 b.pending=null;b.result={title:event.title,choice:option.label,changes,chanceDelta,itemName,outcomeText:outcome?.text||'',checkChance,checkStat,checkPassed:option.check?!!outcome&&outcome===option.check.success:null};save();renderDungeonResult();
}
function chooseDungeonBoard(){
 const {state:s,$,save,settleDungeonIfDue}=window.ArdayDungeonBoardRuntime||{};const mission=s.activeDungeon;if(!mission)return;if(settleDungeonIfDue?.(Date.now()))return;if(mission.boardChoiceMade&&mission.mode!=='board'){window.ArdayDungeonBoardRuntime?.showDungeon?.();return}mission.mode='board';mission.boardChoiceMade=true;mission.board=mission.board||{version:3,missionId:mission.id,steps:0,position:0,chanceModifier:0,pending:null};mission.board.eventHistory=Array.isArray(mission.board.eventHistory)?mission.board.eventHistory:[];ensureDungeonBoardLayout(mission.board);mission.board.missionId=mission.id;save();if(mission.board?.pending)renderDungeonEvent();else if(mission.board?.result)renderDungeonResult();else renderDungeonBoard()}
