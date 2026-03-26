// Direct copy of src/compose/useTopolaData.js from the Quasar project.
// Pure JavaScript — no framework dependencies. Works in both Node.js (Astro SSR)
// and browser (Vue island) contexts.

export default function () {
  function getFocusedData(
    allJsonData,
    focusedIndiForGraph,
    showGrandchildren = false
  ) {
    // Filter families to include only those where the individual is mentioned
    const relatedFamilies = allJsonData.fams.filter((family) => {
      return (
        family.husb === focusedIndiForGraph.id ||
        family.wife === focusedIndiForGraph.id ||
        family.children.includes(focusedIndiForGraph.id)
      )
    })

    // Extract individual IDs of all related individuals
    let focusedIndividualIds = []
    relatedFamilies.forEach((family) => {
      let currFamilyMemberIds = [...family.children, family.husb, family.wife]
      let mergedSet = new Set([...focusedIndividualIds, ...currFamilyMemberIds])
      focusedIndividualIds = [...mergedSet]
    })

    // Filter individuals based on related individual IDs
    let focusedIndividuals = allJsonData.indis.filter((individual) =>
      focusedIndividualIds.includes(individual.id)
    )

    // Prepare JSON data
    const topolaJsonData = {
      indis: focusedIndividuals,
      fams: relatedFamilies,
    }

    if (showGrandchildren) {
      relatedFamilies.forEach((family) => {
        const childrenIds = family.children
        childrenIds.forEach((childId) => {
          const child = allJsonData.indis.find(
            (individual) => individual.id === childId
          )
          if (child) {
            const childData = getFocusedData(allJsonData, child, false)
            let mergedIndis = new Set([
              ...topolaJsonData.indis,
              ...childData.indis,
            ])
            topolaJsonData.indis = [...mergedIndis]
            let mergedFams = new Set([
              ...topolaJsonData.fams,
              ...childData.fams,
            ])
            topolaJsonData.fams = [...mergedFams]
          }
        })
      })
    }

    return topolaJsonData
  }

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
    getFocusedData,
  }
}
