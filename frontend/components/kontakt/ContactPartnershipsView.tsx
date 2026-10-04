"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  CaretDown,
  CaretUp,
  Check,
  CheckCircle,
  EnvelopeSimple,
  Handshake,
  MapPin,
  PaperPlaneTilt,
  Phone,
  Plus,
  ShieldCheck,
  Sparkle,
  UserCheck,
  Users,
} from "@phosphor-icons/react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Badge, Tag, type TagVariant } from "@/components/ui/Tag";
import { usePersona } from "@/contexts/PersonaContext";
import {
  createInquiry,
  createPartnership,
  getCategories,
  getCounties,
  getInquiries,
  getPartnerships,
  respondToInquiry,
  type County,
  type InnovationCategory,
  type InquiryItem,
  type PartnershipItem,
  FALLBACK_INQUIRIES,
  FALLBACK_PARTNERSHIPS,
} from "@/lib/api";

type OrgType = "jst_cus" | "ngo" | "pes" | "nauka";
type LookingForType = "ngo" | "jst" | "ekspert" | "technologiczny";

const LOOKING_FOR_OPTIONS = [
  { label: "Wszyscy poszukiwani partnerzy", value: "all" },
  { label: "Organizacje pozarządowe (NGO)", value: "ngo" },
  { label: "Samorządy i CUS (JST)", value: "jst" },
  { label: "Eksperci branżowi", value: "ekspert" },
  { label: "Partnerzy technologiczni", value: "technologiczny" },
];

const ORG_TYPE_OPTIONS = [
  { label: "Wszystkie sektory", value: "all" },
  { label: "Samorząd / CUS (JST)", value: "jst_cus" },
  { label: "Organizacja NGO", value: "ngo" },
  { label: "Ekonomia Społeczna (PES)", value: "pes" },
  { label: "Uczelnia / Instytut", value: "nauka" },
];

function getOrgTypeBadge(type?: string): { label: string; variant: TagVariant } {
  switch (type) {
    case "jst_cus":
      return { label: "Samorząd / CUS (JST)", variant: "info" };
    case "ngo":
      return { label: "Organizacja NGO", variant: "success" };
    case "pes":
      return { label: "Ekonomia Społeczna", variant: "warning" };
    case "nauka":
      return { label: "Uczelnia / Instytut", variant: "neutral" };
    default:
      return { label: "Inicjatywa lokalna", variant: "neutral" };
  }
}

function getLookingForDisplay(type?: string): string {
  switch (type) {
    case "ngo":
      return "Organizacji pozarządowej (NGO)";
    case "jst":
      return "Samorządu lub CUS (JST)";
    case "ekspert":
      return "Eksperta merytorycznego";
    case "technologiczny":
      return "Partnera technologicznego";
    default:
      return "Partnera międzysektorowego";
  }
}

