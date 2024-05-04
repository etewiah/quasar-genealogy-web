export default function () {
  function getFocusedData(
    allJsonData,
    focusedIndiForGraph,
    maxGenerations = 5,
    currentGeneration = 1
  ) {
    // // Function to find the intersection of two arrays
    // function intersection(arr1, arr2) {
    //   const set1 = new Set(arr1)
    //   const set2 = new Set(arr2)
    //   const intersectionSet = new Set([...set1].filter((num) => set2.has(num)))
    //   return [...intersectionSet]
    // }

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

    // // Recursively fetch data for next generations if not reached max generations
    // if (currentGeneration < maxGenerations) {
    //   relatedFamilies.forEach((family) => {
    //     const childrenIds = family.children
    //     childrenIds.forEach((childId) => {
    //       const child = allJsonData.indis.find(
    //         (individual) => individual.id === childId
    //       )
    //       if (child) {
    //         const childData = getFocusedData(
    //           allJsonData,
    //           child,
    //           maxGenerations,
    //           currentGeneration + 1
    //         )
    //         // Merge child data with current data
    //         let mergedIndis = new Set([
    //           ...topolaJsonData.indis,
    //           ...childData.topolaJsonData.indis,
    //         ])
    //         topolaJsonData.indis = [...mergedIndis]
    //         let mergedFams = new Set([
    //           ...topolaJsonData.fams,
    //           ...childData.topolaJsonData.fams,
    //         ])
    //         topolaJsonData.fams = [...mergedFams]
    //       }
    //     })
    //   })
    // }

    return topolaJsonData
  }

  // This will remove all family refs that are not in the dataset
  // from each individual
  function cleanUpTopolaJson(topolaJsonData) {
    // Function to find the intersection of two arrays
    function intersection(arr1, arr2) {
      const set1 = new Set(arr1)
      const set2 = new Set(arr2)
      const intersectionSet = new Set([...set1].filter((num) => set2.has(num)))
      return [...intersectionSet]
    }
    // Function to filter out family IDs from an individual's associations
    function stripFamIdsFromIndi(famIdsToKeep, Indi) {
      if (!famIdsToKeep.includes(Indi.famc)) {
        Indi.famc = null
      }
      Indi.fams = intersection(Indi.fams, famIdsToKeep)
      return Indi
    }

    // Extract related family IDs
    let relatedFamilyIds = topolaJsonData.fams.map((family) => family.id)

    // Clean individual data
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
