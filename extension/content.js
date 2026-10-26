(() => {
    'use strict';
    const id = 'athor-yahoo-classique-style';
    const root = document.documentElement;
    let stylesheet = null;
    let revision = 0;
    let frame = 0;
    let shift = 0;
    let resizeObserver = null;
    let pendingObserver = null;
    let observedMain = null;
    let observedSearch = null;

    function scheduleAlignment() {
        if (stylesheet && !frame) frame = requestAnimationFrame(alignSearch);
    }

    function alignSearch() {
        frame = 0;
        if (!stylesheet) return;
        const main = document.querySelector('[data-test-id="novation-main-content"]');
        const search = document.querySelector('[data-test-id="novation-ybar-header"] [data-test-id="search-box"]');
        if (!main || !search) {
            if (!pendingObserver) {
                pendingObserver = new MutationObserver(scheduleAlignment);
                pendingObserver.observe(root, { childList: true, subtree: true });
            }
            return;
        }
        pendingObserver?.disconnect();
        pendingObserver = null;
        if (main !== observedMain || search !== observedSearch) {
            resizeObserver?.disconnect();
            resizeObserver = new ResizeObserver(scheduleAlignment);
            resizeObserver.observe(main);
            resizeObserver.observe(search);
            observedMain = main;
            observedSearch = search;
        }
        // Subtract the previous translation so repeated observations never drift.
        const searchRect = search.getBoundingClientRect();
        const baseLeft = searchRect.left - shift;
        const next = window.innerWidth >= 1000
            ? Math.round((main.getBoundingClientRect().left - baseLeft) * 100) / 100
            : 0;
        if (next !== shift) {
            shift = next;
            root.style.setProperty('--athor-yc-search-shift', `${shift}px`);
        }
    }

    function stopAlignment() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        resizeObserver?.disconnect();
        pendingObserver?.disconnect();
        resizeObserver = pendingObserver = null;
        observedMain = observedSearch = null;
        shift = 0;
        root.style.removeProperty('--athor-yc-search-shift');
        window.removeEventListener('resize', scheduleAlignment);
    }

    function apply(enabled) {
        if (enabled) {
            // Remove only our earlier console preview to avoid conflicting styles.
            document.getElementById('better-yahoo-classic-preview')?.remove();
            if (!stylesheet) {
                stylesheet = document.createElement('link');
                stylesheet.id = id;
                stylesheet.rel = 'stylesheet';
                stylesheet.href = browser.runtime.getURL('classic.css');
                stylesheet.addEventListener('load', scheduleAlignment);
                root.append(stylesheet);
                window.addEventListener('resize', scheduleAlignment);
            }
        } else if (stylesheet) {
            stopAlignment();
            stylesheet.remove();
            stylesheet = null;
        }
    }

    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && Object.hasOwn(changes, 'enabled')) {
            revision++;
            apply(changes.enabled.newValue !== false);
        }
    });

    // Do not let a delayed initial read overwrite a more recent popup choice.
    const initialRevision = revision;
    browser.storage.local.get({ enabled: true }).then(values => {
        if (revision === initialRevision) apply(values.enabled !== false);
    }).catch(() => {
        console.warn('Yahoo Classic Old Theme: local settings could not be read.');
    });
})();
