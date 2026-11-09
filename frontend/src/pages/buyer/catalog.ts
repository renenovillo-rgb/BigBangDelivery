import {
  Salad, Carrot, Apple, Egg, Wheat, Cherry, Milk, Shirt, Notebook, Pencil, Leaf, Sofa,
  Car, Hammer, Baby, GraduationCap, Scissors, Smartphone, PartyPopper, Zap, Wrench, Droplet,
  PaintRoller, HandHelping, Dog, Laptop, Music, Camera, Cake, Brush, Sparkles, Armchair,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* Datos de ejemplo del módulo comprador (maqueta). Se reemplazan por la API cuando exista. */

export interface Subcategory { id: string; label: string }
export interface Category { id: string; label: string; icon: LucideIcon; subs: Subcategory[] }

export interface ProductOption { label: string; price: number }
export interface Product {
  id: string; name: string; short: string; icon: LucideIcon; own: boolean; rating: number;
  tone: string; iconColor: string; origin: string; options: ProductOption[];
  categoryId: string; subId: string;
}

export type ServiceUnit = 'hora' | 'visita' | 'servicio';
export interface Service {
  id: string; title: string; provider: string; icon: LucideIcon; rating: number; jobs: number;
  zone: string; price: number; unit: ServiceUnit; description: string; tone: string; iconColor: string;
  categoryId: string; subId: string;
}

export type OrderStatus = 'Preparando' | 'En camino' | 'Entregado' | 'Cancelado';
export interface Order {
  id: string; date: string; kind: 'Producto' | 'Servicio'; summary: string; total: number; status: OrderStatus;
}

/* ------------------------------ Categorías ------------------------------ */

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'verduras', label: 'Verduras', icon: Salad,
    subs: [{ id: 'hojas', label: 'Hojas verdes' }, { id: 'raices', label: 'Raíces y tubérculos' }, { id: 'hortalizas', label: 'Hortalizas' }],
  },
  {
    id: 'frutas', label: 'Frutas', icon: Apple,
    subs: [{ id: 'altura', label: 'De altura' }, { id: 'rojos', label: 'Frutos rojos' }, { id: 'citricos', label: 'Cítricos' }],
  },
  {
    id: 'lacteos', label: 'Lácteos y huevos', icon: Milk,
    subs: [{ id: 'leche', label: 'Leche' }, { id: 'quesos', label: 'Quesos' }, { id: 'huevos', label: 'Huevos' }],
  },
  {
    id: 'granos', label: 'Granos y cereales', icon: Wheat,
    subs: [{ id: 'quinua', label: 'Quinua y amaranto' }, { id: 'legumbres', label: 'Legumbres' }, { id: 'harinas', label: 'Harinas' }],
  },
  {
    id: 'vestimenta', label: 'Vestimenta', icon: Shirt,
    subs: [{ id: 'hombre', label: 'Hombre' }, { id: 'mujer', label: 'Mujer' }, { id: 'ninos', label: 'Niños' }],
  },
  {
    id: 'papeleria', label: 'Papelería', icon: Notebook,
    subs: [{ id: 'cuadernos', label: 'Cuadernos' }, { id: 'utiles', label: 'Útiles escolares' }, { id: 'oficina', label: 'Oficina' }],
  },
  {
    id: 'hogar', label: 'Hogar', icon: Sofa,
    subs: [{ id: 'limpieza', label: 'Limpieza ecológica' }, { id: 'decoracion', label: 'Decoración' }, { id: 'cocina', label: 'Cocina' }],
  },
];

