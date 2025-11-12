import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ColorFromImageProps {
  onColorSelect: (color: string) => void;
}

export default function ColorFromImage({ onColorSelect }: ColorFromImageProps) {
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image && imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      img.onload = () => {
        const maxWidth = 600;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      };
    }
  }, [image]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setSelectedColor(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;
    
    const hex = `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;

    setSelectedColor(hex);
    setCursorPosition({ x, y });
    toast.success('Цвет выбран!');
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPosition({ x, y });
  };

  const applyColor = () => {
    if (!selectedColor) {
      toast.error('Выберите цвет на изображении');
      return;
    }
    onColorSelect(selectedColor);
    toast.success('Цвет применен к микшеру');
  };

  const clearImage = () => {
    setImage(null);
    setSelectedColor(null);
    setCursorPosition(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Выбор цвета из фото</Label>
          {image && (
            <Button variant="ghost" size="sm" onClick={clearImage}>
              <Icon name="X" size={16} className="mr-2" />
              Очистить
            </Button>
          )}
        </div>

        {!image ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
            <Icon name="Camera" size={48} className="mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Загрузите фото предмета или образца цвета
              </p>
              <p className="text-sm text-muted-foreground">
                Поддерживаются JPG, PNG, WEBP
              </p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Icon name="Upload" size={16} className="mr-2" />
              Загрузить фото
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative border border-border rounded-lg overflow-hidden bg-muted">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMove}
                className="cursor-crosshair w-full h-auto"
              />
              <img
                ref={imageRef}
                src={image}
                alt="Uploaded"
                className="hidden"
              />
              {cursorPosition && (
                <div
                  className="absolute w-8 h-8 border-2 border-white rounded-full pointer-events-none shadow-lg"
                  style={{
                    left: cursorPosition.x - 16,
                    top: cursorPosition.y - 16,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                  }}
                />
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Кликните на изображение, чтобы выбрать цвет
            </p>

            {selectedColor && (
              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <div
                  className="w-16 h-16 rounded-lg border-2 border-border shadow-inner"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="flex-1">
                  <Label className="text-muted-foreground text-xs">Выбранный цвет</Label>
                  <p className="font-mono font-semibold text-lg">{selectedColor.toUpperCase()}</p>
                </div>
                <Button onClick={applyColor}>
                  <Icon name="Check" size={16} className="mr-2" />
                  Применить
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
