# Extracting Data from a Deployed Build

This documents how the Campbell family GEDCOM data was recovered from the deployed site at `campbells.gipeties.com`, and what it reveals about the security implications of the current static-bundle architecture.

---

## How it was done

The Quasar build splits the app into multiple JavaScript chunks. The GEDCOM data string is embedded inside the `TopolaStaticDataPage` chunk — one of the preloaded JS assets listed in the page's HTML `<link rel="modulepreload">` tags.

The following steps were executed in the browser console on the live site:

```js
// 1. Fetch the chunk that contains the page component (and with it, the GEDCOM data)
const resp = await fetch('https://campbells.gipeties.com/assets/TopolaStaticDataPage.3864ec5d.js')
const text = await resp.text()
// → 6MB chunk

// 2. Locate the GEDCOM string by finding the standard header and trailer markers
const start = text.indexOf('0 HEAD')
const end = text.indexOf('0 TRLR', start) + '0 TRLR'.length

// 3. Unescape JS string escape sequences
const gedcom = text.slice(start, end).replace(/\\n/g, '\n').replace(/\\t/g, '\t')

// 4. Trigger a browser download
const a = Object.assign(document.createElement('a'), {
  href: URL.createObjectURL(new Blob([gedcom], { type: 'text/plain' })),
  download: 'campbells.ged',
})
document.body.appendChild(a)
a.click()
```

This produced a valid 5.9MB GEDCOM file containing **3,214 individuals** and **1,608 families**, exported from Ancestry.com on 30 Apr 2024.

The entire process took under 30 seconds.

---

## Why this is possible

Vite (which Quasar uses for builds) inlines JavaScript module exports directly into the output bundle. When `TopolaStaticDataPage.vue` does:

```js
import topolaGedcomData from 'src/data/KennedyFamilyData.ged.js'
```

Vite includes the string content of that file verbatim inside the built JavaScript chunk. That chunk is then served as a public static asset — readable by anyone with a browser, no authentication required.

There is no meaningful difference between "bundled in JS" and "served as a plain text file" from a privacy perspective. If anything, bundled data is slightly *easier* to extract because the chunk URL is predictable from the HTML source.

---

## What this means for sensitive data

**Any GEDCOM file used with the current static-bundle architecture is effectively public**, regardless of whether the site has a login screen. The JS bundle is fetched before any authentication UI is shown, and the chunk URLs are visible in the page HTML to anyone who views source.

This is particularly significant for genealogy data because:

- GEDCOM files typically contain **living relatives** — birth dates, family relationships, and sometimes addresses
- Data about living people is subject to privacy legislation (GDPR in the UK/EU, various US state laws)
- Ancestry.com exports include source citations that can be used to find more personal information

---

## The fix

Move the data off the client. See the [Firestore Backend](firestore/index.md) documentation for the recommended approach:

- **Approach A** (Firebase Storage): the `.ged` file is still downloaded in full, but access can be gated behind Firebase Authentication
- **Approach B** (Firestore): only the documents needed for the current view are fetched; living individuals can be hidden from unauthenticated reads via security rules (see [Security](firestore/security.md))

Neither approach leaks the full dataset in a public JS bundle.
