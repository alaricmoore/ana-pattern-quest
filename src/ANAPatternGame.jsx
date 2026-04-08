import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Zap, BarChart3, ChevronLeft, ChevronRight, Trophy, Target, Flame } from 'lucide-react';
import PATTERNS from './patterns.js';

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR (Mulberry32)
// ============================================================================
function mulberry32(seed) {
  return function () {
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
                  const opacity = rng() > 0.5 ? 0.9 : 0.4;
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
        <filter id={`glow-${patternId}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={size} height={size} fill="#0a0a0a" />
      <g filter={`url(#glow-${patternId})`}>
        {renderPattern()}
      </g>
    </svg>
  );
}

// ============================================================================
// CLINICAL IMAGE RENDERER (real IFA photos)
// ============================================================================
function ImageRenderer({ patternId, size = 300 }) {
  const pattern = PATTERNS.find(p => p.id === patternId);
  if (!pattern) return null;

  const [imageError, setImageError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const images = pattern.images || [];
  const currentImage = images[imageIndex];

  // Fallback to SVG if no images or image failed to load
  if (!currentImage || imageError) {
    return <PatternRenderer patternId={patternId} size={size} />;
  }

  return (
    <div className="relative rounded-lg border border-gray-700 overflow-hidden bg-black"
      style={{ width: size, height: size }}>
      <img
        src={currentImage}
        alt={`${pattern.name} immunofluorescence`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
      {images.length > 1 && (
        <button
          className="absolute bottom-2 right-2 bg-black/60 text-green-400 text-xs px-2 py-1 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setImageIndex((imageIndex + 1) % images.length);
          }}
        >
          {imageIndex + 1}/{images.length}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
function ANAPatternGame() {
  const [mode, setMode] = useState('menu');
  const [infoPage, setInfoPage] = useState(null); // 'patterns', 'tiers', 'goblins', 'modes'
  const [difficulty, setDifficulty] = useState('practice'); // 'practice' (SVG) or 'clinical' (real images)
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
    if (mode === 'quiz' || mode === 'endless') {
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
    const Renderer = difficulty === 'clinical' ? ImageRenderer : PatternRenderer;
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <button
          onClick={() => setMode('menu')}
          className="mb-8 flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Learn Mode</h2>
            <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setDifficulty('practice')}
                className={`px-4 py-1.5 rounded text-sm transition ${difficulty === 'practice' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Practice
              </button>
              <button
                onClick={() => setDifficulty('clinical')}
                className={`px-4 py-1.5 rounded text-sm transition ${difficulty === 'clinical' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Clinical
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">{pattern.name}</h3>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-green-800 rounded text-sm">{pattern.id}</span>
                <span className="px-3 py-1 bg-green-700 rounded text-sm capitalize">{pattern.category}</span>
                <span className="px-3 py-1 bg-green-900 rounded text-sm capitalize">Tier {pattern.tier}</span>
              </div>
            </div>

            <div className="flex gap-10 mb-8">
              <div className="shrink-0">
                <Renderer patternId={pattern.id} size={400} />
              </div>
              <div className="flex-1 space-y-5">
                <p className="text-gray-300"><strong>Description:</strong> {pattern.description}</p>
                <p className="text-gray-300"><strong>Key Feature:</strong> {pattern.keyFeature}</p>
                <p className="text-gray-300"><strong>Antigens:</strong> {pattern.antigens}</p>
                <p className="text-gray-300"><strong>Clinical Association:</strong> {pattern.clinicalAssociation}</p>
              </div>
            </div>

            <div className="bg-green-900/30 border border-green-700 rounded p-5 mb-8">
              <p className="text-sm text-green-100"><strong>🧙 Goblin Note:</strong> {pattern.goblinNote}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPatternIndex(Math.max(0, currentPatternIndex - 1))}
                disabled={currentPatternIndex === 0}
                className="flex items-center gap-2 px-5 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <div className="flex-1 text-center text-gray-400 py-2">
                {currentPatternIndex + 1} / {PATTERNS.length}
              </div>
              <button
                onClick={() => setCurrentPatternIndex(Math.min(PATTERNS.length - 1, currentPatternIndex + 1))}
                disabled={currentPatternIndex === PATTERNS.length - 1}
                className="flex items-center gap-2 px-5 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
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
    const Renderer = difficulty === 'clinical' ? ImageRenderer : PatternRenderer;

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <button
          onClick={() => setMode('menu')}
          className="mb-8 flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Quiz Mode</h2>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setDifficulty('practice')}
                  className={`px-3 py-1 rounded text-sm transition ${difficulty === 'practice' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Practice
                </button>
                <button
                  onClick={() => setDifficulty('clinical')}
                  className={`px-3 py-1 rounded text-sm transition ${difficulty === 'clinical' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Clinical
                </button>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Target size={18} className="inline mr-2 text-green-400" />
                Score: {quizScore}
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Flame size={18} className="inline mr-2 text-green-400" />
                Streak: {quizStreak}
              </div>
              <div className="bg-green-900 px-4 py-2 rounded">Tier {quizTier}</div>
            </div>
          </div>

          <h3 className="text-xl mb-8 text-center">{quizQuestion}</h3>

          <div className="grid grid-cols-2 gap-10 mb-8">
            {choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  handleQuizAnswer(choice.id);
                }}
                disabled={selectedAnswer !== null}
                className={`rounded-lg overflow-hidden border-2 transition transform ${selectedAnswer === null
                  ? 'border-gray-700 hover:border-green-400 hover:scale-105'
                  : selectedAnswer === choice.id
                    ? choice.id === quizPattern1.id
                      ? 'border-green-500 scale-105'
                      : 'border-red-500'
                    : choice.id === quizPattern1.id
                      ? 'border-green-500'
                      : 'border-gray-700 opacity-60'
                  }`}
              >
                <div className="bg-gray-800 p-6">
                  <Renderer patternId={choice.id} size={320} />
                  <p className="mt-5 text-center font-bold">{choice.id}</p>
                </div>
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`p-5 rounded-lg mb-8 ${selectedAnswer === quizPattern1.id
              ? 'bg-green-900 text-green-100 border border-green-700'
              : 'bg-red-900 text-red-100 border border-red-700'
              }`}>
              {feedback}
            </div>
          )}

          {selectedAnswer !== null && (
            <div className="flex gap-4">
              <button
                onClick={() => generateQuizQuestion()}
                className="flex-1 px-6 py-3 bg-green-600 rounded hover:bg-green-500 font-bold"
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
    const Renderer = difficulty === 'clinical' ? ImageRenderer : PatternRenderer;

    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <button
          onClick={() => setMode('menu')}
          className="mb-8 flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Endless Mode</h2>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setDifficulty('practice')}
                  className={`px-3 py-1 rounded text-sm transition ${difficulty === 'practice' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Practice
                </button>
                <button
                  onClick={() => setDifficulty('clinical')}
                  className={`px-3 py-1 rounded text-sm transition ${difficulty === 'clinical' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  Clinical
                </button>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Trophy size={18} className="inline mr-2 text-green-300" />
                Total: {endlessScore}
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded">
                <Flame size={18} className="inline mr-2 text-green-400" />
                Streak: {endlessStreak}
              </div>
            </div>
          </div>

          <h3 className="text-xl mb-8 text-center">{quizQuestion}</h3>

          <div className="grid grid-cols-2 gap-10 mb-8">
            {choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  handleEndlessAnswer(choice.id);
                }}
                className={`rounded-lg overflow-hidden border-2 transition transform border-gray-700 hover:border-green-400 hover:scale-105`}
              >
                <div className="bg-gray-800 p-6">
                  <Renderer patternId={choice.id} size={320} />
                  <p className="mt-5 text-center font-bold">{choice.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== INFO PAGES =====
  if (infoPage) {
    const infoContent = {
      patterns: {
        title: '31 ICAP ANA Patterns',
        body: (
          <div className="space-y-6">
            <p>The International Consensus on ANA Patterns (ICAP) has standardized 31 antinuclear antibody immunofluorescence patterns, numbered AC-0 through AC-31.</p>
            <p>These patterns are observed when patient serum is applied to HEp-2 cells on a glass slide and viewed under a fluorescence microscope. Each pattern corresponds to specific autoantibody targets and clinical associations.</p>
            <p>Categories include <strong>nuclear</strong>, <strong>cytoplasmic</strong>, <strong>mitotic</strong>, and <strong>composite</strong> patterns.</p>
            <p className="text-green-400">
              <a href="https://anapatterns.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300">
                Visit anapatterns.org →
              </a>
            </p>
          </div>
        ),
      },
      tiers: {
        title: '4 Difficulty Tiers',
        body: (
          <div className="space-y-6">
            <p><strong className="text-green-400">Tier 1 — Competent:</strong> The most common patterns every lab professional should recognize. AC-0, AC-1, AC-2, AC-3, AC-20.</p>
            <p><strong className="text-green-400">Tier 2 — Proficient:</strong> Patterns that require more experience to distinguish. Includes the nucleolar, cytoplasmic, and speckled variants.</p>
            <p><strong className="text-green-400">Tier 3 — Advanced:</strong> Rare and composite patterns like the nuclear envelope patterns, PCNA-like, and the Scl-70 composite.</p>
            <p><strong className="text-green-400">Tier 4 — Expert:</strong> Mitotic patterns that require finding dividing cells — centrosome, spindle apparatus, NuMA, and more.</p>
          </div>
        ),
      },
      goblins: {
        title: 'Immuno Goblin Lore',
        body: (
          <div className="space-y-6">
            <p>The Immuno Goblins are a mnemonic cast of characters representing immunoglobulins and immune cells:</p>
            <p><strong className="text-green-400">Gryf (IgG)</strong> — The main troublemaker in lupus. Anti-dsDNA antibodies are his calling card.</p>
            <p><strong className="text-green-400">Alvin (IgA)</strong> — Guards the mucosal surfaces. Involved in IgA nephropathy.</p>
            <p><strong className="text-green-400">Merlin (IgM)</strong> — The first responder. Big, pentameric, and early to the scene.</p>
            <p><strong className="text-green-400">Eric (IgE)</strong> — The allergy goblin. Mast cell activator.</p>
            <p><strong className="text-green-400">Darryl (IgD)</strong> — The mysterious one. Still figuring out his job.</p>
            <p><strong className="text-green-400">Betty (B cells)</strong> — Makes all the goblins. When she goes rogue, autoimmunity follows.</p>
          </div>
        ),
      },
      modes: {
        title: 'Two Visual Modes',
        body: (
          <div className="space-y-6">
            <p><strong className="text-green-400">Practice Mode (Generated SVGs):</strong> Procedurally generated representations of each pattern. These are simplified visual aids that highlight the key distinguishing features of each pattern — great for learning the concepts.</p>
            <p><strong className="text-green-400">Clinical Mode (Real IFA Images):</strong> Actual immunofluorescence microscopy photographs sourced from ICAP. These are what you would see through a microscope in a real clinical lab — harder to read, but the real deal.</p>
            <p>Start with Practice mode to learn the patterns, then switch to Clinical mode to test yourself on real images.</p>
          </div>
        ),
      },
    };

    const page = infoContent[infoPage];
    return (
      <div className="min-h-screen bg-gray-900 text-white p-12 lg:p-16">
        <button
          onClick={() => setInfoPage(null)}
          className="mb-8 flex items-center gap-2 text-green-400 hover:text-green-300"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-green-400">{page.title}</h2>
          <div className="bg-gray-800 rounded-lg p-10 text-gray-300 leading-relaxed text-base">
            {page.body}
          </div>
        </div>
      </div>
    );
  }

  // ===== MENU =====
  return (
    <div className="min-h-screen bg-gray-900 text-white p-12 lg:p-16">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-green-400">ANA Pattern Quest</h1>
        <p className="text-lg text-gray-400 mb-12">ICAP Pattern Recognition Trainer</p>
        <p className="text-gray-300 mb-16 leading-relaxed mx-auto" style={{ textAlign: 'center' }}>
          Master all 31 ICAP-validated antinuclear antibody immunofluorescence patterns.
        </p>

        <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 mb-16">
          <p className="text-green-100 text-sm leading-relaxed">
            ⚕️ <strong>Labs as clues to the weirdness that is the immune system.</strong> This game teaches you to recognize ANA patterns. Always rely on
            trained lab professionals, clinical context, and your healthcare provider for interpretation of real life labs.
          </p>
        </div>

        <div className="button-row justify-center" style={{ marginBottom: '40px' }}>
          <div className="button-row bg-gray-800 rounded-lg p-2">
            <button
              onClick={() => setDifficulty('practice')}
              className={`px-5 py-2 rounded-lg text-sm transition ${difficulty === 'practice' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Practice (Generated)
            </button>
            <button
              onClick={() => setDifficulty('clinical')}
              className={`px-5 py-2 rounded-lg text-sm transition ${difficulty === 'clinical' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Clinical (Real IFA)
            </button>
          </div>
        </div>

        <div className="button-stack mb-16">
          <button
            onClick={handleLearnMode}
            className="w-full py-5 bg-green-700 rounded-lg hover:bg-green-600 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <Brain size={24} /> Learn The Patterns!
          </button>

          <button
            onClick={handleQuizMode}
            className="w-full py-5 bg-green-600 rounded-lg hover:bg-green-500 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <Zap size={24} /> Quiz Mode
          </button>

          <button
            onClick={handleEndlessMode}
            className="w-full py-5 bg-green-800 rounded-lg hover:bg-green-700 font-bold text-lg flex items-center justify-center gap-3 transition transform hover:scale-105"
          >
            <BarChart3 size={24} /> Endless Mode
          </button>
        </div>

        <div className="feature-grid text-sm text-gray-400">
          <div className="feature-card bg-gray-800" onClick={() => setInfoPage('patterns')}>
            <p className="font-bold text-green-400 mb-2">31 Patterns</p>
            <p>All ICAP-validated AC-0 to AC-31</p>
          </div>
          <div className="feature-card bg-gray-800" onClick={() => setInfoPage('tiers')}>
            <p className="font-bold text-green-400 mb-2">4 Difficulty Tiers</p>
            <p>Beginner to expert recognition</p>
          </div>
          <div className="feature-card bg-gray-800" onClick={() => setInfoPage('goblins')}>
            <p className="font-bold text-green-400 mb-2">Goblin Lore</p>
            <p>Immunogoblin characters & context</p>
          </div>
          <div className="feature-card bg-gray-800" onClick={() => setInfoPage('modes')}>
            <p className="font-bold text-green-400 mb-2">Two Modes</p>
            <p>Practice SVGs or real IFA images</p>
          </div>
        </div>

        <div className="mt-20 text-xs text-gray-500 space-y-3">
          <p>Built for patients, students, lab professionals, and nerds.</p>
          <p>Created by C. Alaric Moore</p>
          <p>
            Clinical images courtesy of{' '}
            <a href="https://anapatterns.org" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
              ICAP — International Consensus on ANA Patterns (anapatterns.org)
            </a>
          </p>
          <p>
            Feedback:{' '}
            <a href="mailto:dev@anapatternquest.com" className="text-green-400 hover:text-green-300 underline">
              dev@anapatternquest.com
            </a>
            {' · '}
            <a href="https://github.com/alaricmoore/ana-pattern-quest" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ANAPatternGame;
