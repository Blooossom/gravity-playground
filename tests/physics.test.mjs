import test from 'node:test';
import assert from 'node:assert/strict';
import {World,MAX_BALLS} from '../dist/physics.mjs';
test('gravity changes direction and zero gravity preserves a stationary ball',()=>{const w=new World();const b=w.add(300,300,12);w.gx=0;w.gy=0;w.step(1/180);assert.equal(b.y,300);w.gx=-900;w.step(1/180);assert.ok(b.vx<0);assert.equal(b.vy,0);});
test('equal mass elastic collision exchanges velocity and conserves momentum',()=>{const w=new World();w.restitution=1;const a=w.add(100,100,10,100,0),b=w.add(119,100,10,-50,0);w.collide(a,b);assert.equal(a.vx,-50);assert.equal(b.vx,100);assert.equal(a.vx+b.vx,50);});
test('walls reflect with configured restitution',()=>{const w=new World(400,300);w.restitution=.5;const b=w.add(11,100,10,-100,0);b.x=5;w.boundary(b);assert.equal(b.x,10);assert.equal(b.vx,50);});
test('black hole pulls nearby balls and absorbs balls in its core',()=>{const w=new World();w.gx=w.gy=0;w.holes=[{x:300,y:300,r:17}];const b=w.add(200,300,10);w.add(300,300,10);w.step(1/180);assert.equal(w.balls.length,1);assert.equal(w.absorbed,1);assert.ok(b.vx>0);});
test('capacity and dense simulation remain bounded and finite',()=>{const w=new World(800,600);for(let i=0;i<MAX_BALLS+20;i++)w.add(50+(i%25)*28,40+Math.floor(i/25)*27,10,i%2?100:-100,-80);assert.equal(w.balls.length,MAX_BALLS);for(let i=0;i<900;i++)w.step(1/180);for(const b of w.balls){for(const n of [b.x,b.y,b.vx,b.vy])assert.ok(Number.isFinite(n));assert.ok(b.x>=b.r&&b.x<=w.width-b.r);assert.ok(b.y>=b.r&&b.y<=w.height-b.r);}});
