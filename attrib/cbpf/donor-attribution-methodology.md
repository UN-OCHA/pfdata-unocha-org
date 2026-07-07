# Donor Attribution Methodology
## Cascading Contributions Through the Asia-Pacific Fund Structure

---

## 1. Purpose

This document explains how donor contributions are attributed across a multi-level fund structure in which money flows from donors into a regional fund, is transferred down to a sub-regional fund, and is further transferred to country-level funds. Because funds are pooled and fungible at each level, attribution is calculated on a **pro-rata pass-through** basis: each donor's share of a pool travels proportionally with every onward transfer made from that pool.

Attribution is computed at two levels:

1. **Global level** — each donor's share of all contributions across the entire structure.
2. **Fund level** — each donor's effective share of the money received by any individual fund (e.g. Fiji or Vanuatu), tracing contributions through every intermediate transfer.

---

## 2. Fund Structure

```
 Donors P1, P2, P3, P4
        │
        ▼
 ┌─────────────────────┐
 │  Asia-Pacific Fund  │  (Regional)
 │        (AP)         │
 └─────────┬───────────┘
           │  transfer
           ▼
 ┌─────────────────────┐
 │ Sub-regional Pacific│ ◄──── Donor D2 (direct contribution)
 │      Fund (SP)      │
 └───┬─────────────┬───┘
     │ transfer    │ transfer
     ▼             ▼
 ┌────────┐   ┌──────────┐
 │  Fiji  │   │ Vanuatu  │   (Country funds)
 └────────┘   └──────────┘
```

Key features of the structure:

- Donors contribute to the **Asia-Pacific (AP) regional fund**.
- AP transfers a portion of its pool to the **Sub-regional Pacific (SP) fund**.
- Donors may **also contribute directly** to SP (and in principle to any level).
- SP transfers onward to the **country funds** (Fiji, Vanuatu).

---

## 3. Attribution Principles

1. **Pooling and fungibility.** Once money enters a fund it is pooled. No donor's money is earmarked within a pool, so every onward transfer carries each donor's share in proportion to their share of that pool.
2. **Pro-rata pass-through.** When a fund transfers an amount onward, each donor is attributed a slice of that transfer equal to their attributed share of the sending fund's pool.
3. **Direct contributions enter at their entry point.** A donor contributing directly to SP is attributed at SP (and downstream) but has no attribution at AP.
4. **Conservation.** At every fund, donor attribution percentages sum to 100%, and attributed amounts sum to the fund's total inflows.

---

## 4. Formulas

### 4.1 Global-level attribution

For donor *d*:

```
Global Attribution(d) = Total contributed by d (at all entry points)
                        ─────────────────────────────────────────────
                        Total contributed by all donors (all entry points)
```

Only *original contributions* count in the denominator — internal transfers between funds are not double-counted.

### 4.2 Fund-level attribution

Attribution cascades down the chain of transfers. For a fund **G** receiving money:

```
Attributed amount of d in G =
      Direct contribution of d to G
    + Σ over each transfer T from a fund F into G:
          ( Attributed amount of d in F ÷ Total inflows of F ) × T
```

and

```
Fund-level Attribution %(d, G) = Attributed amount of d in G
                                 ─────────────────────────────
                                 Total inflows of G
```

Equivalently, for a donor whose money reaches a country fund through a single path, the attributed amount is a simple **chain of fractions**:

```
Attributed amount = Contribution × (transfer₁ ÷ pool₁) × (transfer₂ ÷ pool₂) × …
```

i.e. the donor's contribution multiplied by the fraction transferred onward at each hop.

---

## 5. Worked Example

Illustrative figures (based on the whiteboard example — substitute actual amounts as needed):

| Flow | Amount |
|---|---|
| P1 → AP | 1 M |
| P2 → AP | 1 M |
| P3 → AP | 1 M |
| P4 → AP | 2 M |
| **AP pool** | **5 M** |
| AP → SP transfer | 2 M |
| D2 → SP (direct) | 1 M |
| **SP pool** | **3 M** |
| SP → Fiji | 1 M |
| SP → Vanuatu | 1 M |

