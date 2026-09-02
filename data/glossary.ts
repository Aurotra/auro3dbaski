export type GlossaryCategory =
  | "yuzey"
  | "dilimleme"
  | "yapiskanlik"
  | "malzeme"
  | "olcu";

export type GlossaryTerm = {
  slug: string;
  title: string;
  category: GlossaryCategory;
  oneLiner: string;
  what: string;
  when: string;
  bambuSetting: string;
  caveats: string;
  videoHref?: string;
  calculatorHref?: string;
};

export const glossaryCategories: { id: GlossaryCategory | "all"; label: string }[] =
  [
    { id: "all", label: "Tümü" },
    { id: "yuzey", label: "Yüzey" },
    { id: "dilimleme", label: "Dilimleme" },
    { id: "yapiskanlik", label: "Yatak / yapışma" },
    { id: "malzeme", label: "Malzeme" },
    { id: "olcu", label: "Ölçü" },
  ];

export const glossary: GlossaryTerm[] = [
  {
    slug: "ironing",
    title: "Ironing (ütüleme)",
    category: "yuzey",
    oneLiner: "Üst katmanda nozulu yavaş ve düşük akışla gezdirerek yüzeyi düzleştirir.",
    what: "Son katman üzerine ikinci bir geçiş yapar; nozul erimiş plastiği yayar, tepe izleri ve infill gölgesi azalır.",
    when: "Kutu kapağı, tabela yüzü, vazo dibi gibi düz ve görünen üst yüzeylerde.",
    bambuSetting: "Quality / Ironing. Pattern olarak rectilinear veya concentric; flow %5–15, spacing nozul çapına yakın tutulur.",
    caveats: "Aşırı flow şişme yapar, düşük flow çizik bırakır. Küçük harf ve ince kabartmada ironing detayı bozar.",
  },
  {
    slug: "fuzzy-skin",
    title: "Fuzzy skin",
    category: "yuzey",
    oneLiner: "Duvarlara kontrollü titreşim ekleyerek mat, kumaş benzeri bir doku üretir.",
    what: "Dış perimetreye küçük rastgele sapmalar basar. Katman çizgisi kaybolur, tutuş artar, pürüzlü bir kabuk oluşur.",
    when: "Tutamak, kutu gövdesi, dekoratif kabuk. Ölçü kritik mil ve geçme yüzeyinde kullanılmaz.",
    bambuSetting: "Quality / Fuzzy Skin. Point distance ve thickness parça ölçeğine göre; ince parçada düşük thickness.",
    caveats: "Dış ölçü şişer. Delik, vida yuvası ve sürtünen yüzeyleri modifier ile fuzzy dışı bırakın.",
  },
  {
    slug: "infill-desenleri",
    title: "Infill desenleri",
    category: "dilimleme",
    oneLiner: "İç dolgunun geometrisi; ağırlık, süre ve yönlü dayanımı belirler.",
    what: "Gyroid homojen ve tok, grid hızlı ve ucuz, hexagonal düzgün hücre, lightning yalnızca üst yüzeyi taşır.",
    when: "Kutu ve vitrin: düşük % gyroid veya lightning. Jig ve yük: %25+ gyroid veya grid. Menteşe ve klips: duvarı artır, infilli körleme.",
    bambuSetting: "Strength / Infill. Sparse infill density ve pattern. Lightning üst kabuk kalınlığıyla birlikte ayarlanır.",
    caveats: "Yüzde tek başına yetmez. İnce duvarda yüksek infill titreşim ve string bırakır; asıl dayanım çoğu parçada duvar sayısındadır.",
  },
  {
    slug: "pressure-advance",
    title: "Pressure advance",
    category: "dilimleme",
    oneLiner: "Köşede eriyiği erken kesip geç açarak şişme ve boşluğu dengeler.",
    what: "Nozul içindeki basıncı ivmelenmeye göre tahmin eder. Köşe topu, boş başlangıç ve düzensiz genişlik azalır.",
    when: "Keskin köşe, harf, ince duvar, PETG ve yüksek hız. Her filament ve nozul çapı için ayrı kalibre edilir.",
    bambuSetting: "Filament / Pressure Advance. Bambu Studio’da K değeri; kalibrasyon kulesi veya built-in PA testi.",
    caveats: "Yüksek K köşeyi aç bırakır, düşük K şişirir. Flow ve sıcaklık yanlışsa PA maskelemez, hatayı taşır.",
  },
  {
    slug: "adaptif-katman-yuksekligi",
    title: "Adaptif katman yüksekliği",
    category: "dilimleme",
    oneLiner: "Eğimli yüzeyde katmanı inceltir, düz gövdede kalınlaştırır.",
    what: "Z çözünürlüğünü geometriye göre değiştirir. Küre ve eğri merdiven efekti azalır, kutu gövdesi daha hızlı biter.",
    when: "Organik form, kavisli kapak, heykel. Düz jig ve mil yuvasında sabit katman daha öngörülebilir ölçü verir.",
    bambuSetting: "Quality / Adaptive layer height. Adaptive / Quality / Standard kademeleri; min-max katman aralığı.",
    caveats: "Katman geçişinde iz kalabilir. Vida dişi ve sıkı geçmede sabit 0.16–0.20 mm daha güvenilir.",
  },
  {
    slug: "tree-support",
    title: "Tree support",
    category: "dilimleme",
    oneLiner: "Destekleri gövdeye değil, dallanan ince ayaklarla parçaya yaklaştırır.",
    what: "Klasik ızgara yerine dallı yapı basar. Temas az, söküm kolay, malzeme tasarrufu yüksek.",
    when: "Konsol, organik form, SLA’ya yakın detaylı FDM. Düz alt yüzeyde klasik destek hâlâ daha düzgün taban verir.",
    bambuSetting: "Support / Tree. Branch angle, tip diameter, interface. PETG’de interface filament ayrımı işe yarar.",
    caveats: "Aşırı agresif açı dalı devirir. Küçük temas izi kalır; görünür yüzde zımpara veya ironing planlayın.",
  },
  {
    slug: "warping",
    title: "Warping",
    category: "yapiskanlik",
    oneLiner: "Soğuyan katmanın çekmesiyle köşenin yataktan kalkması.",
    what: "ABS/ASA ve geniş PETG parçalarda köşe yükselir, mil kayar, üst katmanlar kayar. Nedeni termal büzülme ve zayıf ilk kat.",
    when: "Geniş taban, keskin köşe, açık yazıcı, soğuk oda, nemli filament.",
    bambuSetting: "Kapalı kabin, brim, yüksek yatak ısısı, ilk kat yavaş. Filament / Bed temp ve Quality / Brim.",
    caveats: "Sadece yapıştırıcı yetmez. Kapalı kabinli yazıcıda kapı kapalı, taslak yok, ilk kat ezmesi doğru olmalı. Naylon ayrı kurutulur.",
  },
  {
    slug: "bed-adhesion",
    title: "Bed adhesion",
    category: "yapiskanlik",
    oneLiner: "İlk katın yatağa tutunması; sonraki her katmanın temeli.",
    what: "Nozul mesafesi, yatak ısısı, yüzey (PEI, tutkal) ve ilk kat hızı tutunmayı belirler. Az ezme kaydırır, çok ezme fil çıkar.",
    when: "Her işte. Özellikle brim’siz küçük taban, PETG ve naylon.",
    bambuSetting: "Calibration / Live Z analogu: Bambu’da auto calibration + ilk kat flow. Plate type filament profilinde seçilir.",
    caveats: "PETG PEI’ye fazla yapışır; soğuk söküm veya arayüz. Kirli yatak her profili bozar. Alkol, sonra kuru bez.",
  },
  {
    slug: "nem-ve-filament-kurutma",
    title: "Nem ve filament kurutma",
    category: "malzeme",
    oneLiner: "Higroskopik filament su çeker; yüzey köpürür, dayanım düşer.",
    what: "PETG, naylon ve reçine öncesi PLA bile nemle string ve zayıf katman verir. Kurutma kulesi veya fırın, sonra kapalı kutu.",
    when: "Naylon her seferinde, PETG birkaç gün açıkta kaldıysa, patlayan nozul sesi ve mat köpük yüzeyde.",
    bambuSetting: "Filament kurutma kulesi Bambu AMS dışı. Profilde max volumetric speed nemliyken düşürülür, bu çözüm değil.",
    caveats: "Ev fırını termostatı kaba olabilir; üretici sıcaklığını aşmayın. Kurutulmuş rulo tekrar açıkta beklerse aynı yere döner.",
  },
  {
    slug: "tolerans-ve-gecme-payi",
    title: "Tolerans ve geçme payı",
    category: "olcu",
    oneLiner: "CAD’deki nominal ölçü ile basılan parçanın gerçek boşluğu aynı şey değildir.",
    what: "FDM’de dış duvar şişer, delik daralır. Sıkı geçme, kayar geçme ve vida için ayrı pay gerekir; kumpasla doğrulanır.",
    when: "Kapak-gövde, mil-yuvası, mandal, vida dişi, manyetik yuva.",
    bambuSetting: "X-Y hole/contour compensation. Asıl iş test kuponu: 0.1 mm adımlı geçme kulesi.",
    caveats: "Tek bir “sihirli 0.2 mm” yoktur. Malzeme, nozul, duvar ve yön değişince pay değişir. Hesaplayıcıyı kullanın, sonra basıp ölçün.",
    calculatorHref: "/araclar/hesaplayicilar",
  },
  {
    slug: "katman-yuksekligi",
    title: "Katman yüksekliği",
    category: "dilimleme",
    oneLiner: "Z adımı; süre, merdiven efekti ve Z yönü dayanımı.",
    what: "0.12 mm ince yüzey, 0.20 mm atölye standardı, 0.28 mm kaba prototip. Nozul çapının %80’ini geçmek zayıf bağ verir.",
    when: "Görünen eğri: ince. Fonksiyonel kutu ve jig: 0.16–0.20. Sadece oturacak mı bakılan parça: kalın.",
    bambuSetting: "Quality / Layer height ve First layer height. İlk kat genelde biraz daha kalın tutulur.",
    caveats: "İnce katman her zaman daha sağlam değildir; Z kaynağı ve süre artar. 0.4 nozulda 0.08 mm çoğu işte israf.",
  },
  {
    slug: "baski-yonu",
    title: "Baskı yönü (orientation)",
    category: "olcu",
    oneLiner: "Parçanın yataktaki duruşu; katman çizgisi yük yolunu kesmemeli.",
    what: "FDM ankizotropiktir. Çekme ve bükme katmanlara dikse çatlar. Mandal, klips ve vida kulağı yatay katmanla basılır.",
    when: "Her fonksiyonel parçada ilk karar. Destek maliyeti ikinci plandadır.",
    bambuSetting: "Prepare / Rotate. Auto orient yalnızca hacmi küçültür, yük yolunu düşünmez.",
    caveats: "Güzel üst yüzey için yatırılan parça, menteşede kırılabilir. Yönü CAD’de okla işaretleyin, sonra dilimleyin.",
  },
  {
    slug: "duvar-sayisi",
    title: "Duvar sayısı",
    category: "dilimleme",
    oneLiner: "Dış kabuk kalınlığı; çoğu parçada infill’den daha çok dayanım verir.",
    what: "3–4 duvar (1.2–1.6 mm @ 0.4 nozul) kutu ve jig için yeterli. Vida yuvası ve mandal bölgesinde duvarı lokal artırın.",
    when: "Düşen, sıkılan, vidalanan her parça. %100 infill yerine duvar + makul infill daha hızlı ve tok olur.",
    bambuSetting: "Strength / Walls. Wall loops ve top/bottom shells. Modifier ile lokal ekstra duvar.",
    caveats: "Tek duvar vazo modudur, yapısal değil. Aşırı duvar iç geometriyi doldurur, delik kapanır.",
  },
  {
    slug: "brim-ve-raft",
    title: "Brim ve raft",
    category: "yapiskanlik",
    oneLiner: "Küçük tabanı yatağa bağlayan etek (brim) veya alt sal (raft).",
    what: "Brim parçayla aynı katmanda dışarı taşar, warping’i tutar, sökümü kolaydır. Raft ayrı bir taban basar; zor yüzey ve naylon.",
    when: "İnce kule, keskin köşe, PETG geniş plaka: brim. Sorunlu yatak veya özel filament: raft.",
    bambuSetting: "Support / Brim type (outer/inner), brim width. Raft: raft layers ve air gap.",
    caveats: "Brim ölçüye girer; sökülmeden kumpas tutulmaz. Raft alt yüzeyi bozar, görünür tabanda kullanmayın.",
  },
  {
    slug: "seam-konumu",
    title: "Seam (dikiş) konumu",
    category: "yuzey",
    oneLiner: "Her katmanın başladığı nokta; dışta bir çizgi veya nokta dizisi bırakır.",
    what: "Aligned bir çizgi, random dağıtır, rear arkaya iter, nearest süreyi kısaltır. Köşeye gizlenen seam en temiz durur.",
    when: "Silindir, vazo, kutu yan yüzü. Görünen logo ve harfte seam’i arkaya alın.",
    bambuSetting: "Quality / Seam. Seam position ve painting (seam painting) ile köşeye kilitleyin.",
    caveats: "Random mat dokuda işe yarar, parlak PETG’de benek yapar. Pressure advance kötüyse seam şişer.",
  },
];

export function getTerm(slug: string): GlossaryTerm | undefined {
  return glossary.find((item) => item.slug === slug);
}

export function glossaryAccordion(): { q: string; a: string }[] {
  return glossary.map((term) => ({
    q: term.title,
    a: `${term.oneLiner} ${term.what} Ne zaman kullanılır: ${term.when}`,
  }));
}
