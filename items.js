// Data item yang tersedia untuk pre order
const items = [
    {
        id: 'ITEM001',
        name: 'Nike Air Max',
        category: 'Sepatu',
        description: 'Sepatu running dengan teknologi Air Max terbaru',
        price: 2500000,
        variants: ['38', '39', '40', '41', '42', '43', '44']
    },
    {
        id: 'ITEM002',
        name: 'Adidas Ultraboost',
        category: 'Sepatu',
        description: 'Sepatu lifestyle dengan teknologi Boost',
        price: 2800000,
        variants: ['38', '39', '40', '41', '42', '43', '44']
    },
    {
        id: 'ITEM003',
        name: 'Nike Dri-FIT',
        category: 'Baju',
        description: 'Kaos olahraga dengan teknologi moisture-wicking',
        price: 450000,
        variants: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
        id: 'ITEM004',
        name: 'Adidas Track Pants',
        category: 'Celana',
        description: 'Celana training dengan bahan ringan',
        price: 800000,
        variants: ['S', 'M', 'L', 'XL', 'XXL']
    }
];

// Export items agar bisa digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = items;
}
