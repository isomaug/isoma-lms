import { useEffect, useMemo, useRef } from "react";

/**
 * ClassroomWhiteboard
 * Seamless in-page teaching whiteboard component.
 * Sized to match the exact navbar width (max-w-6xl), replaces navbar with teacher header,
 * features a bold & large toggleable classroom date banner, elevated toolbars, and rock-solid stabilization.
 */
export default function ClassroomWhiteboardModal({
  isOpen,
  onClose,
  courseTitle,
  lessonTitle,
  courseSlug,
  lessonId,
  showDate = true,
  onToggleDate,
}) {
  const iframeRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Unique storage key per course & lesson
  const storageKey = useMemo(() => {
    const slugKey = (courseSlug || "course").replace(/[^a-zA-Z0-9_-]/g, "_");
    const lesKey = lessonId ? String(lessonId) : "general";
    return `wb_${slugKey}_${lesKey}`;
  }, [courseSlug, lessonId]);

  // Formatted date string for the classroom date banner
  const todayFormatted = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  // Send date toggle messages to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: "TOGGLE_DATE", show: showDate },
          "*"
        );
      } catch (err) {}
    }
  }, [showDate]);

  // Generate self-contained HTML for the whiteboard with parameterized storage key
  const whiteboardSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Classroom Whiteboard</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Patrick+Hand&family=Kalam:wght@400;700&family=Indie+Flower&family=Lexend:wght@400;500&display=swap">
