/**
 * search.js — <nostr-search>, NIP-50 full-text search over search-capable
 * relays. No build step.
 *
 * Part of https://github.com/nostr-client — one repo, one thing.
 * License: AGPL-3.0-or-later
 *
 * Usage:
 *   <script type="module" src="https://nostr-client.github.io/search/search.js"></script>
 *   <nostr-search></nostr-search>
 *
 * Most relays don't implement NIP-50, so this component uses its own small
 * pool of search relays (override with the relays attribute). Results are
 * note cards; clicking one emits nostr:note-click for thread navigation.
 */

import { Pool } from 'https://nostr-client.github.io/pool/pool.js'
import 'https://nostr-client.github.io/note/note.js'

export const SEARCH_RELAYS = [
  'wss://relay.nostr.band',
  'wss://search.nos.today',
]

const TEMPLATE = /* html */ `
<style>
  :host { display: block;
    font-family: var(--nc-font, ui-sans-serif, system-ui, sans-serif);
    font-size: .95rem; color: var(--nc-ink, #201d26); }
  form { display: flex; gap: .5rem; margin-bottom: .8rem; }
  input { font: inherit; flex: 1; min-width: 0; padding: .55em .9em; border-radius: 999px;
    border: 1px solid var(--nc-line, #e9e6e0); background: var(--nc-surface, #fff);
    color: inherit; }
  input:focus { outline: 2px solid var(--nc-accent-soft, #f2ecfd);
    border-color: var(--nc-accent, #7c3aed); }
  button { font: inherit; cursor: pointer; border: none; border-radius: 999px;
    padding: .5em 1.3em; font-weight: 600;
    background: var(--nc-accent, #7c3aed); color: var(--nc-accent-ink, #fff); }
  .status { font-size: .78rem; color: var(--nc-faint, #a8a4b0); margin: .4rem .2rem; }
  #results { display: grid; gap: .65rem; }
</style>
<form id="form">
  <input id="q" type="search" placeholder="Search nostr…" autocomplete="off">
  <button>Search</button>
</form>
<div class="status" id="status"></div>
<div id="results"></div>
`

class NostrSearch extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' }).innerHTML = TEMPLATE
    this.$ = (id) => this.shadowRoot.getElementById(id)
    this.pool = null
    this._seq = 0
  }

  connectedCallback() {
    this.$('form').onsubmit = (e) => { e.preventDefault(); this.search(this.$('q').value) }
    const preset = this.getAttribute('query')
    if (preset) { this.$('q').value = preset; this.search(preset) }
  }

  disconnectedCallback() { this.pool?.close(); this.pool = null }

  get _pool() {
    if (!this.pool) {
      const relays = this.getAttribute('relays')
      this.pool = new Pool(relays ? relays.split(',').map((s) => s.trim()) : SEARCH_RELAYS)
    }
    return this.pool
  }

  async search(query) {
    query = (query || '').trim()
    if (!query) return
    if (this.$('q').value !== query) this.$('q').value = query
    const seq = ++this._seq
    this.$('results').innerHTML = ''
    this.$('status').textContent = 'searching…'
    const events = await this._pool.list(
      [{ kinds: [1], search: query, limit: Number(this.getAttribute('limit') || 25) }],
      { timeout: 6000 }
    )
    if (seq !== this._seq) return
    this.$('status').textContent = events.length
      ? events.length + ' results from ' + this._pool.urls.join(', ')
      : 'nothing found (search relays: ' + this._pool.urls.join(', ') + ')'
    for (const ev of events) {
      const note = document.createElement('nostr-note')
      note.setAttribute('clickable', '')
      note.event = ev
      this.$('results').append(note)
    }
    this.dispatchEvent(new CustomEvent('nostr:search', {
      detail: { query, count: events.length }, bubbles: true, composed: true,
    }))
  }
}

if (!customElements.get('nostr-search')) customElements.define('nostr-search', NostrSearch)
