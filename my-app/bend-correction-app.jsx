import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Legend } from 'recharts';

// Bend correction database - 2mm/12ga 3003 Aluminum
const MATERIALS_DB = {
  "2mm_aluminum": {
    name: "2mm / 12ga 3003 Aluminum",
    thickness: 2,
    unit: "mm",
    flanges: {
      6: [
        { bendLength: 100, correction: null, crown: null, note: "not possible" }
      ],
      8: [
        { bendLength: 100, correction: 13.6, crown: 0 },
        { bendLength: 150, correction: 16.1, crown: 0 },
        { bendLength: 180, correction: 16.3, crown: 0 },
        { bendLength: 200, correction: 17.25, crown: 0 },
        { bendLength: 240, correction: 21.45, crown: 0 },
        { bendLength: 275, correction: 23.95, crown: 0 },
        { bendLength: 300, correction: 25.35, crown: 0 },
        { bendLength: 328, correction: 25.85, crown: 0 },
        { bendLength: 350, correction: 26.75, crown: 0 },
        { bendLength: 381, correction: 26.75, crown: 0 },
        { bendLength: 400, correction: 27.75, crown: 0 },
        { bendLength: 425, correction: 29.25, crown: 0 },
        { bendLength: 475, correction: 29.25, crown: 0 },
        { bendLength: 502, correction: 30, crown: 0 },
        { bendLength: 521, correction: null, crown: null, note: "not possible" }
      ],
      10: [
        { bendLength: 100, correction: 8.92, crown: 0 },
        { bendLength: 150, correction: 10.32, crown: 0 },
        { bendLength: 180, correction: 10.32, crown: 0 },
        { bendLength: 200, correction: 11.62, crown: 0 },
        { bendLength: 240, correction: 12.12, crown: 0 },
        { bendLength: 275, correction: 13.52, crown: 0 },
        { bendLength: 300, correction: 13.72, crown: 0 },
        { bendLength: 328, correction: 14.12, crown: 0 },
        { bendLength: 350, correction: 14.67, crown: 0 },
        { bendLength: 381, correction: 15.67, crown: 0 },
        { bendLength: 400, correction: 15.87, crown: 0 },
        { bendLength: 425, correction: 15.87, crown: 0 },
        { bendLength: 475, correction: 15.87, crown: 0 },
        { bendLength: 502, correction: 16, crown: 0 },
        { bendLength: 598, correction: 17.25, crown: 0.12 },
        { bendLength: 672, correction: 16.75, crown: 0.13 },
        { bendLength: 750, correction: 16.75, crown: 0.15 },
        { bendLength: 808, correction: 18.55, crown: 0.16 },
        { bendLength: 838, correction: 17.35, crown: 0.17 },
        { bendLength: 919, correction: 17.55, crown: 0.18 },
        { bendLength: 1000, correction: 17.55, crown: 0.2 },
        { bendLength: 1079, correction: 18.45, crown: 0.22 },
        { bendLength: 1123, correction: 18.85, crown: 0.23 },
        { bendLength: 1200, correction: 19.15, crown: 0.24 },
        { bendLength: 1263, correction: 19.65, crown: 0.25 },
        { bendLength: 1311, correction: 20.05, crown: 0.26 },
        { bendLength: 1384, correction: 20.05, crown: 0.28 },
        { bendLength: 1400, correction: 20.05, crown: 0.28 },
        { bendLength: 1487, correction: 20.25, crown: 0.3 },
        { bendLength: 1550, correction: 20.4, crown: 0.31 },
        { bendLength: 1646, correction: 20.7, crown: 0.33 },
        { bendLength: 1743, correction: 20.7, crown: 0.35 },
        { bendLength: 1888, correction: 20.7, crown: 0.38 },
        { bendLength: 2000, correction: 20.4, crown: 0.4 },
        { bendLength: 2250, correction: 20.9, crown: 0.45 },
        { bendLength: 2600, correction: 20.9, crown: 0.5 },
        { bendLength: 2750, correction: 21.1, crown: 0.5 },
        { bendLength: 3000, correction: 22.6, crown: 0.5 }
      ],
      12: [
        { bendLength: 100, correction: 7.54, crown: 0 },
        { bendLength: 150, correction: 7.84, crown: 0 },
        { bendLength: 180, correction: 8.04, crown: 0 },
        { bendLength: 200, correction: 8.24, crown: 0 },
        { bendLength: 240, correction: 9.04, crown: 0 },
        { bendLength: 275, correction: 9.54, crown: 0 },
        { bendLength: 300, correction: 9.99, crown: 0 },
        { bendLength: 328, correction: 10.59, crown: 0 },
        { bendLength: 350, correction: 10.59, crown: 0 },
        { bendLength: 381, correction: 10.99, crown: 0 },
        { bendLength: 400, correction: 11.29, crown: 0 },
        { bendLength: 425, correction: 11.59, crown: 0 },
        { bendLength: 475, correction: 11.59, crown: 0 },
        { bendLength: 502, correction: 11.79, crown: 0 },
        { bendLength: 598, correction: 11.79, crown: 0.12 },
        { bendLength: 672, correction: 11.79, crown: 0.13 },
        { bendLength: 750, correction: 11.99, crown: 0.15 },
        { bendLength: 808, correction: 12.49, crown: 0.16 },
        { bendLength: 838, correction: 12.49, crown: 0.17 },
        { bendLength: 919, correction: 12.49, crown: 0.18 },
        { bendLength: 1000, correction: 12.49, crown: 0.2 },
        { bendLength: 1079, correction: 12.69, crown: 0.22 },
        { bendLength: 1123, correction: 12.89, crown: 0.23 },
        { bendLength: 1200, correction: 13.09, crown: 0.24 },
        { bendLength: 1263, correction: 13.09, crown: 0.25 },
        { bendLength: 1311, correction: 13.29, crown: 0.26 },
        { bendLength: 1384, correction: 13.29, crown: 0.28 },
        { bendLength: 1400, correction: 13.49, crown: 0.28 },
        { bendLength: 1487, correction: 13.49, crown: 0.3 },
        { bendLength: 1550, correction: 13.69, crown: 0.31 },
        { bendLength: 1646, correction: 13.89, crown: 0.33 },
        { bendLength: 1743, correction: 14.09, crown: 0.35 },
        { bendLength: 1888, correction: 14.29, crown: 0.38 },
        { bendLength: 2000, correction: 14.49, crown: 0.4 },
        { bendLength: 2250, correction: 14.89, crown: 0.45 },
        { bendLength: 2600, correction: 15.29, crown: 0.5 },
        { bendLength: 2750, correction: 15.49, crown: 0.5 },
        { bendLength: 3000, correction: 15.89, crown: 0.5 }
      ],
      14: [
        { bendLength: 100, correction: 6.87, crown: 0 },
        { bendLength: 150, correction: 6.77, crown: 0 },
        { bendLength: 180, correction: 6.62, crown: 0 },
        { bendLength: 200, correction: 6.62, crown: 0 },
        { bendLength: 240, correction: 7.02, crown: 0 },
        { bendLength: 275, correction: 7.62, crown: 0 },
        { bendLength: 300, correction: 8.12, crown: 0 },
        { bendLength: 328, correction: 8.12, crown: 0 },
        { bendLength: 350, correction: 8.5, crown: 0 },
        { bendLength: 381, correction: 9, crown: 0 },
        { bendLength: 400, correction: 9, crown: 0 },
        { bendLength: 425, correction: 9.3, crown: 0 },
        { bendLength: 475, correction: 9.3, crown: 0 },
        { bendLength: 502, correction: 9.3, crown: 0 },
        { bendLength: 598, correction: 9.3, crown: 0.12 },
        { bendLength: 672, correction: 9.3, crown: 0.13 },
        { bendLength: 750, correction: 9.3, crown: 0.15 },
        { bendLength: 808, correction: 9.5, crown: 0.16 },
        { bendLength: 838, correction: 9.5, crown: 0.17 },
        { bendLength: 919, correction: 9.7, crown: 0.18 },
        { bendLength: 1000, correction: 9.9, crown: 0.2 },
        { bendLength: 1079, correction: 10.1, crown: 0.22 },
        { bendLength: 1123, correction: 10.3, crown: 0.23 },
        { bendLength: 1200, correction: 10.5, crown: 0.24 },
        { bendLength: 1263, correction: 10.7, crown: 0.25 },
        { bendLength: 1311, correction: 10.9, crown: 0.26 },
        { bendLength: 1384, correction: 11.1, crown: 0.28 },
        { bendLength: 1400, correction: 11.1, crown: 0.28 },
        { bendLength: 1487, correction: 11.3, crown: 0.3 },
        { bendLength: 1550, correction: 11.5, crown: 0.31 },
        { bendLength: 1646, correction: 11.7, crown: 0.33 },
        { bendLength: 1743, correction: 11.9, crown: 0.35 },
        { bendLength: 1888, correction: 12.1, crown: 0.38 },
        { bendLength: 2000, correction: 12.3, crown: 0.4 },
        { bendLength: 2250, correction: 12.7, crown: 0.45 },
        { bendLength: 2600, correction: 13.1, crown: 0.5 },
        { bendLength: 2750, correction: 13.3, crown: 0.5 },
        { bendLength: 3000, correction: 13.7, crown: 0.5 }
      ],
      20: [
        { bendLength: 100, correction: 5.9, crown: 0 },
        { bendLength: 150, correction: 5.1, crown: 0 },
        { bendLength: 180, correction: 5.1, crown: 0 },
        { bendLength: 200, correction: 5.3, crown: 0 },
        { bendLength: 240, correction: 5.55, crown: 0 },
        { bendLength: 275, correction: 6, crown: 0 },
        { bendLength: 300, correction: 6.3, crown: 0 },
        { bendLength: 328, correction: 6.3, crown: 0 },
        { bendLength: 350, correction: 6.5, crown: 0 },
        { bendLength: 381, correction: 6.5, crown: 0 },
        { bendLength: 400, correction: 6.5, crown: 0 },
        { bendLength: 425, correction: 6.5, crown: 0 },
        { bendLength: 475, correction: 6.6, crown: 0 },
        { bendLength: 502, correction: 6.7, crown: 0 },
        { bendLength: 598, correction: 6.9, crown: 0.12 },
        { bendLength: 672, correction: 6.9, crown: 0.13 },
        { bendLength: 750, correction: 7.1, crown: 0.15 },
        { bendLength: 808, correction: 7.3, crown: 0.16 },
        { bendLength: 838, correction: 7.3, crown: 0.17 },
        { bendLength: 919, correction: 7.5, crown: 0.18 },
        { bendLength: 1000, correction: 7.7, crown: 0.2 },
        { bendLength: 1079, correction: 7.9, crown: 0.22 },
        { bendLength: 1123, correction: 8.1, crown: 0.23 },
        { bendLength: 1200, correction: 8.3, crown: 0.24 },
        { bendLength: 1263, correction: 8.5, crown: 0.25 },
        { bendLength: 1311, correction: 8.7, crown: 0.26 },
        { bendLength: 1384, correction: 8.9, crown: 0.28 },
        { bendLength: 1400, correction: 8.9, crown: 0.28 },
        { bendLength: 1487, correction: 9.1, crown: 0.3 },
        { bendLength: 1550, correction: 9.3, crown: 0.31 },
        { bendLength: 1646, correction: 9.5, crown: 0.33 },
        { bendLength: 1743, correction: 9.7, crown: 0.35 },
        { bendLength: 1888, correction: 9.9, crown: 0.38 },
        { bendLength: 2000, correction: 10.1, crown: 0.4 },
        { bendLength: 2250, correction: 10.5, crown: 0.45 },
        { bendLength: 2600, correction: 10.9, crown: 0.5 },
        { bendLength: 2750, correction: 11.1, crown: 0.5 },
        { bendLength: 3000, correction: 11.5, crown: 0.5 }
      ]
    }
  }
};

