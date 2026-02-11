import React from 'react';
import { motion } from 'framer-motion';
import { Package, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import { MOCK_ORDERS } from '../constants';

export default function OrdersTab({ theme }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">My Orders</h2>
            </div>

            <div className="grid gap-6">
                {MOCK_ORDERS.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl p-6"
                        style={{
                            backgroundColor: `${theme.text}05`,
                            borderColor: theme.navbar?.border
                        }}
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            {/* Order Meta */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Order ID</p>
                                        <h3 className="font-bold text-lg">{order.id}</h3>
                                    </div>
                                </div>

                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Date</p>
                                        <p className="font-medium text-sm">{order.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Status</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {order.status === 'Delivered' ? (
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                                                    <CheckCircle2 size={12} /> Delivered
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                                                    <Clock size={12} /> Processing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Summary */}
                            <div className="flex-1 flex items-center gap-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                        <div>
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs opacity-50">Qty: 1</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Total & Actions */}
                            <div className="flex flex-col justify-between items-end">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Total Amount</p>
                                    <p className="text-2xl font-black">{order.total}</p>
                                </div>
                                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity">
                                    View Details <ExternalLink size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
