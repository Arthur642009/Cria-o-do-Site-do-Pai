let mode = "Comprar";
const grid = document.querySelector("#property-grid");
const money = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        char
      ])
  );
function currentProperties() {
  return MoradaStore.read().properties.filter(
    (property) => property.status === "Ativo"
  );
}
function render(items = currentProperties()) {
  grid.innerHTML = items.length
    ? items
        .map(
          (property) =>
            `<article class="property-card" data-property="${esc(
              property.id
            )}"><button class="property-open" type="button" aria-label="Ver detalhes de ${esc(
              property.title
            )}"><div class="property-photo"><img src="${esc(
              property.image
            )}" alt="${esc(
              property.title
            )}" loading="lazy"><span class="badge">${esc(
              property.badge || "À venda"
            )}</span></div><div class="property-info"><span class="property-kind">${esc(
              property.type
            )}</span><h3>${esc(
              property.title
            )}</h3><div class="property-location">⌖ &nbsp;${esc(
              property.place
            )}</div><div class="property-features"><span>⌂ &nbsp;${esc(
              property.area
            )}</span><span>▤ &nbsp;${esc(
              property.beds
            )} quartos</span><span>♧ &nbsp;${esc(
              property.baths
            )} banheiros</span></div><div class="property-price"><strong>${money(
              property.price
            )}</strong><span>${
              mode === "Alugar" ? "por mês" : "valor total"
            }</span></div></div></button><button class="favorite" type="button" aria-label="Favoritar imóvel">♡</button></article>`
        )
        .join("")
    : "<p class='empty-properties'>Nenhum imóvel encontrado com esses filtros. Tente outra busca.</p>";
  document.querySelector("#result-count").textContent = `${String(
    items.length
  ).padStart(2, "0")} imóveis selecionados para você`;
  grid
    .querySelectorAll(".property-open")
    .forEach((button) =>
      button.addEventListener("click", () =>
        openDetails(button.closest("[data-property]").dataset.property)
      )
    );
  grid.querySelectorAll(".favorite").forEach((button) =>
    button.addEventListener("click", () => {
      button.classList.toggle("is-favorite");
      button.textContent = button.classList.contains("is-favorite") ? "♥" : "♡";
    })
  );
}
function openDetails(id) {
  if (currentProperties().some((item) => item.id === id))
    location.href = `imovel.html?id=${encodeURIComponent(id)}`;
}
render();
document.querySelectorAll(".tab").forEach((button) =>
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    mode = button.dataset.mode;
    render();
  })
);
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const place = document
      .querySelector("#location")
      .value.trim()
      .toLocaleLowerCase("pt-BR"),
    type = document.querySelector("#type").value,
    max = Number(document.querySelector("#price").value);
  const found = currentProperties().filter(
    (property) =>
      (!place ||
        property.place.toLocaleLowerCase("pt-BR").includes(place) ||
        property.title.toLocaleLowerCase("pt-BR").includes(place)) &&
      (!type || property.type === type) &&
      (!max || property.price <= max)
  );
  render(found);
  document.querySelector("#imoveis").scrollIntoView({ behavior: "smooth" });
});
window.addEventListener("morada-data-changed", () => render());
window.addEventListener("storage", (event) => {
  if (event.key === "morada-data-v1") render();
});
