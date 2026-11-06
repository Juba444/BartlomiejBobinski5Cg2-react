function Menu({ activePage, onNavigate, cart }) {
    const pages = ["Lista", "Dodaj produkt", "Koszyk"];

    return (
        <nav className="menu">
            {pages.map((page) => (
                <button
                    key={page}
                    className={activePage === page ? "active" : ""}
                    onClick={() => onNavigate(page)}
                >
                    {page === "Koszyk" ? `Koszyk (${cart})` : page}
                </button>
            ))}
        </nav>
    );
}

export default Menu;
