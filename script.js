// ---- Static Default Data ----

const defaultDailyStats = {
  steps: 7523,
  stepGoal: 10000,
  caloriesBurned: 560,
  waterIntake: 2.4,
  waterGoal: 3
};

const defaultActivities = [
  {
    id: 1,
    name: "Morning Run",
    duration: 30,
    calories: 250,
    timeOfDay: "Morning"
  },
  {
    id: 2,
    name: "Cycling",
    duration: 45,
    calories: 320,
    timeOfDay: "Evening"
  },
  {
    id: 3,
    name: "Yoga Session",
    duration: 20,
    calories: 80,
    timeOfDay: "Afternoon"
  },
  {
    id: 4,
    name: "Walk with Dog",
    duration: 25,
    calories: 120,
    timeOfDay: "Morning"
  }
];

const defaultMeals = {
  breakfast: [
    { id: 1, name: "Oatmeal", calories: 150 },
    { id: 2, name: "Banana", calories: 100 }
  ],
  lunch: [
    { id: 3, name: "Grilled Chicken", calories: 260 },
    { id: 4, name: "Brown Rice", calories: 210 }
  ],
  dinner: [
    { id: 5, name: "Salmon", calories: 280 },
    { id: 6, name: "Steamed Veggies", calories: 90 }
  ]
};

const defaultWeeklyActivityMinutes = [
  { day: "Mon", minutes: 40 },
  { day: "Tue", minutes: 30 },
  { day: "Wed", minutes: 50 },
  { day: "Thu", minutes: 35 },
  { day: "Fri", minutes: 45 },
  { day: "Sat", minutes: 60 },
  { day: "Sun", minutes: 25 }
];

const defaultWeeklyCalories = [
  { day: "Mon", calories: 1850 },
  { day: "Tue", calories: 1720 },
  { day: "Wed", calories: 1905 },
  { day: "Thu", calories: 1680 },
  { day: "Fri", calories: 2000 },
  { day: "Sat", calories: 2130 },
  { day: "Sun", calories: 1600 }
];

// ---- State (loaded from localStorage when possible) ----

let activities = [];
let meals = { breakfast: [], lunch: [], dinner: [] };

let activityIdCounter = 100;
let mealIdCounter = 200;

// ---- Utility: localStorage helpers ----

const STORAGE_KEYS = {
  ACTIVITIES: "fittrack_activities",
  MEALS: "fittrack_meals"
};

function loadState() {
  const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  const storedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);

  activities = storedActivities ? JSON.parse(storedActivities) : defaultActivities;
  meals = storedMeals ? JSON.parse(storedMeals) : defaultMeals;

  // Update counters to avoid ID collision
  const allActivityIds = activities.map((a) => a.id);
  const allMealIds = [
    ...meals.breakfast.map((m) => m.id),
    ...meals.lunch.map((m) => m.id),
    ...meals.dinner.map((m) => m.id)
  ];
  const maxActId = allActivityIds.length ? Math.max(...allActivityIds) : 100;
  const maxMealId = allMealIds.length ? Math.max(...allMealIds) : 200;
  activityIdCounter = maxActId + 1;
  mealIdCounter = maxMealId + 1;
}

function saveActivities() {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

function saveMeals() {
  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
}

// ---- DOM Helpers ----

function $(selector) {
  return document.querySelector(selector);
}

// ---- Live Clock ----

function startLiveClock() {
  const clockEl = $("#liveClock");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ---- Navigation ----

function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".page-section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sections.forEach((sec) => {
        sec.classList.toggle("active", sec.id === target);
      });
    });
  });
}

// ---- Daily Overview Rendering ----

function renderDailyOverview() {
  const stats = defaultDailyStats;

  const stepsValue = $("#stepsValue");
  const stepsGoal = $("#stepsGoal");
  const stepsBar = $("#stepsBar");

  const caloriesValue = $("#caloriesValue");
  const caloriesBar = $("#caloriesBar");

  const waterValue = $("#waterValue");
  const waterGoal = $("#waterGoal");
  const waterBar = $("#waterBar");

  if (!stepsValue) return;

  stepsValue.textContent = stats.steps;
  stepsGoal.textContent = stats.stepGoal;
  const stepsPercent = Math.min((stats.steps / stats.stepGoal) * 100, 100);
  stepsBar.style.width = stepsPercent + "%";

  caloriesValue.textContent = stats.caloriesBurned;
  const caloriesPercent = Math.min((stats.caloriesBurned / 800) * 100, 100); // arbitrary goal
  caloriesBar.style.width = caloriesPercent + "%";

  waterValue.textContent = stats.waterIntake.toFixed(1);
  waterGoal.textContent = stats.waterGoal.toFixed(1);
  const waterPercent = Math.min((stats.waterIntake / stats.waterGoal) * 100, 100);
  waterBar.style.width = waterPercent + "%";
}

