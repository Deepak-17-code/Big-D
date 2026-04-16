/**
 * Calculate BMI (Body Mass Index)
 * BMI = weight (kg) / (height (m))²
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {object} BMI value and category
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return { bmi: null, category: '', status: '' }
  }

  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)

  let category = ''
  let status = ''

  if (bmi < 18.5) {
    category = 'Underweight'
    status = 'below-normal'
  } else if (bmi < 25) {
    category = 'Normal Weight'
    status = 'normal'
  } else if (bmi < 30) {
    category = 'Overweight'
    status = 'above-normal'
  } else {
    category = 'Obese'
    status = 'critical'
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    status,
  }
}

/**
 * Calculate Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
 * Used as basis for TDEE calculation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMR in calories
 */
const calculateBMR = (weight, height) => {
  if (!weight || !height) return 0
  // Mifflin-St Jeor Equation for average adult (gender-neutral approximation)
  // BMR = (10 × weight) + (6.25 × height) - 161
  return 10 * weight + 6.25 * height - 161
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {string} activityLevel - 'sedentary', 'lightly_active', 'moderately_active', 'very_active'
 * @returns {number} TDEE in calories
 */
export const calculateTDEE = (weight, height, activityLevel = 'moderately_active') => {
  if (!weight || !height) return 0

  const bmr = calculateBMR(weight, height)

  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  }

  const multiplier = activityMultipliers[activityLevel] || 1.55
  return Math.round(bmr * multiplier)
}

/**
 * Calculate recommended daily calorie intake for weight goals
 * @param {number} weight - Current weight in kg
 * @param {number} height - Height in cm
 * @param {number} goalWeight - Goal weight in kg
 * @returns {object} Calorie recommendations
 */
export const calculateCalorieGoal = (weight, height, goalWeight) => {
  if (!weight || !height || !goalWeight) {
    return { maintenance: 0, weightLoss: 0, weightGain: 0, recommendation: '' }
  }

  const tdee = calculateTDEE(weight, height, 'moderately_active')

  // Weight loss: 500 cal deficit per day = ~0.5 kg per week
  // Weight gain: 500 cal surplus per day = ~0.5 kg per week
  const weightLoss = Math.round(tdee - 500)
  const weightGain = Math.round(tdee + 500)

  let recommendation = ''
  if (goalWeight < weight) {
    recommendation = `To reach ${goalWeight}kg, aim for ~${weightLoss} calories/day (deficit of 500 cal)`
  } else if (goalWeight > weight) {
    recommendation = `To reach ${goalWeight}kg, aim for ~${weightGain} calories/day (surplus of 500 cal)`
  } else {
    recommendation = `You're at goal weight! Maintain ~${tdee} calories/day`
  }

  return {
    maintenance: tdee,
    weightLoss,
    weightGain,
    recommendation,
  }
}

/**
 * Calculate steps needed to burn X calories
 * Average: ~0.04 calories per step (varies by weight and pace)
 * Heavier people burn more calories per step
 * @param {number} weight - Weight in kg
 * @param {number} caloriesBurned - Target calories to burn
 * @returns {object} Steps calculation details
 */
export const calculateStepsForCalories = (weight, caloriesBurned) => {
  if (!weight || caloriesBurned <= 0) {
    return { steps: 0, distance: 0, time: 0, detail: '' }
  }

  // Formula: calories = 0.032 × weight(kg) × steps
  // Rearranged: steps = calories / (0.032 × weight)
  const caloriesPerStep = 0.032 * weight
  const stepsNeeded = Math.round(caloriesBurned / caloriesPerStep)

  // Average step length ~0.75m, so 1000 steps = ~0.75km
  const distanceKm = (stepsNeeded * 0.75) / 1000
  // Average walking speed ~1.4 m/s = ~5 km/h = ~12 min/km
  const timeMinutes = Math.round((stepsNeeded * 0.75) / 1.4 / 60)

  return {
    steps: stepsNeeded,
    distance: Math.round(distanceKm * 10) / 10,
    time: timeMinutes,
    detail: `You need approximately ${stepsNeeded.toLocaleString()} steps (~${distanceKm.toFixed(1)}km, ~${timeMinutes}min walk) to burn ${caloriesBurned} calories`,
  }
}

/**
 * Calculate calories burned per 1000 steps
 * @param {number} weight - Weight in kg
 * @returns {number} Calories burned per 1000 steps
 */
export const caloriesPer1000Steps = (weight) => {
  if (!weight) return 0
  return Math.round(32 * weight) / 10 // ~0.032 × weight × 1000
}

