/* =====================================================================
   OVERLAYS: drawer, modals, popovers, context menus, command palette
   ===================================================================== */
import { MOD, TODAY, ago, diffD, esc, fmtDate, parse, relDate } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { D, S, commentsOf, isOver, mem, pColor, proj, task } from '../core/store.js';
import { FT, av, filePrev, fileType, fmtComment, lbl, progBar } from '../ui/helpers.js';
import { fxc } from '../shell/render.js';
import { cellAssignee, cellDue, cellPrio, cellProject, cellStatus } from '../components/task-list.js';
import { modalHtml } from './modals.js';
import { popHtml } from './popovers.js';
import { paletteHtml } from './palette.js';
import { subtaskHtml } from '../features/subtasks.js';
import { ARCHETYPES, DEAL_STAGES } from '../data/templates-seed.js';
import { uiAlert, uiBadge, uiButton, uiKeyValueGrid, uiStatusPill } from '../ui/kit.js';

export function renderLayer() {
  const u = S.ui;
  let h = '';
  if (u.drawer && task(u.drawer))
    h += (u.drawerFull ? `<div class="drawer-scrim full${u.fx.drawer ? ' enter' : ''}" data-a="closeDrawer"></div>` : '') + drawerHtml(task(u.drawer));
  if (u.inspector && !u.drawer) h += inspectorHtml(u.inspector);
  u.modals.forEach((m, i) => {
    const en = u.fx.modal === i + 1;
    h += `<div class="scrim${en ? ' enter' : ''}" data-a="closeModal" style="z-index:${60 + i * 2}"></div><div class="modal-wrap" data-a="closeModalBg" style="z-index:${61 + i * 2}">${en ? modalHtml(m).replace('class="modal ', 'class="modal enter ') : modalHtml(m)}</div>`;
  });
  if (u.palette) h += `<div class="scrim" data-a="closePalette" style="z-index:89"></div>${paletteHtml()}`;
  if (u.pop) h += popHtml(u.pop);
  return h;
}

