import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Phone, 
  Package, 
  Layers, 
  User, 
  Calendar, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Hammer,
  MessageCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'Por Hacer', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  { id: 'in_progress', title: 'Haciendo', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  { id: 'review', title: 'Terminando', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { id: 'done', title: 'Entregados', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' }
];

export default function App() {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('taller_pedidos_kanban');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'ord-evelautaro',
        clientName: 'Seño Eve',
        clientPhone: '',
        product: 'Souvenirs Lautaro Martínez',
        quantity: 1,
        type: 'unit',
        assignedTo: 'Yesi',
        status: 'todo',
        notes: '',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [filterPerson, setFilterPerson] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    product: '',
    quantity: 1,
    type: 'unit',
    assignedTo: 'Yesi',
    status: 'todo',
    notes: ''
  });

  useEffect(() => {
    localStorage.setItem('taller_pedidos_kanban', JSON.stringify(orders));
  }, [orders]);

  const handleOpenModal = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({ ...order });
    } else {
      setEditingOrder(null);
      setFormData({
        clientName: '',
        clientPhone: '',
        product: '',
        quantity: 1,
        type: 'unit',
        assignedTo: 'Yesi',
        status: 'todo',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveOrder = (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.product.trim()) return;

    if (editingOrder) {
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...formData, id: o.id, createdAt: o.createdAt } : o));
    } else {
      const newOrder = {
        ...formData,
        id: 'ord-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      setOrders(prev => [newOrder, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleMoveStatus = (id, direction) => {
    const statusOrder = ['todo', 'in_progress', 'review', 'done'];
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const currentIndex = statusOrder.indexOf(o.status);
      const nextIndex = currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < statusOrder.length) {
        return { ...o, status: statusOrder[nextIndex] };
      }
      return o;
    }));
  };

  const filteredOrders = orders.filter(o => {
    if (filterPerson && o.assignedTo !== filterPerson) return false;
    if (filterType && o.type !== filterType) return false;
    if (searchTerm) {
      const matchClient = o.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProduct = o.product?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchClient && !matchProduct) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-600/30">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
                Control de Pedidos
              </h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setFilterPerson(filterPerson === 'Yesi' ? null : 'Yesi')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterPerson === 'Yesi' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Yesi
              </button>
              <button
                onClick={() => setFilterPerson(filterPerson === 'Roci' ? null : 'Roci')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterPerson === 'Roci' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Roci
              </button>
            </div>

            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <button
                onClick={() => setFilterType(filterType === 'unit' ? null : 'unit')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'unit' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unitario
              </button>
              <button
                onClick={() => setFilterType(filterType === 'kit' ? null : 'kit')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  filterType === 'kit' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kit
              </button>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Nuevo Pedido
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-6 h-full items-start">
          {COLUMNS.map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col.id);
            return (
              <div 
                key={col.id} 
                className="w-80 md:w-88 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl max-h-[calc(100vh-140px)] shadow-lg"
              >
                <div className="p-3.5 border-b border-slate-800/60 flex items-center justify-between sticky top-0 bg-slate-900 rounded-t-xl z-10">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                      {colOrders.length}
                    </span>
                    <h2 className="font-semibold text-sm text-slate-200">{col.title}</h2>
                  </div>
                </div>

                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                      Sin pedidos
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl shadow-sm transition group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-slate-100 text-sm leading-tight">
                            {order.clientName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              order.assignedTo === 'Yesi' 
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {order.assignedTo}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-medium mb-2">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          <span>{order.quantity} × {order.product}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 text-slate-300 rounded ml-auto">
                            {order.type === 'kit' ? 'Kit' : 'Unitario'}
                          </span>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-slate-400 bg-slate-900/40 p-2 rounded mb-2 border border-slate-800">
                            {order.notes}
                          </p>
                        )}

                        {order.clientPhone && (
                          <div className="mb-2">
                            <a
                              href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp ({order.clientPhone})
                            </a>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => handleMoveStatus(order.id, -1)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                                title="Mover a la izquierda"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => handleMoveStatus(order.id, 1)}
                                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                                title="Mover a la derecha"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(order)}
                              className="p-1 hover:bg-slate-700 rounded text-slate-300"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-4">
              {editingOrder ? 'Modificar Pedido' : 'Registrar Nuevo Pedido'}
            </h3>

            <form onSubmit={handleSaveOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Seño Eve"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: +54 9 261..."
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Souvenirs Lautaro Martínez"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo de Producto</label>
                  <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'unit' })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                        formData.type === 'unit' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Unitario
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'kit' })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                        formData.type === 'kit' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Kit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Toma el Pedido</label>
                  <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedTo: 'Yesi' })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                        formData.assignedTo === 'Yesi' ? 'bg-pink-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Yesi
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedTo: 'Roci' })}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                        formData.assignedTo === 'Roci' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Roci
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas adicionales</label>
                <textarea
                  rows="2"
                  placeholder="Detalles, colores, señas o acuerdos..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/30"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}