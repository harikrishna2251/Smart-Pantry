import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPantry } from '../services/dbService';
import type { PantryItem } from '../services/dbService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChefHat, Loader2, Sparkles, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AiAssistant: React.FC = () => {
  const { currentUser } = useAuth();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  useEffect(() => {
    if (currentUser) {
      getUserPantry(currentUser.uid).then(setItems => setPantryItems(setItems));
    }
  }, [currentUser]);

  const generateRecipe = async (isCustom = false) => {
    setLoading(true);
    setRecipe('');
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Update to gemini-3.6-flash as requested by the API error message
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const ingredientsList = pantryItems.map(item => `${item.quantityRemaining}x ${item.name}`).join(', ');
      
      let prompt = "";
      if (isCustom && customPrompt.trim() !== '') {
        prompt = `I have these ingredients in my pantry: ${ingredientsList}. The user asks: "${customPrompt}". Please answer the user directly and helpfully.`;
      } else {
        prompt = `I have these ingredients in my pantry: ${ingredientsList}. 
        Can you suggest a simple, creative recipe I can make using ONLY (or mostly) these ingredients? 
        Give it a fun title, list the ingredients used, and provide short, numbered instructions. Format it beautifully in Markdown.`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setRecipe(response.text());
      
      if (isCustom) setCustomPrompt('');
    } catch (e: any) {
      console.error(e);
      setRecipe("Oops! Something went wrong while talking to the AI. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
          <ChefHat size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">AI Cook Assistant</h2>
          <p className="text-slate-500">Your personal chef powered by Gemini</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-1 overflow-y-auto flex flex-col">
        {!recipe && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-8">
            <Sparkles size={48} className="text-purple-400 mb-2" />
            <h3 className="text-xl font-bold text-slate-700">Ready to cook?</h3>
            <p className="text-slate-500 max-w-md">
              I can look at the {pantryItems.length} ingredients in your pantry and instantly invent a delicious recipe for you!
            </p>
            <button 
              onClick={() => generateRecipe(false)}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex items-center space-x-2"
            >
              <ChefHat size={20} />
              <span>Suggest a Recipe</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 prose prose-slate max-w-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-purple-600 space-y-4 my-12">
                <Loader2 size={40} className="animate-spin" />
                <p className="font-medium animate-pulse">Inventing something delicious...</p>
              </div>
            ) : (
              <div className="bg-purple-50 p-6 rounded-2xl">
                <ReactMarkdown>{recipe}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-full shadow-sm border border-slate-200">
        <input 
          type="text" 
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ask something else (e.g., 'What dessert can I make?')"
          className="flex-1 px-4 py-2 outline-none bg-transparent"
          onKeyDown={(e) => e.key === 'Enter' && generateRecipe(true)}
        />
        <button 
          onClick={() => generateRecipe(true)}
          disabled={loading || customPrompt.trim() === ''}
          className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-slate-300 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;
