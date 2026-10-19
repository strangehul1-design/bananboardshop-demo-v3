/* BANANBOARDSHOP — данные каталога.
   Названия, цены и характеристики взяты из витрины магазина ВКонтакте (vk.com/bananboardshop).
   Чтобы поменять цену или добавить товар — правьте этот файл: сайт соберётся сам. */
window.BB = {
  vkGroup: 'https://vk.com/bananboardshop',
  vkMarket: 'https://vk.com/market-32281701',
  vkDialog: 'https://vk.com/im?sel=-32281701',
  phones: [
    { tel: '+73519003119', text: '+7 (351) 900-31-19', who: 'Соня' },
    { tel: '+73519003401', text: '+7 (351) 900-34-01', who: 'Курча' }
  ],
  email: 'info@bananboardshop.ru',

  cats: [
    { id: 'all', label: 'Всё' },
    { id: 'jackets', label: 'Куртки' },
    { id: 'pants', label: 'Брюки' },
    { id: 'boards', label: 'Сноуборды' },
    { id: 'head', label: 'Шлемы и маски' },
    { id: 'boots', label: 'Ботинки' }
  ],

  /* Образ из лукбука — товар, который в нём главный */
  hero: { id: '13550499', size: 'M' },

  /* new: true — карточка попадает в сетку «Новая коллекция» */
  products: [
    {
      id: '13550526', name: 'Пуховик Anteater', desc: 'Пуффер · Shelter + холлофайбер · оверсайз',
      cat: 'jackets', price: 13000, img: 'assets/img/catalog/13550526.webp',
      colors: [['#17181d', 'чёрный']], apparel: true
    },
    {
      id: '13550499', name: 'Анорак Anteater', desc: 'Анорак · Dewspo · карман-кенгуру',
      cat: 'jackets', price: 4800, img: 'assets/img/catalog/13550499.webp',
      colors: [['#17181d', 'чёрный']], apparel: true
    },
    {
      id: '10972990', name: 'Ветровка Anteater', desc: 'Ветровка · капюшон · карго-карманы',
      cat: 'jackets', price: 6000, img: 'assets/img/catalog/10972990.webp',
      colors: [['#b78f53', 'песочный']], apparel: true, new: true
    },
    {
      id: '13007099', name: 'Ветровка Anteater', desc: 'Анорак-ветровка · полумолния',
      cat: 'jackets', price: 3400, img: 'assets/img/catalog/13007099.webp',
      colors: [['#51482f', 'хаки']], apparel: true
    },
    {
      id: '10080742', name: 'Анорак 686', desc: 'Мембрана 10K · утеплённый',
      cat: 'jackets', price: 30950, img: 'assets/img/catalog/10080742.webp',
      colors: [['#17181d', 'чёрный'], ['#b497d8', 'лаванда']], apparel: true, new: true
    },
    {
      id: '7737908', name: 'Куртка 686', desc: 'Мембрана 10K · утеплённая · капюшон',
      cat: 'jackets', price: 29550, img: 'assets/img/catalog/7737908.webp',
      colors: [['#7c8087', 'серый'], ['#17181d', 'чёрный']], apparel: true
    },
    {
      id: '13516790', name: 'Брюки Burton', desc: 'Брюки · усиленные колени · манжеты',
      cat: 'pants', price: 14950, img: 'assets/img/catalog/13516790.webp',
      colors: [['#6b7f2f', 'оливковый']], apparel: true, new: true
    },
    {
      id: '10207733', name: 'Сноуборд Capita', desc: 'Сноуборд',
      cat: 'boards', price: 60450, img: 'assets/img/catalog/10207733.webp',
      colors: []
    },
    {
      id: '13448742', name: 'Сноуборд Joint', desc: 'Сноуборд',
      cat: 'boards', price: 24000, img: 'assets/img/catalog/13448742.webp',
      colors: []
    },
    {
      id: '13448869', name: 'Шлем Anon', desc: 'Шлем · женская модель',
      cat: 'head', price: 8970, img: 'assets/img/catalog/13448869.webp',
      colors: [['#24403a', 'тёмно-зелёный'], ['#3fb5a3', 'бирюзовый']], new: true
    },
    {
      id: '13317545', name: 'Маска Kyoto', desc: 'Маска · линза на магнитах',
      cat: 'head', price: 6950, img: 'assets/img/catalog/13317545.webp',
      colors: [['#f0612a', 'оранжевая линза']], new: true
    },
    {
      id: '13287317', name: 'Ботинки ThirtyTwo', desc: 'Ботинки для сноуборда · шнуровка',
      cat: 'boots', price: 37500, img: 'assets/img/catalog/13287317.webp',
      colors: [['#2c2f34', 'графит'], ['#b7e11b', 'лайм']]
    },
    {
      id: '12073166', name: 'Ботинки DC Mutiny', desc: 'Ботинки для сноуборда · шнуровка',
      cat: 'boots', price: 24650, img: 'assets/img/catalog/12073166.webp',
      colors: [['#44532f', 'камуфляж']]
    }
  ]
};

BB.byId = function (id) {
  return BB.products.find(function (p) { return p.id === id; });
};
BB.productUrl = function (id) {
  return 'https://vk.com/product-32281701_' + id;
};