// ---- Activity Log ----

function renderActivityList(filter = "All") {
  const listEl = $("#activityList");
  if (!listEl) return;

  listEl.innerHTML = "";

  const filtered = activities.filter((activity) => {
    if (filter === "All") return true;
    return activity.timeOfDay === filter;
  });

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No activities found for this filter.";
    li.className = "activity-item";
    listEl.appendChild(li);
    return;
  }

  filtered.forEach((activity) => {
    const li = document.createElement("li");
    li.className = "activity-item";

    const left = document.createElement("div");
    left.className = "activity-main";

    const nameEl = document.createElement("span");
    nameEl.className = "activity-name";
    nameEl.textContent = activity.name;

    const metaEl = document.createElement("span");
    metaEl.className = "activity-meta";
    metaEl.textContent = `${activity.duration} mins · ${activity.calories} kcal`;

    left.appendChild(nameEl);
    left.appendChild(metaEl);

    const tag = document.createElement("span");
    tag.className = "activity-tag";
    tag.textContent = activity.timeOfDay;

    li.appendChild(left);
    li.appendChild(tag);

    listEl.appendChild(li);
  });
}

function setupActivityFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderActivityList(filter);
    });
  });
}

function setupActivityForm() {
  const form = $("#activityForm");
  if (!form) return;

  const nameInput = $("#activityName");
  const durationInput = $("#activityDuration");
  const caloriesInput = $("#activityCalories");
  const timeOfDaySelect = $("#activityTimeOfDay");

  const nameError = $("#activityNameError");
  const durationError = $("#activityDurationError");
  const caloriesError = $("#activityCaloriesError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Clear errors
    nameError.textContent = "";
    durationError.textContent = "";
    caloriesError.textContent = "";

    const name = nameInput.value.trim();
    const duration = Number(durationInput.value);
    const calories = Number(caloriesInput.value);
    const timeOfDay = timeOfDaySelect.value;

    let hasError = false;

    if (!name) {
      nameError.textContent = "Activity name is required.";
      hasError = true;
    }

    if (!duration || duration <= 0) {
      durationError.textContent = "Enter a duration greater than 0.";
      hasError = true;
    }

    if (Number.isNaN(calories) || calories < 0) {
      caloriesError.textContent = "Calories must be 0 or more.";
      hasError = true;
    }

    if (hasError) return;

    const newActivity = {
      id: activityIdCounter++,
      name,
      duration,
      calories,
      timeOfDay
    };

    activities.push(newActivity);
    saveActivities();

    // Re-render with current active filter
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : "All";
    renderActivityList(activeFilter);

    form.reset();
    showModal("Success", "Activity added successfully.");
  });
}

// ---- Meal Planner ----

function renderMeals() {
  const breakfastList = $("#breakfastList");
  const lunchList = $("#lunchList");
  const dinnerList = $("#dinnerList");
  if (!breakfastList || !lunchList || !dinnerList) return;

  const lists = {
    breakfast: breakfastList,
    lunch: lunchList,
    dinner: dinnerList
  };

  Object.keys(lists).forEach((type) => {
    const listEl = lists[type];
    listEl.innerHTML = "";
    const items = meals[type];

    if (!items || items.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No meals added.";
      li.className = "meal-item";
      listEl.appendChild(li);
      return;
    }

    items.forEach((meal) => {
      const li = document.createElement("li");
      li.className = "meal-item";
      li.dataset.type = type;
      li.dataset.id = meal.id;

      const left = document.createElement("div");
      left.className = "meal-left";

      const nameEl = document.createElement("span");
      nameEl.className = "meal-name";
      nameEl.textContent = meal.name;

      const calEl = document.createElement("span");
      calEl.className = "meal-calories";
      calEl.textContent = `${meal.calories} kcal`;

      left.appendChild(nameEl);
      left.appendChild(calEl);

      const removeBtn = document.createElement("button");
      removeBtn.className = "meal-remove-btn";
      removeBtn.textContent = "Remove";

      li.appendChild(left);
      li.appendChild(removeBtn);

      listEl.appendChild(li);
    });
  });

  updateTotalCalories();
}

