import CategoriesWorkspace from '@/features/categories/components/categories-workspace';
import { categoriesSchema } from '@/features/categories/contracts';
import backendFetch from '@/lib/auth/backend';
import requireUser from '@/lib/auth/session';

export const metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  await requireUser();
  const response = await backendFetch('/categories');
  if (!response.ok) throw new Error('Unable to load categories');
  return (
    <CategoriesWorkspace
      initial={categoriesSchema.parse(await response.json())}
    />
  );
}
