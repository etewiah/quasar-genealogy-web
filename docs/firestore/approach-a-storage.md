# Approach A: Firebase Storage

Store the raw `.ged` file in Firebase Storage. The app fetches it at runtime and parses it client-side with `topola.gedcomToJson()` — functionally identical to the current approach, just with a dynamic remote source instead of a hardcoded bundled import.

---

## How it works

```
Browser
  → fetch(firebaseStorageUrl)         ← downloads the .ged file (~5.9MB)
  → topola.gedcomToJson(gedcomText)   ← parses to { indis, fams }
  → useTopolaData.getFocusedData()    ← filters to focused person
  → TopolaWrapper renders the chart
```

The data flow through `useTopolaData.js` and `TopolaWrapper.vue` is completely unchanged. Only the data source in `TopolaStaticDataPage.vue` changes.

---

## Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firebase Storage** (Storage → Get started)
3. Upload your `.ged` file to Storage (e.g. `trees/campbells/campbells.ged`)
4. Set the storage security rules to allow public reads (see [Security](security.md)), or keep it private and use Firebase Auth
5. Copy your Firebase config (Project settings → Your apps → Web app)

---

## Code changes

### Install the Firebase SDK

```bash
yarn add firebase
```

### Create `src/boot/firebase.js`

In Quasar, boot files run before the app mounts. Create one to initialise Firebase:

```js
// src/boot/firebase.js
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
```

Register it in `quasar.config.js`:

```js
boot: ['firebase'],
```

### Create `src/compose/useGedcomFromStorage.js`

```js
// src/compose/useGedcomFromStorage.js
import { ref } from 'vue'
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage'

export default function () {
  const loading = ref(false)
  const error = ref(null)

  async function fetchGedcom(storagePath) {
    loading.value = true
    error.value = null
    try {
      const storage = getStorage()
      const fileRef = storageRef(storage, storagePath)
      const url = await getDownloadURL(fileRef)
      const response = await fetch(url)
      const text = await response.text()
      return text
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return { fetchGedcom, loading, error }
}
```

### Update `TopolaStaticDataPage.vue`

Replace the static import with a dynamic fetch:

```vue
<template>
  <q-page class="flex">
    <div v-if="loading" class="full-width text-center q-pa-xl">
      Loading family tree…
    </div>
    <div v-else-if="error" class="full-width text-center q-pa-xl text-negative">
      Failed to load: {{ error }}
    </div>
    <div v-else class="row max-ctr">
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaIndividual :topolaJsonData="topolaJsonData" />
      </div>
      <div class="q-my-lg q-mx-md col-xs-12">
        <TopolaWrapper
          :topolaData="topolaJsonData"
          :topolaConfig="topolaConfig"
          :focusedIndiForGraph="focusedIndiForGraph"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as topola from 'topola'
import TopolaWrapper from 'components/TopolaWrapper.vue'
import TopolaIndividual from 'components/TopolaIndividual.vue'
import useTopolaData from 'src/compose/useTopolaData'
import useGedcomFromStorage from 'src/compose/useGedcomFromStorage'

defineOptions({ name: 'TopolaStaticDataPage' })

const props = defineProps({ topolaConfig: Object })
const route = useRoute()
const { getFocusedData, cleanUpTopolaJson } = useTopolaData()
const { fetchGedcom, loading, error } = useGedcomFromStorage()

const topolaJsonData = ref(null)
const focusedIndiForGraph = ref(null)

onMounted(async () => {
  const gedcomText = await fetchGedcom('trees/campbells/campbells.ged')
  if (!gedcomText) return

  const allJsonData = topola.gedcomToJson(gedcomText)

  const personID = route.query.personID
  focusedIndiForGraph.value =
    allJsonData.indis.find(i => i.id === personID) || allJsonData.indis[0]

  const unstripped = getFocusedData(allJsonData, focusedIndiForGraph.value, false)
  topolaJsonData.value = cleanUpTopolaJson(unstripped)
})
</script>
```

---

## Limitations

- **Full file downloaded every time** — the 5.9MB `.ged` is fetched on every page load. Client-side parsing adds a noticeable delay on slower connections.
- **No per-record access control** — it is all-or-nothing. You cannot hide living relatives' records without pre-processing the file.
- **No editing** — updating the tree means re-uploading the whole `.ged` file.
- **Parsing happens in the browser** — `topola.gedcomToJson()` on a 5.9MB file is fast on desktop but may be slow on mobile.

These limitations are why [Approach B](approach-b-firestore.md) is recommended for long-term use.

---

## When to use this approach

- You want to move off the bundled static build quickly
- The tree is read-only and relatively small (<1MB)
- You are comfortable re-uploading the `.ged` file when data changes
- You want a stepping stone before implementing the full Firestore approach
