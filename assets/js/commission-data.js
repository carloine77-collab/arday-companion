window.ArdayCommissionData = {
  dailySlots: 4,
  freeRerolls: 1,
  combatItemDropChance: 0.25,
  combatItemPool: ['stimulant','focus','enhancer','resolve','reprieve'],
  moduleStats: {
    survival: ['energy','hunger','clean','fun'],
    emotion: ['friend','love'],
    combat: ['agility','strength','intelligence','perception','willpower']
  },
  statLabels: {
    energy:'精力', hunger:'食欲', clean:'卫生', fun:'娱乐',
    friend:'友谊', love:'爱意',
    agility:'敏捷', strength:'力量', intelligence:'智力', perception:'感知', willpower:'意志'
  },
  specialTasks: [
    {id:'field-report',title:'街区资料核对',detail:'有人委托整理一份街区资料。阅读资料并通过网络补齐信息。',activities:['read','browseWeb'],target:2,distinctActivities:true,rewardPoints:20},
    {id:'neighborhood-supply',title:'邻里物资协助',detail:'附近有人需要帮忙整理生活物资。完成一次烹饪和一次洗衣安排。',activities:['cook','laundry'],target:2,distinctActivities:true,rewardPoints:20},
    {id:'signal-analysis',title:'异常信号分析',detail:'一段异常信号需要进一步整理。完成编程与资料写作。',activities:['program','write'],target:2,distinctActivities:true,rewardPoints:20},
    {id:'local-contact',title:'街区联络记录',detail:'协助记录街区联络情况。与人交谈，并完成一次外出活动。',activities:['chat','walk'],target:2,distinctActivities:true,rewardPoints:20},
    {id:'equipment-check',title:'设备状态检查',detail:'检查训练设备与个人终端，完成一次锻炼和一次电脑活动。',activities:['exercise','computerPlay'],target:2,distinctActivities:true,rewardPoints:20}
  ],
  modules: [
    {id:'survival',label:'生存',mark:'◌',icon:'⌂',tasks:[
      {id:'survival-routine',title:'日常维护',detail:'完成两种不同的日常生活活动。',activities:['eat','food','rest','sleep','wash','cook'],target:2,distinctActivities:true},
      {id:'survival-recovery',title:'状态恢复',detail:'在日常安排中完成一次休息或用餐。',activities:['rest','sleep','eat','food'],target:1},
      {id:'survival-upkeep',title:'生活整理',detail:'完成一次洗漱、烹饪或用餐。',activities:['wash','cook','eat','food'],target:1}
    ]},
    {id:'emotion',label:'情感',mark:'♡',icon:'✧',tasks:[
      {id:'emotion-contact',title:'保持联系',detail:'完成一次聊天、陪伴或共同活动。',activities:['chat','company','hug','food','walk'],target:1},
      {id:'emotion-shared',title:'共享片刻',detail:'完成一次散步、聊天或休闲活动。',activities:['walk','hug','chat','watchTV','listenRecords','music','playPiano','food'],target:1},
      {id:'emotion-mood',title:'情绪调节',detail:'完成一次散步、听音乐或休闲活动。',activities:['admireView','admireDecor','music','watchTV','game','computerPlay','walk','listenRecords'],target:1}
    ]},
    {id:'combat',label:'战斗',mark:'⌁',icon:'⬡',tasks:[
      {id:'combat-study',title:'战斗档案',detail:'点击侧栏战斗标题，查看一次属性记录。',signal:'combat-inspect',target:1},
      {id:'combat-conditioning',title:'出勤检查',detail:'打开组队界面，查看当前可进入的副本。',signal:'dungeon-open',target:1},
      {id:'combat-prep',title:'补给检查',detail:'在背包中打开副本道具分类。',signal:'supply-review',target:1}
    ]}
  ]
};