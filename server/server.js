const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

// Read DB helper
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return null;
  }
}

// Write DB helper
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// Helper to award badge if not already unlocked
function checkAndAwardBadge(db, badgeId, title, description, icon) {
  const user = db.user;
  const alreadyUnlocked = user.unlockedBadges.some(b => b.id === badgeId);
  if (!alreadyUnlocked) {
    const newBadge = {
      id: badgeId,
      title,
      description,
      icon,
      date: new Date().toISOString().split('T')[0]
    };
    user.unlockedBadges.push(newBadge);
    user.sustainabilityScore += 100; // Bonus points for unlocking a badge!
    return newBadge;
  }
  return null;
}

// Get user profile data
app.get('/api/user', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });
  res.json(db.user);
});

// Update profile name
app.post('/api/user/update-name', (req, res) => {
  const { name } = req.body;
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  db.user.name = name || db.user.name;
  
  // Also update standard leaderboard user name
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.name = db.user.name;
  }

  writeDB(db);
  res.json(db.user);
});

// Post calculator inputs and calculate emissions
app.post('/api/calculator', (req, res) => {
  const {
    transportType, // petrol, hybrid, electric, public, active
    transportKm,   // weekly km
    electricityKwh, // monthly kWh
    electricitySource, // grid, solar, mixed
    dietType,      // vegan, vegetarian, pescatarian, average, meat-heavy
    wasteKg,       // weekly kg
    recycleRate    // percentage 0-100
  } = req.body;

  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  // 1. Calculate Transport (weekly km * 52 weeks * factor / 1000 = tCO2e/year)
  let transportFactor = 0.18; // petrol
  if (transportType === 'hybrid') transportFactor = 0.10;
  else if (transportType === 'electric') transportFactor = 0.05;
  else if (transportType === 'public') transportFactor = 0.04;
  else if (transportType === 'active') transportFactor = 0.0;
  
  const transportScore = (parseFloat(transportKm || 0) * 52 * transportFactor) / 1000;

  // 2. Calculate Electricity (monthly kwh * 12 months * factor / 1000 = tCO2e/year)
  let electricityFactor = 0.40; // grid
  if (electricitySource === 'solar') electricityFactor = 0.02;
  else if (electricitySource === 'mixed') electricityFactor = 0.21;
  
  const electricityScore = (parseFloat(electricityKwh || 0) * 12 * electricityFactor) / 1000;

  // 3. Calculate Diet (fixed annual estimate in tCO2e/year)
  let dietScore = 2.0; // average
  if (dietType === 'vegan') dietScore = 0.9;
  else if (dietType === 'vegetarian') dietScore = 1.2;
  else if (dietType === 'pescatarian') dietScore = 1.5;
  else if (dietType === 'meat-heavy') dietScore = 3.2;

  // 4. Calculate Waste (weekly kg * 52 weeks * factor * (1 - recycleRate/100) / 1000 = tCO2e/year)
  const baseWasteFactor = 0.45; // kg CO2 per kg waste
  const recycledOffset = (recycleRate || 0) / 100;
  const wasteScore = (parseFloat(wasteKg || 0) * 52 * baseWasteFactor * (1 - recycledOffset)) / 1000;

  const totalScore = transportScore + electricityScore + dietScore + wasteScore;
  
  // Prepare results
  const scores = {
    transport: parseFloat(transportScore.toFixed(2)),
    electricity: parseFloat(electricityScore.toFixed(2)),
    food: parseFloat(dietScore.toFixed(2)),
    waste: parseFloat(wasteScore.toFixed(2)),
    total: parseFloat(totalScore.toFixed(2))
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Save to history
  db.user.carbonScore = scores.total;
  db.user.calculationsHistory = db.user.calculationsHistory || [];
  db.user.calculationsHistory.push({
    date: todayStr,
    scores
  });

  // Calculate or adjust sustainability score. Lower carbon footprint = higher sustainability points!
  // Normalizing: Let's say a carbon score of 12.0 tCO2e is "poor" (0 extra points) and 1.5 tCO2e is "perfect" (500 points)
  const carbonSustainPoints = Math.max(0, Math.min(500, Math.round((12.0 - scores.total) * 50)));
  
  // Update sustainability score base
  db.user.sustainabilityScore = 150 + carbonSustainPoints + (db.user.treesPlanted * 50) + (db.user.challengesCompleted * 15) + Math.round(db.user.waterSavedLiters * 0.5) + Math.round(db.user.transportKmSaved * 0.2);

  // Check badges based on footprint
  const newlyUnlockedBadges = [];
  
  const b1 = checkAndAwardBadge(db, 'carbon-minimalist', 'Carbon Minimalist', 'Achieved a total carbon footprint below 3.0 tCO2e/year.', 'Activity', 'ShieldCheck');
  if (scores.total < 3.0 && b1) newlyUnlockedBadges.push(b1);

  const b2 = checkAndAwardBadge(db, 'eco-commuter', 'Eco Commuter', 'Kept annual transportation emissions below 0.6 tCO2e.', 'Bike');
  if (scores.transport < 0.6 && b2) newlyUnlockedBadges.push(b2);

  const b3 = checkAndAwardBadge(db, 'solar-advocate', 'Solar Advocate', 'Clean electricity usage profile (under 0.3 tCO2e/year).', 'Sun');
  if (scores.electricity < 0.3 && b3) newlyUnlockedBadges.push(b3);

  const b4 = checkAndAwardBadge(db, 'green-plate', 'Green Plate Special', 'Chose vegetarian or vegan habits, reducing diet emissions.', 'Leaf');
  if ((dietType === 'vegan' || dietType === 'vegetarian') && b4) newlyUnlockedBadges.push(b4);

  const b5 = checkAndAwardBadge(db, 'circular-pioneer', 'Circular Pioneer', 'Recycled over 60% of household waste or waste score is negligible.', 'Recycle');
  if ((recycleRate >= 60 || scores.waste < 0.15) && b5) newlyUnlockedBadges.push(b5);

  // Update leaderboard current user score
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.sustainabilityScore = db.user.sustainabilityScore;
    currentUserLeaderboard.carbonScore = db.user.carbonScore;
    currentUserLeaderboard.badgeCount = db.user.unlockedBadges.length;
  }

  // Sort leaderboard ranks
  db.leaderboard.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  db.leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  writeDB(db);

  res.json({
    user: db.user,
    newlyUnlockedBadges,
    currentScores: scores
  });
});

