(function () {
    var SUPABASE_URL = 'https://jrlzrrgfseykqkfpqvfd.supabase.co';
    var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybHpycmdmc2V5a3FrZnBxdmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjY3ODksImV4cCI6MjA5OTMwMjc4OX0.ruGVP8C6ura9scteHXDO7A3Bx-gA85XJ8gdtVU8GT1k';
    var WA_NUMBER = '525537865554';
    var HEADERS = { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY };
    var PAGE_SIZE = 9;

    var allProperties = [];   // full dataset
    var photoMap = {};        // propiedad_id → first photo url
    var filtered = [];        // after filters
    var currentPage = 1;

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

    // ── Render ────────────────────────────────────────────────────

    function buildCard(prop) {
        var waText = encodeURIComponent('Me interesa la propiedad: ' + prop.titulo + (prop.ciudad ? ' en ' + prop.ciudad : ''));
        var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + waText;
        var detailHref = 'propiedad.html?id=' + prop.id;
        var location = [prop.direccion, prop.ciudad].filter(Boolean).join(', ') || 'Consultar ubicación';
        var imgHtml = photoMap[prop.id]
            ? '<img src="' + photoMap[prop.id] + '" alt="' + prop.titulo + '" loading="lazy">'
            : '<div class="property-no-image"><i class="fas fa-home"></i></div>';
        var tipoNombre = prop.tipos_propiedad && prop.tipos_propiedad.nombre ? prop.tipos_propiedad.nombre : null;
        var tipoHtml = tipoNombre ? '<span class="property-tag">' + tipoNombre + '</span>' : '';
        var statusLabels = { disponible: 'Disponible', vendida: 'Vendida', rentada: 'Rentada', en_proceso: 'En proceso' };
        var statusLabel = statusLabels[prop.estatus] || prop.estatus || 'Disponible';
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
                (tipoHtml ? '<div class="property-tags">' + tipoHtml + '</div>' : '') +
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
        return card + card + card + card + card + card;
    }

    function renderGrid() {
        var grid = document.getElementById('catalog-grid');
        var meta = document.getElementById('catalog-meta');
        if (!grid) return;

        var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        var start = (currentPage - 1) * PAGE_SIZE;
        var pageItems = filtered.slice(start, start + PAGE_SIZE);

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-home"></i><p>No se encontraron propiedades con esos criterios.</p></div>';
        } else {
            grid.innerHTML = pageItems.map(buildCard).join('');
        }

        if (meta) {
            meta.textContent = filtered.length === 0 ? '' :
                filtered.length + (filtered.length === 1 ? ' propiedad encontrada' : ' propiedades encontradas');
        }

        renderPagination(totalPages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderPagination(totalPages) {
        var pag = document.getElementById('catalog-pagination');
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
                renderGrid();
            });
        });
    }

    // ── Filters ───────────────────────────────────────────────────

    var STATUS_LABELS = { disponible: 'Disponible', vendida: 'Vendida', rentada: 'Rentada', en_proceso: 'En proceso' };

    function applyFilters() {
        var q = (document.getElementById('catalog-search').value || '').trim().toLowerCase();
        var tipo = document.getElementById('catalog-tipo').value;
        var ciudad = document.getElementById('catalog-ciudad').value;
        var estatus = document.getElementById('catalog-estatus').value;

        filtered = allProperties.filter(function (p) {
            var tipoNom = p.tipos_propiedad && p.tipos_propiedad.nombre ? p.tipos_propiedad.nombre : null;
            var matchQ = !q || [p.titulo, p.descripcion, p.ciudad, p.direccion, tipoNom]
                .filter(Boolean).some(function (f) { return f.toLowerCase().includes(q); });
            var matchTipo = !tipo || tipoNom === tipo;
            var matchCiudad = !ciudad || p.ciudad === ciudad;
            var matchEstatus = !estatus || p.estatus === estatus;
            return matchQ && matchTipo && matchCiudad && matchEstatus;
        });
        currentPage = 1;
        renderGrid();
    }

    function populateSelects() {
        var tipos = Array.from(new Set(allProperties.map(function (p) { return p.tipos_propiedad && p.tipos_propiedad.nombre ? p.tipos_propiedad.nombre : null; }).filter(Boolean))).sort();
        var ciudades = Array.from(new Set(allProperties.map(function (p) { return p.ciudad; }).filter(Boolean))).sort();
        var estatuses = Array.from(new Set(allProperties.map(function (p) { return p.estatus; }).filter(Boolean))).sort();

        var tipoSel = document.getElementById('catalog-tipo');
        tipos.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            tipoSel.appendChild(opt);
        });

        var ciudadSel = document.getElementById('catalog-ciudad');
        ciudades.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            ciudadSel.appendChild(opt);
        });

        var estatusSel = document.getElementById('catalog-estatus');
        estatuses.forEach(function (e) {
            var opt = document.createElement('option');
            opt.value = e; opt.textContent = STATUS_LABELS[e] || e;
            estatusSel.appendChild(opt);
        });
    }

    // ── Init ──────────────────────────────────────────────────────

    function init() {
        var grid = document.getElementById('catalog-grid');
        if (!grid) return;

        grid.innerHTML = buildSkeleton();

        supabaseGet('propiedades?select=id,titulo,descripcion,precio,ciudad,direccion,estatus,tipo_id,tipos_propiedad(nombre)&order=created_at.desc')
            .then(function (props) {
                allProperties = props;
                if (!props.length) {
                    grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-home"></i><p>Próximamente nuevas propiedades disponibles.</p></div>';
                    return null;
                }
                var ids = props.map(function (p) { return p.id; }).join(',');
                return supabaseGet('propiedad_fotos?propiedad_id=in.(' + ids + ')&select=propiedad_id,url,orden&order=orden.asc');
            })
            .then(function (fotos) {
                if (!fotos) return;
                fotos.forEach(function (f) {
                    if (!photoMap[f.propiedad_id]) photoMap[f.propiedad_id] = f.url;
                });
                filtered = allProperties.slice();
                populateSelects();

                document.getElementById('catalog-search').addEventListener('input', applyFilters);
                document.getElementById('catalog-tipo').addEventListener('change', applyFilters);
                document.getElementById('catalog-ciudad').addEventListener('change', applyFilters);
                document.getElementById('catalog-estatus').addEventListener('change', applyFilters);

                renderGrid();
            })
            .catch(function (err) {
                console.error('[Mogao] Error:', err);
                grid.innerHTML = '<p class="gallery-error">No se pudieron cargar las propiedades en este momento.</p>';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
