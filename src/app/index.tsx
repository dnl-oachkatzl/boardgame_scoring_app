import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddGameModal } from '@/components/AddGameModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppContext } from '@/store/AppContext';
import type { Game } from '@/store/types';

export default function GameSelectionScreen() {
  const { state, dispatch } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  const activeGameName = activeSession
    ? state.games.find(g => g.id === activeSession.gameId)?.name
    : null;

  const handleSelect = (gameId: string) => {
    dispatch({ type: 'SELECT_GAME', gameId });
  };

  const handleNext = () => {
    if (!state.setupGameId) return;
    if (state.activeSessionId) {
      Alert.alert(
        'End Current Game?',
        `"${activeGameName}" is still in progress. End it and start a new game?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End & Continue',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'END_SESSION' });
              router.push('/players');
            },
          },
        ],
      );
    } else {
      router.push('/players');
    }
  };

  const handleDeleteGame = (game: Game) => {
    Alert.alert(
      'Delete Game',
      `Delete "${game.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_GAME', gameId: game.id }),
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={state.games}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            activeGameName ? (
              <TouchableOpacity
                style={styles.resumeBanner}
                onPress={() => router.push('/scoring')}>
                <ThemedText type="default" style={styles.resumeText}>
                  ▶  Resume "{activeGameName}"
                </ThemedText>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No games yet. Add one below.
            </ThemedText>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleSelect(item.id)}
              style={[
                styles.card,
                {
                  backgroundColor:
                    state.setupGameId === item.id
                      ? theme.backgroundSelected
                      : theme.backgroundElement,
                },
              ]}>
              <View style={styles.cardHeader}>
                <ThemedText type="default" style={styles.gameName}>
                  {item.name}
                </ThemedText>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => setEditingGame(item)}
                    style={styles.actionBtn}
                    hitSlop={8}>
                    <ThemedText type="small" style={styles.actionEdit}>✏</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteGame(item)}
                    style={styles.actionBtn}
                    hitSlop={8}>
                    <ThemedText type="small" style={styles.actionDelete}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                Range {item.scoreRange.min}–{item.scoreRange.max} · Max {item.maxScore}
              </ThemedText>
            </Pressable>
          )}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setShowAdd(true)}>
            <ThemedText type="default">+ Add Game</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: state.setupGameId ? '#3c87f7' : theme.backgroundElement },
            ]}
            onPress={handleNext}
            disabled={!state.setupGameId}>
            <ThemedText
              type="default"
              style={state.setupGameId ? styles.activeText : undefined}>
              Next →
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <AddGameModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(name, maxScore, scoreRange) => {
          dispatch({ type: 'ADD_GAME', game: { name, maxScore, scoreRange } });
          setShowAdd(false);
        }}
      />

      <AddGameModal
        visible={editingGame !== null}
        onClose={() => setEditingGame(null)}
        initialValues={
          editingGame
            ? { name: editingGame.name, maxScore: editingGame.maxScore, scoreRange: editingGame.scoreRange }
            : undefined
        }
        onSave={(name, maxScore, scoreRange) => {
          if (!editingGame) return;
          dispatch({ type: 'EDIT_GAME', gameId: editingGame.id, changes: { name, maxScore, scoreRange } });
          setEditingGame(null);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  list: { padding: Spacing.three, gap: Spacing.two },
  empty: { textAlign: 'center', marginTop: Spacing.six },
  resumeBanner: {
    backgroundColor: '#3c87f7',
    borderRadius: 12,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    alignItems: 'center',
  },
  resumeText: { color: 'white', fontWeight: '600' },
  card: { padding: Spacing.three, borderRadius: 12, gap: Spacing.one },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gameName: { fontWeight: '600', flex: 1 },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: { padding: 4 },
  actionEdit: { color: '#3c87f7' },
  actionDelete: { color: '#e05252' },
  footer: { flexDirection: 'row', padding: Spacing.three, gap: Spacing.two },
  btn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  activeText: { color: 'white', fontWeight: '600' },
});
