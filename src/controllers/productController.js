import products from "../model/productModel";

function getProducts(){
    return products;
}

function getProductById(id){
    return products.find(product => product.id === id);
}

function getProductByCategory(category){
    return products.filter(product => product.category === category);
}

function getProductSortedByPrice(){
    return [...products].sort((a, b) => a.price - b.price);
}

function getProductSortedByPriceDesc(){
    return [...products].sort((a, b) => b.price - a.price);
}

function getProductByName(name){
    return products.find(product => product.name === name);
}

function getProductsUnderPrice(maxPrice){
    return products.filter(product => product.price < maxPrice);
}

function getProductsOverPrice(minPrice){
    return products.filter(product => product.price > minPrice);
}

function getProductExactPrice(price){
    return products.filter(product => product.price === price);
}

function getProductsCount(){
    return products.length;
}

function searchProducts(query){
    return products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
    );
}

export {getProducts, getProductById, getProductByCategory, getProductSortedByPrice, getProductSortedByPriceDesc, getProductsUnderPrice, getProductsOverPrice, getProductByName, getProductExactPrice, getProductsCount, searchProducts};