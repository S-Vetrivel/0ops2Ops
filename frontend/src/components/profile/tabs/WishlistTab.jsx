import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { MOCK_WISHLIST } from '../constants';

export default function WishlistTab({ theme }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Wishlist</h2>
                <p className="text-xs font-bold uppercase tracking-widest opacity-50">{MOCK_WISHLIST.length} Items Saved</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_WISHLIST.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl"
                        style={{
                            backgroundColor: `${theme.text}05`,
                            borderColor: theme.navbar?.border
                        }}
                    >
                        <div className="aspect-[4/3] overflow-hidden relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${item.stock === 'In Stock' ? 'text-green-500' : 'text-orange-500'}`}>
                                        {item.stock}
                                    </p>
                                </div>
                                <p className="font-black text-xl">{item.price}</p>
                            </div>

                            <button
                                className="w-full mt-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
                                style={{
                                    backgroundColor: theme.text,
                                    color: theme.bg
                                }}
                            >
                                <ShoppingBag size={16} /> Add to Cart
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
