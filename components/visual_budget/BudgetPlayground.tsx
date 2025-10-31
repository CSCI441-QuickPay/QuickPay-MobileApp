import { Animated, View, Dimensions, PanResponder } from 'react-native';
import { useRef, useState } from 'react';
import ConnectionLines from '@/components/visual_budget/ConnectionLines';
import BudgetBlock from '@/components/visual_budget/BudgetBlock';
import FocusButtons from '@/components/visual_budget/controls/FocusButtons';
import ZoomControls from '@/components/visual_budget/controls/ZoomControls';
import { calculateCenterPosition } from '@/utils/budgetUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * BudgetPlayground.tsx
 * Fixed: ensures siblings are spaced evenly horizontally and banks connect properly.
 */
export default function BudgetPlayground({
  categories,
  setCategories,
  setModalState,
  setSelectedCategory,
  setParentForNewCategory,
}: any) {
  const [scale, setScale] = useState(0.5);
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);

  const canvasPan = useRef(new Animated.ValueXY(calculateCenterPosition(SCREEN_WIDTH))).current;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));

  const resetFocus = () => {
    setFocusedCategoryId(null);
    Animated.spring(canvasPan, {
      toValue: calculateCenterPosition(SCREEN_WIDTH),
      useNativeDriver: false,
    }).start();
  };

  const canvasPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isDraggingBlock,
      onMoveShouldSetPanResponder: () => !isDraggingBlock,
      onPanResponderMove: Animated.event([null, { dx: canvasPan.x, dy: canvasPan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderGrant: () => {
        canvasPan.setOffset({
          x: (canvasPan.x as any)._value,
          y: (canvasPan.y as any)._value,
        });
        canvasPan.setValue({ x: 0, y: 0 });
      },
      onPanResponderRelease: () => canvasPan.flattenOffset(),
    })
  ).current;

  /**
   * Compute a non-overlapping position for a new child.
   * Distributes siblings evenly around the parent horizontally.
   */
  const getNewChildPosition = (parentId: string) => {
    const parent = categories.find((c: any) => c.id === parentId);
    if (!parent) return { x: 0, y: 0 };

    const siblings = categories.filter((c: any) => c.parentId === parentId);
    const siblingCount = siblings.length;

    const baseX = parent.position.x;
    const baseY = parent.position.y + 160; // vertical gap
    const horizontalGap = 200; // spacing between siblings

    // --- distribute siblings symmetrically ---
    // Example: if 2 siblings → [-1, +1], if 3 → [-1, 0, +1], etc.
    const newIndex = siblingCount; // index for this new child
    const total = siblingCount + 1;
    const offsetFromCenter = newIndex - (total - 1) / 2;
    const newX = baseX + offsetFromCenter * horizontalGap;

    return { x: newX, y: baseY };
  };

  return (
    <View className="flex-1 bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden">
      <FocusButtons
        onReset={resetFocus}
        onAdd={() => {
          setParentForNewCategory('total');
          setModalState((prev: any) => ({ ...prev, add: true }));
        }}
      />

      <Animated.View
        {...canvasPanResponder.panHandlers}
        style={{
          flex: 1,
          transform: [
            { translateX: canvasPan.x },
            { translateY: canvasPan.y },
            { scale },
          ],
        }}
      >
        {/* Lines between nodes */}
        <ConnectionLines
          categories={categories}
          focusedCategoryId={focusedCategoryId}
          getBlockPosition={(id: string) => {
            const c = categories.find((x: any) => x.id === id);
            return c ? c.position : { x: 0, y: 0 };
          }}
          onLinePress={setFocusedCategoryId}
        />

        {/* All budget blocks */}
        {categories.map((cat: any) => (
          <BudgetBlock
            key={cat.id}
            category={cat}
            categories={categories}
            isShaking={false}
            isFocused={focusedCategoryId === cat.id}
            shakeTransform="0deg"
            blockPosition={new Animated.ValueXY(cat.position)}
            panHandlers={{}}
            onPress={() => {
              setSelectedCategory(cat);
              setModalState((prev: any) => ({ ...prev, transaction: true }));
            }}
            onAddChild={() => {
              const newPosition = getNewChildPosition(cat.id);
              setParentForNewCategory(cat.id);
              setModalState((prev: any) => ({
                ...prev,
                add: true,
                newPosition, // Pass computed new position
              }));
            }}
            onDelete={() => {
              setSelectedCategory(cat);
              setModalState((prev: any) => ({ ...prev, transaction: true }));
            }}
          />
        ))}
      </Animated.View>

      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </View>
  );
}
