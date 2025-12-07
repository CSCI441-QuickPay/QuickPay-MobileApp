/**
 * written by: Team QuickPay
 * tested by: Team QuickPay
 * debugged by: Team QuickPay
 * Notes: Contributions were shared, see GitHub history for commit details.
 * Unit Tests for UserSyncService
 */
import { Animated, View, Dimensions, PanResponder } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import ConnectionLines from '@/components/visual_budget/ConnectionLines';
import BudgetBlock from '@/components/visual_budget/BudgetBlock';
import FocusButtons from '@/components/visual_budget/controls/FocusButtons';
import ZoomControls from '@/components/visual_budget/controls/ZoomControls';
import DeleteBudgetBlockModal from '@/components/visual_budget/BudgetModals/DeleteBudgetBlockModal';
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
  categoryToDelete,
  setCategoryToDelete,
}: any) {
  const [scale, setScale] = useState(0.5);
  const [focusedCategoryId, setFocusedCategoryId] = useState<string | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const canvasPan = useRef(new Animated.ValueXY(calculateCenterPosition(SCREEN_WIDTH, undefined, scale))).current;

  // Recenter canvas when categories are loaded or changed
  // Find the Current Budget block position to trigger recenter when it changes
  const currentBudgetBlock = categories.find((c: any) => c.id === 'total');
  const currentBudgetPosition = currentBudgetBlock?.position;

  useEffect(() => {
    if (categories && categories.length > 0) {
      const centerPosition = calculateCenterPosition(SCREEN_WIDTH, categories, scale);
      canvasPan.setValue(centerPosition);
    }
  }, [categories.length, currentBudgetPosition?.x, currentBudgetPosition?.y, scale]); // Recenter when Current Budget position or scale changes

  // Open delete modal when categoryToDelete is set
  useEffect(() => {
    if (categoryToDelete) {
      setDeleteModalVisible(true);
    } else {
      setDeleteModalVisible(false);
    }
  }, [categoryToDelete]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.3));

  const resetFocus = () => {
    setFocusedCategoryId(null);
    Animated.spring(canvasPan, {
      toValue: calculateCenterPosition(SCREEN_WIDTH, categories, scale),
      useNativeDriver: false,
    }).start();
  };

  // ✅ Calculate positions for ALL children to maintain symmetry
  const repositionAllChildren = (parentId: string, cats: any[]) => {
    const parent = cats.find((c: any) => c.id === parentId);
    if (!parent) return [];

    const siblings = cats.filter((c: any) => c.parentId === parentId);
    const totalChildren = siblings.length;

    const VERTICAL_OFFSET = 200;
    const HORIZONTAL_SPACING = 180;

    const updates = siblings.map((sibling: any, index: number) => {
      const offsetFromCenter = index - (totalChildren - 1) / 2;
      const newX = parent.position.x + offsetFromCenter * HORIZONTAL_SPACING;

      return {
        id: sibling.id,
        position: {
          x: newX,
          y: parent.position.y + VERTICAL_OFFSET
        }
      };
    });

    return updates;
  };

  // ✅ Get all descendants of a category (recursive)
  const getAllDescendants = (categoryId: string, allCategories: any[]): any[] => {
    const category = allCategories.find((c: any) => c.id === categoryId);
    if (!category || !category.children || category.children.length === 0) {
      return [];
    }

    let descendants: any[] = [];
    category.children.forEach((childId: string) => {
      const child = allCategories.find((c: any) => c.id === childId);
      if (child) {
        descendants.push(child);
        descendants = descendants.concat(getAllDescendants(childId, allCategories));
      }
    });

    return descendants;
  };

  // ✅ Calculate total remaining balance for a category and all its descendants
  const calculateTotalRemaining = (category: any, allCategories: any[]): number => {
    let remaining = category.budget - category.spent;

    if (category.children && category.children.length > 0) {
      const childrenBudgetSum = category.children.reduce((sum: number, childId: string) => {
        const child = allCategories.find((c: any) => c.id === childId);
        return sum + (child?.budget || 0);
      }, 0);
      remaining -= childrenBudgetSum;
    }

    const descendants = getAllDescendants(category.id, allCategories);
    descendants.forEach((descendant: any) => {
      let descendantRemaining = descendant.budget - descendant.spent;
      if (descendant.children && descendant.children.length > 0) {
        const childrenBudgetSum = descendant.children.reduce((sum: number, childId: string) => {
          const child = allCategories.find((c: any) => c.id === childId);
          return sum + (child?.budget || 0);
        }, 0);
        descendantRemaining -= childrenBudgetSum;
      }
      remaining += descendantRemaining;
    });

    return remaining;
  };

  // ✅ Handle category deletion with cascade and balance return
  const handleDeleteCategory = (category: any) => {
    // Just set the category - the modal will be opened by useEffect
    setCategoryToDelete(category);
  };

  // Calculate delete modal data when categoryToDelete changes
  const deleteModalData = categoryToDelete ? {
    category: categoryToDelete,
    descendants: getAllDescendants(categoryToDelete.id, categories),
    totalRemaining: calculateTotalRemaining(categoryToDelete, categories),
    parentCategory: categories.find((c: any) => c.id === categoryToDelete.parentId),
  } : null;

  const confirmDelete = () => {
    if (!deleteModalData) return;

    const { category, descendants, totalRemaining } = deleteModalData;

    setCategories((prev: any) => {
      const categoryToDeleteData = prev.find((c: any) => c.id === category.id);
      const parentId = categoryToDeleteData?.parentId;

      const idsToDelete = [category.id, ...descendants.map((d: any) => d.id)];

      const withoutDeleted = prev
        .filter((c: any) => !idsToDelete.includes(c.id))
        .map((c: any) => {
          if (categoryToDeleteData && c.id === categoryToDeleteData.parentId) {
            // Update parent: remove child from children array AND add remaining money to parent's budget
            return {
              ...c,
              children: c.children.filter((childId: string) => childId !== category.id),
              budget: totalRemaining > 0 ? c.budget + totalRemaining : c.budget
            };
          }
          return c;
        });

      if (parentId) {
        const positionUpdates = repositionAllChildren(parentId, withoutDeleted);
        return withoutDeleted.map((c: any) => {
          const update = positionUpdates.find((u: any) => u.id === c.id);
          if (update) {
            return { ...c, position: update.position };
          }
          return c;
        });
      }

      return withoutDeleted;
    });

    setDeleteModalVisible(false);
    setCategoryToDelete(null);
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
          paddingBottom: 200, // Add bottom padding to allow scrolling below Current Budget block
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
            onPressIn={() => {}}
            onPressOut={() => {}}
            onPress={() => {
              setSelectedCategory(cat);
              setModalState((prev: any) => ({ ...prev, transaction: true }));
            }}
            onAddChild={() => {
              setParentForNewCategory(cat.id);
              setModalState((prev: any) => ({
                ...prev,
                add: true,
              }));
            }}
            onDelete={() => handleDeleteCategory(cat)}
          />
        ))}
      </Animated.View>

      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      <DeleteBudgetBlockModal
        visible={deleteModalVisible}
        category={deleteModalData?.category || null}
        descendants={deleteModalData?.descendants || []}
        totalRemaining={deleteModalData?.totalRemaining || 0}
        parentCategory={deleteModalData?.parentCategory || null}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
      />
    </View>
  );
}
