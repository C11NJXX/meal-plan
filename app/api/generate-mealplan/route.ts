//https://openrouter.ai/deepseek/deepseek-r1-0528-qwen3-8b:free/api
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_ROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { dietType, calories, allergies, cuisine, snacks, days } =
      await request.json();
    const prompt = `
      You are a professional nutritionist. Create a 7-day meal plan for an individual following a ${dietType} diet aiming for ${calories} calories per day.
      
      Allergies or restrictions: ${allergies || "none"}.
      Preferred cuisine: ${cuisine || "no preference"}.
      Snacks included: ${snacks ? "yes" : "no"}.
      
      For each day, provide:
        - Breakfast
        - Lunch
        - Dinner
        ${snacks ? "- Snacks" : ""}
      
      Use simple ingredients and provide brief instructions. Include approximate calorie counts for each meal.
      
      Structure the response as a JSON object where each day is a key, and each meal (breakfast, lunch, dinner, snacks) is a sub-key. Example:
      
      {
        "Monday": {
          "Breakfast": "Oatmeal with fruits - 350 calories",
          "Lunch": "Grilled chicken salad - 500 calories",
          "Dinner": "Steamed vegetables with quinoa - 600 calories",
          "Snacks": "Greek yogurt - 150 calories"
        },
        "Tuesday": {
          "Breakfast": "Smoothie bowl - 300 calories",
          "Lunch": "Turkey sandwich - 450 calories",
          "Dinner": "Baked salmon with asparagus - 700 calories",
          "Snacks": "Almonds - 200 calories"
        }
        // ...and so on for each day
      }

      Return just the json with no extra commentaries.
    `;
    const response = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const rawAiContent = response.choices[0].message.content!.trim();
    let parsedMealPlan: { [day: string]: DailyMealPlan };

    //parse json
    try {
      //remove the first line and the last line
      const lines = rawAiContent.split("\n");
      const aiContent = lines.slice(1, -1).join("\n");
      parsedMealPlan = JSON.parse(aiContent);
    } catch (parseError: any) {
      console.log("Error Parsing" + parseError);
      return NextResponse.json(
        { error: "Failed to parse meal plan, Please try again" },
        { status: 500 }
      );
    }

    if (typeof parsedMealPlan !== "object" || parsedMealPlan === null) {
      return NextResponse.json(
        { error: "Failed to parse meal plan, Please try again" },
        { status: 500 }
      );
    }
    return NextResponse.json({ mealPlan: parsedMealPlan });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Error",
      },
      {
        status: 500,
      }
    );
  }
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}
