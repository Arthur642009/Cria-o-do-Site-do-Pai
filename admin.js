const rawSession = sessionStorage.getItem("morada-admin");
if (!rawSession) location.replace("login.html");
else {
  try {
    const admin = JSON.parse(rawSession);
    document.querySelector("#admin-name").textContent =
      admin.name || "Equipe Morada";
  } catch {
    sessionStorage.removeItem("morada-admin");
    location.replace("login.html");
  }
}
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
function renderDashboard() {
  const data = MoradaStore.read();
  document.querySelector("#stat-properties").textContent =
    data.properties.filter((property) => property.status === "Ativo").length;
  document.querySelector("#stat-contacts").textContent = data.contacts.length;
  document.querySelector("#stat-visits").textContent = data.visits.length;
  document.querySelector("#stat-views").textContent =
    data.totalViews.toLocaleString("pt-BR");
  document
    .querySelector("#stat-properties")
    .closest(".stat-card")
    .querySelector("small").textContent = "imóveis publicados";
  document
    .querySelector("#stat-contacts")
    .closest(".stat-card")
    .querySelector("small").textContent = "interesses recebidos";
  document
    .querySelector("#stat-visits")
    .closest(".stat-card")
    .querySelector("small").textContent = "visitas solicitadas";
  document
    .querySelector("#stat-views")
    .closest(".stat-card")
    .querySelector("small").textContent = "detalhes abertos na vitrine";
  const rows = document.querySelector("#admin-property-rows");
  rows.innerHTML = data.properties.length
    ? data.properties
        .map(
          (property) =>
            `<tr><td><div class="table-property"><img src="${esc(
              property.image
            )}" alt=""><span>${esc(property.title)}<small>${esc(
              property.type
            )} · ${esc(property.area)}</small></span></div></td><td>${esc(
              property.place
            )}</td><td>${money(property.price)}</td><td><span class="status ${
              property.status !== "Ativo" ? "paused" : ""
            }">${esc(
              property.status
            )}</span></td><td><button class="delete-property" type="button" data-delete="${esc(
              property.id
            )}" aria-label="Excluir ${esc(
              property.title
            )}" title="Excluir imóvel">Excluir</button></td></tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="empty-admin">Nenhum imóvel cadastrado. Use “Adicionar imóvel” para publicar o primeiro.</td></tr>`;
  rows.querySelectorAll("[data-delete]").forEach((button) =>
    button.addEventListener("click", () => {
      const item = data.properties.find(
        (property) => property.id === button.dataset.delete
      );
      if (
        item &&
        confirm(`Excluir “${item.title}”? Ele também sairá da página inicial.`)
      )
        MoradaStore.deleteProperty(item.id);
    })
  );
  const leads = document.querySelector(".leads-card");
  leads.innerHTML = `<div class="admin-section-heading"><div><h2>Últimos contatos</h2><p>Pessoas interessadas nos seus imóveis.</p></div><span class="contact-count">${
    data.contacts.length
  } contato(s)</span></div>${
    data.contacts.length
      ? data.contacts
          .slice(0, 5)
          .map(
            (contact) =>
              `<div class="lead"><span class="lead-avatar peach">${esc(
                contact.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()
              )}</span><span><b>${esc(contact.name)}</b><small>${esc(
                contact.propertyTitle
              )} · ${esc(contact.email)} · ${esc(
                contact.phone
              )}</small></span><time>${
                contact.visitAt ? "Visita solicitada" : "Interesse recebido"
              }</time></div>`
          )
          .join("")
      : `<p class="empty-admin">Os contatos enviados pela página inicial aparecerão aqui.</p>`
  }`;
}
function openPropertyForm() {
  const dialog = document.createElement("dialog");
  dialog.className = "admin-dialog";
  dialog.innerHTML = `<form id="new-property-form" method="dialog"><button class="dialog-close" type="button" aria-label="Fechar">×</button><span class="eyebrow">CATÁLOGO DA MORADA</span><h2>Adicionar imóvel</h2><p class="admin-form-intro">Preencha os dados para publicar este imóvel na página inicial.</p><div class="admin-form-grid"><label>Título do anúncio<input name="title" required maxlength="80" placeholder="Ex.: Apartamento com varanda"></label><label>Tipo<select name="type" required><option value="">Selecione</option><option>Apartamento</option><option>Casa</option><option>Cobertura</option><option>Terreno</option><option>Comercial</option></select></label><label class="wide-field">Cidade e bairro<input name="place" required placeholder="Pinheiros, São Paulo"></label><label>Preço (R$)<input name="price" type="number" min="1" step="1000" required placeholder="850000"></label><label>Área (m²)<input name="area" type="number" min="1" required placeholder="120"></label><label>Quartos<input name="beds" type="number" min="0" required value="2"></label><label>Banheiros<input name="baths" type="number" min="0" required value="1"></label><label class="wide-field">Foto principal (URL)<input name="image" type="url" placeholder="https://..." required></label><label class="wide-field">Outras fotos (uma URL por linha)<textarea name="photos" rows="3" placeholder="https://...\nhttps://..."></textarea></label><label class="wide-field">Descrição<textarea name="description" rows="3" placeholder="Conte o que torna este imóvel especial"></textarea></label></div><div class="admin-form-actions"><button type="button" class="secondary-button" data-close>Cancelar</button><button class="primary-button" type="submit">Publicar imóvel <span>↗</span></button></div><p class="form-feedback" aria-live="polite"></p></form>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog
    .querySelectorAll("[data-close], .dialog-close")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close())
    );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    MoradaStore.addProperty({
      title: values.title.trim(),
      type: values.type,
      place: values.place.trim(),
      price: Number(values.price),
      area: `${values.area} m²`,
      beds: Number(values.beds),
      baths: Number(values.baths),
      badge: "À venda",
      image: values.image.trim(),
      photos: [values.image.trim(), ...values.photos.split(/\r?\n/).map(url => url.trim()).filter(Boolean)],
      description: values.description.trim(),
    });
    dialog.close();
  });
}
document.querySelector("#logout").addEventListener("click", (event) => {
  event.preventDefault();
  sessionStorage.removeItem("morada-admin");
  location.href = "login.html";
});
document
  .querySelector("#add-property")
  .addEventListener("click", openPropertyForm);
window.addEventListener("morada-data-changed", renderDashboard);
window.addEventListener("storage", (event) => {
  if (event.key === "morada-data-v1") renderDashboard();
});
renderDashboard();
