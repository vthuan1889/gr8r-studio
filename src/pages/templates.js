/* =====================================================================
   APP TEMPLATES — six canonical screen sets built from src/ui/kit.js.

   Each archetype owns a route prefix (an-, crm-, st-, cm-, fl-) so the shell
   can infer the active app from navigation alone. Data lives in S.tpl
   (src/data/templates-seed.js) and is demo-only.
   ===================================================================== */
import { ago, esc, fmtDate } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { S } from '../core/store.js';
import { ARCHETYPES, DEAL_STAGES } from '../data/templates-seed.js';
import { filterAndSort } from '../shell/view-engine.js';
import {
  uiAlert,
  uiAvatar,
  uiBadge,
  uiButton,
  uiDataTable,
  uiEmptyState,
  uiField,
  uiInput,
  uiKeyValueGrid,
  uiPanel,
  uiProgressBar,
  uiSegmented,
  uiSelect,
  uiSplitPane,
  uiStateGate,
  uiStatStrip,
  uiStatusPill,
} from '../ui/kit.js';
import { pageHome } from './home.js';
import { pageOverview } from './overview.js';

/* ---------- shared bits ---------- */
const SHORT = {
  home: 'Home',
  inbox: 'Inbox',
  mytasks: 'My Tasks',
  overview: 'Overview',
  projects: 'Projects',
  tasks: 'Tasks',
  calendar: 'Calendar',
  timeline: 'Timeline',
  members: 'Members',
  teams: 'Teams',
  activity: 'Activity',
  'an-overview': 'Overview',
  'an-revenue': 'Revenue',
  'an-usage': 'Usage',
  'an-invoices': 'Ledger',
  'crm-inbox': 'Inbox',
  'crm-deals': 'Pipeline',
  'crm-contacts': 'Accounts',
  'st-prompts': 'Prompts',
  'st-docs': 'Docs',
  'st-runs': 'Runs',
  'cm-orders': 'Orders',
  'cm-products': 'Products',
  'cm-customers': 'Customers',
  'fl-hub': 'Flow catalog',
  settings: 'Settings',
};
const AN_ROUTES = ['an-overview', 'an-revenue', 'an-usage', 'an-invoices'];
const CRM_ROUTES = ['crm-inbox', 'crm-deals', 'crm-contacts'];
const ST_ROUTES = ['st-prompts', 'st-docs', 'st-runs'];
const CM_ROUTES = ['cm-orders', 'cm-products', 'cm-customers'];

const TAGS = {
  pm: ['Table', 'Board', 'Gantt', 'List', 'Drawer', 'Filters', 'Bulk edit', 'Comments'],
  analytics: ['Stat strip', 'Stacked bars', 'Cohort matrix', 'Data table', 'Inspector', 'Segmented filters'],
  crm: ['Split pane', 'Thread list', 'Composer', 'Kanban pipeline', 'Account table', 'SLA badges'],
  studio: ['Split workbench', 'Rich text', 'Prompt editor', 'Eval table', 'Trace inspector'],
  commerce: ['Stat strip', 'Order table', 'Grid catalog', 'Stock bars', 'Line items', 'Status tabs'],
  flows: ['Centered auth', 'Wizard steps', 'Validation', 'Sectioned settings', 'Plan comparison'],
};

const sortOf = key => S.tpl.sort[key] || (S.tpl.sort[key] = { f: '', dir: 1 });
/* A search term belongs to the screen it was typed on, so moving between templates starts clean. */
const qOf = sec => (sec.qRoute === S.ui.route ? sec.q : '');
const usd = n => '$' + Math.round(n).toLocaleString('en-US');
const kUSD = n => '$' + n.toFixed(1) + 'k';
const compact = n => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n));
const scoreBadge = v => uiBadge({ label: `${v}`, tone: v >= 90 ? 'green' : v >= 80 ? 'amber' : 'red', icon: 'gauge' });
const cap = t => String(t).charAt(0).toUpperCase() + String(t).slice(1);
const statusTone = { paid: 'green', open: 'amber', failed: 'red', fulfilled: 'green', unfulfilled: 'amber', refunded: 'red' };

function subNav(routes, active) {
  return `<div class="tabs" style="margin:0 0 16px">${routes
    .map(r => `<button class="tab ${active === r ? 'on' : ''}" data-a="go" data-r="${r}">${esc(SHORT[r] || r)}</button>`)
    .join('')}</div>`;
}
function head(title, sub, actions = '', routes = null, active = '') {
  return `<div class="ph"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>${actions ? `<div class="acts">${actions}</div>` : ''}</div>${
    routes ? subNav(routes, active) : ''
  }`;
}
function searchBox(key, placeholder, value) {
  return `<div class="inwrap">${ic('search', 13)}<input class="input search-sm" id="tplq-${key}" data-in="tplSearch" data-key="${key}" placeholder="${esc(placeholder)}" value="${esc(
    value,
  )}" aria-label="${esc(placeholder)}"></div>`;
}
const gate = opts => uiStateGate(Object.assign({ sim: S.ui.stateSim }, opts));

/* =====================================================================
   0 · TEMPLATE GALLERY
   ===================================================================== */
const ACCENTS = [
  ['indigo', '#4B5BD6'],
  ['blue', '#2F6CD4'],
  ['violet', '#7348CC'],
  ['teal', '#1A7F7A'],
  ['rose', '#B93D68'],
  ['graphite', '#34332F'],
];

function archetypeCard(a) {
  const on = S.ui.app === a.id;
  return `<div class="pcard" data-a="switchApp" data-v="${a.id}" role="link" tabindex="0" aria-label="${esc(a.name)}"${on ? ' style="border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)"' : ''}>
    <div class="row" style="align-items:flex-start">
      <span class="picon lg" style="--c:${a.color}">${ic(a.icon, 18)}</span>
      <div class="grow" style="min-width:0"><b class="trunc" style="font-weight:600;font-size:14px;display:block">${esc(a.name)}</b><span class="faint" style="font-size:11.5px">${esc(
        a.surface,
      )}</span></div>
      ${on ? uiBadge({ label: 'Active', tone: 'accent' }) : ''}
    </div>
    <div class="desc">${esc(a.desc)}</div>
    <div class="col" style="gap:4px;font-size:11.5px;color:var(--text-3)">
      <span class="row" style="gap:5px">${ic('layers', 12)}${esc(a.container)}</span>
      <span class="row" style="gap:5px">${ic('route', 12)}${a.routes.length} screens · starts at <span class="mono">${esc(a.defaultRoute)}</span></span>
    </div>
    <div class="row" style="gap:4px;flex-wrap:wrap">${a.routes
      .slice(0, 7)
      .map(
        r =>
          `<button class="badge" style="cursor:pointer" data-a="go" data-r="${r}" ${
            r === a.defaultRoute ? 'data-tip="Default screen"' : ''
          }>${esc(SHORT[r] || r)}</button>`,
      )
      .join('')}${a.routes.length > 7 ? `<span class="badge">+${a.routes.length - 7}</span>` : ''}</div>
    <div class="row" style="gap:4px;flex-wrap:wrap">${(TAGS[a.id] || []).map(t => `<span class="badge" style="background:transparent">${esc(t)}</span>`).join('')}</div>
    <div class="foot">${uiButton({ label: on ? 'Open' : 'Open template', icon: 'arrow-up-right', variant: on ? 'primary' : 'secondary', size: 'sm', action: 'switchApp', value: a.id })}<span class="sp"></span>${
      on ? '' : uiBadge({ label: a.short })
    }</div>
  </div>`;
}

