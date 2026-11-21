(function(global){
 'use strict';
 const LETTERS={
  daily:[
   {id:'tea-window',topic:'daily',title:'今天的窗边',body:'下午我在窗边坐了一会儿。原本只是想歇几分钟，后来发现光线一点点挪过桌面，竟然就看了很久。\n\n有些时间好像不需要安排得很清楚。你今天有没有这样的片刻？'},
   {id:'bookmark',topic:'daily',title:'读到一半的书',body:'我最近读书时总喜欢在某一页停下来，不一定是因为读懂了什么，有时只是突然想到别的事情。书签夹在那里，过两天再翻回去，反而会记得当时在想什么。\n\n你最近有没有一本读得很慢的书？'},
   {id:'market',topic:'daily',title:'路上遇见的小事',body:'今天出门时，路边有家店刚好在整理门口的花。老板把几盆快要谢掉的花挪到一起，倒也没有急着丢掉。\n\n我忽然觉得，日子里很多事情都不必立刻有个结果。'},
   {id:'music',topic:'daily',title:'一段没听完的曲子',body:'今天听见一段很熟悉的旋律，想不起名字，只记得以前在哪里听过。后来我没有继续找，留着一点没想起来的感觉也不错。\n\n等你有空，我们可以一起听点东西。'},
   {id:'room',topic:'daily',title:'房间里的变化',body:'我把房间里一件东西换了位置。其实没有变得多整齐，只是走过去时顺手了不少。生活里的小调整大概就是这样，做完以后才发现自己早就想这么做了。'},
   {id:'weather',topic:'daily',title:'天气转凉了',body:'今天外面比前几天凉一些。我出门时才发现自己穿少了，回来以后就不太想再出门。\n\n如果你今天也在外面，记得别只顾着赶路。'},
   {id:'cooking',topic:'daily',title:'关于晚饭',body:'今天吃饭时突然觉得，认真做一顿普通的饭也挺值得。没有什么特别的菜，只是火候刚好，吃完以后心情也安静下来。\n\n下次想试一道新菜，做得不好也算积累经验。'},
   {id:'late-night',topic:'daily',title:'夜里想到的事',body:'刚才准备休息时，突然想起白天漏做的一件小事。明明不是什么要紧的事，却一直在脑子里绕。\n\n我最后决定明天再处理。偶尔把事情留到明天，也不算失职。'}
  ],
  relationship:[
   {id:'miss-you',topic:'relationship',title:'想起你',body:'今天有一瞬间很想找你说话，但又想不出非说不可的事情。后来我意识到，有时候只是想知道你在做什么。\n\n所以，今天过得怎么样？'},
   {id:'jealous',topic:'relationship',title:'一点不太体面的心思',body:'我发现自己偶尔会在意一些其实不该计较的小事。比如你和别人聊得很投入，或者很久没有看我一眼。\n\n我知道这听起来有点幼稚，但我暂时还不打算假装自己完全不在意。'},
   {id:'distance',topic:'relationship',title:'我们最近的相处',body:'我在想，我们最近是不是各自忙着自己的事，反而少了些真正坐下来聊天的时间。倒也不是有什么不满，只是有些话如果一直不说，慢慢就会变得难开口。\n\n你愿意的话，今晚可以留一点时间给我。'},
   {id:'affection',topic:'relationship',title:'一件很普通的事',body:'今天做一件普通的小事时，我突然想到如果你也在，大概会有另一种做法。这个念头来得很自然，甚至没有什么特别的理由。\n\n我想，我已经习惯把你算进自己的生活里了。'},
   {id:'irritation',topic:'relationship',title:'我还在介意',body:'有件事我其实还没有完全放下。不是想把它重新翻出来争论，只是我不太擅长把不舒服的情绪立刻处理好。\n\n如果我这两天显得有些冷淡，那大概和这件事有关。'},
   {id:'trust',topic:'relationship',title:'关于信任',body:'我不觉得两个人必须把所有事情都说得清清楚楚，才能算亲近。但我希望我们至少可以坦白地告诉对方，哪些事让自己在意，哪些事暂时还不想谈。\n\n我愿意慢慢来。'}
  ],
  goal:[
   {id:'goal-read',topic:'goal',title:'我最近想完成的事',body:'我最近给自己留了一件事：读完手边那本书。进度不算快，但我不想为了完成它而匆匆翻过去。\n\n等读完以后，我再告诉你里面有没有值得推荐的部分。'},
   {id:'goal-write',topic:'goal',title:'关于写作',body:'我最近想整理一些自己的文字。不是为了马上拿给谁看，只是有些想法如果不留下来，过段时间就会变得模糊。\n\n我还没想好最后会整理成什么样，不过已经开始了。'},
   {id:'goal-work',topic:'goal',title:'手头的计划',body:'最近有件事需要我认真处理，可能会占去一些时间。我不想把它说得多么重要，只是既然决定做，就希望能有个像样的结果。\n\n等告一段落，我会和你说说进展。'},
   {id:'goal-save',topic:'goal',title:'给自己留一点余地',body:'我最近在试着把花钱这件事安排得更有分寸。不是要过得很节省，只是不想每次想做什么，都发现自己没有余地。\n\n能为以后留下一点选择，其实也挺重要。'}
  ],
  work:[
   {id:'work-tired',topic:'work',title:'今天有点累',body:'今天的事情比预想中多，处理完以后脑子还有点停不下来。我不太想把工作里的细节全写给你，只想说，今天确实有些累。\n\n不过已经结束了，接下来我想做点和工作无关的事。'},
   {id:'work-small-win',topic:'work',title:'一件顺利的小事',body:'今天有件事情处理得比预想中顺利。算不上什么值得庆祝的成果，但那种终于把问题理清楚的感觉还不错。\n\n我想把这种状态记下来，免得只记得那些不顺利的时候。'},
   {id:'work-people',topic:'work',title:'今天遇到的人',body:'今天和一个人聊了几句，发现对方看待事情的方式和我很不一样。谈不上谁对谁错，只是让我意识到，自己有时确实容易把习惯当成理所当然。'},
   {id:'work-break',topic:'work',title:'想给自己放个空',body:'最近安排得有点满，我打算找个时间把日程空出来。不是有什么特别的计划，只是不想连休息都变成一项需要完成的任务。\n\n如果你也有空，我们可以一起出去走走。'}
  ]
 };
 function generate({state={},random=Math.random}={}){
  const r=()=>Math.max(0,Math.min(.999999,Number(random())||0));
  const pools=[];
  const love=Number(state.love)||0,friend=Number(state.friend)||0,hate=Number(state.hate)||0,bored=Number(state.bored)||0;
  if(state.personalGoal?.status==='active')pools.push('goal');
  if(state.job?.active)pools.push('work');
  if(love>=35||friend>=35||hate>=20||bored>=35)pools.push('relationship');
  pools.push('daily');
  const preferred=pools[Math.floor(r()*pools.length)];
  const used=Array.isArray(state.ardayLetterHistory)?state.ardayLetterHistory:[];
  const topicOrder=[preferred,...pools.filter(x=>x!==preferred)];
  for(const topic of topicOrder){
   const available=(LETTERS[topic]||[]).filter(item=>!used.includes(item.id));
   if(available.length){
    const item=available[Math.floor(r()*available.length)];
    return {id:item.id,topic:item.topic,title:item.title,detail:item.body};
   }
  }
  const fallback=LETTERS.daily[Math.floor(r()*LETTERS.daily.length)];
  return {id:fallback.id+'-'+Date.now(),topic:fallback.topic,title:fallback.title,detail:fallback.body};
 }
 global.ArdayLetterCopy={generate};
})(window);
