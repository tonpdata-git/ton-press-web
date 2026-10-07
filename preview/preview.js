/* 東北大学新聞 新デザイン雛形
   本番では data.js の代わりに Blogger の公開フィードを読む。ここでは見本のスナップショットを使う。 */
(function(){
var D=window.TONPRESS,$=function(s,r){return (r||document).querySelector(s)};
var PAGE=document.body.getAttribute('data-page');
var SECTIONS=[['インタビュー','INTERVIEW'],['研究','RESEARCH'],['イベント','EVENTS'],['七大戦','NANADAISEN'],['ネタ記事','LIGHT READS'],['新入生向け','FOR FRESHERS']];
function en(l){for(var i=0;i<SECTIONS.length;i++)if(SECTIONS[i][0]===l)return SECTIONS[i][1];return ''}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function date(d){return d.replace(/-/g,'/')}
function img(p){return p.img?'<img loading="lazy" src="'+esc(p.img)+'" alt="">':'<div class="noimg"><img src="../src/assets/logo.png" alt=""></div>'}
function lab(p,l){return l||p.labels[0]||'記事'}
function cleanBody(h){h=h.replace(/(<(?:div|p)[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/(?:div|p)>\s*)+/gi,'');return h.replace(/(<br\s*\/?>\s*){3,}/gi,'<br><br>')}
function listUrl(l){return 'list.html?l='+encodeURIComponent(l)}

/* ---- 共通：ヘッダーとフッター（Bloggerでは殻のテンプレートに置く部分） ---- */
var navOn={index:'トップ',page:'報道部とは',pdf:'PDF版'}[PAGE]||'';
var q=new URLSearchParams(location.search),curLab=q.get('l');
if(PAGE==='list'&&curLab)navOn=curLab;
var nav=[['トップ','index.html'],['インタビュー',listUrl('インタビュー')],['研究',listUrl('研究')],['イベント',listUrl('イベント')],['七大戦',listUrl('七大戦')],['ネタ記事',listUrl('ネタ記事')],['報道部とは','page.html'],['PDF版','pdf.html']];
$('#hd').innerHTML='<div class="wrap"><a class="logo" href="index.html" aria-label="東北大学新聞 トップへ"><img src="../src/assets/logo.png" alt="東北大学新聞 TOHOKU UNIVERSITY PRESS"></a>'+
 '<p class="tag">創刊60周年　学生目線の記事を届ける東北大学新聞</p>'+
 '<nav class="nav" aria-label="メニュー">'+nav.map(function(n){return '<a href="'+n[1]+'"'+(n[0]===navOn?' class="on" aria-current="page"':'')+'>'+n[0]+'</a>'}).join('')+'</nav>'+
 '<form class="search" action="list.html" method="get" role="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input name="q" placeholder="記事を検索" aria-label="記事を検索"><button>検索</button></form></div>';
$('#ft').innerHTML='<div class="wrap"><div><img src="../src/assets/logo-white.png" alt="東北大学新聞"><div>東北大学学友会報道部が発行する学生新聞です。<br>Since 1966/11/25</div></div>'+
 '<div><h4>ABOUT</h4><a href="page.html">報道部について</a><a href="#">「東北大学新聞」とは</a><a href="#">新聞配布場所一覧</a><a href="#">入部を希望する方へ</a></div>'+
 '<div><h4>CONTACT</h4><a href="#">お問い合わせ</a><a href="#">広告掲載について</a><a href="pdf.html">PDF版</a><a href="https://twitter.com/ton_press">X（@ton_press）</a></div>'+
 '<small>© 東北大学学友会報道部</small></div>';

/* 大きいヘッダーが画面から消えたら、同じ中身の細い帯を上から出す（本番の src/app.js と同じ仕組み） */
var hd=$('#hd'),bar=document.createElement('div');bar.className='hd mini hdfix';bar.setAttribute('aria-hidden','true');bar.innerHTML=hd.innerHTML;document.body.appendChild(bar);
var shown=false;function onScroll(){var past=hd.getBoundingClientRect().bottom<0;if(past===shown)return;shown=past;bar.classList.toggle('show',past);bar.setAttribute('aria-hidden',past?'false':'true')}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);onScroll();

function newsRow(p){return '<a class="news" href="article.html"><div class="ph">'+img(p)+'</div><div><span class="meta"><span class="lab">'+esc(lab(p))+'</span> ・ '+date(p.date)+'</span><b>'+esc(p.title)+'</b></div><span class="chev">›</span></a>'}
function card(p,l){return '<a class="card" href="article.html"><div class="ph">'+img(p)+'</div><div class="b"><span class="meta">'+esc(lab(p,l))+' ・ '+date(p.date)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary)+'</p><span class="go circ">›</span></div></a>'}
function secHead(l,e,all){return '<div class="sh"><h2>'+esc(l)+'</h2><span class="bar"></span><span class="en">'+esc(e)+'</span>'+(all?'<a class="all" href="'+all+'">すべて見る <span class="circ">→</span></a>':'')+'</div>'}
function panelHead(j,e){return '<div class="ph2"><h2>'+j+'</h2><span class="bar"></span><span class="en">'+e+'</span></div>'}
function popular(){return '<div class="panel">'+panelHead('人気記事','POPULAR')+'<div class="rank">'+D['インタビュー'].slice(0,5).map(function(p){return '<a class="news" href="article.html"><div class="ph">'+img(p)+'</div><div><b>'+esc(p.title)+'</b></div></a>'}).join('')+'</div></div>'}
function tagCloud(){return '<div class="panel">'+panelHead('ラベル','LABELS')+'<div class="tags">'+SECTIONS.map(function(s){return '<a href="'+listUrl(s[0])+'">'+s[0]+'</a>'}).join('')+'<a href="#">ニュース</a><a href="#">サークル活動</a><a href="#">研究成果</a><a href="#">一言居士</a><a href="#">大学祭</a></div></div>'}

/* ---- トップ ---- */
if(PAGE==='index'){
 var slides=D.latest.filter(function(p){return p.img}).slice(0,4),rest=D.latest.filter(function(p){return p!==slides[0]}).slice(0,4);
 $('#hero').innerHTML='<div class="slider" aria-roledescription="carousel">'+slides.map(function(p,i){return '<div class="slide'+(i?'':' on')+'" aria-hidden="'+(i?'true':'false')+'">'+img(p)+'<div class="t"><span class="chip">'+esc(lab(p))+'</span><h2>'+esc(p.title)+'</h2><p>'+esc(p.summary)+'</p><a class="pill" href="article.html">記事を読む <i>→</i></a></div></div>'}).join('')+
  '<div class="pager"><button aria-label="前へ" data-d="-1">‹</button><span id="pn">01 / 0'+slides.length+'</span><button aria-label="次へ" data-d="1">›</button></div></div>'+
  '<div class="panel">'+panelHead('新着記事','NEW ARRIVALS')+rest.map(newsRow).join('')+'</div>';
 var cur=0,el=document.querySelectorAll('.slide'),timer;
 function go(n){el[cur].classList.remove('on');el[cur].setAttribute('aria-hidden','true');cur=(n+el.length)%el.length;el[cur].classList.add('on');el[cur].setAttribute('aria-hidden','false');$('#pn').textContent='0'+(cur+1)+' / 0'+el.length}
 function auto(){clearInterval(timer);timer=setInterval(function(){go(cur+1)},6000)}
 document.querySelectorAll('.pager button').forEach(function(b){b.addEventListener('click',function(){go(cur+(+b.getAttribute('data-d')));auto()})});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)auto();
 $('#blocks').innerHTML=SECTIONS.map(function(s){return '<section class="sec">'+secHead(s[0],s[1],listUrl(s[0]))+'<div class="cards">'+(D[s[0]]||[]).slice(0,3).map(function(p){return card(p,s[0])}).join('')+'</div></section>'}).join('')+
  '<div class="band"><div><h2>紙面で読む</h2><p>東北大学新聞の最新号と過去の号をPDFで公開しています。</p></div><a class="pill" href="pdf.html">PDF版の一覧へ <i>→</i></a></div>';
}

