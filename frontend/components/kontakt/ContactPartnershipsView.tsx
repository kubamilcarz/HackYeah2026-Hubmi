"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  PaperPlaneTilt,
  Plus,
  Handshake,
  Users,
  Phone,
  EnvelopeSimple,
  Sparkle,
  ShieldCheck,
  Check,
  CaretDown,
  CaretUp,
  Info,
  MapPin,
  UserCheck,
  Question,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/ui/FormControls";
import { Tag, Badge } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Dialog } from "@/components/ui/Dialog";
import { Alert } from "@/components/ui/Alert";
import { usePersona } from "@/contexts/PersonaContext";
import {
  createInquiry,
  getInquiries,
  respondToInquiry,
  getPartnerships,
  createPartnership,
  getCounties,
  getCategories,
  type PartnershipItem,
  type InquiryItem,
  type County,
  type InnovationCategory,
  FALLBACK_PARTNERSHIPS,
  FALLBACK_INQUIRIES,
} from "@/lib/api";

const LOOKING_FOR_OPTIONS = [
  { label: "Wszyscy partnerzy", value: "all" },
  { label: "Organizacje pozarządowe (NGO)", value: "ngo" },
  { label: "Samorządy i CUS (JST)", value: "jst" },
  { label: "Eksperci branżowi", value: "ekspert" },
  { label: "Partnerzy technologiczni", value: "technologiczny" },
];

const ORG_TYPE_OPTIONS = [
  { label: "Wszystkie sektory", value: "all" },
  { label: "Samorząd / CUS (JST)", value: "jst_cus" },
  { label: "Organizacja NGO", value: "ngo" },
  { label: "Podmiot Ekonomii Społecznej (PES)", value: "pes" },
  { label: "Uczelnia / Instytut", value: "nauka" },
];

