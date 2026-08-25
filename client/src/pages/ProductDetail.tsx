/**
 * Panco style note — Coastal Ledger product page:
 * split gallery / purchase ledger, sharp paper panels, original material data,
 * and an explicit Cash on Delivery path without copying third-party content.
 */
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardCheck, Globe2, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { catalogProducts, getProduct } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { useManagedCatalog } from "@/hooks/useManagedCatalog";
import { useLocale } from "@/contexts/LocaleContext";
import { localizeProduct, productCopy } from "@/lib/localization";
import { hasCompleteCodOrderFields } from "@/lib/codOrderForm";
import "@/productDetailResponsive.css";

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

type CompletedOrder = {
  orderReference: string;
  productName: string;
  productPrice: string;
  productImageUrl: string;
  color: string;
  quantity: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
};

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
  const [directOrderOpen, setDirectOrderOpen] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);
  const [openDetail, setOpenDetail] = useState<number | null>(0);
  const submitCashOnDelivery = trpc.orders.submitCashOnDelivery.useMutation({
    onSuccess: (result, variables) => {
      setRequestSent(true);
      setCompletedOrder({ ...variables, orderReference: result.orderReference });
    },
  });

  useEffect(() => {
    setSelectedImage(product.gallery[0]);
    setSelectedColor(product.colors[0]);
  }, [locale, rawProduct.slug]);

  const selectColor = (color: typeof product.colors[number]) => {
    setSelectedColor(color);
    setSelectedImage(color.image);
  };

  const orderTotal = (price: string, count: number) => {
    const numeric = Number(price.replace(/[^\d.,]/g, "").replace(",", "."));
    if (!Number.isFinite(numeric)) return `${price} × ${count}`;
    const prefix = price.match(/^[^\d]+/)?.[0] ?? "";
    const suffix = price.match(/[^\d.,]+$/)?.[0] ?? "";
    const total = numeric * count;
    return `${prefix}${total.toFixed(Number.isInteger(total) ? 0 : 2)}${suffix}`;
  };

  const closeCompletedOrder = () => {
    setCompletedOrder(null);
    setRequestSent(false);
    setDirectOrderOpen(false);
  };

  const successCopy = isArabic
    ? { reference: "مرجع الطلب", thanks: "شكرًا،", received: "وصل طلب الدفع عند الاستلام إلى بانكو. سنتصل لتأكيد العنوان وموعد التوصيل.", status: "حالة الطلب", new: "تم استلام الطلب", confirm: "تأكيد بانكو", courier: "تسليم إلى المندوب", summary: "ملخص الطلب", variant: "اللون", quantity: "الكمية", unit: "سعر القطعة", total: "المجموع", shipping: "وجهة التوصيل", contact: "قناة التواصل", return: "العودة إلى القطعة" }
    : isFrench
      ? { reference: "Référence de commande", thanks: "Merci,", received: "Votre demande de paiement à la livraison est arrivée chez Panco. Nous vous appellerons pour confirmer l’adresse et la livraison.", status: "Statut de la demande", new: "Demande reçue", confirm: "Confirmation Panco", courier: "Remise au transporteur", summary: "Récapitulatif", variant: "Variante", quantity: "Quantité", unit: "Prix unitaire", total: "Total", shipping: "Destination", contact: "Contact", return: "Retour à l’objet" }
      : { reference: "Order reference", thanks: "Thank you,", received: "Your Cash on Delivery request has reached Panco. We will call to confirm the address and delivery time.", status: "Order status", new: "Request received", confirm: "Panco confirmation", courier: "Courier hand-off", summary: "Order summary", variant: "Variant", quantity: "Quantity", unit: "Unit price", total: "Total to pay", shipping: "Shipping destination", contact: "Contact channel", return: "Return to the object" };

  if (completedOrder) {
    return <div className="product-page product-page--complete" dir={direction}>
      <div className="product-page__bar"><Link href="/" className="product-page__back"><ArrowLeft size={14} /> {copy.back}</Link><span>{copy.available}</span><span>{copy.ledger}</span></div>
      <header className="product-page__nav"><Link href="/" className="product-page__brand"><span className="brand-monogram" aria-hidden="true">P</span><span>Panco</span></Link><div><Link href="/#shop">{isArabic ? "المتجر" : isFrench ? "Boutique" : "Shop"}</Link><Link href="/#story">{isArabic ? "الاستوديو" : isFrench ? "Atelier" : "Studio"}</Link><Link href="/contact">{isArabic ? "تواصل" : isFrench ? "Contact" : "Contact"}</Link><button type="button" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /></button></div></header>
      <main className="panco-order-success">
        <section className="panco-order-success__main">
          <div className="panco-order-success__reference"><span><Check size={18} /></span><p>{successCopy.reference} #{completedOrder.orderReference}</p></div>
          <h1>{successCopy.thanks} <em>{completedOrder.customerName}.</em></h1>
          <p className="panco-order-success__intro">{successCopy.received}</p>
          <div className="panco-order-status"><p>{successCopy.status}</p><div><span className="is-current"><b>1</b>{successCopy.new}</span><span><b>2</b>{successCopy.confirm}</span><span><b>3</b>{successCopy.courier}</span></div></div>
          <div className="panco-order-success__details"><article><p>{successCopy.shipping}</p><b>{completedOrder.address}<br />{completedOrder.city}</b></article><article><p>{successCopy.contact}</p><b>{completedOrder.customerName}<br />{completedOrder.phone}</b></article></div>
          <button type="button" onClick={closeCompletedOrder}>{successCopy.return} <ArrowRight size={15} /></button>
        </section>
        <aside className="panco-order-summary"><h2>{successCopy.summary}</h2><div className="panco-order-summary__item"><img src={completedOrder.productImageUrl} alt={completedOrder.productName} /><div><b>{completedOrder.productName}</b><span>{completedOrder.color} · ×{completedOrder.quantity}</span></div><strong>{completedOrder.productPrice}</strong></div><dl><div><dt>{successCopy.unit}</dt><dd>{completedOrder.productPrice}</dd></div><div><dt>{successCopy.quantity}</dt><dd>×{completedOrder.quantity}</dd></div><div className="panco-order-summary__total"><dt>{successCopy.total}</dt><dd>{orderTotal(completedOrder.productPrice, completedOrder.quantity)}</dd></div></dl></aside>
      </main>
    </div>;
  }

  return (
    <div className="product-page" dir={direction}>
      <div className="product-page__bar"><Link href="/" className="product-page__back"><ArrowLeft size={14} /> {copy.back}</Link><span>{copy.available}</span><span>{copy.ledger}</span></div>
      <header className="product-page__nav"><Link href="/" className="product-page__brand"><span className="brand-monogram" aria-hidden="true">P</span><span>Panco</span></Link><div><Link href="/#shop">{isArabic ? "المتجر" : isFrench ? "Boutique" : "Shop"}</Link><Link href="/#story">{isArabic ? "الاستوديو" : isFrench ? "Atelier" : "Studio"}</Link><Link href="/contact">{isArabic ? "تواصل" : isFrench ? "Contact" : "Contact"}</Link><button type="button" onClick={() => setBagOpen(true)}><ShoppingBag size={19} /> {bagOpen ? "" : quantity}</button></div></header>

      <section className="mobile-product-ledger"><div className="mobile-product-ledger__row"><p>{product.category} / {isArabic ? "بانكو" : "Panco"}</p><span>{locale === "ar" ? "رقم القطعة" : "Object no."} {String(products.findIndex(item => item.slug === product.slug) + 1).padStart(2, "0")}</span></div><div><h1>{product.name}</h1><div><b>{product.price}</b>{product.was && <del>{product.was}</del>}<small>{copy.available}</small></div></div></section>

      <main className="product-detail">
        <section className="product-detail__gallery">
          <div className="gallery-thumbs" aria-label="Product image selection">
            {product.gallery.map((image, index) => <button type="button" key={`${image}-${index}`} className={selectedImage === image ? "is-active" : ""} onClick={() => setSelectedImage(image)}><img src={image} alt={`${product.name} view ${index + 1}`} /></button>)}
          </div>
          <div className="gallery-stage"><img src={selectedImage} alt={product.name} /><span>{String(product.gallery.indexOf(selectedImage) + 1).padStart(2, "0")} / {String(product.gallery.length).padStart(2, "0")}</span></div>
        </section>

        <aside className="product-detail__purchase">
          <nav className="breadcrumb"><Link href="/">{isArabic ? "المتجر" : isFrench ? "Boutique" : "Store"}</Link><span>/</span><Link href="/#collections">{product.category}</Link><span>/</span><b>{product.name}</b></nav>
          <div className="product-detail__title"><p className="detail-kicker">{copy.object}</p><h1>{product.name}</h1><button type="button" onClick={() => document.getElementById("product-details")?.scrollIntoView({ behavior: "smooth" })}>{copy.details} <ChevronDown size={15} /></button></div>
          <div className="product-detail__price"><strong>{product.price}</strong>{product.was && <del>{product.was}</del>}<span>{copy.taxes}</span></div>
          <div className="product-detail__availability"><span /><p>{copy.dispatch}</p><small>{copy.run}</small></div>

          <fieldset className="variant-field"><legend>{copy.color} / <b>{selectedColor.name}</b></legend><div>{product.colors.map((color) => <button type="button" key={color.name} aria-label={`${copy.color} ${color.name}`} className={selectedColor.name === color.name ? "is-selected" : ""} onClick={() => selectColor(color)}><img src={color.image} alt="" /><em>{color.name}</em><Check size={12} /></button>)}</div></fieldset>
          <div className="purchase-controls"><div className="detail-quantity"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => value + 1)}><Plus size={14} /></button></div><button type="button" className="detail-add" onClick={() => setBagOpen(true)}>{copy.add} <Plus size={15} /></button></div>
          {!directOrderOpen && <button type="button" className="detail-fast-order" onClick={() => { setDirectOrderOpen(true); setRequestSent(false); }}><Truck size={17} /> {copy.order} <ArrowRight size={15} /></button>}
          {directOrderOpen && <section className="inline-order-card"><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const fields = { customerName: String(form.get("customerName") ?? ""), phone: String(form.get("phone") ?? ""), address: String(form.get("address") ?? ""), city: String(form.get("city") ?? "") }; if (!hasCompleteCodOrderFields(fields)) return; submitCashOnDelivery.mutate({ productName: product.name, productPrice: product.price, productImageUrl: new URL(selectedColor.image, window.location.origin).toString(), color: selectedColor.name, quantity, ...fields }); }}><p className="inline-order-card__heading"><ClipboardCheck size={15} /><span>{copy.easyOrder}</span></p><div className="direct-order-fields"><label>{copy.fullName}<input required name="customerName" placeholder={isArabic ? "الاسم لاستلام الطلب" : isFrench ? "Nom du destinataire" : "Enter your full name"} /></label><label>{copy.phone}<input required name="phone" type="tel" placeholder={isArabic ? "رقم الهاتف" : isFrench ? "Numéro de téléphone" : "Phone number"} /></label><label className="full-row">{copy.address}<input required name="address" placeholder={isArabic ? "عنوان التسليم" : isFrench ? "Adresse de livraison" : "Shipping address"} /></label><label className="full-row">{copy.city}<input required name="city" placeholder={isArabic ? "المدينة" : isFrench ? "Ville" : "City"} /></label></div>{submitCashOnDelivery.error && <p className="direct-order-error" role="alert">{submitCashOnDelivery.error.message}</p>}<button className="direct-order-submit" type="submit" disabled={submitCashOnDelivery.isPending}>{submitCashOnDelivery.isPending ? (isArabic ? "يجري إرسال الطلب…" : isFrench ? "Envoi de la demande…" : "Sending request…") : copy.confirm} <Check size={15} /></button></form></section>}
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
        <div className="product-footer__links"><div><p>{isArabic ? "استكشاف" : isFrench ? "Explorer" : "Exploration"}</p><Link href="/#shop">{isArabic ? "تسوّق التشكيلة" : isFrench ? "Voir la sélection" : "Shop the edit"}</Link><Link href="/#story">{isArabic ? "ملاحظات الاستوديو" : isFrench ? "Notes de l’atelier" : "Studio notes"}</Link><Link href="/#journal">{isArabic ? "المجلة" : "Journal"}</Link><Link href="/contact">{isArabic ? "تواصل معنا" : isFrench ? "Contacter Panco" : "Contact Panco"}</Link></div><div><p>{isArabic ? "عملي" : isFrench ? "Pratique" : "Practical"}</p><a href="#product-details">{isArabic ? "العناية والإصلاح" : isFrench ? "Soin et réparation" : "Care & repair"}</a><a href="#product-details">{isArabic ? "تفاصيل التوصيل" : isFrench ? "Détails de livraison" : "Delivery details"}</a><a href="#product-details">{copy.cashTitle}</a><Link href="/admin">{isArabic ? "لوحة الكتالوج" : isFrench ? "Gestion du catalogue" : "Catalog desk"}</Link></div></div>
        <div className="product-footer__newsletter"><p>{isArabic ? "ابقَ على تواصل" : isFrench ? "Rester en contact" : "Stay connected"}</p><h2>{isArabic ? "رسائل متفرقة\nمن الاستوديو." : isFrench ? "Quelques nouvelles\nde l’atelier." : "Occasional notes\nfrom the studio."}</h2><form onSubmit={event => event.preventDefault()}><input type="email" aria-label={isFrench ? "Adresse e-mail" : "Email address"} placeholder={isArabic ? "البريد الإلكتروني" : isFrench ? "nom@example.com" : "Email address"} /><button aria-label={isFrench ? "S’inscrire" : "Subscribe"}><ArrowRight size={16} /></button></form><small>{isArabic ? "رسائل من الاستوديو فقط. يمكنك إلغاء الاشتراك في أي وقت." : isFrench ? "Correspondance de l’atelier uniquement. Désinscription à tout moment." : "Studio correspondence only. Unsubscribe any time."}</small></div>
        <div className="product-footer__base"><span>© 2026 Panco</span><span>{isArabic ? "صُنع ببطء. استُخدم جيداً." : isFrench ? "Fait lentement. Bien porté." : "Made slowly. Used well."}</span></div>
      </footer>

      {bagOpen && <div className="detail-bag-modal" role="dialog" aria-modal="true"><div><button type="button" className="detail-bag-modal__close" onClick={() => setBagOpen(false)}>{locale === "ar" ? "إغلاق" : "Close"}</button><span><Check size={21} /></span><p className="detail-kicker">{copy.added}</p><h2>{product.name}</h2><small>{selectedColor.name} / {copy.quantity} {quantity}</small><div className="detail-bag-modal__summary"><img src={selectedColor.image} alt="" /><div><b>{product.name}</b><p>{selectedColor.name}</p><strong>{product.price}</strong></div></div><button type="button" className="detail-bag-modal__checkout" onClick={() => { setBagOpen(false); setDirectOrderOpen(true); setRequestSent(false); }}>{copy.continueCod} <ArrowRight size={15} /></button><button type="button" className="detail-bag-modal__continue" onClick={() => setBagOpen(false)}>{copy.keepBrowsing}</button></div></div>}

    </div>
  );
}
