import { Stack, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScoreInputPanel } from '@/components/ScoreInputPanel';
import { ScoreTable } from '@/components/ScoreTable';
import { SessionPlayersModal } from '@/components/SessionPlayersModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/store/AppContext';
import type { CellScore } from '@/store/types';

export default function ScoringScreen() {
  const { activeSession, activeGame, activePlayers, dispatch } = useAppContext();
  const [inputTarget, setInputTarget] = useState<{ pi: number; ri: number } | null>(null);
  const [showPlayers, setShowPlayers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const handleEndGame = () => {
    Alert.alert(
      'End Game',
      'End the current scoring session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'END_SESSION' });
            router.back();
          },
        },
      ],
    );
  };

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
      <Stack.Screen
        options={{
          title: activeGame.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => setShowPlayers(true)} hitSlop={8}>
                <ThemedText type="small" style={styles.headerBtnPlayers}>Players</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEndGame} hitSlop={8}>
                <ThemedText type="small" style={styles.headerBtnEnd}>End</ThemedText>
              </TouchableOpacity>
            </View>
          ),
        }}
      />

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

      <SessionPlayersModal
        visible={showPlayers}
        onClose={() => setShowPlayers(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerButtons: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  headerBtnPlayers: { color: '#3c87f7', fontWeight: '600' },
  headerBtnEnd: { color: '#e05252', fontWeight: '600' },
});
