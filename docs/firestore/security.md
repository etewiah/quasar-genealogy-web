# Firestore Security & Access Control

Firestore security rules control who can read and write documents. This is especially important for a genealogy app because the data may include sensitive information about living relatives.

---

## The core privacy concern

A genealogy tree typically contains two categories of people:

- **Deceased individuals** — historical records; generally safe to make public
- **Living individuals** — birth dates, addresses, family relationships; should be private by default

The current static-bundle approach has **no access control at all** — the full GEDCOM is embedded in a publicly served JavaScript file. Moving to Firebase enables meaningful access control for the first time.

---

## Security rule options

### Option 1: Fully public (read-only)

Anyone can read; only authenticated admins can write. Suitable if all individuals in your tree are deceased or you are comfortable with the data being public.

```
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trees/{treeId}/individuals/{indiId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /trees/{treeId}/families/{famId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /trees/{treeId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Option 2: Authenticated read (family members only)

Only signed-in users can read. Use Firebase Authentication (Google Sign-In, email/password, or magic link) to restrict access to family members.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trees/{treeId}/{subcollection}/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /trees/{treeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

With this rule, the app must sign the user in before making any Firestore queries. Unauthenticated visitors see a sign-in prompt instead of the tree.

### Option 3: Filter living individuals server-side

The most privacy-preserving option: store a `living` boolean on each individual document and use security rules to hide living people from unauthenticated reads.

Add `living: true/false` to each individual during migration (derive it from whether the person has a death record in the GEDCOM).

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trees/{treeId}/individuals/{indiId} {
      // Public can read deceased individuals only
      allow read: if resource.data.living == false
                  || request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    match /trees/{treeId}/families/{famId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

This requires updating the migration script to set the `living` field:

```js
// In scripts/gedcom-to-firestore.mjs, when preparing individual docs:
const enrichedIndis = indis.map(indi => ({
  ...indi,
  // Consider a person living if they have no death record
  living: !indi.death?.date && !indi.death?.place,
}))
```

---

## Setting up Firebase Authentication

For Option 2 or 3, add Firebase Auth to the app:

```bash
yarn add firebase
```

```js
// src/boot/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
```

Add a sign-in button to `MainLayout.vue`:

```js
import { auth, googleProvider } from 'src/boot/firebase'
import { signInWithPopup } from 'firebase/auth'

async function signIn() {
  await signInWithPopup(auth, googleProvider)
}
```

Firestore queries automatically use the signed-in user's credentials — no changes to the query code are needed once the user is authenticated.

---

## Firebase Storage security rules

If using [Approach A](approach-a-storage.md) (raw GEDCOM file in Firebase Storage), the storage rules follow the same pattern:

```
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read for the GEDCOM file
    match /trees/{treeId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Or restrict to authenticated users:

```
    match /trees/{treeId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
```

---

## Setting the admin custom claim

The write rules above check `request.auth.token.admin == true`. Set this custom claim on your own Firebase user account using the Admin SDK (run once):

```js
// scripts/set-admin-claim.mjs
import admin from 'firebase-admin'
import { readFileSync } from 'fs'

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(readFileSync('serviceAccountKey.json', 'utf8')))
})

// Replace with your own Firebase user UID (find it in Firebase console → Authentication)
const uid = 'YOUR_USER_UID'
await admin.auth().setCustomUserClaims(uid, { admin: true })
console.log(`Admin claim set for ${uid}`)
process.exit(0)
```

```bash
node scripts/set-admin-claim.mjs
```

The user must sign out and back in for the new claim to take effect.

---

## Deploying security rules

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Log in
firebase login

# Initialise Firebase in the project (if not done already)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```
