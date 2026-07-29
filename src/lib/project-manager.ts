import {
  getAst,
  getQueryStore,
  getSelectedSites,
  getHumanReadableQuery,
  getOptions,
} from "@samply/lens";
import { v4 as uuidv4 } from "uuid";

type PmBody = {
  query: string;
  "explorer-ids": string;
  "query-format": string;
  "human-readable": string;
  "project-code": string;
  "explorer-url": string;
  "query-details": string;
};

type ProjectManagerResponse = Response & {
  redirect_uri?: string;
};

type ProjectManagerOptions = {
  newProjectUrl: string;
  editProjectUrl: string;
};

function isProjectManagerOptions(obj: unknown): obj is ProjectManagerOptions {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "newProjectUrl" in obj &&
    "editProjectUrl" in obj &&
    typeof obj.newProjectUrl === "string" &&
    typeof obj.editProjectUrl === "string"
  );
}

export const negotiate = async (): Promise<void> => {
  const options = getOptions();
  if (
    !options ||
    !isProjectManagerOptions(options.projectManagerOptions) ||
    !options.siteMappings
  ) {
    console.error("Project Manager options not set");
    return;
  }

  const humanReadable = getHumanReadableQuery();
  const selectedSites = getSelectedSites();
  const collectionIds = Object.entries(options.siteMappings)
    .filter(([siteId]) => selectedSites.includes(siteId))
    .map(([, siteInfo]) =>
      typeof siteInfo === "object" ? siteInfo.collectionId : undefined,
    )
    .filter((collectionId) => collectionId !== undefined);

  const response = await sendRequestToProjectManager(
    options.projectManagerOptions.editProjectUrl,
    options.projectManagerOptions.newProjectUrl,
    humanReadable,
    collectionIds,
    selectedSites,
  );

  if (!response.redirect_uri) {
    console.error("Project Manager response does not contain a redirect URI");
    return;
  }

  window.location.href = response.redirect_uri;
};

async function sendRequestToProjectManager(
  editProjectUrl: string,
  newProjectUrl: string,
  humanReadable: string,
  collectionIds: string[],
  selectedSites: string[],
): Promise<ProjectManagerResponse> {
  let temporaryToken: string | null = "";

  try {
    const response = await fetch("/oauth2/auth", {
      method: "GET",
      credentials: "include",
    });
    temporaryToken = response.headers.get("Authorization");
  } catch (error) {
    console.error("Failed to obtain an OAuth token", error);
    return new Response() as ProjectManagerResponse;
  }

  const negotiationPartners = collectionIds.join(",");
  const urlParams = new URLSearchParams(window.location.search);
  const projectCode = urlParams.get("project-code");
  const returnUrl = buildExplorerUrl(
    negotiationPartners,
    selectedSites,
    projectCode,
  );
  const projectManagerUrl = projectCode ? editProjectUrl : newProjectUrl;

  try {
    return await fetch(projectManagerUrl, {
      method: projectCode ? "PUT" : "POST",
      headers: {
        returnAccept: "application/json; charset=utf-8",
        "Content-Type": "application/json",
        Authorization: temporaryToken ?? "",
      },
      body: buildProjectManagerBody(
        humanReadable,
        negotiationPartners,
        returnUrl,
        projectCode ?? "",
      ),
    }).then((response) => response.json());
  } catch (error) {
    console.error("Project Manager request failed", error);
    return new Response() as ProjectManagerResponse;
  }
}

function buildProjectManagerBody(
  humanReadable: string,
  negotiationPartners: string,
  returnUrl: string,
  projectCode: string,
): string {
  const base64Encode = (utf8String: string) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(utf8String)));

  const queryDetails = base64Encode(JSON.stringify(getQueryStore()));
  const body: PmBody = {
    query: base64Encode(
      JSON.stringify({
        lang: "ast",
        payload: base64Encode(JSON.stringify({ ast: getAst(), id: uuidv4() })),
      }),
    ),
    "explorer-ids": negotiationPartners,
    "query-format": "AST_DATA",
    "human-readable": humanReadable,
    "project-code": projectCode,
    "explorer-url": addQueryToExplorerUrl(returnUrl, queryDetails),
    "query-details": queryDetails,
  };

  return JSON.stringify(body);
}

/**
 * Build the URL used to return from Project Manager. Lens restores the selected
 * bridgeheads from the base64-encoded `datarequests` URL parameter.
 */
function buildExplorerUrl(
  negotiationPartners: string,
  selectedSites: string[],
  projectCode: string | null,
): string {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set("collections", negotiationPartners);
  url.searchParams.set(
    "datarequests",
    btoa(
      String.fromCharCode(
        ...new TextEncoder().encode(JSON.stringify(selectedSites)),
      ),
    ),
  );

  if (projectCode) {
    url.searchParams.set("project-code", projectCode);
  }

  return url.toString();
}

function addQueryToExplorerUrl(returnUrl: string, query: string): string {
  const url = new URL(returnUrl);
  url.searchParams.set("query", query);
  return url.toString();
}