// Linear interpolation helper
function interpolate(x, x1, y1, x2, y2) {
  if (x2 === x1) return y1;
  return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
}

// Quadratic extrapolation using 3 points
// Fits a parabola through the points and evaluates at x
function quadraticExtrapolate(x, points) {
  // points = [{x: bendLength, y: correction or crown}, ...]
  const [p1, p2, p3] = points;
  
  // Lagrange interpolation for quadratic
  const L0 = ((x - p2.x) * (x - p3.x)) / ((p1.x - p2.x) * (p1.x - p3.x));
  const L1 = ((x - p1.x) * (x - p3.x)) / ((p2.x - p1.x) * (p2.x - p3.x));
  const L2 = ((x - p1.x) * (x - p2.x)) / ((p3.x - p1.x) * (p3.x - p2.x));
  
  return p1.y * L0 + p2.y * L1 + p3.y * L2;
}

// Linear regression for crown extrapolation using multiple points
// Fits a line using least squares and evaluates at x
function linearRegressionExtrapolate(x, points) {
  const n = points.length;
  if (n === 0) return 0;
  if (n === 1) return points[0].y;
  
  // Calculate means
  let sumX = 0, sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // Calculate slope and intercept
  let numerator = 0, denominator = 0;
  for (const p of points) {
    numerator += (p.x - meanX) * (p.y - meanY);
    denominator += (p.x - meanX) * (p.x - meanX);
  }
  
  if (denominator === 0) return meanY;
  
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;
  
  return slope * x + intercept;
}

