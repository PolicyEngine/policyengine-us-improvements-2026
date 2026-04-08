# Repo Notes

## policyengine-us

### State tax and legislative coverage

- The state-tax story is breadth plus depth: tax paths changed in 44 states, local tax paths in 6 jurisdictions, and the contributed reform library expanded sharply for 2026 legislative proposals.

#### 1. Broad 2025 baseline state income tax refresh

- Key PRs included California `#7418`, Wisconsin `#7369`, DC `#7421`, New Jersey `#7125`, Washington `#7374`, New York/NYC `#7143`, Hawaii `#7157`, Michigan `#7121`, Virginia `#7059`, Kentucky `#7098`, Vermont `#7364`, and many others across February 2026.
- This moved many states from stale projections to explicit 2025 law and form values, often with reference and test updates.
- Representative code paths:
  - [policyengine_us/parameters/gov/states/ca/tax/income](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/ca/tax/income)
  - [policyengine_us/parameters/gov/states/wi/tax/income](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/wi/tax/income)
  - [policyengine_us/parameters/gov/states/dc/tax/income](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/dc/tax/income)
  - [policyengine_us/parameters/gov/states/nj/tax/income](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/nj/tax/income)
  - [policyengine_us/parameters/gov/local/ny/nyc/tax/income](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/local/ny/nyc/tax/income)

#### 2. New Jersey tax modeling became materially more complete

- `#7125` added ANCHOR and Stay NJ, `#7452` fixed the Stay NJ formula and Senior Freeze interaction, `#7280` and `#7296` improved same-category loss handling, and a `2026-03-23` change made NJ Social Security eligibility explicit.
- Representative code paths:
  - [nj_staynj.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/nj/tax/income/credits/staynj/nj_staynj.py)
  - [nj_senior_freeze.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/nj/tax/income/credits/staynj/nj_senior_freeze.py)
  - [policyengine_us/parameters/gov/states/nj/tax/income/credits/anchor](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/nj/tax/income/credits/anchor)
  - [policyengine_us/parameters/gov/states/nj/tax/income/credits/staynj](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/nj/tax/income/credits/staynj)

#### 3. Contributed reform coverage expanded sharply

- High-signal additions included South Carolina H.4216 `#7494`, Georgia SB 520 `#7690`, Kentucky HB 13/HB 152 `#7397`, multiple Connecticut proposals `#7432`, `#7467`, `#7478`, Utah HB 210 S2 `#7335`, Rhode Island H7317 rewrite `#7804`, and several New York proposals.
- Representative code paths:
  - [policyengine_us/parameters/gov/contrib/states/sc/h4216](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/sc/h4216)
  - [sc_h4216.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/reforms/states/sc/h4216/sc_h4216.py)
  - [policyengine_us/parameters/gov/contrib/states/ga/sb520](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/ga/sb520)
  - [ga_sb520_reform.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/reforms/states/ga/sb520/ga_sb520_reform.py)
  - [policyengine_us/parameters/gov/contrib/states/ct](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/ct)
  - [ri_high_earner_tax_reform.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/reforms/states/ri/high_earner_tax/ri_high_earner_tax_reform.py)

#### 4. Connecticut became especially deep on reform coverage

- The repo now includes a refundable CTC, 2026 rebate, expanded property-tax credit, renters credit, and SB 100 coverage for Connecticut.
- Representative code paths:
  - [policyengine_us/parameters/gov/contrib/states/ct/refundable_ctc](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/ct/refundable_ctc)
  - [policyengine_us/parameters/gov/contrib/states/ct/tax_rebate_2026](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/ct/tax_rebate_2026)
  - [policyengine_us/parameters/gov/contrib/states/ct/hb5009](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/contrib/states/ct/hb5009)
  - [ct_hb5009.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/reforms/states/ct/hb5009/ct_hb5009.py)

#### 5. Local and sub-state tax coverage improved

