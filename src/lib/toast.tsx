'use client';

export type ToastType = 'success' | 'error' | 'info';

interface ToastEl {
  id: number;
  el: HTMLDivElement;
  timer: ReturnType<typeof setTimeout>;
}

let _toastId = 0;
const _activeToasts: ToastEl[] = [];

function getContainer(): HTMLDivElement {
  let container = document.getElementById('__toast_container__') as HTMLDivElement;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }
  return container;
}

function getIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    case 'error':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    case 'info':
      return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }
}

function getBorderColor(type: ToastType): string {
  switch (type) {
    case 'success': return '#10b981';
    case 'error': return '#ef4444';
    case 'info': return '#3b82f6';
  }
}

export function toast(message: string, type: ToastType = 'success') {
  const container = getContainer();
  const id = ++_toastId;

  const el = document.createElement('div');
  el.style.cssText = 'pointer-events:auto;background:white;border-radius:0.75rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);border:1px solid #f3f4f6;border-left:4px solid ' + getBorderColor(type) + ';padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;transform:translateX(120%);opacity:0;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;max-width:100%;';

  el.innerHTML = '<div style="margin-top:2px">' + getIcon(type) + '</div><p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p><button style="margin-top:2px;color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;flex-shrink:0" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';

  const closeBtn = el.querySelector('button');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() { removeToast(id); });
  }

  container.appendChild(el);

  requestAnimationFrame(function() {
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  });

  const timer = setTimeout(function() { removeToast(id); }, 4000);
  _activeToasts.push({ id: id, el: el, timer: timer });

  while (_activeToasts.length > 5) {
    removeToast(_activeToasts[0].id);
  }
}

function removeToast(id: number) {
  const idx = _activeToasts.findIndex(function(t) { return t.id === id; });
  if (idx === -1) return;

  const toastItem = _activeToasts[idx];
  clearTimeout(toastItem.timer);
  _activeToasts.splice(idx, 1);

  toastItem.el.style.transform = 'translateX(120%)';
  toastItem.el.style.opacity = '0';

  setTimeout(function() {
    toastItem.el.remove();
    const container = document.getElementById('__toast_container__');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

export function ToastContainer() {
  return null;
}
