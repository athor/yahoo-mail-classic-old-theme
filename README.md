# Yahoo Mail Classic Old Theme

An independent Firefox extension by **athor** that gives the current Yahoo Mail interface a purple, classic-inspired appearance. It does not restore Yahoo's discontinued interfaces.

**[Install from Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/yahoo-mail-classic-old-theme/)**

## Features

- Purple header and white logo.
- Blue, rectangular Compose button.
- A wider, 280 px folder pane on viewports at least 1,000 px wide.
- Search field aligned with the left edge of the message list on desktop, including after window resizing.
- Square panel corners and subtle message separators.
- An on/off switch that updates open Yahoo Mail tabs without reloading them.
- An English popup by default, with a language selector for English, French, Spanish, German, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Japanese, and Simplified Chinese. Your choice is saved locally.
- A matching popup theme with a purple header, light gray background, and blue controls.
- A localized support button linked directly to [syphlr on Ko-fi](https://ko-fi.com/syphlr), with a bundled icon and no remote widget script.
- Yahoo's existing fonts and virtualized message row dimensions are preserved.

The styling targets the application interface. It does not change message bodies, send messages, select messages, or delete mail. The right pane retains its controls. The language selector translates the extension popup, including status and error messages; it does not translate Yahoo Mail itself. Language names accompany the flag icons, so the selector remains usable when flag emoji are not supported by the operating system.

## Installation

1. Open [Yahoo Mail Classic Old Theme on Firefox Add-ons](https://addons.mozilla.org/fr/firefox/addon/yahoo-mail-classic-old-theme/).
2. Click **Add to Firefox** and follow Firefox's installation prompts.
3. Open Yahoo Mail and reload the page once.
4. Click Firefox's Extensions button, then **Yahoo Mail Classic Old Theme**, to choose your language or switch the appearance on or off.

Disable BetterYahoo or other overlapping Yahoo appearance extensions if installed. Updates are delivered through Firefox Add-ons.

## Privacy and permissions

The extension does not read email content, access cookies, or transmit any data. It measures the position of two interface elements to align the search field. Its appearance and language preferences are stored locally in Firefox. Translations are bundled locally; no translation service is contacted. The content script runs only on `https://mail.yahoo.com/*` and loads a local stylesheet bundled with the extension.

## Development

No dependencies or compilation are required to load the source in Firefox.

Run tests with Node.js 20 or later:

```sh
node --test tests/*.test.mjs
```

Package the extension sources with Python 3:

```sh
python tools/package.py
```

The ZIP in `dist/` has the manifest at its root for Mozilla submission. The packaging script backs up existing archives before replacing them.

Tests cover activation, deactivation, concurrent preference changes, observer cleanup, late rendering, search alignment without cumulative drift, complete translations in all 12 languages, saved language selection, and storage failure recovery.

## Compatibility and removal

Requires Firefox 140 or later. Selectors match the current Yahoo interface observed in October 2026. Future website changes may require updates. The palette is designed for Yahoo’s light theme.

Uncheck **Enable classic appearance** in the extension popup to restore Yahoo's native appearance immediately, or remove the extension in Firefox. No messages are modified.

## License

MIT — copyright 2026 athor.

<img width="857" height="428" alt="2old" src="https://github.com/user-attachments/assets/82a74f18-1d7b-4d65-bfd1-1f4d4bce6575" />
<img width="160" height="296" alt="1 addon" src="https://github.com/user-attachments/assets/72a9cec3-2624-4be8-9cd1-84ad63a00679" />
<img width="128" height="128" alt="Yahoo Old" src="https://github.com/user-attachments/assets/45c2820a-a87a-4418-945e-5cb42032a45a" /> 
