/**
 * North Atelier style note — Coastal Ledger product page:
 * split gallery / purchase ledger, sharp paper panels, original material data,
 * and an explicit Cash on Delivery path without copying third-party content.
 */
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { catalogProducts, getProduct } from "@/lib/catalog";

const detailItems = [
  { title: "Materials & construction", text: "Full-grain vegetable-tanned leather, solid hardware, hand-burnished edges, and hand-checked stitching. Natural shifts in grain and tone are expected and welcomed." },
  { title: "Personal marking", text: "A small heat-stamped monogram area can be requested for selected objects. Add a note when you place a Cash on Delivery request and the studio will confirm availability." },
  { title: "Care & repair", text: "Wipe with a soft dry cloth and condition only when the leather feels dry. For a repair assessment, contact the studio with clear photos of your piece." },
  { title: "Delivery & Cash on Delivery", text: "Cash on Delivery is available at checkout. We will confirm your name, delivery address, and phone number before dispatch. Payment is collected once your order arrives." },
];

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const product = getProduct(params?.slug ?? "") ?? catalogProducts[0];
  const [selectedImage, setSelectedImage] = useState(product.gallery[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [bagOpen, setBagOpen] = useState(false);
  const [directOrderOpen, setDirectOrderOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [openDetail, setOpenDetail] = useState<number | null>(0);

  const selectColor = (color: typeof product.colors[number]) => {
    setSelectedColor(color);
    setSelectedImage(color.image);
  };

  return (
    <div className="product-page">
      <div className="product-page__bar"><Link href="/" className="product-page__back"><ArrowLeft size={14} /> Back to the atelier</Link><span>Cash on Delivery available</span><span>North Atelier / Product ledger</span></div>
      <header className="product-page__nav"><Link href="/" className="product-page__brand"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><span><b>N/A</b><i /> North Atelier</span></Link><div><Link href="/#shop">Shop</Link><Link href="/#story">Studio</Link><button type="button" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /> {bagOpen ? "" : quantity}</button></div></header>

      <main className="product-detail">
        <section className="product-detail__gallery">
          <div className="gallery-thumbs" aria-label="Product image selection">
            {product.gallery.map((image, index) => <button type="button" key={`${image}-${index}`} className={selectedImage === image ? "is-active" : ""} onClick={() => setSelectedImage(image)}><img src={image} alt={`${product.name} view ${index + 1}`} /></button>)}
          </div>
          <div className="gallery-stage"><img src={selectedImage} alt={product.name} /><span>{String(product.gallery.indexOf(selectedImage) + 1).padStart(2, "0")} / {String(product.gallery.length).padStart(2, "0")}</span></div>
          <div className="gallery-grid">
            {product.gallery.map((image, index) => <button type="button" className={`gallery-grid__plate gallery-grid__plate--${index + 1}`} key={`${image}-${index}`} onClick={() => setSelectedImage(image)}><img src={image} alt={`${product.name} material detail ${index + 1}`} /></button>)}
          </div>
        </section>

        <aside className="product-detail__purchase">
          <nav className="breadcrumb"><Link href="/">Store</Link><span>/</span><Link href="/#collections">{product.category}</Link><span>/</span><b>{product.name}</b></nav>
          <div className="product-detail__title"><p className="detail-kicker">North Atelier object</p><h1>{product.name}</h1><button type="button" onClick={() => document.getElementById("product-details")?.scrollIntoView({ behavior: "smooth" })}>Details <ChevronDown size={15} /></button></div>
          <div className="product-detail__price"><strong>{product.price}</strong>{product.was && <del>{product.was}</del>}<span>Taxes and delivery calculated at confirmation.</span></div>
          <div className="product-detail__availability"><span /><p>Available for studio dispatch</p><small>Small workshop run</small></div>

          <fieldset className="variant-field"><legend>Color / <b>{selectedColor.name}</b></legend><div>{product.colors.map((color) => <button type="button" key={color.name} aria-label={`Choose ${color.name}`} className={selectedColor.name === color.name ? "is-selected" : ""} onClick={() => selectColor(color)}><span style={{ backgroundColor: color.color }} /><em>{color.name}</em></button>)}</div></fieldset>
          <div className="purchase-controls"><div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div><button type="button" className="detail-add" onClick={() => setBagOpen(true)}>Add to bag <Plus size={15} /></button></div>
          <button type="button" className="detail-fast-order" onClick={() => { setDirectOrderOpen(true); setRequestSent(false); }}><Truck size={17} /> Order with Cash on Delivery <ArrowRight size={15} /></button>
          <div className="cod-card"><div><PackageCheck size={20} /><span><b>Cash on Delivery</b><small>Pay only when your delivery arrives.</small></span></div><p>We confirm delivery details before dispatch, then the courier collects the order total at your door.</p></div>
          <p className="product-description">{product.description}</p>
          <ul className="product-highlights">{product.highlights.map((item) => <li key={item}><Check size={14} /> {item}</li>)}</ul>

          <div id="product-details" className="detail-accordions">{detailItems.map((item, index) => <div className={openDetail === index ? "detail-accordion detail-accordion--open" : "detail-accordion"} key={item.title}><button type="button" onClick={() => setOpenDetail(openDetail === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<ChevronDown size={16} /></button>{openDetail === index && <p>{item.text}</p>}</div>)}</div>
        </aside>
      </main>

      <section className="product-reviews"><div><p className="detail-kicker">Product notes</p><h2>No notes yet.</h2><p>Be the first to share how this object has found its place with you.</p></div><button type="button" onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })}>Write a product note <ArrowRight size={15} /></button><form id="review-form" onSubmit={(event) => event.preventDefault()}><label>Your note title<input placeholder="A short title" /></label><label>What did you notice?<textarea placeholder="Share a considered observation" /></label><label>First name<input placeholder="Your name" /></label><button type="submit">Save note</button></form></section>

      <section className="related-section"><div className="related-section__head"><div><p className="detail-kicker">Curated selection</p><h2>You may also<br /><em>like these.</em></h2></div><Link href="/#shop">View the studio edit <ArrowRight size={15} /></Link></div><div className="related-grid">{catalogProducts.filter((item) => item.slug !== product.slug).slice(0, 3).map((item) => <Link href={`/products/${item.slug}`} className="related-card" key={item.slug}><div><img src={item.image} alt={item.name} /><span>View object <ArrowRight size={15} /></span></div><p>{item.category}</p><h3>{item.name}</h3><b>{item.price}</b></Link>)}</div></section>
      <footer className="product-footer"><Link href="/"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /> North Atelier</Link><span>Built slowly / made to travel</span><span>Delivery, care & Cash on Delivery</span></footer>

      {bagOpen && <div className="detail-bag-modal" role="dialog" aria-modal="true"><div><button type="button" className="detail-bag-modal__close" onClick={() => setBagOpen(false)}>Close</button><span><Check size={21} /></span><p className="detail-kicker">Added to your bag</p><h2>{product.name}</h2><small>{selectedColor.name} / Quantity {quantity}</small><div className="detail-bag-modal__summary"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><p>{selectedColor.name}</p><strong>{product.price}</strong></div></div><button type="button" className="detail-bag-modal__checkout" onClick={() => { setBagOpen(false); setDirectOrderOpen(true); setRequestSent(false); }}>Continue with Cash on Delivery <ArrowRight size={15} /></button><button type="button" className="detail-bag-modal__continue" onClick={() => setBagOpen(false)}>Keep browsing</button></div></div>}

      {directOrderOpen && <div className="direct-order-modal" role="dialog" aria-modal="true"><div>{requestSent ? <div className="direct-order-success"><span><Check size={27} /></span><p className="detail-kicker">Request recorded</p><h2>We’ll confirm the<br /><em>delivery details.</em></h2><p>Your North Atelier Cash on Delivery request is staged in this prototype. Connecting a commerce backend will make this a live order.</p><button type="button" onClick={() => setDirectOrderOpen(false)}>Return to the object <ArrowRight size={15} /></button></div> : <form onSubmit={(event) => { event.preventDefault(); setRequestSent(true); }}><button type="button" className="direct-order-modal__close" onClick={() => setDirectOrderOpen(false)}>Close</button><p className="detail-kicker">Easy order / Cash on Delivery</p><h2>Where should<br /><em>we send it?</em></h2><p className="direct-order-modal__intro">Payment is collected only when your delivery arrives.</p><div className="direct-order-fields"><label>Full name<input required placeholder="Name for the courier" /></label><label>Phone number<input required type="tel" placeholder="For confirmation" /></label><label className="full-row">Delivery address<input required placeholder="Street, building, area" /></label><label>City<input required placeholder="Your city" /></label><label>Order note<input placeholder="Optional" /></label></div><div className="direct-order-product"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><span>{selectedColor.name} / Quantity {quantity}</span><strong>{product.price}</strong></div></div><button className="direct-order-submit" type="submit">Confirm Cash on Delivery request <ArrowRight size={15} /></button><small className="direct-order-note">This is an editable storefront prototype; no real customer data is stored or submitted.</small></form>}</div></div>}
    </div>
  );
}
