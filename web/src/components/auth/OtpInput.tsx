'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

/**
 * 6자리 OTP 입력 컴포넌트
 * - 숫자 입력 후 다음 칸으로 자동 이동
 * - 백스페이스 시 이전 칸으로 이동
 * - 붙여넣기 지원
 */
export function OtpInput({ value, onChange, length = 6, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d*$/.test(char)) return;

      const digits = value.split('');
      digits[index] = char.slice(-1);
      const newValue = digits.join('').padEnd(length, '').slice(0, length);
      onChange(newValue);

      if (char && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, onChange, length]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        const digits = value.split('');
        digits[index - 1] = '';
        onChange(digits.join('').padEnd(length, '').slice(0, length));
        inputRefs.current[index - 1]?.focus();
      }
    },
    [value, onChange, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length);
      onChange(pasted.padEnd(length, '').slice(0, length));
      inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
    },
    [onChange, length]
  );

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="number"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          placeholder="·"
          disabled={disabled}
          aria-label={`${i + 1}번째 자리`}
          className={cn(
            'w-12 h-14 md:w-14 md:h-16 text-center rounded-lg border transition-all shadow-sm',
            'font-headline-lg-mobile text-headline-lg-mobile',
            'bg-surface-container-lowest text-on-surface',
            'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            value[i] ? 'border-primary' : 'border-outline-variant'
          )}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
