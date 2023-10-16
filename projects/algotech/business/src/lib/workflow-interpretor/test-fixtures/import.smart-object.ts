import { SmartObjectDto } from "@algotech-ce/core";
import moment from "moment";

export const fixtImportSmartObjects:  SmartObjectDto[] = [
	{
		modelKey: "alltypes",
		properties: [
			{
				key: "STRING",
				value: "1,c\"',;:\"a ;:!"
			},
			{
				key: "GLIST",
				value: null
			},
			{
				key: "BOOL",
				value: true
			},
			{
				key: "NUMBER",
				value: 55.44
			},
			{
				key: "DATE",
				value: moment("1980-05-30").utc(true).startOf('day').format()
			},
			{
				key: "DATETIME",
				value: moment("1990-05-12").startOf('day').format()
			},
			{
				key: "TIME",
				value: "15:35:00"
			},
			{
				key: "HTML",
				value: null
			},
			{
				key: "COMMENT",
				value: null
			},
			{
				key: "SO",
				value: null
			},
			{
				key: "STRING_M",
				value: [
					"test"
				]
			},
			{
				key: "so_m",
				value: []
			},
			{
				key: "NUMBER_M",
				value: []
			},
			{
				key: "BOOL_M",
				value: []
			},
			{
				key: "GLIST_M",
				value: []
			},
			{
				key: "DATETIME_M",
				value: []
			}
		],
		skills: {
			atDocument: {
				documents: []
			},
			atGeolocation: {
				geo: []
			},
			atTag: {
				tags: []
			},
			atSignature: null,
			atMagnet: {
				zones: []
			}
		}
	},
	{
		modelKey: "alltypes",
		properties: [
			{
				key: "STRING",
				value: "2,c"
			},
			{
				key: "GLIST",
				value: null
			},
			{
				key: "BOOL",
				value: false
			},
			{
				key: "NUMBER",
				value: 55.44
			},
			{
				key: "DATE",
				value: moment("1980-05-01").utc(true).startOf('day').format()
			},
			{
				key: "DATETIME",
				value: moment("1990-05-12").startOf('day').format()
			},
			{
				key: "TIME",
				value: "16:25:00"
			},
			{
				key: "HTML",
				value: null
			},
			{
				key: "COMMENT",
				value: null
			},
			{
				key: "SO",
				value: null
			},
			{
				key: "STRING_M",
				value: [
					"test",
					"test"
				]
			},
			{
				key: "so_m",
				value: []
			},
			{
				key: "NUMBER_M",
				value: []
			},
			{
				key: "BOOL_M",
				value: []
			},
			{
				key: "GLIST_M",
				value: []
			},
			{
				key: "DATETIME_M",
				value: []
			}
		],
		skills: {
			atDocument: {
				documents: []
			},
			atGeolocation: {
				geo: []
			},
			atTag: {
				tags: []
			},
			atSignature: null,
			atMagnet: {
				zones: []
			}
		}
	},
	{
		modelKey: "alltypes",
		properties: [
			{
				key: "STRING",
				value: ""
			},
			{
				key: "GLIST",
				value: null
			},
			{
				key: "BOOL",
				value: true
			},
			{
				key: "NUMBER",
				value: 22
			},
			{
				key: "DATE",
				value: null
			},
			{
				key: "DATETIME",
				value: moment("1990-05-12").startOf('day').format()
			},
			{
				key: "TIME",
				value: null
			},
			{
				key: "HTML",
				value: null
			},
			{
				key: "COMMENT",
				value: null
			},
			{
				key: "SO",
				value: null
			},
			{
				key: "STRING_M",
				value: []
			},
			{
				key: "so_m",
				value: []
			},
			{
				key: "NUMBER_M",
				value: []
			},
			{
				key: "BOOL_M",
				value: []
			},
			{
				key: "GLIST_M",
				value: []
			},
			{
				key: "DATETIME_M",
				value: []
			}
		],
		skills: {
			atDocument: {
				documents: []
			},
			atGeolocation: {
				geo: []
			},
			atTag: {
				tags: []
			},
			atSignature: null,
			atMagnet: {
				zones: []
			}
		}
	}
];