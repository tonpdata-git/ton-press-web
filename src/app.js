/*!
 * 東北大学新聞 ウェブサイト用スクリプト（本番）
 * https://github.com/tompdata-git/ton-press-web
 *
 * 役割分担：
 *   - 記事本文・記事一覧・固定ページ・コメント・人気記事 … Blogger が HTML を組む（theme/theme.xml）
 *   - ヘッダー・フッター・トップページの特集と記事ブロック … このファイルが組む
 * トップの記事は、ページを開くたびに Blogger の公開フィード（/feeds/posts/summary）から取る。
 */
(function () {
  'use strict';

  /* ======================================================
   * 設定：ここだけ直せば、メニューやトップの並びを変えられる
   * ====================================================== */
  var CONFIG = {
    // トップに並べるラベル（左：Blogger のラベル名、右：英字の小見出し）
    sections: [
      ['インタビュー', 'INTERVIEW'],
      ['研究', 'RESEARCH'],
      ['イベント', 'EVENTS'],
      ['七大戦', 'NANADAISEN'],
      ['ネタ記事', 'LIGHT READS'],
      ['新入生向け', 'FOR FRESHERS']
    ],
    perSection: 3,        // 各ブロックに出す記事数
    slides: 4,            // 大きな特集の枚数
    newArrivals: 4,       // 「新着記事」の件数
    slideSeconds: 6,      // 特集が切り替わる間隔（秒）
    tagline: '創刊60周年　学生目線の記事を届ける東北大学新聞',
    // ヘッダーのメニュー（[表示名, リンク先]）
    nav: [
      ['トップ', '/'],
      ['インタビュー', '/search/label/インタビュー'],
      ['研究', '/search/label/研究'],
      ['イベント', '/search/label/イベント'],
      ['七大戦', '/search/label/七大戦'],
      ['ネタ記事', '/search/label/ネタ記事'],
      ['報道部とは', '/p/blog-page_41.html'],
      ['PDF版', '/p/blog-page_7286.html']
    ],
    footer: {
      about: [
        ['報道部について', '/p/blog-page_41.html'],
        ['「東北大学新聞」とは', '/p/blog-page_73.html'],
        ['新聞配布場所一覧', '/p/blog-page_19.html']
      ],
      contact: [
        ['お問い合わせ', '/p/blog-page_15.html'],
        ['広告掲載について', '/p/blog-page_12.html'],
        ['PDF版', '/p/blog-page_7286.html'],
        ['X（@ton_press）', 'https://twitter.com/ton_press']
      ]
    }
  };

  /* ---------- 道具 ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var ASSETS = (function () {
    // このスクリプトと同じ場所の assets/ を使う（jsDelivr の版番号に追従する）
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^/]*$/, '') + 'assets/' : 'assets/';
  })();
  var PAGE = document.body.getAttribute('data-page') || 'list';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ymd(iso) { return String(iso).slice(0, 10).replace(/-/g, '/'); }
  function img(p) {
    return p.img
      ? '<img loading="lazy" src="' + esc(p.img) + '" alt="">'
      : '<div class="noimg"><img src="' + ASSETS + 'logo.png" alt=""></div>';
  }
  function here(href) {
    try { return decodeURI(location.pathname) === decodeURI(href); } catch (e) { return false; }
  }

  /* ---------- ヘッダー・フッター ---------- */
  function renderChrome() {
    var hd = $('#hd'), ft = $('#ft');
    if (hd) {
      hd.innerHTML = '<div class="wrap">' +
        '<a class="logo" href="/" aria-label="東北大学新聞 トップへ"><img src="' + ASSETS + 'logo.png" alt="東北大学新聞 TOHOKU UNIVERSITY PRESS"></a>' +
        '<p class="tag">' + esc(CONFIG.tagline) + '</p>' +
        '<nav class="nav" aria-label="メニュー">' + CONFIG.nav.map(function (n) {
          var on = here(n[1]) || (n[1] === '/' && PAGE === 'index');
          return '<a href="' + esc(n[1]) + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' + esc(n[0]) + '</a>';
        }).join('') + '</nav>' +
        '<form class="search" action="/search" method="get" role="search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input name="q" placeholder="記事を検索" aria-label="記事を検索"><button>検索</button></form></div>';
      // 大きいヘッダーが画面から消えたら、同じ中身の細い帯を上から出す。
      // 大きいヘッダーの位置も大きさも変えないので、記事に重なることも、ページが跳ねることもない
      var bar = document.createElement('div');
      bar.className = 'hd mini hdfix';
      bar.setAttribute('aria-hidden', 'true');
      bar.innerHTML = hd.innerHTML;
      bar.querySelector('.nav').setAttribute('aria-label', 'メニュー（固定）');
      bar.querySelectorAll('a,input,button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
      document.body.appendChild(bar);
      var shown = false;
      var onScroll = function () {
        var past = hd.getBoundingClientRect().bottom < 0;
        if (past === shown) return;
        shown = past;
        bar.classList.toggle('show', past);
        bar.setAttribute('aria-hidden', past ? 'false' : 'true');
        bar.querySelectorAll('a,input,button').forEach(function (el) {
          if (past) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1');
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    }
    if (ft) {
      var list = function (a) { return a.map(function (l) { return '<a href="' + esc(l[1]) + '">' + esc(l[0]) + '</a>'; }).join(''); };
      ft.innerHTML = '<div class="wrap">' +
        '<div><img src="' + ASSETS + 'logo-white.png" alt="東北大学新聞"><div>東北大学学友会報道部が発行する学生新聞です。<br>Since 1966/11/25</div></div>' +
        '<div><h4>ABOUT</h4>' + list(CONFIG.footer.about) + '</div>' +
        '<div><h4>CONTACT</h4>' + list(CONFIG.footer.contact) + '</div>' +
        '<small>© 東北大学学友会報道部</small></div>';
    }
  }

  /* ---------- 公開フィード ---------- */
  // Blogger のフィード 1 件を、画面で使う形に直す
  function fromEntry(e) {
    var link = (e.link || []).filter(function (l) { return l.rel === 'alternate'; })[0];
    var thumb = e.media$thumbnail && e.media$thumbnail.url;
    var text = ((e.summary || e.content || {}).$t || '').replace(/<[^>]+>/g, ' ');
    // &nbsp; などの記号を文字に戻す（textarea は中身を実行しないので安全）
    var dec = document.createElement('textarea'); dec.innerHTML = text;
    text = dec.value.replace(/\s+/g, ' ').trim();
    return {
      title: e.title.$t,
      url: link ? link.href : '#',
      date: e.published.$t,
      // サムネイルは 72px の正方形で来るので、大きい版の住所に書き換える
      img: thumb ? thumb.replace(/\/s\d+(-c)?\//, '/w900/').replace(/=s\d+(-c)?$/, '=w900') : null,
      summary: text.slice(0, 110),
      labels: (e.category || []).map(function (c) { return c.term; })
    };
  }
  function feed(label, n) {
    var path = '/feeds/posts/summary' + (label ? '/-/' + encodeURIComponent(label) : '') +
      '?alt=json&max-results=' + n;
    return fetch(path, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { return (j.feed.entry || []).map(fromEntry); });
  }

  /* ---------- トップページ ---------- */
  function lab(p, l) { return l || p.labels[0] || '記事'; }
  function newsRow(p) {
    return '<a class="news" href="' + esc(p.url) + '"><div class="ph">' + img(p) + '</div><div><span class="meta"><span class="lab">' +
      esc(lab(p)) + '</span> ・ ' + ymd(p.date) + '</span><b>' + esc(p.title) + '</b></div><span class="chev">›</span></a>';
  }
  function card(p, l) {
    return '<a class="card" href="' + esc(p.url) + '"><div class="ph">' + img(p) + '</div><div class="b"><span class="meta">' +
      esc(lab(p, l)) + ' ・ ' + ymd(p.date) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.summary) + '</p><span class="go circ">›</span></div></a>';
  }
  function secHead(l, e, all) {
    return '<div class="sh"><h2>' + esc(l) + '</h2><span class="bar"></span><span class="en">' + esc(e) + '</span>' +
      (all ? '<a class="all" href="' + esc(all) + '">すべて見る <span class="circ">→</span></a>' : '') + '</div>';
  }

  function renderHome(latest, bySection) {
    var hero = $('#hero'), blocks = $('#blocks');
    if (!hero || !blocks) return;
    var slides = latest.filter(function (p) { return p.img; }).slice(0, CONFIG.slides);
    var rest = latest.filter(function (p) { return p !== slides[0]; }).slice(0, CONFIG.newArrivals);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    hero.innerHTML = '<div class="slider" aria-roledescription="carousel" aria-label="特集">' +
      slides.map(function (p, i) {
        return '<div class="slide' + (i ? '' : ' on') + '" aria-hidden="' + (i ? 'true' : 'false') + '">' + img(p) +
          '<div class="t"><span class="chip">' + esc(lab(p)) + '</span><h2>' + esc(p.title) + '</h2><p>' + esc(p.summary) +
          '</p><a class="pill" href="' + esc(p.url) + '"' + (i ? ' tabindex="-1"' : '') + '>記事を読む <i>→</i></a></div></div>';
      }).join('') +
      (slides.length > 1 ? '<div class="pager"><button type="button" aria-label="前へ" data-d="-1">‹</button><span id="pn">01 / ' +
        pad(slides.length) + '</span><button type="button" aria-label="次へ" data-d="1">›</button></div>' : '') + '</div>' +
      '<div class="panel"><div class="ph2"><h2>新着記事</h2><span class="bar"></span><span class="en">NEW ARRIVALS</span></div>' +
      rest.map(newsRow).join('') + '</div>';

    blocks.innerHTML = CONFIG.sections.map(function (s, i) {
      var items = (bySection[i] || []).slice(0, CONFIG.perSection);
      if (!items.length) return '';
      return '<section class="sec">' + secHead(s[0], s[1], '/search/label/' + encodeURIComponent(s[0])) +
        '<div class="cards">' + items.map(function (p) { return card(p, s[0]); }).join('') + '</div></section>';
    }).join('') +
      '<div class="band"><div><h2>紙面で読む</h2><p>東北大学新聞の最新号と過去の号をPDFで公開しています。</p></div>' +
      '<a class="pill" href="/p/blog-page_7286.html">PDF版の一覧へ <i>→</i></a></div>';

    // 特集の切り替え
    var el = hero.querySelectorAll('.slide'), cur = 0, timer;
    if (el.length < 2) return;
    function go(n) {
      el[cur].classList.remove('on'); el[cur].setAttribute('aria-hidden', 'true');
      el[cur].querySelector('.pill').setAttribute('tabindex', '-1');
      cur = (n + el.length) % el.length;
      el[cur].classList.add('on'); el[cur].setAttribute('aria-hidden', 'false');
      el[cur].querySelector('.pill').removeAttribute('tabindex');
      $('#pn').textContent = pad(cur + 1) + ' / ' + pad(el.length);
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, CONFIG.slideSeconds * 1000); }
    hero.querySelectorAll('.pager button').forEach(function (b) {
      b.addEventListener('click', function () { go(cur + (+b.getAttribute('data-d'))); auto(); });
    });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) auto();
  }

  function loadHome() {
    var jobs = [feed(null, 12)].concat(CONFIG.sections.map(function (s) { return feed(s[0], CONFIG.perSection); }));
    Promise.all(jobs.map(function (j) { return j.catch(function () { return []; }); }))
      .then(function (r) {
        if (!r[0].length && window.TONPRESS_SNAPSHOT) throw new Error('offline');
        renderHome(r[0], r.slice(1));
      })
      .catch(function () {
        // 手元で開いたとき（フィードに届かないとき）は見本のデータで描く
        var S = window.TONPRESS_SNAPSHOT;
        if (S) renderHome(S.latest, CONFIG.sections.map(function (s) { return S[s[0]] || []; }));
      });
  }

  /* ---------- 記事ページ：共有ボタン ---------- */
  function renderShare() {
    document.querySelectorAll('[data-share]').forEach(function (box) {
      var url = box.getAttribute('data-url') || location.href;
      var title = box.getAttribute('data-title') || document.title;
      var u = encodeURIComponent(url), t = encodeURIComponent(title);
      box.innerHTML = '<b>SHARE</b>' +
        '<a href="https://twitter.com/intent/tweet?url=' + u + '&amp;text=' + t + '" target="_blank" rel="noopener">X</a>' +
        '<a href="https://social-plugins.line.me/lineit/share?url=' + u + '" target="_blank" rel="noopener">LINE</a>' +
        '<button type="button">URLをコピー</button>';
      var btn = box.querySelector('button');
      btn.addEventListener('click', function () {
        var done = function () { btn.textContent = 'コピーしました'; };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () {});
      });
    });
  }

  renderChrome();
  if (PAGE === 'index') loadHome();
  renderShare();
})();