/* ---------------- TASK DRAWER ---------------- */
export function drawerHtml(t) {
  const p = proj(t.project);
  const u = S.ui;
  const cs = commentsOf(t.id);
  const sd = t.subtasks.filter(s => s.done).length;
  const acts = D().activity.filter(a => a.task === t.id);
  const tab = u.drawerTab;
  const prop = (icon, label, val) => `<dt>${ic(icon, 14)}${label}</dt><dd>${val}</dd>`;
  const ups = (u.uploads || []).filter(x => x.task === t.id);
  const ment =
    u.mention && u.mention.tid === t.id
      ? D()
          .members.filter(
            m => m.name.toLowerCase().startsWith(u.mention.q.toLowerCase()) || m.name.split(' ')[1]?.toLowerCase().startsWith(u.mention.q.toLowerCase()),
          )
          .slice(0, 5)
      : [];
  const sub = u.subOpen && u.subOpen.tid === t.id ? t.subtasks.find(s => s.id === u.subOpen.sid) : null;
  return `<aside class="drawer ${u.drawerFull ? 'full' : ''} ${u.fx.drawer ? 'enter' : ''} ${u.fx.tabs ? 'fx-tabs' : ''}" role="dialog" aria-modal="${u.drawerFull}" aria-labelledby="d-h" tabindex="-1">
    <h2 class="sr" id="d-h">${sub ? 'Subtask: ' + esc(sub.title) : 'Task: ' + esc(t.title)}</h2>
    <div class="drawer-h">
      <button class="pillbtn" data-a="go" data-r="project" data-id="${p.id}" data-tab="board" style="font-size:12.5px"><span class="pdot" style="--c:${pColor(p)}"></span>${esc(p.name)}</button><span class="faint">/</span><span class="mono faint" style="font-size:11.5px;padding:0 6px">${t.key}</span>
      <span class="sp"></span>
      <button class="btn btn-sm ${t.status === 'done' ? 'btn-secondary' : 'btn-ghost'}" data-a="toggleDone" data-id="${t.id}" style="${t.status === 'done' ? 'color:var(--green)' : ''}">${ic(t.status === 'done' ? 'circle-check' : 'circle', 14)}<span class="hide-m">${t.status === 'done' ? 'Completed' : 'Mark complete'}</span></button>
      <button class="ibtn ibtn-sm" data-a="toggleFavTask" data-id="${t.id}" data-tip="${t.fav ? 'Unfavorite' : 'Favorite'}" aria-pressed="${t.fav}" aria-label="Favorite" style="${t.fav ? 'color:var(--amber)' : ''}">${ic('star', 15)}</button>
      <button class="ibtn ibtn-sm" data-a="copyLink" data-id="${t.id}" data-tip="Copy link" aria-label="Copy link">${ic('link', 15)}</button>
      <button class="ibtn ibtn-sm hide-m" data-a="toggleDrawerFull" data-tip="${u.drawerFull ? 'Side panel' : 'Full page'}" aria-label="Toggle full page">${ic(u.drawerFull ? 'minimize-2' : 'maximize-2', 15)}</button>
      <button class="ibtn ibtn-sm" data-a="ctxBtn" data-ctx="task" data-id="${t.id}" aria-label="More">${ic('ellipsis', 15)}</button>
      <button class="ibtn ibtn-sm" data-a="closeDrawer" data-tip="Close  Esc" aria-label="Close">${ic('x', 16)}</button>
    </div>
    <div class="drawer-b" data-keep="drawer:${t.id}${sub ? ':' + sub.id : ''}">${
      sub
        ? subtaskHtml(t, sub)
        : `
      ${t.status === 'done' ? `<div class="alert ok" style="margin-bottom:12px">${ic('circle-check', 15)}<span>Completed ${t.completedAt ? ago(t.completedAt) : ''}. <button class="link" data-a="toggleDone" data-id="${t.id}">Reopen task</button></span></div>` : isOver(t) ? `<div class="alert danger" style="margin-bottom:12px">${ic('clock-alert', 15)}<span>Overdue by ${-diffD(parse(t.due), TODAY)} day${-diffD(parse(t.due), TODAY) > 1 ? 's' : ''}. <button class="link" data-a="pop" data-pop="date" data-field="due" data-id="${t.id}">Reschedule</button></span></div>` : ''}
      <textarea class="ttl-edit" id="d-title" rows="1" data-autosize data-blur="commitDrawerTitle" data-key-enter="blur" data-id="${t.id}" aria-label="Task title">${esc(t.title)}</textarea>
      <dl class="kv" style="margin-top:12px;${u.drawerFull ? 'grid-template-columns:112px minmax(0,1fr) 112px minmax(0,1fr)' : ''}">
        ${prop('circle-dot', 'Status', cellStatus(t))}
        ${prop('signal-high', 'Priority', cellPrio(t))}
        ${prop('user', 'Assignee', cellAssignee(t))}
        ${prop('calendar', 'Due date', cellDue(t))}
        ${prop('calendar-arrow-up', 'Start date', `<button class="pillbtn ${t.start ? '' : 'empty'}" data-a="pop" data-pop="date" data-field="start" data-id="${t.id}">${ic('calendar', 13)}${t.start ? fmtDate(t.start) : 'Set date'}</button>`)}
        ${prop('folder', 'Project', cellProject(t))}
        ${prop('tag', 'Labels', `<button class="pillbtn ${t.labels.length ? '' : 'empty'}" data-a="pop" data-pop="labels" data-id="${t.id}" style="flex-wrap:wrap;height:auto;min-height:26px;padding:3px 7px">${t.labels.length ? t.labels.map(lbl).join('') : ic('tag', 13) + 'Add labels'}</button>`)}
        ${prop('repeat', 'Repeat', `<button class="pillbtn ${t.recur ? '' : 'empty'}" data-a="pop" data-pop="recur" data-id="${t.id}">${ic('repeat', 13)}${t.recur || 'Does not repeat'}</button>`)}
        ${prop('timer', 'Estimate', `<button class="pillbtn ${t.estimate ? '' : 'empty'}" data-a="pop" data-pop="estimate" data-id="${t.id}">${ic('timer', 13)}${t.estimate ? esc(t.estimate) : 'Add estimate'}</button>`)}
        ${prop('git-branch', 'Blocked by', `<button class="pillbtn ${t.deps.length ? '' : 'empty'}" data-a="pop" data-pop="deps" data-id="${t.id}" style="height:auto;min-height:26px;flex-wrap:wrap">${t.deps.length ? t.deps.map(d => (task(d) ? `<span class="depchip mono" style="font-size:11px;padding:1px 5px;border-radius:4px;background:var(--surface-3)">${task(d).key}</span><span class="trunc" style="max-width:160px">${esc(task(d).title)}</span>` : '')).join('') : ic('git-branch', 13) + 'None'}</button>`)}
      </dl>

      <div class="dsec"><div class="dsec-h"><h3 id="d-desc-l">Description</h3><div class="rte-tb" role="toolbar" aria-label="Formatting" aria-controls="d-desc">
          ${[
            ['bold', 'bold', 'Bold'],
            ['italic', 'italic', 'Italic'],
            ['insertUnorderedList', 'list', 'Bulleted list'],
            ['insertOrderedList', 'list-ordered', 'Numbered list'],
            ['formatBlock:h4', 'heading', 'Heading'],
            ['createLink', 'link', 'Link'],
          ]
            .map(([c, i, n]) => `<button class="ibtn ibtn-xs" data-cmd="${c}" data-tip="${n}" aria-label="${n}">${ic(i, 13)}</button>`)
            .join('')}
        </div></div>
        <div class="rte"><div class="rte-body" id="d-desc" contenteditable="true" data-rte="${t.id}" data-ph="Add a description…" role="textbox" aria-multiline="true" aria-labelledby="d-desc-l">${t.desc}</div></div>
      </div>

      <div class="dsec"><div class="dsec-h"><h3>Subtasks</h3><span class="cnt num">${sd}/${t.subtasks.length}</span>${t.subtasks.length ? `<span style="width:90px;display:flex">${progBar(Math.round((sd / t.subtasks.length) * 100), sd === t.subtasks.length ? 'green' : '')}</span>` : ''}</div>
        ${t.subtasks.map(s => `<div class="subt ${s.done ? 'done' : ''}${fxc('added', s.id)}${fxc('done', s.id)}"><input type="checkbox" class="check" ${s.done ? 'checked' : ''} data-a="toggleSub" data-id="${t.id}" data-sid="${s.id}" aria-label="${s.done ? 'Reopen' : 'Complete'} subtask ${esc(s.title)}"><button class="s" data-a="openSub" data-id="${t.id}" data-sid="${s.id}">${esc(s.title)}</button>${s.due ? `<span class="due ${!s.done && diffD(parse(s.due), TODAY) < 0 ? 'over' : ''}">${ic('calendar', 12)}${relDate(s.due)}</span>` : ''}${s.assignee ? av(s.assignee, 'sm') : ''}<button class="ibtn ibtn-xs x" data-a="openSub" data-id="${t.id}" data-sid="${s.id}" aria-label="Open subtask details" tabindex="-1">${ic('chevron-right', 14)}</button></div>`).join('')}
        <div class="subt" style="color:var(--text-3)">${ic('plus', 15)}<input class="inline-in" id="d-sub" data-key-enter="addSub" data-id="${t.id}" placeholder="Add subtask" aria-label="Add subtask" style="font-size:13.5px"></div>
      </div>

      <div class="dsec"><div class="dsec-h"><h3>Attachments</h3><span class="cnt">${t.attachments.length}</span><div class="acts"><label class="btn btn-sm btn-ghost" style="cursor:pointer">${ic('upload', 13)}Upload<input type="file" multiple hidden data-in="uploadFiles" data-task="${t.id}" data-project="${t.project}"></label></div></div>
        ${ups.map(x => `<div class="upl" style="margin-bottom:6px"><span class="ftype" style="--c:${FT[fileType(x.name)].c}">${ic(FT[fileType(x.name)].i, 14)}</span><div class="grow"><div class="row"><span class="trunc">${esc(x.name)}</span><span class="sp"></span><span class="faint num" id="upct-${x.id}" style="font-size:11px">${x.pct}%</span></div><div class="prog" style="margin-top:5px"><i id="upbar-${x.id}" style="width:${x.pct}%"></i></div></div></div>`).join('')}
        ${t.attachments.length ? `<div class="att">${t.attachments.map(f => `<div class="attc" data-a="filePreview" data-tid="${t.id}" data-aid="${f.id}" role="button" tabindex="0">${filePrev(f)}<div class="fi"><div class="trunc" style="font-weight:500">${esc(f.name)}</div><div class="faint">${FT[f.type]?.n || 'File'} · ${f.size}</div></div><button class="ibtn ibtn-xs x" data-a="rmAttach" data-id="${t.id}" data-aid="${f.id}" aria-label="Remove attachment">${ic('x', 12)}</button></div>`).join('')}</div>` : !ups.length ? `<label class="dropzone" style="padding:12px" data-dropzone-task="${t.id}">${ic('paperclip', 15)}<span>Drop files or click to attach</span><input type="file" multiple hidden data-in="uploadFiles" data-task="${t.id}" data-project="${t.project}"></label>` : ''}
      </div>

      <div class="dsec">
        <div class="tabs" style="margin-bottom:6px">${[
          ['comments', `Comments`, cs.length],
          ['activity', 'Activity', acts.length],
        ]
          .map(
            ([k, n, c]) =>
              `<button class="tab ${tab === k ? 'on' : ''}" data-a="set" data-k="drawerTab" data-v="${k}">${n}<span class="cnt">${c}</span></button>`,
          )
          .join('')}</div>
        ${
          tab === 'comments'
            ? `
          ${cs.length ? cs.map(commentHtml).join('') : `<p class="faint" style="font-size:13px;margin:10px 0">No comments yet. Start the conversation.</p>`}
          <div class="row" style="align-items:flex-start;gap:10px;margin-top:8px">${av(D().me, 'md', false)}<div class="grow" style="position:relative">
            <div class="cbox"><textarea id="d-cmt" data-in="draft" data-id="${t.id}" data-key-mod-enter="postComment" placeholder="Leave a comment… type @ to mention" aria-label="Comment" rows="2" data-autosize>${esc(u.drafts[t.id] || '')}</textarea>
            <div class="row"><button class="ibtn ibtn-xs" data-a="insertAt" data-id="${t.id}" data-tip="Mention someone" aria-label="Mention">${ic('at-sign', 14)}</button><label class="ibtn ibtn-xs" data-tip="Attach file" style="cursor:pointer">${ic('paperclip', 14)}<input type="file" multiple hidden data-in="uploadFiles" data-task="${t.id}" data-project="${t.project}"></label><span class="sp"></span><span class="faint hide-m" style="font-size:11px">${MOD}+Enter</span><button class="btn btn-primary btn-sm" data-a="postComment" data-id="${t.id}">Comment</button></div></div>
            ${ment.length ? `<div class="pop" style="position:absolute;top:auto;bottom:calc(100% + 4px);left:0">${ment.map(m => `<button class="mi" data-a="pickMention" data-id="${t.id}" data-name="${esc(m.name)}">${av(m.id, 'sm', false)}${esc(m.name)}<span class="r">${esc(m.title)}</span></button>`).join('')}</div>` : ''}
          </div></div>`
            : `
          <div style="padding-top:4px">${acts.map(a => `<div class="act-line"><span class="ico">${av(a.by, 'sm', false)}</span><span class="grow"><b>${esc(mem(a.by)?.id === D().me ? 'You' : mem(a.by)?.name)}</b> ${esc(a.verb.replace(/ of$/, ''))}${a.extra ? ' ' + esc(a.extra) : ''}</span><time class="faint" style="font-size:11.5px">${ago(a.at)}</time></div>`).join('')}
          <div class="act-line"><span class="ico">${ic('plus', 13)}</span><span class="grow">Task created</span><time class="faint" style="font-size:11.5px">${ago(t.created)}</time></div></div>`
        }
      </div>`
    }
    </div>
  </aside>`;
}
export function commentHtml(c) {
  const m = mem(c.by);
  const mine = c.by === D().me;
  return `<div class="cmt">${av(c.by, 'md', false)}<div class="body"><div class="who"><b>${esc(m?.name)}</b><time>${ago(c.at)}</time>${mine ? `<span class="sp"></span><button class="ibtn ibtn-xs" data-a="delComment" data-id="${c.id}" aria-label="Delete comment" data-tip="Delete">${ic('trash-2', 12)}</button>` : ''}</div><div class="txt">${fmtComment(c.text)}</div>
    <div class="reacts">${Object.entries(c.re || {})
      .filter(([, v]) => v.length)
      .map(
        ([e, v]) =>
          `<button class="react ${v.includes(D().me) ? 'mine' : ''}" data-a="react" data-id="${c.id}" data-e="${e}" aria-label="${e} ${v.length}" title="${v.map(i => mem(i)?.name).join(', ')}">${e}<span class="num">${v.length}</span></button>`,
      )
      .join(
        '',
      )}<button class="react" data-a="pop" data-pop="emoji" data-id="${c.id}" aria-label="Add reaction" style="color:var(--text-3)">${ic('smile-plus', 13)}</button></div></div></div>`;
}

