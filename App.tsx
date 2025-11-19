import React, { useState } from 'react';
import { Palette, Download, RefreshCw, BookOpen, Sparkles, Wand2 } from 'lucide-react';
import { ChatBot } from './components/ChatBot';
import { generateColoringBookImages } from './services/gemini';
import { generatePDF } from './components/PDFGenerator';
import { ColoringBookState, GenerationStatus } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ColoringBookState>({
    theme: '',
    childName: '',
    isGenerating: false,
    currentStep: 0,
    images: [],
    error: null
  });
  
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerate = async () => {
    if (!state.theme || !state.childName) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null, currentStep: 1 }));
    
    try {
      const generatedImages = await generateColoringBookImages(
        state.theme, 
        state.childName,
        (msg) => setStatusMessage(msg)
      );

      setState(prev => ({
        ...prev,
        isGenerating: false,
        images: generatedImages,
        currentStep: 2
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: "Oops! Something went wrong making the book. Please try again.",
        currentStep: 0
      }));
    }
  };

  const handleDownload = () => {
    generatePDF(state.images, state.theme, state.childName);
  };

  const handleReset = () => {
    setState({
      theme: '',
      childName: '',
      isGenerating: false,
      currentStep: 0,
      images: [],
      error: null
    });
    setStatusMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 font-sans text-dark">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg rotate-3">
              <Palette className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              DreamColor
            </h1>
          </div>
          {state.currentStep === 2 && (
            <button onClick={handleReset} className="text-sm font-semibold text-gray-500 hover:text-primary flex items-center gap-1">
              <RefreshCw size={16} /> New Book
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Step 0: Input Form */}
        {state.currentStep === 0 && !state.isGenerating && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-display font-bold mb-4 text-gray-800">Create Magic for Your Child</h2>
              <p className="text-gray-600 text-lg">Generate a personalized coloring book in seconds using AI.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/50 ring-1 ring-gray-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Child's Name</label>
                  <input 
                    type="text"
                    value={state.childName}
                    onChange={(e) => setState(prev => ({...prev, childName: e.target.value}))}
                    placeholder="e.g. Olivia"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Theme Idea</label>
                  <input 
                    type="text"
                    value={state.theme}
                    onChange={(e) => setState(prev => ({...prev, theme: e.target.value}))}
                    placeholder="e.g. Space Dinosaurs eating Pizza"
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none text-lg font-medium"
                  />
                </div>

                {state.error && (
                  <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm text-center">
                    {state.error}
                  </div>
                )}

                <button 
                  onClick={handleGenerate}
                  disabled={!state.childName || !state.theme}
                  className="w-full bg-gradient-to-r from-primary to-red-400 text-white font-bold text-xl py-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <Wand2 size={24} />
                  Generate Coloring Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Loading */}
        {state.isGenerating && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 bg-white rounded-full shadow-lg flex items-center justify-center">
                 <Palette size={48} className="text-secondary animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Creating Magic...</h3>
            <p className="text-gray-500">{statusMessage || "Warming up the creative engines..."}</p>
          </div>
        )}

        {/* Step 2: Result Preview */}
        {state.currentStep === 2 && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-gray-800">{state.childName}'s Book</h2>
                <p className="text-gray-500 capitalize">{state.theme} Edition</p>
              </div>
              <button 
                onClick={handleDownload}
                className="bg-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-lg"
              >
                <Download size={20} />
                Download PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.images.map((img, idx) => (
                <div key={img.id} className="group relative bg-white p-4 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all">
                   <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-50 relative">
                      <img 
                        src={img.url} 
                        alt={`Page ${idx}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {img.type === 'cover' && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
                          COVER
                        </div>
                      )}
                   </div>
                   <p className="text-center mt-3 font-display text-gray-400 text-sm">
                     {img.type === 'cover' ? 'Cover Art' : `Page ${idx}`}
                   </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <ChatBot />

      {/* Simple decorative footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} DreamColor. Powered by Google Gemini & Imagen.
      </footer>
    </div>
  );
};

export default App;