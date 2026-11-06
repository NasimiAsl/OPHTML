# Mapped-page component WebSocket example

Serve this example on an OP-SERVER mapped HTTPS domain that injects `/__op/components.js`, and publish `profile-card.htm` in the server's `/op/components/` directory. Keep the runtime at `../../dyHTML/ophtml.js` relative to this example, or adjust the import to its deployed same-origin location.

The page uses OPHTML's API/CDN/WebSocket root selection. It shows actual component-service source requests: data-only renders reuse the source cache, switching to a different root creates that root's cache entry, and Refresh template uses the existing `noCache:true` behavior. It requires no operator credentials or pairing. The socket is the existing page helper, not a new operator connection. This is an integration example, so a plain local HTTP file server without the page helper cannot connect to the component service.
