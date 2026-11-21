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
  modules: [
    {id:'survival',label:'生存',mark:'◌',icon:'⌂',tasks:[
      {id:'survival-routine',title:'日常维护',detail:'完成一次用餐、休息或洗漱。',activities:['eat','food','rest','sleep','wash','cook'],target:1},
      {id:'survival-recovery',title:'状态恢复',detail:'在日常安排中完成一次休息或用餐。',activities:['rest','sleep','eat','food'],target:1},
      {id:'survival-upkeep',title:'生活整理',detail:'完成一次洗漱、烹饪或用餐。',activities:['wash','cook','eat','food'],target:1}
    ]},
    {id:'emotion',label:'情感',mark:'♡',icon:'✧',tasks:[
      {id:'emotion-contact',title:'保持联系',detail:'完成一次聊天、陪伴或共同活动。',activities:['chat','company','hug','food','walk'],target:1},
      {id:'emotion-shared',title:'共享片刻',detail:'与阿尔一起完成一次日常活动。',activities:['walk','hug','chat','watchTV','listenRecords','music','playPiano','food'],target:1},
      {id:'emotion-mood',title:'情绪调节',detail:'完成一次散步、听音乐或休闲活动。',activities:['admireView','admireDecor','music','watchTV','game','computerPlay','walk','listenRecords'],target:1}
    ]},
    {id:'combat',label:'战斗',mark:'⌁',icon:'⬡',tasks:[
      {id:'combat-study',title:'战术研读',detail:'完成一次阅读、写作或资料整理。',activities:['read','write','program','browseWeb'],target:1},
      {id:'combat-conditioning',title:'行动训练',detail:'完成一次锻炼或知识训练。',activities:['exercise','read','program'],target:1},
      {id:'combat-prep',title:'出勤准备',detail:'完成一次阅读、电脑工作或资料整理。',activities:['read','write','computerWork','program','browseWeb','computerPlay'],target:1}
    ]}
  ]
};