import type { Actions, PageServerLoad } from './$types';
import crypto from 'node:crypto';
import { addRecord, getRecords } from '$lib';
import { env } from '$env/dynamic/private';

export type DataType = {
	[category: string]: [British: string, American: string][];
};

export const load: PageServerLoad = ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'max-age=' + env.CACHE_DURATION_IN_SEC
	});

	return getRecords();
};

export const actions = {
	default: async ({ request, platform }) => {
		const data = await request.formData();
		const browser = request.headers.get('user-agent') || '';
		const toHash = browser + data.get('british') + data.get('american');

		const hash = crypto.createHash('sha1').update(toHash).digest('hex');

		if (hash === data.get('key')) {
			const add = addRecord({
				British: data.get('british')?.toString() || '',
				American: data.get('american')?.toString() || ''
			});
			if (platform?.context) {
				platform.context.waitUntil(add);
			}
		}

		return { success: true };
	}
} satisfies Actions;
