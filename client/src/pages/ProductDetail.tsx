/**
 * Panco style note — Coastal Ledger product page:
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

const frenchDetailItems = [
  { title: "Matières et construction", text: "Cuir pleine fleur tanné végétal, pièces solides, tranches polies à la main et coutures contrôlées une à une. Les variations naturelles du grain et de la teinte sont attendues et bienvenues." },
  { title: "Marquage personnel", text: "Une petite zone de marquage à chaud peut être demandée pour certains objets. Ajoutez une note à votre demande et l’atelier confirmera la disponibilité." },
  { title: "Soin et réparation", text: "Essuyez avec un chiffon doux et sec et nourrissez le cuir seulement lorsqu’il paraît sec. Pour une réparation, contactez l’atelier avec des photos nettes de votre pièce." },
  { title: "Livraison et paiement", text: "Le paiement à la livraison est disponible à la commande. Nous confirmons votre nom, votre adresse et votre téléphone avant l’expédition ; le paiement est collecté à l’arrivée." },
];

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { products } = useManagedCatalog();
  const { locale, direction, setLocale } = useLocale();
  const copy = productCopy[locale];
  const isArabic = locale === "ar";
  const isFrench = locale === "fr";
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
      <header className="product-page__nav"><Link href="/" className="product-page__brand"><span className="brand-monogram" aria-hidden="true">P</span><span>Panco</span></Link><div><Link href="/#shop">{isArabic ? "المتجر" : isFrench ? "Boutique" : "Shop"}</Link><Link href="/#story">{isArabic ? "الاستوديو" : isFrench ? "Atelier" : "Studio"}</Link><button type="button" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /> {bagOpen ? "" : quantity}</button></div></header>

      <section className="mobile-product-ledger"><div className="mobile-product-ledger__row"><p>{product.category} / {isArabic ? "بانكو" : "Panco"}</p><span>{locale === "ar" ? "رقم القطعة" : "Object no."} {String(products.findIndex(item => item.slug === product.slug) + 1).padStart(2, "0")}</span></div><div><h1>{product.name}</h1><div><b>{product.price}</b>{product.was && <del>{product.was}</del>}<small>{copy.available}</small></div></div></section>

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
          <nav className="breadcrumb"><Link href="/">{isArabic ? "المتجر" : isFrench ? "Boutique" : "Store"}</Link><span>/</span><Link href="/#collections">{product.category}</Link><span>/</span><b>{product.name}</b></nav>
          <div className="product-detail__title"><p className="detail-kicker">{copy.object}</p><h1>{product.name}</h1><button type="button" onClick={() => document.getElementById("product-details")?.scrollIntoView({ behavior: "smooth" })}>{copy.details} <ChevronDown size={15} /></button></div>
          <div className="product-detail__price"><strong>{product.price}</strong>{product.was && <del>{product.was}</del>}<span>{copy.taxes}</span></div>
          <div className="product-detail__availability"><span /><p>{copy.dispatch}</p><small>{copy.run}</small></div>

          <fieldset className="variant-field"><legend>{copy.color} / <b>{selectedColor.name}</b></legend><div>{product.colors.map((color) => <button type="button" key={color.name} aria-label={`${copy.color} ${color.name}`} className={selectedColor.name === color.name ? "is-selected" : ""} onClick={() => selectColor(color)}><span style={{ backgroundColor: color.color }} /><em>{color.name}</em></button>)}</div></fieldset>
          <div className="purchase-controls"><div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div><button type="button" className="detail-add" onClick={() => setBagOpen(true)}>{copy.add} <Plus size={15} /></button></div>
          <button type="button" className="detail-fast-order" onClick={() => { setDirectOrderOpen(value => !value); setRequestSent(false); }}><Truck size={17} /> {directOrderOpen ? copy.closeOrder : copy.order} <ArrowRight size={15} /></button>
          {directOrderOpen && <section className="inline-order-card">{requestSent ? <div className="direct-order-success"><span><Check size={27} /></span><p className="detail-kicker">{isArabic ? "تم إرسال الطلب" : isFrench ? "Demande envoyée" : "Request sent"}</p><h2>{isArabic ? "سنؤكد\nتفاصيل التوصيل." : isFrench ? "Nous confirmerons\nles détails de livraison." : "We’ll confirm the\ndelivery details."}</h2><p>{isArabic ? "أُرسل طلب الدفع عند الاستلام إلى فريق بانكو. سنتصل بك قبل الشحن." : isFrench ? "Votre demande a été envoyée à Panco. Nous vous appellerons avant l’expédition." : "Your Panco Cash on Delivery request has been sent to the order desk. We will call before dispatch."}</p><button type="button" onClick={() => setDirectOrderOpen(false)}>{isArabic ? "العودة إلى القطعة" : isFrench ? "Retour à l’objet" : "Return to the object"} <ArrowRight size={15} /></button></div> : <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submitCashOnDelivery.mutate({ productName: product.name, productPrice: product.price, color: selectedColor.name, quantity, customerName: String(form.get("customerName") ?? ""), phone: String(form.get("phone") ?? ""), address: String(form.get("address") ?? ""), city: String(form.get("city") ?? ""), note: String(form.get("note") ?? "") || undefined }); }}><p className="detail-kicker">{copy.easyOrder}</p><h2>{copy.deliverySimple.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2><p className="direct-order-modal__intro">{copy.deliveryNote}</p><div className="direct-order-fields"><label>{copy.fullName}<input required name="customerName" placeholder={isArabic ? "الاسم لاستلام الطلب" : isFrench ? "Nom du destinataire" : "Name for the courier"} /></label><label>{copy.phone}<input required name="phone" type="tel" placeholder={isArabic ? "للتأكيد" : isFrench ? "Pour confirmer" : "For confirmation"} /></label><label className="full-row">{copy.address}<input required name="address" placeholder={isArabic ? "الشارع والبناية والمنطقة" : isFrench ? "Rue, bâtiment, quartier" : "Street, building, area"} /></label><label>{copy.city}<input required name="city" placeholder={isArabic ? "مدينتك" : isFrench ? "Votre ville" : "Your city"} /></label><label>{copy.note}<input name="note" placeholder={isArabic ? "اختياري" : isFrench ? "Facultatif" : "Optional"} /></label></div><div className="direct-order-product"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><span>{selectedColor.name} / {copy.quantity} {quantity}</span><strong>{product.price}</strong></div></div>{submitCashOnDelivery.error && <p className="direct-order-error" role="alert">{submitCashOnDelivery.error.message}</p>}<button className="direct-order-submit" type="submit" disabled={submitCashOnDelivery.isPending}>{submitCashOnDelivery.isPending ? (isArabic ? "يجري إرسال الطلب…" : isFrench ? "Envoi de la demande…" : "Sending request…") : copy.confirm} <ArrowRight size={15} /></button><small className="direct-order-note">{isArabic ? "يُرسل طلبك بأمان إلى فريق بانكو للتأكيد." : isFrench ? "Votre demande est envoyée de manière sécurisée à Panco pour confirmation." : "Your request is sent securely to the Panco order desk for confirmation."}</small></form>}</section>}
          <div className="cod-card"><div><PackageCheck size={20} /><span><b>{copy.cashTitle}</b><small>{copy.deliveryNote}</small></span></div><p>{copy.cashBody}</p></div>
          <p className="product-description">{product.description}</p>
          <ul className="product-highlights">{product.highlights.map((item) => <li key={item}><Check size={14} /> {item}</li>)}</ul>

          <div id="product-details" className="detail-accordions">{(isArabic ? arabicDetailItems : isFrench ? frenchDetailItems : detailItems).map((item, index) => <div className={openDetail === index ? "detail-accordion detail-accordion--open" : "detail-accordion"} key={item.title}><button type="button" onClick={() => setOpenDetail(openDetail === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<ChevronDown size={16} /></button>{openDetail === index && <p>{item.text}</p>}</div>)}</div>
        </aside>
      </main>

      <section className="product-reviews"><div><p className="detail-kicker">{copy.customerNotes}</p><h2>{copy.noNotes.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2><p>{copy.noNotesBody}</p></div><a href="mailto:hello@panco.example" className="review-contact">{copy.ask} <ArrowRight size={15} /></a></section>

      <section className="related-section"><div className="related-section__head"><div><p className="detail-kicker">{isArabic ? "اختيارات الاستوديو" : isFrench ? "Sélection de l’atelier" : "Curated selection"}</p><h2>{copy.related.split("\n").map((line, index) => index === 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h2></div><Link href="/#shop">{copy.viewEdit} <ArrowRight size={15} /></Link></div><div className="related-grid">{localizedProducts.filter((item) => item.slug !== product.slug).slice(0, 3).map((item) => <Link href={`/products/${item.slug}`} className="related-card" key={item.slug}><div><img src={item.image} alt={item.name} /><span>{isArabic ? "عرض القطعة" : isFrench ? "Voir l’objet" : "View object"} <ArrowRight size={15} /></span></div><p>{item.category}</p><h3>{item.name}</h3><b>{item.price}</b></Link>)}</div></section>
      <footer className="product-footer product-footer--full">
        <div className="product-footer__statement"><Link href="/"><span className="brand-monogram brand-monogram--footer" aria-hidden="true">P</span> Panco</Link><p>{isArabic ? "قطع ترافقك في الطريق الطويل. مصنوعة بعناية لتكتسب شخصيتها مع الاستعمال." : isFrench ? "Des objets pour le long chemin. Finis à la main avec retenue, dessinés pour gagner du caractère avec l’usage." : "Objects for the long way home. Hand-finished with restraint, designed to gain character with use."}</p><button type="button" onClick={() => setLocale(locale === "ar" ? "en" : locale === "fr" ? "en" : "ar")}><Globe2 size={14} /> {isArabic ? "English" : isFrench ? "English" : "العربية"}</button></div>
        <div className="product-footer__links"><div><p>{isArabic ? "استكشاف" : isFrench ? "Explorer" : "Exploration"}</p><Link href="/#shop">{isArabic ? "تسوّق التشكيلة" : isFrench ? "Voir la sélection" : "Shop the edit"}</Link><Link href="/#story">{isArabic ? "ملاحظات الاستوديو" : isFrench ? "Notes de l’atelier" : "Studio notes"}</Link><Link href="/#journal">{isArabic ? "المجلة" : "Journal"}</Link><a href="mailto:hello@panco.example">{isArabic ? "تواصل معنا" : isFrench ? "Contacter Panco" : "Contact Panco"}</a></div><div><p>{isArabic ? "عملي" : isFrench ? "Pratique" : "Practical"}</p><a href="#product-details">{isArabic ? "العناية والإصلاح" : isFrench ? "Soin et réparation" : "Care & repair"}</a><a href="#product-details">{isArabic ? "تفاصيل التوصيل" : isFrench ? "Détails de livraison" : "Delivery details"}</a><a href="#product-details">{copy.cashTitle}</a><Link href="/admin">{isArabic ? "لوحة الكتالوج" : isFrench ? "Gestion du catalogue" : "Catalog desk"}</Link></div></div>
        <div className="product-footer__newsletter"><p>{isArabic ? "ابقَ على تواصل" : isFrench ? "Rester en contact" : "Stay connected"}</p><h2>{isArabic ? "رسائل متفرقة\nمن الاستوديو." : isFrench ? "Quelques nouvelles\nde l’atelier." : "Occasional notes\nfrom the studio."}</h2><form onSubmit={event => event.preventDefault()}><input type="email" aria-label={isFrench ? "Adresse e-mail" : "Email address"} placeholder={isArabic ? "البريد الإلكتروني" : isFrench ? "nom@example.com" : "Email address"} /><button aria-label={isFrench ? "S’inscrire" : "Subscribe"}><ArrowRight size={16} /></button></form><small>{isArabic ? "رسائل من الاستوديو فقط. يمكنك إلغاء الاشتراك في أي وقت." : isFrench ? "Correspondance de l’atelier uniquement. Désinscription à tout moment." : "Studio correspondence only. Unsubscribe any time."}</small></div>
        <div className="product-footer__base"><span>© 2026 Panco</span><span>{isArabic ? "صُنع ببطء. استُخدم جيداً." : isFrench ? "Fait lentement. Bien porté." : "Made slowly. Used well."}</span></div>
      </footer>

      {bagOpen && <div className="detail-bag-modal" role="dialog" aria-modal="true"><div><button type="button" className="detail-bag-modal__close" onClick={() => setBagOpen(false)}>{locale === "ar" ? "إغلاق" : "Close"}</button><span><Check size={21} /></span><p className="detail-kicker">{copy.added}</p><h2>{product.name}</h2><small>{selectedColor.name} / {copy.quantity} {quantity}</small><div className="detail-bag-modal__summary"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><p>{selectedColor.name}</p><strong>{product.price}</strong></div></div><button type="button" className="detail-bag-modal__checkout" onClick={() => { setBagOpen(false); setDirectOrderOpen(true); setRequestSent(false); }}>{copy.continueCod} <ArrowRight size={15} /></button><button type="button" className="detail-bag-modal__continue" onClick={() => setBagOpen(false)}>{copy.keepBrowsing}</button></div></div>}

    </div>
  );
}
