// The bank accounts guide for the clinician finance section: checking, savings, high-yield savings
// and CDs side by side, how their interest is taxed, how deposit insurance works, and a small
// calculator for what interest is worth after tax. Facts come from the IRS, FDIC, NCUA and the
// Federal Reserve (see the source ids next to each section).

import { useId, useState } from "react";
import { FEDERAL } from "../../data/finance/paycheck";
import {
  EducationalNote,
  More,
  SourceList,
  inputClass,
  money,
  moneyCents,
  panel,
  parseMoney,
} from "./ui";

interface Account {
  name: string;
  forWhat: string;
  interest: string;
  access: string;
  watchOut: string;
}

const ACCOUNTS: Account[] = [
  {
    name: "Checking",
    forWhat:
      "Paychecks coming in and everyday spending, bills and your debit card going out.",
    interest: "Usually little or none.",
    access: "Anytime, by card, transfer or check.",
    watchOut:
      "Monthly fees unless you keep a minimum balance or have direct deposit. Keep about a month of bills here and no more.",
  },
  {
    name: "Regular savings",
    forWhat:
      "Short-term savings at the same bank as your checking, so moving money is instant.",
    interest: "Often low at big banks.",
    access:
      "Easy transfers to checking. Some banks still limit withdrawals each month.",
    watchOut: "Money sitting here for years can lose ground to inflation.",
  },
  {
    name: "High-yield savings (HYSA)",
    forWhat:
      "An emergency fund, and money for goals in the next year or two, like a move for residency.",
    interest:
      "Usually much higher than regular savings. The bank can change the rate at any time.",
    access: "Transfers to checking usually take one to three business days.",
    watchOut:
      "Many are at online banks or apps. Check that your money is held at an FDIC-insured bank or NCUA-insured credit union.",
  },
  {
    name: "Certificate of deposit (CD)",
    forWhat:
      "Money you know you won’t need for a set time, from a few months to several years.",
    interest:
      "A fixed rate for the whole term, so you know exactly what you’ll earn.",
    access: "Locked until the CD matures.",
    watchOut:
      "Taking money out early costs a penalty, often several months of interest. Read the penalty before you open one.",
  },
];

const FEDERAL_RATES = [...new Set(FEDERAL.brackets.single.map((b) => b.rate))];

