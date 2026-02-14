const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 900 } });

  await page.goto('http://127.0.0.1:5500/#inicio', { waitUntil: 'networkidle' });

  const estadoInicial = await page.evaluate(() => {
    const sidebar = document.getElementById('idSidebar');
    const btn = document.getElementById('btn-sidebar-toggle');
    return {
      bodyClass: document.body.classList.contains('sidebar-open'),
      btnExpanded: btn?.getAttribute('aria-expanded'),
      sidebarHidden: sidebar?.getAttribute('aria-hidden'),
    };
  });

  await page.keyboard.press('Tab');
  const focoAntesAbrir = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      id: el?.id || '',
      text: (el?.textContent || '').trim(),
      tag: el?.tagName || '',
    };
  });

  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  const focoDespuesAbrir = await page.evaluate(() => {
    const el = document.activeElement;
    const btn = document.getElementById('btn-sidebar-toggle');
    return {
      tag: el?.tagName || '',
      href: el?.getAttribute?.('href') || '',
      expanded: btn?.getAttribute('aria-expanded') || '',
      bodyClass: document.body.classList.contains('sidebar-open'),
    };
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  const focoDespuesEsc = await page.evaluate(() => {
    const el = document.activeElement;
    const btn = document.getElementById('btn-sidebar-toggle');
    return {
      activeId: el?.id || '',
      expanded: btn?.getAttribute('aria-expanded') || '',
      bodyClass: document.body.classList.contains('sidebar-open'),
      sidebarHidden: document.getElementById('idSidebar')?.getAttribute('aria-hidden') || '',
    };
  });

  console.log(JSON.stringify({ estadoInicial, focoAntesAbrir, focoDespuesAbrir, focoDespuesEsc }, null, 2));
  await browser.close();
})();