<style>
:root{--paper:#fff;--ln:rgba(0,0,0,.12);--mg:rgba(235,90,90,.4);--ink:#1a3fa8;--size:44px;--pad:clamp(24px,6vw,100px);box-sizing:border-box}
*{box-sizing:border-box}
html.dark{--paper:#1e2b25;--ink:#f3f0e6;--ln:rgba(255,255,255,.17);--mg:rgba(255,130,130,.5)}
html,body{margin:0;height:100%;background:var(--paper);overflow:hidden}
#wrap{position:fixed;inset:0;overflow-y:auto;overflow-x:hidden}
#stage{position:relative;min-height:100%}
#board{min-height:100vh;padding:48px var(--pad) 280px;outline:none;color:var(--ink);font:500 var(--size)/1.4 "Caveat","Segoe Print","Bradley Hand",cursive;word-break:break-word;caret-color:var(--ink)}
#board:empty::before{content:attr(data-ph);color:#aab0b8;font-size:30px}
#board hr{border:0;border-top:3px dashed var(--ink);opacity:.55;margin:18px 0}
#board img{max-width:100%;height:auto}
#board table{border-collapse:collapse;margin:14px 0;max-width:100%}
#board td,#board th{border:2px solid var(--ink);padding:4px 16px;vertical-align:top;min-width:80px}
#board td{background:var(--paper)}#board th{font-weight:700;background:color-mix(in srgb,var(--paper) 90%,#888)}
#board.grid{background:linear-gradient(var(--ln) 1px,transparent 1px) 0 48px/100% 40px,linear-gradient(90deg,var(--ln) 1px,transparent 1px) 0 0/40px 100%}
#board.dots{background:radial-gradient(var(--ln) 2px,transparent 2.5px) 0 0/36px 36px}
#laser{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:radial-gradient(#ff2a2a 30%,rgba(255,40,40,.35) 60%,transparent 70%);pointer-events:none;display:none;z-index:9}
.bar input[type=color]{width:24px;height:24px;padding:0;border:0;background:none;cursor:pointer}
.bar input[type=range]{width:65px}
@media print{.dock,#laser,#classroom-date-banner{display:none}#wrap{position:static}}
#board.ruled{background:linear-gradient(90deg,transparent calc(var(--pad) - 18px),var(--mg) calc(var(--pad) - 18px),var(--mg) calc(var(--pad) - 16px),transparent calc(var(--pad) - 16px)) no-repeat,
linear-gradient(transparent calc(var(--size)*1.08),var(--ln) calc(var(--size)*1.08),var(--ln) calc(var(--size)*1.08 + 2px),transparent calc(var(--size)*1.08 + 2px));
background-size:100% 100%,100% calc(var(--size)*1.4);background-position:0 0,0 48px}
#cv{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
html,body{touch-action:manipulation}
.cx{align-self:center;background:#2b2f36;color:#fff;border:0;border-radius:8px;padding:2px 14px;font:11px Lexend,system-ui,sans-serif;cursor:pointer;opacity:.92}
body.collapsed .bar{display:none!important}
#cv{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
#cv.draw{pointer-events:auto;touch-action:none}
#board img:hover{outline:2px dashed rgba(0,0,0,.25)}
#board table:hover{box-shadow:0 0 0 3px rgba(26,63,168,.15)}

/* Pinned Classroom Date Banner - Bold & Large */
#classroom-date-banner {
  position: absolute;
  top: 14px;
  right: max(16px, calc(var(--pad) - 24px));
  z-index: 15;
  pointer-events: none;
  user-select: none;
}
#classroom-date-banner.hidden {
  display: none !important;
}
.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: color-mix(in srgb, var(--paper) 90%, #000 6%);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  border-radius: 12px;
  padding: 5px 16px;
  font: 700 clamp(18px, 2.2vw, 24px)/1.2 "Caveat", "Patrick Hand", cursive, sans-serif;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  letter-spacing: .5px;
}
html.dark .date-badge {
  background: rgba(30,43,37,.92);
  color: #f3f0e6;
  border-color: rgba(255,255,255,.35);
  box-shadow: 0 4px 16px rgba(0,0,0,.45);
}

/* Elevated Dock Controls - Never clipped or hidden below screen */
.dock{
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: max(20px, env(safe-area-inset-bottom, 20px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: max-content;
  max-width: calc(100% - 20px);
  font: 400 12px Lexend,system-ui,sans-serif;
  transition: opacity .2s;
  z-index: 99999;
}
.bar{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 3px;
  background: #2b2f36;
  padding: 4px 6px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.bar button,.bar select{
  font: inherit;
  color: #fff;
  background: #3d424b;
  border: 0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 11px;
}
.bar select{max-width: 110px}
.bar button:hover{background: #50565f}
.bar button.on{background: #1a3fa8}
.bar .pen{width: 18px; height: 18px; padding: 0; border-radius: 50%; border: 2px solid #2b2f36}
.bar .pen.on{border-color: #fff}
.bar i{width: 1px; height: 16px; background: #555; margin: 0 2px}
.bar button.tool{display: flex; flex-direction: column; align-items: center; gap: 0; font-size: 9px; padding: 2px 7px}
.tool em{display: block; width: 24px; height: 24px; font-style: normal}
.tool em svg{display: block}
.tool .ico{font: 700 18px/24px Caveat,cursive}
#tbar{display: none; background: #5a3d99}
#tbar button{background: #6f52ad}
body.intable #tbar{display: flex}
body.hide .dock{opacity: 0}
body.hide .dock:hover{opacity: 1}
</style>
</head>
<body data-mode="write">
<div id="wrap"><div id="stage">
  <!-- Pinned Classroom Date Banner -->
  <div id="classroom-date-banner" class="date-banner ${showDate ? "" : "hidden"}">
    <div class="date-badge">
      <span>${todayFormatted}</span>
    </div>
  </div>

  <div id="board" class="ruled" contenteditable="true" spellcheck="false" data-ph="Paste or type here. Tables, images and --- dividers work."></div>
  <canvas id="cv"></canvas>
<div id="laser"></div>
</div></div>
<div class="dock">
  <button class="cx" id="cx" title="Collapse or expand the controls">▾ Collapse</button>
  <div class="bar" id="tbar">
    <button data-t="rowUp">Row ↑</button><button data-t="rowDown">Row ↓</button>
    <button data-t="colLeft">Col ←</button><button data-t="colRight">Col →</button><i></i>
    <button data-t="addRow">+Row</button><button data-t="delRow">−Row</button>
    <button data-t="addCol">+Col</button><button data-t="delCol">−Col</button><button data-t="hdr">Header</button>
  </div>
  <div class="bar" id="main">
    <button class="tool on" data-m="write"><em class="ico">Aa</em>Write</button><button class="tool" data-m="pen"><em></em>Pen</button><button class="tool" data-m="marker"><em></em>Marker</button>
    <button class="tool" data-m="hl"><em class="ico" style="background:#ffe14d;border-radius:4px;font-size:13px;height:20px;line-height:20px;margin:2px 0;color:#333">Hi</em>Light</button><button class="tool" data-m="eraser"><em></em>Eraser</button><button class="tool" data-m="laser"><em class="ico" style="font-size:18px">🔴</em>Laser</button><i></i>
    <button class="pen on" data-c="#1a3fa8" style="background:#1a3fa8" title="Blue"></button><button class="pen" data-c="#111111" style="background:#111" title="Black"></button><button class="pen" data-c="#ffffff" style="background:#fff" title="White"></button>
    <button class="pen" data-c="#b3261e" style="background:#b3261e" title="Red"></button><button class="pen" data-c="#1b7a3d" style="background:#1b7a3d" title="Green"></button><button class="pen" data-c="#c76a00" style="background:#c76a00" title="Orange"></button>
    <input type="color" id="col" value="#1a3fa8" title="Any colour"><i></i>
    <input type="range" id="sz" min="2" max="80" value="4" title="Pen / eraser size">
    <select id="shape" title="Shape (Pen, Marker, Light)"><option value="free">Freehand</option><option value="line">Line</option><option value="arrow">Arrow</option><option value="rect">Box</option><option value="oval">Oval</option></select><button id="so" title="Draw with the stylus only. Fingers scroll the page">Pen only</button>
  </div>
  <div class="bar">
    <select id="font" title="Font for selected text"><option value="" selected disabled>Font</option><option>Caveat</option><option>Patrick Hand</option><option>Kalam</option><option>Indie Flower</option><option>Lexend</option><option>Arial</option></select>
    <button id="b"><b>B</b></button><button id="u"><u>U</u></button><button id="ul" title="Bullets">• List</button><button id="ol" title="Numbers">1. List</button><button id="ce" title="Centre / left">Centre</button>
    <button id="sm">A−</button><button id="lg">A+</button><i></i>
    <select id="paper" title="Paper"><option value="ruled">Lines</option><option value="grid">Grid</option><option value="dots">Dots</option><option value="plain">Plain</option></select>
    <button id="hr">Divider</button><button id="tb">Table</button>
  </div>
  <div class="bar">
    <button id="un">Undo</button><button id="re">Redo</button><i></i>
    <button id="pp">‹</button><span id="pl" style="color:#fff;min-width:30px;text-align:center">1/1</span><button id="pn">›</button><button id="pa">+ Page</button><i></i>
    <button id="sv">Save</button><button id="op">Open</button><button id="cp">Copy all</button><button id="pr">Print</button><i></i>
    <button id="fs">Fullscreen</button><button id="ch">Chalk</button><button id="cl">Clear</button><button id="hd">Hide</button>
    <input type="file" id="fi" accept=".json" style="display:none">
  </div>
</div>
<script>
var STORAGE_KEY = ${JSON.stringify(storageKey)};
var $=function(i){return document.getElementById(i)},board=$('board'),root=document.documentElement,
cv=$('cv'),ctx=cv.getContext('2d'),stage=$('stage'),cur='#1a3fa8',saved,drawing=false,last;

// Listen for messages from parent window (e.g. toggle date banner)
window.addEventListener('message', function(e) {
  if (e && e.data && e.data.type === 'TOGGLE_DATE') {
    var banner = document.getElementById('classroom-date-banner');
    if (banner) {
      banner.classList.toggle('hidden', !e.data.show);
    }
  }
});

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function tbl(rows,head){
  return '<table>'+rows.map(function(r,i){var t=(head&&i===0)?'th':'td';
    return '<tr>'+r.map(function(c){return '<'+t+'>'+(c.trim()?esc(c.trim()):'<br>')+'</'+t+'>'}).join('')+'</tr>'}).join('')+'</table><div><br></div>';
}
function textToHtml(txt){
  var L=txt.replace(/\r/g,'').split('\\n'),out='',i=0,pipes=function(s){return (s.match(/\\|/g)||[]).length};
  while(i<L.length){
    if(pipes(L[i])>=2){
      var rows=[],head=false;
      while(i<L.length&&pipes(L[i])>=2){
        if(/^\\s*\\|?[\\s:\\-|]+\\|?\\s*$/.test(L[i]))head=rows.length===1;
        else rows.push(L[i].trim().replace(/^\\||\\|$/g,'').split('|'));
        i++;
      }
      out+=tbl(rows,head);continue;
    }
    if(L[i].indexOf('\\t')>-1){
      var r=[];while(i<L.length&&L[i].indexOf('\\t')>-1){r.push(L[i].split('\\t'));i++}
      out+=tbl(r,false);continue;
    }
    out+=/^\\s*(-{3,}|={3,})\\s*$/.test(L[i])?'<hr>':'<div>'+(L[i].trim()?esc(L[i]):'<br>')+'</div>';
    i++;
  }
  return out;
}
var KEEP={TABLE:1,THEAD:1,TBODY:1,TR:1,TD:1,TH:1};
function conv(n){
  if(n.nodeType===3)return esc(n.nodeValue.replace(/\\s+/g,' '));
  if(n.nodeType!==1)return '';
  var t=n.tagName,k=Array.prototype.map.call(n.childNodes,conv).join('');
  if(KEEP[t]){var a=(t==='TD'||t==='TH')?(n.colSpan>1?' colspan="'+n.colSpan+'"':'')+(n.rowSpan>1?' rowspan="'+n.rowSpan+'"':''):'';
    return '<'+t.toLowerCase()+a+'>'+(k.trim()?k:'<br>')+'</'+t.toLowerCase()+'>'}
  if(t==='BR')return '<br>';if(t==='HR')return '<hr>';
  if(t==='IMG')return /^data:image/.test(n.src)?'<img src="'+n.src+'">':'';
  if(/^(P|DIV|LI|H[1-6])$/.test(t))return k+'<br>';
  if(/^(STYLE|SCRIPT|META|TITLE)$/.test(t))return '';
  return k;
}
function ins(h){board.focus();document.execCommand('insertHTML',false,h)}
board.addEventListener('paste',function(e){
  e.preventDefault();
  var cd=e.clipboardData,html=cd.getData('text/html'),f=cd.files&&cd.files[0];
  if(f&&/^image\\//.test(f.type)&&!cd.getData('text/plain')){
    var fr=new FileReader();fr.onload=function(){ins('<img src="'+fr.result+'">')};fr.readAsDataURL(f);return}
  if(html&&/<(table|img)/i.test(html))ins(conv(new DOMParser().parseFromString(html,'text/html').body)+'<div><br></div>');
  else ins(textToHtml(cd.getData('text/plain')));
});
function cell(){var s=getSelection();if(!s.rangeCount||!board.contains(s.anchorNode))return null;
  var n=s.anchorNode;n=n.nodeType===3?n.parentNode:n;return n.closest('td,th')}
document.addEventListener('selectionchange',function(){
  var s=getSelection();if(s.rangeCount&&board.contains(s.anchorNode))saved=s.getRangeAt(0).cloneRange();
  document.body.classList.toggle('intable',!!cell());
});
function restore(){board.focus();if(saved){var s=getSelection();s.removeAllRanges();s.addRange(saved)}}
function fmt(cmd,val){restore();document.execCommand('styleWithCSS',false,true);document.execCommand(cmd,false,val)}
document.querySelector('.dock').addEventListener('mousedown',function(e){if(e.target.tagName==='BUTTON')e.preventDefault()});
$('font').onchange=function(e){fmt('fontName',e.target.value)};
$('b').onclick=function(){fmt('bold')};$('u').onclick=function(){fmt('underline')};
document.querySelectorAll('.pen').forEach(function(b){b.onclick=function(){
  document.querySelectorAll('.pen').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
  cur=b.dataset.c;if(document.body.dataset.mode==='write')fmt('foreColor',cur)}});
function size(d){var s=parseInt(getComputedStyle(root).getPropertyValue('--size'))+d;root.style.setProperty('--size',Math.max(20,Math.min(110,s))+'px')}
$('sm').onclick=function(){size(-4)};$('lg').onclick=function(){size(4)};
$('hr').onclick=function(){restore();ins('<hr><div><br></div>')};
$('tb').onclick=function(){restore();ins(tbl([['',''],['',''],['','']],true))};
$('cl').onclick=function(){board.innerHTML='';ctx.clearRect(0,0,cv.width,cv.height);cvDirty=true;push();board.focus()};
$('hd').onclick=function(){document.body.classList.add('hide')};
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    try { window.parent.postMessage({ type: 'WHITEBOARD_ESCAPE' }, '*'); } catch(err){}
  }
});
/* table move / add / delete */
var ops={
 rowUp:function(c){var r=c.parentNode,p=r.previousElementSibling;if(p)r.parentNode.insertBefore(r,p)},
 rowDown:function(c){var r=c.parentNode,n=r.nextElementSibling;if(n)r.parentNode.insertBefore(n,r)},
 colLeft:function(c){var i=c.cellIndex;each(c,function(r){var a=r.cells[i],b=r.cells[i-1];if(a&&b)r.insertBefore(a,b)})},
 colRight:function(c){var i=c.cellIndex;each(c,function(r){var a=r.cells[i],b=r.cells[i+1];if(a&&b)r.insertBefore(b,a)})},
 addRow:function(c){var r=c.parentNode,n=r.cloneNode(true);Array.prototype.forEach.call(n.cells,function(x){x.innerHTML='<br>'});r.parentNode.insertBefore(n,r.nextSibling)},
 delRow:function(c){var t=c.closest('table');c.parentNode.remove();if(!t.rows.length)t.remove()},
 addCol:function(c){var i=c.cellIndex;each(c,function(r){var s=r.cells[i]||r.cells[r.cells.length-1],n=document.createElement(s.tagName);n.innerHTML='<br>';r.insertBefore(n,s.nextSibling)})},
 hdr:function(c){var r=c.closest('table').rows[0],h=r.cells[0].tagName==='TH';Array.prototype.slice.call(r.cells).forEach(function(x){var n=document.createElement(h?'td':'th');n.innerHTML=x.innerHTML;n.style.cssText=x.style.cssText;r.replaceChild(n,x)})},
 delCol:function(c){var i=c.cellIndex,t=c.closest('table');each(c,function(r){if(r.cells[i])r.cells[i].remove()});if(!t.querySelector('td,th'))t.remove()}
};
function each(c,f){Array.prototype.slice.call(c.closest('table').rows).forEach(f)}
document.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){restore();var c=cell();if(c){ops[b.dataset.t](c);push()}}});
/* drawing + eraser */
function G(id,st,v){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(v?0:1)+'" y2="'+(v?1:0)+'">'+st.map(function(x){return '<stop offset="'+x[0]+'" stop-color="'+x[1]+'"/>'}).join('')+'</linearGradient>'}
var MET=[[0,'#8d949c'],[.3,'#f4f6f8'],[.55,'#cfd4d9'],[1,'#6b727a']];
function icon(n,z){
  var h='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="'+z+'" height="'+z+'"><defs>',b='';
  if(n==='pen'){
    h+=G('a',[[0,'#173a8c'],[.35,'#6d9bff'],[.6,'#2f5fd1'],[1,'#0f2760']])+G('m',MET);
    b='<g transform="rotate(40 20 20)"><rect x="16" y="10" width="8" height="19" rx="1.5" fill="url(#a)"/><rect x="16.5" y="3" width="7" height="8" rx="2.5" fill="url(#m)"/><rect x="23" y="4" width="1.8" height="9" rx=".9" fill="#b7bdc4"/><rect x="16" y="26" width="8" height="3" fill="url(#m)"/><path d="M16.5 29h7l-2.7 7h-1.6z" fill="url(#m)"/><circle cx="20" cy="36.6" r="1.1" fill="#222"/><rect x="18" y="11" width="1.2" height="14" rx=".6" fill="#fff" opacity=".55"/></g>';
  }else if(n==='marker'){
    h+=G('w',[[0,'#b9c0c8'],[.35,'#fff'],[.7,'#e4e8ec'],[1,'#9aa3ac']])+G('d',[[0,'#111'],[.35,'#5a6068'],[.6,'#23272d'],[1,'#000']])+G('r',[[0,'#a3231a'],[.35,'#ff7a6b'],[.6,'#e0453a'],[1,'#7d160f']]);
    b='<g transform="rotate(40 20 20)"><rect x="14" y="3" width="12" height="10" rx="3" fill="url(#d)"/><rect x="14" y="12" width="12" height="18" rx="2" fill="url(#w)"/><rect x="14" y="19" width="12" height="5" fill="url(#r)"/><path d="M15 30h10l-2 6h-6z" fill="url(#r)"/><rect x="16.5" y="13" width="1.3" height="15" rx=".6" fill="#fff" opacity=".8"/></g>';
  }else{
    h+=G('f',[[0,'#f7a3b8'],[1,'#dc5a7b']],1)+G('g',[[0,'#c8496b'],[1,'#8f2c4b']],1);
    b='<polygon points="6,16 22,8 36,14 20,22" fill="#ffe6ee"/><polygon points="6,16 20,22 20,34 6,28" fill="url(#f)"/><polygon points="20,22 36,14 36,26 20,34" fill="url(#g)"/><polygon points="6,20 20,26 20,29 6,23" fill="#3b78e0"/><polygon points="20,26 36,18 36,21 20,29" fill="#2555b0"/><polygon points="6,16 22,8 36,14 20,22" fill="none" stroke="#fff" stroke-width=".8" opacity=".7"/>';
  }
  return h+'</defs>'+b+'</svg>';
}
var HOT={pen:[7,26],marker:[8,26],eraser:[16,16]},CUR={};
document.querySelectorAll('[data-m]').forEach(function(b){var n=b.dataset.m;
  if(HOT[n]){b.querySelector('em').innerHTML=icon(n,24);CUR[n]='url("data:image/svg+xml,'+encodeURIComponent(icon(n,28))+'") '+HOT[n][0]+' '+HOT[n][1]+', crosshair'}
  b.onclick=function(){document.querySelectorAll('[data-m]').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
    document.body.dataset.mode=n;cv.classList.toggle('draw',n!=='write');cv.style.cursor=CUR[n]||'crosshair';$('laser').style.display='none';if(SZ[n])$('sz').value=SZ[n]}});

var DPR=Math.min(window.devicePixelRatio||1,2);
var fitTmr=null;
function fit(){
  clearTimeout(fitTmr);
  fitTmr=setTimeout(function(){
    var w=Math.round(stage.clientWidth*DPR),h=Math.round(stage.clientHeight*DPR);
    if(cv.width===w&&cv.height===h)return;
    var t=document.createElement('canvas');t.width=cv.width;t.height=cv.height;
    t.getContext('2d').drawImage(cv,0,0);
    cv.width=w;cv.height=h;
    ctx.drawImage(t,0,0);
  },40);
}
new ResizeObserver(fit).observe(stage);
fit();

function eraseText(cx,cy,r){
  var w=document.createTreeWalker(board,NodeFilter.SHOW_TEXT),nodes=[],n;
  while(n=w.nextNode())nodes.push(n);
  nodes.forEach(function(t){
    if(!t.nodeValue.trim())return;
    var rg=document.createRange();rg.selectNodeContents(t);var b=rg.getBoundingClientRect();
    if(b.right<cx-r||b.left>cx+r||b.bottom<cy-r||b.top>cy+r)return;
    var hits=[];
    for(var i=0;i<t.nodeValue.length;i++){
      rg.setStart(t,i);rg.setEnd(t,i+1);var q=rg.getBoundingClientRect();
      if(!q.width)continue;
      var dx=Math.max(q.left-cx,0,cx-q.right),dy=Math.max(q.top-cy,0,cy-q.bottom);
      if(dx*dx+dy*dy<=r*r)hits.push([i,q.width]);
    }
    for(var j=hits.length-1;j>=0;j--){
      rg.setStart(t,hits[j][0]);rg.setEnd(t,hits[j][0]+1);rg.deleteContents();
      var g=document.createElement('span');g.contentEditable='false';g.style.cssText='display:inline-block;width:'+hits[j][1]+'px';rg.insertNode(g);
    }
  });
  board.querySelectorAll('img,hr').forEach(function(el){var q=el.getBoundingClientRect();
    if(q.right>cx-r&&q.left<cx+r&&q.bottom>cy-r&&q.top<cy+r)el.remove()});
}
function eraseAlong(a,b){var d=Math.hypot(b.cx-a.cx,b.cy-a.cy),n=Math.max(1,Math.ceil(d/10));
  for(var i=0;i<=n;i++)eraseText(a.cx+(b.cx-a.cx)*i/n,a.cy+(b.cy-a.cy)*i/n,SZ.eraser/2)}
function pt(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height,cx:e.clientX,cy:e.clientY,pr:(e.pointerType==='pen'&&e.pressure)?e.pressure:0}}
var SZ={pen:4,marker:10,hl:26,eraser:44},shp=$('shape'),base,start,shape=false,laser=$('laser');
function sty(m,pr){ctx.lineCap=ctx.lineJoin='round';ctx.lineWidth=(SZ[m]||4)*DPR*(pr&&m!=='eraser'?.3+pr*1.4:1);ctx.globalCompositeOperation=m==='eraser'?'destination-out':'source-over';ctx.strokeStyle=cur;ctx.globalAlpha=m==='hl'?.35:1}
function seg(a,b){var m=md();if(m==='eraser')eraseAlong(a,b);sty(m,b.pr);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.globalAlpha=1}
function shapeAt(a,b){var k=shp.value,dx=b.x-a.x,dy=b.y-a.y;sty(md());ctx.beginPath();
  if(k==='rect')ctx.rect(a.x,a.y,dx,dy);else if(k==='oval')ctx.ellipse(a.x+dx/2,a.y+dy/2,Math.abs(dx/2),Math.abs(dy/2),0,0,7);
  else{ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);if(k==='arrow'){var t=Math.atan2(dy,dx),L=16+ctx.lineWidth*2;[-.45,.45].forEach(function(d){ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-L*Math.cos(t+d),b.y-L*Math.sin(t+d))})}}
  ctx.stroke();ctx.globalAlpha=1}
