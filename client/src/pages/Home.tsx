/**
 * Panco style note — Coastal Ledger:
 * a reference-inspired retail rhythm built from shell paper, inset blue, ember accents,
 * centered house mark, oversized campaign imagery, and crisp mono retail annotations.
 */
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { pancoAssetUrl, type Product } from "@/lib/catalog";
import { useManagedCatalog } from "@/hooks/useManagedCatalog";
import { useLocale } from "@/contexts/LocaleContext";
import { homeCopy, localizeProduct } from "@/lib/localization";
import { trpc } from "@/lib/trpc";
import { getHeaderTransitionThreshold } from "@/lib/headerTransition";
import { PancoLogo } from "@/components/PancoLogo";
import { nextAnnouncementIndex } from "@/lib/announcementRotation";

/** EDITABLE CONTENT: original campaign slides for the hero carousel. */
const heroSlides = [
  {
    image: pancoAssetUrl("/manus-storage/panco-long-mile-duffle-hero_3cb326bc.jpg"),
    align: "hero-content--left",
  },
  {
    image: pancoAssetUrl("/manus-storage/north-atelier-tote_a6b855c4.jpg"),
    align: "hero-content--right",
  },
  {
    image: pancoAssetUrl("/manus-storage/north-atelier-workshop_151c4843.jpg"),
    align: "hero-content--left",
  },
];