/* ---- 記事 ---- */
if(PAGE==='article'){
 var a=D.article;document.title=a.title+' | 東北大学新聞';
 $('#main').innerHTML='<div class="crumb"><a href="index.html">トップ</a> ＞ <a href="'+listUrl(a.labels[0])+'">'+esc(a.labels[0])+'</a> ＞ 記事</div><div class="layout"><article class="sheet art">'+
  '<span class="chip">'+esc(a.labels[0])+'</span><h1>'+esc(a.title)+'</h1><div class="meta"><span>'+date(a.date)+'</span><span>'+a.labels.map(function(l){return '<a class="lab" href="'+listUrl(l)+'">#'+esc(l)+'</a>'}).join('　')+'</span></div>'+
  '<div class="body">'+cleanBody(a.html)+'</div>'+
  '<div class="share"><b>SHARE</b><a href="#">X</a><a href="#">LINE</a><button id="copy">URLをコピー</button></div>'+
  '<div class="slot">ここに Blogger 標準のコメント欄が入ります（機能はそのまま、見た目だけ整えます）</div></article>'+
  '<aside class="side">'+popular()+tagCloud()+'</aside></div>'+
  '<section class="sec">'+secHead('関連記事','RELATED')+'<div class="cards">'+D['インタビュー'].slice(1,4).map(function(p){return card(p,'インタビュー')}).join('')+'</div></section>';
 var cp=$('#copy');cp.addEventListener('click',function(){try{navigator.clipboard.writeText(location.href);cp.textContent='コピーしました'}catch(e){}});
}

