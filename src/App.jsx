
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Menu from "./components/Menu";
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

// PRZYKŁADOWE KONTA
const users = [
    {
        username: "admin",
        password: "admin123"
    },
    {
        username: "Anna",
        password: "AnkaTop"
    }
];

// ODCZYTYWANIE CIASTECZKA
function getCookie(name) {
    const cookies = document.cookie.split("; ");

    const cookie = cookies.find(item =>
        item.startsWith(name + "=")
    );

    if (!cookie) return null;

    return decodeURIComponent(cookie.substring(name.length + 1));
}

// USUWANIE CIASTECZKA
function deleteCookie(name) {
    document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

// ZAPIS UŻYTKOWNIKA
function saveUser(username) {
    document.cookie = `user=${encodeURIComponent(username)}; path=/; SameSite=Lax`;
}

// ODCZYT UŻYTKOWNIKA
function loadUser() {
    return getCookie("user");
}

// ZAPIS KOSZYKA
function saveCart(username, cart) {
    document.cookie = `cart_${username}=${encodeURIComponent(JSON.stringify(cart))}; max-age=${60 * 60 * 24 * 7}; path=/; SameSite=Lax`;
}

// ODCZYT KOSZYKA
function loadCart(username) {
    const cart = getCookie("cart_" + username);

    if (!cart) return [];

    try {
        const parsedCart = JSON.parse(cart);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
        return [];
    }
}

const products = getProducts();

const FILTER_OPTIONS = [
    { value: "wszystkie", label: "Wszystkie" },
    { value: "sortAsc", label: "Cena: rosnąco" },
    { value: "sortDesc", label: "Cena: malejąco" },
    { value: "underPrice", label: "Cena poniżej..." },
    { value: "overPrice", label: "Cena powyżej..." },
    { value: "exactPrice", label: "Dokładna cena..." },
];

function App() {

    // LOGOWANIE
    const [currentUser, setCurrentUser] = useState(loadUser);

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // FILTRY
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Wszystkie");
    const [filterType, setFilterType] = useState("wszystkie");
    const [priceInput, setPriceInput] = useState("");

    // KOSZYK
    const [cartItems, setCartItems] = useState(() => {
        const username = loadUser();
    
        return username ? loadCart(username) : [];
    });

    const [activePage, setActivePage] = useState("Lista");

    // AUTOMATYCZNY ZAPIS KOSZYKA
    useEffect(() => {
        if (currentUser) {
            saveCart(currentUser, cartItems);
        }
    }, [cartItems, currentUser]);

    // LOGOWANIE UŻYTKOWNIKA
    function handleLogin(e) {
        e.preventDefault();
    
        const user = users.find(u =>
            u.username === login &&
            u.password === password
        );
    
        if (user) {
            // Pobranie koszyka nowego użytkownika
            const userCart = loadCart(user.username);
    
            // Ustawienie koszyka
            setCartItems(userCart);
    
            // Zapisanie użytkownika
            saveUser(user.username);
            setCurrentUser(user.username);
    
            setLogin("");
            setPassword("");
            setLoginError("");
    
            setActivePage("Lista");
    
        } else {
            setLoginError("Nieprawidłowy login lub hasło!");
        }
    }

    // WYLOGOWANIE
    function handleLogout() {
        deleteCookie("user");
    
        setCurrentUser(null);
        setCartItems([]);
    
        setActivePage("Lista");
    }

    const categories = [
        "Wszystkie",
        ...new Set(products.map(p => p.category))
    ];

    const needsPriceInput = [
        "underPrice",
        "overPrice",
        "exactPrice"
    ].includes(filterType);

    const priceValue = parseFloat(priceInput);

    // FILTROWANIE PRODUKTÓW
    function getBaseProducts() {
        switch (filterType) {
            case "sortAsc":
                return getProductSortedByPrice();

            case "sortDesc":
                return getProductSortedByPriceDesc();

            case "underPrice":
                return !isNaN(priceValue)
                    ? getProductsUnderPrice(priceValue)
                    : products;

            case "overPrice":
                return !isNaN(priceValue)
                    ? getProductsOverPrice(priceValue)
                    : products;

            case "exactPrice":
                return !isNaN(priceValue)
                    ? getProductExactPrice(priceValue)
                    : products;

            default:
                return products;
        }
    }

    const filteredProducts = getBaseProducts()
        .filter(p =>
            category === "Wszystkie" || p.category === category
        )
        .filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase())
        );

    function handleClear() {
        setQuery("");
        setCategory("Wszystkie");
        setFilterType("wszystkie");
        setPriceInput("");
    }

    // DODAWANIE PRODUKTU
    function handleAddToCart(product) {
        setCartItems(prev => {
            const existing = prev.find(
                item => item.id === product.id
            );

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

    // USUWANIE PRODUKTU
    function handleRemoveFromCart(id) {
        setCartItems(prev =>
            prev.filter(item => item.id !== id)
        );
    }

    // ZMNIEJSZANIE ILOŚCI
    function handleDecreaseQty(id) {
        setCartItems(prev => {
            const existing = prev.find(
                item => item.id === id
            );

            if (existing.qty === 1) {
                return prev.filter(item => item.id !== id);
            }

            return prev.map(item =>
                item.id === id
                    ? { ...item, qty: item.qty - 1 }
                    : item
            );
        });
    }

    // ZWIĘKSZANIE ILOŚCI
    function handleIncreaseQty(id) {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, qty: item.qty + 1 }
                    : item
            )
        );
    }

    const totalItems = cartItems.reduce(
        (sum, item) => sum + item.qty, 0
    );

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    return (
        <div className="app">

            <Header />

            {/* FORMULARZ LOGOWANIA */}
            {!currentUser ? (

                <main className="shop">
                    <section className="login-section">

                        <h1>Logowanie</h1>
                        <p className="subtitle">
                            Zaloguj się, aby przejść do sklepu.
                        </p>

                        <form onSubmit={handleLogin}>

                            <input
                                type="text"
                                placeholder="Login"
                                value={login}
                                onChange={e =>
                                    setLogin(e.target.value)
                                }
                                required
                            />

                            <input
                                type="password"
                                placeholder="Hasło"
                                value={password}
                                onChange={e =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                            <button type="submit">
                                Zaloguj się
                            </button>

                        </form>

                        {loginError && (
                            <p style={{ color: "red" }}>
                                {loginError}
                            </p>
                        )}

                    </section>
                </main>

            ) : (

                <>
                    {/* MENU */}
                    <Menu
                        activePage={activePage}
                        onNavigate={setActivePage}
                        cart={totalItems}
                    />

                    <main className="shop">

                        <div className="user-info">
                            <p>
                                Zalogowany użytkownik:
                                <strong> {currentUser}</strong>
                            </p>

                            <button onClick={handleLogout}>
                                Wyloguj się
                            </button>
                        </div>

                        {/* LISTA PRODUKTÓW */}
                        {activePage === "Lista" && (
                            <>
                                <h1>Mój sklep</h1>

                                <p className="subtitle">
                                    najlepsze produkty
                                </p>

                                <div className="filters">

                                    <input
                                        type="text"
                                        placeholder="Szukaj produktu..."
                                        value={query}
                                        onChange={e =>
                                            setQuery(e.target.value)
                                        }
                                    />

                                    <button onClick={handleClear}>
                                        Wyczyść
                                    </button>

                                    <select
                                        value={category}
                                        onChange={e =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterType}
                                        onChange={e => {
                                            setFilterType(e.target.value);
                                            setPriceInput("");
                                        }}
                                    >
                                        {FILTER_OPTIONS.map(opt => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    {needsPriceInput && (
                                        <input
                                            type="number"
                                            placeholder="Podaj cenę..."
                                            value={priceInput}
                                            onChange={e =>
                                                setPriceInput(e.target.value)
                                            }
                                        />
                                    )}

                                </div>

                                <ProductList
                                    products={filteredProducts}
                                    onAdd={handleAddToCart}
                                />
                            </>
                        )}

                        {/* DODAWANIE PRODUKTU */}
                        {activePage === "Dodaj produkt" && (
                            <section>
                                <h1>Dodaj produkt</h1>
                                <p className="subtitle">
                                    formularz dodawania produktu
                                </p>
                            </section>
                        )}

                        {/* KOSZYK */}
                        {activePage === "Koszyk" && (
                            <section>

                                <h1>Twój koszyk</h1>

                                {cartItems.length === 0 ? (

                                    <p className="subtitle">
                                        Koszyk jest pusty.
                                    </p>

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

                                                        <td>
                                                            {item.price} zł
                                                        </td>

                                                        <td>
                                                            <div className="qty-controls">

                                                                <button
                                                                    onClick={() =>
                                                                        handleDecreaseQty(item.id)
                                                                    }
                                                                >
                                                                    −
                                                                </button>

                                                                <span>
                                                                    {item.qty}
                                                                </span>

                                                                <button
                                                                    onClick={() =>
                                                                        handleIncreaseQty(item.id)
                                                                    }
                                                                >
                                                                    +
                                                                </button>

                                                            </div>
                                                        </td>

                                                        <td>
                                                            {item.price * item.qty} zł
                                                        </td>

                                                        <td>
                                                            <button
                                                                onClick={() =>
                                                                    handleRemoveFromCart(item.id)
                                                                }
                                                            >
                                                                Usuń
                                                            </button>
                                                        </td>

                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>

                                        <p className="cart-total">
                                            Łącznie:
                                            <strong> {totalPrice} zł</strong>
                                        </p>

                                        <button
                                            onClick={() => setCartItems([])}
                                        >
                                            Wyczyść koszyk
                                        </button>
                                    </>

                                )}

                            </section>
                        )}

                    </main>
                </>
            )}
            <Footer />
        </div>
    );
}
export default App;
