<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { DataType } from './+page.server.js';

	const flags = ['/uk.svg', '/usa.svg'];

	let { data, form } = $props();
	let search: HTMLInputElement;
	let submitFocus: HTMLInputElement | undefined = $state();

	let order = $state([0, 1]);
	let searchValue: string = $state('');
	let nonce = $state(0);

	let british = $state('');
	let american = $state('');
	let hash = $state('');

	const i = setInterval(() => {
		nonce += 273;
		if (nonce > 273 * 30) clearInterval(i);
	}, 1000);

	let sorted = $derived(
		(() => {
			const toSort: DataType = { General: data['general'], ...data };

			Object.entries(toSort).forEach(([key, e]) => {
				toSort[key] = e
					.filter(
						(e) =>
							e[0]?.toLowerCase().includes(searchValue.toLowerCase()) ||
							e[1]?.toLowerCase().includes(searchValue.toLowerCase())
					)
					.sort((a, b) => {
						const left = a[order[0]] || '';
						const right = b[order[0]] || '';

						if (left === right) {
							return 0;
						}

						return left < right ? -1 : 1;
					});
				if (toSort[key].length == 0) {
					delete toSort[key];
				}
			});

			return toSort;
		})()
	);

	function reverse() {
		order[0] = +!order[0];
		order[1] = +!order[1];
	}

	function focusSubmit() {
		submitFocus?.focus();
	}

	async function submit(e: SubmitEvent) {
		if (hash == '') {
			e.preventDefault();

			const toHash = navigator.userAgent + british + american;
			const encoder = new TextEncoder();
			const data = encoder.encode(toHash);
			const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			hash = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');

			await tick(); // Wait for the hidden field to update
			(e.target as HTMLFormElement).submit();
		} else {
		}
	}

	onMount(() => {
		if (window.location.hostname !== 'localhost') {
			search.focus();
		}
	});
</script>

{#if form?.success}
	<div class="toast toast-top toast-center z-100 mx-0">
		<div class="alert alert-success">
			Thank you for your suggestion. It will reviewed in good time.
		</div>
	</div>
{/if}
<div
	class="relative mx-auto {form?.success
		? 'my-24'
		: 'my-8'} flex flex-col items-center justify-center space-y-8 text-center md:w-xl"
>
	<!-- <button
		class="btn btn-lg btn-primary absolute -top-12 -right-8 z-10 h-12 w-12 rounded-full"
		onclick={focusSubmit}>+</button
	> -->
	<div class="w-full px-4 md:px-0">
		<label class="input w-full">
			<input
				type="search"
				required
				placeholder="&#128270; Search"
				bind:this={search}
				bind:value={searchValue}
				class="text-center"
			/>
		</label>
		[ <a href="#submit" onclick={focusSubmit} class="link link-primary">Add new</a> ]
	</div>

	<div class="relative w-full overflow-x-auto">
		<button class="btn absolute top-1 left-1/2 z-10 !-translate-x-1/2" onclick={reverse}
			>&lrarr;</button
		>

		<table class="table-pin-rows table w-full">
			<thead>
				<tr class="h-12">
					<th
						style="--image-url: url({flags[order[0]]})"
						class="bg-base-300 w-1/2 bg-[image:var(--image-url)] bg-cover bg-top"
					></th>
					<th
						style="--image-url: url({flags[order[1]]})"
						class="bg-base-300 w-1/2 bg-[image:var(--image-url)] bg-cover bg-top"
					></th>
				</tr>
			</thead>
			{#each Object.entries(sorted) as [category, categoryEntries]}
				<thead>
					<tr>
						<th colspan="2" class="bg-base-200 py-1">{category}</th>
					</tr>
				</thead>
				<tbody>
					{#each categoryEntries as entry}
						<tr class="hover:bg-sky-100 hover:text-black">
							<td>{entry[order[0]]}</td>
							<td>{entry[order[1]]}</td>
						</tr>
					{/each}
				</tbody>
			{/each}
		</table>

		<form onsubmit={submit} method="POST">
			<input type="hidden" name="key" bind:value={hash} />
			<input type="hidden" name="nonce" bind:value={nonce} />
			<table class="mt-8 table w-full">
				<thead>
					<tr>
						<th colspan="2" class="bg-base-200 mt-24 py-4">Submit a new word</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						{#if order[0] == 0}
							<td>
								<input
									type="text"
									class="input"
									name="british"
									bind:value={british}
									bind:this={submitFocus}
									placeholder="British word"
								/>
							</td>
							<td>
								<input
									type="text"
									class="input"
									name="american"
									bind:value={american}
									placeholder="American word"
								/>
							</td>
						{:else}
							<td>
								<input
									type="text"
									class="input"
									name="american"
									bind:value={american}
									bind:this={submitFocus}
									placeholder="American word"
								/>
							</td>
							<td>
								<input
									type="text"
									class="input"
									name="british"
									bind:value={british}
									placeholder="British word"
								/>
							</td>
						{/if}
					</tr>
					<tr>
						<td colspan="2">
							<input type="submit" class="btn btn-primary w-full" />
						</td>
					</tr>
				</tbody>
			</table>
		</form>
	</div>
</div>
