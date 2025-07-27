import { useState } from "react";

export default function BulletDropCalculator() {
  const [velocity, setVelocity] = useState(2700);
  const [ballisticCoefficient, setBallisticCoefficient] = useState(0.5);
  const [distance, setDistance] = useState(800);
  const [elevation, setElevation] = useState(1500);
  const [zero, setZero] = useState(100);
  const [dropMeters, setDropMeters] = useState(null);
  const [dropMils, setDropMils] = useState(null);

  const bulletPresets = {
    "308 - 175gr SMK": { velocity: 2650, bc: 0.505 },
    "308 - 168gr AAC": { velocity: 2650, bc: 0.462 },
    "308 - 178gr AAC": { velocity: 2600, bc: 0.495 },
    "6.5CM - 140gr ELD-M": { velocity: 2700, bc: 0.610 },
    "6.5CM - 140gr SST": { velocity: 2700, bc: 0.520 },
    "6.5 Grendel - 123gr ELD-M": { velocity: 2525, bc: 0.506 },
    "223 - 77gr TMK": { velocity: 2750, bc: 0.372 },
    "300 PRC - 225gr ELD-M": { velocity: 2810, bc: 0.777 },
    "22LR - 40gr": { velocity: 1100, bc: 0.120 }
  };

  const calculateDrop = () => {
    const G = 9.80665;
    const YARDS_TO_METERS = 0.9144;
    const fpsToMps = (fps) => fps * 0.3048;
    const mpsToInches = (m) => m / 0.0254;

    const airDensity = (elevation) => {
      const seaLevelDensity = 1.225;
      return seaLevelDensity * Math.exp(-elevation / 8434.5);
    };

    const dropToMils = (dropM, distanceYards) => {
      const dropInches = mpsToInches(dropM);
      return (dropInches / (distanceYards * 36)) * 1000;
    };

    const simulateBallisticDrop = (v0, distanceYards, bc, elevation) => {
      const distanceMeters = (distanceYards - zero) * YARDS_TO_METERS;
      const rho = airDensity(elevation);
      const dt = 0.001;
      let t = 0;
      let x = 0;
      let v = v0;

      if (bc <= 0 || isNaN(bc)) {
        alert("Ballistic coefficient must be greater than 0.");
        return 0;
      }

      const dragFactor = 0.00044;
      const maxTime = 2.0;

      while (x < distanceMeters && t < maxTime) {
        const dragDecel = dragFactor * (rho / 1.225) * (v * v) / bc;
        v -= dragDecel * dt;
        if (v <= 90 || isNaN(v)) break;

        x += v * dt;
        t += dt;
      }

      console.log("Simulated TOF (s):", t.toFixed(3));

      const drop = 0.5 * G * t * t;
      return drop;
    };

    const v0 = fpsToMps(velocity);
    const dropM = simulateBallisticDrop(v0, distance, ballisticCoefficient, elevation);
    const dropMil = dropToMils(dropM, distance - zero);

    setDropMeters(dropM.toFixed(2));
    setDropMils(dropMil.toFixed(2));
  };

  const handleBulletSelect = (e) => {
    const preset = bulletPresets[e.target.value];
    if (preset) {
      setVelocity(preset.velocity);
      setBallisticCoefficient(preset.bc);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1526869383286-7c8d3b86b0f3?auto=format&fit=crop&w=1950&q=80')] bg-cover text-green-100 px-4 py-8">
      <div className="max-w-xl mx-auto p-6 bg-black/70 backdrop-blur-md rounded-xl shadow-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-200">🎯 Bullet Drop Calculator (MILs)</h1>

        <div className="space-y-3">
          <label>Select Bullet Preset:</label>
          <select onChange={handleBulletSelect} className="w-full p-2 rounded bg-gray-800 text-white border border-green-300">
            <option value="">-- Choose a preset --</option>
            {Object.keys(bulletPresets).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          <label>Muzzle Velocity (fps):</label>
          <input
            type="number"
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
          />

          <label>Ballistic Coefficient (G1):</label>
          <input
            type="number"
            value={ballisticCoefficient}
            onChange={(e) => setBallisticCoefficient(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
          />

          <label>Distance to Target (yards):</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
          />

          <label>Rifle Zero Distance (yards):</label>
          <input
            type="number"
            value={zero}
            onChange={(e) => setZero(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
          />

          <label>Elevation Above Sea Level (meters):</label>
          <input
            type="number"
            value={elevation}
            onChange={(e) => setElevation(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
          />
        </div>

        <button
          onClick={calculateDrop}
          className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700 w-full"
        >
          🎯 Calculate Drop
        </button>

        {dropMeters && (
          <div className="mt-4 text-lg bg-gray-800 p-4 rounded shadow-inner text-white">
            <p>Estimated Bullet Drop: <strong>{dropMeters}</strong> meters</p>
            <p>Drop in MILs (from zero): <strong>{dropMils}</strong> mils</p>
          </div>
        )}
      </div>
    </div>
  );
}