const collections = [
  { number: "01", title: "Daily companions", description: "For every open door.", image: "/manus-storage/north-atelier-cardholder_12ba7095.jpg" },
  { number: "02", title: "Travel notes", description: "Room for the long way.", image: "/manus-storage/north-atelier-hero_6fac9d50.jpg" },
  { number: "03", title: "Carried close", description: "Small goods with presence.", image: "/manus-storage/north-atelier-weekender_e238bcf4.webp" },
  { number: "04", title: "Desk objects", description: "Purpose in the quiet details.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
  { number: "05", title: "Gift ledger", description: "Good things to give well.", image: "/manus-storage/north-atelier-tote_a6b855c4.jpg" },
  { number: "06", title: "Care & repair", description: "Built to stay in motion.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
];

const arabicCollections = [
  { number: "01", title: "رفقاء اليوم", description: "لكل بابٍ مفتوح.", image: "/manus-storage/north-atelier-cardholder_12ba7095.jpg" },
  { number: "02", title: "ملاحظات السفر", description: "مساحة للطريق الطويل.", image: "/manus-storage/north-atelier-hero_6fac9d50.jpg" },
  { number: "03", title: "قريباً منك", description: "قطع صغيرة بحضور هادئ.", image: "/manus-storage/north-atelier-weekender_e238bcf4.webp" },
  { number: "04", title: "قطع المكتب", description: "غاية في التفاصيل الهادئة.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
  { number: "05", title: "سجل الهدايا", description: "أشياء جميلة تُهدى بعناية.", image: "/manus-storage/north-atelier-tote_a6b855c4.jpg" },
  { number: "06", title: "العناية والإصلاح", description: "مصنوعة لتبقى في الحركة.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
];

const frenchCollections = [
  { number: "01", title: "Compagnons du quotidien", description: "Pour chaque porte ouverte.", image: "/manus-storage/north-atelier-cardholder_12ba7095.jpg" },
  { number: "02", title: "Notes de voyage", description: "De la place pour le long chemin.", image: "/manus-storage/north-atelier-hero_6fac9d50.jpg" },
  { number: "03", title: "Porté près de soi", description: "Petite maroquinerie, grande présence.", image: "/manus-storage/north-atelier-weekender_e238bcf4.webp" },
  { number: "04", title: "Objets de bureau", description: "Du sens dans les détails calmes.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
  { number: "05", title: "Registre des cadeaux", description: "De belles choses à offrir avec soin.", image: "/manus-storage/north-atelier-tote_a6b855c4.jpg" },
  { number: "06", title: "Soin et réparation", description: "Faits pour rester en mouvement.", image: "/manus-storage/north-atelier-workshop_151c4843.jpg" },
];

const faqItems = [
  { question: "What leather do you use?", answer: "We work with vegetable-tanned, full-grain leather selected for its natural character and ability to develop a personal patina." },
  { question: "Are the pieces handmade?", answer: "Each collection is produced in small workshop runs with hand cutting, stitching, edge finishing, and final inspection." },
  { question: "Does the leather change over time?", answer: "Yes. Sun, touch, and daily use gradually deepen the finish. The marks are part of the record your piece keeps." },
  { question: "How does Cash on Delivery work?", answer: "Select Cash on Delivery at checkout, then pay the agreed order total when your parcel is delivered. A delivery confirmation is required before dispatch." },
  { question: "Can I request a repair?", answer: "For a considered repair request, contact the studio with a clear photo of the piece and we will advise on the next step." },
];

const arabicFaqItems = [
  { question: "ما نوع الجلد الذي تستخدمونه؟", answer: "نستخدم جلداً طبيعياً كاملاً ومدبوغاً نباتياً، نختاره لطبيعته وقدرته على اكتساب لمسة شخصية مع الزمن." },
  { question: "هل القطع مصنوعة يدوياً؟", answer: "تُصنع كل مجموعة في دفعات صغيرة داخل الورشة، مع القص والخياطة وتشطيب الحواف والفحص النهائي يدوياً." },
  { question: "هل يتغير الجلد مع مرور الوقت؟", answer: "نعم. الشمس واللمس والاستعمال اليومي يعمّقون اللون تدريجياً. العلامات جزء من القصة التي تحتفظ بها قطعتك." },
  { question: "كيف يعمل الدفع عند الاستلام؟", answer: "اختر الدفع عند الاستلام عند الطلب، ثم ادفع القيمة المتفق عليها عند وصول الطرد. نؤكد التوصيل قبل الشحن." },
  { question: "هل يمكنني طلب إصلاح؟", answer: "لطلب إصلاح مدروس، تواصل مع الاستوديو وأرسل صورة واضحة للقطعة وسنرشدك إلى الخطوة التالية." },
];

const frenchFaqItems = [
  { question: "Quel cuir utilisez-vous ?", answer: "Nous travaillons un cuir pleine fleur tanné végétal, choisi pour son caractère naturel et sa capacité à se patiner avec le temps." },
  { question: "Les pièces sont-elles faites à la main ?", answer: "Chaque série est fabriquée en petite quantité à l’atelier, de la coupe au contrôle final, avec le temps nécessaire à chaque étape." },
  { question: "Le cuir change-t-il avec le temps ?", answer: "Oui. Le soleil, le toucher et l’usage quotidien approfondissent peu à peu sa couleur. Les traces deviennent une part de son histoire." },
  { question: "Comment fonctionne le paiement à la livraison ?", answer: "Choisissez cette option à la commande et payez le montant convenu quand votre colis arrive. Nous confirmons la livraison avant l’expédition." },
  { question: "Puis-je demander une réparation ?", answer: "Contactez l’atelier avec une photo claire de votre pièce et nous vous indiquerons la prochaine étape." },
];

export default function Home() {
  const { products } = useManagedCatalog();
  const { locale, direction, setLocale } = useLocale();
  const copy = homeCopy[locale];
  const localizedProducts = products.map((product) => localizeProduct(product, locale));
  const isArabic = locale === "ar";
  const isFrench = locale === "fr";
  const cashOnDeliveryLabel = isArabic
    ? "الدفع عند الاستلام متاح"
    : isFrench
      ? "Paiement à la livraison disponible"
      : "Cash on Delivery available";
  const localizedCollections = isArabic ? arabicCollections : isFrench ? frenchCollections : collections;
  const localizedFaqItems = isArabic ? arabicFaqItems : isFrench ? frenchFaqItems : faqItems;
  const [activeSlide, setActiveSlide] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartItem, setCartItem] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const announcementQuery = trpc.announcements.publicConfig.useQuery(undefined, { retry: false });
  const announcement = announcementQuery.data;
  const submitCashOnDelivery = trpc.orders.submitCashOnDelivery.useMutation({
    onSuccess: () => setOrderSubmitted(true),
  });

  useEffect(() => {
    const slideTimer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6200);
    const onScroll = () => {
      const heroHeight = document.getElementById("hero")?.offsetHeight ?? window.innerHeight;
      const isDirectShopLink = window.location.hash === "#shop";
      setScrolled(isDirectShopLink || window.scrollY >= getHeaderTransitionThreshold(heroHeight, window.innerHeight));
    };
    onScroll();
    const initialPositionFrame = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(slideTimer);
      window.cancelAnimationFrame(initialPositionFrame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!announcement || announcement.messages.length <= 1) {
      setAnnouncementIndex(0);
      return;
    }
    setAnnouncementIndex(0);
    const interval = window.setInterval(() => {
      setAnnouncementIndex(current => nextAnnouncementIndex(current, announcement.messages.length));
    }, announcement.rotationSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [announcement]);

  const addToCart = (product: Product) => {
    setCartItem(product);
    setCartCount((count) => count + 1);
    setCartOpen(true);
  };

  const removeOne = () => {
    setCartCount((count) => Math.max(0, count - 1));
    if (cartCount <= 1) setCartItem(null);
  };

  const openCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
    setOrderSubmitted(false);
  };

  const submitCheckout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartItem) return;
    const form = new FormData(event.currentTarget);
    submitCashOnDelivery.mutate({
      productName: cartItem.name,
      productPrice: cartItem.price,
      productImageUrl: new URL(cartItem.image, window.location.origin).toString(),
      color: cartItem.colors[0]?.name ?? "Standard",
      quantity: Math.min(Math.max(cartCount, 1), 9),
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      note: String(form.get("note") ?? "") || undefined,
    });
  };

  const slide = { ...heroSlides[activeSlide], ...copy.hero[activeSlide] };

  return (
    <div className="storefront" dir={direction}>
      <div
        className={`utility-bar ${scrolled ? "utility-bar--visible" : ""} ${announcement?.enabled === false ? "utility-bar--disabled" : ""}`}
        data-font={announcement?.fontStyle ?? "mono"}
        style={{ "--announcement-bg": announcement?.backgroundColor ?? "#18362a", "--announcement-text": announcement?.textColor ?? "#f6f5f2" } as CSSProperties}
      >
        <button type="button" className="utility-locale" onClick={() => setLocaleOpen((value) => !value)}>
          <Globe2 size={13} /> {copy.locale} <ChevronDown size={12} />
        </button>
        {localeOpen && (
          <div className="locale-menu" role="menu">
            <button type="button" className={locale === "en" ? "is-active" : ""} onClick={() => { setLocale("en"); setLocaleOpen(false); }}>English <small>International</small></button>
            <button type="button" className={locale === "fr" ? "is-active" : ""} onClick={() => { setLocale("fr"); setLocaleOpen(false); }}>Français <small>Europe & Afrique</small></button>
            <button type="button" className={locale === "ar" ? "is-active" : ""} onClick={() => { setLocale("ar"); setLocaleOpen(false); }}>العربية <small>المغرب والشرق الأوسط</small></button>
          </div>
        )}
        <span className="utility-message" key={announcementIndex}>{announcement?.messages?.[announcementIndex] ?? cashOnDeliveryLabel}</span>
        <span className="utility-side">Panco / Since 2024</span>
      </div>

      <header className={`top-nav ${scrolled ? "top-nav--solid" : ""}`}>
        <div className="top-nav__side top-nav__side--left">
          <button type="button" aria-label="Open navigation" className="icon-button top-nav__menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#shop">{copy.nav.shop}</a>
            <a href="#story">{copy.nav.studio}</a>
            <a href="#journal">{copy.nav.journal}</a>
            <Link href="/contact">{isArabic ? "تواصل" : isFrench ? "Contact" : "Contact"}</Link>
          </nav>
        </div>
        <a className="house-mark" href="#top" aria-label="Panco home">
          <PancoLogo variant="light" />
        </a>
        <div className="top-nav__side top-nav__side--right">
          <button type="button" className="icon-button" aria-label="Search" onClick={() => setSearchOpen(true)}><Search size={20} /></button>
          <button type="button" className="icon-button bag-trigger" aria-label="Open shopping bag" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      <main id="top">
        <section id="hero" className="hero-carousel" aria-label="Featured Panco campaign">
          <img src={slide.image} alt="Panco collection" className="hero-carousel__image" key={slide.image} />
          <div className="hero-carousel__wash" />
          <div className="hero-house-stamp" aria-hidden="true"><PancoLogo variant="light" markOnly /><div><span>Panco</span><small>Objects / studio ledger</small></div></div>
          <div className={`hero-content ${slide.align}`}>
            <p className="kicker kicker--light">{slide.eyebrow}</p>
            <h1>{slide.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero-copy">{slide.note}</p>
            <a href="#shop" className="hero-cta">{slide.cta} <ArrowRight size={16} /></a>
          </div>
          <div className="hero-carousel__footer">
            <span>01 — Workshop objects</span>
            <div className="hero-pagination" aria-label="Select campaign slide">
            {heroSlides.map((_, index) => <button type="button" aria-label={`View slide ${index + 1}`} className={index === activeSlide ? "is-active" : ""} onClick={() => setActiveSlide(index)} key={index} />)}
            </div>
            <span>Made in measured runs</span>
          </div>
        </section>

        <section id="shop" className="product-section page-section">
          <div className="section-heading">
            <div>
              <p className="kicker">{copy.newArrivals}</p>
              {locale === "en" ? <h2 className="shop-heading--single-line">{copy.everyday}</h2> : <h2>{copy.everyday.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2>}
            </div>
            <a href="#collections" className="underlined-link">{copy.collections} <ArrowRight size={15} /></a>
          </div>
          <div className="product-rail">
            {localizedProducts.map((product, index) => (
              <article className="catalog-card" key={product.name}>
                <div className="catalog-card__image">
                  <Link href={`/products/${product.slug}`} className="catalog-card__link"><img src={product.image} alt={product.name} /></Link>
                  <span className="catalog-number">{String(index + 1).padStart(2, "0")}</span>
                  {product.tag && <span className="catalog-tag">{product.tag}</span>}
                  <button type="button" onClick={() => addToCart(product)} className="card-add">{copy.quickAdd} <Plus size={14} /></button>
                </div>
                <div className="catalog-card__meta">
                  <div>
                    <p>{product.category}</p>
                    <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                  </div>
                  <div className="catalog-price"><div>{product.swatches.map((color) => <span key={color} style={{ backgroundColor: color }} />)}</div><b>{product.price}</b>{product.was && <del>{product.was}</del>}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="rail-hint"><span>{isArabic ? "اسحب أو مرّر للتصفح" : "Drag or scroll to browse"}</span><div><ChevronLeft size={15} /><ChevronRight size={15} /></div></div>
        </section>

        <section id="collections" className="collections-section page-section">
          <div className="collections-intro">
            <p className="kicker">{isArabic ? "اعثر على قطعتك" : isFrench ? "Trouvez votre objet" : "Find your object"}</p>
            <h2>{isArabic ? <>تشكيلاتٌ<br /><em>لما يأتي.</em></> : isFrench ? <>Des collections pour<br /><em>ce qui suit.</em></> : <>Collections for<br /><em>whatever follows.</em></>}</h2>
            <p>{isArabic ? "قرّب ما تحتاج إليه، ودع ما لا تحتاجه." : isFrench ? "Gardez l’utile près de vous. Laissez le reste." : "Keep the useful close. Let the unnecessary go."}</p>
          </div>
          <div className="collection-grid">
            {localizedCollections.map((collection, index) => (
              <a className={`collection-tile collection-tile--${index + 1}`} href="#shop" key={collection.title}>
                <img src={collection.image} alt="" />
                <div className="collection-tile__wash" />
                <div className="collection-tile__caption"><span>{collection.number}</span><div><h3>{collection.title}</h3><p>{collection.description}</p></div><ArrowRight size={17} /></div>
              </a>
            ))}
          </div>
        </section>

        <section id="story" className="craft-section">
          <div className="craft-section__image"><img src="/manus-storage/north-atelier-workshop_151c4843.jpg" alt={isArabic ? "حرفي يخيط قطعة جلدية باليد" : isFrench ? "Artisan cousant une pièce en cuir à la main" : "Artisan stitching a leather piece by hand"} /><span>{isArabic ? "بانكو / دراسة مادة رقم 05" : isFrench ? "Panco / Étude matière no 05" : "Panco / Material study no. 05"}</span></div>
          <div className="craft-section__copy">
            <p className="kicker">{isArabic ? "الفن قبل التجارة" : isFrench ? "L’art avant le commerce" : "Art before commerce"}</p>
            <h2>{isArabic ? <>صُنعت ومعها<br /><em>ذاكرة.</em></> : isFrench ? <>Faite avec<br /><em>une mémoire.</em></> : <>Built with<br /><em>a memory.</em></>}</h2>
            <p className="lead">{isArabic ? "القطعة الجيدة لا تصل مكتملة الحكاية. إنها تكتسب شخصيتها ببطء عبر الأيدي والطقس والمسافة والاستعمال." : isFrench ? "Une belle pièce n’arrive jamais achevée. Elle gagne lentement son caractère, par les mains, le temps, la distance et l’usage." : "A good piece does not arrive finished. It gathers its character slowly — through hands, weather, distance, and use."}</p>
            <p>{isArabic ? "يصنع استوديو بانكو قطعاً جلدية بدفعات هادئة، بمواد كاملة الحبيبات وبناء قابل للإصلاح ومساحة لآثار حياة عاشت جيداً." : isFrench ? "Notre atelier Panco fabrique des objets en cuir en petites séries patientes, avec des matières pleine fleur, une construction réparable et la place pour les traces d’une vie bien portée." : "The Panco studio makes leather objects in patient runs, with full-grain materials, repairable construction, and room for the evidence of a life well carried."}</p>
            <a href="#journal" className="outline-link">{isArabic ? "داخل الاستوديو" : isFrench ? "Dans l’atelier" : "Inside the studio"} <ArrowRight size={15} /></a>
            <div className="craft-figures"><div><b>01</b><span>{isArabic ? <>جلد كامل<br />الحبيبات</> : isFrench ? <>Cuir pleine<br />fleur</> : <>Full-grain<br />leather</>}</span></div><div><b>02</b><span>{isArabic ? <>حواف مشطبة<br />يدوياً</> : isFrench ? <>Tranches finies<br />à la main</> : <>Hand-finished<br />edges</>}</span></div><div><b>03</b><span>{isArabic ? <>بناء مخصص<br />للإصلاح</> : isFrench ? <>Construction<br />réparable</> : <>Repair-led<br />construction</>}</span></div></div>
          </div>
        </section>

        <section className="small-things-section page-section">
          <div className="small-things-copy"><p className="kicker">{isArabic ? "أشياء صغيرة جميلة" : isFrench ? "Les petites belles choses" : "Small good things"}</p><h2>{isArabic ? <>تفاصيل تستحق<br /><em>أن تبقى قريبة.</em></> : isFrench ? <>Des détails à<br /><em>garder près de soi.</em></> : <>Details worth<br /><em>keeping close.</em></>}</h2><a href="#shop" className="underlined-link">{isArabic ? "اكتشف القطع الصغيرة" : isFrench ? "Découvrir la petite maroquinerie" : "Discover small goods"} <ArrowRight size={15} /></a></div>
          <div className="small-things-product"><Link href={`/products/${localizedProducts[0].slug}`}><img src={localizedProducts[0].image} alt={localizedProducts[0].name} /></Link><div><span>{isArabic ? "جديد / 04" : "New / 04"}</span><h3><Link href={`/products/${localizedProducts[0].slug}`}>{localizedProducts[0].name}</Link></h3><p>{localizedProducts[0].description}</p><button type="button" onClick={() => addToCart(localizedProducts[0])}>{copy.quickAdd} <Plus size={14} /></button></div></div>
        </section>

        <section id="journal" className="journal-section">
          <div className="journal-article"><p className="kicker kicker--light">{isArabic ? "من المجلة" : isFrench ? "Depuis le journal" : "From the journal"}</p><h2>{isArabic ? <>لماذا يستحق الجلد<br /><em>هذا الانتظار.</em></> : isFrench ? <>Pourquoi le cuir<br /><em>mérite l’attente.</em></> : <>Why leather is<br /><em>worth the wait.</em></>}</h2><p>{isArabic ? "المواد الطبيعية تحتفظ بحسابها الخاص: كل أثر وتدرج وزاوية ناعمة تصبح دليلاً على الاستعمال." : isFrench ? "Les matières naturelles gardent leur propre trace : chaque marque, nuance et angle adouci devient la preuve de l’usage." : "Natural materials keep their own score: every mark, shade, and softened corner turns into evidence of use."}</p><a href="#top" className="journal-link">{isArabic ? "اقرأ ملاحظة من الميدان" : isFrench ? "Lire la note d’atelier" : "Read field note"} <ArrowRight size={15} /></a></div>
          <div className="journal-image"><img src="/manus-storage/north-atelier-tote_a6b855c4.jpg" alt={isArabic ? "حقيبة جلدية في مساحة معمارية هادئة" : "Leather tote in a quiet architectural setting"} /><span>{isArabic ? "مجلة 06 / صدق المادة" : "Journal 06 / Material honesty"}</span></div>
        </section>

        <section className="newsletter-section page-section">
          <div><p className="kicker">{copy.stayConnected}</p><h2>{copy.notes.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2></div>
          <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}><p>{isArabic ? "قطع جديدة وحكايات من الصنع وأخبار الاستوديو في وقتها. بلا ضجيج." : isFrench ? "Nouveaux objets, histoires de fabrication et nouvelles choisies de l’atelier. Sans bruit." : "New objects, process stories, and carefully timed studio news. No noise."}</p><label htmlFor="newsletter-email">{isArabic ? "البريد الإلكتروني" : isFrench ? "Adresse e-mail" : "Email address"}</label><div><input id="newsletter-email" type="email" placeholder={isArabic ? "name@example.com" : isFrench ? "nom@example.com" : "you@example.com"} /><button aria-label={isArabic ? "اشترك" : isFrench ? "S’inscrire" : "Subscribe"}><ArrowRight size={18} /></button></div><small>{isArabic ? "بالاشتراك، توافق على تلقي مراسلات الاستوديو." : isFrench ? "En vous inscrivant, vous acceptez de recevoir la correspondance de l’atelier." : "By subscribing, you agree to receive studio correspondence."}</small></form>
        </section>

        <section className="faq-section page-section">
          <div className="faq-intro"><p className="kicker">{isArabic ? "معرفة بانكو" : isFrench ? "Le savoir Panco" : "Panco knowledge"}</p><h2>{isArabic ? <>أسئلة<br /><em>مدروسة.</em></> : isFrench ? <>Des questions<br /><em>réfléchies.</em></> : <>Questions,<br /><em>considered.</em></>}</h2><p>{isArabic ? <>هل تحتاج إلى شيء أكثر تحديداً؟ <Link href="/contact">اكتب إلى الاستوديو.</Link></> : isFrench ? <>Besoin de quelque chose de plus précis ? <Link href="/contact">Écrivez à l’atelier.</Link></> : <>Need something more specific? <Link href="/contact">Write to the studio.</Link></>}</p></div>
          <div className="faq-list">
            {localizedFaqItems.map((item, index) => (
              <div className={`faq-item ${openFaq === index ? "faq-item--open" : ""}`} key={item.question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<ChevronDown size={18} /></button>
                {openFaq === index && <p>{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__intro"><a className="footer-brand" href="#top"><PancoLogo variant="light" /></a><p>{isArabic ? "قطع للطريق الطويل. مشطبة يدوياً بعناية ومصممة للاستعمال." : isFrench ? "Des objets pour le long chemin. Finis à la main avec retenue, dessinés pour l’usage." : "Objects for the long way home. Hand-finished with restraint, designed for use."}</p></div>
        <div className="footer__links"><div><p>{isArabic ? "استكشاف" : isFrench ? "Explorer" : "Exploration"}</p><a href="#shop">{copy.nav.shop}</a><a href="#story">{copy.nav.studio}</a><a href="#journal">{copy.nav.journal}</a><a href="#top">{isArabic ? "العناية والإصلاح" : isFrench ? "Soin et réparation" : "Care & repair"}</a></div><div><p>{isArabic ? "عملي" : isFrench ? "Pratique" : "Practical"}</p><a href="#top">{isArabic ? "التوصيل" : isFrench ? "Livraison" : "Delivery"}</a><a href="#top">{isArabic ? "الدفع عند الاستلام" : isFrench ? "Paiement à la livraison" : "Cash on Delivery"}</a><a href="#top">{isArabic ? "الإرجاع" : isFrench ? "Retours" : "Returns"}</a><Link href="/contact">{isArabic ? "تواصل معنا" : isFrench ? "Contact" : "Contact"}</Link></div><div><p>{isArabic ? "تابعنا" : isFrench ? "Suivre" : "Follow"}</p><a href="#top">Instagram</a><a href="#top">Pinterest</a><a href="#top">{isArabic ? "النشرة البريدية" : isFrench ? "Newsletter" : "Newsletter"}</a></div></div>
        <div className="footer__base"><span>© 2026 Panco</span><span>{isArabic ? "صُنع ببطء. استُخدم جيداً." : isFrench ? "Fait lentement. Bien porté." : "Made slowly. Used well."}</span><span>{isArabic ? "الخصوصية / الشروط" : isFrench ? "Confidentialité / Conditions" : "Privacy / Terms"}</span></div>
      </footer>

      {menuOpen && <div className="mobile-menu" role="dialog" aria-modal="true"><div className="mobile-menu__head"><a className="house-mark house-mark--dark" href="#top"><PancoLogo variant="dark" /></a><button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"}><X size={20} /></button></div><nav><a href="#shop" onClick={() => setMenuOpen(false)}><span>01</span> {copy.nav.shop} <ArrowRight size={18} /></a><a href="#collections" onClick={() => setMenuOpen(false)}><span>02</span> {isArabic ? "التشكيلات" : "Collections"} <ArrowRight size={18} /></a><a href="#story" onClick={() => setMenuOpen(false)}><span>03</span> {copy.nav.studio} <ArrowRight size={18} /></a><a href="#journal" onClick={() => setMenuOpen(false)}><span>04</span> {copy.nav.journal} <ArrowRight size={18} /></a><Link href="/contact" onClick={() => setMenuOpen(false)}><span>05</span> {isArabic ? "تواصل" : isFrench ? "Contact" : "Contact"} <ArrowRight size={18} /></Link></nav><button className="mobile-menu__search" type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}><Search size={17} /> {isArabic ? "ابحث في بانكو" : isFrench ? "Rechercher Panco" : "Search Panco"}</button></div>}

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true"><button type="button" className="search-overlay__close" onClick={() => setSearchOpen(false)} aria-label={isArabic ? "إغلاق البحث" : "Close search"}><X size={22} /></button><div><p className="kicker">{isArabic ? "ابحث في بانكو" : isFrench ? "Rechercher Panco" : "Search Panco"}</p><input autoFocus placeholder={isArabic ? "جرّب «محفظة» أو «سفر»" : "Try ‘card wallet’ or ‘travel’"} /><div className="search-suggestions"><span>{isArabic ? "مقترحات" : "Suggested"}</span><button onClick={() => setSearchOpen(false)}>{isArabic ? "حمل يومي" : "Daily carry"}</button><button onClick={() => setSearchOpen(false)}>{isArabic ? "سفر" : "Travel"}</button><button onClick={() => setSearchOpen(false)}>{isArabic ? "عناية" : "Care"}</button></div></div></div>}

      <div className={`drawer-backdrop ${cartOpen ? "drawer-backdrop--open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`bag-drawer ${cartOpen ? "bag-drawer--open" : ""}`} aria-label={isArabic ? "حقيبة التسوق" : isFrench ? "Sac" : "Shopping bag"}>
        <div className="bag-drawer__header"><span>{isArabic ? "حقيبتك" : isFrench ? "Votre sac" : "Your bag"} {cartCount ? `(${cartCount})` : ""}</span><button type="button" onClick={() => setCartOpen(false)} aria-label={isArabic ? "إغلاق الحقيبة" : isFrench ? "Fermer le sac" : "Close bag"}><X size={20} /></button></div>
        {cartCount && cartItem ? <div className="bag-drawer__filled"><div className="bag-item"><img src={cartItem.image} alt={cartItem.name} /><div><p>{cartItem.name}</p><small>{cartItem.category}</small><b>{cartItem.price}</b><div className="quantity"><button type="button" onClick={removeOne}><Minus size={13} /></button><span>{cartCount}</span><button type="button" onClick={() => setCartCount((count) => count + 1)}><Plus size={13} /></button></div></div></div><div className="bag-benefits"><p><Truck size={16} /> {isArabic ? "توصيل مجاني للطلبات فوق 150 دولار" : isFrench ? "Livraison offerte dès 150 $" : "Complimentary delivery over $150"}</p><p><PackageCheck size={16} /> {isArabic ? "الدفع عند الاستلام متاح" : isFrench ? "Paiement à la livraison disponible" : "Cash on Delivery available"}</p></div><button type="button" className="checkout-button" onClick={openCheckout}>{isArabic ? "إتمام الطلب" : isFrench ? "Commander" : "Checkout"} <ArrowRight size={16} /></button><span className="bag-note">{isArabic ? "اختر الدفع عند الاستلام في الخطوة التالية." : isFrench ? "Choisissez le paiement à la livraison à l’étape suivante." : "Choose Cash on Delivery at the next step."}</span></div> : <div className="bag-drawer__empty"><ShoppingBag size={28} strokeWidth={1.35} /><h3>{isArabic ? "حقيبتك فارغة." : isFrench ? "Votre sac est vide." : "Your bag is empty."}</h3><p>{isArabic ? "ابدأ بقطعة ستعود إليها كثيراً." : isFrench ? "Commencez par un objet que vous aimerez retrouver souvent." : "Start with an object you will reach for often."}</p><button type="button" onClick={() => { setCartOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>{isArabic ? "اكتشف التشكيلة" : isFrench ? "Explorer la sélection" : "Explore the edit"} <ArrowRight size={15} /></button></div>}
      </aside>

      {checkoutOpen && <div className="checkout-overlay" role="dialog" aria-modal="true" aria-label={isArabic ? "إتمام طلب الدفع عند الاستلام" : "Cash on Delivery checkout"}><div className="checkout-card"><button className="checkout-close" type="button" onClick={() => setCheckoutOpen(false)} aria-label={isArabic ? "إغلاق الطلب" : "Close checkout"}><X size={20} /></button>{orderSubmitted ? <div className="order-success"><span><Check size={26} /></span><p className="kicker">{isArabic ? "تم إرسال الطلب" : isFrench ? "Demande envoyée" : "Order request sent"}</p><h2>{isArabic ? <>سنؤكد<br /><em>تفاصيل التوصيل.</em></> : isFrench ? <>Nous confirmerons<br /><em>les détails de livraison.</em></> : <>We’ll confirm your<br /><em>delivery details.</em></>}</h2><p>{isArabic ? "أُرسل طلب الدفع عند الاستلام إلى فريق بانكو. سنتصل بك قبل الشحن." : isFrench ? "Votre demande de paiement à la livraison a été envoyée à Panco. Nous vous appellerons avant l’expédition." : "Your Panco Cash on Delivery request has been sent to the order desk. We will call before dispatch."}</p><button type="button" onClick={() => setCheckoutOpen(false)}>{isArabic ? "العودة إلى الاستوديو" : isFrench ? "Retour à l’atelier" : "Back to the atelier"} <ArrowRight size={15} /></button></div> : <form onSubmit={submitCheckout}><p className="kicker">{isArabic ? "إتمام الطلب / الخطوة 01" : isFrench ? "Commande / étape 01" : "Checkout / step 01"}</p><h2>{isArabic ? "تفاصيل التوصيل" : isFrench ? "Détails de livraison" : "Delivery details"}</h2><p className="checkout-card__intro">{isArabic ? "يُدفع المبلغ عند وصول الطلب." : isFrench ? "Le montant est collecté à la livraison." : "Your total is collected when the order is delivered."}</p><div className="checkout-fields"><label>{isArabic ? "الاسم الكامل" : isFrench ? "Nom complet" : "Full name"}<input required name="customerName" placeholder={isArabic ? "الاسم المستلم" : isFrench ? "Nom du destinataire" : "Name on the delivery"} /></label><label>{isArabic ? "رقم الهاتف" : isFrench ? "Numéro de téléphone" : "Phone number"}<input required name="phone" type="tel" placeholder={isArabic ? "لتأكيد التوصيل" : isFrench ? "Pour confirmer la livraison" : "For delivery confirmation"} /></label><label className="span-two">{isArabic ? "عنوان التوصيل" : isFrench ? "Adresse de livraison" : "Delivery address"}<input required name="address" placeholder={isArabic ? "الشارع والبناية والمنطقة" : isFrench ? "Rue, bâtiment, quartier" : "Street, building, area"} /></label><label>{isArabic ? "المدينة" : isFrench ? "Ville" : "City"}<input required name="city" placeholder={isArabic ? "مدينتك" : isFrench ? "Votre ville" : "Your city"} /></label><label>{isArabic ? "ملاحظة الطلب" : isFrench ? "Note de commande" : "Order note"}<input name="note" placeholder={isArabic ? "اختياري" : isFrench ? "Facultatif" : "Optional"} /></label></div><fieldset><legend>{isArabic ? "طريقة الدفع" : isFrench ? "Mode de paiement" : "Payment method"}</legend><label className="payment-option payment-option--selected"><input type="radio" name="payment" defaultChecked /><span><Truck size={19} /></span><div><b>{isArabic ? "الدفع عند الاستلام" : isFrench ? "Paiement à la livraison" : "Cash on Delivery"}</b><small>{isArabic ? "ادفع للمندوب عند وصول طلبك." : isFrench ? "Payez le coursier à l’arrivée de votre commande." : "Pay the courier once your order arrives."}</small></div><Check size={16} /></label><label className="payment-option payment-option--muted"><input type="radio" name="payment" disabled /><span><ShieldCheck size={19} /></span><div><b>{isArabic ? "الدفع عبر الإنترنت" : isFrench ? "Paiement en ligne" : "Pay online"}</b><small>{isArabic ? "أضف مزود دفع لاحقاً." : isFrench ? "Ajoutez un prestataire de paiement plus tard." : "Connect a payment provider later."}</small></div></label></fieldset>{submitCashOnDelivery.error && <p className="direct-order-error" role="alert">{submitCashOnDelivery.error.message}</p>}<button className="place-order" type="submit" disabled={submitCashOnDelivery.isPending}>{submitCashOnDelivery.isPending ? (isArabic ? "يجري إرسال الطلب…" : isFrench ? "Envoi de la demande…" : "Sending request…") : (isArabic ? "تقديم طلب الدفع عند الاستلام" : isFrench ? "Envoyer la demande" : "Place Cash on Delivery request")} <ArrowRight size={16} /></button><p className="checkout-footnote">{isArabic ? "يُرسل طلبك بأمان إلى فريق بانكو للتأكيد." : isFrench ? "Votre demande est envoyée de manière sécurisée à Panco pour confirmation." : "Your request is sent securely to the Panco order desk for confirmation."}</p></form>}</div></div>}
    </div>
  );
}
