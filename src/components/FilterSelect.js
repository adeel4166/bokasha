"use client";
import { useRouter } from 'next/navigation';

export default function FilterSelect({ name, options, defaultValue, placeholder }) {
  const router = useRouter();

  const handleChange = (e) => {
    const val = e.target.value;
    const currentParams = new URLSearchParams(window.location.search);
    if (val) {
      currentParams.set(name, val);
    } else {
      currentParams.delete(name);
    }
    router.push(`/?${currentParams.toString()}`);
  };

  return (
    <select
      className="w-full md:w-48 bg-white dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 focus:outline-none shadow-sm appearance-none cursor-pointer"
      onChange={handleChange}
      defaultValue={defaultValue}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