export function pageTemplates() {
  const P = S.prefs;
  return `<div class="page wide">
    ${head(
      'App templates',
      'Six complete screens sets on one design system. Every template shares the same tokens, primitives and state handling.',
      `<div class="seg" role="group" aria-label="Theme">${[
        ['light', 'sun', 'Light'],
        ['dark', 'moon', 'Dark'],
        ['system', 'monitor', 'System'],
      ]
        .map(
          ([k, i, n]) =>
            `<button class="${P.theme === k ? 'on' : ''}" data-a="setTheme" data-v="${k}" aria-pressed="${P.theme === k}">${ic(i, 13)}<span class="hide-m">${n}</span></button>`,
        )
        .join('')}</div>
      <div class="swatches" role="radiogroup" aria-label="Accent color">${ACCENTS.map(
        ([k, c]) =>
          `<button class="sw ${P.accent === k ? 'on' : ''}" style="--c:${c}" role="radio" aria-checked="${P.accent === k}" data-a="setAccent" data-v="${k}" aria-label="${k}" data-tip="${
            k[0].toUpperCase() + k.slice(1)
          }">${P.accent === k ? ic('check', 13) : ''}</button>`,
      ).join('')}</div>
      ${uiSegmented({
        items: [
          ['comfortable', 'Default'],
          ['compact', 'Compact'],
        ],
        active: P.density,
        action: 'setDensity',
        label: 'Density',
      })}`,
    )}
    <div class="row" style="margin-bottom:12px;gap:8px;flex-wrap:wrap">
      <span class="eyebrow">Workbench</span>
      <span class="faint" style="font-size:12.5px">${esc(
        (ARCHETYPES.find(a => a.id === S.ui.app) || ARCHETYPES[0]).name,
      )} is active · the sidebar, breadcrumb and command menu follow the app you open.</span>
      <span class="sp"></span>
      <button class="btn btn-sm btn-ghost" data-a="go" data-r="system">${ic('component', 14)}Design system</button>
      <button class="btn btn-sm btn-ghost" data-a="go" data-r="states">${ic('layers', 14)}System states</button>
    </div>
    <div class="pgrid">${ARCHETYPES.map(archetypeCard).join('')}</div>
    <div class="grid2" style="margin-top:16px">
      ${uiPanel({
        title: 'What every template shares',
        icon: 'layers',
        bodyHtml: `<div class="stack" style="gap:8px;font-size:13px">${[
          ['Warm-stone tokens, light and dark', 'One palette, six accents, two densities.'],
          ['Geist + Geist Mono, tabular numerals', 'Numbers line up in every table.'],
          ['4pt spacing, one 24px content gutter', 'Headers, tables and boards start on the same edge.'],
          ['Focus-preserving re-renders', 'Typing never loses the caret, scroll keeps its place.'],
          ['Four states per screen', 'Loading, empty, error and default come from one gate.'],
        ]
          .map(
            ([t, d]) =>
              `<div class="row" style="align-items:flex-start;gap:8px">${ic('check', 14)}<div><b style="font-weight:500">${t}</b><div class="faint">${d}</div></div></div>`,
          )
          .join('')}</div>`,
      })}
      ${uiPanel({
        title: 'Inspect a state',
        icon: 'layers',
        bodyHtml: `<p class="muted" style="margin:0 0 12px;font-size:13px">The simulator in the topbar swaps any template screen between its four mandatory states without leaving the page.</p>
          ${uiSegmented({
            items: [
              ['default', 'Default'],
              ['loading', 'Loading'],
              ['empty', 'Empty'],
              ['error', 'Error'],
            ],
            active: S.ui.stateSim,
            action: 'setStateSim',
            label: 'Simulate view state',
          })}
          <div class="faint" style="font-size:12px;margin-top:10px">Currently: <b class="mono">${esc(S.ui.stateSim)}</b></div>`,
      })}
    </div>
  </div>`;
}

/* =====================================================================
   1 · PROJECT & ISSUE TRACKER — existing PM screens, gated for state demos
   ===================================================================== */
export const pageHomeGated = () =>
  gate({
    loadingVariant: 'stats',
    emptyOpts: { icon: 'list-checks', title: 'No work assigned yet', description: 'Create a task or invite your team to start a sprint.' },
    renderDefault: pageHome,
  });
export const pageOverviewGated = () =>
  gate({
    loadingVariant: 'stats',
    emptyOpts: { icon: 'folder-kanban', title: 'No projects to summarise', description: 'Create a project to see portfolio health here.' },
    renderDefault: pageOverview,
  });

/* =====================================================================
   2 · SAAS ANALYTICS & FINOPS
   ===================================================================== */
const an = () => S.tpl.analytics;
const anHead = (title, sub, active) => {
  const a = an();
  return head(
    title,
    sub,
    `<div class="seg hide-m" role="group" aria-label="Period">${[
      ['7d', '7d'],
      ['30d', '30d'],
      ['90d', '90d'],
      ['12m', '12m'],
    ]
      .map(([k, n]) => `<button class="${a.range === k ? 'on' : ''}" data-a="anSetRange" data-v="${k}">${n}</button>`)
      .join('')}</div>
     ${uiSelect({
       id: 'an-env',
       options: [
         ['all', 'All environments'],
         ['production', 'Production'],
         ['staging', 'Staging'],
       ],
       value: a.env,
       onInput: 'anSetEnv',
       label: 'Environment',
       style: 'height:26px;width:auto;font-size:12px',
     })}`,
    AN_ROUTES,
    active,
  );
};