export const SERVICE_CATEGORIES: Category[] = [
  {
    id: 'vehiculos', label: 'Mecánica y vehículos', icon: Car,
    subs: [{ id: 'mecanico', label: 'Mecánico' }, { id: 'lavado', label: 'Lavado y detailing' }, { id: 'llantas', label: 'Llantas y frenos' }],
  },
  {
    id: 'mantenimiento', label: 'Hogar y mantenimiento', icon: Hammer,
    subs: [
      { id: 'electricista', label: 'Electricista' }, { id: 'plomero', label: 'Plomería' },
      { id: 'carpintero', label: 'Carpintería' }, { id: 'pintor', label: 'Pintura' },
    ],
  },
  {
    id: 'cuidado', label: 'Cuidado de personas', icon: HandHelping,
    subs: [{ id: 'ninera', label: 'Niñera' }, { id: 'adultos', label: 'Adultos mayores' }, { id: 'mascotas', label: 'Mascotas' }],
  },
  {
    id: 'educacion', label: 'Educación', icon: GraduationCap,
    subs: [{ id: 'refuerzo', label: 'Refuerzo escolar' }, { id: 'idiomas', label: 'Idiomas' }, { id: 'musica', label: 'Música' }],
  },
  {
    id: 'belleza', label: 'Belleza y bienestar', icon: Scissors,
    subs: [{ id: 'peluqueria', label: 'Peluquería' }, { id: 'manicure', label: 'Manicure y pedicure' }, { id: 'masajes', label: 'Masajes' }],
  },
  {
    id: 'tecnologia', label: 'Tecnología', icon: Smartphone,
    subs: [{ id: 'celulares', label: 'Reparación de celulares' }, { id: 'computadoras', label: 'Computadoras' }, { id: 'redes', label: 'Redes e internet' }],
  },
  {
    id: 'eventos', label: 'Eventos', icon: PartyPopper,
    subs: [{ id: 'catering', label: 'Catering' }, { id: 'fotografia', label: 'Fotografía' }, { id: 'decoracion', label: 'Decoración de eventos' }],
  },
];

/* ------------------------------ Productos ------------------------------ */

