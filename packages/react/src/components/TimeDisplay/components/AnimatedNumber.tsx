/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { AnimatedDigit } from './AnimatedDigit';

interface AnimatedNumberProps {
  value: string;
  animated: boolean;
  /**
   * Scroll direction for all digits in this field.
   * Supplied by TimeDisplayValue based on mode:
   *   count-up   → 'up'   (digits increase; wrap 59→00 continues upward)
   *   count-down → 'down' (digits decrease; wrap 00→59 continues downward)
   * Field-level numeric comparison cannot determine direction correctly at
   * wrap boundaries (59→00 in count-up looks like a decrease), so direction
   * must be provided by the caller who knows the mode.
   */
  direction: 'up' | 'down';
}

/**
 * Splits a string into individual characters and renders each as an
 * `AnimatedDigit`. Every digit in the field receives the same scroll
 * direction, which is determined by the mode in TimeDisplayValue and
 * passed in — not computed here.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  animated,
  direction,
}) => (
  // dir="ltr" preserves the internal digit order of time values (e.g. "12:46:00")
  // when the component is used inside an RTL layout. The surrounding layout
  // continues to mirror normally; only the numeric sequence is isolated.
  <span dir="ltr">
    {value.split('').map((digit, index) => (
      <AnimatedDigit
        // Index key is intentional: position is stable within a field
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        value={digit}
        animated={animated}
        direction={direction}
      />
    ))}
  </span>
);

AnimatedNumber.displayName = 'AnimatedNumber';