/* ---------------- INSPECTOR: analytics, CRM, AI and commerce records ---------------- */
const money = n => '$' + Math.round(n).toLocaleString('en-US');

function inspInvoice(inv) {
  return `<div class="dsec"><div class="dsec-h"><h3>Invoice</h3><span class="cnt">${esc(inv.id)}</span></div>
    ${uiKeyValueGrid({
      twoCol: true,
      items: [
        { icon: 'building-2', label: 'Organisation', value: inv.org },
        { icon: 'credit-card', label: 'Plan', html: uiBadge({ label: inv.plan, tone: inv.plan === 'Enterprise' ? 'accent' : '' }) },
        { icon: 'receipt', label: 'Amount', value: money(inv.amount) },
        { icon: 'activity', label: 'MRR', value: money(inv.mrr) },
        { icon: 'users', label: 'Seats', value: String(inv.seats) },
        { icon: 'calendar', label: 'Issued', value: fmtDate(inv.date) },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Payment state</h3></div>
    ${uiAlert({
      tone: inv.status === 'paid' ? 'ok' : inv.status === 'open' ? 'warn' : 'danger',
      title: inv.status === 'paid' ? 'Collected' : inv.status === 'open' ? 'Awaiting payment' : 'Payment failed',
      message:
        inv.status === 'paid'
          ? 'Card charged successfully. Nothing to do.'
          : inv.status === 'open'
            ? 'The invoice is inside its net-30 window.'
            : 'Dunning started: three retries over nine days.',
      actionHtml: inv.status === 'paid' ? '' : uiButton({ label: 'Mark paid', icon: 'circle-check', size: 'sm', action: 'demoToast', value: 'ok' }),
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Seat utilisation</h3><span class="cnt num">${Math.round(inv.seats * 0.78)}/${inv.seats}</span></div>
    ${progBar(Math.round(78))}
  </div>`;
}

