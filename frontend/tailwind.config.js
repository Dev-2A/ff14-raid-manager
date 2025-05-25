/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ff14': {
          'primary': '#1a1a1a',
          'secondary': '#2a2a2a',
          'accent': '#d4af37',
          'danger': '#dc2626',
          'success': '#16a34a',
          'tank': '#3b82f6',      // 탱커 - 파란색
          'healer': '#10b981',    // 힐러 - 초록색
          'dps': '#ef4444',       // DPS - 빨간색
          'melee': '#dc2626',     // 근딜
          'ranged': '#f59e0b',    // 원딜
          'caster': '#8b5cf6',    // 캐스터
        }
      },
      fontFamily: {
        'sans': ['Noto Sans KR', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}