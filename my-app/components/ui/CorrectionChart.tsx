import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import Svg, {
  Path,
  Line,
  Circle,
  Rect,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

interface ChartPoint {
  bendLength: number;
  correction: number | null;
  crown: number | null;
}

interface Props {
  data: ChartPoint[];
  activeBendLength?: number | null;
  height?: number;
}

// Left axis: correction (amber). Right axis: crown (blue).
const PAD = { top: 32, right: 52, bottom: 44, left: 52 };
const TICK_COUNT = 4;

function makeScale(values: number[], plotH: number, topPad: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = range * 0.15;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo;
  const toY = (v: number) => topPad + plotH - ((v - lo) / span) * plotH;
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => lo + (i / TICK_COUNT) * span);
  return { toY, ticks, lo, hi };
}

export default function CorrectionChart({ data, activeBendLength, height = 260 }: Props) {
  const [width, setWidth] = useState(300);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Points that have at least a correction value
  const corrData = data.filter(d => d.correction !== null) as (ChartPoint & { correction: number })[];
  // Points that have crown data
  const crownData = data.filter(d => d.crown !== null) as (ChartPoint & { crown: number })[];
  const hasCrown = crownData.length > 0;

  if (corrData.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data points to display</Text>
      </View>
    );
  }

  const plotW = Math.max(width - PAD.left - PAD.right, 10);
  const plotH = height - PAD.top - PAD.bottom;

  // X scale (shared)
  const minX = Math.min(...corrData.map(d => d.bendLength));
  const maxX = Math.max(...corrData.map(d => d.bendLength));
  const xRange = maxX - minX || 1;
  const toX = (v: number) => PAD.left + ((v - minX) / xRange) * plotW;

  // Y scales
  const corrScale = makeScale(corrData.map(d => d.correction), plotH, PAD.top);
  const crownScale = hasCrown
    ? makeScale(crownData.map(d => d.crown), plotH, PAD.top)
    : null;

  // Paths
  const corrPathD = corrData
    .map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${toX(d.bendLength).toFixed(1)} ${corrScale.toY(d.correction).toFixed(1)}`
    )
    .join(' ');

  const corrAreaD =
    corrPathD +
    ` L ${toX(corrData[corrData.length - 1].bendLength).toFixed(1)} ${(PAD.top + plotH).toFixed(1)}` +
    ` L ${toX(corrData[0].bendLength).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`;

  const crownPathD =
    hasCrown && crownScale
      ? crownData
          .map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${toX(d.bendLength).toFixed(1)} ${crownScale.toY(d.crown).toFixed(1)}`
          )
          .join(' ')
      : null;

  // X ticks
  const xTickCount = Math.min(5, corrData.length);
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) =>
    minX + (i / xTickCount) * xRange
  );

  // Touch handling — snap to nearest correction data point by X
  const findNearest = (touchX: number) => {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    corrData.forEach((d, i) => {
      const dist = Math.abs(toX(d.bendLength) - touchX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    });
    setActiveIdx(nearestIdx);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => findNearest(evt.nativeEvent.locationX),
      onPanResponderMove: evt => findNearest(evt.nativeEvent.locationX),
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  // Result point from current lookup
  const resultIdx =
    activeBendLength != null ? corrData.findIndex(d => d.bendLength === activeBendLength) : -1;

  const displayIdx = activeIdx ?? resultIdx;
  const activePoint = displayIdx >= 0 ? corrData[displayIdx] : null;

  // Tooltip
  const tooltipBoxW = 120;
  const tooltipRowH = 20;
  const tooltipRows = 1 + (hasCrown ? 1 : 0); // correction + optional crown
  const tooltipBoxH = 22 + tooltipRows * tooltipRowH + 4;
  const tooltipX = activePoint ? toX(activePoint.bendLength) : 0;
  let tooltipBoxX = tooltipX + 10;
  if (tooltipBoxX + tooltipBoxW > width - 4) {
    tooltipBoxX = tooltipX - tooltipBoxW - 10;
  }
  const tooltipBoxY = PAD.top + 4;

  // Crown value at active index (match by bendLength)
  const activeCrownPoint =
    activePoint && hasCrown
      ? crownData.find(d => d.bendLength === activePoint.bendLength) ?? null
      : null;

  return (
    <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={styles.container}>
      <View {...panResponder.panHandlers} style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="corrGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.20" />
              <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Plot background */}
          <Rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="#111128" rx={4} />

          {/* Horizontal grid lines (based on correction ticks) */}
          {corrScale.ticks.map((val, i) => {
            const y = corrScale.toY(val);
            return (
              <Line
                key={`hg-${i}`}
                x1={PAD.left}
                y1={y}
                x2={PAD.left + plotW}
                y2={y}
                stroke="#2a2a45"
                strokeWidth={1}
              />
            );
          })}

          {/* Vertical grid lines */}
          {xTicks.map((val, i) => {
            const x = toX(val);
            return (
              <G key={`vg-${i}`}>
                <Line
                  x1={x}
                  y1={PAD.top}
                  x2={x}
                  y2={PAD.top + plotH}
                  stroke="#2a2a45"
                  strokeWidth={1}
                />
                <SvgText
                  x={x}
                  y={PAD.top + plotH + 14}
                  fontSize={9}
                  fill="#555577"
                  textAnchor="middle"
                >
                  {Math.round(val)}
                </SvgText>
              </G>
            );
          })}

          {/* Left Y axis labels — Correction (amber) */}
          {corrScale.ticks.map((val, i) => (
            <SvgText
              key={`cy-${i}`}
              x={PAD.left - 6}
              y={corrScale.toY(val) + 4}
              fontSize={9}
              fill="#c47a00"
              textAnchor="end"
            >
              {val.toFixed(1)}°
            </SvgText>
          ))}

          {/* Right Y axis labels — Crown (blue) */}
          {crownScale &&
            crownScale.ticks.map((val, i) => (
              <SvgText
                key={`rcy-${i}`}
                x={PAD.left + plotW + 6}
                y={crownScale.toY(val) + 4}
                fontSize={9}
                fill="#3b7fd4"
                textAnchor="start"
              >
                {val.toFixed(2)}
              </SvgText>
            ))}

          {/* Correction area fill */}
          <Path d={corrAreaD} fill="url(#corrGrad)" />

          {/* Crown line */}
          {crownPathD && (
            <Path
              d={crownPathD}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6,3"
            />
          )}

          {/* Correction line */}
          <Path
            d={corrPathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Axes borders */}
          <Line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + plotH}
            stroke="#c47a0066"
            strokeWidth={1.5}
          />
          <Line
            x1={PAD.left + plotW}
            y1={PAD.top}
            x2={PAD.left + plotW}
            y2={PAD.top + plotH}
            stroke={hasCrown ? '#3b7fd466' : '#3d3d5c'}
            strokeWidth={1.5}
          />
          <Line
            x1={PAD.left}
            y1={PAD.top + plotH}
            x2={PAD.left + plotW}
            y2={PAD.top + plotH}
            stroke="#3d3d5c"
            strokeWidth={1.5}
          />

          {/* Crown dots */}
          {hasCrown &&
            crownScale &&
            crownData.map((d, i) => {
              const isActive = corrData[displayIdx]?.bendLength === d.bendLength;
              return (
                <Circle
                  key={`cd-${i}`}
                  cx={toX(d.bendLength)}
                  cy={crownScale.toY(d.crown)}
                  r={isActive ? 6 : 3}
                  fill={isActive ? '#60a5fa' : '#1e1e36'}
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                />
              );
            })}

          {/* Correction dots */}
          {corrData.map((d, i) => {
            const isActive = i === displayIdx;
            const isResult = i === resultIdx && activeIdx === null;
            return (
              <Circle
                key={`d-${i}`}
                cx={toX(d.bendLength)}
                cy={corrScale.toY(d.correction)}
                r={isActive ? 7 : isResult ? 5 : 3.5}
                fill={isActive ? '#f59e0b' : isResult ? '#4ade80' : '#1e1e36'}
                stroke={isActive ? '#fff' : isResult ? '#4ade80' : '#f59e0b'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
            );
          })}

          {/* Crosshair */}
          {activePoint && (
            <Line
              x1={toX(activePoint.bendLength)}
              y1={PAD.top}
              x2={toX(activePoint.bendLength)}
              y2={PAD.top + plotH}
              stroke="#ffffff"
              strokeWidth={1}
              strokeDasharray="3,3"
              strokeOpacity={0.25}
            />
          )}

          {/* Tooltip */}
          {activePoint && (
            <G>
              <Rect
                x={tooltipBoxX}
                y={tooltipBoxY}
                width={tooltipBoxW}
                height={tooltipBoxH}
                rx={6}
                fill="#1a1a30"
                stroke="#3d3d5c"
                strokeWidth={1}
              />
              {/* Bend length header */}
              <SvgText
                x={tooltipBoxX + tooltipBoxW / 2}
                y={tooltipBoxY + 14}
                fontSize={10}
                fill="#999"
                textAnchor="middle"
              >
                {activePoint.bendLength}mm
              </SvgText>
              {/* Correction row */}
              <SvgText
                x={tooltipBoxX + 8}
                y={tooltipBoxY + 14 + tooltipRowH}
                fontSize={9}
                fill="#c47a00"
              >
                Correction
              </SvgText>
              <SvgText
                x={tooltipBoxX + tooltipBoxW - 8}
                y={tooltipBoxY + 14 + tooltipRowH}
                fontSize={12}
                fontWeight="bold"
                fill="#f59e0b"
                textAnchor="end"
              >
                {activePoint.correction.toFixed(2)}°
              </SvgText>
              {/* Crown row */}
              {activeCrownPoint && (
                <>
                  <SvgText
                    x={tooltipBoxX + 8}
                    y={tooltipBoxY + 14 + tooltipRowH * 2}
                    fontSize={9}
                    fill="#3b7fd4"
                  >
                    Crown
                  </SvgText>
                  <SvgText
                    x={tooltipBoxX + tooltipBoxW - 8}
                    y={tooltipBoxY + 14 + tooltipRowH * 2}
                    fontSize={12}
                    fontWeight="bold"
                    fill="#60a5fa"
                    textAnchor="end"
                  >
                    {activeCrownPoint.crown}
                  </SvgText>
                </>
              )}
            </G>
          )}

          {/* Legend */}
          <G>
            {/* Correction */}
            <Line
              x1={PAD.left + 4}
              y1={PAD.top - 14}
              x2={PAD.left + 20}
              y2={PAD.top - 14}
              stroke="#f59e0b"
              strokeWidth={2.5}
            />
            <Circle cx={PAD.left + 12} cy={PAD.top - 14} r={3} fill="#f59e0b" />
            <SvgText x={PAD.left + 24} y={PAD.top - 10} fontSize={9} fill="#c47a00">
              Correction (°)
            </SvgText>
            {/* Crown */}
            {hasCrown && (
              <>
                <Line
                  x1={PAD.left + 96}
                  y1={PAD.top - 14}
                  x2={PAD.left + 112}
                  y2={PAD.top - 14}
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="5,2"
                />
                <Circle cx={PAD.left + 104} cy={PAD.top - 14} r={3} fill="#60a5fa" />
                <SvgText x={PAD.left + 116} y={PAD.top - 10} fontSize={9} fill="#3b7fd4">
                  Crown
                </SvgText>
              </>
            )}
          </G>

          {/* X-axis label */}
          <SvgText
            x={PAD.left + plotW / 2}
            y={height - 4}
            fontSize={9}
            fill="#444466"
            textAnchor="middle"
          >
            Bend Length (mm)
          </SvgText>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 13,
  },
});
