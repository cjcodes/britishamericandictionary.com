// place files you want to import through the `$lib` alias in this folder.

import { env } from '$env/dynamic/private';
import Airtable from 'airtable';
import type { DataType } from '../routes/+page.server';

const base = new Airtable({ apiKey: env.AIRTABLE_READ_TOKEN }).base(env.AIRTABLE_BASE_ID);
let cache: { fetched: number; data: DataType } | undefined;

export async function getRecords() {
	if (!cache || Date.now() - cache.fetched > parseInt(env.CACHE_DURATION_IN_SEC)) {
		cache = {
			data: await getFromAirtable(),
			fetched: Date.now()
		};
	}

	return cache.data;
}

async function getFromAirtable() {
	const data: DataType = {};

	const response: DataType = await base(env.AIRTABLE_TABLE_ID)
		.select({
			maxRecords: 1000,
			pageSize: 100,
			filterByFormula: '{Approved} = 1',
			fields: ['British', 'American', 'Category']
		})
		.eachPage((records, fetchNext) => {
			records.forEach((record) => {
				const category =
					record.get<string>('Category')?.toString() || env.GENERAL_CATEGORY || 'General';

				if (!data[category]) {
					data[category] = [];
				}

				data[category].push([
					record.get<string>('British')?.toString(),
					record.get<string>('American')?.toString()
				]);
			});

			fetchNext();
		})
		.then(() => {
			return data;
		});

	return response;
}

export async function addRecord(record: { British: string; American: string }) {
	base(env.AIRTABLE_TABLE_ID).create([
		{
			fields: {
				...record
			}
		}
	]);
}
