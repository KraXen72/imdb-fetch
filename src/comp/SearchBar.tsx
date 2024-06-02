import { debounce } from "@solid-primitives/scheduled";
import { createSignal } from "solid-js";
import { search, DEBOUNCE_MS } from '../lib/search';

const [query, setQuery] = createSignal('')
const handleSearch = debounce(() => search(query()), DEBOUNCE_MS)
export { query }

export default function SearchBar() {
	return <div id="inpholder">
		<label class="matter-textfield-outlined">
			<input
				placeholder=" "
				type="search"
				name="search"
				id="search"
				autocomplete="off"					
				onInput={(e: InputEvent) => {
					const target = (e.currentTarget || e.target) as HTMLInputElement
					setQuery(target.value)
					handleSearch()
				}}
			></input>
			<span class="noselect">Search for movie/show by title or imdb id</span>
		</label>
	</div>
}