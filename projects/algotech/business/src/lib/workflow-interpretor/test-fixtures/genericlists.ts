import { GenericListDto } from '@algotech/core';

export const fixtGlists: GenericListDto[] = [
    {
        uuid: '71c81d8e-f4cb-41b3-943e-023780c8e972',
        key: 'category',
        displayName: [
            {
                lang: 'fr-FR',
                value: 'Categorie'
            },
            {
                lang: 'en-US',
                value: 'Category'
            }
        ],
        protected: false,
        values: [
            {
                key: 'viewer',
                value: [
                    {
                        lang: 'fr-FR',
                        value: 'Lecteur'
                    },
                    {
                        lang: 'en-US',
                        value: 'Viewer'
                    }
                ],
                index: 0,
            },
            {
                key: 'writer',
                value: [
                    {
                        lang: 'fr-FR',
                        value: 'Rédacteur'
                    },
                    {
                        lang: 'en-US',
                        value: 'Writer'
                    }
                ],
                index: 1,
            }
        ]
    }
];
