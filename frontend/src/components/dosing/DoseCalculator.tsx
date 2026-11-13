// The families' children's dose calculator for liquid Tylenol (acetaminophen) and
// ibuprofen (Motrin, Advil).
//
// One question per screen: age, then health conditions, then medicine (and which ibuprofen),
// then weight. Babies under 6 months and children with a long-term condition are sent to a
// doctor instead of getting a dose. The legal disclaimer stays at the top of every screen.
// Yellow is used only for warnings. Doses and their sources live in src/data/dosing.ts.

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DOSING_SOURCES,
  MEDICINES,
  PRODUCTS,
  doseFor,
  toPounds,
  type ProductId,
  type WeightUnit,
} from "../../data/dosing";

type Step = "age" | "tooYoung" | "health" | "askDoctor" | "medicine" | "ibuprofenType" | "weight";

interface Place {
  step: Step;
  product: ProductId | null;
}

/** Which of the four steps each screen belongs to; 0 marks an end screen with no progress bar. */
const STEP_NUMBER: Record<Step, number> = {
  age: 1,
  tooYoung: 0,
  health: 2,
  askDoctor: 0,
  medicine: 3,
  ibuprofenType: 3,
  weight: 4,
};

const START: Place = { step: "age", product: null };

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-red-dark";

export default function DoseCalculator() {
  const [place, setPlace] = useState<Place>(START);
  const [history, setHistory] = useState<Place[]>([]);
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [weight, setWeight] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // After each move, take keyboard and screen reader users to the new question.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [place]);

  function go(step: Step, product?: ProductId) {
    setHistory((h) => [...h, place]);
    setPlace({ step, product: product ?? place.product });
  }

  function back() {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory(history.slice(0, -1));
    setPlace(previous);
  }

  function startOver() {
    setHistory([]);
    setPlace(START);
    setWeight("");
  }

  const heading = (text: string) => (
    <h2
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-[1.75rem] leading-tight font-semibold text-balance focus:outline-none sm:text-[2rem]"
    >
      {text}
    </h2>
  );

  const startOverButton = (
    <button
      type="button"
      onClick={startOver}
      className={`justify-self-start rounded-full bg-brand-red px-8 py-3.5 font-display text-xl font-semibold text-white transition-colors hover:bg-brand-red-dark ${focusRing}`}
    >
      Start over
    </button>
  );

  function screen(): ReactNode {
    switch (place.step) {
      case "age":
        return (
          <>
            {heading("How old is your child?")}
            <Choices>
              <Choice title="Younger than 6 months" onClick={() => go("tooYoung")} />
              <Choice title="6 months or older" onClick={() => go("health")} />
            </Choices>
          </>
        );

      case "tooYoung":
        return (
          <>
            <DoctorBadge />
            {heading("Your baby should see a doctor first")}
            <p>
              Babies younger than 6 months with fever or pain need a doctor’s exam before taking any
              medicine.
            </p>
            <Warning>
              <strong>Under 3 months with a temperature of 100.4°F (38°C) or higher?</strong> Call
              the doctor now. If you can’t reach one, go to the emergency room.
            </Warning>
            {startOverButton}
          </>
        );

      case "health":
        return (
          <>
            {heading("Does your child have a long-term health condition?")}
            <p className="-mt-2 text-ink/80">
              This includes kidney or liver problems. Answer yes if a doctor has diagnosed one, or if
              you think your child may have one.
            </p>
            <Choices>
              <Choice title="Yes, or I’m not sure" onClick={() => go("askDoctor")} />
              <Choice title="No" onClick={() => go("medicine")} />
            </Choices>
            <More summary="Why we ask">
              <p>
                The liver breaks down acetaminophen, and ibuprofen can strain the kidneys. Children
                with these or other long-term conditions may need a different medicine or a different
                dose.
              </p>
            </More>
          </>
        );

      case "askDoctor":
        return (
          <>
            <DoctorBadge />
            {heading("Check with your child’s doctor first")}
            <p>
              Your child may need a different medicine or dose. Ask their doctor or a pharmacist before
              giving acetaminophen or ibuprofen.
            </p>
            {startOverButton}
          </>
        );

      case "medicine":
        return (
          <>
            {heading("Which medicine do you have?")}
            <p className="-mt-2 text-ink/80">This calculator is for liquid medicine only.</p>
            <Choices>
              <Choice title="Tylenol" note="acetaminophen" onClick={() => go("weight", "tylenolLiquid")} />
              <Choice title="Motrin or Advil" note="ibuprofen" onClick={() => go("ibuprofenType")} />
            </Choices>
            <More summary="Using a store brand?">
              <p>
                Store brands work the same way. Find <strong>Active ingredient</strong> on the Drug
                Facts label. It will say acetaminophen or ibuprofen.
              </p>
            </More>
          </>
        );

      case "ibuprofenType":
        return (
          <>
            {heading("Which ibuprofen do you have?")}
            <Choices>
              <Choice
                title="Infants’ drops"
                note="50 mg per 1.25 mL"
                onClick={() => go("weight", "infantDrops")}
              />
              <Choice
                title="Children’s liquid"
                note="100 mg per 5 mL"
                onClick={() => go("weight", "childrensLiquid")}
              />
            </Choices>
            <More summary="How to tell which one you have">
              <p>
                Look for <strong>Active ingredient</strong> on the Drug Facts label. The amount in
                parentheses tells you which one you have.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <LabelGuide
                  name="Infants’ drops"
                  perMl="1.25 mL"
                  mg="50 mg"
                  frontLabel="Infants’"
                  clues={["Comes with an oral syringe", "Small bottle"]}
                />
                <LabelGuide
                  name="Children’s liquid"
                  perMl="5 mL"
                  mg="100 mg"
                  frontLabel="Children’s"
                  clues={["Comes with a dosing cup", "Larger bottle"]}
                />
              </div>
              <Warning>
                Infants’ drops are twice as strong as Children’s liquid. Picking the wrong one changes
                the dose.
              </Warning>
              <p>
                Have chewables, tablets, or a bottle that doesn’t match either one? This calculator
                doesn’t cover them. Ask a pharmacist.
              </p>
            </More>
          </>
        );

      case "weight":
        return place.product ? (
          <WeightStep
            heading={heading("How much does your child weigh?")}
            product={place.product}
            unit={unit}
            onUnit={setUnit}
            weight={weight}
            onWeight={setWeight}
            onSwitchProduct={(p) => go("weight", p)}
          />
        ) : null;
    }
  }

  const stepNumber = STEP_NUMBER[place.step];

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgb(31_31_31/0.04),0_12px_32px_rgb(31_31_31/0.06)] sm:p-8">
        <Warning>
          <strong>
            This calculator is for educational purposes only. Talk to a licensed medical professional
            before starting any medication.
          </strong>
        </Warning>

        {(stepNumber > 0 || history.length > 0) && (
          <div className="flex min-h-10 items-center justify-between gap-3">
            {stepNumber > 0 && (
              <div className="grid max-w-56 flex-1 gap-1.5">
                <span className="text-sm font-extrabold tracking-wide text-ink/80">
                  Step {stepNumber} of 4
                </span>
                <div className="grid grid-cols-4 gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    <i
                      key={n}
                      className={`h-1.5 rounded-full ${n <= stepNumber ? "bg-brand-red-dark" : "bg-line"}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {history.length > 0 && (
              <div className="ml-auto flex gap-1">
                <TextButton onClick={back}>← Back</TextButton>
                <TextButton onClick={startOver}>Start over</TextButton>
              </div>
            )}
          </div>
        )}

        <section className="grid grid-cols-[minmax(0,1fr)] gap-5">{screen()}</section>

        <p className="border-t border-line pt-4 text-ink/80">
          In an emergency, call <b className="text-brand-red-dark">911</b>.
        </p>
      </div>

      <details className="group mt-4">
        <Summary className="text-ink/80">Where these doses come from</Summary>
        <div className="grid gap-3 px-4 pb-4 text-[0.95rem] text-ink/80">
          <p>
            Doses follow standard U.S. weight-based dosing charts for liquid acetaminophen and
            ibuprofen, the same ranges printed on product labels.
          </p>
          <ul className="grid list-disc gap-1 pl-5">
            {DOSING_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} className="text-ink underline underline-offset-2">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}

interface WeightStepProps {
  heading: ReactNode;
  product: ProductId;
  unit: WeightUnit;
  onUnit: (unit: WeightUnit) => void;
  weight: string;
  onWeight: (weight: string) => void;
  onSwitchProduct: (product: ProductId) => void;
}

function WeightStep({ heading, product, unit, onUnit, weight, onWeight, onSwitchProduct }: WeightStepProps) {
  const details = PRODUCTS[product];
  const medicine = MEDICINES[details.medicine];

  const raw = weight.trim().replace(",", ".");
  const value = /^\d*\.?\d+$/.test(raw) ? parseFloat(raw) : NaN;
  const valid = value > 0;
  const pounds = valid ? toPounds(value, unit) : NaN;
  const result = valid ? doseFor(product, pounds) : null;

  let conversion: string;
  if (!valid) {
    conversion = raw
      ? "Enter a number, like 25 or 25.5."
      : `Enter your child’s weight in ${unit === "lb" ? "pounds" : "kilograms"}.`;
  } else if (unit === "lb") {
    conversion = `${value} lb is about ${round1(pounds / 2.2046226218)} kg`;
  } else {
    conversion = `${value} kg is about ${round1(pounds)} lb`;
  }

  const otherIbuprofen: ProductId | null =
    product === "infantDrops" ? "childrensLiquid" : product === "childrensLiquid" ? "infantDrops" : null;

  const tips = [
    "Measure with the syringe or cup that came with the medicine.",
    "Call your child’s doctor if the fever lasts more than 3 days, or anytime you’re worried.",
  ];
  if (result?.status === "ok") {
    tips.push(
      `This dose is for children who weigh ${
        result.highLb ? `${result.lowLb} to ${result.highLb} lb.` : `${result.lowLb} lb or more.`
      }`,
    );
  }
  if (product === "tylenolLiquid") {
    tips.push("Infants’ and Children’s Tylenol liquids are the same strength, so this dose works for either one.");
  }

  return (
    <>
      {heading}
      <span className="justify-self-start rounded-full border border-line bg-cream-light px-3.5 py-1.5 text-[0.92rem] font-bold">
        {details.label}
      </span>
      {product === "tylenolLiquid" && (
        <Warning>
          Make sure your bottle says <strong>160 mg per 5 mL</strong>. If it says anything else, don’t
          use this calculator.
        </Warning>
      )}

      <div className="flex flex-wrap gap-2.5">
        <label htmlFor="dose-weight" className="sr-only">
          Your child’s weight
        </label>
        <input
          id="dose-weight"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={weight}
          onChange={(e) => onWeight(e.target.value)}
          aria-describedby="dose-weight-conversion"
          className={`h-19 w-0 min-w-0 flex-[1_1_150px] rounded-[20px] border-[1.5px] border-line bg-white px-5.5 font-display text-[2.4rem] font-semibold tabular-nums placeholder:text-[#c9c1b3] focus:border-ink ${focusRing}`}
        />
        <fieldset className="grid flex-[0_0_150px] grid-cols-2 gap-1 rounded-[20px] border-[1.5px] border-line bg-white p-1.25">
          <legend className="sr-only">Weight unit</legend>
          {(["lb", "kg"] as const).map((u) => (
            <label
              key={u}
              className={`grid min-h-15.5 cursor-pointer place-items-center rounded-[15px] font-display text-[1.3rem] font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-brand-red-dark ${
                unit === u ? "bg-ink text-white" : "text-ink/80"
              }`}
            >
              <input
                type="radio"
                name="dose-weight-unit"
                value={u}
                checked={unit === u}
                onChange={() => onUnit(u)}
                className="sr-only"
              />
              {u}
            </label>
          ))}
        </fieldset>
      </div>
      <p id="dose-weight-conversion" className="-mt-2 text-[0.95rem] font-semibold text-ink/80 tabular-nums">
        {conversion}
      </p>

      <div aria-live="polite" className="grid gap-4">
        {result?.status === "underweight" && (
          <Warning>
            <strong>Ask your child’s doctor for the dose.</strong> This calculator doesn’t cover children
            who weigh less than 12 lb (5.4 kg).
          </Warning>
        )}
        {result?.status === "checkWeight" && (
          <Warning>
            <strong>Check the weight.</strong> That number looks too high. Make sure lb or kg is set
            correctly.
          </Warning>
        )}
        {result?.status === "tooHeavyForProduct" && (
          <Warning>
            <strong>Use Children’s liquid instead.</strong> Infants’ drops aren’t meant for children who
            weigh 60 lb (27 kg) or more.
          </Warning>
        )}
        {result?.status === "ok" && (
          <div className="grid gap-3 rounded-[22px] bg-cream px-5.5 py-5">
            <p className="font-display text-[clamp(4rem,19vw,5.2rem)] leading-none font-bold tabular-nums">
              {result.ml}
              <span className="ml-1.5 text-[0.4em] font-semibold">mL</span>
            </p>
            <p className="text-ink/80">
              That’s {result.mg} mg of {medicine.name}. Use the mL amount when measuring. It’s the
              easiest number to read on a dosing cup or syringe.
            </p>
            <dl className="grid grid-cols-2 gap-2">
              <Fact label="How often">{medicine.every}</Fact>
              <Fact label="Limit">{medicine.limit}</Fact>
            </dl>
            <More summary="Tips for giving it safely">
              <ul className="grid list-disc gap-1 pl-5">
                {tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </More>
          </div>
        )}
      </div>

      {otherIbuprofen && (
        <TextButton onClick={() => onSwitchProduct(otherIbuprofen)} className="justify-self-start text-brand-red-dark">
          {otherIbuprofen === "childrensLiquid" ? "Switch to Children’s liquid" : "Switch to Infants’ drops"}
        </TextButton>
      )}
    </>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function Choices({ children }: { children: ReactNode }) {
  return <div className="grid gap-2.5">{children}</div>;
}

function Choice({ title, note, onClick }: { title: string; note?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-19 w-full items-center justify-between gap-3 rounded-[20px] border-[1.5px] border-line bg-white py-3.5 pr-4.5 pl-5.5 text-left transition-colors hover:border-brand-red-dark hover:bg-cream-light ${focusRing}`}
    >
      <span className="grid gap-px">
        <span className="font-display text-[1.35rem] leading-tight font-semibold">{title}</span>
        {note && <span className="font-semibold text-ink/80">{note}</span>}
      </span>
      <span
        aria-hidden="true"
        className="grid size-8.5 shrink-0 place-items-center rounded-full bg-cream-light text-brand-red-dark transition-colors group-hover:bg-brand-red-dark group-hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M6 3l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function TextButton({
  onClick,
  children,
  className = "text-ink/80",
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-[10px] px-2 py-1.5 text-[0.95rem] font-bold transition-colors hover:bg-cream-light hover:text-ink ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

/** The only place yellow is used: warnings, including the legal disclaimer. */
function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warn-line bg-warn px-3.5 py-3 leading-snug">
      <span
        aria-hidden="true"
        className="mt-px grid size-6 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-warn"
      >
        !
      </span>
      <p>{children}</p>
    </div>
  );
}

function Summary({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <summary
      className={`flex min-h-13 cursor-pointer list-none items-center gap-2.5 rounded-2xl px-4 py-2.5 font-extrabold [&::-webkit-details-marker]:hidden ${focusRing} ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-white font-display text-lg leading-none font-bold text-brand-red-dark"
      >
        <span className="group-open:hidden">+</span>
        <span className="hidden group-open:inline">−</span>
      </span>
      {children}
    </summary>
  );
}

function More({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl bg-cream-light">
      <Summary>{summary}</Summary>
      <div className="grid gap-3 px-4 pb-4">{children}</div>
    </details>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-[14px] bg-white px-3 py-2.5">
      <dt className="text-xs font-extrabold tracking-wide text-ink/80 uppercase">{label}</dt>
      <dd className="leading-snug font-extrabold">{children}</dd>
    </div>
  );
}

function DoctorBadge() {
  return (
    <div className="grid size-14 place-items-center rounded-full bg-red-tint text-brand-red-dark" aria-hidden="true">
      <svg width="26" height="26" viewBox="0 0 26 26">
        <path d="M10 3h6v7h7v6h-7v7h-6v-7H3v-6h7z" fill="currentColor" />
      </svg>
    </div>
  );
}

/** A simplified Drug Facts panel showing where the strength is printed. */
function LabelGuide({
  name,
  perMl,
  mg,
  frontLabel,
  clues,
}: {
  name: string;
  perMl: string;
  mg: string;
  frontLabel: string;
  clues: string[];
}) {
  return (
    <div className="grid content-start gap-2">
      <h3 className="font-display text-lg font-semibold">{name}</h3>
      <div aria-hidden="true" className="rounded-md border-2 border-ink bg-white font-['Helvetica_Neue',Arial,sans-serif]">
        <div className="border-b-4 border-ink px-2.5 py-1 font-extrabold">Drug Facts</div>
        <div className="border-b border-ink px-2.5 py-1 text-sm font-bold">
          Active ingredient{" "}
          <em className="rounded-sm bg-red-tint px-1 text-brand-red-dark not-italic">(in each {perMl})</em>
        </div>
        <div className="px-2.5 py-1 text-sm">Ibuprofen {mg}</div>
      </div>
      <p className="sr-only">
        The label reads: Active ingredient, in each {perMl}, ibuprofen {mg}.
      </p>
      <ul className="grid list-disc gap-1 pl-5">
        <li>
          Front label says <strong>{frontLabel}</strong>
        </li>
        {clues.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
