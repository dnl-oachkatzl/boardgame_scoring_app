import { Stack } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScoreInputPanel } from '@/components/ScoreInputPanel';
import { ScoreTable } from '@/components/ScoreTable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/store/AppContext';
import type { CellScore } from '@/store/types';

export default function ScoringScreen() {
  const { activeSession, activeGame, activePlayers, dispatch } = useAppContext();
  const [inputTarget, setInputTarget] = useState<{ pi: number; ri: number } | null>(null);

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  if (!activeSession || !activeGame || activePlayers.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText type="default" themeColor="textSecondary">
          No active game session.
        </ThemedText>
      </ThemedView>
    );
  }

  const handleConfirm = (score: CellScore) => {
    if (!inputTarget) return;
    dispatch({ type: 'SET_SCORE', playerIndex: inputTarget.pi, roundIndex: inputTarget.ri, score });
    setInputTarget(null);
  };

  const currentCell = inputTarget
    ? (activeSession.scores[inputTarget.pi]?.[inputTarget.ri] ?? null)
    : null;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: activeGame.name }} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScoreTable
          session={activeSession}
          players={activePlayers}
          game={activeGame}
          onCellPress={(pi, ri) => setInputTarget({ pi, ri })}
          onAddRound={() => dispatch({ type: 'ADD_ROUND' })}
        />
      </SafeAreaView>

      <ScoreInputPanel
        visible={inputTarget !== null}
        onClose={() => setInputTarget(null)}
        onConfirm={handleConfirm}
        initialScore={currentCell}
        playerName={inputTarget ? (activePlayers[inputTarget.pi]?.name ?? '') : ''}
        round={inputTarget ? inputTarget.ri + 1 : 1}
        scoreRange={activeGame.scoreRange}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
