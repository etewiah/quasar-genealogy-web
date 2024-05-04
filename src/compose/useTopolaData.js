// useTopolaData.js

// import { ref } from 'vue'
import * as topola from 'topola'
import { useRoute } from 'vue-router'

export default function useTopolaData(allJsonData) {
  const route = useRoute()

  // Function to find the intersection of two arrays
  function intersection(arr1, arr2) {
    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    const intersectionSet = new Set([...set1].filter((num) => set2.has(num)))
    return [...intersectionSet]
  }

  // Find the current person's ID
  let currentPersonID = route.query.personID
  let focusedIndiForGraph = allJsonData.indis.find(
    (individual) => individual.id === currentPersonID
  )

  // If current person is not found, use the first individual in the data
  if (!focusedIndiForGraph) {
    focusedIndiForGraph = allJsonData.indis[0]
    currentPersonID = focusedIndiForGraph.id
  }

  // Filter families to include only those where the individual is mentioned
  const relatedFamilies = allJsonData.fams.filter((family) => {
    return (
      family.husb === currentPersonID ||
      family.wife === currentPersonID ||
      family.children.includes(currentPersonID)
    )
  })

  // Function to filter out family IDs from an individual's associations
  function stripFamIdsFromIndi(famIdsToKeep, Indi) {
    if (!famIdsToKeep.includes(Indi.famc)) {
      Indi.famc = null
    }
    Indi.fams = intersection(Indi.fams, famIdsToKeep)
    return Indi
  }

  // Extract related family IDs
  let relatedFamilyIds = relatedFamilies.map((family) => family.id)

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

  // Clean individual data
  let cleanedRelatedIndivs = []
  focusedIndividuals.forEach((indiv) => {
    let cleandIndiv = stripFamIdsFromIndi(relatedFamilyIds, indiv)
    cleanedRelatedIndivs.push(cleandIndiv)
  })

  // Prepare JSON data
  const topolaJsonData = {
    indis: cleanedRelatedIndivs,
    fams: relatedFamilies,
  }

  return {
    topolaJsonData,
    focusedIndiForGraph,
  }
}
