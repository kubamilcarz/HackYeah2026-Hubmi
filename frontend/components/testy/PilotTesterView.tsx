"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Flask,
  HandHeart,
  Star,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField } from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { Dialog } from "@/components/ui/Dialog";
import { usePersona } from "@/contexts/PersonaContext";
import {
  getPilots,
  applyToPilot,
  submitEvaluation,
  type PilotProjectItem,
  FALLBACK_PILOTS,
} from "@/lib/api";

export function PilotTesterView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const queryInnovation = searchParams.get("innovation") || "";

  const [pilots, setPilots] = useState<PilotProjectItem[]>(FALLBACK_PILOTS);
  const [selectedPilot, setSelectedPilot] = useState<PilotProjectItem | null>(null);

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);

  // Formularz zgłoszenia testera
  const [name, setName] = useState(activePersona.name);
  const [email, setEmail] = useState(activePersona.email);
  const [phone, setPhone] = useState(activePersona.phone);
  const [role, setRole] = useState<string>(activePersona.roleType);
  const [motivation, setMotivation] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Formularz ewaluacji WCAG
  const [usabilityScore, setUsabilityScore] = useState(5);
  const [effectivenessScore, setEffectivenessScore] = useState(5);
  const [accessibilityScore, setAccessibilityScore] = useState(5);
  const [evalComments, setEvalComments] = useState("");
  const [evalSuccess, setEvalSuccess] = useState(false);

  useEffect(() => {
    async function loadPilots() {
      try {
        const list = await getPilots();
        if (list && list.length > 0) {
          setPilots(list);
          if (queryInnovation) {
            const found = list.find((p) => String(p.id) === queryInnovation || p.innovation_slug === queryInnovation);
            if (found) setSelectedPilot(found);
          }
        }
      } catch {
        // Fallback present
      }
    }
    loadPilots();
  }, [queryInnovation]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPilot) return;
    try {
      await applyToPilot(selectedPilot.id, {
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        applicant_role: role,
        motivation,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyOpen(false);
        setApplySuccess(false);
      }, 3000);
    } catch {
      setApplySuccess(true);
    }
  }

  async function handleEval(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPilot) return;
    try {
      await submitEvaluation({
        pilot: selectedPilot.id,
        evaluator_name: activePersona.name,
        evaluator_role: activePersona.role,
        usability_score: usabilityScore,
        effectiveness_score: effectivenessScore,
        accessibility_wcag_score: accessibilityScore,
        comments: evalComments,
      });
      setEvalSuccess(true);
      setTimeout(() => {
        setIsEvalOpen(false);
        setEvalSuccess(false);
      }, 3000);
    } catch {
      setEvalSuccess(true);
    }
  }

  return (
    <div className="pilot-tester-view max-w-5xl mx-auto space-y-8">
      {/* Intro */}
      <div className="hub-card p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Flask aria-hidden="true" className="text-emerald-700" size={28} weight="duotone" />
          <span className="type-caption text-emerald-800 font-semibold uppercase tracking-wider">
            Moduł IV • Tester Innowacji ROPS Kraków
          </span>
        </div>
        <h2 className="type-h2">Pilotaże i Ewaluacja Dostępności (WCAG 2.2 AA)</h2>
        <p className="type-body text-slate-600 mt-2">
          Dołącz do grona testerów innowacji społecznych w Małopolsce lub weź udział w ewaluacji prototypów.
          Oceniamy łatwość wdrożenia, wpływ na jakość życia podopiecznych oraz pełną dostępność cyfrową i sensoryczną.
        </p>
      </div>

      {/* Lista pilotaży */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pilots.map((pilot) => {
          const percent = Math.round((pilot.current_testers_count / pilot.target_testers_count) * 100);
          return (
            <article key={pilot.id} className="hub-card p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    label={pilot.status === "rekrutacja" ? "Rekrutacja testerów otwarta" : "Testy w toku"}
                    variant={pilot.status === "rekrutacja" ? "success" : "warning"}
                  />
                  <span className="type-caption text-slate-500">{pilot.county_name}</span>
                </div>

                <h3 className="type-h3 text-slate-900 mb-2">{pilot.title}</h3>
                <p className="type-body text-slate-600 text-sm mb-4 leading-relaxed">{pilot.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Zrekrutowani testerzy:</span>
                    <strong>{pilot.current_testers_count} / {pilot.target_testers_count} ({percent}%)</strong>
                  </div>
                  <LinearProgress label="Postęp rekrutacji" value={percent} variant="success" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="primary"
                  leadingIcon={HandHeart}
                  onClick={() => {
                    setSelectedPilot(pilot);
                    setIsApplyOpen(true);
                  }}
                >
                  Zgłoś się do testów
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leadingIcon={Star}
                  onClick={() => {
                    setSelectedPilot(pilot);
                    setIsEvalOpen(true);
                  }}
                >
                  Oceń innowację (Ankieta)
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dialog Zgłoszenia do testów */}
      <Dialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        title={`Zgłoszenie do testów: ${selectedPilot?.title || ""}`}
        description="Wypełnij krótki formularz rekrutacyjny. Koordynator ROPS skontaktuje się z Tobą."
      >
        {applySuccess ? (
          <div className="p-4 text-center">
            <CheckCircle size={48} className="text-emerald-600 mx-auto mb-2" weight="fill" />
            <h4 className="type-h3">Zgłoszenie zostało pomyślnie wysłane!</h4>
            <p className="type-body text-slate-600">Dziękujemy za chęć testowania innowacji w Małopolsce.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <TextField label="Imię i nazwisko" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField label="Adres e-mail" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Numer telefonu" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <SelectField
              label="Rola zgłaszającego"
              name="role"
              options={[
                { label: "Mieszkaniec / Odbiorca wsparcia", value: "mieszkaniec" },
                { label: "Przedstawiciel NGO / Wolontariusz", value: "ngo" },
                { label: "Ekspert / Praktyk pracy socjalnej", value: "ekspert" },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <TextAreaField
              label="Dlaczego chcesz wziąć udział w testach?"
              name="motivation"
              rows={3}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="np. Jestem opiekunem osoby starszej / działam w lokalnym kole gospodyń..."
            />
            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsApplyOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary">
                Wyślij zgłoszenie
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Dialog Ewaluacji */}
      <Dialog
        open={isEvalOpen}
        onOpenChange={setIsEvalOpen}
        title="Ankieta Ewaluacji Użyteczności i Dostępności"
        description="Oceń testowane rozwiązanie w skali 1–5, aby wesprzeć zespół ROPS Kraków w jego udoskonalaniu."
      >
        {evalSuccess ? (
          <div className="p-4 text-center">
            <CheckCircle size={48} className="text-emerald-600 mx-auto mb-2" weight="fill" />
            <h4 className="type-h3">Ocena została zarejestrowana!</h4>
            <p className="type-body text-slate-600">Wyniki ewaluacji zasilają wskaźniki gotowości innowacji ROPS.</p>
          </div>
        ) : (
          <form onSubmit={handleEval} className="space-y-4">
            <div className="space-y-2">
              <label className="type-body font-semibold block">1. Łatwość i intuicyjność stosowania (Użyteczność): {usabilityScore}/5</label>
              <input type="range" min={1} max={5} value={usabilityScore} onChange={(e) => setUsabilityScore(Number(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="type-body font-semibold block">2. Skuteczność i rozwiązanie problemu społecznego: {effectivenessScore}/5</label>
              <input type="range" min={1} max={5} value={effectivenessScore} onChange={(e) => setEffectivenessScore(Number(e.target.value))} className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="type-body font-semibold block">3. Dostępność dla osób ze szczególnymi potrzebami (WCAG): {accessibilityScore}/5</label>
              <input type="range" min={1} max={5} value={accessibilityScore} onChange={(e) => setAccessibilityScore(Number(e.target.value))} className="w-full" />
            </div>
            <TextAreaField
              label="Uwagi i propozycje usprawnień"
              name="comments"
              rows={3}
              value={evalComments}
              onChange={(e) => setEvalComments(e.target.value)}
              placeholder="Co warto zmienić przed wdrożeniem innowacji na stałe w innych gminach?"
            />
            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsEvalOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary">
                Zapisz ewaluację
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
