import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Zap, BarChart3, ChevronLeft, ChevronRight, Trophy, Target, Flame } from 'lucide-react';

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR (Mulberry32)
// ============================================================================
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seededRandom(patternId) {
  let seed = 0;
  for (let i = 0; i < patternId.length; i++) {
    seed = ((seed << 5) - seed) + patternId.charCodeAt(i);
    seed |= 0;
  }
  return mulberry32(seed);
}

// ============================================================================
// ACCURATE ICAP PATTERN DATABASE
// ============================================================================
const PATTERNS = [
  // NUCLEAR PATTERNS
  {
    id: 'AC-0',
    name: 'Negative',
    category: 'nuclear',
    level: 'competent',
    tier: 1,
    description: 'No staining. Negative control.',
    keyFeature: 'Complete absence of fluorescent staining',
    antigens: 'None',
    clinicalAssociation: 'Negative control / healthy individuals',
    confusedWith: [],
    goblinNote: 'The empty glass — no antibodies here. Clean bill of health.',
    frequency: 'baseline',
    type: 'negative',
  },
  {
    id: 'AC-1',
    name: 'Nuclear Homogeneous',
    category: 'nuclear',
    level: 'competent',
    tier: 1,
    description: 'Uniform smooth staining of entire nucleus, enhanced rim during mitosis.',
    keyFeature: 'Even, continuous fluorescence throughout the nucleus',
    antigens: 'dsDNA, nucleosomes, histones',
    clinicalAssociation: 'SLE, drug-induced lupus',
    confusedWith: ['AC-2'],
    goblinNote: 'Gryf\'s fingerprints — anti-dsDNA antibodies are IgG class, and Gryf is the one who goes rogue in lupus. The homogeneous pattern is his calling card.',
    frequency: 'very common',
    type: 'homogeneous',
  },
  {
    id: 'AC-2',
    name: 'Nuclear Dense Fine Speckled (DFS70)',
    category: 'nuclear',
    level: 'competent',
    tier: 1,
    description: 'Dense heterogeneous speckles, variable size/brightness, lunar surface texture. Antigens are DFS70/LEDGFp75 (NOT histones). Often found in healthy individuals.',
    keyFeature: 'Heterogeneous speckles of varying brightness, lunar/cratered appearance',
    antigens: 'DFS70/LEDGFp75',
    clinicalAssociation: 'Frequently found in HEALTHY individuals — negatively associated with systemic autoimmune disease when isolated',
    confusedWith: ['AC-1', 'AC-30'],
    goblinNote: 'The great impostor — looks alarming but AC-2 alone actually means you\'re probably fine. It\'s anti-DFS70, not the goblins going rogue. Knowing this pattern saves patients from unnecessary panic.',
    frequency: 'common',
    type: 'denseSpeckled',
  },
  {
    id: 'AC-3',
    name: 'Centromere',
    category: 'nuclear',
    level: 'competent',
    tier: 1,
    description: 'Discrete dots (40-80 per nucleus), one per chromosome, align on metaphase plate.',
    keyFeature: '40-80 evenly spaced dots, typically in a linear/clustered arrangement',
    antigens: 'CENP-A, CENP-B',
    clinicalAssociation: 'Limited cutaneous systemic sclerosis, Raynaud\'s, primary biliary cholangitis',
    confusedWith: ['AC-6', 'AC-7'],
    goblinNote: 'When Betty the B cell makes anti-centromere antibodies, this is the pattern. Betty\'s mostly behaving here — this one\'s more scleroderma than lupus.',
    frequency: 'moderately common',
    type: 'centromere',
  },
  {
    id: 'AC-4',
    name: 'Nuclear Fine Speckled',
    category: 'nuclear',
    level: 'competent',
    tier: 2,
    description: 'Small even speckles throughout nuclei. Smaller and more regular than AC-5.',
    keyFeature: 'Fine, regularly distributed speckles of uniform size',
    antigens: 'SS-A/Ro (Ro52+Ro60), SS-B/La, Mi-2, TIF1γ, Ku',
    clinicalAssociation: 'Sjögren\'s syndrome, SLE, dermatomyositis',
    confusedWith: ['AC-2', 'AC-5'],
    goblinNote: 'The speckled squad — Gryf (IgG) is usually behind anti-Ro/La. When Merlin (IgM) joins the party, things get complicated.',
    frequency: 'very common',
    type: 'fineSpeckled',
  },
  {
    id: 'AC-5',
    name: 'Nuclear Large/Coarse Speckled',
    category: 'nuclear',
    level: 'competent',
    tier: 2,
    description: 'Larger prominent speckles, widely spaced. Visibly larger than AC-4.',
    keyFeature: 'Larger, more prominent speckles with clear spacing between them',
    antigens: 'Sm, U1-RNP',
    clinicalAssociation: 'Mixed connective tissue disease (MCTD), SLE',
    confusedWith: ['AC-4', 'AC-6'],
    goblinNote: 'Only ~65% of labs can reliably tell AC-4 from AC-5 apart. The coarse speckles are Sm and U1-RNP territory.',
    frequency: 'common',
    type: 'coarseSpeckled',
  },
  {
    id: 'AC-6',
    name: 'Multiple Nuclear Dots',
    category: 'nuclear',
    level: 'expert',
    tier: 2,
    description: 'Multiple discrete dots (6-20+) throughout nucleus, random distribution.',
    keyFeature: '6-20+ discrete bright dots, random pattern',
    antigens: 'Sp100',
    clinicalAssociation: 'Primary biliary cholangitis (PBC)',
    confusedWith: ['AC-3', 'AC-7'],
    goblinNote: 'More dots than AC-7 but fewer and bigger than centromere. When the liver\'s complaining, sometimes this is what you see.',
    frequency: 'less common',
    type: 'multipleNuclearDots',
  },
  {
    id: 'AC-7',
    name: 'Few Nuclear Dots',
    category: 'nuclear',
    level: 'expert',
    tier: 2,
    description: '1-6 discrete bright dots per nucleus (Cajal bodies or PML bodies).',
    keyFeature: '1-6 bright discrete dots, very few per nucleus',
    antigens: 'p80-coilin (Cajal bodies), PML protein',
    clinicalAssociation: 'Primary biliary cholangitis, Sjögren\'s, SLE',
    confusedWith: ['AC-3', 'AC-6'],
    goblinNote: 'Sometimes less is more. These are Cajal bodies or PML bodies — specific nuclear organelles lighting up.',
    frequency: 'rare',
    type: 'fewNuclearDots',
  },
  {
    id: 'AC-8',
    name: 'Nucleolar Homogeneous',
    category: 'nuclear',
    level: 'competent',
    tier: 2,
    description: 'Smooth uniform staining of nucleolus.',
    keyFeature: 'Bright, smooth, continuous staining of the nucleolar region',
    antigens: 'PM-Scl75, PM-Scl100, Th/To, B23/nucleophosmin',
    clinicalAssociation: 'Systemic sclerosis, polymyositis/dermatomyositis overlap',
    confusedWith: ['AC-9', 'AC-10'],
    goblinNote: 'The nucleolus is the ribosome factory. Smooth uniform glow means antibodies coating it evenly.',
    frequency: 'moderately common',
    type: 'nucleolarHomogeneous',
  },
  {
    id: 'AC-9',
    name: 'Nucleolar Clumpy',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Clumpy/coarse granular nucleolar staining. Requires 400x magnification to reliably distinguish from AC-8.',
    keyFeature: 'Coarse, granular, clumpy appearance in nucleolus (like cottage cheese vs cream)',
    antigens: 'U3-RNP (fibrillarin)',
    clinicalAssociation: 'Diffuse cutaneous systemic sclerosis',
    confusedWith: ['AC-8', 'AC-10'],
    goblinNote: 'Clumpy like cottage cheese instead of smooth cream. Anti-fibrillarin = diffuse scleroderma territory. Requires 400x to distinguish from AC-8.',
    frequency: 'less common',
    type: 'nucleolarClumpy',
  },
  {
    id: 'AC-10',
    name: 'Nucleolar Punctate/Speckled',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Fine speckled pattern within nucleolus only.',
    keyFeature: 'Fine speckles confined to the nucleolar region',
    antigens: 'RNA polymerase I, hUBF/NOR-90',
    clinicalAssociation: 'Systemic sclerosis, SLE',
    confusedWith: ['AC-8', 'AC-9'],
    goblinNote: 'The nucleolus is spotted — speckles confined to just the nucleolus, not the whole nucleus. Only about a third of lab professionals can reliably sub-type the nucleolar trio.',
    frequency: 'less common',
    type: 'nucleolarSpeckled',
  },
  {
    id: 'AC-11',
    name: 'Smooth Nuclear Envelope',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Smooth continuous staining along nuclear membrane.',
    keyFeature: 'Bright rim/outline around entire nuclear perimeter, dark interior',
    antigens: 'Lamins A/B/C, lamin B receptor',
    clinicalAssociation: 'SLE, seronegative RA, linear scleroderma',
    confusedWith: ['AC-1', 'AC-12'],
    goblinNote: 'The nuclear castle wall glows smoothly. Different from the uniform interior glow of AC-1 — here it\'s just the envelope.',
    frequency: 'rare',
    type: 'nuclearEnvelope',
  },
  {
    id: 'AC-12',
    name: 'Punctate Nuclear Envelope',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Punctate/dotted staining along nuclear membrane.',
    keyFeature: 'Dots distributed along the nuclear membrane, not continuous',
    antigens: 'Nuclear pore complex proteins (gp210, Nup62)',
    clinicalAssociation: 'Primary biliary cholangitis (gp210 is highly specific)',
    confusedWith: ['AC-11', 'AC-6'],
    goblinNote: 'Same castle wall, but the antibodies hit specific gateposts instead of the whole wall. gp210 = PBC calling card.',
    frequency: 'rare',
    type: 'punctateEnvelope',
  },
  {
    id: 'AC-13',
    name: 'PCNA-like',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Variable staining depending on cell cycle: mix of negative, dim, and bright nuclei in same field.',
    keyFeature: 'Pleomorphic — nuclei show varying intensities in the same field',
    antigens: 'PCNA (proliferating cell nuclear antigen)',
    clinicalAssociation: 'SLE (rare but specific)',
    confusedWith: ['AC-4', 'AC-2'],
    goblinNote: 'The pattern changes depending on where each cell is in its cycle — some nuclei glow bright (S-phase), some are dim, some dark. That pleomorphism IS the tell.',
    frequency: 'rare',
    type: 'pcnaLike',
  },
  {
    id: 'AC-14',
    name: 'CENP-F-like',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Weak/negative interphase nuclei BUT bright metaphase chromatin. The "ninja pattern."',
    keyFeature: 'Mostly dark interphase nuclei, but dividing cells light up brightly at metaphase plate',
    antigens: 'CENP-F (mitosin)',
    clinicalAssociation: 'Various cancers, some autoimmune conditions',
    confusedWith: ['AC-3', 'AC-28'],
    goblinNote: 'The ninja pattern — hides during interphase, reveals itself during mitosis. Almost the opposite of what you\'d expect.',
    frequency: 'rare',
    type: 'cenpF',
  },
  {
    id: 'AC-15',
    name: 'Cytoplasmic Fibrillar Linear',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Linear fibers following actin stress fibers.',
    keyFeature: 'Linear fiber pattern following cellular axes',
    antigens: 'F-actin (smooth muscle antibodies/SMA), non-muscle myosin',
    clinicalAssociation: 'Autoimmune hepatitis type 1, chronic active hepatitis',
    confusedWith: ['AC-16', 'AC-17'],
    goblinNote: 'The cytoskeleton\'s cables lit up like highway lines. Anti-smooth muscle antibodies = think liver.',
    frequency: 'uncommon',
    type: 'cytoplasmicLinear',
  },
  {
    id: 'AC-16',
    name: 'Cytoplasmic Fibrillar Filamentous',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Network pattern following intermediate filaments.',
    keyFeature: 'Network/meshwork pattern in cytoplasm',
    antigens: 'Vimentin, cytokeratin',
    clinicalAssociation: 'Various infections, autoimmune conditions, often clinically insignificant',
    confusedWith: ['AC-15', 'AC-17'],
    goblinNote: 'The cell\'s internal scaffolding is glowing — a different kind of cable than AC-15\'s actin fibers.',
    frequency: 'uncommon',
    type: 'cytoplasmicNetwork',
  },
  {
    id: 'AC-17',
    name: 'Cytoplasmic Fibrillar Segmental',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Discontinuous/segmental fiber staining.',
    keyFeature: 'Dashed or segmental lines in cytoplasm',
    antigens: 'Alpha-actinin, vinculin',
    clinicalAssociation: 'Very rare in diagnostic serology',
    confusedWith: ['AC-15', 'AC-16'],
    goblinNote: 'The dashed lines of the cytoskeleton. One of the rarest patterns to actually encounter in clinical practice.',
    frequency: 'very rare',
    type: 'cytoplasmicSegmental',
  },
  {
    id: 'AC-18',
    name: 'Cytoplasmic Discrete Dots / GW Bodies',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Few large bright dots in cytoplasm (4-20 per cell). GW body/P-body components.',
    keyFeature: 'Few large bright dots in cytoplasm (not nucleus)',
    antigens: 'GW182, Ge-1 (GW body/P-body components, mRNA processing)',
    clinicalAssociation: 'Various autoimmune, neurological conditions',
    confusedWith: ['AC-7', 'AC-20'],
    goblinNote: 'The cell\'s mRNA shredding stations light up. GW bodies are where the cell processes and degrades messenger RNA.',
    frequency: 'uncommon',
    type: 'cytoplasmicGWDots',
  },
  {
    id: 'AC-19',
    name: 'Cytoplasmic Dense Fine Speckled',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Dense homogeneous/fine speckled cytoplasmic staining.',
    keyFeature: 'Dense uniform or fine speckled staining throughout cytoplasm',
    antigens: 'PL-7, PL-12, ribosomal P protein, SRP (signal recognition particle), Jo-1/histidyl-tRNA synthetase',
    clinicalAssociation: 'Anti-synthetase syndrome, SLE (anti-ribosomal P), polymyositis',
    confusedWith: ['AC-20', 'AC-21'],
    goblinNote: 'When the cytoplasm glows uniformly — anti-ribosomal P (SLE with neuropsychiatric features) or anti-Jo-1 (the mechanic\'s hands antibody in anti-synthetase syndrome).',
    frequency: 'moderately common',
    type: 'cytoplasmicDenseSpeckled',
  },
  {
    id: 'AC-20',
    name: 'Cytoplasmic Fine Speckled',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 1,
    description: 'Fine speckled pattern in cytoplasm, nucleus appears relatively clean.',
    keyFeature: 'Stars in the cytoplasm, dark nucleus',
    antigens: 'Jo-1/anti-synthetases, anti-SRP, PL-7, PL-12',
    clinicalAssociation: 'Polymyositis, dermatomyositis, anti-synthetase syndrome',
    confusedWith: ['AC-19', 'AC-21'],
    goblinNote: 'Stars in the cytoplasm, dark nucleus. This is one of the most commonly detected cytoplasmic patterns.',
    frequency: 'very common',
    type: 'cytoplasmicSpeckled',
  },
  {
    id: 'AC-21',
    name: 'Cytoplasmic Reticular/AMA (Mitochondrial-like)',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Dense reticular/granular cytoplasmic staining following mitochondrial distribution.',
    keyFeature: 'Net-like/reticular pattern throughout cytoplasm',
    antigens: 'AMA (anti-mitochondrial antibodies, targeting PDC-E2)',
    clinicalAssociation: 'Primary biliary cholangitis (>95% specific for PBC)',
    confusedWith: ['AC-19', 'AC-20'],
    goblinNote: 'The janitors (complement) love this one — AMA targeting the mitochondria is practically a PBC diagnosis on a slide. The reticular pattern is the powerhouses crying for help.',
    frequency: 'common in PBC',
    type: 'cytoplasmicReticular',
  },
  {
    id: 'AC-22',
    name: 'Polar/Golgi-like',
    category: 'cytoplasmic',
    level: 'competent',
    tier: 2,
    description: 'Polar juxtanuclear crescent/cap shape.',
    keyFeature: 'Bright crescent or cap on one side of the nucleus',
    antigens: 'Golgin-95, golgin-97, giantin (Golgi matrix proteins)',
    clinicalAssociation: 'SLE, Sjögren\'s, cerebellar ataxia, viral infections',
    confusedWith: ['AC-19', 'AC-20'],
    goblinNote: 'The cell\'s post office — packaging and shipping proteins. A bright crescent hugging the nucleus.',
    frequency: 'uncommon',
    type: 'cytoplasmicGolgi',
  },
  {
    id: 'AC-23',
    name: 'Rods and Rings',
    category: 'cytoplasmic',
    level: 'expert',
    tier: 3,
    description: 'Distinct rod-shaped and ring-shaped cytoplasmic inclusions.',
    keyFeature: 'Literal rods and rings as distinct shapes in cytoplasm',
    antigens: 'IMPDH2, CTPS1',
    clinicalAssociation: 'Strongly associated with HCV treatment (interferon/ribavirin)',
    confusedWith: ['AC-18', 'AC-20'],
    goblinNote: 'The weirdest pattern in the catalog — literal rods and rings floating in the cytoplasm. Originally discovered in HCV patients on treatment. The shape is unmistakable once you\'ve seen it.',
    frequency: 'rare',
    type: 'rodsAndRings',
  },
  {
    id: 'AC-24',
    name: 'Centrosome',
    category: 'mitotic',
    level: 'expert',
    tier: 4,
    description: 'Bright dots at spindle poles during mitosis (1-2 dots at each pole). Also visible as perinuclear dots in interphase.',
    keyFeature: '1-2 bright dots at each spindle pole in dividing cells',
    antigens: 'Pericentrin, ninein, Cep250, enolase',
    clinicalAssociation: 'Systemic sclerosis, Raynaud\'s, Sjögren\'s',
    confusedWith: ['AC-18', 'AC-25'],
    goblinNote: 'The cell\'s division HQ lights up — bright beacons at the poles where the spindle assembles.',
    frequency: 'uncommon',
    type: 'centrosome',
  },
  {
    id: 'AC-25',
    name: 'Mitotic Spindle Apparatus (MSA)',
    category: 'mitotic',
    level: 'expert',
    tier: 4,
    description: 'Staining along spindle fibers connecting the poles during mitosis. THE KEY PATTERN AI FAILS AT.',
    keyFeature: 'Lines/fibers connecting spindle poles during mitosis',
    antigens: 'HsEg5/KSP, MSA-related proteins',
    clinicalAssociation: 'Various, not strongly disease-associated alone',
    confusedWith: ['AC-24', 'AC-26'],
    goblinNote: 'THE pattern that makes AI systems see "mitosis but green" and give up. Your human pattern recognition is better than Quest\'s algorithm here. The spindle fibers between the poles are the tell — not just the poles themselves.',
    frequency: 'uncommon',
    type: 'spindleApparatus',
  },
  {
    id: 'AC-26',
    name: 'NuMA-like',
    category: 'mitotic',
    level: 'expert',
    tier: 4,
    description: 'Staining of spindle poles and proximal spindle fibers with characteristic NuMA distribution. Bright at poles, fans out.',
    keyFeature: 'Fan-shaped glow at spindle poles, wider than centrosome dots',
    antigens: 'NuMA-1 (nuclear mitotic apparatus protein)',
    clinicalAssociation: 'Sjögren\'s, SLE, MCTD',
    confusedWith: ['AC-25', 'AC-24'],
    goblinNote: 'Like AC-25\'s cousin — NuMA protein creates a fan-shaped glow at the poles. The shape is the clue.',
    frequency: 'very rare',
    type: 'numaLike',
  },
  {
    id: 'AC-27',
    name: 'Intercellular Bridge / Stem Body',
    category: 'mitotic',
    level: 'expert',
    tier: 4,
    description: 'Bright staining at the intercellular bridge (midbody) between cells in late telophase.',
    keyFeature: 'Bright dot at the pinch point between two dividing cells',
    antigens: 'Various midbody proteins',
    clinicalAssociation: 'Various autoimmune',
    confusedWith: ['AC-25', 'AC-28'],
    goblinNote: 'The bridge between two dividing cells lights up — a single bright dot right at the pinch point where one cell becomes two.',
    frequency: 'rare (most common rare pattern at 0.78%)',
    type: 'intercellularBridge',
  },
  {
    id: 'AC-28',
    name: 'Mitotic Chromosomal Coat',
    category: 'mitotic',
    level: 'expert',
    tier: 4,
    description: 'Diffuse staining coating the condensed chromosomes during mitosis.',
    keyFeature: 'Bright staining on condensed chromosome mass during mitosis',
    antigens: 'Modified/phosphorylated histones, MCA (mitotic chromosome autoantibodies)',
    clinicalAssociation: 'Discoid lupus, various',
    confusedWith: ['AC-1', 'AC-25', 'AC-27'],
    goblinNote: 'The entire chromosome book is glowing — not just the spine (centromere) but the whole thing, coated in antibodies. Distinguished from AC-1 because the staining is ONLY on mitotic chromosomes.',
    frequency: 'uncommon',
    type: 'chromosomalCoat',
  },
  {
    id: 'AC-29',
    name: 'Topoisomerase I-like (Scl-70)',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'COMPOSITE pattern with 5 simultaneous elements: nuclear fine speckled + nucleolar staining + metaphase plate + perichromosomal staining + cytoplasmic haze.',
    keyFeature: 'Multiple pattern elements visible simultaneously (composite)',
    antigens: 'DNA topoisomerase I (Scl-70)',
    clinicalAssociation: 'Diffuse cutaneous systemic sclerosis (highly specific)',
    confusedWith: ['AC-4', 'AC-8'],
    goblinNote: 'The five-headed dragon of patterns — Gryf\'s anti-Scl-70 antibodies create a signature so complex it\'s essentially a fingerprint for diffuse scleroderma. Five elements at once. If you can spot all five, you\'re better than most lab techs.',
    frequency: 'rare but clinically critical',
    type: 'topoIsomerase',
  },
  {
    id: 'AC-30',
    name: 'Nuclear Fine Speckled with Mitotic Plate',
    category: 'nuclear',
    level: 'expert',
    tier: 3,
    description: 'Fine speckled but MORE UNIFORM than AC-2\'s heterogeneous lunar surface. OPPOSITE of AC-2 — indicates systemic autoimmune disease.',
    keyFeature: 'More uniform speckles than AC-2, less heterogeneous',
    antigens: 'NOT DFS70 — disease-causing antibodies (nucleosomes, dsDNA, Ro/La, RNP/Sm, Scl-70)',
    clinicalAssociation: 'Indicates systemic autoimmune disease (OPPOSITE of AC-2)',
    confusedWith: ['AC-2', 'AC-4'],
    goblinNote: 'AC-2\'s evil twin. Looks similar but means the opposite. AC-2 (DFS70) = probably fine. AC-30 = the goblins are actually here. The difference is speckle uniformity. This is one of the most important distinctions in the whole system.',
    frequency: 'emerging',
    type: 'uniformSpeckled',
  },
  {
    id: 'AC-31',
    name: 'Myriad Discrete Fine Speckled',
    category: 'nuclear',
    level: 'expert',
    tier: 4,
    description: 'Innumerable tiny discrete dots throughout nucleus, denser and more discrete than AC-4.',
    keyFeature: 'Sea of tiny discrete dots, much denser than AC-4',
    antigens: 'Anti-Ro60/SS-A (strongly associated)',
    clinicalAssociation: 'Sjögren\'s, neonatal lupus, subacute cutaneous lupus',
    confusedWith: ['AC-4', 'AC-2'],
    goblinNote: 'Gryf again (IgG anti-Ro60 crosses the placenta) — a sea of tiny stars. Anti-Ro60 is one of the antibodies that can affect a baby before it\'s born. The myriad dots are its calling card.',
    frequency: 'emerging',
    type: 'myriads',
  },
];

