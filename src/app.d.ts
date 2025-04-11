import { EventContext } from '@cloudflare/workers-types';
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			context: EventContext;
		}
	}
}

export {};
