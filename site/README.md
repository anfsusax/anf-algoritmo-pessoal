# Algoritmo Pessoal

Site pessoal local de Alex Nunes Feitoza. A vida em Cristo e os frutos do Espírito orientam o conteúdo. A profissão aparece como contexto de sustento.

## Executar

Na raiz do projeto, execute `INICIAR-SITE.cmd`, ou use no terminal desta pasta:

```powershell
npm run dev
```

Abra o endereço Local informado pelo servidor. O servidor observa os arquivos Markdown de `_ia/` e sincroniza o conteúdo da biblioteca automaticamente enquanto está ativo.

## Atualizar e verificar

```powershell
npm run sync
npm run check
npm run build
```

`sync` lê oito documentos de referência e os 69 frutos. Não incorpora chats automaticamente: a conversa precisa ser consolidada nos arquivos de memória. Se a lista de frutos estiver inválida, a sincronização falha antes de substituir o conteúdo anterior. Perfil resumido, textos da abertura e declaração pessoal estão em `app/page.tsx` e devem ser revisados quando houver mudanças de identidade ou direção.

## Organização

- `app/page.tsx`: páginas, navegação, busca, reflexões e biblioteca.
- `app/globals.css`: identidade visual e responsividade.
- `scripts/sync-content.mjs`: memória local para conteúdo do site.
- `scripts/dev-local.mjs`: servidor com observação da memória.
- `data/content.json`: conteúdo gerado; contém registros pessoais e é ignorado pelo Git.

## Caderno pessoal

Reflexões e fruto escolhido são guardados em `localStorage`, neste navegador e nesta origem. Exportar gera um JSON; importar acrescenta registros com IDs novos, preservando os existentes. O caderno não é sincronizado com `_ia/` nem com outros dispositivos. Limpar os dados do navegador pode apagar as anotações. Não há conta, banco remoto ou publicação configurada.

## Veracidade e privacidade

Os textos descrevem a direção escolhida por Alex e não alegam progresso já alcançado. Placa, data de nascimento e financiamento foram omitidos da cópia do perfil exibida no site. A biblioteca ainda é pessoal: não a publique sem revisar o conteúdo. Não há rastreadores; Google Fonts é a única dependência visual externa e há fontes locais de fallback.

## Meu tempo

Planejamento ajustável das 24 horas em vida espiritual, cuidado pessoal, família e trabalho, nessa prioridade. Os valores iniciais são zero, sem uma rotina presumida. Campos limitam o total a 24 horas; a distribuição fica salva neste navegador, separada do caderno exportável. Não há cronômetro nem medição automática da rotina real.

## Configuração validada

A execução local usa React e Vite com `vite.local.config.ts`. `npm run dev` observa a memória Markdown; `npm run check` verifica o código ativo e `npm run build` produz `dist/local/`. Em uma instalação nova, rode `npm ci` antes de iniciar. A configuração original Vinext foi preservada em `templates/vinext/`; arquivos herdados do starter que não participam da entrada local ficam fora da checagem ativa. Não há dependência de Next ou de serviços remotos para executar esta versão.

## Verificação em 08/11/2026

Checagem de tipos e build aprovados. Navegação para Meu tempo, limite de 24 horas, percentuais, busca sem acentos e diálogo de reflexão conferidos no navegador. Valores temporários do teste foram restaurados para zero. Página inicial conferida visualmente e captura em `preview-inicio.png`. Fluxos de importação/exportação e aparência em telas móveis ainda não foram exercitados nesta revisão.
