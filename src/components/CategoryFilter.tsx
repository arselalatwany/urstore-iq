import React from 'react';
import { ProductCategory } from '../types';
import { Sparkles, Shirt, Heart, Home, Smartphone, LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  counts: Record<ProductCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  counts,
}) => {
  const categories: {
    id: ProductCategory;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'all',
      label: 'جميع المنتجات',
      sublabel: 'كل التشكيلات',
      icon: LayoutGrid,
    },
    {
      id: 'fashion',
      label: 'أزياء وملابس',
      sublabel: 'ستريت وير وهوديز',
      icon: Shirt,
    },
    {
      id: 'beauty',
      label: 'جمال وعناية بالبشرة',
      sublabel: 'سيرومات ومستحضرات',
      icon: Heart,
    },
    {
      id: 'home',
      label: 'المنزل والمطبخ',
      sublabel: 'أدوات ومنظمات ذكية',
      icon: Home,
    },
    {
      id: 'electronics',
      label: 'إلكترونيات',
      sublabel: 'ساعات وسماعات وإكسسوارات',
      icon: Smartphone,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          const count = counts[cat.id] ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-500'
                }`}
              />
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md tabular-nums font-mono ${
                  isActive
                    ? 'bg-slate-800 text-amber-300'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
