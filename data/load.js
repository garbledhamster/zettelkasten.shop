// data/load.js
import { renderProducts, renderCategoryFilters, applyCategoryFilter, resetFilters, setAllProducts, setAllCategories, setBodyData } from './gui.js'

let allCategories = new Set();
let allProducts = [];

// Load products
fetch('data/products.json')
    .then(r => r.json())
    .then(products => {
        allProducts = products;
        setAllProducts(products);
        products.forEach(p => {
            p.categories.forEach(cat => allCategories.add(cat));
        });
        setAllCategories(allCategories);
        renderCategoryFilters(allCategories, resetFilters, applyCategoryFilter);
        renderProducts(allProducts);
    })
    .catch(e => console.error('Error loading products:', e))

// Load body data
fetch('data/body.json')
    .then(r => r.json())
    .then(d => {
        setBodyData(d);
    })
    .catch(e => console.error('Error loading body text:', e))
