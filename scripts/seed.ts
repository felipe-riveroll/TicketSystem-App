import { db } from "@/lib/db";
import { users, teams, tickets, tasks, notifications } from "@/lib/db/schema";
import { hash } from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // ── Teams ────────────────────────────────────────────────────────────────
  const teamsData = [
    { id: 1, name: "Equipo de Programación", iconId: "Computer" },
    { id: 2, name: "Equipo de Sistemas", iconId: "EthernetPort" },
    { id: 3, name: "Equipo de Recursos Humanos", iconId: "BookUser" },
    { id: 4, name: "Equipo de Administración", iconId: "Calculator" },
    { id: 5, name: "Equipo de Marketing", iconId: "Clapperboard" },
    { id: 6, name: "Equipo de Vehículos", iconId: "Car" },
    { id: 7, name: "Equipo de Compras", iconId: "ShoppingCart" },
    { id: 8, name: "Equipo de Ventas", iconId: "BadgeDollarSign" },
  ];

  for (const team of teamsData) {
    await db.insert(teams).values(team).onConflictDoNothing();
  }
  console.log(`Inserted ${teamsData.length} teams`);

  // ── Users ────────────────────────────────────────────────────────────────
  // All existing users have null passwords - set temp passwords
  const tempPassword = await hash("Asiatech2026!", 10);

  const usersData = [
    { id: 1, fullName: "Marco Montiel", email: "marcmontiel98@gmail.com", password: tempPassword, role: "user", avatarIcon: "Sticker", teamId: 2, isActive: false },
    { id: 3, fullName: "Asiatech", email: "asiatechsistemas31@gmail.com", password: tempPassword, role: "admin", avatarIcon: "Biohazard", teamId: 2, isActive: true },
    { id: 4, fullName: "Pedro Mateos", email: "mateosp2310@gmail.com", password: tempPassword, role: "admin", avatarIcon: "Fish", teamId: 2, isActive: true },
    { id: 5, fullName: "Guillermo Vázquez", email: "olivamemo689@gmail.com", password: tempPassword, role: "admin", avatarIcon: "Sticker", teamId: 2, isActive: true },
    { id: 6, fullName: "Marco Montiel", email: "lucasmontiel358@gmail.com", password: tempPassword, role: "admin", avatarIcon: "Sticker", teamId: 2, isActive: true },
    { id: 7, fullName: "Daniela Zarate", email: "danizaratec@gmail.com", password: tempPassword, role: "user", avatarIcon: "Rabbit", teamId: 3, isActive: true },
    { id: 8, fullName: "Fatima Aca", email: "fatimaaca15@gmail.com", password: tempPassword, role: "user", avatarIcon: "Sticker", teamId: 3, isActive: true },
    { id: 9, fullName: "Carlos Benitez", email: "carlosbenitez1661@gmail.com", password: tempPassword, role: "user", avatarIcon: "Donut", teamId: 3, isActive: true },
    { id: 10, fullName: "Sandra Vergara", email: "sandrvv18@gmail.com", password: tempPassword, role: "user", avatarIcon: "Cat", teamId: 3, isActive: true },
    { id: 11, fullName: "Karen Ramirez", email: "akramirezmtz22@gmail.com", password: tempPassword, role: "user", avatarIcon: "Rose", teamId: 1, isActive: true },
    { id: 12, fullName: "Alexis Coatl", email: "tepoxa09@gmail.com", password: tempPassword, role: "user", avatarIcon: "Biohazard", teamId: 1, isActive: true },
    { id: 13, fullName: "Rebeca Vergara", email: "rhasiatech1@gmail.com", password: tempPassword, role: "user", avatarIcon: "VenetianMask", teamId: 5, isActive: false },
    { id: 14, fullName: "Angel Mendoza", email: "nightmareangel730@gmail.com", password: tempPassword, role: "user", avatarIcon: "Ghost", teamId: 1, isActive: true },
    { id: 15, fullName: "Alejandro Perez", email: "alejandroperezlopez449@gmail.com", password: tempPassword, role: "user", avatarIcon: "HandMetal", teamId: 5, isActive: true },
    { id: 16, fullName: "Emilio Rosas", email: "emiliomunoz1245@gmail.com", password: tempPassword, role: "user", avatarIcon: "Donut", teamId: 5, isActive: false },
    { id: 17, fullName: "Michelle Flores", email: "michflores84535@gmail.com", password: tempPassword, role: "user", avatarIcon: "Cat", teamId: 5, isActive: false },
    { id: 18, fullName: "Rebeca Miranda", email: "marketing@asiatech.com.mx", password: tempPassword, role: "user", avatarIcon: "VenetianMask", teamId: 5, isActive: true },
    { id: 19, fullName: "Manuel Escorza", email: "vmescorza@hotmail.com", password: tempPassword, role: "user", avatarIcon: "Fish", teamId: 5, isActive: true },
  ];

  for (const user of usersData) {
    await db.insert(users).values(user).onConflictDoNothing();
  }
  console.log(`Inserted ${usersData.length} users`);
  console.log("All users have temp password: Asiatech2026!");

  // ── Tickets ──────────────────────────────────────────────────────────────
  const ticketsData = [
    { id: 1, description: "Sin WIFI", type: "red", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 1, userId: 12, isActive: false, arrivalTime: new Date("2026-04-15T17:17:49.827Z") },
    { id: 2, description: "No tengo impresora", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 1, userId: 12, isActive: false, arrivalTime: new Date("2026-04-15T17:18:28.082Z") },
    { id: 3, description: "Pc de Fatima de RH no tenia internet", type: "red", priority: "Media", status: "Terminada", maxWaitMinutes: 60, teamId: 2, userId: 3, isActive: true, arrivalTime: new Date("2026-04-15T17:59:35.563Z") },
    { id: 4, description: "Computadora de Sandra RH", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 2, userId: 3, isActive: true, arrivalTime: new Date("2026-04-15T21:06:07.355Z") },
    { id: 5, description: "Se congeló la pantalla del la computadora de Sandra :(", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 8, isActive: true, arrivalTime: new Date("2026-04-15T22:32:08.738Z") },
    { id: 6, description: "No imprime la impresora :(", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 10, isActive: true, arrivalTime: new Date("2026-04-16T17:34:01.149Z") },
    { id: 7, description: "Se asignaron nuevos periféricos a Carlos Recursos Humanos", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 2, userId: 4, isActive: true, arrivalTime: new Date("2026-04-16T21:18:13.544Z") },
    { id: 8, description: "Configuración del teclado (ahora ya aparece la \"Ñ\" pero no los signos de puntuación) ._.", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 8, isActive: true, arrivalTime: new Date("2026-04-16T21:20:58.603Z") },
    { id: 9, description: "no funciona la impresora", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 3, userId: 7, isActive: true, arrivalTime: new Date("2026-04-16T22:54:22.402Z") },
    { id: 10, description: " Red wifi en área de ventas", type: "red", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 2, userId: 4, isActive: true, arrivalTime: new Date("2026-04-17T15:31:31.449Z") },
    { id: 11, description: "Uso se signos de puntuación en teclado", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 9, isActive: true, arrivalTime: new Date("2026-04-17T15:33:03.916Z") },
    { id: 12, description: "Necesito una contraseña", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 5, userId: 15, isActive: true, arrivalTime: new Date("2026-04-20T17:28:23.156Z") },
    { id: 13, description: "Computadora de Fabiola de Compras fallo", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 120, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-20T21:32:48.66Z") },
    { id: 14, description: "No enciende mi monitor (creo que se bloqueo)", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 9, isActive: true, arrivalTime: new Date("2026-04-21T19:00:36.334Z") },
    { id: 15, description: "No se encontraba el wifi de sala de juntas", type: "red", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 2, userId: 4, isActive: true, arrivalTime: new Date("2026-04-23T16:39:19.107Z") },
    { id: 16, description: "Bug detectados en el sistema de tickets", type: "otro", priority: "Media", status: "Terminada", maxWaitMinutes: 120, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-23T21:56:31.664Z") },
    { id: 17, description: "Errores en la bandeja de entrada del sistema de tickets", type: "otro", priority: "Media", status: "Pendiente", maxWaitMinutes: 120, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-23T21:58:00.464Z") },
    { id: 18, description: "Prueba de notificaciones", type: "otro", priority: "Media", status: "Terminada", maxWaitMinutes: 60, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-24T17:35:53.831Z") },
    { id: 19, description: "EL problema sigue", type: "otro", priority: "Media", status: "Terminada", maxWaitMinutes: 60, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-24T17:36:11.443Z") },
    { id: 20, description: "Delay en notificaciones de la main", type: "otro", priority: "Media", status: "Terminada", maxWaitMinutes: 60, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-24T17:36:39.248Z") },
    { id: 21, description: "Impresora del área de Admin", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-04-27T18:13:44.949Z") },
    { id: 22, description: "Revisión de cámaras Villas :0", type: "otro", priority: "Media", status: "Pendiente", maxWaitMinutes: 10, teamId: 3, userId: 8, isActive: true, arrivalTime: new Date("2026-04-29T22:09:21.992Z") },
    { id: 23, description: "Instalación de computadora, respaldo, configuración de equipo", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 3, userId: 10, isActive: true, arrivalTime: new Date("2026-05-04T17:10:53.527Z") },
    { id: 24, description: "Cambio de monitor de compras a vehículos :/", type: "computo", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 3, userId: 10, isActive: true, arrivalTime: new Date("2026-05-04T17:19:17.931Z") },
    { id: 25, description: "Conexión impresora admin", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 2, userId: 4, isActive: true, arrivalTime: new Date("2026-05-05T17:07:01.668Z") },
    { id: 26, description: "Contexto: Se le esta pidiendo al equipo de vigilancia apoyo para reconectar una cuenta de WhatsApp en horas donde no hay personal administrativo.", type: "otro", priority: "Media", status: "Pendiente", maxWaitMinutes: 120, teamId: 1, userId: 11, isActive: true, arrivalTime: new Date("2026-05-08T16:37:20.291Z") },
    { id: 27, description: "Cambio de IP de impresora en computadora de Moni de Admin", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 10, teamId: 2, userId: 6, isActive: true, arrivalTime: new Date("2026-05-13T18:13:20.695Z") },
    { id: 28, description: "Cambio ip en impresoras en el área de admin", type: "impresora", priority: "Media", status: "Terminada", maxWaitMinutes: 30, teamId: 2, userId: 4, isActive: true, arrivalTime: new Date("2026-05-14T17:24:25.848Z") },
  ];

  for (const ticket of ticketsData) {
    await db.insert(tickets).values(ticket).onConflictDoNothing();
  }
  console.log(`Inserted ${ticketsData.length} tickets`);

  // ── Tasks ────────────────────────────────────────────────────────────────
  const tasksData = [
    { id: 2, title: "Cambios para próximas actualizaciones", description: "-Cambio de contraseña para usuarios nuevos\n-Bug visual en tabla de tickets cuando hay pocos\n-Bug visual no carga iconos en el form de task ni cargan iconos reales en la tabla de tickets\n-agregar boton a tareas de kanban para ver completas", status: "Terminada", teamId: 2, startDate: new Date("2026-04-15T17:23:17.228Z"), endDate: new Date("2026-04-30"), isActive: true, assignedTo: [4, 6] },
    { id: 3, title: "Fix vencido de tickets", description: "los tickets se vencen a pesar de estar completados", status: "Terminada", teamId: 2, startDate: new Date("2026-04-15T17:32:54.319Z"), endDate: new Date("2026-04-30"), isActive: true, assignedTo: [6, 4] },
    { id: 7, title: "prueba 3", description: "prueba 3", status: "Terminada", teamId: 1, startDate: new Date("2026-04-15T21:28:10.654Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [12] },
    { id: 10, title: "Pendientes", description: "-Ajustar el scroll del kanban(propongo quitar el scroll de cada columna y dejar uno global).\n-Ajustar el separador de cada header y el del sidebar para que tengan la misma medida.\n-Informacion de la seccion de ayuda.", status: "Terminada", teamId: 2, startDate: new Date("2026-04-16T16:45:08.685Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [4] },
    { id: 11, title: "Cambio de password", description: "Crear el menú para cambiar la contraseña de los usuarios así como forzar el primer log in el cambio obligatorio", status: "En proceso", teamId: 2, startDate: new Date("2026-04-16T16:47:45.247Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [4] },
    { id: 12, title: "Modificar la pestaña Kanban", description: "Hacer modular el componente Kanban para mejor la renderización de componentes", status: "Terminada", teamId: 2, startDate: new Date("2026-04-16T16:48:55.057Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [4, 6] },
    { id: 13, title: "Actualizaciones", description: "refresh del kanban\nnotificar cuando se asigna una tarea en kanban", status: "Pendiente", teamId: 2, startDate: new Date("2026-04-16T16:51:16.341Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [4, 6] },
    { id: 14, title: "Relación de desperdicio", description: "Crear un Reporte de lo que se va a tirar y preguntar a Toni si sabe de algún lugar para tirarlo", status: "Terminada", teamId: 2, startDate: new Date("2026-04-16T17:49:25.615Z"), endDate: new Date("2026-04-16"), isActive: true, assignedTo: [5] },
    { id: 15, title: "Área de jurídico", description: "Arreglas impresora de jurídico, conectar a internet y colocar en lugar mas cercano al Reuter", status: "Tareas", teamId: 2, startDate: new Date("2026-04-16T22:32:51.66Z"), endDate: new Date("2026-04-17"), isActive: true, assignedTo: [4, 5, 6, 3] },
    { id: 16, title: "Pagina Check in", description: "Desarrollar una pagina web para el check in en el hotel gran gardenia, ya se cuenta con la API de cloudbeds", status: "En proceso", teamId: 2, startDate: new Date("2026-04-17T15:38:33.942Z"), endDate: new Date("2026-05-15"), isActive: true, assignedTo: [4, 3] },
    { id: 17, title: "Eliminar impresoras área de marketing", description: "Eliminar y configurar impresoras del área de marketing", status: "Pendiente", teamId: 2, startDate: new Date("2026-04-17T15:39:40.541Z"), endDate: new Date("2026-05-15"), isActive: true, assignedTo: [4, 5, 6, 3] },
    { id: 18, title: "Pendientes Sistemas", description: "-Cotizar Switch\n-Administrable\n-Mesh\n-Cableado\n-Rj45\n-Mediciones de Red", status: "Terminada", teamId: 2, startDate: new Date("2026-04-17T22:10:20.614Z"), endDate: new Date("2026-04-20"), isActive: true, assignedTo: [4, 5, 6, 3] },
    { id: 19, title: "Features y actualización del sistema", description: "Implementación de registro de equipos electrónicos, Asignación de los mismos y Creación de Kanban Global para la empresa.\nDetalles en metricas, notificaciones de asignacion de tareas en kanban etc.", status: "Tareas", teamId: 2, startDate: new Date("2026-05-04T20:39:29.382Z"), endDate: new Date("2026-05-31"), isActive: true, assignedTo: [4, 6, 3] },
  ];

  for (const task of tasksData) {
    await db.insert(tasks).values(task).onConflictDoNothing();
  }
  console.log(`Inserted ${tasksData.length} tasks`);

  // ── Notifications ────────────────────────────────────────────────────────
  const notifsData = [
    { ticketId: 1, teamId: 2, userId: 12, type: "ticket_created", message: "Nuevo ticket creado: Sin WIFI", isRead: true, createdAt: new Date("2026-04-15T17:17:51.744886Z") },
    { ticketId: 2, teamId: 2, userId: 12, type: "ticket_created", message: "Nuevo ticket creado: No tengo impresora", isRead: true, createdAt: new Date("2026-04-15T17:18:29.729501Z") },
    { ticketId: 3, teamId: 2, userId: 3, type: "ticket_created", message: "Nuevo ticket creado: Pc de Fatima de RH no tenia internet", isRead: true, createdAt: new Date("2026-04-15T17:59:36.749237Z") },
    { ticketId: 4, teamId: 2, userId: 3, type: "ticket_created", message: "Nuevo ticket creado: Computadora de Sandra RH", isRead: true, createdAt: new Date("2026-04-15T21:06:08.886584Z") },
    { ticketId: 5, teamId: 2, userId: 8, type: "ticket_created", message: "Nuevo ticket creado: Se congeló la pantalla del la computadora de Sandra :(", isRead: true, createdAt: new Date("2026-04-15T22:32:10.351728Z") },
    { ticketId: 6, teamId: 2, userId: 10, type: "ticket_created", message: "Nuevo ticket creado: No imprime la impresora :(", isRead: true, createdAt: new Date("2026-04-16T17:34:02.452836Z") },
    { ticketId: 7, teamId: 2, userId: 4, type: "ticket_created", message: "Nuevo ticket creado: Se asignaron nuevos periféricos a Carlos Recursos Humanos", isRead: true, createdAt: new Date("2026-04-16T21:18:14.894234Z") },
    { ticketId: 8, teamId: 2, userId: 8, type: "ticket_created", message: "Nuevo ticket creado: Configuración del teclado (ahora ya aparece la \"Ñ\" pero no los signos de puntuac", isRead: true, createdAt: new Date("2026-04-16T21:21:00.231208Z") },
    { ticketId: 9, teamId: 2, userId: 7, type: "ticket_created", message: "Nuevo ticket creado: no funciona la impresora", isRead: true, createdAt: new Date("2026-04-16T22:54:22.931163Z") },
    { ticketId: 10, teamId: 2, userId: 4, type: "ticket_created", message: "Nuevo ticket creado:  Red wifi en área de ventas", isRead: true, createdAt: new Date("2026-04-17T15:31:32.617083Z") },
    { ticketId: 11, teamId: 2, userId: 9, type: "ticket_created", message: "Nuevo ticket creado: Uso se signos de puntuación en teclado", isRead: true, createdAt: new Date("2026-04-17T15:33:05.262477Z") },
    { ticketId: 12, teamId: 2, userId: 15, type: "ticket_created", message: "Nuevo ticket creado: Necesito una contraseña", isRead: true, createdAt: new Date("2026-04-20T17:28:24.232613Z") },
    { ticketId: 13, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Computadora de Fabiola de Compras fallo", isRead: true, createdAt: new Date("2026-04-20T21:32:50.436686Z") },
    { ticketId: 14, teamId: 2, userId: 9, type: "ticket_created", message: "Nuevo ticket creado: No enciende mi monitor (creo que se bloqueo)", isRead: true, createdAt: new Date("2026-04-21T19:00:37.78426Z") },
    { ticketId: 15, teamId: 2, userId: 4, type: "ticket_created", message: "Nuevo ticket creado: No se encontraba el wifi de sala de juntas", isRead: true, createdAt: new Date("2026-04-23T16:39:18.787905Z") },
    { ticketId: 16, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Bug detectados en el sistema de tickets", isRead: true, createdAt: new Date("2026-04-23T21:56:33.103228Z") },
    { ticketId: 17, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Errores en la bandeja de entrada del sistema de tickets", isRead: true, createdAt: new Date("2026-04-23T21:58:01.827512Z") },
    { ticketId: 18, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Prueba de notificaciones", isRead: true, createdAt: new Date("2026-04-24T17:35:54.445581Z") },
    { ticketId: 19, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: EL problema sigue", isRead: true, createdAt: new Date("2026-04-24T17:36:12.041085Z") },
    { ticketId: 20, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Delay en notificaciones de la main", isRead: true, createdAt: new Date("2026-04-24T17:36:39.835952Z") },
    { ticketId: 21, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Impresora del área de Admin", isRead: true, createdAt: new Date("2026-04-27T18:13:45.291043Z") },
    { ticketId: 22, teamId: 2, userId: 8, type: "ticket_created", message: "Nuevo ticket creado: Revisión de cámaras  Villas :0", isRead: true, createdAt: new Date("2026-04-29T22:09:23.52649Z") },
    { ticketId: 23, teamId: 2, userId: 10, type: "ticket_created", message: "Nuevo ticket creado: Instalación de computadora, respaldo, configuración de equipo", isRead: true, createdAt: new Date("2026-05-04T17:10:39.888518Z") },
    { ticketId: 24, teamId: 2, userId: 10, type: "ticket_created", message: "Nuevo ticket creado: Cambio de monitor de compras a vehículos :/", isRead: true, createdAt: new Date("2026-05-04T17:19:04.4647Z") },
    { ticketId: 25, teamId: 2, userId: 4, type: "ticket_created", message: "Nuevo ticket creado: Conexión impresora admin", isRead: true, createdAt: new Date("2026-05-05T17:07:02.188067Z") },
    { ticketId: 26, teamId: 2, userId: 11, type: "ticket_created", message: "Nuevo ticket creado: Contexto: Se le esta pidiendo al equipo de vigilancia apoyo para reconectar una", isRead: true, createdAt: new Date("2026-05-08T16:37:21.319186Z") },
    { ticketId: 27, teamId: 2, userId: 6, type: "ticket_created", message: "Nuevo ticket creado: Cambio de IP de impresora en computadora de Moni de Admin", isRead: true, createdAt: new Date("2026-05-13T18:13:21.826755Z") },
    { ticketId: 28, teamId: 2, userId: 4, type: "ticket_created", message: "Nuevo ticket creado: Cambio ip en impresoras en el área de admin", isRead: true, createdAt: new Date("2026-05-14T17:24:29.173263Z") },
  ];

  for (const notif of notifsData) {
    await db.insert(notifications).values(notif).onConflictDoNothing();
  }
  console.log(`Inserted ${notifsData.length} notifications`);

  // ── Reset sequences ──────────────────────────────────────────────────────
  const { sql } = await import("drizzle-orm");
  await db.execute(sql`SELECT setval('teams_id_seq', 8, true)`);
  await db.execute(sql`SELECT setval('users_id_seq', 19, true)`);
  await db.execute(sql`SELECT setval('tickets_id_seq', 28, true)`);
  await db.execute(sql`SELECT setval('tasks_id_seq', 19, true)`);
  await db.execute(sql`SELECT setval('notifications_id_seq', 28, true)`);
  console.log("Sequences reset");

  console.log("\nSeed complete!");
  console.log("All users have temp password: Asiatech2026!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
