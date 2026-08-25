import type { Locale } from "@/contexts/LocaleContext";
import type { Product } from "@/lib/catalog";

type ProductCopy = Pick<Product, "name" | "category" | "description" | "highlights"> & {
  colors: Record<string, string>;
  tag?: string;
};

const arabicProducts: Record<string, ProductCopy> = {
  "atlas-card-wallet": {
    name: "محفظة أطلس للبطاقات",
    category: "إكسسوارات جلدية صغيرة",
    tag: "جديد",
    description: "محفظة صغيرة للبطاقات والنقود والتفاصيل اليومية الأقرب إليك. خفيفة في اليد، متوازنة في شكلها، وتزداد جمالاً مع الاستعمال.",
    highlights: ["أربع فتحات للبطاقات وجيب مطوي للنقود", "جلد طبيعي مدبوغ نباتياً", "حواف مصقولة يدوياً وخياطة سرجية", "حجم مناسب للجيب الأمامي"],
    colors: { Oxblood: "خمري داكن", "Night brown": "بني ليلي" },
  },
  "morrow-tote": {
    name: "حقيبة مورو اليومية",
    category: "حمل يومي",
    description: "حقيبة يومية رحبة تجمع بين النعومة والبساطة العملية. صُممت للدفتر وطبقة إضافية وكل ما يجعل اليوم أكثر سهولة.",
    highlights: ["إغلاق مغناطيسي علوي", "جيب داخلي معلّق", "أحزمة كتف مريحة", "قطع معدنية من النحاس الصلب"],
    colors: { Saddle: "بني سرج", Umber: "بني ترابي" },
  },
  "rook-field-bag": {
    name: "حقيبة روك الميدانية",
    category: "حقيبة كتف",
    tag: "اختيار الاستوديو",
    description: "حقيبة عملية بحجم ميداني للأشياء التي يجب أن تبقى في المتناول. يحمل شكلها الهادئ بنية اليوم دون أن يطلب الانتباه.",
    highlights: ["حزام كتف قابل للتعديل", "جيب أمامي عملي", "بطانة داخلية ناعمة", "صناعة محدودة داخل الورشة"],
    colors: { Cedar: "خشب الأرز", Chestnut: "كستنائي" },
  },
  "long-mile-duffle": {
    name: "حقيبة لونغ مايل للسفر",
    category: "حمل نهاية الأسبوع",
    description: "حقيبة سفر ناعمة لليلة بعيدة أو أيام قليلة خارج المألوف. حمل متوازن وسحابات متينة وشكل يزداد جمالاً مع كل رحلة.",
    highlights: ["فتحة سحاب واسعة", "حزام كتف قابل للإزالة", "قاعدة جلدية مقوّاة", "أبعاد مناسبة لمقصورة الطائرة"],
    colors: { Oxhide: "جلد ثور", "Dark umber": "بني ترابي داكن" },
  },
};

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale !== "ar" || !arabicProducts[product.slug]) return product;
  const copy = arabicProducts[product.slug];
  return {
    ...product,
    name: copy.name,
    category: copy.category,
    tag: copy.tag,
    description: copy.description,
    highlights: copy.highlights,
    colors: product.colors.map(color => ({ ...color, name: copy.colors[color.name] ?? color.name })),
  };
}