function inspUsage(rec) {
  return `<div class="dsec"><div class="dsec-h"><h3>Service</h3><span class="cnt">${esc(rec.service)}</span></div>
    ${uiKeyValueGrid({
      twoCol: true,
      items: [
        { icon: 'cpu', label: 'Service', value: rec.service },
        { icon: 'layers', label: 'Environment', html: uiBadge({ label: rec.env, tone: rec.env === 'production' ? 'accent' : '' }) },
        { icon: 'activity', label: 'Requests', value: rec.requests.toLocaleString('en-US') },
        { icon: 'coins', label: 'Unit cost', value: '$' + rec.unitCost.toFixed(7) },
        { icon: 'receipt', label: 'Spend', value: money(rec.spend) },
        { icon: 'trending-up', label: 'Trend', html: uiBadge({ label: `${rec.trend > 0 ? '+' : ''}${rec.trend}%`, tone: rec.trend > 0 ? 'red' : 'green' }) },
      ],
    })}
  </div>`;
}

function inspDeal(d) {
  const i = DEAL_STAGES.indexOf(d.stage);
  return `<div class="dsec"><div class="dsec-h"><h3>Deal</h3><span class="cnt">${esc(d.account)}</span></div>
    ${uiKeyValueGrid({
      items: [
        { icon: 'building-2', label: 'Account', value: d.account },
        { icon: 'credit-card', label: 'ARR', value: money(d.arr) },
        { icon: 'users', label: 'Seats', value: String(d.seats) },
        { icon: 'user', label: 'Owner', value: d.owner },
        { icon: 'calendar', label: 'Close date', value: fmtDate(d.closeDate) },
        { icon: 'git-branch', label: 'Stage', html: uiBadge({ label: d.stage, tone: i === DEAL_STAGES.length - 1 ? 'green' : 'accent' }) },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Pipeline</h3></div>
    <div class="stack" style="gap:4px">${DEAL_STAGES.map((s, k) => `<div class="row" style="gap:8px;font-size:13px;${k <= i ? '' : 'color:var(--text-3)'}">${ic(k < i ? 'circle-check' : k === i ? 'circle-dot' : 'circle', 14)}<span class="grow">${s}</span>${k === i ? uiBadge({ label: 'Now', tone: 'accent' }) : ''}</div>`).join('')}</div>
    ${i < DEAL_STAGES.length - 1 ? `<div style="margin-top:12px">${uiButton({ label: `Move to ${DEAL_STAGES[i + 1]}`, icon: 'arrow-right', variant: 'primary', size: 'sm', action: 'crmAdvanceDeal', value: d.id })}</div>` : ''}
  </div>`;
}

