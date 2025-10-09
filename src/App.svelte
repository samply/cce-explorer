<script lang="ts">
  import "./app.css";
  import type { Catalogue, SpotResult } from "@samply/lens";
  import {
    setOptions,
    setCatalogue,
    clearSiteResults,
    markSiteClaimed,
    setSiteResult,
    querySpot,
    getAst,
  } from "@samply/lens";
  import {
    VITAL_STATUS_LOINC_CODE,
    getGenderCriteria,
    getVitalStatusCriteria,
  } from "$lib/catalogService";
  import { negotiate } from "./lib/project-manager";
  import { options } from "./lib/env-options";
  import { onMount } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import catalogueProd from "./config/catalogue.json";

  let abortController = new AbortController();

  window.addEventListener("lens-search-triggered", () => {
    abortController.abort();
    abortController = new AbortController();
    clearSiteResults();

    const query = btoa(
      JSON.stringify({
        lang: "ast",
        payload: btoa(
          JSON.stringify({ ast: getAst(), id: crypto.randomUUID() }),
        ),
      }),
    );
    querySpot(query, abortController.signal, (result: SpotResult) => {
      const site = result.from.split(".")[1];
      if (result.status === "claimed") {
        markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        setSiteResult(site, siteResult);
      } else {
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  });

  window.addEventListener("lens-negotiate-triggered", () => {
    negotiate();
  });

  onMount(() => {
    setOptions(options);

    // Set the catalogue based on the environment
    let catalogue = catalogueProd as Catalogue;
    // if (env.PUBLIC_ENVIRONMENT === "test") {
    //   catalogue = catalogueTest as Catalogue;
    // }
    setCatalogue(catalogue);
  });

  const saveQuery = () => {
    // The query is already stored in the URL, so we can create a simple HTML file that redirects to the current URL.
    const url = window.location.href;
    const htmlContent = `<html><head><meta http-equiv="refresh" content="0;url=${url}"></head><body></body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    a.download = `cce-explorer-query-${formattedDate}.html`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  let catalogueOpen: boolean = false;

  const genderHeaders: SvelteMap<string, string> = getGenderCriteria();
  const vitalStatusHeaders: SvelteMap<string, string> =
    getVitalStatusCriteria();

  const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

  const therapyHeaders: Map<string, string> = new SvelteMap<
    string,
    string
  >().set("medicationStatements", "Sys. T");
</script>

<header class="header">
  <div class="header-wrapper">
    <div class="logo">
      <img src="../logo-CCE-GR.jpg" alt="Gustave Roussy" />
    </div>
    <div class="logo">
      <img src="../logo-CCE-KI.svg" alt="Karlosinska Institutet" />
    </div>
    <div class="logo">
      <img
        src="../logo-CCE-VHIO.png"
        alt="Vall d’Hebron Instituto de Oncología"
      />
    </div>
    <div class="logo">
      <img src="../logo-CCE-NKI.svg" alt="Netherlands Cancer Institute" />
    </div>
    <div class="logo">
      <img
        src="../logo-CCE-INT.jpg"
        alt="Fondazione IRCCSIstituto Nazionale dei Tumori"
      />
    </div>
    <div class="logo">
      <img
        src="../logo-CCE-CRUK.png"
        alt="Cancer Research UK Cambridge Centre"
      />
    </div>
    <div class="logo">
      <img src="../logo-CCE-DKFZ.svg" alt="German Cancer Research Center" />
    </div>
    <h1>CCE VDC Explorer</h1>
  </div>
</header>
<main>
  <div class="search">
    <div class="search-wrapper">
      <lens-search-bar noMatchesFoundMessage="No results found"
      ></lens-search-bar>
      <lens-query-explain-button
        noQueryMessage="Empty query: Searching for all results."
      ></lens-query-explain-button>
      <button class="save_button" on:click={saveQuery} title="Save search query"
        ><img alt="Save search criteria" src="save_24.svg" />
      </button>
      <lens-search-button title="Search"></lens-search-button>
    </div>
  </div>

  <div class="grid">
    <div class="catalogue-wrapper">
      <div class="catalogue">
        <div class="catalogue-header">
          <h2>Search criteria</h2>
          <lens-info-button
            message={[
              `The search is patient-oriented. `,
              `For patients with multiple oncological diagnoses, selected search criteria may refer not only to one disease but also to others.`,
              `Within a category, different characteristics are searched with an "OR" criteria; when searching across multiple categories, an "AND" criteria is used.`,
            ]}
            buttonSize="22px"
            alignDialogue="left"
          ></lens-info-button>
        </div>
        <lens-catalogue toggle={{ collapsable: false, open: catalogueOpen }}
        ></lens-catalogue>
      </div>
    </div>

    <div class="charts">
      <div class="chart-wrapper result-summary">
        <lens-result-summary></lens-result-summary>
        {#if options.projectManagerOptions}
          <lens-negotiate-button
            type="ProjectManager"
            title="Data and sample requests"
          ></lens-negotiate-button>
        {/if}
        <lens-search-modified-display>Charts no longer represent the current search!</lens-search-modified-display>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Patients per site"
          dataKey="patients"
          chartType="pie"
          perSite={true}
          displayLegends={true}
        ></lens-chart>
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize={10}>
          <div
            slot="lens-result-above-pagination"
            class="result-table-hint-text"
          ></div>
        </lens-result-table>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Sex"
          dataKey="gender"
          chartType="pie"
          displayLegends={true}
          headers={genderHeaders}
        ></lens-chart>
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnoses"
          dataKey="diagnosis"
          chartType="bar"
          indexAxis="y"
          groupingDivider="."
          groupingLabel=".%"
          filterRegex={"^(C.{2,6}|D[0-4][0-9].{0,4})"}
          xAxisTitle="Number of Diagnoses"
          yAxisTitle="ICD-10-Codes"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Age at first diagnosis"
          dataKey="age_at_diagnosis"
          chartType="bar"
          groupRange={10}
          filterRegex="^(([0-9]?[0-9]$)|(1[0-2]0))"
          xAxisTitle="Age"
          yAxisTitle="Primary diagnoses count"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Vital Status*"
          dataKey="{VITAL_STATUS_LOINC_CODE}"
          chartType="pie"
          displayLegends={true}
          headers={vitalStatusHeaders}
        >
          <div>
            "Deceased" indicates that a date of death has been recorded. The
            other values in this overview have not been harmonized yet.
          </div>
        </lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Therapy Type"
          dataKey="therapy_of_tumor"
          chartType="bar"
          headers={therapyHeaders}
          xAxisTitle="Type of Therapy"
          yAxisTitle="Number of Therapy entries"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
        <div class="chart-wrapper">
          <lens-chart
            title="Systemic Therapies"
            dataKey="medicationStatements"
            chartType="bar"
            xAxisTitle="Type of Therapy"
            yAxisTitle="Number of Therapy entries"
            backgroundColor={barChartBackgroundColors}
          ></lens-chart>
        </div>
        <div class="chart-wrapper">
          <lens-chart
            title="Samples"
            dataKey="sample_kind"
            chartType="bar"
            xAxisTitle="Sample types"
            yAxisTitle="Number of Samples"
            filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
            backgroundColor={barChartBackgroundColors}
          >
          </lens-chart>
        </div>
        <div class="chart-wrapper chart-wrapper-mol">
          <lens-chart
            title="Molecular Markers"
            dataKey="MolecularMarkers"
            chartType="bar"
            xAxisTitle="Marker"
            backgroundColor={barChartBackgroundColors}
          >
          </lens-chart>
        </div>
      </div>
    </div>
  </div>
</main>

<footer>
  <div>
    Made with ♥ and <a href="https://github.com/samply/lens/">samply/lens</a>
  </div>
  <div>
    More information in <a
      href="https://wiki.verbis.dkfz.de/display/CCE/Cancer+Core+Europe+Home"
      >Confluence</a
    >
  </div>
</footer>

<error-toasts></error-toasts>

<style>
  .catalogue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--gap-s);
  }
  .catalogue-header h2 {
    margin: 0;
  }
</style>
