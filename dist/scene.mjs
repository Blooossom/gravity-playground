import {World,MAX_BALLS,COLORS} from './physics.mjs';
export function captureScene(world,settings){
 return {version:1,settings:{...settings,restitution:world.restitution,attraction:world.attraction},
 balls:world.balls.map(b=>({x:b.x/world.width,y:b.y/world.height,r:b.r,vx:b.vx,vy:b.vy,color:b.color})),
 holes:world.holes.map(h=>({x:h.x/world.width,y:h.y/world.height,kind:h.kind||'black',phase:h.phase||0}))};
}
export function restoreScene(world,data){
 const fail=()=>{throw new Error('Invalid saved scene');};
 const num=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
 if(!data||data.version!==1||!data.settings||!Array.isArray(data.balls)||data.balls.length>MAX_BALLS||!Array.isArray(data.holes)||data.holes.length>12)fail();
 const s=data.settings;
 if(!['small','medium','large','random'].includes(s.size)||!['up','right','down','left','zero'].includes(s.direction)||!num(s.gravity,0,3)||!num(s.restitution,0,1)||!num(s.attraction,.2,3)||['raining','showTrails','chaos'].some(k=>typeof s[k]!=='boolean'))fail();
 for(const b of data.balls)if(!b||!num(b.x,0,1)||!num(b.y,0,1)||!num(b.r,7,28)||!num(b.vx,-2000,2000)||!num(b.vy,-2000,2000)||!COLORS.includes(b.color))fail();
 for(const h of data.holes)if(!h||!num(h.x,0,1)||!num(h.y,0,1)||!['black','white'].includes(h.kind)||!num(h.phase,0,7))fail();
 for(const kind of ['black','white'])if(data.holes.filter(h=>h.kind===kind).length>6)fail();
 // Validate everything before replacing the current scene.
 const next=new World(world.width,world.height);
 for(const b of data.balls){const ball=next.add(b.x*world.width,b.y*world.height,b.r,b.vx,b.vy);ball.color=b.color;}
 world.balls=next.balls;world.nextId=next.nextId;
 world.holes=data.holes.map(h=>({...h,x:h.x*world.width,y:h.y*world.height,r:17,pulse:0}));
 world.restitution=s.restitution;world.attraction=s.attraction;world.absorbed=0;world.recycled=0;world.exitCursor=0;
 return {...s};
}