// Find correction values with interpolation
function findCorrection(materialKey, flangeLength, bendLength) {
  const material = MATERIALS_DB[materialKey];
  if (!material) return { error: "Material not found" };
  
  const flangeData = material.flanges[flangeLength];
  if (!flangeData) {
    // Flange length not in database - likely too small
    const availableFlanges = Object.keys(material.flanges).map(Number).sort((a, b) => a - b);
    const minFlange = availableFlanges[0];
    if (flangeLength < minFlange) {
      return { 
        error: "BEND NOT POSSIBLE",
        reason: `Flange height ${flangeLength}mm is too short. Minimum flange for this material is ${minFlange}mm.`,
        notPossible: true
      };
    }
    return { error: `No data for ${flangeLength}mm flange` };
  }
  
  // Filter out "not possible" entries for interpolation
  const validData = flangeData.filter(d => d.correction !== null);
  
  // Check if ALL entries are "not possible" (like 6mm flange)
  if (validData.length === 0) {
    return { 
      error: "BEND NOT POSSIBLE",
      reason: `${flangeLength}mm flange is too short for any bend length with this material.`,
      notPossible: true
    };
  }
  
  // Check if requested bend length exceeds what this flange can handle
  const maxPossibleBend = Math.max(...validData.map(d => d.bendLength));
  const notPossibleEntries = flangeData.filter(d => d.correction === null);
  
  if (notPossibleEntries.length > 0) {
    // There are "not possible" entries - check if we're beyond the limit
    const minNotPossible = Math.min(...notPossibleEntries.map(d => d.bendLength));
    if (bendLength >= minNotPossible) {
      return { 
        error: "BEND NOT POSSIBLE",
        reason: `${flangeLength}mm flange cannot hold a ${bendLength}mm bend. Maximum bend length for this flange is ${maxPossibleBend}mm.`,
        notPossible: true,
        maxBendLength: maxPossibleBend
      };
    }
  }
  
  // Check bounds
  const minBend = Math.min(...validData.map(d => d.bendLength));
  const maxBend = Math.max(...validData.map(d => d.bendLength));
  
  if (bendLength < minBend) {
    // Extrapolate below minimum using first 3 data points for correction (quadratic fit)
    // and first 6 data points for crown (linear regression - crown changes more gradually)
    const point1 = validData[0];
    const point2 = validData[1];
    const point3 = validData[2];
    
    if (point1 && point2 && point3) {
      const correctionPoints = [
        { x: point1.bendLength, y: point1.correction },
        { x: point2.bendLength, y: point2.correction },
        { x: point3.bendLength, y: point3.correction }
      ];
      
      // Use up to 6 points for crown extrapolation
      const crownPointCount = Math.min(6, validData.length);
      const crownPoints = validData.slice(0, crownPointCount).map(d => ({
        x: d.bendLength,
        y: d.crown
      }));
      
      const extrapCorrection = quadraticExtrapolate(bendLength, correctionPoints);
      const extrapCrown = linearRegressionExtrapolate(bendLength, crownPoints);
      
      return {
        correction: Math.round(Math.max(0, extrapCorrection) * 100) / 100,
        crown: Math.round(Math.max(0, extrapCrown) * 100) / 100,
        isExact: false,
        isExtrapolated: true,
        bendLength: bendLength,
        extrapolatedFrom: [point1.bendLength, point2.bendLength, point3.bendLength],
        minTested: minBend,
        warning: `Extrapolated below minimum tested (${minBend}mm)`
      };
    }
    
    return { 
      error: `Below minimum tested (${minBend}mm)`,
      suggestion: validData[0]
    };
  }
  if (bendLength > maxBend) {
    // Extrapolate above maximum using last 3 data points for correction (quadratic fit)
    // and last 6 data points for crown (linear regression - crown changes more gradually)
    const point1 = validData[validData.length - 3];
    const point2 = validData[validData.length - 2];
    const point3 = validData[validData.length - 1];
    
    if (point1 && point2 && point3) {
      const correctionPoints = [
        { x: point1.bendLength, y: point1.correction },
        { x: point2.bendLength, y: point2.correction },
        { x: point3.bendLength, y: point3.correction }
      ];
      
      // Use up to 6 points for crown extrapolation
      const crownPointCount = Math.min(6, validData.length);
      const crownPoints = validData.slice(-crownPointCount).map(d => ({
        x: d.bendLength,
        y: d.crown
      }));
      
      const extrapCorrection = quadraticExtrapolate(bendLength, correctionPoints);
      const extrapCrown = linearRegressionExtrapolate(bendLength, crownPoints);
      
      return {
        correction: Math.round(Math.max(0, extrapCorrection) * 100) / 100,
        crown: Math.round(Math.max(0, extrapCrown) * 100) / 100,
        isExact: false,
        isExtrapolated: true,
        extrapolatedAbove: true,
        bendLength: bendLength,
        extrapolatedFrom: [point1.bendLength, point2.bendLength, point3.bendLength],
        maxTested: maxBend,
        warning: `Extrapolated above maximum tested (${maxBend}mm)`
      };
    }
    
    return { 
      error: `Above maximum tested (${maxBend}mm)`,
      suggestion: validData[validData.length - 1]
    };
  }
  
  // Find exact match
  const exact = validData.find(d => d.bendLength === bendLength);
  if (exact) {
    return {
      correction: exact.correction,
      crown: exact.crown,
      isExact: true,
      bendLength: bendLength
    };
  }
  
  // Find surrounding points for interpolation
  let lower = null, upper = null;
  for (let i = 0; i < validData.length - 1; i++) {
    if (validData[i].bendLength < bendLength && validData[i + 1].bendLength > bendLength) {
      lower = validData[i];
      upper = validData[i + 1];
      break;
    }
  }
  
  if (lower && upper) {
    const interpCorrection = interpolate(
      bendLength, 
      lower.bendLength, lower.correction,
      upper.bendLength, upper.correction
    );
    const interpCrown = interpolate(
      bendLength,
      lower.bendLength, lower.crown,
      upper.bendLength, upper.crown
    );
    
    return {
      correction: Math.round(interpCorrection * 100) / 100,
      crown: Math.round(interpCrown * 100) / 100,
      isExact: false,
      bendLength: bendLength,
      interpolatedBetween: [lower.bendLength, upper.bendLength],
      lowerPoint: lower,
      upperPoint: upper
    };
  }
  
  return { error: "Could not interpolate" };
}

