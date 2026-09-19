import React from 'react';
import { Check, User } from 'lucide-react';

export const MODEL_PRESETS = [
    { id: 'none', name: 'Tanpa Model', url: '' },
    // Isi properti 'url' di bawah dengan link gambar transparan (PNG/WebP) Anda
    { id: 'model1', name: 'Selfie', url: 'https://simp6.cuckcapital.cr/images4/1ee7a4b2-b092-4e40-9007-dd81572e6699.webp' },
    { id: 'model2', name: 'Cute 1', url: 'https://simp6.cuckcapital.cr/images4/2461f19f-6f32-4be2-82a7-fcbfacacc7ca.webp' },
    { id: 'model3', name: 'Cute 2', url: 'https://simp6.cuckcapital.cr/images4/ee5819d1-80ac-4f68-8849-0f110bcec002.webp' },
    { id: 'model4', name: 'Asian Blonde', url: 'https://simp6.cuckcapital.cr/images4/ac55897a-3e2e-4102-9b23-fe6740514614.webp' },
    { id: 'model5', name: 'Beauty Pose', url: 'https://simp6.cuckcapital.cr/images4/04bc2beb-a587-4640-9432-b9e25cde38b8.webp' },
    { id: 'model6', name: 'Favorite', url: 'https://simp6.cuckcapital.cr/images4/acefd2ae-61ff-4add-8abb-7f994c0319dc.webp' },
    { id: 'model7', name: 'Asian Big', url: 'https://simp6.cuckcapital.cr/images4/74d957bc-6b9d-42be-87a2-127cf48cd2e6.webp' },
    { id: 'model8', name: 'Hijab Nude', url: 'https://i.ibb.co.com/TMLFB1Ts/Hijab-Nude.webp' },
    { id: 'model9', name: 'Beauty Full', url: 'https://i.ibb.co.com/6cYjmJ85/Beauty-And-Cutee.webp' },
    { id: 'model10', name: 'Beauty Slut', url: 'https://i.ibb.co.com/gFT2b6WX/Asian-Slut.webp' }
];

export const DEFAULT_HEADER_MODEL = MODEL_PRESETS[0].url;

export default function ModelHeader({ currentModel, onSelectModel, isSaving }) {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth border-none items-end">
            {MODEL_PRESETS.map((preset) => {
                
                const isSelected = (preset.id === 'none' && !currentModel) || (preset.url !== '' && currentModel === preset.url);
                const isEmptyPlaceholder = preset.id !== 'none' && preset.url === '';

                return (
                    <div 
                        key={preset.id} 
                        onClick={() => {
                            if (isSaving || isEmptyPlaceholder) return;
                            onSelectModel(preset.url);
                        }}
                        // PERBAIKAN: Menghapus 'ring-2 ring-[#106EBE]' dari class isSelected
                        className={`relative shrink-0 w-24 h-28 rounded-xl overflow-hidden transition-all border-none bg-zinc-200/50 dark:bg-zinc-800/50 flex flex-col items-center justify-end 
                            ${isEmptyPlaceholder ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} 
                            ${isSelected ? 'shadow-md scale-105' : (!isEmptyPlaceholder ? 'hover:scale-105' : '')} 
                            ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`
                        }
                    >
                        {preset.url ? (
                            <img src={preset.url} alt={preset.name} className="w-[80%] h-[80%] object-contain object-bottom drop-shadow-md border-none" loading="lazy" draggable="false" />
                        ) : (
                            <div className="flex-1 w-full flex items-center justify-center text-zinc-400 border-none">
                                {preset.id === 'none' ? (
                                    <User className="w-8 h-8 border-none opacity-50" />
                                ) : (
                                    <div className="text-[10px] font-bold opacity-40">Slot Kosong</div>
                                )}
                            </div>
                        )}
                        
                        {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#106EBE] rounded-full p-0.5 border-none shadow-sm z-10">
                                <Check className="w-3.5 h-3.5 text-white border-none stroke-[3]" />
                            </div>
                        )}
                        <div className="w-full bg-white/90 dark:bg-black/70 backdrop-blur-sm text-zinc-800 dark:text-white text-[10px] font-bold text-center py-1 border-none z-10">
                            {preset.name}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}