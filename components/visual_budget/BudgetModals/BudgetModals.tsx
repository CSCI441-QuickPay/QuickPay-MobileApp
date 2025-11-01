import { Alert } from 'react-native';
import AddCategoryModal from '@/components/visual_budget/BudgetModals/AddCategoryModal';
import EditCategoryInfoModal from '@/components/visual_budget/BudgetModals/EditCategoryInfoModal';
import TransactionModal from '@/components/visual_budget/BudgetModals/TransactionModal';

export default function BudgetModals({
  modalState,
  setModalState,
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  parentForNewCategory,
  setParentForNewCategory,
}: any) {
  
  // ✅ Calculate positions for ALL children to maintain symmetry
  const repositionAllChildren = (parentId: string, categories: any[]) => {
    const parent = categories.find((c: any) => c.id === parentId);
    if (!parent) return [];

    const siblings = categories.filter((c: any) => c.parentId === parentId);
    const totalChildren = siblings.length;

    const VERTICAL_OFFSET = 200; // Distance below parent
    const HORIZONTAL_SPACING = 180; // Spacing between siblings

    // Calculate positions centered around parent
    const updates = siblings.map((sibling: any, index: number) => {
      // Center calculation: offset from center based on index
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

  // ✅ Calculate position for new category based on parent
  const calculateNewCategoryPosition = (parentId: string) => {
    const parent = categories.find((c: any) => c.id === parentId);
    if (!parent) return { x: 50, y: 50 }; // Default position if parent not found

    // Get the parent's children count to position horizontally
    const siblings = categories.filter((c: any) => c.parentId === parentId);
    const childIndex = siblings.length;

    const VERTICAL_OFFSET = 200; // Distance below parent
    const HORIZONTAL_SPACING = 180; // Spacing between siblings

    // Calculate position for new child centered around parent
    const totalChildren = childIndex + 1; // Including the new child
    const offsetFromCenter = childIndex - (totalChildren - 1) / 2;
    const newX = parent.position.x + offsetFromCenter * HORIZONTAL_SPACING;

    return {
      x: newX,
      y: parent.position.y + VERTICAL_OFFSET
    };
  };

  return (
    <>
      <AddCategoryModal
        visible={modalState.add}
        onClose={() => setModalState((s: any) => ({ ...s, add: false }))}
        onSave={(name, budget, icon, color) => {
          const budgetAmount = parseFloat(budget);

          // ✅ Validate budget against parent's remaining budget
          if (parentForNewCategory && parentForNewCategory !== 'total') {
            const parent = categories.find((c: any) => c.id === parentForNewCategory);
            if (parent) {
              // Calculate how much budget is already allocated to children
              const childrenBudgetSum = parent.children.reduce((sum: number, childId: string) => {
                const child = categories.find((c: any) => c.id === childId);
                return sum + (child?.budget || 0);
              }, 0);

              // Calculate remaining budget available in parent
              const parentRemaining = parent.budget - parent.spent - childrenBudgetSum;

              // Check if requested budget exceeds available
              if (budgetAmount > parentRemaining) {
                Alert.alert(
                  'Insufficient Budget',
                  `${parent.name} only has $${parentRemaining.toFixed(2)} available.\n\nBudget: $${parent.budget.toFixed(2)}\nSpent: $${parent.spent.toFixed(2)}\nAllocated to children: $${childrenBudgetSum.toFixed(2)}\nRemaining: $${parentRemaining.toFixed(2)}`,
                  [{ text: 'OK' }]
                );
                return; // Don't create the category
              }
            }
          }

          // ✅ Calculate position based on parent
          const position = calculateNewCategoryPosition(parentForNewCategory);

          const newCat = {
            id: Date.now().toString(),
            name,
            budget: budgetAmount,
            color,
            icon,
            type: 'category',
            spent: 0,
            children: [],
            parentId: parentForNewCategory, // ✅ Add parentId to establish relationship
            position, // ✅ Use calculated position
          };

          // ✅ Update parent's children array AND reposition all siblings
          setCategories((prev: any) => {
            // Add new category
            const updated = [...prev, newCat];

            // Update parent's children array
            const withParentUpdated = updated.map((c: any) => {
              if (c.id === parentForNewCategory) {
                return {
                  ...c,
                  children: [...c.children, newCat.id]
                };
              }
              return c;
            });

            // Reposition ALL siblings (including new one) to center them
            const positionUpdates = repositionAllChildren(parentForNewCategory, withParentUpdated);

            // Apply position updates
            return withParentUpdated.map((c: any) => {
              const update = positionUpdates.find((u: any) => u.id === c.id);
              if (update) {
                return { ...c, position: update.position };
              }
              return c;
            });
          });

          setModalState((s: any) => ({ ...s, add: false }));
        }}
        parentName={
          parentForNewCategory
            ? categories.find((c: any) => c.id === parentForNewCategory)?.name || null
            : null
        }
      />

      <EditCategoryInfoModal
        visible={modalState.edit}
        category={selectedCategory}
        onClose={() => setModalState((s: any) => ({ ...s, edit: false }))}
        onSave={(updated: any) => {
          setCategories((prev: any) =>
            prev.map((c: any) =>
              c.id === selectedCategory.id ? { ...c, ...updated } : c
            )
          );
          setModalState((s: any) => ({ ...s, edit: false }));
        }}
      />

      <TransactionModal
        visible={modalState.transaction}
        category={selectedCategory}
        onClose={() => setModalState((s: any) => ({ ...s, transaction: false }))}
        onEdit={() => {
          setModalState((s: any) => ({ ...s, transaction: false, edit: true }));
        }}
        onDelete={() => {
          // ✅ Remove category and reposition remaining siblings
          setCategories((prev: any) => {
            const categoryToDelete = prev.find((c: any) => c.id === selectedCategory.id);
            const parentId = categoryToDelete?.parentId;

            // Remove category and update parent's children array
            const withoutDeleted = prev
              .filter((c: any) => c.id !== selectedCategory.id)
              .map((c: any) => {
                // Remove deleted category from parent's children
                if (categoryToDelete && c.id === categoryToDelete.parentId) {
                  return {
                    ...c,
                    children: c.children.filter((childId: string) => childId !== selectedCategory.id)
                  };
                }
                return c;
              });

            // Reposition remaining siblings if there was a parent
            if (parentId) {
              const positionUpdates = repositionAllChildren(parentId, withoutDeleted);

              // Apply position updates
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
          setModalState((s: any) => ({ ...s, transaction: false }));
        }}
      />
    </>
  );
}