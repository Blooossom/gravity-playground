import test from 'node:test';
import assert from 'node:assert/strict';
import {World,MAX_BALLS} from '../dist/physics.mjs';
import {ENVIRONMENTS,applyEnvironment} from '../dist/environments.mjs';
import {captureScene,restoreScene} from '../dist/scene.mjs';
test('eight environments select their actual forces and reset the previous medium',()=>{
 const w=new World();assert.equal(Object.keys(ENVIRONMENTS).length,8);
 for(const name of Object.keys(ENVIRONMENTS)){const env=applyEnvironment(w,name);assert.equal(w.gy,env.gravity*900);assert.equal(w.restitution,env.bounce/100);assert.equal(w.medium,env.medium);}
 applyEnvironment(w,'water');applyEnvironment(w,'earth');assert.equal(w.medium,'normal');
 assert.throws(()=>applyEnvironment(w,'bad'));
});
test('water slows a moving ball while a storm adds tangential motion',()=>{
 const water=new World(),air=new World();applyEnvironment(water,'water');water.gy=air.gy=0;
 const a=air.add(400,300,10,200,0),b=water.add(400,300,10,200,0);
 for(let i=0;i<120;i++){water.step(1/240);air.step(1/240);}assert.ok(Math.abs(b.vx)<Math.abs(a.vx)*.4);
 const storm=new World();applyEnvironment(storm,'storm');storm.gy=0;const c=storm.add(600,300,10);storm.step(1/240);assert.ok(c.vy>0);assert.ok(c.vx<0);
});
test('10x attraction pulls harder than the former 3x maximum',()=>{
 const slow=new World(),fast=new World();slow.gy=fast.gy=0;slow.attraction=3;fast.attraction=10;
 for(const w of [slow,fast]){w.holes=[{x:600,y:300,r:17}];w.add(300,300,10);w.step(1/240);}
 assert.ok(fast.balls[0].vx>slow.balls[0].vx*3);
});
test('350 balls remain finite at 30g and 10x suction with a recycling exit',()=>{
 const w=new World(1000,700);w.gy=30*900;w.attraction=10;w.restitution=1;
 w.holes=[{x:450,y:500,r:17},{x:750,y:150,r:17,kind:'white'}];
 for(let i=0;i<MAX_BALLS;i++)w.add(50+(i%25)*35,50+Math.floor(i/25)*35,8+(i%8));
 for(let i=0;i<1200;i++)w.step(1/240);
 assert.equal(w.balls.length,350);for(const b of w.balls){assert.ok([b.x,b.y,b.vx,b.vy].every(Number.isFinite));assert.ok(b.x>=b.r&&b.x<=w.width-b.r);assert.ok(b.y>=b.r&&b.y<=w.height-b.r);}
});
test('new maximums and environment persist, old scenes still restore',()=>{
 const w=new World();w.attraction=10;w.add(100,100,12,2500,-2500);
 const settings={size:'random',direction:'down',gravity:30,raining:true,showTrails:false,chaos:false,environment:'storm'};
 const saved=captureScene(w,settings),dest=new World();restoreScene(dest,saved);assert.equal(dest.attraction,10);assert.equal(dest.medium,'storm');
 delete saved.settings.environment;restoreScene(dest,saved);assert.equal(dest.medium,'normal');
 saved.settings.environment='unknown';assert.throws(()=>restoreScene(dest,saved));
});
