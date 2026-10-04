import { WarningCircle } from "@phosphor-icons/react/ssr";
import type { ReactNode, Ref } from "react";
import { Alert } from "@/components/ui/Alert";

type MatchmakingGapProps = {
  actions: ReactNode;
  children: ReactNode;
  description: string;
  heading: string;
  headingRef?: Ref<HTMLHeadingElement>;
  noticeTitle: string;
};

/** Shared outcome for a need with no sufficiently relevant innovation. */
export function MatchmakingGap({ actions, children, description, heading, headingRef, noticeTitle }: MatchmakingGapProps) {
  return (
    <section aria-labelledby="matchmaking-gap-heading" className="matchmaking-gap">
      <div className="matchmaking-gap__header">
        <WarningCircle aria-hidden="true" className="matchmaking-gap__icon" size={32} weight="fill" />
        <div>
          <p className="matchmaking-gap__eyebrow">Biała plama w innowacjach</p>
          <h2 className="type-h2" id="matchmaking-gap-heading" ref={headingRef} tabIndex={-1}>{heading}</h2>
        </div>
      </div>
      <Alert description={description} title={noticeTitle} variant="warning" />
      <div className="matchmaking-gap__body">{children}</div>
      <div className="matchmaking-gap__actions">{actions}</div>
    </section>
  );
}
