import { For, mergeProps } from 'solid-js';
import chillindude from '../assets/dude_chillin.svg'
import nothingfound from '../assets/nothing_found.svg'

import ResCard from './ResCard';
import type { IMDBWork } from '../lib/types';

export default function Results(props: { results: IMDBWork[], query: string }) {
	const props2 = mergeProps({ results: [], query: '' }, props)
	const results = () => props2.results.filter(result => {
		return result.id.slice(0, 2) !== "nm"
			&& !result.id.includes('/')
			&& !('qid' in result && result.qid === "musicvideo")
	})

  return (
    <div id="results">
			<For each={results()} fallback={props.query === '' ? <Fallback /> : <NothingFound />}>
				{crd => <ResCard {...crd} />}
			</For>
    </div>
  );
}

const Fallback = () => (
	<div id="nothing">
		<img src={chillindude} alt="chilling dude" draggable="false"></img>
		<div>IMDb movie search</div>
	</div>
)

const NothingFound = () => (
	<div id="nothing">
		<img src={nothingfound} alt="nothing found" draggable="false"></img>
		<div>Nothing found</div>
	</div>
)