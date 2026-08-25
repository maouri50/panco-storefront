/**
 * North Atelier style note — Patina Modernism:
 * warm paper, atelier green, serif editorial scale, mono product data,
 * asymmetric visual seams, subtle craftsmanship-oriented motion.
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

const products = [
  {
    name: "Brink Card Holder",
    type: "Small leather goods",
    price: "$78",
    image: "/manus-storage/north-atelier-cardholder_12ba7095.jpg",
    tone: "Oxblood",
  },
  {
    name: "Ridge Carryall",
    type: "Everyday carry",
    price: "$248",
    image: "/manus-storage/north-atelier-tote_a6b855c4.jpg",
    tone: "Saddle",
  },
  {
    name: "Northbound Weekender",
    type: "Travel collection",
    price: "$320",
    image: "/manus-storage/north-atelier-weekender_e238bcf4.webp",
    tone: "Chestnut",
  },
];

const navItems = [
  { label: "Collection", href: "#collection" },
  { label: "Our materials", href: "#materials" },
  { label: "The journal", href: "#journal" },
];

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const addToCart = () => {
    setCartCount((count) => count + 1);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f2ebdd] text-[#1d211e]">
      <div className="announcement-bar">
        <span>Free ground delivery on orders over $150</span>
        <span className="hidden sm:inline">Hand-finished in limited runs</span>
      </div>

      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="site-header__inner">
          <button
            type="button"
            aria-label="Open navigation"
            className="header-icon lg:hidden"
            onClick={() => setMenuOpen(true)}>
            <Menu size={21} strokeWidth={1.5} />
          </button>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {navItems.map((item, index) => (
              <a className={`nav-link ${index === 0 ? "nav-link--active" : ""}`} href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="brand-lockup" href="#top" aria-label="North Atelier home">
            <img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" className="brand-mark" />
            <span className="brand-monogram">N/A</span>
            <span className="brand-type">North Atelier</span>
          </a>

          <div className="header-actions">
            <button type="button" aria-label="Search" className="header-icon hidden sm:grid" onClick={() => setSearchOpen(true)}>
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="Open shopping bag" className="header-icon header-bag" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section" aria-label="North Atelier introduction">
          <img src="/manus-storage/north-atelier-hero_6fac9d50.jpg" alt="Handcrafted leather travel bag in a workshop" className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-house-mark" aria-hidden="true">
            <img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" />
            <span>N/A</span>
            <small>North Atelier<br />Hand-finished objects</small>
          </div>
          <div className="hero-rail" aria-hidden="true">
            <span>01</span>
            <div />
            <span>Field carry</span>
          </div>
          <div className="hero-content">
            <p className="eyebrow eyebrow--light">Objects for the long way home</p>
            <h1>
              Made for the
              <em> miles between.</em>
            </h1>
            <a className="solid-cta" href="#collection">
              Explore the collection <ArrowRight size={16} />
            </a>
          </div>
          <div className="hero-footnote">
            <span>Full-grain leather</span>
            <span className="hero-footnote__divider" />
            <span>Limited workshop editions</span>
          </div>
        </section>

        <section id="collection" className="collection-section">
          <div className="section-head section-head--offset">
            <div>
              <div className="section-signature" aria-hidden="true"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><span>N/A / object ledger</span></div>
              <p className="eyebrow">The essential edit</p>
              <h2>Everyday, <em>considered.</em></h2>
            </div>
            <a href="#materials" className="text-link">
              View all objects <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="product-list">
            {products.map((product, index) => (
              <article className={`product-card product-card--${index + 1}`} key={product.name}>
                <div className="product-image-wrap">
                  <span className="product-index">0{index + 1}</span>
                  <img src={product.image} alt={product.name} className="product-image" />
                  <button className="quick-add" type="button" onClick={addToCart} aria-label={`Add ${product.name} to bag`}>
                    <Plus size={16} /> <span>Add to bag</span>
                  </button>
                </div>
                <div className="product-meta">
                  <div>
                    <p className="product-type">{product.type}</p>
                    <h3>{product.name}</h3>
                  </div>
                  <div className="product-price">
                    <span className="color-swatch" style={{ backgroundColor: index === 0 ? "#6b2c32" : index === 1 ? "#9b532f" : "#5b321f" }} />
                    <span>{product.price}</span>
                  </div>
                </div>
                <p className="product-tone">{product.tone} / vegetable-tanned</p>
                <p className="product-annotation">{index === 0 ? "R-01 / four slots, folded bill" : index === 1 ? "R-02 / shoulder-ready, brass-clasped" : "R-03 / soft-sided, weekend-sized"}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="materials" className="materials-section">
          <div className="materials-image-panel">
            <img src="/manus-storage/north-atelier-workshop_151c4843.jpg" alt="Leather artisan working by hand at a wooden workbench" />
            <span className="image-note">Hands, not shortcuts.</span>
          </div>
          <div className="materials-copy">
            <div className="material-count">02 / Material study</div>
            <h2>Good leather<br />gets better <em>with time.</em></h2>
            <p>
              We choose full-grain hides for the evidence they keep: the marks, the grain, the slow deepening of color. Each piece is cut, stitched, and burnished in small runs.
            </p>
            <a href="#journal" className="outline-cta">The making of a carryall <ChevronRight size={16} /></a>
            <div className="material-notes">
              <div><strong>01</strong><span>Vegetable-tanned<br />full grain</span></div>
              <div><strong>02</strong><span>Solid brass<br />hardware</span></div>
              <div><strong>03</strong><span>Reparable by<br />design</span></div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <div className="quote-token" aria-hidden="true"><span>NA</span></div>
          <p className="eyebrow">Why we make</p>
          <blockquote>“A well-used object should carry a little more of you every year.”</blockquote>
          <span className="quote-signoff">North Atelier / workshop note no. 14</span>
        </section>

        <section id="journal" className="journal-section">
          <div className="journal-card journal-card--ink">
            <span className="journal-number">03</span>
            <p className="eyebrow eyebrow--light">Field notes</p>
            <h2>Designed to leave the house.</h2>
            <a href="#top" className="journal-link">Read the journal <ArrowRight size={16} /></a>
          </div>
          <div className="journal-card journal-card--paper">
            <div className="journal-card__topline"><span>Care guide</span><span>05 min read</span></div>
            <h3>How to let leather wear in, not wear out.</h3>
            <div className="journal-rule" />
            <p>Small rituals for the pieces you reach for every day.</p>
            <a href="#top" aria-label="Read care guide" className="round-arrow"><ArrowUpRight size={20} /></a>
          </div>
        </section>

        <section className="newsletter-section">
          <div>
            <p className="eyebrow">Northbound dispatches</p>
            <h2>Notes from the<br /><em>workshop.</em></h2>
          </div>
          <form className="newsletter-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="email">An occasional note on materials, making, and new pieces.</label>
            <div className="input-row">
              <input id="email" type="email" placeholder="Email address" aria-label="Email address" />
              <button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
            </div>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" />
          <span>North Atelier</span>
        </div>
        <p>Crafted slowly, meant to go far.</p>
        <div className="footer-links"><a href="#top">Instagram</a><a href="#top">Contact</a><a href="#top">Shipping</a></div>
      </footer>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="mobile-menu__head">
            <span className="brand-type">North Atelier</span>
            <button type="button" className="header-icon" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={20} /></button>
          </div>
          <nav>
            {navItems.map((item, index) => <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{item.label}<ArrowUpRight size={18} /></a>)}
          </nav>
          <button className="mobile-search" type="button" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}><Search size={17} /> Search the atelier</button>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search North Atelier">
          <button type="button" className="search-close" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button>
          <div className="search-panel">
            <p className="eyebrow">Search the atelier</p>
            <input autoFocus placeholder="Try “weekender” or “card holder”" />
            <div className="suggested-searches"><span>Suggested:</span><button onClick={() => setSearchOpen(false)}>Travel</button><button onClick={() => setSearchOpen(false)}>Small goods</button><button onClick={() => setSearchOpen(false)}>Care</button></div>
          </div>
        </div>
      )}

      <div className={`cart-backdrop ${cartOpen ? "cart-backdrop--open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "cart-drawer--open" : ""}`} aria-label="Shopping bag">
        <div className="cart-drawer__head"><span>Your bag {cartCount ? `(${cartCount})` : ""}</span><button onClick={() => setCartOpen(false)} type="button" aria-label="Close bag"><X size={20} /></button></div>
        {cartCount === 0 ? (
          <div className="cart-empty"><ShoppingBag size={25} strokeWidth={1.3} /><h3>Your bag is waiting.</h3><p>Choose an object made for the way you move.</p><button type="button" onClick={() => { setCartOpen(false); document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }); }}>Explore the collection <ArrowRight size={15} /></button></div>
        ) : (
          <div className="cart-filled"><div className="cart-item"><img src="/manus-storage/north-atelier-cardholder_12ba7095.jpg" alt="Brink Card Holder" /><div><p>Brink Card Holder</p><span>Oxblood / $78</span><div className="quantity-controls"><button onClick={() => setCartCount((value) => Math.max(0, value - 1))}><Minus size={13} /></button><span>{cartCount}</span><button onClick={() => setCartCount((value) => value + 1)}><Plus size={13} /></button></div></div></div><button className="checkout-button" type="button">Proceed to checkout <ArrowRight size={16} /></button><p className="cart-caption">Complimentary delivery over $150.</p></div>
        )}
      </aside>
    </div>
  );
}
