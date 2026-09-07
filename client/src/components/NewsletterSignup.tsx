import type { Locale } from "@/contexts/LocaleContext";
import { trpc } from "@/lib/trpc";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

type NewsletterSignupProps = { locale: Locale; compact?: boolean };

const copy = {
  en: { intro: "New objects, process stories, and carefully timed studio news. No noise.", label: "Email address", placeholder: "you@example.com", consent: "I agree to receive Panco studio correspondence. I can unsubscribe at any time.", submit: "Subscribe", success: "You are on the Panco list.", unavailable: "The newsletter list will open shortly." },
  fr: { intro: "Nouveaux objets, histoires de fabrication et nouvelles choisies de l’atelier. Sans bruit.", label: "Adresse e-mail", placeholder: "nom@example.com", consent: "J’accepte de recevoir la correspondance de l’atelier Panco. Désinscription à tout moment.", submit: "S’inscrire", success: "Vous êtes inscrit à la liste Panco.", unavailable: "La liste d’information ouvrira bientôt." },
  ar: { intro: "قطع جديدة وحكايات من الصنع وأخبار الاستوديو في وقتها. بلا ضجيج.", label: "البريد الإلكتروني", placeholder: "name@example.com", consent: "أوافق على تلقي مراسلات استوديو بانكو ويمكنني إلغاء الاشتراك في أي وقت.", submit: "اشترك", success: "تمت إضافتك إلى قائمة بانكو.", unavailable: "ستتوفر قائمة الرسائل قريباً." },
} as const;

export function NewsletterSignup({ locale, compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [notice, setNotice] = useState("");
  const signup = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => { setNotice(copy[locale].success); setEmail(""); setConsent(false); },
    onError: error => setNotice(error.message.includes("not configured") ? copy[locale].unavailable : error.message),
  });
  const text = copy[locale];
  return <form className={`${compact ? "product-footer__newsletter" : "newsletter-form"} newsletter-signup`} onSubmit={event => { event.preventDefault(); setNotice(""); signup.mutate({ email, consent: true }); }}>
    {!compact && <p>{text.intro}</p>}
    {!compact && <label htmlFor="newsletter-email">{text.label}</label>}
    <div className="newsletter-signup__field"><input id={compact ? "product-newsletter-email" : "newsletter-email"} required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={text.placeholder} aria-label={compact ? text.label : undefined} /><button aria-label={text.submit} disabled={signup.isPending || !consent}>{signup.isPending ? "…" : <ArrowRight size={compact ? 16 : 18} />}</button></div>
    <label className="newsletter-consent"><input required type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>{text.consent}</span></label>
    {notice && <p className="newsletter-feedback" role="status">{notice}</p>}
  </form>;
}
