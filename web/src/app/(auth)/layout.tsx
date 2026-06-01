import { WatercolorBackground } from '@/components/WatercolorBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center bg-surface">
      <WatercolorBackground opacity={0.4} />
      <div className="w-full max-w-container-max-width min-h-screen flex flex-col relative">
        {children}
      </div>
    </div>
  );
}