function updateTotalCalories() {
  const totalEl = $("#totalCalories");
  if (!totalEl) return;

  const sumCalories = (arr) => arr.reduce((acc, m) => acc + Number(m.calories || 0), 0);

  const total =
    sumCalories(meals.breakfast || []) +
    sumCalories(meals.lunch || []) +
    sumCalories(meals.dinner || []);

  totalEl.textContent = `${total} kcal`;
}

function setupMealForm() {
  const form = $("#mealForm");
  if (!form) return;

  const nameInput = $("#mealName");
  const caloriesInput = $("#mealCalories");
  const typeSelect = $("#mealType");

  const nameError = $("#mealNameError");
  const caloriesError = $("#mealCaloriesError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    nameError.textContent = "";
    caloriesError.textContent = "";

    const name = nameInput.value.trim();
    const calories = Number(caloriesInput.value);
    const type = typeSelect.value; // breakfast, lunch, dinner

    let hasError = false;

    if (!name) {
      nameError.textContent = "Meal name is required.";
      hasError = true;
    }

    if (Number.isNaN(calories) || calories < 0) {
      caloriesError.textContent = "Calories must be 0 or more.";
      hasError = true;
    }

    if (hasError) return;

    const newMeal = {
      id: mealIdCounter++,
      name,
      calories
    };

    if (!meals[type]) meals[type] = [];
    meals[type].push(newMeal);
    saveMeals();
    renderMeals();

    form.reset();
    showModal("Success", "Meal added successfully.");
  });
}

function setupMealRemoval() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("meal-remove-btn")) return;

    const li = e.target.closest(".meal-item");
    if (!li) return;

    const type = li.dataset.type;
    const id = Number(li.dataset.id);

    if (!type || Number.isNaN(id)) return;

    meals[type] = meals[type].filter((m) => m.id !== id);
    saveMeals();
    renderMeals();
  });
}

// ---- Insights & Summary ----

function renderBarGraph(containerId, data, valueKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  if (!data || data.length === 0) return;

  const max = Math.max(...data.map((d) => d[valueKey] || 0)) || 1;

  data.forEach((entry) => {
    const col = document.createElement("div");
    col.className = "bar-column";

    const barWrapper = document.createElement("div");
    barWrapper.className = "bar";
    barWrapper.style.height = "100%";

    const barFill = document.createElement("div");
    barFill.className = "bar-fill";

    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = entry.day;

    const value = document.createElement("span");
    value.className = "bar-value";
    value.textContent = entry[valueKey];

    barWrapper.appendChild(barFill);
    col.appendChild(barWrapper);
    col.appendChild(label);
    col.appendChild(value);

    container.appendChild(col);

    const percent = Math.min((entry[valueKey] / max) * 100, 100);
    // Trigger after layout
    requestAnimationFrame(() => {
      barFill.style.height = percent + "%";
    });
  });
}

function renderInsights() {
  renderBarGraph("weeklyActivityGraph", defaultWeeklyActivityMinutes, "minutes");
  renderBarGraph("weeklyCaloriesGraph", defaultWeeklyCalories, "calories");
}

// ---- Modal ----

function showModal(title, message) {
  const overlay = $("#modalOverlay");
  const titleEl = $("#modalTitle");
  const msgEl = $("#modalMessage");

  if (!overlay || !titleEl || !msgEl) return;

  titleEl.textContent = title;
  msgEl.textContent = message;

  overlay.classList.remove("hidden");
}

function setupModal() {
  const overlay = $("#modalOverlay");
  const closeBtn = $("#modalCloseBtn");

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
}

// ---- Download & Reset ----

function setupInsightsActions() {
  const downloadBtn = $("#downloadSummaryBtn");
  const resetBtn = $("#resetDashboardBtn");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      // simulated download
      sessionStorage.setItem("fittrack_last_download", new Date().toISOString());
      showModal(
        "Download Simulated",
        "Your weekly summary has been 'downloaded' (simulation only)."
      );
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.MEALS);
      sessionStorage.clear();
      showModal("Dashboard Reset", "Dashboard data has been reset to defaults.");

      // Small delay so user sees the modal, then reload
      setTimeout(() => {
        window.location.reload();
      }, 600);
    });
  }
}

// ---- Init ----

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupNavigation();
  setupModal();
  startLiveClock();

  // Pages
  renderDailyOverview();

  renderActivityList("All");
  setupActivityFilters();
  setupActivityForm();

  renderMeals();
  setupMealForm();
  setupMealRemoval();

  renderInsights();
  setupInsightsActions();
});
