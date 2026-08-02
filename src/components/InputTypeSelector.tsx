import { motion } from 'framer-motion';
import { Mail, File, Link, MapPin, Globe } from 'lucide-react';
import { Button } from './ui/button';
import type { InputType } from '../types/phishing';

interface InputTypeSelectorProps {
  selectedType: InputType;
  onTypeChange: (type: InputType) => void;
}

const inputTypes = [
  { id: 'email' as InputType, label: 'Email', icon: Mail, description: 'Analyze email content' },
  { id: 'file' as InputType, label: 'File', icon: File, description: 'Upload and scan files' },
  { id: 'url' as InputType, label: 'URL', icon: Link, description: 'Check website links' },
  { id: 'ip' as InputType, label: 'IP Address', icon: MapPin, description: 'Lookup IP reputation' },
  { id: 'domain' as InputType, label: 'Domain', icon: Globe, description: 'Analyze domain reputation' },
];

export const InputTypeSelector = ({ selectedType, onTypeChange }: InputTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {inputTypes.map((type) => {
        const isSelected = selectedType === type.id;
        const Icon = type.icon;
        return (
          <motion.button
            key={type.id}
            onClick={() => onTypeChange(type.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between ${
              isSelected
                ? 'bg-card border-2 border-primary shadow-md shadow-primary/10 ring-2 ring-primary/20'
                : 'bg-card/70 border-border/60 hover:bg-card hover:border-border hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gradient-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
              </div>
              {isSelected && (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            <div>
              <h4 className={`text-xs font-bold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {type.label}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {type.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
