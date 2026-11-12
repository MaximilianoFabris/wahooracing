/** milestoneHTML must be the existing, trusted server-rendered milestone body. */
export function activityLedgerBody(milestoneHTML=''){
 milestoneHTML=milestoneHTML.replace(/<h1>/g,'<h2>').replace(/<\/h1>/g,'</h2>');
 return `<div class="wi-work-page wrap al-page" data-activity-ledger>
 <nav class="wi-work-breadcrumb" aria-label="Breadcrumb"><a href="/intelligence/">Wahoo Intelligence</a><span aria-hidden="true">/</span><span aria-current="page">Work record</span></nav>
 <header class="wi-work-heading"><p class="eyebrow">WAHOO INTELLIGENCE / ACTIVITY LOG</p><h1>The work,<br><em>recorded.</em></h1><p class="wi-work-lead">Explore the actions behind the work. Reads, edits, commands, reviews and decisions, with their recorded outcomes.</p><p class="wi-work-context">A public, privacy-reviewed history from available records. A request records intent; a completed action records its outcome. Neither alone establishes engineering validation.</p></header>
 <nav class="al-navigation" aria-label="Work records"><a href="#activity" aria-current="location">Action ledger</a><a href="#milestones">Original milestones ↓</a></nav>
 <section id="activity" aria-labelledby="al-heading">
 <dl class="al-counts" aria-label="Action ledger totals"><div><dt>Recorded actions</dt><dd data-al-total>—</dd></div><div><dt>In selected period</dt><dd data-al-period>—</dd></div><div><dt>Matching filters</dt><dd data-al-matches>—</dd></div></dl>
 <div class="wi-work-list-heading"><h2 id="al-heading">The action ledger</h2><p>Latest first</p></div>
 <p class="al-coverage" data-al-sync></p><p class="al-coverage" data-al-coverage>Loading coverage information…</p><p class="al-coverage" data-al-limitations></p>
 <form class="al-filters" role="search" aria-label="Filter recorded actions" data-al-filters>
 <fieldset disabled data-al-controls><legend class="al-sr">Action filters</legend>
 <label class="al-search">Search actions<input type="search" name="search" placeholder="Search actions, topics or evidence" autocomplete="off"></label>
 <label>Period<select name="month"><option value="">Latest available month</option></select></label>
 <label>Agent / author<select name="actor"><option value="">All agents and authors</option></select></label>
 <label>Action type<select name="kind"><option value="">All action types</option></select></label>
 <label>Recorded outcome<select name="status"><option value="">All outcomes</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="requested">Requested only</option><option value="observed">Observed</option><option value="unknown">Unknown</option></select></label>
 <label>From date<input type="date" name="from"></label><label>To date<input type="date" name="to"></label>
 <button type="reset">Clear filters</button></fieldset></form>
 <p class="al-results" data-al-results role="status" aria-live="polite" aria-atomic="true">Loading the latest available actions…</p>
 <button class="wi-work-more" type="button" data-al-retry hidden>Retry loading</button>
 <p class="al-time-note">Times are shown in UTC. Day-only records have no inferred time. Open an action for its topic and evidence.</p>
 <div class="al-list" data-al-list></div><p class="wi-work-empty" data-al-empty hidden>No actions match these filters. Try another period or clear the filters.</p>
 <button class="wi-work-more" type="button" data-al-more hidden>Load 40 more actions</button>
 <noscript><p>The action ledger needs JavaScript to load its monthly records. The original milestones remain available below.</p></noscript>
 <p class="wi-work-footnote">Counts describe individual recorded actions, not tasks or the number of agents. Available history may omit actions or outcomes; coverage information describes the imported sources.</p>
 </section></div>
 <details id="milestones" class="al-milestones wrap"><summary>Original milestones <span>Curated project updates, preserved separately</span></summary>${milestoneHTML}</details>`;
}
