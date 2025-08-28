import type { Catalogue, CategoryGroup, SingleSelectCategory } from "@samply/lens";
import catalogueProd from "../config/catalogue.json";
import { SvelteMap } from "svelte/reactivity";

export const VITAL_STATUS_LOINC_CODE: string = "75186-7";

export function getCatalogue(): Catalogue {
    return catalogueProd as Catalogue;
}

export function getCategoryGroup(key: string): CategoryGroup | undefined {
    const catalogue = getCatalogue();
    return catalogue.find((category) => category.key === key) as CategoryGroup;
}

export function getSingleSelectCategory(groupKey: string, categoryKey: string): SingleSelectCategory | undefined {
    let categoryGroup = getCategoryGroup(groupKey);
    if (categoryGroup) {
        let category = categoryGroup.childCategories.find((key) => key.key === categoryKey);
        if (category) {
            return category as SingleSelectCategory;
        }
    }

    return undefined;
}

/// <summary>
/// Get the gender criteria from the catalogue. The same values are used for headers.
/// </summary>
export function getGenderCriteria(): SvelteMap<string, string> {
    const catalogue = getCatalogue();
    const genderCriteria = new SvelteMap<string, string>();

    let genderCategory = getSingleSelectCategory("patient", "gender");
    if (genderCategory) {
        genderCategory.criteria.forEach((criterion) => {
            genderCriteria.set(criterion.key, criterion.name);
        });
    }

    return genderCriteria;
}

/// <summary>
/// Get the vital status criteria from the catalogue. The same values are used for headers.
/// </summary>
export function getVitalStatusCriteria(): SvelteMap<string, string> {
    const catalogue = getCatalogue();
    const vitalStatusCriteria = new SvelteMap<string, string>();

    let vitalStatusCategory = getSingleSelectCategory("patient", VITAL_STATUS_LOINC_CODE);
    if (vitalStatusCategory) {
        vitalStatusCategory.criteria.forEach((criterion) => {
            vitalStatusCriteria.set(criterion.key, criterion.name);
        });
    }

    return vitalStatusCriteria;
}