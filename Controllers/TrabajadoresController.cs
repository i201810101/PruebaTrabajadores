using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PruebaTrabajadores.Data;
using PruebaTrabajadores.Models;

namespace PruebaTrabajadores.Controllers
{
    public class TrabajadoresController : Controller
    {
        private readonly ApplicationDbContext _context;

        public TrabajadoresController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Trabajadores
        public async Task<IActionResult> Index(string filtroSexo = null)
        {
            // 1. OBTENER LISTADO CON PROCEDIMIENTO ALMACENADO
            var trabajadores = await _context.Trabajadores
                .FromSqlRaw("EXEC sp_ListarTrabajadores @SexoFiltro = {0}",
                    (object)filtroSexo ?? DBNull.Value)
                .ToListAsync();

            // 2. OBTENER RESUMEN DESDE LA VISTA
            var resumen = await _context.Database
                .SqlQueryRaw<ResumenViewModel>("SELECT * FROM vw_ResumenTrabajadores")
                .FirstOrDefaultAsync() ?? new ResumenViewModel();

            // 3. PASAR DATOS A LA VISTA
            ViewBag.FiltroSexo = filtroSexo;
            ViewBag.Resumen = resumen;

            return View(trabajadores);
        }

        // GET: Trabajadores/Create (Modal)
        public IActionResult Create()
        {
            return PartialView("Create");
        }

        // POST: Trabajadores/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Nombres,Apellidos,DNI,CorreoElectronico,Telefono,Sexo,FechaNacimiento,FechaIngreso,Cargo,Departamento,Salario,Estado")] Trabajador trabajador)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Ejecutar procedimiento almacenado
                    await _context.Database.ExecuteSqlRawAsync(
                        "EXEC sp_InsertarTrabajador @Nombres={0}, @Apellidos={1}, @DNI={2}, @CorreoElectronico={3}, @Telefono={4}, @Sexo={5}, @FechaNacimiento={6}, @FechaIngreso={7}, @Cargo={8}, @Departamento={9}, @Salario={10}, @Estado={11}",
                        trabajador.Nombres, trabajador.Apellidos, trabajador.DNI, trabajador.CorreoElectronico,
                        trabajador.Telefono, trabajador.Sexo, trabajador.FechaNacimiento, trabajador.FechaIngreso,
                        trabajador.Cargo, trabajador.Departamento, trabajador.Salario, trabajador.Estado);

                    return Json(new { success = true, message = "Trabajador registrado exitosamente" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = $"Error: {ex.Message}" });
                }
            }

            var errors = ModelState.Values.SelectMany(v => v.Errors)
                                         .Select(e => e.ErrorMessage)
                                         .ToList();
            return Json(new { success = false, message = "Datos inválidos", errors });
        }

        // GET: Trabajadores/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
                return NotFound();

            var trabajador = await _context.Trabajadores
                .FromSqlRaw("EXEC sp_ObtenerTrabajadorPorId @Id = {0}", id)
                .ToListAsync();

            var trabajadorEncontrado = trabajador.FirstOrDefault();

            if (trabajadorEncontrado == null)
                return NotFound();

            return PartialView("Edit", trabajadorEncontrado);
        }

        // POST: Trabajadores/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Nombres,Apellidos,DNI,CorreoElectronico,Telefono,Sexo,FechaNacimiento,FechaIngreso,Cargo,Departamento,Salario,Estado")] Trabajador trabajador)
        {
            if (id != trabajador.Id)
                return Json(new { success = false, message = "ID no coincide" });

            if (ModelState.IsValid)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "EXEC sp_ActualizarTrabajador @Id={0}, @Nombres={1}, @Apellidos={2}, @DNI={3}, @CorreoElectronico={4}, @Telefono={5}, @Sexo={6}, @FechaNacimiento={7}, @FechaIngreso={8}, @Cargo={9}, @Departamento={10}, @Salario={11}, @Estado={12}",
                        trabajador.Id, trabajador.Nombres, trabajador.Apellidos, trabajador.DNI, trabajador.CorreoElectronico,
                        trabajador.Telefono, trabajador.Sexo, trabajador.FechaNacimiento, trabajador.FechaIngreso,
                        trabajador.Cargo, trabajador.Departamento, trabajador.Salario, trabajador.Estado);

                    return Json(new { success = true, message = "Trabajador actualizado exitosamente" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = $"Error: {ex.Message}" });
                }
            }

            var errors = ModelState.Values.SelectMany(v => v.Errors)
                                         .Select(e => e.ErrorMessage)
                                         .ToList();
            return Json(new { success = false, message = "Datos inválidos", errors });
        }

        // GET: Trabajadores/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
                return NotFound();

            var trabajador = await _context.Trabajadores
                .FromSqlRaw("EXEC sp_ObtenerTrabajadorPorId @Id = {0}", id)
                .ToListAsync();

            var trabajadorEncontrado = trabajador.FirstOrDefault();

            if (trabajadorEncontrado == null)
                return NotFound();

            return PartialView("Delete", trabajadorEncontrado);
        }

        // POST: Trabajadores/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "EXEC sp_EliminarTrabajador @Id = {0}", id);

                return Json(new { success = true, message = "Trabajador eliminado exitosamente" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error al eliminar: {ex.Message}" });
            }
        }
    }
}