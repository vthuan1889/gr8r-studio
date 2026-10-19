/* =====================================================================
   UI KIT — domain-agnostic render primitives.

   Every function takes plain data and returns an HTML string. Nothing here
   reads the store or the seed, so the same kit drives the project tracker,
   analytics, CRM, AI studio, commerce and settings screens. Markup is backed
   by src/styles/components.css, panels.css, overlays.css, states.css and
   views/table.css — no new visual language.
   ===================================================================== */
import { clamp, esc } from '../core/utils.js';
import { ic } from '../core/icons.js';

const BTN_VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  'danger-ghost': 'btn-danger-ghost',
};
const ALERT_ICON = { info: 'info', ok: 'circle-check', warn: 'triangle-alert', danger: 'circle-alert' };

const dataAttrs = (action, value) => `${action ? ` data-a="${action}"` : ''}${value !== undefined && value !== '' ? ` data-v="${esc(value)}"` : ''}`;

/* ---------- buttons ---------- */
export function uiButton({
  label = '',
  variant = 'secondary',
  size = 'md',
  icon = '',
  iconRight = '',
  action = '',
  value = '',
  id = '',
  cls = '',
  loading = false,
  disabled = false,
  block = false,
  tip = '',
  attrs = '',
} = {}) {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.secondary;
  const s = size === 'sm' ? ' btn-sm' : size === 'lg' ? ' btn-lg' : '';
  return `<button class="btn ${v}${s}${block ? ' btn-block' : ''}${loading ? ' is-loading' : ''}${cls ? ' ' + cls : ''}"${id ? ` id="${esc(id)}"` : ''}${dataAttrs(action, value)}${disabled ? ' disabled' : ''}${loading ? ' aria-busy="true"' : ''}${tip ? ` data-tip="${esc(tip)}"` : ''} ${attrs}>${icon ? ic(icon, 14) : ''}${label ? `<span>${esc(label)}</span>` : ''}${iconRight ? ic(iconRight, 13) : ''}</button>`;
}

export function uiIconButton({
  icon,
  label = '',
  size = 'md',
  action = '',
  value = '',
  id = '',
  active = false,
  disabled = false,
  tip = '',
  tipPos = '',
  cls = '',
  attrs = '',
} = {}) {
  const s = size === 'sm' ? ' ibtn-sm' : size === 'xs' ? ' ibtn-xs' : '';
  return `<button class="ibtn${s}${active ? ' on' : ''}${cls ? ' ' + cls : ''}"${id ? ` id="${esc(id)}"` : ''}${dataAttrs(action, value)}${disabled ? ' disabled' : ''}${active ? ' aria-pressed="true"' : ''}${tip ? ` data-tip="${esc(tip)}"${tipPos ? ` data-tip-pos="${tipPos}"` : ''}` : ''}${label ? ` aria-label="${esc(label)}"` : ''} ${attrs}>${ic(icon, size === 'xs' ? 13 : 15)}</button>`;
}

/* ---------- form controls ---------- */
export function uiField({ label, id = '', hint = '', error = '', controlHtml = '', cls = '' } = {}) {
  return `<div class="field${cls ? ' ' + cls : ''}">${label ? `<label class="label"${id ? ` for="${esc(id)}"` : ''}>${esc(label)}</label>` : ''}${controlHtml}${
    error ? `<span class="err">${ic('circle-alert', 12)}${esc(error)}</span>` : hint ? `<span class="hint">${esc(hint)}</span>` : ''
  }</div>`;
}