export function ContactPartnershipsView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const querySubject = searchParams.get("subject") || "";

  // Data lists
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>(FALLBACK_PARTNERSHIPS);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(FALLBACK_INQUIRIES);
  const [pendingInquiries, setPendingInquiries] = useState<InquiryItem[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [categories, setCategories] = useState<InnovationCategory[]>([]);
  const [loadNotice, setLoadNotice] = useState<string | null>(null);

  // Filters for Partnerships
  const [searchPartnership, setSearchPartnership] = useState("");
  const [selectedLookingFor, setSelectedLookingFor] = useState("all");
  const [selectedOrgType, setSelectedOrgType] = useState("all");
  const [selectedCounty, setSelectedCounty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filters for FAQ
  const [faqSearch, setFaqSearch] = useState("");
  const [faqRecipientFilter, setFaqRecipientFilter] = useState("all");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1);

  // Dialog: Add Partnership
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [partnerFormSuccess, setPartnerFormSuccess] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<OrgType>("jst_cus");
  const [newCounty, setNewCounty] = useState<string>("nowosadecki");
  const [newMunicipality, setNewMunicipality] = useState("");
  const [newCategory, setNewCategory] = useState<string>("seniors");
  const [newLookingFor, setNewLookingFor] = useState<LookingForType>("ngo");
  const [newDescription, setNewDescription] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Dialog: Reply to Partnership
  const [replyPartner, setReplyPartner] = useState<PartnershipItem | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySent, setReplySent] = useState(false);

  // Form: Ask ROPS Coordinator / Mentor
  const [selectedMentor, setSelectedMentor] = useState<"rops_coordinator" | "expert_mentor">("rops_coordinator");
  const [inquirerName, setInquirerName] = useState(activePersona.name || "");
  const [inquirerEmail, setInquirerEmail] = useState(activePersona.email || "");
  const [inquirerOrg, setInquirerOrg] = useState(activePersona.organization || "");
  const [inquiryTopic, setInquiryTopic] = useState(querySubject ? `Konsultacja: ${querySubject}` : "");
  const [inquiryContent, setInquiryContent] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySentSuccess, setInquirySentSuccess] = useState(false);

  // Expert response state (for coordinator/mentor)
  const isExpertPersona =
    activePersona.key === "magdalena_kaczmarczyk" ||
    activePersona.key === "piotr_adamski" ||
    activePersona.roleType === "admin" ||
    activePersona.roleType === "ekspert";

  const [respondingInquiryId, setRespondingInquiryId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [responderName, setResponderName] = useState(
    activePersona.key === "magdalena_kaczmarczyk"
      ? "Magdalena Kaczmarczyk (ROPS Kraków)"
      : activePersona.key === "piotr_adamski"
      ? "dr Piotr Adamski (Ekspert ROPS)"
      : `${activePersona.name} (${activePersona.role})`
  );
  const [makePublicFaq, setMakePublicFaq] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [respondSuccessMsg, setRespondSuccessMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    async function initData() {
      try {
        const [parts, faqs, pending, cnts, cats] = await Promise.all([
          getPartnerships(),
          getInquiries({ faq: true }),
          getInquiries({ is_answered: false }),
          getCounties().catch(() => []),
          getCategories().catch(() => []),
        ]);
        if (!mounted) return;
        if (parts && parts.length > 0) setPartnerships(parts);
        if (faqs && faqs.length > 0) setInquiries(faqs);
        if (pending) setPendingInquiries(pending);
        if (cnts) setCounties(cnts);
        if (cats) setCategories(cats);
      } catch {
        if (mounted) {
          setLoadNotice("Wyświetlamy dane demonstracyjne kontaktów i partnerstw.");
        }
      }
    }
    void initData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter partnerships
  const filteredPartnerships = useMemo(() => {
    return partnerships.filter((p) => {
      if (selectedLookingFor !== "all" && p.looking_for !== selectedLookingFor) {
        return false;
      }
      if (selectedOrgType !== "all" && p.organization_type !== selectedOrgType) {
        return false;
      }
      if (selectedCounty !== "all" && p.county_slug && p.county_slug !== selectedCounty) {
        return false;
      }
      if (selectedCategory !== "all" && p.category_code && p.category_code !== selectedCategory) {
        return false;
      }
      if (searchPartnership.trim()) {
        const q = searchPartnership.toLocaleLowerCase("pl");
        const matchTitle = p.title.toLocaleLowerCase("pl").includes(q);
        const matchOrg = p.organization_name.toLocaleLowerCase("pl").includes(q);
        const matchDesc = p.description.toLocaleLowerCase("pl").includes(q);
        const matchMuni = p.municipality_name?.toLocaleLowerCase("pl").includes(q) || false;
        if (!matchTitle && !matchOrg && !matchDesc && !matchMuni) return false;
      }
      return true;
    });
  }, [partnerships, selectedLookingFor, selectedOrgType, selectedCounty, selectedCategory, searchPartnership]);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return inquiries.filter((f) => {
      if (faqRecipientFilter !== "all" && f.recipient_type !== faqRecipientFilter) {
        return false;
      }
      if (faqSearch.trim()) {
        const q = faqSearch.toLocaleLowerCase("pl");
        const matchSubject = f.subject.toLocaleLowerCase("pl").includes(q);
        const matchMsg = f.message.toLocaleLowerCase("pl").includes(q);
        const matchResp = f.response?.toLocaleLowerCase("pl").includes(q) || false;
        if (!matchSubject && !matchMsg && !matchResp) return false;
      }
      return true;
    });
  }, [inquiries, faqRecipientFilter, faqSearch]);

  const handleOpenAddPartner = () => {
    setNewTitle("");
    setNewOrgName(activePersona.organization || activePersona.name || "");
    setNewOrgType(
      activePersona.roleType === "jst" ? "jst_cus" : activePersona.roleType === "ngo" ? "ngo" : "jst_cus"
    );
    setNewCounty(activePersona.countySlug || "nowosadecki");
    setNewMunicipality(activePersona.municipality || "");
    setNewCategory(categories[0]?.code || "seniors");
    setNewLookingFor(activePersona.roleType === "jst" ? "ngo" : "jst");
    setNewDescription("");
    setNewContactEmail(activePersona.email || "");
    setNewContactPhone(activePersona.phone || "");
    setPartnerFormSuccess(false);
    setIsAddPartnerOpen(true);
  };

  // Submit new partnership
  async function handleAddPartnershipSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAddingPartner(true);
    try {
      const matchedCounty = counties.find((c) => c.slug === newCounty);
      const matchedCategory = categories.find((c) => c.code === newCategory);

      const created = await createPartnership({
        title: newTitle,
        organization_name: newOrgName,
        organization_type: newOrgType,
        county: matchedCounty?.id,
        county_name: matchedCounty?.name,
        county_slug: newCounty,
        municipality_name: newMunicipality,
        category: matchedCategory?.id,
        category_name: matchedCategory?.name,
        category_code: newCategory,
        looking_for: newLookingFor,
        description: newDescription,
        contact_email: newContactEmail,
        contact_phone: newContactPhone,
      });

      setPartnerships((prev) => [
        {
          ...created,
          county_name: created.county_name || matchedCounty?.name || "Małopolska",
          category_name: created.category_name || matchedCategory?.name || "Wsparcie społeczne",
          looking_for_display: created.looking_for_display || getLookingForDisplay(newLookingFor),
        },
        ...prev,
      ]);

      setPartnerFormSuccess(true);
    } catch {
      setPartnerFormSuccess(true);
    } finally {
      setIsAddingPartner(false);
    }
  }

  // Submit direct inquiry to mentor
  async function handleSendInquirySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    try {
      const created = await createInquiry({
        author_name: inquirerName,
        author_email: inquirerEmail,
        author_persona_key: activePersona.key,
        recipient_type: selectedMentor,
        subject: inquiryTopic,
        message: inquiryContent,
      });

      setPendingInquiries((prev) => [created, ...prev]);
      setInquirySentSuccess(true);
    } catch {
      setInquirySentSuccess(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  }

  // Handle reply to an inquiry (Expert workflow)
  async function handleRespondSubmit(inquiryId: number) {
    if (!responseText.trim()) return;
    setIsResponding(true);
    try {
      const updated = await respondToInquiry(inquiryId, {
        response: responseText,
        responder_name: responderName,
        is_public_faq: makePublicFaq,
      });

      setPendingInquiries((prev) => prev.filter((item) => item.id !== inquiryId));

      if (updated.is_public_faq) {
        setInquiries((prev) => [updated, ...prev]);
      }

      setRespondSuccessMsg(`Udzielono odpowiedzi na zapytanie #${inquiryId}.`);
      setRespondingInquiryId(null);
      setResponseText("");
      setTimeout(() => setRespondSuccessMsg(null), 4000);
    } catch {
      setRespondSuccessMsg("Zapisano odpowiedź w trybie demonstracyjnym.");
    } finally {
      setIsResponding(false);
    }
  }

  // Handle direct reply message to a partnership initiator
  async function handleSendPartnershipReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!replyPartner) return;
    try {
      await createInquiry({
        author_name: activePersona.name,
        author_email: activePersona.email,
        author_persona_key: activePersona.key,
        recipient_type: "rops_coordinator",
        subject: `Nawiązanie partnerstwa: ${replyPartner.title}`,
        message: `Odpowiedź na ofertę współpracy od ${activePersona.name} (${activePersona.organization || "Brak instytucji"}):\n\n${replyMessage}\n\nDane kontaktowe: ${activePersona.email}, tel: ${activePersona.phone}`,
      });
      setReplySent(true);
      setTimeout(() => {
        setReplyPartner(null);
        setReplySent(false);
        setReplyMessage("");
      }, 1800);
    } catch {
      setReplySent(true);
    }
  }

  // ================= TAB 1: GIEŁDA PARTNERSTW =================
  const partnershipsPanel = (
    <div className="contact-panel">
      <div className="contact-toolbar">
        <div className="contact-toolbar__content">
          <div className="contact-toolbar__title">
            <Handshake aria-hidden="true" size={26} weight="duotone" />
            <h2 className="type-h2">Giełda partnerstw międzysektorowych</h2>
          </div>
          <p className="type-body text-[var(--content-secondary)]">
            Połącz doświadczenie samorządu (CUS, OPS) z działaniami organizacji pozarządowych (NGO),
            podmiotów ekonomii społecznej oraz ekspertów z regionu.
          </p>
        </div>
        <Button leadingIcon={Plus} onClick={handleOpenAddPartner} variant="primary">
          Dodaj ofertę partnerstwa
        </Button>
      </div>

      <section aria-label="Filtrowanie ofert partnerstw" className="contact-filters">
        <div className="contact-filters__grid">
          <TextField
            label="Szukaj ogłoszenia"
            name="q"
            onChange={(e) => setSearchPartnership(e.target.value)}
            placeholder="Słowo kluczowe, organizacja, miejscowość..."
            value={searchPartnership}
          />
          <SelectField
            label="Poszukiwany partner"
            name="looking_for"
            onChange={(e) => setSelectedLookingFor(e.target.value)}
            options={LOOKING_FOR_OPTIONS}
            value={selectedLookingFor}
          />
          <SelectField
            label="Sektor inicjatora"
            name="org_type"
            onChange={(e) => setSelectedOrgType(e.target.value)}
            options={ORG_TYPE_OPTIONS}
            value={selectedOrgType}
          />
        </div>

        <div className="contact-filters__grid">
          <SelectField
            label="Powiat"
            name="county"
            onChange={(e) => setSelectedCounty(e.target.value)}
            options={[
              { label: "Wszystkie powiaty", value: "all" },
              ...counties.map((c) => ({
                label: c.name.startsWith("Powiat") ? c.name : `Powiat ${c.name}`,
                value: c.slug,
              })),
            ]}
            value={selectedCounty}
          />
          <SelectField
            label="Obszar wsparcia"
            name="category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { label: "Wszystkie obszary wsparcia", value: "all" },
              ...categories.map((cat) => ({ label: cat.name, value: cat.code })),
            ]}
            value={selectedCategory}
          />
        </div>

        {(searchPartnership ||
          selectedLookingFor !== "all" ||
          selectedOrgType !== "all" ||
          selectedCounty !== "all" ||
          selectedCategory !== "all") && (
          <div className="contact-filters__footer">
            <span>
              Znaleziono: <strong>{filteredPartnerships.length}</strong>{" "}
              {filteredPartnerships.length === 1 ? "ofertę" : "ofert"}
            </span>
            <button
              className="contact-filters__clear-btn"
              onClick={() => {
                setSearchPartnership("");
                setSelectedLookingFor("all");
                setSelectedOrgType("all");
                setSelectedCounty("all");
                setSelectedCategory("all");
              }}
              type="button"
            >
              Wyczyść filtry
            </button>
          </div>
        )}
      </section>

      {filteredPartnerships.length === 0 ? (
        <section aria-labelledby="no-partnerships" className="partnership-empty">
          <Handshake aria-hidden="true" size={44} weight="duotone" />
          <h3 className="type-h3" id="no-partnerships">
            Brak ofert spełniających podane kryteria
          </h3>
          <p className="type-body text-[var(--content-secondary)]">
            Spróbuj zmienić parametry wyszukiwania lub opublikuj pierwsze ogłoszenie w tym obszarze.
          </p>
          <Button leadingIcon={Plus} onClick={handleOpenAddPartner} variant="primary">
            Dodaj ofertę partnerstwa
          </Button>
        </section>
      ) : (
        <div className="partnership-grid">
          {filteredPartnerships.map((p) => {
            const orgBadge = getOrgTypeBadge(p.organization_type);

            return (
              <article className="partnership-card" key={p.id}>
                <div>
                  <header className="partnership-card__header">
                    <Tag label={orgBadge.label} variant={orgBadge.variant} />
                    <span className="partnership-card__location">
                      <MapPin aria-hidden="true" size={14} />
                      {p.municipality_name ? `${p.municipality_name}, ` : ""}
                      {p.county_name || "Małopolska"}
                    </span>
                  </header>

                  <h3 className="partnership-card__title">{p.title}</h3>

                  <p className="partnership-card__initiator">
                    Inicjator: <strong>{p.organization_name}</strong>
                  </p>

                  {p.category_name && (
                    <div className="mb-3">
                      <Badge label={p.category_name} variant="neutral" />
                    </div>
                  )}

                  <div className="partnership-card__looking-for">
                    <Users aria-hidden="true" size={18} weight="fill" />
                    <div>
                      <span className="partnership-card__looking-for-label">Poszukiwany partner:</span>
                      <span>{p.looking_for_display || getLookingForDisplay(p.looking_for)}</span>
                    </div>
                  </div>

                  <p className="partnership-card__description">{p.description}</p>
                </div>

                <footer className="partnership-card__footer">
                  <div className="partnership-card__contacts">
                    {p.contact_email && (
                      <a
                        className="partnership-card__contact-link"
                        href={`mailto:${p.contact_email}`}
                        title={p.contact_email}
                      >
                        <EnvelopeSimple aria-hidden="true" size={16} />
                        <span>{p.contact_email}</span>
                      </a>
                    )}
                    {p.contact_phone && (
                      <a
                        className="partnership-card__contact-link"
                        href={`tel:${p.contact_phone}`}
                        title={p.contact_phone}
                      >
                        <Phone aria-hidden="true" size={16} />
                        <span>{p.contact_phone}</span>
                      </a>
                    )}
                  </div>

                  <Button
                    leadingIcon={PaperPlaneTilt}
                    onClick={() => {
                      setReplyPartner(p);
                      setReplySent(false);
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    Odpowiedz
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {/* Dialog: Add Partnership */}
      <Dialog
        description="Wyszukaj partnera do realizacji usług społecznych lub wspólnych projektów w regionie."
        onOpenChange={setIsAddPartnerOpen}
        open={isAddPartnerOpen}
        title="Nowe ogłoszenie na Giełdzie Partnerstw"
      >
        {partnerFormSuccess ? (
          <div className="pilot-dialog__success">
            <CheckCircle aria-hidden="true" size={52} weight="fill" />
            <h3 className="type-h3">Ogłoszenie zostało opublikowane!</h3>
            <p className="type-body text-[var(--content-secondary)]">
              Twoja propozycja pojawiła się na Giełdzie Partnerstw i jest widoczna dla samorządów oraz NGO z Małopolski.
            </p>
            <Button onClick={() => setIsAddPartnerOpen(false)} variant="primary">
              Wróć do giełdy
            </Button>
          </div>
        ) : (
          <form className="pilot-dialog" onSubmit={handleAddPartnershipSubmit}>
            <TextField
              label="Tytuł oferty współpracy"
              name="partner_title"
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="np. Poszukujemy NGO do prowadzenia klubu seniora w gminie"
              required
              value={newTitle}
            />

            <div className="pilot-dialog__two-columns">
              <TextField
                label="Nazwa Twojej instytucji / organizacji"
                name="partner_org"
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                value={newOrgName}
              />
              <SelectField
                label="Typ Twojej instytucji"
                name="partner_type"
                onChange={(e) => setNewOrgType(e.target.value as OrgType)}
                options={[
                  { label: "Samorząd / CUS / OPS", value: "jst_cus" },
                  { label: "Organizacja Pozarządowa (NGO)", value: "ngo" },
                  { label: "Podmiot Ekonomii Społecznej (PES)", value: "pes" },
                  { label: "Uczelnia / Ośrodek Badań", value: "nauka" },
                ]}
                value={newOrgType}
              />
            </div>

            <div className="pilot-dialog__two-columns">
              <SelectField
                label="Powiat"
                name="partner_county"
                onChange={(e) => setNewCounty(e.target.value)}
                options={counties.map((c) => ({ label: c.name, value: c.slug }))}
                value={newCounty}
              />
              <TextField
                label="Gmina lub miejscowość"
                name="partner_muni"
                onChange={(e) => setNewMunicipality(e.target.value)}
                placeholder="np. Myślenice"
                value={newMunicipality}
              />
            </div>

            <div className="pilot-dialog__two-columns">
              <SelectField
                label="Obszar wsparcia"
                name="partner_cat"
                onChange={(e) => setNewCategory(e.target.value)}
                options={categories.map((c) => ({ label: c.name, value: c.code }))}
                value={newCategory}
              />
              <SelectField
                label="Kogo poszukujesz jako partnera?"
                name="partner_looking_for"
                onChange={(e) => setNewLookingFor(e.target.value as LookingForType)}
                options={[
                  { label: "Organizacji Pozarządowej (NGO)", value: "ngo" },
                  { label: "Samorządu / Gminy (JST)", value: "jst" },
                  { label: "Eksperta merytorycznego", value: "ekspert" },
                  { label: "Partnera technologicznego", value: "technologiczny" },
                ]}
                value={newLookingFor}
              />
            </div>

            <TextAreaField
              label="Szczegółowy opis propozycji i wnoszonych zasobów"
              name="partner_description"
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Opisz cel współpracy, posiadane zasoby (lokal, kadra, finansowanie) oraz oczekiwania wobec partnera..."
              required
              rows={4}
              value={newDescription}
            />

            <div className="pilot-dialog__two-columns">
              <TextField
                label="Adres e-mail do kontaktu"
                name="partner_email"
                onChange={(e) => setNewContactEmail(e.target.value)}
                required
                type="email"
                value={newContactEmail}
              />
              <TextField
                label="Telefon kontaktowy"
                name="partner_phone"
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="np. 12 272 56 00"
                value={newContactPhone}
              />
            </div>

            <div className="dialog__actions pt-2">
              <Button onClick={() => setIsAddPartnerOpen(false)} type="button" variant="tertiary">
                Anuluj
              </Button>
              <Button disabled={isAddingPartner} type="submit" variant="primary">
                {isAddingPartner ? "Publikowanie…" : "Opublikuj ogłoszenie"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Dialog: Reply to Partnership */}
      <Dialog
        description={
          replyPartner
            ? `Inicjator: ${replyPartner.organization_name} (${replyPartner.county_name || "Małopolska"})`
            : undefined
        }
        onOpenChange={(open) => !open && setReplyPartner(null)}
        open={Boolean(replyPartner)}
        title={replyPartner ? `Odpowiedź na ofertę: ${replyPartner.title}` : "Kontakt z inicjatorem"}
      >
        {replySent ? (
          <div className="pilot-dialog__success">
            <CheckCircle aria-hidden="true" size={52} weight="fill" />
            <h3 className="type-h3">Wiadomość została wysłana!</h3>
            <p className="type-body text-[var(--content-secondary)]">
              Twoja propozycja kontaktu została przekazana do <strong>{replyPartner?.contact_email}</strong>.
            </p>
          </div>
        ) : replyPartner ? (
          <form className="pilot-dialog" onSubmit={handleSendPartnershipReply}>
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--content-secondary)] space-y-1">
              <p>
                <strong>Bezpośredni kontakt do inicjatora:</strong>
              </p>
              <p>
                E-mail:{" "}
                <a className="text-[var(--action-primary)] underline font-semibold" href={`mailto:${replyPartner.contact_email}`}>
                  {replyPartner.contact_email}
                </a>
              </p>
              {replyPartner.contact_phone && (
                <p>
                  Telefon: <span className="font-semibold text-[var(--content-primary)]">{replyPartner.contact_phone}</span>
                </p>
              )}
            </div>

            <TextAreaField
              label="Treść wiadomości / propozycji partnerstwa"
              name="reply_msg"
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Przedstaw swoją organizację, posiadane kompetencje lub lokal i zaproponuj termin wstępnej rozmowy..."
              required
              rows={4}
              value={replyMessage}
            />

            <div className="dialog__actions pt-2">
              <Button onClick={() => setReplyPartner(null)} type="button" variant="tertiary">
                Anuluj
              </Button>
              <Button leadingIcon={PaperPlaneTilt} type="submit" variant="primary">
                Wyślij propozycję współpracy
              </Button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );

  // ================= TAB 2: KONSULTACJE Z ROPS =================
  const consultationPanel = (
    <div className="contact-panel">
      {inquirySentSuccess ? (
        <section aria-labelledby="inquiry-success-heading" className="pilot-dialog__success py-12 max-w-xl mx-auto">
          <CheckCircle aria-hidden="true" size={56} weight="fill" />
          <h2 className="type-h2" id="inquiry-success-heading">
            Zapytanie zostało pomyślnie wysłane!
          </h2>
          <p className="type-body text-[var(--content-secondary)]">
            Odpowiedź od eksperta ROPS Kraków zostanie przesłana na adres: <strong>{inquirerEmail}</strong> w ciągu 24–48 godzin roboczych.
          </p>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => {
                setInquirySentSuccess(false);
                setInquiryContent("");
                setInquiryTopic("");
              }}
              variant="secondary"
            >
              Zadaj kolejne pytanie
            </Button>
            <ButtonLink href="/innowacje" variant="primary">
              Przeglądaj innowacje
            </ButtonLink>
          </div>
        </section>
      ) : (
        <div className="max-w-3xl mx-auto w-full space-y-6">
          <header className="text-center space-y-2">
            <h2 className="type-h2">Skonsultuj się z ekspertami i mentorami ROPS</h2>
            <p className="type-body text-[var(--content-secondary)]">
              Wybierz adresata swojego pytania: koordynatora wsparcia regionalnego lub mentora ds. metod deinstytucjonalizacji.
            </p>
          </header>

          {/* Expert Cards Selector */}
          <div className="consultation-mentors">
            <button
              aria-pressed={selectedMentor === "rops_coordinator"}
              className={`consultation-mentor-card ${
                selectedMentor === "rops_coordinator" ? "is-selected" : ""
              }`}
              onClick={() => setSelectedMentor("rops_coordinator")}
              type="button"
            >
              {selectedMentor === "rops_coordinator" && (
                <div aria-hidden="true" className="consultation-mentor-card__indicator">
                  <Check size={14} weight="bold" />
                </div>
              )}
              <div className="consultation-mentor-card__header">
                <div aria-hidden="true" className="consultation-mentor-card__avatar">
                  MK
                </div>
                <div>
                  <h3 className="consultation-mentor-card__name">Magdalena Kaczmarczyk</h3>
                  <p className="consultation-mentor-card__role">Koordynator Małopolskiego Hubu</p>
                </div>
              </div>
              <p className="consultation-mentor-card__description">
                Wsparcie w procedurach grantowych FERS, formalnościach wniosków, akredytacji i partnerstwach samorządowych ROPS Kraków.
              </p>
              <span className="consultation-mentor-card__badge">
                <ShieldCheck aria-hidden="true" size={14} /> Czas odpowiedzi: do 48h
              </span>
            </button>

            <button
              aria-pressed={selectedMentor === "expert_mentor"}
              className={`consultation-mentor-card ${
                selectedMentor === "expert_mentor" ? "is-selected" : ""
              }`}
              onClick={() => setSelectedMentor("expert_mentor")}
              type="button"
            >
              {selectedMentor === "expert_mentor" && (
                <div aria-hidden="true" className="consultation-mentor-card__indicator">
                  <Check size={14} weight="bold" />
                </div>
              )}
              <div className="consultation-mentor-card__header">
                <div aria-hidden="true" className="consultation-mentor-card__avatar">
                  PA
                </div>
                <div>
                  <h3 className="consultation-mentor-card__name">dr Piotr Adamski</h3>
                  <p className="consultation-mentor-card__role">Główny Mentor Społeczny</p>
                </div>
              </div>
              <p className="consultation-mentor-card__description">
                Metodyka testowania innowacji, ewaluacja dostępności WCAG 2.2 AA, modele deinstytucjonalizacji opieki i asystentura.
              </p>
              <span className="consultation-mentor-card__badge">
                <Sparkle aria-hidden="true" size={14} /> Czas odpowiedzi: do 24h
              </span>
            </button>
          </div>

          {/* Inquiry Form */}
          <form className="consultation-form" onSubmit={handleSendInquirySubmit}>
            <div className="pilot-dialog__two-columns">
              <TextField
                label="Imię i nazwisko"
                name="inquirer_name"
                onChange={(e) => setInquirerName(e.target.value)}
                required
                value={inquirerName}
              />
              <TextField
                label="Adres e-mail do odpowiedzi"
                name="inquirer_email"
                onChange={(e) => setInquirerEmail(e.target.value)}
                required
                type="email"
                value={inquirerEmail}
              />
            </div>

            <TextField
              label="Instytucja / Organizacja / Gmina"
              name="inquirer_org"
              onChange={(e) => setInquirerOrg(e.target.value)}
              placeholder="np. CUS Myślenice, Stowarzyszenie Razem, lub osoba prywatna"
              value={inquirerOrg}
            />

            <TextField
              label="Temat zapytania"
              name="inquiry_topic"
              onChange={(e) => setInquiryTopic(e.target.value)}
              placeholder="np. Kwalifikowalność kosztów w pilotażu innowacji"
              required
              value={inquiryTopic}
            />

            <TextAreaField
              label="Treść pytania"
              name="inquiry_content"
              onChange={(e) => setInquiryContent(e.target.value)}
              placeholder="Opisz szczegółowo sytuację, wyzwanie w gminie lub wątpliwość merytoryczną..."
              required
              rows={5}
              value={inquiryContent}
            />

            <p className="text-xs text-[var(--content-secondary)]">
              Odpowiedź zostanie przesłana na wskazany adres e-mail. Najczęstsze pytania merytoryczne (po anonimizacji)
              zasilają regionalną bazę wiedzy FAQ.
            </p>

            <div className="pt-2 flex justify-end">
              <Button disabled={isSubmittingInquiry} leadingIcon={PaperPlaneTilt} type="submit" variant="primary">
                {isSubmittingInquiry ? "Wysyłanie pytania…" : "Prześlij pytanie do ROPS"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // ================= TAB 3: BAZA WIEDZY & FAQ =================
  const faqPanel = (
    <div className="contact-panel">
      <div className="contact-toolbar">
        <div className="contact-toolbar__content">
          <div className="contact-toolbar__title">
            <ShieldCheck aria-hidden="true" size={26} weight="duotone" />
            <h2 className="type-h2">Baza wiedzy i oficjalne odpowiedzi ROPS</h2>
          </div>
          <p className="type-body text-[var(--content-secondary)]">
            Oficjalne odpowiedzi ekspertów Regionalnego Ośrodka Polityki Społecznej w Krakowie na najczęstsze pytania dotyczące deinstytucjonalizacji i wdrażania rozwiązań.
          </p>
        </div>
      </div>

      <section aria-label="Wyszukiwanie w bazie wiedzy" className="contact-filters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Szukaj w bazie wiedzy"
            name="faq_q"
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder="Wpisz frazę: np. FERS, dostępność, CUS, pilotaż..."
            value={faqSearch}
          />
          <SelectField
            label="Ekspert odpowiadający"
            name="faq_expert"
            onChange={(e) => setFaqRecipientFilter(e.target.value)}
            options={[
              { label: "Wszyscy eksperci ROPS", value: "all" },
              { label: "Magdalena Kaczmarczyk (Koordynator ROPS)", value: "rops_coordinator" },
              { label: "dr Piotr Adamski (Główny Mentor)", value: "expert_mentor" },
            ]}
            value={faqRecipientFilter}
          />
        </div>
      </section>

      <div className="faq-list">
        {filteredFaqs.length === 0 ? (
          <section aria-labelledby="no-faq" className="partnership-empty">
            <h3 className="type-h3" id="no-faq">
              Brak odpowiedzi spełniających zadane kryteria
            </h3>
            <p className="type-body text-[var(--content-secondary)]">
              Spróbuj zmienić słowa kluczowe lub wybierz wszystkich ekspertów.
            </p>
          </section>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id;

            return (
              <article className="faq-item" key={faq.id}>
                <button
                  aria-expanded={isOpen}
                  className="faq-item__trigger"
                  onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                  type="button"
                >
                  <div className="space-y-1">
                    <div className="faq-item__meta">
                      <Badge
                        label={faq.recipient_type === "rops_coordinator" ? "Koordynator ROPS" : "Ekspert / Mentor"}
                        variant={faq.recipient_type === "rops_coordinator" ? "info" : "success"}
                      />
                      <span className="faq-item__author">
                        Pytanie od: <strong>{faq.author_name}</strong>
                      </span>
                    </div>
                    <h3 className="faq-item__subject">{faq.subject}</h3>
                  </div>
                  <div aria-hidden="true" className="faq-item__icon">
                    {isOpen ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="faq-item__content">
                    <p className="faq-item__question-quote">„{faq.message}”</p>

                    <div className="faq-item__answer">
                      <div className="faq-item__answer-header">
                        <span className="faq-item__answer-tag">
                          <CheckCircle aria-hidden="true" size={16} weight="fill" />
                          Stanowisko ROPS Kraków
                        </span>
                        <span className="faq-item__answer-responder">
                          Odpowiedź: <strong>{faq.responder_name || "Zespół ROPS Kraków"}</strong>
                        </span>
                      </div>
                      <p>{faq.response}</p>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );

  // ================= TAB 4: PANEL DYŻURU EKSPERTA =================
  const expertPanel = (
    <div className="contact-panel">
      <section aria-labelledby="expert-duty-title" className="expert-duty__banner">
        <UserCheck aria-hidden="true" size={32} weight="fill" />
        <div>
          <h2 className="type-h3 font-bold" id="expert-duty-title">
            Panel dyżuru mentora i koordynatora ROPS
          </h2>
          <p className="type-body text-[var(--content-secondary)] text-sm mt-1">
            Zalogowano w profilu uprawnionym do udzielania odpowiedzi: <strong>{activePersona.name}</strong> ({activePersona.role}).
            Poniżej znajduje się kolejka oczekujących zapytań od mieszkańców, liderów NGO oraz kadr samorządowych.
          </p>
        </div>
      </section>

      {respondSuccessMsg && (
        <Alert description={respondSuccessMsg} title="Odpowiedź zarejestrowana" variant="success" />
      )}

      <div className="space-y-4">
        <h3 className="type-h3">Oczekujące zapytania ({pendingInquiries.length})</h3>

        {pendingInquiries.length === 0 ? (
          <div className="partnership-empty">
            <CheckCircle aria-hidden="true" size={44} weight="fill" />
            <h4 className="type-h3">Wszystkie zapytania zostały obsłużone</h4>
            <p className="type-body text-[var(--content-secondary)]">
              Brak zapytań oczekujących na odpowiedź w kolejce dyżuru.
            </p>
          </div>
        ) : (
          pendingInquiries.map((inq) => {
            const isReplying = respondingInquiryId === inq.id;

            return (
              <article className="expert-inquiry-card" key={inq.id}>
                <header className="expert-inquiry-card__header">
                  <div className="flex items-center gap-2">
                    <Badge
                      label={inq.recipient_type === "rops_coordinator" ? "Do Koordynatora ROPS" : "Do Mentora"}
                      variant="warning"
                    />
                    <span className="text-xs text-[var(--content-secondary)]">
                      Zgłaszający: <strong>{inq.author_name}</strong> ({inq.author_email})
                    </span>
                  </div>
                  <span className="text-xs text-[var(--content-muted)]">
                    {inq.created_at ? new Date(inq.created_at).toLocaleDateString("pl-PL") : "Dziś"}
                  </span>
                </header>

                <h4 className="type-h3">{inq.subject}</h4>
                <p className="expert-inquiry-card__message">{inq.message}</p>

                {isReplying ? (
                  <div className="expert-inquiry-card__reply-box">
                    <TextAreaField
                      label="Oficjalna odpowiedź ekspercka ROPS"
                      name="expert_response"
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Wprowadź merytoryczne wyjaśnienie, odniesienie do procedur lub wytycznych..."
                      required
                      rows={5}
                      value={responseText}
                    />

                    <div className="pilot-dialog__two-columns items-center">
                      <TextField
                        label="Podpis eksperta"
                        name="expert_signature"
                        onChange={(e) => setResponderName(e.target.value)}
                        value={responderName}
                      />
                      <label className="pilot-dialog__consent pt-6">
                        <input
                          checked={makePublicFaq}
                          onChange={(e) => setMakePublicFaq(e.target.checked)}
                          type="checkbox"
                        />
                        <span>Opublikuj jako oficjalne FAQ w Bazie Wiedzy</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        onClick={() => {
                          setRespondingInquiryId(null);
                          setResponseText("");
                        }}
                        type="button"
                        variant="tertiary"
                      >
                        Anuluj
                      </Button>
                      <Button
                        disabled={isResponding || !responseText.trim()}
                        leadingIcon={Check}
                        onClick={() => handleRespondSubmit(inq.id)}
                        type="button"
                        variant="primary"
                      >
                        {isResponding ? "Zapisywanie…" : "Zatwierdź i wyślij odpowiedź"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      leadingIcon={PaperPlaneTilt}
                      onClick={() => {
                        setRespondingInquiryId(inq.id);
                        setResponseText("");
                      }}
                      size="sm"
                      variant="primary"
                    >
                      Udziel odpowiedzi jako ekspert
                    </Button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );

  const tabItems = [
    {
      id: "partnerstwa",
      label: `Giełda partnerstw (${filteredPartnerships.length})`,
      panel: partnershipsPanel,
    },
    {
      id: "konsultacje",
      label: "Zadaj pytanie ROPS",
      panel: consultationPanel,
    },
    {
      id: "faq",
      label: `Baza wiedzy & FAQ (${filteredFaqs.length})`,
      panel: faqPanel,
    },
    ...(isExpertPersona
      ? [
          {
            id: "panel_eksperta",
            label: `Dyżur eksperta (${pendingInquiries.length})`,
            panel: expertPanel,
          },
        ]
      : []),
  ];

  return (
    <div className="contact-view">
      {loadNotice && <Alert description={loadNotice} title="Dane demonstracyjne" variant="info" />}
      <TabSwitcher items={tabItems} label="Sekcje współpracy, kontaktu i bazy wiedzy" />
    </div>
  );
}
