import { WATERCOLOR_BG_URL } from '@/lib/constants';

interface WatercolorBackgroundProps {
  opacity?: number;
}

/** 모든 페이지에 공통으로 사용되는 워터컬러 배경 이미지 컴포넌트 */
export function WatercolorBackground({ opacity = 0.4 }: WatercolorBackgroundProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden"
      style={{ opacity }}
      aria-hidden="true"
    >
      <img src={WATERCOLOR_BG_URL} alt="" className="w-full h-full object-cover" />
    </div>
  );
}