// Heuristics-based AI Sustainability Advisor
app.post('/api/advisor/recommendations', (req, res) => {
  const { scores } = req.body; // Expects calculator scores { transport, electricity, food, waste, total }
  
  if (!scores) {
    return res.status(400).json({ error: "Missing scores in request body." });
  }

  const recommendations = [];
  let potentialReduction = 0;

  // 1. Analyze Transport
  if (scores.transport > 1.5) {
    recommendations.push({
      id: "rec-transport-ev",
      category: "transport",
      title: "Transition to a Smart EV",
      description: "Switching from a petrol vehicle to an electric vehicle can drastically drop your commute footprint.",
      impact: "Saves ~70% of transportation emissions",
      savingsTons: parseFloat((scores.transport * 0.7).toFixed(2)),
      action: "Research electric vehicle incentives or solar-charging stations nearby."
    });
    recommendations.push({
      id: "rec-transport-transit",
      category: "transport",
      title: "Activate Public Transit Protocol",
      description: "Swap 3 car trips a week with bus, metro, or bicycling options.",
      impact: "Saves ~0.8 tons CO2e/year",
      savingsTons: 0.80,
      action: "Download city transit apps and map out a cycle lane route to work."
    });
    potentialReduction += (scores.transport * 0.7) + 0.8;
  } else if (scores.transport > 0.5) {
    recommendations.push({
      id: "rec-transport-active",
      category: "transport",
      title: "Micro-mobility Commutes",
      description: "Use an electric scooter or regular bicycle for short-distance neighborhood errands.",
      impact: "Saves ~0.25 tons CO2e/year",
      savingsTons: 0.25,
      action: "Plan grocery runs and local visits using footpaths and bicycle lanes."
    });
    potentialReduction += 0.25;
  }

  // 2. Analyze Electricity
  if (scores.electricity > 1.2) {
    recommendations.push({
      id: "rec-electricity-solar",
      category: "electricity",
      title: "Solar Photovoltaic Transition",
      description: "Equipping your residence with clean energy solar panels redirects draw away from carbon-heavy municipal coal grids.",
      impact: "Saves ~90% of electricity emissions",
      savingsTons: parseFloat((scores.electricity * 0.9).toFixed(2)),
      action: "Review domestic rooftop solar options or request green energy purchase contracts from your utility."
    });
    recommendations.push({
      id: "rec-electricity-hvac",
      category: "electricity",
      title: "Smart Thermostats & Heat Pumps",
      description: "Upgrade traditional resistive heaters to geothermal or electric heat pumps, and install smart thermostats.",
      impact: "Saves ~0.65 tons CO2e/year",
      savingsTons: 0.65,
      action: "Tune your cooling to 24°C and heating to 19°C. Install IoT thermal regulators."
    });
    potentialReduction += (scores.electricity * 0.9) + 0.65;
  } else if (scores.electricity > 0.3) {
    recommendations.push({
      id: "rec-electricity-led",
      category: "electricity",
      title: "Appliance Optimization Protocol",
      description: "Replace remaining tungsten lightbulbs with energy-star LEDs, and set smart power bars to cut ghost loads.",
      impact: "Saves ~0.15 tons CO2e/year",
      savingsTons: 0.15,
      action: "Unplug standby electronics and chargers when going out or overnight."
    });
    potentialReduction += 0.15;
  }

  // 3. Analyze Diet/Food
  if (scores.food >= 2.0) {
    recommendations.push({
      id: "rec-food-vegan",
      category: "food",
      title: "Adopt Veg-First Meals",
      description: "Cutting down beef, lamb, and pork consumption in favor of grains, legumes, and vegetable-based meals.",
      impact: "Saves ~1.8 tons CO2e/year",
      savingsTons: 1.80,
      action: "Initiate meat-free dinner schedules and discover vegetarian alternatives."
    });
    recommendations.push({
      id: "rec-food-local",
      category: "food",
      title: "Reduce Food Transit Miles",
      description: "Purchase seasonal, locally harvested food to avoid extensive global air-freight shipping emissions.",
      impact: "Saves ~0.35 tons CO2e/year",
      savingsTons: 0.35,
      action: "Visit local farmer cooperatives and read origin labels at supermarkets."
    });
    potentialReduction += 1.80 + 0.35;
  } else if (scores.food >= 1.2) {
    recommendations.push({
      id: "rec-food-waste",
      category: "food",
      title: "Zero Domestic Food Waste",
      description: "About 30% of global food is discarded, rotting in landfill pits and generating methane.",
      impact: "Saves ~0.20 tons CO2e/year",
      savingsTons: 0.20,
      action: "Plan meals weekly, purchase strictly needed volumes, and compost organic scraps."
    });
    potentialReduction += 0.20;
  }

  // 4. Analyze Waste
  if (scores.waste > 0.4) {
    recommendations.push({
      id: "rec-waste-recycle",
      category: "waste",
      title: "Launch Circular Economy Sorting",
      description: "Improve recycling habits by separating plastics, glass, metals, and cardboard thoroughly.",
      impact: "Saves ~50% of waste emissions",
      savingsTons: parseFloat((scores.waste * 0.5).toFixed(2)),
      action: "Set up separate color-coded classification bins at home."
    });
    recommendations.push({
      id: "rec-waste-compost",
      category: "waste",
      title: "Rooftop/Yard Composting Hub",
      description: "Setting up a soil micro-composter prevents organic food waste from releasing methane in compact landfills.",
      impact: "Saves ~0.15 tons CO2e/year",
      savingsTons: 0.15,
      action: "Build a compost bin or drop off food scraps at local community garden hubs."
    });
    potentialReduction += (scores.waste * 0.5) + 0.15;
  }

  // Calculate target future path (net zero projection)
  const targetEmissions = Math.max(0.4, parseFloat((scores.total - Math.min(scores.total - 0.5, potentialReduction)).toFixed(2)));

  const analysis = {
    summary: `Your current annual carbon score is ${scores.total} tCO2e. By applying our high-impact recommendations, you can reduce this down to ${targetEmissions} tCO2e/year, which represents a ${Math.round((1 - targetEmissions / scores.total) * 100)}% saving, aligning you with the 2050 Global Net-Zero targets.`,
    primaryCulprit: scores.transport >= scores.electricity && scores.transport >= scores.food ? 'Transportation' :
                     scores.electricity >= scores.food && scores.electricity >= scores.waste ? 'Electricity' :
                     scores.food >= scores.waste ? 'Dietary Habits' : 'Waste Generation',
    futureRoadmap: [
      { year: 2026, target: scores.total, milestone: "Establish Baseline Carbon Tracking" },
      { year: 2030, target: parseFloat((scores.total * 0.75).toFixed(2)), milestone: "Phase out single-use plastics & reduce car travel by 30%" },
      { year: 2040, target: parseFloat((scores.total * 0.40).toFixed(2)), milestone: "Upgrade to solar panels, install residential heat pumps" },
      { year: 2050, target: targetEmissions, milestone: "Achieve Individual Net-Zero Neutrality" }
    ]
  };

  res.json({
    analysis,
    recommendations,
    projectedNetEmissions: targetEmissions
  });
});

