import type { IMDBWork } from "../lib/types";
import { getImgOfQuality, containCover } from "../lib/img";
import { createSignal } from "solid-js";
import { copyToClipboard, fancyLinkOpen } from "../lib/util";

// TODO reimpl placeholder.png

export default function ResCard(props: IMDBWork) {
	const [show_ulq, s_ulq] = createSignal(true)
	const [show_lq, s_lq] = createSignal(false)
	const [show_hq, s_hq] = createSignal(false)
	
	let hqLoaded = false
	const subtitle = typeof props.q === 'undefined'
		? 'unknown'
		: props.q === "feature"
		? 'movie'
		: props.q.toLowerCase()

	// 	processTMDB(result, rCard) //tmdb onclicks get applied after append
	return (
		<div class="result-card">
			<div class="poster" imdb-id={props.id}>
				<img src={getImgOfQuality(props.i, "ulq")}
					class={`poster-img ulq ${containCover(props.i)}`}
					hidden={!show_ulq()}
					draggable="false"
				></img>
				<img src={getImgOfQuality(props.i, "lq")}
					class={`poster-img lq ${containCover(props.i)}`}
					hidden={!show_lq()}
					onLoad={() => {
						if (hqLoaded) return;
						s_lq(true)
						s_ulq(false)
					}}
					draggable="false"
				></img>
				<img src={getImgOfQuality(props.i, "hq")}
					class={`poster-img hq ${containCover(props.i)}`}
					hidden={!show_hq()}
					onLoad={() => {
						hqLoaded = true;
						s_hq(true)
						s_lq(false)
						s_ulq(false)
					}}
					draggable="false"
				></img>
				<div class="card-hover">
					<button class="matter-button-outlined vimdb" onClick={() => fancyLinkOpen(`https://imdb.com/title/${props.id}/`)}>imdb</button>
					<button class="matter-button-outlined cimdb" onClick={() => copyToClipboard(props.id)}>copy ID</button>
					<button class="matter-button-outlined vtmdb">tmdb</button>
					<button class="matter-button-outlined ctmdb">copy ID</button>
					<hr class="hr-text csep"></hr>
					<button class="matter-button-outlined details">details</button>
					<div class="type matter-subtitle1">{subtitle}</div>
				</div>
			</div>
			<strong class="title" title={props.l}>{props.l}</strong>
			<div class="year-and-id">
				<span class="year" id={`year-${props.id}`}>{props.y ?? "N/A"}</span>
				<span class="noselect"> &bull; </span>
				<span class="imdbID" id={`imdbid-${props.id}`}>{props.id}</span>
			</div>
		</div>
	)
}