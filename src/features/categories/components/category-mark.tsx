import {
  RiBookOpenLine,
  RiBriefcaseLine,
  RiCarLine,
  RiGamepadLine,
  RiGiftLine,
  RiHeartLine,
  RiHome5Line,
  RiMoneyDollarCircleLine,
  RiPlaneLine,
  RiPriceTag3Line,
  RiRestaurantLine,
  RiShoppingBag3Line,
} from '@remixicon/react';
import type { Category } from '../contracts';

const icons = {
  tag: RiPriceTag3Line,
  home: RiHome5Line,
  food: RiRestaurantLine,
  transport: RiCarLine,
  shopping: RiShoppingBag3Line,
  income: RiMoneyDollarCircleLine,
  health: RiHeartLine,
  education: RiBookOpenLine,
  travel: RiPlaneLine,
  gift: RiGiftLine,
  leisure: RiGamepadLine,
  work: RiBriefcaseLine,
};
const colors = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  lime: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  purple:
    'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  orange:
    'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
};

const CategoryMark = ({ icon, color }: Pick<Category, 'icon' | 'color'>) => {
  const Icon = icons[icon];
  return (
    <span
      className={
        'flex size-10 shrink-0 items-center justify-center rounded-xl ' +
        colors[color]
      }
    >
      <Icon size={20} aria-hidden="true" />
    </span>
  );
};
export default CategoryMark;
