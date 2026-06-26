import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppContext } from '@/store/AppContext';
import type { Player } from '@/store/types';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SessionPlayersModal({ visible, onClose }: Props) {
  const { state, dispatch, activeSession } = useAppContext();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newName, setNewName] = useState('');

  if (!activeSession) return null;

  const sessionPlayerSet = new Set(activeSession.playerIds);
  const sessionPlayers: Player[] = activeSession.playerIds
    .map(id => state.players.find(p => p.id === id)!)
    .filter(Boolean);
  const otherPlayers = state.players.filter(p => !sessionPlayerSet.has(p.id));

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditingName(player.name);
  };

  const confirmEdit = () => {
    if (editingId && editingName.trim()) {
      dispatch({ type: 'EDIT_PLAYER', playerId: editingId, name: editingName.trim() });
    }
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleAddExisting = (playerId: string) => {
    dispatch({ type: 'ADD_PLAYER_TO_SESSION', playerId });
  };

  const handleAddNew = () => {
    if (!newName.trim()) return;
    dispatch({ type: 'ADD_NEW_PLAYER_TO_SESSION', name: newName.trim() });
    setNewName('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <ThemedView type="backgroundElement" style={styles.panel}>
          <SafeAreaView edges={['bottom']}>
            <ThemedText type="subtitle" style={styles.title}>
              Manage Players
            </ThemedText>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
                IN THIS GAME
              </ThemedText>
              {sessionPlayers.map(player => (
                <View
                  key={player.id}
                  style={[styles.row, { borderBottomColor: theme.backgroundSelected }]}>
                  {editingId === player.id ? (
                    <>
                      <TextInput
                        style={[styles.inlineInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={confirmEdit}
                      />
                      <TouchableOpacity onPress={confirmEdit} style={styles.iconBtn}>
                        <ThemedText type="small" style={styles.confirmIcon}>✓</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={cancelEdit} style={styles.iconBtn}>
                        <ThemedText type="small" style={styles.cancelIcon}>✕</ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <ThemedText type="default" style={styles.playerName}>
                        {player.name}
                      </ThemedText>
                      <TouchableOpacity onPress={() => startEdit(player)} style={styles.iconBtn} hitSlop={8}>
                        <ThemedText type="small" style={styles.editIcon}>✏</ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))}

              {otherPlayers.length > 0 && (
                <>
                  <ThemedText type="small" themeColor="textSecondary" style={[styles.sectionLabel, styles.sectionLabelGap]}>
                    ADD FROM EXISTING
                  </ThemedText>
                  {otherPlayers.map(player => (
                    <View
                      key={player.id}
                      style={[styles.row, { borderBottomColor: theme.backgroundSelected }]}>
                      <ThemedText type="default" style={styles.playerName}>
                        {player.name}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={() => handleAddExisting(player.id)}
                        style={styles.iconBtn}
                        hitSlop={8}>
                        <ThemedText type="small" style={styles.addIcon}>+</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              <ThemedText type="small" themeColor="textSecondary" style={[styles.sectionLabel, styles.sectionLabelGap]}>
                ADD NEW PLAYER
              </ThemedText>
              <View style={styles.newPlayerRow}>
                <TextInput
                  style={[styles.newInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Player name"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                  onSubmitEditing={handleAddNew}
                />
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: newName.trim() ? '#3c87f7' : theme.backgroundSelected }]}
                  onPress={handleAddNew}
                  disabled={!newName.trim()}>
                  <ThemedText type="default" style={newName.trim() ? styles.addBtnText : undefined}>
                    Add
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.backgroundSelected }]}
              onPress={onClose}>
              <ThemedText type="default">Done</ThemedText>
            </TouchableOpacity>
          </SafeAreaView>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  avoidingView: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '80%',
  },
  title: { marginBottom: Spacing.three },
  scroll: { flexGrow: 0 },
  sectionLabel: { letterSpacing: 0.8, marginBottom: Spacing.one },
  sectionLabelGap: { marginTop: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerName: { flex: 1, fontWeight: '600' },
  iconBtn: { padding: 4 },
  editIcon: { color: '#3c87f7' },
  addIcon: { color: '#3c87f7', fontSize: 20, fontWeight: '600' },
  confirmIcon: { color: '#3c87f7', fontWeight: '700' },
  cancelIcon: { color: '#e05252' },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: 16,
    marginRight: Spacing.one,
  },
  newPlayerRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  newInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    fontSize: 16,
  },
  addBtn: { paddingHorizontal: Spacing.three, borderRadius: 12, justifyContent: 'center' },
  addBtnText: { color: 'white', fontWeight: '600' },
  doneBtn: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
  },
});
