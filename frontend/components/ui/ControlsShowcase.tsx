"use client";

import { useState } from "react";
import { CheckboxGroup, DateField, RadioGroup, SearchField, SegmentedControl, SelectField, Slider, Stepper, TextField } from "@/components/ui/FormControls";

const contactOptions = [
  { label: "Telefon", value: "telefon" },
  { label: "E-mail", value: "email" },
  { label: "Wiadomość w Splot", value: "wiadomosc" },
];

export function ControlsShowcase() {
  const [search, setSearch] = useState("");
  const [areas, setAreas] = useState(["opieka"]);
  const [view, setView] = useState("lista");
  const [radius, setRadius] = useState(5);
  const [people, setPeople] = useState(1);

  return <section className="mt-10" aria-labelledby="controls-heading">
    <div className="mb-4 max-w-2xl"><h3 className="type-h3" id="controls-heading">Formularz potrzeby</h3><p className="type-caption mt-1 text-[var(--content-muted)]">Widoczne etykiety, podpowiedzi i komunikaty błędów wyjaśniają kolejny krok na telefonie, klawiaturze i z pomocą technologii asystujących.</p></div>
    <div className="controls-showcase">
      <TextField helperText="Krótko opisz, jakiego wsparcia szukasz." label="Etykieta" placeholder="Wpisz treść…" />
      <TextField error="Uzupełnij pole poprawnymi danymi." label="Stan błędu" placeholder="Wpisz poprawne dane" />
      <SearchField label="Pole z ikoną" onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj rozwiązań…" value={search} />
      <SelectField defaultValue="" label="Pole z wyborem" options={[{ label: "Opcja pierwsza", value: "pierwsza" }, { label: "Opcja druga", value: "druga" }, { label: "Opcja trzecia", value: "trzecia" }]} placeholder="Wybierz opcję" />
      <DateField helperText="Wybierz orientacyjny termin, jeśli wsparcie jest potrzebne w konkretnym dniu." label="Kiedy potrzebujesz wsparcia?" min="2026-01-01" />
      <TextField disabled label="Status zgłoszenia" value="Dostępny po zapisaniu zgłoszenia" readOnly />
      <RadioGroup label="Preferowany sposób kontaktu" name="contact-method" onValueChange={() => undefined} options={contactOptions} required value="telefon" />
      <CheckboxGroup label="Czego dotyczy potrzeba?" name="areas" onValueChange={setAreas} options={[{ label: "Opieka", value: "opieka" }, { label: "Transport", value: "transport" }, { label: "Wsparcie sąsiedzkie", value: "sasiedzkie" }]} value={areas} />
      <SegmentedControl label="Sposób prezentacji wyników" name="results-view" onValueChange={setView} options={[{ label: "Lista", value: "lista" }, { label: "Mapa", value: "mapa" }, { label: "Dopasowania", value: "dopasowania" }]} value={view} />
      <Slider formatValue={(value) => `${value} km`} label="Zasięg wyszukiwania" max={25} min={1} onValueChange={setRadius} value={radius} />
      <Stepper label="Liczba osób, których dotyczy potrzeba" max={12} min={1} onValueChange={setPeople} value={people} />
    </div>
  </section>;
}
