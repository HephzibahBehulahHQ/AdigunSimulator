import test from "node:test";
import assert from "node:assert/strict";
import { attachMenuDismissal, dismissMenuCommand } from "../js/menu-dismissal.mjs";

function fixture(deferred = false) {
  const menus = [0,1].map(() => ({ open:false, dataset:{menuDismiss:deferred ? "after-use" : ""}, handlers:new Map(), addEventListener(name, fn){this.handlers.set(name,fn);}, removeEventListener(name){this.handlers.delete(name);} }));
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


test("Example selector stays open until a successful load and mouse departure",()=>{
  const f=fixture(true), menu=f.menus[0]; menu.open=true; f.emit(0,"toggle");
  const target={closest:selector=>selector===".app-menu-popover"?{closest:()=>menu}:true};
  dismissMenuCommand(target); assert.equal(menu.open,true);
  f.emit(0,"pointerleave",{pointerType:"mouse"}); assert.equal(f.tasks.size,0);
  f.emit(0,"pointerenter"); f.controller.complete(menu); assert.equal(f.tasks.size,0);
  f.emit(0,"pointerleave",{pointerType:"mouse"}); assert.equal(f.tasks.size,1);
  [...f.tasks.values()][0](); assert.equal(menu.open,false);
});

test("a new example choice cancels pending dismissal; asynchronous completion handles an earlier departure",()=>{
  const f=fixture(true),menu=f.menus[0];menu.open=true;f.emit(0,"toggle");
  f.controller.complete(menu);f.emit(0,"pointerleave",{pointerType:"mouse"});
  f.emit(0,"pointerdown",{target:{closest:()=>true}});assert.equal(f.tasks.size,0);
  f.emit(0,"change",{target:{closest:()=>true}});f.emit(0,"pointerleave",{pointerType:"mouse"});
  assert.equal(f.tasks.size,0);f.controller.complete(menu);assert.equal(f.tasks.size,1);
  f.emit(0,"pointerenter");assert.equal(f.tasks.size,0);
  f.emit(0,"pointerleave",{pointerType:"touch"});assert.equal(f.tasks.size,0);
});

test("ordinary menu commands close, while selects, inputs and labels retain their popover",()=>{
  const menu={open:true,dataset:{}}, popover={closest:()=>menu};
  for(const command of [false,true]){
    menu.open=true;
    dismissMenuCommand({closest:selector=>selector===".app-menu-popover"?popover:command});
    assert.equal(menu.open,!command);
  }
  dismissMenuCommand({closest:()=>null});
});

test("Edit form stays open during pointer departure and closes only on its command",()=>{
  const f=fixture(),menu=f.menus[0];menu.dataset.menuDismiss='form';menu.open=true;f.emit(0,'toggle');
  f.emit(0,'pointerleave',{pointerType:'mouse'});assert.equal(f.tasks.size,0);assert.equal(menu.open,true);
  const popover={closest:()=>menu};dismissMenuCommand({closest:s=>s==='.app-menu-popover'?popover:false});assert.equal(menu.open,true);
  dismissMenuCommand({closest:s=>s==='.app-menu-popover'?popover:true});assert.equal(menu.open,false);
});