export default function BankAccountsGuide() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-7 ${panel}`}>
        <EducationalNote />

        <section className="grid gap-3" aria-labelledby="bank-compare">
          <h2 id="bank-compare" className="font-display text-3xl font-semibold">
            Four accounts, four jobs
          </h2>
          <p className="leading-snug text-ink/80">
            All four are bank deposits. Each one trades easy access for a better
            interest rate.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {ACCOUNTS.map((a) => (
              <li
                key={a.name}
                className="grid content-start gap-2 rounded-[22px] bg-cream-light p-4"
              >
                <h3 className="font-display text-xl font-semibold">{a.name}</h3>
                <dl className="grid gap-1.5 leading-snug">
                  <Fact term="Best for" value={a.forWhat} />
                  <Fact term="Interest" value={a.interest} />
                  <Fact term="Getting money out" value={a.access} />
                  <Fact term="Watch out" value={a.watchOut} />
                </dl>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3" aria-labelledby="bank-tax">
          <h2 id="bank-tax" className="font-display text-3xl font-semibold">
            How the interest is taxed
          </h2>
          <ul className="grid list-disc gap-2.5 pl-5 leading-snug">
            <li>
              <strong>The same for all four.</strong> Interest is taxed as
              ordinary income, at the same federal and state rates as your pay.
              There is no special lower rate for savings.
            </li>
            <li>
              <strong>Taxed when it’s credited, not when you spend it.</strong>{" "}
              Interest is taxable in the year it’s credited to an account you
              can withdraw from without penalty, even if you leave it there.
            </li>
            <li>
              <strong>Form 1099-INT.</strong> Your bank sends one if it paid you
              $10 or more in interest. You still have to report all your
              interest, even without a form.
            </li>
            <li>
              <strong>CDs longer than a year.</strong> If the CD pays its
              interest only at the end, you may still owe tax on part of it each
              year (the IRS calls this original issue discount).
            </li>
            <li>
              <strong>Early withdrawal penalties.</strong> You report the full
              interest, and the penalty (box 2 of Form 1099-INT) is subtracted
              on your return, so you aren’t taxed on money you lost.
            </li>
            <li>
              <strong>Treasury bills and bonds are different.</strong> They
              aren’t bank accounts, but their interest is free of state and
              local income tax, which helps in a state like New Mexico.
            </li>
          </ul>
          <InterestCalculator />
        </section>

        <section className="grid gap-3" aria-labelledby="bank-insurance">
          <h2
            id="bank-insurance"
            className="font-display text-3xl font-semibold"
          >
            Is my money safe?
          </h2>
          <ul className="grid list-disc gap-2.5 pl-5 leading-snug">
            <li>
              Banks are insured by the FDIC and credit unions by the NCUA, up to{" "}
              <strong>$250,000</strong> per person, per bank, for each ownership
              category (for example, your own accounts, joint accounts and
              certain retirement accounts are counted separately).
            </li>
            <li>
              Checking, savings, money market deposit accounts and CDs are
              covered. Stocks, bonds, mutual funds, annuities, crypto and
              Treasury securities are not, even if you bought them through your
              bank.
            </li>
            <li>
              Over $250,000 at one bank? Spread it across banks or ownership
              categories.
            </li>
            <li>
              Savings accounts used to be limited to six withdrawals a month by
              federal rule. The Federal Reserve let banks drop that limit in
              2020, but your bank may still keep one.
            </li>
          </ul>
        </section>

        <More summary="A simple setup many people use">
          <ol className="grid list-decimal gap-2 pl-5 leading-snug">
            <li>
              Checking for about a month of bills, with your paycheck deposited
              here.
            </li>
            <li>
              A high-yield savings account for an emergency fund, often three to
              six months of expenses.
            </li>
            <li>
              CDs only for money with a known date, like a down payment next
              year.
            </li>
            <li>
              Money for retirement goes in retirement accounts, not the bank.
            </li>
          </ol>
        </More>

        <SourceList
          ids={[
            "irsTc403",
            "irs1099int",
            "irsP550",
            "fdic",
            "fdicCovered",
            "ncua",
            "fedRegD",
          ]}
        />
      </div>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="inline font-extrabold">{term}: </dt>
      <dd className="inline">{value}</dd>
    </div>
  );
}

/** What a year of interest is worth after federal and state income tax. */
function InterestCalculator() {
  const id = useId();
  const [balance, setBalance] = useState("20,000");
  const [apy, setApy] = useState("4");
  const [federal, setFederal] = useState(0.22);
  const [state, setState] = useState("4.9");

  const b = parseMoney(balance);
  const rate = parseMoney(apy.replace("%", ""));
  const stateRate = state.trim() ? parseMoney(state.replace("%", "")) : 0;
  const valid =
    b >= 0 && rate >= 0 && rate < 50 && stateRate >= 0 && stateRate < 20;

  const interest = valid ? (b * rate) / 100 : 0;
  const fedTax = interest * federal;
  const stateTax = (interest * stateRate) / 100;
  const after = interest - fedTax - stateTax;

  return (
    <div className="grid gap-4 rounded-[22px] border-[1.5px] border-line p-4 sm:p-5">
      <h3 className="font-display text-xl font-semibold">
        What a year of interest is worth after tax
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${id}-bal`}
          label="Amount saved"
          prefix="$"
          value={balance}
          onChange={setBalance}
        />
        <Input
          id={`${id}-apy`}
          label="Interest rate (APY)"
          suffix="%"
          value={apy}
          onChange={setApy}
          hint="Use the rate your bank shows today."
        />
        <div className="grid content-start gap-1.5">
          <label
            htmlFor={`${id}-fed`}
            className="text-[0.95rem] font-extrabold"
          >
            Your federal tax bracket
          </label>
          <select
            id={`${id}-fed`}
            className={inputClass}
            value={federal}
            onChange={(e) => setFederal(Number(e.target.value))}
          >
            {FEDERAL_RATES.map((r) => (
              <option key={r} value={r}>
                {Math.round(r * 100)}%
              </option>
            ))}
          </select>
          <p className="text-sm leading-snug text-ink/80">
            The paycheck tool shows your bracket.
          </p>
        </div>
        <Input
          id={`${id}-state`}
          label="Your state tax rate"
          suffix="%"
          value={state}
          onChange={setState}
          hint="New Mexico’s rates run from 1.5% to 5.9%."
        />
      </div>
      {valid ? (
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Out label="Interest in a year" value={moneyCents(interest)} />
          <Out label="Federal tax" value={`− ${moneyCents(fedTax)}`} />
          <Out label="State tax" value={`− ${moneyCents(stateTax)}`} />
          <Out label="You keep" value={moneyCents(after)} strong />
        </dl>
      ) : (
        <p className="font-bold text-brand-red-dark">
          Enter the amount and rates as numbers, like 20,000 and 4.
        </p>
      )}
      {valid && interest > 0 && (
        <p className="leading-snug text-ink/80">
          That’s an after-tax rate of about{" "}
          <strong className="text-ink">
            {((after / b) * 100).toFixed(2)}%
          </strong>
          . A Treasury bill at the same rate would skip the state tax and keep
          about {money(after + stateTax)}.
        </p>
      )}
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="grid content-start gap-1.5">
      <label htmlFor={id} className="text-[0.95rem] font-extrabold">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-ink/60"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`${inputClass} ${prefix ? "pl-8" : ""} ${suffix ? "pr-9" : ""}`}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-semibold text-ink/60"
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-sm leading-snug text-ink/80">{hint}</p>}
    </div>
  );
}

function Out({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`grid content-start gap-0.5 rounded-[18px] px-3.5 py-3 ${strong ? "bg-cream" : "bg-cream-light"}`}
    >
      <dt className="text-xs font-extrabold tracking-wide text-ink/80 uppercase">
        {label}
      </dt>
      <dd className="font-display text-xl font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  );
}
