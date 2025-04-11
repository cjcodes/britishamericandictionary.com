import { env } from '$env/dynamic/private';
import Airtable from 'airtable';
import type { DataType } from '../routes/+page.server';
import data from './data.json';

const base = new Airtable({ apiKey: env.AIRTABLE_READ_TOKEN }).base(env.AIRTABLE_BASE_ID);

export function getRecords(): DataType {
	return data as unknown as DataType;
}

export async function addRecord(record: { British: string; American: string }) {
	return base(env.AIRTABLE_TABLE_ID).create([
		{
			fields: {
				...record
			}
		}
	]);
}
