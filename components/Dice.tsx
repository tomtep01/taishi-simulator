import React from 'react';

interface DiceProps {
  value: number;
  size?: number;
}

export const Dice: React.FC<DiceProps> = ({ value, size = 64 }) => {
  // Dot positions for each face (percentage)
  const dots: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [20, 80], [80, 20], [80, 80]],
    5: [[20, 20], [20, 80], [50, 50], [80, 20], [80, 80]],
    6: [[20, 20], [20, 50], [20, 80], [80, 20], [80, 50], [80, 80]],
  };

  const dotColor = value === 1 || value === 4 ? '#ef4444' : '#1e293b'; // Red for 1 and 4 in some Asian styles, or standard black. Let's make 1 and 4 red for "luck".

  return (
    <div 
      className="bg-white rounded-xl shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] flex-shrink-0"
      style={{ width: size, height: size, position: 'relative' }}
    >
      {dots[value]?.map((pos, idx) => (
        <div
          key={idx}
          className="absolute rounded-full shadow-inner"
          style={{
            width: '18%',
            height: '18%',
            top: `${pos[1]}%`,
            left: `${pos[0]}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: dotColor,
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4)'
          }}
        />
      ))}
    </div>
  );
};
