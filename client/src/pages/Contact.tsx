import { ArrowLeft, ArrowRight, Check, Mail, MessageSquareText, Send } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PancoLogo } from "@/components/PancoLogo";

const contactCopy = {
  en: { eyebrow: "Panco correspondence", title: "Let’s make the\ndetails work.", intro: "For an order question, care guidance, or a note for the studio, write to Panco directly.", formTitle: "Send a note", name: "Full name", email: "Email address", topic: "Topic", message: "Your message", submit: "Send to Panco", sent: "Message received.", sentNote: "Your note has reached the Panco desk.", back: "Back to the atelier", topics: ["Order question", "Product care", "Repair request", "General inquiry"] },
  fr: { eyebrow: "Correspondance Panco", title: "Réglons les\ndétails ensemble.", intro: "Pour une question de commande, un conseil d’entretien ou un message à l’atelier, écrivez directement à Panco.", formTitle: "Envoyer un message", name: "Nom complet", email: "Adresse e-mail", topic: "Sujet", message: "Votre message", submit: "Envoyer à Panco", sent: "Message reçu.", sentNote: "Votre message est arrivé au bureau Panco.", back: "Retour à l’atelier", topics: ["Question de commande", "Entretien du produit", "Demande de réparation", "Demande générale"] },
  ar: { eyebrow: "مراسلات بانكو", title: "لنهتم\nبالتفاصيل معًا.", intro: "لسؤال عن طلب أو إرشادات العناية أو رسالة إلى الاستوديو، اكتب مباشرة إلى بانكو.", formTitle: "أرسل رسالة", name: "الاسم الكامل", email: "البريد الإلكتروني", topic: "الموضوع", message: "رسالتك", submit: "إرسال إلى بانكو", sent: "تم استلام رسالتك.", sentNote: "وصلت رسالتك إلى مكتب بانكو.", back: "العودة إلى الاستوديو", topics: ["سؤال عن طلب", "العناية بالمنتج", "طلب إصلاح", "استفسار عام"] },
} as const;

export default function Contact() {
  const { locale, direction } = useLocale();
  const copy = contactCopy[locale];
  const [sent, setSent] = useState(false);
  const submit = trpc.contact.submit.useMutation({ onSuccess: () => setSent(true) });

  return <div className="contact-page" dir={direction}>
    <div className="contact-page__bar"><Link href="/"><ArrowLeft size={14} /> {copy.back}</Link><span>Cash on Delivery available</span><span>Panco / Contact</span></div>
    <header className="contact-page__nav"><Link href="/" className="contact-page__brand"><PancoLogo variant="dark" /></Link><nav><Link href="/#shop">{locale === "ar" ? "المتجر" : locale === "fr" ? "Boutique" : "Shop"}</Link><Link href="/#story">{locale === "ar" ? "الاستوديو" : locale === "fr" ? "Atelier" : "Studio"}</Link></nav></header>
    <main className="contact-page__main">
      <section className="contact-page__intro"><p className="detail-kicker">{copy.eyebrow}</p><h1>{copy.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h1><p>{copy.intro}</p><div className="contact-page__notes"><article><Mail size={18} /><div><b>{locale === "ar" ? "رسالة مباشرة" : locale === "fr" ? "Message direct" : "Direct message"}</b><span>{locale === "ar" ? "تصل رسالتك إلى مكتب بانكو." : locale === "fr" ? "Votre message arrive directement au bureau Panco." : "Your note reaches the Panco desk directly."}</span></div></article><article><MessageSquareText size={18} /><div><b>{locale === "ar" ? "رد مدروس" : locale === "fr" ? "Réponse attentive" : "A considered reply"}</b><span>{locale === "ar" ? "أضف رقم طلبك إذا كنت تسأل عن طلب قائم." : locale === "fr" ? "Ajoutez votre référence si votre message concerne une commande." : "Include an order reference if your note concerns an existing request."}</span></div></article></div></section>
      <section className="contact-page__form-card">{sent ? <div className="contact-page__success"><span><Check size={20} /></span><h2>{copy.sent}</h2><p>{copy.sentNote}</p><button type="button" onClick={() => setSent(false)}>{copy.formTitle} <ArrowRight size={15} /></button></div> : <form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submit.mutate({ customerName: String(form.get("customerName") ?? ""), email: String(form.get("email") ?? ""), topic: String(form.get("topic") ?? ""), message: String(form.get("message") ?? "") }); }}><p className="contact-page__form-title"><Send size={15} /> {copy.formTitle}</p><label>{copy.name}<input required name="customerName" placeholder={copy.name} /></label><label>{copy.email}<input required type="email" name="email" placeholder="name@example.com" /></label><label>{copy.topic}<select name="topic">{copy.topics.map((topic) => <option key={topic}>{topic}</option>)}</select></label><label>{copy.message}<textarea required name="message" rows={6} placeholder={locale === "ar" ? "اكتب رسالتك هنا" : locale === "fr" ? "Écrivez votre message ici" : "Write your message here"} /></label>{submit.error && <p className="contact-page__error" role="alert">{submit.error.message}</p>}<button type="submit" disabled={submit.isPending}>{submit.isPending ? "…" : copy.submit} <ArrowRight size={15} /></button></form>}</section>
    </main>
  </div>;
}