export const homeCopy = {
  en: {
    locale: "English",
    localeDetail: "International",
    promo: ["Complimentary delivery over $150", "Cash on Delivery available", "Small-run objects, dispatched weekly"],
    nav: { shop: "Shop", studio: "Studio", journal: "Journal" },
    hero: [
      { eyebrow: "The summer field edit", title: "Carry the day\nwith you.", note: "Slow-made companions for daily miles, night trains, and long returns.", cta: "Shop the edit" },
      { eyebrow: "For the in-between", title: "Room for\nwhat matters.", note: "A study in soft architecture, practical pockets, and enduring leather.", cta: "Explore bags" },
      { eyebrow: "Made by hand", title: "The evidence\nof care.", note: "Each edge is burnished, every seam considered, and nothing rushed.", cta: "Meet the makers" },
    ],
    newArrivals: "New arrivals",
    everyday: "Objects for\nthe everyday.",
    collections: "See all collections",
    quickAdd: "Quick add",
    stayConnected: "Stay connected",
    notes: "Occasional notes\nfrom the studio.",
    language: "Language",
  },
  ar: {
    locale: "العربية",
    localeDetail: "المغرب والشرق الأوسط",
    promo: ["توصيل مجاني للطلبات فوق 150 دولار", "الدفع عند الاستلام متاح", "قطع مصنوعة بكميات محدودة"],
    nav: { shop: "المتجر", studio: "الاستوديو", journal: "المجلة" },
    hero: [
      { eyebrow: "تشكيلة الصيف", title: "احمل يومك\nمعك.", note: "رفقاء مصنوعون بهدوء للمشاوير اليومية والرحلات والعودة الطويلة.", cta: "تسوّق التشكيلة" },
      { eyebrow: "لما بين اللحظات", title: "مساحة\nلما يهم.", note: "دراسة في الهندسة الناعمة والجيوب العملية والجلد الذي يدوم.", cta: "اكتشف الحقائب" },
      { eyebrow: "صنع يدوي", title: "دليل\nالعناية.", note: "كل حافة مصقولة وكل غرزة مدروسة، بلا استعجال.", cta: "تعرّف على الصنّاع" },
    ],
    newArrivals: "وصل حديثاً",
    everyday: "قطع\nلليوميات.",
    collections: "كل التشكيلات",
    quickAdd: "أضف سريعاً",
    stayConnected: "ابقَ على تواصل",
    notes: "رسائل متفرقة\nمن الاستوديو.",
    language: "اللغة",
  },
} as const;

export const productCopy = {
  en: {
    back: "Back to the atelier", available: "Cash on Delivery available", ledger: "North Atelier / Product ledger", object: "North Atelier object", details: "Details", taxes: "Taxes and delivery calculated at confirmation.", dispatch: "Available for studio dispatch", run: "Small workshop run", color: "Color", add: "Add to bag", order: "Order with Cash on Delivery", closeOrder: "Close order details", easyOrder: "Easy order / Cash on Delivery", deliverySimple: "Delivery, made\nsimple.", deliveryNote: "Payment is collected only when your delivery arrives.", fullName: "Full name", phone: "Phone number", address: "Delivery address", city: "City", note: "Order note", confirm: "Confirm Cash on Delivery request", cashTitle: "Cash on Delivery", cashBody: "We confirm delivery details before dispatch, then the courier collects the order total at your door.", customerNotes: "Customer notes", noNotes: "No notes\nyet.", noNotesBody: "This object has no published customer notes yet. When genuine feedback is available, it will appear here.", related: "You may also\nlike these.", viewEdit: "View the studio edit", ask: "Ask the studio", quantity: "Quantity", added: "Added to your bag", continueCod: "Continue with Cash on Delivery", keepBrowsing: "Keep browsing",
  },
  ar: {
    back: "العودة إلى الاستوديو", available: "الدفع عند الاستلام متاح", ledger: "نورث أتيلييه / سجل المنتجات", object: "قطعة من نورث أتيلييه", details: "التفاصيل", taxes: "تُحسب الضرائب والتوصيل عند التأكيد.", dispatch: "متاح للشحن من الاستوديو", run: "دفعة صغيرة من الورشة", color: "اللون", add: "أضف إلى الحقيبة", order: "اطلب بالدفع عند الاستلام", closeOrder: "إغلاق تفاصيل الطلب", easyOrder: "طلب سهل / الدفع عند الاستلام", deliverySimple: "توصيل\nبكل بساطة.", deliveryNote: "يتم الدفع فقط عند وصول طلبك.", fullName: "الاسم الكامل", phone: "رقم الهاتف", address: "عنوان التوصيل", city: "المدينة", note: "ملاحظة الطلب", confirm: "تأكيد طلب الدفع عند الاستلام", cashTitle: "الدفع عند الاستلام", cashBody: "نؤكد تفاصيل التوصيل قبل الشحن، ثم يستلم المندوب قيمة الطلب عند بابك.", customerNotes: "ملاحظات العملاء", noNotes: "لا توجد\nملاحظات بعد.", noNotesBody: "لا توجد ملاحظات منشورة لهذه القطعة حتى الآن. ستظهر الملاحظات الحقيقية هنا عند توفرها.", related: "قد تعجبك\nهذه القطع أيضاً.", viewEdit: "شاهد تشكيلة الاستوديو", ask: "تواصل مع الاستوديو", quantity: "الكمية", added: "أُضيف إلى حقيبتك", continueCod: "تابع إلى الدفع عند الاستلام", keepBrowsing: "تابع التصفح",
  },
} as const;
