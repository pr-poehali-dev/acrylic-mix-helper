import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ColorMix {
  id: string;
  name: string;
  colors: PaintColor[];
  result: string;
  timestamp: number;
}

interface PaintColor {
  id: string;
  name: string;
  hex: string;
  amount: number;
}

const BASIC_COLORS: Omit<PaintColor, 'id' | 'amount'>[] = [
  { name: 'Белый', hex: '#FFFFFF' },
  { name: 'Черный', hex: '#000000' },
  { name: 'Красный', hex: '#E63946' },
  { name: 'Синий', hex: '#1D3557' },
  { name: 'Желтый', hex: '#FFD60A' },
  { name: 'Зеленый', hex: '#06D6A0' },
  { name: 'Коричневый', hex: '#8B4513' },
  { name: 'Оранжевый', hex: '#FB8500' },
  { name: 'Фиолетовый', hex: '#7209B7' },
  { name: 'Розовый', hex: '#FF006E' },
];

const RECIPE_LIBRARY = [
  { name: 'Небесно-голубой', colors: ['Белый', 'Синий'], proportions: [85, 15] },
  { name: 'Оливковый', colors: ['Желтый', 'Черный', 'Зеленый'], proportions: [60, 10, 30] },
  { name: 'Персиковый', colors: ['Белый', 'Оранжевый', 'Розовый'], proportions: [70, 20, 10] },
  { name: 'Бордовый', colors: ['Красный', 'Черный', 'Коричневый'], proportions: [60, 20, 20] },
  { name: 'Мятный', colors: ['Белый', 'Зеленый', 'Синий'], proportions: [70, 25, 5] },
  { name: 'Лавандовый', colors: ['Белый', 'Фиолетовый', 'Синий'], proportions: [75, 20, 5] },
];

