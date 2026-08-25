/**
 * North Atelier style note — Coastal Ledger:
 * a reference-inspired retail rhythm built from shell paper, inset blue, ember accents,
 * centered house mark, oversized campaign imagery, and crisp mono retail annotations.
 */
import { useEffect, useState } from "react";
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
import { catalogProducts, type Product } from "@/lib/catalog";

/** EDITABLE CONTENT: original campaign slides for the hero carousel. */
const heroSlides = [
  {
    eyebrow: "The summer field edit",
    title: "Carry the day\nwith you.",
    note: "Slow-made companions for daily miles, night trains, and long returns.",
    cta: "Shop the edit",
    image: "/manus-storage/north-atelier-hero_6fac9d50.jpg",
    align: "hero-content--left",
  },
  {
    eyebrow: "For the in-between",
    title: "Room for\nwhat matters.",
    note: "A study in soft architecture, practical pockets, and enduring leather.",
    cta: "Explore bags",
    image: "/manus-storage/north-atelier-tote_a6b855c4.jpg",
    align: "hero-content--right",
  },
  {
    eyebrow: "Made by hand",
    title: "The evidence\nof care.",
    note: "Each edge is burnished, every seam considered, and nothing rushed.",
    cta: "Meet the makers",
    image: "/manus-storage/north-atelier-workshop_151c4843.jpg",
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

const faqItems = [
  { question: "What leather do you use?", answer: "We work with vegetable-tanned, full-grain leather selected for its natural character and ability to develop a personal patina." },
  { question: "Are the pieces handmade?", answer: "Each collection is produced in small workshop runs with hand cutting, stitching, edge finishing, and final inspection." },
  { question: "Does the leather change over time?", answer: "Yes. Sun, touch, and daily use gradually deepen the finish. The marks are part of the record your piece keeps." },
  { question: "How does Cash on Delivery work?", answer: "Select Cash on Delivery at checkout, then pay the agreed order total when your parcel is delivered. A delivery confirmation is required before dispatch." },
  { question: "Can I request a repair?", answer: "For a considered repair request, contact the studio with a clear photo of the piece and we will advise on the next step." },
];

const promos = ["Complimentary delivery over $150", "Cash on Delivery available", "Small-run objects, dispatched weekly"];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
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

  useEffect(() => {
    const slideTimer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 6200);
    const promoTimer = window.setInterval(() => setPromoIndex((current) => (current + 1) % promos.length), 3400);
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearInterval(slideTimer);
      window.clearInterval(promoTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
    setOrderSubmitted(true);
  };

  const slide = heroSlides[activeSlide];

  return (
    <div className="storefront">
      <div className="utility-bar">
        <button type="button" className="utility-locale" onClick={() => setLocaleOpen((value) => !value)}>
          <Globe2 size={13} /> English <ChevronDown size={12} />
        </button>
        {localeOpen && (
          <div className="locale-menu" role="menu">
            <button type="button" onClick={() => setLocaleOpen(false)}>English <small>International</small></button>
            <button type="button" onClick={() => setLocaleOpen(false)}>Français <small>Europe & Afrique</small></button>
            <button type="button" onClick={() => setLocaleOpen(false)}>العربية <small>Morocco & Middle East</small></button>
          </div>
        )}
        <span className="utility-message" key={promoIndex}>{promos[promoIndex]}</span>
        <span className="utility-side">North Atelier / Since 2024</span>
      </div>

      <header className={`top-nav ${scrolled ? "top-nav--solid" : ""}`}>
        <div className="top-nav__side top-nav__side--left">
          <button type="button" aria-label="Open navigation" className="icon-button top-nav__menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#shop">Shop</a>
            <a href="#story">Studio</a>
            <a href="#journal">Journal</a>
          </nav>
        </div>
        <a className="house-mark" href="#top" aria-label="North Atelier home">
          <img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" />
          <span className="house-mark__type"><b>N/A</b><i /> North Atelier</span>
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
        <section className="hero-carousel" aria-label="Featured North Atelier campaign">
          <img src={slide.image} alt="North Atelier collection" className="hero-carousel__image" key={slide.image} />
          <div className="hero-carousel__wash" />
          <div className="hero-house-stamp" aria-hidden="true"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><div><b>N/A</b><span>North Atelier</span><small>Objects / studio ledger</small></div></div>
          <div className={`hero-content ${slide.align}`}>
            <p className="kicker kicker--light">{slide.eyebrow}</p>
            <h1>{slide.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p className="hero-copy">{slide.note}</p>
            <a href="#shop" className="hero-cta">{slide.cta} <ArrowRight size={16} /></a>
          </div>
          <div className="hero-carousel__footer">
            <span>01 — Workshop objects</span>
            <div className="hero-pagination" aria-label="Select campaign slide">
              {heroSlides.map((item, index) => <button type="button" aria-label={`View slide ${index + 1}`} className={index === activeSlide ? "is-active" : ""} onClick={() => setActiveSlide(index)} key={item.title} />)}
            </div>
            <span>Made in measured runs</span>
          </div>
        </section>

        <section id="shop" className="product-section page-section">
          <div className="section-heading">
            <div>
              <p className="kicker">New arrivals</p>
              <h2>Objects for<br /><em>the everyday.</em></h2>
            </div>
            <a href="#collections" className="underlined-link">See all collections <ArrowRight size={15} /></a>
          </div>
          <div className="product-rail">
            {catalogProducts.map((product, index) => (
              <article className="catalog-card" key={product.name}>
                <div className="catalog-card__image">
                  <Link href={`/products/${product.slug}`} className="catalog-card__link"><img src={product.image} alt={product.name} /></Link>
                  <span className="catalog-number">{String(index + 1).padStart(2, "0")}</span>
                  {product.tag && <span className="catalog-tag">{product.tag}</span>}
                  <button type="button" onClick={() => addToCart(product)} className="card-add">Quick add <Plus size={14} /></button>
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
          <div className="rail-hint"><span>Drag or scroll to browse</span><div><ChevronLeft size={15} /><ChevronRight size={15} /></div></div>
        </section>

        <section id="collections" className="collections-section page-section">
          <div className="collections-intro">
            <p className="kicker">Find your object</p>
            <h2>Collections for<br /><em>whatever follows.</em></h2>
            <p>Keep the useful close. Let the unnecessary go.</p>
          </div>
          <div className="collection-grid">
            {collections.map((collection, index) => (
              <a className={`collection-tile collection-tile--${index + 1}`} href="#shop" key={collection.title}>
                <img src={collection.image} alt="" />
                <div className="collection-tile__wash" />
                <div className="collection-tile__caption"><span>{collection.number}</span><div><h3>{collection.title}</h3><p>{collection.description}</p></div><ArrowRight size={17} /></div>
              </a>
            ))}
          </div>
        </section>

        <section id="story" className="craft-section">
          <div className="craft-section__image"><img src="/manus-storage/north-atelier-workshop_151c4843.jpg" alt="Artisan stitching a leather piece by hand" /><span>North Atelier / Material study no. 05</span></div>
          <div className="craft-section__copy">
            <p className="kicker">Art before commerce</p>
            <h2>Built with<br /><em>a memory.</em></h2>
            <p className="lead">A good piece does not arrive finished. It gathers its character slowly — through hands, weather, distance, and use.</p>
            <p>Our studio makes leather objects in patient runs, with full-grain materials, repairable construction, and room for the evidence of a life well carried.</p>
            <a href="#journal" className="outline-link">Inside the studio <ArrowRight size={15} /></a>
            <div className="craft-figures"><div><b>01</b><span>Full-grain<br />leather</span></div><div><b>02</b><span>Hand-finished<br />edges</span></div><div><b>03</b><span>Repair-led<br />construction</span></div></div>
          </div>
        </section>

        <section className="small-things-section page-section">
          <div className="small-things-copy"><p className="kicker">Small good things</p><h2>Details worth<br /><em>keeping close.</em></h2><a href="#shop" className="underlined-link">Discover small goods <ArrowRight size={15} /></a></div>
          <div className="small-things-product"><Link href={`/products/${catalogProducts[0].slug}`}><img src="/manus-storage/north-atelier-cardholder_12ba7095.jpg" alt="North Atelier card wallet" /></Link><div><span>New / 04</span><h3><Link href={`/products/${catalogProducts[0].slug}`}>Atlas Card Wallet</Link></h3><p>Compact, exacting, and soft at the edges.</p><button type="button" onClick={() => addToCart(catalogProducts[0])}>Add to bag <Plus size={14} /></button></div></div>
        </section>

        <section id="journal" className="journal-section">
          <div className="journal-article"><p className="kicker kicker--light">From the journal</p><h2>Why leather is<br /><em>worth the wait.</em></h2><p>Natural materials keep their own score: every mark, shade, and softened corner turns into evidence of use.</p><a href="#top" className="journal-link">Read field note <ArrowRight size={15} /></a></div>
          <div className="journal-image"><img src="/manus-storage/north-atelier-tote_a6b855c4.jpg" alt="Leather tote in a quiet architectural setting" /><span>Journal 06 / Material honesty</span></div>
        </section>

        <section className="newsletter-section page-section">
          <div><p className="kicker">Stay connected</p><h2>Occasional notes<br /><em>from the studio.</em></h2></div>
          <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}><p>New objects, process stories, and carefully timed studio news. No noise.</p><label htmlFor="newsletter-email">Email address</label><div><input id="newsletter-email" type="email" placeholder="you@example.com" /><button aria-label="Subscribe"><ArrowRight size={18} /></button></div><small>By subscribing, you agree to receive studio correspondence.</small></form>
        </section>

        <section className="faq-section page-section">
          <div className="faq-intro"><p className="kicker">North Atelier knowledge</p><h2>Questions,<br /><em>considered.</em></h2><p>Need something more specific? <a href="#top">Write to the studio.</a></p></div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div className={`faq-item ${openFaq === index ? "faq-item--open" : ""}`} key={item.question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<ChevronDown size={18} /></button>
                {openFaq === index && <p>{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__intro"><a className="footer-brand" href="#top"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><span>North Atelier</span></a><p>Objects for the long way home. Hand-finished with restraint, designed for use.</p></div>
        <div className="footer__links"><div><p>Exploration</p><a href="#shop">Shop</a><a href="#story">Studio</a><a href="#journal">Journal</a><a href="#top">Care & repair</a></div><div><p>Practical</p><a href="#top">Delivery</a><a href="#top">Cash on Delivery</a><a href="#top">Returns</a><a href="#top">Contact</a></div><div><p>Follow</p><a href="#top">Instagram</a><a href="#top">Pinterest</a><a href="#top">Newsletter</a></div></div>
        <div className="footer__base"><span>© 2026 North Atelier</span><span>Made slowly. Used well.</span><span>Privacy / Terms</span></div>
      </footer>

      {menuOpen && <div className="mobile-menu" role="dialog" aria-modal="true"><div className="mobile-menu__head"><a className="house-mark house-mark--dark" href="#top"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><span className="house-mark__type"><b>N/A</b><i /> North Atelier</span></a><button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button></div><nav><a href="#shop" onClick={() => setMenuOpen(false)}><span>01</span> Shop <ArrowRight size={18} /></a><a href="#collections" onClick={() => setMenuOpen(false)}><span>02</span> Collections <ArrowRight size={18} /></a><a href="#story" onClick={() => setMenuOpen(false)}><span>03</span> Studio <ArrowRight size={18} /></a><a href="#journal" onClick={() => setMenuOpen(false)}><span>04</span> Journal <ArrowRight size={18} /></a></nav><button className="mobile-menu__search" type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}><Search size={17} /> Search North Atelier</button></div>}

      {searchOpen && <div className="search-overlay" role="dialog" aria-modal="true"><button type="button" className="search-overlay__close" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button><div><p className="kicker">Search the atelier</p><input autoFocus placeholder="Try ‘card wallet’ or ‘travel’" /><div className="search-suggestions"><span>Suggested</span><button onClick={() => setSearchOpen(false)}>Daily carry</button><button onClick={() => setSearchOpen(false)}>Travel</button><button onClick={() => setSearchOpen(false)}>Care</button></div></div></div>}

      <div className={`drawer-backdrop ${cartOpen ? "drawer-backdrop--open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`bag-drawer ${cartOpen ? "bag-drawer--open" : ""}`} aria-label="Shopping bag">
        <div className="bag-drawer__header"><span>Your bag {cartCount ? `(${cartCount})` : ""}</span><button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20} /></button></div>
        {cartCount && cartItem ? <div className="bag-drawer__filled"><div className="bag-item"><img src={cartItem.image} alt={cartItem.name} /><div><p>{cartItem.name}</p><small>{cartItem.category}</small><b>{cartItem.price}</b><div className="quantity"><button type="button" onClick={removeOne}><Minus size={13} /></button><span>{cartCount}</span><button type="button" onClick={() => setCartCount((count) => count + 1)}><Plus size={13} /></button></div></div></div><div className="bag-benefits"><p><Truck size={16} /> Complimentary delivery over $150</p><p><PackageCheck size={16} /> Cash on Delivery available</p></div><button type="button" className="checkout-button" onClick={openCheckout}>Checkout <ArrowRight size={16} /></button><span className="bag-note">Choose Cash on Delivery at the next step.</span></div> : <div className="bag-drawer__empty"><ShoppingBag size={28} strokeWidth={1.35} /><h3>Your bag is empty.</h3><p>Start with an object you will reach for often.</p><button type="button" onClick={() => { setCartOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>Explore the edit <ArrowRight size={15} /></button></div>}
      </aside>

      {checkoutOpen && <div className="checkout-overlay" role="dialog" aria-modal="true" aria-label="Cash on Delivery checkout"><div className="checkout-card"><button className="checkout-close" type="button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X size={20} /></button>{orderSubmitted ? <div className="order-success"><span><Check size={26} /></span><p className="kicker">Order request recorded</p><h2>We’ll confirm your<br /><em>delivery details.</em></h2><p>Your Cash on Delivery selection has been noted. This prototype does not submit a real order yet.</p><button type="button" onClick={() => setCheckoutOpen(false)}>Back to the atelier <ArrowRight size={15} /></button></div> : <form onSubmit={submitCheckout}><p className="kicker">Checkout / step 01</p><h2>Delivery details</h2><p className="checkout-card__intro">Your total is collected when the order is delivered.</p><div className="checkout-fields"><label>Full name<input required placeholder="Name on the delivery" /></label><label>Phone number<input required type="tel" placeholder="For delivery confirmation" /></label><label className="span-two">Delivery address<input required placeholder="Street, building, area" /></label><label>City<input required placeholder="Your city" /></label><label>Order note<input placeholder="Optional" /></label></div><fieldset><legend>Payment method</legend><label className="payment-option payment-option--selected"><input type="radio" name="payment" defaultChecked /><span><Truck size={19} /></span><div><b>Cash on Delivery</b><small>Pay the courier once your order arrives.</small></div><Check size={16} /></label><label className="payment-option payment-option--muted"><input type="radio" name="payment" disabled /><span><ShieldCheck size={19} /></span><div><b>Pay online</b><small>Connect a payment provider later.</small></div></label></fieldset><button className="place-order" type="submit">Place Cash on Delivery request <ArrowRight size={16} /></button><p className="checkout-footnote">This is an editable storefront prototype. Connect Shopify or another commerce backend to collect real order data.</p></form>}</div></div>}
    </div>
  );
}
