// Update the portafolio.html to make the "Ver Detalles" and "Contactar" buttons functional

// Add this to the existing portafolio.html script section:

// Function to handle "Ver Detalles" button clicks
function viewPropertyDetails(propertyId) {
  // In a real application, you would pass the property ID as a URL parameter
  // For now, we'll redirect to the detail page
  window.location.href = `detalle-propiedad.html?id=${propertyId}`
}

// Function to handle "Contactar" button clicks
function contactProperty(property) {
  // Open contact modal with pre-filled information
  openContactModal(property)
}

// Enhanced contact modal function
function openContactModal(property = null) {
  const modal = document.getElementById("contact-modal") || createContactModal()

  if (property) {
    // Pre-fill the message with property information
    const messageTextarea = modal.querySelector("#contact-message")
    if (messageTextarea) {
      messageTextarea.value = `Hola, me interesa la propiedad "${property.title}" ubicada en ${property.ubicacionTexto} con precio de ${formatPrice(property.precio, property.operacion)}. Me gustaría recibir más información.`
    }
  }

  modal.classList.add("show")
  document.body.style.overflow = "hidden"
}

// Create contact modal if it doesn't exist
function createContactModal() {
  const modalHTML = `
        <div id="contact-modal" class="modal">
            <div class="modal-content">
                <button class="modal-close" onclick="closeContactModal()">&times;</button>
                <h2 class="modal-title">Contactar sobre esta Propiedad</h2>
                <form class="contact-form" onsubmit="submitContactForm(event)">
                    <div class="form-group">
                        <label for="contact-name">Nombre Completo *</label>
                        <input type="text" id="contact-name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Correo Electrónico *</label>
                        <input type="email" id="contact-email" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-phone">Teléfono</label>
                        <input type="tel" id="contact-phone">
                    </div>
                    <div class="form-group">
                        <label for="contact-interest">Tipo de Interés</label>
                        <select id="contact-interest">
                            <option value="compra">Compra</option>
                            <option value="renta">Renta</option>
                            <option value="informacion">Más información</option>
                            <option value="visita">Agendar visita</option>
                            <option value="financiamiento">Opciones de financiamiento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="contact-message">Mensaje</label>
                        <textarea id="contact-message" placeholder="Escribe tu mensaje aquí..."></textarea>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%;">Enviar Mensaje</button>
                </form>
            </div>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", modalHTML)
  return document.getElementById("contact-modal")
}

function closeContactModal() {
  const modal = document.getElementById("contact-modal")
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }
}

function submitContactForm(event) {
  event.preventDefault()

  // Get form data
  const formData = {
    name: document.getElementById("contact-name").value,
    email: document.getElementById("contact-email").value,
    phone: document.getElementById("contact-phone").value,
    interest: document.getElementById("contact-interest").value,
    message: document.getElementById("contact-message").value,
  }

  // Simulate form submission
  console.log("Contact form submitted:", formData)
  alert("¡Gracias por tu interés! Nos pondremos en contacto contigo pronto.")

  closeContactModal()
  event.target.reset()
}

// Update the displayProperties function to include the new button functionality
function displayPropertiesUpdated() {
  const grid = document.getElementById("properties-grid")
  const loading = document.getElementById("loading")

  // Show loading
  loading.classList.add("show")
  grid.innerHTML = ""

  // Simulate loading delay
  setTimeout(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentProperties = filteredProperties.slice(startIndex, endIndex)

    grid.innerHTML = currentProperties
      .map(
        (property) => `
            <div class="property-card">
                <div class="property-image">
                    <img src="${property.imagen}" alt="${property.title}" loading="lazy">
                    <div class="property-badge">${property.badge}</div>
                    <div class="property-status status-${property.status}">
                        ${property.operacion === "venta" ? "En Venta" : "En Renta"}
                    </div>
                </div>
                <div class="property-content">
                    <div class="property-price">${formatPrice(property.precio, property.operacion)}</div>
                    <h3 class="property-title">${property.title}</h3>
                    <div class="property-location">📍 ${property.ubicacionTexto}</div>
                    <div class="property-features">
                        ${
                          property.tipo !== "terreno" && property.tipo !== "oficina" && property.tipo !== "local"
                            ? `
                            <div class="feature">
                                <div class="feature-value">${property.recamaras}</div>
                                <div>Recámaras</div>
                            </div>
                        `
                            : ""
                        }
                        ${
                          property.banos > 0
                            ? `
                            <div class="feature">
                                <div class="feature-value">${property.banos}</div>
                                <div>Baños</div>
                            </div>
                        `
                            : ""
                        }
                        ${
                          property.autos > 0
                            ? `
                            <div class="feature">
                                <div class="feature-value">${property.autos}</div>
                                <div>Autos</div>
                            </div>
                        `
                            : ""
                        }
                        <div class="feature">
                            <div class="feature-value">${property.m2}</div>
                            <div>m²</div>
                        </div>
                    </div>
                    <div class="property-actions">
                        <button class="btn-primary" onclick="viewPropertyDetails(${property.id})">Ver Detalles</button>
                        <button class="btn-secondary" onclick="contactProperty(${JSON.stringify(property).replace(/"/g, "&quot;")})">Contactar</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")

    // Hide loading
    loading.classList.remove("show")
  }, 500)
}

// Add modal styles to portafolio.html
const modalStyles = `
    <style>
        /* Contact Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }

        .modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: var(--white);
            padding: 2rem;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--text-light);
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .modal-close:hover {
            background: #f0f0f0;
            color: var(
