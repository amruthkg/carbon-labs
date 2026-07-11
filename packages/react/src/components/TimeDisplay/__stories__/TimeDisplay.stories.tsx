/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Classic JSX transform — do not remove (packages/react/.storybook/main.js)
import React, { useState } from 'react';
import mdx from './TimeDisplay.mdx';
import { TimeDisplay } from '../components/TimeDisplay';
import { TimeDisplayLabel } from '../components/TimeDisplayLabel';
import { TimeDisplayValue } from '../components/TimeDisplayValue';
import { TimeDisplayHelperText } from '../components/TimeDisplayHelperText';
import { TimeDisplayComplete } from '../components/TimeDisplayComplete';
import '../components/time-display.scss';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

const meta: Meta<typeof TimeDisplay> = {
  title: 'Components/TimeDisplay',
  component: TimeDisplay,
  // Sub-component tabs appear in the Component API panel in Storybook docs.
  // Click each tab to see the full prop table for that sub-component.
  subcomponents: {
    'TimeDisplay.Label': TimeDisplayLabel,
    'TimeDisplay.Value': TimeDisplayValue,
    'TimeDisplay.HelperText': TimeDisplayHelperText,
    'TimeDisplay.CompleteMessage': TimeDisplayComplete,
  },
  parameters: {
    layout: 'padded',
    docs: {
      page: mdx,
      source: { type: 'code' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TimeDisplay>;

// Stable reference — defined once outside stories so it doesn't reset on re-render
const ELAPSED_START = new Date(Date.now() - 3665000); // ~1 hr 1 min 5 sec ago

// ─── Count-up ────────────────────────────────────────────────────────────────

export const CountUp: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Job elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={ELAPSED_START}
        format="stacked"
      />
    </TimeDisplay>
  ),
};

// ─── Count-down ──────────────────────────────────────────────────────────────

export const CountDown: Story = {
  render: () => {
    const [isComplete, setIsComplete] = useState(false);
    const [endTime] = useState(() => new Date(Date.now() + 30000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Session expires in</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          format="stacked"
          announcementMode="threshold"
          thresholds={[
            { value: 20, label: '20 seconds remaining' },
            { value: 10, label: '10 seconds remaining' },
          ]}
          onComplete={() => setIsComplete(true)}
        />
        {isComplete && (
          <TimeDisplay.CompleteMessage>Session expired</TimeDisplay.CompleteMessage>
        )}
      </TimeDisplay>
    );
  },
};

// ─── Duration ────────────────────────────────────────────────────────────────

export const Duration: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Total runtime</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="duration"
        duration={45296}
        format="stacked"
      />
      <TimeDisplay.HelperText>Task completed successfully</TimeDisplay.HelperText>
    </TimeDisplay>
  ),
};

// ─── All formats side-by-side ─────────────────────────────────────────────────
// Used by the MDX overview page. Shows stacked / boxed / flat / inline together.

export const AllFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      {(['stacked', 'boxed', 'flat', 'inline'] as const).map((fmt) => (
        <div key={fmt}>
          <p style={{ fontSize: '0.75rem', marginBlockEnd: '0.5rem', textTransform: 'capitalize' }}>
            {fmt}
          </p>
          <TimeDisplay>
            <TimeDisplay.Label hidden>Total runtime</TimeDisplay.Label>
            <TimeDisplay.Value mode="duration" duration={45296} format={fmt} />
          </TimeDisplay>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Individual formats ───────────────────────────────────────────────────────

export const Flat: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value mode="count-up" startTime={ELAPSED_START} format="flat" />
    </TimeDisplay>
  ),
};

export const Inline: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label inline>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value mode="count-up" startTime={ELAPSED_START} format="inline" />
    </TimeDisplay>
  ),
};

export const Boxed: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value mode="count-up" startTime={ELAPSED_START} format="boxed" />
    </TimeDisplay>
  ),
};

// ─── Customizations ───────────────────────────────────────────────────────────

export const WithDays: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Duration</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="duration"
        duration={259200}
        format="stacked"
        units={['days', 'hours', 'minutes', 'seconds']}
      />
    </TimeDisplay>
  ),
};

export const MinutesAndSeconds: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={new Date(Date.now() - 125000)}
        format="stacked"
        units={['minutes', 'seconds']}
      />
    </TimeDisplay>
  ),
};

export const NoZeroPadding: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={new Date(Date.now() - 125000)}
        format="stacked"
        padWithZero={false}
      />
    </TimeDisplay>
  ),
};

export const HiddenLabel: Story = {
  render: () => (
    <TimeDisplay aria-label="Total runtime">
      <TimeDisplay.Label hidden>Total runtime</TimeDisplay.Label>
      <TimeDisplay.Value mode="duration" duration={45296} format="stacked" />
    </TimeDisplay>
  ),
};

export const LabelInline: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Value mode="count-up" startTime={ELAPSED_START} format="inline" />
      <TimeDisplay.Label inline>elapsed</TimeDisplay.Label>
    </TimeDisplay>
  ),
};

export const CustomUnitLabels: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={ELAPSED_START}
        format="stacked"
        unitLabels={{ hours: 'h', minutes: 'm', seconds: 's' }}
        accessibleUnitLabels={{ hours: 'hours', minutes: 'minutes', seconds: 'seconds' }}
      />
    </TimeDisplay>
  ),
};

export const ThresholdCallbacks: Story = {
  render: () => {
    const [endTime] = useState(() => new Date(Date.now() + 26000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          units={['seconds']}
          format="stacked"
          announcementMode="threshold"
          thresholds={[
            { value: 25, label: '25 seconds remaining', onReach: (v) => console.log(`threshold: ${v}s`) },
            { value: 20, label: '20 seconds remaining', onReach: (v) => console.log(`threshold: ${v}s`) },
            { value: 15, label: '15 seconds remaining', onReach: (v) => console.log(`threshold: ${v}s`) },
            { value: 10, label: '10 seconds remaining', onReach: (v) => console.log(`threshold: ${v}s`) },
            { value: 5,  label: '5 seconds remaining',  onReach: (v) => console.log(`threshold: ${v}s`) },
          ]}
          onComplete={() => console.log('[TimeDisplay] onComplete')}
        />
        <TimeDisplay.HelperText>
          Open the browser console to see threshold callbacks fire
        </TimeDisplay.HelperText>
      </TimeDisplay>
    );
  },
};

export const WithCompleteMessage: Story = {
  render: () => {
    const [isComplete, setIsComplete] = useState(false);
    const [endTime] = useState(() => new Date(Date.now() + 5000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          format="stacked"
          onComplete={() => setIsComplete(true)}
        />
        {isComplete && (
          <TimeDisplay.CompleteMessage>Job complete ✓</TimeDisplay.CompleteMessage>
        )}
      </TimeDisplay>
    );
  },
};
