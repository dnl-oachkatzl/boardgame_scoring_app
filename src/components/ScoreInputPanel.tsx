import Slider from '@react-native-community/slider';
import { useEffect, useMemo, useState } from 'react';
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
import type { CellScore } from '@/store/types';
import { evaluateExpression } from '@/utils/expression';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (score: CellScore) => void;
  initialScore: CellScore | null;
  playerName: string;
  round: number;
  scoreRange: { min: number; max: number };
}

export function ScoreInputPanel({
  visible,
  onClose,
  onConfirm,
  initialScore,
  playerName,
  round,
  scoreRange,
}: Props) {
  const theme = useTheme();
  const [expression, setExpression] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [isNegative, setIsNegative] = useState(false);
  const [isSpecial, setIsSpecial] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initialScore) {
      const abs = Math.abs(initialScore.value);
      setExpression(initialScore.expression ?? String(abs));
      setIsNegative(initialScore.value < 0);
      setSliderValue(initialScore.value);
      setIsSpecial(initialScore.isSpecial);
    } else {
      const defaultVal = Math.max(scoreRange.min, Math.min(scoreRange.max, 0));
      setExpression('');
      setIsNegative(false);
      setSliderValue(defaultVal);
      setIsSpecial(false);
    }
  }, [visible]);

  const evaluatedMagnitude = useMemo(() => evaluateExpression(expression), [expression]);

  const currentValue = useMemo(() => {
    if (evaluatedMagnitude === null) return sliderValue;
    const magnitude = Math.abs(evaluatedMagnitude);
    return isNegative ? -magnitude : magnitude;
  }, [evaluatedMagnitude, isNegative, sliderValue]);

  const handleExpressionChange = (text: string) => {
    setExpression(text);
    const val = evaluateExpression(text);
    if (val !== null) {
      const sign = isNegative ? -1 : 1;
      const applied = Math.abs(val) * sign;
      const clamped = Math.max(scoreRange.min, Math.min(scoreRange.max, applied));
      setSliderValue(clamped);
    }
  };

  const handleSliderChange = (val: number) => {
    const rounded = Math.round(val);
    setSliderValue(rounded);
    setIsNegative(rounded < 0);
    setExpression(String(Math.abs(rounded)));
  };

  const toggleSign = () => {
    setIsNegative(prev => {
      const next = !prev;
      const magnitude = Math.abs(sliderValue);
      const newVal = next ? -magnitude : magnitude;
      const clamped = Math.max(scoreRange.min, Math.min(scoreRange.max, newVal));
      setSliderValue(clamped);
      return next;
    });
  };

  const handleConfirm = () => {
    const finalValue = Math.max(scoreRange.min, Math.min(scoreRange.max, currentValue));
    onConfirm({
      value: finalValue,
      isSpecial,
      expression: expression || String(finalValue),
    });
    onClose();
  };

  const isValidExpression = expression === '' || evaluatedMagnitude !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <ThemedView type="backgroundElement" style={styles.panel}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.context}>
            {playerName} · Round {round}
          </ThemedText>

          <ThemedText type="subtitle" style={styles.valueDisplay}>
            {currentValue}
          </ThemedText>

          <TextInput
            style={[
              styles.expressionInput,
              {
                color: theme.text,
                borderColor: isValidExpression ? theme.backgroundSelected : '#ff6b6b',
              },
            ]}
            value={expression}
            onChangeText={handleExpressionChange}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="default"
            autoFocus
            selectTextOnFocus
          />

          <Slider
            style={styles.slider}
            minimumValue={scoreRange.min}
            maximumValue={scoreRange.max}
            value={sliderValue}
            onValueChange={handleSliderChange}
            minimumTrackTintColor="#3c87f7"
            maximumTrackTintColor={theme.backgroundSelected}
            thumbTintColor="#3c87f7"
            step={1}
          />
          <View style={styles.sliderLabels}>
            <ThemedText type="small" themeColor="textSecondary">
              {scoreRange.min}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {scoreRange.max}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: isNegative ? '#3c87f7' : theme.backgroundSelected },
              ]}
              onPress={toggleSign}>
              <ThemedText type="default" style={isNegative ? styles.whiteText : undefined}>
                {isNegative ? '−' : '+'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.specialBtn,
                { backgroundColor: isSpecial ? '#f5a623' : theme.backgroundSelected },
              ]}
              onPress={() => setIsSpecial(prev => !prev)}>
              <ThemedText type="default" style={isSpecial ? styles.whiteText : undefined}>
                {isSpecial ? '★ Special' : '☆ Special'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: theme.backgroundSelected }]}
              onPress={onClose}>
              <ThemedText type="default">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: '#3c87f7' }]}
              onPress={handleConfirm}>
              <ThemedText type="default" style={styles.whiteText}>
                Confirm
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
  context: { textAlign: 'center' },
  valueDisplay: { textAlign: 'center' },
  expressionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.two,
    fontSize: 20,
    textAlign: 'center',
  },
  slider: { width: '100%', height: 40 },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.one,
  },
  actions: { flexDirection: 'row', gap: Spacing.two },
  actionBtn: {
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  specialBtn: { flex: 1 },
  footer: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  footerBtn: { flex: 1, padding: Spacing.three, borderRadius: 12, alignItems: 'center' },
  whiteText: { color: 'white', fontWeight: '600' },
});
