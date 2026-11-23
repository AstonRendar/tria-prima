import { render, screen } from '@testing-library/react-native';
import { buildInitialObjectiveSlots, ObjectiveSlot } from '@/domain/Objective';
import { LockZone, ObjectiveRail } from '@/ui/components/ObjectiveRail';

const slots: ObjectiveSlot[] = buildInitialObjectiveSlots().map((slot, i) => ({
  ...slot,
  blockedBy: i === 0 ? 'p1' : i === 3 ? 'p2' : null,
}));
const [mine, , , theirs] = slots;

describe('ObjectiveRail', () => {
  it('leaves an empty gap where a declared objective was', async () => {
    await render(
      <ObjectiveRail
        slots={slots}
        ownerOf={(s) => (s.blockedBy === null ? 'free' : s.blockedBy === 'p1' ? 'mine' : 'rival')}
      />
    );
    expect(screen.getByTestId(`objective-card/${mine.objective.id}`).children).toHaveLength(0);
    expect(screen.getByTestId(`objective-card/${theirs.objective.id}`).children).toHaveLength(0);
    expect(screen.getByTestId(`objective-card/${slots[1].objective.id}`).children).toHaveLength(1);
  });

  it('adds no extra marks to the cards', async () => {
    await render(<ObjectiveRail slots={slots} ownerOf={() => 'mine'} />);
    expect(screen.queryByText('★')).toBeNull();
    expect(screen.queryByText('⊘')).toBeNull();
  });
});

describe('LockZone', () => {
  it('shows the cards a player has declared under its label', async () => {
    await render(<LockZone slots={[mine]} label="Tu zona de bloqueo" testID="lock-zone/mine" />);
    expect(screen.getByText('Tu zona de bloqueo')).toBeTruthy();
    expect(screen.getByTestId(`lock-zone/mine/${mine.objective.id}`)).toBeTruthy();
  });

  it('stays in place while it is empty', async () => {
    await render(<LockZone slots={[]} label="Zona de bloqueo del maestro" testID="lock-zone/rival" />);
    expect(screen.getByTestId('lock-zone/rival')).toBeTruthy();
    expect(screen.queryByTestId(/lock-zone\/rival\//)).toBeNull();
  });
});
