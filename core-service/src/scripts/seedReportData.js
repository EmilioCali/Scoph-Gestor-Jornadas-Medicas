import 'dotenv/config';
import mongoose from 'mongoose';
import Medicine from '../medicines/medicine.model.js';
import CentralInventory from '../inventory/centralInventory.model.js';
import WorkdayInventory from '../inventory/workdayInventory.model.js';
import Movement from '../movements/movement.model.js';

// El modelo se declara en este proceso para compartir la conexión de core-service.
// Importarlo desde workday-service cargaría otra copia de mongoose con pnpm.
const Workday = mongoose.models.Workday || mongoose.model('Workday', new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    department: { type: String, required: true },
    municipality: { type: String, required: true },
    address: { type: String, required: true },
  },
  manager: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
  },
  doctors: [{ userId: String, name: String }],
  estimatedPatients: { type: Number, required: true },
  estimatedMedicines: { type: Number, required: true },
  status: { type: String, required: true },
}, { timestamps: true, versionKey: false }));

const SEED_KEY = 'SCOPH_REPORTE_SIMULADO_2026';
const apply = process.argv.includes('--apply');
const reset = process.argv.includes('--reset');

const daysFromToday = (days) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const atDate = (month, day) => new Date(2026, month, day, 12, 0, 0);

const medicines = [
  ['Paracetamol', 'Acetaminofén', '500 mg', 'Tableta', 'Unidad', 'Analgésico'],
  ['Ibuprofeno', 'Ibuprofeno', '400 mg', 'Tableta', 'Unidad', 'Antiinflamatorio'],
  ['Amoxicilina', 'Amoxicilina', '500 mg', 'Cápsula', 'Unidad', 'Antibiótico'],
  ['Loratadina', 'Loratadina', '10 mg', 'Tableta', 'Unidad', 'Antialérgico'],
  ['Omeprazol', 'Omeprazol', '20 mg', 'Cápsula', 'Unidad', 'Gastrointestinal'],
  ['Metformina', 'Metformina', '850 mg', 'Tableta', 'Unidad', 'Antidiabético'],
  ['Losartán', 'Losartán potásico', '50 mg', 'Tableta', 'Unidad', 'Antihipertensivo'],
  ['Salbutamol', 'Salbutamol', '100 mcg', 'Inhalador', 'Unidad', 'Respiratorio'],
  ['Diclofenaco', 'Diclofenaco sódico', '50 mg', 'Tableta', 'Unidad', 'Antiinflamatorio'],
  ['Azitromicina', 'Azitromicina', '500 mg', 'Tableta', 'Unidad', 'Antibiótico'],
  ['Clotrimazol', 'Clotrimazol', '1%', 'Crema', 'Tubo', 'Dermatológico'],
  ['Suero oral', 'Sales de rehidratación oral', '27.9 g/L', 'Sobre', 'Unidad', 'Hidratación'],
];

const workdays = [
  ['Jornada médica en San Juan Sacatepéquez', 0, 18, 'FINISHED', 'Guatemala', 'San Juan Sacatepéquez'],
  ['Jornada médica en San Pedro Ayampuc', 1, 15, 'FINISHED', 'Guatemala', 'San Pedro Ayampuc'],
  ['Jornada médica en San Raymundo', 2, 12, 'FINISHED', 'Guatemala', 'San Raymundo'],
  ['Jornada médica en Santa Lucía Cotzumalguapa', 3, 19, 'FINISHED', 'Escuintla', 'Santa Lucía Cotzumalguapa'],
  ['Jornada médica en Chimaltenango', 4, 17, 'FINISHED', 'Chimaltenango', 'Chimaltenango'],
  ['Jornada médica en Tecpán Guatemala', 5, 14, 'FINISHED', 'Chimaltenango', 'Tecpán Guatemala'],
  ['Jornada médica en Mixco', 6, 10, 'FINISHED', 'Guatemala', 'Mixco'],
  ['Jornada médica en Villa Nueva', 7, 15, 'IN_PROGRESS', 'Guatemala', 'Villa Nueva'],
  ['Jornada médica en Palín', 7, 29, 'PLANNED', 'Escuintla', 'Palín'],
  ['Jornada médica en Antigua Guatemala', 8, 12, 'PLANNED', 'Sacatepéquez', 'Antigua Guatemala'],
  ['Jornada médica en Jocotenango', 8, 26, 'PLANNED', 'Sacatepéquez', 'Jocotenango'],
  ['Jornada médica en Sanarate', 9, 10, 'PLANNED', 'El Progreso', 'Sanarate'],
];

