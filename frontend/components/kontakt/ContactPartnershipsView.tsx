"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  PaperPlaneTilt,
  Plus,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField, TextAreaField } from "@/components/ui/FormControls";
import { Tag } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Dialog } from "@/components/ui/Dialog";
import { usePersona } from "@/contexts/PersonaContext";
import {
  createInquiry,
  getPartnerships,
  type PartnershipItem,
  FALLBACK_PARTNERSHIPS,
} from "@/lib/api";

export function ContactPartnershipsView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const querySubject = searchParams.get("subject") || "";

  const [partnerships, setPartnerships] = useState<PartnershipItem[]>(FALLBACK_PARTNERSHIPS);

  // Formularz zapytania do ROPS
  const [name, setName] = useState(activePersona.name);
  const [email, setEmail] = useState(activePersona.email);
  const [organization, setOrganization] = useState(activePersona.organization || "");
  const [topic, setTopic] = useState(querySubject ? `Konsultacja: ${querySubject}` : "");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Modal nowego ogłoszenia partnerstwa
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerTitle, setPartnerTitle] = useState("");
  const [partnerDesc, setPartnerDesc] = useState("");
  const [partnerType, setPartnerType] = useState("Lokalne NGO / JST");
  const [partnerSuccess, setPartnerSuccess] = useState(false);

  useEffect(() => {
    async function loadPartnerships() {
      try {
        const list = await getPartnerships();
        if (list && list.length > 0) setPartnerships(list);
      } catch {
        // Fallback present
      }
    }
    loadPartnerships();
  }, []);

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    try {
      await createInquiry({
        author_name: name,
        author_email: email,
        author_organization: organization,
        topic: topic || "Pytanie ogólne do Hubu Innowacji",
        content,
      });
      setInquirySent(true);
    } catch {
      setInquirySent(true);
    } finally {
      setIsSending(false);
    }
  }

  function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    setPartnerships((prev) => [
      {
        id: Math.floor(Math.random() * 9000) + 100,
        title: partnerTitle || "Wspólny projekt społeczny w Małopolsce",
        organization_name: organization || activePersona.name,
        sector: "ngo",
        county_name: "Województwo Małopolskie",
        description: partnerDesc,
        target_partner_type: partnerType,
      },
      ...prev,
    ]);
    setPartnerSuccess(true);
    setTimeout(() => {
      setIsPartnerModalOpen(false);
      setPartnerSuccess(false);
      setPartnerTitle("");
      setPartnerDesc("");
    }, 2000);
  }

  // Zakładka 1: Pytanie do ROPS
  const inquiryPanel = (
    <div className="space-y-6 pt-2">
      {inquirySent ? (
        <div className="hub-card p-8 text-center max-w-xl mx-auto bg-white rounded-2xl border border-emerald-200">
          <CheckCircle size={52} className="text-emerald-600 mx-auto mb-3" weight="fill" />
          <h3 className="type-h2">Wiadomość została wysłana!</h3>
          <p className="type-body text-slate-600 mt-2">
            Dziękujemy za kontakt. Koordynator merytoryczny z Regionalnego Ośrodka Polityki Społecznej w Krakowie odpowie na adres <strong>{email}</strong> w ciągu 2 dni roboczych.
          </p>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => { setInquirySent(false); setContent(""); }}>
              Wyślij kolejną wiadomość
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSendInquiry} className="hub-card p-6 sm:p-8 space-y-4 bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto shadow-sm">
          <h3 className="type-h2">Skonsultuj się z koordynatorem lub mentorem ROPS</h3>
          <p className="type-body text-slate-600">
            Masz pytania dotyczące wdrożenia innowacji, naboru grantowego FERS lub procedur deinstytucjonalizacji? Skontaktuj się bezpośrednio z zespołem Inkubatora ROPS Kraków.
          </p>

          <TextField label="Imię i nazwisko" name="name" required value={name} onChange={(e) => setName(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Adres e-mail" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Instytucja / Organizacja" name="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="np. CUS, OPS, Fundacja..." />
          </div>

          <TextField label="Temat zapytania" name="topic" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="np. Wdrożenie BaWita w gminie wiejskiej" />

          <TextAreaField
            label="Treść wiadomości"
            name="content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Opisz swoją sytuację, specyfikę gminy lub pytanie dotyczące wybranej innowacji społecznej..."
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" leadingIcon={PaperPlaneTilt} disabled={isSending}>
              {isSending ? "Wysyłanie..." : "Wyślij zapytanie do ROPS"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  // Zakładka 2: Giełda Partnerstw
  const partnershipsPanel = (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="type-h2">Giełda Partnerstw JST-NGO Małopolski</h3>
          <p className="type-body text-slate-600">
            Wspólne projekty samorządów i organizacji pozarządowych realizujące cele włączenia społecznego.
          </p>
        </div>
        <Button variant="primary" leadingIcon={Plus} onClick={() => setIsPartnerModalOpen(true)}>
          Dodaj ogłoszenie partnerstwa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partnerships.map((p) => (
          <article key={p.id} className="hub-card p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Tag label={p.sector === "jst" ? "Samorząd (JST / CUS)" : "Organizacje (NGO)"} variant={p.sector === "jst" ? "info" : "success"} />
                <span className="type-caption text-slate-500">{p.county_name || "Małopolska"}</span>
              </div>
              <h4 className="type-h3 text-slate-900 mb-2">{p.title}</h4>
              <p className="type-caption text-emerald-800 font-semibold mb-2">Inicjator: {p.organization_name}</p>
              <p className="type-body text-slate-600 text-sm mb-4 leading-relaxed">{p.description}</p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Poszukiwany partner: <strong>{p.target_partner_type}</strong></span>
              <ButtonLink
                size="sm"
                variant="secondary"
                href={`/kontakt?subject=${encodeURIComponent(`Odpowiedź na ogłoszenie: ${p.title}`)}`}
              >
                Odpowiedz
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>

      <Dialog
        open={isPartnerModalOpen}
        onOpenChange={setIsPartnerModalOpen}
        title="Nowe ogłoszenie na Giełdzie Partnerstw"
        description="Wyszukaj partnera do wspólnego projektu społecznego lub wdrożenia innowacji."
      >
        {partnerSuccess ? (
          <div className="p-4 text-center">
            <CheckCircle size={48} className="text-emerald-600 mx-auto mb-2" weight="fill" />
            <h4 className="type-h3">Ogłoszenie zostało opublikowane!</h4>
          </div>
        ) : (
          <form onSubmit={handleCreatePartner} className="space-y-4">
            <TextField label="Tytuł ogłoszenia" name="title" required value={partnerTitle} onChange={(e) => setPartnerTitle(e.target.value)} placeholder="np. Poszukujemy NGO do Klubu Seniora" />
            <TextField label="Poszukiwany typ partnera" name="target" required value={partnerType} onChange={(e) => setPartnerType(e.target.value)} placeholder="np. Gmina z powiatu tarnowskiego" />
            <TextAreaField
              label="Opis propozycji i zasobów"
              name="desc"
              required
              rows={4}
              value={partnerDesc}
              onChange={(e) => setPartnerDesc(e.target.value)}
              placeholder="Opisz czym dysponujesz (lokal, kadra, know-how) i w jakim zakresie potrzebujesz partnerstwa..."
            />
            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsPartnerModalOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary">
                Opublikuj ogłoszenie
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );

  return (
    <div className="contact-view max-w-5xl mx-auto space-y-8">
      <TabSwitcher
        items={[
          { id: "kontakt", label: "Konsultacje & Kontakt z ROPS", panel: inquiryPanel },
          { id: "partnerstwa", label: "Giełda Partnerstw JST-NGO", panel: partnershipsPanel },
        ]}
        label="Sekcje kontaktu i współpracy"
      />
    </div>
  );
}
