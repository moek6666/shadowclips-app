import React from 'react';
import { Check, User } from 'lucide-react';

export const MODEL_PRESETS = [
    { id: 'none', name: 'Tanpa Model', url: '' },
    // Isi properti 'url' di bawah dengan link gambar transparan (PNG/WebP) Anda
    { id: 'model1', name: 'Bikini', url: 'https://simp6.cuckcapital.cr/images4/7fb12495-1ab9-4a8c-bc1a-fbe71f4c296e.webp' },
    { id: 'model2', name: 'Cute 1', url: 'https://simp6.cuckcapital.cr/images4/2461f19f-6f32-4be2-82a7-fcbfacacc7ca.webp' },
    { id: 'model3', name: 'YourPose', url: 'https://simp6.cuckcapital.cr/images4/9abafc46-fa23-40bf-947d-4fe15148c507.webp' },
    { id: 'model4', name: 'Wibuku1', url: 'https://simp6.cuckcapital.cr/images4/aa29b88c-608b-430f-a022-52f88fb54b76.webp' },
    { id: 'model5', name: 'Wibuku2', url: 'https://simp6.cuckcapital.cr/images4/bfd5246d-bc30-4ce5-ba5f-009225efc075.webp' },
    { id: 'model6', name: 'NudeWibu1', url: 'https://simp6.cuckcapital.cr/images4/b7e58b56-91ca-4309-bddb-f2b75fd5f40d.webp' },
    { id: 'model7', name: 'NudeWibu2', url: 'https://simp6.cuckcapital.cr/images4/9691f6ae-cd82-4b24-be4f-2eb92cd11ae3.webp' },
    { id: 'model8', name: 'Manwha1', url: 'https://simp6.cuckcapital.cr/images4/ad68b05c-b352-4ee6-b635-6fb7ee099541.webp' },
    { id: 'model9', name: 'Wibuku3', url: 'https://simp6.cuckcapital.cr/images4/4f5b4c3b-0130-4bb8-9a79-3d841a74251a.webp' },
    { id: 'model10', name: 'Manwah2', url: 'https://simp6.cuckcapital.cr/images4/9d1a7b48-11be-4250-b6bd-162b2da5c3bd.webp' }
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