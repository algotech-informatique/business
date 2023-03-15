// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
    production: false,
    defaultLanguage: 'en-US',
    supportedLanguages: [
        'en-US',
        'fr-FR',
        'es-ES',
    ],
    API_URL: 'http://traefik/api',
    WS_URL: 'traefik/ws/workflow-editor',
    APP_ID: '5f9a0d75-847d-488f-85cd-1d9c0dc6',
    STORAGE_CONTEXT: 'angular',
    KC_URL: 'http://traefik/auth',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
