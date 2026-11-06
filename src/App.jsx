import { useState } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
import UserCard from "./components/UserCard";
import Footer from "./components/Footer";
import ProductList from "./views/productList";
import "./App.css";
import {
    getProducts,
    getProductByCategory,
    getProductSortedByPrice,
    getProductSortedByPriceDesc,
    getProductsUnderPrice,
    getProductsOverPrice,
    getProductExactPrice,
} from "./controllers/productController";

const products = getProducts();
const drinks = getProductByCategory("Napoje");
console.log(drinks);

const users = [
    {
        name: "Jan Kowalski",
        age: 19,
        city: "Warszawa"
    },
    {
        name: "Anna Nowak",
        age: 19,
        city: "Radzymin"
    },
];

const FILTER_OPTIONS = [
    { value: "wszystkie",  label: "Wszystkie" },
    { value: "sortAsc",    label: "Cena: rosnąco" },
    { value: "sortDesc",   label: "Cena: malejąco" },
    { value: "underPrice", label: "Cena poniżej..." },
    { value: "overPrice",  label: "Cena powyżej..." },
    { value: "exactPrice", label: "Dokładna cena..." },
];

function App() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Wszystkie");
    const [filterType, setFilterType] = useState("wszystkie");
    const [priceInput, setPriceInput] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [activePage, setActivePage] = useState("Lista");

    const categories = ["Wszystkie", ...new Set(products.map(p => p.category))];

    const needsPriceInput = ["underPrice", "overPrice", "exactPrice"].includes(filterType);
    const priceValue = parseFloat(priceInput);

    function getBaseProducts() {
        switch (filterType) {
            case "sortAsc":
                return getProductSortedByPrice();
            case "sortDesc":
                return getProductSortedByPriceDesc();
            case "underPrice":
                return !isNaN(priceValue) ? getProductsUnderPrice(priceValue) : products;
            case "overPrice":
                return !isNaN(priceValue) ? getProductsOverPrice(priceValue) : products;
            case "exactPrice":
                return !isNaN(priceValue) ? getProductExactPrice(priceValue) : products;
            default:
                return products;
        }
    }

    const filteredProducts = getBaseProducts()
        .filter(p => category === "Wszystkie" || p.category === category)
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

    function handleClear() {
        setQuery("");
        setCategory("Wszystkie");
        setFilterType("wszystkie");
        setPriceInput("");
    }

    function handleAddToCart(product) {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            }
            return [...prev, { ...product, qty: 1 }];
        });
    }

    function handleRemoveFromCart(id) {
        setCartItems(prev => prev.filter(item => item.id !== id));
    }

    function handleDecreaseQty(id) {
        setCartItems(prev => {
            const existing = prev.find(item => item.id === id);
            if (existing.qty === 1) {
                return prev.filter(item => item.id !== id);
            }
            return prev.map(item =>
                item.id === id ? { ...item, qty: item.qty - 1 } : item
            );
        });
    }

    function handleIncreaseQty(id) {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, qty: item.qty + 1 } : item
            )
        );
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className="app">
            <Header />

            <Menu
                activePage={activePage}
                onNavigate={setActivePage}
                cart={totalItems}
            />

            <main className="shop">
                {activePage === "Lista" && (
                    <>
                        <h1>Mój sklep</h1>
                        <p className="subtitle">najlepsze produkty</p>

                        <div className="filters">
                            <input
                                type="text"
                                placeholder="Szukaj produktu..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button onClick={handleClear}>Wyczyść</button>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPriceInput(""); }}>
                                {FILTER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {needsPriceInput && (
                                <input
                                    type="number"
                                    placeholder="Podaj cenę..."
                                    value={priceInput}
                                    onChange={(e) => setPriceInput(e.target.value)}
                                />
                            )}
                        </div>

                        <ProductList
                            products={filteredProducts}
                            onAdd={handleAddToCart}
                        />
                    </>
                )}

                {activePage === "Dodaj produkt" && (
                    <section>
                        <h1>Dodaj produkt</h1>
                        <p className="subtitle">formularz dodawania produktu</p>
                    </section>
                )}

                {activePage === "Koszyk" && (
                    <section>
                        <h1>Twój koszyk</h1>
                        {cartItems.length === 0 ? (
                            <p className="subtitle">Koszyk jest pusty.</p>
                        ) : (
                            <>
                                <table className="cart-table">
                                    <thead>
                                        <tr>
                                            <th>Produkt</th>
                                            <th>Cena</th>
                                            <th>Ilość</th>
                                            <th>Suma</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.name}</td>
                                                <td>{item.price} zł</td>
                                                <td>
                                                    <div className="qty-controls">
                                                        <button onClick={() => handleDecreaseQty(item.id)}>−</button>
                                                        <span>{item.qty}</span>
                                                        <button onClick={() => handleIncreaseQty(item.id)}>+</button>
                                                    </div>
                                                </td>
                                                <td>{item.price * item.qty} zł</td>
                                                <td>
                                                    <button onClick={() => handleRemoveFromCart(item.id)}>
                                                        Usuń
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="cart-total">Łącznie: <strong>{totalPrice} zł</strong></p>
                                <button onClick={() => setCartItems([])}>Wyczyść koszyk</button>
                            </>
                        )}
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default App;
