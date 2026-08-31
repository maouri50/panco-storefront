import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, ChevronRight, ClipboardList, LogOut, PackagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type AdminForm = {
  id?: number;
  slug: string;
  name: string;
  category: string;
  price: string;
  was: string;
  tag: string;
  image: string;
  gallery: string;
  colors: string;
  description: string;
  highlights: string;
  published: boolean;
  displayOrder: string;
};

type ManagedCatalogItem = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: string;
  was?: string;
  image: string;
  gallery: string[];
  swatches: string[];
  colors: { name: string; color: string; image: string }[];
  tag?: string;
  description: string;
  highlights: string[];
  published: boolean;
  displayOrder: number;
};

type AnnouncementForm = { enabled: boolean; messages: string[]; backgroundColor: string; textColor: string; fontStyle: "mono" | "serif" | "sans"; rotationSeconds: number };

const defaultAnnouncementForm: AnnouncementForm = { enabled: true, messages: ["Cash on Delivery available", "Hand-finished leather goods", "Panco / measured objects"], backgroundColor: "#18362a", textColor: "#f6f5f2", fontStyle: "mono", rotationSeconds: 4 };

const blankForm = (displayOrder = 1): AdminForm => ({
  slug: "",
  name: "",
  category: "",
  price: "",
  was: "",
  tag: "",
  image: "",
  gallery: "",
  colors: "",
  description: "",
  highlights: "",
  published: true,
  displayOrder: String(displayOrder),
});

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const lines = (value: string) => value.split("\n").map(item => item.trim()).filter(Boolean);

