import test from 'node:test';
import assert from 'node:assert/strict';
import {World,MAX_BALLS} from '../dist/physics.mjs';
test('gravity changes direction and zero gravity preserves a stationary ball',()=>{const w=new World();const b=w.add(300,300,12);w.gx=0;w.gy=0;w.step(1/180);assert.equal(b.y,300);w.gx=-900;w.step(1/180);assert.ok(b.vx<0);assert.equal(b.vy,0);});
test('equal mass elastic collision exchanges velocity and conserves momentum',()=>{const w=new World();w.restitution=1;const a=w.add(100,100,10,100,0),b=w.add(119,100,10,-50,0);w.collide(a,b);assert.equal(a.vx,-50);assert.equal(b.vx,100);assert.equal(a.vx+b.vx,50);});
test('walls reflect with configured restitution',()=>{const w=new World(400,300);w.restitution=.5;const b=w.add(11,100,10,-100,0);b.x=5;w.boundary(b);assert.equal(b.x,10);assert.equal(b.vx,50);});
test('black hole pulls nearby balls and absorbs balls in its core',()=>{const w=new World();w.gx=w.gy=0;w.holes=[{x:300,y:300,r:17}];const b=w.add(200,300,10);w.add(300,300,10);w.step(1/180);assert.equal(w.balls.length,1);assert.equal(w.absorbed,1);assert.ok(b.vx>0);});
test('capacity and dense simulation remain bounded and finite',()=>{const w=new World(800,600);for(let i=0;i<MAX_BALLS+20;i++)w.add(50+(i%25)*28,40+Math.floor(i/25)*27,10,i%2?100:-100,-80);assert.equal(w.balls.length,MAX_BALLS);for(let i=0;i<900;i++)w.step(1/180);for(const b of w.balls){for(const n of [b.x,b.y,b.vx,b.vy])assert.ok(Number.isFinite(n));assert.ok(b.x>=b.r&&b.x<=w.width-b.r);assert.ok(b.y>=b.r&&b.y<=w.height-b.r);}});
test('white hole recycles the same ball, preserving appearance and clearing its old trail',()=>{
 const w=new World(800,600);w.gx=w.gy=0;
 w.holes=[{x:200,y:200,r:17},{x:600,y:200,r:17,kind:'white'}];
 const b=w.add(200,200,13,250,0),color=b.color,id=b.id;b.trail=[{x:10,y:10}];
 w.step(1/180);
 assert.equal(w.balls.length,1);assert.equal(w.balls[0],b);assert.equal(b.id,id);assert.equal(b.color,color);assert.equal(b.r,13);
 assert.ok(Math.hypot(b.x-600,b.y-200)>30);assert.ok(Math.hypot(b.x-600,b.y-200)<60);
 assert.ok(Math.hypot(b.vx,b.vy)>300);assert.equal(b.trail.length,0);assert.equal(w.recycled,1);
 // Moving it onto another core must not recapture it during the escape grace period.
 b.x=200;b.y=200;w.step(1/180);assert.equal(w.recycled,1);assert.ok(Number.isFinite(b.vx));
});
test('multiple white holes share incoming balls in turn',()=>{
 const w=new World(1000,700);w.gx=w.gy=0;
 w.holes=[{x:200,y:200,r:17},{x:500,y:200,r:17,kind:'white'},{x:800,y:400,r:17,kind:'white'}];
 const a=w.add(200,200,10);w.step(1/180);const b=w.add(200,200,10);w.step(1/180);
 assert.ok(Math.hypot(a.x-500,a.y-200)<60);assert.ok(Math.hypot(b.x-800,b.y-400)<60);assert.equal(w.recycled,2);
});
test('white holes alone do not swallow balls; removing exits restores absorption',()=>{
 const w=new World();w.gx=w.gy=0;w.holes=[{x:300,y:300,r:17,kind:'white'}];
 w.add(300,300,10);w.step(1/180);assert.equal(w.balls.length,1);assert.equal(w.absorbed,0);
 w.holes[0].kind='black';w.step(1/180);assert.equal(w.balls.length,0);
});
test('recycling at capacity and at a corner keeps every ball finite and inside bounds',()=>{
 const w=new World(800,600);w.holes=[{x:400,y:300,r:17},{x:0,y:0,r:17,kind:'white'}];
 for(let i=0;i<MAX_BALLS;i++)w.add(50+(i%25)*28,40+Math.floor(i/25)*27,10);
 w.balls[0].x=400;w.balls[0].y=300;
 for(let i=0;i<900;i++)w.step(1/180);
 assert.equal(w.balls.length,MAX_BALLS);assert.ok(w.recycled>0);
 for(const b of w.balls){assert.ok([b.x,b.y,b.vx,b.vy].every(Number.isFinite));assert.ok(b.x>=b.r&&b.x<=w.width-b.r);assert.ok(b.y>=b.r&&b.y<=w.height-b.r);}
});
