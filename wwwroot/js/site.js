// ========== CONFIGURACIÓN GLOBAL ==========
const Alertas = {
    exito: (mensaje) => {
        Swal.fire({
            title: '¡Excelente!',
            text: mensaje,
            icon: 'success',
            confirmButtonColor: '#0d9488',
            confirmButtonText: 'Aceptar',
            timer: 5000,
            timerProgressBar: true
        });
    },

    error: (mensaje) => {
        if (Array.isArray(mensaje)) {
            let listaErrores = '<ul class="text-start mb-0" style="list-style-type: none; padding-left: 0;">';
            mensaje.forEach(err => {
                listaErrores += `<li style="margin-bottom: 8px;">❌ ${err}</li>`;
            });
            listaErrores += '</ul>';

            Swal.fire({
                title: 'Errores de validación',
                html: listaErrores,
                icon: 'error',
                confirmButtonColor: '#0d9488',
                confirmButtonText: 'Entendido'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: mensaje,
                icon: 'error',
                confirmButtonColor: '#0d9488',
                confirmButtonText: 'Entendido'
            });
        }
    },
};

// ========== SOBRESCRIBIR ALERT NATIVO ==========
window.alert = function (mensaje) {
    if (mensaje?.includes('Datos inválidos') || mensaje?.includes('errores:')) {
        return;
    }
    Alertas.error(mensaje);
};

// ========== INICIALIZACIÓN ==========
$(document).ready(function () {
    console.log('✅ Sistema de Gestión de Trabajadores iniciado');
    initTooltips();
    animateCards();
    animateTableRows();
});

function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each(function () {
        new bootstrap.Tooltip(this);
    });
}

function animateCards() {
    $('.card').each(function (index) {
        $(this).css({
            'animation': `fadeInUp 0.5s ease forwards ${index * 0.1}s`,
            'opacity': '0'
        });
    });
}

function animateTableRows() {
    $('.table tbody tr').each(function (index) {
        $(this).css({
            'animation': `slideInRight 0.5s ease forwards ${index * 0.05}s`,
            'opacity': '0'
        });
    });
}

// ========== GESTIÓN DE MODALES ==========
$(document).on('click', '#btnNuevoTrabajador', function () {
    $.ajax({
        url: '/Trabajadores/Create',
        type: 'GET',
        beforeSend: () => mostrarCargando(),
        success: function (data) {
            ocultarCargando();
            $('#modalTitle').text('➕ Registrar Nuevo Trabajador');
            $('#modalBody').html(data);
            $('#trabajadorModal').modal('show');
            formatearFechas();
            initValidacion();
        },
        error: () => {
            ocultarCargando();
            Alertas.error('Error al cargar el formulario');
        }
    });
});

$(document).on('click', '.btn-edit', function () {
    var id = $(this).data('id');
    $.ajax({
        url: '/Trabajadores/Edit/' + id,
        type: 'GET',
        beforeSend: () => mostrarCargando(),
        success: function (data) {
            ocultarCargando();
            $('#modalTitle').text('✏️ Editar Trabajador');
            $('#modalBody').html(data);
            $('#trabajadorModal').modal('show');
            formatearFechas();
            initValidacion();
        },
        error: () => {
            ocultarCargando();
            Alertas.error('Error al cargar el trabajador');
        }
    });
});

// ========== ELIMINAR TRABAJADOR - SOLO MODAL ==========
$(document).on('click', '.btn-delete', function () {
    var id = $(this).data('id');

    // ABRIR MODAL DE CONFIRMACIÓN (TU DELETE.CSHTML)
    $.get('/Trabajadores/Delete/' + id, function (data) {
        $('#modalTitle').text('Confirmar Eliminación');
        $('#modalBody').html(data);
        $('#trabajadorModal').modal('show');
    });
});

