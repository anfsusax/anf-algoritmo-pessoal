import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, ChevronDown, Search, Sprout } from "lucide-react";

type Testament = "AT" | "NT";
type Verse = { reference: string; book: string; chapter: number; verse: number; testament: Testament; text: string; anchor: string };
type Passage = { reference: string; keys: string[]; context: string[]; note: string };
type Study = { id: number; name: string; definition: string; practice: string; terms: string[]; references: string[]; hits: string[] };
type Archive = {
  source: { title: string; url: string; catalogUrl: string; books: number; chapters: number; verses: number };
  studies: Study[];
  passages: Record<string, Passage>;
  verses: Record<string, Verse>;
};
type Reading = { id: string; reference: string; keys: string[]; context?: string[]; note?: string };
const PAGE_SIZE = 8;
let archiveRequest: Promise<Archive> | undefined;

function readArchive() {
  archiveRequest ??= fetch(`${import.meta.env.BASE_URL}biblia-estudos.json`)
    .then(response => {
      if (!response.ok) throw new Error("Acervo indisponível.");
      return response.json() as Promise<Archive>;
    })
    .then(data => {
      if (data.studies?.length !== 69 || !data.verses || !data.passages) throw new Error("Acervo inválido.");
      return data;
    })
    .catch(error => { archiveRequest = undefined; throw error; });
  return archiveRequest;
}

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/ph/g, "f").replace(/th/g, "t").replace(/y/g, "i")
    .replace(/([bcdfglmnpt])\1/g, "$1").replace(/\s+/g, " ");
}

function VerseLines({ keys, verses }: { keys: string[]; verses: Archive["verses"] }) {
  return <>{keys.map(key => <p key={key}><sup>{verses[key].verse}</sup>{verses[key].text}</p>)}</>;
}

function ReadingCard({ reading, archive }: { reading: Reading; archive: Archive }) {
  const first = archive.verses[reading.keys[0]];
  const url = `${archive.source.url}#${first.anchor}`;
  const excerpt = reading.keys.slice(0, 3);
  return <article className="bible-reading">
    <header className="bible-reading-head">
      <div><span className="bible-reading-testament">{first.testament === "AT" ? "ANTIGO TESTAMENTO" : "NOVO TESTAMENTO"}</span><h4>{reading.reference}</h4></div>
      <a className="text-link bible-source-link" href={url} target="_blank" rel="noreferrer" aria-label={`Ler ${reading.reference} na fonte original`}>Na Bíblia <ArrowUpRight size={15}/></a>
    </header>
    <blockquote className="bible-quote"><VerseLines keys={excerpt} verses={archive.verses}/>{reading.keys.length > excerpt.length && <p className="bible-excerpt-note">… trecho inicial</p>}</blockquote>
    {reading.note && <p className="bible-commentary"><strong>Entenda o contexto.</strong> {reading.note}</p>}
    {reading.context && <details className="bible-context">
      <summary> {reading.keys.length > excerpt.length ? "Ler a passagem completa e o contexto" : "Ler os versículos próximos"} <ChevronDown size={15}/></summary>
      <div className="bible-context-verses">{reading.context.map(key => <p className={reading.keys.includes(key) ? "in-passage" : undefined} key={key}><sup>{archive.verses[key].verse}</sup>{archive.verses[key].text}</p>)}</div>
    </details>}
  </article>;
}

