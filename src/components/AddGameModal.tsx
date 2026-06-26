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
  onSave: (name: string, maxScore: number, scoreRange: { min: number; max: number }) => void;
  initialValues?: { name: string; maxScore: number; scoreRange: { min: number; max: number } };
}

export function AddGameModal({ visible, onClose, onSave, initialValues }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [rangeMin, setRangeMin] = useState('0');
  const [rangeMax, setRangeMax] = useState('10');

  useEffect(() => {
    if (visible) {
      setName(initialValues?.name ?? '');
      setMaxScore(initialValues ? String(initialValues.maxScore) : '');
      setRangeMin(initialValues ? String(initialValues.scoreRange.min) : '0');
      setRangeMax(initialValues ? String(initialValues.scoreRange.max) : '10');
    }
  }, [visible]);

  const isEditing = initialValues !== undefined;

  const canSave =
    name.trim().length > 0 &&
    maxScore.trim().length > 0 &&
    !isNaN(Number(maxScore)) &&
    !isNaN(Number(rangeMin)) &&
    !isNaN(Number(rangeMax));

  const handleSave = () => {
    if (!canSave) return;
    onSave(name.trim(), Number(maxScore), { min: Number(rangeMin), max: Number(rangeMax) });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <ThemedView type="backgroundElement" style={styles.panel}>
          <ThemedText type="subtitle" style={styles.title}>
            {isEditing ? 'Edit Game' : 'Add Game'}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary">
            Name
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Catan"
            placeholderTextColor={theme.textSecondary}
            autoFocus
            returnKeyType="next"
          />

          <ThemedText type="small" themeColor="textSecondary">
            Maximum total score
          </ThemedText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            value={maxScore}
            onChangeText={setMaxScore}
            placeholder="e.g. 100"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            returnKeyType="next"
          />

          <ThemedText type="small" themeColor="textSecondary">
            Score range per round (min – max)
          </ThemedText>
          <View style={styles.rangeRow}>
            <TextInput
              style={[
                styles.input,
                styles.rangeInput,
                { color: theme.text, borderColor: theme.backgroundSelected },
              ]}
              value={rangeMin}
              onChangeText={setRangeMin}
              placeholder="min"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              returnKeyType="next"
            />
            <ThemedText type="small" themeColor="textSecondary">
              {' '}–{' '}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                styles.rangeInput,
                { color: theme.text, borderColor: theme.backgroundSelected },
              ]}
              value={rangeMax}
              onChangeText={setRangeMax}
              placeholder="max"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

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
  rangeRow: { flexDirection: 'row', alignItems: 'center' },
  rangeInput: { flex: 1, marginBottom: 0 },
  buttons: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  btn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  activeText: { color: 'white', fontWeight: '600' },
});
