'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {DEFAULTS, calculate} = require('../model.js');
const approx = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-8,`${actual} ≠ ${expected}`);

test('el ejemplo cubre todos los costos y valora el trabajo',()=>{
  const r=calculate(DEFAULTS);
  assert.equal(r.valid,true);
  approx(r.contribution,19.803);
  approx(r.monthly,388.18);
  assert.equal(r.breakEven,41);
  approx(r.revenue,4194);
  approx(r.payback,2500/388.18);
});
test('una venta con pérdida no promete equilibrio ni recuperación',()=>{
  const r=calculate({...DEFAULTS,price:30});
  assert.ok(r.contribution<0);
  assert.equal(r.breakEven,null);
  assert.equal(r.payback,null);
});
test('cero ventas mantiene los gastos y no produce recuperación',()=>{
  const r=calculate({...DEFAULTS,volume:0});
  assert.equal(r.monthly,-800);
  assert.equal(r.revenue,0);
  assert.equal(r.payback,null);
});
test('una contribución exactamente cero no puede cubrir gastos',()=>{
  const r=calculate({...DEFAULTS,price:48,fee:0});
  assert.equal(r.contribution,0);
  assert.equal(r.breakEven,null);
  assert.equal(r.payback,null);
});
test('el costo completo de un complemento reduce la contribución',()=>{
  const base=calculate(DEFAULTS), gift=calculate({...DEFAULTS,pack:44});
  approx(base.contribution-gift.contribution,41);
});
test('el equilibrio redondea al siguiente pedido entero',()=>{
  const r=calculate({...DEFAULTS,volume:40});
  assert.ok(r.monthly<0);
  assert.ok(calculate({...DEFAULTS,volume:41}).monthly>=0);
});
test('rechaza valores vacíos, fraccionarios en pedidos o importaciones inválidas',()=>{
  [null,[],{},false].forEach(v=>assert.equal(calculate(v).valid,false));
  for(const [key,value] of [['price',0],['cost',-1],['price',''],['cost',' '],['fee',101],['volume',2.3],['price',Infinity],['cac',true]]){
    assert.equal(calculate({...DEFAULTS,[key]:value}).valid,false,`${key}: ${value}`);
  }
});
test('acepta números de los campos HTML y mantiene el objeto original',()=>{
  const values=Object.fromEntries(Object.entries(DEFAULTS).map(([k,v])=>[k,String(v)]));
  const original=JSON.stringify(values);
  approx(calculate(values).monthly,388.18);
  assert.equal(JSON.stringify(values),original);
});
