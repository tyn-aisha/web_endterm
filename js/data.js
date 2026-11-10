/* data.js: data shared by the services and booking pages (single source of truth for prices). */
const CAR_CLASSES = [
  { id: 'sedan',     name: 'Седан',       examples: 'Camry, A6, E-Class' },
  { id: 'crossover', name: 'Кроссовер',   examples: 'RAV4, X3, Q5' },
  { id: 'suv',       name: 'Внедорожник', examples: 'LC 300, X5, GLE' }
];

const PACKAGES = [
  { id: 'fresh', name: 'Fresh', featured: false, lead: 'Для ухоженной машины, которой нужна свежесть.',
    prices: { sedan: 25000, crossover: 30000, suv: 35000 },
    includes: ['Двухфазная мойка кузова', 'Очистка от металлических частиц', 'Лёгкая полировка', 'Воск-защита на 3 месяца'] },
  { id: 'ceramic', name: 'Ceramic', featured: true, lead: 'Глубокий блеск и защита кузова на годы.',
    prices: { sedan: 140000, crossover: 170000, suv: 210000 },
    includes: ['Всё из пакета Fresh', 'Коррекционная полировка', 'Керамическое покрытие, 5 лет', 'Керамика на стёкла', 'Письменная гарантия'] },
  { id: 'interior', name: 'Interior', featured: false, lead: 'Салон как из автосалона: чисто и без запаха.',
    prices: { sedan: 45000, crossover: 55000, suv: 65000 },
    includes: ['Глубокая химчистка салона', 'Чистка и кондиционер кожи', 'Озонирование', 'Чистка потолка и багажника'] }
];
