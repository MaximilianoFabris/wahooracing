// Public saved-results component. Engineering sources remain outside the website.
export function simulatorPage() {
  return `<link rel="stylesheet" href="/simulator/page.css">
<div class="simulator-accessible-heading"><h1>Wahoo Simulator</h1></div>
<section class="simulator-page" aria-label="Wahoo Simulator saved results">
  <iframe class="simulator-viewer" id="simulator-viewer" src="/simulator/viewer/" title="Wahoo Simulator: interactive saved engineering results" sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation" loading="eager"></iframe>
  <noscript><p class="wrap">Enable JavaScript to explore the saved samples and plots. These synthetic software benchmarks do not establish physical engine performance.</p></noscript>
</section>
<script src="/simulator/page.js" defer></script>`;
}
