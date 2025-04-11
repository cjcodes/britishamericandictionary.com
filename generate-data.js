import Airtable from 'airtable';
import fs from 'node:fs';
import 'dotenv/config';
const env = process.env;

const base = new Airtable({ apiKey: env.AIRTABLE_READ_TOKEN }).base(env.AIRTABLE_BASE_ID);

async function getFromAirtable() {
	const data = {};

	const response = await base(env.AIRTABLE_TABLE_ID)
		.select({
			maxRecords: 1000,
			pageSize: 100,
			filterByFormula: '{Approved} = 1',
			fields: ['British', 'American', 'Category']
		})
		.eachPage((records, fetchNext) => {
			records.forEach((record) => {
				const categoryArray = record.get('Category') || [env.GENERAL_CATEGORY] || ['General'];
				categoryArray.forEach((category) => {
					if (!data[category]) {
						data[category] = [];
					}
					data[category].push([
						record.get('British').toString(),
						record.get('American').toString()
					]);
				});
			});
			fetchNext();
		})
		.then(() => {
			return data;
		});

	return response;
}

(async () => {
	const data = await getFromAirtable();
	fs.writeFileSync('src/lib/data.json', JSON.stringify(data));
})();
