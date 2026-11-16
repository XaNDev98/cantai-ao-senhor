/*
 * Acervo de músicas do Cantai ao Senhor.
 *
 * Somente textos em DOMÍNIO PÚBLICO (hinos latinos tradicionais e cantos antigos)
 * ou LETRAS ORIGINAIS escritas para este app (uso livre).
 * Não adicione aqui letras protegidas por direito autoral sem licença do autor/editora.
 *
 * Formato do campo "texto":
 *   - Linhas em branco separam estrofes.
 *   - "@Refrão", "@Estrofe 1", etc. marcam o nome da parte (o refrão é detectado pelo nome).
 *   - Acordes entre colchetes antes da sílaba: "[G]Senhor, vem sal[D]var-nos".
 */
window.CATEGORIAS = [
  { id: 'entrada', nome: 'Entrada', icon: 'entrada' },
  { id: 'ato-penitencial', nome: 'Ato Penitencial', icon: 'gota' },
  { id: 'gloria', nome: 'Glória', icon: 'gloria' },
  { id: 'aclamacao', nome: 'Aclamação ao Evangelho', icon: 'livro' },
  { id: 'ofertorio', nome: 'Ofertório', icon: 'calice' },
  { id: 'santo', nome: 'Santo', icon: 'santo' },
  { id: 'cordeiro', nome: 'Cordeiro de Deus', icon: 'cordeiro' },
  { id: 'comunhao', nome: 'Comunhão', icon: 'hostia' },
  { id: 'pos-comunhao', nome: 'Pós-Comunhão', icon: 'coracao' },
  { id: 'final', nome: 'Canto Final', icon: 'final' },
  { id: 'oracao', nome: 'Momento de Oração', icon: 'vela' },
  { id: 'adoracao', nome: 'Adoração', icon: 'ostensorio' },
  { id: 'espirito', nome: 'Espírito Santo', icon: 'chama' },
  { id: 'marianos', nome: 'Cânticos Marianos', icon: 'coroa' },
  { id: 'natal', nome: 'Natal', icon: 'estrela' },
  { id: 'outros', nome: 'Outros Cantos', icon: 'nota' }
];

const DP = 'Domínio público';
const ORIG = 'Letra original do app · uso livre';

