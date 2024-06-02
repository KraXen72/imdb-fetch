export interface IMDBAPIResponse {
	d: IMDBWork[];
	q: string;
	v: number;
}

export interface IMDBWork {
	/** images */
	i?:   [string, number, number];
	/** imdb id */
	id:   string;
	/** Title */
	l:    string;
	/** type? */
	qid?: string;
	/** type (more specific) - use qid */
	q?:   string;
	/** few main actors, comma separated */
	s:    string;
	/** year of release */
	y?:   number;
}

export type IMDBImg = IMDBWork['i']


