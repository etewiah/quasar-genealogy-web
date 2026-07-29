// Direct copy of src/compose/useTopolaData.js from the Quasar project.
// Pure JavaScript — no framework dependencies. Works in both Node.js (Astro SSR)
// and browser (Vue island) contexts.
//
// Note: the original getFocusedData() (client-side family-graph filtering)
// was removed here — that job is now done server-side by
// getFocusedDataFromFirestore() in useFirestoreData.js.

export default function () {
  // Remove family references from individual records that are not present in
  // the filtered dataset, preventing topola rendering errors.
  function cleanUpTopolaJson(topolaJsonData) {
    function intersection(arr1, arr2) {
      const set1 = new Set(arr1)
      const set2 = new Set(arr2)
      const intersectionSet = new Set([...set1].filter((num) => set2.has(num)))
      return [...intersectionSet]
    }
    function stripFamIdsFromIndi(famIdsToKeep, Indi) {
      if (!famIdsToKeep.includes(Indi.famc)) {
        Indi.famc = null
      }
      Indi.fams = intersection(Indi.fams, famIdsToKeep)
      return Indi
    }

    let relatedFamilyIds = topolaJsonData.fams.map((family) => family.id)

    let cleanedRelatedIndivs = []
    topolaJsonData.indis.forEach((indiv) => {
      let cleandIndiv = stripFamIdsFromIndi(relatedFamilyIds, indiv)
      cleanedRelatedIndivs.push(cleandIndiv)
    })
    return topolaJsonData
  }

  return {
    cleanUpTopolaJson,
  }
}
