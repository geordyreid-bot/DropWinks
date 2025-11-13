import { GoogleGenAI, Type } from "@google/genai";
import { Observable, AIGeneratedContent, SocialMediaPost, GiftCardSuggestion, Category } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully, perhaps disabling AI features.
  // For this example, we'll throw an error if the key is missing.
  console.error("Gemini API key is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const winkContentSchema = {
    type: Type.OBJECT,
    properties: {
        disclaimer: {
            type: Type.STRING,
            description: "A mandatory, non-medical disclaimer stating this is not a diagnosis and a professional should be consulted. It MUST include a recommendation to contact an emergency hotline (e.g., 988) for any immediate crisis."
        },
        possibleConditions: {
            type: Type.ARRAY,
            description: "A list of potential conditions related to the observations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the potential condition." },
                    likelihood: { type: Type.STRING, enum: ['low', 'medium', 'high'], description: "The estimated likelihood based on the provided symptoms." },
                    description: { type: Type.STRING, description: "A brief, gentle explanation of the condition." },
                },
                required: ['name', 'likelihood', 'description']
            }
        },
        resources: {
            type: Type.ARRAY,
            description: "A list of helpful resources.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the resource." },
                    type: { type: Type.STRING, enum: ['article', 'product', 'clinic', 'support group'], description: "The type of resource." },
                    description: { type: Type.STRING, description: "A short description of what the resource offers." }
                },
                required: ['title', 'type', 'description']
            }
        }
    },
    required: ['disclaimer', 'possibleConditions', 'resources']
};

export const generateWinkContent = async (observables: Observable[]): Promise<AIGeneratedContent> => {
    if (!API_KEY) {
        throw new Error("API Key not configured.");
    }

    const observableTexts = observables.map(o => o.text).join(', ');
    
    const allNegativeKeywords = observables
        .flatMap(o => o.negativeKeywords || [])
        .filter((value, index, self) => self.indexOf(value) === index);

    let prompt = `Based on the following observations about a person: "${observableTexts}", please provide a gentle and supportive analysis. Do not use alarming language. This is for a caring friend to send anonymously.`;

    if (allNegativeKeywords.length > 0) {
        prompt += ` \n\nIMPORTANT: Explicitly avoid mentioning or suggesting anything related to the following topics: "${allNegativeKeywords.join(', ')}". Do not include these words or concepts in your response.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful, empathetic assistant for the WinkDrops app. Your role is to provide potential insights based on user-observed symptoms. You are not a medical professional and must not provide a diagnosis. All your responses should be supportive, gentle, and encourage seeking professional advice. You must include a disclaimer that this is not a diagnosis and that a physician should be consulted for any health concerns. For urgent mental health crises, the user should be directed to a hotline like 988 or local emergency services. Generate at least 2 possible conditions, each with an estimated likelihood (low, medium, or high) based on the observations, and a comprehensive list of at least 5 varied resources.",
                responseMimeType: "application/json",
                responseSchema: winkContentSchema,
                temperature: 0.5,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        return parsedJson as AIGeneratedContent;

    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        throw new Error("Failed to generate AI content. Please try again.");
    }
};

const winkUpdateSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "A list of 3-5 encouraging update sentences.",
            items: {
                type: Type.STRING,
                description: "A short, positive observation."
            }
        }
    },
    required: ['suggestions']
};


export const generateWinkUpdateSuggestions = async (originalObservables: Observable[]): Promise<string[]> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    
    const observableTexts = originalObservables.map(o => `"${o.text}"`).join(', ');

    const prompt = `
        A user previously sent a "Wink" based on these observations of concern: ${observableTexts}.
        They now want to send a positive follow-up message. 
        Please generate a list of 3-5 short, encouraging sentences that suggest a positive change related to the original observations.
        The tone must be gentle, supportive, and phrased as a new observation.

        Examples:
        - Original: "Looks unusually tired or fatigued" -> One suggestion could be: "I've noticed you seem to have more energy lately."
        - Original: "Seems more withdrawn or isolated" -> One suggestion could be: "It was so good to see you connecting with others recently."
        - Original: "Body odor is more noticeable than usual" -> One suggestion could be: "I have noticed a positive improvement."
        - Original: "Neglecting responsibilities" -> One suggestion could be: "You've been so on top of things lately, it's great to see."

        Now, generate a JSON object with a "suggestions" array containing 3 to 5 suitable update strings for the original observations provided.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant for the WinkDrops app. Your role is to craft a list of positive, encouraging follow-up sentences based on previous negative observations. Your response must be a JSON object containing a 'suggestions' array of strings.",
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: winkUpdateSuggestionsSchema
            },
        });
        
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (parsedJson && parsedJson.suggestions) {
            return parsedJson.suggestions as string[];
        }

        return [];

    } catch (error) {
        console.error("Error generating wink update suggestions:", error);
        throw new Error("Failed to generate AI update suggestions.");
    }
};

const nudgeSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "A list of 3-5 short, positive, and supportive 'Nudge' messages.",
            items: {
                type: Type.STRING,
                description: "A single Nudge message."
            }
        }
    },
    required: ['suggestions']
};

export const generateNudgeSuggestions = async (context: string): Promise<string[]> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    
    const prompt = `
        Based on the following situation, generate a list of 3-5 short, gentle, and supportive "Nudge" messages. These messages should be simple, kind, and not require a response. They are meant to let someone know you're thinking of them.

        Situation: "${context}"

        Generate a JSON object with a "suggestions" array containing the messages.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant for the WinkDrops app. Your role is to craft short, positive, and gentle 'Nudge' messages based on a user-provided context. Your response must be a JSON object containing a 'suggestions' array of strings.",
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: nudgeSuggestionsSchema
            },
        });
        
        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (parsedJson && parsedJson.suggestions) {
            return parsedJson.suggestions as string[];
        }

        return [];

    } catch (error) {
        console.error("Error generating nudge suggestions:", error);
        throw new Error("Failed to generate AI nudge suggestions.");
    }
};

const observableSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "A list of 3-5 distinct, concise, and gentle observable behaviors.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { 
                        type: Type.STRING, 
                        description: "The short, observable phrase (e.g., 'Seems more withdrawn')." 
                    },
                    category: { 
                        type: Type.STRING, 
                        enum: ['Physical', 'Mental', 'Nutritional', 'Hygiene', 'Social', 'Behavioral'],
                        description: "The most relevant category for the observation."
                    },
                },
                required: ['text', 'category']
            }
        }
    },
    required: ['suggestions']
};

export const generateObservableSuggestions = async (description: string): Promise<{ text: string; category: Category }[]> => {
    if (!API_KEY) throw new Error("API Key not configured.");

    const prompt = `
        A user is describing a concern they have about someone. Analyze their description and suggest 3-5 relevant, distinct, and gentle "observables" they could select. 
        Each observable should be a short, non-judgmental phrase.
        For each suggested observable, provide its text and classify it into one of the required categories.

        User's description: "${description}"

        Generate a JSON object with a "suggestions" array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an assistant for the WinkDrops app. Your role is to help users articulate their concerns by suggesting predefined 'observable' behaviors based on their free-text input. The tone should be empathetic and helpful. You must categorize each suggestion.",
                temperature: 0.6,
                responseMimeType: "application/json",
                responseSchema: observableSuggestionsSchema
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && parsedJson.suggestions) {
            return parsedJson.suggestions as { text: string; category: Category }[];
        }

        return [];

    } catch (error) {
        console.error("Error generating observable suggestions:", error);
        throw new Error("Failed to generate AI observable suggestions.");
    }
};

export const findLocalResources = async (
    conditions: { name: string }[],
    location: { latitude: number; longitude: number }
): Promise<{ text: string; sources: any[] }> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    const conditionNames = conditions.map(c => c.name).join(', ');
    const prompt = `For a person experiencing symptoms related to ${conditionNames}, find nearby supportive resources like clinics, therapists, pharmacies, or support groups. Provide contact information and addresses where possible, formatted as markdown.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude,
                        },
                    },
                },
            },
        });
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch (error) {
        console.error("Error finding local resources with Gemini:", error);
        throw new Error("Failed to find local resources.");
    }
};

export const findSocialResources = async (
    conditions: { name: string }[]
): Promise<{ text: string; sources: any[] }> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    const conditionNames = conditions.map(c => c.name).join(', ');
    const prompt = `Find online communities, forums, and supportive social media discussions for people dealing with ${conditionNames}. Summarize the sentiment and provide links to relevant public posts, articles, or groups, formatted as markdown.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const text = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text, sources };
    } catch (error) {
        console.error("Error finding social resources with Gemini:", error);
        throw new Error("Failed to find social media resources.");
    }
};