/* The series is monthly, so each period covers a trailing window of months. */
const RANGE_MONTHS = { '7d': 1, '30d': 1, '90d': 3, '12m': 8 };
const rangeSeries = () => {
  const a = an();
  const n = RANGE_MONTHS[a.range] || a.revenue.length;
  return a.revenue.slice(-n);
};
function seg(v, max, color) {
  return `<i style="display:block;height:${((v / max) * 100).toFixed(1)}%;background:${color};border-radius:1px"></i>`;
}
function revChart(rows) {
  const max = Math.max(...rows.map(r => r.nw + r.ex + r.ch));
  const soft = 'color-mix(in srgb, var(--teal) 42%, var(--surface))';
  return `<div style="padding:16px var(--gutter) 10px">
    <div class="row" style="gap:14px;margin-bottom:14px;font-size:11.5px;color:var(--text-3)">${[
      ['New', 'var(--teal)'],
      ['Expansion', soft],
      ['Churn', 'var(--red)'],
    ]
      .map(([n, c]) => `<span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:${c};display:block"></i>${n}</span>`)
      .join('')}</div>
    <div style="display:flex;align-items:flex-end;gap:8px;height:160px">${rows
      .map(
        r =>
          `<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;height:100%" data-tip="New ${kUSD(r.nw)} · Expansion ${kUSD(r.ex)} · Churn ${kUSD(r.ch)}">
        <div style="height:132px;display:flex;flex-direction:column-reverse;gap:1px">${seg(r.nw, max, 'var(--teal)')}${seg(r.ex, max, soft)}${seg(r.ch, max, 'var(--red)')}</div>
        <span class="faint" style="font-size:10.5px;text-align:center">${r.m}</span>
      </div>`,
      )
      .join('')}</div>
  </div>`;
}
function cohortTable(cohorts) {
  const cols = cohorts[0].r.length;
  return `<table class="perm-t" style="min-width:440px"><thead><tr><th style="padding-left:var(--gutter);text-align:left">Cohort</th><th>Orgs</th>${Array.from(
    { length: cols },
    (_, i) => `<th>M${i}</th>`,
  ).join('')}</tr></thead><tbody>${cohorts
    .map(
      c =>
        `<tr><td style="padding-left:var(--gutter);text-align:left" class="mono">${c.m}</td><td class="num">${c.size}</td>${c.r
          .map(v =>
            v
              ? `<td class="num" style="background:color-mix(in srgb, var(--teal) ${Math.round(v * 0.38)}%, transparent);font-size:11.5px">${v}%</td>`
              : '<td class="faint" style="font-size:11.5px">—</td>',
          )
          .join('')}</tr>`,
    )
    .join('')}</tbody></table>`;
}
const usageCols = () => [
  { f: 'service', label: 'Service', render: r => `<span class="row" style="gap:6px">${ic('cpu', 13)}<span class="trunc">${esc(r.service)}</span></span>` },
  { f: 'env', label: 'Env', w: '110px', render: r => uiBadge({ label: r.env, tone: r.env === 'production' ? 'accent' : '' }) },
  { f: 'requests', label: 'Requests', w: '110px', align: 'num', render: r => `<span class="num">${compact(r.requests)}</span>` },
  { f: 'unitCost', label: 'Unit cost', w: '110px', align: 'num', render: r => `<span class="num">$${r.unitCost.toFixed(7)}</span>` },
  { f: 'spend', label: 'Spend', w: '100px', align: 'num', render: r => `<span class="num">${usd(r.spend)}</span>` },
  {
    f: 'trend',
    label: 'Trend',
    w: '84px',
    align: 'num',
    render: r => uiBadge({ label: `${r.trend > 0 ? '+' : ''}${r.trend}%`, tone: r.trend > 0 ? 'red' : 'green' }),
  },
];

export function pageAnOverview() {
  const a = an();
  return `<div class="page wide">${anHead('Analytics overview', 'Net revenue, retention and unit economics for the selected period.', 'an-overview')}
    ${gate({
      loadingVariant: 'stats',
      emptyOpts: { icon: 'chart-column', title: 'No metrics for this period', description: 'Widen the period or switch back to all environments.' },
      renderDefault: () => `
      ${uiStatStrip({ items: a.metrics.map(m => ({ label: m.label, value: m.value, delta: m.delta, deltaTone: m.deltaTone })) })}
      <div class="grid2" style="margin-top:16px">
        ${uiPanel({ title: 'Net revenue movement', icon: 'trending-up', flush: true, style: 'overflow:hidden', bodyHtml: revChart(rangeSeries()) })}
        ${uiPanel({ title: 'Cohort retention', icon: 'users', flush: true, style: 'overflow:auto', bodyHtml: cohortTable(a.cohorts) })}
      </div>
      ${uiPanel({
        title: 'Top spend drivers',
        icon: 'cpu',
        flush: true,
        style: 'margin-top:16px;overflow:hidden',
        bodyHtml: uiDataTable({ key: 'an-usage', columns: usageCols(), rows: a.usage.slice(0, 4) }),
      })}`,
    })}
  </div>`;
}

export function pageAnRevenue() {
  const a = an();
  const win = rangeSeries();
  const rows = filterAndSort(win, { sort: sortOf('an-revenue') });
  const total = win.reduce((s, r) => s + r.nw + r.ex - r.ch, 0);
  const sum = k => win.reduce((s, r) => s + r[k], 0);
  return `<div class="page wide">${anHead('Revenue & MRR', 'Expansion is doing the work; churn stays inside the guardrail.', 'an-revenue')}
    ${gate({
      loadingVariant: 'stats',
      emptyOpts: { icon: 'trending-up', title: 'No revenue movement recorded', description: 'This period has no invoices in any environment.' },
      renderDefault: () => `
      ${uiStatStrip({
        items: [
          { label: 'Net MRR', value: kUSD(a.revenue[a.revenue.length - 1].mrr), delta: '+8.2% vs previous period', deltaTone: 'up', icon: 'trending-up' },
          {
            label: 'New business',
            value: kUSD(sum('nw')),
            delta: `${win.length} month${win.length > 1 ? 's' : ''} · ${a.range}`,
            deltaTone: 'up',
            icon: 'sparkles',
          },
          { label: 'Expansion', value: kUSD(sum('ex')), delta: 'seat and usage upgrades', deltaTone: 'up', icon: 'arrow-up-right' },
          {
            label: 'Churn',
            value: kUSD(sum('ch')),
            delta: `${((sum('ch') / total) * 100).toFixed(1)}% of gross adds`,
            deltaTone: 'bad',
            icon: 'trending-down',
          },
        ],
      })}
      <div class="grid2" style="margin-top:16px">
        ${uiPanel({
          title: 'Revenue against cloud cost',
          icon: 'chart-column',
          bodyHtml: `<div class="stack" style="gap:9px">${win
            .map(r => {
              const rev = r.nw + r.ex;
              const sum = rev + r.cost;
              return `<div class="row" style="gap:10px"><span class="mono faint" style="width:34px;font-size:11.5px">${r.m}</span>
                <span class="stackbar" style="flex:1;height:9px"><i style="width:${((rev / sum) * 100).toFixed(1)}%;background:var(--teal)"></i><i style="width:${(
                  (r.cost / sum) *
                  100
                ).toFixed(1)}%;background:var(--amber)"></i></span>
                <span class="num faint" style="width:64px;text-align:right;font-size:11.5px">${kUSD(rev)}</span></div>`;
            })
            .join('')}</div>
          <div class="row" style="gap:14px;margin-top:12px;font-size:11.5px;color:var(--text-3)"><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:var(--teal);display:block"></i>Gross revenue</span><span class="row" style="gap:5px"><i style="width:8px;height:8px;border-radius:2px;background:var(--amber);display:block"></i>Cloud cost</span></div>`,
        })}
        ${uiPanel({
          title: 'Movement by month',
          icon: 'table-2',
          flush: true,
          style: 'overflow:hidden',
          bodyHtml: uiDataTable({
            key: 'an-revenue',
            sort: sortOf('an-revenue'),
            columns: [
              { f: 'm', label: 'Month', render: r => `<span class="mono">${r.m}</span>` },
              { f: 'nw', label: 'New', w: '90px', align: 'num', render: r => `<span class="num">${kUSD(r.nw)}</span>` },
              { f: 'ex', label: 'Expansion', w: '100px', align: 'num', render: r => `<span class="num">${kUSD(r.ex)}</span>` },
              { f: 'ch', label: 'Churn', w: '86px', align: 'num', render: r => `<span class="num" style="color:var(--red)">−${kUSD(r.ch)}</span>` },
              { f: 'mrr', label: 'MRR', w: '90px', align: 'num', render: r => `<span class="num">${kUSD(r.mrr)}</span>` },
            ],
            rows,
          }),
        })}
      </div>`,
    })}
  </div>`;
}

export function pageAnUsage() {
  const a = an();
  const rows = filterAndSort(
    a.usage.filter(r => a.env === 'all' || r.env === a.env),
    { q: qOf(a), searchKeys: ['service', 'env'], sort: sortOf('an-usage') },
  );
  const spend = rows.reduce((s, r) => s + r.spend, 0);
  return `<div class="page wide">${anHead('Cloud & API usage', 'Requests, unit price and spend per service, straight from the billing export.', 'an-usage')}
    ${gate({
      loadingVariant: 'table',
      emptyOpts: { icon: 'cpu', title: 'No usage in this environment', description: 'Switch the environment selector back to all environments.' },
      renderDefault: () => `
      ${uiStatStrip({
        items: [
          { label: 'Requests', value: compact(rows.reduce((s, r) => s + r.requests, 0)), delta: 'in the selected period', icon: 'activity' },
          { label: 'Cloud spend', value: usd(spend), delta: 'billing export total', icon: 'receipt' },
          { label: 'Effective unit cost', value: '$0.0042', delta: 'per 1k requests', deltaTone: 'up', icon: 'cpu' },
          { label: 'Savings vs list', value: usd(41200), delta: 'committed use discounts', deltaTone: 'up', icon: 'piggy-bank' },
        ],
      })}
      <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('an', 'Search services', qOf(a))}<span class="sp"></span><span class="faint" style="font-size:12px">${rows.length} services</span></div>
      ${uiPanel({ flush: true, style: 'overflow:hidden', bodyHtml: uiDataTable({ key: 'an-usage', columns: usageCols(), rows, sort: sortOf('an-usage') }) })}`,
    })}
  </div>`;
}

export function pageAnInvoices() {
  const a = an();
  const rows = filterAndSort(
    a.ledger.filter(r => a.statusFilter === 'all' || r.status === a.statusFilter),
    { q: qOf(a), searchKeys: ['id', 'org', 'plan'], sort: sortOf('an-ledger') },
  );
  const sum = st => a.ledger.filter(r => r.status === st).reduce((s, r) => s + r.amount, 0);
  return `<div class="page wide">${anHead('Billing ledger', 'Every invoice, its dunning state and the MRR it carries.', 'an-invoices')}
    ${gate({
      loadingVariant: 'table',
      emptyOpts: { icon: 'receipt', title: 'No invoices match', description: 'Clear the status filter or search term to see the full ledger.' },
      renderDefault: () => `
      ${uiStatStrip({
        items: [
          {
            label: 'Collected',
            value: usd(sum('paid')),
            delta: `${a.ledger.filter(r => r.status === 'paid').length} invoices`,
            deltaTone: 'up',
            icon: 'circle-check',
          },
          { label: 'Open', value: usd(sum('open')), delta: 'awaiting payment', icon: 'clock' },
          { label: 'Failed', value: usd(sum('failed')), delta: 'dunning in progress', deltaTone: 'bad', icon: 'circle-alert' },
          {
            label: 'MRR under management',
            value: usd(a.ledger.reduce((s, r) => s + r.mrr, 0)),
            delta: `${a.ledger.reduce((s, r) => s + r.seats, 0)} seats`,
            icon: 'users',
          },
        ],
      })}
      <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('an', 'Search invoices or organisations', qOf(a))}
        ${uiSegmented({
          items: [
            ['all', 'All'],
            ['paid', 'Paid'],
            ['open', 'Open'],
            ['failed', 'Failed'],
          ],
          active: a.statusFilter,
          action: 'anSetStatus',
          label: 'Invoice status',
        })}<span class="sp"></span><span class="faint" style="font-size:12px">${rows.length} of ${a.ledger.length}</span></div>
      ${uiPanel({
        flush: true,
        style: 'overflow:hidden',
        bodyHtml: uiDataTable({
          key: 'an-ledger',
          sort: sortOf('an-ledger'),
          rows,
          rowAction: 'openInspector',
          columns: [
            { f: 'id', label: 'Invoice', w: '120px', render: r => `<span class="mono" style="font-size:11.5px">${esc(r.id)}</span>` },
            { f: 'org', label: 'Organisation', render: r => `<span class="trunc" style="font-weight:500">${esc(r.org)}</span>` },
            { f: 'plan', label: 'Plan', w: '110px', render: r => uiBadge({ label: r.plan, tone: r.plan === 'Enterprise' ? 'accent' : '' }) },
            { f: 'seats', label: 'Seats', w: '76px', align: 'num', render: r => `<span class="num">${r.seats}</span>` },
            { f: 'amount', label: 'Amount', w: '110px', align: 'num', render: r => `<span class="num">${usd(r.amount)}</span>` },
            { f: 'status', label: 'Status', w: '104px', render: r => uiBadge({ label: cap(r.status), tone: statusTone[r.status], dot: true }) },
            { f: 'date', label: 'Issued', w: '110px', render: r => `<span class="faint">${fmtDate(r.date)}</span>` },
          ],
        }),
      })}`,
    })}
  </div>`;
}