### 5.1 Global attribution

Total original contributions = 5 M (into AP) + 1 M (direct into SP) = **6 M**.

| Donor | Contribution | Global attribution |
|---|---|---|
| P1 | 1 M | 1/6 ≈ 16.7 % |
| P2 | 1 M | 1/6 ≈ 16.7 % |
| P3 | 1 M | 1/6 ≈ 16.7 % |
| P4 | 2 M | 2/6 ≈ 33.3 % |
| D2 | 1 M | 1/6 ≈ 16.7 % |
| **Total** | **6 M** | **100 %** |

### 5.2 Attribution at the Sub-regional Pacific fund (SP)

SP inflows = 2 M (from AP) + 1 M (direct from D2) = 3 M.
The 2 M transfer from AP carries each AP donor's share of the AP pool (their contribution ÷ 5 M):

| Donor | Attributed amount in SP | SP attribution |
|---|---|---|
| P1 | 1/5 × 2 M = 0.40 M | 13.3 % |
| P2 | 1/5 × 2 M = 0.40 M | 13.3 % |
| P3 | 1/5 × 2 M = 0.40 M | 13.3 % |
| P4 | 2/5 × 2 M = 0.80 M | 26.7 % |
| D2 | 1.00 M (direct) | 33.3 % |
| **Total** | **3.00 M** | **100 %** |

### 5.3 Attribution at the Fiji fund

Fiji receives 1 M from SP, which is **1/3 of the SP pool**. Each donor's attributed amount in Fiji is therefore 1/3 of their attributed amount in SP — a chain of fractions, e.g. for P1:

```
P1 in Fiji = 1 M × (2/5) × (1/3) ≈ 0.133 M
             └─┬─┘  └─┬─┘   └─┬─┘
        contribution  AP→SP   SP→Fiji
                     fraction fraction
```

| Donor | Attributed amount in Fiji | Fiji attribution |
|---|---|---|
| P1 | 0.133 M | 13.3 % |
| P2 | 0.133 M | 13.3 % |
| P3 | 0.133 M | 13.3 % |
| P4 | 0.267 M | 26.7 % |
| D2 | 0.333 M | 33.3 % |
| **Total** | **1.000 M** | **100 %** |

Vanuatu also receives 1 M from SP, so its attribution table is identical. Note that the fund-level *percentages* at Fiji equal those at SP whenever Fiji's only inflow is a single transfer from SP — the percentages simply pass through; only the amounts scale down.

---

## 6. Properties and Consistency Checks

- **Sums to 100 %.** At every fund, attribution percentages across donors sum to exactly 100 %.
- **Amount conservation.** Attributed amounts at a fund sum to that fund's total inflows.
- **Global reconciliation.** For each donor, the attributed amounts sitting across all funds (including balances retained at AP and SP) sum back to the donor's original contribution.
- **No double counting.** Internal transfers never inflate the global denominator; only original donor contributions do.

---

## 7. Reporting and Templating

The same computation applies at every level, so a single template can be used for monitoring and donor reporting:

1. **Inputs per fund:** direct contributions by donor, and incoming transfers with the sender's attribution table.
2. **Computation:** apply the fund-level formula (Section 4.2).
3. **Outputs:** an attribution table (donor, attributed amount, attribution %) per fund, plus the global table.

Whenever a new transfer is made or a new direct contribution is received, only the receiving fund's table (and its downstream funds) need to be recomputed.

---

## 8. Assumptions and Notes

- Attribution is on a **cash/commitment basis** as recorded; timing differences (e.g. attribution per period vs. cumulative) should be agreed and applied consistently.
- If a fund has expenses or retained balances, transfers are still attributed pro-rata to the pool at the time of transfer.
- Where a donor contributes at multiple levels (e.g. to both AP and SP), their fund-level attribution is the sum of the direct and pass-through components.
