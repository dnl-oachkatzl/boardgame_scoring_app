import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddPlayerModal({ visible, onClose, onAdd }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');

  const canAdd = name.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <ThemedView type="backgroundElement" style={styles.panel}>
          <ThemedText type="subtitle" style={styles.title}>
            Add Player
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary">
            Name
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            value={name}
            onChangeText={setName}
            placeholder="Player name"
            placeholderTextColor={theme.textSecondary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.backgroundSelected }]}
              onPress={onClose}>
              <ThemedText type="default">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: canAdd ? '#3c87f7' : theme.backgroundSelected }]}
              onPress={handleAdd}
              disabled={!canAdd}>
              <ThemedText type="default" style={canAdd ? styles.activeText : undefined}>
                Add
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  avoidingView: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: { marginBottom: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  buttons: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  btn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  activeText: { color: 'white', fontWeight: '600' },
});
