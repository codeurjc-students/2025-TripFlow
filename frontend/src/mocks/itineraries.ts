import type { ExtendedItinerary, Itinerary } from "@/types/itinerary";
import type { PageResponse } from "@/types/shared";

const defaultCoverImage: ExtendedItinerary["coverImage"] = {
  imageUrl: "https://images.unsplash.com/photo-1611416457332-946853cc75d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxuaWdodCUyMGNpdHl8ZW58MHx8fHwxNzY1MTA3ODUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  altDescription: "city skyline during night time",
  authorUsername: "chentianlu",
}

let itineraries: ExtendedItinerary[] = [
  {
    id: 1,
    title: "Primavera en Tokio",
    place: "Tokio, Japón",
    people: 2,
    budget: 3500,
    date: "2025-04-10",
    status: "COMPLETED",
    countDays: 3,
    tags: ["cerezos", "comida", "templos"],
    coverImage: {
      altDescription: "Tokyo Tower from the Mori building",
      imageUrl: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxUb2t5b3xlbnwwfHx8fDE3NjUwNDMxNjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      authorUsername: "thetalkinglens",
    },
    permissions: { view: true, edit: true, delete: true },
    days: [
      {
        day: 1,
        activities: [
          {
            activity: "Llegada y Check-in",
            details: "Regístrate en tu hotel en Shinjuku y descansa del viaje. Tómate un tiempo para desempacar y acomodarte.",
            location: {
              name: "Shinjuku Granbell Hotel",
              address: "2-14-5 Kabukicho, Shinjuku City, Tokyo",
              coordinates: { latitude: 35.6956, longitude: 139.703 },
            },
            time: "15:00",
            duration: "1h",
          },
          {
            activity: "Cruce de Shibuya",
            details: "Cruza el mundialmente famoso cruce de Shibuya. Visita la estatua de Hachiko y explora las tiendas de moda cercanas.",
            location: {
              name: "Shibuya Scramble Crossing",
              address: "Shibuya City, Tokyo",
              coordinates: { latitude: 35.6595, longitude: 139.7005 },
            },
            time: "17:00",
            duration: "2h",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            activity: "Templo Senso-ji",
            details: "Visita Senso-ji, el templo más antiguo de Tokio. Camina por la Puerta del Trueno y explora las tiendas tradicionales en la calle Nakamise.",
            location: {
              name: "Senso-ji",
              address: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
              coordinates: { latitude: 35.7148, longitude: 139.7967 },
            },
            time: "10:00",
            duration: "3h",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            activity: "Santuario Meiji",
            details: "Pasea por el tranquilo bosque hasta el Santuario Meiji Jingu. Admira la arquitectura tradicional y la atmósfera serena.",
            location: {
              name: "Meiji Jingu",
              address: "1-1 Yoyogikamizonocho, Shibuya City, Tokyo",
              coordinates: { latitude: 35.6764, longitude: 139.6993 },
            },
            time: "09:00",
            duration: "2h",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Arte y Cultura Parisina",
    place: "París, Francia",
    people: 2,
    budget: 2500,
    date: "2025-06-15",
    status: "ONGOING",
    countDays: 2,
    tags: ["museos", "romántico", "gastronomía"],
    coverImage: {
      altDescription: "Eiffel tower during daytime",
      imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxQYXJpc3xlbnwwfHx8fDE3NjUwNDMxMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      authorUsername: "anthonydelanoix",
    },
    permissions: { view: true, edit: true, delete: true },
    days: [
      {
        day: 1,
        activities: [
          {
            activity: "Torre Eiffel",
            details: "Sube a la Torre Eiffel para ver vistas panorámicas de París. Explora los diferentes niveles y admira la ciudad desde arriba.",
            location: {
              name: "Eiffel Tower",
              address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris",
              coordinates: { latitude: 48.8584, longitude: 2.2945 },
            },
            time: "10:00",
            duration: "3h",
          },
          {
            activity: "Crucero por el Sena",
            details: "Disfruta de un relajante crucero por el Sena. Ve monumentos iluminados como Notre-Dame y el Louvre al atardecer.",
            location: {
              name: "Bateaux Parisiens",
              address: "Port de la Bourdonnais, 75007 Paris",
              coordinates: { latitude: 48.8595, longitude: 2.293 },
            },
            time: "19:00",
            duration: "2h",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            activity: "Museo del Louvre",
            details: "Explora la vasta colección de arte del Louvre. Ve obras maestras como la Mona Lisa y la Venus de Milo.",
            location: {
              name: "Louvre Museum",
              address: "Rue de Rivoli, 75001 Paris",
              coordinates: { latitude: 48.8606, longitude: 2.3376 },
            },
            time: "09:00",
            duration: "4h",
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Rascacielos de NYC",
    place: "Nueva York, EEUU",
    people: 4,
    budget: 4000,
    date: "2025-09-01",
    status: "PLANNED",
    countDays: 2,
    tags: ["urbano", "compras", "broadway"],
    coverImage: {
      altDescription: "Empire State Building, New York at night",
      imageUrl: "https://images.unsplash.com/photo-1541336032412-2048a678540d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxOZXclMjBZb3JrfGVufDB8fHx8MTc2NTA0MzAzMnww&ixlib=rb-4.1.0&q=80&w=1080",
      authorUsername: "timovaknar",
    },
    permissions: { view: true, edit: true, delete: true },
    days: [
      {
        day: 1,
        activities: [
          {
            activity: "Central Park",
            details: "Camina por los senderos escénicos de Central Park. Disfruta de un café cerca de Bethesda Terrace y respira aire fresco.",
            location: {
              name: "Central Park",
              address: "New York, NY",
              coordinates: { latitude: 40.7851, longitude: -73.9683 },
            },
            time: "08:00",
            duration: "2h",
          },
          {
            activity: "El Met",
            details: "Visita el Met para ver arte de 5,000 años. No te pierdas el Templo de Dendur y las pinturas europeas.",
            location: {
              name: "The Met",
              address: "1000 5th Ave, New York, NY 10028",
              coordinates: { latitude: 40.7794, longitude: -73.9632 },
            },
            time: "11:00",
            duration: "3h",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            activity: "Times Square",
            details: "Experimenta las luces brillantes y la energía de Times Square. Ve los carteles icónicos y la multitud animada.",
            location: {
              name: "Times Square",
              address: "Manhattan, NY 10036",
              coordinates: { latitude: 40.758, longitude: -73.9855 },
            },
            time: "18:00",
            duration: "1h",
          },
          {
            activity: "Espectáculo de Broadway",
            details: "Mira un musical o una obra de clase mundial en Broadway. Disfruta de la narración en vivo en un teatro histórico.",
            location: {
              name: "Broadway Theatre",
              address: "1681 Broadway, New York, NY 10019",
              coordinates: { latitude: 40.7634, longitude: -73.9829 },
            },
            time: "19:30",
            duration: "3h",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Tour Histórico de Roma",
    place: "Roma, Italia",
    people: 2,
    budget: 2800,
    date: "2025-05-20",
    status: "PLANNED",
    countDays: 2,
    tags: ["historia", "comida", "arquitectura"],
    coverImage: {
      altDescription: "Colosseum arena photography",
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxSb21hfGVufDB8fHx8MTc2NTA0MzI5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      authorUsername: "davidkhlr",
    },
    permissions: { view: true, edit: true, delete: true },
    days: [
      {
        day: 1,
        activities: [
          {
            activity: "Coliseo",
            details: "Recorre el Coliseo, el antiguo anfiteatro más grande. Camina por la arena y aprende sobre la historia de los gladiadores.",
            location: {
              name: "Colosseum",
              address: "Piazza del Colosseo, 1, 00184 Roma RM",
              coordinates: { latitude: 41.8902, longitude: 12.4922 },
            },
            time: "09:00",
            duration: "3h",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            activity: "Museos Vaticanos",
            details: "Admira la vasta colección de los Museos Vaticanos. Ve el techo de la Capilla Sixtina y la Basílica de San Pedro.",
            location: {
              name: "Vatican Museums",
              address: "00120 Vatican City",
              coordinates: { latitude: 41.9067, longitude: 12.4547 },
            },
            time: "08:30",
            duration: "4h",
          },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Vibras Costeras de Lisboa",
    place: "Lisboa, Portugal",
    people: 3,
    budget: 1800,
    date: "2025-07-05",
    status: "PLANNED",
    countDays: 2,
    tags: ["playa", "vino", "fado"],
    coverImage: {
      altDescription: "yellow and white tram on road during daytime",
      imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MzA1NjJ8MHwxfHNlYXJjaHwxfHxMaXNib258ZW58MHx8fHwxNzY1MDQzMzU5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      authorUsername: "aayush_gupta",
    },
    permissions: { view: true, edit: true, delete: true },
    days: [
      {
        day: 1,
        activities: [
          {
            activity: "Torre de Belém",
            details: "Visita la Torre de Belém en el río Tajo. Admira la arquitectura manuelina de esta fortaleza histórica.",
            location: {
              name: "Belém Tower",
              address: "Av. Brasília, 1400-038 Lisboa",
              coordinates: { latitude: 38.6916, longitude: -9.216 },
            },
            time: "10:00",
            duration: "1h",
          },
          {
            activity: "Pastéis de Belém",
            details: "Prueba los famosos Pastéis de Nata en la Antiga Confeitaria de Belém. Disfruta estas tartas calientes con canela.",
            location: {
              name: "Pastéis de Belém",
              address: "R. de Belém 84 92, 1300-085 Lisboa",
              coordinates: { latitude: 38.6975, longitude: -9.2032 },
            },
            time: "11:30",
            duration: "1h",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            activity: "Barrio de Alfama",
            details: "Deambula por las calles estrechas de Alfama. Ve las casas coloridas y disfruta de las vistas desde el Castillo de San Jorge.",
            location: {
              name: "Alfama",
              address: "Alfama, Lisbon",
              coordinates: { latitude: 38.7115, longitude: -9.1305 },
            },
            time: "15:00",
            duration: "3h",
          },
        ],
      },
    ],
  },
];

export const mockItineraries = {
  "/api/v1/itineraries": async (
    method: string,
    body?: unknown
  ): Promise<PageResponse<Itinerary> | ExtendedItinerary> => {
    switch (method) {
      case "GET": {
        const response: PageResponse<Itinerary> = {
          page: itineraries.map(({ days, ...basic }) => basic),
          currentPage: 0,
          totalPages: 1,
          totalItems: itineraries.length,
          itemsPerPage: itineraries.length,
          isLastPage: true,
        };

        return response;
      }

      case "POST": {
        const bodyData = body as ExtendedItinerary;

        const newItinerary: ExtendedItinerary = {
          ...bodyData,
          coverImage: defaultCoverImage,
          id: itineraries.length + 1,
        };

        itineraries.push(newItinerary);
        return newItinerary;
      }

      default:
        throw new Error(`Method ${method} not allowed on /api/v1/itineraries`);
    }
  },

  "/api/v1/itineraries/:id": async (
    method: string,
    body?: unknown,
    url?: string
  ): Promise<ExtendedItinerary | void> => {
    const id = Number(url?.split("/").pop());
    const index = itineraries.findIndex((it) => it.id === id);
    if (index === -1) throw new Error(`Itinerary ${id} not found`);

    switch (method) {
      case "GET":
        return itineraries[index] || itineraries[1];

      case "PUT":
        itineraries[index] = { ...(body as ExtendedItinerary), id };
        return itineraries[index];

      case "DELETE":
        itineraries = itineraries.filter((it) => it.id !== id);
        return;

      default:
        throw new Error(`Method ${method} not allowed on /api/v1/itineraries/:id`);
    }
  },
};
