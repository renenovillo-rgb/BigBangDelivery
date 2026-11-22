import 'reflect-metadata';
import { AppDataSource } from '../typeorm.config';
import { User } from '../../modules/users/entities/user.entity';
import { Categoria } from '../../entities/categoria.entity';
import { PlanSuscripcion } from '../../entities/plan-suscripcion.entity';
import { Tienda } from '../../entities/tienda.entity';
import { Producto } from '../../entities/producto.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  
  const userRepository = AppDataSource.getRepository(User);
  const catRepository = AppDataSource.getRepository(Categoria);
  const planRepository = AppDataSource.getRepository(PlanSuscripcion);
  const tiendaRepository = AppDataSource.getRepository(Tienda);
  const prodRepository = AppDataSource.getRepository(Producto);

  // 1. Usuarios
  const password = await bcrypt.hash('password123', 10);
  const users = [
    { numeroCedula: '0000000001', nombres: 'Admin', apellidos: 'Sys', email: 'admin@bigban.com', telefono: '0999999999', rol: 'administrador', estado: 'activo', password },
    { numeroCedula: '0000000002', nombres: 'Vendedor', apellidos: 'Test', email: 'vendedor@bigban.com', telefono: '0999999998', rol: 'vendedor', estado: 'activo', password },
    { numeroCedula: '0000000003', nombres: 'Comprador', apellidos: 'Test', email: 'comprador@bigban.com', telefono: '0999999997', rol: 'comprador', estado: 'activo', password },
  ];

  for (const u of users) {
    const existing = await userRepository.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepository.save(userRepository.create(u as any));
    }
  }

  // 2. Categorías
  const cats = [{ nombre: 'Frutas' }, { nombre: 'Verduras' }];
  for (const c of cats) {
    const existing = await catRepository.findOne({ where: { nombre: c.nombre } });
    if (!existing) {
      await catRepository.save(catRepository.create({ ...c, activa: true }));
    }
  }

  // 3. Planes
  const plan = { nombre: 'Básico', precioMensual: 10, duracionDias: 30, limiteProductos: 10, comisionPorcentaje: 5, activo: true };
  const existingPlan = await planRepository.findOne({ where: { nombre: plan.nombre } });
  if (!existingPlan) {
    await planRepository.save(planRepository.create(plan));
  }

  // 4. Tienda y Productos
  const vendedor = await userRepository.findOne({ where: { email: 'vendedor@bigban.com' } });
  const catFrutas = await catRepository.findOne({ where: { nombre: 'Frutas' } });
  
  if (vendedor && catFrutas) {
    let tienda = await tiendaRepository.findOne({ where: { nombreComercial: 'Mi Tienda' } });
    if (!tienda) {
      tienda = await tiendaRepository.save(tiendaRepository.create({ 
        vendedorId: vendedor.id, 
        nombreComercial: 'Mi Tienda', 
        ruc: '0123456789001', 
        categoriaPrincipal: 'Frutas', 
        descripcion: 'Fresh', 
        direccion: 'Cuenca', 
        telefono: '123', 
        emailComercial: 'tienda@bigban.com', 
        estado: 'aprobado' 
      }));
    }

    const productos = [
      { tiendaId: tienda.id, categoriaId: catFrutas.id, nombre: 'Manzana', descripcion: 'Roja', precio: 0.5, imagenUrl: 'url', tipo: 'PERECIBLE', estado: 'publicado', stock: 100, unidadMedida: 'unidad' },
      { tiendaId: tienda.id, categoriaId: catFrutas.id, nombre: 'Pera', descripcion: 'Verde', precio: 0.6, imagenUrl: 'url', tipo: 'PERECIBLE', estado: 'publicado', stock: 80, unidadMedida: 'unidad' },
      { tiendaId: tienda.id, categoriaId: catFrutas.id, nombre: 'Plátano', descripcion: 'Amarillo', precio: 0.2, imagenUrl: 'url', tipo: 'PERECIBLE', estado: 'publicado', stock: 200, unidadMedida: 'unidad' },
    ];

    for (const p of productos) {
      const existing = await prodRepository.findOne({ where: { nombre: p.nombre, tiendaId: tienda.id } });
      if (!existing) {
        await prodRepository.save(prodRepository.create(p as any));
      }
    }
  }

  console.log('Seed completed successfully');
  await AppDataSource.destroy();
}

seed().catch(console.error);
