"use client";

import { Printer, ArrowLeft, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import type { ActionPlanItem, GroupMember } from "@/lib/api";

type FersFormData = {
  title: string;
  categoryName: string;
  countyName: string;
  applicantType: "osoba_fizyczna" | "podmiot_ngo" | "grupa_nieformalna";
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantCity: string;
  applicantPostalCode: string;
  organizationKrs: string;
  organizationNip: string;
  organizationRegon: string;
  organizationRepresentative: string;
  groupMembers: GroupMember[];
  innovationDescription: string;
  uniquenessRationale: string;
  problemDiagnosis: string;
  targetRecipients: string;
  expectedChange: string;
  scalabilityModel: string;
  actionPlanPrep: ActionPlanItem[];
  actionPlanTesting: ActionPlanItem[];
  requestedGrantAmount: number;
  teamExperience: string;
  formalDeclarationsAccepted: boolean;
};

type FersPrintViewProps = {
  data: FersFormData;
  onBack: () => void;
};

export function FersPrintView({ data, onBack }: FersPrintViewProps) {
  function handlePrint() {
    window.print();
  }

  const prepTotal = data.actionPlanPrep.reduce((sum, item) => sum + (Number(item.koszt) || 0), 0);
  const testTotal = data.actionPlanTesting.reduce((sum, item) => sum + (Number(item.koszt) || 0), 0);
  const grandTotal = prepTotal + testTotal;

  return (
    <div className="fers-print-container space-y-6">
      {/* Pasek narzędzi na ekranie (ukryty przy druku) */}
      <div className="no-print bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div>
          <h3 className="type-h3 text-white font-semibold">Oficjalny Formularz Wniosku Grantowego FERS</h3>
          <p className="type-caption text-slate-300">
            Wydrukuj dokument do podpisu lub zapisz jako plik PDF (Ctrl+P / Command+P).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={onBack} leadingIcon={ArrowLeft}>
            Wróć do edycji
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handlePrint}
            leadingIcon={Printer}
            className="fers-print-keep"
          >
            Drukuj / Pobierz PDF
          </Button>
        </div>
      </div>

      {/* Arkusz dokumentu urzędowego */}
      <div className="fers-print-card bg-white p-8 sm:p-12 border border-slate-300 rounded-2xl shadow-sm space-y-8 font-sans text-slate-900">
        {/* Nagłówek oficjalny ROPS */}
        <div className="border-b-2 border-slate-900 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Regionalny Ośrodek Polityki Społecznej w Krakowie
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              FORMULARZ ZGŁOSZENIOWY INNOWACJI SPOŁECZNEJ
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Inkubator Włączenia Społecznego 2.0 • Program FERS Działanie 5.1 (Innowacje Społeczne)
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono sm:self-center">
            Maks. dofinansowanie: 50 000,00 PLN<br />
            Data sporządzenia: {new Date().toLocaleDateString("pl-PL")}
          </div>
        </div>

        {/* 1. Tytuł i kategoria */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            1. Przedmiot i kategoria innowacji społecznej
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-sm">
            <div className="sm:col-span-2">
              <span className="font-semibold text-slate-700 block">Tytuł innowacji:</span>
              <p className="text-base font-semibold text-slate-900">{data.title || "—"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Kategoria ROPS:</span>
              <p className="text-slate-900">{data.categoryName || "—"}</p>
            </div>
            <div className="sm:col-span-3">
              <span className="font-semibold text-slate-700 block">Powiat realizacji:</span>
              <p className="text-slate-900">{data.countyName || "Województwo małopolskie"}</p>
            </div>
          </div>
        </section>

        {/* 2. Dane wnioskodawcy */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            2. Dane pomysłodawcy / wnioskodawcy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
            <div>
              <span className="font-semibold text-slate-700 block">Forma prawna wnioskodawcy:</span>
              <p className="capitalize">
                {data.applicantType === "osoba_fizyczna"
                  ? "Osoba fizyczna (mieszkaniec Małopolski)"
                  : data.applicantType === "podmiot_ngo"
                  ? "Podmiot / Organizacja pozarządowa (NGO)"
                  : "Grupa nieformalna"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Imię i nazwisko / Nazwa podmiotu:</span>
              <p className="font-semibold">{data.applicantName || "—"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Adres e-mail:</span>
              <p>{data.applicantEmail || "—"}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Telefon kontaktowy:</span>
              <p>{data.applicantPhone || "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-slate-700 block">Adres zamieszkania / siedziby:</span>
              <p>
                {data.applicantAddress
                  ? `${data.applicantAddress}, ${data.applicantPostalCode} ${data.applicantCity}`
                  : "—"}
              </p>
            </div>

            {data.applicantType === "podmiot_ngo" && (
              <>
                <div>
                  <span className="font-semibold text-slate-700 block">KRS:</span>
                  <p>{data.organizationKrs || "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">NIP:</span>
                  <p>{data.organizationNip || "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">REGON:</span>
                  <p>{data.organizationRegon || "—"}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">Reprezentant formalny:</span>
                  <p>{data.organizationRepresentative || "—"}</p>
                </div>
              </>
            )}

            {data.applicantType === "grupa_nieformalna" && data.groupMembers.length > 0 && (
              <div className="sm:col-span-2 pt-2">
                <span className="font-semibold text-slate-700 block mb-1">Członkowie grupy nieformalnej:</span>
                <ul className="list-disc pl-5 space-y-1">
                  {data.groupMembers.map((m, i) => (
                    <li key={i}>
                      <strong>{m.name}</strong> — {m.role} ({m.city})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* 3. Opis innowacji & deinstytucjonalizacja */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            3. Opis innowacji i wpisanie się w ideę deinstytucjonalizacji
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.innovationDescription || "—"}
          </p>
        </section>

        {/* 4. Innowacyjność rozwiązania */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            4. Innowacyjność rozwiązania (wyróżniki na tle kraju i świata)
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.uniquenessRationale || "—"}
          </p>
        </section>

        {/* 5. Diagnoza problemu & raporty ROPS */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            5. Diagnoza problemu i podstawa w raportach ROPS Kraków
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.problemDiagnosis || "—"}
          </p>
        </section>

        {/* 6. Odbiorcy */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            6. Opis odbiorców innowacji i przyczyny zagrożenia wykluczeniem
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.targetRecipients || "—"}
          </p>
        </section>

        {/* 7. Oczekiwana zmiana */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            7. Zmiana wprowadzana przez innowację i oczekiwane rezultaty
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.expectedChange || "—"}
          </p>
        </section>

        {/* 8. Skalowalność */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            8. Wizja przyszłości, skalowalność i replikowalność w JST Małopolski
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.scalabilityModel || "—"}
          </p>
        </section>

        {/* 9. Harmonogram i budżet */}
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            9. Plan działania i koszty (harmonogram i budżet)
          </h2>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Część I: Okres przygotowawczy (maks. 3 miesiące)
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2">Lp.</th>
                  <th className="border border-slate-300 p-2">Planowane działanie</th>
                  <th className="border border-slate-300 p-2">Termin</th>
                  <th className="border border-slate-300 p-2 text-right">Koszt (PLN)</th>
                </tr>
              </thead>
              <tbody>
                {data.actionPlanPrep.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 text-slate-500 w-8">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">{item.dzialanie}</td>
                    <td className="border border-slate-300 p-2">{item.termin}</td>
                    <td className="border border-slate-300 p-2 text-right font-semibold">
                      {Number(item.koszt).toLocaleString("pl-PL")} zł
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-300 p-2 text-right">
                    Suma okresu przygotowawczego:
                  </td>
                  <td className="border border-slate-300 p-2 text-right">
                    {prepTotal.toLocaleString("pl-PL")} zł
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Część II: Okres testowania (maks. 9 miesięcy)
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2">Lp.</th>
                  <th className="border border-slate-300 p-2">Planowane działanie</th>
                  <th className="border border-slate-300 p-2">Termin</th>
                  <th className="border border-slate-300 p-2 text-center">Testerzy</th>
                  <th className="border border-slate-300 p-2 text-right">Koszt (PLN)</th>
                </tr>
              </thead>
              <tbody>
                {data.actionPlanTesting.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-2 text-slate-500 w-8">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">{item.dzialanie}</td>
                    <td className="border border-slate-300 p-2">{item.termin}</td>
                    <td className="border border-slate-300 p-2 text-center">{item.liczba_testerow || "—"}</td>
                    <td className="border border-slate-300 p-2 text-right font-semibold">
                      {Number(item.koszt).toLocaleString("pl-PL")} zł
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="border border-slate-300 p-2 text-right">
                    Suma okresu testowania:
                  </td>
                  <td className="border border-slate-300 p-2 text-right">
                    {testTotal.toLocaleString("pl-PL")} zł
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 10. Wnioskowana kwota */}
        <section className="space-y-2 bg-emerald-50/50 p-4 border border-emerald-200 rounded-xl">
          <h2 className="text-base font-bold uppercase text-emerald-950 pb-1">
            10. Łączna wnioskowana kwota mikrograntu FERS
          </h2>
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-slate-800">Suma całkowita projektu:</span>
            <span className="font-bold text-2xl text-emerald-800">
              {(grandTotal || data.requestedGrantAmount).toLocaleString("pl-PL")} PLN
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Maksymalny limit dofinansowania w ramach naboru FERS Działanie 5.1 ROPS Kraków wynosi 50 000,00 PLN.
          </p>
        </section>

        {/* 11. Zespół */}
        <section className="space-y-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            11. Zespół projektowy i doświadczenie w realizacji innowacji
          </h2>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {data.teamExperience || "—"}
          </p>
        </section>

        {/* 12. Oświadczenia */}
        <section className="space-y-2 pt-2">
          <h2 className="text-base font-bold uppercase text-slate-900 border-b border-slate-200 pb-1">
            12. Oświadczenia formalne wnioskodawcy
          </h2>
          <div className="flex items-start gap-2 text-xs text-slate-700 pt-1">
            {data.formalDeclarationsAccepted ? (
              <CheckCircle className="text-emerald-700 shrink-0 mt-0.5" size={16} weight="fill" />
            ) : (
              <WarningCircle className="shrink-0 mt-0.5" size={16} weight="fill" />
            )}
            <span>
              {data.formalDeclarationsAccepted
                ? "Wnioskodawca oświadcza, że zapoznał się z Regulaminem Naboru Inkubatora Włączenia Społecznego 2.0 (FERS Działanie 5.1), spełnia kryteria formalne, nie zalega ze zobowiązaniami publicznoprawnymi i wyraża zgodę na przetwarzanie danych osobowych przez ROPS Kraków na potrzeby procedury naboru."
                : "Oświadczenia formalne nie zostały jeszcze zaakceptowane. Przed złożeniem wniosku wróć do edycji i potwierdź wymagane oświadczenie."}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10 text-xs text-slate-600 border-t border-slate-200 mt-8">
            <div className="text-center border-t border-dashed border-slate-400 pt-2">
              Miejscowość i data
            </div>
            <div className="text-center border-t border-dashed border-slate-400 pt-2">
              Czytelny podpis wnioskodawcy / reprezentanta
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
