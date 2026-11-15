// The credit card guide for the clinician finance section.
//
// Lists cards that come up often among doctors, with fees, earn rates and credits read from each
// issuer's own page (data/finance/cards.ts). A visitor ticks the credits they'd really use to see
// what the card costs them after those credits. Au Better earns nothing from any card here.

import { useId, useMemo, useState } from "react";
import {
  CARDS,
  CARD_TYPE_LABEL,
  type CardType,
  type CreditCard,
} from "../../data/finance/cards";
import { financeSources } from "../../data/finance/sources";
import {
  EducationalNote,
  More,
  SourceList,
  focusRing,
  formatDay,
  money,
  panel,
} from "./ui";

type Filter = "all" | CardType;
type Sort = "feeLow" | "feeHigh";

export default function CardGuide() {
  const id = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("feeLow");
  /** Credits the visitor says they'd use, keyed by card id and credit label. */
  const [used, setUsed] = useState<Record<string, boolean>>({});

  const cards = useMemo(() => {
    const list = CARDS.filter((c) => filter === "all" || c.type === filter);
    return [...list].sort((a, b) =>
      sort === "feeLow" ? a.annualFee - b.annualFee : b.annualFee - a.annualFee,
    );
  }, [filter, sort]);

  const newest = CARDS.map((c) => c.checked)
    .sort()
    .at(-1)!;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-6 ${panel}`}>
        <EducationalNote />

        <div className="grid gap-2 leading-snug">
          <p>
            These are cards that come up often among doctors and residents.
            Fees, rewards and credits were read on each issuer’s own page on{" "}
            <strong>{formatDay(newest)}</strong>, and they change often, so
            check the issuer’s page before you apply.
          </p>
          <p className="text-ink/80">
            Au Better earns nothing from these cards, and every link goes to the
            issuer. Sign-up bonuses are left out because they change every few
            weeks.
          </p>
        </div>

        <More summary="Before you pick a card">
          <ul className="grid list-disc gap-2 pl-5 leading-snug">
            <li>
              Pay the full statement balance every month. Card interest rates
              are often above 20%, which wipes out any rewards.
            </li>
            <li>
              A card with a big fee only pays off if you would spend the money
              on its credits anyway. Tick only the credits you’d really use to
              see your true cost.
            </li>
            <li>
              Points are worth the most when moved to airline or hotel partners,
              and least as cash or gift cards.
            </li>
            <li>
              Each new card means a credit check, which can lower your score for
              a while. Space them out before a mortgage.
            </li>
            <li>
              For spending abroad, pick a card with no foreign transaction fee.
            </li>
          </ul>
        </More>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <fieldset>
            <legend className="mb-2 text-[0.95rem] font-extrabold">Show</legend>
            <div className="flex flex-wrap gap-2">
              {(["all", "travel", "cashBack", "rent"] as const).map((value) => (
                <label
                  key={value}
                  className={`flex min-h-11 cursor-pointer items-center rounded-full border-[1.5px] px-4.5 font-display text-lg font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-brand-red-dark ${
                    filter === value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white hover:border-brand-red-dark hover:bg-cream-light"
                  }`}
                >
                  <input
                    type="radio"
                    name={`${id}-filter`}
                    value={value}
                    checked={filter === value}
                    onChange={() => setFilter(value)}
                    className="sr-only"
                  />
                  {value === "all" ? "All cards" : CARD_TYPE_LABEL[value]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-1.5">
            <label
              htmlFor={`${id}-sort`}
              className="text-[0.95rem] font-extrabold"
            >
              Sort by
            </label>
            <select
              id={`${id}-sort`}
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={`h-11 rounded-full border-[1.5px] border-line bg-white px-4 font-semibold ${focusRing}`}
            >
              <option value="feeLow">Annual fee, lowest first</option>
              <option value="feeHigh">Annual fee, highest first</option>
            </select>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing {cards.length} cards.
        </p>

        <ul className="grid gap-4">
          {cards.map((card) => (
            <li key={card.id}>
              <CardEntry
                card={card}
                used={used}
                toggle={(key) => setUsed((u) => ({ ...u, [key]: !u[key] }))}
              />
            </li>
          ))}
        </ul>

        <SourceList ids={CARDS.map((c) => c.source)} heading="Issuer pages" />
      </div>
    </div>
  );
}

function CardEntry({
  card,
  used,
  toggle,
}: {
  card: CreditCard;
  used: Record<string, boolean>;
  toggle: (key: string) => void;
}) {
  const id = useId();
  const keyOf = (label: string) => `${card.id}:${label}`;
  const creditsUsed = card.credits
    .filter((c) => used[keyOf(c.label)])
    .reduce((s, c) => s + c.yearly, 0);
  const net = card.annualFee - creditsUsed;
  const source = financeSources[card.source];

  return (
    <article
      className="grid gap-4 rounded-[22px] border-[1.5px] border-line bg-white p-4 sm:p-5"
      aria-labelledby={`${id}-name`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <h2
            id={`${id}-name`}
            className="font-display text-2xl leading-tight font-semibold"
          >
            {card.name}
          </h2>
          <p className="text-[0.95rem] text-ink/80">
            {card.issuer} · {CARD_TYPE_LABEL[card.type]}
          </p>
        </div>
        <div className="grid justify-items-end gap-0.5 text-right">
          <span className="font-display text-2xl font-semibold tabular-nums">
            {card.annualFee === 0
              ? "No annual fee"
              : `${money(card.annualFee)} a year`}
          </span>
          {card.credits.length > 0 && creditsUsed > 0 && (
            <span className="text-[0.95rem] font-bold">
              {net >= 0
                ? `${money(net)} a year after the credits you ticked`
                : `${money(-net)} a year ahead after the credits you ticked`}
            </span>
          )}
        </div>
      </div>

      <p className="leading-snug">
        <strong>Good fit:</strong> {card.goodFit}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-1.5">
          <h3 className="text-[0.95rem] font-extrabold">Rewards</h3>
          <ul className="grid list-disc gap-1 pl-5 leading-snug">
            {card.earn.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-1.5">
          <h3 className="text-[0.95rem] font-extrabold">Other perks</h3>
          <ul className="grid list-disc gap-1 pl-5 leading-snug">
            {card.perks.map((p) => (
              <li key={p}>{p}</li>
            ))}
            <li>
              Foreign transaction fee:{" "}
              {card.foreignFee ??
                "not stated on the card’s page, so check the issuer’s pricing terms"}
            </li>
          </ul>
        </div>
      </div>

      {card.credits.length > 0 && (
        <fieldset className="grid gap-2 rounded-2xl bg-cream-light p-3.5">
          <legend className="sr-only">Credits on the {card.name}</legend>
          <p className="font-extrabold">
            Credits: tick the ones you’d really use
          </p>
          <ul className="grid gap-1">
            {card.credits.map((c) => {
              const key = keyOf(c.label);
              return (
                <li key={c.label}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-1 py-1.5 hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!used[key]}
                      onChange={() => toggle(key)}
                      className={`mt-0.5 size-5 shrink-0 accent-brand-red ${focusRing}`}
                    />
                    <span className="grid gap-0.5 leading-snug">
                      <span className="font-semibold">
                        {c.label}, up to {money(c.yearly)} a year
                      </span>
                      <span className="text-sm text-ink/80">{c.detail}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="text-[0.95rem] font-semibold">
            {creditsUsed > 0
              ? `Credits you’d use: ${money(creditsUsed)} a year, so the card costs you ${
                  net >= 0
                    ? money(net)
                    : `nothing and puts you ${money(-net)} ahead`
                } before rewards.`
              : "Tick credits above to see what the card really costs you."}
          </p>
        </fieldset>
      )}

      {card.watchOut && (
        <p className="leading-snug">
          <strong>Watch out:</strong> {card.watchOut}
        </p>
      )}

      <p className="text-sm text-ink/80">
        Checked {formatDay(card.checked)} on{" "}
        <a
          href={source.url}
          className="font-bold text-ink underline underline-offset-2"
          rel="noopener"
        >
          {card.issuer.split(" (")[0]}’s page
        </a>
        .
      </p>
    </article>
  );
}
