export default function Details() {
	return (
		<div id="details-screen" hidden>
			<div id="details-header">
				<div id="details-backdrop-fade"></div>
				<div id="details-backdrop-fade-rest"></div>
				<div id="details-header-content">
					<div id="details-x-button"><span class="material-icons">close</span></div>
					<div id="details-poster-wrapper">
						<img id="details-poster" draggable="false" src="placeholder.jpg"></img>
					</div>
					<h5 id="details-title" class="matter-h4 details-right">Steins;Gate<span id="details-year">(2011)</span> </h5>
					<div id="details-genres" class="details-right">
						<span class="details-genre">Comedy</span>
						<span class="details-genre">Action</span>
						<span class="details-genre">Adventure</span>
						<span class="details-genre" title="Science Fiction, Fantasy">&bull;&bull;&bull;</span>
					</div>
					<div id="details-type-length" class="matter-subtitle1 details-right">-</div>
					<div id="details-rating-wrapper" class="details-right">
						<div class="circular-progress" id="score-hold">
							<span id="score-text">
								<span id="score">100</span>
								<span id="score-percent">%</span>
							</span>
							<svg id="score-svg" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' aria-labelledby='title'>
								<title id='title'>svg circular progress bar</title>
								<circle cx="50" cy="50" r="40"></circle>
								<circle cx="50" cy="50" r="40" id='svg-progress-indicator'></circle>
							</svg>
						</div>
						<button class="matter-button-outlined" title="plugged-in reviews" id="pluggedin"><img id="pluggedinicon" src="pluggedinicon.svg" alt=""></img></button>
						<button id="trailerbtn" class="matter-button-outlined ctmdb">Trailer</button>
					</div>
					<div id="details-external-ratings">
						<div id="imdb-rating">-</div>
						<div id="rotten-rating">-</div>
						<div id="metacritic-rating">-</div>
						<span id="imdb-l">IMDb</span>
						<span id="rotten-l">Rotten</span>
						<span id="metacritic-l" title="Metacritic/Metascore">Meta</span>
					</div>
					<p id="details-overview" class="matter-subtitle1 details-right">A bank teller called Guy realizes he is a background character in an open world video game called Free City that
						will soon go offline.</p>
				</div>
			</div>
		</div>
	)
}