<template>
  <div class="sharing-section">
    <div class="prompt">{{ socialSharingPrompt || 'Share this with your friends' }}</div>
    <div class="share-buttons">
      <a
        class="share-btn share-btn-fb"
        target="_blank"
        rel="nofollow noreferrer"
        :href="`//www.facebook.com/sharer/sharer.php?u=${urlToShare}`"
        aria-label="Share on Facebook"
      >
        <!-- Facebook icon -->
        <svg viewBox="0 0 24 24"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"/></svg>
      </a>
      <a
        class="share-btn share-btn-tw"
        target="_blank"
        rel="nofollow noreferrer"
        :href="`https://twitter.com/intent/tweet?text=${titleToUse} ${urlToShare}`"
        aria-label="Share on Twitter"
      >
        <!-- Twitter/X icon -->
        <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.849L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a
        class="share-btn share-btn-wa"
        target="_blank"
        rel="nofollow noreferrer"
        :href="`https://wa.me/?text=${titleToUse} ${urlToShare}`"
        aria-label="Share on WhatsApp"
      >
        <!-- WhatsApp icon -->
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
      <a
        class="share-btn share-btn-li"
        target="_blank"
        rel="nofollow noreferrer"
        :href="`//www.linkedin.com/shareArticle?mini=true&url=${urlToShare}&title=${titleToUse}`"
        aria-label="Share on LinkedIn"
      >
        <!-- LinkedIn icon -->
        <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a
        class="share-btn share-btn-em"
        target="_blank"
        rel="nofollow noreferrer"
        :href="`mailto:?subject=${titleToUse}&body=${urlToShare}`"
        aria-label="Share by Email"
      >
        <!-- Email icon -->
        <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
      </a>
    </div>
  </div>
</template>

<script>
// Adapted from SocialSharing.vue in the Quasar project.
// Key changes:
//  - Replaced @quasar/extras/mdi-v5 icons with inline SVG paths.
//  - Replaced $route.href with window.location.href.

export default {
  props: {
    urlProp: { type: String, default: null },
    socialSharingTitle: { type: String, default: null },
    socialSharingPrompt: { type: String, default: null },
  },
  computed: {
    titleToUse() {
      return encodeURIComponent(this.socialSharingTitle || 'Check this out:')
    },
    urlToShare() {
      if (this.urlProp) return encodeURIComponent(this.urlProp)
      if (typeof window !== 'undefined') {
        return encodeURIComponent(window.location.href)
      }
      return ''
    },
  },
}
</script>
