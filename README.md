# Yahoo Classique

An independent Firefox extension by **athor** that gives the current Yahoo Mail interface a purple, classic-inspired appearance. It does not restore Yahoo's discontinued interfaces.

## Features

- Purple header and white logo.
- Blue, rectangular Compose button.
- A wider, 280 px folder pane on viewports at least 1,000 px wide.
- Search field aligned with the left edge of the message list on desktop, including after window resizing.
- Square panel corners and subtle message separators.
- An on/off switch that updates open Yahoo Mail tabs without reloading them.
- An English popup by default, with a language selector for English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Japanese, and Simplified Chinese. Your choice is saved locally.
- A matching popup theme with a purple header, light gray background, and blue controls.
- Yahoo's existing fonts and virtualized message row dimensions are preserved.

The styling targets the application interface. It does not change message bodies, send messages, select messages, or delete mail. The right pane retains its controls. The language selector translates the extension popup, including status and error messages; it does not translate Yahoo Mail itself. Language names accompany the flag icons, so the selector remains usable when flag emoji are not supported by the operating system.

## Try it in Firefox

1. Disable BetterYahoo if installed to prevent overlapping styles.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on…**.
4. Select `extension/manifest.json` from this project.
5. Return to Yahoo Mail and reload the page once.
6. Click Firefox's Extensions button, then **Yahoo Classique**, to access the on/off switch.

A temporary installation is removed when Firefox restarts. Permanent installation in standard Firefox requires Mozilla signing, including for privately distributed, unlisted extensions. Publishing the source on GitHub does not sign the extension. See [Mozilla's signing documentation](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

## Privacy and permissions

The extension does not read email content, access cookies, or transmit any data. It measures the position of two interface elements to align the search field. Its appearance and language preferences are stored locally in Firefox. Translations are bundled locally; no translation service is contacted. The content script runs only on `https://mail.yahoo.com/*` and loads a local stylesheet bundled with the extension.

## Development

No dependencies or compilation are required to load the source in Firefox.

Run tests with Node.js 20 or later:

```sh
node --test tests/*.test.mjs
```

Build an unsigned package with Python 3:

```sh
python tools/package.py
```

The ZIP in `dist/` has the manifest at its root and can be submitted to Mozilla for signing. The packaging script backs up existing archives before replacing them.

Tests cover activation, deactivation, concurrent preference changes, observer cleanup, late rendering, search alignment without cumulative drift, complete translations in all 12 languages, saved language selection, and storage failure recovery. The initial preview was checked against a screenshot of a real mailbox. The final pane width, automatic alignment, and translated popup still need visual verification in Firefox.

## Compatibility and removal

Requires Firefox 140 or later. Selectors match the current Yahoo interface observed in October 2026. Future website changes may require updates. The palette targets the light theme used during development; other themes have not been verified.

Uncheck **Enable classic appearance** in the extension popup to restore Yahoo's native appearance immediately, or remove the extension in Firefox. No messages are modified.

## License

MIT — copyright 2026 athor.
