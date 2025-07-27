import { useState } from "react";

export default function BulletDropCalculator() {
  const [velocity, setVelocity] = useState(2700);
  const [bulletWeight, setBulletWeight] = useState(140);
  const [distance, setDistance] = useState(800);
  const [elevation, setElevation] = useState(1500);
  const [dropMeters, setDropMeters] = useState(null);
  const [dropMils, setDropMils] = useState(null);

  const calculateDrop = () => {
    const G = 9.80665;
    const YARDS_TO_METERS = 0.9144;
    const fpsToMps = (fps) => fps * 0.3048;

    const airDensity = (elevation) => {
      const seaLevelDensity = 1.225;
      return seaLevelDensity * Math.exp(-elevation / 8434.5);
    };

    const dragCoefficient = (v) => {
      if (v > 823) return 0.35;
      if (v > 610) return 0.4;
      if (v > 457) return 0.45;
      return 0.5;
    };

    const dropToMils = (dropM, distanceYards) => {
      const dropInches = dropM / 0.0254;
      return (dropInches / (distanceYards * 36)) * 1000;
    };

    const v0 = fpsToMps(velocity);
    const distanceM = distance * YARDS_TO_METERS;
    const rho = airDensity(elevation);
    const Cd = dragCoefficient(v0);
    const bulletArea = 0.0000645;
    const bulletMass = bulletWeight * 0.00006479891;

    const dragForce = 0.5 * Cd * rho * bulletArea * v0 ** 2;
    const acceleration = dragForce / bulletMass;
    const avgVelocity = v0 - acceleration * 0.5;
    const time = distanceM / avgVelocity;

    const dropM = 0.5 * G * time ** 2;
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

        <label>Bullet Weight (grains):</label>
        <input
          type="number"
          value={bulletWeight}
          onChange={(e) => setBulletWeight(Number(e.target.value))}
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
