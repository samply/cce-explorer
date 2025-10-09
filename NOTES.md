# Notes

## Development

The `docker-compose.yml` file uses:

- values for `LOCAL_BEAM_SECRET_SPOT, LOCAL_BEAM_ID, SITES` etc. from the `.env` file
- certificates from the `/certs` folder

### Catalogue

The `catalogue.json` file expected by any project-specific explorer (i.e. this **new** Lens) is obtained from the *catalogue* definitions from the **old** project-specific explorer (i.e. the old Lens). For this purpose, a [lens-catalogue-transformer](https://git.verbis.dkfz.de/lens/lens-catalogue-transformer.git) tool is written. Please check the `README.md` file of the above tool to transform your old catalogues to a new format.

#### For CCE

The various `.ts` files from `lens-cce/src/assets` were copied to the `lens-catalogue-transformer/src/inputs/cce` dir and the command `npm run local transform cce` was run to get the current version of the catalogue in `catalogue.json`.

#### Changes

- for VitalStatus, the key was changed from `75186-7` to `VitalStatus` in `catalogue.json` (on 30-Sep-2025)

## To run

```sh
docker compose up

npm run dev
```

## Implementation

### cqlquery-mappings

**copy from old Lens1**

- Q. what is alias for?
- A. It is a map of `keys` to `CodeSystem URLs`

- Q. what is cqltemplate for?
- A. 

- Q. why doesn't cqltemplate have anything for vitalstatus?
- A. 

- Q. what is criterionMap for?
- A. 

### ast-to-cql-translator

#### measures

this file should work as it is
**copy measures from Lens1**


- Q. what is a measure?
- A. 

- Q. what is a stratifier?
- A. gender, stratum is male/female

- Q. what about values like DKTK_STRAT_GENDER_STRATIFIER?
- A. focus/resources/cql

#### project-manager

- negotiate button is used by project-manager
- request data - data science orchestrator, bbmri negotiator or

----
base64 thing is the query

## Analysis

### For self understanding

There are **3 representations** (or formats) of a query -

1. In query store
2. AST (the query store format is converted to AST format)
3. Focus gets the AST and transform it into a CQL query

#### AST vs. CQL

**If you convert AST to CQL in Lens**, then only you need `measures.ts` & `ast-to-cql-translator.ts` files.

#### Focus

- Stratifier is defined in focus (e.g. name ABC)
- It's used in measures.ts 
	  ([stratifier:criteria:expression "ABC"])
	  stratifier:code:text "abc"
- stratifier:code:text is used in any control's `dataKey` property
- Library should contain one or more stratifiers

#### Postman

- Library should contain stratifier code (e.g. fn name DiseaseExtentCode)
- Post Measure contains measures which use fn names defined in library (DiseaseExtentCode)
- Evaluate Measure is common for all

#### FHIR

- stratifier - breakdown of fhir resource based on some param - e.g. gender, sample types (1 chart)
- strata is one bar in a graph (1 bar in the chart is a stratum)
- measure - the response sent by fhir, 
- the response is called measure report (group patients by stratifier, then stratum)
- a measure is something which defines how you get the response of the function evaluate measure
- defines structure of a report

### Empty search

Old Lens query (cce-lens)

```
library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'
codesystem SampleMaterialType: 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType'

codesystem loinc: 'http://loinc.org'

context Patient

DKTK_STRAT_GENDER_STRATIFIER

DKTK_STRAT_AGE_STRATIFIER

DKTK_STRAT_DECEASED_STRATIFIER

DKTK_STRAT_DIAGNOSIS_STRATIFIER

DKTK_STRAT_SPECIMEN_STRATIFIER

DKTK_STRAT_PROCEDURE_STRATIFIER

DKTK_STRAT_MEDICATION_STRATIFIER
DKTK_STRAT_DEF_IN_INITIAL_POPULATION
true
```

CCE-Explorer query

```
library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'

codesystem loinc: 'http://loinc.org'

context Patient


DKTK_STRAT_GENDER_STRATIFIER

DKTK_STRAT_PRIMARY_DIAGNOSIS_NO_SORT_STRATIFIER
DKTK_STRAT_AGE_CLASS_STRATIFIER

CCE_STRAT_DECEASED_STRATIFIER

DKTK_STRAT_DIAGNOSIS_STRATIFIER

CCE_STRAT_PROCEDURE_STRATIFIER
DKTK_STRAT_DEF_IN_INITIAL_POPULATION
true
```

CCP-Explorer query

```
library Retrieve
using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0'

codesystem loinc: 'http://loinc.org'

context Patient


DKTK_STRAT_GENDER_STRATIFIER

DKTK_STRAT_PRIMARY_DIAGNOSIS_NO_SORT_STRATIFIER
DKTK_STRAT_AGE_CLASS_STRATIFIER

DKTK_STRAT_DECEASED_STRATIFIER

DKTK_STRAT_DIAGNOSIS_STRATIFIER

DKTK_REPLACE_SPECIMEN_STRATIFIERif InInitialPopulation then [Specimen] else {} as List<Specimen>
DKTK_STRAT_PROCEDURE_STRATIFIER

DKTK_STRAT_MEDICATION_STRATIFIER

  DKTK_REPLACE_HISTOLOGY_STRATIFIER
 if histo.code.coding.where(code = '59847-4').code.first() is null then 0 else 1

  DKTK_STRAT_GENETIC_VARIANT
  DKTK_STRAT_DEF_IN_INITIAL_POPULATION
true
```