/**
 * Calculate dynamic calorie goal based on timeline
 * @param {number} weight - Current weight in kg
 * @param {number} height - Height in cm
 * @param {number} goalWeight - Goal weight in kg
 * @param {number} timelineWeeks - Weeks to reach goal
 * @returns {object} Dynamic calorie recommendations based on timeline
 */
export const calculateDynamicCalorieGoal = (weight, height, goalWeight, timelineWeeks) => {
  if (!weight || !height || !goalWeight || !timelineWeeks || timelineWeeks <= 0) {
    return {
      maintenance: 0,
      recommended: 0,
      dailyDeficitNeeded: 0,
      weeklyDeficitNeeded: 0,
      recommendation: '',
      isAchievable: false,
      riskLevel: 'safe',
    }
  }

  const tdee = calculateTDEE(weight, height, 'moderately_active')
  const weightDifference = Math.abs(goalWeight - weight)

  // Calculate total calorie deficit needed (3500 cal = ~1 lb = ~0.45 kg)
  const totalCalorieDeficitNeeded = Math.round(weightDifference * 7700) // 7700 cal per kg

  // Calculate daily and weekly deficit
  const totalDaysNeeded = timelineWeeks * 7
  const dailyDeficit = Math.round(totalCalorieDeficitNeeded / totalDaysNeeded)
  const weeklyDeficit = dailyDeficit * 7

  // Calculate recommended daily calories
  const isWeightLoss = goalWeight < weight
  const recommended = isWeightLoss ? tdee - dailyDeficit : tdee + dailyDeficit

  // Assess achievability and risk
  let isAchievable = true
  let riskLevel = 'safe'
  let recommendation = ''

  if (isWeightLoss) {
    // Safe range: 500-1000 cal/day deficit
    if (dailyDeficit > 1000) {
      riskLevel = 'aggressive'
      recommendation = `⚠️ Achieving this goal (${dailyDeficit} cal/day deficit) is aggressive. Aim for ~${tdee - 1000} cal/day for safer fat loss.`
    } else if (dailyDeficit > 750) {
      riskLevel = 'moderate'
      recommendation = `✓ To reach ${goalWeight}kg in ${timelineWeeks} weeks, aim for ~${recommended} cal/day (${dailyDeficit} cal deficit)`
    } else {
      riskLevel = 'safe'
      recommendation = `✓ Safe goal: Aim for ~${recommended} cal/day to reach ${goalWeight}kg in ${timelineWeeks} weeks`
    }
  } else {
    // Weight gain: 500-750 cal/day surplus is safe
    if (dailyDeficit > 750) {
      riskLevel = 'aggressive'
      recommendation = `⚠️ To gain this much weight quickly (${dailyDeficit} cal/day), aim for ~${tdee + 500} cal/day for controlled gain.`
    } else {
      riskLevel = 'safe'
      recommendation = `✓ To reach ${goalWeight}kg in ${timelineWeeks} weeks, aim for ~${recommended} cal/day (${dailyDeficit} cal surplus)`
    }
  }

  return {
    maintenance: tdee,
    recommended: Math.max(1200, recommended), // Minimum 1200 cal/day for safety
    dailyDeficitNeeded: dailyDeficit,
    weeklyDeficitNeeded: weeklyDeficit,
    recommendation,
    isAchievable,
    riskLevel,
  }
}

/**
 * Calculate weight loss/gain timeline
 * @param {number} currentWeight - Current weight in kg
 * @param {number} goalWeight - Goal weight in kg
 * @param {number} weeklyChange - Expected weekly change in kg (e.g., 0.5 for 0.5kg/week)
 * @returns {object} Timeline estimate
 */
export const calculateWeightGoalTimeline = (
  currentWeight,
  goalWeight,
  weeklyChange = 0.5,
) => {
  if (!currentWeight || !goalWeight || weeklyChange <= 0) {
    return { weeks: 0, months: 0, target: '' }
  }

  const weightDifference = Math.abs(goalWeight - currentWeight)
  const weeks = Math.round(weightDifference / weeklyChange)
  const months = Math.round(weeks / 4.33)

  const direction = goalWeight < currentWeight ? 'lose' : 'gain'
  const target = goalWeight < currentWeight
    ? `Lose ${weightDifference}kg to reach ${goalWeight}kg`
    : `Gain ${weightDifference}kg to reach ${goalWeight}kg`

  return {
    weeks,
    months,
    target,
  }
}
