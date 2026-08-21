(function () {
    var SUPABASE_URL = 'https://jrlzrrgfseykqkfpqvfd.supabase.co';
    var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybHpycmdmc2V5a3FrZnBxdmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MjY3ODksImV4cCI6MjA5OTMwMjc4OX0.ruGVP8C6ura9scteHXDO7A3Bx-gA85XJ8gdtVU8GT1k';
    var WA_NUMBER = '525537865554';
    var HEADERS = { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY };

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

    function buildCard(prop) {
        var waText = encodeURIComponent('Me interesa la propiedad: ' + prop.titulo + (prop.ciudad ? ' en ' + prop.ciudad : ''));
        var waHref = 'https://wa.me/' + WA_NUMBER + '?text=' + waText;
        var detailHref = 'propiedad.html?id=' + prop.id;
        var location = [prop.direccion, prop.ciudad].filter(Boolean).join(', ') || 'Consultar ubicación';
        var imgHtml = prop.photoUrl
            ? '<img src="' + prop.photoUrl + '" alt="' + prop.titulo + '" loading="lazy">'
            : '<div class="property-no-image"><i class="fas fa-home"></i></div>';

        return '<div class="property-card">' +
            '<a href="' + detailHref + '" class="property-card-link" aria-label="Ver ' + prop.titulo + '">' +
            '<div class="property-image">' +
                imgHtml +
                '<div class="property-badge">Disponible</div>' +
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

    function init() {
        var grid = document.querySelector('.gallery-grid');
        if (!grid) return;

        grid.innerHTML = buildSkeleton();

        var propIds;
        supabaseGet('propiedades?estatus=eq.disponible&select=id,titulo,descripcion,precio,ciudad,direccion&order=created_at.desc')
            .then(function (props) {
                if (!props.length) {
                    grid.innerHTML = '<div class="gallery-empty"><i class="fas fa-home"></i><p>Próximamente nuevas propiedades disponibles.</p></div>';
                    return null;
                }
                propIds = props;
                var ids = props.map(function (p) { return p.id; }).join(',');
                return supabaseGet('propiedad_fotos?propiedad_id=in.(' + ids + ')&select=propiedad_id,url,orden&order=orden.asc')
                    .then(function (fotos) {
                        var photoMap = {};
                        fotos.forEach(function (f) {
                            if (!photoMap[f.propiedad_id]) photoMap[f.propiedad_id] = f.url;
                        });
                        return props.map(function (p) {
                            return Object.assign({}, p, { photoUrl: photoMap[p.id] || null });
                        });
                    });
            })
            .then(function (properties) {
                if (!properties) return;
                grid.innerHTML = properties.map(buildCard).join('');
                observeCards(grid);
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
