import ProductCard from "../components/ProductCard";

function ProductList ({products, onAdd}){
    return(
        <section className="products">
            {products.length > 0 ? (
                products.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        category={product.category}
                        onAdd={() => onAdd(product)}
                    />
                ))
            ) : (
                <p>Nie znaleziono produktów.</p>
            )}
        </section>
    );
}
export default ProductList