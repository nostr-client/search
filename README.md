# search

`<nostr-search>` — full-text search over
[NIP-50](https://github.com/nostr-protocol/nips/blob/master/50.md)
search-capable relays. **No build step.** One file: [`search.js`](search.js).

Part of [nostr-client](https://github.com/nostr-client) — a modular, composable
nostr client where each repo does one thing.

**Live demo:** https://nostr-client.github.io/search/

## Use

```html
<script type="module" src="https://nostr-client.github.io/search/search.js"></script>

<nostr-search></nostr-search>
<nostr-search query="bitcoin" limit="50"></nostr-search>
<nostr-search relays="wss://relay.nostr.band"></nostr-search>
```

Most relays don't implement NIP-50, so this component uses its own small pool
of search relays (`relay.nostr.band`, `search.nos.today` by default) instead
of the page's shared pool. Results are
[note](https://github.com/nostr-client/note) cards — clickable, reaction-bar
capable, thread-navigable like everywhere else.

## License

AGPL-3.0-or-later
