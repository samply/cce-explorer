<script lang="ts">
  import "./app.css";
  import type { Catalogue } from "@samply/lens";
  import {
    setOptions,
    setCatalogue,
    clearSiteResults,
    markSiteClaimed,
    setSiteResult,
    querySpot,
    getAst,
    buildLibrary,
    buildMeasure,
  } from "@samply/lens";
  import { options } from "./lib/env-options";
  import { onMount } from "svelte";
  import catalogueProd from "./config/catalogue.json";

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
    a.download = `ccp-explorer-query-${formattedDate}.html`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  let catalogueopen: boolean = false;
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
        <lens-catalogue toggle={{ collapsable: false, open: catalogueopen }}
        ></lens-catalogue>
      </div>
    </div>
  </div>
</main>
