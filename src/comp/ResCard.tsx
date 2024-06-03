import type { DetailsTuple, IMDBWork } from "../lib/types";
import { getImgOfQuality, containCover } from "../lib/img";
import { createSignal } from "solid-js";
import { copyToClipboard, fancyLinkOpen } from "../lib/util";
import { processTMDB } from "../lib/tmdb";
import { renderDetails } from "./Details";
import placeholder from '../assets/placeholder.jpg'

// TODO reimpl placeholder.png

export default function ResCard(props: IMDBWork) {
	const [tmdbButtonDisabled, setTmdbButtonDisabled] = createSignal(false)
	const [tmbdDetails, setDetails] = createSignal<DetailsTuple>(['404', 'other'])

	const [ulqSrc, s_ulqSrc] = createSignal(getImgOfQuality(props.i, "ulq"))
	const [lqSrc, s_lqSrc] = createSignal(getImgOfQuality(props.i, "lq"))
	const [hqSrc, s_hqSrc] = createSignal(getImgOfQuality(props.i, "hq"))
	
	const [show_ulq, s_ulq] = createSignal(true)
	const [show_lq, s_lq] = createSignal(false)
	const [show_hq, s_hq] = createSignal(false)
	
	let hqLoaded = false
	const subtitle = typeof props.q === 'undefined'
		? 'unknown'
		: props.q === "feature"
		? 'movie'
		: props.q.toLowerCase()
	
	//tmdb onclicks get applied after append
	processTMDB(props).then(([data, restype]) => {
		// console.log(data)
		if (data === "404") {
			setTmdbButtonDisabled(true);
		} else {
			setDetails([data, restype])
		}
	})

	return (
		<div class="result-card">
			<div class="poster" imdb-id={props.id}>
				<img src={ulqSrc()}
					class={`poster-img ulq ${containCover(props.i)}`}
					hidden={!show_ulq()}
					draggable="false"
					onError={() => s_ulqSrc(placeholder)}
				></img>
				<img src={lqSrc()}
					class={`poster-img lq ${containCover(props.i)}`}
					hidden={!show_lq()}
					onLoad={() => {
						if (hqLoaded) return;
						s_lq(true)
						s_ulq(false)
					}}
					onError={() => s_lqSrc(placeholder)}
					draggable="false"
				></img>
				<img src={hqSrc()}
					class={`poster-img hq ${containCover(props.i)}`}
					hidden={!show_hq()}
					onLoad={() => {
						hqLoaded = true;
						s_hq(true)
						s_lq(false)
						s_ulq(false)
					}}
					onError={() => s_hqSrc(placeholder)}
					draggable="false"
				></img>
				<div class="card-hover">
					<button class="matter-button-outlined vimdb" onClick={() => fancyLinkOpen(`https://imdb.com/title/${props.id}/`)}>imdb</button>
					<button class="matter-button-outlined cimdb" onClick={() => copyToClipboard(props.id)}>copy ID</button>
					<button 
						class="matter-button-outlined vtmdb" 
						onClick={() => {
							const [det, restype] = tmbdDetails()
							if (det === '404') return;
							fancyLinkOpen(`https://www.themoviedb.org/${restype}/${det.id}`)
						}}
						disabled={tmdbButtonDisabled()}>tmdb</button>
					<button 
						class="matter-button-outlined ctmdb" 
						onClick={() => {
							const det = tmbdDetails()[0];
							if (det === '404') return;
							copyToClipboard(det.id.toString())
						}}
						disabled={tmdbButtonDisabled()}>copy ID</button>
					<hr class="hr-text csep"></hr>
					<button 
						class="matter-button-outlined details" 
						onClick={() => renderDetails({ 
							data: tmbdDetails()[0], 
							restype: tmbdDetails()[1], 
							imdbID: props.id })
						}
						disabled={tmdbButtonDisabled()}
					>details</button>
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