// ============================================================================
// PATTERN RENDERER
// ============================================================================
function PatternRenderer({ patternId, size = 300 }) {
  const pattern = PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;

  const rng = seededRandom(patternId);
  const numCells = Math.floor(8 + rng() * 6);
  const cellRadius = size / 8;

  const generateCell = (index) => {
    const angle = (index / numCells) * Math.PI * 2;
    const distance = (size / 3) * (0.4 + rng() * 0.4);
    return {
      x: size / 2 + Math.cos(angle) * distance,
      y: size / 2 + Math.sin(angle) * distance,
      r: cellRadius * (0.8 + rng() * 0.3),
    };
  };

  const cells = Array.from({ length: numCells }, (_, i) => generateCell(i));

  const renderPattern = () => {
    switch (pattern.type) {
      case 'negative':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.7} fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        );

      case 'homogeneous':
        return (
          <g>
            <defs>
              <radialGradient id="homogradient">
                <stop offset="0%" stopColor="#00ff41" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#00ff41" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
              </radialGradient>
            </defs>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="url(#homogradient)" />
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#00ff41" strokeWidth="0.5" opacity="0.5" />
              </g>
            ))}
          </g>
        );

      case 'denseSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 80 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  const opacity = Math.random() > 0.5 ? 0.9 : 0.4;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r={0.5 + rng() * 1}
                      fill="#00ff41"
                      opacity={opacity}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'centromere':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 50 }, (_, d) => {
                  const angle = (d / 50) * Math.PI * 2;
                  const dotDist = cell.r * (0.3 + (d % 2) * 0.4);
                  const dx = cell.x + Math.cos(angle) * dotDist;
                  const dy = cell.y + Math.sin(angle) * dotDist;
                  return (
                    <circle
                      key={`d${d}`}
                      cx={dx}
                      cy={dy}
                      r="1.5"
                      fill="#00ff41"
                      opacity="0.9"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'fineSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 40 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.8"
                      fill="#00ff41"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'coarseSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 18 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="1.8"
                      fill="#00ff41"
                      opacity="0.9"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'multipleNuclearDots':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 12 }, (_, d) => {
                  const dx = cell.x + (rng() - 0.5) * cell.r * 1.6;
                  const dy = cell.y + (rng() - 0.5) * cell.r * 1.6;
                  const dist = Math.hypot(dx - cell.x, dy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`d${d}`}
                      cx={dx}
                      cy={dy}
                      r="1.2"
                      fill="#00ff41"
                      opacity="0.95"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'fewNuclearDots':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 3 }, (_, d) => {
                  const dx = cell.x + (rng() - 0.5) * cell.r * 1.4;
                  const dy = cell.y + (rng() - 0.5) * cell.r * 1.4;
                  return (
                    <circle
                      key={`d${d}`}
                      cx={dx}
                      cy={dy}
                      r="1.5"
                      fill="#00ff41"
                      opacity="0.95"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'nucleolarHomogeneous':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle
                  cx={cell.x}
                  cy={cell.y}
                  r={cell.r * 0.35}
                  fill="#00ff41"
                  opacity="0.85"
                />
              </g>
            ))}
          </g>
        );

      case 'nucleolarClumpy':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 6 }, (_, c) => {
                  const angle = (c / 6) * Math.PI * 2;
                  const cx = cell.x + Math.cos(angle) * cell.r * 0.2;
                  const cy = cell.y + Math.sin(angle) * cell.r * 0.2;
                  return (
                    <circle
                      key={`c${c}`}
                      cx={cx}
                      cy={cy}
                      r="2"
                      fill="#00ff41"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'nucleolarSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 15 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 0.6;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 0.6;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.6"
                      fill="#00ff41"
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'nuclearEnvelope':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle
                  cx={cell.x}
                  cy={cell.y}
                  r={cell.r}
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        );

      case 'punctateEnvelope':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 20 }, (_, d) => {
                  const angle = (d / 20) * Math.PI * 2;
                  const dx = cell.x + Math.cos(angle) * cell.r;
                  const dy = cell.y + Math.sin(angle) * cell.r;
                  return (
                    <circle
                      key={`d${d}`}
                      cx={dx}
                      cy={dy}
                      r="1"
                      fill="#00ff41"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'pcnaLike':
        return (
          <g>
            {cells.map((cell, i) => {
              const brightness = rng();
              let opacity = 0.2;
              if (brightness > 0.66) opacity = 0.85;
              else if (brightness > 0.33) opacity = 0.5;

              return (
                <g key={i}>
                  <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                  <circle
                    cx={cell.x}
                    cy={cell.y}
                    r={cell.r * 0.85}
                    fill="#00ff41"
                    opacity={opacity}
                  />
                </g>
              );
            })}
          </g>
        );

      case 'cenpF':
        return (
          <g>
            {cells.map((cell, i) => {
              const inMitosis = rng() > 0.7;
              return (
                <g key={i}>
                  {inMitosis ? (
                    <>
                      <ellipse cx={cell.x - 3} cy={cell.y} rx={cell.r * 0.8} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <ellipse cx={cell.x - 3} cy={cell.y} rx={cell.r * 0.6} ry={cell.r * 0.8} fill="#00ff41" opacity="0.85" />
                      <ellipse cx={cell.x + 3} cy={cell.y} rx={cell.r * 0.8} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <ellipse cx={cell.x + 3} cy={cell.y} rx={cell.r * 0.6} ry={cell.r * 0.8} fill="#00ff41" opacity="0.85" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r={cell.r * 0.85} fill="#0a0a0a" opacity="0.9" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'cytoplasmicLinear':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 6 }, (_, l) => {
                  const angle = (l / 6) * Math.PI * 2;
                  const x1 = cell.x + Math.cos(angle) * cell.r * 0.7;
                  const y1 = cell.y + Math.sin(angle) * cell.r * 0.7;
                  const x2 = cell.x + Math.cos(angle) * cell.r * 1.3;
                  const y2 = cell.y + Math.sin(angle) * cell.r * 1.3;
                  return (
                    <line
                      key={`l${l}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#00ff41"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicNetwork':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 20 }, (_, p) => {
                  const angle = (p / 20) * Math.PI * 2;
                  const offset = cell.r * (0.8 + 0.4 * Math.cos(angle * 2));
                  const x = cell.x + Math.cos(angle) * offset;
                  const y = cell.y + Math.sin(angle) * offset;
                  return (
                    <circle
                      key={`p${p}`}
                      cx={x}
                      cy={y}
                      r="0.7"
                      fill="#00ff41"
                      opacity="0.7"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicSegmental':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 8 }, (_, s) => {
                  const angle = (s / 8) * Math.PI * 2;
                  const x1 = cell.x + Math.cos(angle) * cell.r * 0.7;
                  const y1 = cell.y + Math.sin(angle) * cell.r * 0.7;
                  const x2 = cell.x + Math.cos(angle) * cell.r * 1.15;
                  const y2 = cell.y + Math.sin(angle) * cell.r * 1.15;
                  return (
                    <g key={`seg${s}`}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00ff41" strokeWidth="1" opacity="0.6" />
                      <line x1={x2 + 8} y1={y2} x2={x2 + 12} y2={y2} stroke="#00ff41" strokeWidth="1" opacity="0.6" />
                    </g>
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicGWDots':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 8 }, (_, d) => {
                  const dx = cell.x + (rng() - 0.5) * cell.r * 1.6;
                  const dy = cell.y + (rng() - 0.5) * cell.r * 1.6;
                  const dist = Math.hypot(dx - cell.x, dy - cell.y);
                  if (dist < cell.r * 0.6 || dist > cell.r) return null;
                  return (
                    <circle
                      key={`d${d}`}
                      cx={dx}
                      cy={dy}
                      r="1.8"
                      fill="#00ff41"
                      opacity="0.9"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicDenseSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 50 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.6;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.6;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist < cell.r * 0.6 || dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.7"
                      fill="#00ff41"
                      opacity="0.75"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 30 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.6;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.6;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist < cell.r * 0.6 || dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.6"
                      fill="#00ff41"
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicReticular':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 40 }, (_, m) => {
                  const mx = cell.x + (rng() - 0.5) * cell.r * 1.6;
                  const my = cell.y + (rng() - 0.5) * cell.r * 1.6;
                  const dist = Math.hypot(mx - cell.x, my - cell.y);
                  if (dist < cell.r * 0.6 || dist > cell.r) return null;
                  return (
                    <circle
                      key={`m${m}`}
                      cx={mx}
                      cy={my}
                      r="1"
                      fill="#00ff41"
                      opacity="0.65"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'cytoplasmicGolgi':
        return (
          <g>
            {cells.map((cell, i) => {
              const angle = rng() * Math.PI * 2;
              const golgiX = cell.x + Math.cos(angle) * cell.r * 0.3;
              const golgiY = cell.y + Math.sin(angle) * cell.r * 0.3;
              return (
                <g key={i}>
                  <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                  <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                  <ellipse
                    cx={golgiX}
                    cy={golgiY}
                    rx={cell.r * 0.4}
                    ry={cell.r * 0.25}
                    fill="#00ff41"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </g>
        );

      case 'rodsAndRings':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                <circle cx={cell.x} cy={cell.y} r={cell.r * 0.6} fill="none" stroke="#333" strokeWidth="0.5" />
                {Array.from({ length: 4 }, (_, r) => {
                  const rx = cell.x + (rng() - 0.5) * cell.r * 1.4;
                  const ry = cell.y + (rng() - 0.5) * cell.r * 1.4;
                  const dist = Math.hypot(rx - cell.x, ry - cell.y);
                  if (dist < cell.r * 0.6 || dist > cell.r) return null;
                  if (r % 2 === 0) {
                    return (
                      <line
                        key={`rod${r}`}
                        x1={rx - 8}
                        y1={ry}
                        x2={rx + 8}
                        y2={ry}
                        stroke="#00ff41"
                        strokeWidth="2"
                        opacity="0.85"
                      />
                    );
                  } else {
                    return (
                      <circle
                        key={`ring${r}`}
                        cx={rx}
                        cy={ry}
                        r="5"
                        fill="none"
                        stroke="#00ff41"
                        strokeWidth="1.5"
                        opacity="0.85"
                      />
                    );
                  }
                })}
              </g>
            ))}
          </g>
        );

      case 'centrosome':
        return (
          <g>
            {cells.map((cell, i) => {
              const inMitosis = rng() > 0.6;
              return (
                <g key={i}>
                  {inMitosis ? (
                    <>
                      <ellipse cx={cell.x - 4} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x - 8} cy={cell.y - 6} r="2" fill="#00ff41" opacity="0.95" />
                      <circle cx={cell.x - 8} cy={cell.y + 6} r="2" fill="#00ff41" opacity="0.95" />
                      <ellipse cx={cell.x + 4} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x + 8} cy={cell.y - 6} r="2" fill="#00ff41" opacity="0.95" />
                      <circle cx={cell.x + 8} cy={cell.y + 6} r="2" fill="#00ff41" opacity="0.95" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x - 3} cy={cell.y - 3} r="1.5" fill="#00ff41" opacity="0.85" />
                      <circle cx={cell.x + 3} cy={cell.y + 3} r="1.5" fill="#00ff41" opacity="0.85" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'spindleApparatus':
        return (
          <g>
            {cells.map((cell, i) => {
              const inMitosis = rng() > 0.5;
              return (
                <g key={i}>
                  {inMitosis ? (
                    <>
                      <ellipse cx={cell.x - 5} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x - 8} cy={cell.y - 8} r="1.5" fill="#00ff41" opacity="0.9" />
                      <circle cx={cell.x - 8} cy={cell.y + 8} r="1.5" fill="#00ff41" opacity="0.9" />
                      <line x1={cell.x - 8} y1={cell.y - 8} x2={cell.x} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.8" />
                      <line x1={cell.x - 8} y1={cell.y + 8} x2={cell.x} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.8" />
                      <ellipse cx={cell.x + 5} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x + 8} cy={cell.y - 8} r="1.5" fill="#00ff41" opacity="0.9" />
                      <circle cx={cell.x + 8} cy={cell.y + 8} r="1.5" fill="#00ff41" opacity="0.9" />
                      <line x1={cell.x + 8} y1={cell.y - 8} x2={cell.x} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.8" />
                      <line x1={cell.x + 8} y1={cell.y + 8} x2={cell.x} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.8" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r={cell.r * 0.85} fill="#0a0a0a" opacity="0.9" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'numaLike':
        return (
          <g>
            {cells.map((cell, i) => {
              const inMitosis = rng() > 0.55;
              return (
                <g key={i}>
                  {inMitosis ? (
                    <>
                      <ellipse cx={cell.x - 4} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x - 8} cy={cell.y - 7} r="2.5" fill="#00ff41" opacity="0.9" />
                      <circle cx={cell.x - 8} cy={cell.y + 7} r="2.5" fill="#00ff41" opacity="0.9" />
                      <line x1={cell.x - 8} y1={cell.y - 7} x2={cell.x - 2} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.7" />
                      <line x1={cell.x - 8} y1={cell.y + 7} x2={cell.x - 2} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.7" />
                      <ellipse cx={cell.x + 4} cy={cell.y} rx={cell.r * 0.7} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x + 8} cy={cell.y - 7} r="2.5" fill="#00ff41" opacity="0.9" />
                      <circle cx={cell.x + 8} cy={cell.y + 7} r="2.5" fill="#00ff41" opacity="0.9" />
                      <line x1={cell.x + 8} y1={cell.y - 7} x2={cell.x + 2} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.7" />
                      <line x1={cell.x + 8} y1={cell.y + 7} x2={cell.x + 2} y2={cell.y} stroke="#00ff41" strokeWidth="1" opacity="0.7" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r={cell.r * 0.85} fill="#0a0a0a" opacity="0.9" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'intercellularBridge':
        return (
          <g>
            {cells.map((cell, i) => {
              const inDivision = rng() > 0.65;
              return (
                <g key={i}>
                  {inDivision ? (
                    <>
                      <ellipse cx={cell.x - 6} cy={cell.y} rx={cell.r * 0.6} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <ellipse cx={cell.x + 6} cy={cell.y} rx={cell.r * 0.6} ry={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r="2" fill="#00ff41" opacity="0.95" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r={cell.r * 0.85} fill="#0a0a0a" opacity="0.9" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'chromosomalCoat':
        return (
          <g>
            {cells.map((cell, i) => {
              const inMitosis = rng() > 0.6;
              return (
                <g key={i}>
                  {inMitosis ? (
                    <>
                      <ellipse cx={cell.x - 3} cy={cell.y} rx={cell.r * 0.5} ry={cell.r * 0.9} fill="none" stroke="#333" strokeWidth="1" />
                      <ellipse cx={cell.x - 3} cy={cell.y} rx={cell.r * 0.4} ry={cell.r * 0.8} fill="#00ff41" opacity="0.85" />
                      <ellipse cx={cell.x + 3} cy={cell.y} rx={cell.r * 0.5} ry={cell.r * 0.9} fill="none" stroke="#333" strokeWidth="1" />
                      <ellipse cx={cell.x + 3} cy={cell.y} rx={cell.r * 0.4} ry={cell.r * 0.8} fill="#00ff41" opacity="0.85" />
                    </>
                  ) : (
                    <>
                      <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                      <circle cx={cell.x} cy={cell.y} r={cell.r * 0.85} fill="#0a0a0a" opacity="0.9" />
                    </>
                  )}
                </g>
              );
            })}
          </g>
        );

      case 'topoIsomerase':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 25 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.7"
                      fill="#00ff41"
                      opacity="0.7"
                    />
                  );
                })}
                <circle
                  cx={cell.x}
                  cy={cell.y}
                  r={cell.r * 0.3}
                  fill="#00ff41"
                  opacity="0.75"
                />
              </g>
            ))}
          </g>
        );

      case 'uniformSpeckled':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 50 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.65"
                      fill="#00ff41"
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      case 'myriads':
        return (
          <g>
            {cells.map((cell, i) => (
              <g key={i}>
                <circle cx={cell.x} cy={cell.y} r={cell.r} fill="none" stroke="#333" strokeWidth="1" />
                {Array.from({ length: 100 }, (_, s) => {
                  const sx = cell.x + (rng() - 0.5) * cell.r * 1.8;
                  const sy = cell.y + (rng() - 0.5) * cell.r * 1.8;
                  const dist = Math.hypot(sx - cell.x, sy - cell.y);
                  if (dist > cell.r) return null;
                  return (
                    <circle
                      key={`s${s}`}
                      cx={sx}
                      cy={sy}
                      r="0.45"
                      fill="#00ff41"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg border border-gray-700">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={size} height={size} fill="#0a0a0a" />
      <g filter="url(#glow)">
        {renderPattern()}
      </g>
    </svg>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function ANAPatternGame() {
  const [mode, setMode] = useState('menu');
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [quizTier, setQuizTier] = useState(1);
  const [unlockedTiers, setUnlockedTiers] = useState([1]);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [endlessScore, setEndlessScore] = useState(0);
  const [endlessStreak, setEndlessStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [quizPattern1, setQuizPattern1] = useState(null);
  const [quizPattern2, setQuizPattern2] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState('');

  const tierPatterns = useMemo(() => {
    return PATTERNS.filter(p => p.tier <= quizTier).sort(() => Math.random() - 0.5);
  }, [quizTier]);

  const generateQuizQuestion = useCallback(() => {
    const availablePatterns = PATTERNS.filter(p => p.tier <= quizTier);
    if (availablePatterns.length < 2) return;

    const pattern1 = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    let pattern2 = pattern1;
    while (pattern2.id === pattern1.id) {
      pattern2 = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    }

    setQuizPattern1(pattern1);
    setQuizPattern2(pattern2);
    setQuizQuestion(`Which image shows ${pattern1.name}?`);
    setSelectedAnswer(null);
    setFeedback('');
  }, [quizTier]);

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuizQuestion();
    }
  }, [mode, quizTier, generateQuizQuestion]);

  const handleLearnMode = () => {
    setMode('learn');
    setCurrentPatternIndex(0);
  };

  const handleQuizMode = () => {
    setMode('quiz');
    setQuizTier(1);
    setQuizScore(0);
    setQuizStreak(0);
  };

  const handleEndlessMode = () => {
    setMode('endless');
    setEndlessScore(0);
    setEndlessStreak(0);
  };

  const handleQuizAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === quizPattern1.id;

    if (correct) {
      setQuizScore(quizScore + 1);
      setQuizStreak(quizStreak + 1);
      setFeedback(`Correct! ${quizPattern1.name} (${quizPattern1.id}) — ${quizPattern1.keyFeature}`);

      if (quizStreak + 1 >= 5 && quizTier < 4 && !unlockedTiers.includes(quizTier + 1)) {
        setUnlockedTiers([...unlockedTiers, quizTier + 1]);
      }
    } else {
      setQuizStreak(0);
      const confusedWith = quizPattern1.confusedWith.includes(answer) ? `(commonly confused with ${quizPattern1.name})` : '';
      setFeedback(
        `Incorrect. That's ${answer}. The correct answer is ${quizPattern1.name} (${quizPattern1.id}) — ${quizPattern1.keyFeature} ${confusedWith}`
      );
    }
  };

  const handleEndlessAnswer = (answer) => {
    const correct = answer === quizPattern1.id;
    if (correct) {
      setEndlessScore(endlessScore + 1);
      setEndlessStreak(endlessStreak + 1);
    } else {
      setEndlessStreak(0);
    }
    setTimeout(generateQuizQuestion, 1200);
  };

  // ===== LEARN MODE =====
  if (mode === 'learn') {
    const pattern = PATTERNS[currentPatternIndex];
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button
          onClick={() => setMode('menu')}
          className="mb-6 flex items-center gap-2 text-teal-400 hover:text-teal-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Learn Mode</h2>

          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{pattern.name}</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-700 rounded text-sm">{pattern.id}</span>
                <span className="px-3 py-1 bg-blue-700 rounded text-sm capitalize">{pattern.category}</span>
                <span className="px-3 py-1 bg-amber-700 rounded text-sm capitalize">Tier {pattern.tier}</span>
              </div>
            </div>

            <div className="flex gap-6 mb-6">
              <div className="flex-1">
                <PatternRenderer patternId={pattern.id} size={280} />
              </div>
              <div className="flex-1">
                <p className="text-gray-300 mb-4"><strong>Description:</strong> {pattern.description}</p>
                <p className="text-gray-300 mb-4"><strong>Key Feature:</strong> {pattern.keyFeature}</p>
                <p className="text-gray-300 mb-4"><strong>Antigens:</strong> {pattern.antigens}</p>
                <p className="text-gray-300 mb-4"><strong>Clinical Association:</strong> {pattern.clinicalAssociation}</p>
              </div>
            </div>

            <div className="bg-amber-900 border border-amber-700 rounded p-4 mb-6">
              <p className="text-sm text-amber-100"><strong>🧙 Goblin Note:</strong> {pattern.goblinNote}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPatternIndex(Math.max(0, currentPatternIndex - 1))}
                disabled={currentPatternIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <div className="flex-1 text-center text-gray-400 py-2">
                {currentPatternIndex + 1} / {PATTERNS.length}
              </div>
              <button
                onClick={() => setCurrentPatternIndex(Math.min(PATTERNS.length - 1, currentPatternIndex + 1))}
                disabled={currentPatternIndex === PATTERNS.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUIZ MODE =====
  if (mode === 'quiz' && quizPattern1 && quizPattern2) {
    const choices = [quizPattern1, quizPattern2].sort(() => Math.random() - 0.5);

    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button
          onClick={() => setMode('menu')}
          className="mb-6 flex items-center gap-2 text-teal-400 hover:text-teal-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Quiz Mode</h2>
            <div className="flex gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Target size={18} className="inline mr-2 text-teal-400" />
                Score: {quizScore}
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Flame size={18} className="inline mr-2 text-orange-400" />
                Streak: {quizStreak}
              </div>
              <div className="bg-purple-900 px-4 py-2 rounded">Tier {quizTier}</div>
            </div>
          </div>

          <h3 className="text-xl mb-6 text-center">{quizQuestion}</h3>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  handleQuizAnswer(choice.id);
                }}
                disabled={selectedAnswer !== null}
                className={`rounded-lg overflow-hidden border-2 transition transform ${
                  selectedAnswer === null
                    ? 'border-gray-700 hover:border-teal-400 hover:scale-105'
                    : selectedAnswer === choice.id
                    ? choice.id === quizPattern1.id
                      ? 'border-green-500 scale-105'
                      : 'border-red-500'
                    : choice.id === quizPattern1.id
                    ? 'border-green-500'
                    : 'border-gray-700 opacity-60'
                }`}
              >
                <div className="bg-gray-800 p-4">
                  <PatternRenderer patternId={choice.id} size={240} />
                  <p className="mt-4 text-center font-bold">{choice.id}</p>
                </div>
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-4 rounded-lg mb-6 ${
              selectedAnswer === quizPattern1.id
                ? 'bg-green-900 text-green-100 border border-green-700'
                : 'bg-red-900 text-red-100 border border-red-700'
            }`}>
              {feedback}
            </div>
          )}

          {selectedAnswer !== null && (
            <div className="flex gap-3">
              <button
                onClick={() => generateQuizQuestion()}
                className="flex-1 px-6 py-3 bg-teal-600 rounded hover:bg-teal-500 font-bold"
              >
                Next Question
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== ENDLESS MODE =====
  if (mode === 'endless' && quizPattern1 && quizPattern2) {
    const choices = [quizPattern1, quizPattern2].sort(() => Math.random() - 0.5);

    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button
          onClick={() => setMode('menu')}
          className="mb-6 flex items-center gap-2 text-teal-400 hover:text-teal-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Endless Mode</h2>
            <div className="flex gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Trophy size={18} className="inline mr-2 text-yellow-400" />
                Total: {endlessScore}
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Flame size={18} className="inline mr-2 text-orange-400" />
                Streak: {endlessStreak}
              </div>
            </div>
          </div>

          <h3 className="text-xl mb-6 text-center">{quizQuestion}</h3>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  handleEndlessAnswer(choice.id);
                }}
                className={`rounded-lg overflow-hidden border-2 transition transform border-gray-700 hover:border-teal-400 hover:scale-105`}
              >
                <div className="bg-gray-800 p-4">
                  <PatternRenderer patternId={choice.id} size={240} />
                  <p className="mt-4 text-center font-bold">{choice.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== MENU =====
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-2 text-teal-400">ANA Pattern Lab</h1>
        <p className="text-xl text-gray-400 mb-8">ICAP Pattern Recognition Trainer</p>
        <p className="text-gray-300 mb-12">
          Master all 31 ICAP-validated antinuclear antibody immunofluorescence patterns. Built by a lupus patient
          immunology expert.
        </p>

        <div className="bg-amber-900 border border-amber-700 rounded p-4 mb-12">
          <p className="text-amber-100 text-sm">
            ⚕️ <strong>Labs as clues, not verdicts.</strong> This game teaches you to recognize patterns. Always rely on
            trained lab professionals, clinical context, and your healthcare provider for interpretation.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          <button
            onClick={handleLearnMode}
            className="w-full py-4 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <Brain size={24} /> Learn All Patterns
          </button>

          <button
            onClick={handleQuizMode}
            className="w-full py-4 bg-purple-600 rounded-lg hover:bg-purple-500 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <Zap size={24} /> Quiz Mode
          </button>

          <button
            onClick={handleEndlessMode}
            className="w-full py-4 bg-amber-600 rounded-lg hover:bg-amber-500 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <BarChart3 size={24} /> Endless Mode
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="bg-gray-800 rounded p-4">
            <p className="font-bold text-teal-400">31 Patterns</p>
            <p>All ICAP-validated patterns from AC-0 to AC-31</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <p className="font-bold text-teal-400">4 Difficulty Tiers</p>
            <p>From beginner to expert-level recognition</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <p className="font-bold text-teal-400">Goblin Lore</p>
            <p>Immunogoblin characters & clinical context</p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <p className="font-bold text-teal-400">Seeded Rendering</p>
            <p>Consistent, medically accurate visuals</p>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-500">
          <p>Built for patients, students, and lab professionals</p>
          <p>Created by an autistic lupus patient who memorized all ICAP patterns</p>
        </div>
      </div>
    </div>
  );
}

export default ANAPatternGame;