// Get challenges list
app.get('/api/challenges', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });
  res.json(db.challenges);
});

// Complete a challenge
app.post('/api/challenges/complete', (req, res) => {
  const { challengeId } = req.body;
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  const challenge = db.challenges.find(c => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  if (challenge.completed) {
    return res.json({ success: true, message: "Already completed", user: db.user });
  }

  challenge.completed = true;
  db.user.challengesCompleted += 1;
  db.user.sustainabilityScore += challenge.points;

  // Update streak logic
  const todayStr = new Date().toISOString().split('T')[0];
  const lastLogDate = db.user.lastLogDate;
  if (lastLogDate) {
    const lastDate = new Date(lastLogDate);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      db.user.streak += 1;
    } else if (diffDays > 1) {
      db.user.streak = 1; // reset streak if gap exists
    }
  } else {
    db.user.streak = 1;
  }
  db.user.lastLogDate = todayStr;

  const newlyUnlockedBadges = [];

  // Check for badge unlocks based on milestones
  const streakMasterBadge = checkAndAwardBadge(db, 'streak-master', 'Streak Master', 'Achieved a sustainability logging streak of 5+ consecutive days.', 'Flame');
  if (db.user.streak >= 5 && streakMasterBadge) {
    newlyUnlockedBadges.push(streakMasterBadge);
  }

  const greenWarriorBadge = checkAndAwardBadge(db, 'green-warrior', 'Green Warrior', 'Completed 5 sustainability challenges.', 'Shield');
  if (db.user.challengesCompleted >= 5 && greenWarriorBadge) {
    newlyUnlockedBadges.push(greenWarriorBadge);
  }

  // Update leaderboard current user score
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.sustainabilityScore = db.user.sustainabilityScore;
    currentUserLeaderboard.streak = db.user.streak;
    currentUserLeaderboard.badgeCount = db.user.unlockedBadges.length;
  }

  // Sort leaderboard ranks
  db.leaderboard.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  db.leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  writeDB(db);

  res.json({
    success: true,
    user: db.user,
    newlyUnlockedBadges,
    completedChallenge: challenge
  });
});

