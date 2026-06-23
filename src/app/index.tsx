import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddGameModal } from '@/components/AddGameModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppContext } from '@/store/AppContext';

export default function GameSelectionScreen() {
  const { state, dispatch } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleSelect = (gameId: string) => {
    dispatch({ type: 'SELECT_GAME', gameId });
  };

  const handleNext = () => {
    if (state.setupGameId) router.push('/players');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={state.games}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.list}
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
              <ThemedText type="default" style={styles.gameName}>
                {item.name}
              </ThemedText>
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
        onAdd={(name, maxScore, scoreRange) => {
          dispatch({ type: 'ADD_GAME', game: { name, maxScore, scoreRange } });
          setShowAdd(false);
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
  card: { padding: Spacing.three, borderRadius: 12, gap: Spacing.one },
  gameName: { fontWeight: '600' },
  footer: { flexDirection: 'row', padding: Spacing.three, gap: Spacing.two },
  btn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  activeText: { color: 'white', fontWeight: '600' },
});