function formFromItem(item: ManagedCatalogItem): AdminForm {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    price: item.price,
    was: item.was ?? "",
    tag: item.tag ?? "",
    image: item.image,
    gallery: item.gallery.join("\n"),
    colors: item.colors.map(color => `${color.name} | ${color.color} | ${color.image}`).join("\n"),
    description: item.description,
    highlights: item.highlights.join("\n"),
    published: item.published,
    displayOrder: String(item.displayOrder),
  };
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const catalogQuery = trpc.catalog.adminList.useQuery(undefined, { enabled: isAdmin, retry: false });
  const announcementQuery = trpc.announcements.publicConfig.useQuery();
  const [form, setForm] = useState<AdminForm>(blankForm());
  const [creatingFirst, setCreatingFirst] = useState(false);
  const [notice, setNotice] = useState("");
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>(defaultAnnouncementForm);
  const utils = trpc.useUtils();

  const refresh = async () => utils.catalog.adminList.invalidate();
  const createItem = trpc.catalog.create.useMutation({ onSuccess: async item => { await refresh(); setForm(formFromItem(item)); setCreatingFirst(false); setNotice("Object added to the catalog."); } });
  const updateItem = trpc.catalog.update.useMutation({ onSuccess: async item => { await refresh(); setForm(formFromItem(item)); setNotice("Catalog changes saved."); } });
  const removeItem = trpc.catalog.remove.useMutation({ onSuccess: async () => { await refresh(); setForm(blankForm()); setNotice("Object removed from the catalog."); } });
  const importCatalog = trpc.catalog.importCurrentCatalog.useMutation({ onSuccess: async items => { await refresh(); if (items[0]) setForm(formFromItem(items[0])); setCreatingFirst(false); setNotice("Current studio catalog imported. You can now edit each object."); } });
  const saveAnnouncement = trpc.announcements.update.useMutation({ onSuccess: config => { setAnnouncementForm(config); setNotice("Announcement bar saved."); } });

  useEffect(() => { if (announcementQuery.data) setAnnouncementForm(announcementQuery.data); }, [announcementQuery.data]);

  const items = catalogQuery.data ?? [];
  const setField = <K extends keyof AdminForm>(field: K, value: AdminForm[K]) => setForm(current => ({ ...current, [field]: value }));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const gallery = lines(form.gallery);
    const colors = lines(form.colors).map(line => {
      const [name, color, image] = line.split("|").map(value => value.trim());
      return { name: name || "Leather", color: color || "#74736f", image: image || form.image };
    });
    const item = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      category: form.category,
      price: form.price,
      was: form.was || undefined,
      tag: form.tag || undefined,
      image: form.image,
      gallery: gallery.length ? gallery : [form.image],
      colors,
      swatches: colors.map(color => color.color),
      description: form.description,
      highlights: lines(form.highlights),
      published: form.published,
      displayOrder: Number(form.displayOrder) || 0,
    };

    if (form.id) updateItem.mutate({ id: form.id, item });
    else createItem.mutate(item);
  };

  if (loading) return <main className="admin-shell admin-state"><p className="admin-eyebrow">Panco / Admin</p><h1>Opening the<br /><em>catalog ledger.</em></h1></main>;

  if (!isAuthenticated) {
    return <main className="admin-shell admin-state"><Link href="/" className="admin-back"><ArrowLeft size={15} /> Back to storefront</Link><p className="admin-eyebrow">Private catalog desk</p><h1>Sign in to<br /><em>manage objects.</em></h1><p>The catalog desk is restricted to the project owner. Sign in with the owner account to add, edit, publish, or remove products.</p><button type="button" className="admin-primary" onClick={() => startLogin()}>Sign in as owner <ChevronRight size={16} /></button></main>;
  }

  if (!isAdmin) {
    return <main className="admin-shell admin-state"><Link href="/" className="admin-back"><ArrowLeft size={15} /> Back to storefront</Link><p className="admin-eyebrow">Private catalog desk</p><h1>This ledger is<br /><em>owner only.</em></h1><p>Your account is signed in, but it does not have catalog-management access. Sign in with the project owner account to continue.</p><button type="button" className="admin-secondary" onClick={() => logout()}><LogOut size={15} /> Sign out</button></main>;
  }

  if (catalogQuery.isLoading) return <main className="admin-shell admin-state"><Link href="/" className="admin-back"><ArrowLeft size={15} /> Back to storefront</Link><p className="admin-eyebrow">Private catalog desk</p><h1>Opening the<br /><em>object ledger.</em></h1></main>;
  if (catalogQuery.error) return <main className="admin-shell admin-state"><Link href="/" className="admin-back"><ArrowLeft size={15} /> Back to storefront</Link><p className="admin-eyebrow">Private catalog desk</p><h1>The ledger<br /><em>is unavailable.</em></h1><p>{catalogQuery.error.message}</p><button type="button" className="admin-primary" onClick={() => catalogQuery.refetch()}>Try again <ChevronRight size={16} /></button></main>;

  const saving = createItem.isPending || updateItem.isPending || removeItem.isPending || importCatalog.isPending || saveAnnouncement.isPending;
  const mutationError = createItem.error ?? updateItem.error ?? removeItem.error ?? importCatalog.error ?? saveAnnouncement.error;

  return <main className="admin-shell">
    <header className="admin-header"><Link href="/" className="admin-brand"><span>P</span> Panco</Link><div><p>Catalog desk / owner access</p><button type="button" onClick={() => logout()} aria-label="Sign out"><LogOut size={16} /></button></div></header>
    <section className="admin-intro"><div><p className="admin-eyebrow">Private catalog desk</p><h1>Objects,<br /><em>under your hand.</em></h1><p>Add new products, correct details, change order, and control whether an item is visible in the storefront.</p></div><div className="admin-intro__meta"><span><ClipboardList size={17} /> {items.length} managed items</span><span><Check size={17} /> Owner-only access</span></div></section>

    <section className="admin-announcement"><div><p className="admin-eyebrow">Announcement bar</p><h2>Messages in<br /><em>motion.</em></h2><p>These messages rotate in the green strip above the storefront navigation. Add one message or as many as you need.</p></div><form onSubmit={event => { event.preventDefault(); saveAnnouncement.mutate({ ...announcementForm, messages: announcementForm.messages.map(message => message.trim()).filter(Boolean) }); }}><label className="admin-toggle">Show announcement bar<span><input type="checkbox" checked={announcementForm.enabled} onChange={event => setAnnouncementForm(current => ({ ...current, enabled: event.target.checked }))} /> Visible to customers</span></label><div className="admin-announcement__appearance"><label>Bar color<input type="color" value={announcementForm.backgroundColor} onChange={event => setAnnouncementForm(current => ({ ...current, backgroundColor: event.target.value }))} /></label><label>Text color<input type="color" value={announcementForm.textColor} onChange={event => setAnnouncementForm(current => ({ ...current, textColor: event.target.value }))} /></label><label>Font<select value={announcementForm.fontStyle} onChange={event => setAnnouncementForm(current => ({ ...current, fontStyle: event.target.value as AnnouncementForm["fontStyle"] }))}><option value="mono">Studio mono</option><option value="serif">Editorial serif</option><option value="sans">Clean sans</option></select></label><label>Change every (seconds)<input type="number" min="2" max="20" value={announcementForm.rotationSeconds} onChange={event => setAnnouncementForm(current => ({ ...current, rotationSeconds: Number(event.target.value) || 4 }))} /></label></div><div className="admin-announcement__messages">{announcementForm.messages.map((message, index) => <div key={index}><input aria-label={`Announcement message ${index + 1}`} value={message} onChange={event => setAnnouncementForm(current => ({ ...current, messages: current.messages.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} placeholder="Announcement message" /><button type="button" disabled={announcementForm.messages.length === 1} onClick={() => setAnnouncementForm(current => ({ ...current, messages: current.messages.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</button></div>)}</div><div className="admin-announcement__actions"><button type="button" className="admin-secondary" disabled={announcementForm.messages.length >= 12} onClick={() => setAnnouncementForm(current => ({ ...current, messages: [...current.messages, ""] }))}><Plus size={15} /> Add message</button><button className="admin-primary" type="submit" disabled={saving}>{saveAnnouncement.isPending ? "Saving…" : "Save announcement bar"} <Save size={15} /></button></div></form></section>

    {items.length === 0 && !creatingFirst ? <section className="admin-import"><div><PackagePlus size={27} /><h2>Start your catalog<br />your way.</h2><p>Import the original studio edit as a starting point, or create your first item from scratch.</p></div><div className="admin-import__actions"><button className="admin-secondary" type="button" disabled={saving} onClick={() => { setCreatingFirst(true); setForm(blankForm(1)); setNotice(""); }}>Create first item <Plus size={16} /></button><button className="admin-primary" type="button" disabled={saving} onClick={() => importCatalog.mutate()}>{saving ? "Importing…" : "Import current catalog"} <ChevronRight size={16} /></button></div></section> : <section className="admin-workspace">
      {items.length > 0 && <aside className="admin-list"><div className="admin-list__head"><p>Catalog items</p><button type="button" onClick={() => { setCreatingFirst(false); setForm(blankForm(Math.max(0, ...items.map(item => item.displayOrder)) + 1)); setNotice(""); }}><Plus size={15} /> New object</button></div><div className="admin-list__items">{items.map(item => <button type="button" key={item.id} className={form.id === item.id ? "is-selected" : ""} onClick={() => { setCreatingFirst(false); setForm(formFromItem(item)); setNotice(""); }}><img src={item.image} alt="" /><span><b>{item.name}</b><small>{item.published ? "Published" : "Draft"} / {item.category}</small></span><Pencil size={14} /></button>)}</div></aside>}
      <section className="admin-editor"><div className="admin-editor__head"><div><p className="admin-eyebrow">{form.id ? "Edit object" : "New object"}</p><h2>{form.name || "Untitled object"}</h2></div>{form.id && <button className="admin-delete" type="button" disabled={saving} onClick={() => { if (window.confirm(`Remove ${form.name} from the catalog?`)) removeItem.mutate({ id: form.id! }); }}><Trash2 size={15} /> Remove</button>}</div>{notice && <p className="admin-notice">{notice}</p>}{mutationError && <p className="admin-error">{mutationError.message}</p>}
        <form onSubmit={submit} className="admin-form"><div className="admin-form__grid"><label>Name<input required value={form.name} onChange={event => { setField("name", event.target.value); if (!form.slug) setField("slug", slugify(event.target.value)); }} placeholder="Example: Ridge Travel Case" /></label><label>Slug<input required value={form.slug} onChange={event => setField("slug", slugify(event.target.value))} placeholder="ridge-travel-case" /></label><label>Category<input required value={form.category} onChange={event => setField("category", event.target.value)} placeholder="Travel carry" /></label><label>Price<input required value={form.price} onChange={event => setField("price", event.target.value)} placeholder="$240" /></label><label>Previous price <small>Optional</small><input value={form.was} onChange={event => setField("was", event.target.value)} placeholder="$280" /></label><label>Tag <small>Optional</small><input value={form.tag} onChange={event => setField("tag", event.target.value)} placeholder="New" /></label><label className="admin-span-two">Primary image URL<input required value={form.image} onChange={event => setField("image", event.target.value)} placeholder="/manus-storage/your-image.jpg" /></label><label>Display order<input required type="number" min="0" value={form.displayOrder} onChange={event => setField("displayOrder", event.target.value)} /></label><label className="admin-toggle">Visibility<span><input type="checkbox" checked={form.published} onChange={event => setField("published", event.target.checked)} /> Publish to storefront</span></label><label className="admin-span-two">Gallery image URLs <small>One URL per line</small><textarea required value={form.gallery} onChange={event => setField("gallery", event.target.value)} placeholder="/manus-storage/your-image.jpg" /></label><label className="admin-span-two">Color variants <small>One per line: Name | #hex | image URL</small><textarea value={form.colors} onChange={event => setField("colors", event.target.value)} placeholder="Oxblood | #66363f | /manus-storage/your-image.jpg" /></label><label className="admin-span-two">Description<textarea required value={form.description} onChange={event => setField("description", event.target.value)} placeholder="A concise product story…" /></label><label className="admin-span-two">Highlights <small>One detail per line</small><textarea required value={form.highlights} onChange={event => setField("highlights", event.target.value)} placeholder="Vegetable-tanned leather" /></label></div><div className="admin-form__foot"><p>Use managed image URLs so media remains available after publishing.</p><button className="admin-primary" type="submit" disabled={saving}>{saving ? "Saving…" : form.id ? "Save catalog changes" : "Add to catalog"} <Save size={15} /></button></div></form>
      </section>
    </section>}
  </main>;
}
