// Datos de provincias y municipios de España
// Galicia: lista completa de municipios
// Resto de España: capitales y municipios principales.

export interface Provincia {
  nombre: string;
  municipios: string[];
}

export const provincias: Provincia[] = [
  {
    nombre: "A Coruña",
    municipios: [
      "A Baña", "A Capela", "A Coruña", "A Laracha", "A Pobra do Caramiñal",
      "Abegondo", "Ames", "Aranga", "Ares", "Arteixo", "Arzúa",
      "As Pontes de García Rodríguez", "As Somozas",
      "Bergondo", "Betanzos", "Boimorto", "Boiro", "Boqueixón", "Brión",
      "Cabana de Bergantiños", "Cabanas", "Camariñas", "Cambre",
      "Carballo", "Cariño", "Carnota", "Carral", "Cedeira", "Cee",
      "Cerceda", "Cerdido", "Coirós", "Corcubión", "Coristanco",
      "Culleredo", "Curtis",
      "Dodro", "Dumbría",
      "Fene", "Ferrol", "Fisterra", "Frades",
      "Irixoa",
      "Laxe", "Lousame",
      "Malpica de Bergantiños", "Mañón", "Mazaricos", "Melide", "Mesía",
      "Miño", "Moeche", "Monfero", "Mugardos", "Muros", "Muxía",
      "Narón", "Neda", "Negreira", "Noia",
      "O Pino", "Oleiros", "Ordes", "Oroso", "Ortigueira", "Outes", "Oza-Cesuras",
      "Paderne", "Padrón", "Ponteceso", "Pontedeume", "Porto do Son",
      "Rianxo", "Ribeira", "Rois",
      "Sada", "San Sadurniño", "Santa Comba", "Santiago de Compostela",
      "Santiso", "Sobrado",
      "Teo", "Toques", "Tordoia", "Touro", "Trazo",
      "Val do Dubra", "Valdoviño", "Vedra", "Vilarmaior", "Vilasantar", "Vimianzo",
      "Zas",
    ],
  },
  {
    nombre: "Álava",
    municipios: [
      "Alegría-Dulantzi", "Amurrio", "Arrasate", "Asparrena",
      "Ayala", "Iruña de Oca", "Laudio", "Llodio",
      "Oyón-Oion", "Salvatierra", "Vitoria-Gasteiz",
    ],
  },
  {
    nombre: "Albacete",
    municipios: [
      "Albacete", "Almansa", "Caudete", "Hellín",
      "La Roda", "Tobarra", "Villarrobledo",
    ],
  },
  {
    nombre: "Alicante",
    municipios: [
      "Alcoy", "Alicante", "Benidorm", "Calpe", "Crevillent",
      "Denia", "El Campello", "Elche", "Elda", "Guardamar del Segura",
      "Ibi", "Novelda", "Orihuela", "Petrer", "Rojales",
      "San Vicente del Raspeig", "Santa Pola", "Torrevieja", "Villena",
    ],
  },
  {
    nombre: "Almería",
    municipios: [
      "Adra", "Almería", "Berja", "El Ejido", "Huércal de Almería",
      "Huércal-Overa", "Níjar", "Roquetas de Mar", "Vícar",
    ],
  },
  {
    nombre: "Asturias",
    municipios: [
      "Avilés", "Castrillón", "Corvera de Asturias", "Gijón",
      "Gozón", "Langreo", "Llanera", "Mieres",
      "Navia", "Oviedo", "San Martín del Rey Aurelio", "Siero",
      "Tineo", "Valdés",
    ],
  },
  {
    nombre: "Ávila",
    municipios: [
      "Arenas de San Pedro", "Arévalo", "Ávila",
      "El Barco de Ávila", "Sotillo de la Adrada",
    ],
  },
  {
    nombre: "Badajoz",
    municipios: [
      "Almendralejo", "Azuaga", "Badajoz", "Don Benito",
      "Mérida", "Montijo", "Olivenza", "Villafranca de los Barros",
      "Villanueva de la Serena", "Zafra",
    ],
  },
  {
    nombre: "Barcelona",
    municipios: [
      "Badalona", "Barcelona", "Castelldefels", "Cornellà de Llobregat",
      "El Prat de Llobregat", "Esplugues de Llobregat", "Gavà",
      "Granollers", "L'Hospitalet de Llobregat", "Manresa",
      "Mataró", "Mollet del Vallès", "Montcada i Reixac",
      "Premià de Mar", "Rubí", "Sabadell", "Sant Adrià de Besòs",
      "Sant Boi de Llobregat", "Sant Cugat del Vallès",
      "Santa Coloma de Gramenet", "Terrassa", "Vic", "Viladecans",
    ],
  },
  {
    nombre: "Burgos",
    municipios: [
      "Aranda de Duero", "Burgos", "Medina de Pomar",
      "Miranda de Ebro",
    ],
  },
  {
    nombre: "Cáceres",
    municipios: [
      "Cáceres", "Miajadas", "Navalmoral de la Mata",
      "Plasencia", "Trujillo",
    ],
  },
  {
    nombre: "Cádiz",
    municipios: [
      "Algeciras", "Arcos de la Frontera", "Cádiz", "Chiclana de la Frontera",
      "El Puerto de Santa María", "Jerez de la Frontera", "La Línea de la Concepción",
      "Medina Sidonia", "Puerto Real", "Rota", "San Fernando", "Sanlúcar de Barrameda",
    ],
  },
  {
    nombre: "Cantabria",
    municipios: [
      "Camargo", "Castro-Urdiales", "El Astillero",
      "Santander", "Torrelavega",
    ],
  },
  {
    nombre: "Castellón",
    municipios: [
      "Benicàssim", "Borriana", "Castellón de la Plana",
      "Nules", "Onda", "Vinaròs", "Vila-real",
    ],
  },
  {
    nombre: "Ceuta",
    municipios: ["Ceuta"],
  },
  {
    nombre: "Ciudad Real",
    municipios: [
      "Alcázar de San Juan", "Almadén", "Ciudad Real", "Daimiel",
      "Manzanares", "Miguelturra", "Puertollano", "Tomelloso", "Valdepeñas",
    ],
  },
  {
    nombre: "Córdoba",
    municipios: [
      "Baena", "Cabra", "Córdoba", "La Carlota",
      "Lucena", "Montilla", "Peñarroya-Pueblonuevo",
      "Pozoblanco", "Priego de Córdoba",
    ],
  },
  {
    nombre: "Cuenca",
    municipios: [
      "Cuenca", "San Clemente", "Tarancón",
    ],
  },
  {
    nombre: "Girona",
    municipios: [
      "Blanes", "Figueres", "Girona", "Lloret de Mar",
      "Olot", "Palafrugell", "Salt",
    ],
  },
  {
    nombre: "Granada",
    municipios: [
      "Almuñécar", "Armilla", "Atarfe", "Baza",
      "Granada", "Guadix", "Loja", "Maracena", "Motril",
      "Santa Fe",
    ],
  },
  {
    nombre: "Guadalajara",
    municipios: [
      "Azuqueca de Henares", "Guadalajara", "Molina de Aragón",
    ],
  },
  {
    nombre: "Guipúzcoa",
    municipios: [
      "Arrasate", "Bergara", "Donostia-San Sebastián", "Eibar",
      "Errenteria", "Hernani", "Irun", "Mondragón",
      "Oñati", "Tolosa", "Zarautz",
    ],
  },
  {
    nombre: "Huelva",
    municipios: [
      "Almonte", "Ayamonte", "Huelva", "Isla Cristina",
      "Lepe", "Moguer", "Nerva", "Palos de la Frontera",
    ],
  },
  {
    nombre: "Huesca",
    municipios: [
      "Barbastro", "Binéfar", "Fraga", "Huesca",
      "Jaca", "Monzón", "Sabiñánigo",
    ],
  },
  {
    nombre: "Illes Balears",
    municipios: [
      "Calvià", "Ciutadella de Menorca", "Eivissa", "Felanitx",
      "Ibiza", "Llucmajor", "Mahón", "Manacor",
      "Marratxí", "Palma", "Pollença",
    ],
  },
  {
    nombre: "Jaén",
    municipios: [
      "Alcalá la Real", "Andújar", "Baeza", "Bailén",
      "Jaén", "Linares", "Martos", "Úbeda",
    ],
  },
  {
    nombre: "La Rioja",
    municipios: [
      "Arnedo", "Calahorra", "Haro", "Logroño", "Nájera",
    ],
  },
  {
    nombre: "Las Palmas",
    municipios: [
      "Arucas", "Gáldar", "Ingenio", "Las Palmas de Gran Canaria",
      "San Bartolomé de Tirajana", "Santa Lucía de Tirajana",
      "Telde", "Vecindario",
    ],
  },
  {
    nombre: "León",
    municipios: [
      "Astorga", "León", "Ponferrada",
      "San Andrés del Rabanedo", "Valencia de Don Juan", "Villablino",
    ],
  },
  {
    nombre: "Lleida",
    municipios: [
      "Balaguer", "Cervera", "Lleida",
      "Mollerussa", "Tàrrega",
    ],
  },
  {
    nombre: "Lugo",
    municipios: [
      "A Fonsagrada", "A Pastoriza", "A Pobra do Brollón", "A Pontenova",
      "Abadín", "Alfoz", "Antas de Ulla",
      "As Nogais",
      "Baleira", "Baralla", "Barreiros", "Becerreá", "Begonte", "Bóveda", "Burela",
      "Carballedo", "Castro de Rei", "Castroverde", "Cervantes", "Cervo", "Chantada",
      "Cospeito",
      "Folgoso do Courel",
      "Guitiriz", "Guntín",
      "Láncara", "Lourenzá", "Lugo",
      "Meira", "Mondoñedo", "Monforte de Lemos", "Monterroso", "Muras",
      "Navia de Suarna", "Negueira de Muñiz",
      "O Corgo", "O Incio", "O Páramo", "O Saviñao", "O Valadouro", "O Vicedo",
      "Ourol", "Outeiro de Rei",
      "Palas de Rei", "Pantón", "Paradela", "Pedrafita do Cebreiro", "Pol", "Portomarín",
      "Quiroga",
      "Ribadeo", "Ribas de Sil", "Ribeira de Piquín", "Riotorto",
      "Samos", "Sarria", "Sober",
      "Taboada", "Trabada", "Triacastela",
      "Vilalba", "Viveiro",
      "Xermade", "Xove",
    ],
  },
  {
    nombre: "Madrid",
    municipios: [
      "Alcalá de Henares", "Alcobendas", "Alcorcón", "Algete",
      "Aranjuez", "Arganda del Rey", "Boadilla del Monte",
      "Brunete", "Ciempozuelos", "Collado Villalba", "Colmenar Viejo",
      "Coslada", "El Álamo", "Fuenlabrada", "Galapagar",
      "Getafe", "Las Rozas de Madrid", "Leganés", "Loeches",
      "Madrid", "Majadahonda", "Mejorada del Campo", "Móstoles",
      "Navalcarnero", "Parla", "Paracuellos de Jarama",
      "Pinto", "Pozuelo de Alarcón", "Rivas-Vaciamadrid",
      "Rozas de Madrid (Las)", "San Fernando de Henares",
      "San Sebastián de los Reyes", "Torrejón de Ardoz",
      "Torrelodones", "Tres Cantos", "Valdemoro",
    ],
  },
  {
    nombre: "Málaga",
    municipios: [
      "Alhaurín de la Torre", "Alhaurín el Grande",
      "Antequera", "Benalmádena", "Estepona",
      "Fuengirola", "Málaga", "Marbella", "Mijas",
      "Nerja", "Ronda", "Torremolinos", "Vélez-Málaga",
    ],
  },
  {
    nombre: "Melilla",
    municipios: ["Melilla"],
  },
  {
    nombre: "Murcia",
    municipios: [
      "Águilas", "Alcantarilla", "Cartagena", "Cieza",
      "Lorca", "Mazarrón", "Molina de Segura", "Murcia",
      "San Javier", "Santomera", "Torre-Pacheco",
    ],
  },
  {
    nombre: "Navarra",
    municipios: [
      "Barañáin", "Burlada", "Estella-Lizarra", "Pamplona",
      "Tudela", "Villava",
    ],
  },
  {
    nombre: "Ourense",
    municipios: [
      "A Arnoia", "A Bola", "A Gudiña", "A Merca", "A Mezquita",
      "A Peroxa", "A Pobra de Trives", "A Rúa", "A Teixeira", "A Veiga",
      "Allariz", "Amoeiro", "Avión",
      "Baltar", "Bande", "Baños de Molgas", "Barbadás", "Beade", "Beariz",
      "Boborás",
      "Calvos de Randín", "Carballeda de Avia", "Carballeda de Valdeorras",
      "Cartelle", "Castrelo de Miño", "Castrelo do Val", "Castro Caldelas",
      "Celanova", "Cenlle", "Chandrexa de Queixa", "Coles", "Cortegada", "Cualedro",
      "Entrimo", "Esgos",
      "Gomesende",
      "Larouco", "Laza", "Leiro", "Lobeira", "Lobios",
      "Maceda", "Manzaneda", "Maside", "Melón", "Montederramo", "Monterrei", "Muíños",
      "Nogueira de Ramuín",
      "O Carballiño", "O Irixo", "O Pereiro de Aguiar",
      "Oímbra", "Os Blancos", "Ourense",
      "Paderne de Allariz", "Padrenda", "Parada de Sil", "Petín", "Piñor", "Pontedeva",
      "Porqueira", "Punxín",
      "Quintela de Leirado",
      "Rairiz de Veiga", "Ramirás", "Ribadavia", "Riós", "Rubiá",
      "San Amaro", "San Cibrao das Viñas", "San Cristovo de Cea", "San Xoán de Río",
      "Sandiás", "Sarreaus",
      "Taboadela", "Toén", "Trasmiras",
      "Verea", "Verín", "Viana do Bolo", "Vilamarín", "Vilamartín de Valdeorras",
      "Vilar de Barrio", "Vilar de Santos", "Vilardevós", "Vilariño de Conso",
      "Xinzo de Limia", "Xunqueira de Ambía", "Xunqueira de Espadanedo",
    ],
  },
  {
    nombre: "Palencia",
    municipios: [
      "Aguilar de Campoo", "Guardo", "Palencia",
      "Venta de Baños",
    ],
  },
  {
    nombre: "Pontevedra",
    municipios: [
      "A Cañiza", "A Estrada", "A Guarda", "A Illa de Arousa", "A Lama",
      "Agolada", "Arbo",
      "As Neves",
      "Baiona", "Barro", "Bueu",
      "Caldas de Reis", "Cambados", "Campo Lameiro", "Cangas", "Catoira",
      "Cerdedo-Cotobade", "Covelo", "Crecente", "Cuntis",
      "Dozón",
      "Forcarei", "Fornelos de Montes",
      "Gondomar",
      "Lalín",
      "Marín", "Meaño", "Meis", "Moaña", "Mondariz", "Mondariz-Balneario", "Moraña", "Mos",
      "Nigrán",
      "O Grove", "O Porriño", "O Rosal", "Oia",
      "Pazos de Borbén", "Poio", "Ponte Caldelas", "Ponteareas", "Pontevedra", "Portas",
      "Redondela", "Ribadumia", "Rodeiro",
      "Salceda de Caselas", "Salvaterra de Miño", "Sanxenxo", "Silleda", "Soutomaior",
      "Tomiño", "Tui",
      "Valga", "Vigo", "Vila de Cruces", "Vilaboa", "Vilagarcía de Arousa", "Vilanova de Arousa",
    ],
  },
  {
    nombre: "Salamanca",
    municipios: [
      "Béjar", "Ciudad Rodrigo", "Salamanca",
    ],
  },
  {
    nombre: "Santa Cruz de Tenerife",
    municipios: [
      "Adeje", "Arona", "Candelaria", "El Rosario", "Garachico",
      "Granadilla de Abona", "Güímar", "La Laguna", "La Orotava",
      "Los Realejos", "Los Llanos de Aridane", "Puerto de la Cruz",
      "San Cristóbal de La Laguna", "Santa Cruz de Tenerife",
    ],
  },
  {
    nombre: "Segovia",
    municipios: [
      "Cuéllar", "El Espinar", "Segovia",
    ],
  },
  {
    nombre: "Sevilla",
    municipios: [
      "Alcalá de Guadaíra", "Alcalá del Río", "Bormujos",
      "Camas", "Carmona", "Dos Hermanas",
      "Écija", "La Rinconada", "Lebrija",
      "Los Palacios y Villafranca", "Mairena del Aljarafe", "Marchena",
      "Morón de la Frontera", "Osuna", "San Juan de Aznalfarache",
      "Sevilla", "Tomares", "Utrera",
    ],
  },
  {
    nombre: "Soria",
    municipios: [
      "El Burgo de Osma", "Soria",
    ],
  },
  {
    nombre: "Tarragona",
    municipios: [
      "Cambrils", "El Vendrell", "Reus", "Salou",
      "Tarragona", "Torredembarra", "Tortosa",
    ],
  },
  {
    nombre: "Teruel",
    municipios: [
      "Alcañiz", "Andorra", "Teruel",
    ],
  },
  {
    nombre: "Toledo",
    municipios: [
      "Illescas", "Madridejos", "Seseña", "Talavera de la Reina",
      "Toledo", "Torrijos",
    ],
  },
  {
    nombre: "Valencia",
    municipios: [
      "Alzira", "Burjassot", "Gandia", "Manises",
      "Mislata", "Ontinyent", "Paterna", "Quart de Poblet",
      "Sagunto", "Torrent", "València", "Xirivella",
    ],
  },
  {
    nombre: "Valladolid",
    municipios: [
      "Arroyo de la Encomienda", "Laguna de Duero", "Medina del Campo",
      "Medina de Rioseco", "Tordesillas", "Valladolid",
    ],
  },
  {
    nombre: "Vizcaya",
    municipios: [
      "Barakaldo", "Basauri", "Bilbao", "Durango", "Erandio",
      "Galdakao", "Getxo", "Leioa", "Ortuella",
      "Portugalete", "Santurtzi", "Sestao", "Sopelana",
    ],
  },
  {
    nombre: "Zamora",
    municipios: [
      "Benavente", "Toro", "Zamora",
    ],
  },
  {
    nombre: "Zaragoza",
    municipios: [
      "Calatayud", "Cuarte de Huerva", "Ejea de los Caballeros",
      "Tarazona", "Utebo", "Zaragoza",
    ],
  },
];