/* =====================================================================
   3 · CRM & SUPPORT INBOX
   ===================================================================== */
const crm = () => S.tpl.crm;
function crmThreads() {
  const c = crm();
  const tabs = { all: () => true, vip: t => t.vip, risk: t => t.sla !== 'ok', unassigned: t => !t.owner };
  const q = qOf(c).toLowerCase();
  return filterAndSort(
    c.threads.filter(tabs[c.tab] || tabs.all).filter(t => (!q ? true : `${t.from} ${t.company} ${t.subject}`.toLowerCase().includes(q))),
    {
      sort: { f: 'updated', dir: -1 },
    },
  );
}
export function pageCrmInbox() {
  const c = crm();
  const list = crmThreads();
  /* No fallback: clearing the selection (back on mobile) must really close the detail pane. */
  const sel = list.find(t => t.id === c.selThread) || null;
  const tabs = [
    ['all', 'All'],
    ['vip', 'VIP'],
    ['risk', 'SLA risk'],
    ['unassigned', 'Unassigned'],
  ];
  const leftHeader = `<div style="padding:18px var(--gutter) 0" class="row"><h1 style="font-size:var(--fs-xl);margin:0;font-weight:600;letter-spacing:-.015em">Inbox</h1><span class="sp"></span>
      ${uiBadge({ label: `${c.threads.filter(t => t.unread).length} unread`, tone: 'accent' })}</div>`;
  const leftTabs = `<div class="tabs inbox-tabs" role="tablist">${tabs
    .map(
      ([k, n]) =>
        `<button role="tab" class="tab ${c.tab === k ? 'on' : ''}" data-a="crmSetTab" data-v="${k}">${n}${k === 'all' ? '' : `<span class="cnt">${crmThreads().length}</span>`}</button>`,
    )
    .join('')}</div>
    <div style="padding:8px var(--gutter) 10px">${searchBox('crm', 'Search conversations', qOf(c))}</div>`;
  const leftList = list.length
    ? list
        .map(
          t => `<div class="row" style="align-items:flex-start;gap:10px;padding:11px var(--gutter);border-bottom:1px solid var(--divider);cursor:pointer;position:relative;${
            sel && sel.id === t.id ? 'background:var(--surface-2);' : ''
          }" data-a="crmSelectThread" data-id="${t.id}" role="button" tabindex="0">
        ${t.unread ? '<span style="position:absolute;left:7px;top:22px;width:6px;height:6px;border-radius:50%;background:var(--accent)" aria-label="Unread"></span>' : ''}
        ${uiAvatar({ name: t.from === 'Unassigned' ? '' : t.from, color: 'var(--violet)', size: 'md', tip: false })}
        <div class="grow" style="min-width:0">
          <div class="row" style="gap:6px"><b class="trunc" style="font-weight:${t.unread ? 600 : 500};font-size:13px">${esc(t.from)}</b>${t.vip ? uiBadge({ label: 'VIP', tone: 'accent' }) : ''}<span class="sp"></span><span class="faint" style="font-size:11px">${ago(t.updated)}</span></div>
          <div class="trunc muted" style="font-size:12.5px;margin-top:2px">${esc(t.subject)}</div>
          <div class="trunc faint" style="font-size:11.5px;margin-top:1px">${esc(t.preview)}</div>
          <div class="row" style="gap:6px;margin-top:5px">${uiBadge({
            label: t.sla === 'breach' ? 'SLA breached' : t.sla === 'risk' ? 'SLA at risk' : 'On track',
            tone: t.sla === 'breach' ? 'red' : t.sla === 'risk' ? 'amber' : 'green',
            dot: true,
          })}<span class="faint" style="font-size:11px">${esc(t.company)}</span></div>
        </div></div>`,
        )
        .join('')
    : uiEmptyState({ icon: 'inbox', title: 'No conversations', description: 'Nothing matches this filter right now.', size: 'sm' });
  const right = sel
    ? `<div class="row" style="height:46px;padding:0 var(--gutter);border-bottom:1px solid var(--border);gap:8px;flex-shrink:0">
        <button class="ibtn ibtn-sm split-back" data-a="crmSelectThread" data-id="" aria-label="Back to list">${ic('arrow-left', 15)}</button>
        <span class="pdot" style="--c:var(--violet)"></span><span class="muted trunc" style="font-size:12.5px">${esc(sel.company)}</span><span class="faint mono" style="font-size:11.5px">#${esc(sel.id)}</span>
        <span class="sp"></span>${uiButton({ label: 'Account', icon: 'building-2', size: 'sm', variant: 'secondary', action: 'openInspector', value: sel.id })}</div>
      <div style="padding:20px var(--gutter) 28px;max-width:780px">
        <h2 style="font-size:var(--fs-xl);margin:0 0 8px;font-weight:600;letter-spacing:-.015em">${esc(sel.subject)}</h2>
        <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:16px">${uiBadge({ label: sel.plan, tone: 'accent' })}${uiBadge({
          label: sel.health,
          tone: sel.health === 'Healthy' ? 'green' : sel.health === 'Expanding' ? 'accent' : 'red',
          dot: true,
        })}${uiStatusPill({ label: sel.sla === 'breach' ? 'SLA breached' : sel.sla === 'risk' ? 'SLA at risk' : 'On track', color: sel.sla === 'ok' ? 'var(--green)' : sel.sla === 'risk' ? 'var(--amber)' : 'var(--red)', bordered: true })}</div>
        ${uiKeyValueGrid({
          items: [
            { icon: 'building-2', label: 'Account', value: sel.company },
            { icon: 'credit-card', label: 'ARR', value: usd(sel.arr) },
            { icon: 'user', label: 'Owner', value: sel.owner || 'Unassigned' },
            { icon: 'clock', label: 'Last reply', value: ago(sel.updated) },
          ],
        })}
        <div class="eyebrow" style="margin:18px 0 2px">Conversation</div>
        ${sel.messages
          .map(
            m => `<div style="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--divider)${m.internal ? ';background:color-mix(in srgb, var(--amber) 6%, transparent);margin:0 calc(-1 * var(--gutter));padding-left:var(--gutter);padding-right:var(--gutter)' : ''}">
          ${uiAvatar({ name: m.by, color: m.internal ? 'var(--amber)' : 'var(--violet)', size: 'md', tip: false })}
          <div class="grow" style="min-width:0"><div class="row" style="gap:6px"><b style="font-weight:600;font-size:13px">${esc(m.by)}</b>${m.internal ? uiBadge({ label: 'Internal note', tone: 'amber' }) : ''}<span class="sp"></span><span class="faint" style="font-size:11.5px">${ago(m.at)}</span></div>
          <div class="muted" style="font-size:13px;line-height:1.5;margin-top:2px">${esc(m.body)}</div></div></div>`,
          )
          .join('')}
        <div class="cbox" style="margin-top:12px"><textarea id="crm-reply" data-in="crmDraft" rows="3" placeholder="${c.noteMode ? 'Write an internal note — the customer never sees this' : 'Reply to the customer…'}" aria-label="Reply">${esc(
          c.replyDraft,
        )}</textarea>
          <div class="row"><button class="btn btn-sm btn-ghost" data-a="crmToggleNote" aria-pressed="${c.noteMode}">${ic(c.noteMode ? 'sticky-note' : 'message-square', 13)}${
            c.noteMode ? 'Internal note' : 'Public reply'
          }</button><span class="sp"></span><span class="faint hide-m" style="font-size:11.5px">Sends to ${esc(sel.from)}</span><button class="btn btn-primary btn-sm" data-a="crmSendReply" data-id="${esc(
            sel.id,
          )}">${ic('send', 13)}Send</button></div></div>
      </div>`
    : '';
  return gate({
    loadingVariant: 'split',
    emptyOpts: { icon: 'inbox', title: 'Inbox zero', description: 'Every conversation has been answered.' },
    renderDefault: () =>
      uiSplitPane({
        leftHeaderHtml: leftHeader,
        leftTabsHtml: leftTabs,
        leftListHtml: leftList,
        rightHtml: right,
        hasSelection: !!sel,
        listKeepKey: 'crm-list',
        emptyRightHtml: `<div class="fullstate"><div class="box"><div class="empty-state" style="padding:0"><div class="glyph">${ic('mail-open', 20)}</div><h2 class="es-h">Select a conversation</h2><p>Read the thread, reply, or leave an internal note without leaving the inbox.</p></div></div></div>`,
      }),
  });
}

