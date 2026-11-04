import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  Package, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft, 
  MessageCircle, 
  X 
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAJSW10brI9NTo-gJioSW3NvCU9C4M1-UE",
  authDomain: "loshijosdelaluz.firebaseapp.com",
  projectId: "loshijosdelaluz",
  storageBucket: "loshijosdelaluz.firebasestorage.app",
  messagingSenderId: "879813302890",
  appId: "1:879813302890:web:87eb646382ba7e60ddc813",
  measurementId: "G-FLJ5G45GQR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLUMNS = [
  { id: 'todo', title: 'Por Hacer', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'in_progress', title: 'Haciendo', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'review', title: 'Terminando', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'done', title: 'Entregados', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' }
];

export default function App() {
  const [orders, setOrders] = useState([]);
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
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOrders(items);
    }, (error) => {
      console.error("Error al escuchar cambios en Firestore:", error);
    });

    return () => unsubscribe();
  }, []);

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

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.product.trim()) return;

    try {
      if (editingOrder) {
        const orderRef = doc(db, 'orders', editingOrder.id);
        const { id, ...dataToUpdate } = formData;
        await updateDoc(orderRef, dataToUpdate);
      } else {
        await addDoc(collection(db, 'orders'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar pedido:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
    }
  };

  const handleMoveStatus = async (id, direction) => {
    const statusOrder = ['todo', 'in_progress', 'review', 'done'];
    const current = orders.find(o => o.id === id);
    if (!current) return;

    const currentIndex = statusOrder.indexOf(current.status);
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      try {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, { status: statusOrder[nextIndex] });
      } catch (err) {
        console.error("Error al mover estado:", err);
      }
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20 px-4 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-amber-300">
                <svg viewBox="0 0 100 100" className="w-6 h-6 shrink-0" fill="none">
                  <circle cx="50" cy="50" r="22" fill="#F59E0B" />
                  <path d="M50 8v14M50 78v14M8 50h14M78 50h14M20 20l10 10M70 70l10 10M20 80l10-10M70 30l10-10" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-xs tracking-tight bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                    Los Hijos de la Luz
                  </span>
                  <span className="text-[7.5px] font-semibold text-sky-600 tracking-wider">
                    SEMBRAR CON AMOR
                  </span>
                </div>
              </div>

              <span className="text-slate-300 hidden sm:inline">|</span>
              <h1 className="text-sm font-semibold text-slate-700 hidden sm:block">Control de Pedidos</h1>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold active:scale-95 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFilterPerson(filterPerson === 'Yesi' ? null : 'Yesi')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterPerson === 'Yesi' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yesi
              </button>
              <button
                onClick={() => setFilterPerson(filterPerson === 'Roci' ? null : 'Roci')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterPerson === 'Roci' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Roci
              </button>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setFilterType(filterType === 'unit' ? null : 'unit')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterType === 'unit' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unitario
              </button>
              <button
                onClick={() => setFilterType(filterType === 'kit' ? null : 'kit')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filterType === 'kit' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kit
              </button>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Pedido
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
                className="w-80 flex flex-col bg-slate-100/80 border border-slate-200 rounded-xl max-h-[calc(100vh-140px)] shadow-sm"
              >
                <div className="p-3 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-slate-100 rounded-t-xl z-10">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                      {colOrders.length}
                    </span>
                    <h2 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">{col.title}</h2>
                  </div>
                </div>

                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {colOrders.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs">
                      Sin pedidos
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl shadow-sm transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">
                            {order.clientName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              order.assignedTo === 'Yesi' 
                                ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                                : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                            }`}
                          >
                            {order.assignedTo}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium mb-2">
                          <Package className="w-3.5 h-3.5 shrink-0" />
                          <span>{order.quantity} × {order.product}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded ml-auto border border-slate-200">
                            {order.type === 'kit' ? 'Kit' : 'Unitario'}
                          </span>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-2 border border-slate-200">
                            {order.notes}
                          </p>
                        )}

                        {order.clientPhone && (
                          <div className="mb-2">
                            <a
                              href={`https://wa.me/${order.clientPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp ({order.clientPhone})
                            </a>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            {col.id !== 'todo' && (
                              <button
                                onClick={() => handleMoveStatus(order.id, -1)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Mover a la izquierda"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={() => handleMoveStatus(order.id, 1)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                title="Mover a la derecha"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenModal(order)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600"
                              title="Editar"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-1 hover:bg-red-50 rounded text-red-500"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-3">
              {editingOrder ? 'Modificar Pedido' : 'Registrar Nuevo Pedido'}
            </h3>

            <form onSubmit={handleSaveOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Maestra Eve"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: +54 9 261..."
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Souvenirs Lautaro Martínez"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'unit' })}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                        formData.type === 'unit' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Unitario
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'kit' })}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                        formData.type === 'kit' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Kit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Toma Pedido</label>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedTo: 'Yesi' })}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                        formData.assignedTo === 'Yesi' ? 'bg-pink-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Yesi
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedTo: 'Roci' })}
                      className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                        formData.assignedTo === 'Roci' ? 'bg-cyan-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Roci
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas</label>
                <textarea
                  rows="2"
                  placeholder="Detalles, fecha de entrega..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-indigo-700"
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
