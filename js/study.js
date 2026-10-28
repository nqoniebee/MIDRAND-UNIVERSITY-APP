/* Module exploration and a deliberately local, non-enrolment study plan. */
'use strict';
(() => {
 const modules = DepartmentData.modules;
 const { element, notify, download } = DepartmentUI;
 const key = 'midrand.department.study-plan.v1';
 let saved = new Set();
 let storageWorks = true;
 try {
   const parsed=JSON.parse(localStorage.getItem(key) || '[]');
   if (Array.isArray(parsed)) saved = new Set(parsed.filter(code => modules.some(module => module.code === code)));
   localStorage.setItem(key,JSON.stringify([...saved]));
 } catch (error) { storageWorks=false; }
 if (!storageWorks) document.querySelector('#storage-note').textContent='Browser storage is unavailable. Your plan works for this page visit; download it to keep a copy.';
 const search = document.querySelector('#module-search');
 const year = document.querySelector('#year-filter');
 const area = document.querySelector('#area-filter');
 const grid = document.querySelector('#module-grid');
 const dialog = document.querySelector('#module-dialog');
 let activeModule = null;
 let dialogOpener = null;
 function persist() {
   try { localStorage.setItem(key, JSON.stringify([...saved])); }
   catch(error) { storageWorks=false; document.querySelector('#storage-note').textContent='Storage is unavailable. Download your plan before leaving this page.'; }
 }
 function saveLabel(module) { return saved.has(module.code) ? 'Remove from plan −' : 'Add to plan +'; }
 function toggleSaved(module) {
   if (saved.has(module.code)) { saved.delete(module.code); notify(`${module.code} removed from your study plan.`); }
   else { saved.add(module.code); notify(`${module.code} added to your study plan.`); }
   persist(); renderModules(); renderPlan();
   if (activeModule) setDialogSave();
 }
 function setDialogSave() {
   const button=document.querySelector('#dialog-save');
   button.textContent=saveLabel(activeModule);
   button.setAttribute('aria-pressed',String(saved.has(activeModule.code)));
 }
 function openModule(module, opener) {
   activeModule=module; dialogOpener=opener;
   document.querySelector('#dialog-code').textContent=`${module.code} / YEAR ${module.year} / ${module.credits} SAMPLE CREDITS`;
   document.querySelector('#dialog-title').textContent=module.title;
   document.querySelector('#dialog-description').textContent=module.description;
   const list=document.querySelector('#dialog-outcomes'); list.replaceChildren();
   module.outcomes.forEach(item=>list.append(element('li','',item)));
   document.querySelector('#dialog-assessment').textContent='Sample assessment: practical activities, a project and an end-of-module assessment. This illustrative outline is not an official syllabus.';
   setDialogSave(); dialog.showModal();
 }
 function renderModules() {
   const query=search.value.trim().toLowerCase();
   const filtered=modules.filter(module => (year.value==='all'||module.year===Number(year.value)) && (area.value==='all'||module.area===area.value) && `${module.title} ${module.code} ${module.description} ${module.outcomes.join(' ')}`.toLowerCase().includes(query));
   const focusCode=document.activeElement?.dataset?.saveCode;
   grid.replaceChildren();
   document.querySelector('#module-count').textContent=`${filtered.length} of ${modules.length} modules shown`;
   filtered.forEach(module => {
     const card=element('article','module-card');
     const meta=element('div','module-meta'); meta.append(element('span','module-code',module.code),element('span','tag',`Year ${module.year}`));
     card.append(meta,element('h3','',module.title),element('p','',module.description),element('p','module-area',`${module.area} · ${module.credits} sample credits`));
     const buttons=element('div','module-actions');
     const detail=element('button','text-link','View module ↗'); detail.type='button'; detail.dataset.detailCode=module.code; detail.setAttribute('aria-label',`View ${module.code} module details`);
     detail.addEventListener('click',()=>openModule(module, detail));
     const save=element('button','save-module',saved.has(module.code)?'−':'+'); save.type='button'; save.dataset.saveCode=module.code;
     save.setAttribute('aria-pressed',String(saved.has(module.code))); save.setAttribute('aria-label',`${saved.has(module.code)?'Remove':'Save'} ${module.code} ${module.title}${saved.has(module.code)?' from':' to'} study plan`);
     save.addEventListener('click',()=>toggleSaved(module));
     buttons.append(detail,save);card.append(buttons);grid.append(card);
   });
   if (!filtered.length) grid.append(element('p','empty-state','No modules match these filters. Try another search or reset the filters.'));
   if (focusCode) grid.querySelector(`[data-save-code="${focusCode}"]`)?.focus({preventScroll:true});
 }
 function renderPlan() {
   const plan=document.querySelector('#plan-items'); plan.replaceChildren();
   if (!saved.size) plan.append(element('p','plan-empty','Your plan is a blank page. Add a module that sparks your interest.'));
   for (const code of saved) {
     const module=modules.find(item=>item.code===code), row=element('div','plan-item');
     const text=element('div',''); text.append(element('strong','',code),element('span','',module.title));
     const remove=element('button','plan-remove','×'); remove.type='button';remove.setAttribute('aria-label',`Remove ${code} from study plan`);
     remove.addEventListener('click',()=>{toggleSaved(module);document.querySelector('#plan-heading').tabIndex=-1;document.querySelector('#plan-heading').focus({preventScroll:true});});
     row.append(text,remove);plan.append(row);
   }
   document.querySelector('#download-plan').disabled=!saved.size;
   document.querySelector('#clear-plan').disabled=!saved.size;
 }
 [search,year,area].forEach(input=>input.addEventListener(input===search?'input':'change',renderModules));
 document.querySelector('#module-filters').addEventListener('submit',event=>event.preventDefault());
 document.querySelector('#reset-filters').addEventListener('click',()=>{search.value='';year.value='all';area.value='all';renderModules();search.focus();});
 document.querySelector('#clear-plan').addEventListener('click',()=>{saved.clear();persist();renderModules();renderPlan();notify('Your saved study plan has been cleared.');document.querySelector('#plan-heading').tabIndex=-1;document.querySelector('#plan-heading').focus();});
 document.querySelector('#download-plan').addEventListener('click',()=>{
   const lines=['MIDRAND UNIVERSITY','Data Science and Informatics','My sample study plan','',...modules.filter(m=>saved.has(m.code)).map(m=>`${m.code} | ${m.title} | Year ${m.year} | ${m.credits} sample credits`),'','Personal shortlist only. Not an enrolment record. All programme information is illustrative.'];
   download('MIDRAND_my_study_plan.txt',lines.join('\n'));notify('Your study plan has been downloaded.');
 });
 document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog) {const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{
   if(dialogOpener?.isConnected) dialogOpener.focus();
   else (grid.querySelector(`[data-detail-code="${activeModule.code}"]`)||grid.querySelector('button'))?.focus({preventScroll:true});
 });
 document.querySelector('#dialog-save').addEventListener('click',()=>toggleSaved(activeModule));
 renderModules();renderPlan();
})();