- Important additions included Maryland county income tax rates `#6439`, Multnomah County Preschool for All tax `#7443`, and updated New York City coverage in `#7143`.
- Representative code paths:
  - [policyengine_us/parameters/gov/local/md](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/local/md)
  - [md_local_income_tax_before_credits.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/md/tax/income/local/md_local_income_tax_before_credits.py)
  - [policyengine_us/parameters/gov/local/or/multnomah_county/tax/income/pfa](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/local/or/multnomah_county/tax/income/pfa)
  - [or_multnomah_pfa_tax.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/local/or/multnomah_county/tax/income/or_multnomah_pfa_tax.py)

#### 6. Formula fidelity improved in several important states

- High-signal examples included the Washington WFTC minimum phaseout fix `#7450`, DC EITC match to 100% `#7361`, Wisconsin retirement exclusion `#7426`, and Missouri pension/Social Security deduction fixes `#7302`.
- Representative code paths:
  - [wa_working_families_tax_credit.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/wa/tax/income/credits/wa_working_families_tax_credit.py)
  - [match.yaml](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/dc/tax/income/credits/eitc/with_children/match.yaml)
  - [policyengine_us/parameters/gov/states/wi/tax/income/subtractions/retirement_income/exclusion](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/wi/tax/income/subtractions/retirement_income/exclusion)
  - [mo_pension_and_ss_or_ssd_deduction_section_c.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/mo/tax/income/deductions/mo_pension_and_ss_or_ssd_deduction_section_c.py)

#### 7. Tax-base logic deepened beyond credits and bracket updates

- The repo added or refined coverage for Colorado AMT `#6862`, Washington capital gains tax `#7374`, Georgia rate resets `#7698`, and Rhode Island high-earner surtax rewrites `#7804`.
- Representative code paths:
  - [co_amt.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/co/tax/income/amt/co_amt.py)
  - [policyengine_us/parameters/gov/states/wa/tax/income/capital_gains/rate](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/wa/tax/income/capital_gains/rate)
  - [ri_high_earner_tax_reform.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/reforms/states/ri/high_earner_tax/ri_high_earner_tax_reform.py)
  - [policyengine_us/parameters/gov/states/ga/tax/income/main](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/ga/tax/income/main)

#### 8. Territorial tax coverage widened

- `#5922` added Puerto Rico nonrefundable CTC modeling.
- Representative code paths:
  - [pr_ctc.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/territories/pr/tax/income/credits/ctc/pr_ctc.py)
  - [pr_ctc_phase_out.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/territories/pr/tax/income/credits/ctc/pr_ctc_phase_out.py)

### Federal programs, bug fixes, and tooling

#### 1. TANF became a national program layer instead of a patchwork

- `#7401` on `2026-02-18` wired all 51 state TANF programs into the top-level `tanf` variable, added explicit take-up handling, and removed reliance on `tanf_reported` as a shortcut.
- `#7434` and `#7435` on `2026-02-18` then capped negative-income inflation across state TANF benefit formulas, with March follow-ons backfilling historical TANF data and federal income-source rules.
- Representative code paths:
  - [tanf.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/hhs/tanf/cash/tanf.py)
  - [takes_up_tanf_if_eligible.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/hhs/tanf/cash/takes_up_tanf_if_eligible.py)
  - [tanf_negative_income_cap.yaml](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/tests/policy/baseline/gov/hhs/tanf/cash/tanf_negative_income_cap.yaml)
  - [policyengine_us/parameters/gov/states/al/dhs/tanf](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/al/dhs/tanf)
  - [policyengine_us/parameters/gov/states/ny/otda/tanf](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/states/ny/otda/tanf)

#### 2. Child-care subsidy modeling was refactored around shared CCDF infrastructure

- `#7765` on `2026-03-13` added a federal `child_care_subsidies` aggregator and shared CCDF infrastructure, which state implementations could then reuse.
- `#7739` and `#7757` on `2026-03-18` layered Rhode Island and Maine CCAP implementations on top of that foundation.
- Representative code paths:
  - [child_care_subsidies.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/hhs/ccdf/child_care_subsidies.py)
  - [child_care_subsidy_programs.yaml](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/hhs/ccdf/child_care_subsidy_programs.yaml)
  - [me_child_care_subsidies.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/me/dhhs/me_child_care_subsidies.py)
  - [ri_child_care_subsidies.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/ri/dhs/ccap/ri_child_care_subsidies.py)