var tmpMode='',penOnly=false,ty=null,actType='';
function md(){return tmpMode||document.body.dataset.mode}
function setPO(v){penOnly=v;$('so').classList.toggle('on',v)}
$('so').onclick=function(){setPO(!penOnly)};
cv.addEventListener('contextmenu',function(e){e.preventDefault()});
cv.addEventListener('pointerdown',function(e){
  if(drawing){if(e.pointerType==='touch'&&actType==='pen')return;endDraw()}
  if(e.pointerType==='pen')setPO(true);
  if(e.pointerType==='touch'&&penOnly){ty=e.clientY;cv.setPointerCapture(e.pointerId);return}
  tmpMode=(e.pointerType==='pen'&&(e.button===5||(e.buttons&32)))?'eraser':'';
  var m=md();if(m==='laser')return;
  drawing=true;actType=e.pointerType;cv.setPointerCapture(e.pointerId);last=start=pt(e);
  shape=shp.value!=='free'&&m!=='eraser';
  if(shape){base=document.createElement('canvas');base.width=cv.width;base.height=cv.height;base.getContext('2d').drawImage(cv,0,0)}else seg(last,last)});
cv.addEventListener('pointermove',function(e){
  if(ty!==null&&e.pointerType==='touch'){$('wrap').scrollTop-=e.clientY-ty;ty=e.clientY;return}
  if(md()==='laser'){laser.style.cssText='display:block;left:'+e.clientX+'px;top:'+e.clientY+'px';return}
  if(!drawing||(penOnly&&e.pointerType==='touch'))return;
  if(shape){var p=pt(e);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(base,0,0);shapeAt(start,p)}
  else(e.getCoalescedEvents?e.getCoalescedEvents():[e]).forEach(function(q){var p=pt(q);seg(last,p);last=p})});
