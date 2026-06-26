import { useEffect, useState } from 'react';
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
  onSave: (name: string) => void;
  initialName?: string;
}

export function AddPlayerModal({ visible, onClose, onSave, initialName }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');

  useEffect(() => {
    if (visible) setName(initialName ?? '');
  }, [visible]);

  const isEditing = initialName !== undefined;
  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <ThemedView type="backgroundElement" style={styles.panel}>
          <ThemedText type="subtitle" style={styles.title}>
            {isEditing ? 'Edit Player' : 'Add Player'}
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
            onSubmitEditing={handleSave}
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.backgroundSelected }]}
              onPress={onClose}>
              <ThemedText type="default">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: canSave ? '#3c87f7' : theme.backgroundSelected }]}
              onPress={handleSave}
              disabled={!canSave}>
              <ThemedText type="default" style={canSave ? styles.activeText : undefined}>
                {isEditing ? 'Save' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>
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
