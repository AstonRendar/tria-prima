import { APP_PLAYER_NAME, startVersusMatch } from '@/application/StartVersus';
import { plainText } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startVersusMatch(
    { random: new StubRandom([0]), wordRepository: new StubWordRepository('PUERTA') },
    { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' }
  );
}

describe('startVersusMatch', () => {
  it('sets the human as p1 with their own word', () => {
    const state = buildState();
    expect(state.players.p1.name).toBe('Alice');
    expect(plainText(state.players.p1.secretWord)).toBe('CAMINO');
  });

  it('sets the app as p2 with a word from the repository', () => {
    const state = buildState();
    expect(state.players.p2.name).toBe(APP_PLAYER_NAME);
    expect(plainText(state.players.p2.secretWord)).toBe('PUERTA');
  });

  it('starts an unfinished match on turn 0', () => {
    const state = buildState();
    expect(state.turn).toBe(0);
    expect(state.finished).toBe(false);
    expect(state.canDeclareThisTurn).toBe(false);
  });
});
