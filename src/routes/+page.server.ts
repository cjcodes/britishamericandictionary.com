import type { Actions, PageServerLoad } from './[base]/$types';
import crypto from 'node:crypto';
import { addRecord, getRecords } from '$lib';

export type DataType = {
	[category: string]: [British?: string, American?: string][];
};

export const load: PageServerLoad = async () => {
	return await getRecords();
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const browser = request.headers.get('user-agent') || '';
		const toHash = browser + data.get('british') + data.get('american');

		const hash = crypto.createHash('sha1').update(toHash).digest('hex');

		if (hash === data.get('key')) {
			addRecord({
				British: data.get('british')?.toString() || '',
				American: data.get('american')?.toString() || ''
			});
		}

		return { success: true };
	}
} satisfies Actions;