cv.addEventListener('pointerleave',function(){laser.style.display='none'});
function endDraw(){ty=null;if(!drawing)return;drawing=false;tmpMode='';cvDirty=true;push()}
function up(e){if(drawing&&e.pointerType&&e.pointerType!==actType)return;endDraw()}
['pointerup','pointercancel','lostpointercapture'].forEach(function(t){cv.addEventListener(t,up)});
document.addEventListener('pointerup',up);
cv.addEventListener('touchstart',function(e){if(cv.classList.contains('draw'))e.preventDefault()},{passive:false});
cv.addEventListener('dblclick',function(e){e.preventDefault()});
$('cx').onclick=function(){var c=document.body.classList.toggle('collapsed');this.textContent=c?'▴ Tools':'▾ Collapse'};

/* drag to resize table columns, rows, whole table, and images */
var rs=null,CU={img:'nwse-resize',tbl:'nwse-resize',col:'col-resize',row:'row-resize'},A=Array.prototype;
function hot(e){var t=e.target;if(!t.closest)return null;
  if(t.tagName==='IMG'){var r=t.getBoundingClientRect();return e.clientX>r.right-18&&e.clientY>r.bottom-18?{k:'img',el:t}:null}
  var c=t.closest('td,th');if(!c)return null;
  var tb=c.closest('table'),T=tb.getBoundingClientRect(),r=c.getBoundingClientRect();
  if(e.clientX>T.right-18&&e.clientY>T.bottom-18)return{k:'tbl',el:tb};
  if(e.clientX>r.right-8)return{k:'col',el:c};
  if(e.clientY>r.bottom-8)return{k:'row',el:c};return null}