export const PRODUCTS: Product[] = [
  {
    id: 'lechuga', name: 'Lechuga crespa hidropónica', short: 'Lechugas', icon: Salad, own: true, rating: 4.9,
    tone: 'from-[#DCE8D2] to-[#B9D1AE]', iconColor: 'text-[#4F6F52]', categoryId: 'verduras', subId: 'hojas',
    origin: 'Cultivada en nuestros invernaderos hidropónicos de Horizonte Sostenible, con agua recirculada, sin pesticidas y cosechada el mismo día de tu pedido.',
    options: [{ label: 'Atado 250 g', price: 1.5 }, { label: 'Malla 500 g', price: 2.6 }, { label: 'Caja 1 kg', price: 4.8 }],
  },
  {
    id: 'zanahoria', name: 'Zanahoria orgánica', short: 'Zanahorias', icon: Carrot, own: false, rating: 4.7,
    tone: 'from-[#F3E3C7] to-[#E8C896]', iconColor: 'text-[#B7792B]', categoryId: 'verduras', subId: 'raices',
    origin: 'Producida por pequeños agricultores aliados de la sierra, con rotación de cultivos y abonos naturales.',
    options: [{ label: 'Funda 500 g', price: 1.2 }, { label: 'Funda 1 kg', price: 2.1 }],
  },
  {
    id: 'tomate', name: 'Tomate riñón de invernadero', short: 'Tomates', icon: Leaf, own: true, rating: 4.8,
    tone: 'from-[#F2D9D0] to-[#E5B3A4]', iconColor: 'text-[#B4533C]', categoryId: 'verduras', subId: 'hortalizas',
    origin: 'Cultivado en nuestros invernaderos con riego por goteo y control biológico de plagas.',
    options: [{ label: 'Malla 500 g', price: 1.4 }, { label: 'Caja 2 kg', price: 4.9 }],
  },
  {
    id: 'manzana', name: 'Manzana verde de altura', short: 'Manzanas', icon: Apple, own: false, rating: 4.6,
    tone: 'from-[#E4EDCB] to-[#C9DB9F]', iconColor: 'text-[#6C8B3A]', categoryId: 'frutas', subId: 'altura',
    origin: 'Frutal de altura con riego tecnificado y control biológico de plagas.',
    options: [{ label: 'Malla 1 kg', price: 2.9 }, { label: 'Caja 3 kg', price: 7.9 }],
  },
  {
    id: 'mora', name: 'Mora de castilla', short: 'Moras', icon: Cherry, own: true, rating: 4.8,
    tone: 'from-[#EBD9DF] to-[#D8B4C0]', iconColor: 'text-[#8A4A5F]', categoryId: 'frutas', subId: 'rojos',
    origin: 'Cosechada a mano en nuestros lotes agroecológicos y entregada en cadena de frío.',
    options: [{ label: 'Tarrina 250 g', price: 2.4 }, { label: 'Tarrina 500 g', price: 4.3 }],
  },
  {
    id: 'leche', name: 'Leche entera de finca', short: 'Leche', icon: Milk, own: false, rating: 4.7,
    tone: 'from-[#EEF1F4] to-[#D6DEE6]', iconColor: 'text-[#5B7388]', categoryId: 'lacteos', subId: 'leche',
    origin: 'Ordeño diario de ganaderos aliados, pasteurizada y envasada en botella retornable.',
    options: [{ label: 'Botella 1 L', price: 1.3 }, { label: 'Pack 3 L', price: 3.7 }],
  },
  {
    id: 'queso', name: 'Queso fresco artesanal', short: 'Queso', icon: Sparkles, own: false, rating: 4.8,
    tone: 'from-[#F8EBC2] to-[#EBD389]', iconColor: 'text-[#A88A22]', categoryId: 'lacteos', subId: 'quesos',
    origin: 'Elaborado por una asociación de mujeres lecheras de la zona con leche del día.',
    options: [{ label: 'Libra', price: 3.5 }, { label: 'Dos libras', price: 6.6 }],
  },
  {
    id: 'huevos', name: 'Huevos de campo', short: 'Huevos', icon: Egg, own: true, rating: 4.9,
    tone: 'from-[#F6EBD6] to-[#EAD6AE]', iconColor: 'text-[#A9803F]', categoryId: 'lacteos', subId: 'huevos',
    origin: 'Gallinas criadas en libre pastoreo dentro de la granja Horizonte Sostenible, alimentadas con granos propios.',
    options: [{ label: 'Media docena', price: 2.2 }, { label: 'Docena', price: 4.1 }],
  },
  {
    id: 'quinua', name: 'Quinua en grano', short: 'Quinua', icon: Wheat, own: false, rating: 4.8,
    tone: 'from-[#EFE6CF] to-[#DCCB9E]', iconColor: 'text-[#8C7435]', categoryId: 'granos', subId: 'quinua',
    origin: 'Grano andino lavado y seleccionado, cultivado sin agroquímicos por cooperativas locales.',
    options: [{ label: 'Bolsa 500 g', price: 3.2 }, { label: 'Bolsa 1 kg', price: 5.9 }],
  },
  {
    id: 'frejol', name: 'Fréjol canario seco', short: 'Fréjol', icon: Wheat, own: false, rating: 4.5,
    tone: 'from-[#F3E7C9] to-[#E3CF98]', iconColor: 'text-[#9A7B2E]', categoryId: 'granos', subId: 'legumbres',
    origin: 'Seleccionado a mano por pequeños productores de la provincia.',
    options: [{ label: 'Bolsa 500 g', price: 2.1 }, { label: 'Bolsa 1 kg', price: 3.8 }],
  },
  {
    id: 'camiseta', name: 'Camiseta de algodón orgánico', short: 'Camiseta', icon: Shirt, own: false, rating: 4.6,
    tone: 'from-[#DDE7EE] to-[#B8CCDA]', iconColor: 'text-[#4D6B82]', categoryId: 'vestimenta', subId: 'hombre',
    origin: 'Confeccionada por un taller textil local con algodón certificado y teñido natural.',
    options: [{ label: 'Talla M', price: 12 }, { label: 'Talla L', price: 12 }, { label: 'Talla XL', price: 13 }],
  },
  {
    id: 'blusa', name: 'Blusa bordada artesanal', short: 'Blusa', icon: Shirt, own: false, rating: 4.9,
    tone: 'from-[#F0DDE6] to-[#DDB6C7]', iconColor: 'text-[#8A4A6B]', categoryId: 'vestimenta', subId: 'mujer',
    origin: 'Bordada a mano por artesanas de la comunidad. Cada pieza es única.',
    options: [{ label: 'Talla S', price: 18 }, { label: 'Talla M', price: 18 }, { label: 'Talla L', price: 19 }],
  },
  {
    id: 'cuaderno', name: 'Cuaderno ecológico 100 hojas', short: 'Cuaderno', icon: Notebook, own: false, rating: 4.5,
    tone: 'from-[#E6EBDD] to-[#C8D3B8]', iconColor: 'text-[#5E7448]', categoryId: 'papeleria', subId: 'cuadernos',
    origin: 'Papel reciclado y tapa de cartón reutilizado, fabricado por un emprendimiento local.',
    options: [{ label: 'Rayado', price: 2.5 }, { label: 'Cuadriculado', price: 2.5 }],
  },
  {
    id: 'esferos', name: 'Esferos de material reciclado', short: 'Esferos', icon: Pencil, own: false, rating: 4.4,
    tone: 'from-[#E9E4F2] to-[#CFC4E3]', iconColor: 'text-[#6B5A94]', categoryId: 'papeleria', subId: 'utiles',
    origin: 'Fabricados con plástico recuperado. Tinta de larga duración.',
    options: [{ label: 'Pack x3', price: 1.8 }, { label: 'Pack x12', price: 5.9 }],
  },
  {
    id: 'detergente', name: 'Detergente biodegradable', short: 'Detergente', icon: Droplet, own: false, rating: 4.6,
    tone: 'from-[#DDEEF0] to-[#B5D8DD]', iconColor: 'text-[#3F8089]', categoryId: 'hogar', subId: 'limpieza',
    origin: 'Fórmula vegetal sin fosfatos, en envase recargable.',
    options: [{ label: 'Botella 1 L', price: 3.9 }, { label: 'Recarga 3 L', price: 9.5 }],
  },
  {
    id: 'canasta', name: 'Canasta tejida de totora', short: 'Canasta', icon: Armchair, own: false, rating: 4.8,
    tone: 'from-[#F1E5D0] to-[#DFC9A0]', iconColor: 'text-[#8F6B2F]', categoryId: 'hogar', subId: 'decoracion',
    origin: 'Tejida a mano por artesanos de la zona con fibra natural de totora.',
    options: [{ label: 'Pequeña', price: 8 }, { label: 'Grande', price: 14 }],
  },
];

