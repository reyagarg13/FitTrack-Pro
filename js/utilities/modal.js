// modal.js - simple custom modal manager
let modalRoot;
let overlay;
let lastFocusedEl = null;

export async function initModal(){
  modalRoot = document.getElementById('modal-root');
  const res = await fetch('./components/modal.html');
  const html = await res.text();
  modalRoot.innerHTML = html;
  overlay = modalRoot.querySelector('.ft-modal-overlay');
  attachClose();
  // global key handlers for modal (Escape to close, Tab trapping)
  document.addEventListener('keydown', (e)=>{
    if(!overlay) return;
    if(overlay.classList.contains('hidden')) return;
    if(e.key === 'Escape'){
      closeModal();
    }
    if(e.key === 'Tab'){
      const focusable = Array.from(overlay.querySelectorAll('.ft-modal button, .ft-modal [href], .ft-modal input, .ft-modal select, .ft-modal textarea')).filter(el=> !el.disabled && el.offsetParent !== null);
      if(focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length-1];
      if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      }
    }
  });
}

function attachClose(){
  modalRoot.addEventListener('click',(e)=>{
    if(e.target.classList.contains('ft-modal-overlay') || e.target.classList.contains('ft-modal-close')){
      closeModal();
    }
  });
}

export function openModal({title='Modal', body='', actions=[]} = {}){
  if(!overlay) return console.warn('modal not init');
  // save currently focused element to restore later
  lastFocusedEl = document.activeElement;
  overlay.classList.remove('hidden');
  overlay.querySelector('.ft-modal-title').textContent = title;
  const bodyNode = overlay.querySelector('.ft-modal-body');
  if(typeof body === 'string') bodyNode.innerHTML = body; else bodyNode.innerHTML = ''; if(body && typeof body !== 'string') bodyNode.appendChild(body);

  const actionsWrap = overlay.querySelector('.ft-modal-actions');
  actionsWrap.innerHTML = '';
  if(actions.length===0){
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Close';
    btn.addEventListener('click', closeModal);
    actionsWrap.appendChild(btn);
  } else {
    actions.forEach(a=>{
      const btn = document.createElement('button');
      btn.className = a.className || 'btn-secondary';
      btn.textContent = a.label || 'Action';
      btn.addEventListener('click', ()=>{
        if(a.onClick) a.onClick();
      });
      actionsWrap.appendChild(btn);
    });
  }
  // focus the first focusable element inside modal (prefer input or button)
  setTimeout(()=>{
    const focusable = overlay.querySelector('.ft-modal [tabindex], .ft-modal input, .ft-modal button, .ft-modal select, .ft-modal textarea, .ft-modal a');
    if(focusable) focusable.focus(); else overlay.querySelector('.ft-modal-close')?.focus();
  },60);
}

export function closeModal(){
  if(!overlay) return;
  overlay.classList.add('hidden');
  // restore previous focus
  try{ if(lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus(); }catch(e){}
}

// trap focus inside modal while open (basic)
// (focus trap handled in initModal via document keydown)
