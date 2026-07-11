/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { usePrefix } from '@carbon-labs/utilities/usePrefix';

interface AnimatedDigitProps {
  value: string;
  animated: boolean;
  /** Direction is determined by the parent AnimatedNumber via full-field comparison. */
  direction: 'up' | 'down';
}

/**
 * Renders a single character with an optional odometer-style slide transition.
 * Direction is received as a prop from `AnimatedNumber` — this component never
 * computes it itself (per-digit comparison breaks at carry wraps like 09→10).
 */
export const AnimatedDigit: React.FC<AnimatedDigitProps> = ({
  value,
  animated,
  direction,
}) => {
  const prefix = usePrefix();
  const blockClass = `${prefix}--animated-digit`;

  const [currentValue, setCurrentValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  // Keep a ref to track the last value we animated from, separate from
  // React state, so the effect dependency stays simple.
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (value === lastValueRef.current) return;

    if (animated) {
      const numValue = parseInt(value, 10);
      const numCurrent = parseInt(lastValueRef.current, 10);

      if (!isNaN(numValue) && !isNaN(numCurrent)) {
        setPreviousValue(lastValueRef.current);
        setIsAnimating(true);

        const timer = setTimeout(() => {
          setCurrentValue(value);
          setIsAnimating(false);
        }, 300); // Match CSS animation duration

        lastValueRef.current = value;
        return () => clearTimeout(timer);
      }
    }

    lastValueRef.current = value;
    setCurrentValue(value);
  }, [value, animated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!animated) {
    return <span className={blockClass}>{value}</span>;
  }

  return (
    <span className={`${blockClass}__container`}>
      <span
        className={[
          `${blockClass}__slider`,
          isAnimating && `${blockClass}__slider--animating`,
          isAnimating &&
            direction === 'up' &&
            `${blockClass}__slider--slide-up`,
          isAnimating &&
            direction === 'down' &&
            `${blockClass}__slider--slide-down`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={`${blockClass}__current`}>
          {isAnimating ? previousValue : currentValue}
        </span>
        {isAnimating && (
          <span className={`${blockClass}__next`}>{value}</span>
        )}
      </span>
    </span>
  );
};

AnimatedDigit.displayName = 'AnimatedDigit';
