/* Shared browser data for the storefront and admin dashboard. */
(() => {
  const KEY = "morada-data-v1";
  const seed = {
    properties: [
      {
        id: "morada-1",
        title: "Apartamento com luz e calma",
        type: "Apartamento",
        place: "Vila Madalena, São Paulo",
        price: 1250000,
        area: "112 m²",
        beds: 3,
        baths: 2,
        badge: "À venda",
        image:
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
        ],
        description:
          "Apartamento claro e arejado, com ambientes integrados, cozinha planejada, varanda e acabamentos acolhedores. Localizado em uma rua tranquila, perto de cafés, parques e serviços.",
        status: "Ativo",
        views: 0,
      },
      {
        id: "morada-2",
        title: "Casa para viver sem pressa",
        type: "Casa",
        place: "Jardim Europa, São Paulo",
        price: 2850000,
        area: "240 m²",
        beds: 4,
        baths: 3,
        badge: "Exclusividade",
        image:
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
        ],
        description:
          "Casa espaçosa com jardim, luz natural e espaço para toda a família. São quatro dormitórios, sala ampla e uma área externa ideal para aproveitar os dias ao ar livre.",
        status: "Ativo",
        views: 0,
      },
      {
        id: "morada-3",
        title: "Cobertura com vista aberta",
        type: "Cobertura",
        place: "Pinheiros, São Paulo",
        price: 1980000,
        area: "165 m²",
        beds: 3,
        baths: 3,
        badge: "Novo",
        image:
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
        photos: [
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
        ],
        description:
          "Cobertura contemporânea com espaços generosos, área externa privativa e uma vista aberta da cidade. Uma combinação de conforto e praticidade em Pinheiros.",
        status: "Ativo",
        views: 0,
      },
    ],
    contacts: [],
    visits: [],
    totalViews: 0,
  };
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (
        saved &&
        Array.isArray(saved.properties) &&
        Array.isArray(saved.contacts) &&
        Array.isArray(saved.visits)
      ) {
        if (!Number.isFinite(saved.totalViews))
          saved.totalViews = saved.properties.reduce(
            (sum, property) => sum + (Number(property.views) || 0),
            0
          );
        return saved;
      }
    } catch (error) {
      console.warn("Não foi possível ler os dados salvos da Morada.", error);
    }
    localStorage.setItem(KEY, JSON.stringify(seed));
    return structuredClone(seed);
  }
  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("morada-data-changed"));
  }
  window.MoradaStore = {
    read,
    addProperty(property) {
      const data = read();
      data.properties.unshift({
        ...property,
        id: crypto.randomUUID ? crypto.randomUUID() : `imovel-${Date.now()}`,
        status: "Ativo",
        views: 0,
      });
      write(data);
    },
    deleteProperty(id) {
      const data = read();
      data.properties = data.properties.filter((p) => p.id !== id);
      write(data);
    },
    viewProperty(id) {
      const data = read();
      const p = data.properties.find((item) => item.id === id);
      if (p) {
        p.views = (p.views || 0) + 1;
        data.totalViews = (data.totalViews || 0) + 1;
        write(data);
      }
    },
    addContact(contact) {
      const data = read();
      data.contacts.unshift({
        ...contact,
        id: `contato-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      if (contact.visitAt)
        data.visits.unshift({
          ...contact,
          id: `visita-${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      write(data);
    },
  };
  read();
})();
