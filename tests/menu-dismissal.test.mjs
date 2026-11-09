import test from "node:test";
import assert from "node:assert/strict";
import { attachMenuDismissal } from "../js/menu-dismissal.mjs";

function fixture() {
  const menus = [0,1].map(() => ({ open:false, handlers:new Map(), addEventListener(name, fn){this.handlers.set(name,fn);}, removeEventListener(name){this.handlers.delete(name);} }));
  let next=0, active=null; const tasks=new Map();
  const controller=attachMenuDismissal(menus,{onActiveChange:value=>{active=value;},schedule:(fn,delay)=>{assert.equal(delay,200);tasks.set(++next,fn);return next;},cancel:id=>tasks.delete(id)});
  const emit=(index,name,event={})=>menus[index].handlers.get(name)?.(event);
  return {menus,tasks,controller,emit,get active(){return active;}};
}
test("mouse departure waits 200ms and re-entry or keyboard focus cancels dismissal",()=>{
  const f=fixture(); f.menus[0].open=true; f.emit(0,"toggle"); f.emit(0,"pointerleave",{pointerType:"mouse"});
  assert.equal(f.menus[0].open,true); assert.equal(f.tasks.size,1);
  f.emit(0,"pointerenter"); assert.equal(f.tasks.size,0);
  f.emit(0,"pointerleave",{pointerType:"mouse"}); f.emit(0,"focusin"); assert.equal(f.tasks.size,0);
  f.emit(0,"pointerleave",{pointerType:"mouse"}); [...f.tasks.values()][0]();
  assert.equal(f.menus[0].open,false); assert.equal(f.active,null);
});
test("touch and pen departure retain menus; opening another closes only the previous transient menu",()=>{
  const f=fixture(); f.menus[0].open=true; f.emit(0,"toggle");
  for(const pointerType of ["touch","pen",undefined]) f.emit(0,"pointerleave",{pointerType});
  assert.equal(f.tasks.size,0); assert.equal(f.menus[0].open,true);
  f.menus[1].open=true; f.emit(1,"toggle"); assert.equal(f.menus[0].open,false); assert.equal(f.active,1);
});
test("lifecycle cleanup cancels pending dismissal and removes installed listeners",()=>{
  const f=fixture(); f.menus[0].open=true; f.emit(0,"pointerleave",{pointerType:"mouse"});
  f.controller.clearPending(); assert.equal(f.tasks.size,0);
  f.emit(0,"pointerleave",{pointerType:"mouse"}); f.controller.dispose();
  assert.equal(f.tasks.size,0); assert.ok(f.menus.every(menu=>menu.handlers.size===0));
});