// Reset challenges for next day simulation
app.post('/api/challenges/reset', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  db.challenges.forEach(c => {
    c.completed = false;
  });

  writeDB(db);
  res.json({ success: true, challenges: db.challenges });
});

// Log virtual tree planting
app.post('/api/tracker/tree', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  db.user.treesPlanted += 1;
  db.user.sustainabilityScore += 50; // 50 sustainability points per tree!
  
  // A tree offsets roughly 22kg (0.022 tons) of CO2 per year.
  // Update carbon score slightly
  if (db.user.carbonScore > 0.1) {
    db.user.carbonScore = parseFloat((db.user.carbonScore - 0.02).toFixed(2));
  }

  const newlyUnlockedBadges = [];
  const forestBadge = checkAndAwardBadge(db, 'forest-pioneer', 'Forest Guardian', 'Planted 5+ virtual trees.', 'Trees');
  if (db.user.treesPlanted >= 5 && forestBadge) {
    newlyUnlockedBadges.push(forestBadge);
  }

  // Update leaderboard current user score
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.sustainabilityScore = db.user.sustainabilityScore;
    currentUserLeaderboard.carbonScore = db.user.carbonScore;
    currentUserLeaderboard.badgeCount = db.user.unlockedBadges.length;
  }

  // Sort leaderboard ranks
  db.leaderboard.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  db.leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  writeDB(db);

  res.json({
    user: db.user,
    newlyUnlockedBadges,
    treesPlanted: db.user.treesPlanted
  });
});

// Log water saved (in liters)
app.post('/api/tracker/water', (req, res) => {
  const { liters } = req.body;
  if (!liters || isNaN(liters)) {
    return res.status(400).json({ error: "Missing or invalid liters." });
  }

  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  db.user.waterSavedLiters = (db.user.waterSavedLiters || 0) + parseInt(liters);
  db.user.sustainabilityScore += Math.round(liters * 0.5); // 0.5 points per liter saved

  const newlyUnlockedBadges = [];
  const waterSaverBadge = checkAndAwardBadge(db, 'water-conservationist', 'Hydro-Saver Master', 'Saved over 100 liters of domestic water.', 'Droplets');
  if (db.user.waterSavedLiters >= 100 && waterSaverBadge) {
    newlyUnlockedBadges.push(waterSaverBadge);
  }

  // Update leaderboard current user score
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.sustainabilityScore = db.user.sustainabilityScore;
    currentUserLeaderboard.badgeCount = db.user.unlockedBadges.length;
  }

  // Sort leaderboard ranks
  db.leaderboard.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  db.leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  writeDB(db);

  res.json({
    user: db.user,
    newlyUnlockedBadges,
    waterSavedLiters: db.user.waterSavedLiters
  });
});

