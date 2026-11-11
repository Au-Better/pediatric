// The interactive medical careers roadmap.
//
// Pick a career to see its road from high school as a timeline, or pick a second one to
// compare them side by side. The page is rendered on the server first, so it reads fine
// before (or without) JavaScript; the buttons start working once the page has loaded.
// The chosen careers are kept in the address (?career=…&compare=…) so a link can be shared.

import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import {
  careers,
  families,
  formatTotal,
  formatTotalShort,
  formatYears,
  getCareer,
  sourceNumber,
  sources,
  timedSteps,
  totalYears,
  yearsWord,
  type Career,
  type Cited,
  type Step,
  type StepKind,
} from "../../data/careers";

interface Props {
  initialCareer?: string;
  initialCompare?: string;
}

const DEFAULT_CAREER = "pediatrician";

export default function CareerRoadmap({ initialCareer, initialCompare }: Props) {
  const [careerId, setCareerId] = useState(getCareer(initialCareer)?.id ?? DEFAULT_CAREER);
  const [compareId, setCompareId] = useState(
    initialCompare && initialCompare !== careerId ? (getCareer(initialCompare)?.id ?? "") : "",
  );
  const [announcement, setAnnouncement] = useState("");
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const career = getCareer(careerId)!;
  const compare = compareId ? getCareer(compareId) : undefined;

  // Keep the address in step with what is shown, so the link can be shared or bookmarked.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("career", careerId);
    if (compareId) url.searchParams.set("compare", compareId);
    else url.searchParams.delete("compare");
    window.history.replaceState(null, "", url);
  }, [careerId, compareId]);

  function choose(id: string, { moveFocus = false } = {}) {
    setCareerId(id);
    if (id === compareId) setCompareId("");
    const next = getCareer(id)!;
    setAnnouncement(`Showing ${next.name}: ${describeTotal(next)}.`);
    if (moveFocus) {
      // Let React draw the new career first, then take the reader to it.
      requestAnimationFrame(() => {
        const heading = detailHeading.current;
        if (!heading) return;
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      });
    }
  }

  function chooseCompare(id: string) {
    setCompareId(id);
    const next = getCareer(id);
    setAnnouncement(
      next
        ? `Comparing ${career.name} with ${next.name}: ${describeTotal(career)} versus ${describeTotal(next)}.`
        : `Showing ${career.name} only.`,
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <CareerPicker selectedId={careerId} onChoose={(id) => choose(id)} />

      <div className="mt-8 flex flex-col gap-2 rounded-3xl bg-white/70 p-5 sm:flex-row sm:items-center sm:gap-4">
        <label htmlFor="compare-career" className="font-display text-lg font-semibold">
          Compare with another career
        </label>
        <select
          id="compare-career"
          className="min-h-11 rounded-full border-2 border-ink/20 bg-white px-4 py-2 text-base sm:min-w-72"
          value={compareId}
          onChange={(e) => chooseCompare(e.target.value)}
        >
          <option value="">No comparison</option>
          {families.map((family) => (
            <optgroup key={family.id} label={family.name}>
              {careers
                .filter((c) => c.family === family.id && c.id !== careerId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {compare && (
          <button
            type="button"
            className="min-h-11 self-start rounded-full px-4 py-2 font-semibold text-brand-red-dark underline underline-offset-4 hover:text-ink sm:self-auto"
            onClick={() => chooseCompare("")}
          >
            Clear
          </button>
        )}
      </div>

      {compare ? (
        <section aria-label="Comparison" className="mt-8">
          <CompareBars a={career} b={compare} />
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <CareerPath career={career} headingRef={detailHeading} compact />
            <CareerPath career={compare} compact />
          </div>
        </section>
      ) : (
        <div className="mt-8">
          <CareerPath career={career} headingRef={detailHeading} />
        </div>
      )}

      <AllCareersChart selectedId={careerId} onChoose={(id) => choose(id, { moveFocus: true })} />

      <SourceList />
    </div>
  );
}

/* ------------------------------------------------------------------ picker */

function CareerPicker({ selectedId, onChoose }: { selectedId: string; onChoose: (id: string) => void }) {
  return (
    <section aria-labelledby="pick-heading">
      <h2 id="pick-heading" className="font-display text-3xl font-bold">
        Pick a career
      </h2>
      <div className="mt-4 flex flex-col gap-5">
        {families.map((family) => {
          const members = careers.filter((c) => c.family === family.id);
          if (members.length === 0) return null;
          return (
            <div key={family.id} role="group" aria-labelledby={`family-${family.id}`}>
              <h3
                id={`family-${family.id}`}
                className="text-sm font-extrabold tracking-wide text-ink/80 uppercase"
              >
                {family.name}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2" role="list">
                {members.map((c) => {
                  const selected = c.id === selectedId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChoose(c.id)}
                        className={
                          "min-h-11 rounded-full border-2 px-4 py-2 text-base font-bold motion-safe:transition-colors " +
                          (selected
                            ? "border-brand-red-dark bg-brand-red-dark text-cream"
                            : "border-ink/15 bg-white text-ink hover:border-brand-red-dark hover:text-brand-red-dark")
                        }
                      >
                        {shortLabel(c)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- one career */

function CareerPath({
  career,
  headingRef,
  compact = false,
}: {
  career: Career;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Side by side with another career, so the facts sit two to a row. */
  compact?: boolean;
}) {
  const headingId = `career-${career.id}`;
  return (
    <article aria-labelledby={headingId} className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <p className="text-sm font-extrabold tracking-wide text-ink/80 uppercase">
        {families.find((f) => f.id === career.family)?.name}
      </p>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 scroll-mt-6 font-display text-4xl leading-tight font-bold text-brand-red-dark focus:outline-none"
      >
        {career.name}
      </h2>
      {career.alsoCalled && <p className="mt-1 text-ink/80">Also called {career.alsoCalled}</p>}
      <p className="mt-3 text-lg leading-relaxed">
        {career.about}
        <Refs ids={career.aboutSources} />
      </p>
      {career.note && (
        <p className="mt-3 rounded-2xl border-l-4 border-brand-yellow bg-cream px-4 py-3 leading-relaxed">
          {career.note.text}
          <Refs ids={career.note.sources} />
        </p>
      )}

      <dl className={`mt-6 grid grid-cols-2 gap-3 ${compact ? "" : "sm:grid-cols-4"}`}>
        <Fact label="After high school">{formatTotal(career)}</Fact>
        <Fact label="Credential">{career.credential}</Fact>
        {career.pay && (
          <Fact label={`Median pay (${career.pay.year})`}>
            {career.pay.atLeast ? "At least " : ""}
            {formatDollars(career.pay.median)}
            <Refs ids={career.pay.sources} />
            {career.pay.occupation && (
              <span className="block text-sm font-normal text-ink/80">for {career.pay.occupation}</span>
            )}
          </Fact>
        )}
        {career.outlook && (
          <Fact label={`Job growth, ${career.outlook.period}`}>
            {career.outlook.percent > 0 ? "+" : ""}
            {career.outlook.percent}%
            <Refs ids={career.outlook.sources} />
            {(career.outlook.label || career.outlook.occupation) && (
              <span className="block text-sm font-normal text-ink/80">
                {[
                  career.outlook.label?.toLowerCase(),
                  career.outlook.occupation && `for ${career.outlook.occupation}`,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}
          </Fact>
        )}
      </dl>

      <YearsBar career={career} className="mt-6" />
      <p className="mt-2 text-sm text-ink/80">
        Counts the usual time if each step follows the last. Gap years, part-time study and optional steps add
        more.
      </p>

      <h3 className="mt-8 font-display text-2xl font-bold">The road, step by step</h3>
      <ol className="mt-4" role="list">
        {career.steps.map((step, i) => (
          <StepItem key={i} step={step} last={i === career.steps.length - 1} />
        ))}
      </ol>
    </article>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-cream p-3">
      <dt className="text-xs font-extrabold tracking-wide text-ink/80 uppercase">{label}</dt>
      <dd className="mt-1 text-lg leading-snug font-extrabold">{children}</dd>
    </div>
  );
}

const KIND_LABEL: Record<StepKind, string> = {
  school: "School",
  training: "Clinical training",
  exam: "Exam or certification",
  license: "License",
  milestone: "Milestone",
};

function StepItem({ step, last }: { step: Step; last: boolean }) {
  return (
    <li className="relative flex gap-4 pb-6">
      {!last && (
        <span aria-hidden="true" className="absolute top-11 bottom-0 left-[1.3rem] w-0.5 bg-ink/15" />
      )}
      <KindMarker kind={step.kind} optional={step.optional} />
      <div className="min-w-0 flex-1 pt-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-extrabold tracking-wide text-ink/80 uppercase">
          <span>{KIND_LABEL[step.kind]}</span>
          {step.optional && (
            <span className="rounded-full border border-ink/40 px-2 py-0.5 text-xs normal-case">
              optional
            </span>
          )}
        </p>
        <h4 className="mt-1 text-lg leading-snug font-extrabold">
          {step.title}
          {step.years && (
            <span className="ml-2 inline-block rounded-full bg-brand-yellow px-2.5 py-0.5 align-middle text-sm font-bold whitespace-nowrap">
              {step.lengthLabel ?? `${formatYears(step.years)} ${yearsWord(step.years)}`}
            </span>
          )}
        </h4>
        <p className="mt-1 leading-relaxed">
          {step.detail}
          <Refs ids={step.sources} />
        </p>
        {step.varies && (
          <details className="group mt-2 rounded-2xl bg-cream px-4 py-2">
            <summary className="cursor-pointer py-1 font-bold text-brand-red-dark">Paths vary</summary>
            <p className="pb-2 leading-relaxed">{step.varies}</p>
          </details>
        )}
      </div>
    </li>
  );
}

const MARKER_STYLE: Record<StepKind, string> = {
  school: "bg-ink text-cream",
  training: "bg-brand-red-dark text-cream",
  exam: "bg-brand-yellow text-ink",
  license: "bg-white text-brand-red-dark ring-2 ring-inset ring-brand-red-dark",
  milestone: "bg-white text-ink ring-2 ring-inset ring-ink/40",
};

function KindMarker({ kind, optional }: { kind: StepKind; optional?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full " +
        MARKER_STYLE[kind] +
        (optional ? " opacity-70" : "")
      }
    >
      <KindIcon kind={kind} />
    </span>
  );
}

function KindIcon({ kind }: { kind: StepKind }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "school": // graduation cap
      return (
        <svg {...common}>
          <path d="M2 9l10-5 10 5-10 5z" />
          <path d="M6 11v5c3 2 9 2 12 0v-5" />
          <path d="M22 9v6" />
        </svg>
      );
    case "training": // stethoscope
      return (
        <svg {...common}>
          <path d="M5 3v6a5 5 0 0 0 10 0V3" />
          <path d="M10 14v2a5 5 0 0 0 10 0v-2" />
          <circle cx="20" cy="11" r="2" />
        </svg>
      );
    case "exam": // checked sheet
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "license": // badge
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="5" />
          <path d="M9 13.5L7.5 21l4.5-2.5 4.5 2.5L15 13.5" />
        </svg>
      );
    case "milestone": // flag
      return (
        <svg {...common}>
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------- bars */

// The longest road on the page sets the scale, so every bar is drawn to the same ruler.
const SCALE_YEARS = Math.max(...careers.map((c) => totalYears(c)[1]));

const SEGMENT_STYLE: Record<"school" | "training", string> = {
  school: "bg-ink",
  training: "bg-brand-red-dark",
};

function YearsBar({ career, className = "" }: { career: Career; className?: string }) {
  const steps = timedSteps(career);
  return (
    <figure className={className}>
      <figcaption className="sr-only">
        {career.name} timeline in years: {steps.map((s) => `${s.title}, ${stepLength(s)}`).join("; ")}.
      </figcaption>
      <div aria-hidden="true">
        <div className="flex h-9 w-full overflow-hidden rounded-full bg-ink/10">
          {steps.map((s, i) => {
            const [min, max] = s.years!;
            const tone = s.kind === "training" ? "training" : "school";
            return (
              <div key={i} className="flex h-full" style={{ width: `${(max / SCALE_YEARS) * 100}%` }}>
                <div
                  className={`h-full border-r-2 border-white ${SEGMENT_STYLE[tone]}`}
                  style={{ width: `${(min / max) * 100}%` }}
                  title={`${s.title}: ${stepLength(s)}`}
                />
                {max > min && (
                  <div
                    className={`h-full border-r-2 border-white opacity-45 ${SEGMENT_STYLE[tone]} bar-stripes`}
                    style={{ width: `${((max - min) / max) * 100}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <YearTicks />
      </div>
    </figure>
  );
}

function YearTicks() {
  const ticks: number[] = [];
  for (let y = 0; y <= SCALE_YEARS; y += 2) ticks.push(y);
  return (
    <div className="relative mt-1 h-5 text-xs font-bold text-ink/80">
      {ticks.map((y) => (
        <span
          key={y}
          className="absolute -translate-x-1/2 first:translate-x-0"
          style={{ left: `${(y / SCALE_YEARS) * 100}%` }}
        >
          {y}
        </span>
      ))}
    </div>
  );
}

function BarLegend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm" role="list" aria-label="Bar colors">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-3 w-6 rounded-sm bg-ink" /> School
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-3 w-6 rounded-sm bg-brand-red-dark" /> Clinical
        training
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="bar-stripes inline-block h-3 w-6 rounded-sm bg-ink opacity-45" />{" "}
        Can take longer
      </li>
    </ul>
  );
}

function CompareBars({ a, b }: { a: Career; b: Career }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <h2 className="font-display text-3xl font-bold">How long each road takes</h2>
      <p className="mt-1 text-ink/80">Years after high school, if each step follows the last.</p>
      {[a, b].map((c) => {
        return (
          <div key={c.id} className="mt-5">
            <p className="flex justify-between gap-3 font-bold">
              <span>{c.name}</span>
              <span className="whitespace-nowrap">{formatTotal(c)}</span>
            </p>
            <YearsBar career={c} className="mt-1" />
          </div>
        );
      })}
      <BarLegend />
    </div>
  );
}

function AllCareersChart({ selectedId, onChoose }: { selectedId: string; onChoose: (id: string) => void }) {
  const headingId = useId();
  const sorted = [...careers].sort((x, y) => {
    const [xMin, xMax] = totalYears(x);
    const [yMin, yMax] = totalYears(y);
    return xMin - yMin || xMax - yMax || x.name.localeCompare(y.name);
  });
  return (
    <section aria-labelledby={headingId} className="mt-12 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <h2 id={headingId} className="font-display text-3xl font-bold">
        Every career at a glance
      </h2>
      <p className="mt-1 text-ink/80">Years after high school, shortest first. Choose one to see its road.</p>
      <BarLegend />
      <ul className="mt-5 flex flex-col gap-1" role="list">
        {sorted.map((c) => {
          const selected = c.id === selectedId;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onChoose(c.id)}
                className={
                  "grid w-full grid-cols-1 items-center gap-1 rounded-2xl px-3 py-2 text-left sm:grid-cols-[13rem_1fr_4.5rem] sm:gap-3 motion-safe:transition-colors " +
                  (selected ? "bg-brand-yellow" : "hover:bg-cream")
                }
              >
                <span className="font-bold">
                  {c.name}
                  <span className="sr-only">, {describeTotal(c)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <YearsBarMini career={c} />
                  <span aria-hidden="true" className="text-sm font-bold whitespace-nowrap sm:hidden">
                    {formatTotalShort(c)}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="hidden text-right text-sm font-bold whitespace-nowrap sm:block"
                >
                  {formatTotalShort(c)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function YearsBarMini({ career }: { career: Career }) {
  const steps = timedSteps(career);
  return (
    <span aria-hidden="true" className="flex h-4 flex-1 overflow-hidden rounded-full bg-ink/10">
      {steps.map((s, i) => {
        const [min, max] = s.years!;
        const tone = s.kind === "training" ? "training" : "school";
        return (
          <span key={i} className="flex h-full" style={{ width: `${(max / SCALE_YEARS) * 100}%` }}>
            <span
              className={`h-full border-r border-white ${SEGMENT_STYLE[tone]}`}
              style={{ width: `${(min / max) * 100}%` }}
            />
            {max > min && (
              <span
                className={`bar-stripes h-full border-r border-white opacity-45 ${SEGMENT_STYLE[tone]}`}
                style={{ width: `${((max - min) / max) * 100}%` }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

/* ---------------------------------------------------------------- sources */

function Refs({ ids }: { ids: Cited }) {
  return (
    <sup className="ml-0.5 text-xs font-bold whitespace-nowrap">
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ","}
          <a
            href={`#source-${sourceNumber[id]}`}
            className="text-brand-red-dark underline-offset-2 hover:underline"
            aria-label={`Source ${sourceNumber[id]}: ${sources[id].publisher}`}
          >
            {sourceNumber[id]}
          </a>
        </span>
      ))}
    </sup>
  );
}

function SourceList() {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="mt-12">
      <h2 id={headingId} className="font-display text-3xl font-bold">
        Sources
      </h2>
      <p className="mt-2 max-w-3xl leading-relaxed text-ink/80">
        Every fact on this page comes from the organizations that set the rules for each career: accrediting
        bodies, exam boards, professional associations and the US Bureau of Labor Statistics. Requirements
        change and can differ by state and by school, so check with the programs you are interested in.
      </p>
      <ol className="mt-4 flex flex-col gap-2 text-sm leading-relaxed" role="list">
        {Object.entries(sources).map(([id, s]) => (
          <li
            key={id}
            id={`source-${sourceNumber[id as keyof typeof sources]}`}
            className="flex scroll-mt-6 gap-2"
          >
            <span className="w-7 shrink-0 text-right font-bold">
              {sourceNumber[id as keyof typeof sources]}.
            </span>
            <span className="min-w-0">
              {s.publisher}.{" "}
              <a
                href={s.url}
                className="break-words text-brand-red-dark underline underline-offset-2 hover:text-ink"
              >
                {s.title}
              </a>
              . Read {formatDate(s.accessed)}.
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- helpers */

function shortLabel(c: Career): string {
  return c.family === "physician" ? c.name.replace(/ physician$/, "") : c.name;
}

function stepLength(s: Step): string {
  return s.lengthLabel ?? (s.years ? `${formatYears(s.years)} ${yearsWord(s.years)}` : "");
}

function describeTotal(c: Career): string {
  return `${formatTotal(c)
    .replace(/^About /, "about ")
    .replace(/^Less/, "less")} after high school`;
}

function formatDollars(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
