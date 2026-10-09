// Claude's four-stage timeline, using the existing geometry and published records.
export function landingTimeline(sectionFigures){
 const contour=sectionFigures.find(({station})=>station===75).svg.match(/<polyline[^>]*points="([^"]+)"/)[1];
 const stages=[
  ['Archive','Before H0','Original sketches, the earlier complete-board concept and rider-interface studies.','/journal/early-design-archive/',`<svg viewBox="0 0 24 24" class="timeline-archive" role="img" aria-label="Design archive"><path d="M2 3h20v5H2Z M4 8v13h16V8 M10 12h4"/></svg>`],
  ['H0 / R01','Establish the reference','Coordinates and reference checks.','/journal/reference-system/',`<img src="/assets/hull-bottom.webp" alt="H0 hull underside" loading="lazy">`],
  ['H0 / R02','Examine the surface','Sections, fairness and feature intent.','/journal/surface-investigation/',`<svg viewBox="40 100 400 130" class="timeline-contour" role="img" aria-label="Actual H0 R02 transverse section at station 75 percent"><path d="M48 206H432"/><polyline points="${contour}"/></svg>`],
  ['H0 / R03','Flotation & balance','The sealed-envelope displacement study.','/journal/level-attitude-displacement/',`<img src="/assets/hull-hero.webp" alt="H0 R03 hull geometry" loading="lazy">`]
 ];
 return `<section class="landing-timeline" id="story"><p class="eyebrow">The story so far</p><div class="timeline-heading"><h2>From sketch to surface.</h2><p>Every stage stays in the record. Earlier concepts are labelled as archive, never as the current board.</p></div><ol>${stages.map(([rev,title,text,url,visual],i)=>`<li${i===3?' class="timeline-latest"':''}><a href="${url}"><span class="timeline-track" aria-hidden="true"><span></span></span><span class="timeline-revision">${rev}</span><div class="timeline-visual">${visual}</div><h3>${title}</h3><p>${text}</p></a></li>`).join('')}</ol><a class="text-link timeline-record" href="/history/">Open the full development record <span aria-hidden="true">↗</span></a></section>`;
}
