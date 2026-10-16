import { RiLoader4Line } from '@remixicon/react';

const CategoriesLoading = () => (
  <div
    role="status"
    className="flex items-center justify-center gap-3 py-24 text-sm text-text-sub-600"
  >
    <RiLoader4Line size={22} className="animate-spin" aria-hidden="true" />
    Loading categories…
  </div>
);
export default CategoriesLoading;
