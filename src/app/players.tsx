import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddPlayerModal } from '@/components/AddPlayerModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppContext } from '@/store/AppContext';
import type { Player } from '@/store/types';

export default function PlayerSelectionScreen() {
  const { state, dispatch } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const router = useRouter();
  const theme = useTheme();

  const selectedGame = state.games.find(g => g.id === state.setupGameId);

  const returningIds = new Set(
    state.sessions
      .filter(s => s.gameId === state.setupGameId)
      .flatMap(s => s.playerIds),
  );

  const returning = state.players.filter(p => returningIds.has(p.id));
  const others = state.players.filter(p => !returningIds.has(p.id));
  const allPlayers = [...returning, ...others];

  const togglePlayer = (playerId: string) => {
    const current = state.setupPlayerIds;
    const next = current.includes(playerId)
      ? current.filter(id => id !== playerId)
      : [...current, playerId];
    dispatch({ type: 'SET_SETUP_PLAYERS', playerIds: next });
  };

  const handleStart = () => {
    if (state.setupPlayerIds.length === 0) return;
    dispatch({ type: 'START_SESSION' });
    router.push('/scoring');
  };

  const handleDeletePlayer = (player: Player) => {
    Alert.alert(
      'Delete Player',
      `Delete "${player.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_PLAYER', playerId: player.id }),
        },
      ],
    );
  };

  const canStart = state.setupPlayerIds.length > 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: selectedGame ? `${selectedGame.name} – Players` : 'Select Players' }} />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={allPlayers}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No players yet. Add one below.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const selected = state.setupPlayerIds.includes(item.id);
            const isReturning = returningIds.has(item.id);
            return (
              <Pressable
                onPress={() => togglePlayer(item.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                  },
                ]}>
                <View style={styles.playerInfo}>
                  <ThemedText type="default" style={styles.playerName}>
                    {item.name}
                  </ThemedText>
                  {isReturning && (
                    <ThemedText type="small" themeColor="textSecondary">
                      played before
                    </ThemedText>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => setEditingPlayer(item)}
                    style={styles.actionBtn}
                    hitSlop={8}>
                    <ThemedText type="small" style={styles.actionEdit}>✏</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeletePlayer(item)}
                    style={styles.actionBtn}
                    hitSlop={8}>
                    <ThemedText type="small" style={styles.actionDelete}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
                {selected && (
                  <ThemedText type="default" style={styles.check}>
                    ✓
                  </ThemedText>
                )}
              </Pressable>
            );
          }}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setShowAdd(true)}>
            <ThemedText type="default">+ Add Player</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: canStart ? '#3c87f7' : theme.backgroundElement }]}
            onPress={handleStart}
            disabled={!canStart}>
            <ThemedText type="default" style={canStart ? styles.activeText : undefined}>
              Start ({state.setupPlayerIds.length})
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <AddPlayerModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={name => {
          dispatch({ type: 'ADD_PLAYER', player: { name } });
          setShowAdd(false);
        }}
      />

      <AddPlayerModal
        visible={editingPlayer !== null}
        onClose={() => setEditingPlayer(null)}
        initialName={editingPlayer?.name}
        onSave={name => {
          if (!editingPlayer) return;
          dispatch({ type: 'EDIT_PLAYER', playerId: editingPlayer.id, name });
          setEditingPlayer(null);
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
  card: {
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: { gap: 2, flex: 1 },
  playerName: { fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: { padding: 4 },
  actionEdit: { color: '#3c87f7' },
  actionDelete: { color: '#e05252' },
  check: { color: '#3c87f7', fontWeight: '700', marginLeft: Spacing.two },
  footer: { flexDirection: 'row', padding: Spacing.three, gap: Spacing.two },
  btn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  activeText: { color: 'white', fontWeight: '600' },
});
