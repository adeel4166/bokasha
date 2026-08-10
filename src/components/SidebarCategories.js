'use client';

import Link from 'next/link';
import { useState } from 'react';

// Using the main categories and some sample subcategories for the dynamic hover effect
const categoriesData = [
  {
    name: 'Electronics',
    subcategories: ['Laptops', 'Smartphones', 'Audio & Headphones', 'Cameras', 'Accessories']
  },
  {
    name: 'Home & Kitchen',
    subcategories: ['Appliances', 'Cookware', 'Furniture', 'Decor', 'Bedding']
  },
  {
    name: 'Garden & Outdoors',
    subcategories: ['Patio Furniture', 'Gardening Tools', 'Grills', 'Outdoor Power']
  },
  {
    name: 'Sports & Outdoors',
    subcategories: ['Fitness Equipment', 'Camping', 'Cycling', 'Water Sports']
  },
  {
    name: 'Health & Personal Care',
    subcategories: ['Skincare', 'Vitamins', 'Hair Care', 'Oral Care']
  },
  {
    name: 'Automotive',
    subcategories: ['Car Care', 'Tools', 'Interior Accessories', 'Tires']
  },
  {
    name: 'Tools & DIY',
    subcategories: ['Power Tools', 'Hand Tools', 'Hardware', 'Storage']
  }
];

export default function SidebarCategories() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <div className="bg-white dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm p-4 relative">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
        Categories
      </h2>
      
      <ul className="space-y-1 relative" onMouseLeave={() => setActiveCategory(null)}>
        {categoriesData.map((category) => (
          <li 
            key={category.name}
            className="group"
            onMouseEnter={() => setActiveCategory(category.name)}
          >
            <Link 
              href={`/?category=${encodeURIComponent(category.name)}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md transition-colors duration-200 ${
                activeCategory === category.name 
                  ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#13192b]'
              }`}
            >
              <span className="text-sm font-semibold">{category.name}</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${activeCategory === category.name ? 'translate-x-1 text-fuchsia-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>

            {/* Dynamic Animated Subcategory Flyout Menu / Accordion */}
            {activeCategory === category.name && (
              <div 
                className="mt-2 md:mt-0 md:absolute md:left-full md:top-0 md:ml-2 w-full md:w-56 bg-white dark:bg-[#13192b] border border-slate-100 dark:border-slate-800 rounded-xl shadow-md md:shadow-xl md:z-50 overflow-hidden animate-in fade-in md:slide-in-from-left-2 slide-in-from-top-2 duration-200"
              >
                <div className="bg-fuchsia-50 dark:bg-fuchsia-900/20 px-4 py-3 border-b border-fuchsia-100 dark:border-fuchsia-900/30">
                  <span className="text-xs font-black text-fuchsia-700 dark:text-fuchsia-400 uppercase tracking-wider">{category.name}</span>
                </div>
                <ul className="py-2">
                  {category.subcategories.map(sub => (
                    <li key={sub}>
                      <Link 
                        href={`/?category=${encodeURIComponent(category.name)}&sub=${encodeURIComponent(sub)}`}
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition"
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link 
                      href={`/?category=${encodeURIComponent(category.name)}`}
                      className="block px-4 py-2 text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-slate-800 transition border-t border-slate-100 dark:border-slate-800/50 mt-1 pt-2"
                    >
                      See All {category.name} &rarr;
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
