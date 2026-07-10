export default {
  // General
  welcome: 'Bienvenido a',
  subtitle: 'tu CLI de confianza para gestionar ramas en GIT',
  operationCompleted: 'Operacion completada!',
  operationCancelled: 'Operacion cancelada. Saliendo...',
  unknownCommand: 'Comando desconocido',
  errorExecuting: 'Error al ejecutar el comando',
  version: 'eazy-git version',

  // Main menu
  whatToDo: 'Que deseas hacer?',
  addChanges: 'Agregar cambios a una rama',
  createOriginal: 'Crear rama original',
  createTemporal: 'Crear rama temporal',

  // Git checks
  notGitRepo: 'Este directorio no es un repositorio git',
  gitNotInstalled: 'git no esta instalado en el sistema',

  // Add changes to branch
  currentBranch: 'Branch actual',
  filesChanged: 'Archivos con cambios',
  noChangesPending:
    'No hay cambios pendientes. Deseas continuar de todas formas?',
  updatingRefs: 'Actualizando referencias remotas...',
  refsUpdated: 'Referencias actualizadas',
  fetchFailed: 'No se pudo hacer fetch (continuando...)',
  baseBranch: 'Desde que branch base quieres crear la rama?',
  baseBranchRequired: 'El branch base es requerido',
  ticketId: 'Cual es el identificador del ticket?',
  ticketRequired: 'El ticket es requerido',
  changeType: 'Que tipo de cambio es?',
  branchExistsLocal: (name) =>
    `La rama "${name}" ya existe localmente. Que deseas hacer?`,
  switchToIt: 'Cambiarme a ella y continuar',
  cancel: 'Cancelar',
  cancelledOp: 'Operacion cancelada.',
  creatingBranch: (name, origin) =>
    `Creando rama ${name} desde origin/${origin}...`,
  branchCreated: (name) => `Rama ${name} creada`,
  errorCreatingBranch: (msg) => `Error al crear la rama: ${msg}`,
  noFilesToStage: 'No hay archivos para stagear.',
  selectFiles: 'Cuales archivos quieres incluir en el commit?',
  selectAllFiles: 'Seleccionar todos los archivos',
  stagedFiles: 'Archivos en stage',
  stagedCorrect: 'Los archivos en stage son correctos?',
  aiProvider: 'Con que IA quieres generar la sugerencia de commit?',
  generatingCommit: (label) => `Generando sugerencia de commit con ${label}...`,
  aiSuggestionFailed: (label) =>
    `No se pudo obtener sugerencia de ${label}. Escribe el mensaje manualmente.`,
  writeCommitMsg: 'Escribe el mensaje de commit:',
  commitMsgRequired: 'El mensaje es requerido',
  suggestionOf: (label) => `Sugerencia de ${label}`,
  useThisCommit: 'Este mensaje de commit te parece bien?',
  yesUseIt: 'Si, usar este',
  modify: 'Modificar',
  commitSuccess: 'Commit realizado correctamente',
  hookBlocked: 'El pre-commit hook bloqueo el commit. Que deseas hacer?',
  retryHook: 'Ya lo corregi, agrega los cambios y vuelve a intentarlo',
  skipHook: 'Saltar el hook (--no-verify)',
  commitNoHooks: 'Commit realizado (sin hooks)',
  pushToRemote: 'Deseas subir la rama al repositorio remoto?',
  pushSuccess: 'Push realizado',
  pushForceQuestion:
    'La rama ya existe en el remoto con historial diferente. Deseas forzar el push? (git push -f)',
  pushForceSuccess: 'Push forzado realizado',
  pushForceError: (msg) => `Error en el push forzado: ${msg}`,
  pushError: (msg) => `Error en el push: ${msg}`,
  summaryTitle: 'Resumen',
  summaryBranch: 'Rama',
  summaryFrom: 'Desde',
  summaryCommit: 'Commit',
  summaryFiles: (n) => `${n} archivos commiteados`,
  summaryPush: 'Push',
  summaryPR: 'Crear PR',

  // File statuses
  statusModified: 'modificado',
  statusAdded: 'agregado',
  statusDeleted: 'eliminado',
  statusRenamed: 'renombrado',
  statusUntracked: 'sin rastrear',

  // Commit types
  commitTypes: {
    fix: 'fix — correccion de bug',
    feat: 'feat — nueva funcionalidad',
    refactor: 'refactor — mejora sin cambio funcional',
    chore: 'chore — mantenimiento, dependencias',
    docs: 'docs — documentacion',
    test: 'test — pruebas',
    ci: 'ci — integracion continua',
    perf: 'perf — rendimiento',
    style: 'style — formato, sin cambio de logica'
  },

  // Create original branch
  selectBranchType: 'Selecciona el tipo de rama:',
  branchFix: 'Fix',
  branchImprovement: 'Mejora',
  branchFeature: 'Feature',
  branchRefactor: 'Refactor',
  creatingOriginalBranch: 'Creando rama original...',
  branchCreatedAndPushed: (name) =>
    `Rama "${name}" creada y pusheada correctamente!`,
  branchCreatedSuccess: (name) => `Rama "${name}" creada correctamente!`,

  // Create temporal branch
  mergeBranchQuestion: 'A que rama deseas hacer merge?',
  developDEV: 'develop (DEV)',
  releaseUAT: 'release (UAT)',
  temporalBranchCreated: 'Rama temporal creada correctamente',
  temporalBranchMerged: 'Rama temporal mergeada correctamente',
  conflictsDetected: 'Conflictos detectados. Resolvelos manualmente!',
  branchPushedToRemote: 'Rama pusheada al repositorio remoto',
  removeTemporalBranch: 'Deseas eliminar la rama temporal?',
  temporalBranchDeleted: 'Rama temporal eliminada correctamente',
  errorCreatingTemporal: 'Error creando la rama temporal',

  // JIRA ticket
  enterJiraCode: 'Ingresa el codigo del ticket JIRA:',
  jiraRequired: 'El codigo JIRA es requerido!',
  jiraInvalidFormat: 'El codigo JIRA debe tener el formato',

  // Quick git commands
  fetchingRemote: 'Obteniendo cambios remotos...',
  pullingChanges: 'Aplicando cambios en tu rama...',
  pullError: (msg) => `Error: ${msg}`,
  pushingChanges: 'Subiendo cambios al remoto...',
  pushedSuccess: 'Cambios subidos correctamente!',
  pushedForceSuccess: 'Cambios subidos (forzado) correctamente!',
  pushQuickError: (msg) => `Error: ${msg}`,
  provideCommitMsg: 'Proporciona un mensaje de commit',
  stagingChanges: 'Stageando cambios...',
  creatingCommit: 'Creando commit...',
  commitCreated: 'Commit creado correctamente!',
  commitError: (msg) => `Error: ${msg}`,
  switchingPrevBranch: 'Cambiando a la rama anterior...',
  switchedTo: (branch) => `Cambiado a rama ${branch} correctamente!`,
  checkoutError: (msg) => `Error: ${msg}`,
  fetchingLatest: 'Obteniendo ultimos cambios...',
  mergingWith: (branch) => `Mergeando con ${branch}...`,
  pushingMerged: 'Subiendo cambios mergeados...',
  mergeCompleted: 'Merge completado correctamente!',
  mergeError: (msg) => `Error: ${msg}`,
  removingLastCommit: 'Eliminando ultimo commit...',
  removeLastConfirm:
    'Esto eliminara el ultimo commit (los cambios se mantienen en staging). Continuar?',
  lastCommitRemoved: (hash) => `commit ${hash} eliminado correctamente`,
  removedCommitDetail: 'Detalle del commit',
  removeLastError: (msg) => `Error: ${msg}`,
  logError: (msg) => `Error: ${msg}`,

  // Install
  settingUpConfig: 'Configurando tu entorno',
  configSaved: 'Configuracion guardada',
  missingConfigValues: 'Faltan valores de configuracion requeridos.',
  errorWritingConfig: 'Error escribiendo archivo de configuracion:',
  currentConfig: 'Configuracion actual',
  useThisConfig: 'Deseas usar esta configuracion?',
  installingDeps: 'Instalando dependencias...',
  depsInstalled: 'Todas las dependencias fueron instaladas',
  authFailed: 'Autenticacion fallida',
  unexpectedError: 'Ocurrio un error inesperado',
  enterEndpoint: 'Ingresa la URL del endpoint:',
  urlRequired: 'La URL es requerida!',
  urlMustBeHttp: 'La URL debe usar protocolo HTTP/HTTPS',
  urlMustHaveHost: 'La URL debe incluir un hostname',
  urlInvalid: 'Ingresa una URL valida',
  enterApiKey: 'Ingresa tu apikey:',
  apiKeyRequired: 'El API key es requerido!',
  enterRegistryName:
    'Ingresa el nombre del registro NPM (sin caracteres especiales):',
  registryNameRequired: 'El nombre del registro es requerido!',
  registryNameLettersOnly: 'El nombre del registro debe contener solo letras',
  enterRegistryURL: 'Ingresa la URL del registro NPM (sin http/https):',
  registryURLRequired: 'La URL del registro es requerida!',
  registryURLStartWithName:
    'La URL debe empezar con un nombre, evita caracteres especiales',
  registryURLNoProtocol:
    "La URL no debe incluir protocolo 'http/https' y debe empezar con una letra",
  registryURLNoSlash:
    "La URL no debe empezar con '/' y debe empezar con una letra o numero",
  registryURLNoWWW:
    "La URL no debe empezar con 'www' y debe empezar con una letra o numero",

  // Upgrade
  currentVersionLabel: 'Version actual',
  checkingUpdates: 'Buscando actualizaciones...',
  upgradeCheckFailed: 'No se pudo verificar la ultima version',
  alreadyLatest: (v) => `Ya tienes la ultima version (${v})`,
  upgrading: (v) => `Actualizando a v${v}...`,
  upgradeError: 'Error al actualizar eazy-git',
  upgradeSuccess: (v) => `eazy-git actualizado a v${v}!`,

  // Config command
  languageSelect: 'Selecciona el idioma de la interfaz:',
  languageChanged: (lang) => `Idioma cambiado a: ${lang}`,
  configMenu: 'Que deseas configurar?',
  configLanguage: 'Cambiar idioma',
  configDefaultBranch: 'Rama base por defecto',
  configAIProvider: 'Proveedor de IA por defecto',
  configView: 'Ver configuracion actual',
  defaultBranchSet: (branch) => `Rama base por defecto: ${branch}`,
  aiProviderSet: (provider) => `Proveedor de IA por defecto: ${provider}`,
  goBack: 'Volver',

  // Reuse last commit
  configReuseLastCommit: 'Sugerir último commit utilizado',
  reuseLastCommitEnabled: 'enabled',
  reuseLastCommitDisabled: 'disabled',
  lastCommitFound: (msg) => `Ultimo commit: "${msg}"`,
  lastCommitAction: 'Que deseas hacer con este commit?',
  reuseCommit: 'Reutilizar tal cual',
  modifyCommit: 'Modificar',
  newCommit: 'Generar uno nuevo'
}
