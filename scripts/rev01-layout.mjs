import {landingStory} from './landing-story.mjs';
import {systemIcon} from './system-icons.mjs';
// Claude Design composition, rendered by the existing static content pipeline.
export function brand(tone='white',word=false){return `<img src="/assets/brand/wahoo-${word?'name-':''}${tone}.png" alt="Wahoo" width="${word?2798:1732}" height="${word?400:2798}">`;}
export function home({site,updates,sections,img,link,card,chart,flow,sectionFigures}){return `
<section class="brand-opening ownership-opening" aria-label="Wahoo Racing"><div class="brand-stage"><div class="brand-frame"><span class="brand-glow" aria-hidden="true"></span><img src="/assets/brand/wahoo-symbol-white.png" alt="Wahoo" width="1303" height="1958"></div><p class="ownership-statement"><span>You</span><span>Own</span><span>It<span class="ownership-period">.</span></span></p></div><a class="brand-scroll" href="#intro" aria-label="Scroll to start">Scroll<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a></section>
${landingStory}

<section class="section board-panel" id="board"><div class="wrap"><p class="eyebrow">01 / THE BOARD</p><div class="board-summary"><h2>Eleven systems.<br>Every detail<br>has a reason.</h2><nav class="board-system-links" aria-label="Explore the eleven board systems">${site.systems.map((s,i)=>`<a href="/systems/${s.slug}/">${systemIcon(i)}<span>${s.name}</span></a>`).join('')}</nav></div></div></section>
<section class="section wrap home-evidence"><p class="eyebrow">02 / EVIDENCE</p><div class="heading-row"><h2>Cut it open.<br>Float it.</h2><p class="lead">Real geometry and source calculations. Explore the complete studies for methods, assumptions and limitations.</p></div><div class="split"><div class="station-explorer"><h3>Transverse sections</h3><p class="caption">H0 R02 · actual sampled coordinates, equal axis scale.</p><div class="view-controls" role="group" aria-label="Hull section station">${sectionFigures.map(({station})=>`<button type="button" data-station="${station}" aria-pressed="${station===50}">${station}%</button>`).join('')}</div>${sectionFigures.map(({station,svg})=>`<figure data-station-figure="${station}" ${station===50?'':'hidden'}>${svg}</figure>`).join('')}<p class="caption">0% = stern, 100% = bow. All valid source branches retained. Geometric study, not a performance test.</p>${link('/systems/hull-hydrodynamics/','Open hull & hydrodynamics')}</div>${chart()}</div></section>

<section class="section wrap"><div class="heading-row"><div><p class="eyebrow">04 / THE JOURNAL</p><h2>The work,<br>in the open.</h2></div>${link('/journal/','All '+updates.length+' investigations')}</div></section>

`;}
