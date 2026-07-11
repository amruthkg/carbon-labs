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
import { TimeDisplay } from '../components/TimeDisplay';
import '../components/time-display.scss';
import type { StoryObj, Meta } from '@storybook/react-webpack5';

const meta: Meta = {
  title: 'Components/TimeDisplay/Examples',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
  },
};

export default meta;
type Story = StoryObj;

// Stable reference — defined once outside stories so it doesn't reset on re-render
const ELAPSED_START = new Date(Date.now() - 3665000); // ~1 hr 1 min 5 sec ago

// ─── Composable examples ──────────────────────────────────────────────────────

export const ElapsedTimeHero: Story = {
  render: () => (
    <TimeDisplay aria-label="Job elapsed time">
      <TimeDisplay.Label>
        <span aria-hidden="true">⏱ </span>Job elapsed time
      </TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={ELAPSED_START}
        format="stacked"
      />
    </TimeDisplay>
  ),
};

export const InlineProse: Story = {
  render: () => (
    <p style={{ fontFamily: 'sans-serif', fontSize: '1rem' }}>
      The job has been running for{' '}
      <TimeDisplay>
        <TimeDisplay.Label hidden>elapsed time</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-up"
          startTime={new Date(Date.now() - 125000)}
          format="inline"
          units={['minutes', 'seconds']}
        />
      </TimeDisplay>{' '}
      and is still active.
    </p>
  ),
};

export const UrgencyCard: Story = {
  render: () => {
    const [urgent, setUrgent] = useState(false);
    const [endTime] = useState(() => new Date(Date.now() + 90000));
    return (
      <div
        style={{
          padding: '1.5rem',
          border: `2px solid ${urgent ? '#da1e28' : '#e0e0e0'}`,
          borderRadius: '4px',
          maxWidth: '320px',
          transition: 'border-color 0.3s',
        }}
      >
        <TimeDisplay>
          <TimeDisplay.Label>Session expires in</TimeDisplay.Label>
          <TimeDisplay.Value
            mode="count-down"
            endTime={endTime}
            format="stacked"
            announcementMode="threshold"
            thresholds={[
              { value: 60, label: 'Less than 1 minute remaining', onReach: () => setUrgent(true) },
            ]}
          />
          <TimeDisplay.HelperText>
            {urgent ? 'Save your work immediately!' : 'Please save your work soon'}
          </TimeDisplay.HelperText>
        </TimeDisplay>
      </div>
    );
  },
};

export const CustomSeparatorDisplay: Story = {
  render: () => (
    <TimeDisplay>
      <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
      <TimeDisplay.Value
        mode="count-up"
        startTime={ELAPSED_START}
        format="flat"
        separator=" — "
      />
    </TimeDisplay>
  ),
};

export const CountdownWithComplete: Story = {
  render: () => {
    const [isComplete, setIsComplete] = useState(false);
    const [endTime] = useState(() => new Date(Date.now() + 8000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          format="stacked"
          units={['minutes', 'seconds']}
          onComplete={() => setIsComplete(true)}
        />
        {isComplete && (
          <TimeDisplay.CompleteMessage>All done — job complete</TimeDisplay.CompleteMessage>
        )}
      </TimeDisplay>
    );
  },
};

export const HelperTextLive: Story = {
  render: () => {
    const [isDone, setIsDone] = useState(false);
    const [endTime] = useState(() => new Date(Date.now() + 6000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          format="flat"
          onComplete={() => setIsDone(true)}
        />
        <TimeDisplay.HelperText>
          {isDone ? 'Process completed successfully' : 'Processing…'}
        </TimeDisplay.HelperText>
      </TimeDisplay>
    );
  },
};

export const CustomContentSlot: Story = {
  render: () => {
    const [progress, setProgress] = useState(100);
    const [endTime] = useState(() => new Date(Date.now() + 30000));
    return (
      <TimeDisplay>
        <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
        <TimeDisplay.Value
          mode="count-down"
          endTime={endTime}
          format="stacked"
          units={['seconds']}
          onComplete={() => setProgress(0)}
          thresholds={[
            { value: 20, label: '20s', onReach: () => setProgress(66) },
            { value: 10, label: '10s', onReach: () => setProgress(33) },
          ]}
        />
        <div style={{ marginBlockStart: '0.75rem', height: '4px', background: '#e0e0e0', borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#0f62fe', borderRadius: '2px', transition: 'width 0.5s' }} />
        </div>
        <TimeDisplay.HelperText>Draining job queue…</TimeDisplay.HelperText>
      </TimeDisplay>
    );
  },
};

// ─── Day rollover demos ────────────────────────────────────────────────────────

export const DayRolloverCountUp: Story = {
  render: () => {
    const [startTime] = useState(
      () => new Date(Date.now() - (86400 - 7) * 1000)
    );
    return (
      <div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginBlockEnd: '0.75rem', color: '#525252' }}>
          Count-up rollover — watch <strong>00d 23h 59m 53s → 01d 00h 00m 00s</strong> in ~7 seconds.
          All units wrap upward simultaneously.
        </p>
        <TimeDisplay>
          <TimeDisplay.Label>Elapsed time</TimeDisplay.Label>
          <TimeDisplay.Value
            mode="count-up"
            startTime={startTime}
            format="stacked"
            units={['days', 'hours', 'minutes', 'seconds']}
          />
          <TimeDisplay.HelperText>Digits roll up — including 59 → 00 wraps</TimeDisplay.HelperText>
        </TimeDisplay>
      </div>
    );
  },
};

export const DayRolloverCountDown: Story = {
  render: () => {
    const [endTime] = useState(
      () => new Date(Date.now() + (86400 + 7) * 1000)
    );
    return (
      <div>
        <p style={{ fontFamily: 'sans-serif', fontSize: '0.875rem', marginBlockEnd: '0.75rem', color: '#525252' }}>
          Count-down rollover — watch <strong>01d 00h 00m 07s → 00d 23h 59m 59s</strong> in ~7 seconds.
          All units wrap downward simultaneously.
        </p>
        <TimeDisplay>
          <TimeDisplay.Label>Time remaining</TimeDisplay.Label>
          <TimeDisplay.Value
            mode="count-down"
            endTime={endTime}
            format="stacked"
            units={['days', 'hours', 'minutes', 'seconds']}
          />
          <TimeDisplay.HelperText>Digits roll down — including 00 → 59 wraps</TimeDisplay.HelperText>
        </TimeDisplay>
      </div>
    );
  },
};