// Log green transit kilometers saved
app.post('/api/tracker/transport', (req, res) => {
  const { km } = req.body;
  if (!km || isNaN(km)) {
    return res.status(400).json({ error: "Missing or invalid kilometers." });
  }

  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });

  db.user.transportKmSaved = (db.user.transportKmSaved || 0) + parseFloat(km);
  db.user.sustainabilityScore += Math.round(km * 2.0); // 2.0 points per km saved

  // Each km of car driving offset (replacing petrol with cycling/transit) saves ~0.18 kg CO2
  // We can track carbon impact of transport offset
  if (db.user.carbonScore > 0.1) {
    const savedCarbonTons = (km * 0.18) / 1000;
    db.user.carbonScore = parseFloat((db.user.carbonScore - savedCarbonTons).toFixed(3));
  }

  const newlyUnlockedBadges = [];
  const transitBadge = checkAndAwardBadge(db, 'green-speedster', 'Transit Overlord', 'Completed 50km of green active transportation.', 'Milestone');
  if (db.user.transportKmSaved >= 50 && transitBadge) {
    newlyUnlockedBadges.push(transitBadge);
  }

  // Update leaderboard current user score
  const currentUserLeaderboard = db.leaderboard.find(l => l.isCurrentUser);
  if (currentUserLeaderboard) {
    currentUserLeaderboard.sustainabilityScore = db.user.sustainabilityScore;
    currentUserLeaderboard.carbonScore = db.user.carbonScore;
    currentUserLeaderboard.badgeCount = db.user.unlockedBadges.length;
  }

  // Sort leaderboard ranks
  db.leaderboard.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
  db.leaderboard.forEach((item, index) => {
    item.rank = index + 1;
  });

  writeDB(db);

  res.json({
    user: db.user,
    newlyUnlockedBadges,
    transportKmSaved: db.user.transportKmSaved
  });
});

// Get leaderboard rankings
app.get('/api/leaderboard', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: "DB Error" });
  res.json(db.leaderboard);
});

// Get 2050 simulation data
app.get('/api/simulator', (req, res) => {
  // Hardcoded simulation path metrics for Positive vs Negative scenario from 2026 to 2050
  const years = Array.from({ length: 25 }, (_, i) => 2026 + i);

  const simulationData = years.map(year => {
    const t = (year - 2026) / 24; // Normalized time 0 to 1

    // Positive Scenario: Active reductions, global treaties, carbon tech
    const positive = {
      globalEmissionsGt: parseFloat((37.1 * Math.exp(-1.5 * t)).toFixed(1)), // Falling from 37.1 to 8.2 Gt
      co2Ppm: parseFloat((420 + 35 * t * (2 - t)).toFixed(0)),             // Peak and stabilize around 450ppm
      tempAnomaly: parseFloat((1.2 + 0.3 * Math.sin(t * Math.PI / 2)).toFixed(2)), // Slows down and stops at +1.5C
      seaLevelRiseCm: parseFloat((0 + 12 * t).toFixed(1)),                 // Stabilized rising to 12cm
      aqi: parseFloat((85 - 45 * t).toFixed(0)),                           // AQI improves from 85 to 40 (Excellent)
      forestCoverPct: parseFloat((31.0 + 3.5 * t).toFixed(1))              // Forests expand to 34.5%
    };

    // Negative Scenario: Business-as-usual, fossil fuel lock-in
    const negative = {
      globalEmissionsGt: parseFloat((37.1 * (1 + 0.6 * t)).toFixed(1)),     // Rising from 37.1 to 59.3 Gt
      co2Ppm: parseFloat((420 + 140 * t).toFixed(0)),                       // Rocketing to 560ppm
      tempAnomaly: parseFloat((1.2 + 1.6 * t).toFixed(2)),                 // Reaching +2.8C
      seaLevelRiseCm: parseFloat((0 + 38 * t).toFixed(1)),                 // Rises to 38cm
      aqi: parseFloat((85 + 90 * t).toFixed(0)),                           // AQI degrades to 175 (Unhealthy)
      forestCoverPct: parseFloat((31.0 - 5.5 * t).toFixed(1))              // Forests shrink to 25.5%
    };

    return {
      year,
      positive,
      negative
    };
  });

  res.json(simulationData);
});

app.listen(PORT, () => {
  console.log(`CarbonWise 2050 Server active on Port ${PORT}`);
});
