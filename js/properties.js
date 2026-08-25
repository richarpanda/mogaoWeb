(function () {
    var SUPABASE_URL = 'https://jrlzrrgfseykqkfpqvfd.supabase.co';
    var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybHpycmdmc2V5a3FrZnBxdmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjY3ODksImV4cCI6MjA5OTMwMjc4OX0.ruGVP8C6ura9scteHXDO7A3Bx-gA85XJ8gdtVU8GT1k';
    var WA_NUMBER = '525537865554';
    var HEADERS = { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY };
    var PAGE_SIZE = 9;

    var allProperties = [];
    var currentPage = 1;

    function supabaseGet(path) {
        return fetch(SUPABASE_URL + '/rest/v1/' + path, { headers: HEADERS }).then(function (res) {
            if (!res.ok) throw new Error('Supabase error ' + res.status);
            return res.json();
        });
    }

    function formatPrice(price) {
        if (!price) return 'Consulta disponibilidad';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency', currency: 'MXN', maximumFractionDigits: 0
        }).format(price);
    }

    var STATUS_LABELS = { disponible: 'Disponible', vendida: 'Vendida', rentada: 'Rentada', en_proceso: 'En proceso' };

    function buildCard(prop) {
        var waText = encodeURIComponent('Me interesa la propiedad: ' + prop.titulo + (prop.ciudad ? ' en ' + prop.ciudad : ''));
        var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + waText;
        var detailHref = 'propiedad.html?id=' + prop.id;
        var location = [prop.direccion, prop.ciudad].filter(Boolean).join(', ') || 'Consultar ubicación';
        var imgHtml = prop.photoUrl
            ? '<img src="' + prop.photoUrl + '" alt="' + prop.titulo + '" loading="lazy">'
            : '<div class="property-no-image"><i class="fas fa-home"></i></div>';
        var statusLabel = STATUS_LABELS[prop.estatus] || prop.estatus || 'Disponible';
        var badgeClass = 'property-badge property-badge--' + (prop.estatus || 'disponible');

        return '<div class="property-card">' +
            '<a href="' + detailHref + '" class="property-card-link" aria-label="Ver ' + prop.titulo + '">' +
            '<div class="property-image">' +
                imgHtml +
                '<div class="' + badgeClass + '">' + statusLabel + '</div>' +
                '<div class="property-overlay">' +
                    '<span class="view-details-btn">Ver Detalles</span>' +
                '</div>' +
            '</div>' +
            '</a>' +
            '<div class="property-content">' +
                '<div class="property-price">' + formatPrice(prop.precio) + '</div>' +
                '<h3 class="property-title">' +
                    '<a href="' + detailHref + '">' + prop.titulo + '</a>' +
                '</h3>' +
                '<p class="property-location"><i class="fas fa-map-marker-alt"></i> ' + location + '</p>' +
                (prop.descripcion ? '<div class="property-description"><p>' + prop.descripcion + '</p></div>' : '') +
                '<div class="property-actions">' +
                    '<a href="' + detailHref + '" class="btn-secondary">Ver detalles</a>' +
                    '<a href="' + waHref + '" class="btn-primary" target="_blank" rel="noopener">' +
                        '<i class="fab fa-whatsapp"></i> Contactar' +
                    '</a>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function buildSkeleton() {
        var card = '<div class="property-card property-skeleton">' +
            '<div class="property-image skeleton-img"></div>' +
            '<div class="property-content">' +
                '<div class="skeleton-line short"></div>' +
                '<div class="skeleton-line"></div>' +
                '<div class="skeleton-line medium"></div>' +
            '</div>' +
        '</div>';
        return card + card + card;
    }

    function observeCards(grid) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('fade-in-up');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        grid.querySelectorAll('.property-card').forEach(function (el) { obs.observe(el); });
    }

    function renderPage() {
        var grid = document.getElementById('gallery-grid');
        var pag = document.getElementById('gallery-pagination');
        if (!grid) return;

        var totalPages = Math.max(1, Math.ceil(allProperties.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        var start = (currentPage - 1) * PAGE_SIZE;
        var pageItems = allProperties.slice(start, start + PAGE_SIZE);

        grid.innerHTML = pageItems.map(buildCard).join('');
        observeCards(grid);
        renderPagination(pag, totalPages);
    }

    function renderPagination(pag, totalPages) {
        if (!pag || totalPages <= 1) { if (pag) pag.innerHTML = ''; return; }

        var html = '';
        html += '<button class="pag-btn" ' + (currentPage === 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">' +
            '<i class="fas fa-chevron-left"></i></button>';

        for (var i = 1; i <= totalPages; i++) {
            html += '<button class="pag-btn' + (i === currentPage ? ' pag-active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }

        html += '<button class="pag-btn" ' + (currentPage === totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">' +
            '<i class="fas fa-chevron-right"></i></button>';

        pag.innerHTML = html;
        pag.querySelectorAll('.pag-btn:not([disabled])').forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentPage = parseInt(this.getAttribute('data-page'), 10);
                renderPage();
                document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function init() {
        var grid = document.getElementById('gallery-grid');
        if (!grid) return;

        grid.innerHTML = buildSkeleton();

        supabaseGet('propiedades?select=id,titulo,descripcion,precio,ciudad,direccion,estatus&order=created_at.desc')
            .then(function (props) {
                if (!props.length) {
                    grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-home"></i><p>Próximamente nuevas propiedades disponibles.</p></div>';
                    return null;
                }
                var ids = props.map(function (p) { return p.id; }).join(',');
                return supabaseGet('propiedad_fotos?propiedad_id=in.(' + ids + ')&select=propiedad_id,url,orden&order=orden.asc')
                    .then(function (fotos) {
                        var photoMap = {};
                        fotos.forEach(function (f) {
                            if (!photoMap[f.propiedad_id]) photoMap[f.propiedad_id] = f.url;
                        });
                        allProperties = props.map(function (p) {
                            return Object.assign({}, p, { photoUrl: photoMap[p.id] || null });
                        });
                        renderPage();
                    });
            })
            .catch(function (err) {
                console.error('[Mogao] Error cargando propiedades:', err);
                grid.innerHTML = '<p class="gallery-error">No se pudieron cargar las propiedades en este momento.</p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