export function uiInput({
  id = '',
  type = 'text',
  value = '',
  placeholder = '',
  size = 'md',
  error = false,
  disabled = false,
  icon = '',
  kbd = '',
  onInput = '',
  field = '',
  cls = '',
  attrs = '',
} = {}) {
  const input = `<input class="input${size === 'lg' ? ' input-lg' : ''}${error ? ' is-error' : ''}${cls ? ' ' + cls : ''}"${id ? ` id="${esc(id)}"` : ''} type="${type}"${
    value !== '' ? ` value="${esc(value)}"` : ''
  }${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}${disabled ? ' disabled' : ''}${onInput ? ` data-in="${onInput}"` : ''}${field ? ` data-field="${esc(field)}"` : ''}${
    error ? ' aria-invalid="true"' : ''
  } ${attrs}>`;
  return icon || kbd ? `<div class="inwrap">${icon ? ic(icon, 13) : ''}${input}${kbd ? `<span class="kbd">${esc(kbd)}</span>` : ''}</div>` : input;
}

/* Renders the native select that src/ui/select.js enhances in place. */
export function uiSelect({ id = '', options = [], value = '', onInput = '', key = '', label = '', style = '', cls = '' } = {}) {
  const norm = o =>
    Array.isArray(o) ? { v: o[0], l: o[1] } : o && typeof o === 'object' ? { v: o.value ?? o.v ?? o.id, l: o.label ?? o.name ?? o.value } : { v: o, l: o };
  return `<select class="select${cls ? ' ' + cls : ''}"${id ? ` id="${esc(id)}"` : ''}${onInput ? ` data-in="${onInput}"` : ''}${key ? ` data-key="${esc(key)}"` : ''}${
    label ? ` aria-label="${esc(label)}"` : ''
  }${style ? ` style="${style}"` : ''}>${options
    .map(o => {
      const x = norm(o);
      return `<option value="${esc(x.v)}"${String(x.v) === String(value) ? ' selected' : ''}>${esc(x.l)}</option>`;
    })
    .join('')}</select>`;
}

const normItem = i => (Array.isArray(i) ? { v: i[0], l: i[1], icon: i[2] || '', ct: i[3] } : i);