board.addEventListener('pointermove',function(e){if(rs)return;var h=hot(e);board.style.cursor=h?CU[h.k]:''});
board.addEventListener('pointerdown',function(e){var h=hot(e);if(!h)return;e.preventDefault();
  var el=h.el,b=el.getBoundingClientRect();
  rs={k:h.k,el:el,x:e.clientX,y:e.clientY,w:b.width,h:b.height,i:h.k==='col'?el.cellIndex:0,
    rh:h.k==='tbl'?A.map.call(el.rows,function(r){return r.getBoundingClientRect().height}):0}});
document.addEventListener('pointermove',function(e){if(!rs)return;var dx=e.clientX-rs.x,dy=e.clientY-rs.y,el=rs.el;
  if(rs.k==='img'){el.style.maxWidth='none';el.style.width=Math.max(40,rs.w+dx)+'px'}
  else if(rs.k==='col'){var w=Math.max(30,rs.w+dx)+'px',tb=el.closest('table');tb.style.maxWidth='none';
    A.forEach.call(tb.rows,function(r){var c=r.cells[rs.i];if(c)c.style.width=c.style.minWidth=w})}
  else if(rs.k==='row'){var h=Math.max(24,rs.h+dy)+'px';el.parentNode.style.height=h;A.forEach.call(el.parentNode.cells,function(c){c.style.height=h})}
  else{var nh=Math.max(40,rs.h+dy);el.style.maxWidth='none';el.style.width=Math.max(120,rs.w+dx)+'px';
    A.forEach.call(el.rows,function(r,i){var hh=rs.rh[i]*nh/rs.h+'px';r.style.height=hh;A.forEach.call(r.cells,function(c){c.style.height=hh})})}});
