const drawings={
  'electronics-03':['03_injection_paths','Intake, transfer-port and chamber direct injection are alternative architectures. Intake EFI is provisional; chamber DI is not selected.'],
  'electronics-06':['06_operating_states','Proposed operating states and simplified transitions. No fault thresholds or restart rules have been validated.'],
};
export function electronicsVisual(key){
  const drawing=drawings[key];if(!drawing)return '';
  const [file,caption]=drawing;
  return `<figure class="engineering-visual study-plot"><a href="/assets/engineering/electronics-${file}.svg" aria-label="Open full-size control diagram"><img src="/assets/engineering/electronics-${file}.svg" alt="${caption}" loading="lazy" decoding="async"></a><figcaption>${caption} Open for full-size inspection.</figcaption></figure>`;
}
export function electronicsOverview(){return `<section class="wrap section"><p class="eyebrow">ELECTRONICS / R01 · RESEARCH SPECIFICATION</p><h2>Engine management.<br>Vehicle control.<br>Shared electrical integration.</h2><p class="lead">Three coordinated packages, with clear responsibilities. EFI is a requirement; the components, marine installation and adaptive strategies remain under investigation.</p><figure class="engineering-visual study-plot"><a href="/assets/engineering/electronics-01_system_architecture.svg" aria-label="Open electronics architecture diagram"><img src="/assets/engineering/electronics-01_system_architecture.svg" alt="Engine management and vehicle control are sibling packages, supported by shared electrical integration" loading="lazy" decoding="async"></a><figcaption>Proposed functional architecture · not a wiring diagram or a validated system.</figcaption></figure><div class="evidence-links">${[
  ['electronics-control-architecture','01 / ARCHITECTURE','Define the system boundaries'],
  ['electronics-engine-management','02 / ENGINE MANAGEMENT','Fuel, ignition and event timing'],
  ['electronics-vehicle-control','03 / VEHICLE CONTROL','Logging first; bounded requests later'],
  ['electronics-electrical-integration','04 / ELECTRICAL INTEGRATION','Power, harness and marine exposure'],
  ['electronics-validation','05 / VALIDATION PLAN','From bench signals to water trials'],
].map(([slug,tag,title])=>`<a href="/journal/${slug}/"><small>${tag}</small><h3>${title}</h3><span>Read the research record ↗</span></a>`).join('')}</div><p class="caption">Provisional shortlist: MaxxECU SPORT + Teensy 4.1, with intake EFI. No purchase, completed calibration, marine qualification or adaptive riding test is recorded in R01.</p></section>`;}
