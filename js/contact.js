/* No request is sent: validation produces a preview and optional text download. */
'use strict';
(() => {
 const form=document.querySelector('#enquiry-form');
 const fields={name:form.elements.name,email:form.elements.email,topic:form.elements.topic,message:form.elements.message,consent:form.elements.consent};
 const preview=document.querySelector('#enquiry-preview');
 const summary=document.querySelector('#form-error-summary');
 let ready=null;
 const topicFromURL=new URLSearchParams(location.search).get('topic');
 if ([...fields.topic.options].some(option=>option.value===topicFromURL)) fields.topic.value=topicFromURL;
 function updateCount(){document.querySelector('#character-count').textContent=`${fields.message.value.length} / 1,200`;}
 fields.message.addEventListener('input',updateCount);
 function errorFor(key) {
   const field=fields[key],value=field.value.trim();
   if (key==='name' && value.length<2) return 'Enter your name using at least 2 characters.';
   if (key==='email' && (!value||!field.validity.valid||!/^\S+@\S+\.\S+$/.test(value))) return 'Enter a valid email address, such as name@example.com.';
   if (key==='topic' && !value) return 'Choose an enquiry topic.';
   if (key==='message' && (value.length<20||value.length>1200)) return 'Enter a message between 20 and 1,200 characters.';
   if (key==='consent' && !field.checked) return 'Please confirm that you understand this is a demonstration.';
   return '';
 }
 function showFieldError(key){const error=errorFor(key);document.querySelector(`#${key}-error`).textContent=error;fields[key].setAttribute('aria-invalid',String(!!error));return error;}
 Object.entries(fields).forEach(([key,field])=>{
   field.addEventListener('blur',()=>showFieldError(key));
   field.addEventListener(key==='topic'||key==='consent'?'change':'input',()=>{
     if(field.getAttribute('aria-invalid')==='true')showFieldError(key);
     if(ready){ready=null;preview.hidden=true;}
   });
 });
 form.addEventListener('submit',event=>{
   event.preventDefault();
   const invalid=Object.keys(fields).filter(key=>showFieldError(key));
   summary.hidden=!invalid.length;
   if(invalid.length){preview.hidden=true;summary.textContent=`Please correct ${invalid.length} ${invalid.length===1?'field':'fields'} before previewing your enquiry.`;fields[invalid[0]].focus();return;}
   ready={name:fields.name.value.trim(),email:fields.email.value.trim(),topic:fields.topic.value,message:fields.message.value.trim()};
   // textContent treats user input as text instead of executable HTML.
   document.querySelector('#preview-name').textContent=`Name: ${ready.name}`;
   document.querySelector('#preview-email').textContent=`Email: ${ready.email}`;
   document.querySelector('#preview-topic').textContent=`Topic: ${ready.topic}`;
   document.querySelector('#preview-message').textContent=ready.message;
   preview.hidden=false;preview.focus();
 });
 document.querySelector('#download-enquiry').addEventListener('click',()=>{
   if(!ready)return;
   DepartmentUI.download('MIDRAND_enquiry.txt',`MIDRAND UNIVERSITY - Department enquiry\n\nName: ${ready.name}\nEmail: ${ready.email}\nTopic: ${ready.topic}\n\n${ready.message}\n\nLocal academic demonstration. This message has not been sent.\n`);
   DepartmentUI.notify('Your enquiry has been downloaded. No message was sent.');
 });
 document.querySelector('#clear-enquiry').addEventListener('click',()=>{form.reset();ready=null;preview.hidden=true;summary.hidden=true;Object.keys(fields).forEach(key=>{fields[key].removeAttribute('aria-invalid');document.querySelector(`#${key}-error`).textContent='';});updateCount();fields.name.focus();DepartmentUI.notify('Form and enquiry preview cleared.');});
})();
