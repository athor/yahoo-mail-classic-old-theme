import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';

const extension = new URL('../extension/', import.meta.url);
const read = name => readFileSync(new URL(name, extension), 'utf8');
const html = read('popup.html');
const translations = read('translations.js');

function popup(saved = {}, { readFails = false, writeFails = false } = {}) {
    const ids = new Map();
    for (const id of ['enabled', 'language', 'status', 'version']) {
        ids.set(id, { disabled: true, textContent: '', events: {}, addEventListener(type, callback) { this.events[type] = callback; } });
    }
    const textElements = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => ({ dataset: { i18n: match[1] }, textContent: '' }));
    const root = {};
    const writes = [];
    const state = { ...saved };
    const context = vm.createContext({
        document: { documentElement: root, getElementById: id => ids.get(id), querySelectorAll: () => textElements },
        browser: {
            runtime: { getManifest: () => ({ version: '1.1.1' }) },
            storage: { local: {
                get: async defaults => { if (readFails) throw Error('read'); return { ...defaults, ...state }; },
                set: async values => {
                    if (writeFails) throw Error('write');
                    writes.push({ ...values }); Object.assign(state, values);
                },
            } },
        },
    });
    vm.runInContext(translations, context);
    vm.runInContext(read('popup.js'), context);
    return {
        ids, root, writes, state, textElements, messages: context.YahooClassiqueI18n,
        ready: async () => { await setImmediate(); },
        select: async value => { ids.get('language').value = value; await ids.get('language').events.change(); },
        toggle: async value => { ids.get('enabled').checked = value; await ids.get('enabled').events.change(); },
    };
}

test('all 12 languages have complete matching translations and selectable native names', () => {
    const context = vm.createContext({});
    vm.runInContext(translations, context);
    const messages = context.YahooClassiqueI18n;
    const locales = Object.keys(messages);
    assert.equal(locales.length, 12);
    const keys = Object.keys(messages.en).sort();
    const options = [...html.matchAll(/<option value="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(options.sort(), locales.sort());
    for (const [locale, text] of Object.entries(messages)) {
        assert.deepEqual(Object.keys(text).sort(), keys, locale);
        for (const value of Object.values(text)) {
            assert.ok(typeof value === 'string' && value.trim());
            assert.doesNotMatch(value, /\uFFFD/);
        }
    }
    for (const match of html.matchAll(/data-i18n="([^"]+)"/g)) assert.ok(Object.hasOwn(messages.en, match[1]));
    for (const match of html.matchAll(/(?:src|href)="([^":]+\.(?:js|css))"/g)) assert.ok(existsSync(new URL(match[1], extension)));
});

test('popup defaults to English with the runtime version', async () => {
    const view = popup(); await view.ready();
    assert.equal(view.root.lang, 'en');
    assert.equal(view.ids.get('status').textContent, view.messages.en.active);
    assert.equal(view.ids.get('version').textContent, '1.1.1');
    assert.equal(view.ids.get('enabled').disabled, false);
    assert.equal(view.ids.get('language').disabled, false);
});

test('every language translates all popup labels and status without changing appearance preference', async () => {
    const view = popup({ enabled: false }); await view.ready();
    for (const locale of Object.keys(view.messages)) {
        await view.select(locale);
        assert.equal(view.root.lang, locale);
        assert.equal(view.ids.get('status').textContent, view.messages[locale].inactive);
        assert.equal(view.ids.get('enabled').checked, false);
        for (const element of view.textElements) assert.equal(element.textContent, view.messages[locale][element.dataset.i18n]);
    }
    assert.ok(view.writes.every(write => Object.keys(write).join() === 'language'));
});

test('language preference survives reopening the popup', async () => {
    const first = popup(); await first.ready(); await first.select('ja');
    const second = popup(first.state); await second.ready();
    assert.equal(second.root.lang, 'ja');
    assert.equal(second.ids.get('language').value, 'ja');
});

test('unsupported saved language falls back safely to English', async () => {
    for (const language of ['unknown', '__proto__']) {
        const view = popup({ language }); await view.ready();
        assert.equal(view.root.lang, 'en');
    }
});

test('failed language save restores the previous language and translated error', async () => {
    const view = popup({ language: 'fr' }, { writeFails: true }); await view.ready();
    await view.select('ja');
    assert.equal(view.root.lang, 'fr');
    assert.equal(view.ids.get('language').value, 'fr');
    assert.equal(view.ids.get('status').textContent, view.messages.fr.saveError);
    assert.equal(view.ids.get('language').disabled, false);
});

test('toggle preserves language and rolls back when storage fails', async () => {
    const view = popup({ language: 'de' }); await view.ready(); await view.toggle(false);
    assert.equal(view.root.lang, 'de');
    assert.equal(view.ids.get('status').textContent, view.messages.de.inactive);
    const failure = popup({ language: 'de' }, { writeFails: true }); await failure.ready();
    await failure.toggle(false);
    assert.equal(failure.ids.get('enabled').checked, true);
    assert.equal(failure.ids.get('status').textContent, failure.messages.de.saveError);
});

test('initial storage failure leaves controls disabled and shows an English error', async () => {
    const view = popup({}, { readFails: true }); await view.ready();
    assert.equal(view.ids.get('enabled').disabled, true);
    assert.equal(view.ids.get('language').disabled, true);
    assert.equal(view.ids.get('status').textContent, view.messages.en.loadError);
});

test('popup theme matches the purple application theme without font overrides', () => {
    const css = read('popup.css');
    assert.match(html, /class="popup-header"/);
    assert.match(html, /class="popup-footer"/);
    assert.match(css, /linear-gradient\(110deg, #757cff, #7451fa\)/);
    assert.match(css, /#168aff/);
    assert.doesNotMatch(css, /\bfont(?:-[\w-]+)?\s*:/i);
    assert.doesNotMatch(css, /@import|url\s*\(/i);
});

test('support button links directly to the requested profile without remote scripts', () => {
    assert.match(html, /class="kofi-button" href="https:\/\/ko-fi\.com\/syphlr" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /data-i18n="support"/);
    assert.ok(existsSync(new URL('icons/coffee.svg', extension)));
    for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) assert.doesNotMatch(match[1], /^(?:https?:)?\/\//);
    assert.doesNotMatch(html, /kofiwidget2|Widget_2\.js/);
});
