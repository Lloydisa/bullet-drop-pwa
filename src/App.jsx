import { useState } from "react";

export default function BulletDropCalculator() {
  const [velocity, setVelocity] = useState(2700);
  const [ballisticCoefficient, setBallisticCoefficient] = useState(0.5);
  const [distance, setDistance] = useState(800);
  const [elevation, setElevation] = useState(1500);
  const [dropMeters, setDropMeters] = useState(null);
  const [dropMils, setDropMils] = useState(null);

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
  const distanceMeters = distanceYards * 0.9144;
  const rho = airDensity(elevation);
  const dt = 0.001;
  let t = 0;
  let x = 0;
  let v = v0;

  if (bc <= 0 || isNaN(bc)) {
    alert("Ballistic coefficient must be greater than 0.");
    return 0;
  }

  const maxTime = 5.0; // realistic bullet flight time limit
  const dragFactor = 0.000110; // empirically tuned for better BC behavior

  while (x < distanceMeters && t < maxTime) {
    const dragDecel = dragFactor * (rho / 1.225) * (v * v) / bc;
    v -= dragDecel * dt;
    if (v <= 30 || isNaN(v)) break;

    x += v * dt;
    t += dt;
  }

  const drop = 0.5 * 9.80665 * t * t;
  return drop;
};


    const v0 = fpsToMps(velocity);
    const dropM = simulateBallisticDrop(v0, distance, ballisticCoefficient, elevation);
    const dropMil = dropToMils(dropM, distance);

    setDropMeters(dropM.toFixed(2));
    setDropMils(dropMil.toFixed(2));
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Bullet Drop Calculator (MILs)</h1>

      <div className="space-y-2">
        <label>Muzzle Velocity (fps):</label>
        <input
          type="number"
          value={velocity}
          onChange={(e) => setVelocity(Number(e.target.value))}
          className="w-full p-2 rounded border"
        />

        <label>Ballistic Coefficient (G1):</label>
        <input
          type="number"
          value={ballisticCoefficient}
          onChange={(e) => setBallisticCoefficient(Number(e.target.value))}
          className="w-full p-2 rounded border"
        />

        <label>Distance to Target (yards):</label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full p-2 rounded border"
        />

        <label>Elevation (meters):</label>
        <input
          type="number"
          value={elevation}
          onChange={(e) => setElevation(Number(e.target.value))}
          className="w-full p-2 rounded border"
        />
      </div>

      <button
        onClick={calculateDrop}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Calculate Drop
      </button>

      {dropMeters && (
        <div className="mt-4 text-lg">
          <p>Estimated Bullet Drop: <strong>{dropMeters}</strong> meters</p>
          <p>Drop in MILs: <strong>{dropMils}</strong> mils</p>
        </div>
      )}
    </div>
  );
}
