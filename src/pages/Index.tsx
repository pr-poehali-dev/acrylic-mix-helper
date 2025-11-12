import ColorMixer from '@/components/ColorMixer';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 md:mb-12 text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Микшер акриловых красок
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Профессиональный инструмент для точного смешивания цветов и расчета пропорций
          </p>
        </header>

        <ColorMixer />
      </div>
    </div>
  );
}