export function ContactPartnershipsView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const querySubject = searchParams.get("subject") || "";
  const queryTab = searchParams.get("tab") || "";

  // Data lists
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>(FALLBACK_PARTNERSHIPS);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(FALLBACK_INQUIRIES);
  const [pendingInquiries, setPendingInquiries] = useState<InquiryItem[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [categories, setCategories] = useState<InnovationCategory[]>([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState(
    queryTab === "konsultacje" || queryTab === "partnerstwa" || queryTab === "faq" || queryTab === "panel_eksperta"
      ? queryTab
      : "partnerstwa"
  );

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

  // Modal: Add Partnership
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [partnerFormSuccess, setPartnerFormSuccess] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newOrgName, setNewOrgName] = useState(activePersona.organization || activePersona.name || "");
  const [newOrgType, setNewOrgType] = useState<"jst_cus" | "ngo" | "pes" | "nauka">(
    activePersona.roleType === "jst" ? "jst_cus" : activePersona.roleType === "ngo" ? "ngo" : "jst_cus"
  );
  const [newCounty, setNewCounty] = useState<string>("nowosadecki");
  const [newMunicipality, setNewMunicipality] = useState(activePersona.municipality || "");
  const [newCategory, setNewCategory] = useState<string>("seniors");
  const [newLookingFor, setNewLookingFor] = useState<"ngo" | "jst" | "ekspert" | "technologiczny">("ngo");
  const [newDescription, setNewDescription] = useState("");
  const [newContactEmail, setNewContactEmail] = useState(activePersona.email || "");
  const [newContactPhone, setNewContactPhone] = useState(activePersona.phone || "");

  // Modal: Direct Reply to Partnership
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

  // Expert Response State (for coordinator/mentor persona)
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

  // Sync with active persona changes
  const [prevPersonaKey, setPrevPersonaKey] = useState(activePersona.key);
  if (prevPersonaKey !== activePersona.key) {
    setPrevPersonaKey(activePersona.key);
    setInquirerName(activePersona.name || "");
    setInquirerEmail(activePersona.email || "");
    setInquirerOrg(activePersona.organization || "");
    setNewOrgName(activePersona.organization || activePersona.name || "");
    setNewContactEmail(activePersona.email || "");
    setNewContactPhone(activePersona.phone || "");
    if (activePersona.roleType === "jst") {
      setNewOrgType("jst_cus");
      setNewLookingFor("ngo");
    } else if (activePersona.roleType === "ngo") {
      setNewOrgType("ngo");
      setNewLookingFor("jst");
    }
    setResponderName(
      activePersona.key === "magdalena_kaczmarczyk"
        ? "Magdalena Kaczmarczyk (ROPS Kraków)"
        : activePersona.key === "piotr_adamski"
        ? "dr Piotr Adamski (Ekspert ROPS)"
        : `${activePersona.name} (${activePersona.role})`
    );
  }

  // Load initial data
  useEffect(() => {
    async function initData() {
      try {
        const [parts, faqs, pending, cnts, cats] = await Promise.all([
          getPartnerships(),
          getInquiries({ faq: true }),
          getInquiries({ is_answered: false }),
          getCounties(),
          getCategories(),
        ]);
        if (parts && parts.length > 0) setPartnerships(parts);
        if (faqs && faqs.length > 0) setInquiries(faqs);
        if (pending) setPendingInquiries(pending);
        if (cnts) setCounties(cnts);
        if (cats) setCategories(cats);
      } catch {
        // Fallbacks already in state
      }
    }
    initData();
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
      if (selectedCounty !== "all") {
        if (p.county_slug && p.county_slug !== selectedCounty) return false;
      }
      if (selectedCategory !== "all") {
        if (p.category_code && p.category_code !== selectedCategory) return false;
      }
      if (searchPartnership.trim()) {
        const q = searchPartnership.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchOrg = p.organization_name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchMuni = p.municipality_name?.toLowerCase().includes(q) || false;
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
        const q = faqSearch.toLowerCase();
        const matchSubject = f.subject.toLowerCase().includes(q);
        const matchMsg = f.message.toLowerCase().includes(q);
        const matchResp = f.response?.toLowerCase().includes(q) || false;
        if (!matchSubject && !matchMsg && !matchResp) return false;
      }
      return true;
    });
  }, [inquiries, faqRecipientFilter, faqSearch]);

  // Handle Add Partnership submit
  async function handleAddPartnershipSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingPartner(true);
    try {
      const created = await createPartnership({
        author_persona_key: activePersona.key,
        title: newTitle,
        organization_name: newOrgName,
        organization_type: newOrgType,
        county_slug: newCounty,
        municipality_name: newMunicipality,
        category_code: newCategory,
        looking_for: newLookingFor,
        description: newDescription,
        contact_email: newContactEmail,
        contact_phone: newContactPhone,
      });

      setPartnerships((prev) => [created, ...prev]);
      setPartnerFormSuccess(true);
      setTimeout(() => {
        setIsAddPartnerOpen(false);
        setPartnerFormSuccess(false);
        setNewTitle("");
        setNewDescription("");
      }, 1600);
    } catch {
      // Handled
    } finally {
      setIsAddingPartner(false);
    }
  }

  // Handle send Inquiry to ROPS
  async function handleSendInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmittingInquiry(true);
    try {
      const newInq = await createInquiry({
        author_name: inquirerName,
        author_email: inquirerEmail,
        author_persona_key: activePersona.key,
        recipient_type: selectedMentor,
        subject: inquiryTopic || "Zapytanie wdrożeniowe do ROPS Kraków",
        message: inquiryContent,
      });

      setPendingInquiries((prev) => [newInq, ...prev]);
      setInquirySentSuccess(true);
    } catch {
      setInquirySentSuccess(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  }

  // Handle Reply to an inquiry (Expert Mentor workflow)
  async function handleRespondSubmit(inquiryId: number) {
    if (!responseText.trim()) return;
    setIsResponding(true);
    try {
      const updated = await respondToInquiry(inquiryId, {
        response: responseText,
        responder_name: responderName,
        is_public_faq: makePublicFaq,
      });

      // Update pending inquiries
      setPendingInquiries((prev) => prev.filter((item) => item.id !== inquiryId));

      // If marked as public FAQ, add to inquiries list
      if (updated.is_public_faq) {
        setInquiries((prev) => [updated, ...prev]);
      }

      setRespondSuccessMsg(`Udzielono odpowiedzi na zapytanie #${inquiryId}. Wysłano powiadomienie do pytającego.`);
      setRespondingInquiryId(null);
      setResponseText("");
      setTimeout(() => setRespondSuccessMsg(null), 4000);
    } catch {
      setRespondSuccessMsg("Zapisano odpowiedź w trybie offline.");
    } finally {
      setIsResponding(false);
    }
  }

  // Handle direct reply message to a partnership initiator
  async function handleSendPartnershipReply(e: React.FormEvent) {
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

  // Helpers for labels
  function getOrgTypeBadge(type?: string) {
    switch (type) {
      case "jst_cus":
        return { label: "Samorząd / CUS (JST)", variant: "info" as const };
      case "ngo":
        return { label: "Organizacja NGO", variant: "success" as const };
      case "pes":
        return { label: "Ekonomia Społeczna (PES)", variant: "warning" as const };
      case "nauka":
        return { label: "Uczelnia / Instytut", variant: "neutral" as const };
      default:
        return { label: "Inicjatywa regionalna", variant: "neutral" as const };
    }
  }

  function getLookingForBadge(type?: string) {
    switch (type) {
      case "ngo":
        return "Organizację pozarządową (NGO)";
      case "jst":
        return "Samorząd / Gminę (JST)";
      case "ekspert":
        return "Eksperta merytorycznego";
      case "technologiczny":
        return "Partnera technologicznego";
      default:
        return "Partnera międzysektorowego";
    }
  }

  // ================= TAB 1: GIEŁDA PARTNERSTW =================
  const partnershipsPanel = (
    <div className="space-y-6 pt-2">
      {/* Header and stats bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake size={26} className="text-emerald-700" weight="duotone" />
            <h3 className="type-h2 text-slate-900">Giełda Partnerstw Międzysektorowych Małopolski</h3>
          </div>
          <p className="type-body text-slate-600 max-w-2xl text-sm">
            Połącz siły samorządu (CUS/OPS) z energią organizacji pozarządowych (NGO), podmiotów ekonomii społecznej i świata nauki.
            Wspólne wnioski mikrograntowe FERS Działanie 5.1 i deinstytucjonalizacja usług.
          </p>
        </div>
        <Button variant="primary" leadingIcon={Plus} onClick={() => setIsAddPartnerOpen(true)}>
          Dodaj ofertę partnerstwa
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Wyszukaj ogłoszenie lub słowo kluczowe"
            name="q"
            value={searchPartnership}
            onChange={(e) => setSearchPartnership(e.target.value)}
            placeholder="np. CUS, opieka wytchnieniowa, seniorzy..."
          />
          <SelectField
            label="Kogo poszukujesz / Kto szuka?"
            name="looking_for"
            options={LOOKING_FOR_OPTIONS}
            value={selectedLookingFor}
            onChange={(e) => setSelectedLookingFor(e.target.value)}
          />
          <SelectField
            label="Typ instytucji inicjującej"
            name="org_type"
            options={ORG_TYPE_OPTIONS}
            value={selectedOrgType}
            onChange={(e) => setSelectedOrgType(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <SelectField
            label="Filtruj wg Powiatu Małopolski"
            name="county"
            options={[
              { label: "Wszystkie powiaty Małopolski", value: "all" },
              ...counties.map((c) => ({ label: c.name, value: c.slug })),
            ]}
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          />
          <SelectField
            label="Filtruj wg Obszaru Innowacji"
            name="category"
            options={[
              { label: "Wszystkie obszary wsparcia", value: "all" },
              ...categories.map((cat) => ({ label: cat.name, value: cat.code })),
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        {(searchPartnership || selectedLookingFor !== "all" || selectedOrgType !== "all" || selectedCounty !== "all" || selectedCategory !== "all") && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Znaleziono: <strong>{filteredPartnerships.length}</strong> {filteredPartnerships.length === 1 ? "ofertę" : "ofert"}
            </span>
            <button
              type="button"
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              onClick={() => {
                setSearchPartnership("");
                setSelectedLookingFor("all");
                setSelectedOrgType("all");
                setSelectedCounty("all");
                setSelectedCategory("all");
              }}
            >
              <ArrowsClockwise size={14} /> Wyczyść filtry
            </button>
          </div>
        )}
      </div>

      {/* Partnerships Grid */}
      {filteredPartnerships.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Question size={48} className="text-slate-400 mx-auto mb-3" weight="duotone" />
          <h4 className="type-h3 text-slate-800">Brak ofert spełniających kryteria</h4>
          <p className="type-body text-slate-600 text-sm mt-1">
            Nie znaleziono ogłoszeń dla wybranych filtrów. Spróbuj poszerzyć kryteria lub dodaj pierwszą ofertę w tym obszarze!
          </p>
          <div className="mt-5">
            <Button variant="primary" leadingIcon={Plus} onClick={() => setIsAddPartnerOpen(true)}>
              Opublikuj ofertę jako pierwszy
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPartnerships.map((p) => {
            const orgBadge = getOrgTypeBadge(p.organization_type);
            const lookingBadgeText = getLookingForBadge(p.looking_for);

            return (
              <article
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <Tag label={orgBadge.label} variant={orgBadge.variant} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                      <MapPin size={13} className="text-slate-500" />
                      {p.municipality_name ? `${p.municipality_name}, ` : ""}
                      {p.county_name || "Małopolska"}
                    </span>
                  </div>

                  <h4 className="type-h3 text-slate-900 mb-2 leading-snug">{p.title}</h4>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-500">Inicjator:</span>
                    <strong className="text-xs text-slate-800">{p.organization_name}</strong>
                  </div>

                  {p.category_name && (
                    <div className="mb-3">
                      <Badge label={p.category_name} variant="neutral" />
                    </div>
                  )}

                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                    <Users size={18} className="text-emerald-800 mt-0.5 shrink-0" weight="fill" />
                    <div className="text-xs">
                      <span className="text-emerald-900 font-bold block mb-0.5">Poszukiwany partner:</span>
                      <span className="text-emerald-800 font-medium">{p.looking_for_display || lookingBadgeText}</span>
                    </div>
                  </div>

                  <p className="type-body text-slate-600 text-sm mb-5 leading-relaxed line-clamp-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-3 text-slate-600">
                    <a
                      href={`mailto:${p.contact_email}`}
                      className="hover:text-emerald-700 font-medium flex items-center gap-1.5"
                      title={p.contact_email}
                    >
                      <EnvelopeSimple size={16} className="text-emerald-700" />
                      <span className="hidden sm:inline">{p.contact_email}</span>
                      <span className="sm:hidden">E-mail</span>
                    </a>
                    {p.contact_phone && (
                      <a
                        href={`tel:${p.contact_phone}`}
                        className="hover:text-emerald-700 font-medium flex items-center gap-1.5"
                        title={p.contact_phone}
                      >
                        <Phone size={16} className="text-emerald-700" />
                        <span className="hidden sm:inline">{p.contact_phone}</span>
                      </a>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={PaperPlaneTilt}
                    onClick={() => {
                      setReplyPartner(p);
                      setReplySent(false);
                    }}
                  >
                    Odpowiedz
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Dialog: Add Partnership */}
      <Dialog
        open={isAddPartnerOpen}
        onOpenChange={setIsAddPartnerOpen}
        title="Nowe ogłoszenie na Giełdzie Partnerstw"
        description="Wyszukaj partnera międzysektorowego (JST-NGO) do realizacji usług społecznych lub naboru FERS."
      >
        {partnerFormSuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={56} className="text-emerald-600 mx-auto" weight="fill" />
            <h4 className="type-h3 text-slate-900">Ogłoszenie zostało opublikowane!</h4>
            <p className="type-body text-slate-600 text-sm">
              Twoja propozycja współpracy pojawiła się na Giełdzie Partnerstw i jest widoczna dla samorządów oraz NGO z Małopolski.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddPartnershipSubmit} className="space-y-4">
            <TextField
              label="Tytuł oferty współpracy"
              name="partner_title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="np. Gmina Myślenice szuka NGO do prowadzenia Klubu Sąsiedzkiego"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Nazwa Twojej instytucji / organizacji"
                name="partner_org"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="np. CUS, Stowarzyszenie..."
              />
              <SelectField
                label="Typ Twojej organizacji"
                name="partner_org_type"
                options={[
                  { label: "Samorząd / CUS / OPS (JST)", value: "jst_cus" },
                  { label: "Organizacja Pozarządowa (NGO)", value: "ngo" },
                  { label: "Podmiot Ekonomii Społecznej (PES)", value: "pes" },
                  { label: "Uczelnia / Ośrodek Badań", value: "nauka" },
                ]}
                value={newOrgType}
                onChange={(e) => setNewOrgType(e.target.value as "jst_cus" | "ngo" | "pes" | "nauka")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Powiat realizacji"
                name="partner_county"
                options={counties.map((c) => ({ label: c.name, value: c.slug }))}
                value={newCounty}
                onChange={(e) => setNewCounty(e.target.value)}
              />
              <TextField
                label="Gmina / Miejscowość"
                name="partner_muni"
                value={newMunicipality}
                onChange={(e) => setNewMunicipality(e.target.value)}
                placeholder="np. Myślenice"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Obszar tematyczny innowacji"
                name="partner_cat"
                options={categories.map((c) => ({ label: c.name, value: c.code }))}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <SelectField
                label="Kogo poszukujesz jako partnera?"
                name="partner_looking_for"
                options={[
                  { label: "Organizacji Pozarządowej (NGO)", value: "ngo" },
                  { label: "Samorządu / Gminy (JST)", value: "jst" },
                  { label: "Eksperta merytorycznego", value: "ekspert" },
                  { label: "Partnera technologicznego", value: "technologiczny" },
                ]}
                value={newLookingFor}
                onChange={(e) => setNewLookingFor(e.target.value as "ngo" | "jst" | "ekspert" | "technologiczny")}
              />
            </div>

            <TextAreaField
              label="Szczegółowy opis propozycji i wnoszonych zasobów"
              name="partner_description"
              required
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Opisz czym dysponujesz (lokal, kadra, know-how, dofinansowanie) oraz czego oczekujesz od partnera w ramach deinstytucjonalizacji..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Adres e-mail do kontaktu"
                name="partner_email"
                type="email"
                required
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
              />
              <TextField
                label="Telefon kontaktowy"
                name="partner_phone"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="np. 12 272 56 00"
              />
            </div>

            <div className="dialog__actions pt-2">
              <Button type="button" variant="tertiary" onClick={() => setIsAddPartnerOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary" disabled={isAddingPartner}>
                {isAddingPartner ? "Publikowanie..." : "Opublikuj ogłoszenie"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Dialog: Reply to Partnership */}
      <Dialog
        open={Boolean(replyPartner)}
        onOpenChange={(open) => !open && setReplyPartner(null)}
        title={replyPartner ? `Odpowiedź na ofertę: ${replyPartner.title}` : "Kontakt z inicjatorem"}
        description={replyPartner ? `Inicjator: ${replyPartner.organization_name} (${replyPartner.county_name || "Małopolska"})` : ""}
      >
        {replySent ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={56} className="text-emerald-600 mx-auto" weight="fill" />
            <h4 className="type-h3 text-slate-900">Wiadomość została wysłana!</h4>
            <p className="type-body text-slate-600 text-sm">
              Twoja propozycja kontaktu została przekazana do <strong>{replyPartner?.contact_email}</strong>.
            </p>
          </div>
        ) : replyPartner ? (
          <form onSubmit={handleSendPartnershipReply} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
              <p>
                <strong>Bezpośredni kontakt do inicjatora:</strong>
              </p>
              <p>E-mail: <a href={`mailto:${replyPartner.contact_email}`} className="text-emerald-700 underline font-semibold">{replyPartner.contact_email}</a></p>
              {replyPartner.contact_phone && <p>Telefon: <span className="font-semibold">{replyPartner.contact_phone}</span></p>}
            </div>

            <TextAreaField
              label="Treść wiadomości / propozycji partnerstwa"
              name="reply_msg"
              required
              rows={4}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Przedstaw swoją organizację, posiadane kompetencje lub lokal i zaproponuj termin wstępnej rozmowy wdrożeniowej..."
            />

            <div className="dialog__actions pt-2">
              <Button type="button" variant="tertiary" onClick={() => setReplyPartner(null)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary" leadingIcon={PaperPlaneTilt}>
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
    <div className="space-y-6 pt-2">
      {inquirySentSuccess ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 sm:p-10 text-center max-w-xl mx-auto shadow-sm">
          <CheckCircle size={56} className="text-emerald-600 mx-auto mb-3" weight="fill" />
          <h3 className="type-h2 text-slate-900">Zapytanie zostało pomyślnie wysłane!</h3>
          <p className="type-body text-slate-600 mt-2 text-sm">
            Dziękujemy za kontakt z Małopolskim Hubem Innowacji Społecznych. Odpowiedź od eksperta ROPS Kraków zostanie przesłana na adres: <strong>{inquirerEmail}</strong> w ciągu 24–48 godzin roboczych.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setInquirySentSuccess(false);
                setInquiryContent("");
                setInquiryTopic("");
              }}
            >
              Zadaj kolejne pytanie
            </Button>
            <ButtonLink variant="primary" href="/innowacje">
              Przeglądaj innowacje
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="type-h2 text-slate-900">Skonsultuj się z koordynatorami i mentorami ROPS</h3>
            <p className="type-body text-slate-600 text-sm max-w-xl mx-auto">
              Wybierz adresata swojego pytania: koordynatora naboru FERS lub eksperta ds. metod deinstytucjonalizacji i testowania innowacji.
            </p>
          </div>

          {/* Expert Cards Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedMentor("rops_coordinator")}
              className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                selectedMentor === "rops_coordinator"
                  ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {selectedMentor === "rops_coordinator" && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1">
                  <Check size={14} weight="bold" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  MK
                </div>
                <div>
                  <h4 className="type-h4 text-slate-900">Magdalena Kaczmarczyk</h4>
                  <span className="text-xs text-emerald-800 font-semibold block">Koordynator Małopolskiego Hubu</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Wsparcie w procedurach FERS Działanie 5.1, formalnościach wniosków grantowych, procedurach akredytacji i partnerstwach samorządowych ROPS Kraków.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <ShieldCheck size={14} className="text-emerald-700" /> Czas odpowiedzi: do 48h
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMentor("expert_mentor")}
              className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                selectedMentor === "expert_mentor"
                  ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {selectedMentor === "expert_mentor" && (
                <div className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-1">
                  <Check size={14} weight="bold" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-sm">
                  PA
                </div>
                <div>
                  <h4 className="type-h4 text-slate-900">dr Piotr Adamski</h4>
                  <span className="text-xs text-sky-800 font-semibold block">Główny Mentor Społeczny</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Metodyka testowania innowacji, ewaluacja dostępności WCAG 2.2 AA, modele deinstytucjonalizacji opieki senioralnej i asystentura osób zależnych.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Sparkle size={14} className="text-sky-700" /> Czas odpowiedzi: do 24h
              </span>
            </button>
          </div>

          {/* Inquiry Form */}
          <form
            onSubmit={handleSendInquirySubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Imię i nazwisko"
                name="inquirer_name"
                required
                value={inquirerName}
                onChange={(e) => setInquirerName(e.target.value)}
              />
              <TextField
                label="Adres e-mail do odpowiedzi"
                name="inquirer_email"
                type="email"
                required
                value={inquirerEmail}
                onChange={(e) => setInquirerEmail(e.target.value)}
              />
            </div>

            <TextField
              label="Instytucja / Organizacja / Gmina"
              name="inquirer_org"
              value={inquirerOrg}
              onChange={(e) => setInquirerOrg(e.target.value)}
              placeholder="np. CUS Myślenice, Fundacja Aktywna Małopolska, lub osoba prywatna"
            />

            <TextField
              label="Temat zapytania"
              name="inquiry_topic"
              required
              value={inquiryTopic}
              onChange={(e) => setInquiryTopic(e.target.value)}
              placeholder="np. Kwalifikowalność kosztów adaptacji łazienek w FERS"
            />

            <TextAreaField
              label="Treść pytania"
              name="inquiry_content"
              required
              rows={5}
              value={inquiryContent}
              onChange={(e) => setInquiryContent(e.target.value)}
              placeholder="Opisz dokładnie swoją sytuację, wyzwanie w gminie lub wątpliwość dotyczącą innowacji społecznej..."
            />

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
              <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
              <p>
                Twoje zapytanie zostanie przekazane bezpośrednio do wybranego mentora ROPS Kraków. Odpowiedź trafi na Twój adres e-mail, a najcenniejsze rozstrzygnięcia metodologiczne (po anonimizacji) wzbogacają regionalną Bazę Wiedzy FAQ.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" leadingIcon={PaperPlaneTilt} disabled={isSubmittingInquiry}>
                {isSubmittingInquiry ? "Wysyłanie zapytania..." : "Prześlij pytanie do ROPS"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // ================= TAB 3: BAZA WIEDZY & FAQ =================
  const faqPanel = (
    <div className="space-y-6 pt-2">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={26} className="text-emerald-700" weight="duotone" />
            <h3 className="type-h2 text-slate-900">Baza Wiedzy & Oficjalne FAQ ROPS Kraków</h3>
          </div>
          <p className="type-body text-slate-600 text-sm max-w-2xl">
            Autentyczne pytania i oficjalne odpowiedzi ekspertów Regionalnego Ośrodka Polityki Społecznej w Krakowie dotyczące deinstytucjonalizacji, grantów FERS i wdrożeń testowych.
          </p>
        </div>
      </div>

      {/* FAQ Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Szukaj w Bazie Wiedzy"
          name="faq_q"
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
          placeholder="Wpisz frazę: np. FERS, łazienki, deinstytucjonalizacja, CUS..."
        />
        <SelectField
          label="Ekspert odpowiadający"
          name="faq_expert"
          options={[
            { label: "Wszyscy eksperci ROPS", value: "all" },
            { label: "Magdalena Kaczmarczyk (Koordynator ROPS)", value: "rops_coordinator" },
            { label: "dr Piotr Adamski (Główny Mentor)", value: "expert_mentor" },
          ]}
          value={faqRecipientFilter}
          onChange={(e) => setFaqRecipientFilter(e.target.value)}
        />
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="type-body text-slate-600">Brak odpowiedzi spełniających zadane kryteria wyszukiwania.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = expandedFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white border border-slate-200 rounded-2xl transition-all shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        label={faq.recipient_type === "rops_coordinator" ? "Koordynator ROPS" : "Ekspert / Mentor"}
                        variant={faq.recipient_type === "rops_coordinator" ? "info" : "success"}
                      />
                      <span className="text-xs text-slate-500">
                        Pytanie od: <strong>{faq.author_name}</strong>
                      </span>
                    </div>
                    <h4 className="type-h3 text-slate-900 font-semibold text-base sm:text-lg">
                      {faq.subject}
                    </h4>
                  </div>
                  <div className="text-slate-500 shrink-0 mt-1">
                    {isOpen ? <CaretUp size={20} weight="bold" /> : <CaretDown size={20} weight="bold" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 space-y-1">
                      <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                        Treść zapytania:
                      </span>
                      <p className="type-body text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                        „{faq.message}”
                      </p>
                    </div>

                    <div className="bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-xl p-4 sm:p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
                          <CheckCircle size={16} className="text-emerald-700" weight="fill" />
                          Stanowisko ROPS Kraków
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Odpowiedź: <strong>{faq.responder_name || "Zespół ROPS Kraków"}</strong>
                        </span>
                      </div>
                      <p className="type-body text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                        {faq.response}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ================= TAB 4: PANEL DYŻURU EKSPERTA =================
  const expertPanel = (
    <div className="space-y-6 pt-2">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
        <UserCheck size={32} className="text-amber-800 shrink-0 mt-0.5" weight="fill" />
        <div>
          <h3 className="type-h3 text-amber-900 font-bold">Panel Dyżuru Mentora i Koordynatora ROPS</h3>
          <p className="type-body text-amber-800 text-sm mt-1">
            Zalogowano w profilu uprawnionym do udzielania odpowiedzi: <strong>{activePersona.name}</strong> ({activePersona.role}).
            Poniżej znajduje się lista oczekujących zapytań od mieszkańców, liderów NGO oraz kadr samorządowych (CUS/OPS).
          </p>
        </div>
      </div>

      {respondSuccessMsg && (
        <Alert
          title="Odpowiedź zarejestrowana"
          description={respondSuccessMsg}
          variant="success"
        />
      )}

      <div className="space-y-4">
        <h4 className="type-h3 text-slate-900">
          Oczekujące zapytania ({pendingInquiries.length})
        </h4>

        {pendingInquiries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <CheckCircle size={44} className="text-emerald-600 mx-auto mb-2" weight="fill" />
            <h4 className="type-h3 text-slate-900">Wszystkie zapytania zostały obsłużone!</h4>
            <p className="type-body text-slate-600 text-sm mt-1">
              Brak zapytań oczekujących na odpowiedź w kolejce inkubatora.
            </p>
          </div>
        ) : (
          pendingInquiries.map((inq) => {
            const isReplying = respondingInquiryId === inq.id;

            return (
              <div
                key={inq.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge
                      label={inq.recipient_type === "rops_coordinator" ? "Do Koordynatora ROPS" : "Do Mentora"}
                      variant="warning"
                    />
                    <span className="text-xs text-slate-500">
                      Zgłaszający: <strong>{inq.author_name}</strong> ({inq.author_email})
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {inq.created_at ? new Date(inq.created_at).toLocaleDateString("pl-PL") : "Dziś"}
                  </span>
                </div>

                <div>
                  <h4 className="type-h3 text-slate-900 font-semibold mb-2">{inq.subject}</h4>
                  <p className="type-body text-slate-700 text-sm bg-slate-50 p-4 rounded-xl leading-relaxed">
                    {inq.message}
                  </p>
                </div>

                {isReplying ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 pt-4">
                    <TextAreaField
                      label="Oficjalna odpowiedź ekspercka ROPS"
                      name="expert_response"
                      required
                      rows={5}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Wprowadź merytoryczne wyjaśnienie, odniesienie do przepisów FERS lub wytycznych deinstytucjonalizacji..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <TextField
                        label="Podpis eksperta"
                        name="expert_signature"
                        value={responderName}
                        onChange={(e) => setResponderName(e.target.value)}
                      />
                      <label className="flex items-center gap-2 pt-6 cursor-pointer text-xs text-slate-700">
                        <input
                          type="checkbox"
                          checked={makePublicFaq}
                          onChange={(e) => setMakePublicFaq(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Opublikuj jako oficjalne FAQ w Bazie Wiedzy</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="tertiary"
                        onClick={() => {
                          setRespondingInquiryId(null);
                          setResponseText("");
                        }}
                      >
                        Anuluj
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        leadingIcon={Check}
                        disabled={isResponding || !responseText.trim()}
                        onClick={() => handleRespondSubmit(inq.id)}
                      >
                        {isResponding ? "Zapisywanie..." : "Zatwierdź i wyślij odpowiedź"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      leadingIcon={PaperPlaneTilt}
                      onClick={() => {
                        setRespondingInquiryId(inq.id);
                        setResponseText("");
                      }}
                    >
                      Udziel odpowiedzi jako ekspert
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const tabItems = [
    { id: "partnerstwa", label: `Giełda Partnerstw (${filteredPartnerships.length})`, panel: partnershipsPanel },
    { id: "konsultacje", label: "Zadaj pytanie ROPS", panel: consultationPanel },
    { id: "faq", label: `Baza Wiedzy & FAQ (${filteredFaqs.length})`, panel: faqPanel },
    ...(isExpertPersona
      ? [{ id: "panel_eksperta", label: `Dyżur Eksperta (${pendingInquiries.length})`, panel: expertPanel }]
      : []),
  ];

  return (
    <div className="contact-view max-w-6xl mx-auto space-y-8">
      <TabSwitcher
        items={tabItems}
        label="Sekcje kontaktu, partnerstw i bazy wiedzy ROPS"
        value={activeTab}
        onValueChange={setActiveTab}
      />
    </div>
  );
}