function inspAccount(ct) {
  const threads = S.tpl.crm.threads.filter(t => t.company === ct.company);
  return `<div class="dsec"><div class="dsec-h"><h3>Account</h3>${uiStatusPill({
    label: ct.health,
    color: ct.health === 'Healthy' ? 'var(--green)' : ct.health === 'Expanding' ? 'var(--accent)' : 'var(--red)',
    bordered: true,
  })}</div>
    ${uiKeyValueGrid({
      items: [
        { icon: 'user', label: 'Contact', value: ct.name },
        { icon: 'mail', label: 'Email', value: ct.email },
        { icon: 'building-2', label: 'Account', value: ct.company },
        { icon: 'credit-card', label: 'ARR', value: money(ct.arr) },
        { icon: 'users', label: 'Seats', value: String(ct.seats) },
        { icon: 'calendar', label: 'Renewal', value: fmtDate(ct.renewal) },
        { icon: 'user-check', label: 'Owner', value: ct.owner || 'Unassigned' },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Conversations</h3><span class="cnt num">${threads.length}</span></div>
    ${threads.length ? threads.map(t => `<div class="row" style="gap:8px;padding:7px 0;border-bottom:1px solid var(--divider);cursor:pointer" data-a="crmSelectThread" data-id="${t.id}">${ic('message-square', 13)}<span class="grow trunc" style="font-size:12.5px">${esc(t.subject)}</span>${uiBadge({ label: t.sla === 'ok' ? 'On track' : t.sla === 'risk' ? 'At risk' : 'Breached', tone: t.sla === 'ok' ? 'green' : t.sla === 'risk' ? 'amber' : 'red' })}</div>`).join('') : '<p class="faint" style="font-size:12.5px;margin:6px 0">No open conversations.</p>'}
    <div style="margin-top:12px">${uiButton({ label: 'Open inbox', icon: 'inbox', size: 'sm', action: 'go', attrs: 'data-r="crm-inbox"' })}</div>
  </div>`;
}