export default function Index() {
  const [selectedColors, setSelectedColors] = useState<PaintColor[]>([]);
  const [totalVolume, setTotalVolume] = useState(100);
  const [history, setHistory] = useState<ColorMix[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorMix[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('paintHistory');
    const savedPalettesData = localStorage.getItem('savedPalettes');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedPalettesData) setSavedPalettes(JSON.parse(savedPalettesData));
  }, []);

  const addColor = (color: Omit<PaintColor, 'id' | 'amount'>) => {
    const newColor: PaintColor = {
      ...color,
      id: Date.now().toString(),
      amount: selectedColors.length === 0 ? 100 : 0,
    };
    setSelectedColors([...selectedColors, newColor]);
  };

  const removeColor = (id: string) => {
    setSelectedColors(selectedColors.filter((c) => c.id !== id));
  };

  const updateAmount = (id: string, amount: number) => {
    setSelectedColors(
      selectedColors.map((c) => (c.id === id ? { ...c, amount } : c))
    );
  };

  const mixColors = (colors: PaintColor[]): string => {
    if (colors.length === 0) return '#FFFFFF';
    
    const totalAmount = colors.reduce((sum, c) => sum + c.amount, 0);
    if (totalAmount === 0) return '#FFFFFF';
    
    let r = 0, g = 0, b = 0;
    
    colors.forEach((color) => {
      const weight = color.amount / totalAmount;
      const rgb = hexToRgb(color.hex);
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
    });
    
    return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const normalizeAmounts = () => {
    const total = selectedColors.reduce((sum, c) => sum + c.amount, 0);
    if (total === 0) return;
    
    setSelectedColors(
      selectedColors.map((c) => ({
        ...c,
        amount: Math.round((c.amount / total) * 100 * 10) / 10,
      }))
    );
    toast.success('Пропорции нормализованы до 100%');
  };

  const calculateVolumes = () => {
    const total = selectedColors.reduce((sum, c) => sum + c.amount, 0);
    if (total === 0) return [];
    
    return selectedColors.map((c) => ({
      ...c,
      volume: Math.round((c.amount / total) * totalVolume * 100) / 100,
    }));
  };

  const saveMix = () => {
    if (selectedColors.length === 0) {
      toast.error('Добавьте хотя бы один цвет');
      return;
    }
    
    const mix: ColorMix = {
      id: Date.now().toString(),
      name: `Микс ${new Date().toLocaleString('ru-RU')}`,
      colors: [...selectedColors],
      result: mixColors(selectedColors),
      timestamp: Date.now(),
    };
    
    const newHistory = [mix, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('paintHistory', JSON.stringify(newHistory));
    toast.success('Рецепт сохранен в историю');
  };

  const saveToPalette = () => {
    if (selectedColors.length === 0) {
      toast.error('Добавьте хотя бы один цвет');
      return;
    }
    
    const mix: ColorMix = {
      id: Date.now().toString(),
      name: `Палитра ${savedPalettes.length + 1}`,
      colors: [...selectedColors],
      result: mixColors(selectedColors),
      timestamp: Date.now(),
    };
    
    const newPalettes = [mix, ...savedPalettes];
    setSavedPalettes(newPalettes);
    localStorage.setItem('savedPalettes', JSON.stringify(newPalettes));
    toast.success('Добавлено в палитру');
  };

  const loadMix = (mix: ColorMix) => {
    setSelectedColors([...mix.colors]);
    toast.success('Рецепт загружен');
  };

  const applyRecipe = (recipe: typeof RECIPE_LIBRARY[0]) => {
    const colors: PaintColor[] = recipe.colors.map((colorName, index) => {
      const baseColor = BASIC_COLORS.find((c) => c.name === colorName);
      return {
        id: Date.now().toString() + index,
        name: colorName,
        hex: baseColor?.hex || '#000000',
        amount: recipe.proportions[index],
      };
    });
    setSelectedColors(colors);
    toast.success(`Рецепт "${recipe.name}" применен`);
  };

  const resultColor = mixColors(selectedColors);
  const volumes = calculateVolumes();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Микшер красок
          </h1>
          <p className="text-muted-foreground text-lg">
            Профессиональный инструмент для смешивания акриловых красок
          </p>
        </header>

        <Tabs defaultValue="mixer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="mixer">
              <Icon name="Palette" size={16} className="mr-2" />
              Микшер
            </TabsTrigger>
            <TabsTrigger value="calculator">
              <Icon name="Calculator" size={16} className="mr-2" />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="recipes">
              <Icon name="BookOpen" size={16} className="mr-2" />
              Рецепты
            </TabsTrigger>
            <TabsTrigger value="palette">
              <Icon name="Paintbrush" size={16} className="mr-2" />
              Палитра
            </TabsTrigger>
            <TabsTrigger value="guide">
              <Icon name="Info" size={16} className="mr-2" />
              Справка
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mixer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Выберите краски</CardTitle>
                    <CardDescription>
                      Добавьте цвета для смешивания
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {BASIC_COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => addColor(color)}
                          className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <div
                            className="w-12 h-12 rounded-full border-2 border-border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs text-center">{color.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedColors.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold">Выбранные краски</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={normalizeAmounts}
                          >
                            Нормализовать
                          </Button>
                        </div>
                        {selectedColors.map((color) => (
                          <div
                            key={color.id}
                            className="flex items-center gap-4 p-4 bg-secondary rounded-lg"
                          >
                            <div
                              className="w-8 h-8 rounded-full border-2 border-border flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{color.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {color.amount}%
                                </span>
                              </div>
                              <Slider
                                value={[color.amount]}
                                onValueChange={(value) =>
                                  updateAmount(color.id, value[0])
                                }
                                max={100}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeColor(color.id)}
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Результат</CardTitle>
                    <CardDescription>Полученный цвет</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="w-full h-48 rounded-lg border-2 border-border shadow-inner"
                      style={{ backgroundColor: resultColor }}
                    />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        HEX код
                      </p>
                      <p className="font-mono text-lg font-semibold">
                        {resultColor.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveMix} className="flex-1">
                        <Icon name="Save" size={16} className="mr-2" />
                        Сохранить
                      </Button>
                      <Button onClick={saveToPalette} variant="outline" className="flex-1">
                        <Icon name="Plus" size={16} className="mr-2" />
                        В палитру
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Калькулятор объема</CardTitle>
                <CardDescription>
                  Рассчитайте точные объемы красок для нужного количества
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="volume">Требуемый объем (мл)</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={totalVolume}
                    onChange={(e) => setTotalVolume(Number(e.target.value))}
                    min={1}
                    className="mt-2"
                  />
                </div>

                {volumes.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Необходимые объемы:</h3>
                    {volumes.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-border"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-medium">{color.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{color.volume} мл</p>
                          <p className="text-sm text-muted-foreground">
                            {color.amount}%
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
                      <span className="font-semibold">Итого:</span>
                      <span className="font-bold text-xl">{totalVolume} мл</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Добавьте краски в микшере для расчета объемов
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История смешиваний</CardTitle>
                <CardDescription>
                  Последние {history.length} экспериментов
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3">
                    {history.map((mix) => (
                      <div
                        key={mix.id}
                        className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                        onClick={() => loadMix(mix)}
                      >
                        <div
                          className="w-16 h-16 rounded-lg border-2 border-border flex-shrink-0"
                          style={{ backgroundColor: mix.result }}
                        />
                        <div className="flex-1">
                          <p className="font-medium mb-1">{mix.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {mix.colors.map((c) => c.name).join(', ')}
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={20} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    История пуста. Создайте и сохраните первый микс!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Библиотека рецептов</CardTitle>
                <CardDescription>
                  Готовые рецепты популярных оттенков
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RECIPE_LIBRARY.map((recipe) => {
                    const previewColors = recipe.colors.map((colorName) => {
                      const baseColor = BASIC_COLORS.find(
                        (c) => c.name === colorName
                      );
                      return {
                        id: colorName,
                        name: colorName,
                        hex: baseColor?.hex || '#000000',
                        amount: 0,
                      };
                    });
                    recipe.proportions.forEach((prop, idx) => {
                      previewColors[idx].amount = prop;
                    });
                    const previewColor = mixColors(previewColors);

                    return (
                      <div
                        key={recipe.name}
                        className="p-4 bg-secondary rounded-lg space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                            style={{ backgroundColor: previewColor }}
                          />
                          <h3 className="font-semibold">{recipe.name}</h3>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {recipe.colors.map((color, idx) => (
                            <span key={idx}>
                              {color} ({recipe.proportions[idx]}%)
                              {idx < recipe.colors.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => applyRecipe(recipe)}
                          className="w-full"
                          variant="outline"
                        >
                          Применить рецепт
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="palette" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Моя палитра</CardTitle>
                <CardDescription>
                  Сохраненные цветовые комбинации
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedPalettes.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {savedPalettes.map((mix) => (
                      <div
                        key={mix.id}
                        className="cursor-pointer group"
                        onClick={() => loadMix(mix)}
                      >
                        <div
                          className="w-full aspect-square rounded-lg border-2 border-border group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: mix.result }}
                        />
                        <p className="text-sm text-center mt-2 text-muted-foreground">
                          {mix.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Палитра пуста. Сохраните первую комбинацию!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Справка по работе с красками</CardTitle>
                <CardDescription>
                  Полезные советы и рекомендации
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Palette" size={18} />
                    Основы смешивания
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Всегда добавляйте темный цвет к светлому, а не наоборот</li>
                    <li>Смешивайте краски постепенно, малыми порциями</li>
                    <li>Используйте чистые кисти и палитру для точности</li>
                    <li>Акриловая краска темнеет при высыхании</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Droplet" size={18} />
                    Работа с объемами
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Всегда готовьте краску с запасом 10-15%</li>
                    <li>Для больших объемов используйте весы вместо мерных емкостей</li>
                    <li>Записывайте пропорции для повторного использования</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="BookOpen" size={18} />
                    Цветовые сочетания
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Красный + Желтый = Оранжевый</li>
                    <li>Синий + Желтый = Зеленый</li>
                    <li>Красный + Синий = Фиолетовый</li>
                    <li>Добавление белого делает цвет светлее (тинт)</li>
                    <li>Добавление черного делает цвет темнее (шейд)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="AlertCircle" size={18} />
                    Важно помнить
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Смешивайте краски одного производителя и типа</li>
                    <li>Тестируйте цвет на отдельной поверхности перед применением</li>
                    <li>Храните смешанную краску в герметичной таре</li>
                    <li>Используйте этот калькулятор для точных расчетов</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
