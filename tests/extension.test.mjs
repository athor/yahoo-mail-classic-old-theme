import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const extension = new URL('../extension/', import.meta.url);
const source = readFileSync(new URL('content.js', extension), 'utf8');

function fixture(initial = { enabled: true }, deferred = false) {
    const links = new Set();
    const vars = new Map();
    const frames = new Map();
    const windows = new Map();
    const listeners = [];
    let frameId = 0;
    let resolveInitial;
    let mainLeft = 310;
    let present = true;
    const main = { getBoundingClientRect: () => ({ left: mainLeft }) };
    const search = { getBoundingClientRect: () => ({ left: 180 + parseFloat(vars.get('--athor-yc-search-shift') || 0) }) };
    const observers = [];
    class Observer {
        constructor(callback) { this.callback = callback; this.active = false; observers.push(this); }
        observe() { this.active = true; }
        disconnect() { this.active = false; }
    }
    const context = vm.createContext({
        console: { warn() {} },
        requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
        cancelAnimationFrame: id => frames.delete(id),
        ResizeObserver: Observer, MutationObserver: Observer,
        browser: {
            runtime: { getURL: path => `moz-extension://test/${path}` },
            storage: {
                onChanged: { addListener: listener => listeners.push(listener) },
                local: { get: () => deferred ? new Promise(resolve => { resolveInitial = resolve; }) : Promise.resolve(initial) },
            },
        },
        document: {
            documentElement: {
                style: { setProperty: (name, value) => vars.set(name, value), removeProperty: name => vars.delete(name) },
                append: link => links.add(link),
            },
            getElementById: () => null,
            querySelector: selector => present ? (selector.includes('search-box') ? search : main) : null,
            createElement: tag => {
                assert.equal(tag, 'link');
                const link = { events: {}, addEventListener: (type, cb) => { link.events[type] = cb; }, remove: () => links.delete(link) };
                return link;
            },
        },
        innerWidth: 1600,
        addEventListener: (type, listener) => windows.set(type, listener),
        removeEventListener: type => windows.delete(type),
    });
    context.window = context;
    vm.runInContext(source, context);
    return {
        links, vars, frames, observers, windows, context,
        ready: async () => { await Promise.resolve(); },
        resolve: values => resolveInitial(values),
        change: (enabled, area = 'local') => listeners.forEach(listener => listener({ enabled: { newValue: enabled } }, area)),
        load: () => [...links][0].events.load(),
        flush: () => { for (const [id, callback] of [...frames]) { frames.delete(id); callback(); } },
        resize: left => { mainLeft = left; windows.get('resize')?.(); },
        setPresent: value => { present = value; },
    };
}

test('own extension activates by default and toggles in place without duplicate sheets', async () => {
    const page = fixture();
    await page.ready();
    assert.equal(page.links.size, 1);
    page.change(true);
    assert.equal(page.links.size, 1);
    page.change(false, 'sync');
    assert.equal(page.links.size, 1);
    page.change(false);
    assert.equal(page.links.size, 0);
    page.change(true);
    assert.equal(page.links.size, 1);
});

test('disabled preference adds no styles or layout observers', async () => {
    const page = fixture({ enabled: false });
    await page.ready();
    assert.equal(page.links.size, 0);
    assert.equal(page.observers.length, 0);
});

test('a delayed initial preference cannot overwrite a recent toggle', async () => {
    const page = fixture({}, true);
    page.change(false);
    page.resolve({ enabled: true });
    await page.ready();
    assert.equal(page.links.size, 0);
});

test('search aligns with main content without accumulating translations', async () => {
    const page = fixture();
    await page.ready();
    page.load();
    page.flush();
    assert.equal(page.vars.get('--athor-yc-search-shift'), '130px');
    for (let i = 0; i < 5; i++) { page.resize(310); page.flush(); }
    assert.equal(page.vars.get('--athor-yc-search-shift'), '130px');
    page.resize(360);
    page.flush();
    assert.equal(page.vars.get('--athor-yc-search-shift'), '180px');
    page.change(false);
    assert.equal(page.vars.size, 0);
    assert.equal(page.windows.size, 0);
    assert.ok(page.observers.every(observer => !observer.active));
});

test('small viewports remove the desktop search translation', async () => {
    const page = fixture();
    await page.ready();
    page.load(); page.flush();
    page.context.innerWidth = 800;
    page.resize(40); page.flush();
    assert.equal(page.vars.get('--athor-yc-search-shift'), '0px');
});

test('late-rendered Yahoo interface is observed only until ready', async () => {
    const page = fixture();
    await page.ready();
    page.setPresent(false);
    page.load(); page.flush();
    const pending = page.observers[0];
    assert.equal(pending.active, true);
    page.setPresent(true);
    pending.callback(); page.flush();
    assert.equal(pending.active, false);
    assert.equal(page.vars.get('--athor-yc-search-shift'), '130px');
});

test('release manifest is Firefox-only, local-storage-only, and references packaged files', () => {
    const manifest = JSON.parse(readFileSync(new URL('manifest.json', extension), 'utf8'));
    assert.equal(manifest.version, '1.1.0');
    assert.equal(manifest.author, 'athor');
    assert.deepEqual(manifest.permissions, ['storage']);
    assert.deepEqual(manifest.content_scripts[0].matches, ['https://mail.yahoo.com/*']);
    assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions.required, ['none']);
    for (const name of [...manifest.content_scripts[0].js, ...manifest.web_accessible_resources[0].resources, manifest.action.default_popup, ...Object.values(manifest.icons)]) {
        assert.ok(existsSync(new URL(name, extension)), name);
    }
});

test('release CSS keeps fonts and virtual row geometry intact', () => {
    const css = readFileSync(new URL('classic.css', extension), 'utf8');
    assert.doesNotMatch(css, /\bfont(?:-[\w-]+)?\s*:/i);
    assert.doesNotMatch(css, /@import|url\s*\(/i);
    const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    for (const [, selector, declarations] of blocks) {
        assert.match(selector, /\[data-test-id=/);
        if (/message-list-item|virtual-list/.test(selector)) {
            assert.doesNotMatch(declarations, /(?:^|;)\s*(?:height|min-height|max-height|padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|position|transform|display|line-height)\s*:/i);
        }
    }
    assert.match(css, /width: 280px/);
    assert.match(css, /h1 \+ a svg path/);
});
