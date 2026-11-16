# Cantai ao Senhor

Aplicativo (PWA) de **letras e cifras para a Missa**, com repertório e **conversão das letras em slides PowerPoint (.pptx)**.

Funciona no navegador do celular, pode ser **instalado na tela inicial** e continua funcionando **sem internet** depois da primeira visita.

## Recursos

- **Busca de qualquer música**: procura no acervo e na internet (base aberta de letras [LRCLIB](https://lrclib.net)), por título, trecho ou cantor, ignorando acentos. A letra da internet abre no app e pode virar PPT, ir para o repertório ou favoritas.
- **Cifra para qualquer música**: em músicas da internet, “Procurar cifra” abre a busca na web e “Adicionar cifra” recebe a cifra colada (formato dos sites, acordes na linha de cima), que vira uma versão com acordes salva no aparelho.
- **Categorias** na ordem da missa: Entrada, Ato Penitencial, Glória, Aclamação, Ofertório, Santo, Cordeiro, Comunhão, Pós-Comunhão, Final, Marianos, Natal…
- **Letra ou cifra**, com acordes alinhados sobre as sílabas, **transposição de tom**, ajuste do tamanho da letra e leitura clara/escura.
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
