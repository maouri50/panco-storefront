/**
 * North Atelier style note — Coastal Ledger product page:
 * split gallery / purchase ledger, sharp paper panels, original material data,
 * and an explicit Cash on Delivery path without copying third-party content.
 */
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe2, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { catalogProducts, getProduct } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { useManagedCatalog } from "@/hooks/useManagedCatalog";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeProduct, productCopy } from "@/lib/localization";

const detailItems = [
  { title: "Materials & construction", text: "Full-grain vegetable-tanned leather, solid hardware, hand-burnished edges, and hand-checked stitching. Natural shifts in grain and tone are expected and welcomed." },
  { title: "Personal marking", text: "A small heat-stamped monogram area can be requested for selected objects. Add a note when you place a Cash on Delivery request and the studio will confirm availability." },
  { title: "Care & repair", text: "Wipe with a soft dry cloth and condition only when the leather feels dry. For a repair assessment, contact the studio with clear photos of your piece." },
  { title: "Delivery & Cash on Delivery", text: "Cash on Delivery is available at checkout. We will confirm your name, delivery address, and phone number before dispatch. Payment is collected once your order arrives." },
];

const arabicDetailItems = [
  { title: "المواد والصناعة", text: "جلد طبيعي مدبوغ نباتياً، وقطع معدنية متينة، وحواف مصقولة يدوياً، وخياطة مفحوصة بعناية. اختلافات الحبيبات واللون الطبيعية جزء من جمال القطعة." },
  { title: "الوسم الشخصي", text: "يمكن طلب مساحة صغيرة لوضع الأحرف الأولى لبعض القطع. أضف ملاحظة عند تقديم طلب الدفع عند الاستلام، وسيؤكد الاستوديو التوفر." },
  { title: "العناية والإصلاح", text: "امسح بقطعة قماش ناعمة وجافة، واستخدم مرطب الجلد فقط عندما يشعر الجلد بالجفاف. لطلب الإصلاح، تواصل مع الاستوديو بصور واضحة للقطعة." },
  { title: "التوصيل والدفع عند الاستلام", text: "الدفع عند الاستلام متاح عند الطلب. نؤكد الاسم والعنوان ورقم الهاتف قبل الشحن، ويُدفع المبلغ عند وصول الطلب." },
];

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { products } = useManagedCatalog();
  const { locale, direction, setLocale } = useLocale();
  const copy = productCopy[locale];
  const rawProduct = products.find(item => item.slug === params?.slug) ?? getProduct(params?.slug ?? "") ?? catalogProducts[0];
  const product = localizeProduct(rawProduct, locale);
  const localizedProducts = products.map((item) => localizeProduct(item, locale));
  const [selectedImage, setSelectedImage] = useState(product.gallery[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [bagOpen, setBagOpen] = useState(false);
  const [directOrderOpen, setDirectOrderOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [openDetail, setOpenDetail] = useState<number | null>(0);
  const submitCashOnDelivery = trpc.orders.submitCashOnDelivery.useMutation({
    onSuccess: () => setRequestSent(true),
  });

  useEffect(() => {
    setSelectedImage(product.gallery[0]);
    setSelectedColor(product.colors[0]);
  }, [locale, rawProduct.slug]);

  const selectColor = (color: typeof product.colors[number]) => {
    setSelectedColor(color);
    setSelectedImage(color.image);
  };

  return (
    <div className="product-page" dir={direction}>
      <div className="product-page__bar"><Link href="/" className="product-page__back"><ArrowLeft size={14} /> {copy.back}</Link><span>{copy.available}</span><span>{copy.ledger}</span></div>
      <header className="product-page__nav"><Link href="/" className="product-page__brand"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /><span><b>N/A</b><i /> North Atelier</span></Link><div><Link href="/#shop">{locale === "ar" ? "المتجر" : "Shop"}</Link><Link href="/#story">{locale === "ar" ? "الاستوديو" : "Studio"}</Link><button type="button" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /> {bagOpen ? "" : quantity}</button></div></header>

      <section className="mobile-product-ledger"><div className="mobile-product-ledger__row"><p>{product.category} / North Atelier</p><span>{locale === "ar" ? "رقم القطعة" : "Object no."} {String(products.findIndex(item => item.slug === product.slug) + 1).padStart(2, "0")}</span></div><div><h1>{product.name}</h1><div><b>{product.price}</b>{product.was && <del>{product.was}</del>}<small>{copy.available}</small></div></div></section>

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
          <nav className="breadcrumb"><Link href="/">{locale === "ar" ? "المتجر" : "Store"}</Link><span>/</span><Link href="/#collections">{product.category}</Link><span>/</span><b>{product.name}</b></nav>
          <div className="product-detail__title"><p className="detail-kicker">{copy.object}</p><h1>{product.name}</h1><button type="button" onClick={() => document.getElementById("product-details")?.scrollIntoView({ behavior: "smooth" })}>{copy.details} <ChevronDown size={15} /></button></div>
          <div className="product-detail__price"><strong>{product.price}</strong>{product.was && <del>{product.was}</del>}<span>{copy.taxes}</span></div>
          <div className="product-detail__availability"><span /><p>{copy.dispatch}</p><small>{copy.run}</small></div>

          <fieldset className="variant-field"><legend>{copy.color} / <b>{selectedColor.name}</b></legend><div>{product.colors.map((color) => <button type="button" key={color.name} aria-label={`${copy.color} ${color.name}`} className={selectedColor.name === color.name ? "is-selected" : ""} onClick={() => selectColor(color)}><span style={{ backgroundColor: color.color }} /><em>{color.name}</em></button>)}</div></fieldset>
          <div className="purchase-controls"><div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div><button type="button" className="detail-add" onClick={() => setBagOpen(true)}>{copy.add} <Plus size={15} /></button></div>
          <button type="button" className="detail-fast-order" onClick={() => { setDirectOrderOpen(value => !value); setRequestSent(false); }}><Truck size={17} /> {directOrderOpen ? copy.closeOrder : copy.order} <ArrowRight size={15} /></button>
          {directOrderOpen && <section className="inline-order-card">{requestSent ? <div className="direct-order-success"><span><Check size={27} /></span><p className="detail-kicker">{locale === "ar" ? "تم إرسال الطلب" : "Request sent"}</p><h2>{locale === "ar" ? "سنؤكد\nتفاصيل التوصيل." : "We’ll confirm the\ndelivery details."}</h2><p>{locale === "ar" ? "أُرسل طلب الدفع عند الاستلام إلى فريق الطلبات. سنتصل بك قبل الشحن." : "Your North Atelier Cash on Delivery request has been sent to the order desk. We will call before dispatch."}</p><button type="button" onClick={() => setDirectOrderOpen(false)}>{locale === "ar" ? "العودة إلى القطعة" : "Return to the object"} <ArrowRight size={15} /></button></div> : <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submitCashOnDelivery.mutate({ productName: product.name, productPrice: product.price, color: selectedColor.name, quantity, customerName: String(form.get("customerName") ?? ""), phone: String(form.get("phone") ?? ""), address: String(form.get("address") ?? ""), city: String(form.get("city") ?? ""), note: String(form.get("note") ?? "") || undefined }); }}><p className="detail-kicker">{copy.easyOrder}</p><h2>{copy.deliverySimple.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2><p className="direct-order-modal__intro">{copy.deliveryNote}</p><div className="direct-order-fields"><label>{copy.fullName}<input required name="customerName" placeholder={locale === "ar" ? "الاسم لاستلام الطلب" : "Name for the courier"} /></label><label>{copy.phone}<input required name="phone" type="tel" placeholder={locale === "ar" ? "للتأكيد" : "For confirmation"} /></label><label className="full-row">{copy.address}<input required name="address" placeholder={locale === "ar" ? "الشارع والبناية والمنطقة" : "Street, building, area"} /></label><label>{copy.city}<input required name="city" placeholder={locale === "ar" ? "مدينتك" : "Your city"} /></label><label>{copy.note}<input name="note" placeholder={locale === "ar" ? "اختياري" : "Optional"} /></label></div><div className="direct-order-product"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><span>{selectedColor.name} / {copy.quantity} {quantity}</span><strong>{product.price}</strong></div></div>{submitCashOnDelivery.error && <p className="direct-order-error" role="alert">{submitCashOnDelivery.error.message}</p>}<button className="direct-order-submit" type="submit" disabled={submitCashOnDelivery.isPending}>{submitCashOnDelivery.isPending ? (locale === "ar" ? "يجري إرسال الطلب…" : "Sending request…") : copy.confirm} <ArrowRight size={15} /></button><small className="direct-order-note">{locale === "ar" ? "يُرسل طلبك بأمان إلى فريق نورث أتيلييه للتأكيد." : "Your request is sent securely to the North Atelier order desk for confirmation."}</small></form>}</section>}
          <div className="cod-card"><div><PackageCheck size={20} /><span><b>{copy.cashTitle}</b><small>{copy.deliveryNote}</small></span></div><p>{copy.cashBody}</p></div>
          <p className="product-description">{product.description}</p>
          <ul className="product-highlights">{product.highlights.map((item) => <li key={item}><Check size={14} /> {item}</li>)}</ul>

          <div id="product-details" className="detail-accordions">{(locale === "ar" ? arabicDetailItems : detailItems).map((item, index) => <div className={openDetail === index ? "detail-accordion detail-accordion--open" : "detail-accordion"} key={item.title}><button type="button" onClick={() => setOpenDetail(openDetail === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<ChevronDown size={16} /></button>{openDetail === index && <p>{item.text}</p>}</div>)}</div>
        </aside>
      </main>

      <section className="product-reviews"><div><p className="detail-kicker">{copy.customerNotes}</p><h2>{copy.noNotes.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2><p>{copy.noNotesBody}</p></div><a href="mailto:studio@northatelier.example" className="review-contact">{copy.ask} <ArrowRight size={15} /></a></section>

      <section className="related-section"><div className="related-section__head"><div><p className="detail-kicker">{locale === "ar" ? "اختيارات الاستوديو" : "Curated selection"}</p><h2>{copy.related.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2></div><Link href="/#shop">{copy.viewEdit} <ArrowRight size={15} /></Link></div><div className="related-grid">{localizedProducts.filter((item) => item.slug !== product.slug).slice(0, 3).map((item) => <Link href={`/products/${item.slug}`} className="related-card" key={item.slug}><div><img src={item.image} alt={item.name} /><span>{locale === "ar" ? "عرض القطعة" : "View object"} <ArrowRight size={15} /></span></div><p>{item.category}</p><h3>{item.name}</h3><b>{item.price}</b></Link>)}</div></section>
      <footer className="product-footer product-footer--full"><div className="product-footer__statement"><Link href="/"><img src="/manus-storage/north-atelier-mark_c591b808.png" alt="" /> North Atelier</Link><p>{locale === "ar" ? "قطع ترافقك في الطريق الطويل. مصنوعة بعناية لتكتسب شخصيتها مع الاستعمال." : "Objects for the long way home. Hand-finished with restraint, designed to gain character with use."}</p><button type="button" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}><Globe2 size={14} /> {locale === "ar" ? "English" : "العربية"}</button></div><div className="product-footer__links"><div><p>{locale === "ar" ? "استكشاف" : "Exploration"}</p><Link href="/#shop">{locale === "ar" ? "تسوّق التشكيلة" : "Shop the edit"}</Link><Link href="/#story">{locale === "ar" ? "ملاحظات الاستوديو" : "Studio notes"}</Link><Link href="/#journal">{locale === "ar" ? "المجلة" : "Journal"}</Link><a href="mailto:studio@northatelier.example">{locale === "ar" ? "تواصل معنا" : "Contact studio"}</a></div><div><p>{locale === "ar" ? "عملي" : "Practical"}</p><a href="#product-details">{locale === "ar" ? "العناية والإصلاح" : "Care & repair"}</a><a href="#product-details">{locale === "ar" ? "تفاصيل التوصيل" : "Delivery details"}</a><a href="#product-details">{copy.cashTitle}</a><Link href="/admin">{locale === "ar" ? "لوحة الكتالوج" : "Catalog desk"}</Link></div></div><div className="product-footer__newsletter"><p>{locale === "ar" ? "ابقَ على تواصل" : "Stay connected"}</p><h2>{locale === "ar" ? "رسائل متفرقة\nمن الاستوديو." : "Occasional notes\nfrom the studio."}</h2><form onSubmit={event => event.preventDefault()}><input type="email" aria-label="Email address" placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email address"} /><button aria-label="Subscribe"><ArrowRight size={16} /></button></form><small>{locale === "ar" ? "رسائل من الاستوديو فقط. يمكنك إلغاء الاشتراك في أي وقت." : "Studio correspondence only. Unsubscribe any time."}</small></div><div className="product-footer__base"><span>© 2026 North Atelier</span><span>{locale === "ar" ? "صُنع ببطء. استُخدم جيداً." : "Made slowly. Used well."}</span></div></footer>

      {bagOpen && <div className="detail-bag-modal" role="dialog" aria-modal="true"><div><button type="button" className="detail-bag-modal__close" onClick={() => setBagOpen(false)}>{locale === "ar" ? "إغلاق" : "Close"}</button><span><Check size={21} /></span><p className="detail-kicker">{copy.added}</p><h2>{product.name}</h2><small>{selectedColor.name} / {copy.quantity} {quantity}</small><div className="detail-bag-modal__summary"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><p>{selectedColor.name}</p><strong>{product.price}</strong></div></div><button type="button" className="detail-bag-modal__checkout" onClick={() => { setBagOpen(false); setDirectOrderOpen(true); setRequestSent(false); }}>{copy.continueCod} <ArrowRight size={15} /></button><button type="button" className="detail-bag-modal__continue" onClick={() => setBagOpen(false)}>{copy.keepBrowsing}</button></div></div>}

    </div>
  );
}
