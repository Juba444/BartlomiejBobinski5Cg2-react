// function ProductCard({name, price, category, image}){
//     return(
//         <div>
//             <img src={image} alt={name}/>
//             <h2>{name}</h2>
//             <p>kategoria: {category}</p>
//             <p>cena: {price} zł</p>
//             <button>Dodaj do koszyka</button>
//         </div>
//     );
// }

//  <ProductCard 
//                 name="kawa" 
//                 price="25" 
//                 category="napoje" 
//                 image={produkImg}/>
//             <ProductCard 
//                 name="Herbata" 
//                 price="15" 
//                 category="napoje"
//                 image="./img/1png"/>
//             <ProductCard 
//             name="czekolada" 
//             price="10" 
//             category="słodycze" 
//             image="./img/1png" />

function ProductCard({name, price, category, image, onAdd}){
    return(
        <article className="product-card">
            {image && <img src={image} alt={name}/>}
            <h3>{name}</h3>
            <p>kategoria: {category}</p>
            <p>cena: {price} zł</p>
            <button onClick={onAdd}>Dodaj do koszyka</button>
        </article>
    );
}

export default ProductCard;