function inspRun(run) {
  return `<div class="dsec"><div class="dsec-h"><h3>Trace</h3><span class="cnt">${esc(run.id)}</span></div>
    ${uiKeyValueGrid({
      twoCol: true,
      items: [
        { icon: 'sparkles', label: 'Prompt', value: run.prompt },
        { icon: 'git-branch', label: 'Version', html: uiBadge({ label: run.version, tone: 'accent' }) },
        { icon: 'cpu', label: 'Model', value: run.model },
        { icon: 'coins', label: 'Tokens', value: String(run.tokens) },
        { icon: 'timer', label: 'Latency', value: `${run.latency}ms` },
        { icon: 'gauge', label: 'Score', html: uiBadge({ label: String(run.score), tone: run.score >= 90 ? 'green' : run.score >= 80 ? 'amber' : 'red' }) },
        { icon: 'clock', label: 'Run at', value: ago(run.at) },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Output</h3><div class="acts">${uiButton({ label: 'Copy', icon: 'copy', size: 'sm', variant: 'ghost', action: 'demoToast', value: 'ok' })}</div></div>
    <pre class="mono" style="margin:0;padding:10px;border-radius:var(--r);background:var(--sunken);border:1px solid var(--border);font-size:12px;white-space:pre-wrap">${esc(
      '{"category": "bug", "urgency": "high", "reason": "SCIM token rejected"}',
    )}</pre>
    <div style="margin-top:12px">${uiButton({ label: 'All runs', icon: 'terminal', size: 'sm', action: 'go', attrs: 'data-r="st-runs"' })}</div>
  </div>`;
}

