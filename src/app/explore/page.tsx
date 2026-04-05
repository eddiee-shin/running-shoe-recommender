'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shoe, SHOE_TYPES } from '@/types/shoe';
import { ShoeCard } from '@/components/ShoeCard';
import { Filter, Search } from 'lucide-react';

export default function ExplorePage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedShoe, setExpandedShoe] = useState<string | null>(null);

  const [filterBrand, setFilterBrand] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/shoes')
      .then(r => r.json())
      .then(data => {
        setShoes(data);
        setLoading(false);
      });
  }, []);

  const brands = useMemo(() => Array.from(new Set(shoes.map(s => s.brand))).sort(), [shoes]);
  const years = useMemo(() => Array.from(new Set(shoes.map(s => s.release_year))).sort((a,b) => b - a), [shoes]);

  const filteredShoes = useMemo(() => {
    return shoes.filter(s => {
      if (filterBrand !== 'All' && s.brand !== filterBrand) return false;
      if (filterType !== 'All' && s.type !== filterType) return false;
      if (filterYear !== 'All' && s.release_year.toString() !== filterYear) return false;
      if (filterPrice !== 'All') {
        const p = s.price_usd;
        if (filterPrice === 'Under $150' && p > 150) return false;
        if (filterPrice === '$150 - $200' && (p < 150 || p > 200)) return false;
        if (filterPrice === 'Over $200' && p <= 200) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.model.toLowerCase().includes(q) && !s.brand.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [shoes, filterBrand, filterType, filterYear, filterPrice, searchQuery]);

  const handleLike = async (id: number) => {
    try {
      const res = await fetch(`/api/shoes/${id}/like`, { method: "POST" });
      if (res.ok) {
        setShoes(prev => prev.map(s => s.id === id ? { ...s, likes: s.likes + 1 } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header section... navigation should ideally be in layout, but we'll put a standalone header here for now if layout doesn't have it */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-80 transition-opacity">
            CoreFit.
          </a>
          <span className="text-zinc-600 font-bold hidden sm:inline">|</span>
          <span className="font-semibold text-zinc-200 hidden sm:inline">Explore All Shoes</span>
        </div>
        <div className="flex gap-4">
          <a href="/" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">AI Match</a>
          <a href="/admin" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Admin</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Shoe name..." 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Brand</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
                <option value="All">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Release Year</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                <option value="All">All Years</option>
                {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Type</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                {SHOE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Price</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none" value={filterPrice} onChange={e => setFilterPrice(e.target.value)}>
                <option value="All">All Prices</option>
                <option value="Under $150">Under $150</option>
                <option value="$150 - $200">$150 - $200</option>
                <option value="Over $200">Over $200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-black">{filteredShoes.length} <span className="text-zinc-500 text-lg font-medium">Shoes Found</span></h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredShoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShoes.map((shoe) => (
              <ShoeCard 
                key={shoe.id}
                shoe={shoe}
                expanded={expandedShoe === shoe.model}
                onToggle={() => setExpandedShoe(expandedShoe === shoe.model ? null : shoe.model)}
                onLike={() => handleLike(shoe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <h3 className="text-xl font-bold text-zinc-400 mb-2">No shoes found</h3>
            <p className="text-zinc-500">Try adjusting your filters to find what you're looking for.</p>
            <button 
              onClick={() => { setFilterBrand('All'); setFilterType('All'); setFilterYear('All'); setFilterPrice('All'); setSearchQuery(''); }}
              className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
