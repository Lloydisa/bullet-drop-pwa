import { useState } from "react";

export default function App() {
  const [customProfiles, setCustomProfiles] = useState(() => {
    const saved = localStorage.getItem('customBulletProfiles');
    return saved ? JSON.parse(saved) : {};
  });

  const [velocity, setVelocity] = useState(2700);
  const [ballisticCoefficient, setBallisticCoefficient] = useState(0.5);
  const [distance, setDistance] = useState(800);
  const [elevation, setElevation] = useState(1500);
  const [zero, setZero] = useState(100);
  const [dropMeters, setDropMeters] = useState(null);
  const [dropMils, setDropMils] = useState(null);

  const [newName, setNewName] = useState("");
  const [newVel, setNewVel] = useState("");
  const [newBC, setNewBC] = useState("");

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

  const allPresets = { ...bulletPresets, ...customProfiles };

  const handleBulletSelect = (e) => {
    const preset = allPresets[e.target.value];
    if (preset) {
      setVelocity(preset.velocity);
      setBallisticCoefficient(preset.bc);
    }
  };

  const handleAddCustomProfile = () => {
    if (!newName || !newVel || !newBC) {
      alert("Please fill out all fields.");
      return;
    }

    const updated = {
      ...customProfiles,
      [newName]: {
        velocity: parseFloat(newVel),
        bc: parseFloat(newBC)
      }
    };

    setCustomProfiles(updated);
    localStorage.setItem("customBulletProfiles", JSON.stringify(updated));

    setNewName("");
    setNewVel("");
    setNewBC("");
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
      let t = 0, x = 0, v = v0;

      if (bc <= 0 || isNaN(bc)) return 0;

      const dragFactor = 0.00044;
      const maxTime = 2.0;

      while (x < distanceMeters && t < maxTime) {
        const dragDecel = dragFactor * (rho / 1.225) * (v * v) / bc;
        v -= dragDecel * dt;
        if (v <= 90 || isNaN(v)) break;
        x += v * dt;
        t += dt;
      }

      return 0.5 * G * t * t;
    };

    const v0 = fpsToMps(velocity);
    const dropM = simulateBallisticDrop(v0, distance, ballisticCoefficient, elevation);
    const dropMil = dropToMils(dropM, distance - zero);

    setDropMeters(dropM.toFixed(2));
    setDropMils(dropMil.toFixed(2));
  };

  return (
    <div
      className="min-h-screen bg-black text-white bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://upload.wikimedia.org/wikipedia/commons/5/5d/Alaska_satellite_map.jpg')"
      }}
    >
      <div className="bg-black/80 min-h-screen w-full backdrop-blur-sm flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full p-6 bg-black/70 rounded-xl shadow-2xl space-y-6">
          <h1 className="text-3xl font-bold text-center text-green-200">🎯 Bullet Drop Calculator (MILs)</h1>

          <div className="space-y-3">
            <label className="text-green-100">Select Bullet Preset:</label>
            <select
              onChange={handleBulletSelect}
              className="w-full p-2 rounded bg-gray-800 text-white border border-green-300"
            >
              <option value="">-- Choose a preset --</option>
              {Object.keys(allPresets).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>

            <label className="text-green-100">Muzzle Velocity (fps):</label>
            <input
              type="number"
              value={velocity}
              onChange={(e) => setVelocity(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
            />

            <label className="text-green-100">Ballistic Coefficient (G1):</label>
            <input
              type="number"
              value={ballisticCoefficient}
              onChange={(e) => setBallisticCoefficient(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
            />

            <label className="text-green-100">Distance to Target (yards):</label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
            />

            <label className="text-green-100">Rifle Zero Distance (yards):</label>
            <input
              type="number"
              value={zero}
              onChange={(e) => setZero(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
            />

            <label className="text-green-100">Elevation Above Sea Level (meters):</label>
            <input
              type="number"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-900 text-white border border-green-300"
            />
          </div>

          <div className="mt-6 space-y-2">
            <h2 className="text-green-200 font-bold">➕ Add Custom Bullet</h2>
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-green-300"
            />
            <input
              type="number"
              placeholder="Velocity (fps)"
              value={newVel}
              onChange={(e) => setNewVel(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-green-300"
            />
            <input
              type="number"
              placeholder="Ballistic Coefficient"
              value={newBC}
              onChange={(e) => setNewBC(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-green-300"
            />
            <button
              onClick={handleAddCustomProfile}
              className="w-full px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
            >
              ➕ Save Custom Profile
            </button>
          </div>

          {dropMeters && (
            <div className="mt-4 text-lg bg-gray-800 p-4 rounded shadow-inner text-white">
              <p>Estimated Bullet Drop: <strong>{dropMeters}</strong> meters</p>
              <p>Drop in MILs (from zero): <strong>{dropMils}</strong> mils</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
