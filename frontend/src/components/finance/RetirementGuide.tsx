// The retirement accounts guide for the clinician finance section. It needs no browser code, so
// the page renders it as plain HTML. Limits come from data/finance/retirement.ts; each fact's
// source is listed at the foot of the guide.

import type { ReactNode } from "react";
import { LIMITS } from "../../data/finance/retirement";
import { EducationalNote, More, SourceList, money, panel } from "./ui";

const range = ([a, b]: [number, number]) => `${money(a)} to ${money(b)}`;

export default function RetirementGuide() {
  const [now, next] = LIMITS;
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16">
      <div className={`grid grid-cols-[minmax(0,1fr)] gap-7 ${panel}`}>
        <EducationalNote />

        <section className="grid gap-3" aria-labelledby="ret-accounts">
          <h2 id="ret-accounts" className="font-display text-3xl font-semibold">
            The accounts doctors usually have
          </h2>
          <div className="grid gap-3">
            <Account title="403(b) or 401(k)">
              <p>
                The main workplace plan. Hospitals and universities usually
                offer a 403(b); private practices and companies a 401(k). They
                work the same way: money comes straight out of your paycheck,
                and you can usually choose pretax (traditional) or Roth.
              </p>
              <p>
                In {now.year} you can put in up to{" "}
                <strong>{money(now.deferral)}</strong> of your own pay (
                {money(next.deferral)} in {next.year}). With your employer’s
                money, the total can reach {money(now.totalAdditions)}.
              </p>
            </Account>
            <Account title="Employer match">
              <p>
                Many employers add money when you contribute, such as 50 cents
                for each dollar up to 6% of pay. That’s an instant return, so
                most people contribute at least enough to get all of it.
              </p>
              <p>
                Ask about vesting: employer money can take a few years to become
                fully yours, which matters if you leave after residency or a
                short first job.
              </p>
            </Account>
            <Account title="457(b)">
              <p>
                A second plan that many hospitals, universities and governments
                offer. It has its{" "}
                <strong>own {money(now.deferral)} limit</strong>, on top of the
                403(b), so you can save twice as much before tax. Which kind of
                457(b) it is matters a lot:
              </p>
              <ul className="grid list-disc gap-1.5 pl-5">
                <li>
                  <strong>Governmental 457(b)</strong> (state or public
                  employers, such as a state university hospital): the money is
                  held for you. After you leave the job, withdrawals have no 10%
                  early withdrawal tax at any age, and it can be rolled into an
                  IRA or another plan.
                </li>
                <li>
                  <strong>Non-governmental 457(b)</strong> (private nonprofit
                  hospitals): the money stays the employer’s property until it’s
                  paid to you, and the employer’s creditors could claim it if
                  the employer went bankrupt. It’s taxed in the year it’s made
                  available to you. Read the plan’s payout rules before you
                  join, because they decide when and how you get the money after
                  you leave.
                </li>
              </ul>
            </Account>
            <Account title="Traditional and Roth IRAs">
              <p>
                Accounts you open yourself at a brokerage. In {now.year} you can
                put in {money(now.ira)} ({money(now.ira + now.iraCatchUp50)} at
                50 or older). A Roth IRA grows tax-free, but you can’t
                contribute directly once income is too high: the limit phases
                out at a modified AGI of {range(now.rothPhaseOut.single)} for
                single filers and {range(now.rothPhaseOut.married)} for married
                couples filing jointly.
              </p>
              <p>
                A traditional IRA contribution is tax-deductible only at lower
                incomes when you have a workplace plan (
                {range(now.iraDeductionPhaseOut.single)} single in {now.year}).
              </p>
            </Account>
            <Account title="The “backdoor” Roth IRA">
              <p>
                Common among attendings whose income is over the Roth limit. You
                put after-tax money in a traditional IRA without deducting it,
                then convert it to a Roth IRA. You report it on Form 8606.
              </p>
              <p>
                The catch is the <strong>pro-rata rule</strong>: if you have any
                other pretax money in traditional, SEP or SIMPLE IRAs on
                December 31 of the year you convert, part of the conversion is
                taxed. Some people roll old pretax IRA money into their
                workplace plan first, if the plan accepts it.
              </p>
            </Account>
            <Account title="Health savings account (HSA)">
              <p>
                Only with a high-deductible health plan. Money goes in before
                tax (through payroll it also skips Social Security and Medicare
                tax), grows tax-free, and comes out tax-free for medical costs.
                Unused money rolls over every year and the account is yours if
                you change jobs.
              </p>
              <p>
                Taking money out for anything else costs income tax plus a 20%
                penalty, but after 65 the penalty goes away. That’s why some
                people use an HSA as an extra retirement account.
              </p>
            </Account>
          </div>
        </section>

        <section className="grid gap-3" aria-labelledby="ret-roth">
          <h2 id="ret-roth" className="font-display text-3xl font-semibold">
            Roth or traditional?
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid content-start gap-1.5 rounded-[22px] bg-cream-light p-4 leading-snug">
              <h3 className="font-display text-xl font-semibold">
                Traditional (pretax)
              </h3>
              <p>
                Lowers your income tax this year. You pay tax when you take the
                money out in retirement.
              </p>
              <p className="text-ink/80">
                Tends to fit years when your tax rate is high, such as as an
                attending.
              </p>
            </div>
            <div className="grid content-start gap-1.5 rounded-[22px] bg-cream-light p-4 leading-snug">
              <h3 className="font-display text-xl font-semibold">
                Roth (after tax)
              </h3>
              <p>
                No tax break now. The money and its growth come out tax-free in
                retirement, if you follow the rules.
              </p>
              <p className="text-ink/80">
                Tends to fit years when your tax rate is low, such as residency
                or a fellowship.
              </p>
            </div>
          </div>
          <p className="leading-snug">
            Nobody knows future tax rates, so some people split their savings
            between the two.
          </p>
          <p className="leading-snug">
            <strong>New from {now.year}:</strong> if your wages from an employer
            were over {money(now.rothCatchUpWageThreshold)} the year before, any
            catch-up contributions you make at 50 or older to that employer’s
            plan have to go in as Roth.
          </p>
        </section>

        <section className="grid gap-3" aria-labelledby="ret-limits">
          <h2 id="ret-limits" className="font-display text-3xl font-semibold">
            Contribution limits
          </h2>
          <div className="overflow-x-auto rounded-[18px] border-[1.5px] border-line">
            <table className="w-full min-w-[30rem] border-collapse text-left leading-snug">
              <caption className="sr-only">
                Retirement and HSA contribution limits by year
              </caption>
              <thead className="bg-cream-light">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5 font-extrabold">
                    Limit
                  </th>
                  {LIMITS.map((l) => (
                    <th
                      key={l.year}
                      scope="col"
                      className="px-3.5 py-2.5 text-right font-extrabold tabular-nums"
                    >
                      {l.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <LimitRow
                  label="403(b), 401(k), each 457(b): your own contributions"
                  values={LIMITS.map((l) => money(l.deferral))}
                />
                <LimitRow
                  label="Catch-up at 50 or older"
                  values={LIMITS.map((l) => `+${money(l.catchUp50)}`)}
                />
                <LimitRow
                  label="Catch-up at ages 60 to 63 (instead)"
                  values={LIMITS.map((l) => `+${money(l.catchUp60to63)}`)}
                />
                <LimitRow
                  label="You and your employer together, one plan"
                  values={LIMITS.map((l) => money(l.totalAdditions))}
                />
                <LimitRow
                  label="IRA (traditional and Roth combined)"
                  values={LIMITS.map((l) => money(l.ira))}
                />
                <LimitRow
                  label="IRA catch-up at 50 or older"
                  values={LIMITS.map((l) => `+${money(l.iraCatchUp50)}`)}
                />
                <LimitRow
                  label="Roth IRA phase-out, single"
                  values={LIMITS.map((l) => range(l.rothPhaseOut.single))}
                />
                <LimitRow
                  label="Roth IRA phase-out, married filing jointly"
                  values={LIMITS.map((l) => range(l.rothPhaseOut.married))}
                />
                <LimitRow
                  label="HSA, self-only coverage"
                  values={LIMITS.map((l) => money(l.hsa.self))}
                />
                <LimitRow
                  label="HSA, family coverage"
                  values={LIMITS.map((l) => money(l.hsa.family))}
                />
                <LimitRow
                  label="HSA catch-up at 55 or older"
                  values={LIMITS.map((l) => `+${money(l.hsaCatchUp55)}`)}
                />
              </tbody>
            </table>
          </div>
          <p className="text-[0.95rem] leading-snug text-ink/80">
            From the IRS’s yearly announcements. The table scrolls sideways on a
            small screen.
          </p>
        </section>

        <More summary="Withdrawing before retirement">
          <ul className="grid list-disc gap-2 pl-5 leading-snug">
            <li>
              Money taken out of a 403(b), 401(k) or IRA before age 59½ usually
              owes a 10% additional tax on top of income tax. The IRS lists
              exceptions, such as leaving your job in or after the year you turn
              55 (for workplace plans).
            </li>
            <li>
              A governmental 457(b) has no 10% additional tax, except on money
              rolled in from other plan types.
            </li>
            <li>
              When you change jobs, you can usually leave the money, roll it to
              your new plan, or roll it to an IRA.
            </li>
          </ul>
        </More>

        <More summary="A common order of saving (not a rule)">
          <ol className="grid list-decimal gap-2 pl-5 leading-snug">
            <li>
              Enough in the 403(b) or 401(k) to get the full employer match.
            </li>
            <li>Pay off high-interest debt, such as credit card balances.</li>
            <li>An HSA, if you have a high-deductible health plan.</li>
            <li>More in the 403(b) or 401(k), up to the limit.</li>
            <li>
              A governmental 457(b), or a non-governmental one after reading its
              rules.
            </li>
            <li>A Roth IRA, or a backdoor Roth IRA at higher incomes.</li>
          </ol>
          <p className="leading-snug text-ink/80">
            Student loan plans, a pension, a spouse’s plan and your goals can
            all change this order. A fee-only financial planner can help you set
            your own.
          </p>
        </More>

        <SourceList
          ids={[
            ...now.cite,
            ...next.cite,
            "irs457Separate",
            "irsNonGov457",
            "irsRolloverChart",
            "irsP5036",
            "irsI8606",
            "irsTc424",
          ]}
        />
      </div>
    </div>
  );
}

function Account({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="grid gap-2 rounded-[22px] bg-cream-light p-4 leading-snug sm:p-5">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {children}
    </article>
  );
}

function LimitRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="px-3.5 py-2.5 font-semibold">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="px-3.5 py-2.5 text-right tabular-nums">
          {v}
        </td>
      ))}
    </tr>
  );
}
