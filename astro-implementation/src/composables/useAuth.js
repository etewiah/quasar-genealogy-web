const SESSION_KEY = 'admin_authed'

export function useAuth() {
  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  }

  function login(password) {
    const expected = import.meta.env.PUBLIC_MGMT_PASSWORD
    if (!expected) throw new Error('PUBLIC_MGMT_PASSWORD is not set')
    if (password !== expected) throw new Error('Incorrect password')
    sessionStorage.setItem(SESSION_KEY, '1')
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
  }

  return { isAuthed, login, logout }
}
