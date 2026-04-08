# Executive Summary

Inventory scope:

- `policyengine-us`: 269 non-noise first-parent change entries since `2026-01-01`
- `policyengine-us-data`: 61 non-noise first-parent change entries since `2026-01-01`

## Overall read

Since January 1, 2026, the US model stack improved along two main axes:

1. `policyengine-us` expanded the model surface substantially.
   - A wide 2025 state-tax refresh updated baseline law and form values across much of the country.
   - The contributed reform library grew materially for live 2026 state bills.
   - TANF became a national modeled layer rather than a partial state patchwork.
   - Federal health, SNAP, school meals, and tax logic became more realistic.
   - Long-run federal uprating, filer behavior, and test coverage all improved.

2. `policyengine-us-data` became much more robust as a calibration and imputation system.
   - Calibration moved toward a first-class, database-backed, block-first pipeline.
   - Geographic assignment got more granular and locally useful.
   - Imputation became richer and more statistically coherent.
   - Take-up and calibration targets became more realistic.
   - Validation, upload checks, and pipeline reliability improved materially.

## Highest-impact changes

### `policyengine-us`

- 2025 baseline state-tax coverage was refreshed broadly across states and local jurisdictions.
- New Jersey, Connecticut, and several other states gained much deeper property-tax, credit, and reform coverage.
- TANF coverage was wired into a true top-level national program layer with take-up and negative-income caps.
- ACA, Medicaid, CHIP, SNAP, and Washington Apple Health logic improved, including immigration-related eligibility and PTC/SLCSP fixes.
- Federal reform support expanded through reusable EITC/CTC work, SECURE 2.0 catch-up modeling, ACTC/RRC fixes, and longer-run Social Security uprating.
- Testing and tooling improved through TAXSIM coverage, filer tests, Ruff migration, Towncrier, and Python 3.14 support.

### `policyengine-us-data`

- The calibration database became first-class and the pipeline moved toward a unified census-block-first design.
- Geography assignment now supports finer local-area publishing.
- Retirement, liquid assets, pregnancy, CPS-only variables, and other imputed features got stronger modeling.
- TANF, ACA, and tax take-up assignment became more realistic.
- Dataset sanity checks, upload validation, and package/staging checks reduced operational risk.

## Best short version

The biggest improvement is that PolicyEngine US now looks less like a collection of separate rule additions and more like a coherent national microsimulation stack: broader state-tax and benefit coverage in `policyengine-us`, and a much stronger calibration/imputation backbone in `policyengine-us-data`.