function inspOrder(o) {
  const units = o.items.reduce((s, i) => s + i.qty, 0);
  return `<div class="dsec"><div class="dsec-h"><h3>Order</h3><span class="cnt">${esc(o.id)}</span></div>
    ${uiKeyValueGrid({
      items: [
        { icon: 'user', label: 'Customer', value: o.customer },
        { icon: 'mail', label: 'Email', value: o.email },
        { icon: 'shopping-bag', label: 'Channel', value: o.channel },
        { icon: 'truck', label: 'Shipping', value: o.ship },
        { icon: 'clock', label: 'Placed', value: ago(o.placed) },
        {
          icon: 'circle-dot',
          label: 'Status',
          html: uiBadge({
            label: o.status.charAt(0).toUpperCase() + o.status.slice(1),
            tone: o.status === 'fulfilled' ? 'green' : o.status === 'unfulfilled' ? 'amber' : 'red',
            dot: true,
          }),
        },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Line items</h3><span class="cnt num">${units}</span></div>
    <table class="perm-t"><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${o.items
      .map(
        i =>
          `<tr><td style="text-align:left"><b style="font-weight:500">${esc(i.name)}</b><div class="faint mono" style="font-size:11px">${esc(i.sku)}</div></td><td class="num">${i.qty}</td><td class="num">${money(i.price)}</td><td class="num">${money(i.price * i.qty)}</td></tr>`,
      )
      .join('')}</tbody></table>
    <div class="row" style="margin-top:10px;font-size:13px"><span class="sp"></span><span class="muted">Subtotal</span><b class="num">${money(o.total)}</b></div>
    <div class="row" style="font-size:13px"><span class="sp"></span><span class="muted">Shipping</span><b class="num">${o.channel === 'Wholesale' ? money(420) : 'Included'}</b></div>
    <div class="row" style="font-size:14px;border-top:1px solid var(--divider);padding-top:8px;margin-top:4px"><span class="sp"></span><b>Total</b><b class="num">${money(
      o.total + (o.channel === 'Wholesale' ? 420 : 0),
    )}</b></div>
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Actions</h3></div>
    <div class="row" style="gap:8px">${uiButton({ label: 'Fulfill order', icon: 'package-check', variant: 'primary', size: 'sm', action: 'cmFulfillOrder', value: o.id, disabled: o.status !== 'unfulfilled' })}${uiButton(
      { label: 'Refund', icon: 'rotate-ccw', variant: 'danger-ghost', size: 'sm', action: 'cmRefundOrder', value: o.id, disabled: o.status !== 'fulfilled' },
    )}</div>
  </div>`;
}

