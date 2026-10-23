import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../dist/physics.mjs';
import {captureScene,restoreScene} from '../dist/scene.mjs';
const settings={size:'random',direction:'down',gravity:1,raining:true,showTrails:true,chaos:false};
test('saved scene restores positions proportionally and retains settings and appearance',()=>{
 const source=new World(800,600),target=new World(400,300);const b=source.add(200,150,12,110,-90);
 source.holes=[{x:100,y:400,kind:'black',phase:1,r:17},{x:700,y:100,kind:'white',phase:2,r:17}];source.restitution=.92;source.attraction=1.5;
 const snapshot=JSON.parse(JSON.stringify(captureScene(source,settings)));
 const restored=restoreScene(target,snapshot);assert.equal(target.balls[0].x,100);assert.equal(target.balls[0].y,75);assert.equal(target.balls[0].color,b.color);assert.equal(target.balls[0].vx,110);assert.equal(target.holes[1].x,350);assert.equal(target.holes[1].kind,'white');assert.equal(target.attraction,1.5);assert.equal(target.restitution,.92);assert.equal(restored.raining,true);assert.equal(restored.showTrails,true);
});
test('invalid stored scenes are rejected without changing the current playground',()=>{
 const w=new World(),b=w.add(200,200);w.holes=[{x:100,y:100,kind:'black',phase:1,r:17}];
 const saved=captureScene(w,settings);
 for(const corrupt of [null,{...saved,version:99},{...saved,balls:[{...saved.balls[0],x:NaN}]},{...saved,holes:[{x:.5,y:.5,kind:'bad',phase:1}]},{...saved,settings:{...saved.settings,gravity:20}}]){assert.throws(()=>restoreScene(w,corrupt));assert.equal(w.balls[0],b);assert.equal(w.holes.length,1);}
});