/* ------------------------------ Servicios ------------------------------ */
/* Todos los profesionales figuran como aprobados por la administración. */

export const SERVICES: Service[] = [
  {
    id: 'mecanico-andes', title: 'Mecánica general a domicilio', provider: 'Taller Los Andes', icon: Wrench, rating: 4.8, jobs: 214,
    zone: 'Norte de Quito', price: 15, unit: 'visita', categoryId: 'vehiculos', subId: 'mecanico',
    description: 'Diagnóstico, cambio de aceite y revisión de frenos en tu casa o trabajo.',
    tone: 'from-[#E3E7EC] to-[#C3CBD6]', iconColor: 'text-[#4A5A6E]',
  },
  {
    id: 'lavado-brillo', title: 'Lavado y pulido de autos', provider: 'Brillo Verde', icon: Sparkles, rating: 4.6, jobs: 98,
    zone: 'Cumbayá y valles', price: 12, unit: 'servicio', categoryId: 'vehiculos', subId: 'lavado',
    description: 'Lavado ecológico sin desperdicio de agua, aspirado e hidratación de tapicería.',
    tone: 'from-[#DDEEF0] to-[#B5D8DD]', iconColor: 'text-[#3F8089]',
  },
  {
    id: 'electricista-ruiz', title: 'Instalaciones y reparaciones eléctricas', provider: 'Luis Ruiz', icon: Zap, rating: 4.9, jobs: 340,
    zone: 'Toda la ciudad', price: 10, unit: 'hora', categoryId: 'mantenimiento', subId: 'electricista',
    description: 'Tableros, tomacorrientes, iluminación y revisión de cortos. Garantía por escrito.',
    tone: 'from-[#F8EBC2] to-[#EBD389]', iconColor: 'text-[#A88A22]',
  },
  {
    id: 'plomero-nunez', title: 'Plomería y detección de fugas', provider: 'Hidro Núñez', icon: Droplet, rating: 4.7, jobs: 176,
    zone: 'Centro y sur', price: 9, unit: 'hora', categoryId: 'mantenimiento', subId: 'plomero',
    description: 'Reparación de tuberías, grifería, calefones y destape de desagües.',
    tone: 'from-[#DCE8F2] to-[#B3CCE3]', iconColor: 'text-[#46739B]',
  },
  {
    id: 'pintura-colores', title: 'Pintura de interiores y fachadas', provider: 'Colores del Valle', icon: PaintRoller, rating: 4.5, jobs: 61,
    zone: 'Valle de los Chillos', price: 8, unit: 'hora', categoryId: 'mantenimiento', subId: 'pintor',
    description: 'Preparación de paredes, pintura lavable y acabados. Presupuesto sin costo.',
    tone: 'from-[#F2D9D0] to-[#E5B3A4]', iconColor: 'text-[#B4533C]',
  },
  {
    id: 'ninera-marta', title: 'Niñera con experiencia', provider: 'Marta Guerrero', icon: Baby, rating: 5.0, jobs: 87,
    zone: 'Norte de Quito', price: 4, unit: 'hora', categoryId: 'cuidado', subId: 'ninera',
    description: 'Cuidado de niños de 1 a 8 años, apoyo con tareas y comidas. Referencias verificadas.',
    tone: 'from-[#F0DDE6] to-[#DDB6C7]', iconColor: 'text-[#8A4A6B]',
  },
  {
    id: 'adultos-cuidar', title: 'Acompañamiento a adultos mayores', provider: 'Cuidar con Cariño', icon: HandHelping, rating: 4.9, jobs: 52,
    zone: 'Quito urbano', price: 5, unit: 'hora', categoryId: 'cuidado', subId: 'adultos',
    description: 'Asistencia en el hogar, control de medicación y traslados a citas médicas.',
    tone: 'from-[#DCE8D2] to-[#B9D1AE]', iconColor: 'text-[#4F6F52]',
  },
  {
    id: 'paseo-mascotas', title: 'Paseo y cuidado de mascotas', provider: 'Patitas Felices', icon: Dog, rating: 4.7, jobs: 129,
    zone: 'La Floresta y Cumbayá', price: 6, unit: 'visita', categoryId: 'cuidado', subId: 'mascotas',
    description: 'Paseos diarios, visitas a domicilio y alimentación cuando viajas.',
    tone: 'from-[#F3E3C7] to-[#E8C896]', iconColor: 'text-[#B7792B]',
  },
  {
    id: 'refuerzo-mate', title: 'Refuerzo de matemáticas y física', provider: 'Prof. Andrea Salazar', icon: GraduationCap, rating: 4.9, jobs: 143,
    zone: 'Presencial y virtual', price: 8, unit: 'hora', categoryId: 'educacion', subId: 'refuerzo',
    description: 'Clases personalizadas para colegio y preparación de ingreso universitario.',
    tone: 'from-[#E9E4F2] to-[#CFC4E3]', iconColor: 'text-[#6B5A94]',
  },
  {
    id: 'guitarra', title: 'Clases de guitarra', provider: 'Daniel Paredes', icon: Music, rating: 4.8, jobs: 44,
    zone: 'Presencial y virtual', price: 10, unit: 'hora', categoryId: 'educacion', subId: 'musica',
    description: 'Desde cero hasta nivel intermedio. Guitarra acústica y eléctrica.',
    tone: 'from-[#F1E5D0] to-[#DFC9A0]', iconColor: 'text-[#8F6B2F]',
  },
  {
    id: 'peluqueria-domicilio', title: 'Corte y peinado a domicilio', provider: 'Estilo Sol', icon: Scissors, rating: 4.6, jobs: 205,
    zone: 'Norte de Quito', price: 10, unit: 'servicio', categoryId: 'belleza', subId: 'peluqueria',
    description: 'Corte, tinte y peinado en la comodidad de tu casa. Llevamos todo el equipo.',
    tone: 'from-[#EBD9DF] to-[#D8B4C0]', iconColor: 'text-[#8A4A5F]',
  },
  {
    id: 'manicure', title: 'Manicure y pedicure spa', provider: 'Uñas con Arte', icon: Brush, rating: 4.7, jobs: 118,
    zone: 'Centro y norte', price: 12, unit: 'servicio', categoryId: 'belleza', subId: 'manicure',
    description: 'Esmaltado tradicional y semipermanente con productos hipoalergénicos.',
    tone: 'from-[#F8E1E8] to-[#EDB9C9]', iconColor: 'text-[#B0486B]',
  },
  {
    id: 'celulares-fix', title: 'Reparación de celulares', provider: 'Fix Móvil', icon: Smartphone, rating: 4.6, jobs: 392,
    zone: 'Toda la ciudad', price: 8, unit: 'visita', categoryId: 'tecnologia', subId: 'celulares',
    description: 'Cambio de pantalla, batería y puerto de carga. Diagnóstico gratuito.',
    tone: 'from-[#E3E7EC] to-[#C3CBD6]', iconColor: 'text-[#4A5A6E]',
  },
  {
    id: 'computadoras-tec', title: 'Mantenimiento de computadoras', provider: 'TecnoAyuda', icon: Laptop, rating: 4.8, jobs: 167,
    zone: 'Quito urbano', price: 12, unit: 'visita', categoryId: 'tecnologia', subId: 'computadoras',
    description: 'Limpieza, formateo, instalación de programas y recuperación de archivos.',
    tone: 'from-[#DCE8F2] to-[#B3CCE3]', iconColor: 'text-[#46739B]',
  },
  {
    id: 'catering-sabor', title: 'Catering para reuniones', provider: 'Sabor Andino', icon: Cake, rating: 4.9, jobs: 73,
    zone: 'Valles y Quito', price: 60, unit: 'servicio', categoryId: 'eventos', subId: 'catering',
    description: 'Menús para 20 a 100 personas con productos locales y de temporada.',
    tone: 'from-[#F6EBD6] to-[#EAD6AE]', iconColor: 'text-[#A9803F]',
  },
  {
    id: 'foto-eventos', title: 'Fotografía de eventos', provider: 'Lente Local', icon: Camera, rating: 4.8, jobs: 58,
    zone: 'Toda la provincia', price: 25, unit: 'hora', categoryId: 'eventos', subId: 'fotografia',
    description: 'Cobertura de cumpleaños, grados y matrimonios. Entrega de galería digital.',
    tone: 'from-[#E9E4F2] to-[#CFC4E3]', iconColor: 'text-[#6B5A94]',
  },
];

/* ------------------------------ Pedidos de ejemplo ------------------------------ */

export const MOCK_ORDERS: Order[] = [
  { id: 'BB-482913', date: '06 nov 2026', kind: 'Producto', summary: '2 × Lechuga crespa (Malla 500 g), 1 × Huevos de campo', total: 10.4, status: 'En camino' },
  { id: 'BB-471002', date: '30 oct 2026', kind: 'Servicio', summary: 'Instalaciones eléctricas · Luis Ruiz (2 h)', total: 23, status: 'Entregado' },
  { id: 'BB-465577', date: '24 oct 2026', kind: 'Producto', summary: '1 × Quinua en grano (Bolsa 1 kg), 2 × Mora de castilla', total: 17.1, status: 'Entregado' },
  { id: 'BB-450318', date: '12 oct 2026', kind: 'Servicio', summary: 'Niñera con experiencia · Marta Guerrero (4 h)', total: 16, status: 'Cancelado' },
];
