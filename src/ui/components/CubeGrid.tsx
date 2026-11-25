import { StyleSheet, View } from 'react-native';
import { Board } from '@/domain/Board';
import { GRID_SIZE, Position } from '@/domain/Position';
import { CubeView } from '@/ui/components/CubeView';
import { CubeAnimation } from '@/ui/hooks/useTurnController';
import { TourTarget } from '@/ui/tutorial/TourTargets';

// El dado central es el que el tour usa para explicar las caras.
const TOUR_CUBE: Position = 4;

const ROWS: ReadonlyArray<ReadonlyArray<Position>> = Array.from({ length: GRID_SIZE }, (_, r) =>
  Array.from({ length: GRID_SIZE }, (_, c) => r * GRID_SIZE + c)
);

type Props = {
  board: Board;
  selected: ReadonlyArray<Position>;
  touched: ReadonlySet<Position>;
  animation: CubeAnimation | null;
  // Sin onPress (turno del maestro) los dados no responden.
  onPress?: (position: Position) => void;
};

export function CubeGrid({ board, selected, touched, animation, onPress }: Props) {
  return (
    <View style={styles.grid}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((i) => {
            const cube = (
              <CubeView
                key={i}
                cube={board.cubes[i]}
                selected={selected.includes(i)}
                locked={board.lockedThisTurn.includes(i)}
                touched={touched.has(i)}
                animationKind={animation?.positions.has(i) ? animation.kind : null}
                onPress={onPress ? () => onPress(i) : undefined}
                testID={`cube/${i}`}
              />
            );
            return i === TOUR_CUBE ? (
              <TourTarget key={i} id="cube">
                {cube}
              </TourTarget>
            ) : (
              cube
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
