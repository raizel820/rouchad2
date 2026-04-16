/**
 * Global toast notification system.
 * 
 * ATTACHED TO WINDOW to avoid Turbopack/webpack module deduplication issues.
 * All components should call `window.__rareBeautyToast(msg, type)`.
 */
export type ToastType = 'success' | 'error' | 'info';

function _createToast(message: string, type: ToastType = 'success') {
  let container = document.getElementById('__toast_container__') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = '__toast_container__';
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;max-width:24rem;width:100%;pointer-events:none;';
    document.body.appendChild(container);
  }

  const colors: Record<string, string> = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const icons: Record<string, string> = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const el = document.createElement('div');
  el.style.cssText =
    'pointer-events:auto;background:white;border-radius:0.75rem;' +
    'box-shadow:0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1);' +
    'border:1px solid #f3f4f6;border-left:4px solid ' + (colors[type] || colors.success) + ';' +
    'padding:0.75rem 1rem;display:flex;align-items:flex-start;gap:0.75rem;' +
    'transform:translateX(120%);opacity:0;' +
    'transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.3s ease;' +
    'max-width:100%;';
  el.innerHTML =
    '<div style="margin-top:2px">' + (icons[type] || icons.success) + '</div>' +
    '<p style="flex:1;font-size:0.875rem;color:#374151;line-height:1.4;margin:0">' + message + '</p>' +
    '<button style="margin-top:2px;color:#9ca3af;background:none;border:none;cursor:pointer;padding:0;font-size:1rem;line-height:1" aria-label="Close">&times;</button>';

  const closeBtn = el.querySelector('button');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      el.style.transform = 'translateX(120%)';
      el.style.opacity = '0';
      setTimeout(() => { el.remove(); _cleanup(); }, 300);
    });
  }

  container.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  });

  setTimeout(() => {
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => { el.remove(); _cleanup(); }, 300);
  }, 4000);
}

function _cleanup() {
  const container = document.getElementById('__toast_container__');
  if (container && container.children.length === 0) {
    container.remove();
  }
}

// Expose globally to avoid module deduplication issues with Turbopack
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).__rareBeautyToast = _createToast;
}

/** Convenience alias - calls through global to guarantee same instance */
export function toast(message: string, type: ToastType = 'success') {
  if (typeof window !== 'undefined' && (window as Record<string, unknown>).__rareBeautyToast) {
    return (window as Record<string, unknown>).__rareBeautyToast(message, type);
  }
  // SSR fallback
  _createToast(message, type);
}

export function ToastContainer() {
  return null;
}