function lotFor(index, stock) {
  const expirationOffsets = [180, 240, 45, 330, 20, 270, 120, 365, 75, 210, 150, 300];
  return {
    batch: `SIM-2026-${String(index + 1).padStart(3, '0')}`,
    expirationDate: daysFromToday(expirationOffsets[index]),
    stock,
  };
}

async function removeSimulationData() {
  const demoMedicines = await Medicine.find({ barcode: /^SIM-REPORT-2026-/ }).select('_id');
  const medicineIds = demoMedicines.map(({ _id }) => _id);

  await Promise.all([
    Movement.deleteMany({ 'metadata.reason': SEED_KEY }),
    Workday.deleteMany({ description: SEED_KEY }),
    WorkdayInventory.deleteMany({ medicineId: { $in: medicineIds } }),
    CentralInventory.deleteMany({ medicineId: { $in: medicineIds } }),
    Medicine.deleteMany({ _id: { $in: medicineIds } }),
  ]);
}

async function seed() {
  if (reset) await removeSimulationData();

  const medicineDocs = [];
  for (const [name, compound, concentration, presentation, unitOfMeasure, category] of medicines) {
    const existing = await Medicine.findOne({ barcode: `SIM-REPORT-2026-${medicineDocs.length + 1}` });
    if (existing) {
      medicineDocs.push(existing);
      continue;
    }

    medicineDocs.push(await Medicine.create({
      barcode: `SIM-REPORT-2026-${medicineDocs.length + 1}`,
      name,
      compound,
      concentration,
      presentation,
      unitOfMeasure,
      category: 'SIMULADO',
      status: 'ACTIVO',
    }));
  }

  const workdayDocs = [];
  for (const [name, month, day, status, department, municipality] of workdays) {
    const startDate = atDate(month, day);
    const existing = await Workday.findOne({ name, description: SEED_KEY });
    if (existing) {
      workdayDocs.push(existing);
      continue;
    }

    workdayDocs.push(await Workday.create({
      name,
      description: SEED_KEY,
      startDate,
      endDate: new Date(startDate.getTime() + 8 * 60 * 60 * 1000),
      location: { department, municipality, address: `Salón comunal de ${municipality}` },
      manager: { userId: 'usr_sim_admin', name: 'Coordinación SCOPH' },
      doctors: [
        { userId: 'usr_sim_med_01', name: 'Dra. Ana López' },
        { userId: 'usr_sim_med_02', name: 'Dr. Carlos Méndez' },
      ],
      estimatedPatients: 90 + workdayDocs.length * 12,
      estimatedMedicines: 180 + workdayDocs.length * 20,
      status,
    }));
  }

  const currentStocks = [420, 360, 65, 240, 28, 510, 450, 18, 310, 120, 75, 32];
  for (let index = 0; index < medicineDocs.length; index += 1) {
    const medicine = medicineDocs[index];
    const stock = currentStocks[index];
    await CentralInventory.findOneAndUpdate(
      { medicineId: medicine._id },
      {
        medicineId: medicine._id,
        lots: [lotFor(index, stock)],
        totalStock: stock,
        minimumStock: index === 2 || index === 4 || index === 7 || index === 11 ? 70 : 50,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  const activeWorkday = workdayDocs.find(({ status }) => status === 'IN_PROGRESS');
  for (const [index, medicine] of medicineDocs.slice(0, 5).entries()) {
    const stock = 35 + index * 10;
    await WorkdayInventory.findOneAndUpdate(
      { workdayId: activeWorkday._id.toString(), medicineId: medicine._id },
      {
        workdayId: activeWorkday._id.toString(),
        workdayName: activeWorkday.name,
        medicineId: medicine._id,
        lots: [lotFor(index, stock)],
        totalStock: stock,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  const existingMovements = await Movement.countDocuments({ 'metadata.reason': SEED_KEY });
  if (existingMovements === 0) {
    const movementDocs = [];
    const finishedWorkdays = workdayDocs.filter(({ status }) => status === 'FINISHED');

    finishedWorkdays.forEach((workday, workdayIndex) => {
      const medicine = medicineDocs[workdayIndex % medicineDocs.length];
      const lot = lotFor(workdayIndex % medicineDocs.length, 1);
      const date = new Date(workday.startDate);
      movementDocs.push({
        type: 'TRANSFERENCIA', subType: 'ASIGNACION_JORNADA',
        origin: { type: 'INVENTARIO_CENTRAL', id: null },
        destination: { type: 'INVENTARIO_JORNADA', id: workday._id.toString() },
        detail: [{ medicineId: medicine._id, medicationSnapshot: { name: medicine.name, concentration: medicine.concentration }, batch: lot.batch, quantity: 110 + workdayIndex * 5, expirationDate: lot.expirationDate }],
        status: 'APLICADO', userId: 'usr_sim_admin', metadata: { reason: SEED_KEY }, appliedAt: date, createdAt: date, updatedAt: date,
      });
      movementDocs.push({
        type: 'SALIDA', subType: 'CONSUMO_JORNADA',
        origin: { type: 'INVENTARIO_JORNADA', id: workday._id.toString() },
        destination: { type: 'EXTERNO', id: null },
        detail: [{ medicineId: medicine._id, medicationSnapshot: { name: medicine.name, concentration: medicine.concentration }, batch: lot.batch, quantity: 65 + workdayIndex * 4, expirationDate: lot.expirationDate }],
        status: 'APLICADO', userId: 'usr_sim_med_01', metadata: { reason: SEED_KEY, patientName: `Paciente simulado ${workdayIndex + 1}`, deliveryType: 'MANUAL' }, appliedAt: date, createdAt: date, updatedAt: date,
      });
    });

    for (let index = 0; index < 24; index += 1) {
      const medicine = medicineDocs[index % medicineDocs.length];
      const lot = lotFor(index % medicineDocs.length, 1);
      const date = atDate(index % 7, 4 + (index % 20));
      movementDocs.push({
        type: index % 3 === 0 ? 'ENTRADA' : 'SALIDA',
        subType: index % 3 === 0 ? (index % 2 === 0 ? 'DONACION' : 'COMPRA') : 'RECETA',
        origin: { type: index % 3 === 0 ? 'EXTERNO' : 'INVENTARIO_CENTRAL', id: null },
        destination: { type: index % 3 === 0 ? 'INVENTARIO_CENTRAL' : 'RECETA', id: null },
        detail: [{ medicineId: medicine._id, medicationSnapshot: { name: medicine.name, concentration: medicine.concentration }, batch: lot.batch, quantity: 20 + (index % 5) * 10, expirationDate: lot.expirationDate }],
        status: 'APLICADO', userId: index % 3 === 0 ? 'usr_sim_admin' : 'usr_sim_med_02',
        metadata: { reason: SEED_KEY, patientName: index % 3 === 0 ? null : `Paciente simulado ${index + 20}`, deliveryType: index % 3 === 0 ? null : 'RECETA' },
        appliedAt: date, createdAt: date, updatedAt: date,
      });
    }
    await Movement.insertMany(movementDocs);
  }

  console.log(`Datos simulados listos: ${medicineDocs.length} medicamentos, ${workdayDocs.length} jornadas y movimientos para el reporte.`);
}

if (!apply) {
  console.log('Simulación: no se escribió información. Ejecuta "pnpm seed:report -- --apply" para cargar datos.');
  console.log('Para recrear únicamente los datos simulados: "pnpm seed:report -- --apply --reset".');
  process.exit(0);
}

if (!process.env.MONGO_URI) {
  console.error('Falta MONGO_URI en core-service/.env.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);
  await seed();
} catch (error) {
  console.error('No se pudieron cargar los datos simulados:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
