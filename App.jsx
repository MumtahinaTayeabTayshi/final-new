import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import RestaurantHero from './components/RestaurantHero.jsx';
import PromoBanner from './components/PromoBanner.jsx';
import CategoryTabs from './components/CategoryTabs.jsx';
import MenuCard from './components/MenuCard.jsx';
import CustomizeModal from './components/CustomizeModal.jsx';
import Cart from './components/Cart.jsx';
import MobileCartBar from './components/MobileCartBar.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import OrderSuccess from './components/OrderSuccess.jsx';
import { addOns, categories, menuItems, sizeOptions } from './data/menu.js';

const emptyDraft = {
  size: 'Medium',
  addOns: [],
  quantity: 1,
};

const initialCustomer = {
  name: '',
  phone: '',
  address: '',
  payment: 'Cash on delivery',
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = window.localStorage.getItem('olive-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.localStorage.setItem('olive-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredItems = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const inCategory = activeCategory === 'Popular' ? true : item.category === activeCategory;
      const matchesSearch = !text || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(text);
      return inCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice * item.quantity, 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  function openCustomize(item) {
    setSelectedItem(item);
    setDraft(emptyDraft);
  }

  function addCustomizedItem() {
    if (!selectedItem) return;

    const sizeExtra = sizeOptions.find((option) => option.label === draft.size)?.extra || 0;
    const selectedAddOns = draft.addOns.map((id) => addOns.find((entry) => entry.id === id)).filter(Boolean);
    const addOnTotal = selectedAddOns.reduce((total, entry) => total + entry.price, 0);
    const totalPrice = selectedItem.price + sizeExtra + addOnTotal;

    const cartId = [selectedItem.id, draft.size, ...selectedAddOns.map((entry) => entry.id).sort()].join('-');
    setCartItems((items) => {
      const existing = items.find((item) => item.cartId === cartId);
      if (existing) {
        return items.map((item) => item.cartId === cartId ? { ...item, quantity: item.quantity + draft.quantity } : item);
      }
      return [
        ...items,
        {
          cartId,
          id: selectedItem.id,
          name: selectedItem.name,
          size: draft.size,
          addOns: selectedAddOns.map((entry) => entry.name),
          totalPrice,
          quantity: draft.quantity,
        },
      ];
    });
    setSelectedItem(null);
  }

  function increment(cartId) {
    setCartItems((items) => items.map((item) => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item));
  }

  function decrement(cartId) {
    setCartItems((items) => items
      .map((item) => item.cartId === cartId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter((item) => item.quantity > 0));
  }

  function removeItem(cartId) {
    setCartItems((items) => items.filter((item) => item.cartId !== cartId));
  }

  function submitOrder(total) {
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    setOrder({ number: orderNumber, total, payment: customer.payment });
    setCartItems([]);
    setCheckoutOpen(false);
    setMobileCartOpen(false);
    setCustomer(initialCustomer);
  }

  return (
    <>
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main className="page-shell">
        <div className="content-column">
          <RestaurantHero />
          <PromoBanner />
          <CategoryTabs categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />

          <section className="menu-section" aria-label="Menu items">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Menu</span>
                <h2>{activeCategory}</h2>
              </div>
              <p>{filteredItems.length} dish{filteredItems.length === 1 ? '' : 'es'} available</p>
            </div>

            {filteredItems.length ? (
              <div className="menu-grid">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} onAdd={openCustomize} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No dishes found</h3>
                <p>Try another search term or category.</p>
              </div>
            )}
          </section>
        </div>

        <div className="cart-column">
          <Cart
            cartItems={cartItems}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={removeItem}
            onCheckout={() => setCheckoutOpen(true)}
          />
        </div>
      </main>

      {mobileCartOpen && (
        <div className="mobile-cart-sheet">
          <div className="sheet-handle">
            <button type="button" onClick={() => setMobileCartOpen(false)}>Close</button>
          </div>
          <Cart
            cartItems={cartItems}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={removeItem}
            onCheckout={() => setCheckoutOpen(true)}
          />
        </div>
      )}

      <MobileCartBar itemCount={itemCount} total={cartTotal} onOpen={() => setMobileCartOpen(true)} />

      <CustomizeModal
        item={selectedItem}
        draft={draft}
        onDraftChange={setDraft}
        onClose={() => setSelectedItem(null)}
        onConfirm={addCustomizedItem}
      />

      {checkoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          customer={customer}
          onCustomerChange={setCustomer}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={submitOrder}
        />
      )}

      <OrderSuccess order={order} onClose={() => setOrder(null)} />
    </>
  );
}
