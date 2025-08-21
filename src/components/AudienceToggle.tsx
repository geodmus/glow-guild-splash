import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AudienceToggleProps {
  onAudienceChange: (audience: 'brands' | 'creators') => void;
  currentAudience: 'brands' | 'creators';
}

export const AudienceToggle = ({ onAudienceChange, currentAudience }: AudienceToggleProps) => {
  return (
    <div className="flex items-center bg-secondary/50 p-1 rounded-xl backdrop-blur-sm border border-border/50 mb-8">
      <Button
        variant={currentAudience === 'brands' ? 'brand' : 'ghost'}
        size="lg"
        onClick={() => onAudienceChange('brands')}
        className={`flex-1 transition-all duration-300 ${
          currentAudience === 'brands' ? 'shadow-button' : 'hover:bg-muted/50'
        }`}
      >
        For Beauty Brands
      </Button>
      <Button
        variant={currentAudience === 'creators' ? 'creator' : 'ghost'}
        size="lg"
        onClick={() => onAudienceChange('creators')}
        className={`flex-1 transition-all duration-300 ${
          currentAudience === 'creators' ? 'shadow-button' : 'hover:bg-muted/50'
        }`}
      >
        For Content Creators
      </Button>
    </div>
  );
};