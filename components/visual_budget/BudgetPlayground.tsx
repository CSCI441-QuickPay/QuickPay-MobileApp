import { Animated, View, Dimensions, PanResponder } from 'react-native';
import { useRef, useState } from 'react';
import ConnectionLines from '@/components/visual_budget/ConnectionLines';
import BudgetBlock from '@/components/visual_budget/BudgetBlock';
import FocusButtons from '@/components/visual_budget/controls/FocusButtons';
import ZoomControls from '@/components/visual_budget/controls/ZoomControls';
import { calculateCenterPosition, shouldShowInFocusMode } from '@/utils/budgetUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BudgetPlayground({
  categories,
  setCategories,
  setModalState,
  setSelectedCategory,
  setParentForNewCategory,
}: any) {
  const [scale, setScale] = useState(0.5);
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null);
  const [showAllDescendants, setShowAllDescendants] = useState(false);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const canvasPan = useRef(new Animated.ValueXY(calculateCenterPosition(SCREEN_WIDTH))).current;

  // ✅ Fix: reusable no-op handlers
  const handlePressIn = () => {};
  const handlePressOut = () => {};

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));

  const resetFocus = () => {
    setFocusedCategoryId(null);
    setShowAllDescendants(false);
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
        <ConnectionLines
          categories={categories}
          focusedCategoryId={focusedCategoryId}
          getBlockPosition={(id: string) => {
            const c = categories.find((x: any) => x.id === id);
            return c ? c.position : { x: 0, y: 0 };
          }}
          onLinePress={setFocusedCategoryId}
        />

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
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => {
              setSelectedCategory(cat);
              setModalState((prev: any) => ({ ...prev, transaction: true }));
            }}
            onAddChild={() => {
              setParentForNewCategory(cat.id);
              setModalState((prev: any) => ({ ...prev, add: true }));
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