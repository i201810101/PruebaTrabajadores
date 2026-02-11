using Microsoft.EntityFrameworkCore;
using PruebaTrabajadores.Models;

namespace PruebaTrabajadores.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Trabajador> Trabajadores { get; set; }

        // Configuración adicional si es necesaria
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Mapeo a la tabla existente
            modelBuilder.Entity<Trabajador>().ToTable("Trabajadores");

            // Índice único para DNI
            modelBuilder.Entity<Trabajador>()
                .HasIndex(t => t.DNI)
                .IsUnique();
        }
    }
}