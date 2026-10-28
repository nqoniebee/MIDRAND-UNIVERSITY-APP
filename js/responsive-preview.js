'use strict';
document.querySelector('#preview-page').addEventListener('change',event=>{document.querySelector('#preview-frame').src=event.target.value;});
document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#frame-wrap').style.width=button.dataset.width+'px';}));
