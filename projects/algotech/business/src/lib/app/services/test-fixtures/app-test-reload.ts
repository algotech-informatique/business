import { ApplicationModelDto } from '@algotech/core';

export const appTestReload: ApplicationModelDto = {
    uuid: '7623c5df-62dd-0870-1351-05c462214c36',
    createdDate: '2022-03-28T04:13:25.758Z',
    updateDate: '2022-03-28T06:35:41+02:00',
    appId: 'fd1cf696-cafc-2615-bd33-e166d89c0768',
    snModelUuid: '7623c5df-62dd-0870-1351-05c462214c36',
    appVersion: 0,
    key: 'fixture',
    displayName: [
        {
            lang: 'fr-FR',
            value: 'fixture'
        },
        {
            lang: 'en-US',
            value: ''
        },
        {
            lang: 'es-ES',
            value: ''
        }
    ],
    environment: 'mobile',
    snApp: {
        id: 'fd1cf696-cafc-2615-bd33-e166d89c0768',
        environment: 'mobile',
        icon: 'fa-solid fa-check',
        securityGroups: [],
        pageHeight: 812,
        pageWidth: 375,
        shared: [],
        pages: [
            {
                id: '765cc5fb-fbc6-b004-e953-b79258d40895',
                canvas: {
                    x: 0,
                    y: 0
                },
                css: {
                    backgroundColor: 'var(--ALGOTECH-BACKGROUND)',
                    height: 812,
                    width: 375
                },
                pageHeight: 812,
                pageWidth: 375,
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'fixture'
                    },
                    {
                        lang: 'en-US',
                        value: ''
                    },
                    {
                        lang: 'es-ES',
                        value: ''
                    }
                ],
                variables: [],
                dataSources: [
                    {
                        id: '90547fc4-4184-3c11-bacc-37f64483f9ba',
                        type: 'smartflow',
                        action: 'random',
                        inputs: [],
                        key: 'random',
                        custom: null
                    },
                    {
                        id: '126a6fa8-b0ce-09f5-1a07-52def4a8b75a',
                        type: 'smartobjects',
                        action: 'machine',
                        inputs: [],
                        key: 'machines',
                        custom: null
                    }
                ],
                widgets: [
                    {
                        id: '606719f5-bb9d-5bdc-213a-41a522aba33e',
                        typeKey: 'button',
                        name: 'Bouton',
                        isActive: false,
                        css: {
                            button: {
                                backgroundColor: 'var(--ALGOTECH-PRIMARY)',
                                borderRadius: '4px 4px 4px 4px',
                                boxShadow: 'unset',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none'
                            },
                            text: {
                                color: 'var(--ALGOTECH-PRIMARY-HOVER)',
                                fontSize: '15px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                fontStyle: 'normal',
                                textDecoration: 'none',
                                fontWeight: 'bold'
                            }
                        },
                        custom: {
                            title: [
                                {
                                    lang: 'fr-FR',
                                    value: 'Titre'
                                },
                                {
                                    lang: 'en-US',
                                    value: ''
                                },
                                {
                                    lang: 'es-ES',
                                    value: ''
                                }
                            ],
                            action: '',
                            iterable: true,
                            disabled: false,
                            hidden: false
                        },
                        box: {
                            x: 138,
                            y: 340,
                            width: 100,
                            height: 50
                        },
                        events: [
                            {
                                id: '31fbaac8-239d-c4cb-44bb-a52bb174da5d',
                                eventKey: 'onClick',
                                pipe: [
                                    {
                                        id: '57af14bc-cd43-a8a6-e886-d5474102a086',
                                        type: 'call::onLoad',
                                        action: 'd5fbf6de-5215-5463-f260-2e317d4a41b7',
                                        inputs: [],
                                        custom: null
                                    }
                                ],
                                custom: {
                                    mode: 'sequence'
                                }
                            }
                        ],
                        rules: [],
                        displayState: {
                            errors: []
                        },
                        group: {
                            widgets: []
                        }
                    },
                    {
                        id: 'd5fbf6de-5215-5463-f260-2e317d4a41b7',
                        typeKey: 'text',
                        name: 'Random',
                        isActive: false,
                        css: {
                            main: {
                                backgroundColor: '#FFFFFF00',
                                borderRadius: '4px 4px 4px 4px',
                                boxShadow: 'unset',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none'
                            },
                            text: {
                                color: 'var(--ALGOTECH-TERTIARY)',
                                fontSize: '12px',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                textAlign: 'left',
                                fontStyle: 'normal',
                                textDecoration: 'none',
                                fontWeight: 'normal'
                            }
                        },
                        custom: {
                            text: [
                                {
                                    lang: 'fr-FR',
                                    value: '{{datasource.random}}'
                                },
                                {
                                    lang: 'en-US',
                                    value: ''
                                },
                                {
                                    lang: 'es-ES',
                                    value: ''
                                }
                            ],
                            iterable: true,
                            disabled: false,
                            hidden: false
                        },
                        box: {
                            x: 10,
                            y: 10,
                            width: 100,
                            height: 20
                        },
                        events: [
                            {
                                id: '5a80d999-10a2-1cf6-fdb6-517158cef842',
                                eventKey: 'onClick',
                                pipe: [],
                                custom: {
                                    mode: 'sequence'
                                }
                            }
                        ],
                        rules: [],
                        displayState: {
                            errors: [],
                            draghover: false
                        },
                        group: {
                            widgets: []
                        }
                    },
                    {
                        id: '118e0d69-19a4-d444-1cc5-a578d98eb898',
                        typeKey: 'list',
                        name: 'Liste',
                        isActive: false,
                        css: {
                            main: {
                                backgroundColor: '#FFFFFF00',
                                borderRadius: '4px 4px 4px 4px',
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none'
                            },
                            list: {
                                gap: '5px'
                            }
                        },
                        custom: {
                            iterable: false,
                            disabled: false,
                            hidden: false,
                            paginate: {
                                limit: 5,
                                mode: 'infinite'
                            },
                            collection: '{{datasource.machines}}',
                            search: false,
                            direction: 'column',
                            scrollbar: true
                        },
                        box: {
                            x: 138,
                            y: 10,
                            height: 70,
                            width: 100
                        },
                        events: [],
                        rules: [],
                        group: {
                            widgets: [
                                {
                                    id: 'f76aed65-51e2-a10d-412a-19047e2f08e0',
                                    typeKey: 'text',
                                    name: 'Texte',
                                    isActive: false,
                                    css: {
                                        main: {
                                            backgroundColor: '#FFFFFF00',
                                            borderRadius: '4px 4px 4px 4px',
                                            boxShadow: 'unset',
                                            borderTop: 'none',
                                            borderRight: 'none',
                                            borderBottom: 'none',
                                            borderLeft: 'none'
                                        },
                                        text: {
                                            color: 'var(--ALGOTECH-TERTIARY)',
                                            fontSize: '12px',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            textAlign: 'left',
                                            fontStyle: 'normal',
                                            textDecoration: 'none',
                                            fontWeight: 'normal'
                                        }
                                    },
                                    custom: {
                                        text: [
                                            {
                                                lang: 'fr-FR',
                                                value: '{{current-list.item.NAME}}'
                                            },
                                            {
                                                lang: 'en-US',
                                                value: ''
                                            },
                                            {
                                                lang: 'es-ES',
                                                value: ''
                                            }
                                        ],
                                        iterable: true,
                                        disabled: false,
                                        hidden: false
                                    },
                                    box: {
                                        x: 0,
                                        y: 0,
                                        width: 100,
                                        height: 20
                                    },
                                    events: [
                                        {
                                            id: '6d4af647-3274-67f0-cb98-a559abddf803',
                                            eventKey: 'onClick',
                                            pipe: [],
                                            custom: {
                                                mode: 'sequence'
                                            }
                                        }
                                    ],
                                    rules: [],
                                    displayState: {
                                        errors: []
                                    },
                                    group: {
                                        widgets: []
                                    }
                                }
                            ]
                        },
                        displayState: {
                            errors: []
                        }
                    }
                ],
                events: [
                    {
                        eventKey: 'onLoad',
                        id: 'fdbdfe6e-8cde-fb85-5433-4f34a97699d5',
                        pipe: []
                    }
                ],
                main: true,
                custom: {},
                displayState: {
                    hovered: false,
                    showHelper: {
                        horizontal: false,
                        vertical: false
                    },
                    activeZone: null,
                    errors: [],
                    draghover: false
                },
                securityGroups: [],
                icon: 'fa-solid fa-check'
            }
        ],
        theme: {
            themeKey: 'light',
            customColors: [
                {
                    key: 'BACKGROUND',
                    value: '#4e054e'
                },
                {
                    key: 'PRIMARY',
                    value: '#2d6bb6'
                },
                {
                    key: 'SECONDARY',
                    value: '#808b98'
                },
                {
                    key: 'TERTIARY',
                    value: '#d9e3f0'
                },
                {
                    key: 'SUCCESS',
                    value: '#d6a6e8'
                },
                {
                    key: 'WARNING',
                    value: '#e17a40'
                },
                {
                    key: 'DANGER',
                    value: '#ff7576'
                }
            ]
        },
        displayState: {
            errors: []
        }
    }
};