export default function BendCorrectionCalculator() {
  const [material, setMaterial] = useState("2mm_aluminum");
  const [flangeLength, setFlangeLength] = useState(10);
  const [bendLengthInput, setBendLengthInput] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showChart, setShowChart] = useState(false);
  
  const availableFlanges = useMemo(() => {
    const mat = MATERIALS_DB[material];
    return mat ? Object.keys(mat.flanges).map(Number).sort((a, b) => a - b) : [];
  }, [material]);
  
  const chartData = useMemo(() => {
    const mat = MATERIALS_DB[material];
    if (!mat || !mat.flanges[flangeLength]) return [];
    return mat.flanges[flangeLength]
      .filter(d => d.correction !== null)
      .map(d => ({
        bendLength: d.bendLength,
        correction: d.correction,
        crown: d.crown
      }));
  }, [material, flangeLength]);
  
  const handleNumpadPress = (value) => {
    if (value === 'C') {
      setBendLengthInput("");
      setResult(null);
    } else if (value === '⌫') {
      setBendLengthInput(prev => prev.slice(0, -1));
    } else if (value === 'GO') {
      calculateResult();
    } else {
      setBendLengthInput(prev => prev + value);
    }
  };
  
  const calculateResult = () => {
    const bendLen = parseFloat(bendLengthInput);
    if (isNaN(bendLen) || bendLen <= 0) {
      setResult({ error: "Enter a valid bend length" });
      return;
    }
    
    const res = findCorrection(material, flangeLength, bendLen);
    setResult(res);
    
    if (!res.error) {
      const historyEntry = {
        id: Date.now(),
        material: MATERIALS_DB[material].name,
        flangeLength,
        bendLength: bendLen,
        correction: res.correction,
        crown: res.crown,
        isExact: res.isExact,
        timestamp: new Date().toLocaleTimeString()
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
    }
  };
  
  const loadFromHistory = (entry) => {
    setBendLengthInput(entry.bendLength.toString());
    setFlangeLength(entry.flangeLength);
    const res = findCorrection(material, entry.flangeLength, entry.bendLength);
    setResult(res);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
      color: '#e8e8e8',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
            BEND CORRECTION
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#1a1a2e', opacity: 0.8 }}>
            Sheet Metal Calculator
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          background: '#1a1a2e',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          ◢
        </div>
      </div>
      
      {/* Material & Flange Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Material
          </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 12px',
              marginTop: '6px',
              background: '#252542',
              border: '2px solid #3d3d5c',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            {Object.entries(MATERIALS_DB).map(([key, mat]) => (
              <option key={key} value={key}>{mat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Flange Length
          </label>
          <select
            value={flangeLength}
            onChange={(e) => setFlangeLength(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '14px 12px',
              marginTop: '6px',
              background: '#252542',
              border: '2px solid #3d3d5c',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            {availableFlanges.map(f => (
              <option key={f} value={f}>{f} mm</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Bend Length Input Display */}
      <div style={{
        background: '#0d0d1a',
        border: '2px solid #3d3d5c',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        textAlign: 'right'
      }}>
        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Bend Length (mm)
        </div>
        <div style={{
          fontSize: '42px',
          fontWeight: 700,
          color: bendLengthInput ? '#fff' : '#555',
          minHeight: '50px',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          {bendLengthInput || '0'}
        </div>
      </div>
      
      {/* Numpad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {['7', '8', '9', 'C', '4', '5', '6', '⌫', '1', '2', '3', '.', '0', '00', 'GO'].map((key, i) => (
          <button
            key={key}
            onClick={() => handleNumpadPress(key)}
            style={{
              padding: key === 'GO' ? '20px' : '18px',
              fontSize: key === 'GO' ? '18px' : '22px',
              fontWeight: 600,
              fontFamily: 'inherit',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              gridColumn: key === 'GO' ? 'span 2' : 'span 1',
              background: key === 'GO' 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : key === 'C' 
                  ? '#dc2626'
                  : key === '⌫'
                    ? '#6366f1'
                    : '#252542',
              color: '#fff',
              boxShadow: key === 'GO' 
                ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                : '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.1s, box-shadow 0.1s',
              WebkitTapHighlightColor: 'transparent'
            }}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {key}
          </button>
        ))}
      </div>
      
      {/* Result Display */}
      {result && (
        <div style={{
          background: result.error ? '#2d1f1f' : '#1f2d1f',
          border: `2px solid ${result.error ? '#5c3d3d' : '#3d5c3d'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          {result.error ? (
            <div>
              {result.notPossible ? (
                <>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 800, 
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '32px' }}>⊘</span> {result.error}
                  </div>
                  <div style={{ 
                    marginTop: '12px', 
                    color: '#fca5a5', 
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {result.reason}
                  </div>
                  {result.maxBendLength && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      background: '#3d2020',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#fbbf24'
                    }}>
                      💡 Max bend length for {flangeLength}mm flange: <strong>{result.maxBendLength}mm</strong>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ color: '#f87171', fontSize: '16px', fontWeight: 600 }}>
                    ⚠ {result.error}
                  </div>
                  {result.suggestion && (
                    <div style={{ marginTop: '8px', color: '#fbbf24', fontSize: '14px' }}>
                      Nearest: {result.suggestion.bendLength}mm → {result.suggestion.correction}°
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Bend Correction
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                    {result.correction}°
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Crown
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#60a5fa', marginTop: '4px' }}>
                    {result.crown}
                  </div>
                </div>
              </div>
              
              {result.isExtrapolated && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#4a3000',
                  border: '1px solid #854d0e',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fbbf24'
                }}>
                  ⚠ EXTRAPOLATED — {result.extrapolatedAbove 
                    ? `Above maximum tested (${result.maxTested}mm)` 
                    : `Below minimum tested (${result.minTested}mm)`}. Use with caution.
                </div>
              )}
              
              {!result.isExact && !result.isExtrapolated && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#252542',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#a5a5c5'
                }}>
                  ⟨ Interpolated between {result.interpolatedBetween[0]}mm and {result.interpolatedBetween[1]}mm ⟩
                </div>
              )}
              
              {result.isExact && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  background: '#1a3d1a',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#4ade80'
                }}>
                  ✓ Exact match from test data
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Toggle Chart */}
      <button
        onClick={() => setShowChart(!showChart)}
        style={{
          width: '100%',
          padding: '14px',
          background: '#252542',
          border: '2px solid #3d3d5c',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: 'pointer',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {showChart ? '▼' : '▶'} Correction Curve
      </button>
      
      {/* Chart */}
      {showChart && chartData.length > 0 && (
        <div style={{
          background: '#0d0d1a',
          border: '2px solid #3d3d5c',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="bendLength" 
                stroke="#666"
                tick={{ fill: '#888', fontSize: 10 }}
                tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
              />
              <YAxis 
                yAxisId="left"
                stroke="#4ade80"
                tick={{ fill: '#4ade80', fontSize: 10 }}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#60a5fa"
                tick={{ fill: '#60a5fa', fontSize: 10 }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid #3d3d5c',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  `${value}${name === 'correction' ? '°' : ''}`,
                  name === 'correction' ? 'Correction' : 'Crown'
                ]}
                labelFormatter={(v) => `Bend: ${v}mm`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
                formatter={(value) => value === 'correction' ? 'Correction (°)' : 'Crown'}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="correction" 
                stroke="#4ade80" 
                strokeWidth={2}
                dot={{ fill: '#4ade80', r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="crown" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', r: 3 }}
                activeDot={{ r: 6 }}
              />
              {result && !result.error && (
                <ReferenceDot
                  yAxisId="left"
                  x={result.bendLength}
                  y={result.correction}
                  r={8}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* History */}
      {history.length > 0 && (
        <div style={{
          background: '#0d0d1a',
          border: '2px solid #3d3d5c',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ 
            fontSize: '11px', 
            color: '#888', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Recent Lookups</span>
            <button
              onClick={() => setHistory([])}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '10px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              Clear
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {history.map(entry => (
              <button
                key={entry.id}
                onClick={() => loadFromHistory(entry)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#1a1a2e',
                  border: '1px solid #2d2d4d',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: '#e8e8e8',
                  width: '100%'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    {entry.bendLength}mm × {entry.flangeLength}mm flange
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {entry.timestamp} {!entry.isExact && '• interpolated'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4ade80' }}>
                    {entry.correction}°
                  </div>
                  <div style={{ fontSize: '12px', color: '#60a5fa' }}>
                    ↕ {entry.crown}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#555'
      }}>
        Data: 2mm/12ga 3003 Aluminum • More materials coming soon
      </div>
    </div>
  );
}