#### 3. ACA, Medicaid, CHIP, and SNAP eligibility got materially more realistic

- `#7067` fixed ACA required contribution percentages below `133%` FPL.
- `#6987`, `#7158`, `#6995`, and `#7102` expanded or corrected immigrant-focused ACA and Medicaid logic, including California Medi-Cal and Washington Apple Health.
- `#7315` added SNAP immigration-status eligibility, `#7453` updated SNAP ABAWD rules for HR1, and January-March work also backfilled CHIP pregnant income limits and restored `three_digit_zip_code` to fix an ACA PTC regression.
- Representative code paths:
  - [aca_required_contribution_percentage.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/aca/ptc/aca_required_contribution_percentage.py)
  - [is_ca_medicaid_immigration_status_eligible.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/ca/chhs/is_ca_medicaid_immigration_status_eligible.py)
  - [policyengine_us/parameters/gov/aca/slcsp](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/gov/aca/slcsp)
  - [is_snap_immigration_status_eligible.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/usda/snap/eligibility/is_snap_immigration_status_eligible.py)
  - [policyengine_us/variables/gov/usda/school_meals](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/usda/school_meals)
  - [wa_apple_health_expansion_eligible.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/states/wa/hca/apple_health/expansion/eligibility/wa_apple_health_expansion_eligible.py)
  - [three_digit_zip_code.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/household/demographic/geographic/zip_code/three_digit_zip_code.py)

#### 4. Federal reform coverage and long-run tax logic both expanded

- `#7110` on `2026-03-19` added reusable streamlined EITC and linear CTC phase-out reforms.
- `#7457` on `2026-02-23` modeled SECURE 2.0 enhanced 401(k) catch-up contributions, `#7475` fixed ACTC earned-income treatment, and `#7518` added SSN identification requirements to Recovery Rebate Credits.
- April 2026 work extended Social Security wage-base and payroll-cap uprating toward `2100`, making long-run federal projections more credible.
- Representative code paths:
  - [k401_catch_up_limit.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/irs/income/taxable_income/adjusted_gross_income/above_the_line_deductions/retirement/k401_catch_up_limit.py)
  - [student_loan_interest_ald_eligible.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/irs/income/taxable_income/adjusted_gross_income/above_the_line_deductions/student_loan_interest/student_loan_interest_ald_eligible.py)
  - [rrc_adult_count_with_valid_ssn.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/irs/credits/recovery_rebate_credit/rrc_adult_count_with_valid_ssn.py)
  - [uprating_extensions.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/parameters/uprating_extensions.py)
  - [test_uprating_extensions.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/tests/policy/baseline/parameters/test_uprating_extensions.py)

#### 5. Microsimulation inputs got richer and more behaviorally realistic

- `#7329` added liquid-asset inputs for SSI modeling, `#7333` added filing-propensity inputs for `tax_unit_is_filer`, and `#7249` added SLDU/SLDL geography variables.
- These changes matter because they improve both benefits eligibility and tax-filing behavior at the microsimulation layer.
- Representative code paths:
  - [ssi_countable_resources.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/ssa/ssi/eligibility/resources/ssi_countable_resources.py)
  - [spm_unit_cash_assets.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/household/assets/spm_unit_cash_assets.py)
  - [tax_unit_is_filer.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/irs/tax_unit_is_filer.py)
  - [would_file_taxes_voluntarily.py](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/variables/gov/irs/would_file_taxes_voluntarily.py)

#### 6. Reliability and testability improved sharply

