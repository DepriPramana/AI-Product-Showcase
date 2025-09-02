
import React from 'react';
import { ShoppingBagIcon } from './icons/ShoppingBagIcon';

const Header: React.FC = () => {
  return (
    <header className="container mx-auto max-w-7xl">
      <nav className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShoppingBagIcon className="w-6 h-6 text-brand-primary" />
          <span className="font-bold text-lg text-white">AI Product Showcase</span>
        </div>
        <a href="#" className="text-sm font-medium text-brand-light hover:text-white transition-colors">
          About
        </a>
      </nav>
    </header>
  );
};

export default Header;
