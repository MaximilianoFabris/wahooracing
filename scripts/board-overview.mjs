const sideContour=JSON.parse(await readFile(new URL('../content/board-side-contour.json',import.meta.url),'utf8'));
import {readFile} from 'node:fs/promises';
const geometry=JSON.parse(await readFile(new URL('../content/board-silhouettes.json',import.meta.url),'utf8'));
const anatomy=JSON.parse(await readFile(new URL('../content/board-components.json',import.meta.url),'utf8'));
const groups=[
 ['Dimensions',[
 ['Length','1,650–1,750 mm (target)','hull'],['Width','550–600 mm (target)','hull'],['Height','250–300 mm (target)','hull'],['Dry weight','17 kg (target)','hull'],['Maximum load','120 kg (target)','hull'],['Fuel capacity','3 L','fuel'],['Hull material','Carbon Fiber','hull'],['Bindings','Footpads / Straps · Goofy and Regular','rider']]],
 ['Engine',[
 ['Type','Horizontal single-cylinder 2-stroke','engine'],['Displacement','124.817 cc · nominal 125 cc','engine'],['Bore × stroke','54.00 × 54.50 mm','engine'],['Fuel','Unleaded 95 + full synthetic 2 stroke racing oil','fuel'],['Fuel delivery','EFI · intake injection working direction','fuel'],['Exhaust','Tuned pipe · geometry TBD','exhaust'],['Top speed','75 km/h / 46.6 mph (target)','hull']]],
 ['Drive unit',[
 ['Propulsion','Waterjet','pump'],['Drive ratio','To be confirmed','pump'],['Impeller diameter','70 mm · WJ70-C01 concept','pump'],['Rotor blades','3 · WJ70-C01 concept','pump'],['Impeller pitch','TBD · not released','pump'],['Stator vanes','5 · WJ70-C01 concept','pump'],['Liner bore','70.6 mm · proposed','pump'],['Nozzle outlet','48 mm · proposed','pump']]],
 ['Electrical',[
 ['Engine ECU','MaxxECU SPORT · provisional candidate','electronics'],['Vehicle controller','Teensy 4.1 · prototype candidate','electronics'],['Ignition','ECU-managed · calibration TBD','electronics'],['Starter','Brushless electric · requirement','electronics'],['Battery','Voltage / chemistry / capacity TBD','electronics'],['Charging','Architecture / charging time TBD','electronics'],['Bilge pump','Installation under development','bilge']]]
];
function drawing(view){
 const plan=view==='plan',y=plan?190:140;const coord=p=>`${(80+p[0]*4.1).toFixed(2)},${(y-p[1]*4.1).toFixed(2)}`;
 const path=plan?geometry[view].map(edge=>'M'+coord(edge[0])+'L'+coord(edge[1])).join(''):'M'+sideContour.points.map(coord).join('L')+'Z';
 const components=plan?`<g class="board-anatomy">${anatomy.parts.map(part=>`<g class="board-component" data-component="${part.key}" role="button" tabindex="0" aria-label="Select ${part.title}" aria-pressed="false"><title>${part.title}</title>${part.paths.map(d=>`<path d="${d}"/>`).join('')}</g>`).join('')}</g>`:'';
 return `<svg class="board-lines" viewBox="${plan?'0 65 900 255':'0 40 900 125'}" role="${plan?'group':'img'}" aria-label="${plan?'Plan':'Side'} projection of native hull surface samples, including the shaped stern. Stern left, bow right.">${plan?'<path class="board-datum" d="M60 190H830"/>':''}${plan?`<path class="hull-wire" d="${path}"/><path class="board-highlight" data-board-region="hull" d="${path}"/>`:`<path class="hull-wire side-contour" d="${path}"/>`}${components}</svg>`;
}
export function boardOverview(){let i=0;return `<section class="wrap board-heading"><div class="board-heading-copy"><p class="eyebrow">THE BOARD / DESIGN REGISTER</p><h1>The board.<br>In detail.</h1></div><div class="board-diagrams"><div class="board-selection-status" aria-live="polite"><span data-board-selection>Hull dimensions</span><small data-board-location>Geometry highlighted</small></div>${drawing('plan')}</div></section><section class="wrap section board-overview" aria-label="Board specifications"><div class="spec-groups">${groups.map(([name,rows])=>`<section class="spec-group"><h3>${name}</h3><dl>${rows.map(([label,value,zone])=>`<div><dt>${label}</dt><dd><button type="button" class="board-spec" data-board-spec="${i++}" data-zone="${zone}" aria-pressed="false" aria-label="${label}: ${value}"><span class="spec-name">${label}</span><strong>${value}</strong></button></dd></div>`).join('')}</dl></section>`).join('')}</div></section>${flowOverview()}`;}

const flowRoutes=[
 ['air','Air intake','Air enters at the bow and follows the earlier concept’s internal and peripheral routes toward the engine.','M825 190H760 M750 190H590L500 150H405V185 M750 190L690 120L365 105V175', '#668ebf'],
 ['breather','Tank breather','The tank vent is shown separately from the engine air intake. Final vent routing remains to be defined.','M515 215V290H565', '#6ba85e'],
 ['cooling','Cooling water','Conceptual water supply near the jet pump, with a route to the engine and a separate overboard outlet. The cooling architecture remains open.','M170 190V235H375V210 M395 215V290H450', '#ba7ca9'],
 ['exhaust','Exhaust gas','Exhaust leaves the engine through the tuned-pipe silhouette and exits at the stern. Final pipe geometry remains under development.','M375 210V265H95', '#cf6374'],
 ['bilge','Bilge discharge','A separate bilge pump route removes water from inside the hull. The outlet position is illustrative.','M197 125H170V70H125', '#bd963d']
];
function flowOverview(){
 const base=drawing('plan').replace(/<g class="board-component"[^>]*>/g,'<g class="board-component-static">').replace(/<title>[\s\S]*?<\/title>/g,'');
 const overlays=flowRoutes.map(([id,name,description,d,color])=>`<g class="flow-route" data-flow-route="${id}" style="--route-color:${color}"><title>${name}</title><path d="${d}" marker-end="url(#flow-arrow-${id})"/></g>`).join('');
 const defs=`<defs>${flowRoutes.map(([id,,,,color])=>`<marker id="flow-arrow-${id}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="${color}" stroke-width="1.5"/></marker>`).join('')}</defs>`;
 const svg=base.replace('viewBox="0 65 900 255"','viewBox="0 35 900 300"').replace('role="group"','role="img"').replace('aria-label="Plan projection of native hull surface samples, including the shaped stern. Stern left, bow right."','aria-label="Illustrative air, breather, cooling, exhaust and bilge flow routes on the current hull. Bow right, stern left."').replace('</svg>',defs+overlays+'</svg>');
 return `<section class="wrap section board-flows"><p class="eyebrow">BOARD ANATOMY / FLOW PATHS</p><h2>What moves through the board.</h2><p class="flow-intro">Air in. Exhaust out. Separate paths for cooling water, tank ventilation and bilge discharge.</p><div class="flow-controls" role="group" aria-label="Highlight a flow route"><button type="button" data-flow="all" aria-pressed="true">All routes</button>${flowRoutes.map(([id,name,,,color])=>`<button type="button" data-flow="${id}" aria-pressed="false" style="--route-color:${color}"><span aria-hidden="true"></span>${name}</button>`).join('')}</div>${svg}<p class="flow-description board-selection-status" aria-live="polite"></p></section>`;
}
