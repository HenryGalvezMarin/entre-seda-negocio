(function () {
  'use strict';
  const C = window.PlanContent, M = window.BusinessModel;
  const KEY = 'entre-seda-plan-v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n);
  const allTasks = C.phases.flatMap(p => p.tasks);
  const defaultState = () => ({version:1,brand:'Entre Seda',owner1:'Socio/a 1',owner2:'Socio/a 2',selected:C.products.map(p=>p.id),tasks:{},owners:{},notes:{},contentStatus:{},calc:{...M.DEFAULTS},gift:{mode:'personal',extras:[]},savedAt:null});
  function cleanState(raw) {
    if (!raw || raw.version !== 1 || typeof raw !== 'object') throw new Error('Formato de avance no compatible.');
    const s=defaultState();
    ['brand','owner1','owner2'].forEach(k=>{if(typeof raw[k]==='string'&&raw[k].trim())s[k]=raw[k].trim().slice(0,60);});
    if(Array.isArray(raw.selected))s.selected=[...new Set(raw.selected.filter(id=>C.products.some(p=>p.id===id)))];
    allTasks.forEach(t=>{
      if(raw.tasks&&[0,1,2].includes(raw.tasks[t.id]))s.tasks[t.id]=raw.tasks[t.id];
      if(raw.owners&&['Ambos','Socio/a 1','Socio/a 2'].includes(raw.owners[t.id]))s.owners[t.id]=raw.owners[t.id];
    });
    ['direccion','roles','presupuesto','fecha','decisiones','muestras'].forEach(k=>{if(raw.notes&&typeof raw.notes[k]==='string')s.notes[k]=raw.notes[k].slice(0,6000);});
    C.contentIdeas.forEach(i=>{if(raw.contentStatus&&['idea','grabar','publicado'].includes(raw.contentStatus[i.id]))s.contentStatus[i.id]=raw.contentStatus[i.id];});
    if(raw.calc&&M.calculate(raw.calc).valid)s.calc={...M.calculate(raw.calc).values};
    if(raw.gift&&['personal','regalo'].includes(raw.gift.mode))s.gift.mode=raw.gift.mode;
    if(raw.gift&&Array.isArray(raw.gift.extras))s.gift.extras=[...new Set(raw.gift.extras.filter(x=>['pouch','scrunchie','robe'].includes(x)))];
    if(typeof raw.savedAt==='string')s.savedAt=raw.savedAt;
    return s;
  }
  let storageWarning=false;
  let state=defaultState();
  try {const old=localStorage.getItem(KEY);if(old)state=cleanState(JSON.parse(old));}catch(e){storageWarning=true;}
  let taskFilter='todos', contentFilter='Todos', activePage='inicio', toastTimer;
  const mobileNavigation=window.matchMedia('(max-width: 900px)');
  function setMenu(open,restoreFocus=false){
    const active=mobileNavigation.matches&&open;
    $('#sidebar').classList.toggle('open',active);
    $('#sidebar').inert=mobileNavigation.matches&&!active;
    $('#nav-backdrop').hidden=!active;
    document.body.classList.toggle('menu-open',active);
    $('#main').inert=active;
    $('#export-button').inert=active;
    $('#menu-toggle').setAttribute('aria-expanded',String(active));
    $('#menu-toggle').setAttribute('aria-label',active?'Cerrar navegación':'Abrir navegación');
    if(active)$('#menu-close').focus();
    else if(restoreFocus)$('#menu-toggle').focus();
  }
  mobileNavigation.addEventListener('change',()=>setMenu(false));
  const ownerLabel=x=>x==='Socio/a 1'?state.owner1:x==='Socio/a 2'?state.owner2:'Ambos';
  function save(){state.savedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){if(!storageWarning){toast('El navegador no permite guardar. Exporta el avance antes de cerrar.');storageWarning=true;}}}
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,5000);}
  function stats(){const done=allTasks.filter(t=>state.tasks[t.id]===2).length;return {done,total:allTasks.length,percent:Math.round(done/allTasks.length*100)};}
  function sectionHead(id,kicker,title,description){return `<div class="section-head"><p class="eyebrow">${kicker}</p><h1 id="title-${id}">${title}</h1><p class="lede">${description}</p></div>`;}
  const badge=(text,kind='proposal')=>`<span class="badge ${kind}">${text}</span>`;
  function illustration(kind,color='#744755',extra='') {
    let shape='';
    if(kind==='conjunto')shape=`<path d="M92 81 102 42M168 81 158 42" stroke-width="5"/><path d="M69 83q30-29 59 1l2 41q-39 17-63-2Z" fill="${color}"/><path d="M132 84q29-30 59-1l2 40q-24 19-63 2Z" fill="${color}"/><path d="M68 125q62 18 124 0l-2 11q-60 16-120 0Z" fill="${color}"/><path d="M74 92q30 31 51-2m10 0q24 29 51 2" stroke="#ead9d9" stroke-dasharray="2 4"/><path d="M78 181q52 16 104 0l-28 58h-48Z" fill="${color}"/><path d="M78 181q52 40 104 0M88 198q42 8 84 0" stroke="#ead9d9" stroke-dasharray="2 4"/><path d="m127 133-7 8m13-8 7 8m-12-53-7-7m12 7 7-7" stroke="#eec9c5"/>`;
    else if(kind==='pijama')shape=`<path d="m95 62 3-25m67 25-3-25" stroke-width="5"/><path d="M91 61q17 16 39 0 22 16 39 0l15 85q-54 13-108 0Z" fill="${color}"/><path d="M92 66q19 20 38 5 20 16 38-5M80 139q50 13 100 0" stroke="#f8eadd" stroke-dasharray="3 3"/><path d="M83 177q47 8 94 0l16 64-53 2-10-35-10 35-53-2Z" fill="${color}"/><path d="M83 184h94M71 234l46 3m26 0 46-3" stroke="#f7e5d9" stroke-dasharray="3 3"/>`;
    else shape=`<path d="m96 64 2-28m66 28-2-28" stroke-width="5"/><path d="M91 64q19 24 39 0 20 24 39 0l-9 58 38 116q-68 22-136 0l38-116Z" fill="${color}" opacity=".9"/><path d="M96 109q34 11 68 0M66 231q64 24 128 0" stroke="#efd5da" stroke-dasharray="3 4"/><path d="M112 130 94 223m53-93 18 93" stroke="#f3dce1" opacity=".35"/>`;
    return `<svg ${extra} class="garment-art" viewBox="0 0 260 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shape}<path d="M208 55v14m-7-7h14M47 177v10m-5-5h10" stroke="${color}" opacity=".45"/></g></svg>`;
  }
  function renderStart(){
    const st=stats();const next=allTasks.find(t=>state.tasks[t.id]!==2);
    $('#inicio').innerHTML=`
      <div class="intro-line"><span class="eyebrow">EL COMIENZO DE ALGO NUESTRO</span><span class="edition">EDICIÓN 01 / LIMA, PERÚ</span></div>
      <div class="hero">
        <div class="hero-copy"><div class="pill"><span class="status-dot"></span> Una marca en construcción</div><h1 id="title-inicio">Una idea bonita.<br><em>Un negocio con<br>intención.</em></h1><p>De elegir la primera prenda a entregar un pedido que dé ganas de volver. Este es nuestro espacio para entender, decidir y avanzar juntos.</p><div class="hero-buttons"><a href="#ruta" class="button button-primary">Ver nuestro siguiente paso <span>↗</span></a><a href="#marca" class="text-link">Conocer la idea <span>→</span></a></div><div class="hero-footnote">Lencería seleccionada · Experiencia cuidada · Números claros</div></div>
        <div class="moodboard" role="img" aria-label="Moodboard ilustrado de lencería color vino, una tarjeta de regalo y muestras de color. Referencia conceptual, no productos reales.">
          <span class="mood-label">EL UNIVERSO QUE IMAGINAMOS</span><div class="mood-orbit"></div><div class="mood-product"><span class="tiny">COLECCIÓN 01</span>${illustration('conjunto','#653546')}<span class="product-caption">Delicada. Cómoda. Tuya.</span></div><div class="gift-card"><span class="gift-bow">✧</span><span>Un detalle<br><em>para ti.</em></span><small>CON CARIÑO, SIEMPRE</small></div><div class="swatches"><i></i><i></i><i></i><span>nuestra primera paleta</span></div><span class="mood-foot">Ilustración de concepto · Nombre provisional</span>
        </div>
      </div>
      <div class="overview-stats"><div><span>01 / PROPUESTA</span><strong>Lencería + confianza</strong><p>Una selección pequeña, bien explicada.</p></div><div><span>02 / MODELO INICIAL</span><strong>Stock pequeño en Lima</strong><p>Muestras primero. Reposición con datos.</p></div><div><span>03 / ETAPA ACTUAL</span><strong>${st.done===st.total?'Revisión del piloto':'Validación de la idea'}</strong><p>${st.done} de ${st.total} tareas completadas.</p></div></div>
      <div class="section-title"><div><p class="eyebrow">EMPEZAR ES MÁS FÁCIL CON UN MAPA</p><h2>Tres preguntas que nos guían.</h2></div><span class="hand-note">paso a paso, juntos ↙</span></div>
      <div class="three-grid guide-grid"><a href="#marca" class="guide-card"><span class="guide-number">01</span><h3>¿Para quién<br>estamos creando?</h3><p>Mujeres adultas que buscan sentirse cómodas y bonitas; también quienes desean hacer un regalo.</p><span class="text-link">La marca y su público →</span></a><a href="#experiencia" class="guide-card"><span class="guide-number">02</span><h3>¿Por qué<br>nos elegirían?</h3><p>Producto comprobado, fotos reales, orientación útil y una presentación que se siente especial.</p><span class="text-link">Diseñar la experiencia →</span></a><a href="#numeros" class="guide-card"><span class="guide-number">03</span><h3>¿Cómo hacemos<br>que se sostenga?</h3><p>Medir lo que deja cada pedido, el tiempo que dedicamos y lo que cuesta conseguir una venta.</p><span class="text-link">Explorar los números →</span></a></div>
      <div class="next-step"><div class="next-icon">↗</div><div><p class="eyebrow">NUESTRO SIGUIENTE PASO</p><h3>${next?esc(next.title):'Revisar lo aprendido y decidir el siguiente ciclo'}</h3><p>${next?esc(next.detail):'La lista está completa. Ahora contrasten los resultados reales con sus objetivos.'}</p></div><a href="#ruta" class="button button-primary">Ir a la ruta →</a></div>
      <div class="notice subtle"><strong>Este cuaderno distingue ideas de evidencia.</strong> Los productos, cantidades y metas son propuestas de prueba. Los precios investigados son referencias históricas, no cotizaciones. <a href="#fuentes">Ver fuentes y pendientes →</a></div>`;
  }
  function renderBrand(){
    $('#marca').innerHTML=sectionHead('marca','01 / EL CORAZÓN DEL PROYECTO','Una marca que se siente <em>cercana.</em>','Una dirección inicial para conversar y probar. Cada promesa debe poder sostenerse en el producto y en la atención.')+`
      <div class="manifesto"><span class="eyebrow">NUESTRO CONCEPTO · PROPUESTA</span><p>Lencería que eliges con confianza<br>y recibes como <em>un detalle especial.</em></p><div>Seleccionamos prendas cómodas y sensuales, las mostramos tal como son y acompañamos la elección. Para una misma, para regalar o para una ocasión especial.</div></div>
      <div class="two-grid"><article class="paper-card"><span class="eyebrow">MISIÓN</span><h2>Hacer más fácil<br>elegir algo bonito.</h2><p>Ofrecer una selección de lencería con calidad revisada, información clara sobre ajuste y una experiencia de compra atenta, desde la consulta hasta la entrega.</p></article><article class="paper-card tint"><span class="eyebrow">VISIÓN</span><h2>Ser una marca<br>a la que quieras volver.</h2><p>Construir una marca peruana reconocida por cumplir lo que promete, mantener sus modelos favoritos y desarrollar, con el tiempo, una colección propia basada en lo aprendido de sus clientas.</p></article></div>
      <div class="section-title"><div><p class="eyebrow">PÚBLICO INICIAL · HIPÓTESIS</p><h2>Dos motivos de compra.</h2></div>${badge('Por validar')}</div>
      <div class="two-grid"><article class="persona"><span class="persona-number">A</span><h3>«Quiero algo para mí»</h3><p>Mujer adulta en Lima que valora el diseño y quiere entender cómo queda antes de comprar por redes.</p><dl><dt>Busca</dt><dd>Comodidad, sensualidad y un precio que pueda justificar.</dd><dt>Le preocupa</dt><dd>Talla, transparencia, textura y que la prenda sea distinta a la foto.</dd><dt>Nuestra respuesta</dt><dd>Videos propios, medidas por modelo y orientación honesta sobre el ajuste.</dd></dl></article><article class="persona"><span class="persona-number">B</span><h3>«Quiero tener un detalle»</h3><p>Persona adulta que desea regalar una prenda elegida según los gustos de su destinataria.</p><dl><dt>Busca</dt><dd>Una elección acertada, una presentación cuidada y una entrega previsible.</dd><dt>Le preocupa</dt><dd>Equivocarse de talla, estilo o fecha.</dd><dt>Nuestra respuesta</dt><dd>Asesoría, tarjeta personalizada y posibilidad de que ella elija la talla.</dd></dl></article></div>
      <p class="microcopy">No hemos validado una edad, nivel socioeconómico ni frecuencia de recompra específicos. Tampoco existe evidencia de un segmento desatendido en esta investigación.</p>
      <div class="section-title"><div><p class="eyebrow">LO QUE QUEREMOS CUMPLIR</p><h2>Valores que se notan.</h2></div></div>
      <div class="values"><div><b>01</b><h3>Honestidad</h3><p>Fotos reales, composición comprobada y origen descrito con claridad.</p></div><div><b>02</b><h3>Cuidado</h3><p>Revisar cada prenda y respetar la privacidad de la clienta.</p></div><div><b>03</b><h3>Criterio</h3><p>Elegir pocos modelos que podamos explicar y reponer bien.</p></div><div><b>04</b><h3>Constancia</h3><p>Cumplir plazos y resolver problemas después de vender.</p></div></div>
      <div class="paper-card direction"><div><p class="eyebrow">DIRECCIÓN VISUAL · BORRADOR</p><h3>Suave, editorial y cercana.</h3><p>Crema para dar aire, vino para identidad y rosa para detalles. Fotografías con luz natural, texturas y primeros planos del producto.</p></div><div class="palette"><span style="--swatch:#582b3b">Vino<br><small>#582B3B</small></span><span style="--swatch:#e8c9c6">Rosa<br><small>#E8C9C6</small></span><span style="--swatch:#f7f3ed">Crema<br><small>#F7F3ED</small></span></div></div>
      <div class="notice"><strong>Entre Seda es un nombre de trabajo.</strong> Su disponibilidad de marca, dominio y redes está pendiente. La primera etapa sería una tienda que selecciona productos; una línea propia se evaluará después.</div>
      <label class="note-field">Nuestra decisión sobre la marca<textarea data-note="direccion" placeholder="Qué nos representa, qué cambiaríamos y qué propuesta vamos a probar…">${esc(state.notes.direccion||'')}</textarea></label>`;
  }
  function renderCollection(){
    $('#coleccion').innerHTML=sectionHead('coleccion','02 / LA PRIMERA SELECCIÓN','Pocas prendas.<br><em>Elegidas con intención.</em>','Una propuesta de cinco modelos para pedir muestras. Las ilustraciones son conceptuales: todavía no son productos ni proveedores elegidos.')+`
      <div class="selection-bar"><div><span class="eyebrow">LISTA DE MUESTRAS</span><strong id="selection-count"></strong></div><div><span class="eyebrow">ESTIMACIÓN DE PRUEBA</span><strong id="selection-total"></strong></div><p>Supuestos por muestra, sin flete ni tributos.<br>Confirmar cotización antes de comprar.</p></div>
      <div class="product-grid">${C.products.map(p=>`<article class="product-card ${state.selected.includes(p.id)?'selected':''}" data-product-card="${p.id}"><div class="product-art" style="background:${p.bg}"><span class="product-type">${p.label}</span>${illustration(p.kind,p.color)}<label class="sample-toggle"><input type="checkbox" data-product="${p.id}" ${state.selected.includes(p.id)?'checked':''}><span>Incluir muestra</span></label></div><div class="product-info">${badge(p.tag)}<h2>${p.name}</h2><p>${p.description}</p><div class="product-meta"><span>${p.role}</span><strong>${money(p.sample)}*</strong></div><details><summary>Qué comprobar antes de vender</summary><p>${p.inspect}</p><p><strong>Idea de contenido:</strong> ${p.content}</p></details></div></article>`).join('')}</div>
      <div class="notice subtle"><strong>La selección es una hipótesis, no un ranking de ventas.</strong> Los básicos aparecen entre favoritos de marcas como Leonisa; no encontramos un ranking público fiable de lencería sensual en Perú. <a href="#fuentes">Revisar evidencia →</a></div>
      <div class="section-title"><div><p class="eyebrow">CÓMO NOS ABASTECERÍAMOS</p><h2>Elegir el modelo de compra.</h2></div></div>
      <div class="table-wrap"><table><caption>Alternativas para abastecer la colección</caption><thead><tr><th>Alternativa</th><th>Lo que aporta</th><th>Lo que debemos resolver</th><th>Decisión inicial</th></tr></thead><tbody><tr><td>Mayorista local + stock</td><td>Inspección y reposición más cercana.</td><td>Mínimos, tallas predefinidas y costo completo.</td>Comparar con importación.</td></tr><tr><td>Importar + tener stock</td><td>Selección de diseños y entrega desde Lima.</td><td>Calidad, flete, formalización, plazos y continuidad.</td><strong>Opción a probar con muestras.</strong></td></tr><tr><td>Venta por encargo</td><td>Menos inventario inmovilizado.</td><td>Espera explícita, disponibilidad y cancelaciones.</td>Complemento para variantes probadas.</td></tr><tr><td>Dropshipping directo</td><td>Proveedor despacha a la clienta.</td><td>Menor control de revisión, empaque y entrega.</td>No es el punto de partida propuesto.</td></tr></tbody></table></div>
      <div class="two-grid"><article class="paper-card"><p class="eyebrow">PRIMER LOTE · DESPUÉS DE LAS MUESTRAS</p><h3>30–40 unidades como referencia.</h3><p>Comprar solo modelos aprobados. Un conjunto completo cuenta como una unidad vendible. Distribuir tallas según medidas del proveedor y primeras señales; no tenemos una mezcla S/M/L validada.</p></article><article class="paper-card"><p class="eyebrow">CRITERIO DE RECHAZO</p><h3>Bonito no es suficiente.</h3><p>Descartar defectos, medidas inconsistentes, costos que eliminan el margen o falta de reposición. Los cupones de primera compra no garantizan un costo sostenible.</p></article></div>
      <label class="note-field">Notas de muestras y proveedores<textarea data-note="muestras" placeholder="Proveedor · código · precio final · fecha estimada · qué aprobamos y qué descartamos…">${esc(state.notes.muestras||'')}</textarea></label>`;
    updateSelection();
  }
  function updateSelection(){const products=C.products.filter(p=>state.selected.includes(p.id));$('#selection-count').textContent=`${products.length} modelos seleccionados`;$('#selection-total').textContent=money(products.reduce((a,p)=>a+p.sample,0));$$('[data-product-card]').forEach(el=>el.classList.toggle('selected',state.selected.includes(el.dataset.productCard)));}
  function renderExperience(){
    $('#experiencia').innerHTML=sectionHead('experiencia','03 / EL VALOR QUE SE SIENTE','La experiencia también<br><em>forma parte del producto.</em>','Ayudar a elegir, cumplir lo prometido y preparar un detalle bonito. Una misma colección, dos formas de acompañar la compra.')+`
      <div class="experience-layout"><div class="paper-card experience-controls"><div class="segmented" role="group" aria-label="Motivo de compra"><button type="button" data-gift-mode="personal" aria-pressed="${state.gift.mode==='personal'}">Para mí</button><button type="button" data-gift-mode="regalo" aria-pressed="${state.gift.mode==='regalo'}">Para regalo</button></div><h2>Arma una experiencia.</h2><p>La presentación básica ya incluye protección de la prenda, papel seda, cuidados y exterior discreto.</p><div class="addon-list">${[['pouch','Bolsita reutilizable','Para guardar la prenda o viajar.',4],['scrunchie','Scrunchie a juego','Un detalle relacionado con la colección.',3],['robe','Bata combinable','Complemento opcional; requiere talla y control de calidad.',35]].map(([id,name,desc,cost])=>`<label class="addon"><input type="checkbox" data-extra="${id}" ${state.gift.extras.includes(id)?'checked':''}><span><strong>${name}</strong><small>${desc}</small></span><b>+${money(cost)}*</b></label>`).join('')}</div><p class="microcopy">*Costos supuestos para explorar. Deben cotizarse. No son precios de venta ni accesorios confirmados.</p><div class="gift-cost"><span>Costo estimado de presentación y extras</span><strong id="gift-cost"></strong></div><button class="button button-primary full" id="apply-pack" type="button">Usar este costo en el simulador →</button></div><div class="gift-preview"><span class="eyebrow">ASÍ QUEREMOS QUE SE SIENTA</span><div class="parcel"><div class="ribbon"></div><div class="parcel-card"><span>✧</span><h3 id="gift-heading"></h3><p id="gift-message"></p><small data-brand>Entre Seda</small></div></div><h3 id="gift-title"></h3><p id="gift-description"></p><div id="gift-includes" class="gift-includes"></div><span class="microcopy">Presentación conceptual. Validar armado, costo y resistencia.</span></div></div>
      <div class="section-title"><div><p class="eyebrow">DE LA CONSULTA A LA RECOMPRA</p><h2>Detalles que generan confianza.</h2></div></div>
      <div class="journey"><article><span>01</span><h3>Antes</h3><p>Fotos reales, composición, medidas y explicación de cobertura. Orientar sin solicitar fotos íntimas.</p></article><article><span>02</span><h3>Al elegir</h3><p>Confirmar variante, precio total, stock, entrega y condiciones. Distinguir disponible de por encargo.</p></article><article><span>03</span><h3>Al recibir</h3><p>Prenda revisada, paquete discreto y cuidados específicos. Tarjeta personalizada si es regalo.</p></article><article><span>04</span><h3>Después</h3><p>Consultar si llegó bien, atender incidencias y pedir permiso para compartir una reseña.</p></article></div>
      <div class="two-grid"><article class="paper-card"><h3>Regalar sin adivinar.</h3><p>Si no se conoce la talla, ofrecer que la destinataria elija. Una tarjeta de regalo sería una idea futura: definir vigencia, uso y condiciones antes de venderla.</p></article><article class="paper-card"><h3>Una promesa comprobable.</h3><p>Combinar tallas solo si el abastecimiento lo permite. No prometer ajuste universal, entrega inmediata o fabricación propia sin poder cumplirlo.</p></article></div>`;
    updateGift();
  }
  function giftCost(){return 3+(state.gift.mode==='regalo'?2:0)+state.gift.extras.reduce((a,id)=>a+({pouch:4,scrunchie:3,robe:35}[id]||0),0);}
  function updateGift(){
    const gift=state.gift.mode==='regalo';
    $$('[data-gift-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.giftMode===state.gift.mode)));
    $('#gift-cost').textContent=money(giftCost());$('#gift-heading').textContent=gift?'Elegido para ti.':'Un detalle para ti.';
    $('#gift-message').textContent=gift?'Un mensaje tuyo hace el detalle más personal.':'Un momento bonito también puede ser solo tuyo.';
    $('#gift-title').textContent=gift?'Que regalar se sienta fácil.':'Que estrenarlo se sienta especial.';
    $('#gift-description').textContent=gift?'Asesoría según sus gustos, talla confirmada y una fecha de entrega acordada.':'Una compra informada, una prenda revisada y una presentación cuidada.';
    $('#gift-includes').innerHTML=[gift?'Tarjeta personalizada':'Tarjeta de cuidados','Exterior discreto',...state.gift.extras.map(x=>({pouch:'Bolsita',scrunchie:'Scrunchie',robe:'Bata'}[x]))].map(x=>`<span>${x}</span>`).join('');
  }
  function renderSales(){
    $('#ventas').innerHTML=sectionHead('ventas','04 / MOSTRAR, CONVERSAR, ENTREGAR','Contenido que ayuda.<br><em>Ventas que podemos medir.</em>','La idea es atraer con el producto real y convertir la confianza en pedidos pagados. Una comunidad se construye cumpliendo, no solo publicando.')+`
      <div class="channel-grid"><article><span class="channel-icon">◎</span><p class="eyebrow">INSTAGRAM</p><h2>La vitrina</h2><p>Fotos, fichas de producto, preguntas frecuentes y reseñas autorizadas.</p><small>Objetivo: consultas calificadas.</small></article><article><span class="channel-icon">♪</span><p class="eyebrow">TIKTOK</p><h2>El descubrimiento</h2><p>Texturas, empaque, cuidados y demostraciones. Revisar restricciones antes de pautar.</p><small>Objetivo: visitas y consultas atribuibles.</small></article><article><span class="channel-icon">↗</span><p class="eyebrow">WHATSAPP BUSINESS</p><h2>La conversación</h2><p>Confirmar talla, disponibilidad, total y entrega. Registrar el pedido y dar seguimiento.</p><small>Objetivo: pedidos pagados y entregados.</small></article></div>
      <div class="section-title"><div><p class="eyebrow">BANCO DE CONTENIDO</p><h2>Ideas listas para preparar.</h2></div><span class="microcopy">Marca el estado de cada idea.</span></div>
      <div class="filter-row" role="group" aria-label="Filtrar ideas de contenido">${['Todos','Producto','Regalo','Confianza','Ayuda'].map(x=>`<button class="filter" data-content-filter="${x}" aria-pressed="${contentFilter===x}" type="button">${x}</button>`).join('')}</div><div id="content-cards" class="content-grid"></div>
      <div class="section-title"><div><p class="eyebrow">UNA SEMANA POSIBLE · AJUSTABLE</p><h2>Un ritmo que podamos sostener.</h2></div></div>
      <div class="week"><div><b>LUN</b><span>Mostrar un modelo<br><small>Video de detalles</small></span></div><div><b>MIÉ</b><span>Resolver una duda<br><small>Guía de talla o cuidado</small></span></div><div><b>VIE</b><span>Preparar un regalo<br><small>Empaque y personalización</small></span></div><div><b>DOM</b><span>Revisar resultados<br><small>Ventas, costos e incidencias</small></span></div></div>
      <div class="notice"><strong>La publicidad es una prueba con presupuesto limitado.</strong> Medir gasto dividido entre pedidos pagados atribuibles. Los seguidores, vistas y encuestas no equivalen a ventas. Evitar afirmaciones corporales o promesas que el producto no sostenga. <a href="#fuentes">Políticas y fuentes →</a></div>`;
    renderContentCards();
  }
  function renderContentCards(){
    $('#content-cards').innerHTML=C.contentIdeas.filter(i=>contentFilter==='Todos'||i.group===contentFilter).map(i=>`<article class="content-card"><div class="card-top">${badge(i.group)}<span>${i.format}</span></div><h3>${i.title}</h3><p class="content-hook">“${i.hook}”</p><dl><dt>Qué grabar</dt><dd>${i.shots}</dd><dt>Invitación</dt><dd>${i.cta}</dd><dt>Qué observar</dt><dd>${i.metric}</dd></dl><label class="inline-label">Estado<select data-content-status="${i.id}" aria-label="Estado de ${i.title}">${[['idea','Idea'],['grabar','Por grabar'],['publicado','Publicado']].map(([v,l])=>`<option value="${v}" ${state.contentStatus[i.id]===v?'selected':''}>${l}</option>`).join('')}</select></label></article>`).join('');
  }
  const fields=[['price','Precio cobrado por pedido','S/',.1],['cost','Mercadería por pedido','S/',.1],['inbound','Flete de entrada y costos de importación asignados','S/',.1],['pack','Empaque y detalles incluidos','S/',.1],['fee','Comisión de cobro','%',.1],['reserve','Provisión para incidencias','S/',.1],['cac','Publicidad por pedido conseguido','S/',.1],['delivery','Delivery que nosotros asumimos','S/',.1],['volume','Pedidos mensuales','pedidos',1],['fixed','Otros gastos fijos mensuales','S/',1],['labor','Valor mensual de nuestro trabajo','S/',1],['investment','Capital inicial comprometido','S/',1]];
  function renderNumbers(){
    $('#numeros').innerHTML=sectionHead('numeros','05 / LA REALIDAD DETRÁS DEL PRECIO','Que cada pedido<br><em>tenga sentido.</em>','Cambia los supuestos y mira qué queda. El simulador no predice ventas: muestra lo que ocurriría si esos valores se cumplen.')+`
      <div class="notice subtle"><strong>Ejemplo editable, antes de impuestos del negocio.</strong> Incluye costos de importación aplicables en el costo puesto en Lima. El tratamiento de IGV y renta requiere ajuste según el régimen. Delivery de la clienta separado; ingresos y gastos coherentes. No se supone un sueldo ni un presupuesto aprobado.</div>
      <div class="calculator"><form id="calculator-form" class="paper-card" novalidate><div class="card-top"><h2>Tus supuestos</h2><button type="button" class="text-button" id="reset-calc">Restablecer ejemplo</button></div><p class="microcopy">El ejemplo parte de un conjunto por pedido. Si vendes packs, ajusta precio y costos del pedido completo.</p><div class="form-grid">${fields.map(([k,l,u,step])=>`<label>${l}<div class="input-unit"><span>${u}</span><input data-calc="${k}" id="calc-${k}" type="number" min="${k==='price'?'0.1':'0'}" ${k==='fee'?'max="100"':''} step="${step}" value="${state.calc[k]}" inputmode="decimal" required></div></label>`).join('')}</div></form><div class="calc-output"><div id="calc-error" class="notice error" role="alert" hidden></div><div id="calc-result"></div><div class="microcopy calc-disclaimer">La mercadería vendida ya se descuenta. El resultado tampoco refleja por sí solo caja disponible: comprar stock adicional inmoviliza efectivo. El tiempo de arranque, cambios en ventas e impuestos pueden alargar la recuperación.</div></div></div>
      <div class="section-title"><div><p class="eyebrow">EL MODELO EN TRES RITMOS</p><h2>¿Qué cambia si vendemos más?</h2></div></div><div class="table-wrap"><table><caption>Escenarios con los mismos supuestos y costos fijos</caption><thead><tr><th>Pedidos / mes</th><th>Ventas</th><th>Contribución total</th><th>Después de gastos y trabajo*</th></tr></thead><tbody id="scenarios"></tbody></table></div><p class="microcopy">*Antes de impuestos. No contempla nuevos costos fijos que pudieran surgir al crecer.</p>
      <div class="two-grid"><article class="paper-card"><p class="eyebrow">FÓRMULA DEL PEDIDO</p><h3>Precio − todos los costos variables</h3><p>Incluye producto, traslado, empaque, comisión, incidencias, publicidad y delivery asumido. Lo que queda es contribución; todavía debe cubrir costos fijos y trabajo.</p></article><article class="paper-card"><p class="eyebrow">REGLA PARA DECIDIR · PROPUESTA</p><h3>Escalar después de dos ciclos rentables.</h3><p>Revisar reposición, satisfacción y stock sin salida. Vender 60–70 % del lote es una señal para evaluar, no una garantía de rentabilidad ni una orden de comprar más.</p></article></div>`;
    updateNumbers(false);
  }
  function updateNumbers(persist=true){
    const values={};$$('[data-calc]').forEach(el=>values[el.dataset.calc]=el.value);
    const r=M.calculate(values);
    $('#calc-error').hidden=r.valid;
    if(!r.valid){$('#calc-error').textContent=r.error;$('#calc-result').innerHTML='<div class="result-main"><p>Completa los valores para calcular.</p></div>';$('#scenarios').innerHTML='<tr><td colspan="4">Introduce valores válidos.</td></tr>';return;}
    if(persist){state.calc=r.values;save();}
    const positive=r.monthly>0;
    $('#calc-result').innerHTML=`<div class="result-main ${r.contribution<=0?'negative':''}"><span class="eyebrow">QUEDA POR PEDIDO</span><strong>${money(r.contribution)}</strong><span>${r.contributionRate.toFixed(1)} % del precio · contribución</span><p>${r.contribution<=0?'Cada pedido pierde dinero con estos supuestos. Cambia precio, costo o publicidad.':'Este monto ayuda a cubrir gastos fijos, trabajo e impuestos antes de convertirse en utilidad.'}</p><div class="cost-stack" aria-label="Desglose visual del precio">${[[r.values.cost+r.values.inbound,'Producto','#deb8b0'],[r.values.pack+r.commission+r.values.reserve+r.values.delivery,'Operación','#bc8c91'],[r.values.cac,'Publicidad','#a26175'],[Math.max(0,r.contribution),'Contribución','#f2dbbd']].map(([v,l,c])=>`<span style="flex:${Math.max(.1,v)};background:${c}" title="${l}: ${money(v)}"></span>`).join('')}</div><div class="cost-legend"><span>Producto</span><span>Operación</span><span>Publicidad</span><span>Contribución</span></div></div><div class="result-details"><div><span>Resultado mensual*</span><strong class="${positive?'positive':'negative-text'}">${money(r.monthly)}</strong></div><div><span>Pedidos para cubrir gastos y trabajo*</span><strong>${r.breakEven===null?'No alcanzable':r.breakEven}</strong></div><div><span>Recuperación orientativa del capital*</span><strong>${r.payback===null?'Sin recuperación':`${r.payback.toFixed(1)} meses`}</strong></div><div><span>Límite de publicidad para no perder por pedido**</span><strong>${money(r.maxCac)}</strong></div></div><p class="microcopy">*Antes de impuestos. Recuperación calculada con resultado mensual constante, sin crecimiento del inventario ni meses de arranque. **Es un límite matemático, no un objetivo: aún faltan gastos fijos y trabajo.</p>`;
    $('#scenarios').innerHTML=[30,60,100].map(volume=>{const x=M.calculate({...r.values,volume});return `<tr><td>${volume}</td><td>${money(x.revenue)}</td><td>${money(x.contribution*volume)}</td><td class="${x.monthly>0?'positive':'negative-text'}"><strong>${money(x.monthly)}</strong></td></tr>`;}).join('');
  }
  function updateProgress(){const s=stats();$('#nav-percent').textContent=`${s.percent}%`;$('#nav-progress').value=s.percent;$('#nav-count').textContent=`${s.done} de ${s.total} tareas completadas`;if($('#route-count'))$('#route-count').textContent=`${s.done} / ${s.total}`;if($('#route-percent'))$('#route-percent').textContent=`${s.percent}%`;if($('#route-progress'))$('#route-progress').value=s.percent;}
  function renderRoute(){
    const st=stats();
    $('#ruta').innerHTML=sectionHead('ruta','06 / CONSTRUIR SIN PERDER EL RUMBO','Una decisión.<br><em>Un paso a la vez.</em>','La ruta se organiza por condiciones de avance. Los plazos son orientativos y dependen de las muestras, proveedores y tiempo disponible.')+`
      <div class="route-overview"><div><span class="eyebrow">NUESTRO AVANCE</span><strong id="route-percent">${st.percent}%</strong></div><div><span id="route-count">${st.done} / ${st.total}</span><p>tareas completadas</p><progress id="route-progress" max="100" value="${st.percent}" aria-label="Avance de tareas"></progress></div><p>Marcar una tarea registra avance.<br>La demanda se valida con ventas reales.</p></div>
      <div class="filter-row" role="group" aria-label="Filtrar tareas">${[['todos','Todas'],['pendiente','Pendientes'],['curso','En curso'],['hecho','Completadas']].map(([v,l])=>`<button type="button" class="filter" data-task-filter="${v}" aria-pressed="${taskFilter===v}">${l}</button>`).join('')}</div><div id="phase-list"></div>`;
    renderPhases();
  }
  function renderPhases(){
    let totalVisible=0;
    $('#phase-list').innerHTML=C.phases.map(p=>{
      const tasks=p.tasks.filter(t=>taskFilter==='todos'||(state.tasks[t.id]||0)===({pendiente:0,curso:1,hecho:2}[taskFilter]));
      totalVisible+=tasks.length;if(!tasks.length)return '';
      return `<article class="phase"><div class="phase-header"><span class="phase-number">${p.number}</span><div><span class="eyebrow">${p.time}</span><h2>${p.name}</h2></div><span class="phase-count">${p.tasks.filter(t=>state.tasks[t.id]===2).length}/${p.tasks.length}</span></div><div class="task-list">${tasks.map(t=>{const status=state.tasks[t.id]||0;return `<div class="task ${status===2?'done':''}"><div class="task-state" aria-hidden="true">${status===2?'✓':status===1?'◐':'○'}</div><div class="task-copy"><h3>${t.title}</h3><p>${t.detail}</p></div><div class="task-fields"><label>Responsable<select data-task-owner="${t.id}" id="owner-${t.id}">${['Ambos','Socio/a 1','Socio/a 2'].map(o=>`<option value="${o}" ${(state.owners[t.id]||t.owner)===o?'selected':''}>${esc(ownerLabel(o))}</option>`).join('')}</select></label><label>Estado<select data-task-status="${t.id}" id="status-${t.id}">${[['0','Pendiente'],['1','En curso'],['2','Hecho']].map(([v,l])=>`<option value="${v}" ${status===Number(v)?'selected':''}>${l}</option>`).join('')}</select></label></div></div>`;}).join('')}</div><div class="phase-gate"><strong>Antes de avanzar</strong><span>${p.gate}</span></div></article>`;
    }).join('');
    if(!totalVisible)$('#phase-list').innerHTML='<div class="empty-state"><span>✧</span><h3>No hay tareas con este estado.</h3><p>Puedes cambiar el filtro para ver el resto de la ruta.</p></div>';
  }
  function renderAgreements(){
    $('#acuerdos').innerHTML=sectionHead('acuerdos','07 / UN PROYECTO DE DOS','Acordar también<br><em>es avanzar.</em>','Un espacio para poner por escrito qué decide cada uno y cómo cuidamos el negocio. Las notas se guardan en este navegador; exporten una copia para compartirlas.')+`
      <div class="paper-card"><div class="card-top"><h2>Así nos organizamos</h2>${badge('Editable','editable')}</div><div class="form-grid names"><label>Nombre de trabajo de la marca<input data-setting="brand" maxlength="60" value="${esc(state.brand)}"></label><label>Socio/a 1<input data-setting="owner1" maxlength="60" value="${esc(state.owner1)}"></label><label>Socio/a 2<input data-setting="owner2" maxlength="60" value="${esc(state.owner2)}"></label></div><p class="microcopy">El nombre es provisional. Cambiarlo aquí personaliza este navegador; para cambiar el valor inicial del repositorio edita app.js.</p></div>
      <div class="two-grid"><label class="note-field paper-card"><span class="eyebrow">ROLES Y TIEMPO</span><h3>Quién se encarga de qué</h3><span class="field-help">Compras, contenido, atención, pedidos y finanzas. Indicar horas disponibles y un respaldo para cada función.</span><textarea data-note="roles" placeholder="Persona · responsabilidad · horas por semana · quién apoya…">${esc(state.notes.roles||'')}</textarea></label><label class="note-field paper-card"><span class="eyebrow">DINERO Y REINVERSIÓN</span><h3>Qué comprometemos</h3><span class="field-help">Aportes, presupuesto de prueba, límite de pérdida, remuneración, propiedad del inventario y reparto de utilidades.</span><textarea data-note="presupuesto" placeholder="Aportes de cada uno · límite aprobado · qué se reinvierte · qué requiere acuerdo…">${esc(state.notes.presupuesto||'')}</textarea></label></div>
      <div class="paper-card"><div class="card-top"><h2>Nuestra próxima conversación</h2><label class="date-field">Fecha<input type="date" data-note="fecha" value="${esc(state.notes.fecha||'')}"></label></div><ol class="meeting-list"><li>¿Qué aprendimos esta semana del producto y las ventas?</li><li>¿Cuánto gastamos y cuánto quedó realmente?</li><li>¿Qué decisión necesitamos tomar juntos?</li><li>¿Cuál es el siguiente paso y quién lo hará?</li></ol><label class="note-field">Acuerdos y decisiones<textarea data-note="decisiones" placeholder="Fecha · decisión · por qué · responsable · próxima revisión…">${esc(state.notes.decisiones||'')}</textarea></label></div>
      <div class="backup-card"><div><p class="eyebrow">PARA CONTINUAR EN EQUIPO</p><h3>Compartan el avance, no lo pierdan.</h3><p>Exportar crea un archivo JSON con tareas, notas y números. La otra persona puede importarlo en su navegador. La importación reemplaza el avance local; no hay sincronización automática ni combinación de cambios.</p></div><div class="backup-actions"><button type="button" class="button button-primary" data-export>Exportar avance ↗</button><button type="button" class="button button-outline" id="import-button">Importar copia</button><button type="button" class="button button-quiet" id="print-button">Imprimir el cuaderno</button></div></div>
      <div class="notice subtle"><strong>Cuaderno estático, sin cuentas ni servidor.</strong> El contenido base publicado en GitHub Pages puede ser público. Las notas locales no se envían a GitHub. Eviten registrar datos de clientas o información confidencial en un enlace público o en copias compartidas.</div><button type="button" class="danger-link" id="reset-all">Borrar el avance de este navegador</button>`;
  }
  function renderSources(){
    $('#fuentes').innerHTML=sectionHead('fuentes','08 / EVIDENCIA Y SUPUESTOS','Lo que sabemos.<br><em>Lo que falta comprobar.</em>','Fuentes consultadas durante la investigación del 6 y 18 de octubre de 2026. Son una base para decidir, no una garantía de demanda ni una cotización vigente.')+`
      <div class="three-grid evidence-grid"><article class="paper-card"><span class="badge verified">Observado</span><h3>Existe oferta y reventa.</h3><p>Hay tiendas peruanas de lencería y catálogos que revenden productos de SHEIN con stock o por encargo.</p></article><article class="paper-card"><span class="badge proposal">Propuesto</span><h3>Una colección de precio medio.</h3><p>Probar conjuntos alrededor de S/60–80, si costo, calidad y respuesta real lo permiten. La combinación de tallas ya existe.</p></article><article class="paper-card"><span class="badge pending">Pendiente</span><h3>Demanda y margen propios.</h3><p>Faltan muestras aprobadas, cotizaciones, costo de captar clientes, ventas repetibles y resultado después de valorar el trabajo.</p></article></div>
      <div class="sources-list">${C.sources.map((s,i)=>`<article class="source"><div class="source-index">${String(i+1).padStart(2,'0')}</div><div><div class="card-top">${badge(s.kind,'neutral')}<a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(s.name)} en otra pestaña">Consultar fuente ↗</a></div><h2>${s.name}</h2><p>${s.observation}</p><div class="source-limit"><strong>Límite de la evidencia:</strong> ${s.limit}</div></div></article>`).join('')}</div>
      <details class="paper-card"><summary>Cómo interpretar los precios y la popularidad</summary><p>Una tienda abierta o un producto publicado no demuestra ventas. Un sello «más vendido» representa la clasificación del comercio, a menudo sin volumen ni periodo. Un precio promocional puede cambiar y no prueba calidad comparable. Por eso, este cuaderno separa observaciones de recomendaciones.</p></details>`;
  }
  function refreshBrand(){$$('[data-brand]').forEach(el=>el.textContent=state.brand);document.title=`${state.brand} · Nuestro negocio, paso a paso`;}
  function renderAll(){
    $('#navigation').innerHTML=C.sections.map(([id,label,num])=>`<a href="#${id}" data-nav="${id}"><span class="nav-number">${num}</span><span>${label}</span><span class="nav-arrow">↗</span></a>`).join('');
    renderStart();renderBrand();renderCollection();renderExperience();renderSales();renderNumbers();renderRoute();renderAgreements();renderSources();refreshBrand();updateProgress();route(false);
  }
  function route(focus=true){
    const hash=location.hash.slice(1);
    if(hash==='main'){if(focus)$('#main').focus({preventScroll:true});return;}activePage=C.sections.some(s=>s[0]===hash)?hash:'inicio';
    if(activePage==='inicio')renderStart();
    if(activePage==='ruta')renderRoute();
    $$('.page').forEach(p=>p.hidden=p.id!==activePage);
    $$('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===activePage);if(a.dataset.nav===activePage)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('#page-label').textContent=C.sections.find(s=>s[0]===activePage)[1];refreshBrand();
    setMenu(false);
    if(focus){window.scrollTo(0,0);$('#main').focus({preventScroll:true});}
  }
  function exportState(){
    save();const payload=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);
    const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`avance-entre-seda-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Copia exportada. Compártela para continuar en otro navegador.');
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.id==='menu-toggle')setMenu(!$('#sidebar').classList.contains('open'));
    if(b.id==='menu-close'||b.id==='nav-backdrop')setMenu(false,true);
    if(b.id==='export-button'||b.hasAttribute('data-export'))exportState();
    if(b.dataset.giftMode){state.gift.mode=b.dataset.giftMode;updateGift();save();}
    if(b.id==='apply-pack'){state.calc.pack=giftCost();save();renderNumbers();location.hash='numeros';toast('Costo de presentación aplicado. Revisa el precio del pedido si agregas complementos.');}
    if(b.dataset.contentFilter){contentFilter=b.dataset.contentFilter;$$('[data-content-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.contentFilter===contentFilter)));renderContentCards();}
    if(b.dataset.taskFilter){taskFilter=b.dataset.taskFilter;$$('[data-task-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.taskFilter===taskFilter)));renderPhases();}
    if(b.id==='reset-calc'){state.calc={...M.DEFAULTS};save();renderNumbers();toast('Ejemplo restablecido. Las notas y tareas se mantienen.');}
    if(b.id==='import-button')$('#import-file').click();
    if(b.id==='print-button')window.print();
    if(b.id==='reset-all'&&window.confirm('¿Borrar las notas, tareas y supuestos de este navegador? Exporta una copia antes si quieres conservarlos.')){state=defaultState();taskFilter='todos';contentFilter='Todos';save();renderAll();toast('Avance local restablecido.');}
  });
  document.addEventListener('input',e=>{
    const el=e.target;
    if(el.hasAttribute('data-calc'))updateNumbers();
    if(el.hasAttribute('data-note')){state.notes[el.dataset.note]=el.value.slice(0,6000);save();}
    if(el.hasAttribute('data-setting')){state[el.dataset.setting]=el.value.trim().slice(0,60)||({brand:'Entre Seda',owner1:'Socio/a 1',owner2:'Socio/a 2'}[el.dataset.setting]);save();refreshBrand();}
  });
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.product){state.selected=el.checked?[...new Set([...state.selected,el.dataset.product])]:state.selected.filter(x=>x!==el.dataset.product);save();updateSelection();}
    if(el.dataset.extra){state.gift.extras=el.checked?[...new Set([...state.gift.extras,el.dataset.extra])]:state.gift.extras.filter(x=>x!==el.dataset.extra);save();updateGift();}
    if(el.dataset.contentStatus){state.contentStatus[el.dataset.contentStatus]=el.value;save();toast('Estado del contenido guardado.');}
    if(el.dataset.taskOwner){state.owners[el.dataset.taskOwner]=el.value;save();}
    if(el.dataset.taskStatus){state.tasks[el.dataset.taskStatus]=Number(el.value);save();const id=el.id;renderPhases();updateProgress();const next=document.getElementById(id);if(next)next.focus({preventScroll:true});}
  });
  $('#import-file').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>300000)throw new Error('El archivo supera el tamaño permitido para un avance.');const next=cleanState(JSON.parse(await file.text()));if(window.confirm('Importar reemplazará el avance local. ¿Continuar?')){state=next;save();renderAll();toast('Avance importado correctamente.');}}catch(err){toast(`No se pudo importar: ${err.message}`);}finally{e.target.value='';}
  });
  document.addEventListener('keydown',e=>{
    if(!$('#sidebar').classList.contains('open'))return;
    if(e.key==='Escape')setMenu(false,true);
    if(e.key==='Tab'){
      const items=[...$('#sidebar').querySelectorAll('a[href],button')];
      const first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  $('#sidebar').addEventListener('click',e=>{if(e.target.closest('a')&&mobileNavigation.matches)setMenu(false,true);});
  document.addEventListener('submit',e=>{if(e.target.id==='calculator-form')e.preventDefault();});
  window.addEventListener('hashchange',()=>route());
  window.addEventListener('storage',e=>{if(e.key===KEY)toast('El avance cambió en otra pestaña. Recarga antes de seguir editando.');});
  renderAll();if(storageWarning)toast('No se pudo recuperar el avance local. Exporta una copia para conservar los cambios de esta sesión.');
})();
