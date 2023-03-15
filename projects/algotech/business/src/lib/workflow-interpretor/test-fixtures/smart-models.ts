import { SmartModelDto } from '@algotech/core';

export const fixtSmartModels: SmartModelDto[] = [
    {
        key: 'EQUIPMENT',
        system: false,
        uniqueKeys: [],
        domainKey: 'GED',
        displayName: [
            {
                lang: 'fr',
                value: 'Equipement'
            },
            {
                lang: 'en',
                value: 'Equipment'
            },
            {
                lang: 'es',
                value: ''
            }
        ],
        properties: [
            {
                validations: [],
                uuid: 'bf32f32f-3f7e-ff21-05c5-9acbd1ebc658',
                key: 'NAME',
                displayName: [
                    {
                        lang: 'fr',
                        value: 'Nom'
                    },
                    {
                        lang: 'en',
                        value: 'Name'
                    },
                    {
                        lang: 'es',
                        value: ''
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                defaultValue: '',
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: []
                }
            },
            {
                validations: [],
                uuid: 'ef872be6-2221-3dec-b8e8-ec470b5296ef',
                key: 'DOCUMENTS',
                displayName: [
                    {
                        lang: 'fr',
                        value: 'Documents'
                    },
                    {
                        lang: 'en',
                        value: 'Documents'
                    },
                    {
                        lang: 'es',
                        value: ''
                    }
                ],
                keyType: 'so:DOCUMENT',
                multiple: true,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: []
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false
        },
        permissions: {
            R: [],
            RW: []
        },
        uuid: '92fa65aa-84a2-11f9-0281-884c31e2c90f',
    },
    {
        uuid: '4e4551fa-e964-4492-99ff-171cea42791c',
        key: 'DOCUMENT',
        domainKey: 'GED',
        system: false,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'en',
                value: 'Document'
            },
            {
                lang: 'fr',
                value: 'Document'
            }
        ],
        properties: [
            {
                uuid: 'a06834d3-501b-4a76-847a-ce9862b464a1',
                key: 'NAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Name'
                    },
                    {
                        lang: 'fr',
                        value: 'Nom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'b178aae6-12cf-4dec-bf7e-e74808b8cdc0',
                key: 'VERSION',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Version'
                    },
                    {
                        lang: 'fr',
                        value: 'Version'
                    }
                ],
                keyType: 'string',
                multiple: true,
                required: true,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'a06834d3-501b-4a76-847a-ce9862b46zzz',
                key: 'DATE',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Date'
                    },
                    {
                        lang: 'fr',
                        value: 'Date'
                    }
                ],
                keyType: 'date',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'a4310f4f-3485-43a8-8e6b-80450d1807fe',
                key: 'STATES',
                displayName: [
                    {
                        lang: 'en',
                        value: 'States'
                    },
                    {
                        lang: 'fr',
                        value: 'Etats'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: true,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'technician'
                    ]
                }
            },
            {
                uuid: '35516285-8710-4277-a471-87726d1ad45c',
                key: 'USER',
                displayName: [
                    {
                        lang: 'en',
                        value: 'User'
                    },
                    {
                        lang: 'fr',
                        value: 'Utilisateur'
                    }
                ],
                keyType: 'so:USER',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'technician'
                    ]
                }
            },
            {
                uuid: '64e1fcce-c25a-4669-a589-bec0daba5dc6',
                key: 'USERS',
                displayName: [
                    {
                        lang: 'en',
                        value: 'User'
                    },
                    {
                        lang: 'fr',
                        value: 'Utilisateur'
                    }
                ],
                keyType: 'so:USER',
                multiple: true,
                required: true,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'technician'
                    ]
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: true
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'technician'
            ]
        }
    },
    {
        uuid: '55c10b5a-8546-4a0b-b1dc-9d330034704d',
        key: 'CUSTOMER',
        domainKey: 'GED',
        system: true,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'en',
                value: 'Customer'
            },
            {
                lang: 'fr',
                value: 'Client'
            }
        ],
        properties: [
            {
                uuid: '2edae201-09fd-490a-917e-d7caf7a1273e',
                key: 'NAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Name'
                    },
                    {
                        lang: 'fr',
                        value: 'Nom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'a2309462-4df8-4988-b98b-d6643058a4cd',
                key: 'VERSION',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Version'
                    },
                    {
                        lang: 'fr',
                        value: 'Version'
                    }
                ],
                keyType: 'string',
                multiple: true,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'f204948f-7884-45b6-971e-b5bbbf4dcb54',
                key: 'STATES',
                displayName: [
                    {
                        lang: 'en',
                        value: 'States'
                    },
                    {
                        lang: 'fr',
                        value: 'Etats'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: true,
                permissions: {
                    R: [],
                    RW: [
                        'technician'
                    ]
                }
            },
            {
                uuid: '7c50dab0-a8e8-440c-9810-bc897051af4f',
                key: 'USER',
                displayName: [
                    {
                        lang: 'en',
                        value: 'User'
                    },
                    {
                        lang: 'fr',
                        value: 'Utilisateur'
                    }
                ],
                keyType: 'so:USER',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'technician'
                    ]
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'technician'
            ]
        }
    },
    {
        uuid: 'b2b79ac2-69da-4f68-ad5a-e2b6e2fa34e2',
        key: 'GROUP',
        domainKey: 'SYSTEM',
        system: true,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'en',
                value: 'Group'
            },
            {
                lang: 'fr',
                value: 'Groupe'
            }
        ],
        properties: [
            {
                uuid: 'abce20a0-691a-445c-a107-3bdc2dd0d840',
                key: 'GROUPKEY',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Group Key'
                    },
                    {
                        lang: 'fr',
                        value: 'Clé de groupe'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: true,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'ed07edbf-a554-43d6-b6b6-3a0cf0a92232',
                key: 'NAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Name'
                    },
                    {
                        lang: 'fr',
                        value: 'Nom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '0e58b59b-7e2c-439f-82be-d4a996d91cf7',
                key: 'DESCRIPTION',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Description'
                    },
                    {
                        lang: 'fr',
                        value: 'Description'
                    }
                ],
                keyType: 'string',
                multiple: true,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'technician'
            ]
        }
    },
    {
        uuid: '5300ae36-2757-445b-af08-fbac1e8634f7',
        key: 'USER',
        domainKey: 'SYSTEM',
        system: true,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'en',
                value: 'User'
            },
            {
                lang: 'fr',
                value: 'Utilisateur'
            }
        ],
        properties: [
            {
                uuid: '6c0f8540-b06d-4702-b25f-ca26e3434a94',
                key: 'EMAIL',
                displayName: [
                    {
                        lang: 'en',
                        value: 'E Mail'
                    },
                    {
                        lang: 'fr',
                        value: 'Courriel'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '7a8bfa77-0b43-494a-acc0-fc5574f71656',
                key: 'FIRSTNAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Firstname'
                    },
                    {
                        lang: 'fr',
                        value: 'Prénom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '176c3082-37cf-4d09-8eff-b24a37dd885b',
                key: 'LASTNAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Lastname'
                    },
                    {
                        lang: 'fr',
                        value: 'Nom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '8ec47523-6046-4dd4-8162-a70b37fd380e',
                key: 'LOGIN',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Login'
                    },
                    {
                        lang: 'fr',
                        value: 'Identifiant'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'c8845e15-cb96-4070-a2c0-cba53583b185',
                key: 'PASSWORD',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Password'
                    },
                    {
                        lang: 'fr',
                        value: 'Mot de Passe'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            }, {
                uuid: '1b9a3fb5-32ca-4e8c-a142-b5e99dae9999',
                key: 'CATEGORY',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Category'
                    },
                    {
                        lang: 'fr',
                        value: 'Categorie'
                    }
                ],
                keyType: 'string',
                composition: false,
                items: 'category',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            }, {
                uuid: '85f54121-f1b4-4eb1-801d-80aa852e8cb6',
                key: 'GROUPS',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Groups'
                    },
                    {
                        lang: 'fr',
                        value: 'Groupes'
                    }
                ],
                keyType: 'string',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'technician'
            ]
        }
    },
    {
        uuid: '55c10b5a-8546-4a0b-b1dc-9d330034704c',
        key: 'APPLICATION',
        domainKey: 'SYSTEM',
        system: true,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'en',
                value: 'Application'
            },
            {
                lang: 'fr',
                value: 'Application'
            }
        ],
        properties: [
            {
                uuid: '82cec52e-6b37-4dd0-aef7-b8b37d56c9a3',
                key: 'APP_KEY',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Application Key'
                    },
                    {
                        lang: 'fr',
                        value: 'Clé d\'application'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: true,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'ceec8aa6-2c26-4282-8ca0-8134811bbb08',
                key: 'NAME',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Name'
                    },
                    {
                        lang: 'fr',
                        value: 'Nom'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: 'bd1ed1b8-5913-4feb-a8c3-db20d47306df',
                key: 'LOGO_URL',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Logo URL'
                    },
                    {
                        lang: 'fr',
                        value: 'URL du logo'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '63b2a45f-fd32-4af6-bfc3-ad35fd05c170',
                key: 'APPLICATION_URL',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Application URL'
                    },
                    {
                        lang: 'fr',
                        value: 'URL de l\'application'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            },
            {
                uuid: '69fff247-83dc-4a6d-8626-18545d41f2a5',
                key: 'CATEGORY',
                displayName: [
                    {
                        lang: 'en',
                        value: 'Category'
                    },
                    {
                        lang: 'fr',
                        value: 'Catégorie'
                    }
                ],
                keyType: 'string',
                multiple: false,
                required: true,
                system: true,
                hidden: false,
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'technician'
                    ]
                }
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'technician'
            ]
        }
    }, {
        uuid: '6ab49d37-529e-0b21-c224-1039c9e494ed',
        key: 'alltypes',
        system: false,
        uniqueKeys: [],
        displayName: [
            {
                lang: 'fr-FR',
                value: 'alltypes'
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
        domainKey: 'undefined',
        properties: [
            {
                uuid: '2da46cfd-d988-5368-51d5-e45a07d01bea',
                key: 'STRING',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'string'
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
                keyType: 'string',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '406c6ba9-3a9c-710b-a748-a7c687f41705',
                key: 'GLIST',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'glist'
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
                keyType: 'string',
                multiple: false,
                items: 'categories',
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'd2a3c192-581a-653c-c227-4430a8826de2',
                key: 'BOOL',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'bool'
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
                keyType: 'boolean',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'a4f5a4c2-051f-53fb-9a19-de4f4e4f4783',
                key: 'NUMBER',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'number'
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
                keyType: 'number',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '006c109f-a803-cd1a-e176-a413df8a5983',
                key: 'DATE',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'date'
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
                keyType: 'date',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '075f7f6b-e811-f882-f3b0-78b43640f1c0',
                key: 'DATETIME',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'datetime'
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
                keyType: 'datetime',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'd35e65f2-159f-6bc7-a8ef-126c78fec7d0',
                key: 'TIME',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'time'
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
                keyType: 'time',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '91521b87-6fde-7596-8689-2368281c3ab8',
                key: 'HTML',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'html'
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
                keyType: 'html',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'bad8758b-a0e3-c083-f469-abeee7a5cf36',
                key: 'COMMENT',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'comment'
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
                keyType: 'sys:comment',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '8073fff3-7ad4-12e1-c72e-5e843745e172',
                key: 'SO',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'so'
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
                keyType: 'so:utilisateur',
                multiple: false,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '843a5f5b-44fa-c4bd-2b15-3e7c35c985b8',
                key: 'STRING_M',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'string_m'
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
                keyType: 'string',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '89256e4d-2012-1fce-f06b-b517ba0ab1f4',
                key: 'so_m',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'so_m'
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
                keyType: 'so:utilisateur',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: '8961b025-048d-5753-4b6a-768001c78708',
                key: 'NUMBER_M',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'number_m'
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
                keyType: 'number',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'e08d8d70-48cf-96b6-af32-0eb29aac4ae4',
                key: 'BOOL_M',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'bool_m'
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
                keyType: 'boolean',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'a2c5f9ec-e96d-e180-7e72-3ca1a786b63f',
                key: 'GLIST_M',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'glist_m'
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
                keyType: 'string',
                multiple: true,
                items: 'categories',
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            },
            {
                uuid: 'e234e8eb-c086-a583-e52e-fdff0e0eb040',
                key: 'DATETIME_M',
                displayName: [
                    {
                        lang: 'fr-FR',
                        value: 'datetime_m'
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
                keyType: 'datetime',
                multiple: true,
                required: false,
                system: false,
                hidden: false,
                validations: [],
                permissions: {
                    R: [],
                    RW: [
                        'admin',
                        'doc',
                        'plan-editor',
                        'process-manager',
                        'sadmin',
                        'viewer'
                    ]
                },
                description: ''
            }
        ],
        skills: {
            atGeolocation: false,
            atDocument: false,
            atSignature: false,
            atTag: false,
            atMagnet: false
        },
        permissions: {
            R: [],
            RW: [
                'admin',
                'doc',
                'plan-editor',
                'process-manager',
                'sadmin',
                'viewer'
            ]
        },
        description: ''
    }
];
