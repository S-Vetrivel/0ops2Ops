import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, MoreVertical, Check } from 'lucide-react';
import { MOCK_ADDRESSES } from '../constants';

export default function AddressesTab({ theme }) {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">My Addresses</h2>
                <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                    style={{
                        backgroundColor: theme.text,
                        color: theme.bg
                    }}
                >
                    <Plus size={16} /> Add New Address
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_ADDRESSES.map((address) => (
                    <motion.div
                        key={address.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 ${address.default ? 'ring-2' : ''}`}
                        style={{
                            backgroundColor: `${theme.text}05`,
                            borderColor: address.default ? theme.text : theme.navbar?.border,
                            boxShadow: address.default ? `0 10px 30px -10px ${theme.text}33` : 'none'
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${address.default ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{address.label}</h3>
                                    {address.default && (
                                        <span className="text-[10px] font-bold uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded ml-2">
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div className="space-y-1 text-sm opacity-80">
                            <p className="font-bold text-base opacity-100">{address.name}</p>
                            <p>{address.street}</p>
                            <p>{address.city}, {address.state} {address.zip}</p>
                            <p className="pt-2 font-medium">Phone: {address.mobile}</p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            {!address.default && (
                                <button className="text-xs font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity">
                                    Set as Default
                                </button>
                            )}
                            <button className="text-xs font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 transition-opacity">
                                Edit
                            </button>
                            <button className="text-xs font-bold uppercase tracking-widest underline text-red-500 opacity-60 hover:opacity-100 transition-opacity">
                                Delete
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