export function uiSegmented({ items = [], active = '', action = 'set', key = '', label = '', cls = '' } = {}) {
  return `<div class="seg${cls ? ' ' + cls : ''}" role="tablist"${label ? ` aria-label="${esc(label)}"` : ''}>${items
    .map(i => {
      const x = normItem(i);
      return `<button role="tab" aria-selected="${x.v === active}" class="${x.v === active ? 'on' : ''}" data-a="${action}"${key ? ` data-k="${esc(key)}"` : ''} data-v="${esc(
        x.v,
      )}">${x.icon ? ic(x.icon, 13) : ''}${x.l ? `<span>${esc(x.l)}</span>` : ''}</button>`;
    })
    .join('')}</div>`;
}

export function uiTabs({ items = [], active = '', action = 'set', key = '', reverse = false, cls = '' } = {}) {
  return `<div class="tabs${cls ? ' ' + cls : ''}" role="tablist"${reverse ? ' data-rev="1"' : ''}>${items
    .map(i => {
      const x = normItem(i);
      return `<button role="tab" aria-selected="${x.v === active}" class="tab ${x.v === active ? 'on' : ''}" data-a="${action}"${key ? ` data-k="${esc(key)}"` : ''} data-v="${esc(
        x.v,
      )}">${x.l}${x.ct ? `<span class="cnt">${esc(x.ct)}</span>` : ''}</button>`;
    })
    .join('')}</div>`;
}

/* ---------- status ---------- */
export function uiBadge({ label, tone = '', dot = false, icon = '', action = '', value = '', attrs = '' } = {}) {
  const inner = `${icon ? ic(icon, 11) : ''}${dot ? '<span class="dot"></span>' : ''}${esc(label ?? '')}`;
  const cls = `badge${tone ? ' ' + tone : ''}`;
  return action
    ? `<button class="${cls}" style="cursor:pointer"${dataAttrs(action, value)} ${attrs}>${inner}</button>`
    : `<span class="${cls}" ${attrs}>${inner}</span>`;
}

export function uiStatusPill({ label, color = 'var(--gray)', bordered = false } = {}) {
  return `<span class="pstatus${bordered ? ' bordered' : ''}" style="--c:${color}"><i></i>${esc(label)}</span>`;
}

/* ---------- identity ---------- */
export function uiAvatar({ name = '', color = 'var(--gray)', size = '', tip = true } = {}) {
  const n = String(name).trim();
  if (!n) return `<span class="av empty ${size}"${tip ? ' data-tip="Unassigned"' : ''}>${ic('user', 11)}</span>`;
  const ini = n
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return `<span class="av ${size}" style="--c:${color}"${tip ? ` data-tip="${esc(n)}"` : ''} aria-label="${esc(n)}">${esc(ini)}</span>`;
}

export function uiAvatarStack({ items = [], max = 4, size = 'sm' } = {}) {
  const list = items.slice(0, max);
  const over = items.length - max;
  return `<span class="avs">${list.map(i => uiAvatar({ name: i.name ?? i, color: i.color ?? 'var(--gray)', size, tip: true })).join('')}${
    over > 0 ? `<span class="av ${size} more" style="--c:var(--gray)">+${over}</span>` : ''
  }</span>`;
}

/* ---------- data display ---------- */
export function uiProgressBar({ value = 0, tone = '', cls = '', width = '' } = {}) {
  const p = clamp(Math.round(+value || 0), 0, 100);
  return `<span class="prog ${tone} ${cls}"${width ? ` style="width:${width}"` : ''} role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="--p:${p / 100}"></i></span>`;
}

export function uiStatStrip({ items = [] } = {}) {
  return `<div class="stats">${items
    .map(s => {
      const act = s.action ? ` data-a="${s.action}"${s.value ? ` data-v="${esc(s.value)}"` : ''}` : '';
      const tag = s.action ? 'button' : 'div';
      return `<${tag} class="stat"${act}><span class="k">${s.icon ? ic(s.icon, 14) : ''}${esc(s.label)}</span><span class="v num"${s.tone ? ` style="color:${s.tone}"` : ''}>${esc(
        s.value,
      )}</span>${s.delta ? `<span class="d ${s.deltaTone || ''}">${esc(s.delta)}</span>` : ''}</${tag}>`;
    })
    .join('')}</div>`;
}

export function uiPanel({ title = '', icon = '', actionsHtml = '', bodyHtml = '', flush = false, cls = '', style = '', id = '' } = {}) {
  return `<section class="panel${cls ? ' ' + cls : ''}"${id ? ` id="${esc(id)}"` : ''}${style ? ` style="${style}"` : ''}>${
    title ? `<div class="panel-h">${icon ? ic(icon, 14) : ''}<h2>${esc(title)}</h2>${actionsHtml ? `<div class="acts">${actionsHtml}</div>` : ''}</div>` : ''
  }${flush ? bodyHtml : `<div class="panel-b">${bodyHtml}</div>`}</section>`;
}

export function uiAlert({ tone = 'info', title = '', message = '', actionHtml = '', cls = '' } = {}) {
  return `<div class="alert ${tone}${cls ? ' ' + cls : ''}" role="${tone === 'danger' ? 'alert' : 'status'}">${ic(ALERT_ICON[tone] || 'info', 15)}<div class="grow">${
    title ? `<b>${esc(title)}</b>` : ''
  }${title && message ? ' ' : ''}${message ? `<span${title ? ' class="muted"' : ''}>${esc(message)}</span>` : ''}</div>${actionHtml}</div>`;
}

export function uiEmptyState({ icon = 'inbox', title = '', description = '', actionHtml = '', size = '', error = false, level = 2 } = {}) {
  return `<div class="empty-state${error ? ' err' : ''}${size ? ' ' + size : ''}"><div class="glyph">${ic(icon, 20)}</div><h${level} class="es-h">${esc(title)}</h${level}>${
    description ? `<p>${esc(description)}</p>` : ''
  }${actionHtml}</div>`;
}

export function uiSkeleton({ variant = 'rows', count = 5 } = {}) {
  const sk = (w, h = 10, extra = '') => `<span class="sk" style="width:${w};height:${h}px;${extra}"></span>`;
  const row = i =>
    `<div class="row" style="height:40px;border-bottom:1px solid var(--divider);gap:12px;padding:0 var(--gutter)">${sk('15px', 15, 'border-radius:4px')}${sk(
      38 + ((i * 13) % 30) + '%',
      10,
    )}<span class="sp"></span>${sk('70px', 18, 'border-radius:5px')}${sk('22px', 22, 'border-radius:50%')}${sk('54px', 10)}</div>`;
  const grid = (n, h) =>
    `<div class="pgrid" style="padding:0 var(--gutter)">${Array.from({ length: n }, () => `<div class="pcard" style="cursor:default;height:${h}px">${sk('28px', 28, 'border-radius:7px')}${sk('60%', 12)}${sk('90%', 9)}${sk('70%', 9)}</div>`).join('')}</div>`;
  if (variant === 'cards') return `<div style="padding:16px 0">${grid(count, 104)}</div>`;
  if (variant === 'stats')
    return `<div class="stats" style="margin:0 0 16px">${Array.from({ length: 4 }, () => `<div class="stat">${sk('80px', 10)}${sk('44px', 20)}${sk('60px', 9)}</div>`).join('')}</div><div style="padding:0 var(--gutter)">${Array.from({ length: 4 }, (_, i) => row(i)).join('')}</div>`;
  if (variant === 'split')
    return `<div style="display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:0;min-height:420px"><div style="border-right:1px solid var(--border)">${Array.from({ length: 6 }, (_, i) => row(i)).join('')}</div><div style="padding:20px 24px;display:flex;flex-direction:column;gap:10px">${sk('45%', 18)}${sk('100%', 10)}${sk('92%', 10)}${sk('76%', 10)}${sk('100%', 60, 'border-radius:8px')}</div></div>`;
  if (variant === 'table')
    return `<div class="tbl-wrap"><div style="height:34px;background:var(--surface-2);border-bottom:1px solid var(--border)"></div>${Array.from({ length: count }, (_, i) => row(i)).join('')}</div>`;
  return `<div style="padding:0 var(--gutter) 6px">${Array.from({ length: count }, (_, i) => row(i)).join('')}</div>`;
}

/* A table of plain rows: sortable headers render the order, the caller supplies sorted rows. */
export function uiDataTable({ key = '', columns = [], rows = [], sort = { f: '', dir: 1 }, emptyState = null, rowAction = '', footerActionHtml = '' } = {}) {
  if (!rows.length)
    return (
      emptyState || uiEmptyState({ icon: 'search-x', title: 'No rows match', description: 'Adjust the search or filters to widen the result set.', size: 'sm' })
    );
  const th = (c, i) => {
    const on = sort.f === c.f;
    const label = `${esc(c.label)}${on ? ic(sort.dir > 0 ? 'arrow-up' : 'arrow-down', 11) : ''}`;
    return `<th${i === 0 ? ' class="sticky"' : ''}${c.w ? ` style="width:${c.w}"` : ''}>${
      c.sortable === false || !c.f
        ? `<span class="thi" style="cursor:default">${label}</span>`
        : `<button class="thi" data-a="tplSort" data-key="${esc(key)}" data-f="${esc(c.f)}">${label}</button>`
    }</th>`;
  };
  const td = (r, c, i) =>
    `<td${i === 0 ? ' class="sticky"' : ''}${c.align === 'num' ? ' class="num" style="text-align:right"' : ''}>${c.render ? c.render(r) : esc(r[c.f] ?? '')}</td>`;
  const mobile = r =>
    `<div class="mini" ${rowAction ? `data-a="${rowAction}" data-id="${esc(r.id)}"` : ''} style="flex-direction:column;align-items:stretch;gap:3px;padding:10px var(--gutter)"><b style="font-weight:500">${
      columns[0].render ? columns[0].render(r) : esc(r[columns[0].f] ?? '')
    }</b><div class="row" style="gap:10px;flex-wrap:wrap;font-size:12px;color:var(--text-3)">${columns
      .slice(1)
      .map(c => `<span>${esc(c.label)}: <b style="font-weight:500;color:var(--text-2)">${c.render ? c.render(r) : esc(r[c.f] ?? '')}</b></span>`)
      .join('')}</div></div>`;
  return `<div class="tbl-wrap hide-m"><table class="tbl"><colgroup>${columns.map(c => `<col${c.w ? ` style="width:${c.w}"` : ''}>`).join('')}</colgroup><thead><tr>${columns
    .map(th)
    .join('')}</tr></thead><tbody>${rows
    .map(
      r =>
        `<tr${rowAction ? ` data-a="${rowAction}" data-id="${esc(r.id)}"` : ''} style="${rowAction ? 'cursor:pointer' : ''}">${columns.map((c, i) => td(r, c, i)).join('')}</tr>`,
    )
    .join('')}</tbody></table></div><div class="only-m">${rows.map(mobile).join('')}</div>${
    footerActionHtml ? `<div class="row" style="padding:8px var(--gutter);border-top:1px solid var(--divider)">${footerActionHtml}</div>` : ''
  }`;
}

/* Two-pane workbench: a scannable list on the left, detail on the right. */
export function uiSplitPane({
  leftHeaderHtml = '',
  leftTabsHtml = '',
  leftListHtml = '',
  rightHtml = '',
  emptyRightHtml = '',
  listKeepKey = 'split-list',
  leftWidth = '380px',
  hasSelection = false,
} = {}) {
  return `<div class="page flush">
    <div class="split${hasSelection ? ' has-sel' : ''}" style="--split-l:${leftWidth}">
      <div class="split-side">${leftHeaderHtml}${leftTabsHtml}<div class="inbox-list" data-keep="${esc(listKeepKey)}">${leftListHtml}</div></div>
      <div class="split-main" data-keep="split-main">${rightHtml || emptyRightHtml}</div>
    </div>
  </div>`;
}

export function uiKeyValueGrid({ items = [], twoCol = false } = {}) {
  return `<dl class="kv"${twoCol ? ' style="grid-template-columns:112px minmax(0,1fr) 112px minmax(0,1fr)"' : ''}>${items
    .map(p => `<dt>${p.icon ? ic(p.icon, 14) : ''}${esc(p.label)}</dt><dd>${p.html ?? esc(p.value ?? '')}</dd>`)
    .join('')}</dl>`;
}

/* One gate that renders the four mandatory screen states without every page repeating them. */
export function uiStateGate({ sim = 'default', loadingVariant = 'table', emptyOpts = {}, errorOpts = {}, renderDefault } = {}) {
  if (sim === 'loading') return `<div class="panel" style="padding:8px 0">${uiSkeleton({ variant: loadingVariant })}</div>`;
  if (sim === 'empty')
    return `<div class="panel">${uiEmptyState(Object.assign({ icon: 'inbox', title: 'Nothing here yet', description: 'New items will appear here as they arrive.' }, emptyOpts))}</div>`;
  if (sim === 'error')
    return `<div class="panel" style="padding:16px"><div class="alert danger">${ic('circle-alert', 16)}<div class="grow"><b>${esc(
      errorOpts.title || "This view didn't load",
    )}</b><div class="muted" style="margin-top:2px">${esc(errorOpts.message || 'The service did not respond in time. Your data is safe.')}</div></div><button class="btn btn-secondary btn-sm" data-a="setStateSim" data-v="default">${ic(
      'refresh-cw',
      13,
    )}<span>Try again</span></button></div></div>`;
  return renderDefault();
}