/* ---- 一覧（ラベル・検索結果） ---- */
if(PAGE==='list'){
 var qs=q.get('q'),l=curLab||'インタビュー',items=(l==='インタビュー'?D.list:(D[l]||D.list));
 var title=qs?'「'+qs+'」の検索結果':l,sub=qs?'見本のため、インタビューの記事を表示しています。':'「'+l+'」ラベルの記事一覧です。';
 document.title=title+' | 東北大学新聞';
 $('#main').innerHTML='<div class="crumb"><a href="index.html">トップ</a> ＞ '+esc(title)+'</div><div class="layout"><div>'+
  '<div class="lh">'+secHead(title,qs?'SEARCH':en(l)||'LABEL')+'<p>'+esc(sub)+'</p></div>'+
  '<div class="cards two">'+items.map(function(p){return card(p,qs?null:l)}).join('')+'</div>'+
  '<nav class="pages" aria-label="ページ送り"><span class="on">1</span><a href="#">2</a><a href="#">3</a><span>…</span><a href="#">次へ ›</a></nav></div>'+
  '<aside class="side">'+popular()+tagCloud()+'</aside></div>';
}

/* ---- 固定ページ（報道部について） ---- */
if(PAGE==='page'){
 var g=D.page;document.title=g.title+' | 東北大学新聞';
 $('#main').innerHTML='<div class="crumb"><a href="index.html">トップ</a> ＞ '+esc(g.title)+'</div><div class="layout"><article class="sheet art">'+
  '<span class="chip">ABOUT US</span><h1>'+esc(g.title)+'</h1>'+
  '<p class="lead">学内最大の学生メディアとして、東北大学のいまを学生の目線で伝えています。</p>'+
  '<div class="facts"><div><b>1966</b><span>創刊</span></div><div><b>約2,300本</b><span>Web掲載記事</span></div><div><b>月1回</b><span>紙面の発行</span></div></div>'+
  '<div class="body">'+cleanBody(g.html)+'</div></article>'+
  '<aside class="side"><div class="panel">'+panelHead('関連ページ','PAGES')+'<div class="tags"><a href="#">「東北大学新聞」とは</a><a href="#">新聞配布場所一覧</a><a href="#">お問い合わせ方法</a><a href="#">広告掲載について</a><a href="#">無料定期購読のご案内</a><a href="pdf.html">PDF版</a></div></div>'+popular()+'</aside></div>';
}

/* ---- PDF版 ---- */
if(PAGE==='pdf'){
 document.title='PDF版 | 東北大学新聞';
 var iss=D.pdf.slice().reverse();
 $('#main').innerHTML='<div class="crumb"><a href="index.html">トップ</a> ＞ PDF版</div>'+
  '<div class="lh">'+secHead('PDF版','BACK ISSUES')+'<p>今年度に発行した紙面です。リンク先は Google ドライブで開きます。</p></div>'+
  '<div class="issues">'+iss.map(function(i){var full=i.parts.filter(function(p){return p.label==='全面'})[0],pp=i.parts.filter(function(p){return /面$/.test(p.label)&&p.label!=='全面'});
   return '<div class="issue"><span class="meta">2026年度</span><h3>'+esc(i.name)+'</h3>'+(full?'<a class="full" href="'+esc(full.url)+'" target="_blank" rel="noopener">全面を読む →</a>':'')+'<div class="parts">'+pp.map(function(p){return '<a href="'+esc(p.url)+'" target="_blank" rel="noopener">'+esc(p.label)+'</a>'}).join('')+'</div></div>'}).join('')+'</div>'+
  '<div class="band"><div><h2>昨年度以前の紙面</h2><p>2013年度からの紙面をまとめています。</p></div><a class="pill" href="#">アーカイブへ <i>→</i></a></div>';
}
})();
