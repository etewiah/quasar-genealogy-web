import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '../useAuth.js'

// ─── Environment setup ────────────────────────────────────────────────────────
// import.meta.env is backed by Vite's define system in Vitest.
// We stub via vi.stubEnv which patches import.meta.env for the test run.

const SESSION_KEY = 'admin_authed'

describe('useAuth', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.unstubAllEnvs()
  })

  // ─── isAuthed ──────────────────────────────────────────────────────────────

  describe('isAuthed', () => {
    it('returns false when sessionStorage is empty', () => {
      const { isAuthed } = useAuth()
      expect(isAuthed()).toBe(false)
    })

    it('returns false when sessionStorage value is not "1"', () => {
      sessionStorage.setItem(SESSION_KEY, 'true')
      const { isAuthed } = useAuth()
      expect(isAuthed()).toBe(false)
    })

    it('returns true when sessionStorage value is "1"', () => {
      sessionStorage.setItem(SESSION_KEY, '1')
      const { isAuthed } = useAuth()
      expect(isAuthed()).toBe(true)
    })
  })

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('throws when PUBLIC_MGMT_PASSWORD env var is not set', () => {
      vi.stubEnv('PUBLIC_MGMT_PASSWORD', '')
      const { login } = useAuth()
      expect(() => login('anything')).toThrow('PUBLIC_MGMT_PASSWORD is not set')
    })

    it('throws when the password is wrong', () => {
      vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'correct-horse')
      const { login } = useAuth()
      expect(() => login('wrong-password')).toThrow('Incorrect password')
    })

    it('sets sessionStorage on correct password', () => {
      vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'correct-horse')
      const { login } = useAuth()
      login('correct-horse')
      expect(sessionStorage.getItem(SESSION_KEY)).toBe('1')
    })

    it('does not set sessionStorage when password is wrong', () => {
      vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'correct-horse')
      const { login } = useAuth()
      try { login('nope') } catch { /* expected */ }
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('isAuthed returns true immediately after a successful login', () => {
      vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'secret')
      const { login, isAuthed } = useAuth()
      expect(isAuthed()).toBe(false)
      login('secret')
      expect(isAuthed()).toBe(true)
    })
  })

  // ─── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears the sessionStorage key', () => {
      sessionStorage.setItem(SESSION_KEY, '1')
      const { logout } = useAuth()
      logout()
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('isAuthed returns false after logout', () => {
      sessionStorage.setItem(SESSION_KEY, '1')
      const { logout, isAuthed } = useAuth()
      logout()
      expect(isAuthed()).toBe(false)
    })

    it('is safe to call when not authed (no-op)', () => {
      const { logout } = useAuth()
      expect(() => logout()).not.toThrow()
    })
  })

  // ─── full round-trip ───────────────────────────────────────────────────────

  it('full round-trip: not authed → login → authed → logout → not authed', () => {
    vi.stubEnv('PUBLIC_MGMT_PASSWORD', 'mypassword')
    const { isAuthed, login, logout } = useAuth()

    expect(isAuthed()).toBe(false)
    login('mypassword')
    expect(isAuthed()).toBe(true)
    logout()
    expect(isAuthed()).toBe(false)
  })
})
