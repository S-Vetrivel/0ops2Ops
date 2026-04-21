// src/components/profile/constants.js
import { User, Package, MapPin, Heart, GalleryHorizontal, Shield } from "lucide-react";
import { FiBox } from "react-icons/fi";

// --- TAB CONFIGURATION ---
export const PROFILE_TABS = [
  {
    id: "personal",
    label: "Personal Info",
    icon: User,
    showForUser: true,
    showForAdmin: true,
  },


  {
    id: "repos",
    label: "Repositories",
    icon: GalleryHorizontal,
    showForUser: true,
    showForAdmin: true,
  },
  {
    id: "firewall",
    label: "Firewall",
    icon: Shield,
    showForUser: true,
    showForAdmin: true,
  },
];
// --- MOCK DATA ---
export const MOCK_USER_META = {
  memberSince: "2023",
  authProvider: "google",
  email: "alex.doe@gmail.com",
  phone: "+1 (555) 019-2834",
};

export const MOCK_ORDERS = [
  {
    id: "ORD-7782",
    date: "Oct 24, 2024",
    total: "$150.00",
    status: "Delivered",
    items: [
      {
        id: 1,
        name: "Nike Air Max",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
  {
    id: "ORD-9921",
    date: "Nov 02, 2024",
    total: "$85.50",
    status: "Processing",
    items: [
      {
        id: 2,
        name: "Essentials Tee",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
      },
    ],
  },
];

export const MOCK_WISHLIST = [
  {
    id: 1,
    name: "Urban Utility Jacket",
    price: "$220.00",
    stock: "In Stock",
    image:
      "https://images.unsplash.com/photo-1551488852-d814c937d191?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Dunk Low Retro",
    price: "$110.00",
    stock: "Low Stock",
    image:
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=400&q=80",
  },
];

export const MOCK_ADDRESSES = [
  {
    id: 1,
    label: "Home",
    name: "Alex Doe",
    mobile: "+1 (555) 019-2834",
    street: "124 Urban District, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10012",
    default: true,
  },
  {
    id: 2,
    label: "Office",
    name: "Alex Doe",
    mobile: "+1 (555) 987-6543",
    street: "45 Tech Plaza, Suite 200",
    city: "San Francisco",
    state: "CA",
    zip: "94016",
    default: false,
  },
];
