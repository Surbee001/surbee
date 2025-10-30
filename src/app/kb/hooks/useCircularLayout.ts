import { useMemo } from 'react';

export interface Position {
  x: number;
  y: number;
  angle: number;
}

export function useCircularLayout(
  itemCount: number,
  radius: number = 200,
  centerX: number = 300,
  centerY: number = 300,
  startAngle: number = -Math.PI / 2
) {
  const positions = useMemo(() => {
    if (itemCount === 0) return [];

    return Array.from({ length: itemCount }, (_, index) => {
      const angle = startAngle + (index * (2 * Math.PI)) / itemCount;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return { x, y, angle };
    });
  }, [itemCount, radius, centerX, centerY, startAngle]);

  const getPositionForAngle = (angle: number): Position => {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, angle };
  };

  const getAngleForIndex = (index: number): number => {
    return startAngle + (index * (2 * Math.PI)) / itemCount;
  };

  const getDistanceFromCenter = (x: number, y: number): number => {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngleFromCenter = (x: number, y: number): number => {
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.atan2(dy, dx);
  };

  const isPointInCircle = (x: number, y: number, checkRadius: number = radius): boolean => {
    const distance = getDistanceFromCenter(x, y);
    return distance <= checkRadius;
  };

  const getClosestPosition = (x: number, y: number): Position | null => {
    if (positions.length === 0) return null;

    let closestPosition = positions[0];
    let minDistance = Infinity;

    positions.forEach(position => {
      const dx = position.x - x;
      const dy = position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPosition = position;
      }
    });

    return closestPosition;
  };

  const animateToPosition = (
    currentX: number,
    currentY: number,
    targetPosition: Position,
    progress: number // 0 to 1
  ): Position => {
    const x = currentX + (targetPosition.x - currentX) * progress;
    const y = currentY + (targetPosition.y - currentY) * progress;
    const angle = targetPosition.angle;
    
    return { x, y, angle };
  };

  return {
    positions,
    centerX,
    centerY,
    radius,
    getPositionForAngle,
    getAngleForIndex,
    getDistanceFromCenter,
    getAngleFromCenter,
    isPointInCircle,
    getClosestPosition,
    animateToPosition,
  };
}