export function pageCrmDeals() {
  const c = crm();
  return `<div class="page wide">${head(
    'Deal pipeline',
    'Weighted ARR by stage. Advance a deal from the card to move it forward.',
    `<button class="btn btn-secondary btn-sm" data-a="go" data-r="crm-contacts">${ic('building-2', 14)}Accounts</button>`,
    CRM_ROUTES,
    'crm-deals',
  )}
  ${gate({
    loadingVariant: 'cards',
    emptyOpts: { icon: 'square-kanban', title: 'No deals in the pipeline', description: 'Create a deal from an account to start tracking ARR.' },
    renderDefault: () =>
      `<div class="panel" style="display:flex;flex-direction:column;overflow:hidden"><div class="board" style="min-height:300px">${DEAL_STAGES.map(stage => {
        const deals = c.deals.filter(d => d.stage === stage);
        const arr = deals.reduce((s, d) => s + d.arr, 0);
        return `<div class="bcol" style="width:calc((100% - 48px) / 5);min-width:150px"><div class="bcol-h">${esc(stage)}<span class="cnt">${deals.length}</span><span class="sp"></span><span class="faint num" style="font-size:11px">${usd(arr)}</span></div>
        <div class="bcol-b">${
          deals
            .map(
              d =>
                `<div class="kcard" data-a="openInspector" data-app="crm" data-type="deal" data-id="${d.id}">
            <div class="top"><span class="title">${esc(d.name)}</span></div>
            <div class="row" style="gap:6px"><span class="num" style="font-weight:600;font-size:13px">${usd(d.arr)}</span><span class="faint" style="font-size:11px">ARR</span><span class="sp"></span>${uiAvatar(
              {
                name: d.owner,
                color: 'var(--violet)',
                size: 'sm',
              },
            )}</div>
            <div class="row" style="gap:6px"><span class="faint row" style="font-size:11px;gap:4px">${ic('calendar', 11)}${fmtDate(d.closeDate)}</span><span class="sp"></span>${
              stage === 'Closed Won'
                ? uiBadge({ label: 'Won', tone: 'green', dot: true })
                : `<button class="ibtn ibtn-xs" data-a="crmAdvanceDeal" data-id="${d.id}" data-tip="Advance stage" aria-label="Advance stage">${ic('arrow-right', 13)}</button>`
            }</div></div>`,
            )
            .join('') || `<div class="faint" style="font-size:12px;padding:8px 4px">Nothing here</div>`
        }</div></div>`;
      }).join('')}</div></div>`,
  })}
  </div>`;
}

