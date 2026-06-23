import { useCallback, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CellScore, Game, Player, Session } from '@/store/types';

import { ThemedText } from './themed-text';

const ROW_HEIGHT = 48;
const NAME_WIDTH = 120;
const ROUND_WIDTH = 64;
const TOTAL_WIDTH = 72;
const MAX_WIDTH = 72;

interface Props {
  session: Session;
  players: Player[];
  game: Game;
  onCellPress: (playerIndex: number, roundIndex: number) => void;
  onAddRound: () => void;
}

export function ScoreTable({ session, players, game, onCellPress, onAddRound }: Props) {
  const theme = useTheme();
  const headerScrollRef = useRef<ScrollView>(null);
  const rowScrollRefs = useRef<(ScrollView | null)[]>([]);
  const isSyncing = useRef(false);

  const syncScroll = useCallback((x: number, sourceIndex: 'header' | number) => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    if (sourceIndex !== 'header') {
      headerScrollRef.current?.scrollTo({ x, animated: false });
    }
    rowScrollRefs.current.forEach((ref, i) => {
      if (i !== sourceIndex) {
        ref?.scrollTo({ x, animated: false });
      }
    });

    setTimeout(() => {
      isSyncing.current = false;
    }, 0);
  }, []);

  const playerTotal = (playerIndex: number) =>
    (session.scores[playerIndex] ?? []).reduce(
      (sum, cell) => sum + (cell?.value ?? 0),
      0,
    );

  const borderColor = theme.backgroundSelected;

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={[styles.row, { borderBottomColor: borderColor, borderBottomWidth: 1 }]}>
        <View
          style={[
            styles.nameCell,
            styles.headerCell,
            { height: ROW_HEIGHT, backgroundColor: theme.backgroundElement },
          ]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Player
          </ThemedText>
        </View>

        <ScrollView
          ref={headerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollArea}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
            syncScroll(e.nativeEvent.contentOffset.x, 'header')
          }>
          <View style={styles.rowInner}>
            {Array.from({ length: session.roundCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.roundCell,
                  styles.headerCell,
                  { height: ROW_HEIGHT, backgroundColor: theme.backgroundElement, borderLeftColor: borderColor },
                ]}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  R{i + 1}
                </ThemedText>
              </View>
            ))}
            <Pressable
              style={[
                styles.addRoundBtn,
                { height: ROW_HEIGHT, backgroundColor: theme.backgroundElement, borderLeftColor: borderColor },
              ]}
              onPress={onAddRound}>
              <ThemedText type="smallBold" style={styles.addRoundText}>
                +
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>

        <View
          style={[
            styles.totalCell,
            styles.headerCell,
            { height: ROW_HEIGHT, backgroundColor: theme.backgroundElement, borderLeftColor: borderColor },
          ]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Total
          </ThemedText>
        </View>

        <View
          style={[
            styles.maxCell,
            styles.headerCell,
            { height: ROW_HEIGHT, backgroundColor: theme.backgroundElement, borderLeftColor: borderColor },
          ]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Max
          </ThemedText>
        </View>
      </View>

      {/* Player rows */}
      <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
        {players.map((player, pi) => {
          const total = playerTotal(pi);
          return (
            <View
              key={player.id}
              style={[
                styles.row,
                { height: ROW_HEIGHT, borderBottomColor: borderColor, borderBottomWidth: 1 },
              ]}>
              <View style={[styles.nameCell, styles.dataCell]}>
                <ThemedText type="small" numberOfLines={1} style={styles.playerName}>
                  {player.name}
                </ThemedText>
              </View>

              <ScrollView
                ref={ref => {
                  rowScrollRefs.current[pi] = ref;
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                style={styles.scrollArea}
                onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
                  syncScroll(e.nativeEvent.contentOffset.x, pi)
                }>
                <View style={styles.rowInner}>
                  {Array.from({ length: session.roundCount }).map((_, ri) => {
                    const cell: CellScore | null = session.scores[pi]?.[ri] ?? null;
                    return (
                      <Pressable
                        key={ri}
                        style={[
                          styles.roundCell,
                          styles.dataCell,
                          { borderLeftColor: borderColor },
                          cell?.isSpecial && styles.specialCell,
                        ]}
                        onPress={() => onCellPress(pi, ri)}>
                        <ThemedText
                          type="small"
                          style={cell?.isSpecial ? styles.specialText : undefined}>
                          {cell !== null ? String(cell.value) : ''}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                  {/* Spacer matching the "+" add-round button width */}
                  <View style={{ width: 44 }} />
                </View>
              </ScrollView>

              <View
                style={[
                  styles.totalCell,
                  styles.dataCell,
                  { borderLeftColor: borderColor },
                ]}>
                <ThemedText type="smallBold">{total}</ThemedText>
              </View>

              <View
                style={[
                  styles.maxCell,
                  styles.dataCell,
                  { borderLeftColor: borderColor },
                ]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {game.maxScore}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowInner: { flexDirection: 'row', alignItems: 'center' },
  scrollArea: { flex: 1 },
  playerList: { flex: 1 },
  headerCell: { alignItems: 'center', justifyContent: 'center' },
  dataCell: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ROW_HEIGHT,
  },
  nameCell: {
    width: NAME_WIDTH,
    alignItems: 'flex-start',
    paddingLeft: Spacing.three,
  },
  playerName: { fontWeight: '600' },
  roundCell: {
    width: ROUND_WIDTH,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRoundBtn: {
    width: 44,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRoundText: { color: '#3c87f7', fontSize: 20 },
  totalCell: {
    width: TOTAL_WIDTH,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxCell: {
    width: MAX_WIDTH,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialCell: { backgroundColor: 'rgba(245, 166, 35, 0.2)' },
  specialText: { color: '#f5a623', fontWeight: '700' },
});
