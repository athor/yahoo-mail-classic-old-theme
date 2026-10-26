'use strict';

const checkbox = document.getElementById('enabled');
const languageSelect = document.getElementById('language');
const status = document.getElementById('status');
const messages = globalThis.YahooClassiqueI18n;
let language = 'en';
let enabled = true;

function render(statusKey = enabled ? 'active' : 'inactive') {
    const text = messages[language];
    document.documentElement.lang = language;
    for (const element of document.querySelectorAll('[data-i18n]')) {
        const key = element.dataset.i18n;
        if (Object.hasOwn(text, key)) element.textContent = text[key];
    }
    checkbox.checked = enabled;
    languageSelect.value = language;
    status.textContent = text[statusKey];
    document.getElementById('version').textContent = browser.runtime.getManifest().version;
}

function setBusy(busy) {
    checkbox.disabled = busy;
    languageSelect.disabled = busy;
}

async function initialize() {
    try {
        const values = await browser.storage.local.get({ enabled: true, language: 'en' });
        language = Object.hasOwn(messages, values.language) ? values.language : 'en';
        enabled = values.enabled !== false;
        render();
        setBusy(false);
    } catch {
        render('loadError');
    }
}

checkbox.addEventListener('change', async () => {
    const next = checkbox.checked;
    setBusy(true);
    try {
        await browser.storage.local.set({ enabled: next });
        enabled = next;
        render();
    } catch {
        render('saveError');
    } finally {
        setBusy(false);
    }
});

languageSelect.addEventListener('change', async () => {
    const next = languageSelect.value;
    if (!Object.hasOwn(messages, next)) { render(); return; }
    setBusy(true);
    try {
        await browser.storage.local.set({ language: next });
        language = next;
        render();
    } catch {
        render('saveError');
    } finally {
        setBusy(false);
    }
});

void initialize();