document.addEventListener('pointerup',function(){if(rs){rs=null;push()}});

/* undo/redo, autosave, pages, save/open */
var hist=[],hi=-1,pages=[{h:'',i:''}],pg=0,tmr,cvURL='',cvDirty=true,dark=false;
function url(){if(cvDirty){cvURL=cv.toDataURL();cvDirty=false}return cvURL}
function snap(){return{h:board.innerHTML,i:url()}}
function save(){try{pages[pg]=snap();localStorage.setItem(STORAGE_KEY,JSON.stringify({pages:pages,pg:pg,dark:dark,paper:$('paper').value}))}catch(e){}}
function push(){clearTimeout(tmr);var s=snap(),l=hist[hi];if(l&&l.h===s.h&&l.i===s.i)return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>40)hist.shift();hi=hist.length-1;save()}
board.addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(push,500)});
function load(s){board.innerHTML=s.h;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,cv.width,cv.height);
  if(s.i){cvURL=s.i;cvDirty=false;var im=new Image();im.onload=function(){ctx.drawImage(im,0,0)};im.src=s.i}else cvDirty=true;
  $('pl').textContent=(pg+1)+'/'+pages.length}
$('un').onclick=function(){if(hi>0){hi--;load(hist[hi]);save()}};
$('re').onclick=function(){if(hi<hist.length-1){hi++;load(hist[hi]);save()}};
document.addEventListener('keydown',function(e){if(!(e.ctrlKey||e.metaKey))return;var k=e.key.toLowerCase();
  if(k==='z'){e.preventDefault();$(e.shiftKey?'re':'un').click()}else if(k==='y'){e.preventDefault();$('re').click()}});
