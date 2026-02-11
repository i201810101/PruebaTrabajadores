// ========== INICIALIZACIÓN ==========
$(document).ready(function () {
    console.log('✅ Sistema de Gestión de Trabajadores iniciado');

    // Inicializar tooltips de Bootstrap
    initTooltips();

    // Aplicar animaciones a las tarjetas
    animateCards();

    // Aplicar animaciones a las filas de la tabla
    animateTableRows();
});

// ========== INICIALIZACIÓN DE TOOLTIPS ==========
function initTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ========== ANIMACIONES AL CARGAR ==========
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

// Abrir modal de nuevo trabajador
$(document).on('click', '#btnNuevoTrabajador', function () {
    console.log('📝 Abriendo modal de nuevo trabajador');

    $.ajax({
        url: '/Trabajadores/Create',
        type: 'GET',
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (data) {
            ocultarCargando();
            $('#modalTitle').text('➕ Registrar Nuevo Trabajador');
            $('#modalBody').html(data);
            $('#trabajadorModal').modal('show');
            formatearFechas();
            initValidacion();
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al cargar el formulario:', error);
            mostrarNotificacion('❌ Error al cargar el formulario', 'error');
        }
    });
});

// Abrir modal de edición
$(document).on('click', '.btn-edit', function () {
    var id = $(this).data('id');
    console.log('✏️ Editando trabajador ID:', id);

    $.ajax({
        url: '/Trabajadores/Edit/' + id,
        type: 'GET',
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (data) {
            ocultarCargando();
            $('#modalTitle').text('✏️ Editar Trabajador');
            $('#modalBody').html(data);
            $('#trabajadorModal').modal('show');
            formatearFechas();
            initValidacion();
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al cargar trabajador:', error);
            mostrarNotificacion('❌ Error al cargar el trabajador', 'error');
        }
    });
});

// Abrir modal de eliminación
$(document).on('click', '.btn-delete', function () {
    var id = $(this).data('id');
    console.log('🗑️ Eliminando trabajador ID:', id);

    $.ajax({
        url: '/Trabajadores/Delete/' + id,
        type: 'GET',
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (data) {
            ocultarCargando();
            $('#modalTitle').text('⚠️ Confirmar Eliminación');
            $('#modalBody').html(data);
            $('#trabajadorModal').modal('show');
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al cargar confirmación:', error);
            mostrarNotificacion('❌ Error al cargar la confirmación', 'error');
        }
    });
});

// ========== ENVÍO DE FORMULARIOS VÍA AJAX ==========

// Crear trabajador
$(document).on('submit', '#createForm', function (e) {
    e.preventDefault();
    console.log('💾 Guardando nuevo trabajador...');

    var formData = $(this).serialize();

    $.ajax({
        url: '/Trabajadores/Create',
        type: 'POST',
        data: formData,
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (response) {
            ocultarCargando();

            if (response.success) {
                $('#trabajadorModal').modal('hide');
                mostrarNotificacion('✅ Trabajador registrado exitosamente', 'success');

                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                mostrarErroresValidacion(response.errors);
            }
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al crear trabajador:', error);
            mostrarNotificacion('❌ Error al registrar el trabajador', 'error');
        }
    });
});

// Actualizar trabajador
$(document).on('submit', '#editForm', function (e) {
    e.preventDefault();
    console.log('💾 Actualizando trabajador...');

    var formData = $(this).serialize();
    var id = $('#Id').val();

    $.ajax({
        url: '/Trabajadores/Edit/' + id,
        type: 'POST',
        data: formData,
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (response) {
            ocultarCargando();

            if (response.success) {
                $('#trabajadorModal').modal('hide');
                mostrarNotificacion('✅ Trabajador actualizado exitosamente', 'success');

                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                mostrarErroresValidacion(response.errors);
            }
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al actualizar trabajador:', error);
            mostrarNotificacion('❌ Error al actualizar el trabajador', 'error');
        }
    });
});

// Eliminar trabajador
$(document).on('submit', '#deleteForm', function (e) {
    e.preventDefault();
    console.log('🗑️ Eliminando trabajador...');

    var formData = $(this).serialize();

    $.ajax({
        url: '/Trabajadores/Delete',
        type: 'POST',
        data: formData,
        beforeSend: function () {
            mostrarCargando();
        },
        success: function (response) {
            ocultarCargando();

            if (response.success) {
                $('#trabajadorModal').modal('hide');
                mostrarNotificacion('✅ Trabajador eliminado exitosamente', 'success');

                setTimeout(function () {
                    location.reload();
                }, 1500);
            } else {
                mostrarNotificacion('❌ ' + (response.message || 'Error al eliminar'), 'error');
            }
        },
        error: function (xhr, status, error) {
            ocultarCargando();
            console.error('Error al eliminar trabajador:', error);
            mostrarNotificacion('❌ Error al eliminar el trabajador', 'error');
        }
    });
});

// ========== FUNCIONES UTILITARIAS ==========

// Formatear campos de fecha
function formatearFechas() {
    $('input[type="date"]').each(function () {
        if (!$(this).val()) {
            var today = new Date().toISOString().split('T')[0];
            $(this).val(today);
        }
    });
}