// ========== ENVÍO DE FORMULARIOS ==========
$(document).on('submit', '#createForm, #editForm', function (e) {
    e.preventDefault();
    var form = $(this);
    var esEdicion = form.attr('id') === 'editForm';

    $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize(),
        beforeSend: () => mostrarCargando(),
        success: function (response) {
            ocultarCargando();
            if (response.success) {
                $('#trabajadorModal').modal('hide');
                Alertas.exito(esEdicion ? 'Trabajador actualizado correctamente' : 'Trabajador registrado correctamente');
                setTimeout(() => location.reload(), 1500);
            } else {
                Alertas.error(response.errors || response.message || 'Error al guardar');
            }
        },
        error: function (xhr) {
            ocultarCargando();
            try {
                var response = JSON.parse(xhr.responseText);
                Alertas.error(response.errors || response.message || 'Error en el servidor');
            } catch {
                Alertas.error('Error al procesar la solicitud');
            }
        }
    });
});

// ========== BUSCADOR ==========
$(document).ready(function () {
    $('#searchInput').on('keyup', function () {
        var searchTerm = $(this).val().toLowerCase().trim();
        var visibleCount = 0;

        $('.trabajador-row').each(function () {
            var nombre = String($(this).data('nombre') || '').toLowerCase();
            var dni = String($(this).data('dni') || '').toLowerCase();
            var email = String($(this).data('email') || '').toLowerCase();
            var cargo = String($(this).data('cargo') || '').toLowerCase();

            if (searchTerm === '') {
                $(this).show();
                visibleCount++;
            } else {
                if (nombre.includes(searchTerm) || dni.includes(searchTerm) ||
                    email.includes(searchTerm) || cargo.includes(searchTerm)) {
                    $(this).show();
                    visibleCount++;
                } else {
                    $(this).hide();
                }
            }
        });

        var total = $('.trabajador-row').length;
        $('#resultadosBusqueda').html(
            searchTerm === '' ?
                `Mostrando ${total} trabajadores` :
                `Mostrando ${visibleCount} de ${total} trabajadores`
        );

        if (visibleCount === 0 && searchTerm !== '') {
            if (!$('#noResultsMessage').length) {
                $('#tablaTrabajadores tbody').append(`
                    <tr id="noResultsMessage">
                        <td colspan="7" class="text-center py-5">
                            <i class="fas fa-search text-muted" style="font-size: 3rem;"></i>
                            <h5 class="text-muted mt-3">No se encontraron resultados</h5>
                            <p class="text-muted">"${searchTerm}"</p>
                        </td>
                    </tr>
                `);
            }
        } else {
            $('#noResultsMessage').remove();
        }
    });

    $('#searchInput').on('keydown', function (e) {
        if (e.key === 'Escape') {
            $(this).val('').trigger('keyup');
        }
    });
});

// ========== FUNCIONES UTILITARIAS ==========
function formatearFechas() {
    $('input[type="date"]').each(function () {
        if (!$(this).val()) {
            $(this).val(new Date().toISOString().split('T')[0]);
        }
    });
}

function initValidacion() {
    $('#DNI, #Telefono').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.id === 'DNI' && this.value.length > 8) this.value = this.value.slice(0, 8);
    });
}

function mostrarCargando() {
    if ($('#loadingOverlay').length === 0) {
        $('body').append('<div id="loadingOverlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;"><div class="spinner-border text-light" style="width:3rem;height:3rem;"></div></div>');
    }
}

function ocultarCargando() {
    $('#loadingOverlay').fadeOut(300, function () { $(this).remove(); });
}

// ========== ESTILOS DINÁMICOS ==========
$('<style>').prop('type', 'text/css').html(`
    .pulse { animation: pulse 0.5s ease; }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .highlight { background: rgba(13,148,136,0.1) !important; transition: background 0.3s ease; }
    .is-invalid { border-color: #ef4444 !important; }
    .invalid-feedback { color: #ef4444; font-size: 0.85rem; margin-top: 0.25rem; }
`).appendTo('head');

console.log('%c✅ Sistema cargado con alertas profesionales', 'color: #0d9488; font-weight: bold; font-size: 14px;');