export function pageCrmContacts() {
  const c = crm();
  const rows = filterAndSort(c.contacts, { q: qOf(c), searchKeys: ['name', 'company', 'email'], sort: sortOf('crm-contacts') });
  const arr = c.contacts.reduce((s, x) => s + x.arr, 0);
  return `<div class="page wide">${head(
    'Accounts & contacts',
    'Renewals, health and expansion by account.',
    `<div class="inwrap">${ic('search', 13)}<input class="input search-sm" id="tplq-crm" data-in="tplSearch" data-key="crm" placeholder="Search accounts" value="${esc(
      qOf(c),
    )}" aria-label="Search accounts"></div>`,
    CRM_ROUTES,
    'crm-contacts',
  )}
  ${gate({
    loadingVariant: 'table',
    emptyOpts: { icon: 'building-2', title: 'No accounts match', description: 'Clear the search to see every account.' },
    renderDefault: () => `
    ${uiStatStrip({
      items: [
        { label: 'Accounts', value: String(c.contacts.length), delta: 'in the book of business', icon: 'building-2' },
        { label: 'Total ARR', value: usd(arr), delta: '+11.4% year over year', deltaTone: 'up', icon: 'trending-up' },
        {
          label: 'At risk',
          value: String(c.contacts.filter(x => x.health === 'At Risk').length),
          delta: 'need a success plan',
          deltaTone: 'bad',
          icon: 'triangle-alert',
        },
        {
          label: 'Renewing in 90d',
          value: String(c.contacts.filter(x => x.renewal < '2026-05-01').length),
          delta: 'weighted renewal ARR ' + usd(150400),
          icon: 'calendar',
        },
      ],
    })}
    <div style="margin-top:16px">${uiPanel({
      flush: true,
      style: 'overflow:hidden',
      bodyHtml: uiDataTable({
        key: 'crm-contacts',
        sort: sortOf('crm-contacts'),
        rows,
        rowAction: 'openInspector',
        columns: [
          {
            f: 'name',
            label: 'Contact',
            render: r =>
              `<span class="row" style="gap:8px">${uiAvatar({ name: r.name, color: 'var(--violet)', size: 'sm', tip: false })}<span class="trunc" style="font-weight:500">${esc(r.name)}</span></span>`,
          },
          { f: 'company', label: 'Account', render: r => `<span class="trunc muted">${esc(r.company)}</span>` },
          {
            f: 'health',
            label: 'Health',
            w: '120px',
            render: r => uiBadge({ label: r.health, tone: r.health === 'Healthy' ? 'green' : r.health === 'Expanding' ? 'accent' : 'red', dot: true }),
          },
          { f: 'arr', label: 'ARR', w: '100px', align: 'num', render: r => `<span class="num">${usd(r.arr)}</span>` },
          { f: 'seats', label: 'Seats', w: '80px', align: 'num', render: r => `<span class="num">${r.seats}</span>` },
          { f: 'renewal', label: 'Renewal', w: '110px', render: r => `<span class="faint">${fmtDate(r.renewal)}</span>` },
          { f: 'owner', label: 'Owner', w: '130px', render: r => `<span class="trunc faint">${esc(r.owner || 'Unassigned')}</span>` },
        ],
      }),
    })}</div>`,
  })}
  </div>`;
}

/* =====================================================================
   4 · AI & KNOWLEDGE STUDIO
   ===================================================================== */
const studio = () => S.tpl.studio;
const stHead = (title, sub, active) =>
  head(title, sub, `<button class="btn btn-secondary btn-sm" data-a="go" data-r="st-runs">${ic('terminal', 14)}Run logs</button>`, ST_ROUTES, active);

export function pageStPrompts() {
  const st = studio();
  const p = st.prompts.find(x => x.id === st.selPrompt) || st.prompts[0];
  const left = st.prompts
    .filter(x => !qOf(st) || x.name.toLowerCase().includes(qOf(st).toLowerCase()))
    .map(
      x => `<div class="row" style="align-items:flex-start;gap:10px;padding:10px var(--gutter);border-bottom:1px solid var(--divider);cursor:pointer;${
        p && x.id === p.id ? 'background:var(--surface-2);' : ''
      }" data-a="stSelectPrompt" data-id="${x.id}" role="button" tabindex="0">
      <span class="picon" style="--c:var(--orange)">${ic('sparkles', 14)}</span>
      <div class="grow" style="min-width:0"><div class="row" style="gap:6px"><b class="trunc" style="font-weight:500;font-size:13px">${esc(x.name)}</b><span class="mono faint" style="font-size:10.5px">${esc(
        x.version,
      )}</span></div><div class="trunc faint" style="font-size:11.5px">${x.tokens} tokens · ${ago(x.updated)}</div></div>${scoreBadge(x.score)}</div>`,
    )
    .join('');
  const right = p
    ? `<div style="padding:18px var(--gutter) 28px;max-width:860px">
      <div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="font-size:var(--fs-xl);margin:0;font-weight:600;letter-spacing:-.015em">${esc(p.name)}</h2>${uiBadge({ label: p.version, tone: 'accent' })}
        <span class="sp"></span>${uiButton({ label: 'Run evaluation', icon: 'play', variant: 'primary', size: 'sm', action: 'stRunPrompt', id: 'st-run' })}</div>
      <div class="row" style="gap:8px;margin:12px 0;flex-wrap:wrap">
        ${uiSelect({
          id: 'st-model',
          options: ['claude-3-7-sonnet', 'gpt-4.1', 'gpt-4.1-mini', 'llama-3.3-70b'],
          value: st.model,
          onInput: 'stModel',
          label: 'Model',
          style: 'height:28px;width:auto;font-size:12px',
        })}
        ${uiInput({ id: 'st-temp', value: st.temp, onInput: 'stTemp', cls: 'search-sm', attrs: 'style="width:74px;height:28px" aria-label="Temperature"' })}
        <span class="badge">${ic('hash', 11)}temp ${esc(st.temp)}</span><span class="badge">${ic('coins', 11)}${p.tokens} tokens</span>
      </div>
      ${uiField({ label: 'System prompt', id: 'st-system', controlHtml: `<textarea class="textarea mono" id="st-system" data-in="stPromptBody" data-field="system" rows="4" aria-label="System prompt">${esc(p.system)}</textarea>` })}
      ${uiField({ label: 'User template', id: 'st-user', controlHtml: `<textarea class="textarea mono" id="st-user" data-in="stPromptBody" data-field="user" rows="6" aria-label="User template">${esc(p.user)}</textarea>` })}
      <div class="row" style="gap:6px;margin:12px 0 18px;flex-wrap:wrap"><span class="eyebrow">Declared variables</span>${p.vars.map(v => uiBadge({ label: `{{${v}}}`, tone: 'accent' })).join('')}</div>
      ${uiPanel({
        title: 'Last run',
        icon: 'terminal',
        actionsHtml: `${uiBadge({ label: st.model })}`,
        bodyHtml: st.lastRun
          ? `<div class="row" style="gap:16px;margin-bottom:12px;flex-wrap:wrap">
              <span class="col" style="gap:2px"><span class="eyebrow">Score</span><b class="num" style="font-size:19px">${st.lastRun.score}</b></span>
              <span class="col" style="gap:2px"><span class="eyebrow">Latency</span><b class="num" style="font-size:19px">${st.lastRun.latency}<span class="faint" style="font-size:12px">ms</span></b></span>
              <span class="col" style="gap:2px"><span class="eyebrow">Tokens</span><b class="num" style="font-size:19px">${st.lastRun.tokens}</b></span>
              <span class="sp"></span><span class="faint mono" style="font-size:11.5px">${esc(st.lastRun.id)}</span></div>
            <pre class="mono" style="margin:0;padding:12px;border-radius:var(--r);background:var(--sunken);border:1px solid var(--border);font-size:12px;overflow:auto;white-space:pre-wrap">${esc(st.lastRun.output)}</pre>`
          : uiEmptyState({
              icon: 'play',
              title: 'No run yet',
              description: 'Run the evaluation to see output, tokens and latency for this prompt.',
              size: 'sm',
            }),
      })}`
    : '';
  return gate({
    loadingVariant: 'split',
    renderDefault: () =>
      uiSplitPane({
        leftHeaderHtml: `<div style="padding:18px var(--gutter) 0" class="row"><h1 style="font-size:var(--fs-xl);margin:0;font-weight:600;letter-spacing:-.015em">Prompt studio</h1><span class="sp"></span>
          <span class="faint" style="font-size:12px">${st.prompts.length}</span></div>
          <div style="padding:10px var(--gutter) 10px">${searchBox('st', 'Search prompts', qOf(st))}</div>`,
        leftListHtml: left || uiEmptyState({ icon: 'sparkles', title: 'No prompts', description: 'Create a prompt to start evaluating.', size: 'sm' }),
        rightHtml: right,
        hasSelection: !!p,
        listKeepKey: 'st-prompts',
        leftWidth: '360px',
      }),
  });
}

export function pageStDocs() {
  const st = studio();
  const d = st.docs.find(x => x.id === st.selDoc) || st.docs[0];
  const left = st.docs
    .map(
      x => `<div class="row" style="align-items:flex-start;gap:10px;padding:11px var(--gutter);border-bottom:1px solid var(--divider);cursor:pointer;${
        d && x.id === d.id ? 'background:var(--surface-2);' : ''
      }" data-a="stSelectDoc" data-id="${x.id}" role="button" tabindex="0">
      <span class="picon" style="--c:var(--orange)">${ic('book-open', 14)}</span>
      <div class="grow" style="min-width:0"><div class="trunc" style="font-weight:500;font-size:13px">${esc(x.title)}</div><div class="trunc faint" style="font-size:11.5px">${x.words} words · ${ago(
        x.updated,
      )}</div></div></div>`,
    )
    .join('');
  const body = d
    ? `<div style="padding:18px var(--gutter) 28px;max-width:820px">
      <div class="row" style="gap:8px;flex-wrap:wrap"><h2 style="font-size:var(--fs-xl);margin:0;font-weight:600;letter-spacing:-.015em">${esc(d.title)}</h2><span class="sp"></span>
        ${d.tags.map(t => uiBadge({ label: t })).join('')}${uiButton({ label: 'Saved', icon: 'circle-check', size: 'sm', variant: 'secondary', action: 'stSaveDoc' })}</div>
      <div class="dsec" style="margin-top:14px"><div class="dsec-h"><h3>Body</h3><div class="rte-tb" role="toolbar" aria-label="Formatting">${[
        ['bold', 'bold', 'Bold'],
        ['italic', 'italic', 'Italic'],
        ['insertUnorderedList', 'list', 'Bulleted list'],
        ['formatBlock:h4', 'heading', 'Heading'],
        ['createLink', 'link', 'Link'],
      ]
        .map(([c, i, n]) => `<button class="ibtn ibtn-xs" data-cmd="${c}" data-tip="${n}" aria-label="${n}">${ic(i, 13)}</button>`)
        .join('')}</div></div>
        <div class="rte"><div class="rte-body" id="st-doc" contenteditable="true" data-rte="st-doc" data-ph="Write the document…" role="textbox" aria-multiline="true" aria-label="Document body">${d.body
          .split('\n\n')
          .map(par => (par.startsWith('## ') ? `<h4>${esc(par.slice(3))}</h4>` : `<p>${esc(par)}</p>`))
          .join('')}</div></div>
      </div>
      ${uiPanel({
        title: 'Document details',
        icon: 'info',
        bodyHtml: uiKeyValueGrid({
          items: [
            { icon: 'file-text', label: 'Words', value: String(d.words) },
            { icon: 'clock', label: 'Updated', value: ago(d.updated) },
            { icon: 'tag', label: 'Tags', html: d.tags.map(t => uiBadge({ label: t })).join(' ') },
            { icon: 'sparkles', label: 'Indexed', html: uiBadge({ label: 'In retrieval corpus', tone: 'green', dot: true }) },
          ],
        }),
      })}`
    : '';
  return gate({
    loadingVariant: 'split',
    renderDefault: () =>
      uiSplitPane({
        leftHeaderHtml: `<div style="padding:18px var(--gutter) 0" class="row"><h1 style="font-size:var(--fs-xl);margin:0;font-weight:600;letter-spacing:-.015em">Knowledge docs</h1><span class="sp"></span>
          <span class="faint" style="font-size:12px">${st.docs.length}</span></div><div style="padding:10px 0 10px"></div>`,
        leftListHtml: left,
        rightHtml: body,
        hasSelection: !!d,
        listKeepKey: 'st-docs',
        leftWidth: '340px',
      }),
  });
}

export function pageStRuns() {
  const st = studio();
  const rows = filterAndSort(st.runs, { q: qOf(st), searchKeys: ['prompt', 'model', 'version'], sort: sortOf('st-runs') });
  const avg = Math.round(st.runs.reduce((s, r) => s + r.latency, 0) / st.runs.length);
  const score = (st.runs.reduce((s, r) => s + r.score, 0) / st.runs.length).toFixed(1);
  return `<div class="page wide">${stHead('Eval & run logs', 'Every run keeps its prompt version, model, cost and score.', 'st-runs')}
  ${gate({
    loadingVariant: 'table',
    emptyOpts: { icon: 'terminal', title: 'No runs recorded', description: 'Run a prompt from the studio to create the first trace.' },
    renderDefault: () => `
    ${uiStatStrip({
      items: [
        { label: 'Runs', value: String(st.runs.length), delta: 'this week', icon: 'terminal' },
        { label: 'Average score', value: score, delta: 'golden set', deltaTone: 'up', icon: 'gauge' },
        { label: 'Average latency', value: `${avg}ms`, delta: 'p50 across models', icon: 'timer' },
        {
          label: 'Regressions',
          value: String(st.runs.filter(r => r.score < 85).length),
          delta: 'below the 85 threshold',
          deltaTone: 'bad',
          icon: 'triangle-alert',
        },
      ],
    })}
    <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('st', 'Search runs or models', qOf(st))}<span class="sp"></span><span class="faint" style="font-size:12px">${rows.length} traces</span></div>
    ${uiPanel({
      flush: true,
      style: 'overflow:hidden',
      bodyHtml: uiDataTable({
        key: 'st-runs',
        sort: sortOf('st-runs'),
        rows,
        rowAction: 'openInspector',
        columns: [
          { f: 'id', label: 'Run', w: '112px', render: r => `<span class="mono" style="font-size:11.5px">${esc(r.id)}</span>` },
          {
            f: 'prompt',
            label: 'Prompt',
            render: r => `<span class="trunc">${esc(r.prompt)} <span class="faint mono" style="font-size:10.5px">${esc(r.version)}</span></span>`,
          },
          { f: 'model', label: 'Model', w: '160px', render: r => uiBadge({ label: r.model }) },
          { f: 'tokens', label: 'Tokens', w: '90px', align: 'num', render: r => `<span class="num">${r.tokens}</span>` },
          { f: 'latency', label: 'Latency', w: '100px', align: 'num', render: r => `<span class="num">${r.latency}ms</span>` },
          { f: 'score', label: 'Score', w: '84px', align: 'num', render: r => scoreBadge(r.score) },
          { f: 'at', label: 'When', w: '100px', render: r => `<span class="faint">${ago(r.at)}</span>` },
        ],
      }),
    })}`,
  })}
  </div>`;
}

/* =====================================================================
   5 · COMMERCE & ORDER ADMIN
   ===================================================================== */
const cm = () => S.tpl.commerce;
const cmHead = (title, sub, active, actions = '') => head(title, sub, actions, CM_ROUTES, active);

export function pageCmOrders() {
  const c = cm();
  const rows = filterAndSort(
    c.orders.filter(o => c.tab === 'all' || o.status === c.tab),
    { q: qOf(c), searchKeys: ['id', 'customer', 'email'], sort: sortOf('cm-orders') },
  );
  const rev = c.orders.filter(o => o.status !== 'refunded').reduce((s, o) => s + o.total, 0);
  return `<div class="page wide">${cmHead('Orders', 'Fulfillment queue, refunds and channel mix in one ledger.', 'cm-orders')}
  ${gate({
    loadingVariant: 'table',
    emptyOpts: { icon: 'shopping-bag', title: 'No orders in this queue', description: 'Switch the status tabs back to all orders.' },
    renderDefault: () => `
    ${uiStatStrip({
      items: [
        { label: 'Gross revenue', value: usd(rev), delta: '+6.8% vs last week', deltaTone: 'up', icon: 'trending-up' },
        {
          label: 'Unfulfilled',
          value: String(c.orders.filter(o => o.status === 'unfulfilled').length),
          delta: 'waiting to ship',
          deltaTone: 'bad',
          icon: 'package',
        },
        {
          label: 'Fulfilled',
          value: String(c.orders.filter(o => o.status === 'fulfilled').length),
          delta: 'in transit or delivered',
          deltaTone: 'up',
          icon: 'truck',
        },
        {
          label: 'Refunded',
          value: usd(c.orders.filter(o => o.status === 'refunded').reduce((s, o) => s + o.total, 0)),
          delta: '1 return this week',
          icon: 'rotate-ccw',
        },
      ],
    })}
    <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('cm', 'Search orders or customers', qOf(c))}
      ${uiSegmented({
        items: [
          ['all', 'All'],
          ['unfulfilled', 'Unfulfilled'],
          ['fulfilled', 'Fulfilled'],
          ['refunded', 'Refunded'],
        ],
        active: c.tab,
        action: 'cmSetTab',
        label: 'Order status',
      })}<span class="sp"></span>${uiButton({ label: 'Export', icon: 'download', size: 'sm', variant: 'ghost', action: 'demoToast', value: 'ok' })}</div>
    ${uiPanel({
      flush: true,
      style: 'overflow:hidden',
      bodyHtml: uiDataTable({
        key: 'cm-orders',
        sort: sortOf('cm-orders'),
        rows,
        rowAction: 'openInspector',
        columns: [
          { f: 'id', label: 'Order', w: '112px', render: r => `<span class="mono" style="font-size:11.5px">${esc(r.id)}</span>` },
          {
            f: 'customer',
            label: 'Customer',
            render: r =>
              `<span class="row" style="gap:8px">${uiAvatar({ name: r.customer, color: 'var(--green)', size: 'sm', tip: false })}<span class="trunc" style="font-weight:500">${esc(r.customer)}</span></span>`,
          },
          { f: 'channel', label: 'Channel', w: '110px', render: r => uiBadge({ label: r.channel }) },
          { f: 'items', label: 'Items', w: '76px', align: 'num', render: r => `<span class="num">${r.items.reduce((s, i) => s + i.qty, 0)}</span>` },
          { f: 'total', label: 'Total', w: '110px', align: 'num', render: r => `<span class="num">${usd(r.total)}</span>` },
          { f: 'status', label: 'Status', w: '124px', render: r => uiBadge({ label: cap(r.status), tone: statusTone[r.status], dot: true }) },
          { f: 'placed', label: 'Placed', w: '100px', render: r => `<span class="faint">${ago(r.placed)}</span>` },
        ],
      }),
    })}`,
  })}
  </div>`;
}

export function pageCmProducts() {
  const c = cm();
  const rows = filterAndSort(c.products, { q: qOf(c), searchKeys: ['sku', 'name', 'category'], sort: sortOf('cm-products') });
  const low = c.products.filter(p => p.stock <= p.reorder).length;
  const table = uiDataTable({
    key: 'cm-products',
    sort: sortOf('cm-products'),
    rows,
    rowAction: 'openInspector',
    columns: [
      { f: 'sku', label: 'SKU', w: '96px', render: r => `<span class="mono" style="font-size:11.5px">${esc(r.sku)}</span>` },
      { f: 'name', label: 'Product', render: r => `<span class="trunc" style="font-weight:500">${esc(r.name)}</span>` },
      { f: 'category', label: 'Category', w: '120px', render: r => uiBadge({ label: r.category }) },
      { f: 'price', label: 'Price', w: '96px', align: 'num', render: r => `<span class="num">${usd(r.price)}</span>` },
      { f: 'cost', label: 'Cost', w: '96px', align: 'num', render: r => `<span class="num faint">${usd(r.cost)}</span>` },
      { f: 'margin', label: 'Margin', w: '90px', align: 'num', render: r => `<span class="num">${Math.round(((r.price - r.cost) / r.price) * 100)}%</span>` },
      {
        f: 'stock',
        label: 'Stock',
        w: '140px',
        render: r =>
          `<span class="row" style="gap:8px">${uiProgressBar({ value: Math.min(100, (r.stock / (r.reorder * 4)) * 100), tone: r.stock === 0 ? 'red' : r.stock <= r.reorder ? 'amber' : 'green' })}<span class="num faint" style="width:26px;text-align:right">${r.stock}</span></span>`,
      },
      { f: 'sold', label: 'Sold', w: '76px', align: 'num', render: r => `<span class="num">${r.sold}</span>` },
      {
        f: 'restock',
        label: '',
        w: '104px',
        sortable: false,
        render: r => uiButton({ label: 'Restock', icon: 'plus', variant: 'ghost', size: 'sm', action: 'cmRestock', attrs: `data-id="${r.id}"` }),
      },
    ],
  });
  const grid = `<div class="pgrid" style="padding:14px var(--gutter)">${rows
    .map(
      p =>
        `<div class="pcard" data-a="openInspector" data-app="commerce" data-type="sku" data-id="${p.id}" role="button" tabindex="0">
      <div class="row"><span class="picon" style="--c:var(--green)">${ic('package', 15)}</span><div class="grow" style="min-width:0"><b class="trunc" style="font-weight:600;font-size:13.5px;display:block">${esc(p.name)}</b><span class="faint mono" style="font-size:11px">${esc(
        p.sku,
      )}</span></div>${uiBadge({ label: p.category })}</div>
      <div class="row" style="gap:8px"><b class="num" style="font-size:15px">${usd(p.price)}</b><span class="faint" style="font-size:11.5px">cost ${usd(p.cost)}</span><span class="sp"></span><span class="num faint" style="font-size:11.5px">${Math.round(
        ((p.price - p.cost) / p.price) * 100,
      )}% margin</span></div>
      <div class="row" style="gap:8px">${uiProgressBar({ value: Math.min(100, (p.stock / (p.reorder * 4)) * 100), tone: p.stock === 0 ? 'red' : p.stock <= p.reorder ? 'amber' : 'green' })}<span class="num faint" style="width:28px;text-align:right">${p.stock}</span></div>
      <div class="foot">${p.stock === 0 ? uiBadge({ label: 'Out of stock', tone: 'red', dot: true }) : p.stock <= p.reorder ? uiBadge({ label: 'Low stock', tone: 'amber', dot: true }) : uiBadge({ label: 'In stock', tone: 'green', dot: true })}
        <span class="sp"></span><button class="btn btn-sm btn-ghost" data-a="cmRestock" data-id="${p.id}">${ic('plus', 13)}Restock 50</button></div>
    </div>`,
    )
    .join('')}</div>`;
  return `<div class="page wide">${cmHead(
    'Products & SKUs',
    'Inventory, margin and reorder points for every SKU.',
    'cm-products',
    `${uiSegmented({
      items: [
        ['table', 'Table', 'table-2'],
        ['grid', 'Grid', 'layout-grid'],
      ],
      active: c.viewMode,
      action: 'cmSetView',
      label: 'View mode',
    })}`,
  )}
  ${gate({
    loadingVariant: c.viewMode === 'grid' ? 'cards' : 'table',
    emptyOpts: { icon: 'package', title: 'No SKUs match', description: 'Clear the search to see the whole catalog.' },
    renderDefault: () => `
    ${uiStatStrip({
      items: [
        { label: 'SKUs', value: String(c.products.length), delta: 'across 4 categories', icon: 'package' },
        { label: 'Inventory value', value: usd(c.products.reduce((s, p) => s + p.cost * p.stock, 0)), delta: 'at cost', icon: 'warehouse' },
        { label: 'Below reorder point', value: String(low), delta: 'needs a purchase order', deltaTone: low ? 'bad' : '', icon: 'triangle-alert' },
        { label: 'Units sold', value: String(c.products.reduce((s, p) => s + p.sold, 0)), delta: 'last 90 days', deltaTone: 'up', icon: 'trending-up' },
      ],
    })}
    <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('cm', 'Search SKUs', qOf(c))}<span class="sp"></span><span class="faint" style="font-size:12px">${rows.length} products</span></div>
    ${uiPanel({ flush: true, style: 'overflow:hidden', bodyHtml: c.viewMode === 'grid' ? grid : table })}`,
  })}
  </div>`;
}

export function pageCmCustomers() {
  const c = cm();
  const rows = filterAndSort(c.customers, { q: qOf(c), searchKeys: ['name', 'email'], sort: sortOf('cm-customers') });
  return `<div class="page wide">${cmHead('Customers', 'Lifetime value, order count and segment for every account.', 'cm-customers')}
  ${gate({
    loadingVariant: 'table',
    emptyOpts: { icon: 'users', title: 'No customers match', description: 'Clear the search to see every account.' },
    renderDefault: () => `
    ${uiStatStrip({
      items: [
        { label: 'Customers', value: String(c.customers.length), delta: 'buying accounts', icon: 'users' },
        { label: 'Lifetime value', value: usd(c.customers.reduce((s, x) => s + x.ltv, 0)), delta: 'all time', deltaTone: 'up', icon: 'gem' },
        {
          label: 'Repeat rate',
          value: `${Math.round((c.customers.filter(x => x.orders > 1).length / c.customers.length) * 100)}%`,
          delta: 'more than one order',
          icon: 'repeat',
        },
        {
          label: 'Average order',
          value: usd(c.customers.reduce((s, x) => s + x.ltv / x.orders, 0) / c.customers.length),
          delta: 'across segments',
          icon: 'receipt',
        },
      ],
    })}
    <div class="row" style="margin:16px 0 10px;gap:8px;flex-wrap:wrap">${searchBox('cm', 'Search customers', qOf(c))}<span class="sp"></span><span class="faint" style="font-size:12px">${rows.length} accounts</span></div>
    ${uiPanel({
      flush: true,
      style: 'overflow:hidden',
      bodyHtml: uiDataTable({
        key: 'cm-customers',
        sort: sortOf('cm-customers'),
        rows,
        rowAction: 'openInspector',
        columns: [
          {
            f: 'name',
            label: 'Customer',
            render: r =>
              `<span class="row" style="gap:8px">${uiAvatar({ name: r.name, color: 'var(--green)', size: 'sm', tip: false })}<span class="trunc" style="font-weight:500">${esc(r.name)}</span></span>`,
          },
          { f: 'email', label: 'Email', render: r => `<span class="trunc faint">${esc(r.email)}</span>` },
          { f: 'segment', label: 'Segment', w: '124px', render: r => uiBadge({ label: r.segment, tone: r.segment === 'Enterprise' ? 'accent' : '' }) },
          { f: 'orders', label: 'Orders', w: '84px', align: 'num', render: r => `<span class="num">${r.orders}</span>` },
          { f: 'ltv', label: 'Lifetime value', w: '130px', align: 'num', render: r => `<span class="num">${usd(r.ltv)}</span>` },
          { f: 'last', label: 'Last order', w: '110px', render: r => `<span class="faint">${ago(r.last)}</span>` },
        ],
      }),
    })}`,
  })}
  </div>`;
}

/* =====================================================================
   6 · AUTH, ONBOARDING & SETTINGS FLOWS
   ===================================================================== */
const FLOWS = [
  ['login', 'Log in', 'Email and password with social providers and a remembered-session toggle.', 'log-in'],
  ['signup', 'Create account', 'Name, work email and a live password strength meter.', 'user-plus'],
  ['forgot', 'Forgot password', 'Request a reset link with inline validation.', 'key-round'],
  ['forgot-sent', 'Check your email', 'Confirmation screen with the resend path and expiry note.', 'mail-check'],
  ['reset', 'Set new password', 'Token-based reset with a strength meter and confirmation.', 'lock'],
  ['reset-done', 'Password updated', 'Success screen that routes straight back to sign in.', 'circle-check'],
  ['verify', 'Verify email', 'Six-digit code entry with a resend timer.', 'shield-check'],
  ['onboarding', 'Onboarding wizard', 'Six steps: workspace, project, template, team size and invites.', 'sparkles'],
];
const SET_FLOWS = [
  ['workspace', 'Workspace', 'Name, URL and brand colour.', 'building-2'],
  ['appearance', 'Appearance', 'Theme, accent, density and motion.', 'palette'],
  ['notif-email', 'Email notifications', 'Per-event email delivery.', 'mail'],
  ['profile', 'Profile', 'Name, title and avatar.', 'user'],
  ['password', 'Password', 'Change password with strength feedback.', 'key-round'],
  ['plan', 'Plan & billing', 'Compare plans, upgrade or downgrade.', 'gem'],
];

export function pageFlHub() {
  const card = (label, desc, act, icon, value) => `<div class="pcard" data-a="${act}" data-v="${value}" role="button" tabindex="0">
    <div class="row"><span class="picon" style="--c:var(--rose)">${ic(icon, 15)}</span><b class="grow trunc" style="font-weight:600;font-size:13.5px">${esc(label)}</b>${ic('arrow-up-right', 14)}</div>
    <div class="desc">${esc(desc)}</div></div>`;
  return `<div class="page wide">${head(
    'Flows & auth hub',
    'Every authentication screen, the onboarding wizard and all six settings sections — one click each.',
    `<button class="btn btn-secondary btn-sm" data-a="startOnboarding">${ic('sparkles', 14)}Replay onboarding</button>`,
  )}
  ${gate({
    loadingVariant: 'cards',
    emptyOpts: { icon: 'shield-check', title: 'No flows available', description: 'The flow catalog could not be listed.' },
    renderDefault: () => `
    <h2 class="sec" style="margin:0 0 10px">Authentication & onboarding</h2>
    <div class="pgrid">${FLOWS.map(([v, n, d, i]) => card(n, d, 'auth', i, v)).join('')}</div>
    <h2 class="sec" style="margin:24px 0 10px">Settings sections</h2>
    <div class="pgrid">${SET_FLOWS.map(
      ([sec, n, d, i]) => `<div class="pcard" data-a="go" data-r="settings" data-sec="${sec}" role="button" tabindex="0">
      <div class="row"><span class="picon" style="--c:var(--rose)">${ic(i, 15)}</span><b class="grow trunc" style="font-weight:600;font-size:13.5px">${esc(n)}</b>${ic('arrow-up-right', 14)}</div>
      <div class="desc">${esc(d)}</div><div class="foot"><span class="mono faint" style="font-size:11px">settings/${esc(sec)}</span></div></div>`,
    ).join('')}</div>
    <div style="margin-top:18px">${uiAlert({
      tone: 'info',
      title: 'Why this template exists.',
      message:
        'Flows and settings are the highest-risk screens in any product: they need explicit validation, honest empty states and a way back out. This one reuses the same inputs, alerts and states as every other template.',
      actionHtml: uiButton({ label: 'Open design system', icon: 'component', size: 'sm', action: 'go', attrs: 'data-r="system"' }),
    })}</div>`,
  })}
  </div>`;
}
