"use client";

import React, { useState, useEffect } from 'react';
import { Shoe, SHOE_TYPES } from '@/types/shoe';

export default function AdminPage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Shoe>>({});
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchShoes();
    }
  }, [isAuthenticated]);

  const fetchShoes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shoes');
      const data = await res.json();
      setShoes(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const startEdit = (shoe: Shoe) => {
    setEditingId(shoe.id);
    setEditForm({ ...shoe });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: number) => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch(`/api/shoes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setSaveStatus('Saved!');
        setEditingId(null);
        fetchShoes();
      } else {
        setSaveStatus('Error saving');
      }
    } catch (e) {
      console.error(e);
      setSaveStatus('Error saving');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setSaveStatus('Uploading...');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setEditForm({ ...editForm, image: data.imagePath });
        setSaveStatus('Upload complete');
      } else {
        setSaveStatus('Upload error');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setSaveStatus('Upload error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 모델을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/shoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchShoes();
      } else {
        alert('삭제 실패');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl border border-zinc-800">
          <div className="text-4xl mb-6">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Admin Dashboard</h2>
          <p className="text-sm text-zinc-400 mb-6">Enter PIN to access (Hint: 1234)</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (pin === '1234') {
              setIsAuthenticated(true);
            } else {
              setPin('');
              alert('Incorrect PIN');
            }
          }}>
            <input 
              type="password" 
              autoFocus
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-center text-2xl tracking-[0.5em] text-white rounded-lg py-3 mb-4 focus:outline-none focus:border-cyan-500 transition-colors" 
              placeholder="••••"
            />
            <button 
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">
            CoreFit Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-zinc-500">{shoes.length} Models Indexed</span>
            {saveStatus && <span className="text-sm font-bold text-cyan-400">{saveStatus}</span>}
          </div>
        </header>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 shadow-2xl">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider text-xs border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium flex-1">Model</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Price($)</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Likes❤️</th>
                <th className="px-4 py-3 font-medium">Image Path</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {shoes.map(shoe => (
                <tr key={shoe.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3 text-zinc-500">{shoe.id}</td>
                  
                  {editingId === shoe.id ? (
                    <>
                      <td className="px-4 py-3"><input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-24 text-white" value={editForm.brand || ''} onChange={e => setEditForm({...editForm, brand: e.target.value})} /></td>
                      <td className="px-4 py-3"><input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full text-white" value={editForm.model || ''} onChange={e => setEditForm({...editForm, model: e.target.value})} /></td>
                      <td className="px-4 py-3">
                        <select className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white" value={editForm.type || ''} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                          {SHOE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3"><input type="number" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-16 text-white" value={editForm.release_year || 2023} onChange={e => setEditForm({...editForm, release_year: Number(e.target.value)})} /></td>
                      <td className="px-4 py-3"><input type="number" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-16 text-white" value={editForm.price_usd || 0} onChange={e => setEditForm({...editForm, price_usd: Number(e.target.value)})} /></td>
                      <td className="px-4 py-3"><input type="number" step="0.1" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-16 text-white" value={editForm.rating || 0} onChange={e => setEditForm({...editForm, rating: Number(e.target.value)})} /></td>
                      <td className="px-4 py-3 text-rose-400 font-bold">{shoe.likes}</td>
                      <td className="px-4 py-3">
                        <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full text-white text-xs mb-2" value={editForm.image || ''} onChange={e => setEditForm({...editForm, image: e.target.value})} />
                        <br />
                        <label className="cursor-pointer bg-zinc-700 hover:bg-zinc-600 text-xs px-2 py-1 rounded inline-block text-white transition-colors text-center w-full">
                          Upload File
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleSave(shoe.id)} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded font-medium text-xs">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded font-medium text-xs">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-semibold text-zinc-300">{shoe.brand}</td>
                      <td className="px-4 py-3 font-bold text-white">{shoe.model}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-zinc-800 text-cyan-400 text-xs border border-zinc-700">{shoe.type}</span></td>
                      <td className="px-4 py-3 text-cyan-500 font-bold">{shoe.release_year}</td>
                      <td className="px-4 py-3">${shoe.price_usd}</td>
                      <td className="px-4 py-3 text-yellow-500">⭐ {shoe.rating}</td>
                      <td className="px-4 py-3 text-rose-400 font-bold">{shoe.likes}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                            {shoe.image ? (
                              <img src={shoe.image.startsWith('http') ? shoe.image : `/${shoe.image}`} alt={shoe.model} className="w-10 h-10 object-contain rounded bg-zinc-900 border border-zinc-800" />
                            ) : null}
                            <span className="text-zinc-500 text-xs truncate max-w-[100px]">{shoe.image}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => startEdit(shoe)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs">Edit</button>
                        <button onClick={() => handleDelete(shoe.id)} className="px-3 py-1 bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-900 rounded text-xs">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
