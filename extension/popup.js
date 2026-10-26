'use strict';

const checkbox = document.getElementById('enabled');
const status = document.getElementById('status');

function show(enabled) {
    checkbox.checked = enabled;
    status.textContent = enabled
        ? 'Habillage actif sur vos onglets Yahoo Mail ouverts.'
        : 'Habillage désactivé. L’apparence native de Yahoo est rétablie.';
}

async function initialize() {
    try {
        const values = await browser.storage.local.get({ enabled: true });
        show(values.enabled !== false);
        checkbox.disabled = false;
    } catch {
        status.textContent = 'Réglage indisponible. Fermez puis rouvrez ce panneau.';
    }
}

checkbox.addEventListener('change', async () => {
    const enabled = checkbox.checked;
    checkbox.disabled = true;
    try {
        await browser.storage.local.set({ enabled });
        show(enabled);
    } catch {
        checkbox.checked = !enabled;
        status.textContent = 'Enregistrement impossible. Votre choix précédent est conservé.';
    } finally {
        checkbox.disabled = false;
    }
});

void initialize();
