/* Career, faction, recruitment and elite leaderboard reference data. */
window.ArdayCareerData = {
 ARDAY_FACTIONS: [
{id:'iron-gate',name:'铁门公会',type:'工会',guildRank:1,mark:'鐵',desc:'承接高危区域勘探与前线委托。'},{id:'night-heron',name:'夜鹭公会',type:'工会',guildRank:2,mark:'鷺',desc:'负责情报搜集、路线测绘与目标追踪。'},{id:'cinder-forge',name:'余烬公会',type:'工会',guildRank:3,mark:'爐',desc:'研究异常材料、维护装备与改造器械。'},{id:'blue-transit',name:'蓝线公会',type:'工会',guildRank:4,mark:'線',desc:'经营补给网络、跨区运输与安全撤离。'},{id:'stillwater',name:'静水教团',type:'教团',mark:'水',desc:'招募能够辨识梦境污染与精神回响的人。'},{id:'convergence',name:'归一教团',type:'教团',mark:'一',desc:'以统一理论解释不同异常现象。'},{id:'last-candle',name:'余烛教团',type:'教团',mark:'燭',desc:'保存旧时代遗物，研究仪式性异常。'},{id:'anomaly-bureau',name:'异常事务管理局',type:'管理局',mark:'局',desc:'负责异常事件登记、管制与公共安全。'}],
 ARDAY_SOCIAL_JOBS: [
  {id:'community-librarian',title:'社区图书馆管理员',category:'公共文化',focus:'情绪稳定与沟通',description:'整理馆藏、维护阅览秩序并协助读者检索资料。',salary:72,start:9,end:12,minScore:28,selectivity:.02},
  {id:'florist',title:'花艺设计师',category:'生活美学',focus:'情感状态与综合素养',description:'完成日常花束设计、陈列维护与订单交付。',salary:88,start:14,end:17,minScore:31,selectivity:.03},
  {id:'pet-care',title:'动物照护员',category:'动物服务',focus:'耐心与稳定状态',description:'负责动物喂养、活动陪护和基础环境维护。',salary:82,start:10,end:13,minScore:33,selectivity:.04},
  {id:'cafe-shift',title:'咖啡馆值班经理',category:'餐饮运营',focus:'情绪管理与应变',description:'安排当班流程、处理顾客需求并核对营业记录。',salary:78,start:15,end:18,minScore:29,selectivity:.02},
  {id:'delivery-dispatch',title:'物流调度员',category:'物流调度',focus:'判断力与执行能力',description:'规划配送顺序、协调异常订单和交接节点。',salary:96,start:9,end:12,minScore:36,selectivity:.04},
  {id:'museum-restorer',title:'文物修复学徒',category:'文物保护',focus:'耐心与专注能力',description:'协助完成藏品状态记录、清洁和基础修复。',salary:118,start:13,end:15,minScore:50,selectivity:.08},
  {id:'street-photographer',title:'街头摄影师',category:'视觉创作',focus:'观察力与情绪感知',description:'完成街区影像采集、人物拍摄和素材整理。',salary:105,start:15,end:17,minScore:43,selectivity:.06},
  {id:'legal-aid-reception',title:'法律援助接待员',category:'公共服务',focus:'情绪稳定与沟通',description:'接待求助者、登记案件信息并协助材料分流。',salary:98,start:9,end:12,minScore:44,selectivity:.06},
  {id:'software-tester',title:'软件测试员',category:'技术质量',focus:'战斗能力与综合判断',description:'执行功能测试、记录缺陷并复核修复结果。',salary:132,start:14,end:17,minScore:56,selectivity:.08},
  {id:'data-auditor',title:'数据审计员',category:'数据治理',focus:'高综合能力与稳定性',description:'核验数据来源、检查异常记录并形成审计清单。',salary:148,start:9,end:12,minScore:64,selectivity:.12},
  {id:'urban-patrol',title:'城市巡查员',category:'城市安全',focus:'战斗能力与应急状态',description:'巡查重点区域、识别风险并处理现场突发情况。',salary:138,start:19,end:22,minScore:58,selectivity:.08},
  {id:'environment-sampler',title:'环境采样员',category:'环境监测',focus:'生存状态与现场适应',description:'采集空气和水体样本，完成现场检测登记。',salary:116,start:8,end:11,minScore:49,selectivity:.07},
  {id:'equipment-maintenance',title:'设备维护技师',category:'设备工程',focus:'战斗能力与执行力',description:'检查公共设备运行状态并完成常规维护。',salary:125,start:10,end:13,minScore:53,selectivity:.08},
  {id:'emergency-aid',title:'应急救援站值守员',category:'应急救援',focus:'高战斗能力与情绪稳定',description:'检查救援装备、响应警情并协助现场转运。',salary:155,start:18,end:20,minScore:67,selectivity:.14},
  {id:'insurance-investigator',title:'保险理赔调查员',category:'风险调查',focus:'观察力、判断力与情绪控制',description:'核查事故经过、走访相关人员并整理调查证据。',salary:142,start:13,end:16,minScore:61,selectivity:.11},
  {id:'tour-guide',title:'城市导览员',category:'城市文化',focus:'社交能力与情绪状态',description:'带领小型路线讲解城市历史与公共空间。',salary:102,start:14,end:17,minScore:46,selectivity:.06},
  {id:'building-surveyor',title:'建筑测绘员',category:'工程测绘',focus:'高综合能力与现场适应',description:'采集建筑尺寸、复核图纸并整理测绘数据。',salary:160,start:8,end:12,minScore:70,selectivity:.16},
  {id:'radio-host',title:'社区电台主持人',category:'广播传媒',focus:'情感表达与沟通能力',description:'准备节目提纲、主持短时栏目并处理听众来信。',salary:128,start:19,end:21,minScore:59,selectivity:.1},
  {id:'sports-referee',title:'赛事裁判',category:'赛事管理',focus:'判断力、体能与现场控制',description:'执裁社区赛事、记录结果并处理规则争议。',salary:112,start:16,end:18,minScore:51,selectivity:.07},
  {id:'theater-stage-manager',title:'小剧场舞台监督',category:'演出制作',focus:'协调能力与抗压状态',description:'协调演出流程、检查舞台设备并控制场次节点。',salary:135,start:18,end:21,minScore:63,selectivity:.12},
  {id:'survey-interviewer',title:'社会调查访问员',category:'社会研究',focus:'沟通能力与情绪稳定',description:'开展结构化访谈、核对问卷并整理调查记录。',salary:90,start:10,end:13,minScore:39,selectivity:.04}
 ],
 ARDAY_CANDIDATE_POOL: [
{name:'闻野',role:'近战突入',combat:78,malice:18,portrait:'野',acceptance:.76},{name:'苏弥',role:'环境侦察',combat:64,malice:9,portrait:'弥',acceptance:.82},{name:'周既白',role:'战术支援',combat:71,malice:27,portrait:'白',acceptance:.68},{name:'罗缇',role:'异常研究',combat:52,malice:6,portrait:'缇',acceptance:.88},{name:'严朔',role:'重装防御',combat:86,malice:42,portrait:'朔',acceptance:.55},{name:'祁雾',role:'远程压制',combat:74,malice:61,portrait:'雾',acceptance:.48},{name:'程照',role:'火力压制',combat:82,malice:33,portrait:'照',acceptance:.63},{name:'白榆',role:'医疗支援',combat:59,malice:11,portrait:'榆',acceptance:.84},{name:'沈砚',role:'近距格斗',combat:69,malice:24,portrait:'砚',acceptance:.72},{name:'唐梨',role:'异常感知',combat:67,malice:15,portrait:'梨',acceptance:.79},{name:'顾临',role:'机动侦察',combat:75,malice:49,portrait:'临',acceptance:.52},{name:'叶澄',role:'远程狙击',combat:88,malice:37,portrait:'澄',acceptance:.57}],
 ARDAY_GUILD_MATERIALS: ['异常结晶','稳定剂','旧时代零件','记忆碎片'],
 ARDAY_ELITE_RANKERS: [
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
]
};
