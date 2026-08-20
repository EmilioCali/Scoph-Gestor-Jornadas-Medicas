import { useMemo, useState } from "react";
import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import PageHeader from "../../../shared/components/ui/PageHeader";
import Table from "../../../shared/components/ui/Table";
import Badge from "../../../shared/components/ui/Badge";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";
import { departamentosGuatemala } from "../../../shared/constants/catalogOptions";
import { useWorkdayInventory } from "../hooks/useWorkdayInventory";
import { useAuthStore } from "../../auth/store/authStore.js";

// Badge según estado de la jornada - valores reales del backend
function getStatusBadge(status) {
  const map = {
    IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
    PLANNED: <Badge variant="info">Planificada</Badge>,
    FINISHED: <Badge variant="gray">Finalizada</Badge>,
    COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    CANCELLED: <Badge variant="danger">Cancelada</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

function formatWorkdayDate(date) {
  return new Intl.DateTimeFormat("es-GT", { timeZone: "UTC" }).format(
    new Date(date),
  );
}

function getLotAvailableUnits(medicine, lot) {
  const boxes = Number(lot?.boxes ?? 0) || 0;
  const blisters = Number(lot?.blisters ?? 0) || 0;
  const units = Number(lot?.units ?? 0) || 0;

  if (boxes === 0 && blisters === 0 && units === 0) {
    return Number(lot?.stock ?? 0) || 0;
  }

  const unitsPerPackage = Math.max(1, Number(medicine?.unitsPerPackage ?? 1) || 1);
  const unitsPerMinimumUnit = Math.max(1, Number(medicine?.unitsPerMinimumUnit ?? 1) || 1);
  return boxes * unitsPerPackage * unitsPerMinimumUnit + blisters * unitsPerMinimumUnit + units;
}

// Formulario para crear jornada
// Body alineado con backend: name, description, startDate, endDate,
// location{department, municipality, address}, manager{userId,name},
// doctors[{userId,name}], estimatedPatients, estimatedMedicines, status
function WorkdayForm({
  form,
  onChange,
  onSubmit,
  onClose,
  departamentos,
  medicalUsers,
}) {
  const [companionName, setCompanionName] = useState("");

  const municipios =
    departamentos.find((d) => d.nombre === form.department)?.municipios || [];

  const handleAddCompanion = () => {
    const normalized = companionName.trim();
    if (!normalized) return;
    if ((form.companions || []).includes(normalized)) {
      setCompanionName("");
      return;
    }

    onChange({
      target: {
        name: "companions",
        value: [...(form.companions || []), normalized],
      },
    });
    setCompanionName("");
  };

  const handleRemoveCompanion = (name) => {
    onChange({
      target: {
        name: "companions",
        value: (form.companions || []).filter((item) => item !== name),
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la jornada"
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Jornada Médica Zona 1"
        required
      />
      <Input
        label="Descripción"
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Descripción de la jornada médica"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Fecha inicio"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={onChange}
          required
        />
        <Input
          label="Fecha fin"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={onChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Departamento
          </label>
          <select
            name="department"
            value={form.department}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar</option>
            {departamentos.map((dep) => (
              <option key={dep._id} value={dep.nombre}>
                {dep.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Municipio
          </label>
          <select
            name="municipality"
            value={form.municipality}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
            disabled={!form.department}
          >
            <option value="">Seleccionar</option>
            {municipios.map((mun) => (
              <option key={mun.codigo} value={mun.nombre}>
                {mun.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Input
        label="Dirección"
        name="address"
        value={form.address}
        onChange={onChange}
        placeholder="Centro comunitario, Salón municipal..."
        required
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
          Responsable de la jornada
        </label>
        <select
          name="managerUserId"
          value={form.managerUserId}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          required
        >
          <option value="">Seleccionar médico responsable</option>
          {medicalUsers.map((user) => (
            <option key={user._id} value={user._id}>
              {`${user.nombre ?? ""} ${user.apellido ?? ""}`.trim()}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
          Acompañantes
        </label>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            name="companionName"
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Selecciona o escribe el nombre del acompañante"
            list="registered-medical-users"
          />
          <datalist id="registered-medical-users">
            {medicalUsers.map((user) => (
              <option
                key={user._id}
                value={`${user.nombre ?? ""} ${user.apellido ?? ""}`.trim()}
              />
            ))}
          </datalist>
          <Button
            variant="secondary"
            type="button"
            onClick={handleAddCompanion}
            className="h-12 whitespace-nowrap"
          >
            Agregar
          </Button>
        </div>
        <div className="min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 p-3">
          {form.companions?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.companions.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompanion(name)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Eliminar acompañante ${name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No hay acompañantes agregados aún.
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Selecciona un médico registrado o escribe un nombre manualmente.
          Usa la x para quitar un acompañante del listado.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pacientes estimados"
          name="estimatedPatients"
          type="number"
          min="1"
          value={form.estimatedPatients}
          onChange={onChange}
          placeholder="100"
          required
        />
        <Input
          label="Medicamentos estimados"
          name="estimatedMedicines"
          type="number"
          min="1"
          value={form.estimatedMedicines}
          onChange={onChange}
          placeholder="300"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
          Estado inicial
        </label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
        >
          <option value="PLANNED">Planificada</option>
          <option value="IN_PROGRESS">En Curso</option>
        </select>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Crear jornada
        </Button>
      </div>
    </form>
  );
}

// Vista detalle de la jornada con su inventario asignado
function WorkdayDetail({
  workday,
  workdayInventory,
  loading,
  onAssign,
  onConsumption,
  onReturn,
  onFinish,
  onManageDoctors,
  canAssign,
  canConsume,
  canReturn,
  canFinish,
  canManageDoctors,
  formError,
}) {
  return (
    <div className="space-y-5">
      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Fecha inicio</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatWorkdayDate(workday.startDate)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Fecha fin</p>
          <p className="text-sm font-semibold text-gray-700">
            {formatWorkdayDate(workday.endDate)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Estado</p>
          <div className="mt-0.5">{getStatusBadge(workday.status)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Responsable</p>
          <p className="text-sm font-semibold text-gray-700">
            {workday.manager?.name || "—"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Acompañantes</p>
          <p className="text-sm font-semibold text-gray-700">
            {(workday.companions || []).length > 0
              ? workday.companions.join(", ")
              : (workday.doctors || []).length > 0
                ? workday.doctors.map((d) => d.name).join(", ")
                : "Sin acompañantes"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Ubicación</p>
          <p className="text-sm font-semibold text-gray-700">
            {workday.location?.municipality}, {workday.location?.department}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {workday.location?.address}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Estimados</p>
          <p className="text-sm font-semibold text-gray-700">
            {workday.estimatedPatients} pacientes
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {workday.estimatedMedicines} medicamentos
          </p>
        </div>
      </div>

      {workday.description && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          <p className="text-xs text-gray-400">Descripción</p>
          <p className="text-sm text-gray-700 mt-0.5">{workday.description}</p>
        </div>
      )}

      {canManageDoctors && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onManageDoctors}>
            Gestionar médicos asignados
          </Button>
        </div>
      )}

      {/* Inventario asignado */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-gray-700">
            Inventario de la Jornada
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({workdayInventory.length} medicamentos)
            </span>
          </h3>
          <div className="flex gap-2">
            {canAssign &&
              workday.status !== "FINISHED" &&
              workday.status !== "COMPLETED" && (
                <Button variant="primary" size="sm" onClick={onAssign}>
                  <PlusIcon className="w-4 h-4" />
                  Asignar medicamento
                </Button>
              )}
            {canFinish &&
              workday.status !== "FINISHED" &&
              workday.status !== "COMPLETED" && (
                <Button variant="secondary" size="sm" onClick={onFinish}>
                  Finalizar jornada
                </Button>
              )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-6 bg-gray-50 rounded-xl border border-gray-100">
            Cargando inventario asignado...
          </p>
        ) : workdayInventory.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6 bg-gray-50 rounded-xl border border-gray-100">
            No hay medicamentos asignados a esta jornada
          </p>
        ) : (
          <div className="space-y-2">
            {workdayInventory.map((item) => (
              <div
                key={item.inventoryId}
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.compound || item.category || "Medicamento asignado"}{" "}
                      · Stock disponible:{" "}
                      <span className="font-semibold text-gray-600">
                        {item.totalStock} {item.packageUnit ?? item.unitOfMeasure}
                      </span>
                    </p>
                  </div>
                  {workday.status === "IN_PROGRESS" && (canConsume || canReturn) && (
                    <div className="flex gap-2">
                      {canConsume && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onConsumption(item)}
                        >
                          Consumo
                        </Button>
                      )}
                      {canReturn && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReturn(item)}
                        >
                          Retorno
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3 grid gap-2">
                  {item.lots.map((lot) => (
                    <div
                      key={lot.batch}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-gray-100"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-600">
                          Lote {lot.batch}
                        </p>
                        <p className="text-xs text-gray-400">
                          Vence:{" "}
                          {new Date(lot.expirationDate).toLocaleDateString(
                            "es-GT",
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-gray-700">
                        {getLotAvailableUnits(item, lot)} {item.minimumUnit ?? item.unitOfMeasure}
                      </p>
                    </div>
                  ))}
                  {item.lots.length === 0 && (
                    <p className="text-xs text-gray-400">Sin lotes asignados</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Formulario para asignar medicamentos a la jornada
// Body alineado con backend: jornadaId, jornadaNombre, detalle[{medicineId, batch, quantity, expirationDate}]
function AssignMedicineForm({
  form,
  onChange,
  onSubmit,
  onClose,
  centralInventory,
  submitting,
  formError,
}) {
  const hasAvailableLotStock = (lot) =>
    [lot?.stock, lot?.boxes, lot?.blisters, lot?.units].some(
      (quantity) => Number(quantity ?? 0) > 0,
    );
  const selectedMedicine = centralInventory.find(
    (med) => String(med.medicineId) === String(form.medicineId),
  );
  const hasInvalidUnitHierarchy =
    Boolean(selectedMedicine?.intermediateUnit) &&
    String(selectedMedicine.intermediateUnit).trim().toLocaleLowerCase() ===
      String(selectedMedicine.minimumUnit ?? "").trim().toLocaleLowerCase();
  const availableEntryUnits = useMemo(() => {
    if (!selectedMedicine) return [];
    const units = [selectedMedicine.packageUnit, selectedMedicine.minimumUnit];
    if (selectedMedicine.intermediateUnit) {
      units.splice(1, 0, selectedMedicine.intermediateUnit);
    }
    return units.filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index);
  }, [selectedMedicine]);

  const conversionSummary = useMemo(() => {
    if (!selectedMedicine || !form.entryQuantity || !form.entryUnit) return null;
    const amount = Number(form.entryQuantity || 0);
    const isPackageUnit = String(form.entryUnit) === String(selectedMedicine.packageUnit);
    const isIntermediateUnit = selectedMedicine.intermediateUnit && String(form.entryUnit) === String(selectedMedicine.intermediateUnit);
    const isMinimumUnit = String(form.entryUnit) === String(selectedMedicine.minimumUnit);

    if (isPackageUnit) {
      const unitsPerPackage = Number(selectedMedicine.unitsPerPackage || 1);
      const unitsPerMinimumUnit = Number(selectedMedicine.unitsPerMinimumUnit || 1);
      const hasIntermediate = Boolean(selectedMedicine.intermediateUnit && unitsPerMinimumUnit > 1);

      if (hasIntermediate) {
        const baseUnits = amount * unitsPerPackage * unitsPerMinimumUnit;
        return `${amount} ${form.entryUnit} = ${amount * unitsPerPackage} ${selectedMedicine.intermediateUnit} = ${baseUnits} ${selectedMedicine.minimumUnit || "unidad"} a asignar`;
      }

      const baseUnits = amount * unitsPerPackage;
      return `${amount} ${form.entryUnit} = ${baseUnits} ${selectedMedicine.minimumUnit || "unidad"} a asignar`;
    }

    if (isIntermediateUnit) {
      const unitsPerMinimumUnit = Number(selectedMedicine.unitsPerMinimumUnit || 1);
      const baseUnits = amount * unitsPerMinimumUnit;
      return `${amount} ${form.entryUnit} = ${baseUnits} ${selectedMedicine.minimumUnit || "unidad"} a asignar`;
    }

    if (isMinimumUnit) {
      return `${amount} ${form.entryUnit} = ${amount} ${selectedMedicine.minimumUnit || "unidad"} a asignar`;
    }

    return null;
  }, [form.entryQuantity, form.entryUnit, selectedMedicine]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">
          Medicamento
        </label>
        <select
          name="medicineId"
          value={form.medicineId}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
          required
        >
          <option value="">Seleccionar medicamento</option>
          {centralInventory.map((med) => (
            <option key={med.medicineId} value={med.medicineId}>
              {med.name} (Stock: {med.totalStock} {med.minimumUnit ?? med.unitOfMeasure})
            </option>
          ))}
        </select>
      </div>
      {form.medicineId && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Lote</label>
          <select
            name="batch"
            value={form.batch}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
          >
            <option value="">Seleccionar lote</option>
            {centralInventory
              .find((m) => String(m.medicineId) === String(form.medicineId))
              ?.lots.filter(hasAvailableLotStock)
              .map((l) => (
                <option key={l.batch} value={l.batch}>
                  {l.batch} — Stock: {getLotAvailableUnits(selectedMedicine, l)} {selectedMedicine.minimumUnit ?? selectedMedicine.unitOfMeasure} — Vence:{" "}
                  {new Date(l.expirationDate).toLocaleDateString("es-GT")}
                </option>
              ))}
          </select>
        </div>
      )}
          <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            Unidad de asignación
          </label>
          <select
            name="entryUnit"
            value={form.entryUnit || ""}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
            disabled={!availableEntryUnits.length}
          >
            <option value="">Seleccionar unidad</option>
            {availableEntryUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cantidad a asignar (en la unidad elegida)"
          name="entryQuantity"
          type="number"
          min="1"
          value={form.entryQuantity ?? ""}
          onChange={onChange}
          placeholder="5"
          required
        />

      </div>
      {conversionSummary && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-sm font-semibold text-primary">Resumen de conversión</p>
          <p className="text-sm text-gray-700">{conversionSummary}</p>
        </div>
      )}
      {hasInvalidUnitHierarchy && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Este medicamento tiene una configuración de unidades inválida. Edita el catálogo: la unidad intermedia debe ser distinta de la unidad mínima.
        </p>
      )}
      {selectedMedicine && form.batch && (
        <p className="text-xs text-gray-500 rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
          El sistema valida el stock en {selectedMedicine.minimumUnit}. Revisa el resumen antes de asignar.
        </p>
      )}
      <p className="text-xs text-gray-400 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
        Esta cantidad se descontara del inventario central (ASIGNACION_JORNADA).
      </p>
      <div className="flex gap-3 justify-end pt-2">
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={submitting || hasInvalidUnitHierarchy}>
          {submitting ? "Asignando..." : "Asignar"}
        </Button>
      </div>
    </form>
  );
}

// Formulario reutilizable para consumo y retorno
// Consumo → backend: productoId, cantidad (POST /movimientos/consumo-jornada)
// Retorno → backend: productoId, cantidad (POST /movimientos/retorno-jornada)
function WorkdayMovementForm({
  form,
  onChange,
  onSubmit,
  onClose,
  item,
  tipo,
  submitting,
  formError,
}) {
  const availableEntryUnits = useMemo(() => {
    if (!item) return [];
    const units = [item.packageUnit, item.minimumUnit];
    if (item.intermediateUnit) {
      units.splice(1, 0, item.intermediateUnit);
    }
    return units.filter(Boolean).filter((value, index, arr) => arr.indexOf(value) === index);
  }, [item]);

  const conversionSummary = useMemo(() => {
    if (!item || !form.entryQuantity || !form.entryUnit) return null;
    const amount = Number(form.entryQuantity || 0);
    const isPackageUnit = String(form.entryUnit) === String(item.packageUnit);
    const isIntermediateUnit = item.intermediateUnit && String(form.entryUnit) === String(item.intermediateUnit);
    const isMinimumUnit = String(form.entryUnit) === String(item.minimumUnit);

    if (isPackageUnit) {
      const unitsPerPackage = Number(item.unitsPerPackage || 1);
      const unitsPerMinimumUnit = Number(item.unitsPerMinimumUnit || 1);
      const hasIntermediate = Boolean(item.intermediateUnit && unitsPerMinimumUnit > 1);

      if (hasIntermediate) {
        const baseUnits = amount * unitsPerPackage * unitsPerMinimumUnit;
        return `${amount} ${form.entryUnit} = ${amount * unitsPerPackage} ${item.intermediateUnit} = ${baseUnits} ${item.minimumUnit || "unidad"} a ${tipo === "CONSUMO" ? "consumir" : "retornar"}`;
      }

      const baseUnits = amount * unitsPerPackage;
      return `${amount} ${form.entryUnit} = ${baseUnits} ${item.minimumUnit || "unidad"} a ${tipo === "CONSUMO" ? "consumir" : "retornar"}`;
    }

    if (isIntermediateUnit) {
      const unitsPerMinimumUnit = Number(item.unitsPerMinimumUnit || 1);
      const baseUnits = amount * unitsPerMinimumUnit;
      return `${amount} ${form.entryUnit} = ${baseUnits} ${item.minimumUnit || "unidad"} a ${tipo === "CONSUMO" ? "consumir" : "retornar"}`;
    }

    if (isMinimumUnit) {
      return `${amount} ${form.entryUnit} = ${amount} ${item.minimumUnit || "unidad"} a ${tipo === "CONSUMO" ? "consumir" : "retornar"}`;
    }

    return null;
  }, [form.entryQuantity, form.entryUnit, item, tipo]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {formError}
        </p>
      )}
      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <p className="text-xs text-gray-400">Medicamento</p>
        <p className="text-sm font-semibold text-gray-700">{item?.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Disponible:{" "}
          <span className="font-semibold text-gray-600">
            {item?.totalStock ?? 0} {item?.packageUnit ?? item?.unitOfMeasure}
          </span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={
            tipo === "CONSUMO" ? "Cantidad consumida" : "Cantidad a retornar"
          }
          name="entryQuantity"
          type="number"
          min="0"
          max={item?.totalStock ?? 0}
          value={form.entryQuantity ?? ""}
          onChange={onChange}
          placeholder="5"
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">
            {tipo === "CONSUMO" ? "Unidad de consumo" : "Unidad de retorno"}
          </label>
          <select
            name="entryUnit"
            value={form.entryUnit || ""}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-700 transition"
            required
            disabled={!availableEntryUnits.length}
          >
            <option value="">Seleccionar unidad</option>
            {availableEntryUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
      </div>
      {conversionSummary && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-sm font-semibold text-primary">Resumen de conversión</p>
          <p className="text-sm text-gray-700">{conversionSummary}</p>
        </div>
      )}
      <Input
        label="Observación"
        name="observacion"
        value={form.observacion}
        onChange={onChange}
        placeholder={
          tipo === "CONSUMO"
            ? "Ej: Receta paciente"
            : "Ej: Medicamento no utilizado"
        }
      />
      <div className="flex gap-3 justify-end pt-2">
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          variant={tipo === "CONSUMO" ? "danger" : "primary"}
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Guardando..."
            : tipo === "CONSUMO"
              ? "Registrar consumo"
              : "Registrar retorno"}
        </Button>
      </div>
    </form>
  );
}

const workdayInicial = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  department: "",
  municipality: "",
  address: "",
  managerUserId: "",
  companions: [],
  estimatedPatients: "",
  estimatedMedicines: "",
  status: "PLANNED",
};
const assignInicial = { medicineId: "", batch: "", entryQuantity: "", entryUnit: "" };
const movementInicial = { entryQuantity: "", observacion: "", entryUnit: "" };

export default function JornadasPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManageWorkdays = currentUser?.rol === "SUPER_ADMIN";
  const canTransferMedication =
    currentUser?.rol === "ADMIN" || currentUser?.rol === "SUPER_ADMIN";
  const canConsumeMedication =
    currentUser?.rol === "MEDICO" || currentUser?.rol === "SUPER_ADMIN";
  const {
    workdays,
    users,
    centralInventory,
    workdayInventoryById,
    loading,
    inventoryLoading,
    error,
    refetch,
    fetchWorkdayInventory,
    createNewWorkday,
    removeWorkday,
    updateWorkdayStatus,
    assignDoctors,
    assignMedicine,
    registerWorkdayConsumption,
    registerWorkdayReturn,
  } = useWorkdayInventory();

  // El backend aplica este mismo control. Se conserva aquí para que la vista
  // del médico nunca muestre jornadas ajenas, aun si recibe datos en caché.
  const visibleWorkdays = useMemo(() => {
    if (currentUser?.rol !== "MEDICO") return workdays;

    const currentUserId = String(currentUser._id ?? currentUser.id ?? "");
    if (!currentUserId) return [];

    return workdays.filter((workday) =>
      String(workday.manager?.userId ?? "") === currentUserId ||
      (workday.doctors ?? []).some(
        (doctor) => String(doctor.userId ?? "") === currentUserId,
      ),
    );
  }, [currentUser, workdays]);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalConsumo, setModalConsumo] = useState(false);
  const [modalRetorno, setModalRetorno] = useState(false);
  const [modalMedicos, setModalMedicos] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);

  const [selectedWorkday, setSelectedWorkday] = useState(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [formWorkday, setFormWorkday] = useState(workdayInicial);
  const [formAssign, setFormAssign] = useState(assignInicial);
  const [formMovement, setFormMovement] = useState(movementInicial);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChangeWorkday = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setFormWorkday((prev) => ({
        ...prev,
        department: value,
        municipality: "",
      }));
    } else {
      setFormWorkday((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeAssign = (e) => {
    const { name, value } = e.target;
    if (name === "medicineId") {
      setFormAssign((prev) => ({ ...prev, medicineId: value, batch: "", entryUnit: "" }));
    } else {
      setFormAssign((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeMovement = (e) => {
    const { name, value } = e.target;
    setFormMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerDetalle = async (workday) => {
    setSelectedWorkday(workday);
    setModalDetalle(true);
    setFormError(null);
    try {
      await fetchWorkdayInventory(workday._id);
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.response?.data?.message ??
        "No se pudo cargar el inventario de la jornada";
      if (status === 403) {
        setModalDetalle(false);
        setSelectedWorkday(null);
      }
      setFormError(message);
    }
  };
  const handleEliminar = (workday) => {
    setSelectedWorkday(workday);
    setConfirmEliminar(true);
  };

  // Crea jornada - body alineado con backend (manager + doctors)
  const handleCrearWorkday = async (e) => {
    e.preventDefault();
    const manager = users.find(
      (user) =>
        user.rol === "MEDICO" && user._id === formWorkday.managerUserId,
    );
    if (!manager) {
      setFormError("Debes seleccionar un médico responsable de la jornada");
      return;
    }

    const companions = (formWorkday.companions ?? [])
      .map((name) => name.trim())
      .filter(Boolean);

    setSubmitting(true);
    setFormError(null);
    try {
      await createNewWorkday({
        name: formWorkday.name,
        description: formWorkday.description,
        // Mediodía local evita que un campo date se desplace al día anterior
        // cuando el navegador lo serializa a UTC.
        startDate: new Date(`${formWorkday.startDate}T12:00:00`).toISOString(),
        endDate: new Date(`${formWorkday.endDate}T12:00:00`).toISOString(),
        location: {
          department: formWorkday.department,
          municipality: formWorkday.municipality,
          address: formWorkday.address,
        },
        manager: {
          userId: manager._id,
          name: `${manager.nombre ?? ""} ${manager.apellido ?? ""}`.trim(),
        },
        // El responsable también es un médico asignado a la jornada, por lo
        // que heredará su acceso e inventario al iniciar sesión.
        doctors: [
          {
            userId: manager._id,
            name: `${manager.nombre ?? ""} ${manager.apellido ?? ""}`.trim(),
          },
        ],
        companions,
        estimatedPatients: Number(formWorkday.estimatedPatients),
        estimatedMedicines: Number(formWorkday.estimatedMedicines),
        status: formWorkday.status,
      });
      setFormWorkday(workdayInicial);
      setModalCrear(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ?? "No se pudo crear la jornada",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Asigna medicamentos - cuando se conecte el backend usar registerTransfer() de coreService
  // Body: { jornadaId, jornadaNombre, detalle: [{ medicineId, batch, quantity, expirationDate }] }
  const handleAsignarMedicamento = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await assignMedicine({
        workday: selectedWorkday,
        medicineId: formAssign.medicineId,
        batch: formAssign.batch,
        entryQuantity: formAssign.entryQuantity,
        entryUnit: formAssign.entryUnit,
      });
      setFormAssign(assignInicial);
      setModalAsignar(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ?? "No se pudo asignar el medicamento",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Registra consumo - cuando se conecte el backend usar registerConsumption() de coreService
  // Body: { productoId, cantidad }
  const handleRegistrarConsumo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await registerWorkdayConsumption({
        item: selectedInventoryItem,
        entryQuantity: formMovement.entryQuantity,
        entryUnit: formMovement.entryUnit,
      });
      setFormMovement(movementInicial);
      setModalConsumo(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ?? "No se pudo registrar el consumo",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Registra retorno - cuando se conecte el backend usar registerReturn() de coreService
  // Body: { productoId, cantidad }
  const handleRegistrarRetorno = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await registerWorkdayReturn({
        item: selectedInventoryItem,
        entryQuantity: formMovement.entryQuantity,
        entryUnit: formMovement.entryUnit,
      });
      setFormMovement(movementInicial);
      setModalRetorno(false);
    } catch (err) {
      setFormError(
        err.response?.data?.message ?? "No se pudo registrar el retorno",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizarJornada = async (workday) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await updateWorkdayStatus(workday._id, "FINISHED");
      setSelectedWorkday((prev) => prev?._id === workday._id ? { ...prev, status: "FINISHED" } : prev);
    } catch (err) {
      setFormError(
        err.response?.data?.message ?? "No se pudo finalizar la jornada",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuardarMedicos = async () => {
    const doctors = users
      .filter((user) => user.rol === "MEDICO" && selectedDoctorIds.includes(user._id))
      .map((user) => ({
        userId: user._id,
        name: `${user.nombre} ${user.apellido}`.trim(),
      }));

    setSubmitting(true);
    setFormError(null);
    try {
      const workday = await assignDoctors(selectedWorkday._id, doctors);
      setSelectedWorkday(workday);
      setModalMedicos(false);
    } catch (err) {
      setFormError(err.response?.data?.message ?? "No se pudieron actualizar los médicos");
    } finally {
      setSubmitting(false);
    }
  };

  // Elimina jornada - cuando se conecte el backend usar deleteWorkday() de workdayService
  const handleConfirmarEliminar = async () => {
    setSubmitting(true);
    try {
      await removeWorkday(selectedWorkday._id);
      setConfirmEliminar(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columnas = [
    {
      key: "name",
      label: "Jornada",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-700">{row.name}</p>
          <p className="text-xs text-gray-400">
            {row.location?.municipality}, {row.location?.department}
          </p>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Fechas",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700">
            {formatWorkdayDate(row.startDate)}
          </p>
          <p className="text-xs text-gray-400">
            al {formatWorkdayDate(row.endDate)}
          </p>
        </div>
      ),
    },
    {
      key: "manager",
      label: "Responsable",
      render: (row) => row.manager?.name || "—",
    },
    {
      key: "companions",
      label: "Acompañantes",
      render: (row) => {
        const companions = row.companions || [];
        const doctors = row.doctors || [];
        const items =
          companions.length > 0 ? companions : doctors.map((d) => d.name);
        if (items.length === 0) {
          return (
            <span className="text-xs text-gray-400">Sin acompañantes</span>
          );
        }
        if (items.length === 1) {
          return items[0];
        }
        return (
          <div>
            <p className="text-sm text-gray-700">{items[0]}</p>
            <p className="text-xs text-gray-400">+{items.length - 1} más</p>
          </div>
        );
      },
    },
    {
      key: "estimados",
      label: "Estimados",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-700">
            {row.estimatedPatients} pacientes
          </p>
          <p className="text-xs text-gray-400">
            {row.estimatedMedicines} medicamentos
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "inventario",
      label: "Inv. Asignado",
      render: (row) => (
        <Badge variant="gray">
          {(workdayInventoryById[row._id] || []).length} items
        </Badge>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVerDetalle(row)}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
          {canManageWorkdays && row.status === "COMPLETED" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleEliminar(row)}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Jornadas"
        subtitle="Administra las jornadas médicas y su inventario asignado"
        action={
          canManageWorkdays ? (
            <Button
              variant="primary"
              onClick={() => {
                setFormWorkday(workdayInicial);
                setFormError(null);
                setModalCrear(true);
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Nueva Jornada
            </Button>
          ) : null
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Resumen de jornadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Total Jornadas</p>
          <p className="text-2xl font-extrabold text-gray-800">
            {visibleWorkdays.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">En Curso</p>
          <p className="text-2xl font-extrabold text-green-500">
            {visibleWorkdays.filter((j) => j.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium">Planificadas</p>
          <p className="text-2xl font-extrabold text-blue-500">
            {visibleWorkdays.filter((j) => j.status === "PLANNED").length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table
          columns={columnas}
          data={visibleWorkdays}
          loading={loading}
          emptyMessage="No hay jornadas registradas"
        />
      </div>

      <Modal
        isOpen={modalCrear}
        onClose={() => setModalCrear(false)}
        title="Nueva Jornada"
        size="lg"
      >
        {formError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {formError}
          </p>
        )}
        <WorkdayForm
          form={formWorkday}
          onChange={handleChangeWorkday}
          onSubmit={handleCrearWorkday}
          onClose={() => setModalCrear(false)}
          departamentos={departamentosGuatemala}
          medicalUsers={users.filter((user) => user.rol === "MEDICO")}
        />
      </Modal>

      <Modal
        isOpen={modalDetalle}
        onClose={() => setModalDetalle(false)}
        title={selectedWorkday?.name}
        size="lg"
      >
        {selectedWorkday && (
          <WorkdayDetail
            workday={selectedWorkday}
            workdayInventory={workdayInventoryById[selectedWorkday._id] || []}
            loading={inventoryLoading}
            onAssign={() => {
              setFormAssign(assignInicial);
              setFormError(null);
              setModalAsignar(true);
            }}
            onConsumption={(item) => {
              setSelectedInventoryItem(item);
              setFormMovement(movementInicial);
              setFormError(null);
              setModalConsumo(true);
            }}
            onReturn={(item) => {
              setSelectedInventoryItem(item);
              setFormMovement(movementInicial);
              setFormError(null);
              setModalRetorno(true);
            }}
            onFinish={(e) => {
              e?.preventDefault?.();
              handleFinalizarJornada(selectedWorkday);
            }}
            onManageDoctors={() => {
              setSelectedDoctorIds((selectedWorkday.doctors || []).map((doctor) => doctor.userId));
              setModalMedicos(true);
            }}
            canAssign={canTransferMedication}
            canConsume={canConsumeMedication}
            canReturn={canManageWorkdays}
            canFinish={canManageWorkdays}
            canManageDoctors={canTransferMedication}
            formError={formError}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalMedicos}
        onClose={() => setModalMedicos(false)}
        title="Médicos asignados"
      >
        <div className="space-y-3">
          {users.filter((user) => user.rol === "MEDICO").map((user) => (
            <label key={user._id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedDoctorIds.includes(user._id)}
                onChange={() => setSelectedDoctorIds((current) =>
                  current.includes(user._id)
                    ? current.filter((id) => id !== user._id)
                    : [...current, user._id],
                )}
              />
              <span>{user.nombre} {user.apellido}</span>
            </label>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalMedicos(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleGuardarMedicos} disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar asignación"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalAsignar}
        onClose={() => setModalAsignar(false)}
        title="Asignar Medicamento"
        size="sm"
      >
        <AssignMedicineForm
          form={formAssign}
          onChange={handleChangeAssign}
          onSubmit={handleAsignarMedicamento}
          onClose={() => setModalAsignar(false)}
          centralInventory={centralInventory}
          submitting={submitting}
          formError={formError}
        />
      </Modal>

      <Modal
        isOpen={modalConsumo}
        onClose={() => setModalConsumo(false)}
        title="Registrar Consumo"
        size="sm"
      >
        <WorkdayMovementForm
          form={formMovement}
          onChange={handleChangeMovement}
          onSubmit={handleRegistrarConsumo}
          onClose={() => setModalConsumo(false)}
          item={selectedInventoryItem}
          tipo="CONSUMO"
          submitting={submitting}
          formError={formError}
        />
      </Modal>

      <Modal
        isOpen={modalRetorno}
        onClose={() => setModalRetorno(false)}
        title="Registrar Retorno"
        size="sm"
      >
        <WorkdayMovementForm
          form={formMovement}
          onChange={handleChangeMovement}
          onSubmit={handleRegistrarRetorno}
          onClose={() => setModalRetorno(false)}
          item={selectedInventoryItem}
          tipo="RETORNO"
          submitting={submitting}
          formError={formError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmEliminar}
        onClose={() => setConfirmEliminar(false)}
        onConfirm={handleConfirmarEliminar}
        title="¿Eliminar jornada?"
        message={`¿Estás seguro que deseas eliminar "${selectedWorkday?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
