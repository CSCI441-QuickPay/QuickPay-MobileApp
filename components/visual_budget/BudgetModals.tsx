import AddCategoryModal from '@/components/visual_budget/modals/AddCategoryModal';
import EditCategoryInfoModal from '@/components/visual_budget/modals/EditCategoryInfoModal';
import TransactionModal from '@/components/visual_budget/modals/TransactionModal';

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
  return (
    <>
      <AddCategoryModal
        visible={modalState.add}
        onClose={() => setModalState((s: any) => ({ ...s, add: false }))}
        onSave={(name, budget, icon, color) => {
          const newCat = {
            id: Date.now().toString(),
            name,
            budget: parseFloat(budget),
            color,
            icon,
            type: 'category',
            spent: 0,
            children: [],
            position: { x: 50, y: 50 },
          };
          setCategories((prev: any) => [...prev, newCat]);
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
          setCategories((prev: any) =>
            prev.filter((c: any) => c.id !== selectedCategory.id)
          );
          setModalState((s: any) => ({ ...s, transaction: false }));
        }}
      />
    </>
  );
}
