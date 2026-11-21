/* Dedicated Three.js food and plated-dish model builders. */
window.ArdayFoodModels = (() => {
 function build(ctx) {
  const {T,group,mat,m,cyl,variant}=ctx;
  const dish=String(variant||'');
  const porcelain=mat(0xf3eee3,.24,.04),rim=mat(0xb58d5d,.34,.38),rice=mat(0xf1e5c9,.96),egg=mat(0xf2cf72,.88),tomato=mat(0xc85f43,.86),greens=mat(0x6f8a55,.92),beef=mat(0x865039,.88),mushroom=mat(0xa58a6a,.94),tofu=mat(0xf0e4ca,.92),potato=mat(0xd6ad68,.9),sauce=mat(0x9a603d,.84),noodle=mat(0xe6c77f,.84),cream=mat(0xe9dfc9,.28),golden=mat(0xd5a14f,.82),herb=mat(0x78905d,.9),carrot=mat(0xd98b45,.86);
  const smooth=new T.SphereGeometry(1,22,16);
  const oval=(x,y,z,sx,sy,sz,material,rotation=0)=>{
   const mesh=new T.Mesh(smooth,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.y=rotation;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;
  };
  const tube=(points,material=noodle,radius=.012)=>{
   const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p[0],p[1],p[2])));
   const mesh=new T.Mesh(new T.TubeGeometry(curve,Math.max(20,points.length*9),radius,8,false),material);mesh.castShadow=true;group.add(mesh);return mesh;
  };
  const ring=(x,y,z,r,t,material)=>{
   const mesh=new T.Mesh(new T.TorusGeometry(r,t,8,40),material);mesh.rotation.x=Math.PI/2;mesh.position.set(x,y,z);group.add(mesh);return mesh;
  };
  const plate=(ovalPlate=false)=>{
   const radius=ovalPlate ? .235 : .255;
   cyl(0,.045,0,radius,radius,.055,porcelain);
   cyl(0,.076,0,radius-.018,radius-.018,.018,mat(0xd8cdbd,.34));
   ring(0,.09,0,radius-.025,.012,rim);
   ring(0,.094,0,radius-.075,.006,mat(0xe9dfce,.34));
  };
  const bowl=(brothMaterial=sauce)=>{
   const profile=[[.105,.025],[.145,.04],[.18,.09],[.205,.16],[.2,.19],[.188,.195]].map(([x,y])=>new T.Vector2(x,y));
   const vessel=new T.Mesh(new T.LatheGeometry(profile,40),porcelain);vessel.castShadow=true;vessel.receiveShadow=true;group.add(vessel);
   cyl(0,.165,0,.17,.17,.012,brothMaterial);
   ring(0,.194,0,.195,.012,rim);
   ring(0,.18,0,.178,.004,mat(0xf9f3e9,.3));
  };
  const leaf=(x,z,scale=1,angle=0)=>{
   const mesh=oval(x,.19,z,.022*scale,.009*scale,.055*scale,greens,angle);mesh.rotation.z=.35*Math.cos(angle);return mesh;
  };
  const riceMound=(count=30,baseY=.12)=>{
   oval(0,baseY,0,.17,.055,.15,rice);
   for(let i=0;i<count;i++){
    const a=i*2.399,r=.035+Math.sqrt((i+.5)/count)*.17;
    oval(Math.cos(a)*r,baseY+.035+((i%4)*.002),Math.sin(a)*r,.018,.009,.026,i%7===0?golden:rice,a);
   }
  };
  const herbs=(points)=>points.forEach(([x,z],i)=>leaf(x,z,.8,i*.9));
  const beefSlices=(points)=>points.forEach(([x,z],i)=>oval(x,.205+(i%2)*.012,z,.055,.023,.038,beef,i*.7));
  const vegetableBits=(points,material=greens)=>points.forEach(([x,z],i)=>oval(x,.19+(i%2)*.012,z,.026,.014,.021,material,i*.8));
  const pancake=(x,y,z,r,material=golden)=>{
   const cake=new T.Mesh(new T.CylinderGeometry(r*.96,r,r*.16,40,1),material);cake.position.set(x,y,z);cake.castShadow=true;group.add(cake);
   const crust=new T.Mesh(new T.TorusGeometry(r*.9,r*.035,8,40),mat(0x9b683c,.9));crust.rotation.x=Math.PI/2;crust.position.set(x,y+r*.08,z);group.add(crust);
  };

  if(dish==='蛋炒饭'){
   plate();riceMound(26,.12);
   for(const [x,z] of [[-.1,-.04],[-.04,.045],[.055,-.065],[.105,.025],[-.12,.06],[.035,.12]])oval(x,.17,z,.027,.016,.022,egg,(x-z)*3);
   for(const [x,z] of [[-.12,.04],[.02,-.11],[.12,-.045],[-.02,.11]])leaf(x,z,.72,(x+z)*5);
   for(const [x,z] of [[-.06,-.09],[.075,.085]])oval(x,.168,z,.018,.012,.018,tomato);
  }else if(dish==='番茄炒蛋'){
   plate();
   for(const [x,z] of [[-.12,-.06],[.025,-.11],[.13,-.025],[-.055,.09],[.09,.095]])oval(x,.145,z,.073,.03,.052,tomato,(x-z)*2);
   for(const [x,z] of [[-.09,-.02],[.045,-.075],[.1,.035],[-.02,.105]])oval(x,.17,z,.066,.025,.047,egg,(x+z)*2);
   herbs([[-.13,.08],[.02,.02],[.14,.055]]);
  }else if(dish==='蔬菜汤'){
   bowl(mat(0xc98f52,.22));
   for(const [x,z] of [[-.09,-.045],[.015,-.075],[.085,.035],[-.04,.075],[.1,-.08]]){oval(x,.19,z,.035,.014,.028,greens);oval(x+.025,.2,z+.012,.022,.014,.02,potato)}
   oval(-.08,.2,.09,.026,.014,.023,tomato);herbs([[-.12,.02],[.06,.1]]);
  }else if(dish==='牛肉面'){
   bowl(mat(0xb77b4d,.25));
   for(let i=0;i<7;i++){const a=i*1.1,r=.07+(i%3)*.028;tube([[Math.cos(a)*r,.18,Math.sin(a)*r],[Math.cos(a+.7)*r,.195,Math.sin(a+.7)*r],[Math.cos(a+1.35)*r,.19,Math.sin(a+1.35)*r],[Math.cos(a+1.9)*r,.18,Math.sin(a+1.9)*r]],noodle,.012)}
   beefSlices([[-.09,-.045],[.07,-.055],[.095,.055],[-.03,.09]]);
   herbs([[-.02,.08],[.12,-.005],[.04,-.12]]);
   oval(-.12,.2,.04,.027,.012,.024,tomato);
  }else if(dish==='奶油蘑菇饭'||dish==='奶油蘑菇烩饭'){
   plate();riceMound(22,.12);
   for(const [x,z] of [[-.11,-.04],[.02,-.09],[.105,.025],[-.045,.09],[.12,.095]]){
    oval(x,.175,z,.043,.018,.036,mushroom,(x-z)*2);
    oval(x,.157,z,.014,.022,.014,cream);
   }
   for(const [x,z] of [[-.03,.02],[.11,-.07],[-.1,.1]])leaf(x,z,.7);
   oval(.02,.205,-.015,.022,.008,.022,golden);
  }else if(dish==='香煎蛋吐司'){
   plate(true);
   for(const x of [-.105,.105]){
    const toast=new T.Mesh(new T.BoxGeometry(.17,.055,.235,3,2,3),mat(0xb77a43,.88));toast.position.set(x,.12,0);toast.rotation.y=x*.8;toast.castShadow=true;group.add(toast);
    oval(x,.151,0,.074,.012,.105,mat(0xf0d28d,.9));
   }
   oval(0,.18,-.015,.075,.024,.075,egg);oval(.02,.202,-.015,.036,.012,.036,mat(0xe5a83e,.82));
   herbs([[-.12,.1],[.12,-.1]]);
  }else if(dish==='豆腐煲'||dish==='豆腐蔬菜煲'){
   bowl(sauce);
   for(const [x,z] of [[-.09,-.045],[.025,-.075],[.09,.035],[-.035,.07],[.11,-.06]]){
    const cube=oval(x,.205,z,.04,.034,.04,tofu,(x-z)*1.5);cube.rotation.z=.08;
   }
   for(const [x,z] of [[-.11,.075],[.1,-.065]])leaf(x,z,1.05);
   oval(.02,.22,.105,.028,.015,.024,tomato);oval(-.04,.21,-.12,.027,.015,.022,mushroom);
  }else if(dish==='土豆牛肉'||dish==='土豆炖牛肉'){
   bowl(mat(0x9a603d,.32));
   for(const [x,z] of [[-.1,-.06],[.02,-.09],[.11,-.025],[-.045,.075],[.075,.09],[-.12,.09]]){
    const material=(x+z)>0?potato:beef;const chunk=oval(x,.205,z,.048,.037,.045,material,(x-z)*1.8);chunk.rotation.z=.14;
   }
   herbs([[-.12,.08],[.03,.02],[.13,.055]]);
   oval(.02,.23,-.01,.03,.012,.02,carrot);
  }else if(dish==='葱香土豆饼'){
   plate(true);pancake(0,.12,0,.17,potato);pancake(0,.16,0,.15,golden);
   for(let i=0;i<9;i++){const a=i*2.4,r=.07+(i%3)*.025;leaf(Math.cos(a)*r,Math.sin(a)*r,.55,a)}
   for(let i=0;i<5;i++){const a=i*1.25;oval(Math.cos(a)*.1,.18,Math.sin(a)*.1,.012,.006,.012,mat(0x9c683c,.9))}
  }else if(dish==='番茄牛肉意面'){
   plate(true);
   for(let i=0;i<7;i++){const a=i*1.25,r=.06+(i%3)*.018;tube([[Math.cos(a)*r,.13,Math.sin(a)*r],[Math.cos(a+.8)*r*1.4,.16,Math.sin(a+.8)*r*1.4],[Math.cos(a+1.5)*r,.17,Math.sin(a+1.5)*r],[Math.cos(a+2.2)*r*.8,.15,Math.sin(a+2.2)*r*.8]],noodle,.012)}
   for(const [x,z] of [[-.1,-.04],[.08,-.06],[.03,.1]])oval(x,.18,z,.048,.025,.038,sauce);
   beefSlices([[-.08,.02],[.09,.035],[-.02,-.1]]);
   for(const [x,z] of [[-.13,.08],[.13,-.1]])oval(x,.19,z,.027,.016,.022,tomato);
   herbs([[-.02,.03],[.12,.08]]);
  }else if(dish==='奶油蘑菇浓汤'){
   bowl(mat(0xe5d8b9,.2));
   cyl(0,.17,0,.17,.17,.012,mat(0xe9d7ad,.2));
   for(const [x,z] of [[-.1,-.045],[.02,-.08],[.095,.035],[-.035,.075]])oval(x,.195,z,.043,.018,.035,mushroom,(x-z)*2);
   for(const [x,z] of [[-.08,.09],[.1,-.09]])leaf(x,z,.8);
   tube([[-.1,.207,-.03],[-.03,.21,.01],[.05,.207,.03],[.12,.21,.08]],mat(0xf8efd9,.35),.006);
  }else if(dish==='芝士焗土豆'){
   const baking=mat(0xe8dfd1,.28);const dishware=new T.Mesh(new T.CylinderGeometry(.22,.2,.12,40),baking);dishware.position.y=.105;group.add(dishware);
   ring(0,.17,0,.205,.012,rim);
   for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const x=(col-1)*.105,z=(row-1)*.09;oval(x,.18,z,.052,.026,.045,potato,(row+col)*.25);
   }
   oval(0,.205,0,.18,.018,.15,mat(0xe9bd58,.62));
   for(const [x,z] of [[-.12,-.07],[.02,-.1],[.11,.06],[-.04,.08],[.13,-.04]])oval(x,.222,z,.014,.009,.012,golden);
   herbs([[-.1,.11],[.1,-.1]]);
  }else if(dish==='香菇豆腐蒸蛋'){
   bowl(mat(0xe6c875,.22));
   cyl(0,.17,0,.17,.17,.012,mat(0xf2d98d,.26));
   oval(0,.19,0,.16,.018,.14,mat(0xf4dfa0,.42));
   for(const [x,z] of [[-.09,-.045],[.08,-.06],[.025,.09]]){
    oval(x,.215,z,.047,.025,.04,tofu);
    oval(x,.238,z,.035,.018,.03,mushroom);
    tube([[x-.02,.24,z],[x,.247,z+.01],[x+.02,.24,z+.02]],mat(0xe2d4bb,.9),.005);
   }
   herbs([[-.12,.07],[.12,.08]]);
  }else if(dish==='胡萝卜牛肉烩饭'){
   plate();riceMound(22,.12);
   for(const [x,z] of [[-.1,-.06],[.04,-.1],[.12,.02],[-.05,.09]])oval(x,.17,z,.045,.026,.04,beef,(x-z)*2);
   for(const [x,z] of [[-.12,.04],[.07,.09],[.13,-.08],[-.02,-.02]])oval(x,.185,z,.025,.014,.02,carrot);
   oval(.02,.2,.02,.03,.012,.025,mat(0xf1dfbb,.92));
   herbs([[-.13,.1],[.08,-.12],[.02,.06]]);
  }else if(dish==='蒜香蘑菇煎饼'){
   plate(true);pancake(0,.12,0,.18,mat(0xc58a43,.9));
   oval(0,.15,0,.15,.015,.13,mat(0xe5b96e,.9));
   for(const [x,z] of [[-.11,-.04],[.02,-.1],[.1,.02],[-.04,.09],[.12,.09]]){oval(x,.18,z,.04,.022,.032,mushroom,(x-z)*2);oval(x,.16,z,.012,.014,.012,mat(0xf0e5cf,.9))}
   for(let i=0;i<8;i++){const a=i*2.4,r=.07+(i%3)*.03;leaf(Math.cos(a)*r,Math.sin(a)*r,.65,a)}
  }else{
   plate();riceMound(18,.12);herbs([[-.1,.08],[.08,-.08],[.1,.1]]);
  }
  group.userData.foodDisplay=true;
  group.userData.foodName=dish;
  group.userData.foodModelVersion=2;
  return {width:.74,depth:.74,height:.28,surfaceType:'tabletop',surfaceY:.22};
 }
 return {build};
})();