export default function BibleStudy({ fruitId }: { fruitId: number }) {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [mode, setMode] = useState<"readings" | "concordance">("readings");
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<Testament | "">("");
  const [book, setBook] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;
    readArchive().then(data => { if (active) setArchive(data); }, () => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [retry]);

  const study = archive?.studies.find(item => item.id === fruitId);
  const readings = useMemo<Reading[]>(() => {
    if (!archive || !study) return [];
    if (mode === "readings") return study.references.map(id => ({ id, ...archive.passages[id] }));
    return study.hits.map(id => ({ id, reference: archive.verses[id].reference, keys: [id] }));
  }, [archive, study, mode]);
  const books = useMemo(() => {
    if (!archive) return [];
    return [...new Set(readings.map(reading => archive.verses[reading.keys[0]].book))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [archive, readings]);
  const filtered = useMemo(() => {
    if (!archive) return [];
    const term = fold(search);
    return readings.filter(reading => {
      const verse = archive.verses[reading.keys[0]];
      return (!testament || verse.testament === testament) && (!book || verse.book === book)
        && (!term || fold(reading.reference).includes(term) || reading.keys.some(key => fold(archive.verses[key].text).includes(term)));
    });
  }, [archive, readings, search, testament, book]);

  if (failed) return <div className="bible-state" role="alert"><p>O acervo bíblico não pôde ser carregado.</p><button className="button secondary" onClick={() => {setFailed(false);setRetry(n=>n+1);}}>Tentar novamente</button></div>;
  if (!archive) return <div className="bible-state" role="status"><BookOpen size={22}/><p>Carregando o estudo bíblico…</p></div>;
  if (!study) return <div className="bible-state" role="status">Ainda não há estudo para este fruto.</div>;

  function chooseMode(next: typeof mode) {
    setMode(next); setBook(""); setSearch(""); setTestament(""); setVisible(PAGE_SIZE);
  }

  return <section className="bible-study" aria-label="Estudo bíblico do fruto">
    <p className="bible-definition">{study.definition}</p>
    <div className="bible-practice"><Sprout size={18}/><div><span>PARA VIVER HOJE</span><p>{study.practice}</p></div></div>
    <div className="bible-mode" role="group" aria-label="Tipo de leitura">
      <button type="button" aria-pressed={mode === "readings"} onClick={() => chooseMode("readings")}>Passagens comentadas <span>{study.references.length}</span></button>
      <button type="button" aria-pressed={mode === "concordance"} onClick={() => chooseMode("concordance")}>Concordância <span>{study.hits.length.toLocaleString("pt-BR")}</span></button>
    </div>
    <p className="bible-mode-description">{mode === "readings" ? "Leituras selecionadas por tema, com texto bíblico e contexto. A edição de 1911 conserva a ortografia da época." : "Todas as ocorrências encontradas para os termos pesquisados, incluindo formas afins. Uma palavra em comum não significa que o versículo ensine diretamente sobre o fruto."}</p>
    {mode === "concordance" && <p className="bible-terms"><strong>Termos pesquisados:</strong> {study.terms.join(", ")}.</p>}
    <div className="bible-filters">
      <label className="search-box"><Search size={16}/><input aria-label="Buscar nas passagens" placeholder="Buscar referência ou palavra" value={search} onChange={event => {setSearch(event.target.value);setVisible(PAGE_SIZE);}}/></label>
      <select aria-label="Filtrar por testamento" value={testament} onChange={event => {setTestament(event.target.value as Testament | "");setVisible(PAGE_SIZE);}}><option value="">Testamentos</option><option value="AT">Antigo Testamento</option><option value="NT">Novo Testamento</option></select>
      <select aria-label="Filtrar por livro" value={book} onChange={event => {setBook(event.target.value);setVisible(PAGE_SIZE);}}><option value="">Todos os livros</option>{books.map(name => <option key={name}>{name}</option>)}</select>
    </div>
    <p className="bible-result-count" role="status">{filtered.length ? `Mostrando ${Math.min(visible, filtered.length).toLocaleString("pt-BR")} de ${filtered.length.toLocaleString("pt-BR")} ${mode === "readings" ? "leituras" : "ocorrências"}` : "Nenhuma passagem corresponde aos filtros."}</p>
    <div className="bible-readings">{filtered.slice(0, visible).map(reading => <ReadingCard key={reading.id} reading={reading} archive={archive}/>)}</div>
    {visible < filtered.length && <button className="button secondary bible-more" onClick={() => setVisible(n => n + PAGE_SIZE)}>Mostrar mais {mode === "readings" ? "leituras" : "ocorrências"} <ChevronDown size={16}/></button>}
    <p className="bible-attribution">Texto bíblico: <a href={archive.source.catalogUrl} target="_blank" rel="noreferrer">{archive.source.title}, Project Gutenberg</a>. A busca percorre {archive.source.books} livros e {archive.source.chapters.toLocaleString("pt-BR")} capítulos desta edição. Os comentários são notas de estudo do projeto.</p>
  </section>;
}
