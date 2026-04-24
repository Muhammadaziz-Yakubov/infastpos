const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Store = require('./models/Store');

dotenv.config();

const categoriesData = [
  { name: 'Oziq-ovqat' },
  { name: 'Ichimliklar' },
  { name: 'Shirinliklar' },
  { name: 'Sut mahsulotlari' },
  { name: 'Maishiy texnika' },
  { name: 'Kiyim-kechak' },
  { name: 'O\'yinchoqlar' },
  { name: 'Kanselyariya' },
  { name: 'Parfumeriya' },
  { name: 'Meva va Sabzavotlar' }
];

const productsData = [
  // Ichimliklar
  { name: 'Coca-Cola 1.5L', categoryIdx: 1, sellPrice: 12500, buyPrice: 10000, quantity: 100, unit: 'dona', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pepsi 1.5L', categoryIdx: 1, sellPrice: 12000, buyPrice: 9500, quantity: 80, unit: 'dona', image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?q=80&w=500&auto=format&fit=crop' },
  { name: 'Fanta 1.5L', categoryIdx: 1, sellPrice: 12500, buyPrice: 10000, quantity: 60, unit: 'dona', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=500&auto=format&fit=crop' },
  { name: 'Hydrolife 0.5L', categoryIdx: 1, sellPrice: 3000, buyPrice: 2000, quantity: 200, unit: 'dona', image: 'https://images.unsplash.com/photo-1560312832-938d7e793b8c?q=80&w=500&auto=format&fit=crop' },
  { name: 'Chortoq 0.5L', categoryIdx: 1, sellPrice: 5000, buyPrice: 3500, quantity: 50, unit: 'dona', image: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?q=80&w=500&auto=format&fit=crop' },

  // Oziq-ovqat
  { name: 'Non (Buxanka)', categoryIdx: 0, sellPrice: 3000, buyPrice: 2500, quantity: 300, unit: 'dona', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop' },
  { name: 'Lays Chips 150g', categoryIdx: 0, sellPrice: 18000, buyPrice: 14000, quantity: 45, unit: 'dona', image: 'https://images.unsplash.com/photo-1566478431375-704386ca0220?q=80&w=500&auto=format&fit=crop' },
  { name: 'Guruch (Lazer)', categoryIdx: 0, sellPrice: 25000, buyPrice: 20000, quantity: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500&auto=format&fit=crop' },
  { name: 'Yog\' (Moya)', categoryIdx: 0, sellPrice: 18000, buyPrice: 15500, quantity: 90, unit: 'litr', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=500&auto=format&fit=crop' },
  { name: 'Shakar', categoryIdx: 0, sellPrice: 14000, buyPrice: 12000, quantity: 200, unit: 'kg', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?q=80&w=500&auto=format&fit=crop' },

  // Shirinliklar
  { name: 'Snickers King Size', categoryIdx: 2, sellPrice: 12000, buyPrice: 9000, quantity: 120, unit: 'dona', image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=500&auto=format&fit=crop' },
  { name: 'KitKat 4 Finger', categoryIdx: 2, sellPrice: 10000, buyPrice: 7500, quantity: 100, unit: 'dona', image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?q=80&w=500&auto=format&fit=crop' },
  { name: 'Choco Pie 12x', categoryIdx: 2, sellPrice: 24000, buyPrice: 18000, quantity: 30, unit: 'quti', image: 'https://images.unsplash.com/photo-1610614819513-58e34989848b?q=80&w=500&auto=format&fit=crop' },
  { name: 'M&M\'s Peanut 45g', categoryIdx: 2, sellPrice: 8000, buyPrice: 6000, quantity: 85, unit: 'dona', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=500&auto=format&fit=crop' },
  { name: 'Oreo Original', categoryIdx: 2, sellPrice: 15000, buyPrice: 11000, quantity: 55, unit: 'dona', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=500&auto=format&fit=crop' },

  // Sut mahsulotlari
  { name: 'Sut (Musaffo) 1L', categoryIdx: 3, sellPrice: 11000, buyPrice: 9000, quantity: 40, unit: 'dona', image: 'https://images.unsplash.com/photo-1550583724-1d552049521b?q=80&w=500&auto=format&fit=crop' },
  { name: 'Qatiq (Kichik)', categoryIdx: 3, sellPrice: 5000, buyPrice: 3500, quantity: 25, unit: 'dona', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=500&auto=format&fit=crop' },
  { name: 'Tvorog 250g', categoryIdx: 3, sellPrice: 15000, buyPrice: 11000, quantity: 20, unit: 'dona', image: 'https://images.unsplash.com/photo-1528750955925-50f6a03bb048?q=80&w=500&auto=format&fit=crop' },
  { name: 'Sariyog\' (Butter)', categoryIdx: 3, sellPrice: 22000, buyPrice: 17000, quantity: 35, unit: 'dona', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pishloq (Cheese)', categoryIdx: 3, sellPrice: 85000, buyPrice: 65000, quantity: 15, unit: 'kg', image: 'https://images.unsplash.com/photo-1486297678162-ad2a19b2598a?q=80&w=500&auto=format&fit=crop' },

  // Meva va Sabzavotlar
  { name: 'Olma (Qizil)', categoryIdx: 9, sellPrice: 14000, buyPrice: 10000, quantity: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bccb?q=80&w=500&auto=format&fit=crop' },
  { name: 'Banan', categoryIdx: 9, sellPrice: 22000, buyPrice: 18000, quantity: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1571771894821-ad9958a35c47?q=80&w=500&auto=format&fit=crop' },
  { name: 'Kartoshka', categoryIdx: 9, sellPrice: 6000, buyPrice: 4500, quantity: 500, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=500&auto=format&fit=crop' },
  { name: 'Piyoz', categoryIdx: 9, sellPrice: 4000, buyPrice: 2500, quantity: 400, unit: 'kg', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pomidor', categoryIdx: 9, sellPrice: 18000, buyPrice: 14000, quantity: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?q=80&w=500&auto=format&fit=crop' },

  // Kanselyariya
  { name: 'Daftar 12 varaqlik', categoryIdx: 7, sellPrice: 1000, buyPrice: 600, quantity: 1000, unit: 'dona', image: 'https://images.unsplash.com/photo-1586075010623-2658a9bc9b70?q=80&w=500&auto=format&fit=crop' },
  { name: 'Ruchka (Ko\'k)', categoryIdx: 7, sellPrice: 2000, buyPrice: 1200, quantity: 500, unit: 'dona', image: 'https://images.unsplash.com/photo-1585336139118-10c9372dca8d?q=80&w=500&auto=format&fit=crop' },
  { name: 'A4 Qog\'oz (Double A)', categoryIdx: 7, sellPrice: 45000, buyPrice: 38000, quantity: 40, unit: 'pachka', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=500&auto=format&fit=crop' },
  { name: 'Fayl (Pachka)', categoryIdx: 7, sellPrice: 25000, buyPrice: 20000, quantity: 60, unit: 'pachka', image: 'https://images.unsplash.com/photo-1595844737474-29dec4574721?q=80&w=500&auto=format&fit=crop' },
  { name: 'Qalam (Prostoy)', categoryIdx: 7, sellPrice: 1500, buyPrice: 900, quantity: 300, unit: 'dona', image: 'https://images.unsplash.com/photo-1523450001312-faa4e2e31f0f?q=80&w=500&auto=format&fit=crop' },

  // Parfumeriya
  { name: 'Shampun Clear', categoryIdx: 8, sellPrice: 35000, buyPrice: 28000, quantity: 45, unit: 'dona', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=500&auto=format&fit=crop' },
  { name: 'Sovun (Dove)', categoryIdx: 8, sellPrice: 12000, buyPrice: 9000, quantity: 100, unit: 'dona', image: 'https://images.unsplash.com/photo-1600857062241-99e5ad747c0c?q=80&w=500&auto=format&fit=crop' },
  { name: 'Tish pastasi (Colgate)', categoryIdx: 8, sellPrice: 18000, buyPrice: 14000, quantity: 70, unit: 'dona', image: 'https://images.unsplash.com/photo-1559591937-e68fb3305558?q=80&w=500&auto=format&fit=crop' },
  { name: 'Gel dlya dusha', categoryIdx: 8, sellPrice: 28000, buyPrice: 22000, quantity: 30, unit: 'dona', image: 'https://images.unsplash.com/photo-1559591937-e68fb3305558?q=80&w=500&auto=format&fit=crop' },
  { name: 'Atir-upa (Kichik)', categoryIdx: 8, sellPrice: 150000, buyPrice: 110000, quantity: 12, unit: 'dona', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop' },

  // Maishiy texnika (Kichik)
  { name: 'Choynak (Elektricheskiy)', categoryIdx: 4, sellPrice: 125000, buyPrice: 95000, quantity: 15, unit: 'dona', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3ecc50f6?q=80&w=500&auto=format&fit=crop' },
  { name: 'Fen (Xiaomi)', categoryIdx: 4, sellPrice: 280000, buyPrice: 220000, quantity: 8, unit: 'dona', image: 'https://images.unsplash.com/photo-1522338140262-f46f591261c2?q=80&w=500&auto=format&fit=crop' },
  { name: 'Mishka (Simsiz)', categoryIdx: 4, sellPrice: 85000, buyPrice: 65000, quantity: 25, unit: 'dona', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=500&auto=format&fit=crop' },
  { name: 'Klaviatura RGB', categoryIdx: 4, sellPrice: 180000, buyPrice: 140000, quantity: 12, unit: 'dona', image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=500&auto=format&fit=crop' },
  { name: 'Powerbank 10000mAh', categoryIdx: 4, sellPrice: 220000, buyPrice: 180000, quantity: 20, unit: 'dona', image: 'https://images.unsplash.com/photo-1609591035230-84a833a4d4a0?q=80&w=500&auto=format&fit=crop' },

  // Kiyim-kechak
  { name: 'Futbolka (Basic)', categoryIdx: 5, sellPrice: 45000, buyPrice: 35000, quantity: 60, unit: 'dona', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop' },
  { name: 'Paypoq (Cotton)', categoryIdx: 5, sellPrice: 10000, buyPrice: 7000, quantity: 200, unit: 'juft', image: 'https://images.unsplash.com/photo-1582966772640-310444797bb9?q=80&w=500&auto=format&fit=crop' },
  { name: 'Kepka (Nike)', categoryIdx: 5, sellPrice: 65000, buyPrice: 45000, quantity: 25, unit: 'dona', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=500&auto=format&fit=crop' },
  { name: 'Sharshara', categoryIdx: 5, sellPrice: 25000, buyPrice: 18000, quantity: 40, unit: 'dona', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=500&auto=format&fit=crop' },
  { name: 'Shortik', categoryIdx: 5, sellPrice: 35000, buyPrice: 25000, quantity: 50, unit: 'dona', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=500&auto=format&fit=crop' },

  // O'yinchoqlar
  { name: 'Lego Creator', categoryIdx: 6, sellPrice: 450000, buyPrice: 380000, quantity: 5, unit: 'dona', image: 'https://images.unsplash.com/photo-1585366119957-eabd666838a1?q=80&w=500&auto=format&fit=crop' },
  { name: 'Mashina (Pultli)', categoryIdx: 6, sellPrice: 180000, buyPrice: 140000, quantity: 15, unit: 'dona', image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=500&auto=format&fit=crop' },
  { name: 'Qo\'g\'irchoq (Barbie)', categoryIdx: 6, sellPrice: 85000, buyPrice: 65000, quantity: 20, unit: 'dona', image: 'https://images.unsplash.com/photo-1559124848-58133073b9ba?q=80&w=500&auto=format&fit=crop' },
  { name: 'Top (Futbol)', categoryIdx: 6, sellPrice: 125000, buyPrice: 95000, quantity: 30, unit: 'dona', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500&auto=format&fit=crop' },
  { name: 'Pazl 1000 taga', categoryIdx: 6, sellPrice: 45000, buyPrice: 35000, quantity: 40, unit: 'dona', image: 'https://images.unsplash.com/photo-1586733853239-2d930d63556f?q=80&w=500&auto=format&fit=crop' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDBga ulanildi...');

    // Birinchi do'konni topamiz
    const store = await Store.findOne();
    if (!store) {
      console.error('Xato: Bazada hech qanday do\'kon topilmadi! Oldin ro\'yxatdan o\'ting.');
      process.exit(1);
    }
    console.log(`Do'kon topildi: ${store.name} (ID: ${store._id})`);

    // Kategoriyalarni qo'shish
    const createdCategories = [];
    for (const catData of categoriesData) {
      const category = await Category.findOneAndUpdate(
        { name: catData.name, storeId: store._id },
        { name: catData.name, storeId: store._id },
        { upsert: true, new: true }
      );
      createdCategories.push(category);
    }
    console.log(`${createdCategories.length} ta kategoriya tayyor.`);

    // Mahsulotlarni qo'shish
    let productCount = 0;
    for (const prodData of productsData) {
      const category = createdCategories[prodData.categoryIdx];
      await Product.findOneAndUpdate(
        { name: prodData.name, storeId: store._id },
        {
          ...prodData,
          category: category._id,
          storeId: store._id,
          barcode: Math.floor(Math.random() * 9000000000000 + 1000000000000).toString()
        },
        { upsert: true }
      );
      productCount++;
    }

    console.log(`${productCount} ta mahsulot muvaffaqiyatli qo'shildi!`);
    console.log('Seed jarayoni yakunlandi.');
    process.exit(0);
  } catch (error) {
    console.error('Xato yuz berdi:', error);
    process.exit(1);
  }
};

seedDB();
