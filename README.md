# Cantai ao Senhor

Aplicativo (PWA) de **letras e cifras para a Missa**, com repertório e **conversão das letras em slides PowerPoint (.pptx)**.

Funciona no navegador do celular, pode ser **instalado na tela inicial** e continua funcionando **sem internet** depois da primeira visita.

## Recursos

- **Busca de qualquer música**: procura no acervo e na internet (base aberta de letras [LRCLIB](https://lrclib.net)), por título, trecho ou cantor, ignorando acentos. A letra da internet abre no app e pode virar PPT, ir para o repertório ou favoritas.
- **Cifra com IA (Gemini, grátis)**: em **Mais › Cifras com IA**, cole uma chave gratuita do [Google AI Studio](https://aistudio.google.com/apikey). Ao abrir a aba **Cifra** de uma música sem cifra, o app envia a letra ao Gemini, recebe só os acordes e em qual palavra de cada linha eles entram, encaixa na letra e salva no aparelho, marcada como “sugerida por IA” (com “Gerar de novo” e “Corrigir”). O app escolhe sozinho um modelo *flash* disponível para a chave e pula modelos sem cota grátis. A chave fica só no aparelho.
- **Cifra para qualquer música**: quando a música ainda não tem cifra, a aba **Cifra** mostra uma tela limpa para salvá-la uma vez: copie a cifra (de onde quiser) e toque em “Colar cifra copiada”. A partir daí ela abre sempre no app, só letra e acordes, com troca de tom, PPT e sem internet.
- **Categorias** na ordem da missa: Entrada, Ato Penitencial, Glória, Aclamação, Ofertório, Santo, Cordeiro, Comunhão, Pós-Comunhão, Final, Marianos, Natal…
- **Letra ou cifra**, com acordes alinhados sobre as sílabas, **transposição de tom**, ajuste do tamanho da letra e leitura clara/escura.
- **Desenhos dos acordes**: faixa com os acordes da música (já no tom escolhido) e toque em qualquer acorde para ver como montar no violão. Diagramas da base aberta [Open Guitar Chords](https://openguitarchords.com) (uso livre), em `vendor/acordes.json` — regerar com `node tools/build-acordes.mjs`.
- **Meus PPTs** (biblioteca): botão **Enviar PPTs** guarda os arquivos prontos num banco de dados no próprio aparelho (IndexedDB). O app lê o texto de cada slide (`.pptx`): os PPTs aparecem na busca (“Nos seus PPTs”), podem ser abertos, compartilhados, **apresentados** no app e **salvos como música do acervo** (tira slide de título e rodapé). Backup em `.zip` para passar a outro aparelho. Código em `js/pptlib.js`.
  - **Editar PowerPoint** — aba de edição em tela cheia (`js/editor.js` + `js/editor-ui.js`), também abre em nova aba do navegador:
    - abre o PPT com cada caixa de texto, imagem e forma **na posição original** (fonte, tamanho, cor e alinhamento), lido pela biblioteca aberta [pptxtojson](https://github.com/pipipi-pikachu/pptxtojson) (MIT) e com as imagens descompactadas pela [fflate](https://github.com/101arrowz/fflate) (MIT) — abre em frações de segundo;
    - faixa de comandos: **Início** (fonte, tamanho, A−/A+, negrito, itálico, sublinhado, cor, alinhamentos, posição vertical, cor da caixa), **Inserir** (slide, caixa de texto, título, imagem, formas), **Fundo** (temas, cor, foto com escurecer, original, aplicar a todos), **Organizar** (frente/trás, centralizar, slide inteiro, duplicar, girar, espelhar, apagar, destravar elementos do modelo) e **Slides** (novo, duplicar, apagar, mover, apresentar, salvar como novo);
    - selecionar, arrastar e redimensionar com guias de centro; texto editado direto no slide, com formatação de **trechos**; desfazer/refazer; atalhos (Ctrl+Z/Y/S/D/C/V, Delete, setas, PageUp/PageDown, F5);
    - salva gerando um `.pptx` real (PptxGenJS) e guarda o projeto para reabrir na hora. Também **criar um PPT do zero**.
  - **Editar textos**: um campo por caixa de texto de cada slide; grava no próprio `.pptx` mantendo fundo, imagens e formatação. **Substituir arquivo** troca pela versão editada no PowerPoint/Google Apresentações.
  - **Biblioteca online (Supabase, grátis)**: com login, os PPTs ficam na nuvem e aparecem para todos os membros autorizados; arquivos baixados só quando abertos. Para ligar: crie um projeto em [supabase.com](https://supabase.com), rode `tools/nuvem-supabase.sql` no SQL Editor (com os e-mails dos membros) e coloque o *Project URL* e a chave pública em `js/nuvem-config.js`. Código em `js/nuvem.js`.
- **Orações Eucarísticas** (I a V, Diversas Circunstâncias, com Crianças, Reconciliação): o texto do Missal é protegido por direito autoral e **não está no código**. A pessoa copia cada oração (ex.: do site Católico Orante) e toca em “Colar oração copiada”: o app reconhece qual das 14 é, tira os botões do site e guarda no aparelho. Depois ela abre limpa, com V./R./CP/CC destacados, sem internet.
- **Acervo com 41 cantos**, 25 com cifra, cobrindo todos os momentos da missa e os tempos litúrgicos (Advento, Natal, Quaresma, Páscoa).
- **Converter para PPT**: slides 16:9 com fundos nas **cores do tempo litúrgico**, fundo simples (preto/branco/azul) ou **foto própria**; refrão repetido automaticamente após cada estrofe; linhas por slide ajustáveis.
- **Repertório da Missa**: monte a sequência de cantos e gere **um único PPT** com todos.
- **Modo apresentação** em tela cheia direto do celular/tablet (toque ou setas do teclado para avançar).
- **Colar uma letra** de qualquer lugar e gerar slides na hora.
- **Cadastro de músicas próprias**: aceita o formato dos sites de cifra (acordes na linha de cima), que é convertido automaticamente. Ficam salvas no aparelho, com exportação/importação em JSON.
- Favoritas e histórico.

## Tecnologia

HTML, CSS e JavaScript puros, sem etapa de build. O PPT é gerado no próprio aparelho com [PptxGenJS](https://github.com/gitbrent/PptxGenJS) (MIT), incluído em `vendor/`.

```
index.html            estrutura do app
css/app.css           visual
js/songs.js           acervo e categorias
js/slides.js          cifras, transposição, slides e exportação .pptx
js/app.js             telas e navegação
sw.js                 cache offline
tools/make-icons.mjs  gera os ícones PNG
tools/serve.mjs       servidor local de teste
```

### Rodar localmente

```bash
node tools/serve.mjs 8140
```

Abra http://localhost:8140.

## Como adicionar músicas ao acervo

Edite `js/songs.js`. Formato do texto:

```
@Refrão
[G]Senhor, vem sal[D]var-nos,
[Em]vem dar-nos tua [C]paz;

@Estrofe 1
[G]Da casa do Pai nós che[C]gamos,
```

- Linha em branco separa estrofes (cada uma vira um slide).
- `@Refrão` marca o refrão, repetido automaticamente nos slides.
- Acordes entre colchetes antes da sílaba.

## Direitos autorais

O acervo contém apenas **textos em domínio público** (hinos latinos e cantos tradicionais) e **letras originais escritas para o app** (uso livre). A maior parte dos cantos litúrgicos atuais tem direitos autorais de autores e editoras; por isso eles **não** estão no acervo público. Cada comunidade pode cadastrá-los para uso próprio no aparelho, a partir dos seus folhetos e livros de canto.

## Licença

Código sob licença MIT.
