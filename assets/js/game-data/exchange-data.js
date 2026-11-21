window.ArdayExchangeData = {
  itemCatalog: {
    stimulant:{name:'能量剂',type:'buff',icon:'✚',effects:{energy:18,agility:1}},
    focus:{name:'专注剂',type:'buff',icon:'◈',effects:{energy:10,intelligence:2,perception:1}},
    enhancer:{name:'强化剂',type:'buff',icon:'⬡',effects:{strength:2,agility:1}},
    resolve:{name:'稳定剂',type:'buff',icon:'▤',effects:{willpower:2,energy:8}},
    standin:{name:'急救包',type:'life',icon:'✚',lifeSave:true,protectionCharges:1},
    medkit:{name:'防护盾',type:'life',icon:'⬡',lifeSave:true,protectionCharges:1,effects:{energy:16}},
    ward:{name:'救援器',type:'life',icon:'＋',lifeSave:true,protectionCharges:1,effects:{willpower:3}},
    soulpin:{name:'复苏剂',type:'life',icon:'▣',lifeSave:true,protectionCharges:2,effects:{willpower:2}},
    hex:{name:'干扰器',type:'tactical',icon:'⊘',difficultyReduction:5},
    weaken:{name:'压制器',type:'tactical',icon:'▤',difficultyReduction:8},
    seal:{name:'封锁器',type:'tactical',icon:'▣',difficultyReduction:11},
    disrupt:{name:'侵蚀剂',type:'tactical',icon:'◉',maliceReduction:14},
    fate:{name:'概率芯片',type:'probability',icon:'▦',chance:6},
    lucky:{name:'校准模块',type:'probability',icon:'⌗',chance:4},
    reverse:{name:'增幅模块',type:'probability',icon:'⬡',chance:2},
    misfortune:{name:'风险模块',type:'probability',icon:'◉',chance:1},
    reprieve:{name:'应急电池',type:'buff',icon:'▣',effects:{energy:24}},
    renewal:{name:'恢复模块',type:'buff',icon:'◷',effects:{energy:16,willpower:1}},
    grace:{name:'储备包',type:'buff',icon:'↗',effects:{energy:12,perception:1}},
    longterm:{name:'综合补给',type:'buff',icon:'↻',effects:{energy:24,willpower:2}}
  },
  typeLabels: {buff:'增益类',life:'保命类',tactical:'战术干预',probability:'概率类'},
  exchangePrices: {
    stimulant:85,focus:105,enhancer:135,resolve:115,
    standin:175,medkit:195,ward:215,soulpin:265,
    hex:115,weaken:160,seal:205,disrupt:175,
    fate:145,lucky:110,reverse:95,misfortune:90,
    reprieve:75,renewal:110,grace:145,longterm:185
  }
};
