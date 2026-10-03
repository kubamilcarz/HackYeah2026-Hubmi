"use client";

import { useState } from "react";
import { HandHeart, Heart, HeartStraight } from "@phosphor-icons/react";
import { Button, IconButton } from "@/components/ui/Button";

export type FavoriteButtonProps = { defaultPressed?: boolean };

/** A local, labelled save toggle. Supply persistence through a future feature wrapper. */
export function FavoriteButton({ defaultPressed = false }: FavoriteButtonProps) {
  const [pressed, setPressed] = useState(defaultPressed);
  const label = pressed ? "Usuń rozwiązanie z ulubionych" : "Dodaj rozwiązanie do ulubionych";
  return <IconButton aria-pressed={pressed} icon={pressed ? Heart : HeartStraight} label={label} onClick={() => setPressed((value) => !value)} variant={pressed ? "primary" : "tertiary"} />;
}

export type SolutionInterestActionsProps = { defaultInterested?: boolean };

/** Local demonstration controls for expressing interest and saving a solution. */
export function SolutionInterestActions({ defaultInterested = false }: SolutionInterestActionsProps) {
  const [interested, setInterested] = useState(defaultInterested);
  return <div aria-label="Działania dotyczące rozwiązania" className="solution-interest-actions"><Button aria-pressed={interested} leadingIcon={HandHeart} onClick={() => setInterested((value) => !value)}>{interested ? "Zainteresowanie zapisane" : "Zainteresuj się"}</Button><FavoriteButton /></div>;
}
