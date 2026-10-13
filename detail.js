const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        character
      ])
  );
const formatPrice = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
const propertyId = new URLSearchParams(location.search).get("id");
const property = MoradaStore.read().properties.find(
  (item) => item.id === propertyId && item.status === "Ativo"
);
if (!property) location.replace("index.html#imoveis");
else {
  MoradaStore.viewProperty(property.id);
  const imagePresets = {
    "morada-1": [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    ],
    "morada-2": [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    ],
    "morada-3": [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
    ],
  };
  const photos =
    property.photos?.length > 1
      ? property.photos
      : imagePresets[property.id] || [property.image];
  document.title = `${property.title} — Terra & Imóveis`;
  document.querySelector("#crumb-title").textContent = property.title;
  document.querySelector("#property-kind").textContent = `${property.type} · ${
    property.badge || "À venda"
  }`;
  document.querySelector("#property-title").textContent = property.title;
  document.querySelector(
    "#property-place"
  ).textContent = `⌖  ${property.place}`;
  document.querySelector("#property-price").textContent = formatPrice(
    property.price
  );
  document.querySelector("#property-description").textContent =
    property.description ||
    `Conheça este imóvel ${property.type.toLocaleLowerCase("pt-BR")} em ${
      property.place
    }. Entre em contato para receber mais informações e agendar uma visita.`;
  document.querySelector("#location-text").textContent = property.place;
  document.querySelector("#map-label").textContent = property.place;
  document.querySelector(
    "#property-highlights"
  ).innerHTML = `<span><b>${escapeHTML(
    property.area
  )}</b> área</span><span><b>${escapeHTML(
    property.beds
  )}</b> quartos</span><span><b>${escapeHTML(
    property.baths
  )}</b> banheiros</span>`;
  document.querySelector("#property-features").innerHTML = [
    `${escapeHTML(property.type)}`,
    `${escapeHTML(property.area)} de área`,
    `${escapeHTML(property.beds)} dormitórios`,
    `${escapeHTML(property.baths)} banheiros`,
  ]
    .map((feature) => `<div class="detail-feature">${feature}</div>`)
    .join("");
  let activePhoto = 0;
  const mainPhoto = document.querySelector("#main-photo"),
    thumbs = document.querySelector("#gallery-thumbs");
  function selectPhoto(index) {
    activePhoto = (index + photos.length) % photos.length;
    mainPhoto.src = photos[activePhoto];
    mainPhoto.alt = `${property.title}, foto ${activePhoto + 1}`;
    document.querySelector("#gallery-counter").textContent = `${
      activePhoto + 1
    } / ${photos.length} fotos`;
    thumbs
      .querySelectorAll(".gallery-thumb")
      .forEach((thumb, position) =>
        thumb.classList.toggle("active", position === activePhoto)
      );
  }
  thumbs.innerHTML = photos
    .map(
      (photo, index) =>
        `<button type="button" class="gallery-thumb${
          index === 0 ? " active" : ""
        }" data-photo="${index}" aria-label="Ver foto ${
          index + 1
        }"><img src="${escapeHTML(photo)}" alt="" loading="lazy"></button>`
    )
    .join("");
  thumbs
    .querySelectorAll("[data-photo]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        selectPhoto(Number(button.dataset.photo))
      )
    );
  document
    .querySelector("#gallery-next")
    .addEventListener("click", () => selectPhoto(activePhoto + 1));
  document
    .querySelector("#gallery-prev")
    .addEventListener("click", () => selectPhoto(activePhoto - 1));
  selectPhoto(0);
  document
    .querySelector("#interest-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const requestVisit = Boolean(form.get("requestVisit"));
      MoradaStore.addContact({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        propertyId: property.id,
        propertyTitle: property.title,
        visitAt: requestVisit ? new Date().toISOString() : "",
      });
      document.querySelector("#form-feedback").textContent = requestVisit
        ? "Obrigado! Recebemos seu interesse e pedido de visita. Nossa equipe falará com você."
        : "Obrigado! Recebemos seu interesse. Nossa equipe falará com você.";
      event.currentTarget.reset();
    });
}
