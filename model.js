/* Reglas compartidas por la web y las verificaciones de cálculo. Sin dependencias. */
(function (root) {
  'use strict';
  const DEFAULTS = Object.freeze({ price:69.9, cost:25, inbound:5, pack:3, fee:3, reserve:3, cac:12, delivery:0, volume:60, fixed:200, labor:600, investment:2500 });
  function calculate(values) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) return {valid:false,error:'Introduce los supuestos del pedido.'};
    const v = {};
    for (const key of Object.keys(DEFAULTS)) {
      const raw = values[key];
      if (!['number','string'].includes(typeof raw) || String(raw).trim() === '' || !Number.isFinite(Number(raw)) || Number(raw) < 0) return {valid:false, error:'Completa todos los importes con valores válidos, iguales o mayores a cero.'};
      v[key] = Number(raw);
    }
    if (v.price <= 0) return {valid:false,error:'El precio de venta debe ser mayor a cero.'};
    if (v.fee > 100) return {valid:false,error:'La comisión no puede superar el 100 %.'};
    if (!Number.isInteger(v.volume)) return {valid:false,error:'Los pedidos mensuales deben ser un número entero.'};
    const commission = v.price * v.fee / 100;
    const variableBeforeAds = v.cost + v.inbound + v.pack + commission + v.reserve + v.delivery;
    const contribution = v.price - variableBeforeAds - v.cac;
    const monthly = contribution * v.volume - v.fixed - v.labor;
    const breakEven = contribution > 0 ? Math.ceil((v.fixed + v.labor) / contribution) : null;
    return {valid:true, values:v, commission, variableBeforeAds, contribution, monthly, breakEven,
      revenue:v.price*v.volume, contributionRate:contribution/v.price*100,
      maxCac:v.price-variableBeforeAds,
      payback:monthly>0 ? v.investment/monthly : null};
  }
  const api = {DEFAULTS, calculate};
  root.BusinessModel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