// Inicializar validación en tiempo real
function initValidacion() {
    // Validación de DNI (solo números, máximo 8 dígitos)
    $(document).on('input', '#DNI', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });

    // Validación de teléfono (solo números)
    $(document).on('input', '#Telefono', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Validación de email
    $(document).on('blur', '#CorreoElectronico', function () {
        var email = $(this).val();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            $(this).addClass('is-invalid');
            if (!$(this).next('.invalid-feedback').length) {
                $(this).after('<div class="invalid-feedback">Por favor ingrese un email válido</div>');
            }
        } else {
            $(this).removeClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
        }
    });
}

// Mostrar indicador de carga
function mostrarCargando() {
    if ($('#loadingOverlay').length === 0) {
        var loadingHtml = `
            <div id="loadingOverlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>
        `;
        $('body').append(loadingHtml);
    }
}

// Ocultar indicador de carga
function ocultarCargando() {
    $('#loadingOverlay').fadeOut(300, function () {
        $(this).remove();
    });
}

// Mostrar notificaciones toast
function mostrarNotificacion(mensaje, tipo) {
    // Crear contenedor si no existe
    if ($('#toastContainer').length === 0) {
        $('body').append('<div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 10000;"></div>');
    }

    var bgColor = tipo === 'success' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)';
    var icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    var titulo = tipo === 'success' ? 'Éxito' : 'Error';

    var toastId = 'toast-' + Date.now();
    var toastHtml = `
        <div id="${toastId}" class="toast align-items-center border-0" role="alert" style="background: ${bgColor}; color: white; min-width: 350px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="fas ${icono} me-3 fs-4"></i>
                    <div>
                        <strong class="d-block mb-1">${titulo}</strong>
                        <span>${mensaje}</span>
                    </div>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    $('#toastContainer').append(toastHtml);

    var toastElement = document.getElementById(toastId);
    var toast = new bootstrap.Toast(toastElement, { delay: 3500 });
    toast.show();

    setTimeout(function () {
        $('#' + toastId).fadeOut(300, function () {
            $(this).remove();
        });
    }, 4000);
}

// Mostrar errores de validación
function mostrarErroresValidacion(errors) {
    if (errors && errors.length > 0) {
        var mensaje = '<ul class="mb-0">';
        errors.forEach(function (error) {
            mensaje += '<li>' + error + '</li>';
        });
        mensaje += '</ul>';

        mostrarNotificacion(mensaje, 'error');
    }
}

// ========== FILTROS ==========

// Manejo de filtros de sexo
$(document).on('click', '.btn-group a', function (e) {
    // Remover clase active de todos
    $('.btn-group a').removeClass('active');
    // Agregar clase active al clickeado
    $(this).addClass('active');
});

// ========== EVENTOS DEL MODAL ==========

// Limpiar contenido al cerrar modal
$(document).on('hide.bs.modal', '#trabajadorModal', function () {
    $('#modalBody').html('');
    $('.modal-backdrop').remove();
});

// Prevenir cierre accidental del modal con cambios
var formModified = false;

$(document).on('input change', '#trabajadorModal form', function () {
    formModified = true;
});

$(document).on('click', '[data-bs-dismiss="modal"]', function (e) {
    if (formModified) {
        if (!confirm('¿Está seguro de cerrar? Los cambios no guardados se perderán.')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
    formModified = false;
});

// ========== EFECTOS VISUALES ==========

// Efecto de pulso en botones de acción
$(document).on('mouseenter', '.btn-sm', function () {
    $(this).addClass('pulse');
});

$(document).on('mouseleave', '.btn-sm', function () {
    $(this).removeClass('pulse');
});

// Efecto de highlight en filas
$(document).on('click', '.table tbody tr', function () {
    $(this).addClass('highlight');
    setTimeout(() => {
        $(this).removeClass('highlight');
    }, 1000);
});

// ========== ATAJOS DE TECLADO ==========

$(document).on('keydown', function (e) {
    // Ctrl + N: Nuevo trabajador
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        $('#btnNuevoTrabajador').click();
    }

    // ESC: Cerrar modal
    if (e.key === 'Escape') {
        $('#trabajadorModal').modal('hide');
    }
});

// ========== UTILIDADES ADICIONALES ==========

// Función para formatear números
function formatearNumero(numero) {
    return new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

// Función para capitalizar texto
function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para validar formulario antes de enviar
function validarFormulario(formId) {
    var valido = true;
    var errores = [];

    $(formId + ' [required]').each(function () {
        if (!$(this).val()) {
            valido = false;
            $(this).addClass('is-invalid');
            var label = $('label[for="' + $(this).attr('id') + '"]').text();
            errores.push('El campo ' + label + ' es requerido');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    if (!valido) {
        mostrarErroresValidacion(errores);
    }

    return valido;
}

// ========== AGREGAR ESTILOS DINÁMICOS ==========
$('<style>')
    .prop('type', 'text/css')
    .html(`
        .pulse {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .highlight {
            background: rgba(13, 148, 136, 0.1) !important;
            transition: background 0.3s ease;
        }
        
        .is-invalid {
            border-color: #ef4444 !important;
        }
        
        .invalid-feedback {
            color: #ef4444;
            font-size: 0.85rem;
            margin-top: 0.25rem;
        }
    `)
    .appendTo('head');

// ========== LOG DE CONSOLA ==========
console.log('%c Sistema de Gestión de Trabajadores ', 'background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 16px;');
console.log('%c ✅ Todos los módulos cargados correctamente ', 'color: #10b981; font-weight: bold;');