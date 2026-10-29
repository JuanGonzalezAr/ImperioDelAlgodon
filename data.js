/* ==========================================================
   DATOS DE LA EXPERIENCIA
   ----------------------------------------------------------
   Todo el contenido (textos, decisiones y cifras de las
   gráficas) vive en este archivo. Para cambiar un número o
   un texto, edítalo aquí; no hace falta tocar app.js.

   Las cifras de las gráficas vienen del tablero "Registro de la
   Plantación 1820–1830". Los turnos de guardia y las patrullas
   por ruta son datos propios de la experiencia.
   ========================================================== */

const PALETA = ['#B9472B', '#2F79B8', '#159A6E', '#D49600', '#B4507E']; // validada (ΔE CVD ≥ 8)
const RAMPA_FUEGO = ['#F6E2D3', '#EDB89A', '#DC8461', '#C0532F', '#8E2E17']; // secuencial (un solo tono)

const DATOS = {
  /* ---- Gráficas del "Registro de la Plantación" ---- */
  cuotas: { castigo: 100, promedio: 135, maxima: 180 },              // lb por persona y día (del tablero)
  horasTrabajo: {                                                      // horas por semana
    etiquetas: ['Recolección de algodón', 'Herrería y mantenimiento pesado', 'Construcción de infraestructura', 'Tareas logísticas'],
    valores:   [48, 24, 16, 12]
  },
  mercado: {                                                           // % del mercado
    etiquetas: ['Monopolio de grandes terratenientes', 'Comerciantes independientes locales', 'Red clandestina / comercio informal'],
    valores:   [70, 20, 10]
  },
  exportaciones: {                                                     // % de las exportaciones
    etiquetas: ['Algodón crudo', 'Tabaco y madera', 'Productos agrícolas y alimentos', 'Bienes manufacturados e industriales'],
    valores:   [42, 28, 18, 12]
  },
  precioAlgodon: {                                                     // centavos por libra
    anios:   [1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830],
    valores: [17, 14.5, 13.5, 13.8, 14.2, 12, 10.2, 10, 9.6, 9.3, 9]
  },
  /* Etapas de la ruta de escape (riesgo 1–10). Se usan en el cap. 02 y en el mapa del cap. 06 */
  etapas: [
    { hora: 0,  nombre: 'Salida de plantación', lugar: 'Alabama', riesgo: 9, en: { estado: 'AL' }, texto: 'Punto de partida, en Alabama, el estado con mayor producción. Con 9 sobre 10 es el momento de mayor riesgo.' },
    { hora: 3,  nombre: 'Caminos rurales', lugar: 'Tramo Alabama → Misisipi', riesgo: 4, en: { tramo: ['AL', 'MS'] }, texto: 'Al alejarse de la plantación el riesgo cae de 9 a 4.' },
    { hora: 6,  nombre: 'Puesto de control', lugar: 'Misisipi', riesgo: 8, en: { estado: 'MS' }, texto: 'Guardias y perros detienen la carreta. El riesgo vuelve a subir a 8 sobre 10.' },
    { hora: 9,  nombre: 'Ruta fluvial', lugar: 'Tramo Misisipi → Luisiana', riesgo: 5, en: { tramo: ['MS', 'LA'] }, texto: 'Superado el control, el riesgo baja a 5.' },
    { hora: 12, nombre: 'Llegada al puerto', lugar: 'Luisiana', riesgo: 3, en: { estado: 'LA' }, texto: 'Llegada al puerto fluvial. Con 3 sobre 10 es el punto de menor riesgo.' }
  ],
  produccion: { NC: 55, SC: 95, GA: 115, AL: 150, LA: 105 },          // escala 45–150 (valores ilustrativos del registro)
  centroides: { AL: [654.8, 428.9], GA: [716.8, 406.9], SC: [749.5, 379.6], NC: [780.9, 342.7], LA: [574.2, 474.9], MS: [589.3, 423.0] },

  /* ---- Datos propios de cada capítulo ---- */
  guardias: {                                                          // cap. 01 · guardias activos por franja
    horas:   ['6:00', '9:00', '12:00', '14:00', '16:00', '18:00'],
    valores: [9, 12, 11, 3, 8, 10],
    minimo:  3 // índice de la barra más baja (14:00)
  },
  patrullas: {                                                         // cap. 03 · % de rutas con patrulla
    rutas:   ['Caminos terrestres', 'Río principal', 'Canales secundarios'],
    valores: [70, 40, 20]
  }
};

/* ==========================================================
   CAPÍTULOS Y DECISIONES
   La opción marcada con  elegida:true  es la del documento
   "Rutas y toma de decisiones". La otra es la alternativa.
   riesgo y fondos son los CAMBIOS que produce cada opción.
   ========================================================== */
