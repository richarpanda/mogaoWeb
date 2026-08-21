(function () {
    var SUPABASE_URL = 'https://jrlzrrgfseykqkfpqvfd.supabase.co';
    var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybHpycmdmc2V5a3FrZnBxdmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjY3ODksImV4cCI6MjA5OTMwMjc4OX0.ruGVP8C6ura9scteHXDO7A3Bx-gA85XJ8gdtVU8GT1k';
    var WA_NUMBER = '525537865554';
    var HEADERS = { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY };

    function supabaseGet(path) {
        return fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: HEADERS }).then(function (r) {
            if (!r.ok) throw new Error('Supabase ' + r.status);
            return r.json();
        });
    }

    function formatPrice(price) {
        if (!price) return 'Consulta disponibilidad';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price);
    }

    var STATUS_LABEL = {
        disponible: 'Disponible',
        apartada: 'Apartada',
        en_proceso: 'En proceso',
        vendida: 'Vendida'
    };

    // ── Gallery state ──────────────────────────────────────────────

    var galleryPhotos = [];
    var galleryIndex = 0;

    function openGallery(index) {
        galleryIndex = index;
        renderGalleryModal();
    }

    function renderGalleryModal() {
        var modal = document.getElementById('pd-gallery-modal');
        var img = document.getElementById('pd-gallery-modal-img');
        var counter = document.getElementById('pd-gallery-counter');
        if (!modal || !img) return;
        img.src = galleryPhotos[galleryIndex];
        img.alt = 'Foto ' + (galleryIndex + 1);
        if (counter) counter.textContent = (galleryIndex + 1) + ' / ' + galleryPhotos.length;
        modal.classList.add('is-open');
    }

    function closeGallery() {
        var modal = document.getElementById('pd-gallery-modal');
        if (modal) modal.classList.remove('is-open');
    }

    function prevPhoto() {
        galleryIndex = (galleryIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
        renderGalleryModal();
    }

    function nextPhoto() {
        galleryIndex = (galleryIndex + 1) % galleryPhotos.length;
        renderGalleryModal();
    }

    // ── Render ────────────────────────────────────────────────────

    function render(prop, fotos) {
        galleryPhotos = fotos.map(function (f) { return f.url; });
        var waText = encodeURIComponent('Hola MOGAO, me interesa la propiedad: ' + prop.titulo + (prop.ciudad ? ' en ' + prop.ciudad : ''));
        var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + waText;
        var location = [prop.direccion, prop.ciudad].filter(Boolean).join(', ') || 'Consultar ubicación';
        var heroUrl = galleryPhotos.length ? galleryPhotos[0] : null;
        var statusLabel = STATUS_LABEL[prop.estatus] || prop.estatus || '';

        // Update sticky bar link
        var stickyLink = document.getElementById('sticky-wa-link');
        if (stickyLink) stickyLink.href = waHref;

        // Update page title
        document.title = prop.titulo + ' | MOGAO';

        var html = '';

        // Hero
        html += '<section class="pd-hero">';
        if (heroUrl) {
            html += '<div class="pd-hero-img" style="background-image:url(\'' + heroUrl + '\')"></div>';
        } else {
            html += '<div class="pd-hero-img pd-hero-placeholder"><i class="fas fa-home"></i></div>';
        }
        html += '<div class="pd-hero-overlay"></div>';
        html += '<div class="pd-hero-content container">';
        html += '<a href="propiedades.html" class="pd-back"><i class="fas fa-arrow-left"></i> Volver al catálogo</a>';
        html += '<div class="pd-hero-meta">';
        var tipoNombre = prop.tipos_propiedad && prop.tipos_propiedad.nombre ? prop.tipos_propiedad.nombre : null;
        if (tipoNombre) html += '<span class="pd-tag">' + tipoNombre + '</span>';
        html += '<span class="pd-status pd-status--' + prop.estatus + '">' + statusLabel + '</span>';
        html += '</div>';
        html += '<h1 class="pd-title">' + prop.titulo + '</h1>';
        html += '<p class="pd-location"><i class="fas fa-map-marker-alt"></i> ' + location + '</p>';
        html += '<div class="pd-price">' + formatPrice(prop.precio) + '</div>';
        html += '</div>';
        html += '</section>';

        // Main content
        html += '<section class="pd-body">';
        html += '<div class="container pd-body-inner">';

        // Left col: description + photos + map
        html += '<div class="pd-col-main">';

        if (prop.descripcion) {
            html += '<div class="pd-block">';
            html += '<h2 class="pd-block-title">Descripción</h2>';
            html += '<p class="pd-description">' + prop.descripcion + '</p>';
            html += '</div>';
        }

        // Photo gallery
        if (galleryPhotos.length > 0) {
            html += '<div class="pd-block">';
            html += '<h2 class="pd-block-title">Fotos</h2>';
            html += '<div class="pd-gallery">';
            galleryPhotos.forEach(function (url, i) {
                html += '<button class="pd-gallery-thumb" data-index="' + i + '" aria-label="Ver foto ' + (i + 1) + '">';
                html += '<img src="' + url + '" alt="Foto ' + (i + 1) + '" loading="lazy">';
                html += '</button>';
            });
            html += '</div>';
            html += '</div>';
        }

        // Map
        if (prop.latitud != null && prop.longitud != null) {
            html += '<div class="pd-block">';
            html += '<h2 class="pd-block-title">Ubicación</h2>';
            html += '<div class="pd-map">';
            html += '<iframe title="Ubicación" width="100%" height="340" style="border:0" loading="lazy" ';
            html += 'src="https://www.google.com/maps?q=' + prop.latitud + ',' + prop.longitud + '&z=16&output=embed"></iframe>';
            html += '</div>';
            html += '</div>';
        }

        html += '</div>'; // pd-col-main

        // Right col: CTA card
        html += '<div class="pd-col-aside">';
        html += '<div class="pd-cta-card">';
        html += '<div class="pd-cta-price">' + formatPrice(prop.precio) + '</div>';
        html += '<p class="pd-cta-label">¿Te interesa esta propiedad?</p>';
        html += '<a href="' + waHref + '" class="btn-primary pd-cta-btn" target="_blank" rel="noopener">';
        html += '<i class="fab fa-whatsapp"></i> Consultar por WhatsApp';
        html += '</a>';
        html += '<ul class="pd-cta-perks">';
        html += '<li><i class="fas fa-check"></i> Respuesta en menos de 1 hora</li>';
        html += '<li><i class="fas fa-check"></i> Asesoría gratuita</li>';
        html += '<li><i class="fas fa-check"></i> Sin compromiso</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>'; // pd-col-aside

        html += '</div>'; // pd-body-inner
        html += '</section>'; // pd-body

        // Full-width bottom CTA
        html += '<section class="pd-bottom-cta">';
        html += '<div class="container">';
        html += '<h2>¿Listo para dar el siguiente paso?</h2>';
        html += '<p>Nuestro equipo te acompaña en todo el proceso, desde la primera visita hasta la firma.</p>';
        html += '<a href="' + waHref + '" class="btn-primary pd-bottom-cta-btn" target="_blank" rel="noopener">';
        html += '<i class="fab fa-whatsapp"></i> Hablar con un asesor ahora';
        html += '</a>';
        html += '</div>';
        html += '</section>';

        // Lightbox modal
        html += '<div class="pd-modal" id="pd-gallery-modal" role="dialog" aria-modal="true">';
        html += '<button class="pd-modal-close" id="pd-modal-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>';
        html += '<button class="pd-modal-nav pd-modal-prev" id="pd-modal-prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>';
        html += '<div class="pd-modal-img-wrap"><img id="pd-gallery-modal-img" src="" alt="" />';
        html += '<div class="pd-gallery-counter" id="pd-gallery-counter"></div></div>';
        html += '<button class="pd-modal-nav pd-modal-next" id="pd-modal-next" aria-label="Siguiente"><i class="fas fa-chevron-right"></i></button>';
        html += '</div>';

        document.getElementById('property-main').innerHTML = html;

        // Bind gallery events
        document.querySelectorAll('.pd-gallery-thumb').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openGallery(parseInt(this.getAttribute('data-index'), 10));
            });
        });
        var closeBtn = document.getElementById('pd-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeGallery);
        var prevBtn = document.getElementById('pd-modal-prev');
        if (prevBtn) prevBtn.addEventListener('click', prevPhoto);
        var nextBtn = document.getElementById('pd-modal-next');
        if (nextBtn) nextBtn.addEventListener('click', nextPhoto);
        var modal = document.getElementById('pd-gallery-modal');
        if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeGallery(); });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            var m = document.getElementById('pd-gallery-modal');
            if (!m || !m.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeGallery();
            if (e.key === 'ArrowLeft') prevPhoto();
            if (e.key === 'ArrowRight') nextPhoto();
        });
    }

    function renderNotFound() {
        document.getElementById('property-main').innerHTML =
            '<div class="pd-not-found container">' +
            '<i class="fas fa-home"></i>' +
            '<h2>Propiedad no encontrada</h2>' +
            '<p>La propiedad que buscas no existe o ya no está disponible.</p>' +
            '<a href="propiedades.html" class="btn-primary">Ver todas las propiedades</a>' +
            '</div>';
    }

    function renderLoading() {
        document.getElementById('property-main').innerHTML =
            '<div class="pd-loading container">' +
            '<div class="pd-loading-spinner"></div>' +
            '<p>Cargando propiedad…</p>' +
            '</div>';
    }

    // ── Init ──────────────────────────────────────────────────────

    function init() {
        var main = document.getElementById('property-main');
        if (!main) return;

        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        if (!id) { renderNotFound(); return; }

        renderLoading();

        var prop;
        supabaseGet('propiedades?id=eq.' + id + '&select=id,titulo,descripcion,precio,ciudad,direccion,tipo_id,tipos_propiedad(nombre),estatus,latitud,longitud&limit=1')
            .then(function (rows) {
                if (!rows.length) { renderNotFound(); return null; }
                prop = rows[0];
                return supabaseGet('propiedad_fotos?propiedad_id=eq.' + id + '&select=url,orden&order=orden.asc');
            })
            .then(function (fotos) {
                if (!fotos) return;
                render(prop, fotos);
            })
            .catch(function (err) {
                console.error('[Mogao]', err);
                document.getElementById('property-main').innerHTML =
                    '<div class="pd-not-found container"><i class="fas fa-exclamation-circle"></i>' +
                    '<h2>Error al cargar la propiedad</h2><p>Intenta de nuevo más tarde.</p>' +
                    '<a href="propiedades.html" class="btn-primary">Ver todas las propiedades</a></div>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
