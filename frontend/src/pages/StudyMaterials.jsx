import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch, FiDownload, FiBookmark, FiFilter,
  FiPlus, FiX, FiBook
} from 'react-icons/fi';

const categories = ['All', 'Programming', 'Web Development', 'React', 'Node.js', 'MongoDB', 'Python', 'DSA', 'DBMS', 'OS', 'CN'];

const categoryColors = {
  Programming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Web Development': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  React: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Node.js': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MongoDB: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Python: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  DSA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DBMS: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  OS: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CN: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const mockResources = [
  { _id: '1', title: 'Complete DSA Notes — Arrays, Trees, Graphs', description: 'Comprehensive Data Structures & Algorithms notes covering all major topics with examples, complexity analysis, and practice problems.', category: 'DSA', downloadCount: 1247, tags: ['DSA', 'Arrays', 'Trees'] },
  { _id: '2', title: 'React.js Complete Guide — Hooks, Context, Router', description: 'Master React.js from basics to advanced patterns. Covers useState, useEffect, useContext, custom hooks, React Router v6.', category: 'React', downloadCount: 2389, tags: ['React', 'Hooks', 'Context API'] },
  { _id: '3', title: 'DBMS Notes — Normalization, SQL, Transactions', description: 'Database Management Systems complete notes. Covers ER diagrams, normalization (1NF to BCNF), SQL queries, and transactions.', category: 'DBMS', downloadCount: 1876, tags: ['DBMS', 'SQL', 'Normalization'] },
  { _id: '4', title: 'Python Programming — Complete Beginner to Advanced', description: 'Learn Python from scratch. OOP, file handling, decorators, generators, lambda, list comprehensions, and popular libraries.', category: 'Python', downloadCount: 3124, tags: ['Python', 'OOP'] },
  { _id: '5', title: 'Node.js & Express.js API Development Guide', description: 'Build production-ready REST APIs with Node.js and Express. Covers routing, middleware, JWT auth, MongoDB integration.', category: 'Node.js', downloadCount: 1543, tags: ['Node.js', 'Express', 'REST API'] },
  { _id: '6', title: 'MongoDB Complete Notes — Aggregation, Indexing', description: 'Master MongoDB NoSQL database. Covers CRUD operations, aggregation pipeline, indexing strategies, schema design.', category: 'MongoDB', downloadCount: 987, tags: ['MongoDB', 'NoSQL', 'Mongoose'] },
  { _id: '7', title: 'Operating Systems — Scheduling, Memory, Deadlock', description: 'OS concepts for university exams and GATE. Covers process scheduling, memory management, virtual memory, deadlock.', category: 'OS', downloadCount: 2156, tags: ['OS', 'Scheduling', 'GATE'] },
  { _id: '8', title: 'Computer Networks — OSI, TCP/IP, Protocols', description: 'Computer Networks for GATE and university exams. Covers OSI model, TCP/IP, HTTP, DNS, routing algorithms.', category: 'CN', downloadCount: 1789, tags: ['CN', 'OSI', 'TCP/IP'] },
  { _id: '9', title: 'Web Development Roadmap 2024 — Full Stack', description: 'Complete full-stack web development roadmap. HTML, CSS, JavaScript, React, Node.js, databases, and deployment.', category: 'Web Development', downloadCount: 4521, tags: ['Web Dev', 'Full Stack'] },
  { _id: '10', title: 'JavaScript ES6+ Cheat Sheet', description: 'Quick reference for modern JavaScript. Arrow functions, destructuring, spread/rest, promises, async/await, and modules.', category: 'Programming', downloadCount: 5234, tags: ['JavaScript', 'ES6'] },
  { _id: '11', title: 'System Design Interview — Scalability & Architecture', description: 'Ace system design interviews. Covers load balancing, caching, databases, microservices, and real case studies.', category: 'Programming', downloadCount: 6789, tags: ['System Design', 'Architecture'] },
  { _id: '12', title: 'Tailwind CSS + React UI Components Library', description: 'Production-ready UI components built with Tailwind CSS and React. Includes navigation, forms, cards, modals.', category: 'React', downloadCount: 2341, tags: ['Tailwind', 'React', 'UI'] },
];

const ResourceCard = ({ resource }) => {
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await axios.post(`/api/resources/${resource._id}/download`);
    } catch (err) {
      console.warn('Failed to track download count:', err);
    }
    setTimeout(() => {
      setDownloading(false);
      window.open(resource.fileUrl || '#', '_blank');
    }, 500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 shadow-md shadow-gray-100/80 dark:shadow-none border border-gray-100 dark:border-gray-700/50 flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[resource.category] || categoryColors.Other}`}>
          {resource.category}
        </span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => setSaved(!saved)}
          className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
          aria-label="Save resource"
        >
          <FiBookmark size={15} fill={saved ? 'currentColor' : 'none'} />
        </motion.button>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
        {resource.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
        {resource.description}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(resource.tags || []).slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <FiDownload size={12} /> {resource.downloadCount?.toLocaleString()} downloads
        </span>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {downloading ? (
            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FiDownload size={13} />
          )}
          {resource.fileUrl?.startsWith('http') ? 'Download' : 'View'}
        </motion.button>
      </div>
    </motion.div>
  );
};

const StudyMaterials = () => {
  const { user, isGuest } = useAuth();
  const [resources, setResources] = useState(mockResources);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Upload Form states
  const [form, setForm] = useState({ title: '', description: '', category: 'DSA', type: 'pdf', fileUrl: '', tags: '' });
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (activeCategory !== 'All') params.category = activeCategory;
        const res = await axios.get('/api/resources', { params });
        if (res.data.resources?.length > 0) setResources(res.data.resources);
      } catch {
        // Keep mock data
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchResources, 400);
    return () => clearTimeout(timeout);
  }, [search, activeCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');
    setUploadLoading(true);

    try {
      const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { ...form, tags: tagsArray };
      const res = await axios.post('/api/resources', payload);
      
      if (res.data.success) {
        setUploadSuccess('Resource uploaded successfully! Refreshing list...');
        setForm({ title: '', description: '', category: 'DSA', type: 'pdf', fileUrl: '', tags: '' });
        
        // Refresh resources list
        const updated = await axios.get('/api/resources');
        if (updated.data.resources) setResources(updated.data.resources);
        
        setTimeout(() => {
          setShowUpload(false);
          setUploadSuccess('');
        }, 1500);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload resource. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-gray-900 dark:text-white mb-1">
            Study <span className="gradient-text">Materials</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Browse and download premium educational resources</p>
        </motion.div>
      </div>

      {/* Search + Upload */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            id="resources-search"
            type="text"
            placeholder="Search resources, topics, subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={16} />
            </button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUpload(!showUpload)}
          id="upload-resource-btn"
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/30"
        >
          <FiPlus size={16} /> Upload Resource
        </motion.button>
      </motion.div>

      {/* Category Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            id={`filter-${cat.replace(/\s/g, '-').toLowerCase()}`}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> resources
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiFilter size={14} /> Sort by: <span className="text-gray-900 dark:text-white font-medium">Popular</span>
        </div>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="shimmer h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FiBook size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No resources found for "{search}"</p>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {filtered.map(resource => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => { setShowUpload(false); setUploadError(''); setUploadSuccess(''); }}
                className="absolute right-4 top-4 p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer"
              >
                <FiX size={18} />
              </button>

              <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiPlus className="text-blue-500" /> Upload Study Resource
              </h2>

              {isGuest ? (
                <div className="py-8 text-center space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Only registered students can upload resources to the community.
                  </p>
                  <a
                    href="/login"
                    className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md"
                  >
                    Sign In or Register
                  </a>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs">
                      {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs animate-pulse">
                      {uploadSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. DBMS Normalization Guide"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Summarize the contents of this resource..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category *</label>
                      <select
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none"
                      >
                        {['DSA', 'DBMS', 'OS', 'CN', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'Programming', 'Web Development'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Type *</label>
                      <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none"
                      >
                        {['pdf', 'notes', 'link', 'zip'].map(t => (
                          <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">File / Drive Link *</label>
                    <input
                      type="url"
                      required
                      value={form.fileUrl}
                      onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="https://drive.google.com/file/d/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Tags (Comma separated)</label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={e => setForm({ ...form, tags: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g. database, normalization, aktu"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUpload(false)}
                      className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-white text-sm font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadLoading}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {uploadLoading ? 'Uploading...' : 'Submit Resource'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterials;