const CAPITULOS = [
  { id: 0, titulo: 'El Despacho Clandestino', corto: 'Elección de aliado' },
  {
    id: 1, titulo: 'El Yugo en Oak Ridge', corto: 'El yugo',
    lugar: 'Plantación Oak Ridge · 14 de octubre de 1829',
    sub: 'Toda fuga empieza con un patrón. Todo patrón deja un registro.',
    testimonio: 'Los terratenientes de Oak Ridge ordenaron mi ejecución. Antes de huir, necesito sacar el reloj averiado del capataz del escritorio de la casa señorial para entender sus rondas de guardia.',
    nota: 'El reloj ya no da la hora, pero su mecanismo guarda los turnos. Basta con encontrar el momento justo.',
    hechos: [['Lugar', 'Ala este de la casa'], ['Ventana', '17 minutos'], ['Objetivo', 'Reloj averiado']],
    firma: 'August',
    pregunta: '¿Cómo conseguirá August el reloj averiado?',
    analisis: 'Libro de contabilidad: en la gráfica de guardias, la barra de las 2:00 p. m. muestra el mínimo nivel de vigilancia.',
    opciones: [
      { letra: 'A', texto: 'Sacar el reloj durante el cambio de turno de la tarde', riesgo: 5, fondos: 0, elegida: true,
        resultado: 'Sustracción limpia: nadie nota la ausencia del reloj hasta el anochecer.' },
      { letra: 'B', texto: 'Entrar de noche por la ventana del despacho', riesgo: 20, fondos: 0,
        resultado: 'Los perros del capataz ladran. August escapa con el reloj, pero la casa queda en alerta.' }
    ]
  },
  {
    id: 2, titulo: 'Las 12 Horas a Oscuras', corto: '12 horas',
    lugar: 'Carromato de algodón · camino a la ciudad',
    sub: 'En la oscuridad, el tiempo es la única luz.',
    testimonio: 'Llevo seis horas bajo el algodón. El carromato se detiene: oigo botas, voces y perros en el puesto de control.',
    nota: 'Con el reloj pegado al oído cuento los minutos entre cada parada.',
    hechos: [['Trayecto', '12 horas'], ['Hora crítica', '06:00'], ['Carga', 'Algodón crudo']],
    firma: 'August',
    pregunta: 'Los guardias y perros detienen la carreta, ¿qué hace August?',
    analisis: 'El gráfico de riesgo del trayecto marca 8 sobre 10 en la Hora 6: el puesto de control. El reloj marca las 06:00.',
    opciones: [
      { letra: 'A', texto: 'Inmovilizarse bajo el algodón crudo húmedo', riesgo: 10, fondos: 0, elegida: true,
        resultado: 'La humedad del algodón ahoga el olor corporal. Los perros no lo detectan y la carreta sigue.' },
      { letra: 'B', texto: 'Saltar del carromato y correr hacia el bosque', riesgo: 35, fondos: 0,
        resultado: 'Los perros siguen su rastro. Logra esconderse en un pantano, pero pierde horas y deja huellas.' }
    ]
  },
  {
    id: 3, titulo: 'La Logística del Contrabando', corto: 'Contrabando',
    lugar: 'Sótano del Callejón del Humo · puerto fluvial',
    sub: 'Dos hermanos, un mapa de cuero y una sola oportunidad.',
    testimonio: 'Gideon duda del plan. Tenemos que mover el primer cargamento hacia el puerto sin caer en la emboscada de los caminos principales.',
    nota: 'Gideon despliega su mapa de cuero: rutas, mareas y horarios de patrulla anotados a mano.',
    hechos: [['Carga', 'Primer cargamento'], ['Destino', 'Muelle del puerto'], ['Aliado', 'Gideon']],
    firma: 'Gideon',
    pregunta: '¿Por qué ruta mueven el primer cargamento?',
    analisis: 'El mapa de cuero muestra la tendencia: los caminos terrestres tienen 70 % de patrullas; los canales secundarios, solo 20 %.',
    opciones: [
      { letra: 'A', texto: 'Por los canales fluviales secundarios', riesgo: 10, fondos: 150, elegida: true,
        resultado: 'Navegación nocturna silenciosa. La entrega se completa sin alertar a los cazadores de recompensas.' },
      { letra: 'B', texto: 'Por el camino principal, escondidos entre carretas legales', riesgo: 30, fondos: 50,
        resultado: 'Una patrulla revisa la carga. Pierden parte del cargamento para salir del paso.' }
    ]
  },
  {
    id: 4, titulo: 'El Mercado del Puerto', corto: 'Mercado',
    lugar: 'Taberna del muelle · mesa de negociación',
    sub: 'El algodón robado vale lo que el imperio dice que vale.',
    testimonio: 'La Red interceptó 50 fardos de algodón. ¿Los vendemos ya en el mercado negro o esperamos a que suba el precio internacional?',
    nota: 'The Southern Gazette anuncia la crisis del algodón: los robos fluviales aterrorizan a los hacendados.',
    hechos: [['Fardos', '50'], ['Mercado', 'Negro, local'], ['Testigo', 'Gideon']],
    firma: 'Gideon',
    pregunta: '¿Vender ya o especular con el precio?',
    analisis: 'La carta mercantil: los grandes terratenientes controlan el 70 % del mercado y el precio cae de 17 a 9,3 ¢ por libra entre 1820 y 1829.',
    opciones: [
      { letra: 'A', texto: 'Vender de inmediato en el mercado negro local', riesgo: 5, fondos: 150, elegida: true,
        resultado: 'Capital rápido para suministros y botes, manteniendo un perfil bajo en el puerto.' },
      { letra: 'B', texto: 'Guardar los fardos y esperar a que suba el precio', riesgo: 20, fondos: 250,
        resultado: 'Ganan más dinero, pero los fardos escondidos llaman la atención de los informantes del sheriff.' }
    ]
  },
  {
    id: 5, titulo: 'El Secreto en el Mecanismo', corto: 'Mecanismo',
    lugar: 'Mesa del relojero · Callejón del Humo',
    sub: 'Las piezas pequeñas guardan los secretos grandes.',
    pregunta: '¿Qué hacen con las coordenadas?',
    analisis: 'Al cruzar las coordenadas (32.31° N, 86.90° O) con el mapa de cuero aparece un punto ciego en la bahía que la marina no patrulla.',
    opciones: [
      { letra: 'A', texto: 'Establecer ahí el puerto seguro permanente de la Red del Río', riesgo: -10, fondos: 0, elegida: true,
        resultado: 'Nace una base de operaciones sólida. La eficiencia de la red reduce el peligro.' },
      { letra: 'B', texto: 'Vender las coordenadas a otros contrabandistas', riesgo: 15, fondos: 100,
        resultado: 'Ganan dinero, pero el secreto ya no es solo suyo.' }
    ]
  },
  {
    id: 6, titulo: 'El Sabotaje al Almacén Central', corto: 'Almacén',
    lugar: 'Almacén Central de Acopio · distrito del río',
    sub: 'El registro quedó expuesto. Solo quedan el fuego, el agua y la fuerza.',
    testimonio: 'El capataz nos acorraló junto a los fardos en llamas. El fuego avanza rápido… ¿cómo salimos?',
    nota: 'Las puertas del este están trancadas. Gideon ve la luz del canal bajo la compuerta, pero el capataz está entre nosotros y la salida.',
    hechos: [['Fuego', '68 %'], ['Al canal', '42 yardas'], ['Obstáculo', 'El capataz']],
    firma: 'August',
    pregunta: '¿Cómo llegan al canal?',
    analisis: 'El plano del almacén indica que el fuego colapsará la salida principal en menos de 3 minutos.',
    opciones: [
      { letra: 'A', texto: 'Usar el eslabón y las cadenas pesadas para neutralizar al capataz', riesgo: 15, fondos: 0, elegida: true,
        resultado: 'Con las mismas cadenas que lo aprisionaron, August vence al capataz y escapan por el canal antes del colapso.' },
      { letra: 'B', texto: 'Derribar fardos encendidos para bloquear la puerta y huir', riesgo: 30, fondos: 0,
        resultado: 'Escapan, pero el humo los delata y el capataz sobrevive para seguirlos.' }
    ]
  },
  {
    id: 7, titulo: 'El Destino Final de la Red', corto: 'Dossier',
    lugar: 'Muelle al amanecer',
    sub: 'Hay una barcaza lista hacia el Norte. La Red en el Sur necesita un líder.',
    pregunta: '¿Huir al Norte o quedarse a liderar la Red?',
    analisis: 'Balance de la travesía: el riesgo está controlado y más de 40 familias esperan ser evacuadas.',
    opciones: [
      { letra: 'A', texto: 'Tomar la barcaza hacia el Norte libre', riesgo: 0, fondos: 0, insignia: 'Superviviente del Norte',
        resultado: 'August cruza a la libertad. La Red continúa sin él, más frágil.' },
      { letra: 'B', texto: 'Quedarse en el Sur con Gideon para consolidar la Red del Río', riesgo: 0, fondos: 0, elegida: true,
        insignia: 'Estratega Silencioso y Liberador del Río',
        resultado: 'Cierre heroico: la Red del Río empieza a llevar familias hacia el Norte.' }
    ]
  }
];

const ALIADOS = {
  august: { nombre: 'August', rol: 'El Operativo', ficha: '017',
    desc: 'Se mueve entre las sombras de la plantación, los escondites en carretas y las fugas físicas.',
    rasgos: [['Sigilo', 92], ['Herrería', 86], ['Tácticas de fuga', 89]] },
  gideon: { nombre: 'Gideon', rol: 'El Estratega', ficha: '024',
    desc: 'Domina los callejones del puerto, las rutas de barcazas y el sabotaje económico.',
    rasgos: [['Mercado negro', 94], ['Redes del río', 88], ['Control de precios', 91]] }
};

const VOTACION = {
  pregunta: '¿Fueron los datos más fuertes que las armas?',
  opciones: ['Sí, la información venció al imperio', 'No, sin la fuerza no habría escape', 'Ambos fueron necesarios']
};
