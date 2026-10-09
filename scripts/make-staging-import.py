"""試験用ブログに入れる「軽い取り込みファイル」を、本番の公開フィードから作る。

使い方（Python 3 が入っていれば、追加のインストールは不要）:
    python scripts/make-staging-import.py
→ 同じ場所に staging-import.xml ができる。試験用ブログの
  「設定 → ブログを管理 → コンテンツをインポート」で読み込む。

中身：最新の記事 100 件 ＋ トップに並べるラベルごとに 6 件 ＋ 固定ページ数枚。
公開フィードに出ているものだけなので、コメント・下書き・非公開の情報は入らない。
画像は Google 上の住所のまま（ファイル自体は入らない）ので、1MB 前後で済む。
"""
import json
import urllib.parse
import urllib.request
from xml.sax.saxutils import escape

BLOG = 'https://ton-press.blogspot.com'
LATEST = 100
# src/app.js の CONFIG.sections と同じラベル（トップの各ブロックに記事が並ぶように）
LABELS = ['インタビュー', '研究', 'イベント', '七大戦', 'ネタ記事', '新入生向け']
PER_LABEL = 6
PAGES = ['報道部について', 'PDF版', '「東北大学新聞」とは']
OUT = 'staging-import.xml'

KIND = 'http://schemas.google.com/g/2005#kind'


def get(path):
    with urllib.request.urlopen(BLOG + path, timeout=60) as r:
        return json.load(r)['feed'].get('entry', [])


def entry(e, kind):
    cats = ''.join(
        "<category scheme='http://www.blogger.com/atom/ns#' term='%s'/>" % escape(c['term'], {"'": '&apos;'})
        for c in e.get('category', []))
    return ("<entry><id>%s</id><published>%s</published><updated>%s</updated>"
            "<category scheme='%s' term='http://schemas.google.com/blogger/2008/kind#%s'/>%s"
            "<title type='text'>%s</title><content type='html'>%s</content>"
            "<author><name>東北大学学友会報道部</name></author></entry>\n") % (
        escape(e['id']['$t']), e['published']['$t'], e['updated']['$t'], KIND, kind, cats,
        escape(e['title']['$t']), escape(e['content']['$t']))


def main():
    posts = get('/feeds/posts/default?alt=json&max-results=%d' % LATEST)
    seen = {p['id']['$t'] for p in posts}
    for label in LABELS:
        for e in get('/feeds/posts/default/-/%s?alt=json&max-results=%d' % (urllib.parse.quote(label), PER_LABEL)):
            if e['id']['$t'] not in seen:
                posts.append(e)
                seen.add(e['id']['$t'])
    pages = [p for p in get('/feeds/pages/default?alt=json&max-results=100') if p['title']['$t'].strip() in PAGES]

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write("<?xml version='1.0' encoding='UTF-8'?>\n"
                "<feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/'"
                " xmlns:gd='http://schemas.google.com/g/2005' xmlns:thr='http://purl.org/syndication/thread/1.0'>\n"
                "<id>tag:blogger.com,1999:blog-staging.archive</id><updated>2026-01-01T00:00:00.000+09:00</updated>"
                "<title type='text'>東北大学新聞（試験用の取り込み）</title>"
                "<generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>\n")
        f.writelines(entry(p, 'page') for p in pages)
        f.writelines(entry(p, 'post') for p in posts)
        f.write('</feed>\n')
    print('記事 %d 件・固定ページ %d 枚 → %s' % (len(posts), len(pages), OUT))


if __name__ == '__main__':
    main()
