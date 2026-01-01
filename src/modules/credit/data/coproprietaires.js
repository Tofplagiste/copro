/**
 * Données des copropriétaires pour le module Crédit
 * Constantes statiques extraites de CreditApp.jsx
 */

/**
 * Liste des copropriétaires avec leurs caractéristiques
 * @type {Array<{
 *   id: number,
 *   nom: string,
 *   commune: string,
 *   lot: string,
 *   tantiemes: number,
 *   aCellier: boolean,
 *   aBalcon: boolean,
 *   grandBalcon: boolean,
 *   cellier?: number,
 *   tantCellier: number
 * }>}
 */
export const COPROPRIETAIRES = [
    { id: 1, nom: 'SALAHUN Yves', commune: 'ST EMILION', lot: 'Apt 16', tantiemes: 37, aCellier: false, aBalcon: true, grandBalcon: true, tantCellier: 0 },
    { id: 2, nom: 'PALMARO', commune: 'MARGAUX', lot: 'Apt 15', tantiemes: 38, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 6, tantCellier: 3 },
    { id: 3, nom: 'DESSALES / GABRIEL Thomas', commune: 'ST CROIX DU MONT', lot: 'Apt 14', tantiemes: 59, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 5, tantCellier: 3 },
    { id: 4, nom: 'TROPAMER Véronique', commune: 'ENTRE 2 MERS', lot: 'LC Apt 2', tantiemes: 66, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 },
    { id: 5, nom: 'PIRAS Eric', commune: 'PAUILLAC', lot: 'Apt 20', tantiemes: 66, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 4, tantCellier: 3 },
    { id: 6, nom: 'SCI du Clot', commune: 'LISTRAC', lot: 'Apt 17', tantiemes: 84, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 7, tantCellier: 2 },
    { id: 7, nom: 'LE MERLE Christophe', commune: 'MOULIS', lot: 'Apt 18', tantiemes: 93, aCellier: true, aBalcon: true, grandBalcon: true, cellier: 3, tantCellier: 3 },
    { id: 8, nom: 'BELLIARD Véronique', commune: 'ST ESTEPHE', lot: 'Apt 12/13', tantiemes: 102, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 },
    { id: 9, nom: 'CARSOULE', commune: 'SAUTERNE', lot: 'Apt 1 & 21', tantiemes: 113, aCellier: true, aBalcon: false, grandBalcon: false, cellier: 9, tantCellier: 4 },
    { id: 10, nom: 'IDEALAMBARD SAS', commune: 'POMEROL', lot: 'Apt 19', tantiemes: 121, aCellier: true, aBalcon: true, grandBalcon: false, cellier: 8, tantCellier: 4 },
    { id: 11, nom: 'CAUPENE Corinne', commune: 'LIBRAIRIE', lot: 'LC 10/11', tantiemes: 199, aCellier: false, aBalcon: false, grandBalcon: false, tantCellier: 0 }
];

/** Total des tantièmes de la copropriété */
export const TOTAL_TANTIEMES = 1000;

/** Total des tantièmes des celliers */
export const TOTAL_TANTIEMES_CELLIERS = 22;
