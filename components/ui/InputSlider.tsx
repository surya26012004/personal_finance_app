
import React from 'react';

interface InputSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
}

const InputSlider: React.FC<InputSliderProps> = ({ label, value, onChange, min, max, step, unit }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value) || 0);
    };
    
    const sliderPercentage = ((value - min) / (max - min)) * 100;
    const sliderBackground = `linear-gradient(to right, #4f46e5 ${sliderPercentage}%, #e5e7eb ${sliderPercentage}%)`;
    const darkSliderBackground = `linear-gradient(to right, #6366f1 ${sliderPercentage}%, #334155 ${sliderPercentage}%)`;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{label}</label>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-md">
                    <input
                        type="number"
                        value={value}
                        onChange={handleInputChange}
                        min={min}
                        max={max}
                        step={step}
                        className="w-24 text-right pr-2 py-1 bg-transparent font-medium focus:outline-none"
                    />
                    {unit && <span className="text-sm pr-2 text-text-secondary-light dark:text-text-secondary-dark">{unit}</span>}
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleInputChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer range-slider"
                style={{'--slider-bg': sliderBackground, '--dark-slider-bg': darkSliderBackground} as React.CSSProperties}
            />
            {/* Simple CSS injection for custom slider track */}
            <style>{`
                .range-slider {
                    background: var(--slider-bg);
                }
                .dark .range-slider {
                    background: var(--dark-slider-bg);
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #4f46e5;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: background .2s;
                }
                .range-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #4f46e5;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    transition: background .2s;
                }
                 .dark .range-slider::-webkit-slider-thumb {
                    background: #818cf8;
                }
                 .dark .range-slider::-moz-range-thumb {
                    background: #818cf8;
                }
            `}</style>
        </div>
    );
};

export default InputSlider;