function inspSku(p) {
  return `<div class="dsec"><div class="dsec-h"><h3>SKU</h3><span class="cnt mono">${esc(p.sku)}</span></div>
    ${uiKeyValueGrid({
      items: [
        { icon: 'package', label: 'Product', value: p.name },
        { icon: 'tag', label: 'Category', value: p.category },
        { icon: 'receipt', label: 'Price', value: money(p.price) },
        { icon: 'coins', label: 'Cost', value: money(p.cost) },
        { icon: 'trending-up', label: 'Margin', value: `${Math.round(((p.price - p.cost) / p.price) * 100)}%` },
        { icon: 'warehouse', label: 'On hand', value: String(p.stock) },
        { icon: 'triangle-alert', label: 'Reorder at', value: String(p.reorder) },
        { icon: 'activity', label: 'Sold (90d)', value: String(p.sold) },
      ],
    })}
  </div>
  <div class="dsec"><div class="dsec-h"><h3>Stock</h3><span class="cnt num">${p.stock}</span></div>
    ${progBar(Math.min(100, Math.round((p.stock / (p.reorder * 4)) * 100)), p.stock === 0 ? 'red' : p.stock <= p.reorder ? 'amber' : 'green')}
    <div style="margin-top:12px">${uiButton({ label: 'Restock +50', icon: 'plus', variant: 'primary', size: 'sm', action: 'cmRestock', value: p.id })}</div>
  </div>`;
}

export function inspectorHtml(insp) {
  const a = ARCHETYPES.find(x => x.id === insp.app) || ARCHETYPES[0];
  const t = S.tpl;
  let title = 'Details';
  let sub = '';
  let body = '';
  if (insp.app === 'analytics') {
    const inv = t.analytics.ledger.find(x => x.id === insp.id);
    const svc = t.analytics.usage.find(x => x.id === insp.id);
    if (inv) {
      title = inv.org;
      sub = inv.plan;
      body = inspInvoice(inv);
    } else if (svc) {
      title = svc.service;
      sub = svc.env;
      body = inspUsage(svc);
    }
  } else if (insp.app === 'crm') {
    const deal = t.crm.deals.find(x => x.id === insp.id);
    const ct = t.crm.contacts.find(x => x.id === insp.id);
    if (deal) {
      title = deal.name;
      sub = deal.account;
      body = inspDeal(deal);
    } else if (ct) {
      title = ct.name;
      sub = ct.company;
      body = inspAccount(ct);
    }
  } else if (insp.app === 'studio') {
    const run = t.studio.runs.find(x => x.id === insp.id);
    if (run) {
      title = run.prompt;
      sub = run.model;
      body = inspRun(run);
    }
  } else if (insp.app === 'commerce') {
    const o = t.commerce.orders.find(x => x.id === insp.id);
    const p = t.commerce.products.find(x => x.id === insp.id);
    if (o) {
      title = o.customer;
      sub = o.id;
      body = inspOrder(o);
    } else if (p) {
      title = p.name;
      sub = p.sku;
      body = inspSku(p);
    }
  }
  if (!body) return '';
  return `<aside class="drawer enter" role="dialog" aria-labelledby="insp-h" tabindex="-1">
    <h2 class="sr" id="insp-h">${esc(title)}</h2>
    <div class="drawer-h">
      <span class="picon" style="--sz:22px;--c:${a.color}">${ic(a.icon, 12)}</span>
      <b class="trunc" style="font-weight:600;font-size:13px">${esc(title)}</b>${sub ? `<span class="faint trunc" style="font-size:12px">${esc(sub)}</span>` : ''}
      <span class="sp"></span>
      <button class="ibtn ibtn-sm" data-a="closeInspector" data-tip="Close  Esc" aria-label="Close details">${ic('x', 16)}</button>
    </div>
    <div class="drawer-b" data-keep="inspector">${body}</div>
  </aside>`;
}
