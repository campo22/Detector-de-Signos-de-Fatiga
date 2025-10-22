

/**
 * Niveles de fatiga detectados. Debe coincidir con el enum FatigueLevel.java del backend.
 */
export enum FatigueLevel {
  NINGUNO = 'NINGUNO',
  BAJO = 'BAJO', // Nivel de fatiga bajo
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

/**
 * Tipos de eventos de fatiga. Debe coincidir con el enum FatigueType.java del backend.
 */
export enum FatigueType {
  NINGUNO = 'NINGUNO',
  MICROSUEÑO = 'MICROSUEÑO',
  CABECEO = 'CABECEO',
  BOSTEZO = 'BOSTEZO',
  CANSANCIO_VISUAL = 'CANSANCIO_VISUAL',
}
