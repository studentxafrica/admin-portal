import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ChevronDown, ChevronUp, KeyRound, Pencil, Shuffle } from "lucide-react";

const CAMPAIGN = "studentxmas";

interface DropRun { ranAt: string; eligible: number; picked: number; shortfall: number; triggeredBy: string }
interface AdminDrop {
  id: string; number: number; title: string; brand: string; description: string | null; coverImage: string | null;
  kind: "airtime" | "voucher" | "crew"; quantity: number; crewSize: number | null; pickAt: string;
  status: "upcoming" | "picked"; overdue: boolean; venuePinSet: boolean; run: DropRun | null;
}
interface Recipient {
  id: string; dropId: string; drop: string; kind: string; name: string; email: string; phone: string | null;
  reference: string; fulfilment: "pending" | "sent" | "redeemed"; crew: string[]; crewComplete: boolean;
  expiresAt: string; redeemedAt: string | null;
}
interface Overview {
  campaign: { name: string; startsAt: string; endsAt: string };
  members: number; verifiedMembers: number; drops: AdminDrop[];
}

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", {
  weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi",
});
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" });
const message = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

/** StudentXmas: drops, picks, recipients, venue PINs and drop details, for admins. */
export const DropsManagement = () => {
  const { toast } = useToast();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pinFor, setPinFor] = useState<AdminDrop | null>(null);
  const [pin, setPin] = useState("");
  const [editing, setEditing] = useState<AdminDrop | null>(null);
  const [form, setForm] = useState({ title: "", brand: "", description: "", coverImage: "" });

  const load = useCallback(async () => {
    try {
      const [summary, picks] = await Promise.all([
        axiosInstance.get(`/drops/admin/campaigns/${CAMPAIGN}`),
        axiosInstance.get(`/drops/admin/campaigns/${CAMPAIGN}/picks`),
      ]);
      setOverview(summary.data.data);
      setRecipients(picks.data.data.picks);
    } catch (error) {
      toast({ title: "Couldn't load StudentXmas", description: message(error, "Try again in a moment."), variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const act = async (key: string, run: () => Promise<unknown>, done: string, after?: () => void) => {
    setBusy(key);
    try {
      await run();
      toast({ title: done });
      after?.();
      await load();
    } catch (error) {
      toast({ title: "That didn't work", description: message(error, "Try again in a moment."), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const pickNow = (drop: AdminDrop) =>
    act(`pick-${drop.id}`, () => axiosInstance.post(`/drops/admin/drops/${drop.id}/pick`), `${drop.title} picked`);
  const markSent = (r: Recipient) =>
    act(`sent-${r.id}`, () => axiosInstance.post(`/drops/admin/picks/${r.id}/fulfilment`, { status: "sent" }), `Marked as sent to ${r.name}`);
  const savePin = () => pinFor &&
    act("pin", () => axiosInstance.post(`/drops/admin/drops/${pinFor.id}/venue-pin`, { pin }), "Venue PIN saved",
      () => { setPinFor(null); setPin(""); });
  const saveEdit = () => editing &&
    act("edit", () => axiosInstance.put(`/drops/admin/drops/${editing.id}`, form), "Drop updated", () => setEditing(null));

  const startEdit = (drop: AdminDrop) => {
    setForm({ title: drop.title, brand: drop.brand, description: drop.description ?? "", coverImage: drop.coverImage ?? "" });
    setEditing(drop);
  };
  const pickPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, coverImage: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  if (!overview) return <p className="text-gray-500">Loading StudentXmas…</p>;
  const overdue = overview.drops.filter((d) => d.overdue);
  const needsPin = overview.drops.filter((d) => d.kind !== "airtime" && !d.venuePinSet && d.status === "upcoming");
  const airtimeToSend = recipients.filter((r) => r.kind === "airtime" && r.fulfilment === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{overview.campaign.name}</h1>
        <p className="text-gray-500">{day(overview.campaign.startsAt)} – {day(overview.campaign.endsAt)} · drops are picked at random at their pick time</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Joined</p><p className="text-2xl font-bold">{overview.members}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Verified, so in the next pick</p><p className="text-2xl font-bold">{overview.verifiedMembers}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Airtime to send</p><p className="text-2xl font-bold">{airtimeToSend.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-gray-500">Drops picked</p><p className="text-2xl font-bold">{overview.drops.filter((d) => d.status === "picked").length} of {overview.drops.length}</p></CardContent></Card>
      </div>

      {(overdue.length > 0 || needsPin.length > 0) && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="space-y-1 p-5 text-sm text-amber-900">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" />Needs attention</p>
            {overdue.map((d) => <p key={d.id}>{d.title} ({when(d.pickAt)}) should have been picked. Use "Pick now".</p>)}
            {needsPin.map((d) => <p key={d.id}>{d.title} has no venue PIN yet; the venue can't mark passes as used.</p>)}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Drops</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {overview.drops.map((drop) => {
            const people = recipients.filter((r) => r.dropId === drop.id);
            const expanded = open === drop.id;
            return (
              <div key={drop.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">Drop {drop.number} · {when(drop.pickAt)} · {drop.kind === "crew" ? `crew of ${drop.crewSize}` : `${drop.quantity} available`}</p>
                    <p className="font-semibold text-gray-900">{drop.title} <span className="font-normal text-gray-500">· {drop.brand}</span></p>
                    {drop.run && (
                      <p className="text-sm text-gray-600">
                        Picked {when(drop.run.ranAt)}: {drop.run.picked} of {drop.run.eligible} eligible
                        {drop.run.shortfall > 0 ? `, ${drop.run.shortfall} not awarded (too few eligible)` : ""}
                      </p>
                    )}
                  </div>
                  {drop.status === "picked" ? <Badge variant="secondary">Picked</Badge>
                    : drop.overdue ? <Badge className="bg-amber-500">Overdue</Badge>
                    : <Badge variant="outline">Upcoming</Badge>}
                  {drop.kind !== "airtime" && (
                    <Badge variant={drop.venuePinSet ? "secondary" : "outline"}>{drop.venuePinSet ? "Venue PIN set" : "No venue PIN"}</Badge>
                  )}
                  {drop.status === "upcoming" && new Date(drop.pickAt) <= new Date() && (
                    <Button size="sm" onClick={() => pickNow(drop)} disabled={busy === `pick-${drop.id}`}><Shuffle className="mr-1 h-4 w-4" />Pick now</Button>
                  )}
                  {drop.kind !== "airtime" && (
                    <Button size="sm" variant="outline" onClick={() => { setPin(""); setPinFor(drop); }}><KeyRound className="mr-1 h-4 w-4" />Venue PIN</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => startEdit(drop)}><Pencil className="mr-1 h-4 w-4" />Edit</Button>
                  {people.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setOpen(expanded ? null : drop.id)} aria-expanded={expanded}>
                      {people.length} picked {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </Button>
                  )}
                </div>
                {expanded && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr><th className="py-2 pr-4">Student</th><th className="pr-4">Phone</th><th className="pr-4">Email</th><th className="pr-4">Reference</th><th className="pr-4">Status</th><th /></tr>
                      </thead>
                      <tbody>
                        {people.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="py-2 pr-4 font-medium">{r.name}{r.crew.length > 0 && <span className="block text-xs text-gray-500">Crew: {r.crew.join(", ")}{r.crewComplete ? "" : " (not complete)"}</span>}</td>
                            <td className="pr-4">{r.phone ?? "—"}</td>
                            <td className="pr-4">{r.email}</td>
                            <td className="pr-4 font-mono">{r.reference}</td>
                            <td className="pr-4">
                              {r.kind === "airtime"
                                ? (r.fulfilment === "pending" ? "Airtime to send" : "Airtime sent")
                                : r.redeemedAt ? `Used ${day(r.redeemedAt)}` : `Use by ${day(r.expiresAt)}`}
                            </td>
                            <td className="text-right">
                              {r.kind === "airtime" && r.fulfilment === "pending" && (
                                <Button size="sm" onClick={() => markSent(r)} disabled={busy === `sent-${r.id}`}>Mark airtime sent</Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!pinFor} onOpenChange={(o) => !o && setPinFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Venue PIN for {pinFor?.title}</DialogTitle>
            <DialogDescription>Share this PIN with {pinFor?.brand}. They enter it on studentx.co.ke/pass-check to mark a student's pass as used.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="venue-pin">PIN (at least 4 digits)</Label>
            <Input id="venue-pin" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          </div>
          <DialogFooter><Button onClick={savePin} disabled={pin.length < 4 || busy === "pin"}>Save PIN</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit drop {editing?.number}</DialogTitle>
            <DialogDescription>Changes show on the student site straight away. The pick time and quantity don't change.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="drop-title">Title</Label><Input id="drop-title" value={form.title} maxLength={128} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="drop-brand">Brand or venue</Label><Input id="drop-brand" value={form.brand} maxLength={128} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="drop-description">Description</Label><Textarea id="drop-description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label htmlFor="drop-photo">Photo of the perk</Label>
              {form.coverImage && <img src={form.coverImage} alt="" className="h-28 w-full rounded-md object-cover" />}
              <Input id="drop-photo" type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} />
              {form.coverImage && <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, coverImage: "" })}>Remove photo</Button>}
            </div>
          </div>
          <DialogFooter><Button onClick={saveEdit} disabled={!form.title.trim() || !form.brand.trim() || busy === "edit"}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