function go(n){pages[pg]=snap();pg=n;if(!pages[pg])pages[pg]={h:'',i:''};load(pages[pg]);hist=[pages[pg]];hi=0;save()}
$('pp').onclick=function(){if(pg>0)go(pg-1)};$('pn').onclick=function(){if(pg<pages.length-1)go(pg+1)};$('pa').onclick=function(){go(pages.length)};
function setPaper(v){$('paper').value=v;board.className=v==='plain'?'':v}
$('paper').onchange=function(){setPaper(this.value);save()};
function setTheme(d){dark=d;root.classList.toggle('dark',d);cur=d?'#ffffff':'#1a3fa8';$('col').value=cur;
  document.querySelectorAll('.pen').forEach(function(x){x.classList.toggle('on',x.dataset.c===cur)})}
$('ch').onclick=function(){setTheme(!dark);save()};
$('col').onchange=function(){cur=this.value;document.querySelectorAll('.pen').forEach(function(x){x.classList.remove('on')});if(document.body.dataset.mode==='write')fmt('foreColor',cur)};
$('sz').oninput=function(){var m=document.body.dataset.mode;if(SZ[m])SZ[m]=+this.value};
function cmd(c){restore();document.execCommand(c);push()}
$('ul').onclick=function(){cmd('insertUnorderedList')};$('ol').onclick=function(){cmd('insertOrderedList')};
var ctr=false;$('ce').onclick=function(){ctr=!ctr;cmd(ctr?'justifyCenter':'justifyLeft')};
$('sv').onclick=function(){pages[pg]=snap();var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({pages:pages,pg:pg})],{type:'application/json'}));a.download='whiteboard.json';a.click()};
$('op').onclick=function(){$('fi').click()};
$('fi').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);pages=d.pages;pg=d.pg||0;load(pages[pg]);hist=[pages[pg]];hi=0;save()}catch(x){alert('Could not open that file')}};r.readAsText(f)};
$('cp').onclick=function(){var b=this;try{navigator.clipboard.writeText(board.innerText)}catch(e){}b.textContent='Copied';setTimeout(function(){b.textContent='Copy all'},1200)};
$('pr').onclick=function(){window.print()};
$('fs').onclick=function(){var d=root;if(document.fullscreenElement)document.exitFullscreen();else if(d.requestFullscreen)d.requestFullscreen()};
document.addEventListener('fullscreenchange',function(){document.body.classList.toggle('hide',!!document.fullscreenElement)});
try{var d=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(d&&d.pages){pages=d.pages;pg=d.pg||0;setTheme(!!d.dark);setPaper(d.paper||'ruled')}}catch(e){}
load(pages[pg]);hist=[pages[pg]];hi=0;
board.focus();
</script>
</body>
</html>`;
  }, [storageKey, todayFormatted, showDate]);

  // Listen for message from iframe (e.g. Escape key pressed inside iframe)
  useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (e) => {
      if (e?.data?.type === "WHITEBOARD_ESCAPE") {
        onClose();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] rounded-xl border border-slate-700/60 shadow-xl overflow-hidden relative bg-white select-none">
      <iframe
        ref={iframeRef}
        title="Classroom Whiteboard"
        srcDoc={whiteboardSrcDoc}
        className="w-full h-full border-0 absolute inset-0 block"
        sandbox="allow-scripts allow-downloads allow-modals allow-same-origin allow-popups"
      />
    </div>
  );
}