- `#7326` moved stochastic randomness out of the country package so take-up and filing behavior could be supplied as data rather than embedded randomness.
- `#7305`, `#7311`, `#7312`, and `#7717` expanded filer and TAXSIM coverage; `#7484`, `#7488`, `#7709`, and `#7715` modernized the toolchain around Python `3.14`, Towncrier, and Ruff.
- Representative code paths:
  - [policyengine_us/tests/policy/contrib/taxsim](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/tests/policy/contrib/taxsim)
  - [tax_unit_is_filer.yaml](/Users/maxghenis/PolicyEngine/policyengine-us/policyengine_us/tests/policy/baseline/gov/irs/tax_unit_is_filer.yaml)
  - [CLAUDE.md](/Users/maxghenis/PolicyEngine/policyengine-us/CLAUDE.md)

## policyengine-us-data

### 1. Calibration architecture was substantially rebuilt

- `#488` on `2026-01-31` made the calibration database a first-class artifact, with richer schema and validation in [policyengine_us_data/db/create_database_tables.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/db/create_database_tables.py) and end-to-end coverage in [test_database_build.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/tests/test_database_build.py).
- `#531` on `2026-02-17` moved the repo toward a census-block-first unified calibration pipeline in [unified_calibration.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/unified_calibration.py) and [unified_matrix_builder.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/unified_matrix_builder.py).
- `#538` on `2026-03-12` improved operability with checkpointing, target config, CLI hyperparameters, and better Modal integration, including [target_config.yaml](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/target_config.yaml), [docs/calibration.md](/Users/maxghenis/PolicyEngine/policyengine-us-data/docs/calibration.md), and [validate_package.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/validate_package.py).

### 2. Geographic fidelity improved materially

- `#484` on `2026-01-26` added census-block assignment with derived tract, county, CBSA, SLDU, SLDL, place, PUMA, VTD, and ZCTA lookups in [block_assignment.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/block_assignment.py).
- The new block-first logic flows through local-area publishing in [publish_local_area.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/publish_local_area.py).

### 3. Imputation became broader and more coherent

- `#496` on `2026-01-31` improved retirement and Social Security modeling through [retirement_limits.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/utils/retirement_limits.py) and [puf_impute.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/puf_impute.py).
- `#511` on `2026-02-07` added SIPP-based liquid asset imputation, now written in [cps.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/datasets/cps/cps.py).
- `#564` on `2026-02-26` added pregnancy ETL and assignment via [etl_pregnancy.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/db/etl_pregnancy.py) and [cps.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/datasets/cps/cps.py).
- `#589` on `2026-03-14` introduced second-stage QRF imputation for CPS-only variables in the PUF clone half, centered in [extended_cps.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/datasets/cps/extended_cps.py).
- `#594` on `2026-03-09` replaced batched QRF with sequential `fit_predict()` to better preserve covariance across many imputed variables.

### 4. Take-up and calibration targets got more realistic

- `#512` on `2026-03-04` began prioritizing reported recipients in take-up assignment.
- `#542` and `#545` on `2026-02-18` and `2026-02-19` added TANF take-up rate calibration and CPS assignment.
- Shared take-up logic now lives in [takeup.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/utils/takeup.py), with an ACA post-calibration override added on `2026-03-18`.
- `#497` and `#498` on `2026-01-31` added state income tax calibration targets and fixed federal income tax calibration to use `income_tax_positive`.

### 5. QA and operational reliability improved

- `#556` on `2026-02-25` added an end-to-end calibration DB build test in [test_database_build.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/tests/test_database_build.py).
- `#570` and `#572` on `2026-03-05` added dataset sanity tests and fixed double-weighting in [test_dataset_sanity.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/tests/test_datasets/test_dataset_sanity.py).
- `#579` on `2026-03-06` reduced Extended CPS memory use by moving to a half-sample build path.
- `2026-03-09` added stricter upload validation via [validate_package.py](/Users/maxghenis/PolicyEngine/policyengine-us-data/policyengine_us_data/calibration/validate_package.py) and related staging checks.

### Current read

The highest-impact `policyengine-us-data` changes appear to be the first-class calibration DB, the unified block-first calibration pipeline, better CPS-only imputation, and stronger validation around package promotion and dataset sanity.