window.SONGS = [
  /* ===================== ENTRADA ===================== */
  {
    id: 'senhor-vem-salvar-nos', titulo: 'Senhor, vem salvar-nos', categoria: 'entrada', tom: 'G',
    autor: 'Acervo Cantai ao Senhor', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[G]Senhor, vem sal[D]var-nos,
[Em]vem dar-nos tua [C]paz;
[G]reúne o teu [D]povo,
[C]que a ti se volta[D]rá[G].

@Estrofe 1
[G]Da casa do Pai nós che[C]gamos,
[Em]trazendo a vida e o [D]pão;
[G]teu nome, Senhor, invo[C]camos
[Am]com fé no [D]cora[G]ção.

@Estrofe 2
[G]Tu és o pastor que nos [C]guia,
[Em]contigo nada há de fal[D]tar;
[G]conduzes por verdes cam[C]pinas,
[Am]nos fazes re[D]pou[G]sar.

@Estrofe 3
[G]Em torno da mesa sa[C]grada
[Em]formamos um só cora[D]ção;
[G]a tua Palavra é es[C]trada,
[Am]a tua pre[D]sença, o [G]pão.`
  },
  {
    id: 'laudate-dominum', titulo: 'Laudate Dominum (Salmo 117)', categoria: 'entrada',
    autor: 'Salmo 117 (Vulgata)', fonte: DP, idioma: 'la',
    texto: `Laudate Dominum, omnes gentes;
laudate eum, omnes populi.

Quoniam confirmata est super nos misericordia eius,
et veritas Domini manet in aeternum.

Gloria Patri, et Filio, et Spiritui Sancto,
sicut erat in principio, et nunc et semper,
et in saecula saeculorum. Amen.`
  },

  /* ===================== ORDINÁRIO ===================== */
  {
    id: 'kyrie', titulo: 'Kyrie eleison', categoria: 'ato-penitencial',
    autor: 'Ordinário da Missa', fonte: DP, idioma: 'la',
    texto: `Kyrie, eleison.
Kyrie, eleison.
Kyrie, eleison.

Christe, eleison.
Christe, eleison.
Christe, eleison.

Kyrie, eleison.
Kyrie, eleison.
Kyrie, eleison.`
  },
  {
    id: 'gloria-in-excelsis', titulo: 'Gloria in excelsis Deo', categoria: 'gloria',
    autor: 'Ordinário da Missa', fonte: DP, idioma: 'la',
    texto: `Gloria in excelsis Deo
et in terra pax hominibus bonae voluntatis.

Laudamus te, benedicimus te,
adoramus te, glorificamus te,
gratias agimus tibi propter magnam gloriam tuam,
Domine Deus, Rex caelestis,
Deus Pater omnipotens.

Domine Fili unigenite, Iesu Christe,
Domine Deus, Agnus Dei, Filius Patris,
qui tollis peccata mundi, miserere nobis;
qui tollis peccata mundi, suscipe deprecationem nostram.
Qui sedes ad dexteram Patris, miserere nobis.

Quoniam tu solus Sanctus, tu solus Dominus,
tu solus Altissimus, Iesu Christe,
cum Sancto Spiritu: in gloria Dei Patris.
Amen.`
  },
  {
    id: 'aleluia-fala-senhor', titulo: 'Aleluia — Fala, Senhor', categoria: 'aclamacao', tom: 'G',
    autor: 'Acervo Cantai ao Senhor', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[G]Ale[D]luia, ale[Em]luia,
[C]ale[D]lu[G]ia!
[G]Ale[D]luia, ale[Em]luia,
[C]ale[D]lu[G]ia!

@Estrofe
[G]Fala, Senhor, que teu [C]servo escuta:
[Am]só tu tens pa[D]lavras de vida e[G]terna.`
  },
  {
    id: 'sanctus', titulo: 'Sanctus', categoria: 'santo',
    autor: 'Ordinário da Missa', fonte: DP, idioma: 'la',
    texto: `Sanctus, Sanctus, Sanctus
Dominus Deus Sabaoth.
Pleni sunt caeli et terra gloria tua.
Hosanna in excelsis.

Benedictus qui venit in nomine Domini.
Hosanna in excelsis.`
  },
  {
    id: 'agnus-dei', titulo: 'Agnus Dei', categoria: 'cordeiro',
    autor: 'Ordinário da Missa', fonte: DP, idioma: 'la',
    texto: `Agnus Dei, qui tollis peccata mundi:
miserere nobis.

Agnus Dei, qui tollis peccata mundi:
miserere nobis.

Agnus Dei, qui tollis peccata mundi:
dona nobis pacem.`
  },
  {
    id: 'pater-noster', titulo: 'Pater Noster', categoria: 'oracao',
    autor: 'Oração do Senhor (Mt 6,9-13)', fonte: DP, idioma: 'la',
    texto: `Pater noster, qui es in caelis,
sanctificetur nomen tuum.
Adveniat regnum tuum.
Fiat voluntas tua, sicut in caelo et in terra.

Panem nostrum quotidianum da nobis hodie,
et dimitte nobis debita nostra,
sicut et nos dimittimus debitoribus nostris.
Et ne nos inducas in tentationem,
sed libera nos a malo.
Amen.`
  },

  /* ===================== OFERTÓRIO ===================== */
  {
    id: 'recebe-senhor-nossa-oferta', titulo: 'Recebe, Senhor, nossa oferta', categoria: 'ofertorio', tom: 'D',
    autor: 'Acervo Cantai ao Senhor', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[D]Recebe, Senhor, nossa o[A]ferta,
[Bm]o pão e o vinho do al[G]tar;
[D]a vida que a ti se li[A]berta
[G]em tuas [A]mãos vem re[D]pousar.

@Estrofe 1
[D]O trigo que a terra nos [G]deu,
[D]o fruto que a vinha ge[A]rou,
[Bm]o suor de quem semeou e co[G]lheu,
[Em]ao Pai, num [A]gesto de a[D]mor.

@Estrofe 2
[D]Também nossa luta di[G]ária,
[D]a dor, a alegria, o la[A]bor,
[Bm]se torna oferenda soli[G]dária
[Em]nas mãos do [A]nosso Se[D]nhor.`
  },
  {
    id: 'ubi-caritas', titulo: 'Ubi caritas', categoria: 'ofertorio',
    autor: 'Hino tradicional (séc. VIII)', fonte: DP, idioma: 'la',
    texto: `@Refrão
Ubi caritas et amor,
Deus ibi est.

@Estrofe 1
Congregavit nos in unum Christi amor.
Exsultemus et in ipso iucundemur.
Timeamus et amemus Deum vivum.
Et ex corde diligamus nos sincero.

@Estrofe 2
Simul ergo cum in unum congregamur,
ne nos mente dividamur caveamus.
Cessent iurgia maligna, cessent lites.
Et in medio nostri sit Christus Deus.`
  },

  /* ===================== COMUNHÃO ===================== */
  {
    id: 'pao-da-vida', titulo: 'Pão da Vida', categoria: 'comunhao', tom: 'C',
    autor: 'Acervo Cantai ao Senhor (inspirado em Jo 6)', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[C]Eu sou o pão da [G]vida:
[Am]quem vem a mim não terá [Em]fome;
[F]quem crê em mim jamais terá [C]sede,
[F]vive pra [G]sempre em meu [C]nome.

@Estrofe 1
[C]Senhor, à tua mesa vi[G]emos,
[Am]famintos de amor e per[Em]dão;
[F]no pão repartido te [C]vemos,
[Dm]presente em [G]cada ir[C]mão.

@Estrofe 2
[C]Quem come deste pão perma[G]nece
[Am]em Cristo, e Cristo nele es[Em]tá;
[F]a vida que nunca pe[C]rece
[Dm]no último [G]dia vi[C]rá.

@Estrofe 3
[C]Num só corpo, Senhor, cami[G]nhamos,
[Am]sustenta-nos, ó pão do [Em]céu;
[F]e ao mundo inteiro anun[C]ciamos
[Dm]o amor que a [G]vida nos [C]deu.`
  },
  {
    id: 'ave-verum', titulo: 'Ave verum corpus', categoria: 'comunhao',
    autor: 'Hino eucarístico (séc. XIV)', fonte: DP, idioma: 'la',
    texto: `Ave verum corpus, natum
de Maria Virgine,
vere passum, immolatum
in cruce pro homine,

cuius latus perforatum
fluxit aqua et sanguine:
esto nobis praegustatum
in mortis examine.

O Iesu dulcis! O Iesu pie!
O Iesu, fili Mariae.
Amen.`
  },
  {
    id: 'adoro-te-devote', titulo: 'Adoro te devote', categoria: 'comunhao',
    autor: 'Santo Tomás de Aquino (séc. XIII)', fonte: DP, idioma: 'la',
    texto: `Adoro te devote, latens Deitas,
quae sub his figuris vere latitas:
tibi se cor meum totum subicit,
quia te contemplans totum deficit.

Visus, tactus, gustus in te fallitur,
sed auditu solo tuto creditur;
credo quidquid dixit Dei Filius:
nil hoc verbo Veritatis verius.`
  },

  /* ===================== PÓS-COMUNHÃO / FINAL ===================== */
  {
    id: 'gracas-te-damos', titulo: 'Graças te damos, Senhor', categoria: 'pos-comunhao', tom: 'A',
    autor: 'Acervo Cantai ao Senhor', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[A]Graças te damos, Se[E]nhor,
[F#m]por teu imenso a[D]mor!
[A]Nossa alma canta em lou[E]vor:
[D]bendito [E]sejas, Se[A]nhor!

@Estrofe 1
[A]Tu nos chamaste à tua [D]mesa,
[A]tu nos nutriste com teu [E]pão;
[F#m]enche de luz nossa fra[D]queza,
[Bm]faz morada em [E]nosso cora[A]ção.

@Estrofe 2
[A]Como Maria, em si[D]lêncio,
[A]queremos guardar teu [E]amor;
[F#m]sobe a ti como in[D]censo
[Bm]a nossa [E]prece, Se[A]nhor.`
  },
  {
    id: 'vamos-irmaos', titulo: 'Vamos, irmãos, pelo mundo', categoria: 'final', tom: 'D',
    autor: 'Acervo Cantai ao Senhor', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[D]Vamos, irmãos, pelo [A]mundo,
[Bm]levando a paz do Se[F#m]nhor;
[G]a missa termina no [D]templo,
[Em]mas segue na [A]vida o a[D]mor.

@Estrofe 1
[D]O pão que nos deu forta[G]leza
[D]nos manda servir e cui[A]dar;
[Bm]que a nossa maior ri[G]queza
[Em]seja a [A]vida do[D]ar.

@Estrofe 2
[D]Maria partiu apres[G]sada
[D]levando Jesus a Isa[A]bel;
[Bm]ensina-nos essa es[G]trada
[Em]do serviço [A]humilde e fi[D]el.`
  },

  /* ===================== ORAÇÃO / ADORAÇÃO / ESPÍRITO ===================== */
  {
    id: 'fica-conosco', titulo: 'Fica conosco, Senhor', categoria: 'oracao', tom: 'Em',
    autor: 'Acervo Cantai ao Senhor (inspirado em Lc 24)', fonte: ORIG, idioma: 'pt',
    texto: `@Refrão
[Em]Fica conosco, Se[C]nhor,
[G]que a tarde já vem che[D]gando;
[Em]arde em nós teu a[C]mor,
[Am]tua Pa[B7]lavra escu[Em]tando.

@Estrofe
[Em]Pelo caminho, can[C]sados,
[G]não te soubemos re[D]conhecer;
[Em]no pão partido, a[C]dorados,
[Am]nossos o[B7]lhos te pu[Em]deram ver.`
  },
  {
    id: 'tantum-ergo', titulo: 'Tantum ergo', categoria: 'adoracao',
    autor: 'Santo Tomás de Aquino (Pange Lingua)', fonte: DP, idioma: 'la',
    texto: `Tantum ergo Sacramentum
veneremur cernui:
et antiquum documentum
novo cedat ritui:
praestet fides supplementum
sensuum defectui.

Genitori, Genitoque
laus et iubilatio,
salus, honor, virtus quoque
sit et benedictio:
procedenti ab utroque
compar sit laudatio.
Amen.`
  },
  {
    id: 'veni-creator', titulo: 'Veni, Creator Spiritus', categoria: 'espirito',
    autor: 'Hino atribuído a Rábano Mauro (séc. IX)', fonte: DP, idioma: 'la',
    texto: `Veni, Creator Spiritus,
mentes tuorum visita,
imple superna gratia,
quae tu creasti pectora.

Qui diceris Paraclitus,
altissimi donum Dei,
fons vivus, ignis, caritas,
et spiritalis unctio.

Tu septiformis munere,
digitus paternae dexterae,
tu rite promissum Patris,
sermone ditans guttura.`
  },

  /* ===================== MARIANOS ===================== */
  {
    id: 'salve-regina', titulo: 'Salve Regina', categoria: 'marianos',
    autor: 'Antífona mariana (séc. XI)', fonte: DP, idioma: 'la',
    texto: `Salve, Regina, Mater misericordiae,
vita, dulcedo, et spes nostra, salve.

Ad te clamamus, exsules filii Hevae.
Ad te suspiramus, gementes et flentes
in hac lacrimarum valle.

Eia ergo, advocata nostra,
illos tuos misericordes oculos ad nos converte.
Et Iesum, benedictum fructum ventris tui,
nobis post hoc exsilium ostende.

O clemens, O pia, O dulcis Virgo Maria.`
  },
  {
    id: 'ave-maria-latim', titulo: 'Ave Maria', categoria: 'marianos',
    autor: 'Oração tradicional', fonte: DP, idioma: 'la',
    texto: `Ave Maria, gratia plena,
Dominus tecum.
Benedicta tu in mulieribus,
et benedictus fructus ventris tui, Iesus.

Sancta Maria, Mater Dei,
ora pro nobis peccatoribus,
nunc et in hora mortis nostrae.
Amen.`
  },
  {
    id: 'regina-caeli', titulo: 'Regina caeli', categoria: 'marianos',
    autor: 'Antífona do Tempo Pascal', fonte: DP, idioma: 'la',
    texto: `Regina caeli, laetare, alleluia.
Quia quem meruisti portare, alleluia.
Resurrexit, sicut dixit, alleluia.
Ora pro nobis Deum, alleluia.`
  },
  {
    id: 'com-minha-mae-estarei', titulo: 'Com minha Mãe estarei', categoria: 'marianos',
    autor: 'Cântico tradicional', fonte: DP, idioma: 'pt',
    texto: `@Estrofe 1
Com minha Mãe estarei
na santa glória um dia;
ao lado de Maria
no céu triunfarei.

@Refrão
No céu, no céu,
com minha Mãe estarei!
No céu, no céu,
com minha Mãe estarei!

@Estrofe 2
Com minha Mãe estarei,
aos anjos me ajuntando;
do Onipotente ao mando
hosanas lhe darei.

@Estrofe 3
Com minha Mãe estarei,
e então coroa digna
de sua mão benigna
feliz receberei.`
  },
  {
    id: 'queremos-deus', titulo: 'Queremos Deus', categoria: 'marianos',
    autor: 'Cântico tradicional (do francês "Nous voulons Dieu")', fonte: DP, idioma: 'pt',
    texto: `@Estrofe 1
Queremos Deus! Homens ingratos,
ao Pai supremo, ao Redentor,
zombam da fé os insensatos,
erguem-se em vão contra o Senhor.

@Refrão
Da nossa fé, ó Virgem,
o brado abençoai:
Queremos Deus, que é nosso Rei!
Queremos Deus, que é nosso Pai!`
  },

  /* ===================== NATAL ===================== */
  {
    id: 'noite-feliz', titulo: 'Noite Feliz', categoria: 'natal', tom: 'C',
    autor: 'Franz X. Gruber · versão de Pe. Pedro Sinzig', fonte: DP, idioma: 'pt',
    texto: `@Estrofe 1
[C]Noite feliz! Noite feliz!
[G7]Ó Senhor, Deus de a[C]mor,
[F]pobrezinho nasceu em Be[C]lém;
[F]eis na lapa Jesus, nosso [C]bem.
[G7]Dorme em paz, ó Je[C]sus!
[C]Dorme em [G7]paz, ó Je[C]sus!

@Estrofe 2
[C]Noite feliz! Noite feliz!
[G7]Ó Jesus, Deus da [C]luz,
[F]quão afável é teu cora[C]ção,
[F]que quiseste nascer nosso ir[C]mão
[G7]e a nós todos sal[C]var!
[C]E a nós [G7]todos sal[C]var!

@Estrofe 3
[C]Noite feliz! Noite feliz!
[G7]Eis que no ar vêm can[C]tar
[F]aos pastores os anjos do [C]céu,
[F]anunciando a chegada de [C]Deus,
[G7]de Jesus Salva[C]dor!
[C]De Jesus [G7]Salva[C]dor!`
  },
  {
    id: 'adeste-fideles', titulo: 'Adeste fideles', categoria: 'natal', tom: 'G',
    autor: 'Hino tradicional (séc. XVIII)', fonte: DP, idioma: 'la',
    texto: `@Estrofe 1
[G]Adeste, fi[D]deles, [G]laeti trium[D]phantes,
[Em]venite, ve[D]nite in [A]Bethle[D]hem.
[G]Natum vi[C]dete [G]Regem ange[D]lorum.

@Refrão
[G]Venite, ado[D]remus, [G]venite, ado[D]remus,
[G]venite, ado[C]remus [G]Domi[D]num[G].

@Estrofe 2
[G]Deum de [D]Deo, [G]lumen de [D]lumine,
[Em]gestant pu[D]ellae [A]visce[D]ra;
[G]Deum ve[C]rum, [G]genitum non [D]factum.

@Estrofe 3
[G]Cantet nunc [D]io [G]chorus ange[D]lorum;
[Em]cantet nunc [D]aula [A]caeles[D]tium:
[G]Gloria in ex[C]celsis [G]De[D]o!`
  }
];