export const reverseGeocode = async (location: { latitude: number; longitude: number }): Promise<string> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    const prompt = `What city and country is at these coordinates? Please provide just the city and country name in "City, Country" format.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: location.latitude,
                            longitude: location.longitude,
                        },
                    },
                },
            },
        });
        const locationString = response.text.trim();
        // A simple sanity check. If it's empty or very long, it's probably not what we want.
        if (locationString && locationString.length < 50) {
            return locationString;
        }
        return "A location"; // Fallback for unexpected format
    } catch (error) {
        console.error("Error reverse geocoding with Gemini:", error);
        return "A location"; // Fallback
    }
};


const socialPostSchema = {
    type: Type.OBJECT,
    properties: {
        posts: {
          type: Type.ARRAY,
          description: "A list of generated social media posts.",
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING, enum: ['X', 'Instagram', 'TikTok', 'Generic'], description: "The target social media platform." },
              content: { type: Type.STRING, description: "The content of the social media post, including hashtags." },
            },
            required: ['platform', 'content']
          }
        }
    },
    required: ['posts']
};

export const generateSocialPosts = async (
    conditions: { name: string; description: string }[],
    resources: { title: string; description: string }[],
    keywords: string
): Promise<SocialMediaPost[]> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    
    const conditionText = conditions.map(c => `${c.name}: ${c.description}`).join('\n');
    const resourceText = resources.map(r => `${r.title}: ${r.description}`).join('\n');

    const prompt = `
        Based on the following context about a person's well-being and the user-provided keywords, generate 3 sample social media posts.

        Context:
        - Potential Conditions: ${conditionText}
        - Helpful Resources: ${resourceText}
        - User Keywords: "${keywords}"

        Instructions for the posts:
        1. The tone must be positive, hopeful, and supportive. The goal is to normalize conversations around self-care and mental/physical health.
        2. The posts should be suitable for platforms like X (formerly Twitter) and Instagram.
        3. Each post must be encouraging and avoid overly clinical or alarming language.
        4. **Crucially, EVERY post MUST include the hashtag #thanksanonymous.** This is meant to thank the anonymous person who sent the Wink and to encourage this kind of supportive, anonymous gesture.
        5. Include other relevant hashtags like #selfcare, #mentalhealthawareness, #itsokaytonotbeokay, etc.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: socialPostSchema,
                temperature: 0.7,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (parsedJson && parsedJson.posts) {
            return parsedJson.posts as SocialMediaPost[];
        }
        
        return [];

    } catch (error) {
        console.error("Error generating social media posts:", error);
        throw new Error("Failed to generate social media posts.");
    }
};

const giftCardSchema = {
    type: Type.OBJECT,
    properties: {
        gift_cards: {
            type: Type.ARRAY,
            description: "A list of 3-5 digital gift card suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    store: { type: Type.STRING, description: "The name of the store or brand for the gift card (e.g., 'Starbucks', 'Amazon', 'Headspace')." },
                    category: { type: Type.STRING, description: "A brief category for the gift (e.g., 'Coffee & Treat', 'Books & Hobbies', 'Mindfulness App')." },
                    reasoning: { type: Type.STRING, description: "A short, one-sentence reason why this gift card is a good fit based on the user's prompt." },
                },
                required: ['store', 'category', 'reasoning']
            }
        }
    },
    required: ['gift_cards']
};

export const generateGiftCardIdeas = async (prompt: string): Promise<GiftCardSuggestion[]> => {
    if (!API_KEY) throw new Error("API Key not configured.");
    
    const fullPrompt = `Based on the following description of a person, suggest 3-5 digital gift cards for them. Description: "${prompt}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                systemInstruction: "You are a thoughtful gift suggestion assistant for the WinkDrops app. Your goal is to provide creative and relevant digital gift card ideas based on a user's description of a person. The tone should be helpful and positive.",
                responseMimeType: "application/json",
                responseSchema: giftCardSchema,
                temperature: 0.8,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        if (parsedJson && parsedJson.gift_cards) {
            return parsedJson.gift_cards as GiftCardSuggestion[];
        }
        
        return [];

    } catch (error) {
        console.error("Error generating gift card ideas:", error);
        throw new Error("Failed to generate gift card ideas.");
    }
};

const moderationSchema = {
    type: Type.OBJECT,
    properties: {
        is_safe: {
            type: Type.BOOLEAN,
            description: "True if the content is a valid, non-malicious observation. False if it contains bullying, harassment, threats, or is otherwise inappropriate for a supportive context."
        },
        reason: {
            type: Type.STRING,
            description: "If not safe, a brief, user-facing explanation for why the content was rejected (e.g., 'This observation contains harassing language.')."
        },
    },
    required: ['is_safe']
};

export interface ModerationResult {
    is_safe: boolean;
    reason?: string;
}

export const moderateCustomObservable = async (text: string): Promise<ModerationResult> => {
    if (!API_KEY) {
        throw new Error("API Key not configured.");
    }
    
    const prompt = `Please analyze the following text, which is a user-submitted observation for the WinkDrops app. The app is about showing gentle, anonymous concern for a friend's well-being. Determine if the text is safe and appropriate. It should be rejected if it contains harassment, bullying, threats, or malicious content. It should be accepted if it is a genuine, even if awkwardly phrased, observation of behavior or appearance.

Text to analyze: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are a content moderator for a mental health support app called WinkDrops. Your primary role is to ensure user-submitted observations are safe and not used for bullying or harassment. Be strict about malicious content but lenient with phrasing that expresses genuine concern.",
                responseMimeType: "application/json",
                responseSchema: moderationSchema,
                temperature: 0.2,
            },
        });

        const jsonString = response.text.trim();
        const parsedJson = JSON.parse(jsonString);
        
        return parsedJson as ModerationResult;

    } catch (error) {
        console.error("Error moderating content with Gemini:", error);
        // Fail safe: if moderation fails, assume it's unsafe to be cautious.
        return { is_safe: false, reason: "Could not verify the content's safety. Please try rephrasing." };
    }
};