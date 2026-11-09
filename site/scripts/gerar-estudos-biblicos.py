"""Indexa a Almeida de 1911 do Project Gutenberg e gera o acervo estático.

Uso na raiz: python site/scripts/gerar-estudos-biblicos.py [arquivo HTML da fonte]
O corpus integral é um insumo local; somente os versículos usados são distribuídos.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import html
import json
from pathlib import Path
import re
import unicodedata

SITE = Path(__file__).resolve().parents[1]
EDITORIAL = SITE / 'content' / 'bible'
SOURCE = 'https://www.gutenberg.org/cache/epub/62383/pg62383-images.html'
BOOK_NAMES = {
    'Gen':'Gênesis','Exo':'Êxodo','Lev':'Levítico','Num':'Números','Deu':'Deuteronômio',
    'Jos':'Josué','Jui':'Juízes','Ruth':'Rute','ISam':'1 Samuel','IISam':'2 Samuel',
    'IReis':'1 Reis','IIReis':'2 Reis','IChr':'1 Crônicas','IIChr':'2 Crônicas',
    'Esd':'Esdras','Neh':'Neemias','Est':'Ester','Job':'Jó','Psa':'Salmos','Pro':'Provérbios',
    'Ecc':'Eclesiastes','Can':'Cânticos','Isa':'Isaías','Jer':'Jeremias','Lam':'Lamentações',
    'Eze':'Ezequiel','Dan':'Daniel','Ose':'Oseias','Joel':'Joel','Amos':'Amós','Oba':'Obadias',
    'Jon':'Jonas','Miq':'Miqueias','Nah':'Naum','Hab':'Habacuque','Sof':'Sofonias',
    'Agg':'Ageu','Zac':'Zacarias','Mal':'Malaquias','Mat':'Mateus','Mar':'Marcos',
    'Luc':'Lucas','Joao':'João','Act':'Atos','Rom':'Romanos','ICor':'1 Coríntios',
    'IICor':'2 Coríntios','Gal':'Gálatas','Eph':'Efésios','IPhi':'Filipenses',
    'Col':'Colossenses','IThe':'1 Tessalonicenses','IIThe':'2 Tessalonicenses',
    'ITim':'1 Timóteo','IITim':'2 Timóteo','Tito':'Tito','IIPhi':'Filemom','Heb':'Hebreus',
    'Thi':'Tiago','IPed':'1 Pedro','IIPed':'2 Pedro','IJoao':'1 João','IIJoao':'2 João',
    'IIIJoao':'3 João','Jud':'Judas','Apo':'Apocalipse',
}


def load_json(name):
    return json.loads((EDITORIAL / name).read_text(encoding='utf-8'))


def normalized(text):
    text = ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if not unicodedata.combining(c))
    text = text.replace('ph', 'f').replace('th', 't').replace('y', 'i')
    text = re.sub(r'([bcdfglmnpt])\1', r'\1', text)
    return ' '.join(text.split())


def corpus(source):
    rows = {}
    chapters = defaultdict(list)
    pattern = r'<p\b[^>]*\bid="([A-Za-z]+)(\d+)-(\d+)"[^>]*>(.*?)</p>'
    for match in re.finditer(pattern, source, re.S):
        code, ch, number, body = match.groups()
        if code not in BOOK_NAMES:
            raise ValueError(f'Livro sem nome: {code}')
        body = re.sub(r'<a\b[^>]*class="[^"]*fnanchor[^"]*"[^>]*>.*?</a>', '', body, flags=re.S)
        body = re.sub(r'<span\b[^>]*class="pagenum"[^>]*>.*?</span>', '', body, flags=re.S)
        body = html.unescape(re.sub('<[^>]+>', '', body))
        body = re.sub(r'\s+', ' ', body).strip()
        body = re.sub(r'^\d+\s*', '', body)
        parts = [(int(number), body)]
        if (code, ch, number) == ('Ose', '11', '4'):
            # O HTML do Gutenberg coloca 11:5 no parágrafo de 11:4 após a quebra de página.
            left, right = body.split(' 5 Não ', 1)
            parts = [(4, left), (5, 'Não ' + right)]
        for verse, text in parts:
            key = f'{code}{ch}:{verse}'
            if key in rows or not text:
                raise ValueError(f'Versículo vazio ou duplicado: {key}')
            rows[key] = {
                'reference': f'{BOOK_NAMES[code]} {ch}:{verse}',
                'book': BOOK_NAMES[code], 'chapter': int(ch), 'verse': verse,
                'testament': 'AT' if list(BOOK_NAMES).index(code) < 39 else 'NT',
                'text': text, 'anchor': f'{code}{ch}-{number}',
            }
            chapters[f'{code}{ch}'].append(key)
    if len(chapters) != 1189 or len({row['book'] for row in rows.values()}) != 66:
        raise ValueError('O corpus deve incluir 66 livros e 1.189 capítulos.')
    for chapter, keys in chapters.items():
        sequence = [rows[k]['verse'] for k in keys]
        if sequence != list(range(1, max(sequence)+1)):
            raise ValueError(f'Numeração fora de sequência: {chapter}')
    return rows, chapters


def search_pattern(terms):
    patterns = []
    for term in terms:
        token = normalized(term)
        suffix = r'\b' if len(token) <= 3 or ' ' in token else r'\w*\b'
        patterns.append(r'\b' + re.escape(token) + suffix)
    return re.compile('|'.join(patterns))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', nargs='?', type=Path, default=SITE.parent / '_ia' / 'pesquisa' / 'almeida-1911-gutenberg.html')
    args = parser.parse_args()
    raw = args.source.read_bytes()
    rows, chapters = corpus(raw.decode('utf-8-sig'))
    plans = load_json('study-plan.json')
    chapter_notes = load_json('chapter-notes.json')
    passage_notes = load_json('passage-notes.json')
    catalog = (SITE / 'content/public/FRUTOS_DE_UMA_VIDA_EM_CRISTO.md').read_text(encoding='utf-8')
    expected = [(int(number), name) for number, name in re.findall(r'^(\d+)\. (.+)$', catalog, re.M)]
    if [(p['id'], p['name']) for p in plans] != expected or len(plans) != 69:
        raise ValueError('O plano de estudos deve coincidir com o catálogo oficial de 69 frutos.')
    corpus_search = [(key, normalized(v['text'])) for key, v in rows.items()]
    passages = {}
    selected_verses = set()
    studies = []
    for plan in plans:
        for ref in plan['references']:
            if ref in passages:
                continue
            match = re.fullmatch(r'([A-Za-z]+)(\d+):(\d+)(?:-(\d+))?', ref)
            if not match:
                raise ValueError(f'Referência mal formatada: {ref}')
            code, ch, start, end = match.groups()
            end = end or start
            chapter = code + ch
            keys = [f'{chapter}:{n}' for n in range(int(start), int(end)+1)]
            if not keys or any(k not in rows for k in keys):
                raise ValueError(f'Referência ausente na fonte: {ref}')
            context = [k for k in chapters[chapter] if int(start)-2 <= rows[k]['verse'] <= int(end)+2]
            passages[ref] = {
                'reference': f'{BOOK_NAMES[code]} {ch}:{start}' + (f'–{end}' if start != end else ''),
                'keys': keys, 'context': context,
                'note': passage_notes.get(ref) or chapter_notes[chapter],
            }
            selected_verses.update(context)
        pattern = search_pattern(plan['terms'])
        hits = [key for key, text in corpus_search if pattern.search(text)]
        if not hits:
            raise ValueError(f'Sem ocorrências textuais para o fruto {plan["id"]}')
        selected_verses.update(hits)
        studies.append({**plan, 'hits': hits})
    data = {
        'source': {
            'title': 'Almeida Revista e Corrigida · Lisboa, 1911',
            'url': SOURCE, 'catalogUrl': 'https://www.gutenberg.org/ebooks/62383',
            'sha256': hashlib.sha256(raw).hexdigest(),
            'books': len(BOOK_NAMES), 'chapters': len(chapters), 'verses': len(rows),
        },
        'studies': studies, 'passages': passages,
        'verses': {key: row for key, row in rows.items() if key in selected_verses},
    }
    output = SITE / 'public' / 'biblia-estudos.json'
    output.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'))+'\n', encoding='utf-8')
    print(f'{len(studies)} frutos; {sum(len(s["references"]) for s in studies)} leituras; '
          f'{len(passages)} passagens distintas; {sum(len(s["hits"]) for s in studies)} ocorrências por fruto; '
          f'{len(selected_verses)} versículos distribuídos; {len(rows)} versículos pesquisados.')
    print('Termos com menos de dez ocorrências:', [(s['id'], len(s['hits'])) for s in studies if len(s['hits']) < 10])


if __name__ == '__main__':
    main()
