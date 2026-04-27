import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, Star, Sparkles, Flame } from "lucide-react";

export const Route = createFileRoute("/admin/perfumes")({ component: PerfumesPage });

interface Category { id: string; name: string }
interface Perfume {
  id: string; name: string; brand: string | null; price: number;
  description: string | null; image_url: string | null;
  stock: number; category_id: string | null;
  is_featured: boolean; is_new_arrival: boolean; is_bestseller: boolean;
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: z.string().trim().max(80).optional().or(z.literal("")),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  category_id: z.string().uuid().nullable(),
  image_url: z.string().url().nullable().or(z.literal("")),
});

// Reusable inline toggle switch
function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
      <p className="text-sm font-medium">{label}</p>
      <button
        type="button"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-amber-500" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function PerfumesPage() {
  const [items, setItems] = useState<Perfume[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Perfume | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("none");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [brand, setBrand] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = supabase;

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      db.from("perfumes").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    if (cRes.error) toast.error(cRes.error.message);
    setItems((pRes.data ?? []) as Perfume[]);
    setCategories(cRes.data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setEditing(null); setName(""); setBrand(""); setPrice(""); setStock("0");
    setDescription(""); setCategoryId("none"); setImageUrl("");
    setIsFeatured(false); setIsNewArrival(false); setIsBestseller(false);
  }
  function openNew() { reset(); setOpen(true); }
  function openEdit(p: Perfume) {
    setEditing(p); setName(p.name); setBrand(p.brand ?? ""); setPrice(String(p.price));
    setStock(String(p.stock)); setDescription(p.description ?? "");
    setCategoryId(p.category_id ?? "none"); setImageUrl(p.image_url ?? "");
    setIsFeatured(p.is_featured ?? false);
    setIsNewArrival(p.is_new_arrival ?? false);
    setIsBestseller(p.is_bestseller ?? false);
    setOpen(true);
  }

  async function toggleFlag(p: Perfume, field: "is_featured" | "is_new_arrival" | "is_bestseller") {
    const next = !p[field];
    const { error } = await db.from("perfumes").update({ [field]: next }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.map((x) => x.id === p.id ? { ...x, [field]: next } : x));
    const labels: Record<string, [string, string]> = {
      is_featured: [`"${p.name}" is now featured`, `"${p.name}" removed from featured`],
      is_new_arrival: [`"${p.name}" marked as New Arrival`, `"${p.name}" removed from New Arrivals`],
      is_bestseller: [`"${p.name}" marked as Bestseller`, `"${p.name}" removed from Bestsellers`],
    };
    toast.success(labels[field][next ? 0 : 1]);
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Only image files are allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max image size is 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("perfume-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("perfume-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function save(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse({
      name, brand, price: Number(price), stock: Number(stock), description,
      category_id: categoryId === "none" ? null : categoryId,
      image_url: imageUrl || null,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSubmitting(true);
    const payload = {
      ...parsed.data,
      brand: parsed.data.brand || null,
      description: parsed.data.description || null,
      image_url: parsed.data.image_url || null,
      is_featured: isFeatured,
      is_new_arrival: isNewArrival,
      is_bestseller: isBestseller,
    };
    const { error } = editing
      ? await db.from("perfumes").update(payload).eq("id", editing.id)
      : await db.from("perfumes").insert(payload);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Perfume updated" : "Perfume created");
    setOpen(false);
    load();
  }

  async function remove(p: Perfume) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    // Delete image from storage first (extract path after "/perfume-images/")
    if (p.image_url) {
      const storagePath = p.image_url.split("/perfume-images/")[1];
      if (storagePath) await supabase.storage.from("perfume-images").remove([storagePath]);
    }
    const { error } = await supabase.from("perfumes").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  }

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  const flags = [
    { key: "is_featured" as const, icon: Star,     label: "Featured",    activeClass: "bg-amber-500 text-white",  inactiveClass: "bg-white/80 text-muted-foreground hover:text-amber-500", fillClass: "fill-white" },
    { key: "is_new_arrival" as const, icon: Sparkles, label: "New",         activeClass: "bg-blue-500 text-white",   inactiveClass: "bg-white/80 text-muted-foreground hover:text-blue-500",  fillClass: "" },
    { key: "is_bestseller" as const, icon: Flame,   label: "Bestseller",  activeClass: "bg-rose-500 text-white",   inactiveClass: "bg-white/80 text-muted-foreground hover:text-rose-500",  fillClass: "fill-white" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Perfumes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your fragrance catalog.</p>
          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
            {[
              { key: "is_featured", icon: Star, label: "Featured", color: "text-amber-500" },
              { key: "is_new_arrival", icon: Sparkles, label: "New Arrivals", color: "text-blue-500" },
              { key: "is_bestseller", icon: Flame, label: "Bestsellers", color: "text-rose-500" },
            ].map(({ key, icon: Icon, label, color }) => {
              const count = items.filter((p) => p[key as keyof Perfume]).length;
              return count > 0 ? (
                <span key={key} className={`flex items-center gap-1 ${color}`}>
                  <Icon className="h-3 w-3" /> {count} {label}
                </span>
              ) : null;
            })}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit perfume" : "New perfume"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={save} className="space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-start gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input ref={fileInput} type="file" accept="image/*" hidden
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                      <Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading…" : "Upload image"}
                    </Button>
                    {imageUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>Remove</Button>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pname">Name *</Label>
                <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pbrand">Brand</Label>
                <Input id="pbrand" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={80} placeholder="e.g. Tom Ford, Chanel…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input id="price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input id="stock" type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdesc">Description</Label>
                <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Section Visibility</Label>
                <Toggle on={isFeatured}    onToggle={() => setIsFeatured((v) => !v)}    label="⭐ Feature on Homepage" />
                <Toggle on={isNewArrival}  onToggle={() => setIsNewArrival((v) => !v)}  label="✦ New Arrival" />
                <Toggle on={isBestseller}  onToggle={() => setIsBestseller((v) => !v)}  label="🔥 Bestseller" />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No perfumes yet. Add your first fragrance.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}

                {/* Section flag toggles */}
                <div className="absolute right-2 top-2 flex flex-col gap-1.5">
                  {flags.map(({ key, icon: Icon, label, activeClass, inactiveClass, fillClass }) => (
                    <button
                      key={key}
                      onClick={() => toggleFlag(p, key)}
                      title={p[key] ? `Remove from ${label}` : `Add to ${label}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-full shadow transition-all text-xs ${p[key] ? activeClass : inactiveClass}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${p[key] ? fillClass : ""}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold leading-tight truncate">{p.name}</h3>
                    {/* Active flag chips */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.is_featured   && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700"><Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />Featured</span>}
                      {p.is_new_arrival && <span className="inline-flex items-center gap-1 rounded-full bg-blue-100  px-2 py-0.5 text-[10px] font-medium text-blue-700"><Sparkles className="h-2.5 w-2.5 text-blue-500" />New</span>}
                      {p.is_bestseller  && <span className="inline-flex items-center gap-1 rounded-full bg-rose-100  px-2 py-0.5 text-[10px] font-medium text-rose-700"><Flame className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />Bestseller</span>}
                    </div>
                  </div>
                  <span className="shrink-0 font-display text-lg font-semibold" style={{ color: "var(--accent)" }}>
                    AED {Number(p.price).toFixed(2)}
                  </span>
                </div>
                <p className="mt-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                  {p.brand && <span className="text-foreground/70">{p.brand} · </span>}
                  {catName(p.category_id)} · Stock {p.stock}
                </p>
                {p.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
