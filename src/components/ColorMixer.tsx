import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import ColorFromImage from './ColorFromImage';

interface Color {
  name: string;
  r: number;
  g: number;
  b: number;
  amount: number;
}

const BASIC_COLORS = [
  { name: 'Белый', r: 255, g: 255, b: 255 },
  { name: 'Черный', r: 0, g: 0, b: 0 },
  { name: 'Красный', r: 220, g: 38, b: 38 },
  { name: 'Желтый', r: 250, g: 204, b: 21 },
  { name: 'Синий', r: 37, g: 99, b: 235 },
  { name: 'Зеленый', r: 34, g: 197, b: 94 },
  { name: 'Оранжевый', r: 249, g: 115, b: 22 },
  { name: 'Фиолетовый', r: 168, g: 85, b: 247 },
  { name: 'Розовый', r: 236, g: 72, b: 153 },
  { name: 'Коричневый', r: 120, g: 53, b: 15 },
  { name: 'Серый', r: 156, g: 163, b: 175 },
];

export default function ColorMixer() {
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [targetColor, setTargetColor] = useState<string>('#808080');

  const addColor = (color: { name: string; r: number; g: number; b: number }) => {
    const newColor: Color = { ...color, amount: 1 };
    setSelectedColors([...selectedColors, newColor]);
  };

  const removeColor = (index: number) => {
    setSelectedColors(selectedColors.filter((_, i) => i !== index));
  };

  const updateAmount = (index: number, amount: number) => {
    const updated = [...selectedColors];
    updated[index].amount = amount;
    setSelectedColors(updated);
  };

  const calculateMixedColor = (): string => {
    if (selectedColors.length === 0) return '#FFFFFF';
    
    const totalAmount = selectedColors.reduce((sum, c) => sum + c.amount, 0);
    let r = 0, g = 0, b = 0;
    
    selectedColors.forEach(color => {
      const weight = color.amount / totalAmount;
      r += color.r * weight;
      g += color.g * weight;
      b += color.b * weight;
    });
    
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
  };

  const findClosestColor = (targetRgb: { r: number; g: number; b: number }) => {
    let minDistance = Infinity;
    let closest = BASIC_COLORS[0];
    
    BASIC_COLORS.forEach(color => {
      const distance = Math.sqrt(
        Math.pow(color.r - targetRgb.r, 2) +
        Math.pow(color.g - targetRgb.g, 2) +
        Math.pow(color.b - targetRgb.b, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = color;
      }
    });
    
    return closest;
  };

  const suggestMix = () => {
    const target = hexToRgb(targetColor);
    const suggestions: Color[] = [];
    
    const brightness = (target.r + target.g + target.b) / 3;
    const saturation = Math.max(target.r, target.g, target.b) - Math.min(target.r, target.g, target.b);
    
    if (brightness > 230) {
      suggestions.push({ name: 'Белый', r: 255, g: 255, b: 255, amount: 5 });
      const mainColor = findClosestColor(target);
      if (mainColor.name !== 'Белый') {
        suggestions.push({ ...mainColor, amount: 0.5 });
      }
    } else if (brightness < 30) {
      suggestions.push({ name: 'Черный', r: 0, g: 0, b: 0, amount: 5 });
      const mainColor = findClosestColor(target);
      if (mainColor.name !== 'Черный') {
        suggestions.push({ ...mainColor, amount: 0.5 });
      }
    } else {
      if (saturation < 30) {
        suggestions.push({ name: 'Белый', r: 255, g: 255, b: 255, amount: 3 });
        suggestions.push({ name: 'Черный', r: 0, g: 0, b: 0, amount: brightness < 128 ? 2 : 1 });
      } else {
        const colors = [
          { val: target.r, color: { name: 'Красный', r: 220, g: 38, b: 38 } },
          { val: target.g, color: { name: 'Зеленый', r: 34, g: 197, b: 94 } },
          { val: target.b, color: { name: 'Синий', r: 37, g: 99, b: 235 } },
        ].sort((a, b) => b.val - a.val);
        
        suggestions.push({ ...colors[0].color, amount: 3 });
        
        if (colors[1].val > 50) {
          suggestions.push({ ...colors[1].color, amount: 2 });
        }
        
        if (target.r > 200 && target.g > 150 && target.b < 80) {
          suggestions.push({ name: 'Желтый', r: 250, g: 204, b: 21, amount: 2 });
        }
        
        if (brightness > 180) {
          suggestions.push({ name: 'Белый', r: 255, g: 255, b: 255, amount: 2 });
        } else if (brightness < 100) {
          suggestions.push({ name: 'Черный', r: 0, g: 0, b: 0, amount: 1 });
        }
      }
    }
    
    setSelectedColors(suggestions.length > 0 ? suggestions : [
      { name: 'Белый', r: 255, g: 255, b: 255, amount: 1 },
      { name: 'Серый', r: 156, g: 163, b: 175, amount: 1 }
    ]);
  };
  
  const handleColorFromImage = (color: string) => {
    setTargetColor(color);
    setTimeout(() => suggestMix(), 100);
  };

  const mixedColor = calculateMixedColor();

  return (
    <div className="space-y-6">
      <ColorFromImage onColorSelect={handleColorFromImage} />
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="target-color">Целевой цвет</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="target-color"
                type="color"
                value={targetColor}
                onChange={(e) => setTargetColor(e.target.value)}
                className="w-20 h-12 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={targetColor}
                onChange={(e) => setTargetColor(e.target.value)}
                className="flex-1"
                placeholder="#000000"
              />
              <Button onClick={suggestMix} className="whitespace-nowrap">
                <Icon name="Lightbulb" size={16} className="mr-2" />
                Подобрать смесь
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Базовые краски</h2>
          <div className="grid grid-cols-3 gap-2">
            {BASIC_COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => addColor(color)}
                className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-xs font-medium shadow-sm"
                style={{ 
                  backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                  color: (color.r + color.g + color.b) / 3 > 128 ? '#000' : '#fff'
                }}
              >
                {color.name}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Смесь</h2>
          {selectedColors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Pipette" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Выберите краски для смешивания</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedColors.map((color, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                      />
                      <span className="font-medium">{color.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColor(index)}
                    >
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[color.amount]}
                      onValueChange={(value) => updateAmount(index, value[0])}
                      min={0.5}
                      max={10}
                      step={0.5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {color.amount.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Результат смешивания</h2>
        <div className="flex gap-6 items-center">
          <div
            className="w-32 h-32 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: mixedColor }}
          />
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">RGB</Label>
                <p className="font-mono font-medium">{mixedColor}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Пропорции</Label>
                <p className="text-sm">
                  {selectedColors.length > 0
                    ? selectedColors.map(c => `${c.name}: ${c.amount}`).join(' + ')
                    : 'Не выбрано'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mixedColor);
              }}
              className="mt-2"
            >
              <Icon name="Copy" size={16} className="mr-2" />
              Копировать RGB
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}