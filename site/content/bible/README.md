# Acervo bíblico dos 69 frutos

## Fonte

**Almeida Revista e Corrigida, Lisboa, 1911**, transcrição histórica disponibilizada pelo [Project Gutenberg, eBook 62383](https://www.gutenberg.org/ebooks/62383). A [edição HTML](https://www.gutenberg.org/cache/epub/62383/pg62383-images.html) identifica o ano e a edição na folha de rosto. O catálogo do Gutenberg identifica a obra como de domínio público nos EUA. A ortografia histórica é preservada; notas, marcas de paginação e números iniciais são removidos da apresentação dos versículos. O SHA-256 da fonte usada está no arquivo gerado.

## Duas formas de consultar

- **Passagens comentadas:** 607 vínculos entre frutos e leituras, correspondentes a 469 referências distintas. As leituras foram selecionadas por afinidade de tema; os comentários são editoriais. Há notas específicas para passagens centrais e notas de contexto de capítulo para as demais. A passagem completa e os versículos próximos podem ser expandidos.
- **Concordância:** 22.977 ocorrências somadas por fruto, com repetições legítimas entre temas. A pesquisa percorre os 66 livros, 1.189 capítulos e 31.105 versículos extraídos da edição. A busca usa os termos indicados em cada estudo, com normalização de acentos e de algumas grafias históricas. Termos longos de uma palavra são usados como prefixos; expressões e palavras curtas são buscadas como unidades. O filtro na interface não altera a seleção editorial.

A concordância mostra **todas as ocorrências encontradas pelos termos configurados**, não todas as possíveis relações teológicas. Termos abrangentes podem aparecer em outros sentidos. Uma passagem pode falar do tema sem usar a palavra pesquisada; a seleção comentada inclui esses casos. Referências podem ter numeração diferente em outras edições.

## Atualizar os estudos

1. Edite `study-plan.json` para acrescentar referências, termos de busca ou aplicações, preservando os IDs e os nomes do catálogo de 69 frutos.
2. Registre contexto em `chapter-notes.json` e, quando útil, um comentário específico em `passage-notes.json`.
3. Guarde o HTML original da edição em `_ia/pesquisa/almeida-1911-gutenberg.html`, ou passe o caminho explicitamente. O corpus integral é mantido localmente.
4. Na raiz do projeto, execute:

   ```powershell
   python site/scripts/gerar-estudos-biblicos.py
   ```

5. Revise e versione o arquivo gerado `site/public/biblia-estudos.json`. O build da Vercel copia esse arquivo estático; não precisa baixar a Bíblia nem acessar `_ia/`. O navegador carrega o acervo quando um estudo é aberto.

O gerador valida os 69 frutos, a sequência de versículos e a existência de cada referência no corpus. O HTML da fonte contém Oseias 11:5 no mesmo parágrafo de 11:4; a extração separa ambos, preservando o link original.
