/* Narasi Garage: screenshot paste, upload and preview.
   This file contains no Discord webhook credentials. */
(() => {
  'use strict';
  const allowed = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
  const maxBytes = 8 * 1024 * 1024;
  const selected = new WeakMap();
  const forms = [...document.querySelectorAll('form[data-action]')];
  let activeForm = forms[0] || null;
  const style = document.createElement('style');
  style.textContent = [
    '.ng-capture{border:1px dashed #4f7682;border-radius:12px;padding:15px;margin-bottom:16px;background:#0a161f;outline:none}',
    '.ng-capture:focus,.ng-capture:focus-within{border-color:#00e7f0;box-shadow:0 0 0 2px #00e7f022}',
    '.ng-capture small{display:block;color:#a9c2ce;margin:7px 0 12px;line-height:1.6}',
    '.ng-capture input{display:block;width:100%;color:#d4e9ee;font-size:12px}',
    '.ng-capture img{display:block;width:100%;max-height:270px;object-fit:contain;margin:12px 0;border-radius:8px}',
    '.ng-capture img[hidden],.ng-capture button[hidden]{display:none}',
    '.ng-capture button{border:1px solid #9f4358;background:#28171e;color:#ffd2dc;padding:8px 12px;border-radius:8px;cursor:pointer}',
    '.ng-capture .filename{color:#c6e8ed;font-size:11px;overflow-wrap:anywhere}'
  ].join('\n');
  document.head.appendChild(style);

  function status(form, msg, error) {
    const element = form.querySelector('.feedback');
    if (element) {
      element.className = 'feedback ' + (error ? 'error' : 'success');
      element.textContent = msg;
    }
  }
  function clear(form) {
    const previous = selected.get(form);
    if (previous) URL.revokeObjectURL(previous.url);
    selected.delete(form);
    const zone = form.querySelector('.ng-capture');
    if (!zone) return;
    zone.querySelector('input').value = '';
    const img = zone.querySelector('img');
    img.hidden = true;
    img.removeAttribute('src');
    zone.querySelector('.filename').textContent = '';
    zone.querySelector('button').hidden = true;
  }
  function set(form, file) {
    if (!file) return;
    if (!allowed.has(file.type)) {
      status(form, 'Screenshot must be PNG, JPG, WEBP or GIF.', true);
      return;
    }
    if (!file.size || file.size > maxBytes) {
      status(form, 'Screenshot cannot exceed 8 MB.', true);
      return;
    }
    clear(form);
    const url = URL.createObjectURL(file);
    selected.set(form, {file, url});
    const zone = form.querySelector('.ng-capture');
    const image = zone.querySelector('img');
    image.src = url;
    image.hidden = false;
    zone.querySelector('.filename').textContent =
      (file.name || 'Pasted screenshot') + ' — ' + (file.size / 1048576).toFixed(2) + ' MB';
    zone.querySelector('button').hidden = false;
    status(form, 'Screenshot ready. Submit to include it with your Discord log.', false);
  }
  for (const form of forms) {
    const zone = document.createElement('div');
    zone.className = 'ng-capture';
    zone.tabIndex = 0;
    zone.innerHTML =
      '<label>📷 Screenshot (Optional)</label>' +
      '<small>Click here and press <strong>Ctrl + V</strong> to paste a screenshot, or choose a file.</small>' +
      '<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose screenshot">' +
      '<img hidden alt="Screenshot preview">' +
      '<div class="filename" aria-live="polite"></div>' +
      '<button type="button" hidden>Remove Screenshot</button>';
    const notes = form.querySelector('textarea[name="note"]');
    const anchor = notes && notes.closest('.field');
    if (!anchor) continue;
    anchor.insertAdjacentElement('afterend', zone);
    const picker = zone.querySelector('input');
    picker.addEventListener('change', () => set(form, picker.files && picker.files[0]));
    zone.querySelector('button').addEventListener('click', () => clear(form));
    zone.addEventListener('click', event => {
      activeForm = form;
      if (event.target === zone || event.target.tagName === 'SMALL') zone.focus();
    });
    zone.addEventListener('dragover', event => event.preventDefault());
    zone.addEventListener('drop', event => {
      event.preventDefault();
      activeForm = form;
      set(form, event.dataTransfer && event.dataTransfer.files[0]);
    });
    form.addEventListener('pointerdown', () => { activeForm = form; });
    form.addEventListener('focusin', () => { activeForm = form; });
  }
  document.addEventListener('paste', event => {
    const item = [...(event.clipboardData?.items || [])].find(
      part => part.kind === 'file' && part.type.startsWith('image/')
    );
    if (!item) return;
    const form = event.target.closest?.('form[data-action]') || activeForm;
    if (!form) return;
    event.preventDefault();
    set(form, item.getAsFile());
  });
  window.NarasiScreenshot = Object.freeze({
    getFile: form => selected.get(form)?.file || null,
    clear
  });
})();