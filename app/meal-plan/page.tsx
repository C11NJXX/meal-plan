"use client";

import { Spinner } from "@/components/Spinner";
import { useMutation } from "@tanstack/react-query";

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: string;
  days?: number;
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

async function generateMealPlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-mealplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

const MealPlanPage = () => {
  const { mutate, isPending, isSuccess, data } = useMutation<
    MealPlanResponse,
    Error,
    MealPlanInput
  >({
    mutationFn: generateMealPlan,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: MealPlanInput = {
      dietType: formData.get("dietType")?.toString() || "",
      calories: Number(formData.get("calories")) || 2000,
      allergies: formData.get("allergies")?.toString() || "",
      cuisine: formData.get("cuisine")?.toString() || "",
      snacks: formData.get("snacks")?.toString() || "",
      days: 7, // Ensure a weekly plan is generated
    };

    mutate(payload);
  }

  //check data
  // if (data) {
  //   console.log(data);
  // }

  // Define the days of the week in order
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Function to retrieve the meal plan for a specific day
  const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
    if (!data?.mealPlan) return undefined;

    return data?.mealPlan[day];
  };

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Panel: Form */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-emerald-500 text-white">
          <h1 className="text-2xl font-bold mb-6 text-center">
            AI Meal Plan Generator
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Diet Type */}
            <div>
              <label
                htmlFor="dietType"
                className="block text-sm font-medium mb-1"
              >
                Diet Type
              </label>
              <input
                type="text"
                id="dietType"
                name="dietType"
                required
                placeholder="e.g., Vegetarian, Keto, Mediterranean"
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Calories */}
            <div>
              <label
                htmlFor="calories"
                className="block text-sm font-medium mb-1"
              >
                Daily Calorie Goal
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                required
                min={500}
                max={5000}
                placeholder="e.g., 2000"
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Allergies */}
            <div>
              <label
                htmlFor="allergies"
                className="block text-sm font-medium mb-1"
              >
                Allergies or Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                placeholder="e.g., Nuts, Dairy, None"
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Preferred Cuisine */}
            <div>
              <label
                htmlFor="cuisine"
                className="block text-sm font-medium mb-1"
              >
                Preferred Cuisine
              </label>
              <input
                type="text"
                id="cuisine"
                name="cuisine"
                className="w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g., Italian, Chinese, No Preference"
              />
            </div>

            {/* Snacks */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="snacks"
                name="snacks"
                className="h-4 w-4 text-emerald-300 border-emerald-300 rounded"
              />
              <label htmlFor="snacks" className="ml-2 block text-sm text-white">
                Include Snacks
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors`}
                disabled={isPending}
              >
                {isPending ? "Generating..." : "Generate Meal Plan"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Weekly Meal Plan Display */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-emerald-700">
            Weekly Meal Plan
          </h2>
          {data?.mealPlan && isSuccess ? (
            <div className="h-[600px] overflow-y-auto">
              <div className="space-y-6">
                {daysOfWeek.map((day, key) => {
                  const mealPlan = getMealPlanForDay(day);
                  return (
                    <div
                      key={key}
                      className="bg-white shadow-md rounded-lg p-4 border border-emerald-200"
                    >
                      <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                        {day}
                      </h3>
                      {mealPlan ? (
                        <div className="space-y-2">
                          <div>
                            <strong>Breakfast:</strong> {mealPlan.Breakfast}
                          </div>
                          <div>
                            <strong>Lunch:</strong> {mealPlan.Lunch}
                          </div>
                          <div>
                            <strong>Dinner:</strong> {mealPlan.Dinner}
                          </div>
                          {mealPlan.Snacks && (
                            <div>
                              <strong>Snacks:</strong> {mealPlan.Snacks}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">No meal plan available.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isPending ? (
            <Spinner />
          ) : (
            <p>Please generate a meal plan to see it here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanPage;
