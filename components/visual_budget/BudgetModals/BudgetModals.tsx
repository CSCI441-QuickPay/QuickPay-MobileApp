import { Alert } from 'react-native';
import AddCategoryModal from '@/components/visual_budget/BudgetModals/AddCategoryModal';
import EditCategoryInfoModal from '@/components/visual_budget/BudgetModals/EditCategoryInfoModal';
import TransactionModal from '@/components/visual_budget/BudgetModals/TransactionModal';

interface BudgetModalsProps {
  modalState: any;
  setModalState: any;
  categories: any[];
  setCategories: any;
  selectedCategory: any;
  setSelectedCategory: any;
  parentForNewCategory: any;
  setParentForNewCategory: any;
  onDeleteCategory?: (category: any) => void;
}

export default function BudgetModals({
  modalState,
  setModalState,
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  parentForNewCategory,
  setParentForNewCategory,
  onDeleteCategory,
}: BudgetModalsProps) {

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
        // Recursively get children's descendants
        descendants = descendants.concat(getAllDescendants(childId, allCategories));
      }
    });

    return descendants;
  };

  // ✅ Calculate total remaining balance for a category and all its descendants
  const calculateTotalRemaining = (category: any, allCategories: any[]): number => {
    // Remaining for this category (budget - spent - allocated to children)
    let remaining = category.budget - category.spent;

    // If has children, subtract their allocated budgets
    if (category.children && category.children.length > 0) {
      const childrenBudgetSum = category.children.reduce((sum: number, childId: string) => {
        const child = allCategories.find((c: any) => c.id === childId);
        return sum + (child?.budget || 0);
      }, 0);
      remaining -= childrenBudgetSum;
    }

    // Add remaining from all descendants
    const descendants = getAllDescendants(category.id, allCategories);
    descendants.forEach((descendant: any) => {
      let descendantRemaining = descendant.budget - descendant.spent;
      // Subtract children's allocated budgets
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
    // If onDeleteCategory callback is provided, use it (opens DeleteBudgetBlockModal)
    // Otherwise, fall back to Alert (for backwards compatibility)
    if (onDeleteCategory) {
      // Close the current modal
      setModalState((s: any) => ({ ...s, edit: false, transaction: false }));
      // Trigger the delete modal
      onDeleteCategory(category);
      return;
    }

    // FALLBACK: Old Alert-based deletion (kept for backwards compatibility)
    const descendants = getAllDescendants(category.id, categories);
    const totalRemaining = calculateTotalRemaining(category, categories);

    let confirmMessage = `Are you sure you want to delete "${category.name}"?`;

    if (descendants.length > 0) {
      confirmMessage += `\n\nThis will also delete ${descendants.length} child ${descendants.length === 1 ? 'category' : 'categories'}:`;
      descendants.slice(0, 5).forEach((desc: any) => {
        confirmMessage += `\n• ${desc.name}`;
      });
      if (descendants.length > 5) {
        confirmMessage += `\n• ... and ${descendants.length - 5} more`;
      }
    }

    if (totalRemaining > 0) {
      confirmMessage += `\n\n$${totalRemaining.toFixed(2)} will be returned to Current Budget.`;
    }

    confirmMessage += '\n\nThis action cannot be undone.';

    Alert.alert(
      'Delete Budget Block',
      confirmMessage,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCategories((prev: any) => {
              const categoryToDelete = prev.find((c: any) => c.id === category.id);
              const parentId = categoryToDelete?.parentId;
              const idsToDelete = [category.id, ...descendants.map((d: any) => d.id)];

              const withoutDeleted = prev
                .filter((c: any) => !idsToDelete.includes(c.id))
                .map((c: any) => {
                  if (categoryToDelete && c.id === categoryToDelete.parentId) {
                    return {
                      ...c,
                      children: c.children.filter((childId: string) => childId !== category.id)
                    };
                  }
                  if (c.id === 'total' && totalRemaining > 0) {
                    return {
                      ...c,
                      budget: c.budget + totalRemaining
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

            setModalState((s: any) => ({ ...s, edit: false, transaction: false }));
          },
        },
      ]
    );
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
        categories={categories}
        onClose={() => setModalState((s: any) => ({ ...s, edit: false }))}
        onSave={(updated: any) => {
          setCategories((prev: any) =>
            prev.map((c: any) =>
              c.id === selectedCategory.id ? { ...c, ...updated } : c
            )
          );
          setModalState((s: any) => ({ ...s, edit: false }));
        }}
        onDelete={() => handleDeleteCategory(selectedCategory)}
      />

      <TransactionModal
        visible={modalState.transaction}
        category={selectedCategory}
        categories={categories}
        onClose={() => setModalState((s: any) => ({ ...s, transaction: false }))}
        onEdit={() => {
          setModalState((s: any) => ({ ...s, transaction: false, edit: true }));
        }}
        onDelete={() => handleDeleteCategory(selectedCategory)}
      />
    </>
  );
}