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

const PAD = { top: 20, right: 20, bottom: 44, left: 52 };

export default function CorrectionChart({ data, activeBendLength, height = 240 }: Props) {
  const [width, setWidth] = useState(300);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const validData = data.filter(d => d.correction !== null) as (ChartPoint & { correction: number })[];

  if (validData.length === 0) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>No data points to display</Text>
      </View>
    );
  }

  const plotW = Math.max(width - PAD.left - PAD.right, 10);
  const plotH = height - PAD.top - PAD.bottom;

  const minX = Math.min(...validData.map(d => d.bendLength));
  const maxX = Math.max(...validData.map(d => d.bendLength));
  const minY = Math.min(...validData.map(d => d.correction));
  const maxY = Math.max(...validData.map(d => d.correction));

  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const yPadding = yRange * 0.15;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;
  const yRangeAdj = yMax - yMin;

  const toX = (v: number) => PAD.left + ((v - minX) / xRange) * plotW;
  const toY = (v: number) => PAD.top + plotH - ((v - yMin) / yRangeAdj) * plotH;

  // Build line path
  const pathD = validData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.bendLength).toFixed(1)} ${toY(d.correction).toFixed(1)}`)
    .join(' ');

  // Area fill path (from line down to bottom)
  const areaD =
    pathD +
    ` L ${toX(validData[validData.length - 1].bendLength).toFixed(1)} ${(PAD.top + plotH).toFixed(1)}` +
    ` L ${toX(validData[0].bendLength).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`;

  // Pan responder for touch interaction
  const findNearest = (touchX: number) => {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    validData.forEach((d, i) => {
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

  // Result point matching the current lookup
  const resultIdx =
    activeBendLength != null
      ? validData.findIndex(d => d.bendLength === activeBendLength)
      : -1;

  // Active point (touch takes priority over result highlight)
  const displayIdx = activeIdx ?? resultIdx;
  const activePoint = displayIdx >= 0 ? validData[displayIdx] : null;

  // Axis ticks
  const xTickCount = Math.min(5, validData.length);
  const yTickCount = 4;

  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) =>
    minX + (i / xTickCount) * xRange
  );
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    yMin + (i / yTickCount) * yRangeAdj
  );

  // Tooltip positioning
  const tooltipX = activePoint ? toX(activePoint.bendLength) : 0;
  const tooltipBoxW = 110;
  const tooltipBoxH = activePoint?.crown ? 68 : 50;
  let tooltipBoxX = tooltipX + 10;
  if (tooltipBoxX + tooltipBoxW > width - PAD.right) {
    tooltipBoxX = tooltipX - tooltipBoxW - 10;
  }
  const tooltipBoxY = PAD.top + 4;

  return (
    <View
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      style={styles.container}
    >
      <View {...panResponder.panHandlers} style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Plot background */}
          <Rect
            x={PAD.left}
            y={PAD.top}
            width={plotW}
            height={plotH}
            fill="#111128"
            rx={4}
          />

          {/* Y grid lines */}
          {yTicks.map((val, i) => {
            const y = toY(val);
            return (
              <G key={`yg-${i}`}>
                <Line
                  x1={PAD.left}
                  y1={y}
                  x2={PAD.left + plotW}
                  y2={y}
                  stroke="#2a2a45"
                  strokeWidth={1}
                />
                <SvgText
                  x={PAD.left - 6}
                  y={y + 4}
                  fontSize={9}
                  fill="#555577"
                  textAnchor="end"
                >
                  {val.toFixed(1)}°
                </SvgText>
              </G>
            );
          })}

          {/* X grid lines */}
          {xTicks.map((val, i) => {
            const x = toX(val);
            return (
              <G key={`xg-${i}`}>
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

          {/* Area fill */}
          <Path d={areaD} fill="url(#areaGrad)" />

          {/* Data line */}
          <Path
            d={pathD}
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
            stroke="#3d3d5c"
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

          {/* Data point dots */}
          {validData.map((d, i) => {
            const isActive = i === displayIdx;
            const isResult = i === resultIdx && activeIdx === null;
            return (
              <Circle
                key={i}
                cx={toX(d.bendLength)}
                cy={toY(d.correction)}
                r={isActive ? 7 : isResult ? 5 : 3.5}
                fill={isActive ? '#f59e0b' : isResult ? '#4ade80' : '#1e1e36'}
                stroke={isActive ? '#fff' : isResult ? '#4ade80' : '#f59e0b'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
            );
          })}

          {/* Active crosshair */}
          {activePoint && (
            <Line
              x1={toX(activePoint.bendLength)}
              y1={PAD.top}
              x2={toX(activePoint.bendLength)}
              y2={PAD.top + plotH}
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="4,3"
              strokeOpacity={0.7}
            />
          )}

          {/* Tooltip box */}
          {activePoint && (
            <G>
              <Rect
                x={tooltipBoxX}
                y={tooltipBoxY}
                width={tooltipBoxW}
                height={tooltipBoxH}
                rx={6}
                fill="#1e1e38"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              <SvgText
                x={tooltipBoxX + tooltipBoxW / 2}
                y={tooltipBoxY + 14}
                fontSize={10}
                fill="#888"
                textAnchor="middle"
              >
                {activePoint.bendLength}mm
              </SvgText>
              <SvgText
                x={tooltipBoxX + 10}
                y={tooltipBoxY + 30}
                fontSize={9}
                fill="#888"
              >
                Correction
              </SvgText>
              <SvgText
                x={tooltipBoxX + tooltipBoxW - 8}
                y={tooltipBoxY + 30}
                fontSize={13}
                fontWeight="bold"
                fill="#4ade80"
                textAnchor="end"
              >
                {activePoint.correction.toFixed(2)}°
              </SvgText>
              {activePoint.crown != null && (
                <>
                  <SvgText
                    x={tooltipBoxX + 10}
                    y={tooltipBoxY + 50}
                    fontSize={9}
                    fill="#888"
                  >
                    Crown
                  </SvgText>
                  <SvgText
                    x={tooltipBoxX + tooltipBoxW - 8}
                    y={tooltipBoxY + 50}
                    fontSize={13}
                    fontWeight="bold"
                    fill="#60a5fa"
                    textAnchor="end"
                  >
                    {activePoint.crown}
                  </SvgText>
                </>
              )}
            </G>
          )}

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
