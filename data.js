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
const RUTA_AUGUST = [
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


/* ==========================================================
   RUTA DE GIDEON (El Estratega) · 7 capítulos propios
   Usa las mismas gráficas con situaciones distintas.
   "v" ajusta los textos y datos de las gráficas de cada capítulo.
   ========================================================== */
const RUTA_GIDEON = [
  { id: 0, titulo: 'El Despacho Clandestino', corto: 'Elección de aliado' },
  {
    id: 1, titulo: 'Las Sombras del Muelle', corto: 'Muelle',
    lugar: 'Callejón del Humo · puerto fluvial, septiembre de 1829',
    sub: 'Diez años vendiendo lo que el imperio pierde.',
    testimonio: 'Los terratenientes ponen precio a mi cabeza: me llaman «El Fantasma del Río». Para seguir moviendo mercancía necesito el registro de cargamentos que el aduanero guarda en su oficina del muelle.',
    nota: 'El aduanero cambia de guardia de madrugada; durante unos minutos la oficina queda sola.',
    hechos: [['Lugar', 'Oficina de aduanas'], ['Ventana', '12 minutos'], ['Objetivo', 'Registro de cargas']],
    firma: 'Gideon',
    pregunta: '¿Cómo consigue Gideon el registro de cargamentos?',
    analisis: 'Libro de inspecciones del muelle: la barra de las 4:00 a. m. marca la menor cantidad de guardias.',
    v: { kicker: 'Libro de inspecciones del muelle · vol. II', titulo: 'Guardias de aduana en el muelle', minimo: '4:00 a. m.',
         nota: '⧗ En el cambio de guardia de la madrugada solo quedan 2 vigilantes: una ventana de 12 minutos.',
         serie: { horas: ['20:00', '22:00', '00:00', '02:00', '04:00', '06:00'], valores: [8, 10, 7, 6, 2, 9], minimo: 4 } },
    opciones: [
      { letra: 'A', texto: 'Copiar el registro durante el cambio de guardia de las 4:00 a. m.', riesgo: 5, fondos: 0, elegida: true,
        resultado: 'Copia limpia: ahora sabe qué barcazas llevan el algodón de Oak Ridge.' },
      { letra: 'B', texto: 'Sobornar al escribano de la aduana', riesgo: 15, fondos: -50,
        resultado: 'Consigue el registro, pero el escribano ya sabe quién lo pidió.' }
    ]
  },
  {
    id: 2, titulo: 'La Noche de las Barcazas', corto: 'Barcazas',
    lugar: 'Canal del muelle · madrugada',
    sub: 'El río no perdona a quien llega tarde.',
    testimonio: 'Dos barcazas con algodón interceptado esperan salir al Norte. El aduanero cerró el acceso al canal con un candado y sus guardias revisan los manifiestos en la entrada.',
    nota: 'El agua golpea las estacas; la lluvia fina cubre el ruido de los remos.',
    hechos: [['Barcazas', '2'], ['Carga', 'Algodón interceptado'], ['Obstáculo', 'El aduanero']],
    firma: 'Gideon',
    pregunta: '¿Cómo libera Gideon las barcazas?',
    analisis: 'La bitácora del trayecto marca 8 sobre 10 en el paso de la aduana: es el punto crítico de la noche.',
    v: { reloj: 'EL RELOJ DEL MUELLE', kicker: 'Bitácora de Gideon · trayecto fluvial', titulo: 'Riesgo en la ruta de las barcazas',
         sub: 'Nivel de riesgo de 1 a 10 en cada punto de la noche', ayuda: 'Gira las manecillas: recorre la noche en el río.',
         etapas: [
           { hora: 0, nombre: 'Sótano del Callejón', riesgo: 3, texto: 'Gideon reúne a los estibadores en el sótano de la distribuidora de grano.' },
           { hora: 3, nombre: 'Muelle de carga', riesgo: 6, texto: 'Las barcazas cargadas esperan escondidas entre los botes de pesca.' },
           { hora: 6, nombre: 'Paso de la aduana', riesgo: 8, texto: 'El aduanero cerró el canal: es el punto más vigilado de la noche.' },
           { hora: 9, nombre: 'Canal secundario', riesgo: 4, texto: 'Lejos de la vista de la aduana, el riesgo baja a 4.' },
           { hora: 12, nombre: 'Bahía', riesgo: 2, texto: 'Las barcazas desaparecen en la niebla rumbo al Norte.' }
         ] },
    opciones: [
      { letra: 'A', texto: 'Usar las señas del muelle para provocar una falsa pelea y soltar las amarras a oscuras', riesgo: 10, fondos: 150, elegida: true,
        resultado: 'Los guardias se distraen, las cadenas se liberan y las barcazas desaparecen en la niebla del río.' },
      { letra: 'B', texto: 'Sobornar al jefe de aduanas con monedas del mercado negro', riesgo: 35, fondos: -50,
        resultado: 'El trato era una trampa: suena la alarma y Gideon escapa por poco, dejando atrás una barcaza.' }
    ]
  },
  {
    id: 3, titulo: 'El Hermano Perdido', corto: 'Hermano',
    lugar: 'Sótano de la distribuidora de grano · Callejón del Humo',
    sub: 'Diez años después, la sangre vuelve a tocar la puerta.',
    testimonio: 'Un fugitivo de Oak Ridge pregunta por mí en las tabernas. Es August, mi hermano menor. Dice que conoce los horarios de las carretas y los nombres de los capataces corruptos.',
    nota: 'Despliego mi mapa de cuero sobre la mesa: rutas, mareas y patrullas anotadas a mano. Si unimos lo que sabemos, podemos golpear al Rey Algodón.',
    hechos: [['Llega', 'August'], ['Trae', 'Horarios y nombres'], ['Peligro', 'Lo buscan']],
    firma: 'Gideon',
    pregunta: '¿Qué hace Gideon con su hermano?',
    analisis: 'El mapa de cuero: los caminos terrestres tienen 70 % de patrullas y los canales secundarios solo 20 %. Con los horarios de August, los canales se pueden usar cada noche.',
    opciones: [
      { letra: 'A', texto: 'Unir a August a la red y mover el primer cargamento por los canales secundarios', riesgo: 10, fondos: 150, elegida: true,
        resultado: 'Los hermanos sellan la alianza. La primera entrega llega al puerto sin alertar a nadie.' },
      { letra: 'B', texto: 'Darle dinero a August y mandarlo solo al Norte para proteger la red', riesgo: 5, fondos: -50,
        resultado: 'La red sigue a salvo, pero pierde la información que solo August conocía.' }
    ]
  },
  {
    id: 4, titulo: 'El Precio del Silencio', corto: 'Precio',
    lugar: 'Taberna del muelle · mesa de negociación',
    sub: 'Quien controla el precio, controla el puerto.',
    testimonio: 'Los grandes terratenientes controlan el 70 % del mercado; nuestra red apenas mueve el 10 %. Un comerciante del Norte ofrece comprar todo lo que interceptemos, pero quiere la carga completa de una sola vez.',
    nota: 'The Southern Gazette publica la recompensa por «El Fantasma del Río». Cada venta grande deja rastro.',
    hechos: [['Fardos', '50'], ['Comprador', 'Comerciante del Norte'], ['Testigo', 'August']],
    firma: 'Gideon',
    pregunta: '¿A quién le vende Gideon el algodón?',
    analisis: 'La carta mercantil: el precio cayó de 17 a 9,3 ¢ por libra entre 1820 y 1829, y la red solo controla el 10 % del mercado.',
    opciones: [
      { letra: 'A', texto: 'Venderle todo de una vez al comerciante del Norte', riesgo: 20, fondos: 300,
        resultado: 'Gran ganancia, pero la venta llama la atención de los informantes del sheriff.' },
      { letra: 'B', texto: 'Vender en partidas pequeñas a comerciantes independientes', riesgo: 5, fondos: 150, elegida: true,
        resultado: 'Ganancias constantes y perfil bajo: la red puede comprar botes sin levantar sospechas.' }
    ]
  },
  {
    id: 5, titulo: 'Lo que Esconde el Reloj', corto: 'Reloj',
    lugar: 'Mesa del relojero · Callejón del Humo',
    sub: 'August trajo algo más que su libertad: el reloj del capataz.',
    pregunta: '¿Qué hace Gideon con las coordenadas?',
    analisis: 'Al cruzar las coordenadas del reloj (32.31° N, 86.90° O) con su mapa de cuero, Gideon reconoce un punto ciego en la bahía que la marina no patrulla.',
    opciones: [
      { letra: 'A', texto: 'Mover esta misma noche las barcazas y los botes al punto ciego', riesgo: -10, fondos: 0, elegida: true,
        resultado: 'La Red del Río tiene por fin un puerto seguro propio.' },
      { letra: 'B', texto: 'Enviar primero a un explorador y esperar una semana', riesgo: 5, fondos: 0,
        resultado: 'El punto se confirma, pero la semana de espera deja los botes expuestos en el muelle.' }
    ]
  },
  {
    id: 6, titulo: 'La Compuerta del Canal', corto: 'Compuerta',
    lugar: 'Almacén Central de Acopio · distrito del río',
    sub: 'Mientras August pelea, alguien tiene que abrir la salida.',
    testimonio: 'El capataz acorraló a August entre los fardos en llamas. Yo estoy junto a la compuerta del canal: está trabada y el humo no deja ver.',
    nota: 'Si la abro, el agua entra y frena el fuego, pero el barco de la aduana verá la luz.',
    hechos: [['Fuego', '68 %'], ['August', 'Acorralado'], ['Salida', 'La compuerta']],
    firma: 'Gideon',
    pregunta: '¿Cómo saca Gideon a su hermano del almacén?',
    analisis: 'El plano indica que la salida principal colapsa en menos de 3 minutos; la compuerta del canal es la única salida accesible.',
    v: { marca: 'G' },
    opciones: [
      { letra: 'A', texto: 'Forzar la compuerta con una palanca y esperar a August en el bote', riesgo: 15, fondos: 0, elegida: true,
        resultado: 'La compuerta cede; August vence al capataz con las cadenas y ambos escapan por el canal antes del colapso.' },
      { letra: 'B', texto: 'Distraer a los cazadores prendiendo fuego al muelle de carga', riesgo: 30, fondos: 0,
        resultado: 'Los cazadores se dispersan, pero el incendio se extiende y la red pierde su almacén.' }
    ]
  },
  {
    id: 7, titulo: 'El Destino Final de la Red', corto: 'Dossier',
    lugar: 'Muelle al amanecer',
    sub: 'Gideon tiene dinero, botes y a su hermano de vuelta. Falta decidir qué hacer con ellos.',
    pregunta: '¿Huir al Norte con los fondos o quedarse a liderar la Red?',
    analisis: 'Balance de la travesía: el riesgo está controlado y más de 40 familias esperan ser evacuadas por el río.',
    opciones: [
      { letra: 'A', texto: 'Tomar los fondos y huir al Norte con August', riesgo: 0, fondos: 0, insignia: 'Contrabandista Retirado',
        resultado: 'Los hermanos llegan a la libertad. En el Sur, las familias siguen esperando.' },
      { letra: 'B', texto: 'Quedarse en el Sur y fundar con August la Red del Río', riesgo: 0, fondos: 0, elegida: true,
        insignia: 'Estratega del Río y Cofundador de la Red',
        resultado: 'Los barcos del imperio empiezan a llevar familias hacia el Norte.' }
    ]
  }
];

const RUTAS = { august: RUTA_AUGUST, gideon: RUTA_GIDEON };
let CAPITULOS = RUTA_AUGUST; // cambia según el aliado elegido

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
